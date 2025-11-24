"use client";

interface GenerateButtonProps {
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  customPrompt: string;
  onPromptChange: (value: string) => void;
}

export default function GenerateButton({
  loading,
  onSubmit,
  customPrompt,
  onPromptChange,
}: GenerateButtonProps) {
  return (
    <form onSubmit={onSubmit} className="mt-6">
      <div className="mb-4">
        <label className="mb-2 block text-sm text-slate-400">Custom Prompt (optional)</label>
        <textarea
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          rows={2}
          value={customPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Additional requirements for AI generation..."
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Infrastructure & Helm Charts"}
      </button>
    </form>
  );
}

