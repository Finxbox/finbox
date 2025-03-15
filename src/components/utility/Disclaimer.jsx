const Disclaimer = () => {
  const Disclaimer =
    "The information and tools provided on this website are for informational and educational purposes only. They should not be considered as financial, investment, or trading advice. Any decisions based on the content of this website are at your own risk. Always conduct your own research before making investment decisions";

  return (
    <>
      <div className="flex items-center my-12 justify-center">
        <p className="text-center text-NavPurple font-light text-sm w-6/12">
          {Disclaimer}
        </p>
      </div>
    </>
  );
};

export default Disclaimer;
