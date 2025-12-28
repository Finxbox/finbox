import { useState, useEffect } from "react";
import { PieChart, DollarSign, TrendingUp, Shield, BarChart3, Download, Share2, Save, Zap, Target, Lock, Check, AlertCircle } from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabase.js";

const PortfolioCalculatorComp = () => {
  // 🔐 Clerk Authentication
  const { user, isLoaded, isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  
  // 🔹 State Management
  const [capital, setCapital] = useState(1000000);
  const [assets, setAssets] = useState([]);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("calculator");
  const [portfolioName, setPortfolioName] = useState("My Portfolio");
  const [savedPortfolios, setSavedPortfolios] = useState([]);
  const [riskProfile, setRiskProfile] = useState("balanced");
  const [marketCondition, setMarketCondition] = useState("normal");
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // 🔹 Enhanced volatility map
  const volatilityMap = {
    "Large-cap": { 
      volatility: 0.1, 
      description: "Stable blue-chip companies", 
      color: "#3B82F6",
      icon: "🏢",
      expectedReturn: 0.12
    },
    "Mid-cap": { 
      volatility: 0.15, 
      description: "Growing companies with potential", 
      color: "#8B5CF6",
      icon: "📈",
      expectedReturn: 0.18
    },
    "Small-cap": { 
      volatility: 0.25, 
      description: "High-growth potential, higher risk", 
      color: "#EF4444",
      icon: "🚀",
      expectedReturn: 0.25
    },
    "Bonds": { 
      volatility: 0.05, 
      description: "Fixed income, low risk", 
      color: "#10B981",
      icon: "📊",
      expectedReturn: 0.07
    },
    "Mutual Fund": { 
      volatility: 0.12, 
      description: "Professional managed funds", 
      color: "#F59E0B",
      icon: "🏦",
      expectedReturn: 0.15
    },
    "ETF": { 
      volatility: 0.1, 
      description: "Exchange traded funds", 
      color: "#06B6D4",
      icon: "📊",
      expectedReturn: 0.13
    },
    "Crypto": { 
      volatility: 0.35, 
      description: "Cryptocurrency assets", 
      color: "#F97316",
      icon: "₿",
      expectedReturn: 0.35
    },
    "Real Estate": { 
      volatility: 0.08, 
      description: "Property investments", 
      color: "#EC4899",
      icon: "🏠",
      expectedReturn: 0.10
    }
  };

  // 🔹 Market condition modifiers
  const marketModifiers = {
    "bullish": 0.8,
    "normal": 1.0,
    "bearish": 1.2,
    "volatile": 1.5
  };

  // 🔹 Risk profile weights
  const riskProfiles = {
    "conservative": { bonds: 0.4, "large-cap": 0.3, "mutual-fund": 0.3 },
    "balanced": { "large-cap": 0.3, "mid-cap": 0.25, "mutual-fund": 0.25, bonds: 0.2 },
    "aggressive": { "small-cap": 0.35, "mid-cap": 0.3, crypto: 0.2, "large-cap": 0.15 }
  };

  // 🔹 Initialize with sample data
  useEffect(() => {
    const initialAssets = [
      { id: 1, company: "Reliance Industries", price: "2450", type: "Large-cap", volatility: 0.1 },
      { id: 2, company: "TCS", price: "3650", type: "Large-cap", volatility: 0.1 },
      { id: 3, company: "HDFC Bank", price: "1650", type: "Large-cap", volatility: 0.1 },
      { id: 4, company: "Infosys", price: "1600", type: "Mid-cap", volatility: 0.15 },
      { id: 5, company: "ICICI Bank", price: "1050", type: "Mid-cap", volatility: 0.15 },
    ];
    setAssets(initialAssets);
    
    // Load saved portfolios from localStorage
    const saved = localStorage.getItem('savedPortfolios');
    if (saved) {
      setSavedPortfolios(JSON.parse(saved));
    }

    // Check premium status if user is logged in
    if (isSignedIn && user) {
      checkPremiumStatus();
    }
  }, [isSignedIn, user]);

  // 🔹 Check user's premium status
  const checkPremiumStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_premium')
        .eq('user_id', user.id)
        .single();
        
      if (!error && data) {
        setIsPremium(data.is_premium);
      }
    } catch (error) {
      console.error("Error checking premium status:", error);
    }
  };

  // 🔹 Handle capital change
  const handleCapitalChange = (e) => {
    const value = e.target.value;
    if (value >= 0) {
      setCapital(value);
    }
  };

  // 🔹 Handle number of companies change
  const handleNumCompaniesChange = (e) => {
    const num = parseInt(e.target.value, 10);
    if (num > 0 && num <= 20) {
      setAssets(
        Array.from({ length: num }, (_, index) => ({
          id: index + 1,
          company: "",
          price: "",
          type: "Large-cap",
          volatility: volatilityMap["Large-cap"].volatility,
        }))
      );
    }
    setResult(null);
  };

  // 🔹 Handle company change
  const handleCompanyChange = (e, index) => {
    const updatedAssets = [...assets];
    updatedAssets[index].company = e.target.value;
    setAssets(updatedAssets);
  };

  // 🔹 Handle price change
  const handlePriceChange = (e, index) => {
    const updatedAssets = [...assets];
    updatedAssets[index].price = e.target.value;
    setAssets(updatedAssets);
  };

  // 🔹 Handle asset type change
  const handleAssetTypeChange = (e, index) => {
    const updatedAssets = [...assets];
    const assetType = e.target.value;
    const assetData = volatilityMap[assetType];
    if (assetData) {
      updatedAssets[index] = {
        ...updatedAssets[index],
        type: assetType,
        volatility: assetData.volatility * marketModifiers[marketCondition],
      };
      setAssets(updatedAssets);
    }
  };

  // 🔹 Calculate portfolio allocation
  const calculatePortfolio = () => {
    if (!capital || capital <= 0) {
      alert("Please enter a valid total capital.");
      return;
    }

    const totalCapital = parseFloat(capital);
    let totalSharesValue = 0;
    const allocations = [];
    let totalWeight = 0;

    // Calculate total weight based on inverse volatility
    assets.forEach(({ volatility }) => {
      if (volatility > 0) {
        totalWeight += 1 / volatility;
      }
    });

    assets.forEach(({ company, price, volatility, type }) => {
      const priceValue = parseFloat(price);
      if (company && priceValue && volatility > 0) {
        const weight = 1 / volatility;
        const assetWeight = weight / totalWeight;
        
        // Apply risk profile adjustment
        const riskKey = type.toLowerCase().replace(' ', '-');
        const riskWeight = riskProfiles[riskProfile][riskKey] || 1;
        const finalWeight = assetWeight * riskWeight;

        const sharesToBuy = Math.floor(
          (totalCapital * finalWeight) / priceValue
        );
        const investmentValue = sharesToBuy * priceValue;

        if (sharesToBuy > 0) {
          allocations.push({
            companyName: company,
            sharesToBuy,
            investmentValue,
            weight: finalWeight,
            type,
            color: volatilityMap[type]?.color || "#694F8E",
            icon: volatilityMap[type]?.icon || "📊",
            expectedReturn: volatilityMap[type]?.expectedReturn || 0.15
          });
          totalSharesValue += investmentValue;
        }
      }
    });

    // Sort by investment value
    allocations.sort((a, b) => b.investmentValue - a.investmentValue);

    const cashInHand = totalCapital - totalSharesValue;

    setResult({
      allocations,
      cashInHand,
      totalSharesValue,
      diversificationScore: calculateDiversificationScore(allocations),
      riskScore: calculateRiskScore(allocations),
      expectedReturn: calculateExpectedReturn(allocations)
    });
  };

  // 🔹 Calculate diversification score
  const calculateDiversificationScore = (allocations) => {
    if (allocations.length === 0) return 0;
    const weights = allocations.map(a => a.weight);
    const herfindahl = weights.reduce((sum, w) => sum + w * w, 0);
    return Math.round((1 - herfindahl) * 100);
  };

  // 🔹 Calculate risk score
  const calculateRiskScore = (allocations) => {
    if (allocations.length === 0) return 0;
    const avgVolatility = allocations.reduce((sum, a) => {
      const vol = volatilityMap[a.type]?.volatility || 0.15;
      return sum + (vol * a.weight);
    }, 0);
    return Math.round(avgVolatility * 100);
  };

  // 🔹 Calculate expected return
  const calculateExpectedReturn = (allocations) => {
    if (allocations.length === 0) return 0;
    return allocations.reduce((sum, a) => {
      return sum + (a.expectedReturn * a.weight);
    }, 0);
  };

  // 🔹 Save portfolio (Premium Feature)
  const savePortfolio = async () => {
    if (!result) {
      alert("Please calculate a portfolio first.");
      return;
    }

    if (!isSignedIn) {
      const shouldLogin = confirm("You need to login to save your portfolio. Would you like to login now?");
      if (shouldLogin) {
        openSignIn();
      }
      return;
    }

    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      setLoading(true);
      
      const portfolioData = {
        user_id: user.id,
        portfolio_name: portfolioName || "Untitled Portfolio",
        capital: parseFloat(capital),
        assets: assets,
        result: result,
        risk_profile: riskProfile,
        market_condition: marketCondition,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('saved_portfolios')
        .insert([portfolioData]);

      if (error) {
        if (error.message.includes("row-level security")) {
          alert("You don't have permission to save portfolios. Please ensure you have an active premium subscription.");
          return;
        }
        throw error;
      }

      // Also save locally for quick access
      const localPortfolio = {
        id: Date.now(),
        name: portfolioName || "Untitled Portfolio",
        date: new Date().toLocaleDateString(),
        capital: capital,
        result: result,
        assets: [...assets]
      };
      
      const updatedPortfolios = [localPortfolio, ...savedPortfolios.slice(0, 4)];
      setSavedPortfolios(updatedPortfolios);
      localStorage.setItem('savedPortfolios', JSON.stringify(updatedPortfolios));
      
      alert("✅ Portfolio saved successfully!");
    } catch (error) {
      console.error("Error saving portfolio:", error);
      alert("❌ Failed to save portfolio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load saved portfolio
  const loadPortfolio = (portfolio) => {
    setCapital(portfolio.capital);
    setAssets(portfolio.assets);
    setResult(portfolio.result);
    setPortfolioName(portfolio.name);
    setActiveTab("calculator");
  };

  // 🔹 Export to Excel
  const exportToExcel = () => {
    if (!result) {
      alert("Please calculate a portfolio first.");
      return;
    }

    try {
      const excelData = [
        ["PORTFOLIO ALLOCATION REPORT"],
        ["Generated on:", new Date().toLocaleString()],
        ["Portfolio Name:", portfolioName],
        ["Total Capital:", `₹${parseInt(capital).toLocaleString()}`],
        ["Risk Profile:", riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1)],
        ["Market Condition:", marketCondition.charAt(0).toUpperCase() + marketCondition.slice(1)],
        [],
        ["Company", "Asset Type", "Price", "Shares", "Investment", "Weight %", "Expected Return %"],
        ...result.allocations.map(alloc => [
          alloc.companyName,
          alloc.type,
          `₹${(alloc.investmentValue / alloc.sharesToBuy).toFixed(2)}`,
          alloc.sharesToBuy,
          `₹${alloc.investmentValue.toLocaleString()}`,
          `${(alloc.weight * 100).toFixed(2)}%`,
          `${(alloc.expectedReturn * 100).toFixed(2)}%`
        ]),
        [],
        ["SUMMARY"],
        ["Total Investment:", `₹${result.totalSharesValue.toLocaleString()}`],
        ["Cash Remaining:", `₹${result.cashInHand.toLocaleString()}`],
        ["Expected Annual Return:", `${(result.expectedReturn * 100).toFixed(2)}%`],
        ["Diversification Score:", `${result.diversificationScore}/100`],
        ["Risk Score:", `${result.riskScore}/100`]
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
      link.download = `Portfolio_${portfolioName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        alert(`✅ Portfolio Report Generated!
        
📊 Assets: ${result.allocations.length}
💰 Total Investment: ₹${result.totalSharesValue.toLocaleString()}
📈 Expected Return: ${(result.expectedReturn * 100).toFixed(2)}%
💾 File saved to downloads`);
      }, 100);
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('❌ Failed to export. Please try again.');
    }
  };

  // 🔹 Share portfolio
  const sharePortfolio = () => {
    if (!result) {
      alert("Please calculate a portfolio first.");
      return;
    }

    if (navigator.share) {
      navigator.share({
        title: `My Portfolio: ${portfolioName}`,
        text: `Check out my portfolio allocation with ₹${parseInt(capital).toLocaleString()} capital and ${(result.expectedReturn * 100).toFixed(2)}% expected return!`,
        url: window.location.href,
      })
      .catch(console.error);
    } else {
      alert("🔗 Share link copied to clipboard!");
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // 🔹 Razorpay Payment Integration
  const startPayment = async () => {
    try {
      if (!isSignedIn || !user) {
        const shouldLogin = confirm("Please login to unlock premium features. Would you like to login now?");
        if (shouldLogin) {
          openSignIn();
        }
        return;
      }

      const currentUserId = user.id;
      console.log("Clerk user:", currentUserId);

      // 1️⃣ Create Razorpay order
      const res = await fetch(
        "https://gopbaibklcxxccqinfli.supabase.co/functions/v1/create-razorpay-order",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: 99 }), // 99 INR in paise
        }
      );

      const order = await res.json();
      if (!order.orderId) throw new Error("Order creation failed");

      // 2️⃣ Razorpay Checkout
      const rzp = new window.Razorpay({
        key: "rzp_test_Rx2I5u0o0EHnwe",
        amount: order.amount,
        currency: "INR",
        name: "Finxbox Portfolio Pro",
        description: "Premium Portfolio Management",
        order_id: order.orderId,
        handler: async (response) => {
          // 3️⃣ Verify payment
          const verifyRes = await fetch(
            "https://gopbaibklcxxccqinfli.supabase.co/functions/v1/verify-razorpay-payment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                user_id: currentUserId,
              }),
            }
          );

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("🎉 Premium unlocked! Welcome to Portfolio Pro.");
            setIsPremium(true);
            setShowUpgradeModal(false);
            // Refresh user premium status
            await checkPremiumStatus();
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.fullName || "",
          email: user.primaryEmailAddress?.emailAddress || "",
        },
        theme: { 
          color: "#6366f1",
          hide_topbar: false 
        },
      });

      rzp.on('payment.failed', function (response) {
        console.error("Payment failed:", response.error);
        alert(`Payment failed: ${response.error.description || "Unknown error"}`);
      });

      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Please try again.");
    }
  };

  // 🔹 Check session (debug function)
  const checkSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    console.log("SESSION DATA:", data);
    console.log("SESSION ERROR:", error);
  };

  // 🔹 Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl">
                  <PieChart className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Quantum Portfolio Manager</h1>
                  <p className="text-blue-100 mt-1">Advanced Portfolio Optimization Tool</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <span className={`px-3 py-1 backdrop-blur-sm rounded-full text-sm font-medium ${
                  isPremium 
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" 
                    : "bg-white/20 text-white"
                }`}>
                  {isPremium ? "⭐ PREMIUM ACTIVE" : "🔒 FREE VERSION"}
                </span>
                <span className="text-blue-100 text-sm">• Algorithmic Allocation • Advanced Analytics</span>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0">
              {isPremium ? (
                <div className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg">
                  <Check className="w-5 h-5 text-green-300" />
                  <span className="text-white font-medium">Premium Active</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg"
                >
                  <Zap className="inline w-5 h-5 mr-2" />
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white rounded-xl shadow p-1 mb-8 border border-gray-200">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === "calculator" 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <BarChart3 className="inline w-5 h-5 mr-2" />
            Portfolio Calculator
          </button>
          <button
            onClick={() => setActiveTab("analysis")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === "analysis" 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <TrendingUp className="inline w-5 h-5 mr-2" />
            Advanced Analysis
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === "saved" 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Shield className="inline w-5 h-5 mr-2" />
            {isPremium ? "Cloud Portfolios" : "Local Portfolios"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Calculator */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Portfolio Configuration</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={savePortfolio}
                  disabled={loading || !result}
                  className={`px-4 py-2 rounded-lg flex items-center ${
                    loading || !result
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90"
                  } text-white`}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Saving..." : "Save"}
                </button>
                <input
                  type="text"
                  value={portfolioName}
                  onChange={(e) => setPortfolioName(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 w-48"
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
                  onChange={handleCapitalChange}
                  className="w-full h-3 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-purple-600 [&::-webkit-slider-thumb]:shadow-lg"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>₹1L</span>
                  <span>₹50L</span>
                  <span>₹1Cr</span>
                </div>
              </div>
            </div>

            {/* Risk Profile & Market Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-3">Risk Profile</h3>
                <div className="flex space-x-2">
                  {Object.keys(riskProfiles).map((profile) => (
                    <button
                      key={profile}
                      onClick={() => setRiskProfile(profile)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        riskProfile === profile
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-white text-gray-600 border border-gray-300 hover:border-purple-300'
                      }`}
                    >
                      {profile.charAt(0).toUpperCase() + profile.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-3">Market Condition</h3>
                <select
                  value={marketCondition}
                  onChange={(e) => setMarketCondition(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bullish">🐂 Bull Market</option>
                  <option value="normal">⚖️ Normal Market</option>
                  <option value="bearish">🐻 Bear Market</option>
                  <option value="volatile">⚡ Volatile Market</option>
                </select>
              </div>
            </div>

            {/* Assets Management */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">Asset Allocation</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    defaultValue={assets.length}
                    onChange={handleNumCompaniesChange}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 w-32"
                    placeholder="Number of assets"
                  />
                  <span className="text-gray-600 text-sm">{assets.length} assets</span>
                </div>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {assets.map((asset, index) => (
                  <div
                    key={asset.id}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-4 hover:border-purple-300 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <span className="text-xl">{volatilityMap[asset.type]?.icon || "📊"}</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Asset #{index + 1}</div>
                          <div className="text-sm text-gray-600">
                            Volatility: {(asset.volatility * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-sm px-3 py-1 rounded-full bg-white text-gray-700 border border-gray-200">
                        {volatilityMap[asset.type]?.description}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Company/Asset</label>
                        <input
                          type="text"
                          className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={asset.company}
                          onChange={(e) => handleCompanyChange(e, index)}
                          placeholder="e.g., Reliance Industries"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Price (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          value={asset.price}
                          onChange={(e) => handlePriceChange(e, index)}
                          placeholder="Current price"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Asset Type</label>
                        <select
                          className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={asset.type}
                          onChange={(e) => handleAssetTypeChange(e, index)}
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
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Zap className="inline w-6 h-6 mr-2" />
              Optimize Portfolio Allocation
            </button>
          </div>
        </div>

        {/* Right Column - Results & Features */}
        <div className="space-y-6">
          {/* Results Card */}
          {result ? (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Portfolio Analysis</h3>
              
              {/* Portfolio Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                  <div className="text-sm text-gray-600">Diversification</div>
                  <div className="text-2xl font-bold text-blue-600">{result.diversificationScore}/100</div>
                  <div className="h-2 bg-blue-200 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
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
                      className={`h-full ${result.riskScore > 70 ? 'bg-gradient-to-r from-red-500 to-pink-500' : result.riskScore > 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'}`}
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
                <div className="text-sm text-gray-500 mt-1">Based on historical data & market conditions</div>
              </div>

              {/* Allocation Breakdown */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-4">Allocation Breakdown</h4>
                <div className="space-y-3">
                  {result.allocations.map((alloc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
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
              </div>

              {/* Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Total Investment</span>
                  <span className="font-bold text-gray-900">₹{result.totalSharesValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cash Remaining</span>
                  <span className="font-bold text-green-600">₹{result.cashInHand.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 mt-6">
                <button
                  onClick={exportToExcel}
                  className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:opacity-90 flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Excel
                </button>
                <button
                  onClick={sharePortfolio}
                  className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:opacity-90 flex items-center justify-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
              <div className="text-center py-8">
                <div className="text-5xl mb-4 text-purple-600">📊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Portfolio Results</h3>
                <p className="text-gray-600">Configure your portfolio and click "Optimize" to see allocation results</p>
              </div>
            </div>
          )}

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
                  <div className="text-sm text-gray-600">Portfolio scoring & risk analysis</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg border border-blue-100">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Algorithmic Optimization</div>
                  <div className="text-sm text-gray-600">Smart allocation based on volatility</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg border border-blue-100">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Cloud Storage</div>
                  <div className="text-sm text-gray-600">Save portfolios to cloud (Premium only)</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg border border-blue-100">
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <Save className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Portfolio Management</div>
                  <div className="text-sm text-gray-600">Save & track multiple portfolios</div>
                </div>
              </div>
            </div>
            
            {!isPremium && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full mt-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-bold hover:opacity-90 shadow-lg"
              >
                <Lock className="inline w-5 h-5 mr-2" />
                Upgrade to Premium (₹99)
              </button>
            )}
            
            {isPremium && (
              <div className="w-full mt-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-center">
                <Check className="w-6 h-6 mx-auto mb-2" />
                <div className="font-bold">Premium Active</div>
                <div className="text-sm opacity-90">All features unlocked</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Portfolios Tab */}
      {activeTab === "saved" && savedPortfolios.length > 0 && (
        <div className="max-w-7xl mx-auto mt-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Saved Portfolios</h3>
              {!isPremium && (
                <div className="text-sm text-orange-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Local storage only • Upgrade for cloud sync
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedPortfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 hover:border-purple-300 transition-all cursor-pointer"
                  onClick={() => loadPortfolio(portfolio)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-gray-900">{portfolio.name}</div>
                      <div className="text-sm text-gray-600">{portfolio.date}</div>
                    </div>
                    <div className="px-2 py-1 bg-white text-purple-600 rounded text-sm font-medium border border-purple-200">
                      {portfolio.result?.allocations?.length || 0} assets
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capital</span>
                      <span className="text-gray-900 font-medium">₹{parseInt(portfolio.capital).toLocaleString()}</span>
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
                      <span className="text-gray-600">Storage</span>
                      <span className="text-blue-600 font-medium">
                        {isPremium ? "☁️ Cloud" : "💾 Local"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Premium</h3>
              <p className="text-gray-600">
                Unlock cloud storage, advanced analytics, and premium features
              </p>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6 border border-yellow-200">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-gray-900">₹99</div>
                <div className="text-gray-600">one-time payment</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Cloud portfolio storage</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Advanced risk analytics</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Priority support</span>
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Unlimited portfolio saves</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {!isSignedIn ? (
                <button
                  onClick={() => openSignIn()}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                >
                  Login to Continue
                </button>
              ) : (
                <button
                  onClick={startPayment}
                  className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-semibold hover:opacity-90"
                >
                  Upgrade Now (₹99)
                </button>
              )}
              
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioCalculatorComp;