// constants/seo-config.js
export const SEO_CONFIG = {
  // Trading Journal Page
  TRADING_JOURNAL: {
    title: "Trading Journal Tool for Consistent Traders | Finxbox",
    description: "Track trades, manage risk, and improve consistency with the Finxbox Trading Journal. Analyze performance, psychology, and execution in one place.",
    keywords: "trading journal, trading journal tool, trade tracking software, trading diary, risk management trading",
    canonicalPath: "/trading-journal",
    h1: "Trading Journal Tool Built for Serious Traders",
    schemaType: "SoftwareApplication"
  },
  
  // Home Page
  HOME: {
    title: "Finxbox – Smart Financial Tools for Traders & Investors in India",
    description: "Finxbox helps Indian traders and investors make better decisions using portfolio calculators, position sizing tools, financial analysis, and structured market education.",
    canonicalPath: "/",
    h1: "Smart Financial Tools for Traders and Investors in India"
  },
  
  // Portfolio Calculator
  PORTFOLIO_CALCULATOR: {
    title: "Portfolio Calculator to Track Returns & Risk | Finxbox",
    description: "Calculate portfolio performance, allocation, and risk with Finxbox's portfolio calculator. Make data-driven investment decisions.",
    canonicalPath: "/portfolio-calculator",
    h1: "Portfolio Calculator for Smarter Investment Decisions"
  },
  
  // Position Size Calculator
  POSITION_SIZE_CALCULATOR: {
    title: "Position Size Calculator for Risk Management | Finxbox",
    description: "Plan your trades with precision using a position size calculator. Control risk and protect capital before entering a trade.",
    canonicalPath: "/position-size-calculator",
    h1: "Position Size Calculator for Risk-Controlled Trading"
  },
  
  // Financial Statement Generator
  FINANCIAL_STATEMENT: {
    title: "Financial Statement Generator for Traders | Finxbox",
    description: "Generate and analyze financial statements easily to understand performance, profits, and risk. Built for traders and investors in India.",
    canonicalPath: "/financial-statement-generator",
    h1: "Financial Statement Generator for Traders and Investors"
  },
  
  // Store Page
  STORE: {
    title: "Best Trading & Investing Books for Market Success | Finxbox",
    description: "Discover recommended trading and investing books to improve price action skills, discipline, and market understanding.",
    canonicalPath: "/store",
    h1: "Recommended Trading and Investing Books"
  },
  
  // Courses Page
  COURSES: {
    title: "Trading Courses for Beginners & Traders | Finxbox",
    description: "Explore structured trading and investing courses covering price action, volume analysis, and stock market fundamentals.",
    canonicalPath: "/course",
    h1: "Trading and Investing Courses by Expert Mentors"
  },
  
  // Contact Page
  CONTACT: {
    title: "Contact Finxbox – Get Support & Business Enquiries",
    description: "Contact Finxbox for support, feedback, partnerships, or business enquiries related to financial tools and education.",
    canonicalPath: "/contact-us",
    h1: "Contact Finxbox"
  },
  
  // Legal Pages
  PRIVACY_POLICY: {
    title: "Privacy Policy | Finxbox",
    description: "Read Finxbox's privacy policy to understand how user data is handled, protected, and respected across our platform.",
    canonicalPath: "/privacy-policy",
    h1: "Privacy Policy"
  },
  
  TERMS: {
    title: "Terms and Conditions | Finxbox",
    description: "Review the terms and conditions governing the use of Finxbox financial tools, content, and services.",
    canonicalPath: "/terms-and-conditions",
    h1: "Terms and Conditions"
  },
  
  COOKIE_POLICY: {
    title: "Cookie Policy | Finxbox",
    description: "Learn how Finxbox uses cookies to improve user experience, analytics, and website performance.",
    canonicalPath: "/cookie-policy",
    h1: "Cookie Policy"
  }
};

// Helper function for dynamic pages (like course pages)
export const getCourseSeo = (course) => ({
  title: `${course.title} | Trading Course by ${course.mentor} – Finxbox`,
  description: course.shortDescription,
  canonicalPath: `/course/${course.slug}`,
  h1: course.title
});