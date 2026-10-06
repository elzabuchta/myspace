// Theme Engine & Core State

const STORAGE_KEY_THEME = 'knihovnicek_theme';
const STORAGE_KEY_BOOKS = 'knihovnicek_books';
const STORAGE_KEY_REVIEWS = 'knihovnicek_reviews';
const STORAGE_KEY_FOLLOWS = 'knihovnicek_follows';

let html5QrCode = null;
let isScannerRunning = false;
let isProcessingScan = false;
let currentScannedBook = null;

// Czech alphabet sequence for jump navigation
const CZECH_ALPHABET = ['A','B','C','Č','D','E','F','G','H','CH','I','J','K','L','M','N','O','P','R','Ř','S','Š','T','U','V','W','X','Y','Z','Ž'];

// Sample Monthly Featured Books
const MONTHLY_FEATURED_BOOKS = [
  {
    id: "month_1",
    isbn: "9788020455550",
    title: "Babička",
    author: "Božena Němcová",
    publisher: "Československý spisovatel",
    year: "1855",
    description: "Klasické dílo české literatury zachycující život na venkově a moudrost staré babičky."
  },
  {
    id: "month_2",
    isbn: "9788073880620",
    title: "Povídky z jedné a druhé kapsy",
    author: "Karel Čapek",
    publisher: "Aventinum",
    year: "1929",
    description: "Detektivní a filozofické povídky plné humoru, lidskosti a nečekaných rozřešení."
  },
  {
    id: "month_3",
    isbn: "9788020716170",
    title: "R.U.R.",
    author: "Karel Čapek",
    publisher: "Aventinum",
    year: "1920",
    description: "Světoznámé vědeckofantastické drama, které světu dalo slovo Robot."
  }
];

// Sample Accounts for Following
const RECOMMENDED_ACCOUNTS = [
  { id: "acc_1", name: "Knihovna Národní", handle: "@nkp_cz", desc: "Oficiální účet Národní knihovny ČR" },
  { id: "acc_2", name: "Městská knihovna Praha", handle: "@mlp_praha", desc: "Inspirace pro čtenáře a milovníky knih" },
  { id: "acc_3", name: "Knihovník Pavel", handle: "@pavel_knihy", desc: "Recenze, tipy na čtení a novinky" }
];

// Initialize Theme
function initTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) || 'dark';
  setTheme(savedTheme);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY_THEME, theme);

  const switchElem = document.getElementById('theme-toggle-switch');
  const statusText = document.getElementById('theme-status-text');

  if (theme === 'dark') {
    if (switchElem) switchElem.checked = false;
    if (statusText) statusText.innerText = 'Tmavý režim';
  } else {
    if (switchElem) switchElem.checked = true;
    if (statusText) statusText.innerText = 'Světlý režim';
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

function handleThemeToggleChange(event) {
  const newTheme = event.target.checked ? 'light' : 'dark';
  setTheme(newTheme);
}

// Navigation Engine
function navigateTo(screenId) {
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => screen.classList.remove('active'));

  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
  }

  // Camera start/stop handling
  if (screenId === 'screen-scanner') {
    startCameraScanner();
  } else {
    stopCameraScanner();
  }

  // Refresh dynamic screens
  if (screenId === 'screen-library') {
    renderLibrary();
  } else if (screenId === 'screen-monthly-books') {
    renderMonthlyBooks();
  } else if (screenId === 'screen-social') {
    renderSocialAccounts();
  }

  updateMenuBookCount();
  window.scrollTo(0, 0);
}

function stopScannerAndGoHome() {
  stopCameraScanner();
  navigateTo('screen-main-menu');
}


// --- BARCODE CAMERA SCANNER ---

