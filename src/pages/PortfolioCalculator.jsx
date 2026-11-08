import PortfolioCalculatorComp from "../components/ToolsLayout/PortfolioCalculatorComp";
import DematCTA from "../components/utility/DematCTA";
import Disclaimer from "../components/utility/Disclaimer";
import Seo from "../components/Seo";

const PortfolioCalculator = () => {
  return (
    <>
      <Seo
        title="Portfolio Calculator | Finxbox"
        description="The Finxbox Portfolio Calculator helps investors optimize their asset allocation, diversify their portfolio, and manage risk effectively."
        keywords="Portfolio Calculator, asset allocation, portfolio optimization, investment diversification, risk management, Finxbox investment tools, stock market portfolio, financial planning, investment analysis, portfolio risk assessment"
      />
      <PortfolioCalculatorComp />
      <Disclaimer />
      <DematCTA />
    </>
  );
};

export default PortfolioCalculator;
