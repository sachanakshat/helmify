"use client";

import { ReactNode } from "react";
import Navigation from "./Navigation";

interface PageLayoutProps {
  children: ReactNode;
  showFileExplorer?: boolean;
  fileExplorer?: ReactNode;
  codeViewer?: ReactNode;
}

export default function PageLayout({
  children,
  showFileExplorer = false,
  fileExplorer,
  codeViewer,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <Navigation />
      <div className="flex h-[calc(100vh-73px)]">
        <div className="flex-1 overflow-auto">{children}</div>
        {showFileExplorer && (
          <div className="flex border-l border-slate-700">
            {fileExplorer}
            {codeViewer}
          </div>
        )}
      </div>
    </div>
  );
}

