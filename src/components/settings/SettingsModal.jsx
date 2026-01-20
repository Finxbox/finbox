const SettingsModal = ({ onClose }) => {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
      <div style={{ background: "white", padding: 20 }}>
        <h2>Settings</h2>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SettingsModal;
