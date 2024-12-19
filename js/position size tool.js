// Global chart instance
let chartInstance = null;

// Function to calculate the risk-reward ratio for trade
function calculate() {
  var entryPrice = parseFloat(document.getElementById("entryPrice").value); // Get the entry price
  var stopLoss = parseFloat(document.getElementById("stopLoss").value); // Get the stop loss
  var targetPrice = parseFloat(document.getElementById("targetPrice").value); // Get the target price
  var riskPercentage = parseFloat(
    document.getElementById("riskPercentage").value
  ); // Get the risk percentage
  var totalCapital = parseFloat(document.getElementById("totalCapital").value); // Get the total capital

  // Check for valid input
  if (
    isNaN(entryPrice) ||
    isNaN(stopLoss) ||
    isNaN(targetPrice) ||
    isNaN(riskPercentage) ||
    isNaN(totalCapital)
  ) {
    document.getElementById("result").innerHTML = "Please enter valid numbers."; // Display error if input is invalid
    return;
  }

  var riskPerShare = Math.abs(entryPrice - stopLoss); // Calculate the risk per share
  var riskAmount = totalCapital * (riskPercentage / 100); // Calculate the amount to risk based on total capital
  var quantityToBuy = Math.floor(riskAmount / riskPerShare); // Calculate the quantity to buy based on the risk

  var totalSpent = quantityToBuy * entryPrice; // Calculate the total amount spent based on the quantity and entry price

  if (totalSpent > totalCapital) {
    quantityToBuy = Math.floor(totalCapital / entryPrice); // Ensure that the total spent does not exceed available capital
    totalSpent = quantityToBuy * entryPrice;
  }

  var rewardPerShare = targetPrice - entryPrice; // Calculate the reward per share
  var rewardAmount = quantityToBuy * rewardPerShare; // Calculate the total reward amount

  // Format the risk and reward as colored HTML
  var riskColor = "<span class='red'>₹" + riskAmount.toFixed(2) + "</span>";
  var rewardColor =
    "<span class='green'>₹" + rewardAmount.toFixed(2) + "</span>";

  var resultText =
    "<strong>Total Risk:</strong> " +
    riskColor +
    "<br>" +
    "<strong>Total Reward:</strong> " +
    rewardColor +
    "<br>" +
    "<strong>Quantity to Buy:</strong> " +
    quantityToBuy.toFixed(0) +
    "<br>" +
    "<strong>Total Capital Spent:</strong> ₹" +
    totalSpent.toFixed(2);

  document.getElementById("result").innerHTML = resultText; // Display the result

  // Call createChart with the data
  createChart(riskAmount, rewardAmount, quantityToBuy, totalSpent); // <-- Make sure this matches your chart creation function
}

// Function to create a chart with calculated values
function createChart(riskAmount, rewardAmount, quantityToBuy, totalSpent) {
  const ctx = document.getElementById("resultChart").getContext("2d");

  // Destroy previous chart instance if exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Create a new chart
  chartInstance = new Chart(ctx, {
    type: "bar", // Bar chart to visualize risk, reward, quantity, and total spent
    data: {
      labels: [
        "Total Risk",
        "Total Reward",
        "Quantity to Buy",
        "Total Capital Spent",
      ],
      datasets: [
        {
          label: "Values",
          data: [riskAmount, rewardAmount, quantityToBuy, totalSpent],
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
          borderColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
