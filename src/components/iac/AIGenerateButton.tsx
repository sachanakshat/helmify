"use client";

import { useState } from "react";

interface AIGenerateButtonProps {
  currentCharts: Record<string, string>;
  chartName: string;
  onGenerated: (files: Record<string, string>) => void;
}

export default function AIGenerateButton({
  currentCharts,
  chartName,
  onGenerated,
}: AIGenerateButtonProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAIGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt describing the changes you want");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentCharts,
          prompt,
          chartName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "AI generation failed");
      }

      const data = await response.json();
      if (data.success && data.files) {
        onGenerated(data.files);
        setPrompt(""); // Clear prompt after successful generation
      } else {
        throw new Error(data.error || "Invalid response from AI");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate with AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          AI Modification Prompt
        </label>
        <p className="text-xs text-slate-500 mb-2">
          Describe the changes you want to make to your Helm charts (e.g., "Add resource limits", "Enable TLS", "Add health checks")
        </p>
        <textarea
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Add resource limits of 512Mi memory and 500m CPU, enable health checks, and add environment variables"
        />
      </div>
      {error && (
        <div className="rounded-lg bg-red-900/30 border border-red-600/50 p-3">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}
      <button
        type="button"
        onClick={handleAIGenerate}
        disabled={loading || !prompt.trim()}
        className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Generating with AI..." : "✨ Generate with AI"}
      </button>
    </div>
  );
}

