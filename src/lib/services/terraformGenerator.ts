import { TerraformRequest, MicroserviceConfig } from '../types';
import { logger } from '../logger';

export interface TerraformModule {
  files: Record<string, string>;
}

export function generateTerraformModules(request: TerraformRequest): TerraformModule {
  const files: Record<string, string> = {};
  
  // Main terraform files
  files['main.tf'] = generateMainTf(request);
  files['variables.tf'] = generateVariablesTf(request);
  files['outputs.tf'] = generateOutputsTf(request);
  files['terraform.tfvars.example'] = generateTfvarsExample(request);
  
  // Provider configuration
  files['providers.tf'] = generateProvidersTf(request);
  
  // Generate modules for each microservice
  request.microservices.forEach((service) => {
    const modulePath = `modules/${service.name}`;
    files[`${modulePath}/main.tf`] = generateModuleMainTf(service, request.cloud);
    files[`${modulePath}/variables.tf`] = generateModuleVariablesTf(service);
    files[`${modulePath}/outputs.tf`] = generateModuleOutputsTf(service);
    
    // Kubernetes resources if Helm chart is needed
    if (service.needsHelmChart) {
      files[`${modulePath}/kubernetes.tf`] = generateKubernetesTf(service, request.cloud);
    }
    
    // Networking and connections
    if (service.services.length > 0) {
      files[`${modulePath}/networking.tf`] = generateNetworkingTf(service, request.cloud);
    }
  });

  logger.info({ fileCount: Object.keys(files).length }, 'Generated Terraform modules');

  return { files };
}

function generateMainTf(request: TerraformRequest): string {
  const modules = request.microservices
    .map(
      (svc) => `
module "${svc.name}" {
  source = "./modules/${svc.name}"
  
  service_name = "${svc.name}"
  region       = var.region
  environment  = var.environment
  
  ${svc.needsHelmChart ? `helm_chart_name = "${svc.helmChartName || svc.name}"` : ''}
  ${svc.imageRepository ? `image_repository = "${svc.imageRepository}"` : ''}
  ${svc.imageTag ? `image_tag = "${svc.imageTag}"` : ''}
  
  ${svc.ingress?.enabled ? `
  ingress_enabled = true
  ingress_hostname = "${svc.ingress.hostname}"
  ingress_path = "${svc.ingress.path}"
  ingress_tls_enabled = ${svc.ingress.tlsEnabled}
  ${svc.ingress.tlsSecretName ? `ingress_tls_secret = "${svc.ingress.tlsSecretName}"` : ''}` : ''}
  
  ${svc.hpa?.enabled ? `
  hpa_enabled = true
  hpa_min_replicas = ${svc.hpa.minReplicas}
  hpa_max_replicas = ${svc.hpa.maxReplicas}
  hpa_target_cpu = ${svc.hpa.targetCPU}` : ''}
  
  dependencies = ${JSON.stringify(svc.services)}
}
`
    )
    .join('\n');

  return `# Main Terraform configuration
# Generated for ${request.cloud} in ${request.region}

${modules}
`;
}

function generateProvidersTf(request: TerraformRequest): string {
  if (request.cloud === 'aws') {
    return `terraform {
  required_version = ">= 1.6.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }
}

provider "aws" {
  region = var.region
  
  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "terraform"
      Project     = var.project_name
    }
  }
}

data "aws_eks_cluster" "main" {
  name = var.cluster_name
}

data "aws_eks_cluster_auth" "main" {
  name = var.cluster_name
}

provider "kubernetes" {
  host                   = data.aws_eks_cluster.main.endpoint
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.main.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.main.token
}

provider "helm" {
  kubernetes {
    host                   = data.aws_eks_cluster.main.endpoint
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.main.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.main.token
  }
}
`;
  } else {
    return `terraform {
  required_version = ">= 1.6.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.11"
    }
  }
}

provider "azurerm" {
  features {}
}

data "azurerm_kubernetes_cluster" "main" {
  name                = var.cluster_name
  resource_group_name = var.resource_group_name
}

provider "kubernetes" {
  host                   = data.azurerm_kubernetes_cluster.main.kube_config[0].host
  client_certificate     = base64decode(data.azurerm_kubernetes_cluster.main.kube_config[0].client_certificate)
  client_key             = base64decode(data.azurerm_kubernetes_cluster.main.kube_config[0].client_key)
  cluster_ca_certificate = base64decode(data.azurerm_kubernetes_cluster.main.kube_config[0].cluster_ca_certificate)
}

provider "helm" {
  kubernetes {
    host                   = data.azurerm_kubernetes_cluster.main.kube_config[0].host
    client_certificate     = base64decode(data.azurerm_kubernetes_cluster.main.kube_config[0].client_certificate)
    client_key             = base64decode(data.azurerm_kubernetes_cluster.main.kube_config[0].client_key)
    cluster_ca_certificate = base64decode(data.azurerm_kubernetes_cluster.main.kube_config[0].cluster_ca_certificate)
  }
}
`;
  }
}

