const PrivacyPolicy = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      {/* Introduction */}
      <section className="space-y-4 mb-8">
        <p>
          Welcome to <strong>Finxbox</strong>. We are committed to protecting
          your privacy and being transparent about how our website operates.
          Finxbox provides logic-based financial tools and calculators that
          generate outputs such as income statements and financial summaries.
        </p>
        <p>
          This Privacy Policy explains what information we do and do not
          collect, how our tools work, and your rights as a user.
        </p>
      </section>

      {/* Scope */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">1. Scope of This Policy</h2>
        <p>
          This Privacy Policy applies to the Finxbox website and all tools,
          calculators, and utilities provided through it. It does not apply to
          third-party websites that may be linked from Finxbox.
        </p>
      </section>

      {/* Data Not Collected */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          2. Information We Do Not Collect
        </h2>
        <p>Finxbox does not collect, store, or process any personal data.</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>No names, email addresses, or phone numbers</li>
          <li>No financial or income data storage</li>
          <li>No login credentials (we do not offer accounts)</li>
          <li>No IP tracking or behavioral analytics</li>
          <li>No saved calculations or reports</li>
        </ul>
      </section>

      {/* How Tools Work */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          3. How Our Financial Tools Work
        </h2>
        <p>
          All tools on Finxbox operate entirely on the client side (within your
          browser).
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Inputs are processed locally in real time</li>
          <li>No data is sent to or stored on our servers</li>
          <li>
            Data is cleared automatically when you refresh or close the page
          </li>
        </ul>
      </section>

      {/* Data Retention */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">4. Data Storage & Retention</h2>
        <p>
          Since Finxbox does not collect any user data, there is no data
          retention, backup, or archival of user inputs or outputs.
        </p>
      </section>

      {/* Cookies */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          5. Cookies & Tracking Technologies
        </h2>
        <p>
          Finxbox does not use cookies, trackers, pixels, or analytics tools to
          monitor users.
        </p>
        <p className="text-sm text-gray-600">
          Note: Our hosting provider may use essential technical cookies for
          performance or security. These do not contain personally identifiable
          information.
        </p>
      </section>

      {/* Third Parties */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">6. Third-Party Links</h2>
        <p>
          Finxbox may contain links to third-party websites for reference or
          educational purposes. We do not control and are not responsible for
          their content or privacy practices.
        </p>
      </section>

      {/* Ads */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          7. Advertising & Monetization
        </h2>
        <p>
          If advertisements are displayed in the future, Finxbox will not share
          user data with advertisers. Any third-party advertising services will
          operate under their own privacy policies.
        </p>
      </section>

      {/* Legal */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">8. Legal Compliance</h2>
        <p>
          This Privacy Policy is aligned with the Information Technology Act,
          2000 (India) and applicable data protection principles, including
          GDPR-related transparency requirements.
        </p>
      </section>

      {/* Children */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">9. Children’s Privacy</h2>
        <p>
          Finxbox does not knowingly collect information from children under the
          age of 13. As no personal data is collected, the platform may be used
          for educational purposes.
        </p>
      </section>

      {/* Disclaimer */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          10. Financial Disclaimer
        </h2>
        <p>
          All tools and outputs provided by Finxbox are for educational and
          informational purposes only and do not constitute financial advice.
        </p>
      </section>

      {/* Changes */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          11. Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. Any changes will
          be posted on this page with an updated revision date.
        </p>
      </section>

      {/* Contact */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">12. Contact Us</h2>
        <p>
          If you have questions regarding this Privacy Policy, you may contact
          us at:
        </p>
        <p>
          <strong>Email:</strong> info.finxbox@gmail.com
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
