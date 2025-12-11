import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, InteractionManager, Dimensions } from 'react-native';
import { readAssetText } from '../lib/assetLoader';

interface MarkdownViewerProps {
  source: string; // Path relative to assets/books (e.g., "biblical/book.md")
  onScroll?: (position: number) => void;
  initialPosition?: number;
  fontSize?: number;
}

interface MarkdownChunk {
  id: string;
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'list' | 'code' | 'empty';
  content: string;
  level?: number; // For lists
}

// Parse markdown into chunks for virtualized rendering
const parseMarkdownToChunks = (content: string): MarkdownChunk[] => {
  const lines = content.split('\n');
  const chunks: MarkdownChunk[] = [];
  let chunkId = 0;
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        chunks.push({
          id: `chunk-${chunkId++}`,
          type: 'code',
          content: codeBlockContent.join('\n'),
        });
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Skip empty lines (but add minimal spacing)
    if (line.trim() === '') {
      chunks.push({
        id: `chunk-${chunkId++}`,
        type: 'empty',
        content: '',
      });
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      chunks.push({
        id: `chunk-${chunkId++}`,
        type: 'heading1',
        content: line.substring(2).trim(),
      });
      continue;
    }
    if (line.startsWith('## ')) {
      chunks.push({
        id: `chunk-${chunkId++}`,
        type: 'heading2',
        content: line.substring(3).trim(),
      });
      continue;
    }
    if (line.startsWith('### ')) {
      chunks.push({
        id: `chunk-${chunkId++}`,
        type: 'heading3',
        content: line.substring(4).trim(),
      });
      continue;
    }

    // Lists
    if (line.match(/^[\*\-\+] /)) {
      chunks.push({
        id: `chunk-${chunkId++}`,
        type: 'list',
        content: line.substring(2).trim(),
        level: 0,
      });
      continue;
    }
    if (line.match(/^\d+\. /)) {
      const match = line.match(/^(\d+)\. (.*)/);
      if (match) {
        chunks.push({
          id: `chunk-${chunkId++}`,
          type: 'list',
          content: match[2],
          level: parseInt(match[1], 10),
        });
        continue;
      }
    }

    // Regular paragraph
    chunks.push({
      id: `chunk-${chunkId++}`,
      type: 'paragraph',
      content: line.trim(),
    });
  }

  // Close any open code block
  if (inCodeBlock && codeBlockContent.length > 0) {
    chunks.push({
      id: `chunk-${chunkId++}`,
      type: 'code',
      content: codeBlockContent.join('\n'),
    });
  }

  return chunks;
};

// Parse inline markdown (bold, italic, code) - simplified to avoid recursion issues
// For book reading, we prioritize performance over complex formatting
const parseInlineMarkdown = (text: string): string => {
  // Simple approach: just return text for now to avoid performance issues
  // Can enhance later if needed
  return text;
};

// Render a single chunk
const renderChunk = (chunk: MarkdownChunk, fontSize: number): React.ReactElement => {
  switch (chunk.type) {
    case 'heading1':
      return (
        <Text key={chunk.id} style={[styles.heading1, { fontSize: fontSize * 1.8 }]}>
          {chunk.content}
        </Text>
      );
    case 'heading2':
      return (
        <Text key={chunk.id} style={[styles.heading2, { fontSize: fontSize * 1.5 }]}>
          {chunk.content}
        </Text>
      );
    case 'heading3':
      return (
        <Text key={chunk.id} style={[styles.heading3, { fontSize: fontSize * 1.3 }]}>
          {chunk.content}
        </Text>
      );
    case 'list':
      return (
        <View key={chunk.id} style={styles.listItem}>
          <Text style={styles.bullet}>• </Text>
          <Text style={[styles.body, { fontSize }]}>{parseInlineMarkdown(chunk.content)}</Text>
        </View>
      );
    case 'code':
      return (
        <View key={chunk.id} style={styles.codeBlock}>
          <Text style={styles.codeBlockText}>{chunk.content}</Text>
        </View>
      );
    case 'empty':
      return <View key={chunk.id} style={{ height: fontSize * 0.5 }} />;
    case 'paragraph':
    default:
      return (
        <Text key={chunk.id} style={[styles.paragraph, { fontSize, lineHeight: fontSize * 1.8 }]}>
          {parseInlineMarkdown(chunk.content)}
        </Text>
      );
  }
};

