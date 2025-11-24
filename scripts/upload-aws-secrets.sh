#!/usr/bin/env bash
set -euo pipefail

# Uploads key=value pairs from a dotenv file into AWS Secrets Manager as individual secrets.
# Usage: ./scripts/upload-aws-secrets.sh path/to/.env my-app-prefix region-name

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <env-file> <secret-prefix> <aws-region>"
  exit 1
fi

ENV_FILE="$1"
SECRET_PREFIX="$2"
AWS_REGION="$3"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file not found: $ENV_FILE"
  exit 1
fi

while IFS='=' read -r key value; do
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  SECRET_NAME="${SECRET_PREFIX}/${key}"
  aws secretsmanager create-secret \
    --name "$SECRET_NAME" \
    --secret-string "$value" \
    --region "$AWS_REGION" >/dev/null 2>&1 || \
  aws secretsmanager put-secret-value \
    --secret-id "$SECRET_NAME" \
    --secret-string "$value" \
    --region "$AWS_REGION" >/dev/null
  echo "Synced $SECRET_NAME"
done < "$ENV_FILE"

echo "All env values uploaded to AWS Secrets Manager."

