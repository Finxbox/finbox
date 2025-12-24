import PositionSizingCalculatorUI from "../components/ToolsLayout/PositionSizeUI";
import DematCTA from "../components/utility/DematCTA";
import Disclaimer from "../components/utility/Disclaimer";

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
