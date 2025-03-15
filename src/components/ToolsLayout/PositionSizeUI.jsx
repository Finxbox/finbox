import { useState } from "react";
import Ads from "../ADS/Ads";

const PositionSizeCalculator = () => {
  const [accountBalance, setAccountBalance] = useState("");
  const [riskPercent, setRiskPercent] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [positionSize, setPositionSize] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "accountBalance") setAccountBalance(value);
    if (name === "riskPercent") setRiskPercent(value);
    if (name === "entryPrice") setEntryPrice(value);
    if (name === "stopLossPrice") setStopLossPrice(value);
  };

  const calculatePositionSize = () => {
    const accountBalanceNum = parseFloat(accountBalance);
    const riskPercentNum = parseFloat(riskPercent) / 100;
    const entryPriceNum = parseFloat(entryPrice);
    const stopLossPriceNum = parseFloat(stopLossPrice);

    if (
      isNaN(accountBalanceNum) ||
      isNaN(riskPercentNum) ||
      isNaN(entryPriceNum) ||
      isNaN(stopLossPriceNum) ||
      accountBalanceNum <= 0 ||
      riskPercentNum <= 0 ||
      entryPriceNum <= 0 ||
      stopLossPriceNum <= 0
    ) {
      alert("Please enter valid positive numbers for all fields");
      return;
    }

    const riskAmount = accountBalanceNum * riskPercentNum;
    const stopLossDistance = Math.abs(entryPriceNum - stopLossPriceNum);
    const positionSizeCalc = riskAmount / stopLossDistance;

    setPositionSize(positionSizeCalc);
  };

  return (
    <>
      <div>
        <Ads />
      </div>
      <div className="min-h-screen flex justify-center">
        <div className="max-w-6xl w-full bg-white rounded-lg shadow-xl p-6">
          <h2 className="text-3xl font-semibold text-center text-[#694F8E] mb-6">
            Position Size Calculator
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Account Balance (₹)
              </label>
              <input
                type="number"
                name="accountBalance"
                value={accountBalance}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#694F8E]"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">
                Risk per Trade (%)
              </label>
              <input
                type="number"
                name="riskPercent"
                value={riskPercent}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#694F8E]"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">
                Entry Price (₹)
              </label>
              <input
                type="number"
                name="entryPrice"
                value={entryPrice}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#694F8E]"
              />
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700">
                Stop Loss Price (₹)
              </label>
              <input
                type="number"
                name="stopLossPrice"
                value={stopLossPrice}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#694F8E]"
              />
            </div>

            <button
              onClick={calculatePositionSize}
              className="w-full py-2 bg-[#694F8E] text-white rounded-md hover:bg-[#5a3f70] transition"
            >
              Calculate Position Size
            </button>

            {positionSize !== null && (
              <div className="mt-6 text-center">
                <h3 className="text-2xl font-semibold text-green-600">
                  Position Size:{" "}
                  <span className="font-bold">
                    {positionSize.toFixed(2)} units
                  </span>
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PositionSizeCalculator;
