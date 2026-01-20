import { useState } from "react";
import Navbar from "./Navbar";
import SettingsModal from "../../settings/SettingsModal";


const Layout = ({ children }) => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <Navbar onOpenSettings={() => setSettingsOpen(true)} />

      {children}

      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} />
      )}
    </>
  );
};

export default Layout;