function startCameraScanner() {
  const statusElem = document.getElementById('camera-status');
  if (typeof Html5Qrcode === 'undefined') {
    if (statusElem) statusElem.innerText = 'Knihovna pro skenování se načítá...';
    setTimeout(startCameraScanner, 500);
    return;
  }

  if (isScannerRunning) return;

  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("reader");
  }

  const config = {
    fps: 10,
    qrbox: { width: 260, height: 160 },
    aspectRatio: 1.33333
  };

  if (statusElem) statusElem.innerText = 'Zapínám fotoaparát...';

  html5QrCode.start(
    { facingMode: "environment" },
    config,
    onBarcodeScanned,
    onBarcodeScanError
  ).then(() => {
    isScannerRunning = true;
    if (statusElem) statusElem.innerText = 'Namiřte fotoaparát na čárový kód knihy (ISBN)';
  }).catch(err => {
    console.warn("Camera start failed, falling back to manual input mode:", err);
    isScannerRunning = false;
    if (statusElem) statusElem.innerText = 'Fotoaparát je nedostupný. Použijte ruční zadání ISBN níže.';
  });
}

function stopCameraScanner() {
  if (html5QrCode && isScannerRunning) {
    html5QrCode.stop().then(() => {
      isScannerRunning = false;
      const statusElem = document.getElementById('camera-status');
      if (statusElem) statusElem.innerText = 'Fotoaparát vypnut.';
    }).catch(err => {
      console.warn("Error stopping camera:", err);
      isScannerRunning = false;
    });
  }
}

function toggleCamera() {
  if (isScannerRunning) {
    stopCameraScanner();
  } else {
    startCameraScanner();
  }
}

function onBarcodeScanned(decodedText, decodedResult) {
  if (isProcessingScan) return;

  const cleanIsbn = normalizeIsbn(decodedText);
  if (isValidIsbn(cleanIsbn)) {
    isProcessingScan = true;
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    processIsbnSearch(cleanIsbn);
  }
}

function onBarcodeScanError(errorMessage) {
  // Silent scan frame miss
}

function normalizeIsbn(inputStr) {
  if (!inputStr) return '';
  return inputStr.replace(/[^0-9Xx]/g, '').toUpperCase();
}

function isValidIsbn(isbn) {
  const clean = normalizeIsbn(isbn);
  return clean.length === 10 || clean.length === 13;
}

function handleManualIsbnSubmit(event) {
  event.preventDefault();
  const inputElem = document.getElementById('isbn-input');
  const rawValue = inputElem.value;
  const cleanIsbn = normalizeIsbn(rawValue);

  if (!cleanIsbn) {
    alert("Prosím zadejte číslo ISBN.");
    return;
  }

  if (!isValidIsbn(cleanIsbn)) {
    alert("Zadané číslo neni platné ISBN (musí mít 10 nebo 13 číslic).");
    return;
  }

  processIsbnSearch(cleanIsbn);
}


// --- BOOK LOOKUP ENGINE (Knihovny.cz & Fallbacks) ---

async function processIsbnSearch(isbn) {
  showLoadingModal('Vyhledávám knihu v databázích...');

  try {
    let book = await fetchBookFromKnihovnyCz(isbn);

    if (!book || !book.title) {
      const fallbackBook = await fetchBookFromGoogleBooks(isbn);
      if (fallbackBook && fallbackBook.title) {
        book = mergeBookData(book, fallbackBook);
      }
    }

    if (!book || !book.title) {
      const openLibBook = await fetchBookFromOpenLibrary(isbn);
      if (openLibBook && openLibBook.title) {
        book = mergeBookData(book, openLibBook);
      }
    }

    hideLoadingModal();

    if (book && book.title) {
      currentScannedBook = book;
      showBookResultModal(book);
    } else {
      showErrorModal("Vyskytl se problém a nelze knihu načíst.");
    }
  } catch (error) {
    console.error("Lookup error:", error);
    hideLoadingModal();
    showErrorModal("Vyskytl se problém a nelze knihu načíst.");
  }
}

