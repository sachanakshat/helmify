"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

const WRAPPER_API_URL = "http://localhost:8080";

interface TerminalProps {
  className?: string;
}

export default function Terminal({ className }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new XTerm({
      theme: {
        background: "#0f172a",
        foreground: "#e2e8f0",
        cursor: "#60a5fa",
      },
      fontSize: 14,
      fontFamily: "Monaco, Menlo, 'Courier New', monospace",
      cursorBlink: true,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit();

    xtermRef.current = terminal;
    fitAddonRef.current = fitAddon;

    // Initial welcome message
    terminal.writeln("Welcome to Helmify Kubernetes Terminal");
    terminal.writeln("Type 'help' for available commands or run kubectl/helm commands directly");
    terminal.writeln("");

    let currentLine = "";
    const commandHistory: string[] = [];
    let historyIndex = -1;

    terminal.onData((data) => {
      if (data === "\r") {
        // Enter pressed
        terminal.write("\r\n");
        if (currentLine.trim()) {
          commandHistory.push(currentLine.trim());
          historyIndex = commandHistory.length;
          handleCommand(currentLine.trim());
        } else {
          terminal.write("$ ");
        }
        currentLine = "";
      } else if (data === "\x7f") {
        // Backspace
        if (currentLine.length > 0) {
          currentLine = currentLine.slice(0, -1);
          terminal.write("\b \b");
        }
      } else if (data === "\x1b[A") {
        // Up arrow - history
        if (historyIndex > 0) {
          historyIndex--;
          currentLine = commandHistory[historyIndex];
          terminal.write("\r\x1b[K$ " + currentLine);
        }
      } else if (data === "\x1b[B") {
        // Down arrow - history
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          currentLine = commandHistory[historyIndex];
          terminal.write("\r\x1b[K$ " + currentLine);
        } else {
          historyIndex = commandHistory.length;
          currentLine = "";
          terminal.write("\r\x1b[K$ ");
        }
      } else {
        // Regular character
        currentLine += data;
        terminal.write(data);
      }
    });

    const handleCommand = async (command: string) => {
      if (command === "help") {
        terminal.writeln("Available commands:");
        terminal.writeln("  kubectl <args>  - Run kubectl commands");
        terminal.writeln("  helm <args>     - Run helm commands");
        terminal.writeln("  clear           - Clear terminal");
        terminal.writeln("  help            - Show this help");
        terminal.write("$ ");
        return;
      }

      if (command === "clear") {
        terminal.clear();
        terminal.write("$ ");
        return;
      }

      // Execute command via wrapper API
      try {
        terminal.write("\r\n");
        setIsConnected(true);

        if (command.startsWith("kubectl ") || command.startsWith("helm ")) {
          const response = await fetch(`${WRAPPER_API_URL}/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command }),
          });

          if (!response.ok) {
            const error = await response.json();
            terminal.writeln(`\x1b[31mError: ${error.error || "Command failed"}\x1b[0m`);
          } else {
            const data = await response.json();
            if (data.output) {
              terminal.write(data.output);
            }
            if (data.error) {
              terminal.writeln(`\x1b[31m${data.error}\x1b[0m`);
            }
          }
        } else {
          terminal.writeln(`\x1b[33mUnknown command: ${command}\x1b[0m`);
          terminal.writeln("Type 'help' for available commands");
        }
      } catch {
        terminal.writeln(
          `\x1b[31mFailed to connect to wrapper API. Make sure it's running on ${WRAPPER_API_URL}\x1b[0m`
        );
        setIsConnected(false);
      }

      terminal.write("$ ");
    };

    // Initial prompt
    terminal.write("$ ");

    // Handle window resize
    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      terminal.dispose();
    };
  }, []);

  return (
    <div className={className}>
      <div className="border-b border-slate-700 px-4 py-2 bg-slate-800/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Terminal</h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-400" : "bg-red-400"
            }`}
          />
          <span className="text-xs text-slate-400">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
      <div
        ref={terminalRef}
        className="h-full w-full"
        style={{ minHeight: "400px" }}
      />
    </div>
  );
}

