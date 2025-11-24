"use client";

import { useState } from "react";

interface FileNode {
  name: string;
  path: string;
  content?: string;
  children: FileNode[];
  isDirectory: boolean;
}

interface FileExplorerProps {
  files: Record<string, string>;
  onFileSelect?: (path: string, content: string) => void;
  selectedPath?: string;
}

function buildFileTree(files: Record<string, string>): FileNode[] {
  const root: FileNode = {
    name: "root",
    path: "",
    children: [],
    isDirectory: true,
  };

  Object.entries(files).forEach(([path, content]) => {
    const parts = path.split("/").filter(Boolean);
    let current = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join("/");

      let child = current.children.find((c) => c.name === part);

      if (!child) {
        child = {
          name: part,
          path: currentPath,
          children: [],
          isDirectory: !isLast,
          content: isLast ? content : undefined,
        };
        current.children.push(child);
      }

      if (isLast) {
        child.content = content;
        child.isDirectory = false;
      }

      current = child;
    });
  });

  return root.children;
}

function FileTreeItem({
  node,
  level = 0,
  onSelect,
  selectedPath,
}: {
  node: FileNode;
  level?: number;
  onSelect: (path: string, content: string) => void;
  selectedPath?: string;
}) {
  const [expanded, setExpanded] = useState(level < 2 && node.isDirectory);

  const isSelected = selectedPath === node.path;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 px-2 py-1 text-sm cursor-pointer rounded hover:bg-slate-700/50 ${
          isSelected ? "bg-slate-700 text-blue-400" : "text-slate-300"
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (hasChildren) {
            setExpanded(!expanded);
          }
          if (node.content !== undefined) {
            onSelect(node.path, node.content);
          }
        }}
      >
        {hasChildren ? (
          <span className="text-slate-500 text-xs">{expanded ? "▼" : "▶"}</span>
        ) : (
          <span className="text-slate-500 text-xs w-3">•</span>
        )}
        <span className="truncate">{node.name}</span>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorer({ files, onFileSelect, selectedPath }: FileExplorerProps) {
  const [minimized, setMinimized] = useState(false);
  const tree = buildFileTree(files);

  if (minimized) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50">
        <button
          onClick={() => setMinimized(false)}
          className="bg-slate-800 border border-slate-700 rounded-l-lg px-3 py-2 text-slate-300 hover:bg-slate-700 transition-colors"
        >
          ◀
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 border-l border-slate-700 bg-slate-800/50 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-2">
        <h3 className="text-sm font-semibold text-slate-200">Files</h3>
        <button
          onClick={() => setMinimized(true)}
          className="text-slate-400 hover:text-slate-200 text-sm"
        >
          ▶
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {tree.length === 0 ? (
          <div className="p-4 text-sm text-slate-500 text-center">No files generated yet</div>
        ) : (
          tree.map((node) => (
            <FileTreeItem
              key={node.path}
              node={node}
              onSelect={onFileSelect || (() => {})}
              selectedPath={selectedPath}
            />
          ))
        )}
      </div>
    </div>
  );
}
