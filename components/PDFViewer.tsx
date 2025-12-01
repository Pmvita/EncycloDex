import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Platform, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { getAssetUri } from '../lib/assetLoader';

interface PDFViewerProps {
  source: string; // Path relative to assets/books (e.g., "biblical/book.pdf")
  onPageChange?: (page: number, totalPages: number) => void;
  initialPage?: number;
}

// Native PDF Viewer Component (iOS/Android)
export const PDFViewer: React.FC<PDFViewerProps> = ({
  source,
  onPageChange,
  initialPage = 1,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        const uri = await getAssetUri(source);
        setPdfUri(uri);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF');
        setLoading(false);
      }
    };

    loadPDF();
  }, [source]);

  // Only use react-native-pdf on native platforms
  if (Platform.OS === 'web') {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="document" size={48} color="#999" />
        <Text style={styles.errorText}>PDF viewer not available on web. Please use the web version.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading PDF...</Text>
      </View>
    );
  }

  if (error || !pdfUri) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={64} color="#f44336" />
        <Text style={styles.infoTitle}>Unable to Load PDF</Text>
        <Text style={styles.errorText}>
          {error || 'PDF not found'}
        </Text>
        {pdfUri && (
          <TouchableOpacity
            style={styles.openButton}
            onPress={() => {
              Linking.openURL(pdfUri).catch(err => {
                console.error('Failed to open PDF:', err);
              });
            }}
          >
            <Ionicons name="open-outline" size={20} color="#fff" />
            <Text style={styles.openButtonText}>Open in Browser</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.suggestionText}>
          Or switch to Markdown view to read the content
        </Text>
      </View>
    );
  }

  // Use PDF.js to render PDF in WebView
  // This works in Expo Go by embedding PDF.js in HTML
  // Render all pages for better scrolling experience
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background-color: #525252;
            overflow-x: hidden;
            padding: 10px;
          }
          #pdf-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
          }
          canvas {
            margin: 10px 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            max-width: 100%;
            height: auto;
            display: block;
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
        </style>
      </head>
      <body>
        <div id="pdf-container">
          <div class="loading">Loading PDF...</div>
        </div>
        <script>
          (function() {
            const container = document.getElementById('pdf-container');
            const pdfUrl = '${pdfUri}';
            
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

            pdfjsLib.getDocument({
              url: pdfUrl,
              withCredentials: false
            }).promise.then(function(pdf) {
              container.innerHTML = '';
              
              // Render all pages
              const numPages = pdf.numPages;
              let pagesRendered = 0;
              
              function renderAllPages() {
                for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                  pdf.getPage(pageNum).then(function(page) {
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    const renderContext = {
                      canvasContext: ctx,
                      viewport: viewport
                    };
                    
                    page.render(renderContext).promise.then(function() {
                      container.appendChild(canvas);
                      pagesRendered++;
                      if (pagesRendered === numPages) {
                        // All pages rendered
                        if (window.ReactNativeWebView) {
                          window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'PDF_LOADED',
                            totalPages: numPages
                          }));
                        }
                      }
                    });
                  }).catch(function(error) {
                    console.error('Error rendering page ' + pageNum + ':', error);
                  });
                }
              }
              
              renderAllPages();
            }).catch(function(error) {
              console.error('Error loading PDF:', error);
              container.innerHTML = '<div class="error">Error loading PDF. Please try opening in browser or switch to Markdown view.</div>';
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'PDF_ERROR',
                  error: error.message
                }));
              }
            });
          })();
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        onLoadStart={() => {
          setLoading(true);
          setError(null);
        }}
        onLoadEnd={() => {
          setLoading(false);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          setError('Failed to load PDF viewer. Please try opening in browser.');
          setLoading(false);
        }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'PDF_LOADED') {
              setLoading(false);
              if (onPageChange && data.totalPages) {
                onPageChange(initialPage, data.totalPages);
              }
            } else if (data.type === 'PDF_ERROR') {
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
    backgroundColor: '#525252',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  infoTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  openButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionText: {
    marginTop: 16,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
