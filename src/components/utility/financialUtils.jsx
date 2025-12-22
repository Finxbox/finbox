// components/utility/financialUtils.jsx
// Enhanced with Column Mapping, Pre-processing, and Smart Parsing

// Configuration: Column aliases for different banks
const COLUMN_MAPPINGS = {
  date: [
    'DATE', 'Date', 'date', 
    'VALUE DATE', 'Value Date', 'ValueDate',
    'TXN DATE', 'Txn Date', 'TxnDate',
    'TRANSACTION DATE', 'Transaction Date',
    'POSTING DATE', 'Posting Date',
    'BOOKING DATE', 'Booking Date',
    'TRANS DATE', 'Trans Date'
  ],
  
  particulars: [
    'PARTICULARS', 'Particulars', 'particulars',
    'NARRATION', 'Narration', 'narration',
    'DESCRIPTION', 'Description', 'description',
    'TRANSACTION REMARKS', 'Transaction Remarks',
    'REMARKS', 'Remarks', 'remarks',
    'DETAILS', 'Details', 'details',
    'TRANSACTION DETAILS', 'Transaction Details',
    'NOTE', 'Note', 'note'
  ],
  
  debit: [
    'DEBIT', 'Debit', 'debit',
    'DR', 'Dr', 'dr',
    'WITHDRAWAL', 'Withdrawal', 'withdrawal',
    'WITHDRAWAL AMT', 'Withdrawal Amt',
    'PAYMENT', 'Payment', 'payment',
    'EXPENSE', 'Expense', 'expense',
    'OUTFLOW', 'Outflow', 'outflow',
    'AMOUNT (DR)', 'Amount (Dr)',
    'DEBIT AMOUNT', 'Debit Amount'
  ],
  
  credit: [
    'CREDIT', 'Credit', 'credit',
    'CR', 'Cr', 'cr',
    'DEPOSIT', 'Deposit', 'deposit',
    'DEPOSIT AMT', 'Deposit Amt',
    'RECEIPT', 'Receipt', 'receipt',
    'INCOME', 'Income', 'income',
    'INFLOW', 'Inflow', 'inflow',
    'AMOUNT (CR)', 'Amount (Cr)',
    'CREDIT AMOUNT', 'Credit Amount'
  ],
  
  balance: [
    'BALANCE', 'Balance', 'balance',
    'CLOSING BALANCE', 'Closing Balance',
    'BALANCE AMT', 'Balance Amt',
    'RUNNING BALANCE', 'Running Balance'
  ],
  
  type: [
    'TYPE', 'Type', 'type',
    'TRANSACTION TYPE', 'Transaction Type',
    'CATEGORY', 'Category', 'category',
    'TRANSACTION CATEGORY', 'Transaction Category'
  ],
  
  month: [
    'MONTH', 'Month', 'month',
    'MONTH YEAR', 'Month Year',
    'PERIOD', 'Period', 'period',
    'MONTH-YEAR', 'Month-Year'
  ],
  
  bank: [
    'BANK A/C', 'Bank A/C', 'Bank Account',
    'BANK', 'Bank', 'bank',
    'ACCOUNT', 'Account', 'account',
    'BANK NAME', 'Bank Name',
    'ACCOUNT NUMBER', 'Account Number'
  ]
};

