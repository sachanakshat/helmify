export const runtimes = ["node", "python", "go", "dotnet"] as const;
export const ciProviders = ["github", "azure-devops", "gitlab"] as const;

export const cloudRegions: Record<string, string[]> = {
  aws: ["us-east-1", "us-east-2", "eu-central-1", "ap-southeast-1"],
  azure: ["eastus", "westeurope", "southeastasia", "westus2"],
};

export type Runtime = (typeof runtimes)[number];
export type CiProvider = (typeof ciProviders)[number];

