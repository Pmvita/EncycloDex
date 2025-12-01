import { useState, useEffect } from 'react';
import { Book } from '../types/book';
import { getBooks } from '../lib/books';

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooks = () => {
      try {
        const allBooks = getBooks();
        console.log('Loaded books:', allBooks.length);
        setBooks(allBooks);
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  return { books, loading };
};

