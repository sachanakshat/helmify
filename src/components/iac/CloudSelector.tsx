"use client";

import { cloudRegions } from "@/lib/constants";

interface CloudSelectorProps {
  cloud: "aws" | "azure";
  region: string;
  preferPreset: boolean;
  onCloudChange: (cloud: "aws" | "azure") => void;
  onRegionChange: (region: string) => void;
  onPresetChange: (value: boolean) => void;
}

export default function CloudSelector({
  cloud,
  region,
  preferPreset,
  onCloudChange,
  onRegionChange,
  onPresetChange,
}: CloudSelectorProps) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
      <h2 className="mb-4 text-xl font-semibold text-slate-200">Infrastructure Settings</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col text-sm">
          <span className="mb-1 text-slate-400">Cloud Provider</span>
          <select
            className="rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={cloud}
            onChange={(e) => {
              const next = e.target.value as "aws" | "azure";
              onCloudChange(next);
              onRegionChange(cloudRegions[next][0]);
            }}
          >
            <option value="aws">AWS</option>
            <option value="azure">Azure</option>
          </select>
        </label>
        <label className="flex flex-col text-sm">
          <span className="mb-1 text-slate-400">Region</span>
          <select
            className="rounded-lg border border-slate-600 bg-slate-700 p-2.5 text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
          >
            {cloudRegions[cloud].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={preferPreset}
            onChange={(e) => onPresetChange(e.target.checked)}
            className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <span className="text-slate-300">Use preset templates</span>
          <span className="text-xs text-slate-500">
            {preferPreset ? "(fast, opinionated)" : "(AI-generated via Gemini)"}
          </span>
        </label>
      </div>
    </section>
  );
}

