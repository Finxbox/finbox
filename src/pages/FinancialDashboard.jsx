// FinancialDashboard.jsx
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Plot from 'react-plotly.js';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { 
  Upload, FileText, TrendingUp, Shield, ArrowLeft,
  DollarSign, TrendingDown, PieChart, BarChart3,
  Download, Loader2, Calendar, Banknote, Landmark, Wallet,
  CheckCircle, AlertCircle, FileSpreadsheet, X, Lock,
  CreditCard, Zap, ChevronRight, ExternalLink, RefreshCw,
  Filter, Search, Eye, EyeOff, Printer, Share2, Settings,
  Mail, MessageSquare, HelpCircle, Globe, Users, Target,
  Award, Bell, Home, User, Briefcase, CreditCard as Card,
  Building, Phone, MapPin, Clock, Star, Heart, ThumbsUp,
  BarChart, LineChart, ScatterChart, Activity, Cpu,
  Database, Server, Cloud, Wifi, Battery, Radio,
  Mic, Camera, Video, Headphones, Speaker, Music
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DematCTA from "../components/utility/DematCTA.jsx";

// ==================== CONFIGURATION ====================

const PAYMENT_CONFIG = {
  freeTier: {
    maxTransactions: 100,
    maxFiles: 3,
    maxFileSize: 5 * 1024 * 1024 // 5MB
  },
  razorpay: {
    key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_YOUR_KEY',
    amount: 9900, // ₹99 in paise
    currency: 'INR',
    name: 'Financial Statement Analyzer',
    description: 'Premium Statement Processing'
  }
};

const BANK_PATTERNS = [
  { name: 'HDFC BANK', keywords: ['hdfc', 'hdfc bank'], patterns: [/hdfc/i, /hdfc bank/i] },
  { name: 'ICICI BANK', keywords: ['icici', 'icici bank'], patterns: [/icici/i, /icici bank/i] },
  { name: 'SBI', keywords: ['state bank', 'sbi'], patterns: [/state bank of india/i, /sbi/i] },
  { name: 'AXIS BANK', keywords: ['axis', 'axis bank'], patterns: [/axis bank/i, /axis/i] },
  { name: 'KOTAK MAHINDRA', keywords: ['kotak', 'kotak mahindra'], patterns: [/kotak mahindra/i, /kotak bank/i] },
  { name: 'YES BANK', keywords: ['yes bank'], patterns: [/yes bank/i] },
  { name: 'INDUSIND BANK', keywords: ['indusind'], patterns: [/indusind bank/i] },
  { name: 'PNB', keywords: ['punjab national'], patterns: [/punjab national bank/i, /pnb/i] },
  { name: 'CANARA BANK', keywords: ['canara'], patterns: [/canara bank/i] },
  { name: 'BANK OF BARODA', keywords: ['bank of baroda'], patterns: [/bank of baroda/i, /bob/i] },
  { name: 'STANDARD CHARTERED', keywords: ['standard chartered'], patterns: [/standard chartered/i] },
  { name: 'CITIBANK', keywords: ['citibank'], patterns: [/citibank/i] },
];

const CATEGORY_KEYWORDS = {
  'Salary': ['salary', 'payroll', 'wages', 'income', 'stipend'],
  'Interest Income': ['interest', 'dividend', 'bank interest'],
  'Business Income': ['client', 'freelance', 'consulting', 'business', 'contract'],
  'Refunds': ['refund', 'reversal', 'chargeback'],
  'Food & Groceries': ['grocery', 'supermarket', 'food', 'vegetable', 'kirana', 'dmart'],
  'Dining Out': ['restaurant', 'cafe', 'dining', 'zomato', 'swiggy', 'eatsure'],
  'Housing': ['rent', 'housing', 'maintenance', 'society', 'house'],
  'Utilities': ['electricity', 'water', 'utility', 'bill', 'gas', 'cylinder', 'telephone'],
  'Transportation': ['fuel', 'petrol', 'diesel', 'transport', 'uber', 'ola', 'rapido'],
  'Healthcare': ['medical', 'hospital', 'pharmacy', 'doctor', 'medicine', 'apollo'],
  'Entertainment': ['movie', 'entertainment', 'netflix', 'spotify', 'hotstar', 'prime'],
  'Shopping': ['shopping', 'mall', 'amazon', 'flipkart', 'myntra', 'nykaa'],
  'Loan Repayment': ['loan', 'emi', 'repayment', 'home loan', 'car loan'],
  'Insurance': ['insurance', 'premium', 'lic', 'policy'],
  'Investments': ['investment', 'mutual', 'stock', 'share', 'sip', 'nps'],
  'Transfers': ['transfer', 'neft', 'rtgs', 'imps', 'upi', 'to ', 'from '],
  'Taxes': ['tax', 'gst', 'tds', 'income tax'],
  'Education': ['school', 'college', 'tuition', 'course', 'education'],
  'Travel': ['flight', 'hotel', 'travel', 'trip', 'vacation'],
  'Personal Care': ['salon', 'spa', 'beauty', 'gym', 'fitness']
};

// ==================== UTILITY FUNCTIONS ====================

export const parseAmount = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === 'number') return Math.abs(v);
  
  const cleaned = String(v)
    .replace(/[₹$€£,()\s]/g, '')
    .replace(/[a-zA-Z]/g, '')
    .trim();
  
  const n = Number(cleaned);
  return isNaN(n) ? 0 : Math.abs(n);
};

export const toINR = (n) => {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(n);
  } catch (e) {
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }
};

export const safeStr = (v) => (v ?? '').toString().trim();

export const parseDateFlexible = (s) => {
  if (!s) return null;
  const raw = s.toString().trim();
  
  const patterns = [
    { pattern: /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/, handler: (match) => 
      new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1])) 
    },
    { pattern: /^(\d{1,2})[-/](\d{1,2})[-/](\d{2})$/, handler: (match) => {
      const year = parseInt(match[3]) < 30 ? 2000 + parseInt(match[3]) : 1900 + parseInt(match[3]);
      return new Date(year, parseInt(match[2]) - 1, parseInt(match[1]));
    }},
    { pattern: /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/, handler: (match) => 
      new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]))
    },
    { pattern: /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})$/i, 
      handler: (match) => {
        const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
        const month = months.indexOf(match[2].toLowerCase().substring(0,3));
        return new Date(parseInt(match[3]), month, parseInt(match[1]));
      }
    },
  ];
  
  for (const { pattern, handler } of patterns) {
    const match = raw.match(pattern);
    if (match) {
      try {
        const dt = handler(match);
        if (!isNaN(dt.getTime())) return dt;
      } catch (e) {}
    }
  }
  
  try {
    const dt = new Date(raw);
    if (!isNaN(dt.getTime())) return dt;
  } catch (e) {}
  
  return null;
};

