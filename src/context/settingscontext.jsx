import { createContext, useContext, useEffect, useState } from "react";

const defaultSettings = {
  theme: "light",      // light | dark | system (later)
  currency: "INR",
};

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);

  // Load saved settings
  useEffect(() => {
    const saved = localStorage.getItem("settings");
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  // Persist settings
  useEffect(() => {
    localStorage.setItem("settings", JSON.stringify(settings));
  }, [settings]);

  // Side-effects (theme)
  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      settings.theme === "dark"
    );
  }, [settings.theme]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
