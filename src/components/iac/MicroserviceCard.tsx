"use client";

import { MicroserviceState } from "@/lib/microserviceTypes";
import { Runtime, runtimes } from "@/lib/constants";

interface MicroserviceCardProps {
  service: MicroserviceState;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onChange: (changes: Partial<MicroserviceState>) => void;
  onNestedChange: (
    path: "ingress" | "hpa" | "resources" | "configMap" | "secret",
    changes: Record<string, unknown>
  ) => void;
}

export default function MicroserviceCard({
  service,
  index,
  isExpanded,
  onToggle,
  onRemove,
  onChange,
  onNestedChange,
}: MicroserviceCardProps) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-medium text-slate-400">
            Microservice Name
          </label>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
            title={`Remove service ${index + 1}`}
          >
            ✕ Remove
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          Unique identifier for this microservice (e.g., &ldquo;user-service&rdquo;, &ldquo;payment-api&rdquo;, &ldquo;auth-service&rdquo;)
        </p>
        <div className="flex gap-3 items-center">
          <input
            className="flex-1 rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={service.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g., user-service"
          />
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Runtime Environment
            </label>
            <select
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={service.runtime}
              onChange={(e) => onChange({ runtime: e.target.value as Runtime })}
            >
              {runtimes.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="text-slate-400 hover:text-slate-200 mt-6"
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">
          External Service Dependencies
        </label>
        <p className="text-xs text-slate-500 mb-2">
          List external services this microservice depends on (e.g., &ldquo;postgres,redis,mongodb&rdquo; for database and cache dependencies)
        </p>
        <input
          className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={service.services}
          onChange={(e) => onChange({ services: e.target.value })}
          placeholder="e.g., postgres,redis (comma-separated)"
        />
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-slate-700 pt-4">
          <ExpandedConfig
            service={service}
            onChange={onChange}
            onNestedChange={onNestedChange}
          />
        </div>
      )}
    </div>
  );
}

function ExpandedConfig({
  service,
  onChange,
  onNestedChange,
}: {
  service: MicroserviceState;
  onChange: (changes: Partial<MicroserviceState>) => void;
  onNestedChange: (
    path: "ingress" | "hpa" | "resources" | "configMap" | "secret",
    changes: Record<string, unknown>
  ) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={service.needsHelmChart}
          onChange={(e) => onChange({ needsHelmChart: e.target.checked })}
          className="rounded border-slate-600 bg-slate-700 text-blue-500"
        />
        <span className="text-sm text-slate-300">Generate Helm Chart</span>
      </div>
      {service.needsHelmChart && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Helm Chart Name
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Name for the generated Helm chart (usually matches microservice name)
            </p>
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={service.helmChartName}
              onChange={(e) => onChange({ helmChartName: e.target.value })}
              placeholder="e.g., user-service-chart"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Container Image Repository
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Docker registry URL where your container image is stored
              </p>
              <input
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={service.imageRepository}
                onChange={(e) => onChange({ imageRepository: e.target.value })}
                placeholder="e.g., registry.example.com/user-service"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Container Image Tag
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Version tag of the container image to deploy
              </p>
              <input
                className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                value={service.imageTag}
                onChange={(e) => onChange({ imageTag: e.target.value })}
                placeholder="e.g., v1.0.0 or latest"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Kubernetes Image Pull Secret Name
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Name of the Kubernetes secret for pulling images from private registries (leave empty if using public images)
            </p>
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={service.pullSecretName}
              onChange={(e) => onChange({ pullSecretName: e.target.value })}
              placeholder="e.g., registry-secret (optional)"
            />
          </div>
        </div>
      )}

      <IngressConfig
        ingress={service.ingress}
        onChange={(changes) => onNestedChange("ingress", changes)}
      />

      <HPAConfig
        hpa={service.hpa}
        onChange={(changes) => onNestedChange("hpa", changes)}
      />

      <ResourcesConfig
        resources={service.resources}
        onChange={(changes) => onNestedChange("resources", changes)}
      />

      <ConfigMapConfig
        configMap={service.configMap}
        onChange={(changes) => onNestedChange("configMap", changes)}
      />

      <SecretConfig
        secret={service.secret}
        onChange={(changes) => onNestedChange("secret", changes)}
      />
    </>
  );
}