export const monthKey = (dt) => dt ? `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}` : 'Unknown';

// ==================== ENHANCED UNIVERSAL BANK PARSER ====================

class EnhancedUniversalBankParser {
  constructor() {
    this.transactions = [];
    this.metadata = {
      bankName: 'Unknown',
      accountNumber: null,
      period: null,
      totalTransactions: 0,
      fileType: null,
    };
  }

  detectBank(content) {
    if (!content) return 'Unknown Bank';
    
    const contentLower = typeof content === 'string' ? content.toLowerCase() : JSON.stringify(content).toLowerCase();
    
    for (const bank of BANK_PATTERNS) {
      for (const pattern of bank.patterns) {
        if (pattern.test(contentLower)) {
          return bank.name;
        }
      }
    }
    return 'Unknown Bank';
  }

  parseDate(dateString) {
    return parseDateFlexible(dateString);
  }

  parseAmountEnhanced(amountString) {
    if (!amountString && amountString !== 0) return { value: 0, type: 'unknown' };
    
    const str = amountString.toString().trim();
    const cleaned = str.replace(/[₹$€£,()\s]/g, '');
    
    const isCredit = /cr|credit|deposit|receipt|inward|credited|received|refund|c/i.test(str.toLowerCase());
    const isDebit = /dr|debit|withdrawal|payment|outward|debited|paid|purchase|d/i.test(str.toLowerCase());
    
    const amountMatch = cleaned.match(/(-?\d+\.?\d*)/);
    if (!amountMatch) return { value: 0, type: 'unknown' };
    
    let value = parseFloat(amountMatch[1]);
    if (isNaN(value)) value = 0;
    
    value = Math.abs(value);
    
    let type = 'unknown';
    if (isCredit) type = 'credit';
    if (isDebit) type = 'debit';
    
    if (type === 'unknown') {
      if (cleaned.startsWith('-') || str.includes('Dr')) {
        type = 'debit';
      } else if (str.includes('Cr') || str.includes('+')) {
        type = 'credit';
      } else if (value > 0) {
        type = str.toLowerCase().includes('withdrawal') ? 'debit' : 'credit';
      }
    }
    
    return { value, type };
  }

  categorizeTransaction(description) {
    if (!description) return 'Uncategorized';
    const desc = description.toLowerCase();
    
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (desc.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }
    
    return 'Other';
  }

  // Enhanced PDF processing with watermark handling
  async processPDF(file) {
    try {
      // Dynamic import of pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const transactions = [];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const textContent = await page.getTextContent({
          disableCombineTextItems: false,
          includeMarkedContent: true
        });
        
        // Extract structured text with watermark filtering
        const pageText = this.extractStructuredText(textContent, viewport);
        fullText += pageText + '\n\n';
        
