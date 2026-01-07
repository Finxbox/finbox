import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (!GA_ID || !window.gtag) return;

    window.gtag("config", GA_ID, {
      page_path: location.pathname,
    });
  }, [location]);

  return null;
};

export default Analytics;
