const ContactUs = () => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="text-gray-600 mb-10">
        We’re here to help. If you have any questions, concerns, or feedback,
        feel free to reach out to us using the details below.
      </p>

      {/* Contact Information */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Business Name</h2>
            <p>Finxbox</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-1">Email Support</h2>
            <p>
              <a
                href="mailto:info.finxbox@gmail.com"
                className="text-indigo-600 hover:underline"
              >
                info.finxbox@gmail.com
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-1">Business Hours</h2>
            <p>Monday – Friday</p>
            <p>10:00 AM – 6:00 PM (IST)</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-1">Service Type</h2>
            <p>
              Digital financial tools, calculators, and educational resources.
            </p>
          </div>
        </div>

        {/* Disclaimer Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">
            Important Notice
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Finxbox provides educational and logic-based tools only.
            We do not offer investment advice, guaranteed returns,
            or personalized financial recommendations.
          </p>
          <p className="text-sm text-gray-600 mt-3">
            For payment-related queries, refunds (if applicable),
            or subscription support, please contact us via email.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
