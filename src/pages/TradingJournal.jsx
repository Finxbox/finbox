import React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Target,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Filter,
  Download,
  Upload,
  RefreshCw,
  PieChart,
  Shield,
  Brain,
  Zap,
  Moon,
  Sun,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Wallet,
  Clock,
  Percent,
  Hash,
  Search,
  Grid,
  List,
  Layers,
  Database,
  Share2,
  Printer,
  BookOpen,
  Video,
  Headphones,
  Users,
  Star,
  Crown,
  Gem,
  Rocket,
  Sparkles,
  Target as TargetIcon,
  LineChart,
  BarChart,
  PieChart as PieChartIcon,
  Activity,
  AlertTriangle,
  Coffee,
  Award,
  Home,
  Settings,
  User,
  Bell,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  ExternalLink,
  Copy,
  Check,
  Menu,
  Globe,
  Smartphone,
  HardDrive,
  Cloud,
  Wifi,
  Lock,
  Unlock,
  ScatterChart,
  Cpu,
  Server,
  Mail,
  MessageSquare,
} from "lucide-react";

// Chart components
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap,
} from "recharts";

const TradingJournal = () => {
  // Theme state
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('trading-journal-theme') || 'light';
    }
    return 'light';
  });
  
  // State management
  const [trades, setTrades] = useState([]);
  const [filteredTrades, setFilteredTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [exportFormat, setExportFormat] = useState('csv');
  const [importing, setImporting] = useState(false);
  const [showPerformanceInsights, setShowPerformanceInsights] = useState(true);
  const [showRiskMetrics, setShowRiskMetrics] = useState(true);
  const [showCharts, setShowCharts] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHiddenTrades, setShowHiddenTrades] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAiInsights, setLoadingAiInsights] = useState(false);
  const [tradeTags, setTradeTags] = useState({});
  const [tradeNotesExpanded, setTradeNotesExpanded] = useState({});
  const [selectedTrades, setSelectedTrades] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [riskLevel, setRiskLevel] = useState('medium');
  const [currency, setCurrency] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('trading-journal-currency') || 'USD';
    }
    return 'USD';
  });
  const [performanceGoals, setPerformanceGoals] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('trading-journal-goals');
      return saved ? JSON.parse(saved) : {
        monthlyProfitTarget: 5000,
        winRateTarget: 60,
        maxDailyLoss: 1000,
        tradesPerMonth: 15,
      };
    }
    return {
      monthlyProfitTarget: 5000,
      winRateTarget: 60,
      maxDailyLoss: 1000,
      tradesPerMonth: 15,
    };
  });

  // Enhanced stats
  const [stats, setStats] = useState({
    totalTrades: 0,
    winRate: 0,
    totalProfit: 0,
    totalLoss: 0,
    netProfit: 0,
    avgWin: 0,
    avgLoss: 0,
    largestWin: 0,
    largestLoss: 0,
    profitFactor: 0,
    expectancy: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    recoveryFactor: 0,
    avgHoldingPeriod: 0,
    winStreak: 0,
    lossStreak: 0,
    consistencyScore: 0,
    emotionScore: 0,
    disciplineScore: 0,
    overallScore: 0,
    dailyPnL: [],
    monthlyPerformance: [],
  });

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    tradeType: 'all',
    dateRange: 'all',
    symbol: '',
    minProfit: '',
    maxProfit: '',
    winOnly: false,
    lossOnly: false,
    tags: [],
    riskLevel: 'all',
    holdingPeriod: 'all',
  });

  // Form state with validation
  const [formData, setFormData] = useState({
    symbol: "",
    tradeType: "BUY",
    entryPrice: "",
    exitPrice: "",
    quantity: "",
    entryDate: new Date().toISOString().split('T')[0],
    exitDate: "",
    stopLoss: "",
    target: "",
    notes: "",
    status: "OPEN",
    tags: [],
    emotion: "neutral",
    confidence: 5,
    strategy: "",
    broker: "",
    commission: "",
    fees: "",
    slippage: "",
    screenshot: "",
    riskAmount: "",
    riskPercent: "",
    rewardRiskRatio: "",
    marketCondition: "normal",
    timeOfDay: "",
    mistakes: [],
    lessons: "",
    setup: "",
    exitReason: "",
    improvementAreas: [],
    rating: 0,
    hidden: false,
    pinned: false,
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  const PremiumJournal = () => {
  return (
    <div>
      <h1>Premium Journal</h1>
      {/* Your PremiumJournal content here */}
    </div>
  );
};
  // Currency formatting
  const currencyFormats = {
    'USD': { symbol: '$', locale: 'en-US' },
    'EUR': { symbol: '€', locale: 'en-EU' },
    'GBP': { symbol: '£', locale: 'en-GB' },
    'INR': { symbol: '₹', locale: 'en-IN' },
    'JPY': { symbol: '¥', locale: 'ja-JP' },
    'CNY': { symbol: '¥', locale: 'zh-CN' },
    'CAD': { symbol: 'C$', locale: 'en-CA' },
    'AUD': { symbol: 'A$', locale: 'en-AU' },
  };

  const formatCurrency = (amount) => {
    const format = currencyFormats[currency];
    return `${format.symbol}${Math.abs(amount).toLocaleString(format.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('trading-journal-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Initialize theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load trades from localStorage
  const loadTrades = useCallback(() => {
    try {
      setLoading(true);
      const savedTrades = localStorage.getItem('trading-journal-pro-trades');
      if (savedTrades) {
        const parsedTrades = JSON.parse(savedTrades);
        setTrades(parsedTrades);
      }
    } catch (error) {
      console.error("Error loading trades:", error);
      showNotification('error', 'Failed to load trades');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save trades to localStorage
  const saveTradesToStorage = (tradesToSave) => {
    try {
      localStorage.setItem('trading-journal-pro-trades', JSON.stringify(tradesToSave));
    } catch (error) {
      console.error("Error saving trades:", error);
      showNotification('error', 'Failed to save trades');
    }
  };

  // Save settings
  const saveSettings = () => {
    localStorage.setItem('trading-journal-currency', currency);
    localStorage.setItem('trading-journal-goals', JSON.stringify(performanceGoals));
  };

  // Calculate enhanced stats
  const calculateEnhancedStats = useCallback(() => {
    const closedTrades = trades.filter(trade => trade.status === "CLOSED");
    const openTrades = trades.filter(trade => trade.status === "OPEN");
    
    if (closedTrades.length === 0) {
      setStats(prev => ({
        ...prev,
        totalTrades: trades.length,
        openTrades: openTrades.length,
        closedTrades: 0,
        winRate: 0,
        totalProfit: 0,
        totalLoss: 0,
        netProfit: 0,
      }));
      return;
    }

    let totalProfit = 0;
    let totalLoss = 0;
    let wins = 0;
    let winAmounts = [];
    let lossAmounts = [];
    let holdingPeriods = [];
    let dailyPnL = {};
    let monthlyPerformance = {};
    let winStreak = 0;
    let lossStreak = 0;
    let currentWinStreak = 0;
    let currentLossStreak = 0;
    let maxDrawdown = 0;
    let peak = 0;
    let runningTotal = 0;

    closedTrades.forEach(trade => {
      const pnl = calculatePnL(trade);
      runningTotal += pnl;
      peak = Math.max(peak, runningTotal);
      maxDrawdown = Math.max(maxDrawdown, peak - runningTotal);

      if (pnl > 0) {
        totalProfit += pnl;
        wins++;
        winAmounts.push(pnl);
        currentWinStreak++;
        currentLossStreak = 0;
        winStreak = Math.max(winStreak, currentWinStreak);
      } else {
        totalLoss += Math.abs(pnl);
        lossAmounts.push(Math.abs(pnl));
        currentLossStreak++;
        currentWinStreak = 0;
        lossStreak = Math.max(lossStreak, currentLossStreak);
      }

      // Calculate holding period
      if (trade.entryDate && trade.exitDate) {
        const entry = new Date(trade.entryDate);
        const exit = new Date(trade.exitDate);
        const days = (exit - entry) / (1000 * 60 * 60 * 24);
        holdingPeriods.push(days);
      }

      // Daily P&L
      const date = trade.exitDate || trade.entryDate;
      if (date) {
        dailyPnL[date] = (dailyPnL[date] || 0) + pnl;
      }

      // Monthly performance
      if (date) {
        const month = date.substring(0, 7);
        monthlyPerformance[month] = (monthlyPerformance[month] || 0) + pnl;
      }
    });

    const winRate = (wins / closedTrades.length) * 100;
    const avgWin = winAmounts.length > 0 ? winAmounts.reduce((a, b) => a + b, 0) / winAmounts.length : 0;
    const avgLoss = lossAmounts.length > 0 ? lossAmounts.reduce((a, b) => a + b, 0) / lossAmounts.length : 0;
    const largestWin = winAmounts.length > 0 ? Math.max(...winAmounts) : 0;
    const largestLoss = lossAmounts.length > 0 ? Math.max(...lossAmounts) : 0;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;
    const expectancy = (winRate / 100 * avgWin) - ((100 - winRate) / 100 * avgLoss);
    const sharpeRatio = calculateSharpeRatio(closedTrades);
    const avgHoldingPeriod = holdingPeriods.length > 0 ? holdingPeriods.reduce((a, b) => a + b, 0) / holdingPeriods.length : 0;
    const recoveryFactor = maxDrawdown > 0 ? totalProfit / maxDrawdown : totalProfit > 0 ? Infinity : 0;

    // Calculate scores
    const consistencyScore = calculateConsistencyScore(closedTrades);
    const emotionScore = calculateEmotionScore(trades);
    const disciplineScore = calculateDisciplineScore(trades);
    const overallScore = Math.round((consistencyScore + emotionScore + disciplineScore) / 3);

    setStats({
      totalTrades: trades.length,
      openTrades: openTrades.length,
      closedTrades: closedTrades.length,
      winRate: Math.round(winRate * 100) / 100,
      totalProfit: Math.round(totalProfit * 100) / 100,
      totalLoss: Math.round(totalLoss * 100) / 100,
      netProfit: Math.round((totalProfit - totalLoss) * 100) / 100,
      avgWin: Math.round(avgWin * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      largestWin: Math.round(largestWin * 100) / 100,
      largestLoss: Math.round(largestLoss * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      expectancy: Math.round(expectancy * 100) / 100,
      sharpeRatio: Math.round(sharpeRatio * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      recoveryFactor: Math.round(recoveryFactor * 100) / 100,
      avgHoldingPeriod: Math.round(avgHoldingPeriod * 100) / 100,
      winStreak,
      lossStreak,
      consistencyScore,
      emotionScore,
      disciplineScore,
      overallScore,
      dailyPnL: Object.entries(dailyPnL).map(([date, pnl]) => ({ date, pnl })).sort((a, b) => new Date(a.date) - new Date(b.date)),
      monthlyPerformance: Object.entries(monthlyPerformance).map(([month, pnl]) => ({ month, pnl })).sort((a, b) => a.month.localeCompare(b.month)),
    });
  }, [trades]);

  // Helper calculation functions
  const calculatePnL = (trade) => {
    if (trade.status !== "CLOSED" || !trade.exitPrice) return 0;
    const entryValue = parseFloat(trade.entryPrice) * parseFloat(trade.quantity);
    const exitValue = parseFloat(trade.exitPrice) * parseFloat(trade.quantity);
    let pnl = trade.tradeType === "BUY" ? exitValue - entryValue : entryValue - exitValue;
    
    // Subtract commissions and fees
    const commission = parseFloat(trade.commission || 0);
    const fees = parseFloat(trade.fees || 0);
    pnl = pnl - commission - fees;
    
    return Math.round(pnl * 100) / 100;
  };

  const calculateRisk = (trade) => {
    if (!trade.stopLoss) return 0;
    const riskPerShare = Math.abs(parseFloat(trade.entryPrice) - parseFloat(trade.stopLoss));
    return riskPerShare * parseFloat(trade.quantity);
  };

  const calculateReward = (trade) => {
    if (!trade.target) return 0;
    const rewardPerShare = Math.abs(parseFloat(trade.target) - parseFloat(trade.entryPrice));
    return rewardPerShare * parseFloat(trade.quantity);
  };

  const calculateRiskRewardRatio = (trade) => {
    const risk = calculateRisk(trade);
    const reward = calculateReward(trade);
    return risk > 0 ? Math.round((reward / risk) * 100) / 100 : 0;
  };

  const calculateSharpeRatio = (trades) => {
    if (trades.length < 2) return 0;
    const returns = trades.map(trade => {
      const pnl = calculatePnL(trade);
      const investment = parseFloat(trade.entryPrice) * parseFloat(trade.quantity);
      return investment > 0 ? pnl / investment : 0;
    });
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    return stdDev > 0 ? Math.round((avgReturn / stdDev) * 100) / 100 : 0;
  };

  const calculateConsistencyScore = (trades) => {
    if (trades.length < 3) return 50;
    const pnls = trades.map(calculatePnL);
    const avg = pnls.reduce((a, b) => a + b, 0) / pnls.length;
    const variance = pnls.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / pnls.length;
    const consistency = 100 - (Math.sqrt(variance) / Math.abs(avg || 1)) * 100;
    return Math.max(0, Math.min(100, Math.round(consistency)));
  };

  const calculateEmotionScore = (trades) => {
    const emotions = trades.map(t => t.emotion || 'neutral');
    const emotionWeights = {
      'confident': 100,
      'calm': 90,
      'neutral': 70,
      'anxious': 40,
      'fearful': 20,
      'greedy': 30,
      'frustrated': 30,
    };
    const avgScore = emotions.reduce((sum, emotion) => sum + (emotionWeights[emotion] || 50), 0) / emotions.length;
    return Math.round(avgScore);
  };

  const calculateDisciplineScore = (trades) => {
    let score = 50;
    trades.forEach(trade => {
      if (trade.stopLoss) score += 5;
      if (trade.target) score += 5;
      if (trade.notes && trade.notes.length > 10) score += 5;
      if (trade.lessons) score += 10;
      if (trade.mistakes && trade.mistakes.length > 0) score += 5;
    });
    return Math.min(100, Math.round(score));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.symbol.trim()) newErrors.symbol = "Symbol is required";
    if (!formData.entryPrice || parseFloat(formData.entryPrice) <= 0) 
      newErrors.entryPrice = "Valid entry price is required";
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) 
      newErrors.quantity = "Valid quantity is required";
    if (!formData.entryDate) newErrors.entryDate = "Entry date is required";
    if (formData.status === "CLOSED" && !formData.exitPrice) 
      newErrors.exitPrice = "Exit price is required for closed trades";
    if (formData.status === "CLOSED" && !formData.exitDate) 
      newErrors.exitDate = "Exit date is required for closed trades";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Save trade
  const saveTrade = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('error', 'Please fix the errors in the form');
      return;
    }

    try {
      const tradeData = {
        ...formData,
        id: editingTrade ? editingTrade.id : `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: editingTrade ? editingTrade.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pnl: calculatePnL(formData),
        risk: calculateRisk(formData),
        reward: calculateReward(formData),
        riskRewardRatio: calculateRiskRewardRatio(formData),
        tags: Array.isArray(formData.tags) ? formData.tags : formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      // Save to trades
      let updatedTrades;
      if (editingTrade) {
        updatedTrades = trades.map(trade => 
          trade.id === editingTrade.id ? tradeData : trade
        );
      } else {
        updatedTrades = [tradeData, ...trades];
      }

      setTrades(updatedTrades);
      saveTradesToStorage(updatedTrades);

      // Reset form
      resetForm();
      showNotification('success', editingTrade ? 'Trade updated successfully' : 'Trade added successfully');
    } catch (error) {
      console.error("Error saving trade:", error);
      showNotification('error', 'Failed to save trade');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      symbol: "",
      tradeType: "BUY",
      entryPrice: "",
      exitPrice: "",
      quantity: "",
      entryDate: new Date().toISOString().split('T')[0],
      exitDate: "",
      stopLoss: "",
      target: "",
      notes: "",
      status: "OPEN",
      tags: [],
      emotion: "neutral",
      confidence: 5,
      strategy: "",
      broker: "",
      commission: "",
      fees: "",
      slippage: "",
      screenshot: "",
      riskAmount: "",
      riskPercent: "",
      rewardRiskRatio: "",
      marketCondition: "normal",
      timeOfDay: "",
      mistakes: [],
      lessons: "",
      setup: "",
      exitReason: "",
      improvementAreas: [],
      rating: 0,
      hidden: false,
      pinned: false,
    });
    setEditingTrade(null);
    setShowForm(false);
    setErrors({});
  };

  // Edit trade
  const editTrade = (trade) => {
    setFormData({
      ...trade,
      tags: Array.isArray(trade.tags) ? trade.tags : [],
    });
    setEditingTrade(trade);
    setShowForm(true);
  };

  // Delete trade
  const deleteTrade = (tradeId) => {
    if (!confirm("Are you sure you want to delete this trade? This action cannot be undone.")) return;

    try {
      const updatedTrades = trades.filter(trade => trade.id !== tradeId);
      setTrades(updatedTrades);
      saveTradesToStorage(updatedTrades);
      showNotification('success', 'Trade deleted successfully');
    } catch (error) {
      console.error("Error deleting trade:", error);
      showNotification('error', 'Failed to delete trade');
    }
  };

  // Toggle trade selection
  const toggleTradeSelection = (tradeId) => {
    const newSelected = new Set(selectedTrades);
    if (newSelected.has(tradeId)) {
      newSelected.delete(tradeId);
    } else {
      newSelected.add(tradeId);
    }
    setSelectedTrades(newSelected);
  };

  // Bulk actions
  const bulkDelete = () => {
    if (selectedTrades.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedTrades.size} trades?`)) return;

    const updatedTrades = trades.filter(trade => !selectedTrades.has(trade.id));
    setTrades(updatedTrades);
    saveTradesToStorage(updatedTrades);
    setSelectedTrades(new Set());
    showNotification('success', `${selectedTrades.size} trades deleted successfully`);
  };

  const bulkUpdateStatus = (status) => {
    if (selectedTrades.size === 0) return;

    const updatedTrades = trades.map(trade => 
      selectedTrades.has(trade.id) ? { ...trade, status, updatedAt: new Date().toISOString() } : trade
    );
    setTrades(updatedTrades);
    saveTradesToStorage(updatedTrades);
    showNotification('success', `${selectedTrades.size} trades updated to ${status}`);
  };

  // Export trades
  const exportTrades = () => {
    const data = filteredTrades.length > 0 ? filteredTrades : trades;
    
    if (exportFormat === 'csv') {
      const headers = ['Symbol', 'Type', 'Entry', 'Exit', 'Quantity', 'P&L', 'Status', 'Entry Date', 'Exit Date', 'Tags'];
      const csv = [
        headers.join(','),
        ...data.map(trade => [
          trade.symbol,
          trade.tradeType,
          trade.entryPrice,
          trade.exitPrice || '',
          trade.quantity,
          calculatePnL(trade),
          trade.status,
          trade.entryDate,
          trade.exitDate || '',
          (trade.tags || []).join(';')
        ].map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trading_journal_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trading_journal_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }

    showNotification('success', `Exported ${data.length} trades`);
  };

  // Import trades
  const importTrades = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        let importedTrades;
        
        if (file.name.endsWith('.json')) {
          importedTrades = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          // Parse CSV
          const lines = content.split('\n');
          const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
          importedTrades = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
              const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
              const trade = {};
              headers.forEach((header, index) => {
                const key = header.toLowerCase().replace(/\s+/g, '');
                trade[key] = values[index];
              });
              return trade;
            })
            .filter(trade => trade.symbol);
        }

        if (importedTrades && importedTrades.length > 0) {
          const updatedTrades = [...importedTrades.map(trade => ({
            ...trade,
            id: trade.id || `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: trade.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: trade.tags ? (Array.isArray(trade.tags) ? trade.tags : trade.tags.split(',').map(t => t.trim())) : [],
          })), ...trades];
          
          setTrades(updatedTrades);
          saveTradesToStorage(updatedTrades);
          showNotification('success', `Imported ${importedTrades.length} trades successfully`);
        }
      } catch (error) {
        console.error("Import error:", error);
        showNotification('error', 'Failed to import trades. Please check file format.');
      } finally {
        setImporting(false);
        event.target.value = ''; // Reset file input
      }
    };

    reader.readAsText(file);
  };

  // AI Insights (simulated)
  const generateAiInsights = async () => {
    if (trades.length < 3) {
      showNotification('info', 'Need at least 3 trades to generate insights');
      return;
    }

    setLoadingAiInsights(true);
    try {
      // Simulate AI insights
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const closedTrades = trades.filter(t => t.status === 'CLOSED');
      const winningTrades = closedTrades.filter(t => calculatePnL(t) > 0);
      const losingTrades = closedTrades.filter(t => calculatePnL(t) < 0);
      
      // Find best performing symbol
      const symbolPerformance = {};
      closedTrades.forEach(trade => {
        const pnl = calculatePnL(trade);
        if (!symbolPerformance[trade.symbol]) {
          symbolPerformance[trade.symbol] = { total: 0, count: 0 };
        }
        symbolPerformance[trade.symbol].total += pnl;
        symbolPerformance[trade.symbol].count++;
      });

      let bestSymbol = '';
      let bestPnL = -Infinity;
      Object.entries(symbolPerformance).forEach(([symbol, data]) => {
        if (data.total > bestPnL) {
          bestPnL = data.total;
          bestSymbol = symbol;
        }
      });

      // Calculate average win/loss
      const avgWin = winningTrades.length > 0 ? 
        winningTrades.reduce((sum, trade) => sum + calculatePnL(trade), 0) / winningTrades.length : 0;
      const avgLoss = losingTrades.length > 0 ? 
        Math.abs(losingTrades.reduce((sum, trade) => sum + calculatePnL(trade), 0) / losingTrades.length) : 0;

      // Generate insights
      const insights = {
        bestPerformingSymbol: bestSymbol || 'N/A',
        worstPerformingSymbol: Object.entries(symbolPerformance).reduce((worst, [symbol, data]) => 
          data.total < worst.pnl ? { symbol, pnl: data.total } : worst, 
          { symbol: '', pnl: Infinity }
        ).symbol || 'N/A',
        winRate: stats.winRate,
        profitFactor: stats.profitFactor,
        avgWin,
        avgLoss,
        recommendations: [
          avgLoss > avgWin * 2 ? 'Consider tightening your stop losses' : 'Good risk management',
          stats.winRate < 50 ? 'Focus on improving entry timing' : 'Solid win rate',
          stats.profitFactor < 1.5 ? 'Work on letting winners run' : 'Excellent profit factor',
        ],
        bestTimeOfDay: 'Analyze your trade times to find optimal hours',
        improvementAreas: [
          'Document your trade setup more consistently',
          'Review losing trades for patterns',
          'Consider position sizing adjustments',
        ],
        nextSteps: [
          'Add more trades for better insights',
          'Review your top 3 winning trades',
          'Analyze common mistakes',
        ]
      };

      setAiInsights(insights);
      showNotification('success', 'AI insights generated successfully');
    } catch (error) {
      console.error("AI insights error:", error);
      showNotification('error', 'Failed to generate insights');
    } finally {
      setLoadingAiInsights(false);
    }
  };

  // Notification system
  const showNotification = (type, message) => {
    const id = Date.now();
    const notification = { id, type, message };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Filter trades
  useEffect(() => {
    let filtered = [...trades];

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(trade => trade.status === filters.status);
    }
    if (filters.tradeType !== 'all') {
      filtered = filtered.filter(trade => trade.tradeType === filters.tradeType);
    }
    if (filters.symbol) {
      filtered = filtered.filter(trade => 
        trade.symbol.toLowerCase().includes(filters.symbol.toLowerCase())
      );
    }
    if (filters.winOnly) {
      filtered = filtered.filter(trade => calculatePnL(trade) > 0);
    }
    if (filters.lossOnly) {
      filtered = filtered.filter(trade => calculatePnL(trade) < 0);
    }
    if (filters.tags.length > 0) {
      filtered = filtered.filter(trade => 
        filters.tags.every(tag => (trade.tags || []).includes(tag))
      );
    }
    if (searchQuery) {
      filtered = filtered.filter(trade => 
        trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trade.notes && trade.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (trade.strategy && trade.strategy.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (!showHiddenTrades) {
      filtered = filtered.filter(trade => !trade.hidden);
    }

    // Apply timeframe
    if (selectedTimeframe !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (selectedTimeframe) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoff.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(trade => 
        new Date(trade.entryDate) >= cutoff
      );
    }

    setFilteredTrades(filtered);
  }, [trades, filters, searchQuery, showHiddenTrades, selectedTimeframe]);

  // Calculate stats when trades change
  useEffect(() => {
    calculateEnhancedStats();
  }, [trades, calculateEnhancedStats]);

  // Save settings when they change
  useEffect(() => {
    saveSettings();
  }, [currency, performanceGoals]);

  // Load trades on mount
  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  // Chart colors based on theme
  const chartColors = theme === 'dark' 
    ? ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6']
    : ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777', '#0D9488'];

  // Sample data for charts when no trades exist
  const sampleMonthlyData = [
    { month: 'Jan', pnl: 1500 },
    { month: 'Feb', pnl: -500 },
    { month: 'Mar', pnl: 2200 },
    { month: 'Apr', pnl: 1800 },
    { month: 'May', pnl: 900 },
    { month: 'Jun', pnl: 3100 },
  ];

  const sampleTradeDistribution = [
    { name: 'Wins', value: 65 },
    { name: 'Losses', value: 35 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300">
            Loading Trading Journal
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Your data is loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100'
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 text-gray-900'
    }`}>
      {/* Top Navigation */}
      <nav className={` border-b ${
        theme === 'dark' 
          ? 'bg-gray-800/90 backdrop-blur-md border-gray-700'
          : 'bg-white/90 backdrop-blur-md border-gray-200'
      }`}>
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}>
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Trading Journal
                </h1>
                <p className="text-xs opacity-75">Free • Unlimited • No Login Required</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-xl mx-4">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search trades, symbols, notes..."
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500'
                  } focus:outline-none focus:ring-2 transition-all`}
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-lg relative ${
                    theme === 'dark'
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 rounded-lg shadow-xl z-50 ${
                    theme === 'dark'
                      ? 'bg-gray-800 border border-gray-700'
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="p-4 border-b border-gray-700">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-center text-sm opacity-75">No notifications</p>
                      ) : (
                        notifications.map(notification => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b last:border-b-0 ${
                              theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
                            } ${notification.type === 'success' ? 'bg-green-500/10' : 
                              notification.type === 'error' ? 'bg-red-500/10' : 
                              'bg-blue-500/10'}`}
                          >
                            <div className="flex items-start">
                              {notification.type === 'success' ? (
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                              ) : notification.type === 'error' ? (
                                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                              )}
                              <p className="text-sm">{notification.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg ${
                  theme === 'dark'
                    ? 'hover:bg-gray-500'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Settings className="h-5 w-5" />
              </button>

              {/* Help */}
              <button
                onClick={() => setShowHelp(!showHelp)}
                className={`p-2 rounded-lg ${
                  theme === 'dark'
                    ? 'hover:bg-gray-500'
                    : 'hover:bg-gray-100'
                }`}
              >
                <HelpCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Overall Score */}
          <div className={`rounded-xl p-4 border ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">Overall Score</p>
                <div className="flex items-baseline mt-1">
                  <span className="text-3xl font-bold">{stats.overallScore}</span>
                  <span className="text-sm opacity-75 ml-1">/100</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${
                stats.overallScore >= 80 ? 'bg-green-500/20 text-green-400' :
                stats.overallScore >= 60 ? 'bg-blue-500/20 text-blue-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                <Award className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    stats.overallScore >= 80 ? 'bg-green-500' :
                    stats.overallScore >= 60 ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}
                  style={{ width: `${stats.overallScore}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1 opacity-75">
                <span>Based on {trades.length} trades</span>
              </div>
            </div>
          </div>

          {/* Win Rate */}
          <div className={`rounded-xl p-4 border ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">Win Rate</p>
                <div className="flex items-baseline mt-1">
                  <span className="text-3xl font-bold">{stats.winRate}%</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${
                stats.winRate >= 60 ? 'bg-green-500/20 text-green-400' :
                stats.winRate >= 40 ? 'bg-blue-500/20 text-blue-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                <TargetIcon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-sm opacity-75">
                {stats.closedTrades} closed trades • {Math.round(stats.closedTrades * stats.winRate / 100)} wins
              </div>
            </div>
          </div>

          {/* Net Profit */}
          <div className={`rounded-xl p-4 border ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">Net Profit</p>
                <div className="flex items-baseline mt-1">
                  <span className={`text-3xl font-bold ${
                    stats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatCurrency(stats.netProfit)}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${
                stats.netProfit >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-sm opacity-75">
                Profit: {formatCurrency(stats.totalProfit)} • Loss: {formatCurrency(stats.totalLoss)}
              </div>
            </div>
          </div>

          {/* Profit Factor */}
          <div className={`rounded-xl p-4 border ${
            theme === 'dark'
              ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">Profit Factor</p>
                <div className="flex items-baseline mt-1">
                  <span className="text-3xl font-bold">{stats.profitFactor.toFixed(2)}</span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${
                stats.profitFactor >= 2 ? 'bg-green-500/20 text-green-400' :
                stats.profitFactor >= 1.5 ? 'bg-blue-500/20 text-blue-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-sm opacity-75">
                {stats.profitFactor >= 2 ? 'Excellent' : 
                 stats.profitFactor >= 1.5 ? 'Good' : 
                 stats.profitFactor >= 1 ? 'Break-even' : 'Needs Improvement'}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats and Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance Charts */}
            {showCharts && (
              <div className={`rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Performance Analytics
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCharts(!showCharts)}
                      className="p-1 hover:opacity-75"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Monthly Performance */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 opacity-75">Monthly P&L</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsBarChart data={stats.monthlyPerformance.length > 0 ? stats.monthlyPerformance.slice(-6) : sampleMonthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                            <XAxis 
                              dataKey="month" 
                              stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                              fontSize={12}
                            />
                            <YAxis 
                              stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                              fontSize={12}
                              tickFormatter={(value) => formatCurrency(value).replace(/[^\d.-]/g, '')}
                            />
                            <Tooltip
                              formatter={(value) => [formatCurrency(value), 'P&L']}
                              labelFormatter={(label) => `Month: ${label}`}
                              contentStyle={{
                                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                                borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                                borderRadius: '0.5rem',
                              }}
                            />
                            <Bar 
                              dataKey="pnl" 
                              fill={chartColors[0]}
                              radius={[4, 4, 0, 0]}
                            />
                          </RechartsBarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Win/Loss Distribution */}
                    <div>
                      <h4 className="text-sm font-medium mb-3 opacity-75">Trade Distribution</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <Pie
                              data={stats.closedTrades > 0 ? [
                                { name: 'Wins', value: Math.round(stats.closedTrades * stats.winRate / 100) },
                                { name: 'Losses', value: stats.closedTrades - Math.round(stats.closedTrades * stats.winRate / 100) },
                              ] : sampleTradeDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={50}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              <Cell fill={chartColors[1]} />
                              <Cell fill={chartColors[3]} />
                            </Pie>
                            <Tooltip
                              formatter={(value) => [value, 'Trades']}
                              contentStyle={{
                                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                                borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                                borderRadius: '0.5rem',
                              }}
                            />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Metrics */}
            {showRiskMetrics && (
              <div className={`rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Risk Metrics
                  </h3>
                  <button
                    onClick={() => setShowRiskMetrics(!showRiskMetrics)}
                    className="p-1 hover:opacity-75"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-gray-700/30">
                      <div className="text-2xl font-bold text-blue-400">{stats.maxDrawdown.toFixed(2)}%</div>
                      <div className="text-sm opacity-75 mt-1">Max Drawdown</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gray-700/30">
                      <div className="text-2xl font-bold text-green-400">{stats.sharpeRatio.toFixed(2)}</div>
                      <div className="text-sm opacity-75 mt-1">Sharpe Ratio</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gray-700/30">
                      <div className="text-2xl font-bold text-purple-400">{stats.recoveryFactor.toFixed(2)}</div>
                      <div className="text-sm opacity-75 mt-1">Recovery Factor</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gray-700/30">
                      <div className="text-2xl font-bold text-yellow-400">{stats.avgHoldingPeriod.toFixed(1)} days</div>
                      <div className="text-sm opacity-75 mt-1">Avg Holding</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trades Table */}
            <div className={`rounded-xl border ${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="font-semibold">Your Trades</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    {filteredTrades.length} trades
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* View Toggle */}
                  <div className={`flex rounded-lg p-1 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1 rounded ${
                        viewMode === 'grid' 
                          ? theme === 'dark' ? 'bg-gray-600' : 'bg-white shadow'
                          : ''
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1 rounded ${
                        viewMode === 'list' 
                          ? theme === 'dark' ? 'bg-gray-600' : 'bg-white shadow'
                          : ''
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Filters */}
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                  </button>

                  {/* Add Trade */}
                  <button
                    onClick={() => setShowForm(true)}
                    className={`p-2 rounded-lg flex items-center gap-2 ${
                      theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Trade</span>
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className={`p-4 border-b ${
                  theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className={`px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-gray-100'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">All Status</option>
                      <option value="OPEN">Open</option>
                      <option value="CLOSED">Closed</option>
                    </select>

                    <select
                      value={filters.tradeType}
                      onChange={(e) => setFilters({ ...filters, tradeType: e.target.value })}
                      className={`px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-gray-100'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">All Types</option>
                      <option value="BUY">Buy</option>
                      <option value="SELL">Sell</option>
                    </select>

                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      className={`px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-gray-100'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>

                    <button
                      onClick={() => {
                        setFilters({
                          status: 'all',
                          tradeType: 'all',
                          dateRange: 'all',
                          symbol: '',
                          minProfit: '',
                          maxProfit: '',
                          winOnly: false,
                          lossOnly: false,
                          tags: [],
                          riskLevel: 'all',
                          holdingPeriod: 'all',
                        });
                        setSelectedTimeframe('all');
                        setSearchQuery('');
                      }}
                      className={`px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200 border-gray-300'
                      }`}
                    >
                      Clear Filters
                    </button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.winOnly}
                        onChange={(e) => setFilters({ ...filters, winOnly: e.target.checked, lossOnly: false })}
                        className="rounded"
                      />
                      <span className="text-sm">Winning Trades Only</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.lossOnly}
                        onChange={(e) => setFilters({ ...filters, lossOnly: e.target.checked, winOnly: false })}
                        className="rounded"
                      />
                      <span className="text-sm">Losing Trades Only</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Bulk Actions */}
              {selectedTrades.size > 0 && (
                <div className={`p-4 border-b ${
                  theme === 'dark' ? 'border-gray-700 bg-blue-900/20' : 'border-gray-200 bg-blue-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full ${
                        theme === 'dark' ? 'bg-blue-500/30' : 'bg-blue-100'
                      }`}>
                        <span className="text-sm font-medium">{selectedTrades.size} selected</span>
                      </div>
                      <button
                        onClick={() => setSelectedTrades(new Set())}
                        className="text-sm opacity-75 hover:opacity-100"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => bulkUpdateStatus('OPEN')}
                        className={`px-3 py-1 rounded text-sm ${
                          theme === 'dark'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        Mark Open
                      </button>
                      <button
                        onClick={() => bulkUpdateStatus('CLOSED')}
                        className={`px-3 py-1 rounded text-sm ${
                          theme === 'dark'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        Mark Closed
                      </button>
                      <button
                        onClick={bulkDelete}
                        className={`px-3 py-1 rounded text-sm ${
                          theme === 'dark'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Trades Grid/List */}
              <div className="p-4">
                {filteredTrades.length === 0 ? (
                  <div className="text-center py-12">
                    <div className={`inline-flex p-4 rounded-full ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <AlertCircle className="h-12 w-12 opacity-50" />
                    </div>
                    <h3 className="text-lg font-medium mt-4 mb-2">No trades found</h3>
                    <p className="opacity-75 mb-6">Try adjusting your filters or add a new trade</p>
                    <button
                      onClick={() => setShowForm(true)}
                      className={`px-4 py-2 rounded-lg ${
                        theme === 'dark'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      Add Your First Trade
                    </button>
                  </div>
                ) : viewMode === 'grid' ? (
                  // Grid View
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTrades.slice(0, 12).map((trade) => {
                      const pnl = calculatePnL(trade);
                      const rrRatio = calculateRiskRewardRatio(trade);
                      
                      return (
                        <div
                          key={trade.id}
                          className={`rounded-lg border p-4 cursor-pointer transition-all hover:scale-[1.02] ${
                            selectedTrades.has(trade.id)
                              ? theme === 'dark'
                                ? 'border-blue-500 bg-blue-900/20'
                                : 'border-blue-500 bg-blue-50'
                              : theme === 'dark'
                                ? 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                          onClick={() => toggleTradeSelection(trade.id)}
                        >
                          {/* Trade Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">{trade.symbol}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  trade.tradeType === 'BUY'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {trade.tradeType}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  trade.status === 'CLOSED'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {trade.status}
                                </span>
                                {trade.pinned && (
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400">
                                    Pinned
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-bold ${
                                pnl >= 0 ? 'text-green-500' : 'text-red-500'
                              }`}>
                                {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                              </div>
                              {trade.status === 'CLOSED' && trade.entryPrice && trade.quantity && (
                                <div className="text-xs opacity-75">
                                  {((pnl / (parseFloat(trade.entryPrice) * parseFloat(trade.quantity))) * 100).toFixed(2)}%
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Trade Details */}
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="opacity-75">Entry</span>
                              <span className="font-medium">{formatCurrency(parseFloat(trade.entryPrice) || 0)}</span>
                            </div>
                            {trade.exitPrice && (
                              <div className="flex justify-between">
                                <span className="opacity-75">Exit</span>
                                <span className="font-medium">{formatCurrency(parseFloat(trade.exitPrice))}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="opacity-75">Quantity</span>
                              <span className="font-medium">{trade.quantity}</span>
                            </div>
                            {trade.stopLoss && (
                              <div className="flex justify-between">
                                <span className="opacity-75">Stop Loss</span>
                                <span className="font-medium">{formatCurrency(parseFloat(trade.stopLoss))}</span>
                              </div>
                            )}
                            {rrRatio > 0 && (
                              <div className="flex justify-between">
                                <span className="opacity-75">R:R Ratio</span>
                                <span className="font-medium">{rrRatio.toFixed(2)}</span>
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          {trade.tags && trade.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {trade.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-0.5 rounded-full text-xs bg-gray-700/50"
                                >
                                  {tag}
                                </span>
                              ))}
                              {trade.tags.length > 3 && (
                                <span className="px-2 py-0.5 rounded-full text-xs bg-gray-700/50">
                                  +{trade.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Notes Preview */}
                          {trade.notes && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <p className="text-sm opacity-75 truncate">{trade.notes.substring(0, 60)}...</p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-700">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                editTrade(trade);
                              }}
                              className="p-1 hover:opacity-75"
                              title="Edit trade"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTrade(trade.id);
                              }}
                              className="p-1 hover:opacity-75 text-red-400"
                              title="Delete trade"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  // Table View
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            <input
                              type="checkbox"
                              checked={selectedTrades.size === filteredTrades.length && filteredTrades.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTrades(new Set(filteredTrades.map(t => t.id)));
                                } else {
                                  setSelectedTrades(new Set());
                                }
                              }}
                              className="rounded"
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Symbol
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Entry
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Exit
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            P&L
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {filteredTrades.slice(0, 20).map((trade) => {
                          const pnl = calculatePnL(trade);
                          return (
                            <tr key={trade.id} className="hover:bg-gray-700/30">
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={selectedTrades.has(trade.id)}
                                  onChange={() => toggleTradeSelection(trade.id)}
                                  className="rounded"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-medium">{trade.symbol}</div>
                                <div className="text-xs opacity-75">{trade.entryDate}</div>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  trade.tradeType === 'BUY'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                  {trade.tradeType}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-medium">{formatCurrency(parseFloat(trade.entryPrice) || 0)}</div>
                                <div className="text-xs opacity-75">Qty: {trade.quantity}</div>
                              </td>
                              <td className="px-4 py-3">
                                {trade.exitPrice ? (
                                  <>
                                    <div className="font-medium">{formatCurrency(parseFloat(trade.exitPrice))}</div>
                                    <div className="text-xs opacity-75">{trade.exitDate}</div>
                                  </>
                                ) : (
                                  <span className="text-xs opacity-75">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className={`font-bold ${
                                  pnl >= 0 ? 'text-green-500' : 'text-red-500'
                                }`}>
                                  {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                                </div>
                                {trade.status === 'CLOSED' && trade.entryPrice && trade.quantity && (
                                  <div className="text-xs opacity-75">
                                    {((pnl / (parseFloat(trade.entryPrice) * parseFloat(trade.quantity))) * 100).toFixed(2)}%
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  trade.status === 'CLOSED'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {trade.status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => editTrade(trade)}
                                    className="p-1 hover:opacity-75"
                                    title="Edit trade"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteTrade(trade.id)}
                                    className="p-1 hover:opacity-75 text-red-400"
                                    title="Delete trade"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {filteredTrades.length > 20 && (
                <div className={`p-4 border-t ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm opacity-75">
                      Showing 1-20 of {filteredTrades.length} trades
                    </div>
                    <div className="flex items-center gap-2">
                      <button className={`px-3 py-1 rounded ${
                        theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}>
                        Previous
                      </button>
                      <button className={`px-3 py-1 rounded ${
                        theme === 'dark'
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}>
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Insights and Actions */}
          <div className="space-y-8">
            {/* AI Insights */}
            {showPerformanceInsights && (
              <div className={`rounded-xl border ${
                theme === 'dark'
                  ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700'
                  : 'bg-gradient-to-b from-white to-gray-50 border-gray-200'
              }`}>
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    AI Insights
                  </h3>
                  <button
                    onClick={() => setShowPerformanceInsights(!showPerformanceInsights)}
                    className="p-1 hover:opacity-75"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4">
                  {loadingAiInsights ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                      <p className="mt-3 text-sm opacity-75">Analyzing your trades...</p>
                    </div>
                  ) : aiInsights ? (
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <div className="text-sm font-medium text-purple-400">Best Performing</div>
                        <div className="text-lg font-bold mt-1">{aiInsights.bestPerformingSymbol}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="text-sm font-medium text-blue-400">Win Rate</div>
                        <div className="text-2xl font-bold mt-1">{aiInsights.winRate.toFixed(1)}%</div>
                      </div>
                      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <div className="text-sm font-medium text-yellow-400">Recommendations</div>
                        <ul className="mt-2 space-y-1">
                          {aiInsights.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm flex items-start gap-2">
                              <span className="mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className={`inline-flex p-3 rounded-full ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <Brain className="h-8 w-8 opacity-50" />
                      </div>
                      <p className="mt-3 text-sm opacity-75">Generate AI-powered insights based on your trading data</p>
                      <button
                        onClick={generateAiInsights}
                        disabled={trades.length < 3}
                        className={`mt-4 px-4 py-2 rounded-lg flex items-center gap-2 mx-auto ${
                          trades.length < 3
                            ? 'opacity-50 cursor-not-allowed'
                            : theme === 'dark'
                              ? 'bg-purple-600 hover:bg-purple-700'
                              : 'bg-purple-500 hover:bg-purple-600 text-white'
                        }`}
                      >
                        <Zap className="h-4 w-4" />
                        Generate Insights
                      </button>
                      {trades.length < 3 && (
                        <p className="text-xs opacity-75 mt-2">Need at least 3 trades</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className={`rounded-xl border ${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold">Quick Actions</h3>
              </div>
              <div className="p-4 space-y-3">
                <button
                  onClick={() => setShowForm(true)}
                  className={`w-full px-4 py-3 rounded-lg flex items-center justify-between group transition-all ${
                    theme === 'dark'
                      ? 'bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30'
                      : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-blue-500/30' : 'bg-blue-100'
                    }`}>
                      <Plus className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Add Trade</div>
                      <div className="text-sm opacity-75">Quick entry form</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 opacity-50 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={exportTrades}
                  className={`w-full px-4 py-3 rounded-lg flex items-center justify-between group transition-all ${
                    theme === 'dark'
                      ? 'bg-green-600/20 hover:bg-green-600/30 border border-green-500/30'
                      : 'bg-green-50 hover:bg-green-100 border border-green-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-green-500/30' : 'bg-green-100'
                    }`}>
                      <Download className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Export Trades</div>
                      <div className="text-sm opacity-75">{exportFormat.toUpperCase()} format</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 opacity-50 group-hover:translate-x-1 transition-transform" />
                </button>

                <label className={`w-full px-4 py-3 rounded-lg flex items-center justify-between group transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30'
                    : 'bg-purple-50 hover:bg-purple-100 border border-purple-200'
                }`}>
                  <input
                    type="file"
                    accept=".json,.csv"
                    onChange={importTrades}
                    className="hidden"
                    disabled={importing}
                  />
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-purple-500/30' : 'bg-purple-100'
                    }`}>
                      <Upload className="h-5 w-5 text-purple-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">
                        {importing ? 'Importing...' : 'Import Trades'}
                      </div>
                      <div className="text-sm opacity-75">JSON or CSV</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 opacity-50 group-hover:translate-x-1 transition-transform" />
                </label>

                <button
                  onClick={() => {
                    localStorage.removeItem('trading-journal-pro-trades');
                    setTrades([]);
                    showNotification('success', 'All trades cleared');
                  }}
                  className={`w-full px-4 py-3 rounded-lg flex items-center justify-between group transition-all ${
                    theme === 'dark'
                      ? 'bg-red-600/20 hover:bg-red-600/30 border border-red-500/30'
                      : 'bg-red-50 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-red-500/30' : 'bg-red-100'
                    }`}>
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Clear All Trades</div>
                      <div className="text-sm opacity-75">Start fresh</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 opacity-50 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Goals Progress */}
            <div className={`rounded-xl border ${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold">Monthly Goals</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Profit Target</span>
                    <span>{formatCurrency(stats.netProfit)} / {formatCurrency(performanceGoals.monthlyProfitTarget)}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ width: `${Math.min(100, (stats.netProfit / performanceGoals.monthlyProfitTarget) * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Win Rate Target</span>
                    <span>{stats.winRate.toFixed(1)}% / {performanceGoals.winRateTarget}%</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${Math.min(100, (stats.winRate / performanceGoals.winRateTarget) * 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Trades This Month</span>
                    <span>{stats.closedTrades} / {performanceGoals.tradesPerMonth}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500"
                      style={{ width: `${Math.min(100, (stats.closedTrades / performanceGoals.tradesPerMonth) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`rounded-xl border ${
              theme === 'dark'
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
            }`}>
              <div className="p-4 border-b border-gray-700">
                <h3 className="font-semibold">Recent Activity</h3>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {trades.slice(0, 5).map((trade, index) => {
                    const pnl = calculatePnL(trade);
                    return (
                      <div key={trade.id} className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          trade.status === 'CLOSED'
                            ? pnl >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                            : 'bg-blue-500/20'
                        }`}>
                          {trade.status === 'CLOSED' ? (
                            pnl >= 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-400" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-400" />
                            )
                          ) : (
                            <Clock className="h-4 w-4 text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{trade.symbol}</div>
                          <div className="text-sm opacity-75">
                            {trade.tradeType} • {trade.quantity} shares
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${
                          trade.status === 'CLOSED' ? (pnl >= 0 ? 'text-green-400' : 'text-red-400') : 'text-blue-400'
                        }`}>
                          {trade.status === 'CLOSED' ? (
                            <>
                              {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                            </>
                          ) : (
                            'Open'
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {trades.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm opacity-75">No recent trades</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Trade Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col ${
            theme === 'dark'
              ? 'bg-gray-900 border border-gray-800'
              : 'bg-white border border-gray-200'
          }`}>
            {/* Modal Header */}
            <div className={`p-6 border-b ${
              theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    {editingTrade ? 'Edit Trade' : 'Add New Trade'}
                  </h2>
                  <p className="opacity-75 mt-1">
                    {editingTrade ? 'Update your trade details' : 'Track a new trading position'}
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={saveTrade} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                      }`}>
                        <Hash className="h-4 w-4 text-blue-500" />
                      </div>
                      Basic Information
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Symbol *</label>
                      <input
                        type="text"
                        value={formData.symbol}
                        onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.symbol ? 'border-red-500' : 
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="AAPL, TSLA, BTC"
                      />
                      {errors.symbol && (
                        <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Trade Type</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, tradeType: 'BUY' })}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            formData.tradeType === 'BUY'
                              ? 'bg-green-500 text-white'
                              : theme === 'dark'
                                ? 'bg-gray-800 hover:bg-gray-700'
                                : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          BUY
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, tradeType: 'SELL' })}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            formData.tradeType === 'SELL'
                              ? 'bg-red-500 text-white'
                              : theme === 'dark'
                                ? 'bg-gray-800 hover:bg-gray-700'
                                : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          SELL
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, status: 'OPEN' })}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            formData.status === 'OPEN'
                              ? 'bg-blue-500 text-white'
                              : theme === 'dark'
                                ? 'bg-gray-800 hover:bg-gray-700'
                                : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          OPEN
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, status: 'CLOSED' })}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            formData.status === 'CLOSED'
                              ? 'bg-gray-600 text-white'
                              : theme === 'dark'
                                ? 'bg-gray-800 hover:bg-gray-700'
                                : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          CLOSED
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Entry Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                      }`}>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      Entry Details
                    </h3>

                    <div>
                      <label className="block text-sm font-medium mb-1">Entry Price *</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.entryPrice}
                        onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.entryPrice ? 'border-red-500' : 
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="0.00"
                      />
                      {errors.entryPrice && (
                        <p className="text-red-500 text-sm mt-1">{errors.entryPrice}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Quantity *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.quantity ? 'border-red-500' : 
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="0"
                      />
                      {errors.quantity && (
                        <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Entry Date *</label>
                      <input
                        type="date"
                        value={formData.entryDate}
                        onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.entryDate ? 'border-red-500' : 
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2`}
                      />
                      {errors.entryDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.entryDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Exit Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
                      }`}>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      </div>
                      Exit Details
                    </h3>

                    <div>
                      <label className="block text-sm font-medium mb-1">Exit Price</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.exitPrice}
                        onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.exitPrice ? 'border-red-500' : 
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="0.00"
                      />
                      {errors.exitPrice && (
                        <p className="text-red-500 text-sm mt-1">{errors.exitPrice}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Exit Date</label>
                      <input
                        type="date"
                        value={formData.exitDate}
                        onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          errors.exitDate ? 'border-red-500' : 
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2`}
                      />
                      {errors.exitDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.exitDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Exit Reason</label>
                      <input
                        type="text"
                        value={formData.exitReason}
                        onChange={(e) => setFormData({ ...formData, exitReason: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="Why did you exit?"
                      />
                    </div>
                  </div>

                  {/* Risk Management */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'
                      }`}>
                        <Shield className="h-4 w-4 text-yellow-500" />
                      </div>
                      Risk Management
                    </h3>

                    <div>
                      <label className="block text-sm font-medium mb-1">Stop Loss</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.stopLoss}
                        onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Target</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={formData.target}
                        onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Risk Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.riskAmount}
                        onChange={(e) => setFormData({ ...formData, riskAmount: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Psychology */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                      }`}>
                        <Brain className="h-4 w-4 text-purple-500" />
                      </div>
                      Psychology
                    </h3>

                    <div>
                      <label className="block text-sm font-medium mb-1">Emotion</label>
                      <select
                        value={formData.emotion}
                        onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2`}
                      >
                        <option value="neutral">Neutral</option>
                        <option value="confident">Confident</option>
                        <option value="calm">Calm</option>
                        <option value="anxious">Anxious</option>
                        <option value="fearful">Fearful</option>
                        <option value="greedy">Greedy</option>
                        <option value="frustrated">Frustrated</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Confidence Level: {formData.confidence}/10
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.confidence}
                        onChange={(e) => setFormData({ ...formData, confidence: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span>Low</span>
                        <span>High</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Market Condition</label>
                      <select
                        value={formData.marketCondition}
                        onChange={(e) => setFormData({ ...formData, marketCondition: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2`}
                      >
                        <option value="normal">Normal</option>
                        <option value="volatile">Volatile</option>
                        <option value="trending">Trending</option>
                        <option value="ranging">Ranging</option>
                        <option value="breaking-out">Breaking Out</option>
                        <option value="breaking-down">Breaking Down</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-4 lg:col-span-2">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <BookOpen className="h-4 w-4" />
                      </div>
                      Additional Information
                    </h3>

                    <div>
                      <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                      <input
                        type="text"
                        value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="momentum, breakout, earnings"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Strategy</label>
                      <input
                        type="text"
                        value={formData.strategy}
                        onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="Your trading strategy"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Notes & Lessons Learned</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={4}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 focus:border-blue-500 focus:ring-blue-500/20'
                            : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="What went well? What could be improved? Key takeaways..."
                      />
                    </div>
                  </div>
                </div>

                {/* Preview Card */}
                <div className={`mt-6 p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
                }`}>
                  <h4 className="font-semibold mb-3">Trade Preview</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm opacity-75">Symbol</div>
                      <div className="font-medium">{formData.symbol || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-75">Type</div>
                      <div className={`font-medium ${
                        formData.tradeType === 'BUY' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {formData.tradeType || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm opacity-75">Quantity</div>
                      <div className="font-medium">{formData.quantity || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm opacity-75">Risk/Reward</div>
                      <div className="font-medium">
                        {formData.stopLoss && formData.target 
                          ? calculateRiskRewardRatio(formData).toFixed(2)
                          : '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className={`px-6 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'border-gray-700 hover:bg-gray-800'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                      theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Save className="h-4 w-4" />
                    {editingTrade ? 'Update Trade' : 'Save Trade'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

 {/* Settings Modal */}
{showSettings && (
  <div className="overflow-x-hidden inset-0 z-50 overflow-y-auto">
    {/* Backdrop */}
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      onClick={() => setShowSettings(false)}
    />
    
    {/* Modal Container */}
    <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
      <div 
        className={`
          relative w-full max-w-lg sm:max-w-xl md:max-w-2xl
          rounded-xl sm:rounded-2xl shadow-2xl
          transform transition-all duration-300 ease-out
          ${theme === 'dark'
            ? 'bg-gray-900 border border-gray-700'  // Changed to darker bg
            : 'bg-white border border-gray-200'
          }
          my-4 sm:my-8
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 sm:p-6 border-b border-gray-300 dark:border-gray-700 bg-inherit">
          <div className="flex items-center justify-between">
            <h2 className={`
              text-xl sm:text-2xl font-bold
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              Settings
            </h2>
            <button
              onClick={() => setShowSettings(false)}
              className={`
                p-1.5 sm:p-2 rounded-lg transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                ${theme === 'dark'
                  ? 'hover:bg-gray-800 text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
                }
              `}
              aria-label="Close settings"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto max-h-[calc(100vh-12rem)] sm:max-h-[calc(100vh-10rem)] md:max-h-[calc(100vh-8rem)]">
          <div className="p-4 sm:p-6 space-y-6">
            {/* Display Settings */}
            <div>
              <h3 className={`
                font-semibold text-lg mb-4
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                Display Settings
              </h3>
              <div className="space-y-4 sm:space-y-6">
                {/* Dark Mode Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex-1">
                    <div className={`
                      font-medium
                      ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}
                    `}>
                      Dark Mode
                    </div>
                    <div className={`
                      text-sm
                      ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                    `}>
                      Switch between light and dark themes
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`
                      w-14 h-7 sm:w-16 sm:h-8 rounded-full relative transition-colors flex-shrink-0
                      ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}
                    `}
                    aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  >
                    <div className={`
                      w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white absolute top-0.5 transition-transform duration-300
                      ${theme === 'dark' ? 'translate-x-7 sm:translate-x-8' : 'translate-x-0.5'}
                    `} />
                  </button>
                </div>

                {/* Currency Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex-1">
                    <div className={`
                      font-medium
                      ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}
                    `}>
                      Currency
                    </div>
                    <div className={`
                      text-sm
                      ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                    `}>
                      Display currency for all values
                    </div>
                  </div>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className={`
                      w-full sm:w-48 px-3 py-2 sm:py-1.5 rounded-lg border text-sm sm:text-base
                      transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      ${theme === 'dark'
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                      }
                    `}
                  >
                    <option value="USD" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">USD ($)</option>
                    <option value="EUR" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">EUR (€)</option>
                    <option value="GBP" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">GBP (£)</option>
                    <option value="INR" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">INR (₹)</option>
                    <option value="JPY" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">JPY (¥)</option>
                    <option value="CAD" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">CAD (C$)</option>
                    <option value="AUD" className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">AUD (A$)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Performance Goals */}
            <div>
              <h3 className={`
                font-semibold text-lg mb-4
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                Performance Goals
              </h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Monthly Profit Target */}
                  <div>
                    <label className={`
                      block text-sm font-medium mb-2
                      ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                    `}>
                      Monthly Profit Target
                    </label>
                    <div className="relative">
                      <span className={`
                        absolute left-3 top-1/2 transform -translate-y-1/2
                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
                      `}>
                        {currency === 'USD' ? '$' : 
                         currency === 'EUR' ? '€' : 
                         currency === 'GBP' ? '£' : 
                         currency === 'INR' ? '₹' : 
                         currency === 'JPY' ? '¥' : 
                         currency === 'CAD' ? 'C$' : 'A$'}
                      </span>
                      <input
                        type="number"
                        value={performanceGoals.monthlyProfitTarget}
                        onChange={(e) => setPerformanceGoals({...performanceGoals, monthlyProfitTarget: parseFloat(e.target.value) || 0})}
                        className={`
                          w-full pl-8 pr-3 py-2 sm:py-2.5 rounded-lg border text-sm sm:text-base
                          transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }
                        `}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Win Rate Target */}
                  <div>
                    <label className={`
                      block text-sm font-medium mb-2
                      ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                    `}>
                      Win Rate Target (%)
                    </label>
                    <div className="relative">
                      <span className={`
                        absolute right-3 top-1/2 transform -translate-y-1/2
                        ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
                      `}>
                        %
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={performanceGoals.winRateTarget}
                        onChange={(e) => setPerformanceGoals({...performanceGoals, winRateTarget: parseFloat(e.target.value) || 0})}
                        className={`
                          w-full px-3 pr-10 py-2 sm:py-2.5 rounded-lg border text-sm sm:text-base
                          transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          ${theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                          }
                        `}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Trades Per Month */}
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className={`
                      block text-sm font-medium mb-2
                      ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}
                    `}>
                      Trades Per Month
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={performanceGoals.tradesPerMonth}
                      onChange={(e) => setPerformanceGoals({...performanceGoals, tradesPerMonth: parseInt(e.target.value) || 1})}
                      className={`
                        w-full px-3 py-2 sm:py-2.5 rounded-lg border text-sm sm:text-base
                        transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${theme === 'dark'
                          ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }
                      `}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div>
              <h3 className={`
                font-semibold text-lg mb-4
                ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
              `}>
                Data Management
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={exportTrades}
                    className={`
                      px-4 py-3 sm:py-3.5 rounded-lg flex items-center justify-center gap-2 sm:gap-3
                      transition-all duration-200 font-medium text-sm sm:text-base
                      hover:scale-[1.02] active:scale-[0.98]
                      ${theme === 'dark'
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-100'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }
                    `}
                  >
                    <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                    Export Data
                  </button>
                  <label className={`
                    px-4 py-3 sm:py-3.5 rounded-lg flex items-center justify-center gap-2 sm:gap-3
                    transition-all duration-200 font-medium text-sm sm:text-base cursor-pointer
                    hover:scale-[1.02] active:scale-[0.98]
                    ${theme === 'dark'
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-100'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }
                  `}>
                    <input
                      type="file"
                      accept=".json,.csv"
                      onChange={importTrades}
                      className="hidden"
                    />
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                    Import Data
                  </label>
                </div>

                {/* Clear All Data */}
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                      localStorage.removeItem('trading-journal-pro-trades');
                      setTrades([]);
                      setShowSettings(false);
                      showNotification('success', 'All data cleared successfully');
                    }
                  }}
                  className={`
                    w-full px-4 py-3 sm:py-3.5 rounded-lg flex items-center justify-center gap-2 sm:gap-3
                    transition-all duration-200 font-medium text-sm sm:text-base
                    hover:scale-[1.02] active:scale-[0.98]
                    ${theme === 'dark'
                      ? 'bg-red-900/30 hover:bg-red-900/50 text-red-300'
                      : 'bg-red-50 hover:bg-red-100 text-red-600'
                    }
                  `}
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-300 dark:border-gray-700">
          <div className="flex justify-end">
            <button
              onClick={() => setShowSettings(false)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${theme === 'dark'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                }
              `}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl w-full max-w-2xl ${
            theme === 'dark'
              ? 'bg-gray-900 border border-gray-800'
              : 'bg-white border border-gray-200'
          }`}>
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <HelpCircle className="h-6 w-6" />
                  Help & Documentation
                </h2>
                <button
                  onClick={() => setShowHelp(false)}
                  className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <h3 className="font-semibold mb-2">Getting Started</h3>
                <p className="text-sm opacity-75 mb-2">
                  Add your first trade by clicking the "Add Trade" button. Fill in all required fields
                  and use the additional fields to track your psychology and strategy.
                </p>
                <p className="text-sm opacity-75">
                  All data is stored locally in your browser - no login required!
                </p>
              </div>
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <h3 className="font-semibold mb-2">Understanding Metrics</h3>
                <ul className="text-sm opacity-75 space-y-1">
                  <li>• <strong>Profit Factor</strong>: Total profits / Total losses (aim for &gt; 1.5)</li>
                  <li>• <strong>Sharpe Ratio</strong>: Risk-adjusted returns (higher is better)</li>
                  <li>• <strong>Max Drawdown</strong>: Largest peak-to-trough decline</li>
                  <li>• <strong>Consistency Score</strong>: How consistent your returns are</li>
                  <li>• <strong>Win Rate</strong>: Percentage of winning trades</li>
                </ul>
              </div>
              <div className={`p-4 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <h3 className="font-semibold mb-2">Tips for Better Analysis</h3>
                <ul className="text-sm opacity-75 space-y-1">
                  <li>• Add detailed notes for each trade</li>
                  <li>• Track your emotions and market conditions</li>
                  <li>• Use tags to categorize trades</li>
                  <li>• Set realistic performance goals</li>
                  <li>• Export your data regularly for backup</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={`border-t ${
        theme === 'dark' ? 'border-gray-400 bg-gray-400' : 'border-gray-200 bg-white'
      }`}>
        <div className="max-w-8xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Trading Journal Pro</span>
              </div>
              <div className="text-sm opacity-75">
                {trades.length} trades • Free • No login required
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowHelp(true)}
                className="text-sm hover:opacity-75"
              >
                Help
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="text-sm hover:opacity-75"
              >
                Settings
              </button>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  showNotification('info', 'Data stored locally in your browser');
                }}
                className="text-sm hover:opacity-75"
              >
                Privacy
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        [data-theme="dark"] {
          color-scheme: dark;
        }
        input[type="range"] {
          -webkit-appearance: none;
          height: 6px;
          border-radius: 3px;
          background: ${theme === 'dark' ? '#374151' : '#E5E7EB'};
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${theme === 'dark' ? '#3B82F6' : '#2563EB'};
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: ${theme === 'dark' ? '#3B82F6' : '#2563EB'};
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default TradingJournal;