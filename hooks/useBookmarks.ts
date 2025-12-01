import { useState, useEffect, useCallback } from 'react';
import { Bookmark } from '../types/book';
import { getBookmarks, saveBookmark, deleteBookmark, getBookmarksByBookId } from '../lib/storage';

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    try {
      const data = await getBookmarks();
      setBookmarks(data);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const addBookmark = useCallback(async (bookmark: Bookmark) => {
    await saveBookmark(bookmark);
    await loadBookmarks();
  }, [loadBookmarks]);

  const removeBookmark = useCallback(async (bookmarkId: string) => {
    await deleteBookmark(bookmarkId);
    await loadBookmarks();
  }, [loadBookmarks]);

  const getBookBookmarks = useCallback(async (bookId: string) => {
    return await getBookmarksByBookId(bookId);
  }, []);

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    getBookBookmarks,
    refresh: loadBookmarks,
  };
};

