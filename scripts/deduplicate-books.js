const fs = require('fs');
const path = require('path');

const METADATA_PATH = path.join(__dirname, '../lib/books-metadata.json');
const ASSETS_BOOKS_DIR = path.join(__dirname, '../assets/books');
const PUBLIC_BOOKS_DIR = path.join(__dirname, '../public/assets/books');

/**
 * Remove deleted book from metadata
 */
function removeDeletedBookFromMetadata() {
  const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
  
  // Remove "515 Apocrypha" book (id: biblical_515_apocrypha)
  const filteredBooks = metadata.books.filter(book => book.id !== 'biblical_515_apocrypha');
  
  if (filteredBooks.length < metadata.books.length) {
    console.log(`Removed deleted book "515 Apocrypha" from metadata`);
    metadata.books = filteredBooks;
    metadata.lastUpdated = Date.now();
    fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2) + '\n');
    return true;
  }
  return false;
}

/**
 * Check if a file exists in assets/books
 */
function fileExistsInAssets(relativePath) {
  const fullPath = path.join(ASSETS_BOOKS_DIR, relativePath);
  return fs.existsSync(fullPath);
}

/**
 * Remove public/assets/books directory (all duplicates)
 */
function removePublicBooksDirectory() {
  if (fs.existsSync(PUBLIC_BOOKS_DIR)) {
    console.log(`Removing duplicate books from ${PUBLIC_BOOKS_DIR}...`);
    fs.rmSync(PUBLIC_BOOKS_DIR, { recursive: true, force: true });
    console.log(`✅ Removed ${PUBLIC_BOOKS_DIR}`);
    return true;
  }
  return false;
}

/**
 * Find duplicate files within assets/books by comparing file names
 */
function findDuplicatesInAssets() {
  const fileMap = new Map();
  const duplicates = [];
  
  function scanDirectory(dir, relativePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath, relPath);
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.pdf'))) {
        const basename = entry.name.toLowerCase();
        if (fileMap.has(basename)) {
          duplicates.push({
            name: entry.name,
            existing: fileMap.get(basename),
            duplicate: relPath
          });
        } else {
          fileMap.set(basename, relPath);
        }
      }
    }
  }
  
  if (fs.existsSync(ASSETS_BOOKS_DIR)) {
    scanDirectory(ASSETS_BOOKS_DIR);
  }
  
  return duplicates;
}

/**
 * Validate metadata entries point to existing files
 */
function validateMetadataFiles() {
  const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
  const invalid = [];
  
  for (const book of metadata.books) {
    if (book.markdownPath && !fileExistsInAssets(book.markdownPath)) {
      invalid.push({ book: book.id, type: 'markdown', path: book.markdownPath });
    }
    if (book.pdfPath && !fileExistsInAssets(book.pdfPath)) {
      invalid.push({ book: book.id, type: 'pdf', path: book.pdfPath });
    }
  }
  
  return invalid;
}

// Main execution
console.log('📚 Starting book deduplication and organization...\n');

// 1. Remove deleted book from metadata
console.log('1. Removing deleted book from metadata...');
const removed = removeDeletedBookFromMetadata();
if (!removed) {
  console.log('   (Book already removed or not found)');
}

// 2. Validate metadata files
console.log('\n2. Validating metadata files...');
const invalidFiles = validateMetadataFiles();
if (invalidFiles.length > 0) {
  console.log(`   ⚠️  Found ${invalidFiles.length} invalid file references:`);
  invalidFiles.forEach(item => {
    console.log(`      - ${item.book}: ${item.type} -> ${item.path}`);
  });
} else {
  console.log('   ✅ All metadata file references are valid');
}

// 3. Find duplicates within assets/books
console.log('\n3. Checking for duplicate files in assets/books...');
const duplicates = findDuplicatesInAssets();
if (duplicates.length > 0) {
  console.log(`   ⚠️  Found ${duplicates.length} potential duplicate files (same filename):`);
  duplicates.forEach(dup => {
    console.log(`      - ${dup.name}`);
    console.log(`        Existing: ${dup.existing}`);
    console.log(`        Duplicate: ${dup.duplicate}`);
  });
} else {
  console.log('   ✅ No duplicate files found in assets/books');
}

// 4. Remove public/assets/books directory
console.log('\n4. Removing duplicate books from public/assets/books...');
const removedPublic = removePublicBooksDirectory();
if (!removedPublic) {
  console.log('   (Directory already removed or not found)');
}

console.log('\n✅ Deduplication complete!');
console.log(`\n📊 Summary:`);
console.log(`   - Metadata entries: ${JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8')).books.length}`);
console.log(`   - Invalid file references: ${invalidFiles.length}`);
console.log(`   - Duplicate files in assets: ${duplicates.length}`);
console.log(`   - Public books directory: ${removedPublic ? 'removed' : 'not found'}`);
