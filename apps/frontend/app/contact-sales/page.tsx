'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';

export default function ContactSalesPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="bg-surface border border-border rounded-xl2 shadow-card p-10 max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold text-textPrimary mb-4">
            Thank You — Our Team Will Reach Out Shortly
          </h2>
          <p className="text-textSecondary mb-6">
            Our institutional risk intelligence team will review your request
            and contact you within 24 hours.
          </p>
          <p className="text-sm text-textTertiary">
            🔒 All data is confidential. We do not share client information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      {/* HERO */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-bold text-textPrimary mb-4">
          Speak With Our Institutional Risk Intelligence Team
        </h1>
        <p className="text-lg text-textSecondary max-w-3xl mx-auto">
          Discover how our AI-powered monitoring system helps institutions detect 
          de-pegging risk, liquidity stress, and reserve anomalies in real time.
        </p>
      </section>

      {/* VALUE SECTION */}
      <section className="max-w-5xl mx-auto px-6 mb-16">
        <div className="bg-surface border border-border rounded-xl2 shadow-card p-8">
          <h2 className="text-xl font-semibold text-textPrimary mb-6">
            What You’ll Get
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-textSecondary">
            <p>✔ Custom risk scoring models</p>
            <p>✔ Real-time de-peg alerts</p>
            <p>✔ API access & data feeds</p>
            <p>✔ Portfolio-level monitoring</p>
            <p>✔ Compliance & transparency tools</p>
          </div>
        </div>
      </section>

      {/* FORM SECTION */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="bg-surface border border-border rounded-xl2 shadow-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* BASIC INFO */}
            <div className="grid md:grid-cols-2 gap-6">
              <input required placeholder="Full Name *"
                className="input" />
              <input required type="email" placeholder="Work Email *"
                className="input" />
              <input required placeholder="Company Name *"
                className="input" />
              <input required placeholder="Job Title *"
                className="input" />
              <input placeholder="Company Website"
                className="input" />
              <input placeholder="Country"
                className="input" />
            </div>

            {/* ORGANIZATION TYPE */}
            <div>
              <label className="block mb-2 text-sm text-textSecondary">
                Organization Type
              </label>
              <select className="input">
                <option>Crypto Exchange</option>
                <option>Hedge Fund</option>
                <option>Asset Manager</option>
                <option>DeFi Protocol</option>
                <option>Fintech Platform</option>
                <option>Bank / Custodian</option>
                <option>Other</option>
              </select>
            </div>

            {/* INTEREST CHECKBOXES */}
            <div>
              <label className="block mb-3 text-sm text-textSecondary">
                What Are You Interested In?
              </label>
              <div className="grid md:grid-cols-2 gap-3 text-sm text-textSecondary">
                {[
                  "Stablecoin Risk Monitoring Dashboard",
                  "API Access",
                  "Custom Risk Scoring Models",
                  "Early Warning Alerts",
                  "Enterprise Integration",
                  "Pricing Information"
                ].map((item, i) => (
                  <label key={i} className="flex items-center gap-2">
                    <input type="checkbox" />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            {/* MONTHLY VOLUME */}
            <div>
              <label className="block mb-2 text-sm text-textSecondary">
                Monthly Stablecoin Volume
              </label>
              <select className="input">
                <option>&lt;$10M</option>
                <option>$10M – $100M</option>
                <option>$100M – $1B</option>
                <option>$1B+</option>
              </select>
            </div>

            {/* MESSAGE */}
            <div>
              <textarea
                rows={4}
                placeholder="Tell us about your risk monitoring needs…"
                className="input"
              />
            </div>

            {/* SUBMIT */}
            <div className="text-center pt-4">
              <Button variant="primary" size="lg">
                Speak With Risk Intelligence Team
              </Button>
              <p className="text-sm text-textTertiary mt-4">
                Trusted by risk teams monitoring billions in stablecoin exposure.
              </p>
              <p className="text-xs text-textTertiary mt-2">
                🔒 All data is confidential. We do not share client information.
              </p>
            </div>

          </form>
        </div>
      </section>

      {/* TRUST SECTION */}
      <section className="bg-gray-50 border-t border-border py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-textPrimary mb-8 text-center">
            Why Institutions Choose Us
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-textSecondary">
            <p>✔ AI-driven anomaly detection</p>
            <p>✔ On-chain + exchange data integration</p>
            <p>✔ 24/7 monitoring infrastructure</p>
            <p>✔ Scalable enterprise APIs</p>
            <p>✔ Institutional-grade security</p>
          </div>
        </div>
      </section>

      {/* WHAT HAPPENS NEXT */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-textPrimary mb-6">
          What Happens Next
        </h2>
        <div className="space-y-4 text-textSecondary">
          <p>1️⃣ Our team reviews your requirements</p>
          <p>2️⃣ We schedule a 30-min strategy call</p>
          <p>3️⃣ We provide tailored demo & pricing</p>
        </div>
      </section>

    </div>
  );
}
