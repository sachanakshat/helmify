export type CloudProvider = 'aws' | 'azure';

export interface ServiceConnector {
  from: string;
  to: string;
  protocol: 'http' | 'grpc' | 'events' | 'message-queue';
  notes?: string;
}

export interface IngressConfig {
  enabled: boolean;
  hostname: string;
  path: string;
  tlsEnabled: boolean;
  tlsSecretName?: string;
}

export interface MicroserviceConfig {
  name: string;
  runtime: 'node' | 'python' | 'go' | 'dotnet';
  services: string[];
  needsHelmChart: boolean;
  helmChartName?: string;
  // Per-microservice configuration
  imageRepository?: string;
  imageTag?: string;
  pullSecretName?: string;
  configMap?: {
    name: string;
    data: Record<string, string>;
  };
  secret?: {
    name: string;
    values: Record<string, string>;
  };
  ingress?: IngressConfig;
  hpa?: {
    enabled: boolean;
    minReplicas: number;
    maxReplicas: number;
    targetCPU: number;
    targetMemory?: number;
  };
  resources?: {
    requests: { cpu: string; memory: string };
    limits: { cpu: string; memory: string };
  };
}

export interface ConfigMapInput {
  name: string;
  data: Record<string, string>;
}

export interface SecretInput {
  name: string;
  values: Record<string, string>;
}

export interface TerraformRequest {
  cloud: CloudProvider;
  region: string;
  microservices: MicroserviceConfig[];
  connectors: ServiceConnector[];
  preferPreset: boolean;
  customPrompt?: string;
}

export interface PipelineRequest {
  cloud: CloudProvider;
  repoUrl: string;
  branch: string;
  ciProvider: 'github' | 'azure-devops' | 'gitlab';
  deploymentType: 'app' | 'service' | 'helm';
  preferPreset: boolean;
  customPrompt?: string;
}

export interface TemplateResponse {
  template: string;
  metadata: Record<string, unknown>;
  validation: ValidationReport;
}

export interface ValidationReport {
  isValid: boolean;
  issues: string[];
  suggestedFixes: string[];
}

