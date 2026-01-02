import PositionSizingCalculatorUI from "../components/ToolsLayout/PositionSizeUI";
import DematCTA from "../components/utility/DematCTA";
import Disclaimer from "../components/utility/Disclaimer";
import Seo from "../components/Seo";

/* ================= SEO CONTENT – POSITION SIZE CALCULATOR PAGE ================= */   
<section className="max-w-5xl mx-auto px-6 py-16 text-gray-700">
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