// Configuration: Transaction categorization keywords
const CATEGORY_KEYWORDS = {
  'Salary': ['salary', 'payroll', 'wages', 'income', 'stipend'],
  'Interest Income': ['interest', 'dividend', 'bank interest'],
  'Business Income': ['client', 'freelance', 'consulting', 'business', 'contract'],
  'Refunds': ['refund', 'reversal', 'chargeback'],
  
  'Food & Groceries': ['grocery', 'supermarket', 'food', 'vegetable', 'kirana', 'dmart', 'bigbasket'],
  'Dining Out': ['restaurant', 'cafe', 'dining', 'zomato', 'swiggy', 'eatsure', 'foodpanda'],
  'Housing': ['rent', 'housing', 'maintenance', 'society', 'house'],
  'Utilities': ['electricity', 'water', 'utility', 'bill', 'gas', 'cylinder', 'telephone', 'mobile'],
  'Transportation': ['fuel', 'petrol', 'diesel', 'transport', 'uber', 'ola', 'rapido', 'metro', 'train'],
  'Healthcare': ['medical', 'hospital', 'pharmacy', 'doctor', 'medicine', 'apollo', 'fortis'],
  'Entertainment': ['movie', 'entertainment', 'netflix', 'spotify', 'hotstar', 'prime', 'youtube'],
  'Shopping': ['shopping', 'mall', 'amazon', 'flipkart', 'myntra', 'nykaa', 'ajio'],
  'Loan Repayment': ['loan', 'emi', 'repayment', 'home loan', 'car loan'],
  'Insurance': ['insurance', 'premium', 'lic', 'policy'],
  'Investments': ['investment', 'mutual', 'stock', 'share', 'sip', 'nps', 'ppf'],
  'Transfers': ['transfer', 'neft', 'rtgs', 'imps', 'upi', 'to ', 'from '],
  'Taxes': ['tax', 'gst', 'tds', 'income tax'],
  'Education': ['school', 'college', 'tuition', 'course', 'education'],
  'Travel': ['flight', 'hotel', 'travel', 'trip', 'vacation'],
  'Personal Care': ['salon', 'spa', 'beauty', 'gym', 'fitness']
};

export function parseAmount(v) {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === 'number') return v;
  
  // Remove currency symbols, commas, spaces, and parentheses
  const cleaned = String(v)
    .replace(/[₹$€£,()\s]/g, '')
    .replace(/[a-zA-Z]/g, '') // Remove any text
    .trim();
  
  const n = Number(cleaned);
  return isNaN(n) ? 0 : Math.abs(n); // Always return positive amount
}

export function toINR(n) {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(n);
  } catch (e) {
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }
}

export function safeStr(v) {
  return (v ?? '').toString().trim();
}

export function parseDateFlexible(s) {
  if (!s) return null;
  const raw = s.toString().trim();
  
  // Multiple date format patterns
  const patterns = [
    // DD-MM-YYYY or DD/MM/YYYY
    { pattern: /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/, handler: (match) => {
      const [_, d, m, y] = match;
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    }},
    
    // DD-MM-YY or DD/MM/YY
    { pattern: /^(\d{1,2})[-/](\d{1,2})[-/](\d{2})$/, handler: (match) => {
      const [_, d, m, y] = match;
      const year = parseInt(y) < 30 ? 2000 + parseInt(y) : 1900 + parseInt(y);
      return new Date(year, parseInt(m) - 1, parseInt(d));
    }},
    
    // YYYY-MM-DD
    { pattern: /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/, handler: (match) => {
      const [_, y, m, d] = match;
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    }},
    
    // DD Month YYYY (01 April 2025)
    { pattern: /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})$/i, handler: (match) => {
      const [_, d, monthName, y] = match;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames.findIndex(m => m.toLowerCase() === monthName.toLowerCase().substring(0, 3));
      return new Date(parseInt(y), month, parseInt(d));
    }},
    
    // Month DD, YYYY (April 01, 2025)
    { pattern: /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})$/i, handler: (match) => {
      const [_, monthName, d, y] = match;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames.findIndex(m => m.toLowerCase() === monthName.toLowerCase().substring(0, 3));
      return new Date(parseInt(y), month, parseInt(d));
    }},
    
    // DD-Mon-YY (01-Apr-25)
    { pattern: /^(\d{1,2})[-/](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[-/](\d{2})$/i, handler: (match) => {
      const [_, d, monthName, y] = match;
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames.findIndex(m => m.toLowerCase() === monthName.toLowerCase().substring(0, 3));
      const year = parseInt(y) < 30 ? 2000 + parseInt(y) : 1900 + parseInt(y);
      return new Date(year, month, parseInt(d));
    }}
  ];
  
  for (const { pattern, handler } of patterns) {
    const match = raw.match(pattern);
    if (match) {
      try {
        const dt = handler(match);
        if (!isNaN(dt.getTime())) {
          return dt;
        }
      } catch (e) {
        // Continue to next pattern
      }
    }
  }
  
  // Try native date parsing as last resort
  try {
    const dt = new Date(raw);
    if (!isNaN(dt.getTime())) {
      return dt;
    }
  } catch (e) {
    // Ignore error
  }
  
  return null;
}

export function monthKey(dt) {
  return dt ? `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}` : 'Unknown';
}

