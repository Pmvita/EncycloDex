import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { readAssetText } from '../lib/assetLoader';

interface MarkdownViewerProps {
  source: string; // Path relative to assets/books (e.g., "biblical/book.md")
  onScroll?: (position: number) => void;
  initialPosition?: number;
  fontSize?: number;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  source,
  onScroll,
  initialPosition = 0,
  fontSize = 16,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadMarkdown = async () => {
      try {
        const fileContent = await readAssetText(source);
        setContent(fileContent);
        setLoading(false);

        // Scroll to initial position after content loads
        if (initialPosition > 0 && scrollViewRef.current) {
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: initialPosition, animated: false });
          }, 100);
        }
      } catch (err) {
        console.error('Error loading markdown:', err);
        setError('Failed to load markdown file');
        setLoading(false);
      }
    };

    loadMarkdown();
  }, [source, initialPosition]);

  const handleScroll = (event: any) => {
    const position = event.nativeEvent.contentOffset.y;
    onScroll?.(position);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading content...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const markdownStyles = {
    body: {
      fontSize,
      lineHeight: fontSize * 1.6,
      color: '#1a1a1a',
    },
    heading1: {
      fontSize: fontSize * 1.8,
      fontWeight: '700',
      marginTop: 24,
      marginBottom: 12,
    },
    heading2: {
      fontSize: fontSize * 1.5,
      fontWeight: '600',
      marginTop: 20,
      marginBottom: 10,
    },
    heading3: {
      fontSize: fontSize * 1.3,
      fontWeight: '600',
      marginTop: 16,
      marginBottom: 8,
    },
    paragraph: {
      marginBottom: 12,
    },
    code_inline: {
      backgroundColor: '#f5f5f5',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: 'monospace',
    },
    code_block: {
      backgroundColor: '#f5f5f5',
      padding: 12,
      borderRadius: 8,
      marginVertical: 12,
      fontFamily: 'monospace',
    },
    list_item: {
      marginBottom: 8,
    },
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <Markdown style={markdownStyles}>{content}</Markdown>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
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
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
});