        // Try table extraction
        const tableData = this.extractTableData(textContent, viewport);
        if (tableData.length > 0) {
          transactions.push(...tableData);
        }
      }
      
      // Fallback to text parsing if no structured data found
      if (transactions.length === 0) {
        const textTransactions = this.parseTextTransactions(fullText);
        transactions.push(...textTransactions);
      }
      
      // Clean and validate
      const cleanedTransactions = this.cleanAndValidateTransactions(transactions);
      
      // Detect bank
      const bankName = this.detectBank(fullText);
      
      return {
        transactions: cleanedTransactions,
        metadata: {
          bankName,
          accountNumber: this.extractAccountNumber(fullText),
          period: this.extractPeriod(fullText),
          totalTransactions: cleanedTransactions.length,
          fileType: 'PDF'
        }
      };
      
    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
  }

  extractStructuredText(textContent, viewport) {
    const lines = {};
    
    textContent.items.forEach(item => {
      const y = Math.round(item.transform[5]);
      const x = Math.round(item.transform[4]);
      
      // Filter watermarks and headers/footers
      if (item.height < 6 || item.width < 2) return; // Too small (watermarks)
      if (x < 30 || x > viewport.width - 30) return; // Edge of page
      if (y < 50 || y > viewport.height - 50) return; // Top/bottom margins
      
      if (!lines[y]) lines[y] = [];
      lines[y].push({ text: item.str, x });
    });
    
    // Build text line by line
    const sortedYs = Object.keys(lines).sort((a, b) => b - a); // Top to bottom
    let result = '';
    
    sortedYs.forEach(y => {
      const lineItems = lines[y].sort((a, b) => a.x - b.x);
      const lineText = lineItems.map(item => item.text).join(' ');
      
      // Skip lines that look like watermarks
      const lowerText = lineText.toLowerCase();
      const watermarkPatterns = [
        'confidential', 'draft', 'sample', 'copy of',
        'page', '©', 'watermark', 'statement copy'
      ];
      
      if (!watermarkPatterns.some(pattern => lowerText.includes(pattern))) {
        result += lineText + '\n';
      }
    });
    
    return result;
  }

  extractTableData(textContent, viewport) {
    const transactions = [];
    
    // Group by approximate y position (allowing some tolerance)
    const yGroups = {};
    const yTolerance = 3;
    
    textContent.items.forEach(item => {
      if (item.height < 8) return; // Skip very small text
      
      const y = Math.round(item.transform[5] / yTolerance) * yTolerance;
      if (!yGroups[y]) yGroups[y] = [];
      yGroups[y].push({
        text: item.str,
        x: item.transform[4],
        width: item.width
      });
    });
    
    // Sort y positions top to bottom
    const sortedYs = Object.keys(yGroups).sort((a, b) => b - a);
    
    // Look for table structure
    let inTable = false;
    let tableRows = [];
    
    sortedYs.forEach(y => {
      const items = yGroups[y];
      if (items.length < 2) return; // Need at least 2 columns for a table
      
      // Check if this looks like a table row
      items.sort((a, b) => a.x - b.x);
      
      // Check for typical table patterns
      const hasDate = items.some(item => this.isDateLike(item.text));
      const hasAmount = items.some(item => this.isAmountLike(item.text));
      const hasDescription = items.some(item => 
        item.text && item.text.length > 3 && 
        !this.isDateLike(item.text) && 
        !this.isAmountLike(item.text)
      );
      
      if ((hasDate && hasAmount) || (hasDate && hasDescription)) {
        if (!inTable) {
          inTable = true;
        }
        tableRows.push({ y, items });
      } else if (inTable) {
        // Process collected table rows
        if (tableRows.length >= 2) {
          const tableTransactions = this.parseTableRows(tableRows);
          transactions.push(...tableTransactions);
        }
        tableRows = [];
        inTable = false;
      }
    });
    
    // Process any remaining rows
    if (tableRows.length >= 2) {
      const tableTransactions = this.parseTableRows(tableRows);
      transactions.push(...tableTransactions);
    }
    
    return transactions;
  }

  isDateLike(text) {
    if (!text || text.length < 6) return false;
    
    const datePatterns = [
      /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/,
      /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2}$/,
      /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/,
      /^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}$/i,
      /^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2}$/i
    ];
    
    return datePatterns.some(pattern => pattern.test(text.trim()));
  }

  isAmountLike(text) {
    if (!text) return false;
    
    const cleaned = text.replace(/[₹$€£,]/g, '');
    const amountPatterns = [
      /^-?\d+\.?\d*$/,
      /^-?\d+\.?\d*\s*(Cr|Dr)?$/i,
      /^-?\d+\.?\d*\s*(Credit|Debit)?$/i,
      /^-?\d+\.?\d*\s*[A-Z]{3}$/i
    ];
    
    return amountPatterns.some(pattern => pattern.test(cleaned.trim()));
  }

  parseTableRows(tableRows) {
    const transactions = [];
    
    // Sort rows by y position (top to bottom)
    tableRows.sort((a, b) => b.y - a.y);
    
    // Skip header row if present
    let startRow = 0;
    const firstRowText = tableRows[0].items.map(i => i.text).join(' ').toLowerCase();
    const headerWords = ['date', 'particulars', 'narration', 'description', 'debit', 'credit', 'withdrawal', 'deposit', 'balance'];
    if (headerWords.some(word => firstRowText.includes(word))) {
      startRow = 1;
    }
    
    for (let i = startRow; i < tableRows.length; i++) {
      const row = tableRows[i];
      const items = row.items.sort((a, b) => a.x - b.x);
      
      if (items.length < 2) continue;
      
      // Try to identify columns
      let date = null;
      let description = '';
      let debit = 0;
      let credit = 0;
      
      // First item is often date
      if (this.isDateLike(items[0].text)) {
        date = this.parseDate(items[0].text);
      }
      
      // Last items are often amounts
      for (let j = items.length - 1; j >= Math.max(1, items.length - 3); j--) {
        const amountResult = this.parseAmountEnhanced(items[j].text);
        if (amountResult.value > 0) {
          if (amountResult.type === 'debit') debit = amountResult.value;
          if (amountResult.type === 'credit') credit = amountResult.value;
          break;
        }
      }
      
      // Middle items are description
      const descItems = [];
      for (let j = 1; j < items.length; j++) {
        if (!this.isDateLike(items[j].text) && !this.isAmountLike(items[j].text)) {
          descItems.push(items[j].text);
        }
      }
      description = descItems.join(' ').trim();
      
      // If no date found, try to extract from description
      if (!date) {
        const dateMatch = description.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/);
        if (dateMatch) {
          date = this.parseDate(dateMatch[0]);
        }
      }
      
      if (date && (debit > 0 || credit > 0)) {
        transactions.push({
          date,
          dateString: items[0]?.text || '',
          description: description || 'Transaction',
          debit,
          credit,
          category: this.categorizeTransaction(description),
          type: credit > 0 ? 'CREDIT' : 'DEBIT',
          bank: this.metadata.bankName || 'Unknown'
        });
      }
    }
    
    return transactions;
  }

  parseTextTransactions(text) {
    const transactions = [];
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.length < 10) continue;
      
      // Look for date at beginning of line
      const dateMatch = line.match(/^(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i);
      
      if (dateMatch) {
        const dateStr = dateMatch[0];
        const date = this.parseDate(dateStr);
        const remaining = line.substring(dateStr.length).trim();
        
        // Look for amount at end
        const amountMatch = remaining.match(/([\d,]+\.?\d*\s*(?:Cr|Dr|Credit|Debit)?)$/i);
        
        if (amountMatch) {
          const amountStr = amountMatch[0];
          const description = remaining.substring(0, remaining.length - amountStr.length).trim();
          const amountResult = this.parseAmountEnhanced(amountStr);
          
          if (date && description && (amountResult.value > 0)) {
            transactions.push({
              date,
              dateString: dateStr,
              description,
              debit: amountResult.type === 'debit' ? amountResult.value : 0,
              credit: amountResult.type === 'credit' ? amountResult.value : 0,
              category: this.categorizeTransaction(description),
              type: amountResult.type === 'credit' ? 'CREDIT' : 'DEBIT',
              bank: this.metadata.bankName || 'Unknown'
            });
          }
        }
      }
    }
    
    return transactions;
  }

  cleanAndValidateTransactions(transactions) {
    return transactions
      .filter(t => {
        if (!t.date) return false;
        if (t.debit === 0 && t.credit === 0) return false;
        
        // Filter out balance entries
        const descLower = t.description.toLowerCase();
        const ignorePatterns = [
          'opening balance',
          'closing balance',
          'balance brought forward',
          'balance carried forward',
          'total debit',
          'total credit',
          'grand total',
          'page total',
          'continued'
        ];
        
        return !ignorePatterns.some(pattern => descLower.includes(pattern));
      })
      .sort((a, b) => a.date - b.date);
  }

  extractAccountNumber(text) {
    const patterns = [
      /account\s*no\.?\s*[:]?\s*([A-Z0-9\-\s]{8,20})/i,
      /a\/c\s*no\.?\s*[:]?\s*([A-Z0-9\-\s]{8,20})/i,
      /account\s*number\s*[:]?\s*([A-Z0-9\-\s]{8,20})/i,
      /([0-9]{9,18})\s+(?:savings|current|account)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  }

  extractPeriod(text) {
    const patterns = [
      /statement\s*period\s*[:]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4})\s*to\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4})/i,
      /period\s*[:]?\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4})\s*-\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4})/i,
      /from\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4})\s*to\s*([0-9]{1,2}[\/\-\.][0-9]{1,2}[\/\-\.][0-9]{4})/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[2]) {
        return `${match[1].trim()} to ${match[2].trim()}`;
      }
    }
    
    return null;
  }

  // Excel/CSV/JSON processing remains largely the same but with improved parsing
  async processExcel(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { 
            type: 'array',
            cellDates: true,
            cellText: false,
            cellNF: false,
            raw: false,
            dense: true
          });
          
          const allTransactions = [];
          let bankName = 'Unknown';
          
          workbook.SheetNames.forEach(sheetName => {
            try {
              const worksheet = workbook.Sheets[sheetName];
              
              // Convert to JSON with better detection
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                header: 1, 
                defval: '', 
                raw: false,
                blankrows: false
              });
              
              if (jsonData.length === 0) return;
              
              // Auto-detect header row
              let headerRow = 0;
              for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
                const row = jsonData[i];
                if (!Array.isArray(row)) continue;
                
                const rowText = row.join(' ').toLowerCase();
                const hasDate = rowText.includes('date') || rowText.includes('trans date');
                const hasDesc = rowText.includes('desc') || rowText.includes('narration') || rowText.includes('particular');
                const hasAmount = rowText.includes('amount') || rowText.includes('debit') || rowText.includes('credit');
                
                if (hasDate && (hasDesc || hasAmount)) {
                  headerRow = i;
                  break;
                }
              }
              
              const headers = jsonData[headerRow] || [];
              const headerMap = {};
              
              headers.forEach((header, index) => {
                if (header) {
                  const headerStr = header.toString().toLowerCase().trim();
                  headerMap[headerStr] = index;
                  
                  // Detect bank from header
                  for (const bank of BANK_PATTERNS) {
                    if (bank.keywords.some(keyword => headerStr.includes(keyword))) {
                      bankName = bank.name;
                    }
                  }
                }
              });
              
              // Process data rows
              for (let i = headerRow + 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!Array.isArray(row) || row.length === 0) continue;
                
                // Extract data based on header mapping
                let date = null;
                let description = '';
                let debit = 0;
                let credit = 0;
                
                // Find date
                for (const [key, idx] of Object.entries(headerMap)) {
                  if (key.includes('date') && row[idx]) {
                    date = this.parseDate(row[idx]);
                    break;
                  }
                }
                
                // Find description
                const descKeys = Object.keys(headerMap).filter(k => 
                  k.includes('desc') || k.includes('narration') || 
                  k.includes('particular') || k.includes('remark') || k.includes('details')
                );
                
                for (const key of descKeys) {
                  if (row[headerMap[key]]) {
                    description = row[headerMap[key]].toString().trim();
                    break;
                  }
                }
                
                // Find amounts
                const debitKeys = Object.keys(headerMap).filter(k => 
                  k.includes('debit') || k.includes('dr') || k.includes('withdrawal')
                );
                
                const creditKeys = Object.keys(headerMap).filter(k => 
                  k.includes('credit') || k.includes('cr') || k.includes('deposit')
                );
                
                const amountKeys = Object.keys(headerMap).filter(k => 
                  k.includes('amount') && !k.includes('balance')
                );
                
                // Try debit/credit columns first
                for (const key of debitKeys) {
                  const amount = this.parseAmountEnhanced(row[headerMap[key]]);
                  if (amount.type === 'debit') debit = amount.value;
                }
                
                for (const key of creditKeys) {
                  const amount = this.parseAmountEnhanced(row[headerMap[key]]);
                  if (amount.type === 'credit') credit = amount.value;
                }
                
                // If no debit/credit found, try amount column
                if (debit === 0 && credit === 0 && amountKeys.length > 0) {
                  const amount = this.parseAmountEnhanced(row[headerMap[amountKeys[0]]]);
                  if (amount.type === 'debit') debit = amount.value;
                  if (amount.type === 'credit') credit = amount.value;
                }
                
                // Create transaction if valid
                if (date && (debit > 0 || credit > 0)) {
                  allTransactions.push({
                    date,
                    dateString: row[headerMap[Object.keys(headerMap).find(k => k.includes('date')) || 0]] || '',
                    description: description || 'Transaction',
                    debit,
                    credit,
                    category: this.categorizeTransaction(description),
                    type: credit > 0 ? 'CREDIT' : 'DEBIT',
                    bank: bankName
                  });
                }
              }
              
            } catch (sheetError) {
              console.error(`Error processing sheet ${sheetName}:`, sheetError);
            }
          });
          
          resolve({
            transactions: allTransactions,
            metadata: {
              bankName,
              accountNumber: null,
              period: null,
              totalTransactions: allTransactions.length,
              fileType: 'Excel'
            }
          });
          
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  async processCSV(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const transactions = [];
            let bankName = 'Unknown';
            
            // Detect bank from data
            results.data.forEach(row => {
              Object.values(row).forEach(value => {
                if (typeof value === 'string') {
                  const valueLower = value.toLowerCase();
                  for (const bank of BANK_PATTERNS) {
                    if (bank.keywords.some(keyword => valueLower.includes(keyword))) {
                      bankName = bank.name;
                    }
                  }
                }
              });
            });
            
            // Normalize headers
            const normalizedData = results.data.map(row => {
              const normalized = {};
              Object.keys(row).forEach(key => {
                const normalizedKey = key.toLowerCase().trim();
                normalized[normalizedKey] = row[key];
              });
              return normalized;
            });
            
            // Process each row
            normalizedData.forEach(row => {
              let date = null;
              let description = '';
              let debit = 0;
              let credit = 0;
              
              // Find date
              for (const key in row) {
                if (key.includes('date') && row[key]) {
                  date = this.parseDate(row[key]);
                  break;
                }
              }
              
              // Find description
              for (const key in row) {
                if ((key.includes('desc') || key.includes('narration') || key.includes('particular')) && 
                    row[key] && !this.isDateLike(row[key]) && !this.isAmountLike(row[key])) {
                  description = row[key].toString().trim();
                  break;
                }
              }
              
              // Find amounts
              for (const key in row) {
                if (key.includes('debit') || key.includes('dr') || key.includes('withdrawal')) {
                  const amount = this.parseAmountEnhanced(row[key]);
                  if (amount.type === 'debit') debit = amount.value;
                }
                if (key.includes('credit') || key.includes('cr') || key.includes('deposit')) {
                  const amount = this.parseAmountEnhanced(row[key]);
                  if (amount.type === 'credit') credit = amount.value;
                }
              }
              
              // Fallback to amount column
              if (debit === 0 && credit === 0) {
                for (const key in row) {
                  if (key.includes('amount') && !key.includes('balance')) {
                    const amount = this.parseAmountEnhanced(row[key]);
                    if (amount.type === 'debit') debit = amount.value;
                    if (amount.type === 'credit') credit = amount.value;
                    break;
                  }
                }
              }
              
              if (date && (debit > 0 || credit > 0)) {
                transactions.push({
                  date,
                  dateString: row['date'] || '',
                  description: description || 'Transaction',
                  debit,
                  credit,
                  category: this.categorizeTransaction(description),
                  type: credit > 0 ? 'CREDIT' : 'DEBIT',
                  bank: bankName
                });
              }
            });
            
            resolve({
              transactions,
              metadata: {
                bankName,
                accountNumber: null,
                period: null,
                totalTransactions: transactions.length,
                fileType: 'CSV'
              }
            });
            
          } catch (error) {
            reject(error);
          }
        },
        error: reject
      });
    });
  }

  async processJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          const transactions = [];
          let bankName = 'Unknown';
          
          const extractFromArray = (arr) => {
            if (!Array.isArray(arr)) return;
            
            arr.forEach(item => {
              if (item && typeof item === 'object') {
                // Convert keys to lowercase for consistency
                const normalized = {};
                Object.keys(item).forEach(key => {
                  normalized[key.toLowerCase().trim()] = item[key];
                });
                
                // Detect bank
                Object.values(normalized).forEach(value => {
                  if (typeof value === 'string') {
                    const valueLower = value.toLowerCase();
                    for (const bank of BANK_PATTERNS) {
                      if (bank.keywords.some(keyword => valueLower.includes(keyword))) {
                        bankName = bank.name;
                      }
                    }
                  }
                });
                
                // Extract data
                let date = null;
                let description = '';
                let debit = 0;
                let credit = 0;
                
                // Find date
                for (const key in normalized) {
                  if (key.includes('date') && normalized[key]) {
                    date = this.parseDate(normalized[key]);
                    break;
                  }
                }
                
                // Find description
                for (const key in normalized) {
                  if ((key.includes('desc') || key.includes('narration') || key.includes('particular')) && 
                      normalized[key] && !this.isDateLike(normalized[key]) && !this.isAmountLike(normalized[key])) {
                    description = normalized[key].toString().trim();
                    break;
                  }
                }
                
                // Find amounts
                for (const key in normalized) {
                  if (key.includes('debit') || key.includes('dr')) {
                    const amount = this.parseAmountEnhanced(normalized[key]);
                    if (amount.type === 'debit') debit = amount.value;
                  }
                  if (key.includes('credit') || key.includes('cr')) {
                    const amount = this.parseAmountEnhanced(normalized[key]);
                    if (amount.type === 'credit') credit = amount.value;
                  }
                }
                
                if (date && (debit > 0 || credit > 0)) {
                  transactions.push({
                    date,
                    dateString: normalized['date'] || '',
                    description: description || 'Transaction',
                    debit,
                    credit,
                    category: this.categorizeTransaction(description),
                    type: credit > 0 ? 'CREDIT' : 'DEBIT',
                    bank: bankName
                  });
                }
              }
            });
          };
          
          // Handle different JSON structures
          if (Array.isArray(data)) {
            extractFromArray(data);
          } else if (data.transactions && Array.isArray(data.transactions)) {
            extractFromArray(data.transactions);
          } else if (data.data && Array.isArray(data.data)) {
            extractFromArray(data.data);
          } else {
            // Try to find arrays in the object
            Object.values(data).forEach(value => {
              if (Array.isArray(value)) {
                extractFromArray(value);
              }
            });
          }
          
          resolve({
            transactions,
            metadata: {
              bankName,
              accountNumber: null,
              period: null,
              totalTransactions: transactions.length,
              fileType: 'JSON'
            }
          });
          
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async processFile(file) {
    const fileName = file.name.toLowerCase();
    
    try {
      if (fileName.endsWith('.pdf')) {
        return await this.processPDF(file);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        return await this.processExcel(file);
      } else if (fileName.endsWith('.csv')) {
        return await this.processCSV(file);
      } else if (fileName.endsWith('.json')) {
        return await this.processJSON(file);
      } else {
        throw new Error(`Unsupported file format: ${fileName}`);
      }
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      throw new Error(`Failed to process ${file.name}: ${error.message}`);
    }
  }

  async processFiles(files) {
    const allTransactions = [];
    let metadata = {
      bankName: 'Multiple Banks',
      accountNumber: null,
      period: null,
      totalTransactions: 0,
      fileType: 'Multiple'
    };
    
    for (const file of files) {
      try {
        const result = await this.processFile(file);
        allTransactions.push(...result.transactions);
        
        if (metadata.bankName === 'Multiple Banks' && result.metadata.bankName !== 'Unknown') {
          metadata.bankName = result.metadata.bankName;
        }
        
        // Merge account info if available
        if (!metadata.accountNumber && result.metadata.accountNumber) {
          metadata.accountNumber = result.metadata.accountNumber;
        }
        
        if (!metadata.period && result.metadata.period) {
          metadata.period = result.metadata.period;
        }
        
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        throw error;
      }
    }
    
    // Sort by date
    allTransactions.sort((a, b) => a.date - b.date);
    
    metadata.totalTransactions = allTransactions.length;
    
    return {
      transactions: allTransactions,
      metadata
    };
  }
}

