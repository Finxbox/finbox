// Add custom JavaScript here
// Portfolio Allocation Tool Script

// Event listener for form submission, prevents default behavior and calls calculatePortfolio function
document
  .getElementById("portfolio-form")
  .addEventListener("submit", function (e) {
    e.preventDefault(); // Prevents the form from refreshing the page
    calculatePortfolio(); // Calls the function to calculate portfolio allocation
  });

// Function to dynamically generate sectors based on user input
function generateSectors() {
  const numSectors = document.getElementById("num-sectors").value; // Get the number of sectors from input
  const container = document.getElementById("sectors-container"); // Get the container where sectors will be added
  container.innerHTML = ""; // Clear the existing content inside the container

  // Loop through the number of sectors and create inputs for each sector
  for (let i = 1; i <= numSectors; i++) {
    const sectorDiv = document.createElement("div");
    sectorDiv.classList.add(
      "sector",
      "mb-3",
      "p-3",
      "border",
      "border-primary",
      "rounded"
    ); // Add Bootstrap classes for styling

    // Create label for the sector input field
    const sectorLabel = document.createElement("label");
    sectorLabel.classList.add("form-label", "fw-bold"); // Bootstrap styling
    sectorLabel.textContent = `Sector ${i} - Number of Companies:`; // Set label text
    sectorDiv.appendChild(sectorLabel); // Append label to the sector div

    // Create input for the number of companies in the sector
    const companyInput = document.createElement("input");
    companyInput.type = "number"; // Make it a number input
    companyInput.classList.add("num-companies", "form-control", "mt-2"); // Apply Bootstrap classes
    sectorDiv.appendChild(companyInput); // Append the input to sector div

    // Add event listener for changes in the number of companies input
    companyInput.addEventListener("change", function () {
      generateCompanies(sectorDiv, this.value, i); // Call generateCompanies function when number of companies changes
    });

    // Append the created sector div to the sectors container
    container.appendChild(sectorDiv);
  }
}

// Function to generate company inputs based on the number of companies entered by the user
function generateCompanies(sectorDiv, numCompanies, sectorIndex) {
  const existingCompanies = sectorDiv.querySelectorAll(".company"); // Find all existing company divs in the sector
  existingCompanies.forEach((comp) => comp.remove()); // Remove existing company inputs if any

  // Loop through the number of companies and generate inputs for each company
  for (let j = 1; j <= numCompanies; j++) {
    const companyDiv = document.createElement("div");
    companyDiv.classList.add(
      "company",
      "mb-3",
      "p-2",
      "border",
      "rounded",
      "bg-light"
    ); // Apply Bootstrap classes for styling

    // Create label for the company name input field
    const companyNameLabel = document.createElement("label");
    companyNameLabel.classList.add("form-label", "fw-semibold"); // Bootstrap classes for styling
    companyNameLabel.textContent = `Company ${j} Name:`; // Set the text for the label
    companyDiv.appendChild(companyNameLabel); // Append the label to the company div

    // Create input for company name
    const companyNameInput = document.createElement("input");
    companyNameInput.type = "text"; // Make it a text input
    companyNameInput.classList.add("company-name", "form-control", "mb-2"); // Bootstrap classes
    companyDiv.appendChild(companyNameInput); // Append the input to company div

    // Create label for share price input field
    const sharePriceLabel = document.createElement("label");
    sharePriceLabel.classList.add("form-label", "fw-semibold"); // Bootstrap classes
    sharePriceLabel.textContent = `Share Price:`; // Set text for label
    companyDiv.appendChild(sharePriceLabel); // Append label to company div

    // Create input for share price
    const sharePriceInput = document.createElement("input");
    sharePriceInput.type = "number"; // Make it a number input
    sharePriceInput.classList.add("share-price", "form-control", "mb-2"); // Bootstrap classes
    companyDiv.appendChild(sharePriceInput); // Append input to company div

    // Append the company div to the sector div
    sectorDiv.appendChild(companyDiv);
  }
}

