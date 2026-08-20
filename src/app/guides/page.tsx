"use client";

import PageLayout from "@/components/layout/PageLayout";

export default function GuidesPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-6 py-10">
        <header className="mb-10">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Guides & Documentation
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Step-by-step guides to get you started with Helmify
          </p>
        </header>

        <div className="space-y-8">
          <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">
              Setting Up Minikube Playground
            </h2>
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-2">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-400 ml-4">
                  <li>Minikube installed and running</li>
                  <li>kubectl configured to use Minikube</li>
                  <li>Helm 3.x installed</li>
                  <li>Node.js 18+ (for the wrapper API)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-2">Step 1: Start Minikube</h3>
                <pre className="rounded-lg bg-slate-900 p-4 text-sm text-slate-300 font-mono overflow-x-auto">
                  <code>minikube start</code>
                </pre>
                <p className="text-sm text-slate-400 mt-2">
                  Verify Minikube is running: <code className="bg-slate-900 px-2 py-1 rounded">kubectl get nodes</code>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-2">
                  Step 2: Download and Start the Wrapper API
                </h3>
                <p className="text-slate-400 mb-2">
                  The wrapper API is a separate service that provides a safe interface between your
                  browser and Minikube. Download it from the provided package.
                </p>
                <pre className="rounded-lg bg-slate-900 p-4 text-sm text-slate-300 font-mono overflow-x-auto">
                  <code>{`# Extract the wrapper package
tar -xzf helmify-wrapper.tar.gz
cd helmify-wrapper

# Install dependencies
npm install

# Start the wrapper API
npm start`}</code>
                </pre>
                <p className="text-sm text-slate-400 mt-2">
                  The wrapper will start on <code className="bg-slate-900 px-2 py-1 rounded">http://localhost:8080</code>
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-2">
                  Step 3: Configure the Wrapper
                </h3>
                <p className="text-slate-400 mb-2">
                  The wrapper uses environment variables for configuration. Create a{" "}
                  <code className="bg-slate-900 px-2 py-1 rounded">.env</code> file:
                </p>
                <pre className="rounded-lg bg-slate-900 p-4 text-sm text-slate-300 font-mono overflow-x-auto">
                  <code>{`PORT=8080
MINIKUBE_PROFILE=minikube
LOG_LEVEL=info`}</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-2">Step 4: Use the Playground</h3>
                <p className="text-slate-400">
                  Once the wrapper is running, navigate to the{" "}
                  <a href="/playground" className="text-blue-400 hover:text-blue-300">
                    Playground page
                  </a>{" "}
                  in Helmify and start deploying your generated charts.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">
              Wrapper API Endpoints
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-2">POST /deploy</h3>
                <p className="text-slate-400 mb-2">Deploy Helm charts to Minikube</p>
                <pre className="rounded-lg bg-slate-900 p-4 text-sm text-slate-300 font-mono overflow-x-auto">
                  <code>{`{
  "charts": [
    {
      "name": "my-service",
      "files": { ... }
    }
  ]
}`}</code>
                </pre>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-2">GET /status</h3>
                <p className="text-slate-400 mb-2">Get current cluster status</p>
                <p className="text-sm text-slate-500">
                  Returns: Cluster health, node status, and deployment information
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-2">GET /resources</h3>
                <p className="text-slate-400 mb-2">
                  Get all Kubernetes resources in YAML format
                </p>
                <p className="text-sm text-slate-500">
                  Equivalent to: <code className="bg-slate-900 px-2 py-1 rounded">kubectl get all -o yaml</code>
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-8 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-slate-200 mb-4">Troubleshooting</h2>
            <div className="space-y-3 text-slate-400">
              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-2">
                  Wrapper API not connecting
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Verify the wrapper is running: <code className="bg-slate-900 px-2 py-1 rounded">curl http://localhost:8080/health</code></li>
                  <li>Check firewall settings</li>
                  <li>Ensure port 8080 is not in use by another service</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-slate-200 mb-2">
                  Minikube deployment fails
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Verify Minikube is running: <code className="bg-slate-900 px-2 py-1 rounded">minikube status</code></li>
                  <li>Check kubectl context: <code className="bg-slate-900 px-2 py-1 rounded">kubectl config current-context</code></li>
                  <li>Review wrapper API logs for detailed error messages</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}

