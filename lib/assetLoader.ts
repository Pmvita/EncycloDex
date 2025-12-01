import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

/**
 * Get the URI for an asset file
 * For web: uses fetch from public/assets/books
 * For native: uses file system document directory
 * 
 * @param filepath - Path relative to assets/books (e.g., "biblical/book.pdf" or "book.pdf")
 */
export const getAssetUri = async (filepath: string): Promise<string> => {
  if (Platform.OS === 'web') {
    // For web, assets should be in public/assets/books
    // Expo web serves files from the public directory
    // Encode each path segment separately to handle spaces in folder names
    const encodedPath = filepath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    return `/assets/books/${encodedPath}`;
  }

  // For native platforms, use document directory
  // Maintain folder structure if filepath includes folder
  const documentUri = `${FileSystem.documentDirectory}books/${filepath}`;
  const fileInfo = await FileSystem.getInfoAsync(documentUri);

  if (fileInfo.exists) {
    return documentUri;
  }

  // For native, we'll need to handle asset copying differently
  // This is a placeholder - in production you'd copy from bundle
  return documentUri;
};

/**
 * Read text content from an asset file
 * 
 * @param filepath - Path relative to assets/books (e.g., "biblical/book.md" or "book.md")
 */
export const readAssetText = async (filepath: string): Promise<string> => {
  if (Platform.OS === 'web') {
    // For web, fetch the file from public directory
    try {
      // Encode each path segment separately to handle spaces in folder names
      const encodedPath = filepath.split('/').map(segment => encodeURIComponent(segment)).join('/');
      const url = `/assets/books/${encodedPath}`;
      console.log('Fetching markdown from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to load ${filepath}: ${response.status} ${response.statusText}`);
      }
      const text = await response.text();
      if (!text || text.length === 0) {
        throw new Error(`Empty response for ${filepath}`);
      }
      return text;
    } catch (error) {
      console.error('Error fetching asset:', error);
      throw new Error(`Failed to load ${filepath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // For native, read from document directory
  try {
    const uri = await getAssetUri(filepath);
    return await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  } catch (error) {
    console.error('Error reading asset:', error);
    throw new Error(`Failed to load ${filepath}`);
  }
};

/**
 * Initialize assets by copying from bundle to document directory
 * This should be called at app startup
 */
export const initializeAssets = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    // Web doesn't need initialization
    return;
  }

  // Ensure books directory exists
  const booksDir = `${FileSystem.documentDirectory}books/`;
  const dirInfo = await FileSystem.getInfoAsync(booksDir);
  
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(booksDir, { intermediates: true });
  }

  // Note: In a real app, you'd want to copy assets from the bundle
  // For now, we'll handle this lazily when files are accessed
};

