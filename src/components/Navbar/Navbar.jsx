import { useState } from "react";
import { Link } from "react-router-dom";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";
import { FaBars, FaTimes, FaCalculator, FaBlog, FaStore } from "react-icons/fa";

const Navbar = () => {
  const { openSignIn } = useClerk();
  const { user } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="container mx-auto py-6 px-8">
      {/* Navbar container */}
      <div className="flex justify-between items-center">
        
        {/* Logo */}
       <div className="logo">
  <Link to="/">
    {/* Mobile logo (simplified) */}
    <img 
      src="logo sm.png" 
      alt="FinXBox" 
      className="w-24 h-auto block lg:hidden"
    />
    {/* Desktop logo (full) */}
    <img 
      src="logo.png" 
      alt="FinXBox" 
      className="w-40 h-auto hidden lg:block"
    />
  </Link>
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
                to="/financial-statement-generator"
                className="flex items-center gap-2 text-NavPurple font-bold text-sm hover:underline"
              >
                <FaCalculator />
                Financial Statement Generator
              </Link>
            </li>
            <li>
              <Link
                to="/portfolio-calculator"
                className="flex items-center gap-2 text-NavPurple font-bold text-sm hover:underline"
              >
                <FaCalculator />
                Portfolio Calculator
              </Link>
            </li>
            <li>
              <Link
                to="/position-size-calculator"
                className="flex items-center gap-2 text-NavPurple font-bold text-sm hover:underline"
              >
                <FaCalculator />
                Position Size Calculator
              </Link>
            </li>
            <li>
              <Link
                to="https://finxbox.blogspot.com/"
                className="flex items-center gap-2 text-NavPurple font-bold text-sm hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaBlog />
                Our Blog
              </Link>
            </li>
            <li>
              <Link
                to="/store"
                className="flex items-center gap-2 text-NavPurple font-bold text-sm hover:underline"
                rel="noopener noreferrer"
              >
                <FaStore />
                Visit Store
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

export default Navbar;