function generateVariablesTf(request: TerraformRequest): string {
  const baseVars = `variable "region" {
  description = "AWS/Azure region for deployment"
  type        = string
  default     = "${request.region}"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name for resource tagging"
  type        = string
  default     = "helmify-app"
}

variable "cluster_name" {
  description = "Kubernetes cluster name"
  type        = string
}`;

  if (request.cloud === 'azure') {
    return `${baseVars}

variable "resource_group_name" {
  description = "Azure resource group name"
  type        = string
}
`;
  }
  
  return baseVars;
}

function generateOutputsTf(request: TerraformRequest): string {
  const outputs = request.microservices
    .map(
      (svc) => `
output "${svc.name}_endpoint" {
  description = "Endpoint for ${svc.name} service"
  value       = module.${svc.name}.service_endpoint
}

output "${svc.name}_ingress_url" {
  description = "Ingress URL for ${svc.name}"
  value       = module.${svc.name}.ingress_url
  ${svc.ingress?.enabled ? '' : '# Ingress not enabled for this service'}
}
`
    )
    .join('\n');

  return `# Outputs
${outputs}
`;
}

function generateTfvarsExample(request: TerraformRequest): string {
  const base = `region        = "${request.region}"
environment   = "dev"
project_name  = "my-app"
cluster_name  = "my-cluster"`;

  if (request.cloud === 'azure') {
    return `${base}
resource_group_name = "my-resource-group"`;
  }
  
  return base;
}

function generateModuleMainTf(service: MicroserviceConfig, _cloud: string): string {
  return `# Module for ${service.name} microservice

resource "kubernetes_namespace" "main" {
  count = var.create_namespace ? 1 : 0
  metadata {
    name = var.namespace
  }
}

${service.needsHelmChart ? `
resource "helm_release" "${service.name}" {
  name       = var.helm_chart_name
  repository = var.helm_repository
  chart      = var.helm_chart_name
  version    = var.helm_chart_version
  namespace  = var.namespace
  
  values = [
    yamlencode({
      image = {
        repository = var.image_repository
        tag        = var.image_tag
      }
      ${service.ingress?.enabled ? `
      ingress = {
        enabled  = var.ingress_enabled
        hostname = var.ingress_hostname
        path     = var.ingress_path
        tls = {
          enabled    = var.ingress_tls_enabled
          secretName = var.ingress_tls_secret
        }
      }` : ''}
      ${service.hpa?.enabled ? `
      autoscaling = {
        enabled                        = var.hpa_enabled
        minReplicas                   = var.hpa_min_replicas
        maxReplicas                   = var.hpa_max_replicas
        targetCPUUtilizationPercentage = var.hpa_target_cpu
      }` : ''}
    })
  ]
  
  depends_on = [kubernetes_namespace.main]
}
` : ''}
`;
}

