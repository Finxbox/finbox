import { useState } from "react";

const useSettingsModal = () => {
  const [open, setOpen] = useState(false);

  return {
    isOpen: open,
    openSettings: () => setOpen(true),
    closeSettings: () => setOpen(false),
  };
};

export default useSettingsModal;