function mergeBookData(primary, fallback) {
  if (!primary) return fallback;
  if (!fallback) return primary;

  return {
    isbn: primary.isbn || fallback.isbn,
    title: primary.title || fallback.title || 'Neznámý název',
    author: primary.author || fallback.author || 'Neznámý autor',
    year: primary.year || fallback.year || 'Neuvedeno',
    publisher: primary.publisher || fallback.publisher || 'Neuvedeno',
    cover: primary.cover || fallback.cover || ''
  };
}

async function fetchBookFromKnihovnyCz(isbn) {
  try {
    const url = `https://www.knihovny.cz/api/v1/search?lookfor=${encodeURIComponent(isbn)}&type=Isbn`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data && data.records && data.records.length > 0) {
      const rec = data.records[0];

      let title = rec.title || rec.shortTitle || '';
      if (rec.subTitle) title += `: ${rec.subTitle}`;

      let author = '';
      if (rec.authors) {
        if (rec.authors.primary) {
          author = Object.keys(rec.authors.primary).join(', ');
        } else if (Array.isArray(rec.authors)) {
          author = rec.authors.join(', ');
        }
      }

      let year = rec.publishDate || (rec.publicationDates ? rec.publicationDates[0] : '');
      let publisher = rec.publisher || (rec.publishers ? rec.publishers[0] : '');

      let cover = rec.cover || '';
      if (!cover && rec.id) {
        cover = `https://www.knihovny.cz/Cover/Show?id=${encodeURIComponent(rec.id)}&size=medium`;
      }

      return {
        isbn: isbn,
        title: title.trim(),
        author: author.trim(),
        year: year ? String(year).trim() : '',
        publisher: publisher ? String(publisher).trim() : '',
        cover: cover
      };
    }
  } catch (err) {
    console.warn("Knihovny.cz API fetch failed:", err);
  }
  return null;
}

async function fetchBookFromGoogleBooks(isbn) {
  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data && data.items && data.items.length > 0) {
      const info = data.items[0].volumeInfo;

      let cover = '';
      if (info.imageLinks) {
        cover = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || '';
        cover = cover.replace('http://', 'https://');
      }

      return {
        isbn: isbn,
        title: info.title || '',
        author: info.authors ? info.authors.join(', ') : '',
        year: info.publishedDate ? info.publishedDate.substring(0, 4) : '',
        publisher: info.publisher || '',
        cover: cover
      };
    }
  } catch (err) {
    console.warn("Google Books API fetch failed:", err);
  }
  return null;
}

