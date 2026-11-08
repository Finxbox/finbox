import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://finxbox.com";

const Seo = ({
  title = "Finxbox – Financial Tools & Premium Software",
  description = "Finxbox provides financial tools, calculators, and premium software features for traders and investors.",
  robots = "index, follow",
  keywords,
}) => {
  const location = useLocation();

  // Automatically build canonical URL
  const canonicalUrl = `${SITE_URL}${location.pathname}`;

  return (
    <Helmet>
      <title>{title}</title>

      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />

      {/* AUTO CANONICAL */}
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
};

export default Seo;
