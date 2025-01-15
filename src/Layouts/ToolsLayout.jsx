import { Outlet } from "react-router-dom"; // For rendering nested routes
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const ToolsLayout = () => {
  return (
    <>
      <Navbar /> {/* Navbar for all tool pages */}
      {/* This is where the actual page content will go */}
      <div className="content">
        <Outlet /> {/* Nested route content */}
      </div>
      <Footer /> {/* Footer for all tool pages */}
    </>
  );
};

export default ToolsLayout;
