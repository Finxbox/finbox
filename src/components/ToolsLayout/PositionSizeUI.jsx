import React, { useState } from "react";
import { DollarSign, AlertTriangle, Target, Percent, Moon, Sun, Loader } from "lucide-react";
import { Chart } from "react-google-charts";

function PositionSizeCalculator() {
  const [accountBalance, setAccountBalance] = useState("");
  const [riskPercent, setRiskPercent] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLossPrice, setStopLossPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [positionSize, setPositionSize] = useState("");
  const [riskRewardRatio, setRiskRewardRatio] = useState("");
  const [marginRequired, setMarginRequired] = useState("");
  const [totalPurchase, setTotalPurchase] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const leverageLevel = 5;

  const calculatePositionSize = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const accountBalanceNum = parseFloat(accountBalance);
      const riskPercentNum = parseFloat(riskPercent) / 100;
      const entryPriceNum = parseFloat(entryPrice);
      const stopLossPriceNum = parseFloat(stopLossPrice);

      if (
        isNaN(accountBalanceNum) || isNaN(riskPercentNum) ||
        isNaN(entryPriceNum) || isNaN(stopLossPriceNum) ||
        accountBalanceNum <= 0 || riskPercentNum <= 0 ||
        entryPriceNum <= 0 || stopLossPriceNum <= 0
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

      const purchaseAmount = finalPositionSize * entryPriceNum;
      const margin = purchaseAmount / leverageLevel;

      setTotalPurchase(purchaseAmount.toFixed(2));
      setMarginRequired(margin.toFixed(2));

      if (targetPrice) {
        const targetPriceNum = parseFloat(targetPrice);
        const rewardDistance = Math.abs(targetPriceNum - entryPriceNum);
        setRiskRewardRatio((rewardDistance / stopLossDistance).toFixed(2));
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
    setMarginRequired("");
    setTotalPurchase("");
  };

  const chartData = [
    ["Price Type", "Price"],
    ["Entry Price", parseFloat(entryPrice) || 0],
    ["Stop Loss", parseFloat(stopLossPrice) || 0],
    ["Target Price", parseFloat(targetPrice) || 0],
  ];

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} min-h-screen`}>
      <header className="py-4 px-6 shadow-md bg-gradient-to-r from-blue-500 to-purple-500 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Position Size Calculator</h1>
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 bg-gray-800 rounded-full">
          {darkMode ? <Sun className="text-yellow-400" /> : <Moon />}
        </button>
      </header>

      <main className="max-w-md mx-auto p-6 mt-6 rounded-lg shadow-lg bg-white dark:bg-gray-800">
        <div className="space-y-4">
          <div className="input-group">
            <DollarSign />
            <input type="number" value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)} placeholder="Account Capital" />
          </div>
          
          <button onClick={calculatePositionSize}>Calculate</button>
        </div>
      </main>
    </div>
  );
}

export default PositionSizeCalculator;
