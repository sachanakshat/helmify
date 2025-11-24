"use client";

import PageLayout from "@/components/layout/PageLayout";
import PricingCard from "@/components/pricing/PricingCard";

export default function PricingPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-20">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include our core features with flexible
            payment options.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-3 mb-16">
          <PricingCard
            name="Starter"
            price="$29"
            period="month"
            description="Perfect for individual developers and small projects"
            features={[
              "Up to 5 microservices",
              "Terraform & Helm chart generation",
              "Basic CI/CD pipeline templates",
              "Community support",
              "File explorer & code viewer",
              "ZIP downloads",
            ]}
            notIncluded={[
              "Advanced AI generation (Gemini)",
              "Priority support",
              "Custom integrations",
              "Team collaboration",
            ]}
            buttonText="Get Started"
            buttonVariant="secondary"
          />
          <PricingCard
            name="Professional"
            price="$99"
            period="month"
            description="Ideal for growing teams and production deployments"
            popular
            features={[
              "Unlimited microservices",
              "All Starter features",
              "Gemini AI-powered generation",
              "Priority email support",
              "Advanced pipeline customization",
              "Minikube playground access",
              "Team workspace (up to 10 members)",
              "Export to multiple cloud providers",
            ]}
            notIncluded={[
              "Dedicated support",
              "Custom SLA",
              "On-premise deployment",
            ]}
            buttonText="Start Free Trial"
            buttonVariant="primary"
          />
          <PricingCard
            name="Enterprise"
            price="Custom"
            period=""
            description="For large organizations with advanced requirements"
            features={[
              "Everything in Professional",
              "Unlimited team members",
              "Dedicated account manager",
              "Custom SLA & support",
              "On-premise deployment option",
              "SSO & advanced security",
              "Custom integrations & APIs",
              "Training & onboarding",
            ]}
            notIncluded={[]}
            buttonText="Contact Sales"
            buttonVariant="secondary"
          />
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/50 p-8 mb-16">
          <h2 className="text-2xl font-semibold text-slate-200 mb-4">Flexible Payment Options</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-slate-300 mb-2">Monthly Billing</h3>
              <p className="text-slate-400 text-sm">
                Pay monthly with no long-term commitment. Cancel anytime.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-300 mb-2">Annual Billing</h3>
              <p className="text-slate-400 text-sm">
                Save up to 20% with annual plans. Best value for long-term users.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-300 mb-2">Enterprise Contracts</h3>
              <p className="text-slate-400 text-sm">
                Custom pricing and payment terms for Enterprise customers.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-slate-300 mb-2">Free Trial</h3>
              <p className="text-slate-400 text-sm">
                Try Professional plan free for 14 days. No credit card required.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-slate-400 mb-4">Questions about pricing?</p>
          <a
            href="mailto:sales@helmify.com"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Contact our sales team →
          </a>
        </div>
      </div>
    </PageLayout>
  );
}

