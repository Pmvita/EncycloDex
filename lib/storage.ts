import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bookmark, Note, ReadingProgress } from '../types/book';

const STORAGE_KEYS = {
  BOOKMARKS: '@encyclodex:bookmarks',
  NOTES: '@encyclodex:notes',
  READING_PROGRESS: '@encyclodex:reading_progress',
  SETTINGS: '@encyclodex:settings',
};

// Bookmarks
export const getBookmarks = async (): Promise<Bookmark[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
};

export const saveBookmark = async (bookmark: Bookmark): Promise<void> => {
  try {
    const bookmarks = await getBookmarks();
    const updated = [...bookmarks.filter(b => b.id !== bookmark.id), bookmark];
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving bookmark:', error);
  }
};

export const deleteBookmark = async (bookmarkId: string): Promise<void> => {
  try {
    const bookmarks = await getBookmarks();
    const updated = bookmarks.filter(b => b.id !== bookmarkId);
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting bookmark:', error);
  }
};

export const getBookmarksByBookId = async (bookId: string): Promise<Bookmark[]> => {
  const bookmarks = await getBookmarks();
  return bookmarks.filter(b => b.bookId === bookId);
};

// Notes
export const getNotes = async (): Promise<Note[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting notes:', error);
    return [];
  }
};

export const saveNote = async (note: Note): Promise<void> => {
  try {
    const notes = await getNotes();
    const updated = [...notes.filter(n => n.id !== note.id), note];
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving note:', error);
  }
};

export const deleteNote = async (noteId: string): Promise<void> => {
  try {
    const notes = await getNotes();
    const updated = notes.filter(n => n.id !== noteId);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting note:', error);
  }
};

export const getNotesByBookId = async (bookId: string): Promise<Note[]> => {
  const notes = await getNotes();
  return notes.filter(n => n.bookId === bookId);
};

// Reading Progress
export const getReadingProgress = async (): Promise<Record<string, ReadingProgress>> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.READING_PROGRESS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting reading progress:', error);
    return {};
  }
};

export const saveReadingProgress = async (progress: ReadingProgress): Promise<void> => {
  try {
    const allProgress = await getReadingProgress();
    allProgress[progress.bookId] = progress;
    await AsyncStorage.setItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Error saving reading progress:', error);
  }
};

export const getProgressForBook = async (bookId: string): Promise<ReadingProgress | null> => {
  const allProgress = await getReadingProgress();
  return allProgress[bookId] || null;
};

// Settings
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: number;
  defaultView: 'pdf' | 'markdown';
}

export const getSettings = async (): Promise<AppSettings> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      theme: 'auto',
      fontSize: 16,
      defaultView: 'markdown',
    };
  } catch (error) {
    console.error('Error getting settings:', error);
    return {
      theme: 'auto',
      fontSize: 16,
      defaultView: 'markdown',
    };
  }
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
};

