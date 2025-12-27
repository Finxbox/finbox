import { useState, useEffect } from "react";

const PositionSizeCalculator = () => {
  // State management
  const [accountBalance, setAccountBalance] = useState(100000);
  const [cashInHand, setCashInHand] = useState(100000);
  const [isEditingCash, setIsEditingCash] = useState(false);
  const [newCashAmount, setNewCashAmount] = useState("");
  
  const [tradeType, setTradeType] = useState("LONG");
  const [riskPercent, setRiskPercent] = useState(2);
  const [entryPrice, setEntryPrice] = useState(150);
  const [stopLossPrice, setStopLossPrice] = useState(140);
  const [targetPrice, setTargetPrice] = useState(180);
  const [positionSize, setPositionSize] = useState(null);
  
  // Trade management
  const [activeTrades, setActiveTrades] = useState([]);
  const [closedTrades, setClosedTrades] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);
  
  // UI states
  const [showCloseTradeModal, setShowCloseTradeModal] = useState(false);
  const [tradeToClose, setTradeToClose] = useState(null);
  const [closePrice, setClosePrice] = useState("");
  const [closeNotes, setCloseNotes] = useState("");
  const [isPremium, setIsPremium] = useState(true);
  
  // Transaction filtering
  const [filterType, setFilterType] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  // Initialize from localStorage
  useEffect(() => {
    const savedCash = localStorage.getItem('tradeCashInHand');
    const savedBalance = localStorage.getItem('tradeAccountBalance');
    const savedActiveTrades = localStorage.getItem('activeTrades');
    const savedClosedTrades = localStorage.getItem('closedTrades');
    const savedTransactions = localStorage.getItem('tradeTransactions');
    
    if (savedCash) setCashInHand(parseFloat(savedCash));
    if (savedBalance) setAccountBalance(parseFloat(savedBalance));
    if (savedActiveTrades) setActiveTrades(JSON.parse(savedActiveTrades));
    if (savedClosedTrades) setClosedTrades(JSON.parse(savedClosedTrades));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    
    // Initialize performance data
    const initialData = [
      { day: "Mon", profit: 12000, risk: 4000, label: "Day 1" },
      { day: "Tue", profit: 18000, risk: 6000, label: "Day 2" },
      { day: "Wed", profit: 8000, risk: 7000, label: "Day 3" },
      { day: "Thu", profit: 22000, risk: 5000, label: "Day 4" },
      { day: "Fri", profit: 15000, risk: 5500, label: "Day 5" },
    ];
    setPerformanceData(initialData);
  }, []);

  // Save transactions to localStorage
  useEffect(() => {
    localStorage.setItem('tradeTransactions', JSON.stringify(transactions));
  }, [transactions]);

  // Calculate position size
  const calculatePositionSize = () => {
    const accountBalanceNum = parseFloat(accountBalance);
    const riskPercentNum = parseFloat(riskPercent) / 100;
    const entryPriceNum = parseFloat(entryPrice);
    const stopLossPriceNum = parseFloat(stopLossPrice);
    const targetPriceNum = parseFloat(targetPrice) || 0;

    // Validation
    if (isNaN(accountBalanceNum) || accountBalanceNum <= 0 ||
        isNaN(riskPercentNum) || riskPercentNum <= 0 ||
        isNaN(entryPriceNum) || entryPriceNum <= 0 ||
        isNaN(stopLossPriceNum) || stopLossPriceNum <= 0) {
      alert("Please enter valid positive numbers for all fields");
      return;
    }

    if (tradeType === "LONG") {
      if (stopLossPriceNum >= entryPriceNum) {
        alert("For LONG trades: Stop Loss must be LESS than Entry Price");
        return;
      }
      if (targetPriceNum && targetPriceNum <= entryPriceNum) {
        alert("For LONG trades: Target must be GREATER than Entry Price");
        return;
      }
    } else {
      if (stopLossPriceNum <= entryPriceNum) {
        alert("For SHORT trades: Stop Loss must be GREATER than Entry Price");
        return;
      }
      if (targetPriceNum && targetPriceNum >= entryPriceNum) {
        alert("For SHORT trades: Target must be LESS than Entry Price");
        return;
      }
    }

    const riskAmount = accountBalanceNum * riskPercentNum;
    const stopLossDistance = tradeType === "LONG" 
      ? Math.abs(entryPriceNum - stopLossPriceNum)
      : Math.abs(stopLossPriceNum - entryPriceNum);
    
    if (stopLossDistance === 0) {
      alert("Stop Loss price cannot be equal to Entry Price");
      return;
    }

    const maxSharesByRisk = Math.floor(riskAmount / stopLossDistance);
    const maxSharesByCash = Math.floor(cashInHand / entryPriceNum);
    const positionSizeCalc = Math.min(maxSharesByRisk, maxSharesByCash);
    
    if (positionSizeCalc <= 0) {
      if (maxSharesByCash <= 0) {
        alert(`❌ Insufficient cash! You need at least ₹${entryPriceNum} to enter this trade.`);
      } else {
        alert(`⚠️ Risk parameters too tight! Cannot enter trade within your ${riskPercent}% risk limit.`);
      }
      return;
    }

    const requiredCapital = positionSizeCalc * entryPriceNum;
    const actualRiskAmount = positionSizeCalc * stopLossDistance;

    if (requiredCapital > cashInHand) {
      alert(`⚠️ Calculation error!`);
      return;
    }

    setPositionSize(positionSizeCalc);

    // Create trade
    const newTrade = {
      id: Date.now(),
      symbol: "TRADE-" + Date.now().toString().slice(-6),
      tradeType: tradeType,
      entryPrice: entryPriceNum,
      stopLoss: stopLossPriceNum,
      target: targetPriceNum,
      positionSize: positionSizeCalc,
      riskAmount: actualRiskAmount,
      investedCapital: requiredCapital,
      dateOpened: new Date().toLocaleString(),
      status: "active",
      notes: ""
    };

    // Add to active trades
    const updatedTrades = [...activeTrades, newTrade];
    setActiveTrades(updatedTrades);
    localStorage.setItem('activeTrades', JSON.stringify(updatedTrades));

    // Update cash
    const newCash = cashInHand - requiredCapital;
    setCashInHand(newCash);
    localStorage.setItem('tradeCashInHand', newCash.toString());

    // LOG THE BUY TRANSACTION
    const buyTransaction = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type: "BUY",
      tradeType: tradeType,
      symbol: newTrade.symbol,
      quantity: positionSizeCalc,
      price: entryPriceNum,
      amount: requiredCapital,
      action: "OPENED",
      profitLoss: null,
      cashAfter: newCash
    };
    
    setTransactions(prev => [buyTransaction, ...prev]);

    alert(`✅ ${tradeType} Trade Opened Successfully!`);
  };

  // Close trade
  const handleCloseTrade = (trade) => {
    setTradeToClose(trade);
    setClosePrice("");
    setCloseNotes("");
    setShowCloseTradeModal(true);
  };

  // Confirm trade closing
  const handleConfirmCloseTrade = () => {
    if (!tradeToClose || !closePrice) return;

    const closePriceNum = parseFloat(closePrice);
    let profitLoss = 0;
    
    if (tradeToClose.tradeType === "LONG") {
      profitLoss = (closePriceNum - tradeToClose.entryPrice) * tradeToClose.positionSize;
    } else {
      profitLoss = (tradeToClose.entryPrice - closePriceNum) * tradeToClose.positionSize;
    }
    
    const returnPercent = (profitLoss / tradeToClose.investedCapital) * 100;

    // Update closed trade
    const closedTrade = {
      ...tradeToClose,
      closePrice: closePriceNum,
      profitLoss: profitLoss,
      returnPercent: returnPercent,
      dateClosed: new Date().toLocaleString(),
      status: "closed",
      closeNotes: closeNotes
    };

    // Update cash
    const newCash = cashInHand + tradeToClose.investedCapital + profitLoss;
    setCashInHand(newCash);
    localStorage.setItem('tradeCashInHand', newCash.toString());

    // Update account balance
    const newBalance = accountBalance + profitLoss;
    setAccountBalance(newBalance);
    localStorage.setItem('tradeAccountBalance', newBalance.toString());

    // Move trade
    const updatedActive = activeTrades.filter(t => t.id !== tradeToClose.id);
    setActiveTrades(updatedActive);
    localStorage.setItem('activeTrades', JSON.stringify(updatedActive));
    
    const updatedClosed = [closedTrade, ...closedTrades];
    setClosedTrades(updatedClosed);
    localStorage.setItem('closedTrades', JSON.stringify(updatedClosed));

    // LOG THE SELL TRANSACTION
    const sellTransaction = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type: "SELL",
      tradeType: tradeToClose.tradeType,
      symbol: tradeToClose.symbol,
      quantity: tradeToClose.positionSize,
      entryPrice: tradeToClose.entryPrice,
      exitPrice: closePriceNum,
      amount: Math.abs(profitLoss),
      action: "CLOSED",
      profitLoss: profitLoss,
      returnPercent: returnPercent,
      closeType: "MANUAL",
      closeNotes: closeNotes,
      cashAfter: newCash
    };
    
    setTransactions(prev => [sellTransaction, ...prev]);

    setShowCloseTradeModal(false);
    setTradeToClose(null);

    alert(
      profitLoss > 0 
        ? `✅ Trade closed with PROFIT: ₹${profitLoss.toLocaleString()} (+${returnPercent.toFixed(2)}%)`
        : profitLoss < 0 
        ? `❌ Trade closed with LOSS: ₹${Math.abs(profitLoss).toLocaleString()} (${returnPercent.toFixed(2)}%)`
        : `⚪ Trade closed at BREAKEVEN`
    );
  };

  // Quick close
  const handleQuickClose = (trade, type) => {
    const closePrice = type === 'target' ? trade.target : trade.stopLoss;
    const closePriceNum = parseFloat(closePrice);
    let profitLoss = 0;
    
    if (trade.tradeType === "LONG") {
      profitLoss = (closePriceNum - trade.entryPrice) * trade.positionSize;
    } else {
      profitLoss = (trade.entryPrice - closePriceNum) * trade.positionSize;
    }
    
    const returnPercent = (profitLoss / trade.investedCapital) * 100;

    const closedTrade = {
      ...trade,
      closePrice: closePriceNum,
      profitLoss: profitLoss,
      returnPercent: returnPercent,
      dateClosed: new Date().toLocaleString(),
      status: "closed",
      closeNotes: `Closed at ${type === 'target' ? 'Target' : 'Stop Loss'}`
    };

    // Update cash
    const newCash = cashInHand + trade.investedCapital + profitLoss;
    setCashInHand(newCash);
    localStorage.setItem('tradeCashInHand', newCash.toString());

    // Update balance
    const newBalance = accountBalance + profitLoss;
    setAccountBalance(newBalance);
    localStorage.setItem('tradeAccountBalance', newBalance.toString());

    // Move trade
    setActiveTrades(prev => {
      const updated = prev.filter(t => t.id !== trade.id);
      localStorage.setItem('activeTrades', JSON.stringify(updated));
      return updated;
    });
    
    const updatedClosed = [closedTrade, ...closedTrades];
    setClosedTrades(updatedClosed);
    localStorage.setItem('closedTrades', JSON.stringify(updatedClosed));

    // LOG THE SELL TRANSACTION FOR QUICK CLOSE
    const sellTransaction = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type: "SELL",
      tradeType: trade.tradeType,
      symbol: trade.symbol,
      quantity: trade.positionSize,
      entryPrice: trade.entryPrice,
      exitPrice: closePriceNum,
      amount: Math.abs(profitLoss),
      action: "CLOSED",
      profitLoss: profitLoss,
      returnPercent: returnPercent,
      closeType: type === 'target' ? "TARGET" : "STOP_LOSS",
      closeNotes: `Closed at ${type === 'target' ? 'Target' : 'Stop Loss'}`,
      cashAfter: newCash
    };
    
    setTransactions(prev => [sellTransaction, ...prev]);

    alert(
      profitLoss > 0 
        ? `✅ Closed at ${type}: PROFIT ₹${profitLoss.toLocaleString()} (+${returnPercent.toFixed(2)}%)`
        : profitLoss < 0 
        ? `❌ Closed at ${type}: LOSS ₹${Math.abs(profitLoss).toLocaleString()} (${returnPercent.toFixed(2)}%)`
        : `⚪ Closed at ${type}: BREAKEVEN`
    );
  };

  // Delete trade
  const handleDeleteTrade = (tradeId) => {
    if (window.confirm("Delete this trade? Capital will be returned.")) {
      const trade = activeTrades.find(t => t.id === tradeId);
      if (trade) {
        const newCash = cashInHand + trade.investedCapital;
        setCashInHand(newCash);
        localStorage.setItem('tradeCashInHand', newCash.toString());
        
        const updatedActive = activeTrades.filter(t => t.id !== tradeId);
        setActiveTrades(updatedActive);
        localStorage.setItem('activeTrades', JSON.stringify(updatedActive));

        // LOG THE DELETE TRANSACTION
        const deleteTransaction = {
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          type: "DELETE",
          symbol: trade.symbol,
          quantity: trade.positionSize,
          amount: trade.investedCapital,
          action: "DELETED",
          reason: "User deleted trade",
          cashAfter: newCash
        };
        
        setTransactions(prev => [deleteTransaction, ...prev]);

        alert(`Trade deleted. ₹${trade.investedCapital.toLocaleString()} returned.`);
      }
    }
  };

  // Cash management
  const handleEditCashClick = () => {
    setIsEditingCash(true);
    setNewCashAmount(cashInHand.toString());
  };

  const handleSaveCash = () => {
    const newAmount = parseFloat(newCashAmount);
    if (!isNaN(newAmount) && newAmount >= 0) {
      const difference = newAmount - cashInHand;
      setCashInHand(newAmount);
      setAccountBalance(prev => prev + difference);
      localStorage.setItem('tradeCashInHand', newAmount.toString());
      localStorage.setItem('tradeAccountBalance', (accountBalance + difference).toString());
      
      // LOG DEPOSIT/WITHDRAWAL
      const cashTransaction = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        type: difference > 0 ? "DEPOSIT" : "WITHDRAWAL",
        amount: Math.abs(difference),
        action: difference > 0 ? "ADDED_FUNDS" : "WITHDREW_FUNDS",
        cashAfter: newAmount
      };
      
      setTransactions(prev => [cashTransaction, ...prev]);
    }
    setIsEditingCash(false);
  };

  const handleAddFunds = (amount) => {
    const newCash = cashInHand + amount;
    const newBalance = accountBalance + amount;
    setCashInHand(newCash);
    setAccountBalance(newBalance);
    localStorage.setItem('tradeCashInHand', newCash.toString());
    localStorage.setItem('tradeAccountBalance', newBalance.toString());

    // LOG DEPOSIT
    const depositTransaction = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      type: "DEPOSIT",
      amount: amount,
      action: "ADDED_FUNDS",
      cashBefore: cashInHand,
      cashAfter: newCash
    };
    
    setTransactions(prev => [depositTransaction, ...prev]);

    alert(`Added ₹${amount.toLocaleString()}`);
  };

  const handleWithdrawFunds = (amount) => {
    if (cashInHand >= amount) {
      const newCash = cashInHand - amount;
      const newBalance = accountBalance - amount;
      setCashInHand(newCash);
      setAccountBalance(newBalance);
      localStorage.setItem('tradeCashInHand', newCash.toString());
      localStorage.setItem('tradeAccountBalance', newBalance.toString());

      // LOG WITHDRAWAL
      const withdrawalTransaction = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        type: "WITHDRAWAL",
        amount: amount,
        action: "WITHDREW_FUNDS",
        cashBefore: cashInHand,
        cashAfter: newCash
      };
      
      setTransactions(prev => [withdrawalTransaction, ...prev]);

      alert(`Withdrew ₹${amount.toLocaleString()}`);
    } else {
      alert("Insufficient funds!");
    }
  };

  const handleResetAll = () => {
    if (window.confirm("Reset all data?")) {
      setCashInHand(100000);
      setAccountBalance(100000);
      setActiveTrades([]);
      setClosedTrades([]);
      setTransactions([]);
      setPositionSize(null);
      
      // LOG RESET
      const resetTransaction = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        type: "RESET",
        action: "SYSTEM_RESET",
        reason: "User reset all data",
        cashAfter: 100000
      };
      
      setTransactions([resetTransaction]);
      
      localStorage.removeItem('tradeCashInHand');
      localStorage.removeItem('tradeAccountBalance');
      localStorage.removeItem('activeTrades');
      localStorage.removeItem('closedTrades');
      localStorage.setItem('tradeTransactions', JSON.stringify([resetTransaction]));
    }
  };

  // Filter and sort transactions
  const filteredTransactions = transactions.filter(transaction => {
    if (filterType === "ALL") return true;
    if (filterType === "BUY") return transaction.type === "BUY";
    if (filterType === "SELL") return transaction.type === "SELL";
    if (filterType === "PROFIT") return transaction.profitLoss > 0;
    if (filterType === "LOSS") return transaction.profitLoss < 0;
    return true;
  }).sort((a, b) => {
    if (sortBy === "newest") return new Date(b.date + " " + b.time) - new Date(a.date + " " + a.time);
    if (sortBy === "oldest") return new Date(a.date + " " + a.time) - new Date(b.date + " " + b.time);
    if (sortBy === "profit") return (b.profitLoss || 0) - (a.profitLoss || 0);
    if (sortBy === "loss") return (a.profitLoss || 0) - (b.profitLoss || 0);
    return 0;
  });

  // EXCEL EXPORT FUNCTION
  const exportToExcel = () => {
    if (transactions.length === 0) {
      alert("No transactions to export!");
      return;
    }

    try {
      // Create Excel data
      const excelData = [
        ["TRADING TRANSACTIONS REPORT"],
        ["Generated on:", new Date().toLocaleString()],
        ["Total Transactions:", transactions.length],
        [],
        ["Date", "Time", "Type", "Trade Type", "Symbol", "Quantity", "Price", "Amount", "P&L", "Return%", "Action", "Cash After"],
        ...transactions.map(txn => [
          txn.date,
          txn.time,
          txn.type,
          txn.tradeType || "",
          txn.symbol || "",
          txn.quantity || 0,
          txn.price || txn.entryPrice || 0,
          txn.amount || 0,
          txn.profitLoss || 0,
          txn.returnPercent ? txn.returnPercent.toFixed(2) + "%" : "",
          txn.action || "",
          txn.cashAfter || 0
        ])
      ];

      // Convert to CSV
      const csvContent = excelData.map(row => 
        row.map(cell => {
          let cellValue = cell;
          if (cellValue === null || cellValue === undefined) cellValue = "";
          if (typeof cellValue === "string") {
            if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')) {
              return `"${cellValue.replace(/"/g, '""')}"`;
            }
          }
          return cellValue;
        }).join(',')
      ).join('\n');

      // Download
      const BOM = "\uFEFF";
      const blob = new Blob([BOM + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.href = url;
      link.download = `Trading_Report_${new Date().toISOString().split('T')[0]}.csv`;
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        alert(`✅ Excel Report Generated!
        
📊 Transactions: ${transactions.length}
💾 File: Trading_Report_[date].csv`);
      }, 100);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('❌ Failed to export.');
    }
  };

  // Format transaction for display
  const formatTransactionDisplay = (transaction) => {
    const getStatusColor = (type, profitLoss) => {
      if (type === "BUY") return "text-blue-600";
      if (type === "SELL") {
        return profitLoss > 0 ? "text-green-600" : profitLoss < 0 ? "text-red-600" : "text-gray-600";
      }
      return "text-gray-600";
    };

    const getStatusBadge = (type, profitLoss) => {
      if (type === "BUY") return "bg-blue-100 text-blue-800";
      if (type === "SELL") {
        return profitLoss > 0 ? "bg-green-100 text-green-800" : 
               profitLoss < 0 ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800";
      }
      if (type === "DEPOSIT") return "bg-emerald-100 text-emerald-800";
      if (type === "WITHDRAWAL") return "bg-yellow-100 text-yellow-800";
      if (type === "DELETE") return "bg-gray-100 text-gray-800";
      return "bg-gray-100 text-gray-800";
    };

    const getActionText = (type) => {
      if (type === "BUY") return "BUY";
      if (type === "SELL") return "SELL";
      if (type === "DEPOSIT") return "DEPOSIT";
      if (type === "WITHDRAWAL") return "WITHDRAW";
      if (type === "DELETE") return "DELETE";
      return type;
    };

    return {
      color: getStatusColor(transaction.type, transaction.profitLoss),
      badge: getStatusBadge(transaction.type, transaction.profitLoss),
      action: getActionText(transaction.type),
      icon: transaction.type === "BUY" ? "📈" : 
            transaction.type === "SELL" ? "📉" :
            transaction.type === "DEPOSIT" ? "💰" :
            transaction.type === "WITHDRAWAL" ? "💸" : "📊",
      profitText: transaction.profitLoss > 0 ? `+₹${transaction.profitLoss.toLocaleString()}` :
                  transaction.profitLoss < 0 ? `-₹${Math.abs(transaction.profitLoss).toLocaleString()}` :
                  null
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">ProTrade Calculator</h1>
            <p className="text-gray-600 mt-2">Professional Trading & Journal System</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="bg-white px-4 py-2 rounded-lg shadow border border-gray-200">
              <p className="text-sm text-gray-500">Cash in Hand</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{cashInHand.toLocaleString()}
              </p>
            </div>
            <button 
              onClick={() => setIsPremium(!isPremium)}
              className={`px-6 py-3 rounded-lg font-semibold ${isPremium ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              {isPremium ? 'PREMIUM ACTIVE' : 'UPGRADE TO PRO'}
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => handleAddFunds(10000)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            + Add ₹10,000
          </button>
          <button
            onClick={() => handleAddFunds(50000)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add ₹50,000
          </button>
          <button
            onClick={() => handleWithdrawFunds(10000)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            - Withdraw ₹10,000
          </button>
          <button
            onClick={handleResetAll}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 ml-auto"
          >
            Reset All
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Calculator */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Position Calculator</h2>
            
            <div className="space-y-6">
              {/* Trade Type */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setTradeType("LONG")}
                  className={`px-4 py-2 rounded-lg font-medium ${tradeType === "LONG" ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  📈 LONG
                </button>
                <button
                  onClick={() => setTradeType("SHORT")}
                  className={`px-4 py-2 rounded-lg font-medium ${tradeType === "SHORT" ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  📉 SHORT
                </button>
              </div>

              {/* Risk Slider */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-lg font-medium text-gray-700">Risk per Trade</label>
                  <span className="text-2xl font-bold text-purple-600">{riskPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="99"
                  step="0.5"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-lg"
                />
              </div>

              {/* Price Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entry Price (₹)</label>
                  <input
                    type="number"
                    value={entryPrice}
                    onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stop Loss (₹)</label>
                  <input
                    type="number"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-red-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Price (₹)</label>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-green-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculatePositionSize}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90"
              >
                {tradeType === "LONG" ? "📈 Calculate & Buy" : "📉 Calculate & Short"}
              </button>
            </div>
          </div>

          {/* Active Trades */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Active Trades ({activeTrades.length})</h3>
            {activeTrades.length > 0 ? (
              <div className="space-y-4">
                {activeTrades.map((trade) => (
                  <div key={trade.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="font-bold">{trade.symbol}</span>
                        <span className={`ml-2 px-2 py-1 text-xs rounded ${
                          trade.tradeType === "LONG" ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {trade.tradeType}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">₹{trade.investedCapital.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">Invested</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">Entry</p>
                        <p className="font-bold">₹{trade.entryPrice}</p>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded">
                        <p className="text-sm text-gray-500">Stop Loss</p>
                        <p className="font-bold text-red-600">₹{trade.stopLoss}</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <p className="text-sm text-gray-500">Target</p>
                        <p className="font-bold text-green-600">₹{trade.target}</p>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <p className="text-sm text-gray-500">Risk</p>
                        <p className="font-bold text-orange-600">₹{trade.riskAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCloseTrade(trade)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 text-sm"
                      >
                        Close Trade
                      </button>
                      <button
                        onClick={() => handleQuickClose(trade, 'target')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Close at Target
                      </button>
                      <button
                        onClick={() => handleQuickClose(trade, 'stop')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Close at Stop Loss
                      </button>
                      <button
                        onClick={() => handleDeleteTrade(trade.id)}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-lg">No active trades</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Trade Journal */}
        <div className="space-y-6">
          {/* Trade Journal */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Trade Journal</h3>
                <p className="text-sm text-gray-500 mt-1">All trading activities</p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                {/* Filters */}
                <div className="flex space-x-2">
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="ALL">All</option>
                    <option value="BUY">Buy</option>
                    <option value="SELL">Sell</option>
                    <option value="PROFIT">Profit</option>
                    <option value="LOSS">Loss</option>
                  </select>
                  
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="profit">Highest Profit</option>
                    <option value="loss">Highest Loss</option>
                  </select>
                </div>
                
                {/* Export Button */}
                {transactions.length > 0 && (
                  <button
                    onClick={exportToExcel}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 text-sm flex items-center"
                  >
                    📊 Export Excel
                  </button>
                )}
              </div>
            </div>
            
            {/* Stats */}
            {transactions.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Buy</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {transactions.filter(t => t.type === "BUY").length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Sell</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {transactions.filter(t => t.type === "SELL").length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Net P&L</p>
                    <p className={`text-2xl font-bold ${
                      transactions.reduce((sum, t) => sum + (t.profitLoss || 0), 0) > 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transactions.reduce((sum, t) => sum + (t.profitLoss || 0), 0) > 0 ? '+' : ''}
                      ₹{transactions.reduce((sum, t) => sum + (t.profitLoss || 0), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Transaction List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction, index) => {
                  const display = formatTransactionDisplay(transaction);
                  
                  return (
                    <div 
                      key={transaction.id || index} 
                      className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        {/* Left side */}
                        <div className="flex items-start space-x-3 mb-4 md:mb-0">
                          <div className={`p-2 rounded-lg ${display.badge}`}>
                            <span className="text-lg">{display.icon}</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-gray-900">
                                {transaction.symbol || "CASH"}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded ${display.badge}`}>
                                {display.action}
                              </span>
                              {transaction.tradeType && (
                                <span className={`px-2 py-1 text-xs rounded ${
                                  transaction.tradeType === "LONG" 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {transaction.tradeType}
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                              <div className="flex">
                                <span className="text-gray-500 w-12">Date:</span>
                                <span className="font-medium">{transaction.date}</span>
                              </div>
                              <div className="flex">
                                <span className="text-gray-500 w-12">Time:</span>
                                <span className="font-medium">{transaction.time}</span>
                              </div>
                              
                              {transaction.quantity && (
                                <div className="flex">
                                  <span className="text-gray-500 w-12">Qty:</span>
                                  <span className="font-medium">{transaction.quantity}</span>
                                </div>
                              )}
                              
                              {(transaction.price || transaction.entryPrice) && (
                                <div className="flex">
                                  <span className="text-gray-500 w-12">Price:</span>
                                  <span className="font-medium">
                                    ₹{transaction.price || transaction.entryPrice}
                                  </span>
                                </div>
                              )}
                              
                              {transaction.returnPercent !== undefined && (
                                <div className="flex">
                                  <span className="text-gray-500 w-12">Return:</span>
                                  <span className={`font-medium ${
                                    transaction.returnPercent > 0 ? "text-green-600" :
                                    transaction.returnPercent < 0 ? "text-red-600" :
                                    "text-gray-600"
                                  }`}>
                                    {transaction.returnPercent > 0 ? "+" : ""}
                                    {transaction.returnPercent.toFixed(2)}%
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {transaction.closeNotes && (
                              <div className="mt-2 text-sm text-gray-600">
                                📝 {transaction.closeNotes}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Right side - Amount */}
                        <div className="text-right">
                          <div className={`text-xl font-bold ${display.color}`}>
                            {display.profitText || 
                             (transaction.amount ? `₹${transaction.amount.toLocaleString()}` : "₹0")}
                          </div>
                          
                          {transaction.cashAfter && (
                            <div className="text-sm text-gray-500 mt-1">
                              Cash: ₹{transaction.cashAfter.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-gray-500">
                  <div className="text-4xl mb-4">📝</div>
                  <p className="text-lg">No transactions yet</p>
                  <p className="text-sm mt-1">Start trading to see your journal</p>
                </div>
              )}
            </div>
            
            {/* Export Footer */}
            {transactions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {filteredTransactions.length} of {transactions.length} transactions
                  </div>
                  <button
                    onClick={exportToExcel}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 text-sm"
                  >
                    📥 Download Excel Report
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditingCash && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Edit Cash</h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cash Amount (₹)
              </label>
              <input
                type="number"
                value={newCashAmount}
                onChange={(e) => setNewCashAmount(e.target.value)}
                className="w-full px-4 py-3 text-2xl font-bold border-2 border-blue-500 rounded-lg"
                autoFocus
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditingCash(false)}
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCash}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showCloseTradeModal && tradeToClose && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Close Trade</h3>
            <p className="text-gray-600 mb-6">
              Closing {tradeToClose.tradeType}: {tradeToClose.symbol}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Close Price (₹)
                </label>
                <input
                  type="number"
                  value={closePrice}
                  onChange={(e) => setClosePrice(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg"
                  placeholder="Enter closing price"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  rows="3"
                  placeholder="Add notes..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCloseTradeModal(false)}
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCloseTrade}
                disabled={!closePrice}
                className={`px-6 py-3 rounded-lg ${!closePrice ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              >
                Confirm Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PositionSizeCalculator;