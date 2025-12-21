function Ads() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Main Banner Ad - Clean, professional */}
      <div className="mb-3 border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <a 
          href="https://sites.google.com/view/learntoearn-landingpage/landing-page" 
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src="/Upstoxbanner.png"
            alt="Upstox - Learn to Earn"
            className="w-full h-auto"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/728x90/694F8E/white?text=Sponsored+Ad+-+Upstox";
            }}
          />
        </a>
      </div>

      {/* Affiliate Disclosure - Subtle and professional */}
      <div className="text-center">
        <p className="text-xs text-gray-600 font-medium leading-tight max-w-3xl mx-auto px-2">
          Some links on this page are Amazon affiliate links. If you make a purchase through them, 
          I may earn a small commission at no extra cost to you. Thank you for supporting! 🙏
        </p>
      </div>
    </div>
  );
}

export default Ads;