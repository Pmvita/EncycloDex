const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets/books');
const PUBLIC_DIR = path.join(__dirname, '../public/assets/books');

// Ensure directories exist
[ASSETS_DIR, PUBLIC_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function sanitizeFolderName(name) {
  // Remove file extensions and clean up
  return name
    .replace(/\.(pdf|md)$/i, '')
    .replace(/^1\._EthiopianBible_/i, '') // Remove prefix
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getBookTitle(folderName) {
  // Clean up the folder name to make it a proper title
  return folderName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function organizeCategory(categoryPath, categoryName) {
  if (!fs.existsSync(categoryPath)) {
    console.log(`Category folder ${categoryName} does not exist`);
    return [];
  }

  const files = fs.readdirSync(categoryPath, { withFileTypes: true });
  const fileMap = new Map(); // Map of base name -> {pdf, md, other}

  // Group files by base name
  files.forEach((dirent) => {
    if (dirent.isDirectory()) {
      return; // Skip existing folders
    }

    const fileName = dirent.name;
    const baseName = sanitizeFolderName(fileName);
    
    if (!fileMap.has(baseName)) {
      fileMap.set(baseName, { pdf: null, md: null, other: [] });
    }

    const entry = fileMap.get(baseName);
    if (fileName.endsWith('.pdf')) {
      entry.pdf = fileName;
    } else if (fileName.endsWith('.md')) {
      entry.md = fileName;
    } else {
      entry.other.push(fileName);
    }
  });

  const books = [];

  // Create folders and move files
  fileMap.forEach((files, baseName) => {
    // Skip if no PDF or MD file
    if (!files.pdf && !files.md) {
      return;
    }

    const folderName = baseName;
    const bookTitle = getBookTitle(folderName);
    const bookFolder = path.join(categoryPath, folderName);
    const publicBookFolder = path.join(PUBLIC_DIR, categoryName, folderName);

    // Create folders
    if (!fs.existsSync(bookFolder)) {
      fs.mkdirSync(bookFolder, { recursive: true });
    }
    if (!fs.existsSync(publicBookFolder)) {
      fs.mkdirSync(publicBookFolder, { recursive: true });
    }

    // Move PDF file
    if (files.pdf) {
      const sourcePdf = path.join(categoryPath, files.pdf);
      const destPdf = path.join(bookFolder, files.pdf);
      const publicDestPdf = path.join(publicBookFolder, files.pdf);
      
      if (fs.existsSync(sourcePdf) && !fs.existsSync(destPdf)) {
        fs.copyFileSync(sourcePdf, destPdf);
        fs.copyFileSync(sourcePdf, publicDestPdf);
        fs.unlinkSync(sourcePdf); // Remove original
        console.log(`Moved PDF: ${files.pdf} -> ${folderName}/`);
      }
    }

    // Move MD file
    if (files.md) {
      const sourceMd = path.join(categoryPath, files.md);
      const destMd = path.join(bookFolder, files.md);
      const publicDestMd = path.join(publicBookFolder, files.md);
      
      if (fs.existsSync(sourceMd) && !fs.existsSync(destMd)) {
        fs.copyFileSync(sourceMd, destMd);
        fs.copyFileSync(sourceMd, publicDestMd);
        fs.unlinkSync(sourceMd); // Remove original
        console.log(`Moved MD: ${files.md} -> ${folderName}/`);
      }
    }

    // Move other files
    files.other.forEach(otherFile => {
      const sourceOther = path.join(categoryPath, otherFile);
      const destOther = path.join(bookFolder, otherFile);
      const publicDestOther = path.join(publicBookFolder, otherFile);
      
      if (fs.existsSync(sourceOther) && !fs.existsSync(destOther)) {
        fs.copyFileSync(sourceOther, destOther);
        fs.copyFileSync(sourceOther, publicDestOther);
        fs.unlinkSync(sourceOther);
        console.log(`Moved: ${otherFile} -> ${folderName}/`);
      }
    });

    // Create book entry
    const bookId = `${categoryName}_${folderName}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const pdfFileName = files.pdf || null;
    const mdFileName = files.md || null;

    books.push({
      id: bookId,
      title: bookTitle,
      categories: [categoryName],
      pdfPath: pdfFileName ? `${categoryName}/${folderName}/${pdfFileName}` : undefined,
      markdownPath: mdFileName ? `${categoryName}/${folderName}/${mdFileName}` : undefined,
      folderName: folderName,
    });
  });

  return books;
}

function organizeAllBooks() {
  const allBooks = [];
  const categories = fs.readdirSync(ASSETS_DIR, { withFileTypes: true });

  categories.forEach((dirent) => {
    if (!dirent.isDirectory() || dirent.name.startsWith('.')) {
      return;
    }

    const categoryName = dirent.name;
    const categoryPath = path.join(ASSETS_DIR, categoryName);
    const publicCategoryPath = path.join(PUBLIC_DIR, categoryName);

    // Ensure public category folder exists
    if (!fs.existsSync(publicCategoryPath)) {
      fs.mkdirSync(publicCategoryPath, { recursive: true });
    }

    console.log(`\n📁 Organizing category: ${categoryName}`);
    const books = organizeCategory(categoryPath, categoryName);
    allBooks.push(...books);
    console.log(`✅ Organized ${books.length} books in ${categoryName}`);
  });

  // Save metadata
  const metadata = {
    books: allBooks,
    lastUpdated: Date.now(),
  };

  const metadataPath = path.join(__dirname, '../lib/books-metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`\n✅ Total: ${allBooks.length} books organized`);
  console.log(`📝 Metadata saved to ${metadataPath}`);
}

organizeAllBooks();

