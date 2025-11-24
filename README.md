## Helmify Copilot

End-to-end deployment automation cockpit:

- Compose Terraform stacks for multi-service applications with curated presets or Gemini-generated templates.
- Create CI/CD pipelines for AWS (OIDC) or Azure (Service Principals) targets.
- Collect ConfigMaps and secrets from `.env` dumps and ship them to cloud Secret Stores via dedicated scripts—no secrets touch git.

## Architecture

| Layer | Components | Notes |
| --- | --- | --- |
| Frontend | `src/app/page.tsx` | A single-screen control plane with a-la-carte inputs for services, config maps, pipelines, and secrets. |
| API layer | `src/app/api/*` | Server actions that orchestrate template creation, validation, and secret hydration. |
| Template services | `src/lib/services/*` | Reusable generators + validators (preset vs Gemini). |
| Presets | `src/lib/presets/*` | Opinionated Terraform and pipeline blueprints. |
| Logging | `src/lib/logger.ts` | `pino` logger shared by API routes. |
| Scripts | `scripts/upload-aws-secrets.sh`, `scripts/upload-azure-secrets.sh` | Web-triggered instructions to sync `.env` values to AWS Secrets Manager or Azure Key Vault. |

## Getting Started

```bash
cd web
cp env.example .env.local   # provide GEMINI_API_KEY + LOG_LEVEL
npm install
npm run dev
```

Visit `http://localhost:3000`.

### Environment variables

| Name | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Optional (preset mode works without it) | API key for Google Gemini to generate Terraform/pipeline templates when presets aren't enough. |
| `LOG_LEVEL` | Optional | Overrides `info/debug` defaults. |

### Secret hygiene

- Paste `.env` contents into the **Secret staging** panel.
- Use the helper scripts to sync values to the right vault:

```bash
./scripts/upload-aws-secrets.sh path/to/.env my-app us-east-1
./scripts/upload-azure-secrets.sh path/to/.env my-keyvault
```

These scripts rely on your already-authenticated AWS CLI (`aws configure sso` + OIDC role) or Azure CLI (`az login` with the desired Service Principal).

## Extending the platform

- **Add more presets** under `src/lib/presets/` (e.g., GKE, AKS modules, GitLab pipelines).
- **Enhance validation** via richer `zod` schemas in `validationService`.
- **Integrate deployment hooks** by adding API routes that talk to your preferred orchestrators (Argo, Flux, Spacelift, etc.).
- **Microservice metadata import**: drop a discovery endpoint that loads repo metadata and updates the React state.

## Logging & observability

`pino` streams structured logs; in development we pretty-print, and in production you get JSON ready for ingestion. Plug this into OpenTelemetry by wrapping API routes with the same logger instance.
