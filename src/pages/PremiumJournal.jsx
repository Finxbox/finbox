// src/pages/PremiumJournal.jsx
import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase";
import { Download, Filter, Search, TrendingUp, TrendingDown, Calendar, BarChart3, FileSpreadsheet, Trash2, Eye, RefreshCw } from "lucide-react";

const PremiumJournal = () => {
  const { user, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  
  // =====================
  // STATE MANAGEMENT
  // =====================
  const [savedReports, setSavedReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [stats, setStats] = useState({
    totalReports: 0,
    totalProfit: 0,
    totalLoss: 0,
    winRate: 0,
    avgRisk: 0,
    totalTrades: 0,
  });
  
  // =====================
  // FILTER & SEARCH
  // =====================
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [tradeTypeFilter, setTradeTypeFilter] = useState("ALL");
  const [profitFilter, setProfitFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  // =====================
  // INITIALIZE & LOAD DATA
  // =====================
  useEffect(() => {
    const initializePage = async () => {
      if (!isLoaded) return;
      
      if (!user) {
        // Redirect to login or show login prompt
        const shouldLogin = confirm("You need to login to access your premium trading journal. Would you like to login now?");
        if (shouldLogin) {
          openSignIn();
        } else {
          window.location.href = "/";
        }
        return;
      }
      
      await checkPremiumStatus();
    };
    
    initializePage();
  }, [user, isLoaded]);

  useEffect(() => {
    if (isPremium && user) {
      loadSavedReports();
    }
  }, [isPremium, user]);

  useEffect(() => {
    applyFilters();
  }, [savedReports, searchTerm, dateRange, tradeTypeFilter, profitFilter, sortBy]);

  // =====================
  // AUTHENTICATION & PREMIUM CHECKS
  // =====================
  const checkPremiumStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error("Error checking premium status:", error);
        setIsPremium(false);
        return;
      }
      
      setIsPremium(data.is_premium);
      
      if (!data.is_premium) {
        const upgrade = confirm("This is a premium feature. Upgrade to access your trading journal. Would you like to upgrade?");
        if (upgrade) {
          window.location.href = "/pricing";
        } else {
          window.location.href = "/";
        }
      }
    } catch (error) {
      console.error("Error checking premium status:", error);
      setIsPremium(false);
    }
  };

  // =====================
  // LOAD SAVED REPORTS
  // =====================
  const loadSavedReports = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('saved_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        if (error.message.includes("row-level security")) {
          alert("You don't have permission to access this feature. Please ensure you have an active premium subscription.");
          return;
        }
        throw error;
      }
      
      setSavedReports(data || []);
      calculateStats(data || []);
      
    } catch (error) {
      console.error("Error loading saved reports:", error);
      alert("Failed to load your trading journal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // CALCULATE STATISTICS
  // =====================
  const calculateStats = (reports) => {
    if (!reports.length) {
      setStats({
        totalReports: 0,
        totalProfit: 0,
        totalLoss: 0,
        winRate: 0,
        avgRisk: 0,
        totalTrades: 0,
      });
      return;
    }
    
    let totalProfit = 0;
    let totalLoss = 0;
    let winningTrades = 0;
    let totalTrades = 0;
    let totalRisk = 0;
    
    reports.forEach(report => {
      const data = report.report_data;
      if (data) {
        totalTrades++;
        totalRisk += data.actualRisk || 0;
        
        // Calculate P&L based on target vs entry
        if (data.target && data.entryPrice) {
          const priceDiff = data.target - data.entryPrice;
          const tradeProfit = priceDiff * (data.finalQty || 0);
          
          if (tradeProfit > 0) {
            totalProfit += tradeProfit;
            winningTrades++;
          } else {
            totalLoss += Math.abs(tradeProfit);
          }
        }
      }
    });
    
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const avgRisk = totalTrades > 0 ? totalRisk / totalTrades : 0;
    
    setStats({
      totalReports: reports.length,
      totalProfit,
      totalLoss,
      winRate,
      avgRisk,
      totalTrades,
    });
  };

  // =====================
  // FILTER FUNCTIONS
  // =====================
  const applyFilters = () => {
    let filtered = [...savedReports];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report => {
        const data = report.report_data;
        const searchLower = searchTerm.toLowerCase();
        
        return (
          (data.tradeType && data.tradeType.toLowerCase().includes(searchLower)) ||
          (data.entryPrice && data.entryPrice.toString().includes(searchTerm)) ||
          (data.created_at && data.created_at.toLowerCase().includes(searchLower))
        );
      });
    }
    
    // Date range filter
    if (dateRange.startDate) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.created_at);
        const startDate = new Date(dateRange.startDate);
        return reportDate >= startDate;
      });
    }
    
    if (dateRange.endDate) {
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.created_at);
        const endDate = new Date(dateRange.endDate);
        endDate.setHours(23, 59, 59, 999);
        return reportDate <= endDate;
      });
    }
    
    // Trade type filter
    if (tradeTypeFilter !== "ALL") {
      filtered = filtered.filter(report => 
        report.report_data?.tradeType === tradeTypeFilter
      );
    }
    
    // Profit filter
    if (profitFilter === "PROFIT") {
      filtered = filtered.filter(report => {
        const data = report.report_data;
        if (!data.target || !data.entryPrice) return false;
        const priceDiff = data.target - data.entryPrice;
        return priceDiff > 0;
      });
    } else if (profitFilter === "LOSS") {
      filtered = filtered.filter(report => {
        const data = report.report_data;
        if (!data.target || !data.entryPrice) return false;
        const priceDiff = data.target - data.entryPrice;
        return priceDiff < 0;
      });
    }
    
    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      
      switch (sortBy) {
        case "newest":
          return dateB - dateA;
        case "oldest":
          return dateA - dateB;
        case "profit_high":
          return (b.report_data?.target || 0) - (a.report_data?.target || 0);
        case "profit_low":
          return (a.report_data?.target || 0) - (b.report_data?.target || 0);
        case "risk_high":
          return (b.report_data?.actualRisk || 0) - (a.report_data?.actualRisk || 0);
        case "risk_low":
          return (a.report_data?.actualRisk || 0) - (b.report_data?.actualRisk || 0);
        default:
          return dateB - dateA;
      }
    });
    
    setFilteredReports(filtered);
  };

  // =====================
  // REPORT ACTIONS
  // =====================
  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  const handleDeleteReport = (report) => {
    setReportToDelete(report);
    setShowDeleteModal(true);
  };

  const confirmDeleteReport = async () => {
    if (!reportToDelete) return;
    
    try {
      const { error } = await supabase
        .from('saved_reports')
        .delete()
        .eq('id', reportToDelete.id);
        
      if (error) throw error;
      
      // Update local state
      setSavedReports(prev => prev.filter(r => r.id !== reportToDelete.id));
      
      // If deleting the currently viewed report, clear selection
      if (selectedReport?.id === reportToDelete.id) {
        setSelectedReport(null);
      }
      
      alert("Report deleted successfully");
      
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete report");
    } finally {
      setShowDeleteModal(false);
      setReportToDelete(null);
    }
  };

  // =====================
  // EXPORT FUNCTIONS
  // =====================
  const exportToExcel = async () => {
    if (!filteredReports.length) {
      alert("No reports to export");
      return;
    }
    
    try {
      setExporting(true);
      
      // Prepare Excel data
      const excelData = [
        ["PREMIUM TRADING JOURNAL REPORT"],
        ["Generated on:", new Date().toLocaleString()],
        ["Total Reports:", filteredReports.length],
        ["Total Trades:", stats.totalTrades],
        ["Win Rate:", `${stats.winRate.toFixed(2)}%`],
        ["Net P&L:", `₹${(stats.totalProfit - stats.totalLoss).toLocaleString()}`],
        [],
        ["ID", "Date", "Trade Type", "Entry", "Stop Loss", "Target", "Quantity", "Capital Used", "Risk Amount", "Risk %", "Cash Left", "Status", "Expected P&L"],
        ...filteredReports.map((report, index) => {
          const data = report.report_data || {};
          const entry = data.entryPrice || 0;
          const target = data.target || 0;
          const quantity = data.finalQty || 0;
          const expectedProfit = (target - entry) * quantity;
          const status = target > entry ? "PROFIT" : target < entry ? "LOSS" : "BREAKEVEN";
          
          return [
            index + 1,
            new Date(report.created_at).toLocaleDateString(),
            data.tradeType || "N/A",
            `₹${entry}`,
            `₹${data.stopLoss || 0}`,
            `₹${target}`,
            quantity,
            `₹${data.capitalUsed || 0}`,
            `₹${data.actualRisk || 0}`,
            `${data.riskPercent || 0}%`,
            `₹${data.cashLeft || 0}`,
            status,
            `₹${expectedProfit.toLocaleString()}`
          ];
        })
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
      link.download = `Premium_Trading_Journal_${new Date().toISOString().split('T')[0]}.csv`;
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        alert(`✅ Premium Journal Report Generated!
        
📊 Reports: ${filteredReports.length}
📈 Trades: ${stats.totalTrades}
💰 Net P&L: ₹${(stats.totalProfit - stats.totalLoss).toLocaleString()}
💾 File saved to downloads`);
      }, 100);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('❌ Failed to export. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const exportSingleReport = (report) => {
    const data = report.report_data || {};
    
    const excelData = [
      ["TRADE REPORT DETAILS"],
      ["Report ID:", report.id],
      ["Date:", new Date(report.created_at).toLocaleString()],
      [],
      ["TRADE INFORMATION"],
      ["Trade Type:", data.tradeType || "N/A"],
      ["Entry Price:", `₹${data.entryPrice || 0}`],
      ["Stop Loss:", `₹${data.stopLoss || 0}`],
      ["Target Price:", `₹${data.target || 0}`],
      ["Risk Percentage:", `${data.riskPercent || 0}%`],
      [],
      ["POSITION CALCULATION"],
      ["Account Balance:", `₹${data.accountBalance || 0}`],
      ["Cash Available:", `₹${data.cashInHand || data.cashLeft || 0}`],
      ["Position Size:", data.finalQty || 0],
      ["Capital Used:", `₹${data.capitalUsed || 0}`],
      ["Cash Left:", `₹${data.cashLeft || 0}`],
      ["Risk Amount:", `₹${data.actualRisk || 0}`],
      [],
      ["CALCULATION DETAILS"],
      ["Quantity by Risk:", data.qtyByRisk || 0],
      ["Quantity by Cash:", data.qtyByCash || 0],
      ["Final Quantity:", data.finalQty || 0],
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
    link.download = `Trade_Report_${report.id}_${new Date(report.created_at).toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =====================
  // FORMATTING HELPERS
  // =====================
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTradeStatus = (report) => {
    const data = report.report_data;
    if (!data.target || !data.entryPrice) return "UNKNOWN";
    
    const priceDiff = data.target - data.entryPrice;
    if (priceDiff > 0) return "PROFIT";
    if (priceDiff < 0) return "LOSS";
    return "BREAKEVEN";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PROFIT": return "bg-green-100 text-green-800";
      case "LOSS": return "bg-red-100 text-red-800";
      case "BREAKEVEN": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTradeTypeColor = (type) => {
    return type === "LONG" 
      ? "bg-blue-100 text-blue-800" 
      : "bg-purple-100 text-purple-800";
  };

  // =====================
  // RENDER
  // =====================
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your premium journal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please login to access your premium trading journal.</p>
          <button
            onClick={() => openSignIn()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Login to Continue
          </button>
        </div>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-3xl">⭐</span>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Premium Feature</h2>
          <p className="text-gray-600 mb-6">
            Your trading journal is a premium feature. Upgrade to access all your saved reports, analytics, and export capabilities.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = "/pricing"}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:opacity-90"
            >
              Upgrade to Premium
            </button>
            <button
              onClick={() => window.location.href = "/"}
              className="w-full py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back to Calculator
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Premium Trading Journal</h1>
              <p className="text-gray-600 mt-2">Access all your saved trades, analytics, and reports</p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <button
                onClick={loadSavedReports}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              {filteredReports.length > 0 && (
                <button
                  onClick={exportToExcel}
                  disabled={exporting}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 flex items-center"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  {exporting ? "Exporting..." : "Export All"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
            <p className="text-sm text-blue-600 font-medium">Total Reports</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
            <p className="text-sm text-green-600 font-medium">Total Profit</p>
            <p className="text-2xl font-bold text-gray-900">₹{stats.totalProfit.toLocaleString()}</p>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-xl">
            <p className="text-sm text-red-600 font-medium">Total Loss</p>
            <p className="text-2xl font-bold text-gray-900">₹{stats.totalLoss.toLocaleString()}</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
            <p className="text-sm text-purple-600 font-medium">Win Rate</p>
            <p className="text-2xl font-bold text-gray-900">{stats.winRate.toFixed(1)}%</p>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl">
            <p className="text-sm text-orange-600 font-medium">Avg Risk</p>
            <p className="text-2xl font-bold text-gray-900">₹{stats.avgRisk.toLocaleString()}</p>
          </div>
          
          <div className="bg-gradient-to-r from-cyan-50 to-cyan-100 p-4 rounded-xl">
            <p className="text-sm text-cyan-600 font-medium">Total Trades</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalTrades}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Filters & Report List */}
          <div className="lg:w-2/3">
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Filter className="w-5 h-5 mr-2" />
                  Filters & Search
                </h3>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setDateRange({ startDate: "", endDate: "" });
                    setTradeTypeFilter("ALL");
                    setProfitFilter("ALL");
                    setSortBy("newest");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Reports
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by trade type, entry price, date..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                
                {/* Quick Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trade Type
                    </label>
                    <select
                      value={tradeTypeFilter}
                      onChange={(e) => setTradeTypeFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="ALL">All Types</option>
                      <option value="LONG">Long Only</option>
                      <option value="SHORT">Short Only</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profit/Loss
                    </label>
                    <select
                      value={profitFilter}
                      onChange={(e) => setProfitFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="ALL">All Trades</option>
                      <option value="PROFIT">Profit Only</option>
                      <option value="LOSS">Loss Only</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="profit_high">Highest Profit</option>
                      <option value="profit_low">Lowest Profit</option>
                      <option value="risk_high">Highest Risk</option>
                      <option value="risk_low">Lowest Risk</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Reports List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Saved Reports ({filteredReports.length})
                </h3>
                <span className="text-sm text-gray-500">
                  {loading ? "Loading..." : `${filteredReports.length} of ${savedReports.length} reports`}
                </span>
              </div>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading your premium journal...</p>
                </div>
              ) : filteredReports.length > 0 ? (
                <div className="space-y-4">
                  {filteredReports.map((report) => {
                    const data = report.report_data || {};
                    const status = getTradeStatus(report);
                    const expectedProfit = data.target && data.entryPrice && data.finalQty 
                      ? (data.target - data.entryPrice) * data.finalQty
                      : 0;
                    
                    return (
                      <div
                        key={report.id}
                        className={`border rounded-xl p-4 hover:border-blue-300 transition-colors ${
                          selectedReport?.id === report.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          {/* Left side */}
                          <div className="mb-4 md:mb-0 md:flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTradeTypeColor(data.tradeType)}`}>
                                {data.tradeType || "N/A"}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(status)}`}>
                                {status}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatDate(report.created_at)}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <p className="text-gray-500">Entry</p>
                                <p className="font-semibold">₹{data.entryPrice || 0}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Target</p>
                                <p className="font-semibold text-green-600">₹{data.target || 0}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Quantity</p>
                                <p className="font-semibold">{data.finalQty || 0}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Expected P&L</p>
                                <p className={`font-semibold ${
                                  expectedProfit > 0 ? 'text-green-600' : 
                                  expectedProfit < 0 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  ₹{Math.abs(expectedProfit).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right side - Actions */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewReport(report)}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center text-sm"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => exportSingleReport(report)}
                              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center text-sm"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Export
                            </button>
                            <button
                              onClick={() => handleDeleteReport(report)}
                              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center text-sm"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h4>
                  <p className="text-gray-500 mb-6">
                    {savedReports.length === 0 
                      ? "You haven't saved any trading reports yet. Start by calculating a position and saving it to your journal."
                      : "No reports match your current filters. Try adjusting your search criteria."}
                  </p>
                  {savedReports.length === 0 && (
                    <button
                      onClick={() => window.location.href = "/"}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Go to Calculator
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Column - Report Details */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Report Details</h3>
              
              {selectedReport ? (
                <div className="space-y-6">
                  {/* Report Header */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTradeTypeColor(selectedReport.report_data?.tradeType)}`}>
                          {selectedReport.report_data?.tradeType || "N/A"}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getTradeStatus(selectedReport))}`}>
                          {getTradeStatus(selectedReport)}
                        </span>
                      </div>
                      <button
                        onClick={() => exportSingleReport(selectedReport)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        Export
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-500">
                      Saved on {formatDate(selectedReport.created_at)}
                    </p>
                  </div>
                  
                  {/* Trade Details */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Trade Information</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Entry Price</p>
                        <p className="text-lg font-semibold">₹{selectedReport.report_data?.entryPrice || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Stop Loss</p>
                        <p className="text-lg font-semibold text-red-600">₹{selectedReport.report_data?.stopLoss || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Target Price</p>
                        <p className="text-lg font-semibold text-green-600">₹{selectedReport.report_data?.target || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Risk %</p>
                        <p className="text-lg font-semibold">{selectedReport.report_data?.riskPercent || 0}%</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Position Details */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Position Calculation</h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Account Balance</span>
                        <span className="font-semibold">₹{selectedReport.report_data?.accountBalance?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Position Size</span>
                        <span className="font-semibold">{selectedReport.report_data?.finalQty || 0} units</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Capital Used</span>
                        <span className="font-semibold">₹{selectedReport.report_data?.capitalUsed?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Cash Left</span>
                        <span className="font-semibold">₹{selectedReport.report_data?.cashLeft?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Risk Amount</span>
                        <span className="font-semibold text-orange-600">₹{selectedReport.report_data?.actualRisk?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expected Outcome */}
                  {selectedReport.report_data?.target && selectedReport.report_data?.entryPrice && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl">
                      <h4 className="font-medium text-gray-900 mb-2">Expected Outcome</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">If target is hit:</p>
                          <p className="text-2xl font-bold text-green-600">
                            ₹{((selectedReport.report_data.target - selectedReport.report_data.entryPrice) * (selectedReport.report_data.finalQty || 0)).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Return</p>
                          <p className="text-lg font-semibold">
                            {selectedReport.report_data.target && selectedReport.report_data.entryPrice
                              ? (((selectedReport.report_data.target - selectedReport.report_data.entryPrice) / selectedReport.report_data.entryPrice) * 100).toFixed(2)
                              : "0.00"}%
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleDeleteReport(selectedReport)}
                      className="w-full py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Report
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Select a Report</h4>
                  <p className="text-gray-500">
                    Click on any report from the list to view detailed information here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Report</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this report? This action cannot be undone.
            </p>
            
            {reportToDelete && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="font-medium text-gray-900">
                  {reportToDelete.report_data?.tradeType || "Trade"} - ₹{reportToDelete.report_data?.entryPrice || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(reportToDelete.created_at)}
                </p>
              </div>
            )}
            
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setReportToDelete(null);
                }}
                className="px-6 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReport}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumJournal;