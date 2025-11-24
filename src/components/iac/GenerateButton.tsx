"use client";

interface GenerateButtonProps {
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function GenerateButton({
  loading,
  onSubmit,
}: GenerateButtonProps) {
  return (
    <form onSubmit={onSubmit}>
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