function IngressConfig({
  ingress,
  onChange,
}: {
  ingress: MicroserviceState["ingress"];
  onChange: (changes: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={ingress.enabled}
          onChange={(e) => onChange({ enabled: e.target.checked })}
          className="rounded border-slate-600 bg-slate-700 text-blue-500"
        />
        <span className="text-sm font-medium text-slate-300">Ingress</span>
      </div>
      {ingress.enabled && (
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={ingress.hostname}
            onChange={(e) => onChange({ hostname: e.target.value })}
            placeholder="Hostname"
          />
          <input
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={ingress.path}
            onChange={(e) => onChange({ path: e.target.value })}
            placeholder="Path"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={ingress.tlsEnabled}
              onChange={(e) => onChange({ tlsEnabled: e.target.checked })}
              className="rounded border-slate-600 bg-slate-700 text-blue-500"
            />
            <span className="text-sm text-slate-300">Enable TLS</span>
          </div>
          {ingress.tlsEnabled && (
            <input
              className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              value={ingress.tlsSecretName}
              onChange={(e) => onChange({ tlsSecretName: e.target.value })}
              placeholder="TLS secret name"
            />
          )}
        </div>
      )}
    </div>
  );
}

function HPAConfig({
  hpa,
  onChange,
}: {
  hpa: MicroserviceState["hpa"];
  onChange: (changes: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={hpa.enabled}
          onChange={(e) => onChange({ enabled: e.target.checked })}
          className="rounded border-slate-600 bg-slate-700 text-blue-500"
        />
        <span className="text-sm font-medium text-slate-300">Horizontal Pod Autoscaler</span>
      </div>
      {hpa.enabled && (
        <div className="grid gap-3 md:grid-cols-4">
          <input
            type="number"
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={hpa.minReplicas}
            onChange={(e) => onChange({ minReplicas: parseInt(e.target.value) || 1 })}
            placeholder="Min replicas"
          />
          <input
            type="number"
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={hpa.maxReplicas}
            onChange={(e) => onChange({ maxReplicas: parseInt(e.target.value) || 10 })}
            placeholder="Max replicas"
          />
          <input
            type="number"
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={hpa.targetCPU}
            onChange={(e) => onChange({ targetCPU: parseInt(e.target.value) || 70 })}
            placeholder="Target CPU %"
          />
          <input
            type="number"
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={hpa.targetMemory}
            onChange={(e) => onChange({ targetMemory: parseInt(e.target.value) || 80 })}
            placeholder="Target Memory %"
          />
        </div>
      )}
    </div>
  );
}

function ResourcesConfig({
  resources,
  onChange,
}: {
  resources: MicroserviceState["resources"];
  onChange: (changes: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-slate-300">Resource Limits</span>
      <div className="grid gap-3 md:grid-cols-4">
        <input
          className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={resources.requests.cpu}
          onChange={(e) => onChange({ requests: { ...resources.requests, cpu: e.target.value } })}
          placeholder="Request CPU"
        />
        <input
          className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={resources.requests.memory}
          onChange={(e) =>
            onChange({ requests: { ...resources.requests, memory: e.target.value } })
          }
          placeholder="Request Memory"
        />
        <input
          className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={resources.limits.cpu}
          onChange={(e) => onChange({ limits: { ...resources.limits, cpu: e.target.value } })}
          placeholder="Limit CPU"
        />
        <input
          className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          value={resources.limits.memory}
          onChange={(e) =>
            onChange({ limits: { ...resources.limits, memory: e.target.value } })
          }
          placeholder="Limit Memory"
        />
      </div>
    </div>
  );
}

function ConfigMapConfig({
  configMap,
  onChange,
}: {
  configMap: MicroserviceState["configMap"];
  onChange: (changes: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">Kubernetes ConfigMap</label>
      <p className="text-xs text-slate-500 mb-2">
        ConfigMap stores non-sensitive configuration data as key-value pairs (e.g., environment variables, config files)
      </p>
      <input
        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        value={configMap.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="e.g., user-service-config"
      />
      <textarea
        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-mono text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        rows={3}
        value={configMap.data}
        onChange={(e) => onChange({ data: e.target.value })}
        placeholder="APP_ENV=production
LOG_LEVEL=info
FEATURE_FLAG=true"
      />
    </div>
  );
}

function SecretConfig({
  secret,
  onChange,
}: {
  secret: MicroserviceState["secret"];
  onChange: (changes: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">Kubernetes Secret</label>
      <p className="text-xs text-slate-500 mb-2">
        Secret stores sensitive data like passwords, API keys, tokens (values are base64 encoded in Kubernetes)
      </p>
      <input
        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        value={secret.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="e.g., user-service-secrets"
      />
      <textarea
        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm font-mono text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        rows={3}
        value={secret.raw}
        onChange={(e) => onChange({ raw: e.target.value })}
        placeholder="DB_PASSWORD=your-secure-password
API_KEY=your-api-key
JWT_SECRET=your-jwt-secret"
      />
    </div>
  );
}