const MarkdownViewerComponent: React.FC<MarkdownViewerProps> = ({
  source,
  onScroll,
  initialPosition = 0,
  fontSize = 18, // Increased default for better readability
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chunks, setChunks] = useState<MarkdownChunk[]>([]);
  const [loadingProgress, setLoadingProgress] = useState<string>('Loading content...');
  const flatListRef = useRef<FlatList>(null);
  const loadedSourceRef = useRef<string | null>(null);
  const hasScrolledToInitialRef = useRef(false);
  const screenHeight = Dimensions.get('window').height;

  // Load markdown content and parse into chunks
  useEffect(() => {
    if (loadedSourceRef.current === source) {
      return; // Already loaded
    }

    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        setLoadingProgress('Loading content...');
        loadedSourceRef.current = source;
        hasScrolledToInitialRef.current = false;

        const text = await readAssetText(source);
        setLoadingProgress('Parsing content...');
        
        // Parse in chunks to avoid blocking
        InteractionManager.runAfterInteractions(() => {
          const parsedChunks = parseMarkdownToChunks(text);
          setChunks(parsedChunks);
          setLoading(false);
        });
      } catch (err) {
        console.error('Error loading markdown:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
        setLoading(false);
        loadedSourceRef.current = null;
      }
    };

    loadContent();
  }, [source]);

  // Scroll to initial position after content loads
  useEffect(() => {
    if (!loading && chunks.length > 0 && initialPosition > 0 && !hasScrolledToInitialRef.current) {
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          // Estimate chunk index from scroll position (rough estimate)
          const estimatedIndex = Math.floor((initialPosition / screenHeight) * 10);
          flatListRef.current?.scrollToIndex({ 
            index: Math.min(estimatedIndex, chunks.length - 1), 
            animated: false 
          });
          hasScrolledToInitialRef.current = true;
        }, 200);
      });
    }
  }, [loading, chunks.length, initialPosition, screenHeight]);

  // Throttle scroll events
  const lastScrollTimeRef = useRef(0);
  const handleScroll = useCallback(
    (event: any) => {
      const now = Date.now();
      if (now - lastScrollTimeRef.current < 200) {
        return;
      }
      lastScrollTimeRef.current = now;
      const position = event.nativeEvent.contentOffset.y;
      InteractionManager.runAfterInteractions(() => {
        onScroll?.(position);
      });
    },
    [onScroll]
  );

  // Render item for FlatList
  const renderItem = useCallback(
    ({ item }: { item: MarkdownChunk }) => {
      return (
        <View style={styles.chunkContainer}>
          {renderChunk(item, fontSize)}
        </View>
      );
    },
    [fontSize]
  );

  // Get item layout for better performance
  const getItemLayout = useCallback(
    (_: any, index: number) => {
      // Estimate ~100px per chunk (will be adjusted by FlatList)
      return {
        length: 100,
        offset: 100 * index,
        index,
      };
    },
    []
  );

  // Key extractor
  const keyExtractor = useCallback((item: MarkdownChunk) => item.id, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>{loadingProgress}</Text>
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
    <FlatList
      ref={flatListRef}
      data={chunks}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      onScroll={handleScroll}
      scrollEventThrottle={200}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={15}
      windowSize={10}
      contentContainerStyle={styles.contentContainer}
      style={styles.container}
      showsVerticalScrollIndicator={true}
      decelerationRate="normal"
      bounces={true}
    />
  );
};

// Memoize the component
export const MarkdownViewer = React.memo(MarkdownViewerComponent, (prevProps, nextProps) => {
  return (
    prevProps.source === nextProps.source &&
    prevProps.fontSize === nextProps.fontSize &&
    prevProps.initialPosition === nextProps.initialPosition &&
    prevProps.onScroll === nextProps.onScroll
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8f3', // Book-like cream background
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  chunkContainer: {
    marginBottom: 4,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
  body: {
    color: '#2c2c2c', // Darker text for better readability
  },
  paragraph: {
    marginBottom: 16,
    color: '#2c2c2c',
    textAlign: 'left',
    letterSpacing: 0.3, // Better readability
  },
  heading1: {
    fontWeight: '700',
    marginTop: 32,
    marginBottom: 16,
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  heading2: {
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },
  heading3: {
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#1a1a1a',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 8,
  },
  bullet: {
    color: '#2c2c2c',
    marginRight: 8,
    fontSize: 18,
  },
  codeBlock: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  codeBlockText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#1a1a1a',
  },
});
