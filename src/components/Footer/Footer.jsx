import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Legal Pages */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 md:mb-0">
            <a
              href="/terms"
              className="text-sm text-gray-300 hover:text-white transition duration-300"
            >
              Terms of Service
            </a>
            <a
              href="/privacy-policy"
              className="text-sm text-gray-300 hover:text-white transition duration-300"
            >
              Privacy Policy
            </a>
            <a
              href="/cookie-policy"
              className="text-sm text-gray-300 hover:text-white transition duration-300"
            >
              Cookie Policy
            </a>
          </div>

          {/* Social Media Links */}
          <div className="flex space-x-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition duration-300"
            >
              <FaFacebook size={24} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition duration-300"
            >
              <FaTwitter size={24} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition duration-300"
            >
              <FaInstagram size={24} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition duration-300"
            >
              <FaLinkedin size={24} />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition duration-300"
            >
              <FaGithub size={24} />
            </a>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Finxbox. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
