import React, { useState } from "react";
import { DollarSign, AlertTriangle, Target, Percent, Moon, Sun, Loader } from "lucide-react"; // Icons
import { Chart } from "react-google-charts"; // For Chart Visualization

function PositionSizeCalculator() {
  const [accountBalance, setAccountBalance] = useState("");
  const [riskPercent, setRiskPercent] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [positionSize, setPositionSize] = useState("");
  const [riskRewardRatio, setRiskRewardRatio] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const calculatePositionSize = () => {
    setIsCalculating(true);
    setTimeout(() => {
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
        alert("Please enter valid positive numbers for all fields.");
        setIsCalculating(false);
        return;
      }

      const riskAmount = accountBalanceNum * riskPercentNum;
      const stopLossDistance = Math.abs(entryPriceNum - stopLossPriceNum);

      const riskBasedPositionSize = Math.floor(riskAmount / stopLossDistance);
      const capitalBasedPositionSize = Math.floor(accountBalanceNum / entryPriceNum);
      const finalPositionSize = Math.min(riskBasedPositionSize, capitalBasedPositionSize);
      setPositionSize(finalPositionSize);

      if (targetPrice) {
        const targetPriceNum = parseFloat(targetPrice);
        const rewardDistance = Math.abs(targetPriceNum - entryPriceNum);
        const riskReward = (rewardDistance / stopLossDistance).toFixed(2);
        setRiskRewardRatio(riskReward);
      }

      setIsCalculating(false);
    }, 1000);
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

  const chartData = [
    ["Price Type", "Price"],
    ["Entry Price", parseFloat(entryPrice) || 0],
    ["Stop Loss", parseFloat(stopLossPrice) || 0],
    ["Target Price", parseFloat(targetPrice) || 0],
  ];

  const riskRewardClass = riskRewardRatio < 1 ? "text-red-500 font-bold" :
    riskRewardRatio <= 2 ? "text-orange-500 font-bold" :
    "text-green-500 font-bold";

  const riskRewardText = riskRewardRatio < 1 ? "Risky" :
    riskRewardRatio <= 2 ? "Moderate" : "Great";

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"} min-h-screen p-4`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Position Size Calculator</h1>
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full">
          {darkMode ? <Sun className="text-yellow-400" /> : <Moon />}
        </button>
      </div>

      <div className="p-4 max-w-md mx-auto bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md space-y-4 mt-4">
        <div className="flex items-center space-x-2">
          <DollarSign />
          <input
            type="number"
            value={accountBalance}
            onChange={(e) => setAccountBalance(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="Account Capital"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Percent />
          <input
            type="number"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="Risk %"
          />
        </div>

        <div className="flex items-center space-x-2">
          <DollarSign />
          <input
            type="number"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="Entry Price"
          />
        </div>

        <div className="flex items-center space-x-2">
          <AlertTriangle />
          <input
            type="number"
            value={stopLossPrice}
            onChange={(e) => setStopLossPrice(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="Stop Loss Price"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Target />
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            placeholder="Target Price (optional)"
          />
        </div>

        <button
          onClick={calculatePositionSize}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 rounded-md hover:opacity-90 flex justify-center"
        >
          {isCalculating ? <Loader className="animate-spin" /> : "Calculate"}
        </button>

        {positionSize && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold">Final Position Size: {positionSize} units</h2>
            <p className={`${riskRewardClass}`}>Risk-Reward Ratio: {riskRewardRatio} ({riskRewardText})</p>

            <Chart
              chartType="ColumnChart"
              width="100%"
              height="200px"
              data={chartData}
              options={{ title: "Trade Setup", backgroundColor: darkMode ? "#333" : "#fff" }}
            />
          </div>
        )}

        <button onClick={resetFields} className="w-full mt-2 bg-gray-500 text-white p-2 rounded-md hover:opacity-90">
          Reset
        </button>
      </div>
    </div>
  );
}

export default PositionSizeCalculator;
