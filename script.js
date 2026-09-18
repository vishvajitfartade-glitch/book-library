// ==========================================
// BOOK LIBRARY TRACKER
// ==========================================

// Get elements
const bookForm = document.getElementById("bookForm");
const bookId = document.getElementById("bookId");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const statusInput = document.getElementById("status");
const ratingInput = document.getElementById("rating");

const bookList = document.getElementById("bookList");
const emptyMessage = document.getElementById("emptyMessage");

const searchInput = document.getElementById("search");
const sortInput = document.getElementById("sort");

const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");

let books = JSON.parse(localStorage.getItem("libraryBooks")) || [];

let activeStatus = "all";

// ==========================================
// SAVE BOOKS
// ==========================================

function saveBooks() {
    localStorage.setItem("libraryBooks", JSON.stringify(books));
}

// ==========================================
// ADD / UPDATE BOOK
// ==========================================

bookForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const status = statusInput.value;
    const rating = Number(ratingInput.value);

    if (!title || !author) {
        alert("Please enter book title and author.");
        return;
    }

    // Editing existing book
    if (bookId.value) {

        const id = Number(bookId.value);

        const book = books.find(book => book.id === id);

        if (book) {
            book.title = title;
            book.author = author;
            book.status = status;
            book.rating = rating;
        }

        alert("Book updated successfully!");

    } else {

        // Adding new book
        const newBook = {
            id: Date.now(),
            title: title,
            author: author,
            status: status,
            rating: rating,
            dateAdded: new Date().toISOString()
        };

        books.push(newBook);

        alert("Book added successfully!");
    }

    saveBooks();

    resetForm();
    renderBooks();
    updateStats();
});

// ==========================================
// RENDER BOOKS
// ==========================================

function renderBooks() {

    let filteredBooks = [...books];

    // Status filtering
    if (activeStatus !== "all") {
        filteredBooks = filteredBooks.filter(
            book => book.status === activeStatus
        );
    }

    // Search filtering
    const searchText = searchInput.value.toLowerCase().trim();

    if (searchText) {
        filteredBooks = filteredBooks.filter(book =>
            book.title.toLowerCase().includes(searchText) ||
            book.author.toLowerCase().includes(searchText)
        );
    }

    // Sorting
    switch (sortInput.value) {

        case "title":
            filteredBooks.sort((a, b) =>
                a.title.localeCompare(b.title)
            );
            break;

        case "author":
            filteredBooks.sort((a, b) =>
                a.author.localeCompare(b.author)
            );
            break;

        case "ratingHigh":
            filteredBooks.sort((a, b) =>
                b.rating - a.rating
            );
            break;

        case "ratingLow":
            filteredBooks.sort((a, b) =>
                a.rating - b.rating
            );
            break;

        default:
            break;
    }

    bookList.innerHTML = "";

    if (filteredBooks.length === 0) {

        emptyMessage.style.display = "block";

    } else {

        emptyMessage.style.display = "none";

        filteredBooks.forEach(book => {
            bookList.appendChild(createBookCard(book));
        });
    }

    updateCounts();
}

// ==========================================
// CREATE BOOK CARD
// ==========================================

function createBookCard(book) {

    const card = document.createElement("div");

    card.className = "book-card";

    const statusText = {
        read: "Read",
        reading: "Currently Reading",
        want: "Want to Read"
    };

    const stars = book.rating > 0
        ? "⭐".repeat(book.rating)
        : "No rating";

    card.innerHTML = `
        <div class="book-icon">📖</div>

        <h3>${escapeHTML(book.title)}</h3>

        <p class="author">
            by ${escapeHTML(book.author)}
        </p>

        <span class="status ${book.status}">
            ${statusText[book.status]}
        </span>

        <div class="rating">
            ${stars}
        </div>

        <div class="card-buttons">

            <button
                class="edit-btn"
                onclick="editBook(${book.id})"
            >
                ✏️ Edit
            </button>

            <button
                class="delete-btn"
                onclick="deleteBook(${book.id})"
            >
                🗑️ Delete
            </button>

        </div>
    `;

    return card;
}

// ==========================================
// EDIT BOOK
// ==========================================

function editBook(id) {

    const book = books.find(book => book.id === id);

    if (!book) return;

    bookId.value = book.id;
    titleInput.value = book.title;
    authorInput.value = book.author;
    statusInput.value = book.status;
    ratingInput.value = book.rating;

    formTitle.textContent = "✏️ Edit Book";
    submitBtn.textContent = "Update Book";
    cancelBtn.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ==========================================
// DELETE BOOK
// ==========================================

function deleteBook(id) {

    const book = books.find(book => book.id === id);

    if (!book) return;

    const confirmDelete = confirm(
        `Are you sure you want to delete "${book.title}"?`
    );

    if (!confirmDelete) return;

    books = books.filter(book => book.id !== id);

    saveBooks();

    renderBooks();
    updateStats();

    alert("Book deleted successfully!");
}

// ==========================================
// CANCEL EDIT
// ==========================================

function cancelEdit() {
    resetForm();
}

// ==========================================
// RESET FORM
// ==========================================

function resetForm() {

    bookForm.reset();

    bookId.value = "";

    statusInput.value = "want";
    ratingInput.value = "0";

    formTitle.textContent = "➕ Add New Book";
    submitBtn.textContent = "Add Book";
    cancelBtn.hidden = true;
}

// ==========================================
// STATUS TABS
// ==========================================

document.querySelectorAll(".tab").forEach(tab => {

    tab.addEventListener("click", function () {

        document.querySelectorAll(".tab").forEach(item => {
            item.classList.remove("active");
        });

        this.classList.add("active");

        activeStatus = this.dataset.status;

        renderBooks();
    });
});

// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener("input", function () {
    renderBooks();
});

// ==========================================
// SORT
// ==========================================

sortInput.addEventListener("change", function () {
    renderBooks();
});

// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStats() {

    const total = books.length;

    const read = books.filter(
        book => book.status === "read"
    ).length;

    const reading = books.filter(
        book => book.status === "reading"
    ).length;

    const want = books.filter(
        book => book.status === "want"
    ).length;

    document.getElementById("totalBooks").textContent = total;
    document.getElementById("readBooks").textContent = read;
    document.getElementById("readingBooks").textContent = reading;
    document.getElementById("wantBooks").textContent = want;
}

// ==========================================
// UPDATE TAB COUNTS
// ==========================================

function updateCounts() {

    const all = books.length;

    const read = books.filter(
        book => book.status === "read"
    ).length;

    const reading = books.filter(
        book => book.status === "reading"
    ).length;

    const want = books.filter(
        book => book.status === "want"
    ).length;

    document.getElementById("allCount").textContent = all;
    document.getElementById("readCount").textContent = read;
    document.getElementById("readingCount").textContent = reading;
    document.getElementById("wantCount").textContent = want;
}

// ==========================================
// SECURITY HELPER
// ==========================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

// ==========================================
// INITIAL LOAD
// ==========================================

renderBooks();
updateStats();