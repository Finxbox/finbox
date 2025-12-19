import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PortfolioCalculator from "./pages/PortfolioCalculator";
import PositionSizeCalculator from "./pages/PositionSizeCalculator";
import Loading from "./components/Loader/Loading"; // Import your Loader component
import ToolsLayout from "./Layouts/ToolsLayout";
import StoreLayout from "./Layouts/StoreLayout";
import Store from "./pages/Store";

const App = () => {
  const [isLoading, setIsLoading] = useState(true); // State to track loading

  useEffect(() => {
    // Simulate an async operation (like data fetching)
    const timer = setTimeout(() => {
      setIsLoading(false); // Set loading to false after 2 seconds
    }, 2000); // Adjust the time to your requirement

    return () => clearTimeout(timer); // Clean up the timeout
  }, []);

  return (
    <>
      {isLoading ? ( // Show loader if isLoading is true
        <Loading />
      ) : (
        <Routes>
          {/* Tools layout for tool pages */}
          <Route element={<ToolsLayout />}>
            <Route path="/" element={<Home />} />
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
            {/* Add other store-specific routes here */}
            <Route path="/store" element={<Store />} />
          </Route>
        </Routes>
      )}
    </>
  );
};

export default App;
