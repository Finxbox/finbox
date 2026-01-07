import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import PortfolioCalculator from "./pages/PortfolioCalculator";
import PositionSizeCalculator from "./pages/PositionSizeCalculator";
import Loading from "./components/Loader/Loading";

import ToolsLayout from "./Layouts/ToolsLayout";
import StoreLayout from "./Layouts/StoreLayout";

import FinancialDashboard from "./pages/FinancialDashboard";
import Store from "./pages/Store";
import Courses from "./pages/Courses";
import CoursePage from "./pages/CoursePage";
import PremiumJournal from "./pages/PremiumJournal";

import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import CookiePolicy from "./pages/CookiePolicy";
import ContactUs from "./pages/ContactUs";

import Analytics from "./components/Analytics";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <Loading />;

  return (
    <>
      {/* ✅ GOOGLE ANALYTICS FOR SPA */}
      <Analytics />

      <Routes>
        {/* TOOLS LAYOUT */}
        <Route element={<ToolsLayout />}>
          <Route path="/" element={<Home />} />
          <Route
            path="/financial-statement-generator"
            element={<FinancialDashboard />}
          />
          <Route
            path="/portfolio-calculator"
            element={<PortfolioCalculator />}
          />
          <Route
            path="/position-size-calculator"
            element={<PositionSizeCalculator />}
          />
        </Route>

        <Route path="/trading-journal" element={<PremiumJournal />} />

        {/* STORE / COURSES */}
        <Route element={<StoreLayout />}>
          <Route path="/store" element={<Store />} />
          <Route path="/course" element={<Courses />} />
          <Route path="/course/:courseId" element={<CoursePage />} />
        </Route>

      {/* LEGAL PAGES (WITH HEADER & FOOTER) */}
      <Route element={<StoreLayout />}>
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/contact-us" element={<ContactUs />} />
      </Route>    
      </Routes>
    </>
  );
};

export default App;
