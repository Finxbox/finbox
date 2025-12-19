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
            <Route path="/financial-dashboard" element={<FinancialDashboard />} /> {/* Add this route */}
            <Route
              path="/Statement-calculator"
              element={<Statementcalculator />}
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

          {/* Store layout for store pages */}
          <Route element={<StoreLayout />}>
            <Route path="/store" element={<Store />} />
          </Route>
        </Routes>
      )}
    </>
  );
};

export default App;