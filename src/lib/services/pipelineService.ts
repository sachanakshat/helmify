import { buildPresetPipeline } from '../presets/pipelines';
import { generateTemplate } from '../gemini';
import { PipelineRequest, TemplateResponse } from '../types';
import { validatePipeline } from './validationService';
import { logger } from '../logger';

export async function createPipelineTemplate(
  request: PipelineRequest
): Promise<TemplateResponse> {
  const prompt = request.customPrompt ?? '';
  const template = request.preferPreset
    ? buildPresetPipeline(request)
    : await generateTemplate(
        [
          'Generate CI pipeline with infra + helm deploy steps.',
          `cloud:${request.cloud}`,
          `repo:${request.repoUrl}`,
          `branch:${request.branch}`,
          `ci:${request.ciProvider}`,
          prompt
        ].join(' ')
      );

  const validation = validatePipeline(template);
  logger.info({ validation }, 'Pipeline template validation result');

  return {
    template,
    metadata: {
      source: request.preferPreset ? 'preset' : 'gemini'
    },
    validation
  };
}

