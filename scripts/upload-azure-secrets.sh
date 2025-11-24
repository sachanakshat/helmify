#!/usr/bin/env bash
set -euo pipefail

# Uploads key=value pairs from a dotenv file into Azure Key Vault as individual secrets.
# Usage: ./scripts/upload-azure-secrets.sh path/to/.env my-keyvault-name

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <env-file> <keyvault-name>"
  exit 1
fi

ENV_FILE="$1"
KEYVAULT_NAME="$2"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file not found: $ENV_FILE"
  exit 1
fi

while IFS='=' read -r key value; do
  [[ -z "$key" || "$key" =~ ^# ]] && continue
  az keyvault secret set \
    --vault-name "$KEYVAULT_NAME" \
    --name "$key" \
    --value "$value" >/dev/null
  echo "Synced $key"
done < "$ENV_FILE"

echo "All env values uploaded to Azure Key Vault."

