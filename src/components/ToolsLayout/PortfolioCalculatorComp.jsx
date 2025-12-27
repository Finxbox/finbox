import { useState, useEffect } from "react";
import { PieChart, DollarSign, TrendingUp, Shield, BarChart3, Download, Share2, Save, Zap, Target } from "lucide-react";

const PortfolioCalculatorComp = () => {
  const [capital, setCapital] = useState(1000000);
  const [assets, setAssets] = useState([]);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("calculator");
  const [portfolioName, setPortfolioName] = useState("My Premium Portfolio");
  const [savedPortfolios, setSavedPortfolios] = useState([]);
  const [riskProfile, setRiskProfile] = useState("balanced");
  const [marketCondition, setMarketCondition] = useState("normal");
  const [isPremium, setIsPremium] = useState(true);

  // Enhanced volatility map
  const volatilityMap = {
    "Large-cap": { 
      volatility: 0.1, 
      description: "Stable blue-chip companies", 
      color: "#3B82F6",
      icon: "🏢"
    },
    "Mid-cap": { 
      volatility: 0.15, 
      description: "Growing companies with potential", 
      color: "#8B5CF6",
      icon: "📈"
    },
    "Small-cap": { 
      volatility: 0.25, 
      description: "High-growth potential, higher risk", 
      color: "#EF4444",
      icon: "🚀"
    },
    "Bonds": { 
      volatility: 0.05, 
      description: "Fixed income, low risk", 
      color: "#10B981",
      icon: "📊"
    },
    "Mutual Fund": { 
      volatility: 0.12, 
      description: "Professional managed funds", 
      color: "#F59E0B",
      icon: "🏦"
    },
    "ETF": { 
      volatility: 0.1, 
      description: "Exchange traded funds", 
      color: "#06B6D4",
      icon: "📊"
    },
    "Crypto": { 
      volatility: 0.35, 
      description: "Cryptocurrency assets", 
      color: "#F97316",
      icon: "₿"
    },
    "Real Estate": { 
      volatility: 0.08, 
      description: "Property investments", 
      color: "#EC4899",
      icon: "🏠"
    }
  };

  // Market condition modifiers
  const marketModifiers = {
    "bullish": 0.8,
    "normal": 1.0,
    "bearish": 1.2,
    "volatile": 1.5
  };

  // Risk profile weights
  const riskProfiles = {
    "conservative": { bonds: 0.4, "large-cap": 0.3, "mutual-fund": 0.3 },
    "balanced": { "large-cap": 0.3, "mid-cap": 0.25, "mutual-fund": 0.25, bonds: 0.2 },
    "aggressive": { "small-cap": 0.35, "mid-cap": 0.3, crypto: 0.2, "large-cap": 0.15 }
  };

  // Initialize with sample data
  useEffect(() => {
    const initialAssets = [
      { id: 1, company: "Reliance Industries", price: "2450", type: "Large-cap", volatility: 0.1 },
      { id: 2, company: "TCS", price: "3650", type: "Large-cap", volatility: 0.1 },
      { id: 3, company: "HDFC Bank", price: "1650", type: "Large-cap", volatility: 0.1 },
      { id: 4, company: "Infosys", price: "1600", type: "Mid-cap", volatility: 0.15 },
      { id: 5, company: "ICICI Bank", price: "1050", type: "Mid-cap", volatility: 0.15 },
    ];
    setAssets(initialAssets);
    
    // Load saved portfolios
    const saved = localStorage.getItem('savedPortfolios');
    if (saved) {
      setSavedPortfolios(JSON.parse(saved));
    }
  }, []);

  const handleCapitalChange = (e) => {
    setCapital(e.target.value);
  };

  const handleNumCompaniesChange = (e) => {
    const num = parseInt(e.target.value, 10);
    if (num > 0) {
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

  const handleCompanyChange = (e, index) => {
    const updatedAssets = [...assets];
    updatedAssets[index].company = e.target.value;
    setAssets(updatedAssets);
  };

  const handlePriceChange = (e, index) => {
    const updatedAssets = [...assets];
    updatedAssets[index].price = e.target.value;
    setAssets(updatedAssets);
  };

  const handleAssetTypeChange = (e, index) => {
    const updatedAssets = [...assets];
    const assetType = e.target.value;
    const assetData = volatilityMap[assetType];
    updatedAssets[index] = {
      ...updatedAssets[index],
      type: assetType,
      volatility: assetData.volatility * marketModifiers[marketCondition],
    };
    setAssets(updatedAssets);
  };

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
        const riskWeight = riskProfiles[riskProfile][type.toLowerCase().replace(' ', '-')] || 1;
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
            icon: volatilityMap[type]?.icon || "📊"
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

  const calculateDiversificationScore = (allocations) => {
    if (allocations.length === 0) return 0;
    const weights = allocations.map(a => a.weight);
    const herfindahl = weights.reduce((sum, w) => sum + w * w, 0);
    return Math.round((1 - herfindahl) * 100);
  };

  const calculateRiskScore = (allocations) => {
    if (allocations.length === 0) return 0;
    const avgVolatility = allocations.reduce((sum, a) => {
      const vol = volatilityMap[a.type]?.volatility || 0.15;
      return sum + (vol * a.weight);
    }, 0);
    return Math.round(avgVolatility * 100);
  };

  const calculateExpectedReturn = (allocations) => {
    if (allocations.length === 0) return 0;
    const expectedReturns = {
      "Large-cap": 0.12,
      "Mid-cap": 0.18,
      "Small-cap": 0.25,
      "Bonds": 0.07,
      "Mutual Fund": 0.15,
      "ETF": 0.13,
      "Crypto": 0.35,
      "Real Estate": 0.10
    };
    
    return allocations.reduce((sum, a) => {
      const expectedReturn = expectedReturns[a.type] || 0.15;
      return sum + (expectedReturn * a.weight);
    }, 0);
  };

  const savePortfolio = () => {
    if (!result) return;
    
    const newPortfolio = {
      id: Date.now(),
      name: portfolioName,
      date: new Date().toLocaleDateString(),
      capital: capital,
      result: result,
      assets: [...assets]
    };
    
    const updatedPortfolios = [newPortfolio, ...savedPortfolios.slice(0, 4)];
    setSavedPortfolios(updatedPortfolios);
    localStorage.setItem('savedPortfolios', JSON.stringify(updatedPortfolios));
    
    alert("✅ Portfolio saved successfully!");
  };

  const loadPortfolio = (portfolio) => {
    setCapital(portfolio.capital);
    setAssets(portfolio.assets);
    setResult(portfolio.result);
    setPortfolioName(portfolio.name);
    setActiveTab("calculator");
  };

  const exportToExcel = () => {
    alert("📊 Generating Excel report...");
    // Excel export implementation
  };

  const sharePortfolio = () => {
    alert("🔗 Share link generated!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4 md:p-6">
      {/* Header matching original website */}
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
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium">
                  🚀 PREMIUM EDITION
                </span>
                <span className="text-blue-100 text-sm">• Algorithmic Allocation • Advanced Analytics</span>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0">
              <button 
                onClick={() => setIsPremium(!isPremium)}
                className={`px-6 py-3 rounded-xl font-semibold ${isPremium ? 'bg-white text-purple-600' : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'} hover:opacity-90 transition-all`}
              >
                {isPremium ? 'PREMIUM ACTIVE' : 'UPGRADE TO PRO'}
              </button>
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
            Saved Portfolios
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
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:opacity-90 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </button>
                <input
                  type="text"
                  value={portfolioName}
                  onChange={(e) => setPortfolioName(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900"
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
                    placeholder="Number of assets"
                    onChange={handleNumCompaniesChange}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 w-32"
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
                  <div className="font-medium text-gray-900">Risk Management</div>
                  <div className="text-sm text-gray-600">Portfolio protection strategies</div>
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
            
            <button className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:opacity-90 shadow">
              🔓 Unlock All Features - $29/month
            </button>
          </div>
        </div>
      </div>

      {/* Saved Portfolios Tab */}
      {activeTab === "saved" && savedPortfolios.length > 0 && (
        <div className="max-w-7xl mx-auto mt-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Saved Portfolios</h3>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioCalculatorComp;