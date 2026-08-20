"use client";

import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";

interface SecretBlock {
  name: string;
  raw: string;
}

export default function SecretsPage() {
  const [secrets, setSecrets] = useState<SecretBlock[]>([
    { name: "core-secrets", raw: "DB_PASSWORD=change-me\nAPI_TOKEN=abc123" },
  ]);
  const [loading, setLoading] = useState(false);
  const [secretOutput, setSecretOutput] = useState("");

  const handleSecretChange = (index: number, changes: Partial<SecretBlock>) => {
    setSecrets((prev) =>
      prev.map((secret, idx) => (idx === index ? { ...secret, ...changes } : secret))
    );
  };

  const handleSecretHydration = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/secrets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: secrets }),
      });
      if (!response.ok) throw new Error("Request failed");
      const json = await response.json();
      setSecretOutput(JSON.stringify(json.secrets, null, 2));
    } catch (error) {
      console.error("Failed to process secrets:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Secrets Management
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Manage and validate secrets before uploading to cloud secret stores
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-200">Secret Staging</h2>
              <button
                type="button"
                onClick={() =>
                  setSecrets((prev) => [
                    ...prev,
                    { name: `secret-${prev.length + 1}`, raw: "" },
                  ])
                }
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                + Block
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-400">
              Paste values directly from .env files. They never leave the browser until you trigger
              uploads via scripts.
            </p>
            <div className="space-y-3">
              {secrets.map((block, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-slate-700 bg-slate-800/30 p-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      value={block.name}
                      onChange={(e) => handleSecretChange(index, { name: e.target.value })}
                      placeholder="Secret bundle name"
                    />
                    {secrets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSecrets((prev) => prev.filter((_, i) => i !== index))}
                        className="text-xs text-red-400 hover:text-red-300 transition-colors shrink-0"
                        title="Remove block"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <textarea
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    rows={4}
                    value={block.raw}
                    onChange={(e) => handleSecretChange(index, { raw: e.target.value })}
                    placeholder="KEY=value (one per line)"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleSecretHydration}
              disabled={loading}
              className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-60 hover:bg-slate-800 transition-colors"
            >
              {loading ? "Validating..." : "Validate Secret Payload"}
            </button>
          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-200">Secret Payload Preview</h2>
            <pre className="max-h-[500px] overflow-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-300 font-mono">
              {secretOutput || "// Run secret hydration to preview JSON"}
            </pre>
            <div className="mt-4 space-y-2 text-xs text-slate-400">
              <p>Upload via:</p>
              <code className="block rounded bg-slate-800 px-3 py-2 text-slate-300">
                ./scripts/upload-aws-secrets.sh .env myapp us-east-1
              </code>
              <p className="mt-2">or</p>
              <code className="block rounded bg-slate-800 px-3 py-2 text-slate-300">
                ./scripts/upload-azure-secrets.sh .env myvault
              </code>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}