// ==================== FINANCIAL STATEMENT GENERATORS ====================

export const generateIncomeStatement = (data) => {
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
    expenseCount: expenseRows.length,
    incomeByCategory: groupByCategory(incomeRows, 'credit'),
    expensesByCategory: groupByCategory(expenseRows, 'debit')
  };
};

export const generateCashFlowStatement = (data) => {
  // Operating Activities
  const operatingIncome = data
    .filter(r => r.credit > 0 && 
               !r.category.includes('Investment') && 
               !r.category.includes('Loan') &&
               !r.category.includes('Transfer') &&
               !r.category.includes('Refund'))
    .reduce((sum, r) => sum + r.credit, 0);
  
  const operatingExpenses = data
    .filter(r => r.debit > 0 && 
               !r.category.includes('Investment') && 
               !r.category.includes('Loan') &&
               !r.category.includes('Transfer'))
    .reduce((sum, r) => sum + r.debit, 0);
  
  // Investing Activities
  const investingCashFlow = data
    .filter(r => r.category.includes('Investment') || 
                r.description.toLowerCase().includes('mutual fund') ||
                r.description.toLowerCase().includes('stock') ||
                r.description.toLowerCase().includes('fixed deposit'))
    .reduce((sum, r) => sum + (r.credit - r.debit), 0);
  
  // Financing Activities
  const financingCashFlow = data
    .filter(r => r.category.includes('Loan') || 
                r.description.toLowerCase().includes('loan') ||
                r.description.toLowerCase().includes('emi') ||
                r.description.toLowerCase().includes('repayment'))
    .reduce((sum, r) => sum + (r.credit - r.debit), 0);
  
  const netCashFlow = operatingIncome - operatingExpenses + investingCashFlow + financingCashFlow;
  
  // Detect recurring payments
  const recurringPayments = detectRecurringPayments(data);
  
  return {
    operatingCashFlow: operatingIncome - operatingExpenses,
    investingCashFlow,
    financingCashFlow,
    netCashFlow,
    recurringPayments,
    cashFlowByMonth: groupCashFlowByMonth(data)
  };
};

