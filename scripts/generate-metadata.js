const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '../assets/books');
const METADATA_PATH = path.join(__dirname, '../lib/books-metadata.json');

function getBookTitle(folderName) {
  // Clean up the folder name to make it a proper title
  return folderName
    .split(' ')
    .map(word => {
      // Handle special cases
      if (word.toLowerCase() === 'of' || word.toLowerCase() === 'the' || word.toLowerCase() === 'a' || word.toLowerCase() === 'an') {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateMetadata() {
  const allBooks = [];
  const categories = fs.readdirSync(ASSETS_DIR, { withFileTypes: true });

  categories.forEach((dirent) => {
    if (!dirent.isDirectory() || dirent.name.startsWith('.')) {
      return;
    }

    const categoryName = dirent.name;
    const categoryPath = path.join(ASSETS_DIR, categoryName);
    const bookFolders = fs.readdirSync(categoryPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    bookFolders.forEach((folderName) => {
      const bookFolder = path.join(categoryPath, folderName);
      const files = fs.readdirSync(bookFolder);
      
      const pdfFile = files.find(f => f.endsWith('.pdf'));
      const mdFile = files.find(f => f.endsWith('.md'));

      // Skip if no PDF or MD file
      if (!pdfFile && !mdFile) {
        return;
      }

      const bookId = `${categoryName}_${folderName}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const bookTitle = getBookTitle(folderName);

      allBooks.push({
        id: bookId,
        title: bookTitle,
        categories: [categoryName.charAt(0).toUpperCase() + categoryName.slice(1)],
        pdfPath: pdfFile ? `${categoryName}/${folderName}/${pdfFile}` : undefined,
        markdownPath: mdFile ? `${categoryName}/${folderName}/${mdFile}` : undefined,
        folderName: folderName,
      });
    });
  });

  // Save metadata
  const metadata = {
    books: allBooks,
    lastUpdated: Date.now(),
  };

  fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2));
  console.log(`✅ Generated metadata for ${allBooks.length} books`);
  console.log(`📝 Metadata saved to ${METADATA_PATH}`);
}

generateMetadata();

