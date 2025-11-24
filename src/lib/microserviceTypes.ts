import { Runtime } from './constants';

export interface MicroserviceState {
  name: string;
  runtime: Runtime;
  services: string;
  needsHelmChart: boolean;
  helmChartName: string;
  imageRepository: string;
  imageTag: string;
  pullSecretName: string;
  ingress: {
    enabled: boolean;
    hostname: string;
    path: string;
    tlsEnabled: boolean;
    tlsSecretName: string;
  };
  hpa: {
    enabled: boolean;
    minReplicas: number;
    maxReplicas: number;
    targetCPU: number;
    targetMemory: number;
  };
  resources: {
    requests: { cpu: string; memory: string };
    limits: { cpu: string; memory: string };
  };
  configMap: {
    name: string;
    data: string;
  };
  secret: {
    name: string;
    raw: string;
  };
}

export const defaultMicroservice: MicroserviceState = {
  name: "core-api",
  runtime: "node",
  services: "postgres,redis",
  needsHelmChart: true,
  helmChartName: "core-api",
  imageRepository: "registry.example.com/core-api",
  imageTag: "latest",
  pullSecretName: "",
  ingress: {
    enabled: true,
    hostname: "api.example.com",
    path: "/",
    tlsEnabled: true,
    tlsSecretName: "api-tls",
  },
  hpa: {
    enabled: true,
    minReplicas: 2,
    maxReplicas: 10,
    targetCPU: 70,
    targetMemory: 80,
  },
  resources: {
    requests: { cpu: "100m", memory: "128Mi" },
    limits: { cpu: "500m", memory: "512Mi" },
  },
  configMap: {
    name: "core-api-config",
    data: "APP_MODE=prod\nFEATURE_FLAG=true",
  },
  secret: {
    name: "core-api-secrets",
    raw: "DB_PASSWORD=change-me\nAPI_TOKEN=abc123",
  },
};

