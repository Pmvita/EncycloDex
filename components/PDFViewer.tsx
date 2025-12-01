import React from 'react';
import { View, StyleSheet, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  // Only use react-native-pdf on native platforms
  if (Platform.OS === 'web') {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="document" size={48} color="#999" />
        <Text style={styles.errorText}>PDF viewer not available on web. Please use the web version.</Text>
      </View>
    );
  }

  // PDF viewer requires react-native-pdf which is only available in development builds
  // In Expo Go, we show a fallback message
  // TODO: Re-enable PDF viewing when using a development build
  return (
    <View style={styles.centerContainer}>
      <Ionicons name="document-text" size={48} color="#999" />
      <Text style={styles.errorText}>
        PDF viewer requires a development build.{'\n'}
        Please create a development build to view PDFs, or switch to Markdown view.
      </Text>
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
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
