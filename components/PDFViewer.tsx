import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, Platform, ActivityIndicator, TouchableOpacity, Linking, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { getAssetUri } from '../lib/assetLoader';

// Base64 encoding function (React Native compatible)
const base64Encode = (uint8Array: Uint8Array): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  while (i < uint8Array.length) {
    const a = uint8Array[i++];
    const b = i < uint8Array.length ? uint8Array[i++] : 0;
    const c = i < uint8Array.length ? uint8Array[i++] : 0;
    const bitmap = (a << 16) | (b << 8) | c;
    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += i - 2 < uint8Array.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    result += i - 1 < uint8Array.length ? chars.charAt(bitmap & 63) : '=';
  }
  return result;
};

interface PDFViewerProps {
  source: string; // Path relative to assets/books (e.g., "biblical/book.pdf")
  onPageChange?: (page: number, totalPages: number) => void;
  initialPage?: number;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  source,
  onPageChange,
  initialPage = 1,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null); // Changed from pdfUri to pdfDataUrl (base64 data URL)
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState<string>('Initializing...');
  const webViewRef = useRef<WebView>(null);
  const screenWidth = Dimensions.get('window').width;
  const initialPageRef = useRef(initialPage);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        setLoadingProgress('Getting PDF location...');
        const uri = await getAssetUri(source);
        setLoadingProgress('Fetching PDF data...');
        
        // Fetch PDF in React Native (bypasses WebView fetch restrictions)
        const response = await fetch(uri);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
        }
        
        setLoadingProgress('Converting PDF to base64...');
        // Convert response to arrayBuffer then to base64 (React Native compatible)
        const arrayBuffer = await response.arrayBuffer();
        
        // Convert ArrayBuffer to base64 (React Native compatible)
        const uint8Array = new Uint8Array(arrayBuffer);
        // Use custom base64 encoding function (btoa may not be available in React Native)
        const base64String = base64Encode(uint8Array);
        const base64DataUrl = `data:application/pdf;base64,${base64String}`;
        
        setPdfDataUrl(base64DataUrl);
        setLoadingProgress('Loading PDF...');
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF: ' + (err instanceof Error ? err.message : 'Unknown error'));
        setLoading(false);
      }
    };

    loadPDF();
  }, [source]);

  // Handle page navigation
  const goToPage = useCallback((page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages || 999999));
    setCurrentPage(newPage);
    
    // Send message to WebView to change page
    if (webViewRef.current && totalPages > 0) {
      webViewRef.current.postMessage(JSON.stringify({
        type: 'CHANGE_PAGE',
        page: newPage
      }));
    }
    
    if (onPageChange && totalPages > 0) {
      onPageChange(newPage, totalPages);
    }
  }, [totalPages, onPageChange]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, totalPages, goToPage]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  // Update current page when initialPage prop changes
  useEffect(() => {
    if (initialPage !== initialPageRef.current && initialPage > 0 && totalPages > 0) {
      initialPageRef.current = initialPage;
      goToPage(initialPage);
    }
  }, [initialPage, totalPages, goToPage]);

  // Generate HTML for single-page PDF viewer with navigation
  const htmlContent = useMemo(() => {
    if (!pdfDataUrl) {
      return '';
    }
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js" crossorigin="anonymous"></script>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              background-color: #525252;
              overflow-x: hidden;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 20px 10px;
            }
            #pdf-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 100%;
              max-width: 100%;
            }
            #page-canvas {
              max-width: 100%;
              height: auto;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
              background: white;
            }
            .loading {
              color: white;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              text-align: center;
              padding: 40px 20px;
              font-size: 16px;
            }
            .error {
              color: #f44336;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              text-align: center;
              padding: 40px 20px;
              font-size: 16px;
            }
            .page-info {
              color: white;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              margin-top: 16px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div id="pdf-container">
            <div id="loading-text" class="loading">Loading PDF...</div>
          </div>
          <script>
            (function() {
              const container = document.getElementById('pdf-container');
              // Use base64 data URL instead of HTTP URL
              const pdfDataUrl = ${JSON.stringify(pdfDataUrl || '')};
              let pdfDoc = null;
              let currentPageNum = ${currentPage || 1};
              let totalPagesNum = 0;
              
              // Calculate scale to fit screen width
              const screenWidth = ${screenWidth};
              const targetWidth = screenWidth - 40; // Account for padding
              
              // Configure PDF.js
              pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              pdfjsLib.GlobalWorkerOptions.verbosity = 0;
              
              function renderPage(pageNum) {
                if (!pdfDoc || pageNum < 1 || pageNum > totalPagesNum) return;
                
                // Remove existing canvas
                const existingCanvas = document.getElementById('page-canvas');
                if (existingCanvas) {
                  container.removeChild(existingCanvas);
                }
                
                const loadingText = document.getElementById('loading-text');
                
                pdfDoc.getPage(pageNum).then(function(page) {
                  // Calculate scale to fit width
                  const viewport = page.getViewport({ scale: 1.0 });
                  const scale = targetWidth / viewport.width;
                  const scaledViewport = page.getViewport({ scale: scale });
                  
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  canvas.id = 'page-canvas';
                  canvas.height = scaledViewport.height;
                  canvas.width = scaledViewport.width;
                  
                  const renderContext = {
                    canvasContext: ctx,
                    viewport: scaledViewport
                  };
                  
                  page.render(renderContext).promise.then(function() {
                    container.appendChild(canvas);
                    // Always hide loading text when page is rendered
                    if (loadingText) {
                      loadingText.style.display = 'none';
                    }
                    
                    // Notify React Native
                    if (window.ReactNativeWebView) {
                      window.ReactNativeWebView.postMessage(JSON.stringify({
                        type: 'PAGE_RENDERED',
                        currentPage: pageNum,
                        totalPages: totalPagesNum
                      }));
                    }
                  }).catch(function(error) {
                    console.error('Error rendering page:', error);
                    container.innerHTML = '<div class="error">Error rendering page ' + pageNum + '</div>';
                  });
                }).catch(function(error) {
                  console.error('Error getting page:', error);
                  container.innerHTML = '<div class="error">Error loading page ' + pageNum + '</div>';
                });
              }
              
              // Load PDF document using base64 data URL
              // For base64 data URLs, pass the string directly (not as { data: ... })
              // The 'data' property is for Uint8Array/ArrayBuffer, not strings
              pdfjsLib.getDocument({
                url: pdfDataUrl, // Use 'url' for data URLs (PDF.js handles data: URLs)
                verbosity: 0,
                useSystemFonts: true
              }).promise.then(function(pdf) {
                pdfDoc = pdf;
                totalPagesNum = pdf.numPages;
                currentPageNum = Math.min(currentPageNum, totalPagesNum);
                currentPageNum = Math.max(1, currentPageNum);
                
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'PDF_LOADED',
                    totalPages: totalPagesNum,
                    currentPage: currentPageNum
                  }));
                }
                
                // Render initial page
                renderPage(currentPageNum);
              }).catch(function(error) {
                console.error('Error loading PDF:', error);
                const errorMsg = error.message || 'Unknown error';
                container.innerHTML = '<div class="error">Error loading PDF: ' + errorMsg + '</div>';
                
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'PDF_ERROR',
                    error: errorMsg
                  }));
                }
              });
              
              // Listen for page change messages from React Native
              window.addEventListener('message', function(event) {
                try {
                  const data = JSON.parse(event.data);
                  if (data.type === 'CHANGE_PAGE' && data.page) {
                    currentPageNum = Math.max(1, Math.min(data.page, totalPagesNum));
                    renderPage(currentPageNum);
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              });
            })();
          </script>
        </body>
      </html>
    `;
  }, [pdfDataUrl, currentPage, screenWidth]);

  // Only use on native platforms
  if (Platform.OS === 'web') {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="document" size={48} color="#999" />
        <Text style={styles.errorText}>PDF viewer not available on web. Please use the web version.</Text>
      </View>
    );
  }

  // Only show error if we're not loading and there's actually an error or no data
  if (!loading && (error || !pdfDataUrl)) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color="#f44336" />
        <Text style={styles.infoTitle}>Unable to Load PDF</Text>
        <Text style={styles.errorText}>
          {error || 'PDF not found'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Loading overlay */}
      {loading && (
        <View style={styles.overlay}>
          <View style={styles.overlayContent}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.overlayTitle}>Loading PDF</Text>
            <Text style={styles.overlayText}>{loadingProgress}</Text>
          </View>
        </View>
      )}
      
      {/* PDF WebView */}
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onLoadStart={() => {
          setError(null);
        }}
        onLoadEnd={() => {
          // WebView loaded, but PDF.js might still be loading
          // Don't set loading to false here - wait for PAGE_RENDERED message
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          setError('Failed to load PDF viewer.');
          setLoading(false);
        }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'PDF_LOADED') {
              setTotalPages(data.totalPages || 0);
              setCurrentPage(data.currentPage || 1);
              // Don't set loading to false here - wait for PAGE_RENDERED
              if (onPageChange) {
                onPageChange(data.currentPage || 1, data.totalPages || 0);
              }
            } else if (data.type === 'PAGE_RENDERED') {
              setCurrentPage(data.page || currentPage);
              setTotalPages(data.totalPages || totalPages);
              // Hide loading overlay when first page is actually rendered
              setLoading(false);
              if (onPageChange) {
                onPageChange(data.page || currentPage, data.totalPages || totalPages);
              }
            } else if (data.type === 'PDF_ERROR') {
              console.error('PDF error:', data.error);
              setError('Failed to load PDF: ' + (data.error || 'Unknown error'));
              setLoading(false);
            }
          } catch (e) {
            // Ignore parse errors
          }
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        originWhitelist={['*']}
        mixedContentMode="always"
      />
      
      {/* Page Navigation Controls */}
      {totalPages > 0 && !loading && (
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentPage === 1 && styles.navButtonDisabled]}
            onPress={goToPrevPage}
            disabled={currentPage === 1}
          >
            <Ionicons 
              name="chevron-back" 
              size={24} 
              color={currentPage === 1 ? '#999' : '#fff'} 
            />
          </TouchableOpacity>
          
          <View style={styles.pageInfoContainer}>
            <Text style={styles.pageInfoText}>
              {currentPage} / {totalPages}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.navButton, currentPage === totalPages && styles.navButtonDisabled]}
            onPress={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <Ionicons 
              name="chevron-forward" 
              size={24} 
              color={currentPage === totalPages ? '#999' : '#fff'} 
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#525252',
  },
  webview: {
    flex: 1,
    backgroundColor: '#525252',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 200,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  overlayText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  openButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButton: {
    backgroundColor: '#4CAF50',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    backgroundColor: '#333',
  },
  pageInfoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  pageInfoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
