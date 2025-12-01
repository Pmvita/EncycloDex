import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Platform } from 'react-native';
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
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const pdfRef = useRef<any>(null);

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

  const handlePageChange = (page: number, numberOfPages: number) => {
    setCurrentPage(page);
    setTotalPages(numberOfPages);
    onPageChange?.(page, numberOfPages);
  };

  const goToPage = (page: number) => {
    if (pdfRef.current && page >= 1 && page <= totalPages) {
      pdfRef.current.setPage(page);
    }
  };

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

  // Only use react-native-pdf on native platforms
  if (Platform.OS === 'web') {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="document" size={48} color="#999" />
        <Text style={styles.errorText}>PDF viewer not available on web. Please use the web version.</Text>
      </View>
    );
  }

  // Check if react-native-pdf is available (only in development builds, not Expo Go)
  // Use a function to safely check for the module
  const getPdfComponent = () => {
    try {
      // Only try to require if we're on native and not web
      if (Platform.OS === 'web') {
        return null;
      }
      // This will fail in Expo Go, which is expected
      return require('react-native-pdf').default;
    } catch (err) {
      return null;
    }
  };

  const Pdf = getPdfComponent();
  
  if (!Pdf) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle" size={48} color="#f44336" />
        <Text style={styles.errorText}>PDF viewer not available. Please create a development build.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pdf
        ref={pdfRef}
        source={{ uri: pdfUri, cache: true }}
        style={styles.pdf}
        onLoadComplete={(numberOfPages: number) => {
          setTotalPages(numberOfPages);
          setLoading(false);
        }}
        onPageChanged={(page: number, numberOfPages: number) => {
          handlePageChange(page, numberOfPages);
        }}
        onError={(error: any) => {
          console.error('PDF error:', error);
          setError('Error displaying PDF');
        }}
        enablePaging
        page={initialPage}
      />
      
      {totalPages > 0 && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, currentPage === 1 && styles.buttonDisabled]}
            onPress={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <Ionicons name="chevron-back" size={24} color={currentPage === 1 ? '#ccc' : '#333'} />
          </TouchableOpacity>
          
          <Text style={styles.pageInfo}>
            {currentPage} / {totalPages}
          </Text>
          
          <TouchableOpacity
            style={[styles.button, currentPage === totalPages && styles.buttonDisabled]}
            onPress={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <Ionicons name="chevron-forward" size={24} color={currentPage === totalPages ? '#ccc' : '#333'} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pdf: {
    flex: 1,
    width: '100%',
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
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    padding: 8,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  pageInfo: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
