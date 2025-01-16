import { Link } from "react-router";

const Hero = () => {
  return (
    <div className="container mx-auto py-16 px-8">
      <div className="flex flex-col lg:flex-row justify-center items-center gap-6">
        {/* Text Content */}
        <div className="text-content w-full lg:w-6/12 text-center lg:text-left">
          <div className="flex flex-col gap-6">
            <h1 className="text-NavPurple text-3xl font-bold">
              Master Your Portfolio: Invest Smarter, Not Harder
            </h1>
            <p className="text-gray-700">
              Unbalanced portfolios cost Indian investors billions in missed
              returns annually. Our portfolio allocation tool helps you optimize
              investments, diversify with precision, and align with your
              financial goals effortlessly.
            </p>
            <Link
              to={"/portfolio-calculator"}
              className="px-6 py-2 text-white bg-NavPurple rounded-lg shadow-md w-full sm:w-3/4 md:w-6/12 mx-auto lg:mx-0 hover:bg-purple-700 transition duration-300"
            >
              Calculate your portfolio
            </Link>

            <p className="text-xs text-gray-500">
              Start building a balanced portfolio and maximize your returns
              today!
            </p>
          </div>
        </div>
        {/* Image Content */}
        <div className="image-content w-full lg:w-6/12 flex justify-center items-center">
          <img
            src="/Hero image.png"
            alt="Portfolio Allocation"
            className="w-9/12 h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
