import { useState } from "react";

const UnderConstructionPage = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic email validation
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // Simulate a successful subscription
    setIsSubscribed(true);
    setErrorMessage("");
    setEmail(""); // Reset email input after submission
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex justify-center items-center px-4 py-10">
      <div className="bg-white text-gray-800 rounded-xl shadow-lg p-6 max-w-lg w-full">
        <h1 className="text-3xl font-bold text-center mb-4">
          Page Under Construction
        </h1>
        <p className="text-lg text-center mb-6">
          {`  We're working hard to get the page ready for you. Check back later or
          sign up below to be notified once it's live.`}
        </p>

        {isSubscribed ? (
          <div className="text-center">
            <p className="text-green-500 font-semibold">
              {`Thank you for subscribing! We'll notify you once the page is live.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <input
              type="email"
              value={email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="p-3 w-full sm:w-80 rounded-lg mb-4 border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errorMessage && (
              <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
            )}
            <button
              type="submit"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg shadow-md w-full sm:w-80 hover:bg-indigo-700 transition duration-300"
            >
              Notify Me
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UnderConstructionPage;
