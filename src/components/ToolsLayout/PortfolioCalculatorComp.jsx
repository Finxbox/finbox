import { useState } from "react";

const PortfolioCalculatorComp = () => {
  const [companies, setCompanies] = useState([]);
  const [capital, setCapital] = useState("");
  const [result, setResult] = useState(null);

  // Function to handle company generation
  const generateCompanies = (numCompanies) => {
    const newCompanies = Array.from({ length: numCompanies }, (_, i) => ({
      id: i + 1,
      name: "",
      sharePrice: "",
    }));
    setCompanies(newCompanies);
  };

  // Function to handle input change for company details
  const handleCompanyChange = (companyIndex, field, value) => {
    const updatedCompanies = [...companies];
    updatedCompanies[companyIndex][field] = value;
    setCompanies(updatedCompanies);
  };

  // Function to calculate portfolio
  const calculatePortfolio = () => {
    const totalCapital = parseFloat(capital);
    let totalSharesValue = 0;
    let allocations = [];

    companies.forEach((company) => {
      const { name, sharePrice } = company;
      if (name && !isNaN(sharePrice) && sharePrice > 0) {
        const sharesToBuy = Math.floor(
          totalCapital / companies.length / sharePrice
        );
        const investmentValue = sharesToBuy * sharePrice;

        allocations.push({
          companyName: name,
          sharesToBuy,
          investmentValue,
        });
        totalSharesValue += investmentValue;
      }
    });

    const cashInHand = totalCapital - totalSharesValue;
    setResult({
      allocations,
      cashInHand,
      totalSharesValue,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
        Portfolio Calculator
      </h1>
      <div className="space-y-4">
        {/* Portfolio Capital Input */}
        <div className="flex flex-col">
          <label htmlFor="capital" className="font-medium text-gray-700">
            Total Capital (₹)
          </label>
          <input
            type="number"
            id="capital"
            className="mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
          />
        </div>

        {/* Number of Companies Input */}
        <div className="flex flex-col">
          <label htmlFor="num-companies" className="font-medium text-gray-700">
            Number of Companies
          </label>
          <input
            type="number"
            id="num-companies"
            className="mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            onChange={(e) => generateCompanies(e.target.value)}
          />
        </div>

        {/* Company Input Fields */}
        {companies.map((company, companyIndex) => (
          <div
            key={company.id}
            className="border p-4 rounded-lg shadow-sm bg-gray-50 space-y-4"
          >
            <h3 className="font-semibold text-lg text-gray-800">
              Company {company.id}
            </h3>
            <div className="space-y-3">
              {/* Company Name Input */}
              <div className="flex flex-col">
                <label className="font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  type="text"
                  className="mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={company.name}
                  onChange={(e) =>
                    handleCompanyChange(companyIndex, "name", e.target.value)
                  }
                />
              </div>

              {/* Share Price Input */}
              <div className="flex flex-col">
                <label className="font-medium text-gray-700">
                  Share Price (₹)
                </label>
                <input
                  type="number"
                  className="mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={company.sharePrice}
                  onChange={(e) =>
                    handleCompanyChange(
                      companyIndex,
                      "sharePrice",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        ))}

        {/* Calculate Button */}
        <div className="flex justify-center">
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
            onClick={calculatePortfolio}
          >
            Calculate Portfolio
          </button>
        </div>
      </div>

      {/* Results Display */}
      {result && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800">
            Portfolio Allocation
          </h2>
          <ul className="mt-4 space-y-2">
            {result.allocations.map((alloc, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center p-3 bg-gray-100 rounded-lg"
              >
                <span className="font-medium text-gray-700">
                  {alloc.companyName}
                </span>
                <span className="text-gray-600">
                  Buy {alloc.sharesToBuy} shares (₹{" "}
                  {alloc.investmentValue.toFixed(2)})
                </span>
              </li>
            ))}
            {result.cashInHand > 0 && (
              <li className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                <span className="font-medium text-gray-700">Cash in Hand</span>
                <span className="text-gray-600">
                  ₹ {result.cashInHand.toFixed(2)}
                </span>
              </li>
            )}
          </ul>
          <p className="mt-4 font-semibold text-gray-800">
            Total Investment: ₹ {result.totalSharesValue.toFixed(2)}
          </p>
        </div>
      )}

      {/* Portfolio Pie Chart Placeholder */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Portfolio Pie Chart
        </h2>
        <canvas
          id="portfolio-chart"
          className="w-full h-64 mt-4 bg-gray-200 rounded-lg"
        ></canvas>
      </div>
    </div>
  );
};

export default PortfolioCalculatorComp;
