// Function to render the books dynamically
async function renderBooks() {
  const container = document.getElementById("book-container");

  // Fetch the JSON file with book data
  const response = await fetch("books.json");
  const books = await response.json();

  // Fetch user location to determine the country
  let countryCode = "global"; // Default to global
  try {
    // Fetching country code from ipinfo.io
    const locationResponse = await fetch(
      "https://ipinfo.io/json?token=1ee939da9e7124"
    ); // Replace YOUR_API_KEY with your actual ipinfo.io API key
    const locationData = await locationResponse.json();
    countryCode = locationData.country; // e.g., "IN" for India, "US" for the United States
  } catch (error) {
    console.error("Could not fetch location data:", error);
  }

  // Render the book cards dynamically
  books.forEach((book) => {
    const bookCard = document.createElement("div");
    bookCard.classList.add("book-card");

    // Construct the dynamic image path
    const imagePath = `images/${book.imageName || "placeholder.jpg"}`;

    // Determine the correct Amazon link based on the country
    const amazonUrl =
      countryCode === "IN" // If the country is India
        ? book["amazon_url (India)"] // Use the Indian Amazon URL
        : book["amazon_url (global)"]; // Otherwise, use the global Amazon URL

    // Add the book card HTML
    bookCard.innerHTML = `
      <img src="${imagePath}" alt="${book.title}">
      <h3><strong>${book.title}</strong></h3>
      <p>Author: ${book.author}</p>
      <button onclick="window.open('${amazonUrl}', '_blank')">Buy Now</button>
    `;

    // Append the book card to the container
    container.appendChild(bookCard);
  });
}

// Call the function to render books
renderBooks();
