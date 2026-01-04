// CategorizationService.js - Complete categorization service

// Configuration Constants
const CATEGORY_KEYWORDS = {
  // Income Categories
  'Salary': {
    priority: 3,
    keywords: ['payroll', 'salary', 'wages', 'direct deposit', 'employer'],
    regexPatterns: ['^dd\\s+.*payroll', 'salary\\s+deposit'],
    amountPatterns: [{ min: 1000, max: 100000000 }]
  },
  'incentive': {
    priority: 3,
    keywords: ['bonus', 'reward', 'incentive', 'petrol allowance', 'car allowance'],
    regexPatterns: ['^dd\\s+.*payroll', 'salary\\s+deposit'],
    amountPatterns: [{ min: 1000, max: 100000000 }]
  },
  'Freelance Income': {
    priority: 3,
    keywords: ['freelance', 'contract', 'consulting', 'invoice', '1099'],
    amountPatterns: [{ min: 100, max: 100000000}]
  },
  'Investment Income': {
    priority: 2,
    keywords: ['dividend', 'interest income', 'capital gain', 'investment'],
    amountPatterns: [{ min: 10, max: 100000000 }]
  },
  'Other Income': {
    priority: 1,
    keywords: ['refund', 'reimbursement', 'cashback', 'reward'],
    amountPatterns: [{ max: 50, max: 1000000 }]
  },
  
  // Expense Categories
  'Housing': {
    priority: 3,
    keywords: ['rent', 'mortgage', 'property tax', 'hoa', 'home insurance'],
    amountPatterns: [{ min: 500 }]
  },
  'Utilities': {
    priority: 3,
    keywords: ['electric', 'gas bill', 'water bill', 'internet', 'cable', 'phone bill'],
    subcategories: {
      'Electricity': ['electric', 'power', 'light bill'],
      'Internet/Cable': ['internet', 'cable', 'wifi', 'comcast'],
      'Phone': ['verizon', 'at&t', 't-mobile', 'phone bill']
    }
  },
  'Groceries': {
    priority: 3,
    keywords: ['grocery', 'supermarket', 'foods', 'market', 'aldi', 'kroger', 'walmart', 'target'],
    exclusions: ['pharmacy', 'pharmaceutical'],
    minAmount: 5,
    maxAmount: 500,
    subcategories: {
      'Supermarket': ['kroger', 'safeway', 'publix', 'whole foods'],
      'Discount Store': ['aldi', 'lidl', 'walmart grocery']
    }
  },
  'Dining': {
    priority: 3,
    keywords: ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'fast food', 'pizza', 'diner'],
    maxAmount: 2000000,
    subcategories: {
      'Coffee Shop': ['starbucks', 'dunkin', 'coffee', 'cafe'],
      'Fast Food': ['mcdonald', 'burger king', 'taco bell', 'wendy', 'fast food'],
      'Restaurant': ['restaurant', 'grill', 'steakhouse', 'bistro']
    }
  },
  'Transportation': {
    priority: 2,
    keywords: ['gas', 'fuel', 'exxon', 'shell', 'uber', 'lyft', 'taxi', 'parking', 'toll', 'car payment'],
    subcategories: {
      'Fuel': ['gas', 'fuel', 'exxon', 'shell', 'chevron'],
      'Ride Share': ['uber', 'lyft'],
      'Public Transit': ['metro', 'bus', 'train', 'subway'],
      'Car Payment': ['car payment', 'auto loan']
    }
  },
  'Entertainment': {
    priority: 2,
    keywords: ['netflix', 'spotify', 'disney+', 'hulu', 'movie', 'concert', 'game', 'streaming'],
    maxAmount: 2000000,
    subcategories: {
      'Streaming': ['netflix', 'hulu', 'disney+', 'prime video'],
      'Music': ['spotify', 'apple music', 'pandora'],
      'Events': ['concert', 'movie theater', 'ticketmaster']
    }
  },
  'Shopping': {
    priority: 2,
    keywords: ['amazon', 'walmart', 'target', 'best buy', 'apple.com', 'clothing', 'store', 'purchase'],
    subcategories: {
      'Online Shopping': ['amazon.com', 'ebay', 'etsy', 'online order'],
      'Electronics': ['best buy', 'apple.com', 'microcenter', 'electronics'],
      'Clothing': ['nike', 'adidas', 'gap', 'old navy', 'clothing']
    }
  },
  'Healthcare': {
    priority: 3,
    keywords: ['pharmacy', 'cvs', 'walgreens', 'medical', 'doctor', 'hospital', 'insurance'],
    subcategories: {
      'Pharmacy': ['cvs', 'walgreens', 'rite aid', 'pharmacy'],
      'Medical': ['doctor', 'hospital', 'clinic', 'medical']
    }
  },
  'Personal Care': {
    priority: 2,
    keywords: ['haircut', 'salon', 'spa', 'gym', 'fitness', 'yoga'],
    maxAmount: 15000000
  },
  'Education': {
    priority: 2,
    keywords: ['tuition', 'textbook', 'course', 'udemy', 'coursera'],
    amountPatterns: [{ min: 50, max: 100000000 }]
  },
  'Travel': {
    priority: 2,
    keywords: ['airline', 'hotel', 'airbnb', 'vacation', 'flight'],
    amountPatterns: [{ min: 200, max: 1000000 }]
  },
  'Gifts/Donations': {
    priority: 2,
    keywords: ['donation', 'charity', 'gift', 'present', 'birthday'],
    maxAmount: 50000000
  },
  'Business Expenses': {
    priority: 2,
    keywords: ['office', 'supplies', 'business', 'corporate', 'work related'],
    amountPatterns: [{ min: 20, max: 1000000 }]
  },
  'Other Expenses': {
    priority: 1,
    keywords: ['fee', 'charge', 'miscellaneous', 'other'],
    default: true
  }
};

