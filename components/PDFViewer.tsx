import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Platform, ActivityIndicator } from 'react-native';
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
        <Ionicons name="alert-circle" size={48} color="#f44336" />
        <Text style={styles.errorText}>{error || 'PDF not found'}</Text>
      </View>
    );
  }

  // Use WebView to display PDF from Metro server
  // This works in Expo Go without needing react-native-pdf
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: pdfUri }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error:', nativeEvent);
          setError('Failed to load PDF');
          setLoading(false);
        }}
        // Enable PDF viewing in WebView
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
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
    backgroundColor: '#f5f5f5',
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
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    lineHeight: 24,
  },
});