// Smart column mapping function
export function mapColumn(row, columnType) {
  const aliases = COLUMN_MAPPINGS[columnType] || [];
  
  for (const alias of aliases) {
    // Direct match
    if (row.hasOwnProperty(alias)) {
      return row[alias];
    }
    
    // Case-insensitive match
    const lowerAlias = alias.toLowerCase();
    for (const key in row) {
      if (key.toLowerCase() === lowerAlias) {
        return row[key];
      }
    }
  }
  
  return null;
}

// Enhanced categorization with keyword matching
export function categorizeTransaction(particulars, type, credit, debit) {
  const particularsLower = particulars.toLowerCase();
  
  // Check each category
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (particularsLower.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  // Fallback based on type and amount
  if (type === 'INCOME' || credit > 0) {
    return 'Other Income';
  } else if (type === 'EXPENSE' || debit > 0) {
    return 'Other Expenses';
  }
  
  return 'Uncategorized';
}

// Data pre-processing: Clean headers and find data start row
export function preProcessData(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return rows;
  }
  
  // Find the header row (contains date and amount keywords)
  let headerRowIndex = -1;
  const headerKeywords = ['date', 'amount', 'debit', 'credit', 'balance', 'particulars'];
  
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const row = rows[i];
    if (typeof row === 'object') {
      const keys = Object.keys(row);
      const keyString = keys.join(' ').toLowerCase();
      
      // Check if this row contains header keywords
      const hasHeaderKeywords = headerKeywords.some(keyword => 
        keyString.includes(keyword)
      );
      
      if (hasHeaderKeywords && keys.length >= 3) {
        headerRowIndex = i;
        break;
      }
    }
  }
  
  if (headerRowIndex > 0) {
    // Remove everything before the header row
    return rows.slice(headerRowIndex);
  }
  
  return rows;
}

// Main normalization function with all enhancements
export function normalizeData(rawRows) {
  // Pre-process: Clean up the data
  const rows = preProcessData(rawRows);
  const out = [];
  
  for (const r of rows) {
    if (!r || typeof r !== 'object') {
      continue;
    }
    
    // Extract data using column mapping
    const dateValue = mapColumn(r, 'date');
    const particularsValue = mapColumn(r, 'particulars');
    const debitValue = mapColumn(r, 'debit');
    const creditValue = mapColumn(r, 'credit');
    const typeValue = mapColumn(r, 'type');
    const monthValue = mapColumn(r, 'month');
    const bankValue = mapColumn(r, 'bank');
    
    // Create standardized row
    const row = {
      date: safeStr(dateValue),
      month: safeStr(monthValue),
      particulars: safeStr(particularsValue),
      debit: parseAmount(debitValue),
      credit: parseAmount(creditValue),
      type: safeStr(typeValue),
      category: '',
      bank: safeStr(bankValue || 'Unknown')
    };
    
    // Auto-detect type if not provided
    if (!row.type || row.type.toUpperCase() === 'UNKNOWN') {
      if (row.credit > 0 && row.debit === 0) {
        row.type = 'INCOME';
      } else if (row.debit > 0 && row.credit === 0) {
        row.type = 'EXPENSE';
      } else if (row.credit > 0 && row.debit > 0) {
        row.type = 'TRANSFER';
      } else {
        // Try to infer from particulars
        const particularsLower = row.particulars.toLowerCase();
        if (particularsLower.includes('cr') || particularsLower.includes('credit')) {
          row.type = 'INCOME';
        } else if (particularsLower.includes('dr') || particularsLower.includes('debit')) {
          row.type = 'EXPENSE';
        } else {
          row.type = 'UNKNOWN';
        }
      }
    }
    
    // Auto-categorize
    row.category = categorizeTransaction(row.particulars, row.type, row.credit, row.debit);
    
    // Parse date and create month key
    row._dt = parseDateFlexible(row.date);
    row._ym = monthKey(row._dt);
    
    // If month is empty but we have date, extract month from date
    if (!row.month && row._dt) {
      row.month = row._dt.toLocaleString('default', { month: 'long' });
    }
    
    // Only add valid rows (must have date and amount)
    if (row._dt && (row.debit > 0 || row.credit > 0)) {
      out.push(row);
    }
  }
  
  // Sort by date (earliest first)
  out.sort((a, b) => {
    const aTime = a._dt?.getTime() || 0;
    const bTime = b._dt?.getTime() || 0;
    return aTime - bTime;
  });
  
  return out;
}

