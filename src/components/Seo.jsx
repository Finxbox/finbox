import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const BASE_URL = "https://finxbox.com"; // Use www. for consistency

const Seo = ({ 
  title, 
  description, 
  canonicalPath, // Optional: for overriding or special cases
  noIndex = false // Optional: for preventing indexing
}) => {
  const { pathname, search } = useLocation(); // Added search for query params
  
  // Handle trailing slashes consistently
  const cleanPathname = pathname.endsWith('/') && pathname !== '/' 
    ? pathname.slice(0, -1) 
    : pathname;
  
  // Build canonical: use custom path OR auto-generate from current path
  let canonicalUrl;
  
  if (canonicalPath) {
    // Use custom canonical path if provided
    canonicalUrl = `${BASE_URL}${canonicalPath}`;
  } else {
    // Auto-generate: Remove query params for cleaner canonical
    canonicalUrl = cleanPathname === "/"
      ? BASE_URL
      : `${BASE_URL}${cleanPathname}`;
  }

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Optional: Add noindex for specific pages */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Recommended: Open Graph tags for social sharing */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      
      {/* Recommended: Twitter Card tags */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default Seo;