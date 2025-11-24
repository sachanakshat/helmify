import { TerraformRequest } from '../types';

const awsBase = `
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}
`;

const azureBase = `
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
  }
}

provider "azurerm" {
  features {}
}
`;

export function buildPresetTerraform(request: TerraformRequest): string {
  const header = request.cloud === 'aws' ? awsBase : azureBase;
  const modules = request.microservices
    .map(
      (svc) => `
module "${svc.name}" {
  source = "./modules/${svc.runtime}"
  service_name = "${svc.name}"
  dependencies = ${JSON.stringify(svc.services)}
  helm_release = ${svc.needsHelmChart}
  helm_chart_name = "${svc.helmChartName ?? ''}"
}
`
    )
    .join('\n');

  return `
${header}

variable "region" {
  description = "Deployment region"
  type        = string
  default     = "${request.region}"
}

${modules}
`;
}

