import { FaArrowUp, FaArrowDown, FaChartLine } from "react-icons/fa"; // Example icons

const StatsCard = () => {
  const statsData = [
    {
      value: "₹2.5 Lakh Crore",
      description: "Missed returns annually due to poor management.",
      icon: <FaArrowDown className="text-red-500" />, // Red arrow for missed returns
    },
    {
      value: "60%",
      description: "Investors overexposed to risky assets.",
      icon: <FaChartLine className="text-yellow-500" />, // Yellow chart line for risky assets
    },
    {
      value: "Up to 40%",
      description: "Potential increase in returns with smart diversification.",
      icon: <FaArrowUp className="text-green-500" />, // Green arrow for potential growth
    },
  ];

  return (
    <div className="container mx-auto my-6 px-4 sm:px-8 lg:px-16">
      <div className="bg-purple-50 rounded-3xl py-6">
        <p className="text-center font-bold text-2xl md:text-3xl lg:text-3xl  text-gray-600">
          What Research Says
        </p>
        <div className="flex justify-center items-center py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-6xl px-4">
            {statsData.map((stat, index) => (
              <div
                key={index}
                className="bg-white shadow-lg rounded-lg p-6 flex items-center justify-center gap-4 transform transition duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex flex-col items-center gap-3">
                  {/* Icon */}
                  <div className="text-3xl md:text-4xl lg:text-5xl">
                    {stat.icon}
                  </div>
                  {/* Text Content */}
                  <div className="text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-700">
                      {stat.value}
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-500">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
