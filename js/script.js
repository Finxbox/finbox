// Add custom JavaScript here
// Portfolio Allocation Tool Script
document
  .getElementById("portfolio-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    calculatePortfolio();
  });

function generateSectors() {
  const numSectors = document.getElementById("num-sectors").value;
  const container = document.getElementById("sectors-container");
  container.innerHTML = "";

  for (let i = 1; i <= numSectors; i++) {
    const sectorDiv = document.createElement("div");
    sectorDiv.classList.add(
      "sector",
      "mb-3",
      "p-3",
      "border",
      "border-primary",
      "rounded"
    ); // Add Bootstrap classes

    const sectorLabel = document.createElement("label");
    sectorLabel.classList.add("form-label", "fw-bold"); // Bootstrap for labels
    sectorLabel.textContent = `Sector ${i} - Number of Companies:`;
    sectorDiv.appendChild(sectorLabel);

    const companyInput = document.createElement("input");
    companyInput.type = "number";
    companyInput.classList.add("num-companies", "form-control", "mt-2"); // Bootstrap input styling
    sectorDiv.appendChild(companyInput);

    companyInput.addEventListener("change", function () {
      generateCompanies(sectorDiv, this.value, i);
    });

    container.appendChild(sectorDiv);
  }
}

function generateCompanies(sectorDiv, numCompanies, sectorIndex) {
  const existingCompanies = sectorDiv.querySelectorAll(".company");
  existingCompanies.forEach((comp) => comp.remove());

  for (let j = 1; j <= numCompanies; j++) {
    const companyDiv = document.createElement("div");
    companyDiv.classList.add(
      "company",
      "mb-3",
      "p-2",
      "border",
      "rounded",
      "bg-light"
    ); // Bootstrap card styling

    const companyNameLabel = document.createElement("label");
    companyNameLabel.classList.add("form-label", "fw-semibold"); // Bootstrap for label
    companyNameLabel.textContent = `Company ${j} Name:`;
    companyDiv.appendChild(companyNameLabel);

    const companyNameInput = document.createElement("input");
    companyNameInput.type = "text";
    companyNameInput.classList.add("company-name", "form-control", "mb-2"); // Bootstrap input styling
    companyDiv.appendChild(companyNameInput);

    const sharePriceLabel = document.createElement("label");
    sharePriceLabel.classList.add("form-label", "fw-semibold"); // Bootstrap for label
    sharePriceLabel.textContent = `Share Price:`;
    companyDiv.appendChild(sharePriceLabel);

    const sharePriceInput = document.createElement("input");
    sharePriceInput.type = "number";
    sharePriceInput.classList.add("share-price", "form-control", "mb-2"); // Bootstrap input styling
    companyDiv.appendChild(sharePriceInput);

    sectorDiv.appendChild(companyDiv);
  }
}

function calculatePortfolio() {
  const totalCapital = parseFloat(
    document.getElementById("total-capital").value
  );
  const sectors = document.querySelectorAll(".sector");

  let totalSharesValue = 0;
  let allocations = [];
  let companyData = [];

  sectors.forEach((sector) => {
    const numCompanies = sector.querySelector(".num-companies").value;
    const sectorAllocation = totalCapital / sectors.length;

    sector.querySelectorAll(".company").forEach((company) => {
      const companyName = company.querySelector(".company-name").value;
      const sharePrice = parseFloat(
        company.querySelector(".share-price").value
      );
      if (companyName && !isNaN(sharePrice) && sharePrice > 0) {
        const allocation = sectorAllocation / numCompanies;
        const sharesToBuy = Math.floor(allocation / sharePrice);
        const investmentValue = sharesToBuy * sharePrice;

        allocations.push({
          companyName,
          sharesToBuy,
          investmentValue,
        });

        totalSharesValue += investmentValue;

        companyData.push({
          name: companyName,
          value: investmentValue,
        });
      }
    });
  });

  const cashInHand = totalCapital - totalSharesValue;
  if (cashInHand > 0) {
    companyData.push({
      name: "Cash in Hand",
      value: cashInHand,
    });
  }

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
  document.getElementById("result").innerHTML = resultHTML;

  // Create a pie chart
  createPieChart(companyData);
}

function createPieChart(companyData) {
  const ctx = document.getElementById("allocationChart").getContext("2d");
  const labels = companyData.map((data) => data.name);
  const dataValues = companyData.map((data) => data.value);

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Portfolio Allocation",
          data: dataValues,
          backgroundColor: generateColors(labels.length),
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          enabled: true,
          callbacks: {
            label: function (context) {
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
          position: "bottom",
          labels: {
            font: {
              size: 14,
            },
            padding: 20,
          },
        },
      },
    },
  });
}

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

  for (let i = 0; i < numColors; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }

  return colors;
}

// Tool  2

function calculate() {
  var entryPrice = parseFloat(document.getElementById("entryPrice").value);
  var stopLoss = parseFloat(document.getElementById("stopLoss").value);
  var targetPrice = parseFloat(document.getElementById("targetPrice").value);
  var riskPercentage = parseFloat(
    document.getElementById("riskPercentage").value
  );
  var totalCapital = parseFloat(document.getElementById("totalCapital").value);

  if (
    isNaN(entryPrice) ||
    isNaN(stopLoss) ||
    isNaN(targetPrice) ||
    isNaN(riskPercentage) ||
    isNaN(totalCapital)
  ) {
    document.getElementById("result").innerHTML = "Please enter valid numbers.";
    return;
  }

  var riskPerShare = Math.abs(entryPrice - stopLoss);
  var riskAmount = totalCapital * (riskPercentage / 100);
  var quantityToBuy = Math.floor(riskAmount / riskPerShare);
  var totalSpent = quantityToBuy * entryPrice;

  if (totalSpent > totalCapital) {
    quantityToBuy = Math.floor(totalCapital / entryPrice);
    totalSpent = quantityToBuy * entryPrice;
  }

  var rewardPerShare = targetPrice - entryPrice;
  var rewardAmount = quantityToBuy * rewardPerShare;

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

  document.getElementById("result").innerHTML = resultText;
}
