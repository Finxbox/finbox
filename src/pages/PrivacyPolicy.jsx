import Seo from "../components/Seo";
const PrivacyPolicy = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-gray-800 leading-relaxed">
      <Seo title="Privacy Policy - Finxbox" description="Learn about our privacy policy." />
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      {/* Introduction */}
      <section className="space-y-4 mb-8">
        <p>
          Welcome to <strong>Finxbox</strong>. We respect your privacy and are
          committed to protecting the information shared by users while using
          our website and services.
        </p>
        <p>
          This Privacy Policy explains what information is collected, how it is
          used, and how we protect user data.
        </p>
      </section>

      {/* Scope */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">1. Scope of This Policy</h2>
        <p>
          This Privacy Policy applies to the Finxbox website, software tools,
          calculators, premium features, and downloadable reports offered
          through the platform.
        </p>
      </section>

      {/* Information Collected */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          2. Information We Collect
        </h2>
        <p>
          Finxbox collects limited information only to provide services and
          support:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Email address provided for customer support or communication</li>
          <li>Payment status and transaction reference from payment gateways</li>
        </ul>
        <p>
          Finxbox does <strong>not</strong> store card details, bank information,
          or sensitive payment credentials.
        </p>
<br />
         <strong>Analytics & Experience Improvement</strong>
      <br />
      We use Microsoft Clarity to understand how visitors interact with our
      website. This helps us improve user experience and website performance. By
      using this site, you agree that we and Microsoft may collect and use this
      data. 
      </section>

      {/* How Tools Work */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          3. How Our Tools Work
        </h2>
        <p>
          Most financial tools and calculators on Finxbox operate on the client
          side (within your browser).
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>User inputs are processed temporarily</li>
          <li>No financial data is permanently stored by Finxbox</li>
          <li>Data is cleared when the session ends</li>
        </ul>
      </section>

      {/* Payments */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">4. Payments & Security</h2>
        <p>
          Payments on Finxbox are processed securely through authorized
          third-party payment gateways such as PayU or Razorpay.
        </p>
        <p>
          Finxbox does not have access to or store users’ card numbers, CVV,
          banking details, or UPI credentials.
        </p>
      </section>

      {/* Cookies */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          5. Cookies & Tracking
        </h2>
        <p>
          Finxbox does not use cookies for advertising or tracking user behavior.
        </p>
        <p className="text-sm text-gray-600">
          Our hosting provider may use essential cookies strictly for security
          and performance purposes.
        </p>
      </section>

      {/* Third Parties */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">6. Third-Party Links</h2>
        <p>
          Finxbox may include links to third-party websites for reference or
          educational purposes. We are not responsible for their privacy
          practices.
        </p>
      </section>

      {/* Data Protection */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">7. Data Protection</h2>
        <p>
          We take reasonable security measures to protect user information from
          unauthorized access, misuse, or disclosure.
        </p>
      </section>

      {/* Children */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">8. Children’s Privacy</h2>
        <p>
          Finxbox does not knowingly collect personal information from children
          under the age of 13.
        </p>
      </section>

      {/* Legal */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">9. Legal Compliance</h2>
        <p>
          This Privacy Policy complies with the Information Technology Act, 2000
          and applicable Indian data protection laws.
        </p>
      </section>

      {/* Changes */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          10. Changes to This Policy
        </h2>
        <p>
          Finxbox may update this Privacy Policy from time to time. Updates will
          be reflected on this page.
        </p>
      </section>

      {/* Contact */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">11. Contact Information</h2>
        <p>
          For privacy-related queries, contact:
        </p>
        <p>
          <strong>Email:</strong> support@finxbox.com
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
