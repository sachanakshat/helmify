"use client";

import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";

export default function Home() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-6 py-20">
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Helmify
          </h1>
          <p className="text-2xl text-slate-400 mb-2">
            Complete deployment automation platform
          </p>
          <p className="text-lg text-slate-500">
            Generate Terraform, Helm charts, and CI/CD pipelines with per-microservice configuration
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <Link
            href="/iac"
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm hover:bg-slate-800 transition-all hover:border-blue-500 group"
          >
            <div className="text-3xl mb-3">🏗️</div>
            <h2 className="text-xl font-semibold text-slate-200 mb-2 group-hover:text-blue-400 transition-colors">
              Infrastructure
            </h2>
            <p className="text-sm text-slate-400">
              Configure microservices and generate Terraform modules and Helm charts with
              industry-ready structure
            </p>
          </Link>

          <Link
            href="/pipelines"
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm hover:bg-slate-800 transition-all hover:border-emerald-500 group"
          >
            <div className="text-3xl mb-3">⚙️</div>
            <h2 className="text-xl font-semibold text-slate-200 mb-2 group-hover:text-emerald-400 transition-colors">
              CI/CD Pipelines
            </h2>
            <p className="text-sm text-slate-400">
              Generate CI/CD pipelines for AWS and Azure with OIDC and Service Principal
              authentication
            </p>
          </Link>

          <Link
            href="/secrets"
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm hover:bg-slate-800 transition-all hover:border-purple-500 group"
          >
            <div className="text-3xl mb-3">🔐</div>
            <h2 className="text-xl font-semibold text-slate-200 mb-2 group-hover:text-purple-400 transition-colors">
              Secrets Management
            </h2>
            <p className="text-sm text-slate-400">
              Manage and validate secrets before uploading to cloud secret stores. Never commit
              secrets to Git
            </p>
          </Link>
        </div>

        <div className="mt-16 rounded-xl border border-slate-700 bg-slate-800/50 p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">Features</h2>
          <ul className="space-y-3 text-slate-400">
            <li className="flex items-start gap-3">
              <span className="text-blue-400">✓</span>
              <span>
                <strong className="text-slate-300">Per-Microservice Configuration:</strong> Each
                service has its own ConfigMaps, Secrets, Ingress, HPA, and resource limits
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400">✓</span>
              <span>
                <strong className="text-slate-300">Industry-Ready Output:</strong> Generate
                properly structured Terraform modules and Helm charts with all necessary components
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400">✓</span>
              <span>
                <strong className="text-slate-300">File Explorer:</strong> VSCode-like file
                explorer to browse generated files with syntax highlighting
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400">✓</span>
              <span>
                <strong className="text-slate-300">ZIP Downloads:</strong> Download Terraform,
                Helm charts, or both as organized ZIP archives
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-400">✓</span>
              <span>
                <strong className="text-slate-300">Multi-Cloud Support:</strong> Generate
                infrastructure for both AWS and Azure
              </span>
            </li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}
