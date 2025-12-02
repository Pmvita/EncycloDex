import { useState, useEffect } from 'react';
import { Book } from '../types/book';
import { getBooks } from '../lib/books';

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const loadBooks = async () => {
      try {
        // Add small delay to ensure component is mounted
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!isMounted) return;
        
        const allBooks = getBooks();
        console.log('useBooks: Loaded', allBooks.length, 'books');
        
        if (isMounted) {
          setBooks(allBooks);
          setLoading(false);
        }
      } catch (error) {
        console.error('useBooks: Error loading books:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBooks();
    
    // Safety timeout - force loading to false after 2 seconds
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.warn('useBooks: Loading timeout - forcing loading to false');
        setLoading(false);
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  return { books, loading };
};

