function Ads() {
  return (
    <div>
      <div className="Ads">
        <a href="https://sites.google.com/view/learntoearn-landingpage/landing-page" target="_blank">
          <img
            src="/Upstoxbanner.png"
            alt="Upstoxbanner"
            className="mx-auto w-8/12 pt-7"
          />
        </a>

        <div className="flex justify-center">
          {" "}
          <p className="text-center text-NavPurple w-6/12  p-10 text-sm font-semibold">
            Some links on this page are Amazon affiliate links. If you make a
            purchase through them, I may earn a small commission at no extra
            cost to you. Thank you for supporting, Happy shopping!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Ads;