export const generateBalanceSheet = (data, netIncome) => {
  const cashBalance = data.reduce((sum, r) => sum + r.credit - r.debit, 0);
  
  const investments = data
    .filter(r => r.category.includes('Investment') && r.debit > 0)
    .reduce((sum, r) => sum + r.debit, 0);
  
  const accountsReceivable = data
    .filter(r => r.credit > 0 && r.category.includes('Business Income'))
    .reduce((sum, r) => sum + r.credit, 0) * 0.3; // Estimate 30% as receivable
  
  const totalAssets = Math.max(0, cashBalance) + investments + accountsReceivable;
  
  const loans = data
    .filter(r => r.category.includes('Loan') && r.credit > 0)
    .reduce((sum, r) => sum + r.credit, 0);
  
  const totalLiabilities = loans;
  const totalEquity = Math.max(0, netIncome);
  
  return { 
    totalAssets, 
    totalLiabilities, 
    totalEquity,
    cashBalance: Math.max(0, cashBalance),
    investments,
    accountsReceivable
  };
};

// Helper functions
const groupByCategory = (data, amountField) => {
  const groups = {};
  data.forEach(item => {
    const category = item.category || 'Uncategorized';
    if (!groups[category]) groups[category] = 0;
    groups[category] += item[amountField];
  });
  return groups;
};

