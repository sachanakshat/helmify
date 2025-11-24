import { z } from 'zod';
import { ValidationReport } from '../types';

const terraformSchema = z
  .string()
  .refine((value) => value.includes('terraform') && value.includes('provider'), {
    message: 'Template missing terraform/provider blocks'
  });

const pipelineSchema = z
  .string()
  .refine((value) => value.includes('deploy') || value.includes('Deploy'), {
    message: 'Pipeline template missing Deploy stage'
  });

export function validateTerraform(template: string): ValidationReport {
  const issues: string[] = [];
  terraformSchema.safeParse(template).error?.issues.forEach((issue) => {
    issues.push(issue.message);
  });
  return {
    isValid: issues.length === 0,
    issues,
    suggestedFixes:
      issues.length === 0 ? [] : ['Ensure terraform and provider blocks exist']
  };
}

export function validatePipeline(template: string): ValidationReport {
  const issues: string[] = [];
  pipelineSchema.safeParse(template).error?.issues.forEach((issue) => {
    issues.push(issue.message);
  });
  return {
    isValid: issues.length === 0,
    issues,
    suggestedFixes:
      issues.length === 0 ? [] : ['Add a deploy job/stage to the pipeline']
  };
}

