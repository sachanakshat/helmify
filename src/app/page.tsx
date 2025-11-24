"use client";

import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <PageLayout>
        <div className="mx-auto max-w-7xl px-6">
          {/* Hero Section */}
          <section className="text-center py-20">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Deploy Faster, Deploy Smarter
          </h1>
            <p className="text-2xl md:text-3xl text-slate-400 mb-4 max-w-3xl mx-auto">
              Complete deployment automation for cloud-native applications
            </p>
            <p className="text-lg text-slate-500 mb-8 max-w-2xl mx-auto">
              Generate production-ready Terraform, Helm charts, and CI/CD pipelines in minutes.
              No more manual configuration, no more deployment headaches.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/iac"
                className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Get Started Free
              </Link>
              <Link
                href="/pricing"
                className="rounded-lg border border-slate-600 bg-slate-800/50 px-8 py-4 text-slate-200 font-semibold hover:bg-slate-800 transition-all"
              >
                View Pricing
              </Link>
            </div>
          </section>

          {/* Features Grid */}
          <section className="py-20">
            <h2 className="text-4xl font-bold text-slate-200 text-center mb-12">
              Everything You Need to Deploy
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Link
                href="/iac"
                className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm hover:bg-slate-800 transition-all hover:border-blue-500 group"
              >
                <div className="text-4xl mb-4">🏗️</div>
                <h3 className="text-xl font-semibold text-slate-200 mb-2 group-hover:text-blue-400 transition-colors">
                  Infrastructure as Code
                </h3>
                <p className="text-slate-400">
                  Generate industry-ready Terraform modules and Helm charts with per-microservice
                  configuration. Deploy to AWS or Azure with a single click.
                </p>
              </Link>

              <Link
                href="/pipelines"
                className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm hover:bg-slate-800 transition-all hover:border-emerald-500 group"
              >
                <div className="text-4xl mb-4">⚙️</div>
                <h3 className="text-xl font-semibold text-slate-200 mb-2 group-hover:text-emerald-400 transition-colors">
                  CI/CD Pipelines
                </h3>
                <p className="text-slate-400">
                  Automate deployments with OIDC and Service Principal authentication. Support for
                  GitHub, Azure DevOps, and GitLab.
                </p>
              </Link>

              <Link
                href="/secrets"
                className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm hover:bg-slate-800 transition-all hover:border-purple-500 group"
              >
                <div className="text-4xl mb-4">🔐</div>
                <h3 className="text-xl font-semibold text-slate-200 mb-2 group-hover:text-purple-400 transition-colors">
                  Secrets Management
                </h3>
                <p className="text-slate-400">
                  Secure secret handling with validation and cloud integration. Never commit secrets
                  to Git again.
                </p>
              </Link>
            </div>
          </section>

          {/* Key Features */}
          <section className="py-20">
            <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-12 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-slate-200 mb-8 text-center">
                Why Choose Helmify?
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">⚡</div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200 mb-2">
                        Lightning Fast
                      </h3>
                      <p className="text-slate-400">
                        Generate complete infrastructure in minutes, not days. No more copying
                        templates or writing boilerplate code.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200 mb-2">
                        Production Ready
                      </h3>
                      <p className="text-slate-400">
                        Industry-standard Terraform modules and Helm charts with all best practices
                        built-in. Deploy with confidence.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">🔧</div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200 mb-2">
                        Fully Customizable
                      </h3>
                      <p className="text-slate-400">
                        Per-microservice configuration for ConfigMaps, Secrets, Ingress, HPA, and
                        resource limits. Full control over your deployment.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">☁️</div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200 mb-2">
                        Multi-Cloud
                      </h3>
                      <p className="text-slate-400">
                        Support for AWS and Azure with proper cloud-specific configurations. Switch
                        clouds without rewriting your infrastructure.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">🤖</div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200 mb-2">
                        AI-Powered
                      </h3>
                      <p className="text-slate-400">
                        Optional Gemini AI integration for complex scenarios. Let AI handle the
                        heavy lifting while you focus on your application.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">📦</div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200 mb-2">
                        One-Click Download
                      </h3>
                      <p className="text-slate-400">
                        Download your complete infrastructure as organized ZIP files. Ready to use
                        in your CI/CD pipeline immediately.
          </p>
        </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 text-center">
            <div className="rounded-2xl border border-slate-700 bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-12 backdrop-blur-sm">
              <h2 className="text-4xl font-bold text-slate-200 mb-4">
                Ready to Deploy Faster?
              </h2>
              <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                Start generating production-ready infrastructure today. No credit card required.
              </p>
              <Link
                href="/iac"
                className="inline-block rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Get Started Now
              </Link>
            </div>
          </section>
        </div>
      </PageLayout>
      <Footer />
    </>
  );
}
