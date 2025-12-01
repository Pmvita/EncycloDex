import { useState, useMemo } from 'react';
import { Book } from '../types/book';
import { searchBooks, initializeSearch } from '../lib/search';
import { useEffect } from 'react';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);

  useEffect(() => {
    initializeSearch();
  }, []);

  useEffect(() => {
    const searchResults = searchBooks(query);
    setResults(searchResults);
  }, [query]);

  return {
    query,
    setQuery,
    results,
  };
};

