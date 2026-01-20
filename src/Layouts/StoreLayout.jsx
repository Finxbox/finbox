import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import SettingsModal from "../components/settings/SettingsModal";
import useSettingsModal from "../hooks/useSettingsModal";

const StoreLayout = () => {
  const { isOpen, openSettings, closeSettings } = useSettingsModal();

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <Navbar onOpenSettings={openSettings} />

      {/* PAGE CONTENT */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* SETTINGS MODAL */}
      {isOpen && <SettingsModal onClose={closeSettings} />}

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default StoreLayout;
