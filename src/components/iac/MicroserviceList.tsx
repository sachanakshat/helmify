"use client";

import { MicroserviceState } from "@/lib/microserviceTypes";
import MicroserviceCard from "./MicroserviceCard";

interface MicroserviceListProps {
  microservices: MicroserviceState[];
  expandedService: number | null;
  onAdd: () => void;
  onToggle: (index: number) => void;
  onChange: (index: number, changes: Partial<MicroserviceState>) => void;
  onNestedChange: (
    index: number,
    path: "ingress" | "hpa" | "resources" | "configMap" | "secret",
    changes: Record<string, unknown>
  ) => void;
}

export default function MicroserviceList({
  microservices,
  expandedService,
  onAdd,
  onToggle,
  onChange,
  onNestedChange,
}: MicroserviceListProps) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-200">Microservices</h2>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Add Service
        </button>
      </div>

      <div className="space-y-4">
        {microservices.map((svc, index) => (
          <MicroserviceCard
            key={index}
            service={svc}
            index={index}
            isExpanded={expandedService === index}
            onToggle={() => onToggle(index)}
            onChange={(changes) => onChange(index, changes)}
            onNestedChange={(path, changes) => onNestedChange(index, path, changes)}
          />
        ))}
      </div>
    </section>
  );
}

