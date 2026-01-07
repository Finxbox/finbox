import StoreComp from "../components/StoreLayout/StoreComp";
import DematCTA from "../components/utility/DematCTA";
import Seo from "../components/Seo";
function Store() {
  return (
    <div>
      <StoreComp /><DematCTA />
    </div>
  );
}

export default Store;

{/* ================= SEO CONTENT – STORE PAGE ================= */}

<section className="max-w-6xl mx-auto px-6 py-20 text-gray-700">
  <Seo 
    title="Finxbox Store | Curated Trading Books for Market Clarity"
    description="Explore the Finxbox Store for a curated selection of trading and stock market books designed to enhance your market understanding and trading skills."
  />  
  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
    Curated Trading Books for Market Clarity
  </h2>

  <p className="mb-6 max-w-4xl">
    The Finxbox Store features a curated selection of trading and stock
    market books that focus on real-world market understanding. These
    books are chosen to help traders and investors improve technical
    analysis skills, understand price behavior, and develop a disciplined
    trading mindset.
  </p>

  <p className="mb-6 max-w-4xl">
    From price action trading and chart patterns to trading psychology
    and breakout strategies, these books cover essential concepts that
    every trader should understand. Whether you are a beginner or an
    experienced trader, learning from proven market literature helps
    build long-term confidence and consistency.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
    Why Learn from Trading Books?
  </h2>

  <p className="mb-6 max-w-4xl">
    Trading books provide structured insights that are often missing from
    short-term content. They help traders understand how markets behave,
    how successful traders think, and how to manage emotions during
    volatile conditions. Consistent learning is a key component of
    long-term success in trading and investing.
  </p>

  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
    Finxbox Recommendations
  </h2>

  <p className="max-w-4xl">
    All books listed in the Finxbox Store are recommended based on
    practical relevance and educational value. These resources complement
    Finxbox tools and courses by strengthening foundational knowledge and
    improving decision-making skills in real market scenarios.
  </p>

</section>

