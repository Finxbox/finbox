async function renderBooks() {
  const response = await fetch("books.json"); // Load the JSON file with book data
  const books = await response.json();
  const container = document.getElementById("book-container");

  books.forEach((book) => {
    const bookCard = document.createElement("div");
    bookCard.classList.add("book-card");

    // Construct the dynamic image path
    const imagePath = `images/${book.imageName || "placeholder.jpg"}`;

    bookCard.innerHTML = `
      <img src="${imagePath}" alt="${book.title}">
      <h3><strong>${book.title}</strong></h3>
      <p>Author: ${book.author}</p>
      <button onclick="window.open('${book.amazon_url}', '_blank')">Buy Now</button>
    `;
    container.appendChild(bookCard);
  });
}

renderBooks();
