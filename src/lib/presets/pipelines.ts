import { PipelineRequest } from '../types';

const awsOidcTemplate = (request: PipelineRequest) => `
name: Deploy ${request.deploymentType}
on:
  push:
    branches: [${request.branch}]

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: \${{ secrets.AWS_IAM_ROLE }}
          aws-region: ${request.cloud === 'aws' ? 'us-east-1' : 'custom'}
      - name: Terraform Init
        run: terraform -chdir=iac init
      - name: Terraform Apply
        run: terraform -chdir=iac apply -auto-approve
`;

const azureSpTemplate = (request: PipelineRequest) => `
trigger:
  branches:
    include:
      - ${request.branch}

stages:
  - stage: Deploy
    jobs:
      - job: IaC
        pool:
          vmImage: ubuntu-latest
        steps:
          - checkout: self
          - task: AzureCLI@2
            inputs:
              azureSubscription: \$(serviceConnection)
              scriptType: bash
              scriptLocation: inlineScript
              inlineScript: |
                terraform -chdir=iac init
                terraform -chdir=iac apply -auto-approve
`;

export function buildPresetPipeline(request: PipelineRequest): string {
  return request.cloud === 'aws'
    ? awsOidcTemplate(request)
    : azureSpTemplate(request);
}

