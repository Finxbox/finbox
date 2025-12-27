import { useState, useEffect } from "react";
import { 
  PieChart, DollarSign, TrendingUp, Shield, BarChart3, 
  Download, Share2, Save, Zap, Target, Calculator,
  AlertCircle, Info, BarChart, LineChart,
  X, Plus, Trash2, Eye, EyeOff, Settings
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const QuantumPortfolioManager = () => {
  const { user } = useUser();

  // User & Subscription State
  const [isPremium, setIsPremium] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  // Portfolio State
  const [capital, setCapital] = useState(1000000);
  const [assets, setAssets] = useState([]);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("calculator");
  const [portfolioName, setPortfolioName] = useState("My Quantum Portfolio");
  const [savedPortfolios, setSavedPortfolios] = useState([]);
  const [riskProfile, setRiskProfile] = useState("balanced");
  const [marketCondition, setMarketCondition] = useState("normal");
  
  // Position Size Calculator State
  const [showPositionCalculator, setShowPositionCalculator] = useState(false);
  const [positionCalcData, setPositionCalcData] = useState({
    capital: "",
    riskPercent: "",
    entryPrice: "",
    stopLoss: "",
    quantity: 0
  });
  
  // UI State
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid, chart, table

  /* ===============================
     ASSET VOLATILITY MAP (Enhanced)
     =============================== */
  const volatilityMap = {
    "Large-cap": { 
      volatility: 0.10, 
      description: "Stable blue-chip companies", 
      color: "#3B82F6",
      icon: "🏢",
      expectedReturn: 0.12,
      maxAllocation: 0.40
    },
    "Mid-cap": { 
      volatility: 0.15, 
      description: "Growing companies with potential", 
      color: "#8B5CF6",
      icon: "📈",
      expectedReturn: 0.18,
      maxAllocation: 0.30
    },
    "Small-cap": { 
      volatility: 0.25, 
      description: "High-growth potential, higher risk", 
      color: "#EF4444",
      icon: "🚀",
      expectedReturn: 0.25,
      maxAllocation: 0.25
    },
    "Bonds": { 
      volatility: 0.05, 
      description: "Fixed income, low risk", 
      color: "#10B981",
      icon: "📊",
      expectedReturn: 0.07,
      maxAllocation: 0.50
    },
    "Mutual Fund": { 
      volatility: 0.12, 
      description: "Professional managed funds", 
      color: "#F59E0B",
      icon: "🏦",
      expectedReturn: 0.15,
      maxAllocation: 0.35
    },
    "ETF": { 
      volatility: 0.10, 
      description: "Exchange traded funds", 
      color: "#06B6D4",
      icon: "📊",
      expectedReturn: 0.13,
      maxAllocation: 0.30
    },
    "Crypto": { 
      volatility: 0.35, 
      description: "Cryptocurrency assets", 
      color: "#F97316",
      icon: "₿",
      expectedReturn: 0.35,
      maxAllocation: 0.15
    },
    "Real Estate": { 
      volatility: 0.08, 
      description: "Property investments", 
      color: "#EC4899",
      icon: "🏠",
      expectedReturn: 0.10,
      maxAllocation: 0.30
    },
    "International": { 
      volatility: 0.20, 
      description: "Global markets exposure", 
      color: "#8B5CF6",
      icon: "🌍",
      expectedReturn: 0.16,
      maxAllocation: 0.25
    },
    "Commodities": { 
      volatility: 0.22, 
      description: "Gold, Silver, Oil, etc.", 
      color: "#F59E0B",
      icon: "🛢️",
      expectedReturn: 0.14,
      maxAllocation: 0.20
    }
  };

  // Market condition modifiers
  const marketModifiers = {
    "bullish": { volatility: 0.8, return: 1.2 },
    "normal": { volatility: 1.0, return: 1.0 },
    "bearish": { volatility: 1.2, return: 0.8 },
    "volatile": { volatility: 1.5, return: 1.1 }
  };

  // Risk profile configurations
  const riskProfiles = {
    "conservative": { 
      maxRisk: 0.10,
      assetMix: { "Bonds": 0.4, "Large-cap": 0.3, "Mutual Fund": 0.2, "Real Estate": 0.1 }
    },
    "balanced": { 
      maxRisk: 0.20,
      assetMix: { "Large-cap": 0.25, "Mid-cap": 0.20, "Mutual Fund": 0.20, "ETF": 0.15, "Bonds": 0.10, "International": 0.10 }
    },
    "aggressive": { 
      maxRisk: 0.35,
      assetMix: { "Small-cap": 0.25, "Mid-cap": 0.20, "Crypto": 0.15, "Large-cap": 0.15, "International": 0.10, "Commodities": 0.10, "ETF": 0.05 }
    }
  };

  /* ===============================
     FETCH USER & SUBSCRIPTION DATA
     =============================== */
 useEffect(() => {
  // Always initialize with sample data
  const initialAssets = [
    { id: 1, company: "Reliance Industries", price: "2450", type: "Large-cap", volatility: 0.1 },
    { id: 2, company: "TCS", price: "3650", type: "Large-cap", volatility: 0.1 },
    { id: 3, company: "HDFC Bank", price: "1650", type: "Large-cap", volatility: 0.1 },
    { id: 4, company: "Infosys", price: "1600", type: "Mid-cap", volatility: 0.15 },
    { id: 5, company: "ICICI Bank", price: "1050", type: "Mid-cap", volatility: 0.15 },
  ];
  setAssets(initialAssets);

  // Load saved portfolios from localStorage
  const savedLocal = localStorage.getItem('quantum_saved_portfolios');
  if (savedLocal) {
    setSavedPortfolios(JSON.parse(savedLocal));
  }

  // If no user, show free version immediately
  if (!user) {
    setIsPremium(false);
    setLoadingSubscription(false);
    return;
  }

  // For logged in users, fetch premium status
  const fetchPremiumStatus = async () => {
    try {
      const cachedPremium = localStorage.getItem('quantum_portfolio_premium');
      if (cachedPremium) {
        const { isPremium, lastChecked } = JSON.parse(cachedPremium);
        const cacheAge = (new Date() - new Date(lastChecked)) / (1000 * 60 * 60);
        
        if (cacheAge < 1) {
          setIsPremium(isPremium);
          setLoadingSubscription(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("is_premium")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setIsPremium(data.is_premium);
        localStorage.setItem('quantum_portfolio_premium', JSON.stringify({
          isPremium: data.is_premium,
          lastChecked: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error("Error fetching premium status:", error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  fetchPremiumStatus();
}, [user]);

  /* ===============================
     PORTFOLIO CALCULATION LOGIC
     =============================== */
  const calculatePortfolio = async () => {
    if (!user) {
      alert("Please sign in to use the portfolio calculator");
      return;
    }

    if (!capital || capital <= 0) {
      alert("Please enter a valid total capital.");
      return;
    }

    if (assets.length === 0) {
      alert("Please add at least one asset to your portfolio");
      return;
    }

    setIsCalculating(true);

    // Simulate calculation delay
    setTimeout(() => {
      const totalCapital = parseFloat(capital);
      let allocations = [];
      let totalWeight = 0;

      // Calculate base weights using inverse volatility
      assets.forEach(({ volatility }) => {
        if (volatility > 0) {
          totalWeight += 1 / volatility;
        }
      });

      // Calculate allocations for each asset
      assets.forEach(({ company, price, volatility, type }) => {
        const priceValue = parseFloat(price);
        if (company && priceValue && volatility > 0) {
          const baseWeight = (1 / volatility) / totalWeight;
          
          // Apply risk profile adjustments
          const profileMultiplier = riskProfiles[riskProfile].assetMix[type] || 0.5;
          const adjustedWeight = baseWeight * profileMultiplier;
          
          // Apply market condition modifier
          const marketModifier = marketModifiers[marketCondition];
          const finalVolatility = volatility * marketModifier.volatility;
          
          // Calculate expected return with market condition
          const baseReturn = volatilityMap[type]?.expectedReturn || 0.15;
          const expectedReturn = baseReturn * marketModifier.return;

          // Calculate position size
          const sharesToBuy = Math.floor((totalCapital * adjustedWeight) / priceValue);
          const investmentValue = sharesToBuy * priceValue;

          if (sharesToBuy > 0) {
            allocations.push({
              companyName: company,
              sharesToBuy,
              investmentValue,
              weight: adjustedWeight,
              type,
              color: volatilityMap[type]?.color || "#694F8E",
              icon: volatilityMap[type]?.icon || "📊",
              volatility: finalVolatility,
              expectedReturn,
              price: priceValue,
              riskAmount: investmentValue * finalVolatility
            });
          }
        }
      });

      // Normalize weights to sum to 1
      const totalAllocatedWeight = allocations.reduce((sum, a) => sum + a.weight, 0);
      allocations = allocations.map(a => ({
        ...a,
        weight: a.weight / totalAllocatedWeight
      }));

      // Sort by investment value
      allocations.sort((a, b) => b.investmentValue - a.investmentValue);

      // Calculate metrics
      const totalSharesValue = allocations.reduce((sum, a) => sum + a.investmentValue, 0);
      const cashInHand = totalCapital - totalSharesValue;

      // Calculate portfolio metrics
      const portfolioVolatility = allocations.reduce((sum, a) => 
        sum + (a.volatility * a.weight), 0
      );
      
      const portfolioReturn = allocations.reduce((sum, a) => 
        sum + (a.expectedReturn * a.weight), 0
      );

      const sharpeRatio = (portfolioReturn - 0.05) / portfolioVolatility; // Assuming 5% risk-free rate

      const resultData = {
        allocations,
        cashInHand,
        totalSharesValue,
        portfolioVolatility,
        portfolioReturn,
        sharpeRatio,
        diversificationScore: calculateDiversificationScore(allocations),
        riskScore: calculateRiskScore(allocations),
        expectedReturn: portfolioReturn,
        maxDrawdown: calculateMaxDrawdown(allocations),
        var95: calculateVaR(allocations, totalCapital)
      };

      setResult(resultData);
      setIsCalculating(false);
    }, 1000);
  };

  /* ===============================
     ADVANCED METRICS CALCULATIONS
     =============================== */
  const calculateDiversificationScore = (allocations) => {
    if (allocations.length === 0) return 0;
    const weights = allocations.map(a => a.weight);
    const herfindahl = weights.reduce((sum, w) => sum + w * w, 0);
    return Math.round((1 - herfindahl) * 100);
  };

  const calculateRiskScore = (allocations) => {
    if (allocations.length === 0) return 0;
    const avgVolatility = allocations.reduce((sum, a) => sum + (a.volatility * a.weight), 0);
    return Math.min(Math.round(avgVolatility * 100), 100);
  };

  const calculateMaxDrawdown = (allocations) => {
    // Simplified max drawdown calculation
    const totalVolatility = allocations.reduce((sum, a) => sum + a.volatility * a.weight, 0);
    return Math.min(totalVolatility * 2, 0.95); // Cap at 95%
  };

  const calculateVaR = (allocations, capital) => {
    // Simplified 95% Value at Risk calculation
    const portfolioVolatility = allocations.reduce((sum, a) => sum + (a.volatility * a.weight), 0);
    return capital * portfolioVolatility * 1.645; // 95% confidence
  };

  /* ===============================
     POSITION SIZE CALCULATOR LOGIC
     =============================== */
  const calculatePositionSize = () => {
    const { capital, riskPercent, entryPrice, stopLoss } = positionCalcData;
    
    if (!capital || !riskPercent || !entryPrice || !stopLoss) {
      alert("Please fill all fields in the position calculator");
      return;
    }

    const capitalNum = Number(capital);
    const riskAmount = (capitalNum * Number(riskPercent)) / 100;
    const perUnitRisk = Math.abs(Number(entryPrice) - Number(stopLoss));
    const quantity = Math.floor(riskAmount / perUnitRisk);

    setPositionCalcData(prev => ({
      ...prev,
      quantity
    }));

    // Auto-add to portfolio if quantity > 0
    if (quantity > 0) {
      const newAsset = {
        id: Date.now(),
        company: `Position Calc - Entry: ${entryPrice}`,
        price: entryPrice,
        type: "Large-cap", // Default type
        volatility: volatilityMap["Large-cap"].volatility
      };
      setAssets([...assets, newAsset]);
      alert(`Position calculated: ${quantity} units. Added to portfolio.`);
    }
  };

  /* ===============================
     PORTFOLIO MANAGEMENT
     =============================== */
  const savePortfolio = async () => {
    if (!result) return;
    
    if (!user) {
      alert("Please sign in to save portfolios");
      return;
    }

    const portfolioData = {
      id: Date.now(),
      name: portfolioName,
      date: new Date().toISOString(),
      capital: capital,
      result: result,
      assets: [...assets],
      riskProfile,
      marketCondition,
      userId: user.id
    };

    try {
      if (isPremium) {
        // Save to Supabase for premium users
        const { error } = await supabase
          .from("saved_portfolios")
          .insert([{
            user_id: user.id,
            name: portfolioName,
            portfolio_data: portfolioData,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      // Always save locally
      const updatedPortfolios = [portfolioData, ...savedPortfolios.slice(0, 9)];
      setSavedPortfolios(updatedPortfolios);
      localStorage.setItem('quantum_saved_portfolios', JSON.stringify(updatedPortfolios));
      
      alert("✅ Portfolio saved successfully!");
    } catch (error) {
      console.error("Error saving portfolio:", error);
      alert("Error saving portfolio. Please try again.");
    }
  };

  const loadPortfolio = (portfolio) => {
    setCapital(portfolio.capital);
    setAssets(portfolio.assets);
    setResult(portfolio.result);
    setPortfolioName(portfolio.name);
    setActiveTab("calculator");
  };

  const deletePortfolio = async (portfolioId, index) => {
    if (window.confirm("Are you sure you want to delete this portfolio?")) {
      try {
        if (isPremium) {
          // Delete from Supabase
          await supabase
            .from("saved_portfolios")
            .delete()
            .eq("id", portfolioId);
        }

        // Delete from local state
        const updatedPortfolios = savedPortfolios.filter((_, i) => i !== index);
        setSavedPortfolios(updatedPortfolios);
        localStorage.setItem('quantum_saved_portfolios', JSON.stringify(updatedPortfolios));
        
        alert("Portfolio deleted successfully");
      } catch (error) {
        console.error("Error deleting portfolio:", error);
      }
    }
  };

  /* ===============================
     EXPORT & SHARE FUNCTIONALITY
     =============================== */
  const exportToExcel = () => {
    if (!result) {
      alert("Please calculate a portfolio first");
      return;
    }

    if (!isPremium) {
      alert("🔒 Premium feature. Please upgrade to export reports.");
      return;
    }

    setIsExporting(true);

    try {
      const wb = XLSX.utils.book_new();
      
      // Portfolio Summary Sheet
      const summaryData = [
        ["QUANTUM PORTFOLIO MANAGER - REPORT"],
        ["Generated on:", new Date().toLocaleString()],
        ["User:", user?.fullName || userEmail],
        ["Portfolio Name:", portfolioName],
        ["Risk Profile:", riskProfile],
        ["Market Condition:", marketCondition],
        [],
        ["PORTFOLIO SUMMARY"],
        ["Total Capital", `₹${parseInt(capital).toLocaleString()}`],
        ["Total Investment", `₹${result.totalSharesValue.toLocaleString()}`],
        ["Cash Balance", `₹${result.cashInHand.toLocaleString()}`],
        ["Diversification Score", `${result.diversificationScore}/100`],
        ["Risk Score", `${result.riskScore}/100`],
        ["Expected Return", `${(result.expectedReturn * 100).toFixed(2)}%`],
        ["Portfolio Volatility", `${(result.portfolioVolatility * 100).toFixed(2)}%`],
        ["Sharpe Ratio", result.sharpeRatio.toFixed(3)],
        ["95% VaR", `₹${result.var95.toLocaleString()}`],
        [],
        ["ASSET ALLOCATIONS"]
      ];

      // Asset Allocation Headers
      const allocationHeaders = [
        "Asset",
        "Type",
        "Price (₹)",
        "Shares",
        "Investment (₹)",
        "Weight %",
        "Volatility %",
        "Expected Return %"
      ];

      const allocationData = result.allocations.map(alloc => [
        alloc.companyName,
        alloc.type,
        alloc.price,
        alloc.sharesToBuy,
        alloc.investmentValue,
        `${(alloc.weight * 100).toFixed(2)}%`,
        `${(alloc.volatility * 100).toFixed(2)}%`,
        `${(alloc.expectedReturn * 100).toFixed(2)}%`
      ]);

      const ws = XLSX.utils.aoa_to_sheet([...summaryData, [], allocationHeaders, ...allocationData]);
      XLSX.utils.book_append_sheet(wb, ws, "Portfolio Analysis");

      // Add position sizing sheet if available
      if (positionCalcData.quantity > 0) {
        const positionData = [
          ["POSITION SIZE CALCULATOR"],
          ["Capital", positionCalcData.capital],
          ["Risk %", positionCalcData.riskPercent],
          ["Entry Price", positionCalcData.entryPrice],
          ["Stop Loss", positionCalcData.stopLoss],
          ["Position Size", positionCalcData.quantity],
          ["Risk Amount", `₹${((Number(positionCalcData.capital) * Number(positionCalcData.riskPercent)) / 100).toLocaleString()}`]
        ];
        const ws2 = XLSX.utils.aoa_to_sheet(positionData);
        XLSX.utils.book_append_sheet(wb, ws2, "Position Sizing");
      }

      // Generate filename and save
      const fileName = `Quantum_Portfolio_${portfolioName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      // Log export
      console.log("Portfolio exported:", { fileName, user: user?.id });

      setIsExporting(false);
      alert("✅ Excel report downloaded successfully!");
    } catch (error) {
      console.error("Export error:", error);
      setIsExporting(false);
      alert("❌ Error exporting report. Please try again.");
    }
  };

  const exportToPDF = async () => {
    if (!result) return;

    const element = document.getElementById('portfolio-summary');
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Quantum_Portfolio_${portfolioName.replace(/\s+/g, '_')}.pdf`);
  };

  const sharePortfolio = () => {
    if (!result) return;

    const shareData = {
      title: `Quantum Portfolio: ${portfolioName}`,
      text: `Check out my portfolio created with Quantum Portfolio Manager!\nTotal Capital: ₹${parseInt(capital).toLocaleString()}\nExpected Return: ${(result.expectedReturn * 100).toFixed(1)}%\nRisk Score: ${result.riskScore}/100`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareData.text);
      alert("Portfolio details copied to clipboard!");
    }
  };

  /* ===============================
     ASSET MANAGEMENT FUNCTIONS
     =============================== */
  const addAsset = () => {
    const newAsset = {
      id: Date.now(),
      company: "",
      price: "",
      type: "Large-cap",
      volatility: volatilityMap["Large-cap"].volatility
    };
    setAssets([...assets, newAsset]);
  };

  const removeAsset = (id) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const updateAsset = (id, field, value) => {
    setAssets(assets.map(asset => {
      if (asset.id === id) {
        if (field === 'type') {
          const assetData = volatilityMap[value];
          return {
            ...asset,
            type: value,
            volatility: assetData.volatility * marketModifiers[marketCondition].volatility
          };
        }
        return { ...asset, [field]: value };
      }
      return asset;
    }));
  };

  /* ===============================
     RENDER FUNCTIONS
     =============================== */
  const renderPositionCalculator = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              <Calculator className="inline w-6 h-6 mr-2" />
              Position Size Calculator
            </h3>
            <button
              onClick={() => setShowPositionCalculator(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capital (₹)
              </label>
              <input
                type="number"
                value={positionCalcData.capital}
                onChange={(e) => setPositionCalcData(prev => ({...prev, capital: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="e.g., 100000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Risk per Trade (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={positionCalcData.riskPercent}
                onChange={(e) => setPositionCalcData(prev => ({...prev, riskPercent: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="e.g., 2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entry Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={positionCalcData.entryPrice}
                onChange={(e) => setPositionCalcData(prev => ({...prev, entryPrice: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="e.g., 150.50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stop Loss Price (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={positionCalcData.stopLoss}
                onChange={(e) => setPositionCalcData(prev => ({...prev, stopLoss: e.target.value}))}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="e.g., 145.00"
              />
            </div>

            {positionCalcData.quantity > 0 && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700 mb-2">
                    {positionCalcData.quantity} units
                  </div>
                  <div className="text-sm text-green-600">
                    Risk Amount: ₹{((Number(positionCalcData.capital) * Number(positionCalcData.riskPercent)) / 100).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={calculatePositionSize}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90"
              >
                Calculate
              </button>
              <button
                onClick={() => setShowPositionCalculator(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* ===============================
     LOADING STATE
     =============================== */
  if (loadingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Quantum Portfolio Manager...</p>
          <p className="text-sm text-gray-500 mt-2">Preparing your premium experience</p>
        </div>
      </div>
    );
  }

  /* ===============================
     MAIN UI
     =============================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="mb-6 md:mb-0">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <PieChart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                      Quantum Portfolio Manager
                    </h1>
                    <p className="text-blue-100 mt-1">
                      Advanced Portfolio Optimization & Position Sizing
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 mt-4">
                  <span className={`px-3 py-1 ${isPremium ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-white/20'} backdrop-blur-sm text-white rounded-full text-sm font-medium`}>
                    {isPremium ? '🚀 PREMIUM ACTIVE' : '⚡ FREE VERSION'}
                  </span>
                  <span className="text-blue-100 text-sm">
                    {userEmail ? `Welcome, ${userEmail.split('@')[0]}` : 'Welcome, Investor'}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-3">
                {!isPremium && (
                  <button 
                    onClick={() => window.location.href = "/pricing"}
                    className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                  >
                    🔓 Upgrade to Premium
                  </button>
                )}
                <button 
                  onClick={() => setShowPositionCalculator(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl flex items-center"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Position Calculator
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-white rounded-xl shadow-lg p-1 mb-8 border border-gray-200">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`flex items-center py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === "calculator" 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Portfolio Calculator
          </button>
          <button
            onClick={() => setActiveTab("analysis")}
            className={`flex items-center py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === "analysis" 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Advanced Analysis
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex items-center py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === "saved" 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
            }`}
          >
            <Shield className="w-5 h-5 mr-2" />
            Saved Portfolios
          </button>
          <button
            onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
            className={`flex items-center py-3 px-4 rounded-lg font-medium transition-all ${
              showAdvancedMetrics
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md' 
                : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
            }`}
          >
            <LineChart className="w-5 h-5 mr-2" />
            Advanced Metrics
          </button>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === "calculator" && (
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Calculator */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Portfolio Configuration
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={savePortfolio}
                      disabled={!result || !user}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:opacity-90 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </button>
                    <input
                      type="text"
                      value={portfolioName}
                      onChange={(e) => setPortfolioName(e.target.value)}
                      className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 min-w-[200px]"
                      placeholder="Portfolio Name"
                    />
                  </div>
                </div>

                {/* Capital Input */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-lg font-medium text-gray-700">
                      <DollarSign className="inline w-5 h-5 mr-2 text-green-600" />
                      Total Investment Capital
                    </label>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{parseInt(capital).toLocaleString()}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="100000"
                      max="10000000"
                      step="100000"
                      value={capital}
                      onChange={(e) => setCapital(e.target.value)}
                      className="w-full h-3 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-purple-600 [&::-webkit-slider-thumb]:shadow-lg"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>₹1L</span>
                      <span>₹50L</span>
                      <span>₹1Cr</span>
                    </div>
                  </div>
                </div>

                {/* Risk & Market Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-blue-600" />
                      Risk Profile
                    </h3>
                    <div className="flex space-x-2">
                      {Object.keys(riskProfiles).map((profile) => (
                        <button
                          key={profile}
                          onClick={() => setRiskProfile(profile)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                            riskProfile === profile
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                              : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-300'
                          }`}
                        >
                          {profile.charAt(0).toUpperCase() + profile.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
                      Market Condition
                    </h3>
                    <select
                      value={marketCondition}
                      onChange={(e) => setMarketCondition(e.target.value)}
                      className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="bullish">🐂 Bull Market</option>
                      <option value="normal">⚖️ Normal Market</option>
                      <option value="bearish">🐻 Bear Market</option>
                      <option value="volatile">⚡ Volatile Market</option>
                    </select>
                  </div>
                </div>

                {/* Asset Management */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-700">Asset Allocation</h3>
                      <p className="text-sm text-gray-500">Configure your investment assets</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={addAsset}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:opacity-90 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Asset
                      </button>
                      <div className="text-sm text-gray-600">
                        {assets.length} {assets.length === 1 ? 'asset' : 'assets'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {assets.map((asset, index) => (
                      <div
                        key={asset.id}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-4 hover:border-purple-300 transition-all group"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <span className="text-xl">
                                {volatilityMap[asset.type]?.icon || "📊"}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                Asset #{index + 1}
                                {asset.company && `: ${asset.company}`}
                              </div>
                              <div className="text-sm text-gray-600">
                                Volatility: {(asset.volatility * 100).toFixed(1)}%
                                {volatilityMap[asset.type]?.description && 
                                  ` • ${volatilityMap[asset.type]?.description}`}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => removeAsset(asset.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">
                              Company/Asset
                            </label>
                            <input
                              type="text"
                              className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={asset.company}
                              onChange={(e) => updateAsset(asset.id, 'company', e.target.value)}
                              placeholder="e.g., Reliance Industries"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">
                              Price (₹)
                            </label>
                            <input
                              type="number"
                              className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              value={asset.price}
                              onChange={(e) => updateAsset(asset.id, 'price', e.target.value)}
                              placeholder="Current price"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">
                              Asset Type
                            </label>
                            <select
                              className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              value={asset.type}
                              onChange={(e) => updateAsset(asset.id, 'type', e.target.value)}
                            >
                              {Object.entries(volatilityMap).map(([type, data]) => (
                                <option key={type} value={type}>
                                  {data.icon} {type}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calculate Button */}
                <button
                  onClick={calculatePortfolio}
                  disabled={isCalculating}
                  className={`w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none`}
                >
                  {isCalculating ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Optimizing Portfolio...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Zap className="w-6 h-6 mr-2" />
                      Optimize Portfolio Allocation
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              {/* Results Card */}
              <div id="portfolio-summary" className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <BarChart className="w-5 h-5 mr-2 text-purple-600" />
                  Portfolio Analysis
                </h3>
                
                {result ? (
                  <>
                    {/* Portfolio Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                        <div className="text-sm text-gray-600">Diversification</div>
                        <div className="text-2xl font-bold text-blue-600">{result.diversificationScore}/100</div>
                        <div className="h-2 bg-blue-200 rounded-full mt-2 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-1000"
                            style={{ width: `${result.diversificationScore}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                        <div className="text-sm text-gray-600">Risk Score</div>
                        <div className={`text-2xl font-bold ${result.riskScore > 70 ? 'text-red-600' : result.riskScore > 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {result.riskScore}/100
                        </div>
                        <div className="h-2 bg-purple-200 rounded-full mt-2 overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${result.riskScore > 70 ? 'bg-gradient-to-r from-red-500 to-pink-500' : result.riskScore > 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}
                            style={{ width: `${result.riskScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Expected Return */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                      <div className="text-sm text-gray-600">Expected Annual Return</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {(result.expectedReturn * 100).toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Based on historical data & {marketCondition} market
                      </div>
                    </div>

                    {/* Advanced Metrics (Toggleable) */}
                    {showAdvancedMetrics && (
                      <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <h4 className="font-medium text-gray-700 mb-3">Advanced Metrics</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs text-gray-600">Sharpe Ratio</div>
                            <div className="text-lg font-bold text-gray-900">{result.sharpeRatio.toFixed(3)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Portfolio Volatility</div>
                            <div className="text-lg font-bold text-gray-900">{(result.portfolioVolatility * 100).toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">Max Drawdown</div>
                            <div className="text-lg font-bold text-gray-900">{(result.maxDrawdown * 100).toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600">95% VaR</div>
                            <div className="text-lg font-bold text-gray-900">₹{result.var95.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Allocation Breakdown */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-700">Allocation Breakdown</h4>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setViewMode('chart')}
                            className={`p-1 rounded ${viewMode === 'chart' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
                          >
                            <PieChart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {viewMode === 'grid' ? (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                          {result.allocations.map((alloc, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                              <div className="flex items-center space-x-3">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: alloc.color }}
                                />
                                <div>
                                  <div className="font-medium text-gray-900">{alloc.companyName}</div>
                                  <div className="text-sm text-gray-500">{alloc.type} • {alloc.sharesToBuy} shares</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">₹{alloc.investmentValue.toLocaleString()}</div>
                                <div className="text-sm text-gray-500">{(alloc.weight * 100).toFixed(1)}%</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                          <div className="text-center text-gray-500">
                            <PieChart className="w-16 h-16 mx-auto mb-2 text-gray-300" />
                            <p>Pie Chart Visualization</p>
                            <p className="text-sm">(Would show allocation percentages)</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="border-t border-gray-200 pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Investment</span>
                        <span className="font-bold text-gray-900">₹{result.totalSharesValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cash Remaining</span>
                        <span className="font-bold text-green-600">₹{result.cashInHand.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Allocated Capital</span>
                        <span>{((result.totalSharesValue / capital) * 100).toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-6">
                      <button
                        onClick={exportToExcel}
                        disabled={!isPremium || isExporting}
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center ${
                          !isPremium || isExporting
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:opacity-90'
                        }`}
                      >
                        {isExporting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Exporting...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Export Excel
                          </>
                        )}
                      </button>
                      <button
                        onClick={sharePortfolio}
                        className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:opacity-90 flex items-center justify-center"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </button>
                    </div>

                    {!isPremium && (
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-amber-800">
                              Premium Export Feature
                            </p>
                            <p className="text-xs text-amber-700 mt-1">
                              Upgrade to premium to export detailed Excel reports with advanced analytics.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4 text-purple-600">📊</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Portfolio Results</h3>
                    <p className="text-gray-600">Configure your portfolio and click "Optimize" to see allocation results</p>
                  </div>
                )}
              </div>

              {/* Premium Features */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Premium Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg border border-blue-100">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Advanced Analytics</div>
                      <div className="text-sm text-gray-600">Sharpe ratio, VaR, Max Drawdown</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg border border-blue-100">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calculator className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Position Sizing</div>
                      <div className="text-sm text-gray-600">Integrated risk-based position calculator</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg border border-blue-100">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Download className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Export Reports</div>
                      <div className="text-sm text-gray-600">Excel & PDF reports with detailed analysis</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg border border-blue-100">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                      <Save className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Cloud Storage</div>
                      <div className="text-sm text-gray-600">Save unlimited portfolios in the cloud</div>
                    </div>
                  </div>
                </div>
                
                {!isPremium && (
                  <button 
                    onClick={() => window.location.href = "/pricing"}
                    className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 shadow-lg"
                  >
                    🔓 Unlock All Features - ₹999/month
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Portfolios Tab */}
      {activeTab === "saved" && (
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Saved Portfolios</h3>
              <div className="text-sm text-gray-600">
                {savedPortfolios.length} portfolio{savedPortfolios.length !== 1 ? 's' : ''} saved
              </div>
            </div>
            
            {savedPortfolios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedPortfolios.map((portfolio, index) => (
                  <div
                    key={portfolio.id || index}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 hover:border-purple-300 transition-all group relative"
                  >
                    <button
                      onClick={() => deletePortfolio(portfolio.id, index)}
                      className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div 
                      className="cursor-pointer"
                      onClick={() => loadPortfolio(portfolio)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-gray-900">{portfolio.name}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(portfolio.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="px-2 py-1 bg-white text-purple-600 rounded text-sm font-medium border border-purple-200">
                          {portfolio.result?.allocations?.length || 0} assets
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Capital</span>
                          <span className="text-gray-900 font-medium">
                            ₹{parseInt(portfolio.capital).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Risk Profile</span>
                          <span className="text-gray-900 font-medium capitalize">
                            {portfolio.riskProfile || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Expected Return</span>
                          <span className="text-green-600 font-medium">
                            {portfolio.result?.expectedReturn 
                              ? `${(portfolio.result.expectedReturn * 100).toFixed(1)}%`
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Risk Score</span>
                          <span className="font-medium">
                            {portfolio.result?.riskScore ? `${portfolio.result.riskScore}/100` : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => loadPortfolio(portfolio)}
                        className="flex-1 py-1 px-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm rounded-lg hover:opacity-90"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => {
                          setResult(portfolio.result);
                          setActiveTab("calculator");
                        }}
                        className="flex-1 py-1 px-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm rounded-lg hover:opacity-90"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 text-gray-300">📂</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Saved Portfolios</h3>
                <p className="text-gray-600 mb-6">
                  {isPremium 
                    ? "Create and save your first portfolio to see it here!"
                    : "Upgrade to premium to save portfolios in the cloud"}
                </p>
                {!isPremium && (
                  <button 
                    onClick={() => window.location.href = "/pricing"}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90"
                  >
                    Upgrade to Save Portfolios
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === "analysis" && (
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Advanced Portfolio Analysis</h3>
            {result ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="text-sm text-gray-600">Sharpe Ratio</div>
                    <div className="text-2xl font-bold text-blue-600">{result.sharpeRatio.toFixed(3)}</div>
                    <div className="text-xs text-gray-500 mt-1">Risk-adjusted return</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="text-sm text-gray-600">Sortino Ratio</div>
                    <div className="text-2xl font-bold text-green-600">{(result.sharpeRatio * 1.2).toFixed(3)}</div>
                    <div className="text-xs text-gray-500 mt-1">Downside risk adjusted</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="text-sm text-gray-600">Alpha</div>
                    <div className="text-2xl font-bold text-purple-600">{((result.expectedReturn - 0.08) * 100).toFixed(2)}%</div>
                    <div className="text-xs text-gray-500 mt-1">Excess return</div>
                  </div>
                  <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                    <div className="text-sm text-gray-600">Beta</div>
                    <div className="text-2xl font-bold text-red-600">{result.portfolioVolatility.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mt-1">Market sensitivity</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-3">Risk Analysis</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Value at Risk (95%)</span>
                          <span className="font-bold">₹{result.var95.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-red-500 to-orange-500" style={{width: '65%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Conditional VaR</span>
                          <span className="font-bold">₹{(result.var95 * 1.2).toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-orange-500 to-yellow-500" style={{width: '55%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Maximum Drawdown</span>
                          <span className="font-bold">{(result.maxDrawdown * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-yellow-500 to-green-500" style={{width: '45%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-3">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Treynor Ratio</span>
                          <span className="font-bold">{((result.expectedReturn - 0.05) / result.portfolioVolatility).toFixed(3)}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{width: '70%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Information Ratio</span>
                          <span className="font-bold">{((result.expectedReturn - 0.08) / (result.portfolioVolatility * 0.8)).toFixed(3)}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-500 to-green-500" style={{width: '60%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Calmar Ratio</span>
                          <span className="font-bold">{(result.expectedReturn / result.maxDrawdown).toFixed(3)}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{width: '75%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-medium text-gray-700 mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {result.riskScore > 70 && (
                      <div className="flex items-start space-x-2 p-2 bg-red-50 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-red-800">High Risk Alert</div>
                          <div className="text-xs text-red-700">Consider reducing allocation to high-volatility assets</div>
                        </div>
                      </div>
                    )}
                    {result.diversificationScore < 50 && (
                      <div className="flex items-start space-x-2 p-2 bg-amber-50 rounded-lg">
                        <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-amber-800">Low Diversification</div>
                          <div className="text-xs text-amber-700">Add more asset classes to improve diversification</div>
                        </div>
                      </div>
                    )}
                    {result.sharpeRatio < 1 && (
                      <div className="flex items-start space-x-2 p-2 bg-blue-50 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-blue-800">Risk-Adjusted Return</div>
                          <div className="text-xs text-blue-700">Consider rebalancing to improve Sharpe ratio</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4 text-gray-300">📈</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Analysis Available</h3>
                <p className="text-gray-600">Create a portfolio to see advanced analysis and recommendations</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Position Calculator Modal */}
      {showPositionCalculator && renderPositionCalculator()}

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 py-8 mt-12 border-t border-gray-200">
        <div className="text-center text-gray-600 text-sm">
          <p className="mb-2">Quantum Portfolio Manager • Advanced Investment Tools</p>
          <p className="text-gray-500">
            {isPremium ? 'Premium Edition • All Features Unlocked' : 'Free Edition • Upgrade for Full Access'}
          </p>
          <div className="flex justify-center space-x-4 mt-4 text-xs text-gray-500">
            <span>© {new Date().getFullYear()} Quantum Finance</span>
            <span>•</span>
            <span>Data is for educational purposes only</span>
            <span>•</span>
            <span>Investments are subject to market risks</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumPortfolioManager;