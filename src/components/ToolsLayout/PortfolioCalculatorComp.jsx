import { useState } from "react";
import Ads from "../ADS/Ads";

const PortfolioCalculatorComp = () => {
  const [capital, setCapital] = useState("");
  const [assets, setAssets] = useState([]);
  const [result, setResult] = useState(null);

  // Volatility map for different asset types
  const volatilityMap = {
    "Large-cap": 0.1,
    "Mid-cap": 0.15,
    "Small-cap": 0.25,
    Bonds: 0.05,
    "Mutual Fund": 0.12,
    ETF: 0.1,
  };

  // Handle capital input change
  const handleCapitalChange = (e) => {
    setCapital(e.target.value);
  };

  // Handle number of companies input change
  const handleNumCompaniesChange = (e) => {
    const num = parseInt(e.target.value, 10);
    setAssets(
      Array.from({ length: num }, (_, index) => ({
        id: index + 1,
        company: "",
        price: "",
        type: "Large-cap", // Default asset type
        volatility: volatilityMap["Large-cap"], // Default volatility
      }))
    );
    setResult(null); // Reset result when number of companies changes
  };

  // Handle company name input change
  const handleCompanyChange = (e, index) => {
    const updatedAssets = [...assets];
    updatedAssets[index].company = e.target.value; // Update company name for the selected asset
    setAssets(updatedAssets); // Update the state with the modified asset
  };

  // Handle price input change
  const handlePriceChange = (e, index) => {
    const updatedAssets = [...assets];
    updatedAssets[index].price = e.target.value; // Update price for the selected asset
    setAssets(updatedAssets); // Update the state with the modified asset
  };

  // Handle asset type change and autofill volatility
  const handleAssetTypeChange = (e, index) => {
    const updatedAssets = [...assets];
    const assetType = e.target.value;
    const volatility = volatilityMap[assetType] || 0;
    updatedAssets[index] = {
      ...updatedAssets[index],
      type: assetType,
      volatility,
    }; // Update the selected asset
    setAssets(updatedAssets); // Update the state with the modified asset
  };

  // Handle final calculation
  const calculatePortfolio = () => {
    if (!capital || capital <= 0) {
      alert("Please enter a valid total capital.");
      return;
    }

    const totalCapital = parseFloat(capital);
    let totalSharesValue = 0;
    const allocations = [];

    assets.forEach(({ company, price, volatility }) => {
      const priceValue = parseFloat(price);
      if (company && priceValue && volatility > 0) {
        const weight = 1 / volatility;
        const totalWeight = assets.reduce(
          (sum, asset) => sum + 1 / asset.volatility,
          0
        );
        const assetWeight = weight / totalWeight;

        const sharesToBuy = Math.floor(
          (totalCapital * assetWeight) / priceValue
        );
        const investmentValue = sharesToBuy * priceValue;

        allocations.push({
          companyName: company,
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
    <>
      <div>
        <Ads />
      </div>
      <div className="max-w-4xl min-h-screen mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-[#694F8E] mb-6">
          Portfolio Calculator
        </h1>

        <div className="space-y-6">
          {/* Total Capital Input */}
          <div className="flex flex-col">
            <label htmlFor="capital" className="font-medium text-[#694F8E]">
              Total Capital (₹)
            </label>
            <input
              type="number"
              id="capital"
              className="mt-2 p-3 border border-[#694F8E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#694F8E]"
              value={capital}
              onChange={handleCapitalChange}
            />
          </div>

          {/* Number of Companies Input */}
          <div className="flex flex-col">
            <label
              htmlFor="num-companies"
              className="font-medium text-[#694F8E]"
            >
              Number of Companies
            </label>
            <input
              type="number"
              id="num-companies"
              className="mt-2 p-3 border border-[#694F8E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#694F8E]"
              onChange={handleNumCompaniesChange}
            />
          </div>

          {/* Company Input Fields */}
          {assets.map((asset, index) => (
            <div
              key={asset.id}
              className="border p-4 rounded-lg shadow-sm bg-[#F7F4FB] space-y-4"
            >
              <h3 className="font-semibold text-lg text-[#694F8E]">
                Company {asset.id}
              </h3>

              <div className="space-y-3">
                {/* Company Name */}
                <div className="flex flex-col">
                  <label className="font-medium text-[#694F8E]">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="mt-2 p-3 border border-[#694F8E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#694F8E]"
                    value={asset.company}
                    onChange={(e) => handleCompanyChange(e, index)}
                  />
                </div>

                {/* Share Price */}
                <div className="flex flex-col">
                  <label className="font-medium text-[#694F8E]">
                    Share Price (₹)
                  </label>
                  <input
                    type="number"
                    className="mt-2 p-3 border border-[#694F8E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#694F8E]"
                    value={asset.price}
                    onChange={(e) => handlePriceChange(e, index)}
                  />
                </div>

                {/* Asset Type */}
                <div className="flex flex-col">
                  <label className="font-medium text-[#694F8E]">
                    Asset Type
                  </label>
                  <select
                    className="mt-2 p-3 border border-[#694F8E] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#694F8E]"
                    value={asset.type}
                    onChange={(e) => handleAssetTypeChange(e, index)}
                  >
                    <option value="Large-cap">Large-cap</option>
                    <option value="Mid-cap">Mid-cap</option>
                    <option value="Small-cap">Small-cap</option>
                    <option value="Bonds">Bonds</option>
                    <option value="Mutual Fund">Mutual Fund</option>
                    <option value="ETF">ETF</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {/* Calculate Button */}
          {assets.length > 0 && (
            <div className="flex justify-center">
              <button
                className="px-6 py-3 bg-[#694F8E] text-white rounded-lg shadow-md hover:bg-[#563C70]"
                onClick={calculatePortfolio}
              >
                Calculate Portfolio
              </button>
            </div>
          )}
        </div>

        {/* Results Display */}
        {result && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-[#694F8E]">
              Portfolio Allocation
            </h2>
            <ul className="mt-4 space-y-2">
              {result.allocations.map((alloc, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center p-3 bg-[#F7F4FB] rounded-lg"
                >
                  <span className="font-medium text-[#694F8E]">
                    {alloc.companyName}
                  </span>
                  <span className="text-gray-600">
                    Buy {alloc.sharesToBuy} shares (₹{" "}
                    {alloc.investmentValue.toFixed(2)})
                  </span>
                </li>
              ))}
              {result.cashInHand > 0 && (
                <li className="flex justify-between items-center p-3 bg-[#F7F4FB] rounded-lg">
                  <span className="font-medium text-[#694F8E]">
                    Cash in Hand
                  </span>
                  <span className="text-gray-600">
                    ₹ {result.cashInHand.toFixed(2)}
                  </span>
                </li>
              )}
            </ul>
            <p className="mt-4 font-semibold text-[#694F8E]">
              Total Investment: ₹ {result.totalSharesValue.toFixed(2)}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default PortfolioCalculatorComp;
