import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  const [loadingProgress, setLoadingProgress] = useState<string>('Loading content...');
  const scrollViewRef = useRef<ScrollView>(null);

  // Memoize markdown styles to avoid recreating on every render
  // Must be called before any conditional returns (Rules of Hooks)
  const markdownStyles = useMemo(() => ({
    body: {
      fontSize,
      lineHeight: fontSize * 1.6,
      color: '#1a1a1a',
    },
    heading1: {
      fontSize: fontSize * 1.8,
      fontWeight: '700' as const,
      marginTop: 24,
      marginBottom: 12,
    },
    heading2: {
      fontSize: fontSize * 1.5,
      fontWeight: '600' as const,
      marginTop: 20,
      marginBottom: 10,
    },
    heading3: {
      fontSize: fontSize * 1.3,
      fontWeight: '600' as const,
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
  }), [fontSize]);

  // Memoize the markdown content to avoid re-rendering
  // Must be called before any conditional returns (Rules of Hooks)
  // Use a stable reference for markdownStyles to prevent unnecessary re-renders
  const markdownContent = useMemo(() => {
    if (!content) return null;
    return <Markdown style={markdownStyles}>{content}</Markdown>;
  }, [content, markdownStyles]);

  // Track if we've already loaded this source to prevent infinite loops
  const loadedSourceRef = useRef<string | null>(null);
  const hasScrolledToInitialRef = useRef(false);
  const lastInitialPositionRef = useRef(initialPosition);

  // Separate effect to handle scroll position updates (without reloading)
  useEffect(() => {
    // Only scroll if position changed and content is loaded
    if (content && !loading && initialPosition !== lastInitialPositionRef.current && scrollViewRef.current) {
      lastInitialPositionRef.current = initialPosition;
      if (initialPosition > 0) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ y: initialPosition, animated: false });
        }, 100);
      }
    }
  }, [initialPosition, content, loading]);

  useEffect(() => {
    // Only load if source changed
    if (loadedSourceRef.current === source) {
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const loadMarkdown = async () => {
      try {
        setLoadingProgress('Fetching file...');
        
        // Add timeout for fetch operation - increased for large files
        const fetchPromise = readAssetText(source);
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Request timeout: File is taking too long to load. Large files may need more time.'));
          }, 30000); // 30 second timeout for large markdown files
        });

        const fileContent = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (!isMounted) return;

        setLoadingProgress('Rendering content...');
        
        // Mark this source as loaded
        loadedSourceRef.current = source;
        hasScrolledToInitialRef.current = false;
        
        // For large files, set content immediately and let it render
        // The rendering happens asynchronously, so we can show content while it processes
        setContent(fileContent);
        setLoading(false); // Hide loading immediately, content will render progressively

        // Scroll to initial position after content loads (only once per source)
        if (initialPosition > 0 && scrollViewRef.current && !hasScrolledToInitialRef.current) {
          setTimeout(() => {
            if (scrollViewRef.current && !hasScrolledToInitialRef.current) {
              scrollViewRef.current.scrollTo({ y: initialPosition, animated: false });
              hasScrolledToInitialRef.current = true;
            }
          }, 100);
        }
      } catch (err) {
        if (!isMounted) return;
        
        console.error('Error loading markdown:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load markdown file';
        
        if (errorMessage.includes('timeout')) {
          setError('File is taking too long to load. Large files (5MB+) may need more time. Please wait or check your connection.');
        } else if (errorMessage.includes('404')) {
          setError('File not found. The markdown file may not exist.');
        } else {
          setError(`Failed to load: ${errorMessage}`);
        }
        setLoading(false);
      }
    };

    loadMarkdown();

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [source]); // Removed initialPosition from dependencies to prevent infinite loops

  const handleScroll = (event: any) => {
    const position = event.nativeEvent.contentOffset.y;
    onScroll?.(position);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>{loadingProgress}</Text>
        {loadingProgress.includes('timeout') && (
          <Text style={styles.hintText}>
            Large files may take longer to load.{'\n'}
            Please wait or check your connection.
          </Text>
        )}
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

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      removeClippedSubviews={true}
    >
      {markdownContent}
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
    paddingHorizontal: 20,
  },
  hintText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});
