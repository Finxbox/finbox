import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

const StoreLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <Navbar />

      {/* PAGE CONTENT */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default StoreLayout;
