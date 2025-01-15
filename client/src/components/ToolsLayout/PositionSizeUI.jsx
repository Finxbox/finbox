import { useState } from "react";

const PositionSizingCalculatorUI = () => {
  // useState hook to manage form data (user input values)
  const [formData, setFormData] = useState({
    entryPrice: "",
    stopLoss: "",
    targetPrice: "",
    riskPercentage: "",
    totalCapital: "",
  });

  // useState hook to store the calculated results after clicking the 'Calculate' button
  const [calculatedValues, setCalculatedValues] = useState(null);

  // Handle changes in input fields and update the corresponding form data
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Function to calculate position size and related values
  const calculatePositionSize = () => {
    const { entryPrice, stopLoss, targetPrice, riskPercentage, totalCapital } =
      formData;

    // Convert input values to numbers for calculations
    const entry = parseFloat(entryPrice);
    const stop = parseFloat(stopLoss);
    const target = parseFloat(targetPrice);
    const riskPercent = parseFloat(riskPercentage);
    const capital = parseFloat(totalCapital);

    // Check if any input is invalid (NaN), alert the user if so
    if (
      isNaN(entry) ||
      isNaN(stop) ||
      isNaN(target) ||
      isNaN(riskPercent) ||
      isNaN(capital)
    ) {
      alert("Please enter valid numbers.");
      return;
    }

    // Calculate risk per share (the difference between entry and stop price)
    const riskPerShare = Math.abs(entry - stop);

    // Calculate the total risk amount based on the user's capital and risk percentage
    const riskAmount = capital * (riskPercent / 100);

    // Calculate the quantity of shares/contracts to buy based on risk amount and risk per share
    let quantityToBuy = Math.floor(riskAmount / riskPerShare);

    // Calculate the total capital spent for the trade
    let totalSpent = quantityToBuy * entry;

    // If the total spent exceeds the available capital, adjust the quantity to buy to fit within available capital
    if (totalSpent > capital) {
      quantityToBuy = Math.floor(capital / entry); // Adjust the quantity to fit the available capital
      totalSpent = quantityToBuy * entry; // Recalculate total capital spent
    }

    // Calculate reward per share (the difference between target price and entry price)
    const rewardPerShare = target - entry;

    // Calculate the total reward based on quantity bought and reward per share
    const rewardAmount = quantityToBuy * rewardPerShare;

    // Set the calculated results in state so they can be displayed
    setCalculatedValues({
      riskAmount,
      rewardAmount,
      quantityToBuy,
      totalSpent,
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center p-4">
      {/* Header */}
      <header className="w-full max-w-4xl text-center py-8">
        <h1 className="text-3xl font-bold text-indigo-600">
          Position Sizing Calculator
        </h1>
        <p className="text-lg text-gray-700">
          Calculate your position size based on risk-reward ratio.
        </p>
      </header>

      {/* Input Form */}
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
          Enter Your Trade Details
        </h2>
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Responsive Grid for Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input for Entry Price */}
            <div>
              <label htmlFor="entryPrice" className="block text-gray-600">
                Entry Price
              </label>
              <input
                type="number"
                name="entryPrice"
                id="entryPrice"
                value={formData.entryPrice}
                onChange={handleInputChange}
                className="w-full p-3 mt-2 border border-gray-300 rounded-md"
                placeholder="Enter entry price"
              />
            </div>

            {/* Input for Stop Loss */}
            <div>
              <label htmlFor="stopLoss" className="block text-gray-600">
                Stop Loss
              </label>
              <input
                type="number"
                name="stopLoss"
                id="stopLoss"
                value={formData.stopLoss}
                onChange={handleInputChange}
                className="w-full p-3 mt-2 border border-gray-300 rounded-md"
                placeholder="Enter stop loss"
              />
            </div>

            {/* Input for Target Price */}
            <div>
              <label htmlFor="targetPrice" className="block text-gray-600">
                Target Price
              </label>
              <input
                type="number"
                name="targetPrice"
                id="targetPrice"
                value={formData.targetPrice}
                onChange={handleInputChange}
                className="w-full p-3 mt-2 border border-gray-300 rounded-md"
                placeholder="Enter target price"
              />
            </div>

            {/* Input for Risk Percentage */}
            <div>
              <label htmlFor="riskPercentage" className="block text-gray-600">
                Risk Percentage
              </label>
              <input
                type="number"
                name="riskPercentage"
                id="riskPercentage"
                value={formData.riskPercentage}
                onChange={handleInputChange}
                className="w-full p-3 mt-2 border border-gray-300 rounded-md"
                placeholder="Enter risk percentage"
              />
            </div>

            {/* Input for Total Capital */}
            <div>
              <label htmlFor="totalCapital" className="block text-gray-600">
                Total Capital
              </label>
              <input
                type="number"
                name="totalCapital"
                id="totalCapital"
                value={formData.totalCapital}
                onChange={handleInputChange}
                className="w-full p-3 mt-2 border border-gray-300 rounded-md"
                placeholder="Enter total capital"
              />
            </div>
          </div>

          {/* Calculate Button */}
          <button
            type="button"
            onClick={calculatePositionSize} // Trigger the calculation function when clicked
            className="w-full py-3 mt-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
          >
            Calculate
          </button>
        </form>
      </div>

      {/* Display Results if Calculations are Available */}
      {calculatedValues && (
        <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
            Results
          </h2>
          <p className="text-lg text-gray-800">
            <strong>Total Risk:</strong>{" "}
            <span className="text-red-500">
              ₹{calculatedValues.riskAmount.toFixed(2)}
            </span>
          </p>
          <p className="text-lg text-gray-800">
            <strong>Total Reward:</strong>{" "}
            <span className="text-green-500">
              ₹{calculatedValues.rewardAmount.toFixed(2)}
            </span>
          </p>
          <p className="text-lg text-gray-800">
            <strong>Quantity to Buy:</strong> {calculatedValues.quantityToBuy}
          </p>
          <p className="text-lg text-gray-800">
            <strong>Total Capital Spent:</strong> ₹
            {calculatedValues.totalSpent.toFixed(2)}
          </p>
        </div>
      )}

      {/* Placeholder for Chart Visualization */}
      {calculatedValues && (
        <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
            Risk-Reward Visualization
          </h2>
          {/* Placeholder canvas for a future chart */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <canvas id="resultChart" width="400" height="200"></canvas>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionSizingCalculatorUI;
