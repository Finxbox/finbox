async function renderBooks() {
  const container = document.getElementById("book-container");

  // Fetch the JSON file with book data
  const response = await fetch("books.json");
  const books = await response.json();

  // Fetch user location to determine the country
  let countryCode = "global"; // Default to global
  try {
    const locationResponse = await fetch("http://ip-api.com/json/");
    const locationData = await locationResponse.json();
    countryCode = locationData.countryCode; // e.g., "IN", "US"
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
      countryCode === "IN"
        ? book["amazon_url (India)"]
        : book["amazon_url (global)"];

    bookCard.innerHTML = `
          <img src="${imagePath}" alt="${book.title}">
          <h3><strong>${book.title}</strong></h3>
          <p>Author: ${book.author}</p>
          <button onclick="window.open('${amazonUrl}', '_blank')">Buy Now</button>
      `;

    container.appendChild(bookCard);
  });
}

// Call the function to render books
renderBooks();
