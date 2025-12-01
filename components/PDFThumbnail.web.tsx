import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAssetUri } from '../lib/assetLoader';

interface PDFThumbnailProps {
  source?: string; // Path relative to assets/books
  categoryColor: string;
  size?: number;
}

export const PDFThumbnail: React.FC<PDFThumbnailProps> = ({
  source,
  categoryColor,
  size = 60,
}) => {
  const [loading, setLoading] = useState(true);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  useEffect(() => {
    if (!source) {
      setLoading(false);
      return;
    }

    const loadPDF = async () => {
      try {
        const uri = await getAssetUri(source);
        setPdfUri(uri);
        setLoading(false);
      } catch (err) {
        console.error('Error loading PDF thumbnail:', err);
        setLoading(false);
      }
    };

    loadPDF();
  }, [source]);

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, { width: size, height: size, backgroundColor: categoryColor }]}>
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }

  // For web, show document icon with category color background
  // PDF thumbnails on web would require canvas rendering which is complex
  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor: categoryColor }]}>
      <Ionicons 
        name={source?.endsWith('.md') ? 'document' : 'document-text'} 
        size={size * 0.5} 
        color="#fff" 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  thumbnailContainer: {
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
});

