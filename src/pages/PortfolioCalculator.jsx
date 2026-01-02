import PortfolioCalculatorComp from "../components/ToolsLayout/PortfolioCalculatorComp";
import DematCTA from "../components/utility/DematCTA";
import Disclaimer from "../components/utility/Disclaimer";
import Seo from "../components/Seo";

/* ================= SEO CONTENT – PORTFOLIO CALCULATOR PAGE ================= */
<section className="max-w-5xl mx-auto px-6 py-16 text-gray-700">
  <h2 className="text-2xl font-semibold mb-4">
    Calculate and Optimize Your Portfolio
  </h2>
  <p>
    The Finxbox Portfolio Calculator allows investors to evaluate asset
    allocation, understand diversification, and manage portfolio risk
    effectively. It is designed to support informed investment decisions.
  </p>
</section>


const PortfolioCalculator = () => {
  return (
    <>
      <PortfolioCalculatorComp />
      <Disclaimer />
      <DematCTA />
    </>
  );
};

export default PortfolioCalculator;