const groupCashFlowByMonth = (data) => {
  const byMonth = {};
  data.forEach(item => {
    if (!item.date) return;
    const monthKey = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[monthKey]) {
      byMonth[monthKey] = { income: 0, expenses: 0, net: 0 };
    }
    byMonth[monthKey].income += item.credit;
    byMonth[monthKey].expenses += item.debit;
    byMonth[monthKey].net = byMonth[monthKey].income - byMonth[monthKey].expenses;
  });
  return byMonth;
};

const detectRecurringPayments = (data) => {
  const monthlyGroups = {};
  
  // Group by description pattern and amount
  data.forEach(item => {
    if (item.debit > 0) {
      const key = item.description.toLowerCase()
        .replace(/\d+/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 40);
      
      const amountKey = Math.round(item.debit / 100) * 100; // Group similar amounts
      const fullKey = `${key}_${amountKey}`;
      
      if (!monthlyGroups[fullKey]) {
        monthlyGroups[fullKey] = [];
      }
      monthlyGroups[fullKey].push(item);
    }
  });
  
  // Find recurring patterns
  const recurring = [];
  Object.entries(monthlyGroups).forEach(([key, items]) => {
    if (items.length >= 2) {
      items.sort((a, b) => a.date - b.date);
      
      // Check if intervals are monthly
      let isMonthly = true;
      for (let i = 1; i < items.length; i++) {
        const daysDiff = (items[i].date - items[i-1].date) / (1000 * 60 * 60 * 24);
        if (daysDiff < 25 || daysDiff > 35) {
          isMonthly = false;
          break;
        }
      }
      
      if (isMonthly) {
        recurring.push({
          description: items[0].description,
          averageAmount: items.reduce((sum, item) => sum + item.debit, 0) / items.length,
          frequency: 'monthly',
          count: items.length,
          nextExpected: new Date(items[items.length - 1].date.getTime() + 30 * 24 * 60 * 60 * 1000),
          category: items[0].category
        });
      }
    }
  });
  
  return recurring;
};

// ==================== PAYMENT WALL COMPONENT ====================

