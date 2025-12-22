import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PortfolioCalculator from "./pages/PortfolioCalculator";
import PositionSizeCalculator from "./pages/PositionSizeCalculator";
import Loading from "./components/Loader/Loading";
import ToolsLayout from "./Layouts/ToolsLayout";
import StoreLayout from "./Layouts/StoreLayout";
import Statementcalculator from "./pages/FinancialDashboard";
import Store from "./pages/Store";
import FinancialDashboard from "./pages/FinancialDashboard"; // Import new page
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import CookiePolicy from "./pages/CookiePolicy";
import CoursePage from "./pages/CoursePage";


const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <Routes>
          {/* Tools layout for tool pages */}
          <Route element={<ToolsLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/financial-statement-generator" element={<FinancialDashboard />} /> {/* Add this route */}
            
            <Route
              path="/portfolio-calculator"
              element={<PortfolioCalculator />}
            />
            <Route
              path="/position-size-calculator"
              element={<PositionSizeCalculator />}
            />
          </Route>

          {/* Store layout for store pages */}
          <Route element={<StoreLayout />}>
            <Route path="/store" element={<Store />} />

            <Route path="/course" element={<CoursePage />} />
          </Route>

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />


        </Routes>
      )}
    </>
  );
};

export default App;