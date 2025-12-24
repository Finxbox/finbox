import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import { 
  Upload, FileText, TrendingUp, Shield, ArrowLeft,
  DollarSign, TrendingDown, PieChart, BarChart3,
  Download, Loader2, Calendar, Banknote, Landmark, Wallet,
  CheckCircle, AlertCircle, FileSpreadsheet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  parseAmount, 
  toINR, 
  normalizeData, 
  generateIncomeStatement,
  generateCashFlowStatement,
  generateBalanceSheet,
  detectBankFromData
} from '../components/utility/financialUtils.jsx';
import { processFiles } from '../components/utility/fileProcessor';
import DematCTA from "../components/utility/DematCTA.jsx";


function FinancialDashboard() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectedBank, setDetectedBank] = useState('Unknown');
  const [processingStats, setProcessingStats] = useState(null);
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

  // Check if file is PDF
  const isPDF = (file) => {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  };

  // Load sample data on initial render
  useEffect(() => {
    if (files.length === 0) {
      const loadSampleData = async () => {
        setLoading(true);
        try {
          const normalizedData = normalizeData(sampleData);
          setTransactions(normalizedData);
          setDetectedBank('AXIS BANK');
          setProcessingStats({
            totalRows: normalizedData.length,
            successfulRows: normalizedData.length,
            failedRows: 0,
            bankDetected: 'AXIS BANK (Sample Data)'
          });
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
      setProcessingStats(null);
      
      try {
        // Process all files
        const rawData = await processFiles(files);
        
        // Detect bank
        const bank = detectBankFromData(rawData);
        setDetectedBank(bank);
        
        // Normalize data
        const normalizedData = normalizeData(rawData);
        
        // Calculate processing stats
        const stats = {
          totalRows: rawData.length,
          successfulRows: normalizedData.length,
          failedRows: rawData.length - normalizedData.length,
          bankDetected: bank,
          fileCount: files.length,
          hasPDF: files.some(isPDF)
        };
        
        setProcessingStats(stats);
        setTransactions(normalizedData);
        
        console.log('Processing complete:', stats);
        
      } catch (err) {
        console.error('Error processing files:', err);
        setError(err.message || 'Failed to process files. Please check file formats.');
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
        .filter(t => t.credit > 0 && !t.type.includes('TRANSFER') && !t.category.includes('Transfer'))
        .reduce((sum, t) => sum + t.credit, 0)
    );

    const monthlyExpense = sortedMonths.map(month => 
      (byMonth.get(month) || [])
        .filter(t => t.debit > 0 && !t.type.includes('TRANSFER') && !t.category.includes('Transfer'))
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

    // Category data for pie charts
    const incomeByCategory = new Map();
    const expenseByCategory = new Map();
    
    transactions.forEach(t => {
      if (t.credit > 0 && !t.type.includes('TRANSFER') && !t.category.includes('Transfer')) {
        incomeByCategory.set(
          t.category,
          (incomeByCategory.get(t.category) || 0) + t.credit
        );
      }
      if (t.debit > 0 && !t.type.includes('TRANSFER') && !t.category.includes('Transfer')) {
        expenseByCategory.set(
          t.category,
          (expenseByCategory.get(t.category) || 0) + t.debit
        );
      }
    });

    return {
      months: monthLabels,
      monthlyIncome,
      monthlyExpense,
      incomeByCategory,
      expenseByCategory
    };
  }, [transactions, financialMetrics]);

  // Helper Components with Tailwind
  const KPICard = ({ title, value, icon, isPositive, bgColor = "bg-[#F7F4FB]", subtitle }) => (
    <div className={`${bgColor} p-6 rounded-xl shadow-md border border-[#E8E1F2] transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-white rounded-lg shadow-sm">
          {icon}
        </div>
        <div>
          <h4 className="font-medium text-[#694F8E] text-sm uppercase tracking-wider">
            {title}
          </h4>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      <div className={`text-2xl font-bold ${typeof isPositive === 'boolean' ? (isPositive ? 'text-green-600' : 'text-red-600') : 'text-gray-800'}`}>
        {toINR(value)}
      </div>
    </div>
  );

  const ProcessingStatsCard = ({ stats }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#E8E1F2] mb-6">
      <h3 className="text-lg font-semibold text-[#694F8E] mb-4 flex items-center gap-2">
        <FileSpreadsheet size={20} />
        Processing Summary
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.totalRows}</div>
          <div className="text-sm text-gray-600">Total Rows</div>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.successfulRows}</div>
          <div className="text-sm text-gray-600">Processed</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.failedRows}</div>
          <div className="text-sm text-gray-600">Skipped</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-sm font-bold text-purple-600 truncate">{stats.bankDetected}</div>
          <div className="text-xs text-gray-600">Bank Detected</div>
        </div>
      </div>
      {stats.hasPDF && (
        <div className="mt-4 flex items-center gap-2 text-sm text-amber-600">
          <AlertCircle size={16} />
          <span>PDF processing may have limited accuracy</span>
        </div>
      )}
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
      {statement.incomeCount > 0 && (
        <div className="mt-6 text-sm text-gray-600">
          <p>Based on {statement.incomeCount} income transactions and {statement.expenseCount} expense transactions</p>
        </div>
      )}
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
                Category
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-[#694F8E] uppercase tracking-wider">
                Amount (₹)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-4 py-3 text-gray-700">Operating Cash Flow</td>
              <td className={`px-4 py-3 text-right font-mono ${cashFlow.operatingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {toINR(cashFlow.operatingCashFlow)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-700">Investing Cash Flow</td>
              <td className={`px-4 py-3 text-right font-mono ${cashFlow.investingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {toINR(cashFlow.investingCashFlow)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-700">Financing Cash Flow</td>
              <td className={`px-4 py-3 text-right font-mono ${cashFlow.financingCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {toINR(cashFlow.financingCashFlow)}
              </td>
            </tr>
            <tr className="bg-[#F7F4FB] font-bold">
              <td className="px-4 py-3 text-[#694F8E]">Net Cash Flow</td>
              <td className={`px-4 py-3 text-right font-mono ${cashFlow.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {toINR(cashFlow.netCashFlow)}
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
              <td className="px-4 py-3 pl-8 text-gray-700">Cash Balance</td>
              <td className="px-4 py-3 text-right font-mono text-green-600">
                {toINR(balanceSheet.cashBalance)}
              </td>
            </tr>
            <tr>
              <td className="px-4 py-3 pl-8 text-gray-700">Investments</td>
              <td className="px-4 py-3 text-right font-mono text-green-600">
                {toINR(balanceSheet.investments)}
              </td>
            </tr>
            <tr className="bg-gray-50 font-bold">
              <td className="px-4 py-3 text-[#694F8E]">Total Assets</td>
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
            
            <tr className="bg-[#F7F4FB] font-bold">
              <td className="px-4 py-3 text-[#694F8E]">Assets = Liabilities + Equity</td>
              <td className="px-4 py-3 text-right font-mono">
                {toINR(balanceSheet.totalAssets)} = {toINR(balanceSheet.totalLiabilities)} + {toINR(balanceSheet.totalEquity)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const ChartsTab = () => {
    if (!chartData) return null;
    
    const { incomeByCategory, expenseByCategory } = chartData;

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
                    colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95', '#3730A3', '#312E81', '#1E1B4B'] 
                  },
                  textinfo: 'label+percent',
                  textposition: 'outside'
                }]}
                layout={{
                  margin: { t: 30, l: 20, r: 20, b: 40 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: { family: 'Inter, system-ui, sans-serif', color: '#374151' },
                  showlegend: true,
                  legend: { 
                    orientation: 'h',
                    y: -0.1,
                    x: 0.5,
                    xanchor: 'center'
                  },
                  height: 320
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
                    colors: ['#EC4899', '#DB2777', '#BE185D', '#9D174D', '#831843', '#6B21A8', '#5B21B6', '#4C1D95'] 
                  },
                  textinfo: 'label+percent',
                  textposition: 'outside'
                }]}
                layout={{
                  margin: { t: 30, l: 20, r: 20, b: 40 },
                  paper_bgcolor: 'transparent',
                  plot_bgcolor: 'transparent',
                  font: { family: 'Inter, system-ui, sans-serif', color: '#374151' },
                  showlegend: true,
                  legend: { 
                    orientation: 'h',
                    y: -0.1,
                    x: 0.5,
                    xanchor: 'center'
                  },
                  height: 320
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
    a.download = `financial-data-${detectedBank.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  // Download data as CSV
  const downloadDataCSV = () => {
    if (transactions.length === 0) {
      alert('No data available to download');
      return;
    }
    
    const headers = ['Date', 'Month', 'Particulars', 'Debit', 'Credit', 'Type', 'Category', 'Bank', 'ProcessedDate'];
    const csvRows = [
      headers.join(','),
      ...transactions.map(t => [
        t.date,
        t.month,
        `"${t.particulars.replace(/"/g, '""')}"`,
        t.debit,
        t.credit,
        t.type,
        t.category,
        t.bank,
        new Date().toISOString().split('T')[0]
      ].join(','))
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-data-${detectedBank.toLowerCase().replace(/\s+/g, '-')}.csv`;
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
            <p className="text-sm text-gray-500 mt-2">
              Analyzing {files.length} file(s)...
            </p>
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
              <AlertCircle size={64} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Processing Error</h3>
            <p className="text-lg text-gray-700 mb-6">{error}</p>
            <div className="mb-6 p-4 bg-gray-50 rounded-lg text-left">
              <p className="font-medium mb-2">Common solutions:</p>
              <ul className="text-sm text-gray-600 list-disc list-inside">
                <li>Ensure the file is a valid bank statement (CSV, Excel, JSON)</li>
                <li>Check if the file contains transaction data</li>
                <li>Try removing special characters from file names</li>
                <li>For PDFs: Ensure they are text-based (not scanned)</li>
              </ul>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <button 
                className="px-6 py-3 bg-[#694F8E] text-white rounded-lg shadow-md hover:bg-[#563C70] transition-colors"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
              <button 
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setFiles([]);
                  setError(null);
                }}
              >
                Try Different Files
              </button>
            </div>
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
              <h2 className="text-lg font-semibold text-gray-800">Universal Financial Statement Generator</h2>
              <p className="text-sm text-gray-600">Works with ALL bank statements - HDFC, ICICI, SBI, Axis, and more</p>
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
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload ANY Bank Statement</h3>
            <p className="text-gray-600 mb-3">Drag & drop or click to upload statements from any Indian bank</p>
            <p className="text-sm text-gray-500 mb-4">Supported: CSV, Excel, JSON (HDFC, ICICI, SBI, Axis, Kotak, etc.)</p>
            
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">✓ HDFC</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">✓ ICICI</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">✓ SBI</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">✓ Axis</span>
              <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs">✓ Kotak</span>
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">✓ All Formats</span>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,.xlsx,.xls,.pdf"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button className="px-6 py-2 bg-[#694F8E] text-white rounded-lg hover:bg-[#563C70] transition-colors flex items-center gap-2 mx-auto">
              <Upload size={18} />
              Select Files
            </button>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-[#E8E1F2]">
              <h4 className="font-semibold text-[#694F8E] mb-4">Uploaded Files ({files.length})</h4>
              <div className="space-y-3">
                {files.map((file, index) => {
                  const isPdfFile = isPDF(file);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {isPdfFile ? (
                          <FileText size={18} className="text-red-500" />
                        ) : (
                          <FileText size={18} className="text-[#694F8E]" />
                        )}
                        <div>
                          <span className="font-medium text-gray-800">{file.name}</span>
                          <span className="text-sm text-gray-500 ml-3">
                            ({Math.round(file.size / 1024)} KB)
                          </span>
                          {isPdfFile && (
                            <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                              PDF
                            </span>
                          )}
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
                  );
                })}
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
          
          
        </div>

        {/* Main Dashboard Content */}
        {transactions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-[#E8E1F2]">
            <FileText size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Financial Data</h3>
            <p className="text-gray-600 mb-6">Upload bank statements to generate financial reports</p>
            <div className="max-w-2xl mx-auto text-left">
              <h4 className="font-medium text-gray-700 mb-2">Supported Bank Formats:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>HDFC Bank</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>ICICI Bank</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>State Bank of India</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Axis Bank</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Kotak Mahindra</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span>Yes Bank</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Processing Stats */}
            {processingStats && (
              <ProcessingStatsCard stats={processingStats} />
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard 
                title="Total Income"
                value={financialMetrics?.incomeStatement.totalIncome || 0}
                icon={<DollarSign size={20} className="text-green-600" />}
                isPositive={true}
                subtitle={`${financialMetrics?.incomeStatement.incomeCount || 0} transactions`}
              />
              
              <KPICard 
                title="Total Expenses"
                value={financialMetrics?.incomeStatement.totalExpenses || 0}
                icon={<TrendingDown size={20} className="text-red-600" />}
                bgColor="bg-red-50"
                subtitle={`${financialMetrics?.incomeStatement.expenseCount || 0} transactions`}
              />
              
              <KPICard 
                title="Net Cash Flow"
                value={financialMetrics?.incomeStatement.netIncome || 0}
                icon={<TrendingUp size={20} className={financialMetrics?.incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'} />}
                isPositive={financialMetrics?.incomeStatement.netIncome >= 0}
                bgColor={financialMetrics?.incomeStatement.netIncome >= 0 ? "bg-green-50" : "bg-red-50"}
                subtitle="Profit/Loss"
              />
              
              <KPICard 
                title="Current Assets"
                value={financialMetrics?.balanceSheet.totalAssets || 0}
                icon={<PieChart size={20} className="text-blue-600" />}
                bgColor="bg-blue-50"
                subtitle="Total worth"
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
                      Monthly Cash Flow (Last 6 Months)
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
                            legend: { x: 0, y: 1.2 },
                            xaxis: { title: 'Month' },
                            yaxis: { title: 'Amount (₹)' }
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
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-500">
                              {t._dt ? t._dt.toLocaleDateString() : t.date}
                            </div>
                            <div className="font-medium text-gray-800 truncate">
                              {t.particulars}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-gray-100 rounded">{t.category}</span>
                              <span>•</span>
                              <span>{t.bank}</span>
                            </div>
                          </div>
                          <div className={`font-mono font-semibold whitespace-nowrap ml-4 ${t.credit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {toINR(t.credit > 0 ? t.credit : -t.debit)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <Link 
                        to="#" 
                        className="text-sm text-[#694F8E] hover:underline"
                        onClick={() => alert('Full transaction list coming soon!')}
                      >
                        View all {transactions.length} transactions →
                      </Link>
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
                Export as JSON
              </button>
              <button 
                className="flex items-center gap-2 px-6 py-3 bg-white text-[#694F8E] rounded-lg shadow-sm border border-[#694F8E] hover:bg-gray-50 transition-colors"
                onClick={downloadDataCSV}
              >
                <Download size={18} />
                Export as CSV
              </button>
              <button 
                className="flex items-center gap-2 px-6 py-3 bg-[#694F8E] text-white rounded-lg shadow-md hover:bg-[#563C70] transition-colors"
                onClick={() => alert('PDF report download feature coming soon!')}
              >
                <Download size={18} />
                Download PDF Report
              </button>
              <button 
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
                onClick={() => {
                  setFiles([]);
                  setTransactions([]);
                  setProcessingStats(null);
                }}
              >
                <Upload size={18} />
                Analyze New File
              </button>
            </div>
            <DematCTA />
          </div>
        )}
      </div>
    </div>
  );
}

export default FinancialDashboard;