const PaymentWall = ({ onPaymentSuccess, onSkip, transactionCount }) => {
  const [loading, setLoading] = useState(false);
  
  const initiatePayment = async () => {
    setLoading(true);
    try {
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }
      
      const options = {
        key: PAYMENT_CONFIG.razorpay.key,
        amount: PAYMENT_CONFIG.razorpay.amount,
        currency: PAYMENT_CONFIG.razorpay.currency,
        name: PAYMENT_CONFIG.razorpay.name,
        description: PAYMENT_CONFIG.razorpay.description,
        handler: function(response) {
          setLoading(false);
          onPaymentSuccess(response);
        },
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#694F8E'
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      setLoading(false);
      alert('Payment initialization failed. Please try again.');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in duration-300">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Analysis Required</h3>
          <p className="text-gray-600">
            You have <span className="font-bold">{transactionCount}</span> transactions, 
            which exceeds the free limit of <span className="font-bold">{PAYMENT_CONFIG.freeTier.maxTransactions}</span>.
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-purple-600" />
              <span className="font-medium">Free Tier</span>
            </div>
            <span className="text-gray-700">Up to {PAYMENT_CONFIG.freeTier.maxTransactions} transactions</span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="flex items-center gap-3">
              <CreditCard size={20} className="text-green-600" />
              <span className="font-medium">Premium Tier</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-700">₹99</div>
              <div className="text-sm text-green-600">One-time payment • Unlimited</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={initiatePayment}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                Upgrade to Premium - ₹99
              </>
            )}
          </button>
          
          <button
            onClick={onSkip}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Process {PAYMENT_CONFIG.freeTier.maxTransactions} transactions only (Free)
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Shield size={16} />
            <span>Secure payment • No data stored</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN FINANCIAL DASHBOARD COMPONENT ====================

function FinancialDashboard() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detectedBank, setDetectedBank] = useState('Unknown');
  const [processingStats, setProcessingStats] = useState(null);
  const [showPaymentWall, setShowPaymentWall] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [processingResult, setProcessingResult] = useState(null);
  const [financialMetrics, setFinancialMetrics] = useState(null);
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

  // Initialize payment status
  useEffect(() => {
    const paid = localStorage.getItem('hasPaidForStatementParser');
    if (paid === 'true') {
      setHasPaid(true);
    }
  }, []);

  // Handle file selection from input
  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles = Array.from(event.target.files);
      addFiles(newFiles);
      event.target.value = '';
    }
  };

  // Add files with validation
  const addFiles = (newFiles) => {
    const validFiles = [];
    const errors = [];
    
    newFiles.forEach(file => {
      const fileName = file.name.toLowerCase();
      const isValidType = fileName.endsWith('.pdf') || 
                         fileName.endsWith('.xlsx') || 
                         fileName.endsWith('.xls') || 
                         fileName.endsWith('.csv') || 
                         fileName.endsWith('.json');
      
      if (!isValidType) {
        errors.push(`${file.name}: Unsupported file type`);
        return;
      }
      
      if (file.size > PAYMENT_CONFIG.freeTier.maxFileSize && !hasPaid) {
        errors.push(`${file.name}: File too large (max ${PAYMENT_CONFIG.freeTier.maxFileSize / (1024*1024)}MB for free tier)`);
        return;
      }
      
      validFiles.push(file);
    });
    
    if (errors.length > 0) {
      setError(errors.join('\n'));
    }
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
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
      addFiles(newFiles);
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

  // Process files
  const processUploadedFiles = async (limitTransactions = false) => {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }
    
    setLoading(true);
    setError(null);
    setProcessingStats(null);
    setFinancialMetrics(null);
    
    try {
      // Check if payment is needed
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const needsPayment = totalSize > PAYMENT_CONFIG.freeTier.maxFileSize || 
                          files.length > PAYMENT_CONFIG.freeTier.maxFiles;
      
      if (needsPayment && !hasPaid && !limitTransactions) {
        setLoading(false);
        setShowPaymentWall(true);
        return;
      }
      
      const parser = new EnhancedUniversalBankParser();
      const result = await parser.processFiles(files);
      
      // Apply transaction limit for free tier
      if (!hasPaid && limitTransactions && result.transactions.length > PAYMENT_CONFIG.freeTier.maxTransactions) {
        result.transactions = result.transactions.slice(0, PAYMENT_CONFIG.freeTier.maxTransactions);
        result.metadata.totalTransactions = result.transactions.length;
        result.metadata.isLimited = true;
      }
      
      setProcessingResult(result);
      setTransactions(result.transactions);
      setDetectedBank(result.metadata.bankName);
      
      // Generate financial metrics
      const incomeStatement = generateIncomeStatement(result.transactions);
      const cashFlow = generateCashFlowStatement(result.transactions);
      const balanceSheet = generateBalanceSheet(result.transactions, incomeStatement.netIncome);
      
      setFinancialMetrics({
        incomeStatement,
        cashFlow,
        balanceSheet
      });
      
      // Calculate processing stats
      const stats = {
        totalRows: result.transactions.length,
        successfulRows: result.transactions.length,
        failedRows: 0,
        bankDetected: result.metadata.bankName,
        fileCount: files.length,
        hasPDF: files.some(isPDF),
        fileType: result.metadata.fileType,
        accountNumber: result.metadata.accountNumber,
        period: result.metadata.period
      };
      
      setProcessingStats(stats);
      
    } catch (err) {
      console.error('Error processing files:', err);
      setError(err.message || 'Failed to process files. Please check file formats.');
    } finally {
      setLoading(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (response) => {
    setHasPaid(true);
    setShowPaymentWall(false);
    localStorage.setItem('hasPaidForStatementParser', 'true');
    
    // Process files with full access
    processUploadedFiles();
  };

  // Load sample data on initial render
  useEffect(() => {
    if (files.length === 0 && !loading) {
      const loadSampleData = async () => {
        setLoading(true);
        try {
          // Convert sample data to transaction format
          const sampleTransactions = sampleData.map(item => ({
            date: parseDateFlexible(item.DATE),
            dateString: item.DATE,
            description: item.PARTICULARS,
            debit: item.DEBIT,
            credit: item.CREDIT,
            category: categorizeTransaction(item.PARTICULARS, item.TYPE, item.CREDIT, item.DEBIT),
            type: item.CREDIT > 0 ? 'CREDIT' : 'DEBIT',
            bank: item['BANK A/C']
          })).filter(t => t.date);
          
          setTransactions(sampleTransactions);
          setDetectedBank('AXIS BANK (Sample Data)');
          
          // Generate financial metrics
          const incomeStatement = generateIncomeStatement(sampleTransactions);
          const cashFlow = generateCashFlowStatement(sampleTransactions);
          const balanceSheet = generateBalanceSheet(sampleTransactions, incomeStatement.netIncome);
          
          setFinancialMetrics({
            incomeStatement,
            cashFlow,
            balanceSheet
          });
          
          setProcessingStats({
            totalRows: sampleTransactions.length,
            successfulRows: sampleTransactions.length,
            failedRows: 0,
            bankDetected: 'AXIS BANK (Sample Data)',
            fileCount: 0,
            hasPDF: false,
            fileType: 'Sample'
          });
        } catch (err) {
          console.error('Error loading sample data:', err);
        } finally {
          setLoading(false);
        }
      };
      loadSampleData();
    }
  }, [files.length]);

  // Categorize transaction helper
  const categorizeTransaction = (particulars, type, credit, debit) => {
    const particularsLower = particulars.toLowerCase();
    
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (particularsLower.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }
    
    if (type === 'INCOME' || credit > 0) return 'Other Income';
    if (type === 'EXPENSE' || debit > 0) return 'Other Expenses';
    
    return 'Uncategorized';
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (transactions.length === 0 || !financialMetrics) return null;
    
    // Group transactions by month
    const byMonth = new Map();
    transactions.forEach(t => {
      if (!t.date) return;
      const month = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
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

  // Export data functions
  const downloadDataJSON = () => {
    if (transactions.length === 0) {
      alert('No data available to download');
      return;
    }
    
    const exportData = transactions.map(t => ({
      date: t.date.toISOString().split('T')[0],
      description: t.description,
      debit: t.debit,
      credit: t.credit,
      category: t.category,
      type: t.type,
      bank: t.bank
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
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

  const downloadDataCSV = () => {
    if (transactions.length === 0) {
      alert('No data available to download');
      return;
    }
    
    const headers = ['Date', 'Description', 'Debit', 'Credit', 'Type', 'Category', 'Bank'];
    const csvRows = [
      headers.join(','),
      ...transactions.map(t => [
        t.date.toISOString().split('T')[0],
        `"${t.description.replace(/"/g, '""')}"`,
        t.debit,
        t.credit,
        t.type,
        t.category,
        t.bank
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

  const downloadPDFReport = () => {
    if (transactions.length === 0) {
      alert('No data available to download');
      return;
    }
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Financial Report - ${detectedBank}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #694F8E; padding-bottom: 10px; }
            .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
            .summary-item { background: #f8f9fa; padding: 15px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #694F8E; color: white; }
            .credit { color: green; }
            .debit { color: red; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Financial Statement Analysis Report</h1>
          <p><strong>Bank:</strong> ${detectedBank}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>Total Transactions:</strong> ${transactions.length}</p>
          
          <div class="summary">
            <div class="summary-item">
              <strong>Total Income:</strong> ${toINR(financialMetrics?.incomeStatement.totalIncome || 0)}
            </div>
            <div class="summary-item">
              <strong>Total Expenses:</strong> ${toINR(financialMetrics?.incomeStatement.totalExpenses || 0)}
            </div>
            <div class="summary-item">
              <strong>Net Income:</strong> ${toINR(financialMetrics?.incomeStatement.netIncome || 0)}
            </div>
            <div class="summary-item">
              <strong>Cash Balance:</strong> ${toINR(financialMetrics?.balanceSheet.cashBalance || 0)}
            </div>
          </div>
          
          <h2>Recent Transactions</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Credit</th>
                <th>Debit</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.slice(0, 50).map(t => `
                <tr>
                  <td>${t.date ? t.date.toLocaleDateString() : 'N/A'}</td>
                  <td>${t.description}</td>
                  <td class="credit">${t.credit > 0 ? '₹' + t.credit : ''}</td>
                  <td class="debit">${t.debit > 0 ? '₹' + t.debit : ''}</td>
                  <td>${t.category}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Generated by Financial Statement Analyzer</p>
            <p>All processing done locally in your browser • No data stored</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Helper Components
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
          <span>PDF processed with watermark filtering</span>
        </div>
      )}
      {stats.accountNumber && (
        <div className="mt-2 text-sm text-gray-600">
          <span className="font-medium">Account:</span> {stats.accountNumber}
        </div>
      )}
      {stats.period && (
        <div className="mt-1 text-sm text-gray-600">
          <span className="font-medium">Period:</span> {stats.period}
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
      {cashFlow.recurringPayments && cashFlow.recurringPayments.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-[#694F8E] mb-3">Recurring Payments</h3>
          <div className="space-y-2">
            {cashFlow.recurringPayments.map((payment, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{payment.description}</p>
                  <p className="text-sm text-gray-600">{payment.category} • {payment.frequency}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{toINR(payment.averageAmount)}</p>
                  <p className="text-xs text-gray-500">{payment.count} payments</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
                <li>Ensure the file is a valid bank statement (PDF, Excel, CSV, JSON)</li>
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
              <h2 className="text-2xl font-bold text-gray-900">Universal Financial Statement Generator</h2>
              <p className="text-gray-600">Works with ALL bank statements - HDFC, ICICI, SBI, Axis, Kotak, and more</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasPaid && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                <CheckCircle size={16} />
                <span className="text-sm font-medium">Premium Active</span>
              </div>
            )}
            <Link 
              to="/help" 
              className="p-2 text-gray-500 hover:text-[#694F8E] transition-colors"
            >
              <HelpCircle size={20} />
            </Link>
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
            <p className="text-sm text-gray-500 mb-4">Supported: PDF, Excel, CSV, JSON (HDFC, ICICI, SBI, Axis, Kotak, etc.)</p>
            
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
              accept=".pdf,.xlsx,.xls,.csv,.json"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <button className="px-6 py-3 bg-gradient-to-r from-[#694F8E] to-[#8B5CF6] text-white rounded-lg hover:from-[#563C70] hover:to-[#7C3AED] transition-colors flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl">
              <Upload size={18} />
              Select Bank Statements
            </button>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-[#E8E1F2]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-[#694F8E]">Uploaded Files ({files.length})</h4>
                <button 
                  onClick={() => setFiles([])}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <X size={16} />
                  Clear All
                </button>
              </div>
              
              <div className="space-y-3">
                {files.map((file, index) => {
                  const isPdfFile = isPDF(file);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        {isPdfFile ? (
                          <FileText size={18} className="text-red-500" />
                        ) : file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls') ? (
                          <FileSpreadsheet size={18} className="text-green-500" />
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
                              PDF (Watermark Filtered)
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
                        <X size={20} />
                      </button>
                    </div>
                  );
                })}
              </div>
              
              {/* Process Buttons */}
              <div className="mt-6 flex flex-wrap gap-4">
                <button
                  onClick={() => processUploadedFiles(false)}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet size={20} />
                      {hasPaid ? 'Process Statements' : 'Process & Check Limits'}
                    </>
                  )}
                </button>
                
                {!hasPaid && (
                  <button
                    onClick={() => processUploadedFiles(true)}
                    disabled={loading}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Process Free Tier ({PAYMENT_CONFIG.freeTier.maxTransactions} transactions)
                  </button>
                )}
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
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === 'transactions' ? 'bg-[#694F8E] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                  onClick={() => setActiveTab('transactions')}
                >
                  <FileText size={16} />
                  All Transactions
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
                              {t.date ? t.date.toLocaleDateString() : 'N/A'}
                            </div>
                            <div className="font-medium text-gray-800 truncate">
                              {t.description}
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
                      <button 
                        className="text-sm text-[#694F8E] hover:underline"
                        onClick={() => setActiveTab('transactions')}
                      >
                        View all {transactions.length} transactions →
                      </button>
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
              
              {activeTab === 'transactions' && (
                <div className="bg-white rounded-xl shadow-md p-6 border border-[#E8E1F2]">
                  <h3 className="text-xl font-semibold text-[#694F8E] mb-6">All Transactions ({transactions.length})</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((t, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                              {t.date ? t.date.toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                              <div className="truncate" title={t.description}>
                                {t.description}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-green-600 font-medium">
                              {t.credit > 0 ? toINR(t.credit) : ''}
                            </td>
                            <td className="px-4 py-3 text-sm text-red-600 font-medium">
                              {t.debit > 0 ? toINR(t.debit) : ''}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {t.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {t.bank}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
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
                onClick={downloadPDFReport}
              >
                <Download size={18} />
                Download PDF Report
              </button>
              <button 
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors"
                onClick={() => {
                  setFiles([]);
                  setTransactions([]);
                  setFinancialMetrics(null);
                  setProcessingStats(null);
                  setActiveTab('overview');
                }}
              >
                <Upload size={18} />
                Analyze New File
              </button>
            </div>
            
            {/* Payment Notice for Free Tier */}
            {processingResult?.metadata?.isLimited && (
              <div className="mt-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertCircle size={24} className="text-amber-600" />
                  <div>
                    <h4 className="font-semibold text-amber-800">Free Tier Limit Reached</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      You've processed {PAYMENT_CONFIG.freeTier.maxTransactions} transactions. 
                      <button 
                        onClick={() => setShowPaymentWall(true)}
                        className="ml-2 text-purple-600 hover:text-purple-800 font-medium underline"
                      >
                        Upgrade to Premium for unlimited processing →
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <DematCTA />
          </div>
        )}
        
        {/* Payment Wall */}
        {showPaymentWall && (
          <PaymentWall
            onPaymentSuccess={handlePaymentSuccess}
            onSkip={() => {
              setShowPaymentWall(false);
              processUploadedFiles(true);
            }}
            transactionCount={processingResult?.metadata.totalTransactions || 
                             files.reduce((acc, file) => acc + (file.size > 0 ? 100 : 0), 0)}
          />
        )}
      </div>
    </div>
  );
}

export default FinancialDashboard;