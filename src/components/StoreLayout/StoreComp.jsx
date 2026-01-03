import Ads from "../ADS/Ads";

const StoreComp = () => {
  const searchResult = {
    Items: [
      {
        ASIN: "8195261612",
        DetailPageURL:
          "https://www.amazon.in/dp/8195261612?tag=intickbox-21&linkCode=osi&th=1&psc=1",
        Images: {
          Primary: {
            Medium: {
              Height: 160,
              URL: "https://m.media-amazon.com/images/I/41qvZ6k7xFS._SL160_.jpg",
              Width: 104,
            },
          },
        },
        ItemInfo: {
          Title: {
            DisplayValue:
              "Price Action Trading: Technical Analysis Simplified! by Sunil Gurjar (Chartmojo) - Chart Patterns | Candlestick Patterns | Breakout Patterns & Lot More!",
            Label: "Title",
            Locale: "en_IN",
          },
        },
      },
      {
        ASIN: "B09Z85R4SW",
        DetailPageURL:
          "https://www.amazon.in/dp/B09Z85R4SW?tag=intickbox-21&linkCode=osi&th=1&psc=1",
        Images: {
          Primary: {
            Medium: {
              Height: 160,
              URL: "https://m.media-amazon.com/images/I/51ChBQf1eML._SL160_.jpg",
              Width: 160,
            },
          },
        },
        ItemInfo: {
          Title: {
            DisplayValue:
              "Trading Chart Pattern Books | Includes Breakout Pattern Candlestick Pattern And Indicators | Stock Market Books For Beginners (Pocket Study)",
            Label: "Title",
            Locale: "en_IN",
          },
        },
      },
      {
        ASIN: "0593538447",
        DetailPageURL:
          "https://www.amazon.in/dp/0593538447?tag=intickbox-21&linkCode=osi&th=1&psc=1",
        Images: {
          Primary: {
            Medium: {
              Height: 160,
              URL: "https://m.media-amazon.com/images/I/41svsSWhq7L._SL160_.jpg",
              Width: 103,
            },
          },
        },
        ItemInfo: {
          Title: {
            DisplayValue: "Trading in the Zone",
            Label: "Title",
            Locale: "en_IN",
          },
        },
      },
      {
        ASIN: "8119153987",
        DetailPageURL:
          "https://www.amazon.in/dp/8119153987?tag=intickbox-21&linkCode=osi&th=1&psc=1",
        Images: {
          Primary: {
            Medium: {
              Height: 160,
              URL: "https://m.media-amazon.com/images/I/41adLWoDmHL._SL160_.jpg",
              Width: 103,
            },
          },
        },
        ItemInfo: {
          Title: {
            DisplayValue:
              "Breakout Trading Made Easy: Maximize Your Profits with Simple Price Action Strategies",
            Label: "Title",
            Locale: "en_IN",
          },
        },
      },
      {
        ASIN: "8196373570",
        DetailPageURL:
          "https://www.amazon.in/dp/8196373570?tag=intickbox-21&linkCode=osi&th=1&psc=1",
        Images: {
          Primary: {
            Medium: {
              Height: 160,
              URL: "https://m.media-amazon.com/images/I/51PtDp+ovtL._SL160_.jpg",
              Width: 114,
            },
          },
        },
        ItemInfo: {
          Title: {
            DisplayValue:
              "51 Trading Strategies - Optimize Your Trades with 51 Time-tested Strategies by Aseem Singhal | Zebralearn | 7 Categories of Trading Strategies | Technical Analysis | Zebra Learn",
            Label: "Title",
            Locale: "en_IN",
          },
        },
      },
      {
        ASIN: "9355439016",
        DetailPageURL:
          "https://www.amazon.in/dp/9355439016?tag=intickbox-21&linkCode=osi&th=1&psc=1",
        Images: {
          Primary: {
            Medium: {
              Height: 160,
              URL: "https://m.media-amazon.com/images/I/419xyJLMRaL._SL160_.jpg",
              Width: 104,
            },
          },
        },
        ItemInfo: {
          Title: {
            DisplayValue:
              "The Subtle Art of Intraday Trading: A Complete Handbook on How to Make Quick Profit from Day Trading in Stocks (English)",
            Label: "Title",
            Locale: "en_IN",
          },
        },
      },
      {
        ASIN: "9348098845",
        DetailPageURL:
          "https://www.amazon.in/dp/9348098845?tag=intickbox-21&linkCode=osi&th=1&psc=1",
        Images: {
          Primary: {
            Medium: {
              Height: 160,
              URL: "https://m.media-amazon.com/images/I/51i7Qv3xMOL._SL160_.jpg",
              Width: 103,
            },
          },
        },
        ItemInfo: {
          Title: {
            DisplayValue:
              "Swing Trading: Simple Yet Powerful Techniques for Consistent Success in the Markets",
            Label: "Title",
            Locale: "en_IN",
          },
        },
      },
    ],
    SearchURL:
      "https://www.amazon.in/s?k=trading+books&rh=p_n_availability%3A1318484031&tag=intickbox-21&linkCode=osi",
    TotalResultCount: 306,
  };

  return (
    <div>
      <div>
        <Ads />
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-10">
        {searchResult.Items.map((item) => (
          <li
            key={item.ASIN}
            className="border p-4 rounded-lg shadow-lg flex flex-col justify-between"
          >
            <a
              href={item.DetailPageURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center flex flex-col justify-between h-full"
              onClick={() => {
    window.gtag?.("event", "buy_on_amazon_click", {
      event_category: "affiliate",
      event_label: item.ItemInfo.Title.DisplayValue,
      page_path: window.location.pathname,
    });
  }}
            >
              <img
                src={item.Images.Primary.Medium.URL}
                alt={item.ItemInfo.Title.DisplayValue}
                className="w-7/12 h-auto mb-4 rounded-md mx-auto"
              />

              <p className="text-sm font-semibold text-gray-900 mt-auto">
                {item.ItemInfo.Title.DisplayValue}
              </p>

              <button className=" px-2 mt-10 bg-[#FF9900] text-white border-2 text-md font-bold hover:bg-white hover:text-[#ff9900] hover:border-2 rounded-lg py-2">
                Buy on Amazon
              </button>
            </a>
          </li>
        ))}
      </ul>

      <div className="text-center mt-6">
        <a
          href={searchResult.SearchURL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 font-bold"
        >
          View More Books →
        </a>
      </div>
    </div>
  );
};
export default StoreComp;