// Function to calculate the portfolio based on user input
function calculatePortfolio() {
  const totalCapital = parseFloat(
    document.getElementById("total-capital").value
  ); // Get the total capital entered by the user
  const sectors = document.querySelectorAll(".sector"); // Get all sector divs

  let totalSharesValue = 0; // Variable to store total investment value in shares
  let allocations = []; // Array to store the allocations for each company
  let companyData = []; // Array to store company data for the pie chart

  // Loop through each sector to calculate allocations for companies within that sector
  sectors.forEach((sector) => {
    const numCompanies = sector.querySelector(".num-companies").value; // Get the number of companies in this sector
    const sectorAllocation = totalCapital / sectors.length; // Divide the total capital equally among all sectors

    // Loop through each company in the sector
    sector.querySelectorAll(".company").forEach((company) => {
      const companyName = company.querySelector(".company-name").value; // Get the company name
      const sharePrice = parseFloat(
        company.querySelector(".share-price").value
      ); // Get the share price for the company
      if (companyName && !isNaN(sharePrice) && sharePrice > 0) {
        // Validate input
        const allocation = sectorAllocation / numCompanies; // Allocate capital to each company in the sector
        const sharesToBuy = Math.floor(allocation / sharePrice); // Calculate how many shares can be bought
        const investmentValue = sharesToBuy * sharePrice; // Calculate the total investment in this company

        allocations.push({
          companyName,
          sharesToBuy,
          investmentValue,
        });

        totalSharesValue += investmentValue; // Add this investment value to the total shares value

        companyData.push({
          name: companyName,
          value: investmentValue,
        });
      }
    });
  });

  const cashInHand = totalCapital - totalSharesValue; // Calculate the remaining cash after investing in companies
  if (cashInHand > 0) {
    companyData.push({
      name: "Cash in Hand", // Add the remaining cash as a separate entry
      value: cashInHand,
    });
  }

  // Display portfolio allocation result
  let resultHTML = `<h2 class="mt-4">Portfolio Allocation:</h2><ul class="list-group mt-3">`;
  allocations.forEach((alloc) => {
    resultHTML += `<li class="list-group-item">${alloc.companyName}: Buy ${
      alloc.sharesToBuy
    } shares (Rs. ${alloc.investmentValue.toFixed(2)})</li>`;
  });
  if (cashInHand > 0) {
    resultHTML += `<li class="list-group-item">Cash in Hand: Rs. ${cashInHand.toFixed(
      2
    )}</li>`;
  }
  resultHTML += `</ul><p class="mt-3"><strong>Total Allocation: Rs. ${totalSharesValue.toFixed(
    2
  )}</strong></p>`;
  document.getElementById("result").innerHTML = resultHTML; // Display the result in the 'result' section
  // test code

  // Create a pie chart with the data
  createPieChart(companyData);
}

let chartInstance = null; // Declare the chart instance globally

// If a chart already exists, destroy it before creating a new one

// Function to create a pie chart using Chart.js
function createPieChart(companyData) {
  const ctx = document.getElementById("allocationChart").getContext("2d"); // Get the canvas context to draw on
  const labels = companyData.map((data) => data.name); // Get the labels (company names)
  const dataValues = companyData.map((data) => data.value); // Get the investment values for each company
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Create the pie chart using Chart.js
  chartInstance = new Chart(ctx, {
    type: "pie", // Specify the type of chart
    data: {
      labels: labels, // Set the labels for the chart
      datasets: [
        {
          label: "Portfolio Allocation", // Dataset label
          data: dataValues, // Set the data for the chart
          backgroundColor: generateColors(labels.length), // Set the colors for the sectors
          borderColor: "#ffffff", // Set the border color for slices
          borderWidth: 2, // Set the border width
          hoverOffset: 10, // Set the hover offset for slices
        },
      ],
    },
    options: {
      responsive: true, // Make the chart responsive to screen size
      plugins: {
        tooltip: {
          enabled: true, // Enable tooltips on hover
          callbacks: {
            label: function (context) {
              // Customize the tooltip label to show percentage and value
              const total = context.dataset.data.reduce(
                (acc, value) => acc + value,
                0
              );
              const percentage = ((context.raw / total) * 100).toFixed(2);
              return `${context.label}: Rs. ${context.raw.toFixed(
                2
              )} (${percentage}%)`;
            },
          },
        },
        legend: {
          position: "bottom", // Position the legend at the bottom
          labels: {
            font: {
              size: 14, // Set the font size for legend labels
            },
            padding: 20, // Set the padding around the legend
          },
        },
      },
    },
  });
}

// Function to generate random colors for the pie chart slices
function generateColors(numColors) {
  const colors = [];
  const baseColors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#66FF66",
    "#FF6666",
    "#66B2FF",
    "#FF66B2",
    "#B2FF66",
    "#66FFB2",
  ];

  // Loop through the number of colors required and add them to the array
  for (let i = 0; i < numColors; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }

  return colors; // Return the generated colors
}

// Tool 2 - Trade Risk-Reward Calculation

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
}
