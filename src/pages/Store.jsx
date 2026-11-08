import StoreComp from "../components/StoreLayout/StoreComp";
import DematCTA from "../components/utility/DematCTA";
import Seo from "../components/Seo";
function Store() {
  return (
    <div>
      <Seo
        title="Finxbox Store | Curated Trading Books for Market Clarity"
        description="Explore the Finxbox Store for a curated selection of trading and stock market books designed to enhance your market understanding and trading skills."
      />
      <StoreComp /><DematCTA />
    </div>
  );
}

export default Store;

