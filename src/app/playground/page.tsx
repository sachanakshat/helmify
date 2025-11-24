"use client";

import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";

const WRAPPER_API_URL = "http://localhost:8080";

export default function PlaygroundPage() {
  const [deploying, setDeploying] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [resources, setResources] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async () => {
    setDeploying(true);
    setError(null);
    try {
      const response = await fetch(`${WRAPPER_API_URL}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // This would contain the generated Helm charts/Terraform
          // For now, we'll send a placeholder
          charts: [],
        }),
      });
      if (!response.ok) throw new Error("Deployment failed");
      const data = await response.json();
      setStatus(data.message || "Deployment initiated");
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

  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
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

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Deployment Actions</h2>
            <div className="space-y-4">
              <button
                onClick={handleDeploy}
                disabled={deploying}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
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

        <section className="mt-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-slate-200 mb-4">How It Works</h2>
          <div className="space-y-3 text-slate-400 text-sm">
            <p>
              The Playground connects to a local wrapper API that interfaces with your Minikube
              cluster. When you click "Deploy", it sends your generated Helm charts to the wrapper,
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

