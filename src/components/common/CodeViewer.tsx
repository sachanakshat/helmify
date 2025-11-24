"use client";

interface CodeViewerProps {
  content: string;
  language?: string;
  filename?: string;
}

export default function CodeViewer({ content, language, filename }: CodeViewerProps) {
  const getLanguageClass = () => {
    if (!language && filename) {
      const ext = filename.split(".").pop()?.toLowerCase();
      const langMap: Record<string, string> = {
        yaml: "yaml",
        yml: "yaml",
        tf: "hcl",
        tfvars: "hcl",
        json: "json",
        sh: "bash",
        js: "javascript",
        ts: "typescript",
        md: "markdown",
      };
      return langMap[ext || ""] || "text";
    }
    return language || "text";
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {filename && (
        <div className="border-b border-slate-700 px-4 py-2 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{filename}</span>
            <span className="text-xs text-slate-600 px-2 py-0.5 rounded bg-slate-700">
              {getLanguageClass()}
            </span>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-auto p-4">
        <pre className="text-xs text-slate-300 font-mono leading-relaxed">
          <code>{content || "// No file selected"}</code>
        </pre>
      </div>
    </div>
  );
}

