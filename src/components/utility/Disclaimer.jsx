const Disclaimer = () => {
  const Disclaimer =
    "Empowering you with financial insights to make informed decisions. Remember, this tool isn't a substitute for professional advice—always consult an expert before investing.";

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
