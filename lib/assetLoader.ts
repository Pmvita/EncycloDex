import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

/**
 * Get the URI for an asset file
 * For web and native: uses fetch from assets/books via Metro dev server
 * 
 * @param filepath - Path relative to assets/books (e.g., "biblical/book.pdf" or "book.pdf")
 */
export const getAssetUri = async (filepath: string): Promise<string> => {
  // Encode each path segment separately to handle spaces in folder names
  const encodedPath = filepath.split('/').map(segment => encodeURIComponent(segment)).join('/');
  
  if (Platform.OS === 'web') {
    // For web, Metro serves files from assets/books
    return `/assets/books/${encodedPath}`;
  }

  // For native platforms, fetch from Metro dev server (same as web during development)
  // In production builds with EAS Updates, use the Updates API
  // encodedPath is already declared above, reuse it
  
  if (__DEV__) {
    // Get the dev server URL from Constants
    // For simulator, use localhost; for device, use the debugger host
    let baseUrl = 'http://localhost:8081';
    
    // Try to get the actual dev server URL from Constants
    if (Constants.expoConfig?.hostUri) {
      // hostUri is like "192.168.2.50:8081", add http://
      baseUrl = `http://${Constants.expoConfig.hostUri}`;
    } else if (Constants.manifest?.debuggerHost) {
      baseUrl = `http://${Constants.manifest.debuggerHost}`;
    }
    
    const finalUrl = `${baseUrl}/assets/books/${encodedPath}`;
    return finalUrl;
  }
  
  // In production builds with EAS Updates, use the Updates API to get asset URL
  if (Updates.isEnabled && Updates.updateId) {
    // Use the Updates API to get the asset URL
    const updatesUrl = Updates.url || '';
    if (updatesUrl) {
      // Construct URL for assets served by EAS Updates
      return `${updatesUrl}/assets/books/${encodedPath}`;
    }
  }
  
  // Fallback: try to use the manifest URL if available
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

