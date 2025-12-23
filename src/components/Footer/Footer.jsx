import {
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-[#FAFAFB]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">

        {/* TOP SECTION */}
        <div className="flex flex-col md:flex-row justify-between gap-10">

          {/* BRAND / DISCLAIMER */}
          <div className="max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900">
              Finxbox
            </h3>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              Structured financial education and trading tools designed to
              help you build clarity, discipline, and long-term confidence
              in the markets.
            </p>

            <p className="mt-4 text-xs text-gray-500">
              Educational content only. Market investments are subject to risk.
            </p>
          </div>

          {/* LINKS */}
          <div className="flex flex-col sm:flex-row gap-12">

            {/* LEGAL */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Legal
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="/terms-and-conditions"
                    className="text-gray-600 hover:text-gray-900 transition"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy-policy"
                    className="text-gray-600 hover:text-gray-900 transition"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/cookie-policy"
                    className="text-gray-600 hover:text-gray-900 transition"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* SOCIAL */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Follow Us
              </h4>
              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/finxbox_offical?igsh=bHV3eXVyZzVveHcy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition"
                >
                  <FaInstagram size={18} />
                </a>

                <a
                  href="https://youtube.com/@finxbox?si=9n9QYx1wlHPymrD9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition"
                >
                  <FaYoutube size={18} />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-8 border-t border-dashed border-gray-200" />

        {/* BOTTOM BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>
            © 2024 Finxbox. All rights reserved.
          </p>

          <p>
            Built with discipline & clarity.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
