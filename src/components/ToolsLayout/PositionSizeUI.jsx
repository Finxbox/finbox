"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Target, Percent, Moon, Sun, Loader2 } from "lucide-react"

// Custom INR currency icon component
const INRIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 3h12M6 8h12M6 13l6 8M15 13H6" />
  </svg>
)

function PositionSizeCalculator() {
  const [accountBalance, setAccountBalance] = useState("")
  const [riskPercent, setRiskPercent] = useState("")
  const [entryPrice, setEntryPrice] = useState("")
  const [stopLossPrice, setStopLossPrice] = useState("")
  const [targetPrice, setTargetPrice] = useState("")
  const [positionSize, setPositionSize] = useState(null)
  const [riskRewardRatio, setRiskRewardRatio] = useState(null)
  const [marginRequired, setMarginRequired] = useState(null)
  const [totalPurchase, setTotalPurchase] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const leverageLevel = 5

  // Load dark mode preference from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setDarkMode(true)
      document.documentElement.classList.add("dark")
    } else {
      setDarkMode(false)
      document.documentElement.classList.remove("dark")
    }
  }, [])

  // Toggle dark mode and save preference
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const calculatePositionSize = () => {
    setIsCalculating(true)
    setTimeout(() => {
      const accountBalanceNum = Number.parseFloat(accountBalance)
      const riskPercentNum = Number.parseFloat(riskPercent) / 100
      const entryPriceNum = Number.parseFloat(entryPrice)
      const stopLossPriceNum = Number.parseFloat(stopLossPrice)

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
        alert("Please enter valid positive numbers for all fields.")
        setIsCalculating(false)
        return
      }

      const riskAmount = accountBalanceNum * riskPercentNum
      const stopLossDistance = Math.abs(entryPriceNum - stopLossPriceNum)
      const riskBasedPositionSize = Math.floor(riskAmount / stopLossDistance)
      const capitalBasedPositionSize = Math.floor(accountBalanceNum / entryPriceNum)
      const finalPositionSize = Math.min(riskBasedPositionSize, capitalBasedPositionSize)
      setPositionSize(finalPositionSize)

      const purchaseAmount = finalPositionSize * entryPriceNum
      const margin = purchaseAmount / leverageLevel

      setTotalPurchase(purchaseAmount.toFixed(2))
      setMarginRequired(margin.toFixed(2))

      if (targetPrice) {
        const targetPriceNum = Number.parseFloat(targetPrice)
        const rewardDistance = Math.abs(targetPriceNum - entryPriceNum)
        setRiskRewardRatio((rewardDistance / stopLossDistance).toFixed(2))
      }

      setIsCalculating(false)
    }, 1000)
  }

  const resetFields = () => {
    setAccountBalance("")
    setRiskPercent("")
    setEntryPrice("")
    setStopLossPrice("")
    setTargetPrice("")
    setPositionSize(null)
    setRiskRewardRatio(null)
    setMarginRequired(null)
    setTotalPurchase(null)
  }

  // Determine if it's a long or short position
  const isLong = Number.parseFloat(stopLossPrice) < Number.parseFloat(entryPrice)

  // Calculate the range for the chart
  const prices = [
    Number.parseFloat(entryPrice) || 0,
    Number.parseFloat(stopLossPrice) || 0,
    Number.parseFloat(targetPrice) || 0,
  ].filter((p) => p > 0)

  const min = Math.min(...prices) * 0.95
  const max = Math.max(...prices) * 1.05
  const range = max - min

  // Calculate positions for visualization
  const getPosition = (price) => {
    return ((price - min) / range) * 100
  }

  const entryPosition = getPosition(Number.parseFloat(entryPrice) || 0)
  const stopLossPosition = getPosition(Number.parseFloat(stopLossPrice) || 0)
  const targetPosition = targetPrice ? getPosition(Number.parseFloat(targetPrice)) : null

  return (
    <div className={`${darkMode ? "dark" : ""} min-h-screen`}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
        <header className="py-4 px-6 shadow-md bg-gradient-to-r from-blue-500 to-purple-500 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Position Size Calculator</h1>
          <button
            onClick={toggleDarkMode}
            className="p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors"
          >
            {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />}
          </button>
        </header>

        <main className="container mx-auto max-w-6xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">Input Parameters</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enter your trading parameters</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="accountBalance" className="block text-sm font-medium">
                    Account Balance
                  </label>
                  <div className="relative">
                    <INRIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      id="accountBalance"
                      type="number"
                      value={accountBalance}
                      onChange={(e) => setAccountBalance(e.target.value)}
                      placeholder="10000"
                      className="pl-10 w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="riskPercent" className="block text-sm font-medium">
                    Risk Percentage
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      id="riskPercent"
                      type="number"
                      value={riskPercent}
                      onChange={(e) => setRiskPercent(e.target.value)}
                      placeholder="1"
                      className="pl-10 w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="entryPrice" className="block text-sm font-medium">
                    Entry Price
                  </label>
                  <div className="relative">
                    <INRIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      id="entryPrice"
                      type="number"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      placeholder="100"
                      className="pl-10 w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="stopLossPrice" className="block text-sm font-medium">
                    Stop Loss Price
                  </label>
                  <div className="relative">
                    <AlertTriangle className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      id="stopLossPrice"
                      type="number"
                      value={stopLossPrice}
                      onChange={(e) => setStopLossPrice(e.target.value)}
                      placeholder="95"
                      className="pl-10 w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="targetPrice" className="block text-sm font-medium">
                    Target Price (Optional)
                  </label>
                  <div className="relative">
                    <Target className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      id="targetPrice"
                      type="number"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(e.target.value)}
                      placeholder="110"
                      className="pl-10 w-full p-2 border rounded-md bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={resetFields}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={calculatePositionSize}
                  disabled={isCalculating}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    "Calculate"
                  )}
                </button>
              </div>
            </div>

            {/* Results Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-2">Results</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your position size calculation</p>
              </div>

              {positionSize !== null ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium">Position Size</label>
                      <div className="text-2xl font-bold">{positionSize} units</div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium">Risk/Reward Ratio</label>
                      <div className="text-2xl font-bold">{riskRewardRatio || "N/A"}</div>
                    </div>
                  </div>

                  <hr className="my-4 border-gray-200 dark:border-gray-700" />

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium">Total Purchase</label>
                      <div className="text-xl font-semibold">₹{totalPurchase}</div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium">Margin Required</label>
                      <div className="text-xl font-semibold">₹{marginRequired}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">At {leverageLevel}x leverage</div>
                    </div>
                  </div>

                  {/* Price Visualization */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-4">
                    <h3 className="text-sm font-medium mb-4">Price Visualization</h3>

                    <div className="relative h-16 mb-8">
                      {/* Horizontal line */}
                      <div className="absolute left-0 right-0 h-0.5 top-8 bg-gray-300 dark:bg-gray-600"></div>

                      {/* Entry price marker */}
                      <div className="absolute w-0.5 h-16 bg-blue-500" style={{ left: `${entryPosition}%` }}>
                        <div className="absolute -top-6 transform -translate-x-1/2 whitespace-nowrap">
                          <span className="text-xs font-medium">Entry</span>
                          <p className="text-xs">₹{Number.parseFloat(entryPrice).toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Stop loss marker */}
                      <div className="absolute w-0.5 h-16 bg-red-500" style={{ left: `${stopLossPosition}%` }}>
                        <div className="absolute -bottom-6 transform -translate-x-1/2 whitespace-nowrap">
                          <span className="text-xs font-medium">Stop Loss</span>
                          <p className="text-xs">₹{Number.parseFloat(stopLossPrice).toFixed(2)}</p>
                        </div>
                      </div>

                      {/* Target price marker (if provided) */}
                      {targetPosition !== null && (
                        <div className="absolute w-0.5 h-16 bg-green-500" style={{ left: `${targetPosition}%` }}>
                          <div className="absolute -top-6 transform -translate-x-1/2 whitespace-nowrap">
                            <span className="text-xs font-medium">Target</span>
                            <p className="text-xs">₹{Number.parseFloat(targetPrice).toFixed(2)}</p>
                          </div>
                        </div>
                      )}

                      {/* Position type indicator */}
                      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                        <span className={`text-xs font-bold ${isLong ? "text-green-500" : "text-red-500"}`}>
                          {isLong ? "LONG POSITION" : "SHORT POSITION"}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <AlertTriangle className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Enter your trading parameters and click Calculate to see results
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add CSS for dark mode and animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default PositionSizeCalculator

