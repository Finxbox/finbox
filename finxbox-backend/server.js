const express = require('express');
const app = express();
const port = 5000;

app.use(express.json());  // Allow JSON data in requests

// Example API endpoint for testing
app.get('/', (req, res) => {
  res.send('Welcome to Finxbox API!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
app.post('/api/calculate', (req, res) => {
    const { capital, riskPercentage, stockPrice, stopLoss } = req.body;
  
    // Basic formula: Risk Amount = (capital * risk%) / 100
    // Position Size = Risk Amount / (stockPrice - stopLoss)
    const riskAmount = (capital * riskPercentage) / 100;
    const positionSize = riskAmount / (stockPrice - stopLoss);
  
    res.json({ positionSize: Math.floor(positionSize) });
  });
  