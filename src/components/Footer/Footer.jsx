import { FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 bg-[#FAFAFB]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">

        {/* TOP SECTION */}
        <div className="flex flex-col md:flex-row justify-between gap-10">

        {/* BOTTOM BAR – PAYU IMPORTANT */}
        <div className="text-sm text-gray-500 text-center sm:text-left">
          <address className="not-italic space-y-1">
            <p>
              © 2024 Finxbox
              </p>
            <p>
              Finxbox is a proprietor business.
              </p>
            <p>
              <strong>GSTIN:</strong> 33DIQPA6990G1ZZ 
              </p>
            <p>
              <strong>Registered Address:</strong>  
              3/23a nethaji 2nd street,ramapuram,chennai-600089,Tamil Nadu,India
            </p>
            <p>
              <strong>Email:</strong> info.finxbox@gmail.com</p>
            <p><strong>Phone:</strong> +91-7305492860</p>
            <p className="mt-2">
              Payments on Finxbox are for subscription-based access to premium
              software features and downloading reports.
            </p>
          </address>
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
                  <a href="/terms-and-conditions" className="text-gray-600 hover:text-gray-900 transition">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="/privacy-policy" className="text-gray-600 hover:text-gray-900 transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/cookie-policy" className="text-gray-600 hover:text-gray-900 transition">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="/contact-us" className="text-gray-600 hover:text-gray-900 transition">
                    Contact Us
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
                  href="https://www.instagram.com/finxbox_offical"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition"
                >
                  <FaInstagram size={18} />
                </a>

                <a
                  href="https://youtube.com/@finxbox"
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
      </div>
    </footer>
  );
};

export default Footer;
