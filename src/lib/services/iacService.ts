import { generateTemplate } from '../gemini';
import { TerraformRequest, TemplateResponse } from '../types';
import { validateTerraform } from './validationService';
import { generateTerraformModules } from './terraformGenerator';
import { generateHelmChart } from './helmGenerator';
import { logger } from '../logger';

export interface GenerationResult {
  terraform: { files: Record<string, string> };
  helmCharts: Array<{ name: string; files: Record<string, string> }>;
}

export async function createTerraformTemplate(
  request: TerraformRequest
): Promise<TemplateResponse & { result?: GenerationResult }> {
  try {
    if (request.preferPreset) {
      // Generate structured Terraform modules
      const terraformModules = generateTerraformModules(request);
      
      // Generate Helm charts for services that need them
      const helmCharts = request.microservices
        .filter((svc) => svc.needsHelmChart)
        .map((svc) => generateHelmChart(svc));

      // Validate main.tf
      const mainTf = terraformModules.files['main.tf'] || '';
      const validation = validateTerraform(mainTf);

      logger.info({ 
        terraformFiles: Object.keys(terraformModules.files).length,
        helmCharts: helmCharts.length,
        validation 
      }, 'Generated Terraform and Helm charts');

      return {
        template: mainTf,
        metadata: {
          source: 'preset',
          fileCount: Object.keys(terraformModules.files).length,
          helmChartCount: helmCharts.length
        },
        validation,
        result: {
          terraform: terraformModules,
          helmCharts
        }
      };
    } else {
      // Use Gemini for custom generation
      const prompt = request.customPrompt ?? '';
      const template = await generateTemplate(
        [
          'Generate complete Terraform infrastructure code with:',
          `- Cloud: ${request.cloud}, Region: ${request.region}`,
          `- Microservices: ${JSON.stringify(request.microservices)}`,
          `- Include proper module structure, providers, variables, outputs`,
          `- Generate Helm charts for services that need them`,
          `- Include networking, ingress, HPA configurations`,
          prompt
        ].join('\n')
      );

      const validation = validateTerraform(template);
      logger.info({ validation }, 'Gemini Terraform generation complete');

      return {
        template,
        metadata: {
          source: 'gemini'
        },
        validation
      };
    }
  } catch (error) {
    logger.error({ error }, 'Failed to generate Terraform template');
    throw error;
  }
}

