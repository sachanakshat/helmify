import { MicroserviceConfig } from '../types';
import { logger } from '../logger';

export interface HelmChart {
  name: string;
  files: Record<string, string>;
}

export function generateHelmChart(service: MicroserviceConfig): HelmChart {
  const chartName = service.helmChartName || service.name;
  
  const chartYaml = generateChartYaml(chartName, service);
  const valuesYaml = generateValuesYaml(service);
  const deploymentYaml = generateDeploymentYaml(service);
  const serviceYaml = generateServiceYaml(service);
  const ingressYaml = service.ingress?.enabled ? generateIngressYaml(service) : null;
  const hpaYaml = service.hpa?.enabled ? generateHPAYaml(service) : null;
  const configMapYaml = service.configMap ? generateConfigMapYaml(service) : null;
  const secretYaml = service.secret ? generateSecretYaml(service) : null;

  const helpersTpl = generateHelpersTpl(service.name);

  const files: Record<string, string> = {
    'Chart.yaml': chartYaml,
    'values.yaml': valuesYaml,
    'templates/_helpers.tpl': helpersTpl,
    'templates/deployment.yaml': deploymentYaml,
    'templates/service.yaml': serviceYaml,
  };

  if (ingressYaml) files['templates/ingress.yaml'] = ingressYaml;
  if (hpaYaml) files['templates/hpa.yaml'] = hpaYaml;
  if (configMapYaml) files['templates/configmap.yaml'] = configMapYaml;
  if (secretYaml) files['templates/secret.yaml'] = secretYaml;

  logger.info({ chartName, files: Object.keys(files) }, 'Generated Helm chart');

  return { name: chartName, files };
}

function generateChartYaml(name: string, service: MicroserviceConfig): string {
  return `apiVersion: v2
name: ${name}
description: Helm chart for ${service.name} microservice
type: application
version: 0.1.0
appVersion: "${service.imageTag || '1.0.0'}"
`;
}

function generateValuesYaml(service: MicroserviceConfig): string {
  const imageRepo = service.imageRepository || `registry.example.com/${service.name}`;
  const imageTag = service.imageTag || 'latest';
  
  const resources = service.resources || {
    requests: { cpu: '100m', memory: '128Mi' },
    limits: { cpu: '500m', memory: '512Mi' }
  };

  const pullSecret = service.pullSecretName ? `
imagePullSecrets:
  - name: ${service.pullSecretName}` : '';

  const hpa = service.hpa?.enabled ? `
autoscaling:
  enabled: ${service.hpa.enabled}
  minReplicas: ${service.hpa.minReplicas}
  maxReplicas: ${service.hpa.maxReplicas}
  targetCPUUtilizationPercentage: ${service.hpa.targetCPU}
  ${service.hpa.targetMemory ? `targetMemoryUtilizationPercentage: ${service.hpa.targetMemory}` : ''}` : '';

  const ingress = service.ingress?.enabled ? `
ingress:
  enabled: true
  annotations: {}
  hostname: ${service.ingress.hostname}
  path: ${service.ingress.path}
  tls:
    enabled: ${service.ingress.tlsEnabled}
    ${service.ingress.tlsSecretName ? `secretName: ${service.ingress.tlsSecretName}` : ''}` : '';

  const secrets = service.secret ? `
secrets:
${Object.entries(service.secret.values)
  .map(([key, value]) => `  ${key}: "${value}"`)
  .join('\n')}` : '';

  return `replicaCount: 1

image:
  repository: ${imageRepo}
  pullPolicy: IfNotPresent
  tag: "${imageTag}"${pullSecret}

service:
  type: ClusterIP
  port: 80
  targetPort: 8080

resources:
  requests:
    cpu: ${resources.requests.cpu}
    memory: ${resources.requests.memory}
  limits:
    cpu: ${resources.limits.cpu}
    memory: ${resources.limits.memory}${hpa}${ingress}${secrets}

nodeSelector: {}

tolerations: []

affinity: {}
`;
}

