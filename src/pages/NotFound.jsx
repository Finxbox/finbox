import { Link } from "react-router-dom";
import Seo from "../components/Seo";

const NotFound = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-20">
    <Seo
      title="Page not found – Finxbox"
      description="The page you are looking for does not exist."
      robots="noindex, follow"
    />
    <p className="text-sm font-semibold tracking-widest text-[#694F8E] uppercase">404</p>
    <h1 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">Page not found</h1>
    <p className="mt-3 text-gray-600 max-w-md">
      The page you are looking for does not exist or has moved.
    </p>
    <div className="mt-8 flex gap-3 flex-wrap justify-center">
      <Link to="/" className="px-6 py-3 rounded-xl bg-[#694F8E] text-white font-semibold hover:opacity-90 transition">
        Go to home
      </Link>
      <Link to="/course" className="px-6 py-3 rounded-xl border border-gray-300 text-gray-800 hover:bg-gray-50 transition">
        Browse courses
      </Link>
    </div>
  </div>
);

export default NotFound;
