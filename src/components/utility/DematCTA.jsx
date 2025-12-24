import { useState } from "react";
import { X } from "lucide-react";

const DematCTA = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2">
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#694F8E] px-6 py-4 shadow-2xl">

        {/* LEFT CONTENT */}
        <div className="text-white">
          <p className="text-sm font-medium opacity-90">
            Ready to start investing?
          </p>
          <p className="text-lg font-semibold leading-tight">
            Open your Demat account with a trusted broker
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          <a
            href="https://upstox.com/open-account/?f=GXP7"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#694F8E] hover:scale-[1.03] transition"
          >
            Open Demat Account
          </a>

          <button
            onClick={() => setVisible(false)}
            className="rounded-lg p-2 text-white/80 hover:bg-white/10"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

      </div>

      {/* Disclaimer */}
      <p className="mt-2 text-center text-xs text-gray-500">
        Educational purpose only. No investment advice.
      </p>
    </div>
  );
};

export default DematCTA;
