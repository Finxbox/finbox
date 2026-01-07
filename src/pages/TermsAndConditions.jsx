import React from "react";
import Seo from "../components/Seo";

const TermsAndConditionsPage = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-gray-800 leading-relaxed">
      <Seo title="Terms and Conditions - Finxbox" description="Learn about our terms and conditions." />
      <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>
      <TermsAndConditions />
    </div>
  );
};

function TermsAndConditions() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      {/* Introduction */}
      <section className="space-y-4 mb-8">
        <p>
          Welcome to <strong>Finxbox</strong>. These Terms and Conditions
          (“Terms”) govern your access to and use of the Finxbox website,
          tools, calculators, software features, and downloadable reports.
        </p>
        <p>
          By accessing or using Finxbox, you agree to be bound by these Terms.
          If you do not agree, please discontinue use of the website.
        </p>
      </section>

      {/* Eligibility */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">1. Eligibility</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>You are legally capable of entering into a binding agreement</li>
          <li>You are using the website for lawful purposes only</li>
        </ul>
      </section>

      {/* Nature of Services */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">2. Nature of Services</h2>
        <p>
          Finxbox provides logic-based financial tools, calculators, and
          informational outputs for educational and informational purposes only.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>No financial, legal, or investment advice</li>
          <li>Outputs must be independently verified</li>
          <li>Results may vary based on user inputs</li>
        </ul>
      </section>

      {/* Digital Products & Payments */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          3. Digital Products & Subscription Access
        </h2>
        <p>
          Finxbox offers subscription-based access to premium software features
          and downloadable financial reports.
        </p>
        <p className="font-medium">
          Payments on Finxbox are for subscription-based access to premium
          software features and downloading reports.
        </p>
        <p>
          Subscription access is valid only for the duration selected at the
          time of purchase and does not auto-renew.
        </p>
      </section>

      {/* No Financial Advice */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">4. No Financial Advice</h2>
        <p>
          Finxbox is not a registered financial advisor, broker, or investment
          intermediary.
        </p>
      </section>

      {/* No Guaranteed Returns */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">5. No Guaranteed Returns</h2>
        <p>
          Finxbox does not guarantee profits, returns, or financial outcomes.
        </p>
      </section>

      {/* User Responsibilities */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">6. User Responsibilities</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Accuracy of information you provide</li>
          <li>No misuse or disruption of the platform</li>
          <li>No reverse engineering or abuse</li>
        </ul>
      </section>

      {/* Payment Processing */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">7. Payment Processing</h2>
        <p>
          Payments are processed securely via authorized third-party payment
          gateways. Finxbox does not store card or banking details.
        </p>
      </section>

      {/* Refund Policy */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          8. Refund & Cancellation Policy
        </h2>
        <p>
          Due to the digital nature of services and instant access, all payments
          are non-refundable and non-cancellable.
        </p>
      </section>

      {/* Intellectual Property */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">9. Intellectual Property</h2>
        <p>
          All content, tools, and branding on Finxbox are the intellectual
          property of the business.
        </p>
      </section>

      {/* Limitation of Liability */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">10. Limitation of Liability</h2>
        <p>
          Finxbox shall not be liable for losses arising from the use of the
          platform or its outputs.
        </p>
      </section>

      {/* Governing Law */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">11. Governing Law</h2>
        <p>These Terms are governed by the laws of India.</p>
      </section>

      {/* Changes */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">12. Changes to These Terms</h2>
        <p>
          Finxbox may update these Terms at any time. Continued use constitutes
          acceptance of the revised Terms.
        </p>
      </section>

      {/* Contact */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">13. Contact Information</h2>
        <p>
          <strong>Email:</strong> support@finxbox.com
        </p>
      </section>
    </div>
  );
}

export default TermsAndConditions;
