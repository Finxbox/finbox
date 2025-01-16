import { Outlet } from "react-router-dom"; // Import Outlet for nested routes
import StoreNavbar from "../components/Navbar/StoreNavbar";
import Footer from "../components/Footer/Footer";

const StoreLayout = () => {
  return (
    <div className="store-layout">
      <StoreNavbar /> {/* Store-specific navbar */}
      {/* This will render the nested route components (e.g., Store page, Cart, etc.) */}
      <div className="store-content">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default StoreLayout;
