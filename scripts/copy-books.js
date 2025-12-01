const fs = require('fs');
const path = require('path');

const RESEARCH_DIR = path.join(__dirname, '../../Research');
const ASSETS_DIR = path.join(__dirname, '../assets/books');

// Ensure assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Book categories mapping
const categoryMap = {
  'EthiopianBible': ['Biblical'],
  'Greater Key of Solomon': ['Solomonic'],
  'Lesser Key of Solomon': ['Solomonic'],
  'Book of The Law': ['Hermetic'],
  'The Kybalion A Study Of The Hermetic Philosophy Of Ancient Egypt And Greece': ['Hermetic', 'Egyptian'],
  'Emerald Tablets of Thoth': ['Egyptian', 'Hermetic'],
  'Enochian Magick Reference': ['Enochian'],
  'The Enochian Calls': ['Enochian'],
  'The Egyptian Book of the Dead': ['Egyptian'],
  'Sepher\'s': ['Kabbalah'],
  'The Dead Sea Scrolls': ['Biblical'],
  'The Book Of Abramelin': ['Hermetic'],
  'Necronomicon Spellbook': ['Other'],
  'Book Of Power': ['Other'],
  'A Manual of XXX Magick': ['Other'],
  'Revelation of Genesis': ['Biblical'],
  'The Tree Of Life': ['Kabbalah'],
  '777': ['Hermetic'],
  '0. Maps': ['Maps'],
};

function getCategories(folderName) {
  for (const [key, categories] of Object.entries(categoryMap)) {
    if (folderName.includes(key)) {
      return categories;
    }
  }
  return ['Other'];
}

function sanitizeFileName(name) {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function copyBooks() {
  const books = [];
  const researchFolders = fs.readdirSync(RESEARCH_DIR, { withFileTypes: true });

  researchFolders.forEach((dirent) => {
    if (!dirent.isDirectory() || dirent.name.startsWith('.') || dirent.name === 'venv') {
      return;
    }

    const folderPath = path.join(RESEARCH_DIR, dirent.name);
    const files = fs.readdirSync(folderPath);
    
    // Find PDF and markdown files
    const pdfFiles = files.filter(f => f.endsWith('.pdf'));
    const mdFiles = files.filter(f => f.endsWith('.md'));

    if (pdfFiles.length === 0 && mdFiles.length === 0) {
      return;
    }

    const categories = getCategories(dirent.name);
    
    // Process each PDF
    pdfFiles.forEach((pdfFile) => {
      const sourcePath = path.join(folderPath, pdfFile);
      const sanitizedName = sanitizeFileName(`${dirent.name}_${pdfFile}`);
      const destPath = path.join(ASSETS_DIR, sanitizedName);
      
      try {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied PDF: ${pdfFile}`);
      } catch (error) {
        console.error(`Error copying ${pdfFile}:`, error.message);
      }

      const bookId = sanitizeFileName(`${dirent.name}_${pdfFile.replace('.pdf', '')}`);
      books.push({
        id: bookId,
        title: pdfFile.replace('.pdf', ''),
        categories,
        pdfPath: sanitizedName,
        folderName: dirent.name,
      });
    });

    // Process each markdown file
    mdFiles.forEach((mdFile) => {
      const sourcePath = path.join(folderPath, mdFile);
      const sanitizedName = sanitizeFileName(`${dirent.name}_${mdFile}`);
      const destPath = path.join(ASSETS_DIR, sanitizedName);
      
      try {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied Markdown: ${mdFile}`);
      } catch (error) {
        console.error(`Error copying ${mdFile}:`, error.message);
      }

      // Check if we already have a book entry for this (from PDF)
      const bookId = sanitizeFileName(`${dirent.name}_${mdFile.replace('.md', '')}`);
      const existingBook = books.find(b => b.id === bookId);
      
      if (existingBook) {
        existingBook.markdownPath = sanitizedName;
      } else {
        books.push({
          id: bookId,
          title: mdFile.replace('.md', ''),
          categories,
          markdownPath: sanitizedName,
          folderName: dirent.name,
        });
      }
    });
  });

  // Save metadata
  const metadata = {
    books,
    lastUpdated: Date.now(),
  };

  const metadataPath = path.join(__dirname, '../lib/books-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`\n✅ Copied ${books.length} books`);
  console.log(`📝 Metadata saved to ${metadataPath}`);
}

copyBooks();

