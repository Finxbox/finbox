import PositionSizingCalculatorUI from "../components/ToolsLayout/PositionSizeUI";
import DematCTA from "../components/utility/DematCTA";
import Disclaimer from "../components/utility/Disclaimer";
import Seo from "../components/Seo";

const PositionSizeCalculator = () => {
  return (
    <>
      <Seo
        title="Position Size Calculator | Finxbox"
        description="The Finxbox Position Size Calculator helps traders manage risk effectively by determining optimal trade sizes based on capital, risk tolerance, and stop-loss levels."
        keywords="Position Size Calculator, trade size calculator, risk management, optimal position sizing, trading risk assessment, Finxbox trading tools, stock market position sizing, capital risk management, stop-loss calculation, trading consistency"
      />
      <PositionSizingCalculatorUI />
      <Disclaimer />
      <DematCTA />
    </>
  );
};

export default PositionSizeCalculator;
