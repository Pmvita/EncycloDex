import Fuse from 'fuse.js';
import { Book } from '../types/book';
import { getBooks } from './books';

const searchOptions: Fuse.IFuseOptions<Book> = {
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'author', weight: 0.5 },
    { name: 'description', weight: 0.3 },
    { name: 'categories', weight: 0.4 },
  ],
  threshold: 0.4,
  includeScore: true,
};

let fuseInstance: Fuse<Book> | null = null;

export const initializeSearch = () => {
  const books = getBooks();
  fuseInstance = new Fuse(books, searchOptions);
};

export const searchBooks = (query: string): Book[] => {
  if (!fuseInstance) {
    initializeSearch();
  }
  
  if (!query.trim()) {
    return getBooks();
  }

  const results = fuseInstance!.search(query);
  return results.map(result => result.item);
};

export const searchBooksByCategory = (category: string, query?: string): Book[] => {
  const books = getBooks();
  const filtered = books.filter(book => 
    book.categories.some(cat => cat.toLowerCase() === category.toLowerCase())
  );

  if (!query || !query.trim()) {
    return filtered;
  }

  const fuse = new Fuse(filtered, searchOptions);
  const results = fuse.search(query);
  return results.map(result => result.item);
};