const TRANSFER_KEYWORDS = [
  'transfer',
  'xfr',
  'to savings',
  'from checking',
  'ach transfer',
  'zelle',
  'venmo',
  'paypal',
  'mobile transfer',
  'wire transfer',
  'between accounts'
];

const IGNORE_KEYWORDS = [
  'balance',
  'interest paid',
  'service charge',
  'atm fee',
  'bank fee',
  'opening balance',
  'closing balance',
  'previous balance',
  'current balance',
  'balance forward'
];

const MERCHANT_MAPPINGS = {
  'netflix': 'Entertainment',
  'spotify': 'Entertainment',
  'hulu': 'Entertainment',
  'amazon prime': 'Entertainment',
  'disney+': 'Entertainment',
  'starbucks': 'Dining',
  'mcdonald\'s': 'Dining',
  'uber': 'Transportation',
  'lyft': 'Transportation',
  'exxon': 'Transportation',
  'shell': 'Transportation',
  'whole foods': 'Groceries',
  'trader joe\'s': 'Groceries',
  'kroger': 'Groceries',
  'walmart': 'Shopping',
  'target': 'Shopping',
  'best buy': 'Shopping',
  'apple.com': 'Shopping',
  'amazon.com': 'Shopping',
  'cvs': 'Healthcare',
  'walgreens': 'Healthcare',
  'planet fitness': 'Personal Care',
  'la fitness': 'Personal Care'
};

// Category Constants
const CategoryRules = {
  UNCATEGORIZED: 'Uncategorized',
  IGNORE_CATEGORY: 'Balance/Header',
  TRANSFER_CATEGORY: 'Transfers'
};

const CategoryPriority = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};

const CategoryGroups = {
  INCOME: ['Salary', 'Freelance Income', 'INCENTIVE Income', 'Investment Income', 'Other Income'],
  EXPENSES: ['Housing', 'Utilities', 'Groceries', 'Dining', 'Transportation', 'Entertainment', 'Shopping', 'Healthcare', 'Personal Care', 'Education', 'Travel', 'Gifts/Donations', 'Business Expenses', 'Other Expenses'],
  SAVINGS: ['Savings', 'Investments'],
  TRANSFERS: ['Transfers']
};

