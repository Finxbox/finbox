import PositionSizingCalculatorUI from "../components/ToolsLayout/PositionSizeUI";
import DematCTA from "../components/utility/DematCTA";
import Disclaimer from "../components/utility/Disclaimer";
import Seo from "../components/Seo";

/* ================= SEO CONTENT – POSITION SIZE CALCULATOR PAGE ================= */   
<section className="max-w-5xl mx-auto px-6 py-16 text-gray-700">
  <Seo
    title="Position Size Calculator | Finxbox"
    description="The Finxbox Position Size Calculator helps traders manage risk effectively by determining optimal trade sizes based on capital, risk tolerance, and stop-loss levels."
  />  
    <meta name="keywords" content="Position Size Calculator, trade size calculator, risk management, optimal position sizing, trading risk assessment, Finxbox trading tools, stock market position sizing, capital risk management, stop-loss calculation, trading consistency" />
    <meta name="robots" content="index, follow" />
  <h1 className="text-3xl font-bold text-gray-900 mb-6">
    Position Size Calculator: Manage Your Trade Risk
  </h1> 
  <h2 className="text-2xl font-semibold mb-4">
    Risk-Based Position Sizing
  </h2>
  <p>
    Position sizing is a critical part of risk management. This calculator
    helps traders determine the appropriate trade size based on capital,
    risk tolerance, and stop-loss levels.
  </p>
</section>


const PositionSizeCalculator = () => {
  return (
    <>
      <PositionSizingCalculatorUI />
      <Disclaimer />
      <DematCTA />
    </>
  );
};

export default PositionSizeCalculator;
