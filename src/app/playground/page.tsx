"use client";

import { useState, useEffect } from "react";
import PageLayout from "@/components/layout/PageLayout";
import FileExplorer from "@/components/common/FileExplorer";
import CodeViewer from "@/components/common/CodeViewer";
import dynamic from "next/dynamic";

const Terminal = dynamic(() => import("@/components/common/Terminal"), {
  ssr: false,
});
import { getGenerationFromCache } from "@/lib/storage";

const WRAPPER_API_URL = "http://localhost:8080";

export default function PlaygroundPage() {
  const [deploying, setDeploying] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [resources, setResources] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cachedFiles, setCachedFiles] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<{ path: string; content: string } | null>(null);

  // Load cached infrastructure from IAC page
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
      setCachedFiles(allFiles);
    }
  }, []);

  const handleDeploy = async () => {
    setDeploying(true);
    setError(null);
    try {
      const cached = getGenerationFromCache();
      if (!cached || !cached.helmCharts || cached.helmCharts.length === 0) {
        throw new Error("No Helm charts found. Please generate infrastructure in the IAC page first.");
      }

      const response = await fetch(`${WRAPPER_API_URL}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          charts: cached.helmCharts,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Deployment failed");
      }
      const data = await response.json();
      setStatus(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to Minikube wrapper. Make sure it&apos;s running on localhost:8080"
      );
    } finally {
      setDeploying(false);
    }
  };

  const handleGetStatus = async () => {
    setError(null);
    try {
      const response = await fetch(`${WRAPPER_API_URL}/status`);
      if (!response.ok) throw new Error("Failed to get status");
      const data = await response.json();
      setStatus(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to Minikube wrapper. Make sure it&apos;s running on localhost:8080"
      );
    }
  };

  const handleGetResources = async () => {
    setError(null);
    try {
      const response = await fetch(`${WRAPPER_API_URL}/resources`);
      if (!response.ok) throw new Error("Failed to get resources");
      const data = await response.json();
      setResources(data.yaml || JSON.stringify(data, null, 2));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to Minikube wrapper. Make sure it&apos;s running on localhost:8080"
      );
    }
  };

  const handleFileSelect = (path: string, content: string) => {
    setSelectedFile({ path, content });
  };

  return (
    <PageLayout
      showFileExplorer={Object.keys(cachedFiles).length > 0}
      fileExplorer={
        <FileExplorer
          files={cachedFiles}
          onFileSelect={handleFileSelect}
          selectedPath={selectedFile?.path}
        />
      }
      // codeViewer={
      //   <div className="w-[600px]">
      //     <CodeViewer
      //       content={selectedFile?.content || ""}
      //       filename={selectedFile?.path}
      //     />
      //   </div>
      // }
    >
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Minikube Playground
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Deploy and test your generated Helm charts in a local Minikube cluster
          </p>
        </header>

        <div className="mb-6 rounded-xl border border-yellow-600/50 bg-yellow-900/20 p-4">
          <p className="text-sm text-yellow-200">
            <strong>Prerequisites:</strong> Make sure Minikube is running and the wrapper API is
            started on localhost:8080. See the{" "}
            <a href="/guides" className="underline hover:text-yellow-100">
              Guides section
            </a>{" "}
            for setup instructions.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Deployment Actions</h2>
            <div className="space-y-4">
              <button
                onClick={handleDeploy}
                disabled={deploying || Object.keys(cachedFiles).length === 0}
                className="w-full rounded-lg bg-linear-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
              >
                {deploying ? "Deploying..." : "Deploy to Minikube"}
              </button>
              <button
                onClick={handleGetStatus}
                className="w-full rounded-lg bg-slate-700 px-6 py-3 font-semibold text-slate-200 hover:bg-slate-600 transition-colors"
              >
                Get Cluster Status
              </button>
              <button
                onClick={handleGetResources}
                className="w-full rounded-lg bg-slate-700 px-6 py-3 font-semibold text-slate-200 hover:bg-slate-600 transition-colors"
              >
                View Resources (kubectl get)
              </button>
            </div>
            {Object.keys(cachedFiles).length === 0 && (
              <p className="mt-4 text-xs text-slate-500">
                No infrastructure found. Generate infrastructure in the{" "}
                <a href="/iac" className="text-blue-400 hover:text-blue-300">
                  IAC page
                </a>{" "}
                first.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Output</h2>
            {error && (
              <div className="mb-4 rounded-lg bg-red-900/30 border border-red-600/50 p-4">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
            {status && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-slate-300 mb-2">Status:</h3>
                <pre className="rounded-lg bg-slate-900 p-4 text-xs text-slate-300 font-mono overflow-auto max-h-64">
                  {status}
                </pre>
              </div>
            )}
            {resources && (
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-2">Resources (YAML):</h3>
                <pre className="rounded-lg bg-slate-900 p-4 text-xs text-slate-300 font-mono overflow-auto max-h-96">
                  {resources}
                </pre>
              </div>
            )}
            {!status && !resources && !error && (
              <p className="text-sm text-slate-500 text-center py-8">
                Click an action above to interact with your Minikube cluster
              </p>
            )}
          </section>
        </div>

        {/* Interactive Terminal */}
        <section className="mb-6 rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm overflow-hidden">
          <Terminal className="h-[400px]" />
        </section>

        {/* Infrastructure Editor - Shows cached files */}
        {Object.keys(cachedFiles).length > 0 && (
          <section className="rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm overflow-hidden">
            <div className="border-b border-slate-700 px-4 py-2 bg-slate-800/50">
              <h2 className="text-xl font-semibold text-slate-200">
                Generated Infrastructure (from IAC page)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                View and edit your generated Terraform and Helm charts
              </p>
            </div>
            <div className="flex h-[500px]">
              <div className="w-64 border-r border-slate-700">
                <FileExplorer
                  files={cachedFiles}
                  onFileSelect={handleFileSelect}
                  selectedPath={selectedFile?.path}
                />
              </div>
              <div className="flex-1">
                <CodeViewer
                  content={selectedFile?.content || "// Select a file from the explorer to view"}
                  filename={selectedFile?.path}
                />
              </div>
            </div>
          </section>
        )}

        <section className="mt-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">How It Works</h2>
          <div className="space-y-3 text-slate-400 text-sm">
            <p>
              The Playground connects to a local wrapper API that interfaces with your Minikube
              cluster. When you click &ldquo;Deploy&rdquo;, it sends your generated Helm charts to the wrapper,
              which then:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Validates the Helm charts</li>
              <li>Deploys them to your local Minikube cluster using helm install</li>
              <li>Returns deployment status and logs</li>
            </ol>
            <p>
              The wrapper API handles all kubectl and helm commands, making it safe to use from
              your browser without exposing Kubernetes credentials.
            </p>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
