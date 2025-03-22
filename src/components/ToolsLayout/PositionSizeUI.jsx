import React, { useState } from "react";

function PositionSizeCalculator() {
  const [accountBalance, setAccountBalance] = useState("");
  const [riskPercent, setRiskPercent] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [positionSize, setPositionSize] = useState("");
  const [riskRewardRatio, setRiskRewardRatio] = useState("");

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

    // Calculate risk amount and stop-loss distance
    const riskAmount = accountBalanceNum * riskPercentNum;
    const stopLossDistance = Math.abs(entryPriceNum - stopLossPriceNum);

    // Calculate position size based on risk and capital constraints
    const riskBasedPositionSize = Math.floor(riskAmount / stopLossDistance);
    const capitalBasedPositionSize = Math.floor(accountBalanceNum / entryPriceNum);

    const finalPositionSize = Math.min(riskBasedPositionSize, capitalBasedPositionSize);
    setPositionSize(finalPositionSize); // Display final position size

    // Calculate Risk-Reward Ratio if target price is provided
    if (targetPrice) {
      const targetPriceNum = parseFloat(targetPrice);
      const rewardDistance = Math.abs(targetPriceNum - entryPriceNum);
      const riskReward = (rewardDistance / stopLossDistance).toFixed(2);
      setRiskRewardRatio(riskReward);
    }
  };

  const resetFields = () => {
    setAccountBalance("");
    setRiskPercent("");
    setEntryPrice("");
    setStopLossPrice("");
    setTargetPrice("");
    setPositionSize("");
    setRiskRewardRatio("");
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-xl font-bold">Position Size Calculator</h1>

      <label className="block">
        Account Capital:
        <input
          type="number"
          value={accountBalance}
          onChange={(e) => setAccountBalance(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          placeholder="Enter your total capital"
        />
      </label>

      <label className="block">
        Risk %:
        <input
          type="number"
          value={riskPercent}
          onChange={(e) => setRiskPercent(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          placeholder="Enter risk percentage (e.g., 2%)"
        />
      </label>

      <label className="block">
        Entry Price:
        <input
          type="number"
          value={entryPrice}
          onChange={(e) => setEntryPrice(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          placeholder="Enter the stock entry price"
        />
      </label>

      <label className="block">
        Stop Loss Price:
        <input
          type="number"
          value={stopLossPrice}
          onChange={(e) => setStopLossPrice(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          placeholder="Enter the stop loss price"
        />
      </label>

      <label className="block">
        Target Price (optional):
        <input
          type="number"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          className="w-full mt-1 p-2 border border-gray-300 rounded-md"
          placeholder="Enter the target price (optional)"
        />
      </label>

      <button
        onClick={calculatePositionSize}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
      >
        Calculate
      </button>

      {positionSize && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">
            Final Position Size: {positionSize} units
          </h2>

          {riskRewardRatio && (
            <p>Risk-Reward Ratio: {riskRewardRatio}</p>
          )}
        </div>
      )}

      <button
        onClick={resetFields}
        className="w-full mt-2 bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
      >
        Reset
      </button>
    </div>
  );
}

export default PositionSizeCalculator;