export class CategorizationService {
  /**
   * Main categorization method
   * @param {string} description - Transaction description
   * @param {string} type - Transaction type (INCOME/EXPENSE)
   * @param {number} credit - Credit amount
   * @param {number} debit - Debit amount
   * @param {number} amount - Absolute amount (optional)
   * @param {string} merchant - Merchant name (optional)
   * @returns {string} Category name
   */
  static categorizeTransaction(description, type, credit, debit, amount = 0, merchant = null) {
    if (!description) return CategoryRules.UNCATEGORIZED;
    
    const desc = description.toLowerCase().trim();
    const normalizedDesc = this.normalizeDescription(desc);
    const absoluteAmount = amount || Math.abs(credit - debit);
    
    // 1. Check ignore patterns first
    if (this.shouldIgnoreTransaction(normalizedDesc)) {
      return CategoryRules.IGNORE_CATEGORY;
    }
    
    // 2. Check for transfers between accounts
    if (this.isTransferTransaction(normalizedDesc)) {
      return CategoryRules.TRANSFER_CATEGORY;
    }
    
    // 3. Check merchant-specific mappings (highest priority)
    const merchantCategory = this.checkMerchantCategory(merchant, normalizedDesc);
    if (merchantCategory) return merchantCategory;
    
    // 4. Check detailed category patterns with priority system
    const category = this.findCategoryByPatterns(normalizedDesc, absoluteAmount);
    if (category && category !== CategoryRules.UNCATEGORIZED) {
      return category;
    }
    
    // 5. Intelligent fallback based on transaction context
    return this.getFallbackCategory(type, credit, debit, absoluteAmount);
  }
  
  /**
   * Normalize transaction description for better matching
   * @param {string} description - Raw description
   * @returns {string} Normalized description
   */
  static normalizeDescription(description) {
    if (!description) return '';
    
    return description
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/^pos\s*/i, '')
      .replace(/^debit\s+card\s*/i, '')
      .replace(/^credit\s+card\s*/i, '')
      .replace(/^ach\s*/i, '')
      .replace(/^purchase\s*/i, '')
      .replace(/pmt\s*/g, 'payment ')
      .replace(/txn\s*/g, 'transaction ')
      .replace(/xfr\s*/g, 'transfer ')
      .replace(/#[\d]+/g, '') // Remove reference numbers
      .replace(/\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/g, 'card') // Remove card numbers
      .replace(/\.{2,}/g, ' ') // Remove multiple dots
      .trim();
  }
  
  /**
   * Find category by analyzing patterns and keywords
   * @param {string} description - Normalized description
   * @param {number} amount - Transaction amount
   * @returns {string|null} Best matching category
   */
  static findCategoryByPatterns(description, amount = 0) {
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [category, config] of Object.entries(CATEGORY_KEYWORDS)) {
      const score = this.calculateCategoryScore(description, config, amount);
      
      // Check amount constraints
      if (config.minAmount && amount < config.minAmount) continue;
      if (config.maxAmount && amount > config.maxAmount) continue;
      
      // Check exclusions
      if (config.exclusions) {
        const hasExclusion = config.exclusions.some(exclusion => 
          description.includes(exclusion.toLowerCase())
        );
        if (hasExclusion) continue;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = category;
      } else if (score === bestScore && bestMatch) {
        // Tie-breaker: higher priority wins
        const currentPriority = config.priority || CategoryPriority.MEDIUM;
        const bestPriority = CATEGORY_KEYWORDS[bestMatch]?.priority || CategoryPriority.MEDIUM;
        if (currentPriority > bestPriority) {
          bestMatch = category;
        }
      }
    }
    
