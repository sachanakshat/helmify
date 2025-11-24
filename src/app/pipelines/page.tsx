"use client";

import { FormEvent, useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import FileExplorer from "@/components/common/FileExplorer";
import CodeViewer from "@/components/common/CodeViewer";
import { CiProvider, ciProviders, cloudRegions } from "@/lib/constants";

export default function PipelinesPage() {
  const [cloud, setCloud] = useState<"aws" | "azure">("aws");
  const [region, setRegion] = useState(cloudRegions.aws[0]);
  const [repoUrl, setRepoUrl] = useState("https://github.com/org/service");
  const [branch, setBranch] = useState("main");
  const [ciProvider, setCiProvider] = useState<CiProvider>("github");
  const [deploymentType, setDeploymentType] = useState<"app" | "service" | "helm">("service");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [pipelineOutput, setPipelineOutput] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);

  const handleGeneratePipeline = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloud,
          repoUrl,
          branch,
          ciProvider,
          deploymentType,
          preferPreset: true,
          customPrompt: customPrompt || undefined,
        }),
      });
      if (!response.ok) throw new Error("Request failed");
      const json = await response.json();
      setPipelineOutput(json.template || "");

      // Create file structure for explorer
      const files: Record<string, string> = {
        [`${ciProvider}-pipeline.yml`]: json.template || "",
      };
      setSelectedFile({ path: `${ciProvider}-pipeline.yml`, content: json.template || "" });
    } catch (error) {
      console.error("Failed to generate:", error);
    } finally {
      setLoading(false);
    }
  };

  const files: Record<string, string> = pipelineOutput
    ? { [`${ciProvider}-pipeline.yml`]: pipelineOutput }
    : {};

  return (
    <PageLayout
      showFileExplorer={Object.keys(files).length > 0}
      fileExplorer={
        <FileExplorer
          files={files}
          onFileSelect={(path, content) => setSelectedFile({ path, content })}
          selectedPath={selectedFile?.path}
        />
      }
      codeViewer={
        <div className="w-[600px]">
          <CodeViewer content={selectedFile?.content || ""} filename={selectedFile?.path} />
        </div>
      }
    >
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            CI/CD Pipelines
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Generate CI/CD pipelines for AWS and Azure with OIDC/Service Principal authentication
          </p>
        </header>

        <form onSubmit={handleGeneratePipeline} className="space-y-6">
          <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-200">Pipeline Configuration</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex flex-col text-sm">
                <span className="mb-1 text-slate-400">Cloud Provider</span>
                <select
                  className="rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={cloud}
                  onChange={(e) => {
                    const next = e.target.value as "aws" | "azure";
                    setCloud(next);
                    setRegion(cloudRegions[next][0]);
                  }}
                >
                  <option value="aws">AWS</option>
                  <option value="azure">Azure</option>
                </select>
              </label>
              <label className="flex flex-col text-sm">
                <span className="mb-1 text-slate-400">Region</span>
                <select
                  className="rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                >
                  {cloudRegions[cloud].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <input
                className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="Repository URL"
              />
              <input
                className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Branch"
              />
              <select
                className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={ciProvider}
                onChange={(e) => setCiProvider(e.target.value as CiProvider)}
              >
                {ciProviders.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <select
                className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={deploymentType}
                onChange={(e) => setDeploymentType(e.target.value as "app" | "service" | "helm")}
              >
                <option value="app">Application</option>
                <option value="service">Service</option>
                <option value="helm">Helm Chart</option>
              </select>
            </div>
          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <label className="mb-2 block text-sm text-slate-400">Custom Prompt (optional)</label>
            <textarea
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Additional requirements for pipeline generation..."
            />
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Pipeline"}
          </button>
        </form>
      </div>
    </PageLayout>
  );
}

