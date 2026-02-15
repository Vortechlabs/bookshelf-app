// Pertama, kita inisialisasi data dan elemen DOM
let books = [];
let searchTerm = '';
let editingBookId = null;

// Lalu dapatkan referensi ke elemen-elemen penting di DOM
const bookForm = document.getElementById('bookForm');
const searchForm = document.getElementById('searchBook');
const incompleteBookList = document.getElementById('incompleteBookList');
const completeBookList = document.getElementById('completeBookList');
const bookFormSubmitButton = document.getElementById('bookFormSubmit');
const bookFormIsCompleteCheckbox = document.getElementById('bookFormIsComplete');
const spanButtonText = document.querySelector('#bookFormSubmit span');

// Storage key untuk simpan di localStorage
const STORAGE_KEY = 'BOOKSHELF_APPS';

// Cek apakah browser mendukung localStorage
function isStorageSupported() {
    return typeof(Storage) !== 'undefined';
}

// Load data dari localStorage saat pertama kali
function loadBooksFromStorage() {
    if (!isStorageSupported()) {
        alert('Browser kamu tidak mendukung localStorage. Data tidak akan tersimpan.');
        return [];
    }

    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (serializedData === null) {
        return [];
    }

    try {
        return JSON.parse(serializedData);
    } catch (error) {
        console.error('Gagal memuat data dari localStorage:', error);
        return [];
    }
}

