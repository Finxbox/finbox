// TestPage.jsx - For verifying SEO setup
import Seo from './Seo';

const TestPage = () => {
  return (
    <>
      <Seo 
        title="Test Page | Finxbox"
        description="Test description"
      />
      
      <h1>Test Page Heading</h1>
      
      <div>
        <h2>Test Verification Points:</h2>
        <ul>
          <li>✅ One &lt;title&gt; tag</li>
          <li>✅ One meta description</li>
          <li>✅ One canonical URL</li>
          <li>✅ One H1 tag</li>
          <li>✅ Open Graph tags present</li>
        </ul>
      </div>
    </>
  );
};