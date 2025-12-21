import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { 
  Upload, FileText, TrendingUp, Shield, ArrowLeft,
  DollarSign, TrendingDown, PieChart, BarChart3,
  Download, Loader2, Calendar, Banknote, Landmark, Wallet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  parseAmount, 
  toINR, 
  normalizeData, 
  generateIncomeStatement,
  generateCashFlowStatement,
  generateBalanceSheet
} from '../components/utility/financialUtils.jsx';
import { processFiles } from '../components/utility/fileProcessor';
import Ads from '../components/Ads/Ads.jsx';

function FinancialDashboard() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Sample data for demo
  const sampleData = [
    {"DATE":"01-04-2025","MONTH":"April","PARTICULARS":"Salary","DEBIT":0,"CREDIT":50000,"TYPE":"INCOME","BANK A/C":"AXIS BANK"},
    {"DATE":"05-04-2025","MONTH":"April","PARTICULARS":"Rent","DEBIT":15000,"CREDIT":0,"TYPE":"EXPENSE","BANK A/C":"AXIS BANK"},
    {"DATE":"10-04-2025","MONTH":"April","PARTICULARS":"Groceries","DEBIT":5000,"CREDIT":0,"TYPE":"EXPENSE","BANK A/C":"AXIS BANK"},
    {"DATE":"15-04-2025","MONTH":"April","PARTICULARS":"Freelance Work","DEBIT":0,"CREDIT":20000,"TYPE":"INCOME","BANK A/C":"HDFC BANK"},
    {"DATE":"01-05-2025","MONTH":"May","PARTICULARS":"Salary","DEBIT":0,"CREDIT":50000,"TYPE":"INCOME","BANK A/C":"AXIS BANK"},
    {"DATE":"05-05-2025","MONTH":"May","PARTICULARS":"Rent","DEBIT":15000,"CREDIT":0,"TYPE":"EXPENSE","BANK A/C":"AXIS BANK"},
  ];

  // Handle file selection from input
  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      event.target.value = ''; // Reset input
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  // Remove a file from the list
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Load sample data on initial render
  useEffect(() => {
    if (files.length === 0) {
      const loadSampleData = async () => {
        setLoading(true);
        try {
          const normalizedData = normalizeData(sampleData);
          setTransactions(normalizedData);
        } catch (err) {
          console.error('Error loading sample data:', err);
        } finally {
          setLoading(false);
        }
      };
      loadSampleData();
    }
  }, []);

  // Process files when they change
  useEffect(() => {
    const loadData = async () => {
      if (files.length === 0) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const rawData = await processFiles(files);
        const normalizedData = normalizeData(rawData);
        setTransactions(normalizedData);
      } catch (err) {
        console.error('Error processing files:', err);
        setError('Failed to process files. Please check file formats.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [files]);

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    if (transactions.length === 0) return null;
    
    const incomeStatement = generateIncomeStatement(transactions);
    const cashFlow = generateCashFlowStatement(transactions);
    const balanceSheet = generateBalanceSheet(transactions, incomeStatement.netIncome);
    
    return { incomeStatement, cashFlow, balanceSheet };
  }, [transactions]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (transactions.length === 0 || !financialMetrics) return null;
    
    // Group transactions by month
    const byMonth = new Map();
    transactions.forEach(t => {
      const month = t._ym || 'Unknown';
      if (!byMonth.has(month)) byMonth.set(month, []);
      byMonth.get(month).push(t);
    });

    const sortedMonths = Array.from(byMonth.keys())
      .filter(m => m !== 'Unknown')
      .sort()
      .slice(-6);

    const monthlyIncome = sortedMonths.map(month => 
      (byMonth.get(month) || [])
        .filter(t => t.credit > 0 && !t.type.includes('TRANSFER'))
        .reduce((sum, t) => sum + t.credit, 0)
    );

    const monthlyExpense = sortedMonths.map(month => 
      (byMonth.get(month) || [])
        .filter(t => t.debit > 0 && !t.type.includes('TRANSFER'))
        .reduce((sum, t) => sum + t.debit, 0)
    );

    const monthLabels = sortedMonths.map(m => {
      const [y, month] = m.split('-');
      const date = new Date(Number(y), Number(month) - 1, 1);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
    });

    return {
      months: monthLabels,
      monthlyIncome,
      monthlyExpense
    };
  }, [transactions, financialMetrics]);


  // Helper Components with Tailwind
  const KPICard = ({ title, value, icon, isPositive, bgColor = "bg-[#F7F4FB]" }) => (
    <div className={`${bgColor} p-6 rounded-xl shadow-md border border-[#E8E1F2] transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          {icon}
        </div>
        <h4 className="font-medium text-[#694F8E] text-sm uppercase tracking-wider">
          {title}
        </h4>
      </div>
      <div className={`text-2xl font-bold ${typeof isPositive === 'boolean' ? (isPositive ? 'text-green-600' : 'text-red-600') : 'text-gray-800'}`}>
        {toINR(value)}
      </div>
    </div>
  );

  const IncomeStatementTab = ({ statement }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8E1F2]">
      <h2 className="text-xl font-semibold text-[#694F8E] mb-6 flex items-center gap-2">
        <Landmark size={20} />
        Income Statement
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#694F8E] uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-[#694F8E] uppercase tracking-wider">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="bg-gray-50">
              <td className="px-4 py-3 font-semibold text-[#694F8E]">Revenue</td>
              <td className="px-4 py-3 text-right"></td>
            </tr>
            <tr>
              <td className="px-4 py-3 pl-8 text-gray-700">Total Revenue</td>
              <td className="px-4 py-3 text-right font-mono text-green-600">
                {toINR(statement.totalIncome)}
              </td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-4 py-3 font-semibold text-[#694F8E]">Expenses</td>
              <td className="px-4 py-3 text-right"></td>
            </tr>
            <tr>
              <td className="px-4 py-3 pl-8 text-gray-700">Total Expenses</td>
              <td className="px-4 py-3 text-right font-mono text-red-600">
                {toINR(-statement.totalExpenses)}
              </td>
            </tr>
            <tr className="bg-[#F7F4FB] font-bold">
              <td className="px-4 py-3 text-[#694F8E]">Net Income</td>
              <td className={`px-4 py-3 text-right font-mono ${statement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {toINR(statement.netIncome)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const CashFlowTab = ({ cashFlow }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8E1F2]">
      <h2 className="text-xl font-semibold text-[#694F8E] mb-6 flex items-center gap-2">
        <Banknote size={20} />
        Cash Flow Statement
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#694F8E] uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-[#694F8E] uppercase tracking-wider">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            <tr className="bg-[#F7F4FB] font-bold">
              <td className="px-4 py-4 text-[#694F8E]">Net Increase in Cash</td>
              <td className={`px-4 py-4 text-right font-mono ${cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {toINR(cashFlow)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const BalanceSheetTab = ({ balanceSheet }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8E1F2]">
      <h2 className="text-xl font-semibold text-[#694F8E] mb-6 flex items-center gap-2">
        <Wallet size={20} />
        Balance Sheet
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#694F8E] uppercase tracking-wider">
                Description
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-[#694F8E] uppercase tracking-wider">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="bg-gray-50">
              <td className="px-4 py-3 font-semibold text-[#694F8E]">Assets</td>
              <td className="px-4 py-3 text-right"></td>
            </tr>
            <tr>
              <td className="px-4 py-3 pl-8 text-gray-700">Total Assets</td>
              <td className="px-4 py-3 text-right font-mono text-green-600">
                {toINR(balanceSheet.totalAssets)}
              </td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-4 py-3 font-semibold text-[#694F8E]">Liabilities</td>
              <td className="px-4 py-3 text-right"></td>
            </tr>
            <tr>
              <td className="px-4 py-3 pl-8 text-gray-700">Total Liabilities</td>
              <td className="px-4 py-3 text-right font-mono text-red-600">
                {toINR(balanceSheet.totalLiabilities)}
              </td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-4 py-3 font-semibold text-[#694F8E]">Equity</td>
              <td className="px-4 py-3 text-right"></td>
            </tr>
            <tr>
              <td className="px-4 py-3 pl-8 text-gray-700">Total Equity</td>
              <td className={`px-4 py-3 text-right font-mono ${balanceSheet.totalEquity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {toINR(balanceSheet.totalEquity)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const ChartsTab = () => {
    const incomeByCategory = new Map();
    const expenseByCategory = new Map();
    
    transactions.forEach(t => {
      if (t.credit > 0 && !t.type.includes('TRANSFER')) {
        incomeByCategory.set(
          t.category,
          (incomeByCategory.get(t.category) || 0) + t.credit
        );
      }
      if (t.debit > 0 && !t.type.includes('TRANSFER')) {
        expenseByCategory.set(
          t.category,
          (expenseByCategory.get(t.category) || 0) + t.debit
        );
      }
    });

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8E1F2]">
          <h3 className="text-lg font-semibold text-[#694F8E] mb-4">Income by Category</h3>
          {incomeByCategory.size > 0 ? (
            <div className="h-80">
              <Plot
                data={[{
                  labels: Array.from(incomeByCategory.keys()),
                  values: Array.from(incomeByCategory.values()),
                  type: 'pie',
                  hole: 0.4,
                  marker: { 
                    colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'] 
                  }
                }]}
                layout={{
                  margin: { t: 10, l: 20, r: 20, b: 20 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: { family: 'Inter, system-ui, sans-serif', color: '#374151' },
                  showlegend: true,
                  legend: { 
                    orientation: 'h',
                    y: -0.1,
                    x: 0.5,
                    xanchor: 'center'
                  }
                }}
                config={{ 
                  displayModeBar: true, 
                  responsive: true,
                  displaylogo: false 
                }}
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-60">
              <p className="text-gray-500 italic">No income data available</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8E1F2]">
          <h3 className="text-lg font-semibold text-[#694F8E] mb-4">Expenses by Category</h3>
          {expenseByCategory.size > 0 ? (
            <div className="h-80">
              <Plot
                data={[{
                  labels: Array.from(expenseByCategory.keys()),
                  values: Array.from(expenseByCategory.values()),
                  type: 'pie',
                  hole: 0.4,
                  marker: { 
                    colors: ['#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843'] 
                  }
                }]}
                layout={{
                  margin: { t: 10, l: 20, r: 20, b: 20 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: { family: 'Inter, system-ui, sans-serif', color: '#374151' },
                  showlegend: true,
                  legend: { 
                    orientation: 'h',
                    y: -0.1,
                    x: 0.5,
                    xanchor: 'center'
                  }
                }}
                config={{ 
                  displayModeBar: true, 
                  responsive: true,
                  displaylogo: false 
                }}
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-60">
              <p className="text-gray-500 italic">No expense data available</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Action buttons handler
  const downloadDataJSON = () => {
    if (transactions.length === 0) {
      alert('No data available to download');
      return;
    }
    
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'financial-data.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
         
          
          <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="animate-spin text-[#694F8E] mb-4" size={48} />
            <p className="text-gray-600">Processing financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
         
          
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg text-gray-700 mb-6">{error}</p>
            <button 
              className="px-6 py-3 bg-[#694F8E] text-white rounded-lg shadow-md hover:bg-[#563C70] transition-colors"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-[#694F8E] to-[#8B5CF6] rounded-lg">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Financial Statement Generator</h2>
              <p className="text-sm text-gray-600">Upload statements to generate reports.</p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${isDragging ? 'border-[#694F8E] bg-purple-50' : 'border-gray-300 bg-white hover:border-[#694F8E] hover:bg-purple-50'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={56} className={`mx-auto mb-4 ${isDragging ? 'text-[#694F8E]' : 'text-gray-400'}`} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Financial Documents</h3>
            <p className="text-gray-600 mb-3">Drag & drop or click to upload bank statements, credit card statements, or other financial documents</p>
            <p className="text-sm text-gray-500 mb-4">Supported formats: JSON, CSV, XLSX, XLS</p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,.xlsx,.xls"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button className="px-6 py-2 bg-[#694F8E] text-white rounded-lg hover:bg-[#563C70] transition-colors">
              Select Files
            </button>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-[#E8E1F2]">
              <h4 className="font-semibold text-[#694F8E] mb-4">Uploaded Files ({files.length})</h4>
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-[#694F8E]" />
                      <div>
                        <span className="font-medium text-gray-800">{file.name}</span>
                        <span className="text-sm text-gray-500 ml-3">
                          ({Math.round(file.size / 1024)} KB)
                        </span>
                      </div>
                    </div>
                    <button 
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {/* Privacy Notice */}
          <div className="mt-4 flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <Shield size={20} className="text-blue-500" />
            <span className="text-sm text-blue-700">
              Your data never leaves your browser. All processing happens locally.
            </span>
           
          </div>
           <div>
              <Ads />
            </div>
        </div>

        {/* Main Dashboard Content */}
        {transactions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-[#E8E1F2]">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Financial Data</h3>
            <p className="text-gray-600">Upload financial statements to see your dashboard</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard 
                title="Total Income"
                value={financialMetrics?.incomeStatement.totalIncome || 0}
                icon={<DollarSign size={20} className="text-green-600" />}
                isPositive={true}
              />
              
              <KPICard 
                title="Total Expenses"
                value={financialMetrics?.incomeStatement.totalExpenses || 0}
                icon={<TrendingDown size={20} className="text-red-600" />}
                bgColor="bg-red-50"
              />
              
              <KPICard 
                title="Net Cash Flow"
                value={financialMetrics?.incomeStatement.netIncome || 0}
                icon={<TrendingUp size={20} className={financialMetrics?.incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'} />}
                isPositive={financialMetrics?.incomeStatement.netIncome >= 0}
                bgColor={financialMetrics?.incomeStatement.netIncome >= 0 ? "bg-green-50" : "bg-red-50"}
              />
              
              <KPICard 
                title="Current Assets"
                value={financialMetrics?.balanceSheet.totalAssets || 0}
                icon={<PieChart size={20} className="text-blue-600" />}
                bgColor="bg-blue-50"
              />
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-sm p-2 border border-[#E8E1F2]">
              <div className="flex flex-wrap gap-2">
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-[#694F8E] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <BarChart3 size={16} />
                  Overview
                </button>
                <button 
                  className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'income' ? 'bg-[#694F8E] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('income')}
                >
                  Income Statement
                </button>
                <button 
                  className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'cashflow' ? 'bg-[#694F8E] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('cashflow')}
                >
                  Cash Flow
                </button>
                <button 
                  className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'balance' ? 'bg-[#694F8E] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('balance')}
                >
                  Balance Sheet
                </button>
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'charts' ? 'bg-[#694F8E] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('charts')}
                >
                  <PieChart size={16} />
                  Charts
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="transition-all duration-300">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Cash Flow Chart */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8E1F2]">
                    <h3 className="text-lg font-semibold text-[#694F8E] mb-4 flex items-center gap-2">
                      <Calendar size={18} />
                      Monthly Cash Flow
                    </h3>
                    {chartData && chartData.months.length > 0 ? (
                      <div className="h-80">
                        <Plot
                          data={[
                            {
                              x: chartData.months,
                              y: chartData.monthlyIncome,
                              type: 'bar',
                              name: 'Income',
                              marker: { color: '#10B981' }
                            },
                            {
                              x: chartData.months,
                              y: chartData.monthlyExpense,
                              type: 'bar',
                              name: 'Expense',
                              marker: { color: '#EF4444' }
                            }
                          ]}
                          layout={{
                            barmode: 'group',
                            margin: { t: 30, l: 50, r: 30, b: 50 },
                            paper_bgcolor: 'transparent',
                            plot_bgcolor: 'transparent',
                            font: { family: 'Inter, system-ui, sans-serif', color: '#374151' },
                            showlegend: true,
                            legend: { x: 0, y: 1.2 }
                          }}
                          config={{ 
                            displayModeBar: true, 
                            responsive: true,
                            displaylogo: false 
                          }}
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-60">
                        <p className="text-gray-500 italic">No chart data available</p>
                      </div>
                    )}
                  </div>

                  {/* Recent Transactions */}
                  <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8E1F2]">
                    <h3 className="text-lg font-semibold text-[#694F8E] mb-4">Recent Transactions</h3>
                    <div className="space-y-3">
                      {transactions.slice(-5).reverse().map((t, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div>
                            <div className="text-sm text-gray-500">
                              {t._dt ? t._dt.toLocaleDateString() : t.date}
                            </div>
                            <div className="font-medium text-gray-800 truncate max-w-xs">
                              {t.particulars}
                            </div>
                          </div>
                          <div className={`font-mono font-semibold ${t.credit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {toINR(t.credit > 0 ? t.credit : -t.debit)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'income' && financialMetrics && (
                <IncomeStatementTab statement={financialMetrics.incomeStatement} />
              )}
              
              {activeTab === 'cashflow' && financialMetrics && (
                <CashFlowTab cashFlow={financialMetrics.cashFlow} />
              )}
              
              {activeTab === 'balance' && financialMetrics && (
                <BalanceSheetTab balanceSheet={financialMetrics.balanceSheet} />
              )}
              
              {activeTab === 'charts' && chartData && (
                <ChartsTab />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center pt-6 border-t border-gray-200">
              <button 
                className="flex items-center gap-2 px-6 py-3 bg-white text-[#694F8E] rounded-lg shadow-sm border border-[#694F8E] hover:bg-gray-50 transition-colors"
                onClick={downloadDataJSON}
              >
                <Download size={18} />
                Export Data
              </button>
              <button 
                className="flex items-center gap-2 px-6 py-3 bg-[#694F8E] text-white rounded-lg shadow-md hover:bg-[#563C70] transition-colors"
                onClick={() => alert('Report download feature coming soon!')}
              >
                <Download size={18} />
                Download Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FinancialDashboard;