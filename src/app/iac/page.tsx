"use client";

import { FormEvent, useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import CloudSelector from "@/components/iac/CloudSelector";
import MicroserviceList from "@/components/iac/MicroserviceList";
import GenerateButton from "@/components/iac/GenerateButton";
import AIGenerateButton from "@/components/iac/AIGenerateButton";
import FileExplorer from "@/components/common/FileExplorer";
import CodeViewer from "@/components/common/CodeViewer";
import { MicroserviceState, defaultMicroservice } from "@/lib/microserviceTypes";
import { cloudRegions } from "@/lib/constants";
import { saveGenerationToCache, getGenerationFromCache } from "@/lib/storage";

export default function IACPage() {
  const [cloud, setCloud] = useState<"aws" | "azure">("aws");
  const [region, setRegion] = useState(cloudRegions.aws[0]);
  const [preferPreset, setPreferPreset] = useState(true);
  const [microservices, setMicroservices] = useState<MicroserviceState[]>([
    { ...defaultMicroservice },
  ]);
  const [expandedService, setExpandedService] = useState<number | null>(0);
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<{ issues: string[]; suggestedFixes: string[] } | null>(null);
  const [generationResult, setGenerationResult] = useState<{
    terraform?: { files: Record<string, string> };
    helmCharts?: Array<{ name: string; files: Record<string, string> }>;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  // Load from cache on mount
  useEffect(() => {
    const cached = getGenerationFromCache();
    if (cached) {
      const allFiles: Record<string, string> = {};
      if (cached.terraform?.files) {
        Object.entries(cached.terraform.files).forEach(([path, content]) => {
          allFiles[`terraform/${path}`] = content;
        });
      }
      if (cached.helmCharts) {
        cached.helmCharts.forEach((chart) => {
          Object.entries(chart.files).forEach(([path, content]) => {
            allFiles[`helm-charts/${chart.name}/${path}`] = content;
          });
        });
      }
      setGenerationResult({
        terraform: cached.terraform,
        helmCharts: cached.helmCharts,
      });
      if (cached.helmCharts && cached.helmCharts.length > 0) {
        setSelectedChart(cached.helmCharts[0].name);
      }
    }
  }, []);

  const handleMicroserviceChange = (
    index: number,
    changes: Partial<MicroserviceState>
  ) => {
    setMicroservices((prev) =>
      prev.map((svc, idx) => (idx === index ? { ...svc, ...changes } : svc))
    );
  };

  const handleMicroserviceRemove = (index: number) => {
    setMicroservices((prev) => prev.filter((_, idx) => idx !== index));
    setExpandedService((prev) => (prev === index ? null : prev));
  };

  const handleNestedChange = (
    index: number,
    path: "ingress" | "hpa" | "resources" | "configMap" | "secret",
    changes: Record<string, unknown>
  ) => {
    setMicroservices((prev) =>
      prev.map((svc, idx) => {
        if (idx !== index) return svc;
        return {
          ...svc,
          [path]: { ...svc[path], ...changes },
        };
      })
    );
  };

  const buildTerraformPayload = () => ({
    cloud,
    region,
    preferPreset,
    customPrompt: customPrompt || undefined,
    microservices: microservices.map((svc) => ({
      name: svc.name,
      runtime: svc.runtime,
      services: svc.services.split(",").map((item) => item.trim()).filter(Boolean),
      needsHelmChart: svc.needsHelmChart,
      helmChartName: svc.helmChartName,
      imageRepository: svc.imageRepository || undefined,
      imageTag: svc.imageTag || undefined,
      pullSecretName: svc.pullSecretName || undefined,
      ingress: svc.ingress.enabled
        ? {
            enabled: true,
            hostname: svc.ingress.hostname,
            path: svc.ingress.path,
            tlsEnabled: svc.ingress.tlsEnabled,
            tlsSecretName: svc.ingress.tlsSecretName || undefined,
          }
        : undefined,
      hpa: svc.hpa.enabled
        ? {
            enabled: true,
            minReplicas: svc.hpa.minReplicas,
            maxReplicas: svc.hpa.maxReplicas,
            targetCPU: svc.hpa.targetCPU,
            targetMemory: svc.hpa.targetMemory,
          }
        : undefined,
      resources: svc.resources,
      configMap: svc.configMap.data
        ? {
            name: svc.configMap.name,
            data: svc.configMap.data
              .split("\n")
              .filter(Boolean)
              .reduce<Record<string, string>>((acc, line) => {
                const [key, value] = line.split("=");
                if (key && value) acc[key.trim()] = value.trim();
                return acc;
              }, {}),
          }
        : undefined,
      secret: svc.secret.raw
        ? {
            name: svc.secret.name,
            values: svc.secret.raw
              .split("\n")
              .filter(Boolean)
              .reduce<Record<string, string>>((acc, line) => {
                const [key, value] = line.split("=");
                if (key && value) acc[key.trim()] = value.trim();
                return acc;
              }, {}),
          }
        : undefined,
    })),
    connectors: [],
  });

  const handleGenerateIac = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setValidation(null);
    try {
      const body = buildTerraformPayload();
      const response = await fetch("/api/iac", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Request failed");
      const json = await response.json();

      if (json.validation?.issues?.length > 0) {
        setValidation(json.validation);
      }

      // Combine all files for file explorer
      const allFiles: Record<string, string> = {};
      if (json.result?.terraform?.files) {
        Object.entries(json.result.terraform.files).forEach(([path, content]) => {
          allFiles[`terraform/${path}`] = content as string;
        });
      }
      if (json.result?.helmCharts) {
        json.result.helmCharts.forEach((chart: { name: string; files: Record<string, string> }) => {
          Object.entries(chart.files).forEach(([path, content]) => {
            allFiles[`helm-charts/${chart.name}/${path}`] = content;
          });
        });
        if (json.result.helmCharts.length > 0) {
          setSelectedChart(json.result.helmCharts[0].name);
        }
      }
      setGenerationResult({
        terraform: json.result?.terraform,
        helmCharts: json.result?.helmCharts,
      });

      // Save to cache
      saveGenerationToCache({
        terraform: json.result?.terraform,
        helmCharts: json.result?.helmCharts,
        cloud,
        region,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate infrastructure");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type: "terraform" | "helm" | "all") => {
    try {
      const body = {
        type,
        ...(type !== "helm" ? { files: generationResult?.terraform?.files ?? {} } : {}),
        ...(type !== "terraform" ? { helmCharts: generationResult?.helmCharts ?? [] } : {}),
      };
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `helmify-${type}-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    }
  };

  const handleAIGenerate = (modifiedFiles: Record<string, string>) => {
    if (!selectedChart || !generationResult) return;

    // Update the selected chart with AI-generated files
    const updatedCharts = generationResult.helmCharts?.map((chart) =>
      chart.name === selectedChart
        ? { ...chart, files: modifiedFiles }
        : chart
    ) || [];

    setGenerationResult({
      terraform: generationResult.terraform,
      helmCharts: updatedCharts,
    });

    // Update cache
    const cached = getGenerationFromCache();
    if (cached && cached.helmCharts) {
      const updatedCharts = cached.helmCharts.map((chart) =>
        chart.name === selectedChart
          ? { ...chart, files: modifiedFiles }
          : chart
      );
      saveGenerationToCache({
        terraform: cached.terraform,
        helmCharts: updatedCharts,
        cloud: cached.cloud,
        region: cached.region,
      });
    }

    // Update selected file if it was modified
    if (selectedFile && selectedFile.path.startsWith(`helm-charts/${selectedChart}/`)) {
      const relativePath = selectedFile.path.replace(`helm-charts/${selectedChart}/`, "");
      if (modifiedFiles[relativePath]) {
        setSelectedFile({
          path: selectedFile.path,
          content: modifiedFiles[relativePath],
        });
      }
    }
  };

  const handleFileSelect = (path: string, content: string) => {
    setSelectedFile({ path, content });
  };

  // Combine all files for file explorer
  const allFiles: Record<string, string> = {};
  if (generationResult?.terraform?.files) {
    Object.entries(generationResult.terraform.files).forEach(([path, content]) => {
      allFiles[`terraform/${path}`] = content;
    });
  }
  if (generationResult?.helmCharts) {
    generationResult.helmCharts.forEach((chart) => {
      Object.entries(chart.files).forEach(([path, content]) => {
        allFiles[`helm-charts/${chart.name}/${path}`] = content;
      });
    });
  }
  
  // Get current chart files for AI generation
  const currentChartFiles: Record<string, string> = selectedChart
    ? Object.entries(allFiles)
        .filter(([path]) => path.startsWith(`helm-charts/${selectedChart}/`))
        .reduce<Record<string, string>>((acc, [path, content]) => {
          const relativePath = path.replace(`helm-charts/${selectedChart}/`, "");
          acc[relativePath] = content;
          return acc;
        }, {})
    : {};

  return (
    <PageLayout
      showFileExplorer={Object.keys(allFiles).length > 0}
      fileExplorer={
        <FileExplorer
          files={allFiles}
          onFileSelect={handleFileSelect}
          selectedPath={selectedFile?.path}
        />
      }
      codeViewer={
        <div className="w-150">
          <CodeViewer
            content={selectedFile?.content || ""}
            filename={selectedFile?.path}
          />
        </div>
      }
    >
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Infrastructure as Code
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Configure your microservices and generate Terraform modules and Helm charts
          </p>
        </header>

        <div className="space-y-6">
          {error && (
            <div className="rounded-xl border border-red-600/50 bg-red-900/20 p-4">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {validation && validation.issues.length > 0 && (
            <div className="rounded-xl border border-yellow-600/50 bg-yellow-900/20 p-4">
              <p className="text-sm font-semibold text-yellow-200 mb-2">Validation Warnings</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-300">
                {validation.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
              {validation.suggestedFixes.length > 0 && (
                <p className="mt-2 text-xs text-yellow-400">
                  Fix: {validation.suggestedFixes.join("; ")}
                </p>
              )}
            </div>
          )}

          <CloudSelector
            cloud={cloud}
            region={region}
            preferPreset={preferPreset}
            onCloudChange={setCloud}
            onRegionChange={setRegion}
            onPresetChange={setPreferPreset}
          />

          <MicroserviceList
            microservices={microservices}
            expandedService={expandedService}
            onAdd={() =>
              setMicroservices((prev) => [
                ...prev,
                {
                  ...defaultMicroservice,
                  name: `svc-${prev.length + 1}`,
                  helmChartName: `svc-${prev.length + 1}`,
                  ingress: {
                    ...defaultMicroservice.ingress,
                    hostname: `svc-${prev.length + 1}.example.com`,
                  },
                  configMap: {
                    ...defaultMicroservice.configMap,
                    name: `svc-${prev.length + 1}-config`,
                  },
                  secret: {
                    ...defaultMicroservice.secret,
                    name: `svc-${prev.length + 1}-secrets`,
                  },
                },
              ])
            }
            onToggle={(index) =>
              setExpandedService(expandedService === index ? null : index)
            }
            onRemove={handleMicroserviceRemove}
            onChange={handleMicroserviceChange}
            onNestedChange={handleNestedChange}
          />

          <GenerateButton loading={loading} onSubmit={handleGenerateIac} />

          {generationResult && Object.keys(allFiles).length > 0 && (
            <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-slate-200 mb-4">Download Generated Files</h2>
              <div className="flex flex-wrap gap-3">
                {generationResult.terraform && (
                  <button
                    type="button"
                    onClick={() => handleDownload("terraform")}
                    className="rounded-lg border border-blue-600 bg-blue-600/10 px-4 py-2 text-sm font-medium text-blue-400 hover:bg-blue-600/20 transition-colors"
                  >
                    ⬇ Download Terraform
                  </button>
                )}
                {generationResult.helmCharts && generationResult.helmCharts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleDownload("helm")}
                    className="rounded-lg border border-purple-600 bg-purple-600/10 px-4 py-2 text-sm font-medium text-purple-400 hover:bg-purple-600/20 transition-colors"
                  >
                    ⬇ Download Helm Charts
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDownload("all")}
                  className="rounded-lg border border-emerald-600 bg-emerald-600/10 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-600/20 transition-colors"
                >
                  ⬇ Download All (ZIP)
                </button>
              </div>
            </section>
          )}

          {Object.keys(allFiles).length > 0 && selectedChart && Object.keys(currentChartFiles).length > 0 && (
            <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Chart for AI Modification
                </label>
                <select
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={selectedChart || ""}
                  onChange={(e) => setSelectedChart(e.target.value)}
                >
                  {generationResult?.helmCharts?.map((chart) => (
                    <option key={chart.name} value={chart.name}>
                      {chart.name}
                    </option>
                  )) || []}
                </select>
              </div>
              <AIGenerateButton
                currentCharts={currentChartFiles}
                chartName={selectedChart}
                onGenerated={handleAIGenerate}
              />
            </section>
          )}

          <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Custom Prompt (Optional)</h2>
            <p className="text-sm text-slate-500 mb-4">
              Additional requirements for preset template generation (not used for AI generation)
            </p>
            <textarea
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Additional requirements for preset template generation..."
            />
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
