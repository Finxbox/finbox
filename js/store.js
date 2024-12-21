// Function to fetch book cover from Google Books API using ISBN
async function fetchBookCoverFromGoogle(isbn) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const coverUrl = data.items[0].volumeInfo.imageLinks?.thumbnail;
      return coverUrl || "https://via.placeholder.com/150"; // Return cover URL or placeholder
    } else {
      return "https://via.placeholder.com/150"; // If no cover found, return placeholder
    }
  } catch (error) {
    console.error("Error fetching book cover from Google Books:", error);
    return "https://via.placeholder.com/150"; // Return placeholder if error occurs
  }
}

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
  for (const book of books) {
    const bookCard = document.createElement("div");
    bookCard.classList.add("book-card");

    // Get the ISBN from the book data
    const isbn = book.isbn; // Make sure your JSON has an ISBN field
    const imagePath = await fetchBookCoverFromGoogle(isbn); // Fetch the cover image from Google Books API
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
  }
}

// Call the function to render books
renderBooks();