function generateModuleVariablesTf(service: MicroserviceConfig): string {
  return `variable "service_name" {
  description = "Name of the microservice"
  type        = string
}

variable "region" {
  description = "Deployment region"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
  default     = "default"
}

variable "create_namespace" {
  description = "Whether to create the namespace"
  type        = bool
  default     = true
}

${service.needsHelmChart ? `
variable "helm_chart_name" {
  description = "Helm chart name"
  type        = string
}

variable "helm_repository" {
  description = "Helm repository URL"
  type        = string
  default     = ""
}

variable "helm_chart_version" {
  description = "Helm chart version"
  type        = string
  default     = "0.1.0"
}

variable "image_repository" {
  description = "Container image repository"
  type        = string
  default     = ""
}

variable "image_tag" {
  description = "Container image tag"
  type        = string
  default     = "latest"
}

variable "pull_secret_name" {
  description = "Kubernetes image pull secret name"
  type        = string
  default     = ""
}` : ''}

${service.ingress?.enabled ? `
variable "ingress_enabled" {
  description = "Enable ingress"
  type        = bool
  default     = false
}

variable "ingress_hostname" {
  description = "Ingress hostname"
  type        = string
  default     = ""
}

variable "ingress_path" {
  description = "Ingress path"
  type        = string
  default     = "/"
}

variable "ingress_tls_enabled" {
  description = "Enable TLS for ingress"
  type        = bool
  default     = false
}

variable "ingress_tls_secret" {
  description = "TLS secret name for ingress"
  type        = string
  default     = ""
}` : ''}

${service.hpa?.enabled ? `
variable "hpa_enabled" {
  description = "Enable HPA"
  type        = bool
  default     = false
}

variable "hpa_min_replicas" {
  description = "HPA minimum replicas"
  type        = number
  default     = 1
}

variable "hpa_max_replicas" {
  description = "HPA maximum replicas"
  type        = number
  default     = 10
}

variable "hpa_target_cpu" {
  description = "HPA target CPU utilization percentage"
  type        = number
  default     = 70
}` : ''}

variable "dependencies" {
  description = "List of service dependencies"
  type        = list(string)
  default     = []
}
`;
}

function generateModuleOutputsTf(service: MicroserviceConfig): string {
  return `output "service_endpoint" {
  description = "Service endpoint"
  value       = ${service.needsHelmChart ? `helm_release.${service.name}.metadata[0].name` : '""'}
}

output "ingress_url" {
  description = "Ingress URL"
  value       = ${service.ingress?.enabled ? `var.ingress_enabled ? "https://\${var.ingress_hostname}\${var.ingress_path}" : ""` : '""'}
}
`;
}

function generateKubernetesTf(service: MicroserviceConfig, _cloud: string): string {
  return `# Kubernetes resources for ${service.name}

${service.configMap ? `
resource "kubernetes_config_map" "${service.name}_config" {
  metadata {
    name      = "\${var.service_name}-configmap"
    namespace = var.namespace
  }
  
  data = ${JSON.stringify(service.configMap.data, null, 2)}
}
` : ''}

${service.secret ? `
resource "kubernetes_secret" "${service.name}_secret" {
  metadata {
    name      = "\${var.service_name}-secret"
    namespace = var.namespace
  }
  
  type = "Opaque"
  
  data = {
${Object.entries(service.secret.values)
  .map(([key, value]) => `    ${key} = base64encode("${value}")`)
  .join('\n')}
  }
}
` : ''}

${service.pullSecretName ? `
resource "kubernetes_secret" "${service.name}_pull_secret" {
  metadata {
    name      = var.pull_secret_name
    namespace = var.namespace
  }
  
  type = "kubernetes.io/dockerconfigjson"
  
  data = {
    ".dockerconfigjson" = jsonencode({
      auths = {
        "${service.imageRepository || 'registry.example.com'}" = {
          username = var.registry_username
          password = var.registry_password
        }
      }
    })
  }
}
` : ''}
`;
}

function generateNetworkingTf(service: MicroserviceConfig, _cloud: string): string {
  if (service.services.length === 0) return '';
  
  return `# Networking configuration for ${service.name}

# Service connections
${service.services
  .map(
    (dep) => `
# Connection to ${dep}
# Configure service mesh or networking policies as needed
`
  )
  .join('\n')}
`;
}

