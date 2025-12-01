import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAssetUri } from '../lib/assetLoader';

interface PDFViewerProps {
  source: string; // Path relative to assets/books (e.g., "biblical/book.pdf")
  onPageChange?: (page: number, totalPages: number) => void;
  initialPage?: number;
}

// Web PDF Viewer Component using iframe
export const PDFViewer: React.FC<PDFViewerProps> = ({ source, onPageChange, initialPage = 1 }) => {
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

  // For web, use an iframe to display PDF
  return (
    <View style={styles.container}>
      {/* @ts-ignore - iframe is valid for web */}
      <iframe
        src={pdfUri}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="PDF Viewer"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  },
});

