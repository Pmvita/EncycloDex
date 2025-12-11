import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Get the URI for an asset file
 * Priority:
 * 1. Supabase Storage (if configured) - for production
 * 2. Metro dev server - for development
 * 3. EAS Updates - fallback
 * 
 * @param filepath - Path relative to assets/books (e.g., "biblical/book.pdf" or "book.pdf")
 */
export const getAssetUri = async (filepath: string): Promise<string> => {
  // Encode each path segment separately to handle spaces in folder names
  const encodedPath = filepath.split('/').map(segment => encodeURIComponent(segment)).join('/');
  
  // Priority 1: Supabase Storage (production/cloud storage)
  if (isSupabaseConfigured() && !__DEV__) {
    try {
      const { data } = await supabase
        .storage
        .from('books')
        .getPublicUrl(encodedPath);
      
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    } catch (error) {
      console.warn('Failed to get Supabase URL, falling back to local:', error);
    }
  }
  
  // Priority 2: Development - Metro dev server
  if (Platform.OS === 'web' || __DEV__) {
    if (Platform.OS === 'web') {
      // For web, Metro serves files from assets/books
      return `/assets/books/${encodedPath}`;
    }
    
    // For native dev, use Metro dev server
    let baseUrl = 'http://localhost:8081';
    
    if (Constants.expoConfig?.hostUri) {
      baseUrl = `http://${Constants.expoConfig.hostUri}`;
    } else if (Constants.manifest?.debuggerHost) {
      baseUrl = `http://${Constants.manifest.debuggerHost}`;
    }
    
    return `${baseUrl}/assets/books/${encodedPath}`;
  }
  
  // Priority 3: EAS Updates (fallback for production if Supabase not configured)
  if (Updates.isEnabled && Updates.updateId) {
    const updatesUrl = Updates.url || '';
    if (updatesUrl) {
      return `${updatesUrl}/assets/books/${encodedPath}`;
    }
  }
  
  // Last resort: try to use the manifest URL if available
  if (Constants.expoConfig?.hostUri) {
    return `https://${Constants.expoConfig.hostUri}/assets/books/${encodedPath}`;
  }
  
  // Last resort: return empty (will show error, but won't crash)
  console.warn('Could not determine asset URL for production build:', filepath);
  return '';
};

/**
 * Read text content from an asset file
 * 
 * @param filepath - Path relative to assets/books (e.g., "biblical/book.md" or "book.md")
 */
export const readAssetText = async (filepath: string): Promise<string> => {
  // For both web and native, fetch from Metro dev server (serves assets/books)
  try {
    const uri = await getAssetUri(filepath);
    
    // Add timeout to fetch - increase for large files
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for large files
    
    try {
      const response = await fetch(uri, {
        signal: controller.signal,
        headers: {
          'Accept': 'text/markdown, text/plain, */*',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`Failed to fetch ${uri}: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to load ${filepath}: ${response.status} ${response.statusText}`);
      }
      
      // Check content length for large files
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        const sizeMB = parseInt(contentLength) / (1024 * 1024);
        if (sizeMB > 2) {
          console.warn(`Large file detected (${sizeMB.toFixed(2)} MB), loading may take a moment...`);
        }
      }
      
      const text = await response.text();
      if (!text || text.length === 0) {
        throw new Error(`Empty response for ${filepath}`);
      }
      
      return text;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error(`Request timeout: ${filepath} took too long to load. The file may be very large.`);
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error reading asset:', error);
    console.error('Filepath that failed:', filepath);
    throw new Error(`Failed to load ${filepath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

