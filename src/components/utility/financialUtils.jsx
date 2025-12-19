// Core utility functions for financial data processing

export function parseAmount(v) {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === 'number') return v;
  
  // Remove currency symbols, commas, and spaces
  const cleaned = String(v).replace(/[,₹$\s]/g, '');
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
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
  
  // Handle DD-MM-YYYY format (common in Indian statements)
  const dmy = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
  if (dmy) {
    let [_, d, m, y] = dmy;
    if (y.length === 2) y = '20' + y;
    const iso = `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    const dt = new Date(iso);
    return isNaN(dt.getTime()) ? null : dt;
  }
  
  // Handle YYYY-MM-DD format
  const ymd = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymd) {
    const [_, y, m, d] = ymd;
    const dt = new Date(Number(y), Number(m) - 1, Number(d));
    return isNaN(dt.getTime()) ? null : dt;
  }
  
  // Try native date parsing
  const dt = new Date(raw);
  return isNaN(dt.getTime()) ? null : dt;
}

export function monthKey(dt) {
  return dt ? `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}` : 'Unknown';
}

export function categorizeTransaction(particulars, type, credit, debit) {
  const particularsLower = particulars.toLowerCase();
  
  if (type === 'INCOME' || credit > 0) {
    if (particularsLower.includes('salary') || particularsLower.includes('payroll')) return 'Salary';
    if (particularsLower.includes('interest')) return 'Interest Income';
    if (particularsLower.includes('dividend')) return 'Dividend Income';
    if (particularsLower.includes('client') || particularsLower.includes('freelance') || particularsLower.includes('consulting')) return 'Business Income';
    if (particularsLower.includes('refund')) return 'Refunds';
    if (particularsLower.includes('transfer') || particularsLower.includes('from')) return 'Transfers';
    return 'Other Income';
  } else if (type === 'EXPENSE' || debit > 0) {
    if (particularsLower.includes('grocery') || particularsLower.includes('supermarket') || particularsLower.includes('food')) return 'Food & Groceries';
    if (particularsLower.includes('restaurant') || particularsLower.includes('cafe') || particularsLower.includes('dining')) return 'Dining Out';
    if (particularsLower.includes('rent') || particularsLower.includes('housing')) return 'Housing';
    if (particularsLower.includes('electricity') || particularsLower.includes('water') || particularsLower.includes('utility') || particularsLower.includes('bill')) return 'Utilities';
    if (particularsLower.includes('fuel') || particularsLower.includes('petrol') || particularsLower.includes('gas') || particularsLower.includes('transport')) return 'Transportation';
    if (particularsLower.includes('medical') || particularsLower.includes('hospital') || particularsLower.includes('pharmacy')) return 'Healthcare';
    if (particularsLower.includes('movie') || particularsLower.includes('entertainment') || particularsLower.includes('netflix') || particularsLower.includes('spotify')) return 'Entertainment';
    if (particularsLower.includes('shopping') || particularsLower.includes('mall') || particularsLower.includes('amazon') || particularsLower.includes('flipkart')) return 'Shopping';
    if (particularsLower.includes('loan') || particularsLower.includes('emi')) return 'Loan Repayment';
    if (particularsLower.includes('insurance')) return 'Insurance';
    if (particularsLower.includes('investment') || particularsLower.includes('mutual') || particularsLower.includes('stock')) return 'Investments';
    if (particularsLower.includes('transfer') || particularsLower.includes('to ')) return 'Transfers';
    return 'Other Expenses';
  }
  
  return 'Uncategorized';
}

export function normalizeData(rows) {
  const out = [];
  
  for (const r of rows) {
    // Extract data from various possible column names
    const row = {
      date: r.DATE ?? r.Date ?? r.date ?? r.transaction_date ?? r.txn_date ?? '',
      month: r.MONTH ?? r.Month ?? r.month ?? '',
      particulars: r.PARTICULARS ?? r.Particulars ?? r.particulars ?? r.Description ?? r.Narration ?? '',
      debit: parseAmount(r.DEBIT ?? r.Debit ?? r.debit ?? r.Expense ?? r.Withdrawal ?? 0),
      credit: parseAmount(r.CREDIT ?? r.Credit ?? r.credit ?? r.Income ?? r.Deposit ?? 0),
      type: safeStr(r.TYPE ?? r.Type ?? r.type ?? 'UNKNOWN'),
      category: safeStr(r.CATEGORY ?? r.Category ?? r.category ?? ''),
      bank: safeStr(r['BANK A/C'] ?? r['Bank A/C'] ?? r.Bank ?? r.bank ?? r.account ?? r.Account ?? 'Unknown')
    };

    // Auto-detect type if not provided
    if (!row.type || row.type.toUpperCase() === 'UNKNOWN') {
      if (row.credit > 0 && row.debit === 0) row.type = 'INCOME';
      else if (row.debit > 0 && row.credit === 0) row.type = 'EXPENSE';
      else if (row.credit > 0 && row.debit > 0) row.type = 'TRANSFER';
      else row.type = 'UNKNOWN';
    }

    // Auto-categorize if not provided
    if (!row.category) {
      row.category = categorizeTransaction(row.particulars, row.type, row.credit, row.debit);
    }

    // Parse date and create month key
    row._dt = parseDateFlexible(row.date);
    row._ym = monthKey(row._dt);

    out.push(row);
  }
  
  // Sort by date (earliest first)
  out.sort((a, b) => {
    const aTime = a._dt?.getTime() || 0;
    const bTime = b._dt?.getTime() || 0;
    return aTime - bTime || a.particulars.localeCompare(b.particulars);
  });
  
  return out;
}

export function generateIncomeStatement(data) {
  // Filter out transfers
  const incomeRows = data.filter(r => r.credit > 0 && !r.type.includes('TRANSFER'));
  const expenseRows = data.filter(r => r.debit > 0 && !r.type.includes('TRANSFER'));
  
  const totalIncome = incomeRows.reduce((sum, r) => sum + r.credit, 0);
  const totalExpenses = expenseRows.reduce((sum, r) => sum + r.debit, 0);
  const netIncome = totalIncome - totalExpenses;
  
  return { totalIncome, totalExpenses, netIncome };
}

export function generateCashFlowStatement(data) {
  // Simplified: Operating cash flow only
  const operatingIncome = data
    .filter(r => r.credit > 0 && 
               !r.category.includes('Investment') && 
               !r.category.includes('Loan') &&
               !r.type.includes('TRANSFER'))
    .reduce((sum, r) => sum + r.credit, 0);
  
  const operatingExpenses = data
    .filter(r => r.debit > 0 && 
               !r.category.includes('Investment') && 
               !r.category.includes('Loan') &&
               !r.type.includes('TRANSFER'))
    .reduce((sum, r) => sum + r.debit, 0);
  
  return operatingIncome - operatingExpenses;
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
  
  return { totalAssets, totalLiabilities, totalEquity };
}