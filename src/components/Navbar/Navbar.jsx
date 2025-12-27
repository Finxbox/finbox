import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";
import { ChevronDown } from "lucide-react";
import { FaBars, FaTimes } from "react-icons/fa";

import { supabase } from "../../lib/supabase";

const Navbar = () => {
  const { openSignIn } = useClerk();
  const { user, isSignedIn, isLoaded } = useUser();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);

  const toolsTimeout = useRef(null);
  const learnTimeout = useRef(null);

  /* =====================================
     TEMP SUPABASE INSERT TEST (REMOVE LATER)
     ===================================== */
 useEffect(() => {
  if (!isLoaded || !isSignedIn || !user) return;

  const syncUser = async () => {
    await supabase.from("user_profiles").upsert({
      id: user.id,
      is_premium: false,
    });
  };

  syncUser();
}, [isLoaded, isSignedIn, user]);


  /* ---------- TOOL DROPDOWN HANDLERS ---------- */
  const openTools = () => {
    clearTimeout(toolsTimeout.current);
    setToolsOpen(true);
  };

  const closeTools = () => {
    toolsTimeout.current = setTimeout(() => {
      setToolsOpen(false);
    }, 120);
  };

  /* ---------- LEARN DROPDOWN HANDLERS ---------- */
  const openLearn = () => {
    clearTimeout(learnTimeout.current);
    setLearnOpen(true);
  };

  const closeLearn = () => {
    learnTimeout.current = setTimeout(() => {
      setLearnOpen(false);
    }, 120);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">

          {/* LOGO */}
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Finxbox"
              className="h-10 sm:h-11 md:h-12 lg:h-14 xl:h-16 w-auto object-contain"
            />
          </Link>

          {/* MOBILE TOGGLE */}
          <button
            className="lg:hidden text-gray-700"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>

          {/* NAVIGATION */}
          <nav
            className={`${
              mobileOpen ? "block" : "hidden"
            } lg:flex absolute lg:static top-full left-0 w-full lg:w-auto bg-white lg:bg-transparent border-t lg:border-0`}
          >
            <ul className="flex flex-col lg:flex-row items-center gap-6 px-6 py-6 lg:p-0 text-sm font-semibold text-gray-800">

              <li>
                <Link to="/" className="hover:text-[#694F8E] transition">
                  Home
                </Link>
              </li>

              {/* TOOLS DROPDOWN */}
              <li
                className="relative"
                onMouseEnter={openTools}
                onMouseLeave={closeTools}
              >
                <button className="flex items-center gap-1 hover:text-[#694F8E] transition">
                  Tools
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      toolsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  onMouseEnter={openTools}
                  onMouseLeave={closeTools}
                  className={`absolute top-full left-0 mt-3 w-64 rounded-xl bg-white border border-gray-200 shadow-xl overflow-hidden transition-all duration-200 ${
                    toolsOpen
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 translate-y-2 pointer-events-none"
                  }`}
                >
                  <Link to="/financial-statement-generator" className="block px-5 py-3 hover:bg-gray-50">
                    Financial Statement Generator
                  </Link>
                  <Link to="/portfolio-calculator" className="block px-5 py-3 hover:bg-gray-50">
                    Portfolio Calculator
                  </Link>
                  <Link to="/position-size-calculator" className="block px-5 py-3 hover:bg-gray-50">
                    Position Size Calculator
                  </Link>
                </div>
              </li>

              {/* LEARN DROPDOWN */}
              <li
                className="relative"
                onMouseEnter={openLearn}
                onMouseLeave={closeLearn}
              >
                <button className="flex items-center gap-1 hover:text-[#694F8E] transition">
                  Learn
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      learnOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  onMouseEnter={openLearn}
                  onMouseLeave={closeLearn}
                  className={`absolute top-full left-0 mt-3 w-56 rounded-xl bg-white border border-gray-200 shadow-xl overflow-hidden transition-all duration-200 ${
                    learnOpen
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 translate-y-2 pointer-events-none"
                  }`}
                >
                  <Link to="/course" className="block px-5 py-3 hover:bg-gray-50">
                    Courses
                  </Link>
                  <Link to="/store" className="block px-5 py-3 hover:bg-gray-50">
                    Books
                  </Link>
                </div>
              </li>

              <li>
                <a
                  href="https://finxbox.blogspot.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#694F8E] transition"
                >
                  Blog
                </a>
              </li>

              <li>
                {user ? (
                  <UserButton />
                ) : (
                  <button
                    onClick={() => openSignIn()}
                    className="px-6 py-2 rounded-xl bg-[#694F8E] text-white font-medium shadow hover:scale-[1.03] hover:bg-[#563C70] transition"
                  >
                    Login
                  </button>
                )}
              </li>

            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
