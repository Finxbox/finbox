import { Outlet } from "react-router-dom"; // For rendering nested routes
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import SettingsModal from "../components/settings/SettingsModal";
import useSettingsModal from "../hooks/useSettingsModal";

const ToolsLayout = () => {
    const { isOpen, openSettings, closeSettings } = useSettingsModal();
  
  return (
    <>
      <Navbar onOpenSettings={openSettings} />
      {/* This is where the actual page content will go */}
      <div className="content">
        <Outlet /> {/* Nested route content */}
      </div>
            {/* SETTINGS MODAL */}
      {isOpen && <SettingsModal onClose={closeSettings} />}
      <Footer /> {/* Footer for all tool pages */}
    </>
  );
};

export default ToolsLayout;
