import { Book, BookMetadata } from '../types/book';

// Try to import books metadata - use require for better error handling
let booksMetadata: BookMetadata | null = null;

try {
  booksMetadata = require('./books-metadata.json') as BookMetadata;
  console.log('Books metadata imported successfully');
} catch (error) {
  console.error('Failed to import books-metadata.json:', error);
  // Fallback to empty metadata
  booksMetadata = { books: [] };
}

export const getBooks = (): Book[] => {
  try {
    if (!booksMetadata) {
      console.warn('Books metadata is null, returning empty array');
      return [];
    }
    
    const metadata = booksMetadata as BookMetadata;
    if (!metadata || !metadata.books) {
      console.error('Invalid metadata structure:', metadata);
      return [];
    }
    console.log('Loaded', metadata.books.length, 'books from metadata');
    return metadata.books;
  } catch (error) {
    console.error('Error loading books metadata:', error);
    return [];
  }
};

export const getBookById = (id: string): Book | undefined => {
  return getBooks().find(book => book.id === id);
};

export const getBooksByCategory = (category: string): Book[] => {
  return getBooks().filter(book => 
    book.categories.some(cat => cat.toLowerCase() === category.toLowerCase())
  );
};

export const getAllCategories = (): string[] => {
  const books = getBooks();
  const categories = new Set<string>();
  books.forEach(book => {
    book.categories.forEach(cat => categories.add(cat));
  });
  return Array.from(categories).sort();
};