// Simpan data ke localStorage
function saveBooksToStorage() {
    if (!isStorageSupported()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

// Generate unique ID berdasarkan timestamp
function generateBookId() {
    return new Date().getTime();
}

// Render semua buku ke rak yang sesuai
function renderBooks() {
    // Filter buku berdasarkan pencarian jika ada
    let booksToRender = books;
    if (searchTerm.trim() !== '') {
        booksToRender = books.filter(book => 
            book.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    // Kosongkan kedua rak buku
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    // Render setiap buku ke rak yang sesuai
    booksToRender.forEach(book => {
        const bookElement = createBookElement(book);
        
        if (book.isComplete) {
            completeBookList.appendChild(bookElement);
        } else {
            incompleteBookList.appendChild(bookElement);
        }
    });
}

// Membuat elemen HTML untuk sebuah buku
function createBookElement(book) {
    const bookContainer = document.createElement('div');
    bookContainer.setAttribute('data-bookid', book.id);
    bookContainer.setAttribute('data-testid', 'bookItem');

    const titleElement = document.createElement('h3');
    titleElement.setAttribute('data-testid', 'bookItemTitle');
    titleElement.textContent = book.title;

    const authorElement = document.createElement('p');
    authorElement.setAttribute('data-testid', 'bookItemAuthor');
    authorElement.textContent = `Penulis: ${book.author}`;

    const yearElement = document.createElement('p');
    yearElement.setAttribute('data-testid', 'bookItemYear');
    yearElement.textContent = `Tahun: ${book.year}`;

    const buttonContainer = document.createElement('div');

    const isCompleteButton = document.createElement('button');
    isCompleteButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    isCompleteButton.textContent = book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
    isCompleteButton.addEventListener('click', () => toggleBookStatus(book.id));

    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.textContent = 'Hapus Buku';
    deleteButton.addEventListener('click', () => deleteBook(book.id));

    const editButton = document.createElement('button');
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.textContent = 'Edit Buku';
    editButton.addEventListener('click', () => editBook(book.id));

    buttonContainer.appendChild(isCompleteButton);
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(editButton);

    bookContainer.appendChild(titleElement);
    bookContainer.appendChild(authorElement);
    bookContainer.appendChild(yearElement);
    bookContainer.appendChild(buttonContainer);

    return bookContainer;
}

// Menambah buku baru
function addBook(event) {
    event.preventDefault();

    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = parseInt(document.getElementById('bookFormYear').value);
    const isComplete = bookFormIsCompleteCheckbox.checked;

    if (editingBookId) {
        // Mode edit: update buku yang ada
        const bookIndex = books.findIndex(b => b.id === editingBookId);
        if (bookIndex !== -1) {
            books[bookIndex] = {
                ...books[bookIndex],
                title,
                author,
                year,
                isComplete
            };
        }
        editingBookId = null;
        bookFormSubmitButton.textContent = 'Masukkan Buku ke rak ';
        spanButtonText.textContent = isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';
    } else {
        // Mode tambah: buat buku baru
        const newBook = {
            id: generateBookId(),
            title,
            author,
            year,
            isComplete
        };
        books.push(newBook);
    }

    saveBooksToStorage();
    renderBooks();
    bookForm.reset();
}

// Menghapus buku
function deleteBook(bookId) {
    const confirmDelete = confirm('Apakah kamu yakin ingin menghapus buku ini?');
    if (confirmDelete) {
        books = books.filter(book => book.id !== bookId);
        saveBooksToStorage();
        renderBooks();
    }
}

// Mengubah status buku (selesai/belum selesai)
function toggleBookStatus(bookId) {
    const bookIndex = books.findIndex(book => book.id === bookId);
    if (bookIndex !== -1) {
        books[bookIndex].isComplete = !books[bookIndex].isComplete;
        saveBooksToStorage();
        renderBooks();
    }
}

// Mengedit buku
function editBook(bookId) {
    const bookToEdit = books.find(book => book.id === bookId);
    if (!bookToEdit) return;

    // Isi form dengan data buku yang akan diedit
    document.getElementById('bookFormTitle').value = bookToEdit.title;
    document.getElementById('bookFormAuthor').value = bookToEdit.author;
    document.getElementById('bookFormYear').value = bookToEdit.year;
    document.getElementById('bookFormIsComplete').checked = bookToEdit.isComplete;

    // Update teks tombol sesuai status
    spanButtonText.textContent = bookToEdit.isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';
    
    // Ubah teks tombol submit untuk mode edit
    bookFormSubmitButton.textContent = 'Edit Buku ';
    
    // Scroll ke form untuk mengedit
    bookForm.scrollIntoView({ behavior: 'smooth' });
    
    // Set editingBookId agar form tahu ini mode edit
    editingBookId = bookId;
}

// Mencari buku berdasarkan judul
function searchBooks(event) {
    event.preventDefault();
    searchTerm = document.getElementById('searchBookTitle').value;
    renderBooks();
}

// Update teks tombol submit saat checkbox berubah
bookFormIsCompleteCheckbox.addEventListener('change', function() {
    if (!editingBookId) {
        spanButtonText.textContent = this.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
    }
});

// Event listener untuk form tambah buku
bookForm.addEventListener('submit', addBook);

// Event listener untuk form pencarian
searchForm.addEventListener('submit', searchBooks);

// Reset pencarian saat input dikosongkan
document.getElementById('searchBookTitle').addEventListener('input', function() {
    if (this.value === '') {
        searchTerm = '';
        renderBooks();
    }
});

// Inisialisasi aplikasi
function init() {
    books = loadBooksFromStorage();
    renderBooks();
    
    console.log('Bookshelf App siap digunakan!');
}

// Mulai aplikasi
init();

// Tambahin sedikit contoh data awal biar ga kosong (tapi opsional)
if (books.length === 0) {
    // Ini cuma contoh data awal
    const sampleBooks = [
        {
            id: 123123123,
            title: 'Laskar Pelangi',
            author: 'Andrea Hirata',
            year: 2005,
            isComplete: false
        },
        {
            id: 456456456,
            title: 'Bumi Manusia',
            author: 'Pramoedya Ananta Toer',
            year: 1980,
            isComplete: true
        }
    ];
    
    // Tanya user mau pake contoh data atau ga
    const useSample = confirm('Mau pake contoh data buku? Klik OK untuk ya, Cancel untuk mulai dari kosong.');
    if (useSample) {
        books = sampleBooks;
        saveBooksToStorage();
        renderBooks();
    }
}