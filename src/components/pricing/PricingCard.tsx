"use client";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  notIncluded: string[];
  popular?: boolean;
  buttonText: string;
  buttonVariant: "primary" | "secondary";
}

export default function PricingCard({
  name,
  price,
  period,
  description,
  features,
  notIncluded,
  popular = false,
  buttonText,
  buttonVariant,
}: PricingCardProps) {
  return (
    <div
      className={`relative rounded-2xl border p-8 ${
        popular
          ? "border-blue-500 bg-slate-800/80 scale-105"
          : "border-slate-700 bg-slate-800/50"
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-slate-200 mb-2">{name}</h3>
        <p className="text-sm text-slate-400 mb-4">{description}</p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-4xl font-bold text-slate-100">{price}</span>
          <span className="text-slate-400">/{period}</span>
        </div>
      </div>
      <button
        className={`w-full rounded-lg px-6 py-3 font-semibold transition-colors mb-6 ${
          buttonVariant === "primary"
            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
            : "bg-slate-700 text-slate-200 hover:bg-slate-600"
        }`}
      >
        {buttonText}
      </button>
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-3">What's Included:</h4>
          <ul className="space-y-2">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        {notIncluded.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Not Included:</h4>
            <ul className="space-y-2">
              {notIncluded.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-500">
                  <span className="text-slate-600 mt-0.5">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

