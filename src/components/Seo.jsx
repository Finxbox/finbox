import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const BASE_URL = "https://finxbox.com";

const Seo = ({ title, description }) => {
  const { pathname } = useLocation();

  const canonicalUrl =
    pathname === "/"
      ? BASE_URL
      : `${BASE_URL}${pathname}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
};

export default Seo;
