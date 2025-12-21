const CookiePolicy = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      {/* Introduction */}
      <section className="space-y-4 mb-8">
        <p>
          This Cookie Policy explains how <strong>Finxbox</strong> uses cookies
          and similar technologies when you visit our website.
        </p>
        <p>
          Finxbox is designed with privacy as a core principle. We do not use
          cookies to collect personal data, track users, or perform behavioral
          analytics.
        </p>
      </section>

      {/* What Are Cookies */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">1. What Are Cookies?</h2>
        <p>
          Cookies are small text files stored on your device by a website.
          They are commonly used to ensure websites function correctly, improve
          performance, or remember user preferences.
        </p>
      </section>

      {/* Cookies Used */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">2. Cookies Used by Finxbox</h2>
        <p>
          Finxbox does <strong>not</strong> use cookies for tracking, profiling,
          analytics, or advertising.
        </p>
        <p>
          We do not use:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Analytics cookies (e.g., Google Analytics)</li>
          <li>Advertising or marketing cookies</li>
          <li>Behavioral or profiling cookies</li>
          <li>Session replay or fingerprinting technologies</li>
        </ul>
      </section>

      {/* Essential Cookies */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          3. Essential / Technical Cookies
        </h2>
        <p>
          Finxbox itself does not set any cookies.
        </p>
        <p>
          However, our hosting or infrastructure providers may use strictly
          necessary technical cookies for purposes such as:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Website security</li>
          <li>Load balancing</li>
          <li>Preventing abuse or attacks</li>
        </ul>
        <p className="text-sm text-gray-600">
          These cookies do not identify users personally and are required for
          the website to function properly.
        </p>
      </section>

      {/* Third Party Cookies */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">4. Third-Party Cookies</h2>
        <p>
          Finxbox does not intentionally place third-party cookies on your
          device.
        </p>
        <p>
          If you click on external links or embedded content, third-party
          websites may set their own cookies. These cookies are governed by the
          respective third party’s cookie and privacy policies.
        </p>
      </section>

      {/* Advertising */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          5. Advertising & Cookies (Future Use)
        </h2>
        <p>
          If Finxbox displays advertisements in the future, third-party ad
          providers may use cookies or similar technologies in accordance with
          their own privacy policies.
        </p>
        <p>
          Finxbox will not share personal data with advertisers, as we do not
          collect any.
        </p>
      </section>

      {/* User Control */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          6. How You Can Control Cookies
        </h2>
        <p>
          You can control or delete cookies through your browser settings.
          Most browsers allow you to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>View stored cookies</li>
          <li>Delete existing cookies</li>
          <li>Block cookies entirely</li>
        </ul>
        <p>
          Please note that blocking essential cookies may impact website
          functionality.
        </p>
      </section>

      {/* Legal Basis */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">7. Legal Compliance</h2>
        <p>
          This Cookie Policy is aligned with:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>General Data Protection Regulation (GDPR)</li>
          <li>Information Technology Act, 2000 (India)</li>
        </ul>
        <p>
          As Finxbox does not use non-essential cookies, explicit cookie consent
          is not required.
        </p>
      </section>

      {/* Updates */}
      <section className="space-y-3 mb-8">
        <h2 className="text-xl font-semibold">
          8. Updates to This Cookie Policy
        </h2>
        <p>
          We may update this Cookie Policy from time to time to reflect legal,
          technical, or operational changes. Updates will be posted on this
          page with a revised date.
        </p>
      </section>

      {/* Contact */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">9. Contact Us</h2>
        <p>
          If you have questions about this Cookie Policy, you can contact us at:
        </p>
        <p>
          <strong>Email:</strong> info.finxbox@gmail.com
        </p>
      </section>
    </div>
  );
};

export default CookiePolicy;
