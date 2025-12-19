import Hero from "../components/ToolsLayout/Hero/Hero";
import StatsCard from "../components/ToolsLayout/Stats";

const Home = () => {
  return (
    <>
      {/* Only render the content for the home page */}
      <Hero />
      <StatsCard />
    </>
  );
};

export default Home;
