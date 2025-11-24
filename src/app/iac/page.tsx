"use client";

import { FormEvent, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import CloudSelector from "@/components/iac/CloudSelector";
import MicroserviceList from "@/components/iac/MicroserviceList";
import GenerateButton from "@/components/iac/GenerateButton";
import FileExplorer from "@/components/common/FileExplorer";
import CodeViewer from "@/components/common/CodeViewer";
import { MicroserviceState, defaultMicroservice } from "@/lib/microserviceTypes";
import { cloudRegions } from "@/lib/constants";

export default function IACPage() {
  const [cloud, setCloud] = useState<"aws" | "azure">("aws");
  const [region, setRegion] = useState(cloudRegions.aws[0]);
  const [microservices, setMicroservices] = useState<MicroserviceState[]>([
    { ...defaultMicroservice },
  ]);
  const [expandedService, setExpandedService] = useState<number | null>(0);
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generationResult, setGenerationResult] = useState<{
    terraform?: { files: Record<string, string> };
    helmCharts?: Array<{ name: string; files: Record<string, string> }>;
  } | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);

  const handleMicroserviceChange = (
    index: number,
    changes: Partial<MicroserviceState>
  ) => {
    setMicroservices((prev) =>
      prev.map((svc, idx) => (idx === index ? { ...svc, ...changes } : svc))
    );
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
    preferPreset: true,
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
    try {
      const body = buildTerraformPayload();
      const response = await fetch("/api/iac", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Request failed");
      const json = await response.json();

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
      }
      setGenerationResult({ terraform: { files: allFiles } });
    } catch (error) {
      console.error("Failed to generate:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (path: string, content: string) => {
    setSelectedFile({ path, content });
  };

  const allFiles: Record<string, string> = generationResult?.terraform?.files || {};

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
        <div className="w-[600px]">
          <CodeViewer
            content={selectedFile?.content || ""}
            filename={selectedFile?.path}
          />
        </div>
      }
    >
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Infrastructure as Code
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Configure your microservices and generate Terraform modules and Helm charts
          </p>
        </header>

        <div className="space-y-6">
          <CloudSelector
            cloud={cloud}
            region={region}
            onCloudChange={setCloud}
            onRegionChange={setRegion}
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
            onChange={handleMicroserviceChange}
            onNestedChange={handleNestedChange}
          />

          <GenerateButton
            loading={loading}
            onSubmit={handleGenerateIac}
            customPrompt={customPrompt}
            onPromptChange={setCustomPrompt}
          />
        </div>
      </div>
    </PageLayout>
  );
}