    // Only return if score is above threshold
    return bestScore > 0.5 ? bestMatch : null;
  }
  
  /**
   * Calculate category match score
   * @param {string} description - Normalized description
   * @param {object} config - Category configuration
   * @param {number} amount - Transaction amount
   * @returns {number} Score (higher is better)
   */
  static calculateCategoryScore(description, config, amount) {
    let score = 0;
    
    // Check keywords
    if (config.keywords) {
      config.keywords.forEach(keyword => {
        if (description.includes(keyword.toLowerCase())) {
          score += 1;
        }
      });
    }
    
    // Check regex patterns (more specific matches)
    if (config.regexPatterns) {
      config.regexPatterns.forEach(pattern => {
        try {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(description)) {
            score += 2; // Regex matches are more valuable
          }
        } catch (e) {
          console.warn(`Invalid regex pattern: ${pattern}`);
        }
      });
    }
    
    // Check amount-based patterns
    if (config.amountPatterns) {
      config.amountPatterns.forEach(pattern => {
        const { min, max, multiplier = 1 } = pattern;
        if ((!min || amount >= min) && (!max || amount <= max)) {
          score += multiplier;
        }
      });
    }
    
    // Boost score for high priority categories
    const priority = config.priority || CategoryPriority.MEDIUM;
    score += (priority - 1) * 0.5; // Add 0.5 per priority level
    
    return score;
  }
  
  /**
   * Check merchant-specific category mappings
   * @param {string} merchant - Merchant name
   * @param {string} description - Transaction description
   * @returns {string|null} Category if merchant matches
   */
  static checkMerchantCategory(merchant, description) {
    if (!merchant) return null;
    
    const merchantKey = merchant.toLowerCase().trim();
    
    // Direct merchant mapping
    if (MERCHANT_MAPPINGS[merchantKey]) {
      return MERCHANT_MAPPINGS[merchantKey];
    }
    
    // Check merchant name in description (fuzzy match)
    for (const [merchantPattern, category] of Object.entries(MERCHANT_MAPPINGS)) {
      if (description.includes(merchantPattern.toLowerCase()) || 
          merchantKey.includes(merchantPattern.toLowerCase())) {
        return category;
      }
    }
    
    return null;
  }
  
  /**
   * Get fallback category when no patterns match
   * @param {string} type - Transaction type
   * @param {number} credit - Credit amount
   * @param {number} debit - Debit amount
   * @param {number} amount - Absolute amount
   * @returns {string} Fallback category
   */
  static getFallbackCategory(type, credit, debit, amount) {
    const isIncome = type === 'INCOME' || credit > 0;
    const isExpense = type === 'EXPENSE' || debit > 0;
    
    if (isIncome) {
      if (amount >= 2000) return 'Salary';
      if (amount >= 500) return 'Other Income';
      if (amount >= 50) return 'Small Income';
      return 'Miscellaneous Income';
    }
    
    if (isExpense) {
      if (amount >= 1000) return 'Major Expense';
      if (amount >= 100) return 'General Expense';
      if (amount >= 20) return 'Small Purchase';
      return 'Minor Expense';
    }
    
    // For transfers or ambiguous transactions
    if (Math.abs(credit - debit) < 0.01) {
      return CategoryRules.TRANSFER_CATEGORY;
    }
    
    return CategoryRules.UNCATEGORIZED;
  }
  
  /**
   * Check if transaction is a transfer
   * @param {string} description - Transaction description
   * @returns {boolean} True if transfer
   */
  static isTransferTransaction(description) {
    if (!description) return false;
    const desc = this.normalizeDescription(description);
    
    // Check transfer keywords
    if (TRANSFER_KEYWORDS.some(keyword => desc.includes(keyword))) {
      return true;
    }
    
    // Check for common transfer patterns
    const transferRegex = /(to|from)\s+(savings|checking|account|transfer|paypal|venmo|zelle)/i;
    return transferRegex.test(desc);
  }
  
  /**
   * Check if transaction should be ignored
   * @param {string} description - Transaction description
   * @returns {boolean} True if should be ignored
   */
  static shouldIgnoreTransaction(description) {
    if (!description) return false;
    const desc = this.normalizeDescription(description);
    
    // Check ignore keywords
    if (IGNORE_KEYWORDS.some(keyword => desc.includes(keyword))) {
      return true;
    }
    
    // Check for header/balance patterns
    const ignorePatterns = [
      /opening\s+balance/i,
      /closing\s+balance/i,
      /previous\s+balance/i,
      /current\s+balance/i,
      /balance\s+brought\s+forward/i,
      /statement\s+period/i,
      /as\s+of\s+\d{2}\/\d{2}\/\d{4}/i,
      /^\*\*\*\d{4}$/, // Masked account numbers
      /beginning\s+balance/i,
      /ending\s+balance/i
    ];
    
    return ignorePatterns.some(pattern => pattern.test(desc));
  }
  
  /**
   * Get subcategory if available
   * @param {string} category - Main category
   * @param {string} description - Transaction description
   * @returns {string|null} Subcategory name
   */
  static getSubcategory(category, description) {
    if (!category || !description) return null;
    
    const config = CATEGORY_KEYWORDS[category];
    if (!config || !config.subcategories) return null;
    
    const desc = description.toLowerCase();
    
    for (const [subcategory, keywords] of Object.entries(config.subcategories)) {
      if (keywords.some(keyword => desc.includes(keyword.toLowerCase()))) {
        return subcategory;
      }
    }
    
    return null;
  }
  
  /**
   * Get category group
   * @param {string} category - Category name
   * @returns {string} Group name
   */
  static getCategoryGroup(category) {
    for (const [group, categories] of Object.entries(CategoryGroups)) {
      if (categories.includes(category)) {
        return group;
      }
    }
    
    if (category === CategoryRules.TRANSFER_CATEGORY) return 'TRANSFERS';
    if (category === CategoryRules.IGNORE_CATEGORY) return 'IGNORED';
    return 'OTHER';
  }
  
  /**
   * Get all possible categories with confidence scores
   * @param {string} description - Transaction description
   * @param {number} amount - Transaction amount
   * @returns {Array} Array of suggestions with scores
   */
  static getCategorySuggestions(description, amount = 0) {
    if (!description) return [];
    
    const desc = this.normalizeDescription(description);
    const suggestions = [];
    
    for (const [category, config] of Object.entries(CATEGORY_KEYWORDS)) {
      const score = this.calculateCategoryScore(desc, config, amount);
      if (score > 0) {
        suggestions.push({
          category,
          score,
          priority: config.priority || CategoryPriority.MEDIUM,
          confidence: Math.min(100, Math.round((score / 5) * 100))
        });
      }
    }
    
    return suggestions
      .sort((a, b) => {
        // Sort by score (desc), then priority (desc)
        if (b.score !== a.score) return b.score - a.score;
        return b.priority - a.priority;
      })
      .slice(0, 5); // Return top 5 suggestions
  }
  
  /**
   * Get all available categories
   * @returns {Array} Array of category names
   */
  static getAllCategories() {
    return Object.keys(CATEGORY_KEYWORDS);
  }
  
  /**
   * Get categories by group
   * @param {string} group - Group name (INCOME, EXPENSES, etc.)
   * @returns {Array} Array of categories in group
   */
  static getCategoriesByGroup(group) {
    return CategoryGroups[group] || [];
  }
  
  /**
   * Add custom category mapping
   * @param {string} keyword - Keyword to match
   * @param {string} category - Category to assign
   * @param {number} priority - Priority level (1-3)
   */
  static addCustomMapping(keyword, category, priority = 2) {
    if (!CATEGORY_KEYWORDS[category]) {
      CATEGORY_KEYWORDS[category] = {
        priority,
        keywords: [keyword.toLowerCase()]
      };
    } else {
      if (!CATEGORY_KEYWORDS[category].keywords) {
        CATEGORY_KEYWORDS[category].keywords = [];
      }
      CATEGORY_KEYWORDS[category].keywords.push(keyword.toLowerCase());
    }
  }
  
  /**
   * Check if category exists
   * @param {string} category - Category name
   * @returns {boolean} True if category exists
   */
  static isValidCategory(category) {
    return Object.keys(CATEGORY_KEYWORDS).includes(category) || 
           Object.values(CategoryRules).includes(category);
  }
}