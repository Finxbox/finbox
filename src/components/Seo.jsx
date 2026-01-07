import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const BASE_URL = "https://finxbox.com";

const Seo = ({ title, description }) => {
  const robots = "index,follow";
  const { pathname } = useLocation();

  const canonicalUrl =
    pathname === "/"
      ? BASE_URL
      : `${BASE_URL}${pathname}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />

      {/* meta */}
      <meta name="meta:card" content="summary_large_image" />
      <meta name="meta:title" content={title} />
      <meta name="meta:description" content={description} />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
};

export default Seo;
