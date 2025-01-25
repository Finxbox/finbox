import { useState } from "react";
import { Link } from "react-router-dom";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react"; // Import Clerk hooks
import { FaBars, FaTimes, FaHome } from "react-icons/fa";

const StoreNavbar = () => {
  const { openSignIn } = useClerk(); // Hook to open the sign-in modal
  const { user } = useUser(); // Hook to get the current user
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="store-navbar container mx-auto py-6 px-8">
      {/* Navbar container */}
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="logo text-NavPurple text-2xl font-bold">
          <Link to="/store">Finxbox Store</Link>
        </div>

        {/* Hamburger Menu (Mobile) */}
        <button
          className="lg:hidden text-NavPurple text-2xl focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Menu */}
        <div
          className={`menu w-full lg:w-auto flex flex-col lg:flex-row justify-center items-center lg:justify-end lg:static absolute bg-white lg:bg-transparent lg:shadow-none shadow-lg lg:py-0 py-6 lg:px-0 px-8 lg:gap-10 gap-6 ${
            isMenuOpen ? "top-16 left-0 right-0" : "hidden lg:flex"
          }`}
        >
          <ul className="flex flex-col lg:flex-row justify-center items-center gap-6 lg:gap-10 w-full">
            <li>
              <Link
                to="/"
                className="flex items-center gap-2 text-NavPurple font-bold text-md hover:underline"
              >
                <FaHome />
                Our Tools
              </Link>
            </li>
            <li>
              {user ? (
                <div className="flex justify-center items-center gap-6">
                  Hi, {user.firstName} {user.lastName ? user.lastName : ""}
                  <UserButton />
                </div>
              ) : (
                <button
                  onClick={() => openSignIn()}
                  className="px-5 py-2 font-bold text-NavPurple bg-white border-2 border-NavPurple rounded-2xl shadow-md hover:bg-NavPurple hover:text-white hover:border-white hover:shadow-lg transition duration-300"
                >
                  Login
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StoreNavbar;
