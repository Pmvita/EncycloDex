import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

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

  // For native platforms, fetch from Metro dev server (same as web during development)
  // In production builds with EAS Updates, use the Updates API
  const encodedPath = filepath.split('/').map(segment => encodeURIComponent(segment)).join('/');
  
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
    
    return `${baseUrl}/assets/books/${encodedPath}`;
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
  if (Platform.OS === 'web') {
    // For web, fetch the file from public directory
    try {
      // Encode each path segment separately to handle spaces in folder names
      const encodedPath = filepath.split('/').map(segment => encodeURIComponent(segment)).join('/');
      const url = `/assets/books/${encodedPath}`;
      console.log('Fetching markdown from:', url);
      console.log('Original filepath:', filepath);
      
      const response = await fetch(url);
      if (!response.ok) {
        // Try alternative path formats if the first fails
        const altUrl = `/assets/books/${encodeURI(filepath)}`;
        console.log('Trying alternative URL:', altUrl);
        const altResponse = await fetch(altUrl);
        
        if (!altResponse.ok) {
          console.error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
          console.error(`Also failed to fetch ${altUrl}: ${altResponse.status} ${altResponse.statusText}`);
          throw new Error(`Failed to load ${filepath}: ${response.status} ${response.statusText}`);
        }
        
        const text = await altResponse.text();
        if (!text || text.length === 0) {
          throw new Error(`Empty response for ${filepath}`);
        }
        return text;
      }
      
      const text = await response.text();
      if (!text || text.length === 0) {
        throw new Error(`Empty response for ${filepath}`);
      }
      return text;
    } catch (error) {
      console.error('Error fetching asset:', error);
      console.error('Filepath that failed:', filepath);
      throw new Error(`Failed to load ${filepath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // For native, fetch from Metro dev server (same approach as web)
  try {
    const uri = await getAssetUri(filepath);
    console.log('Fetching markdown from native:', uri);
    
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
        console.log(`File size: ${sizeMB.toFixed(2)} MB`);
        if (sizeMB > 2) {
          console.warn(`Large file detected (${sizeMB.toFixed(2)} MB), loading may take a moment...`);
        }
      }
      
      const text = await response.text();
      if (!text || text.length === 0) {
        throw new Error(`Empty response for ${filepath}`);
      }
      
      const sizeMB = (text.length / (1024 * 1024)).toFixed(2);
      console.log(`Successfully loaded ${filepath}, size: ${sizeMB} MB (${text.length} characters)`);
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

