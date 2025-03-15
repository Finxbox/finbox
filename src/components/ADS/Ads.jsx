function Ads() {
  return (
    <div>
      <div className="Ads">
        <a href="https://amzn.to/3Ec050s" target="_blank">
          <img
            src="/audible.jpg"
            alt="Amazon seller banner"
            className="mx-auto"
          />
        </a>

        <div className="flex justify-center">
          {" "}
          <p className="text-center text-NavPurple w-6/12  pt-10 text-md font-semibold">
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
