import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import { 
  Download, 
  BarChart3, 
  TrendingUp, 
  Shield, 
  DollarSign,
  Plus,
  Trash2,
  Save,
  Zap,
  Target,
  AlertCircle,
  Info,
  Calculator,
  ExternalLink
} from "lucide-react";

const PositionSizeCalculator = () => {
  // Clerk Authentication
  const { user, isLoaded } = useUser();

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
  const [savedReports, setSavedReports] = useState([]);
  
  // UI states
  const [showCloseTradeModal, setShowCloseTradeModal] = useState(false);
  const [tradeToClose, setTradeToClose] = useState(null);
  const [closePrice, setClosePrice] = useState("");
  const [closeNotes, setCloseNotes] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [reportName, setReportName] = useState("");
  
  // Transaction filtering
  const [filterType, setFilterType] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  
  // Loading states
  const [loadingData, setLoadingData] = useState(true);
  const [savingData, setSavingData] = useState(false);
  const [error, setError] = useState(null);
  const [savingReport, setSavingReport] = useState(false);

  // Initialize user data from Supabase
  useEffect(() => {
    if (!isLoaded) return; // Wait for Clerk to load
    
    const loadUserData = async () => {
      setLoadingData(true);
      setError(null);
      
      try {
        if (!user) {
          // User not logged in - use localStorage as fallback
          loadLocalData();
          setLoadingData(false);
          return;
        }

        // Fetch user profile including premium status from user_profiles table
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("is_premium")
          .eq("userid", user.id)  // Changed from 'id' to 'userid' to match your table
          .single();

        if (!profileError && profile) {
          setIsPremium(profile.is_premium);
        }

        // Load user's saved reports from saved_reports table
        const { data: savedReportsData, error: reportsError } = await supabase
          .from("saved_reports")
          .select("*")
          .eq("userid", user.id)
          .order("created_at", { ascending: false });

        if (!reportsError && savedReportsData) {
          setSavedReports(savedReportsData);
          
          // Try to load the most recent report as current state
          if (savedReportsData.length > 0) {
            const latestReport = savedReportsData[0].report_data;
            setCashInHand(latestReport.cashInHand || 100000);
            setAccountBalance(latestReport.accountBalance || 100000);
            setActiveTrades(latestReport.activeTrades || []);
            setClosedTrades(latestReport.closedTrades || []);
            setTransactions(latestReport.transactions || []);
          }
        }

        // Load from localStorage as fallback (if no saved reports)
        loadLocalData();

      } catch (err) {
        console.error("Error loading user data:", err);
        setError("Failed to load your trading data. Using local storage.");
        loadLocalData();
      } finally {
        setLoadingData(false);
      }
    };

    loadUserData();
  }, [user, isLoaded]);

  // Save current state as a report
  const saveCurrentReport = async (reportTitle = "Trading Report") => {
    if (!user) {
      alert("Please sign in to save reports");
      return;
    }

    setSavingReport(true);
    try {
      const reportData = {
        cashInHand,
        accountBalance,
        activeTrades,
        closedTrades,
        transactions,
        positionSize,
        lastUpdated: new Date().toISOString()
      };

      const { error } = await supabase
        .from("saved_reports")
        .insert({
          userid: user.id,
          report_name: reportTitle,
          report_data: reportData,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Refresh saved reports list
      const { data: newReports, error: fetchError } = await supabase
        .from("saved_reports")
        .select("*")
        .eq("userid", user.id)
        .order("created_at", { ascending: false });

      if (!fetchError) {
        setSavedReports(newReports);
      }

      alert(`✅ Report "${reportTitle}" saved successfully!`);
      setShowReportsModal(false);
      setReportName("");

    } catch (err) {
      console.error("Error saving report:", err);
      alert("❌ Failed to save report. Please try again.");
    } finally {
      setSavingReport(false);
    }
  };

  // Load a saved report
  const loadSavedReport = async (reportId) => {
    try {
      const { data: report, error } = await supabase
        .from("saved_reports")
        .select("*")
        .eq("id", reportId)
        .single();

      if (error) throw error;

      const reportData = report.report_data;
      setCashInHand(reportData.cashInHand || 100000);
      setAccountBalance(reportData.accountBalance || 100000);
      setActiveTrades(reportData.activeTrades || []);
      setClosedTrades(reportData.closedTrades || []);
      setTransactions(reportData.transactions || []);
      setPositionSize(reportData.positionSize || null);

      alert(`✅ Report "${report.report_name}" loaded successfully!`);
    } catch (err) {
      console.error("Error loading report:", err);
      alert("❌ Failed to load report. Please try again.");
    }
  };

  // Delete a saved report
  const deleteSavedReport = async (reportId, reportName) => {
    if (window.confirm(`Are you sure you want to delete report "${reportName}"?`)) {
      try {
        const { error } = await supabase
          .from("saved_reports")
          .delete()
          .eq("id", reportId);

        if (error) throw error;

        // Update local state
        setSavedReports(prev => prev.filter(report => report.id !== reportId));
        alert(`✅ Report deleted successfully!`);
      } catch (err) {
        console.error("Error deleting report:", err);
        alert("❌ Failed to delete report. Please try again.");
      }
    }
  };

  // Local storage fallback functions
  const loadLocalData = () => {
    const userId = user ? user.id : 'guest';
    
    const savedCash = localStorage.getItem(`tradeCash_${userId}`);
    const savedBalance = localStorage.getItem(`tradeBalance_${userId}`);
    const savedActiveTrades = localStorage.getItem(`activeTrades_${userId}`);
    const savedClosedTrades = localStorage.getItem(`closedTrades_${userId}`);
    const savedTransactions = localStorage.getItem(`transactions_${userId}`);
    
    if (savedCash) setCashInHand(parseFloat(savedCash));
    if (savedBalance) setAccountBalance(parseFloat(savedBalance));
    if (savedActiveTrades) setActiveTrades(JSON.parse(savedActiveTrades));
    if (savedClosedTrades) setClosedTrades(JSON.parse(savedClosedTrades));
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
  };

  const saveLocalData = () => {
    const userId = user ? user.id : 'guest';
    
    localStorage.setItem(`tradeCash_${userId}`, cashInHand.toString());
    localStorage.setItem(`tradeBalance_${userId}`, accountBalance.toString());
    localStorage.setItem(`activeTrades_${userId}`, JSON.stringify(activeTrades));
    localStorage.setItem(`closedTrades_${userId}`, JSON.stringify(closedTrades));
    localStorage.setItem(`transactions_${userId}`, JSON.stringify(transactions));
  };

  // Auto-save to localStorage when changes occur
  useEffect(() => {
    if (!loadingData) {
      saveLocalData();
    }
  }, [cashInHand, accountBalance, activeTrades, closedTrades, transactions, user]);

  // Calculate position size
  const calculatePositionSize = async () => {
    if (!user && !isPremium) {
      alert("Please sign in to use the trading calculator");
      return;
    }

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
      dateOpened: new Date().toISOString(),
      status: "active",
      notes: "",
      user_id: user?.id || 'guest'
    };

    // Add to active trades
    const updatedTrades = [...activeTrades, newTrade];
    setActiveTrades(updatedTrades);

    // Update cash
    const newCash = cashInHand - requiredCapital;
    setCashInHand(newCash);

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
      cashAfter: newCash,
      user_id: user?.id || 'guest'
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
  const handleConfirmCloseTrade = async () => {
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
      dateClosed: new Date().toISOString(),
      status: "closed",
      closeNotes: closeNotes,
      user_id: user?.id || 'guest'
    };

    // Update cash
    const newCash = cashInHand + tradeToClose.investedCapital + profitLoss;
    setCashInHand(newCash);

    // Update account balance
    const newBalance = accountBalance + profitLoss;
    setAccountBalance(newBalance);

    // Move trade
    const updatedActive = activeTrades.filter(t => t.id !== tradeToClose.id);
    setActiveTrades(updatedActive);
    
    const updatedClosed = [closedTrade, ...closedTrades];
    setClosedTrades(updatedClosed);

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
      cashAfter: newCash,
      user_id: user?.id || 'guest'
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
      dateClosed: new Date().toISOString(),
      status: "closed",
      closeNotes: `Closed at ${type === 'target' ? 'Target' : 'Stop Loss'}`,
      user_id: user?.id || 'guest'
    };

    // Update cash
    const newCash = cashInHand + trade.investedCapital + profitLoss;
    setCashInHand(newCash);

    // Update balance
    const newBalance = accountBalance + profitLoss;
    setAccountBalance(newBalance);

    // Move trade
    setActiveTrades(prev => prev.filter(t => t.id !== trade.id));
    
    const updatedClosed = [closedTrade, ...closedTrades];
    setClosedTrades(updatedClosed);

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
      cashAfter: newCash,
      user_id: user?.id || 'guest'
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
        
        const updatedActive = activeTrades.filter(t => t.id !== tradeId);
        setActiveTrades(updatedActive);

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
          cashAfter: newCash,
          user_id: user?.id || 'guest'
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
      
      // LOG DEPOSIT/WITHDRAWAL
      const cashTransaction = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        type: difference > 0 ? "DEPOSIT" : "WITHDRAWAL",
        amount: Math.abs(difference),
        action: difference > 0 ? "ADDED_FUNDS" : "WITHDREW_FUNDS",
        cashAfter: newAmount,
        user_id: user?.id || 'guest'
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

    // LOG DEPOSIT
    const depositTransaction = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      type: "DEPOSIT",
      amount: amount,
      action: "ADDED_FUNDS",
      cashBefore: cashInHand,
      cashAfter: newCash,
      user_id: user?.id || 'guest'
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

      // LOG WITHDRAWAL
      const withdrawalTransaction = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        type: "WITHDRAWAL",
        amount: amount,
        action: "WITHDREW_FUNDS",
        cashBefore: cashInHand,
        cashAfter: newCash,
        user_id: user?.id || 'guest'
      };
      
      setTransactions(prev => [withdrawalTransaction, ...prev]);

      alert(`Withdrew ₹${amount.toLocaleString()}`);
    } else {
      alert("Insufficient funds!");
    }
  };

  const handleResetAll = () => {
    if (window.confirm("Reset all data? This cannot be undone.")) {
      // Reset local state
      setCashInHand(100000);
      setAccountBalance(100000);
      setActiveTrades([]);
      setClosedTrades([]);
      setPositionSize(null);
      
      // LOG RESET
      const resetTransaction = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        type: "RESET",
        action: "SYSTEM_RESET",
        reason: "User reset all data",
        cashAfter: 100000,
        user_id: user?.id || 'guest'
      };
      
      setTransactions([resetTransaction]);

      // Save to localStorage
      saveLocalData();
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

  // Export to Excel - Premium feature
  const exportToExcel = () => {
    if (!user) {
      alert("Please sign in to export data");
      return;
    }

    if (!isPremium) {
      alert("🔒 Premium feature. Please upgrade to export reports.");
      return;
    }

    if (transactions.length === 0) {
      alert("No transactions to export!");
      return;
    }

    try {
      // Create Excel data
      const excelData = [
        ["TRADING TRANSACTIONS REPORT"],
        ["User:", user.fullName || user.primaryEmailAddress?.emailAddress],
        ["User ID:", user.id],
        ["Generated on:", new Date().toLocaleString()],
        ["Premium User:", isPremium ? "Yes" : "No"],
        [],
        ["TRANSACTION HISTORY"],
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
        ]),
        [],
        ["PORTFOLIO SUMMARY"],
        ["Cash in Hand", `₹${cashInHand.toLocaleString()}`],
        ["Account Balance", `₹${accountBalance.toLocaleString()}`],
        ["Active Trades", activeTrades.length],
        ["Closed Trades", closedTrades.length],
        ["Total Transactions", transactions.length],
        ["Net P&L", `₹${transactions.reduce((sum, t) => sum + (t.profitLoss || 0), 0).toLocaleString()}`]
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
      link.download = `Trading_Report_${user.id}_${new Date().toISOString().split('T')[0]}.csv`;
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        alert(`✅ Excel Report Generated!
        
📊 User: ${user.fullName || user.primaryEmailAddress?.emailAddress}
📈 Transactions: ${transactions.length}
💾 File: Trading_Report_[UserID]_[date].csv`);
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

  // Loading state
  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your trading data...</p>
          <p className="text-sm text-gray-500 mt-2">{user ? `Welcome back, ${user.fullName}` : "Please wait"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">ProTrade Calculator</h1>
            <p className="text-gray-600 mt-2">
              {user ? `Welcome, ${user.fullName || user.primaryEmailAddress?.emailAddress}` : "Professional Trading System"}
            </p>
            <div className="flex items-center space-x-3 mt-2">
              {error && (
                <span className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {error}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="bg-white px-4 py-2 rounded-lg shadow border border-gray-200">
              <p className="text-sm text-gray-500">Cash in Hand</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{cashInHand.toLocaleString()}
              </p>
            </div>
            {!user ? (
              <button 
                onClick={() => window.location.href = "/sign-in"}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90"
              >
                Sign In to Save Data
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowReportsModal(true)}
                  className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Report
                </button>
                <button 
                  onClick={() => setIsPremium(!isPremium)}
                  className={`px-6 py-3 rounded-lg font-semibold ${isPremium ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'}`}
                >
                  {isPremium ? '🚀 PREMIUM' : '⚡ FREE'}
                </button>
              </div>
            )}
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
          {user && isPremium && (
            <button
              onClick={exportToExcel}
              disabled={transactions.length === 0}
              className={`px-4 py-2 rounded-lg ${transactions.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-90'} text-white`}
            >
              📊 Export Excel
            </button>
          )}
          <button
            onClick={handleResetAll}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 ml-auto"
          >
            Reset All
          </button>
        </div>

        {/* Premium Notice */}
        {user && !isPremium && (
          <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Free Account Limitations
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Upgrade to premium to export Excel reports and access advanced analytics.
                </p>
                <button
                  onClick={() => window.location.href = "/pricing"}
                  className="mt-2 text-sm font-medium text-amber-800 hover:text-amber-900 underline"
                >
                  View premium features →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Calculator */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Calculator className="w-6 h-6 mr-2 text-blue-600" />
              Position Calculator
            </h2>
            
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
                disabled={!user && !isPremium}
                className={`w-full py-4 text-white rounded-xl font-bold text-lg hover:opacity-90 ${!user && !isPremium ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}
              >
                {tradeType === "LONG" ? "📈 Calculate & Buy" : "📉 Calculate & Short"}
              </button>
            </div>
          </div>

          {/* Active Trades */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Active Trades ({activeTrades.length})</h3>
              <span className="text-sm text-gray-500">
                {user ? `${savedReports.length} reports saved` : "Sign in to save reports"}
              </span>
            </div>
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
                    
                    <div className="flex gap-2 flex-wrap">
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
                <p className="text-sm mt-1">{user ? "Start trading to see your positions here" : "Sign in to start trading"}</p>
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
                <p className="text-sm text-gray-500 mt-1">
                  {user ? "Your trading history" : "Sign in to save your trades"}
                </p>
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
                  <p className="text-sm mt-1">
                    {user ? "Start trading to see your journal" : "Sign in to start tracking trades"}
                  </p>
                </div>
              )}
            </div>
            
            {/* Export Footer */}
            {user && isPremium && transactions.length > 0 && (
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

          {/* User Info Panel */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-xl p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Account Info</h3>
            
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.fullName || "User"}</p>
                    <p className="text-sm text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${isPremium ? 'text-purple-600' : 'text-gray-600'}`}>
                      {isPremium ? '🚀 Premium' : '⚡ Free'}
                    </p>
                    <p className="text-xs text-gray-500">Account Type</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Balance</p>
                    <p className="text-lg font-bold text-gray-900">₹{accountBalance.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center">
                    <p className="text-sm text-gray-600">Available Cash</p>
                    <p className="text-lg font-bold text-green-600">₹{cashInHand.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-900">Saved Reports</p>
                    <span className="text-sm text-blue-600">{savedReports.length}</span>
                  </div>
                  {savedReports.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {savedReports.slice(0, 3).map(report => (
                        <div key={report.id} className="flex items-center justify-between p-2 bg-white rounded-lg hover:bg-gray-50">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{report.report_name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(report.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => loadSavedReport(report.id)}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Load
                          </button>
                        </div>
                      ))}
                      {savedReports.length > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          + {savedReports.length - 3} more reports
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No saved reports yet
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-4xl mb-4 text-gray-400">🔒</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Sign In Required</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Sign in to save your trades, access from any device, and export reports.
                </p>
                <button
                  onClick={() => window.location.href = "/sign-in"}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90"
                >
                  Sign In / Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Reports Modal */}
      {showReportsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Saved Reports</h3>
              <button
                onClick={() => setShowReportsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Save New Report */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <h4 className="font-medium text-gray-900 mb-3">Save Current State</h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={() => saveCurrentReport(reportName || `Report ${savedReports.length + 1}`)}
                  disabled={savingReport}
                  className={`px-4 py-2 rounded-lg ${savingReport ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-600 to-purple-600'} text-white`}
                >
                  {savingReport ? 'Saving...' : 'Save'}
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Save your current trades, cash balance, and transactions.
              </p>
            </div>

            {/* Saved Reports List */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Your Saved Reports ({savedReports.length})</h4>
              {savedReports.length > 0 ? (
                savedReports.map(report => (
                  <div key={report.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-bold text-gray-900">{report.report_name}</h5>
                        <p className="text-sm text-gray-600">
                          Created: {new Date(report.created_at).toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            Cash: ₹{report.report_data.cashInHand?.toLocaleString() || '0'}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            Trades: {report.report_data.activeTrades?.length || 0}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            Transactions: {report.report_data.transactions?.length || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => loadSavedReport(report.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteSavedReport(report.id, report.report_name)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">📂</div>
                  <p>No saved reports yet</p>
                  <p className="text-sm mt-1">Save your first report above</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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