async function fetchBookFromOpenLibrary(isbn) {
  try {
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${encodeURIComponent(isbn)}&format=json&jscmd=data`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    const key = `ISBN:${isbn}`;
    if (data && data[key]) {
      const bookData = data[key];

      let cover = '';
      if (bookData.cover) {
        cover = bookData.cover.medium || bookData.cover.small || '';
      }

      return {
        isbn: isbn,
        title: bookData.title || '',
        author: bookData.authors ? bookData.authors.map(a => a.name).join(', ') : '',
        year: bookData.publish_date || '',
        publisher: bookData.publishers ? bookData.publishers.map(p => p.name).join(', ') : '',
        cover: cover
      };
    }
  } catch (err) {
    console.warn("OpenLibrary API fetch failed:", err);
  }
  return null;
}


// --- MODAL & UI HANDLERS ---

function showLoadingModal(text) {
  const modal = document.getElementById('modal-loading');
  const textElem = document.getElementById('loading-text');
  if (textElem) textElem.innerText = text || 'Vyhledávám...';
  if (modal) modal.classList.remove('hidden');
}

function hideLoadingModal() {
  const modal = document.getElementById('modal-loading');
  if (modal) modal.classList.add('hidden');
}

function showErrorModal(message) {
  const modal = document.getElementById('modal-error');
  const msgElem = document.getElementById('error-message');
  if (msgElem) msgElem.innerText = message || 'Vyskytl se problém a nelze knihu načíst.';
  if (modal) modal.classList.remove('hidden');
}

function closeErrorAndGoHome() {
  const modal = document.getElementById('modal-error');
  if (modal) modal.classList.add('hidden');
  isProcessingScan = false;
  stopScannerAndGoHome();
}

function showBookResultModal(book) {
  const modal = document.getElementById('modal-book-result');
  const detailsElem = document.getElementById('modal-book-details');
  const warningElem = document.getElementById('duplicate-warning');
  const actionsElem = document.getElementById('modal-actions-container');

  const existingBooks = getStoredBooks();
  const isDuplicate = existingBooks.some(b => normalizeIsbn(b.isbn) === normalizeIsbn(book.isbn));

  const coverSrc = book.cover ? book.cover : '';
  const bookSvgPlaceholder = `<div class="book-cover-placeholder"><svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg></div>`;
  const coverHtml = coverSrc
    ? `<img src="${escapeHtml(coverSrc)}" alt="Obálka" class="preview-book-cover" onerror="this.onerror=null; this.outerHTML='${bookSvgPlaceholder}';" />`
    : bookSvgPlaceholder;

  detailsElem.innerHTML = `
    <div class="preview-book-card">
      ${coverHtml}
      <div class="preview-book-details">
        <h4 class="preview-title">${escapeHtml(book.title || 'Neznámý název')}</h4>
        <div class="preview-author">${escapeHtml(book.author || 'Neznámý autor')}</div>
        <div class="preview-meta">
          ${book.year ? `<span>Rok: <strong>${escapeHtml(book.year)}</strong></span>` : ''}
          ${book.publisher ? `<span> • ${escapeHtml(book.publisher)}</span>` : ''}
        </div>
        <div class="preview-meta" style="margin-top: 4px;">
          <span>ISBN: ${escapeHtml(book.isbn)}</span>
        </div>
      </div>
    </div>
  `;

  if (isDuplicate) {
    warningElem.classList.remove('hidden');
    actionsElem.innerHTML = `
      <button class="chunky-btn primary-btn" onclick="saveCurrentBook(true)">
        ➕ Duplikovat
      </button>
      <button class="chunky-btn outline-btn" onclick="discardCurrentBook()">
        🗑️ Zahodit
      </button>
    `;
  } else {
    warningElem.classList.add('hidden');
    actionsElem.innerHTML = `
      <button class="chunky-btn primary-btn" onclick="saveCurrentBook(false)">
        📥 Přidat do knihovny
      </button>
      <button class="chunky-btn outline-btn" onclick="discardCurrentBook()">
        🗑️ Zahodit
      </button>
    `;
  }

  modal.classList.remove('hidden');
}

function discardCurrentBook() {
  const modal = document.getElementById('modal-book-result');
  if (modal) modal.classList.add('hidden');
  currentScannedBook = null;
  isProcessingScan = false;
}


// --- LOCAL STORAGE & BOOK MANAGEMENT ---

function getStoredBooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Error reading stored books:", e);
    return [];
  }
}

function saveStoredBooks(books) {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
    updateMenuBookCount();
  } catch (e) {
    console.error("Error saving books:", e);
  }
}

function saveCurrentBook(isDuplicateAllowed = false) {
  if (!currentScannedBook) return;

  const books = getStoredBooks();

  const newEntry = {
    ...currentScannedBook,
    id: 'book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    addedAt: new Date().toISOString()
  };

  books.push(newEntry);
  saveStoredBooks(books);

  discardCurrentBook();
  navigateTo('screen-library');
}

function deleteBookById(bookId) {
  if (confirm("Opravdu chcete tuto knihu odebrat z knihovny?")) {
    let books = getStoredBooks();
    books = books.filter(b => b.id !== bookId);
    saveStoredBooks(books);
    renderLibrary();
  }
}

function confirmClearLibrary() {
  const books = getStoredBooks();
  if (books.length === 0) return;

  if (confirm("Opravdu chcete vymazat celou svou knihovnu? Tato akce je nevratná.")) {
    saveStoredBooks([]);
    renderLibrary();
  }
}

function updateMenuBookCount() {
  const books = getStoredBooks();
  const countElem = document.getElementById('menu-book-count');
  const libCountElem = document.getElementById('library-count');
  if (countElem) countElem.innerText = books.length;
  if (libCountElem) libCountElem.innerText = books.length;
}


// --- LIBRARY RENDER, ALPHABET SIDEBAR & SEARCH ---

function getFirstLetter(str) {
  if (!str) return '#';
  const cleanStr = str.trim().toUpperCase();
  if (cleanStr.startsWith('CH')) return 'CH';
  const first = cleanStr.charAt(0);
  return first.match(/[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/i) ? normalizeCzechLetter(first) : '#';
}

function normalizeCzechLetter(char) {
  const map = {
    'Á':'A', 'Ä':'A',
    'Č':'Č',
    'Ď':'D',
    'É':'E', 'Ě':'E',
    'Í':'I',
    'Ň':'N',
    'Ó':'O', 'Ö':'O',
    'Ř':'Ř',
    'Š':'Š',
    'Ť':'T',
    'Ú':'U', 'Ů':'U', 'Ü':'U',
    'Ý':'Y',
    'Ž':'Ž'
  };
  return map[char] || char;
}

function renderLibrary() {
  const booksListElem = document.getElementById('books-list');
  const searchInput = document.getElementById('library-search-input');

  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  let books = getStoredBooks();

  books.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'cs', { sensitivity: 'base' }));

  if (query) {
    books = books.filter(b =>
      (b.title && b.title.toLowerCase().includes(query)) ||
      (b.author && b.author.toLowerCase().includes(query)) ||
      (b.isbn && b.isbn.toLowerCase().includes(query))
    );
  }

  updateMenuBookCount();
  renderAlphabetSidebar(books);

  if (books.length === 0) {
    if (query) {
      booksListElem.innerHTML = `
        <div class="empty-library">
          <h3>Žádné výsledky</h3>
          <p>Nenalezena žádná kniha odpovídající hledání "<strong>${escapeHtml(query)}</strong>".</p>
        </div>
      `;
    } else {
      booksListElem.innerHTML = `
        <div class="empty-library">
          <h3>Vaše knihovna je zatím prázdná</h3>
          <p>Přidejte první knihy naskenováním čárového kódu nebo zadáním ISBN.</p>
          <button class="chunky-btn primary-btn" onclick="navigateTo('screen-scanner')" style="margin-top: 16px;">
            Skenovat knihu
          </button>
        </div>
      `;
    }
    return;
  }

  let html = '';
  let currentLetterGroup = '';

  books.forEach(book => {
    const letter = getFirstLetter(book.title);
    const idAnchor = `letter-group-${letter}`;

    let anchorAttr = '';
    if (letter !== currentLetterGroup) {
      currentLetterGroup = letter;
      anchorAttr = `id="${idAnchor}"`;
    }

    const coverSrc = book.cover ? book.cover : '';
    const bookSvgPlaceholder = `<div class="book-cover-placeholder"><svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg></div>`;
    const coverHtml = coverSrc
      ? `<img src="${escapeHtml(coverSrc)}" alt="Obálka" class="book-cover" onerror="this.onerror=null; this.outerHTML='${bookSvgPlaceholder}';" />`
      : bookSvgPlaceholder;

    html += `
      <div class="book-card" ${anchorAttr}>
        ${coverHtml}
        <div class="book-info">
          <div class="book-title">${escapeHtml(book.title || 'Neznámý název')}</div>
          <div class="book-author">${escapeHtml(book.author || 'Neznámý autor')}</div>
          <div class="book-meta">
            ${book.year ? `<span>Rok: ${escapeHtml(book.year)}</span>` : ''}
            ${book.publisher ? `<span>${book.year ? '• ' : ''}${escapeHtml(book.publisher)}</span>` : ''}
          </div>
        </div>
        <div class="book-actions">
          <button class="delete-book-btn" onclick="deleteBookById('${book.id}')" title="Odebrat knihu">
            <svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
      </div>
    `;
  });

  booksListElem.innerHTML = html;
}

function renderAlphabetSidebar(books) {
  const sidebarElem = document.getElementById('alphabet-sidebar');
  if (!sidebarElem) return;

  const presentLetters = new Set();
  books.forEach(b => {
    presentLetters.add(getFirstLetter(b.title));
  });

  let html = '';
  CZECH_ALPHABET.forEach(lettr => {
    const isPresent = presentLetters.has(lettr);
    const activeClass = isPresent ? 'active' : '';
    html += `
      <button class="alpha-letter ${activeClass}" onclick="scrollToLetter('${lettr}')" ${!isPresent ? 'disabled style="opacity: 0.3;"' : ''}>
        ${lettr}
      </button>
    `;
  });

  sidebarElem.innerHTML = html;
}

function scrollToLetter(letter) {
  const targetElem = document.getElementById(`letter-group-${letter}`);
  if (targetElem) {
    targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function filterLibraryBooks() {
  const searchInput = document.getElementById('library-search-input');
  const clearBtn = document.getElementById('clear-search-btn');
  if (clearBtn) {
    if (searchInput.value.length > 0) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }
  }
  renderLibrary();
}

function clearLibrarySearch() {
  const searchInput = document.getElementById('library-search-input');
  if (searchInput) searchInput.value = '';
  filterLibraryBooks();
}

// --- COPY LINK / SHARE FUNCTIONALITY ---

function copyLibraryShareLink() {
  const appUrl = window.location.href.split('#')[0];

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(appUrl).then(() => {
      alert("Odkaz na aplikaci byl zkopírován do schránky!");
    }).catch(() => {
      prompt("Kopírujte odkaz níže:", appUrl);
    });
  } else {
    prompt("Kopírujte odkaz níže:", appUrl);
  }
}


// --- MONTHLY BOOKS & STAR RATINGS / REVIEWS ---

function getStoredReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveReview(bookId, stars, comment) {
  const reviewsMap = getStoredReviews();
  if (!reviewsMap[bookId]) {
    reviewsMap[bookId] = [];
  }

  reviewsMap[bookId].unshift({
    stars: stars,
    comment: comment,
    date: new Date().toLocaleDateString('cs-CZ')
  });

  try {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviewsMap));
  } catch (e) {
    console.error("Error saving review:", e);
  }
}

function renderMonthlyBooks() {
  const listContainer = document.getElementById('monthly-books-list');
  if (!listContainer) return;

  const reviewsMap = getStoredReviews();

  let html = '';
  MONTHLY_FEATURED_BOOKS.forEach(book => {
    const bookReviews = reviewsMap[book.id] || [];

    let reviewsHtml = '';
    if (bookReviews.length > 0) {
      bookReviews.forEach(r => {
        let starsSvg = '';
        for (let i = 1; i <= 5; i++) {
          starsSvg += i <= r.stars ? '★' : '☆';
        }
        reviewsHtml += `
          <div class="review-item">
            <div class="review-item-header">
              <span class="review-stars">${starsSvg}</span>
              <span>${escapeHtml(r.date)}</span>
            </div>
            <div class="review-text">${escapeHtml(r.comment)}</div>
          </div>
        `;
      });
    } else {
      reviewsHtml = `<div class="input-hint" style="font-style: italic;">Zatím žádná hodnocení. Buďte první!</div>`;
    }

    html += `
      <div class="monthly-book-card">
        <div class="monthly-book-main">
          <div class="book-cover-placeholder"><svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg></div>
          <div class="book-info">
            <div class="book-title">${escapeHtml(book.title)}</div>
            <div class="book-author">${escapeHtml(book.author)}</div>
            <div class="book-meta"><span>${escapeHtml(book.publisher)} (${escapeHtml(book.year)})</span></div>
            <p style="font-size: 12px; margin-top: 6px; color: var(--text-muted);">${escapeHtml(book.description)}</p>
          </div>
        </div>

        <!-- Star Rating Input -->
        <div class="comment-input-area">
          <label class="input-label">Přidat hodnocení a komentář:</label>
          <div class="star-rating-picker" id="stars-picker-${book.id}">
            ${[1,2,3,4,5].map(star => `
              <button class="star-btn" data-star="${star}" onclick="selectStarRating('${book.id}', ${star})">
                <svg class="svg-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              </button>
            `).join('')}
          </div>

          <textarea id="comment-text-${book.id}" class="comment-textarea" placeholder="Napište svůj slovní komentář..."></textarea>
          <button class="chunky-btn primary-btn small-btn" onclick="submitBookReview('${book.id}')">
            Odeslat hodnocení
          </button>
        </div>

        <!-- Reviews List -->
        <div class="reviews-list">
          <label class="input-label">Uživatelská hodnocení:</label>
          ${reviewsHtml}
        </div>
      </div>
    `;
  });

  listContainer.innerHTML = html;
}

const activeRatings = {};

function selectStarRating(bookId, stars) {
  activeRatings[bookId] = stars;
  const pickerElem = document.getElementById(`stars-picker-${bookId}`);
  if (!pickerElem) return;

  const btns = pickerElem.querySelectorAll('.star-btn');
  btns.forEach((btn, idx) => {
    if (idx < stars) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function submitBookReview(bookId) {
  const stars = activeRatings[bookId] || 5;
  const textElem = document.getElementById(`comment-text-${bookId}`);
  const commentText = textElem ? textElem.value.trim() : '';

  if (!commentText) {
    alert("Napište prosím k hodnocení i slovní komentář.");
    return;
  }

  saveReview(bookId, stars, commentText);
  if (textElem) textElem.value = '';
  renderMonthlyBooks();
}


// --- SOCIAL: FOLLOW ACCOUNTS & INVITE FRIENDS ---

function getStoredFollows() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FOLLOWS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function toggleFollowAccount(accId) {
  let follows = getStoredFollows();
  if (follows.includes(accId)) {
    follows = follows.filter(id => id !== accId);
  } else {
    follows.push(accId);
  }

  try {
    localStorage.setItem(STORAGE_KEY_FOLLOWS, JSON.stringify(follows));
  } catch (e) {
    console.error("Error saving follow state:", e);
  }

  renderSocialAccounts();
}

function renderSocialAccounts() {
  const listContainer = document.getElementById('accounts-list');
  if (!listContainer) return;

  const follows = getStoredFollows();

  let html = '';
  RECOMMENDED_ACCOUNTS.forEach(acc => {
    const isFollowing = follows.includes(acc.id);
    html += `
      <div class="account-item">
        <div class="account-info">
          <span class="account-name">${escapeHtml(acc.name)}</span>
          <span class="account-handle">${escapeHtml(acc.handle)} • ${escapeHtml(acc.desc)}</span>
        </div>
        <button class="chunky-btn ${isFollowing ? 'outline-btn' : 'primary-btn'} small-btn" onclick="toggleFollowAccount('${acc.id}')">
          ${isFollowing ? 'Sledováno ✓' : '+ Sledovat'}
        </button>
      </div>
    `;
  });

  listContainer.innerHTML = html;
}

function inviteFriends() {
  copyLibraryShareLink();
}


// Helper to escape HTML strings
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateMenuBookCount();

  const quickBtn = document.getElementById('theme-toggle-quick');
  if (quickBtn) {
    quickBtn.addEventListener('click', toggleTheme);
  }
});