function generateDeploymentYaml(service: MicroserviceConfig): string {
  const pullSecret = service.pullSecretName ? `
      imagePullSecrets:
        - name: ${service.pullSecretName}` : '';
  
  const configMapRef = service.configMap ? `
        - configMapRef:
            name: {{ include "${service.name}.fullname" . }}-configmap` : '';
  
  const secretRef = service.secret ? `
        - secretRef:
            name: {{ include "${service.name}.fullname" . }}-secret` : '';

  const envVars = service.configMap || service.secret ? `
          env:` : '';
  
  const envFrom = (configMapRef || secretRef) ? `${envVars}${configMapRef}${secretRef}` : '';

  return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "${service.name}.fullname" . }}
  labels:
    {{- include "${service.name}.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "${service.name}.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "${service.name}.selectorLabels" . | nindent 8 }}
    spec:${pullSecret}
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .Values.service.targetPort }}
              protocol: TCP${envFrom}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 5
`;
}

function generateServiceYaml(service: MicroserviceConfig): string {
  return `apiVersion: v1
kind: Service
metadata:
  name: {{ include "${service.name}.fullname" . }}
  labels:
    {{- include "${service.name}.labels" . | nindent 4 }}
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: {{ .Values.service.targetPort }}
      protocol: TCP
      name: http
  selector:
    {{- include "${service.name}.selectorLabels" . | nindent 4 }}
`;
}

function generateIngressYaml(service: MicroserviceConfig): string {
  if (!service.ingress) return '';
  
  const tlsBlock = service.ingress.tlsEnabled && service.ingress.tlsSecretName ? `
  tls:
    - hosts:
        - ${service.ingress.hostname}
      secretName: ${service.ingress.tlsSecretName}` : '';

  return `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "${service.name}.fullname" . }}
  labels:
    {{- include "${service.name}.labels" . | nindent 4 }}
  {{- with .Values.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:${tlsBlock}
  rules:
    - host: ${service.ingress.hostname}
      http:
        paths:
          - path: ${service.ingress.path}
            pathType: Prefix
            backend:
              service:
                name: {{ include "${service.name}.fullname" . }}
                port:
                  number: {{ .Values.service.port }}
`;
}

function generateHPAYaml(service: MicroserviceConfig): string {
  if (!service.hpa) return '';
  
  const memoryMetric = service.hpa.targetMemory ? `
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: ${service.hpa.targetMemory}` : '';

  return `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ include "${service.name}.fullname" . }}
  labels:
    {{- include "${service.name}.labels" . | nindent 4 }}
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: {{ include "${service.name}.fullname" . }}
  minReplicas: {{ .Values.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.autoscaling.maxReplicas }}
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: {{ .Values.autoscaling.targetCPUUtilizationPercentage }}${memoryMetric}
`;
}

function generateConfigMapYaml(service: MicroserviceConfig): string {
  if (!service.configMap) return '';
  
  const data = Object.entries(service.configMap.data)
    .map(([key, value]) => `    ${key}: ${JSON.stringify(value)}`)
    .join('\n');

  return `apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "${service.name}.fullname" . }}-configmap
  labels:
    {{- include "${service.name}.labels" . | nindent 4 }}
data:
${data}
`;
}

function generateSecretYaml(service: MicroserviceConfig): string {
  if (!service.secret) return '';
  
  const data = Object.entries(service.secret.values)
    .map(([key, value]) => `    ${key}: {{ .Values.secrets.${key} | b64enc }}`)
    .join('\n');

  return `apiVersion: v1
kind: Secret
metadata:
  name: {{ include "${service.name}.fullname" . }}-secret
  labels:
    {{- include "${service.name}.labels" . | nindent 4 }}
type: Opaque
data:
${data}
`;
}

function generateHelpersTpl(serviceName: string): string {
  return `{{/*
Expand the name of the chart.
*/}}
{{- define "${serviceName}.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "${serviceName}.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "${serviceName}.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "${serviceName}.labels" -}}
helm.sh/chart: {{ include "${serviceName}.chart" . }}
{{ include "${serviceName}.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "${serviceName}.selectorLabels" -}}
app.kubernetes.io/name: {{ include "${serviceName}.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
`;
}