export function generateIncomeStatement(data) {
  // Filter out transfers and uncategorized
  const incomeRows = data.filter(r => 
    r.credit > 0 && 
    !r.type.includes('TRANSFER') && 
    !r.category.includes('Transfer')
  );
  
  const expenseRows = data.filter(r => 
    r.debit > 0 && 
    !r.type.includes('TRANSFER') && 
    !r.category.includes('Transfer')
  );
  
  const totalIncome = incomeRows.reduce((sum, r) => sum + r.credit, 0);
  const totalExpenses = expenseRows.reduce((sum, r) => sum + r.debit, 0);
  const netIncome = totalIncome - totalExpenses;
  
  return { 
    totalIncome, 
    totalExpenses, 
    netIncome,
    incomeCount: incomeRows.length,
    expenseCount: expenseRows.length
  };
}

export function generateCashFlowStatement(data) {
  // Simplified: Operating cash flow only
  const operatingIncome = data
    .filter(r => r.credit > 0 && 
               !r.category.includes('Investment') && 
               !r.category.includes('Loan') &&
               !r.category.includes('Transfer') &&
               !r.type.includes('TRANSFER'))
    .reduce((sum, r) => sum + r.credit, 0);
  
  const operatingExpenses = data
    .filter(r => r.debit > 0 && 
               !r.category.includes('Investment') && 
               !r.category.includes('Loan') &&
               !r.category.includes('Transfer') &&
               !r.type.includes('TRANSFER'))
    .reduce((sum, r) => sum + r.debit, 0);
  
  const investingCashFlow = data
    .filter(r => r.category.includes('Investment'))
    .reduce((sum, r) => sum + (r.credit - r.debit), 0);
  
  const financingCashFlow = data
    .filter(r => r.category.includes('Loan'))
    .reduce((sum, r) => sum + (r.credit - r.debit), 0);
  
  const netCashFlow = operatingIncome - operatingExpenses + investingCashFlow + financingCashFlow;
  
  return {
    operatingCashFlow: operatingIncome - operatingExpenses,
    investingCashFlow,
    financingCashFlow,
    netCashFlow
  };
}

export function generateBalanceSheet(data, netIncome) {
  // Calculate assets
  const cashBalance = data.reduce((sum, r) => sum + r.credit - r.debit, 0);
  
  const investments = data
    .filter(r => r.category.includes('Investment') && r.debit > 0)
    .reduce((sum, r) => sum + r.debit, 0);
  
  const totalAssets = Math.max(0, cashBalance) + investments;
  
  // Calculate liabilities
  const loans = data
    .filter(r => r.category.includes('Loan') && r.credit > 0)
    .reduce((sum, r) => sum + r.credit, 0);
  
  const totalLiabilities = loans;
  const totalEquity = netIncome;
  
  return { 
    totalAssets, 
    totalLiabilities, 
    totalEquity,
    cashBalance: Math.max(0, cashBalance),
    investments
  };
}

// Helper function to detect bank from data
export function detectBankFromData(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return 'Unknown';
  }
  
  // Check first few rows for bank keywords
  const sample = JSON.stringify(rows.slice(0, 3)).toLowerCase();
  
  const bankPatterns = [
    { name: 'HDFC BANK', keywords: ['hdfc', 'hdfc bank'] },
    { name: 'ICICI BANK', keywords: ['icici', 'icici bank'] },
    { name: 'SBI', keywords: ['state bank', 'sbi', 'state bank of india'] },
    { name: 'AXIS BANK', keywords: ['axis', 'axis bank'] },
    { name: 'KOTAK BANK', keywords: ['kotak', 'kotak bank'] },
    { name: 'YES BANK', keywords: ['yes bank', 'yesbank'] },
    { name: 'INDUSIND BANK', keywords: ['indusind', 'indusind bank'] },
    { name: 'PNB', keywords: ['punjab national bank', 'pnb'] },
    { name: 'CANARA BANK', keywords: ['canara', 'canara bank'] },
    { name: 'BANK OF BARODA', keywords: ['bank of baroda', 'bob'] },
  ];
  
  for (const { name, keywords } of bankPatterns) {
    if (keywords.some(keyword => sample.includes(keyword))) {
      return name;
    }
  }
  
  return 'Unknown Bank';
}