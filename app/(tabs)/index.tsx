import React, { useState, useMemo, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useBooks } from '../../hooks/useBooks';
import { BookCard } from '../../components/BookCard';
import { SearchBar } from '../../components/SearchBar';
import { CategoryFilter } from '../../components/CategoryFilter';
import { Category } from '../../types/book';
import { getProgressForBook } from '../../lib/storage';

export default function HomeScreen() {
  console.log('HomeScreen: Component function called');
  
  const router = useRouter();
  const { books, loading } = useBooks();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [bookProgress, setBookProgress] = useState<Record<string, number>>({});
  const [hasError, setHasError] = useState(false);
  const [forceRender, setForceRender] = useState(false);
  
  // Force render after 3 seconds if still loading
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('HomeScreen: Force rendering after timeout');
        setForceRender(true);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // Always log for debugging
  useEffect(() => {
    console.log('HomeScreen: Component rendered');
    console.log('HomeScreen: Loading state:', loading);
    console.log('HomeScreen: Books count:', books.length);
    console.log('HomeScreen: Has error:', hasError);
  }, [loading, books.length, hasError]);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progressMap: Record<string, number> = {};
        for (const book of books) {
          try {
            const progress = await getProgressForBook(book.id);
            if (progress) {
              progressMap[book.id] = progress.progressPercentage;
            }
          } catch (err) {
            console.error(`Error loading progress for book ${book.id}:`, err);
          }
        }
        setBookProgress(progressMap);
      } catch (error) {
        console.error('Error in loadProgress:', error);
        setHasError(true);
      }
    };
    if (books.length > 0) {
      loadProgress();
    }
  }, [books]);

  const filteredBooks = useMemo(() => {
    let filtered = books;

    // Filter by categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(book =>
        book.categories.some(cat => selectedCategories.includes(cat))
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author?.toLowerCase().includes(query) ||
        book.categories.some(cat => cat.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [books, selectedCategories, searchQuery]);

  const handleToggleCategory = (category: Category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleBookPress = (bookId: string) => {
    console.log('Navigating to book:', bookId);
    router.push(`/book/${bookId}`);
  };

  // Show error state if something failed
  if (hasError && books.length === 0 && !loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error loading books</Text>
        <Text style={styles.errorDetails}>Please try again</Text>
      </View>
    );
  }

  // Always ensure we render something, even if there's an error
  // Force render if loading takes too long
  const shouldShowContent = !loading || forceRender;
  
  if (!shouldShowContent) {
    console.log('HomeScreen: Showing loading state, loading:', loading, 'forceRender:', forceRender);
    return (
      <View style={[styles.centerContainer, { backgroundColor: '#fff' }]}>
        <Text style={styles.loadingText}>Loading EncycloDex...</Text>
        <Text style={styles.loadingSubtext}>Please wait...</Text>
      </View>
    );
  }

  console.log('HomeScreen: Total books:', books.length);
  console.log('HomeScreen: Filtered books:', filteredBooks.length);
  console.log('HomeScreen: Selected categories:', selectedCategories);

  // Always render the main UI, even if books array is empty
  console.log('HomeScreen: Rendering main UI with', filteredBooks.length, 'books');
  
  try {
    return (
      <View style={styles.container} testID="home-screen-container">
        <View style={styles.filtersContainer}>
          <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
          <CategoryFilter
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
          />
        </View>
        {filteredBooks.length > 0 ? (
          <FlatList
            data={filteredBooks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <BookCard
                book={item}
                onPress={() => handleBookPress(item.id)}
                progress={bookProgress[item.id]}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {books.length === 0 
                ? 'No books loaded. Check your metadata and asset files.' 
                : selectedCategories.length > 0 || searchQuery.trim()
                  ? 'No books found matching filters.'
                  : 'No books found.'}
            </Text>
          </View>
        )}
      </View>
    );
  } catch (error) {
    console.error('HomeScreen: Render error:', error);
    return (
      <View style={[styles.centerContainer, { backgroundColor: '#fff' }]}>
        <Text style={styles.errorText}>Error rendering screen</Text>
        <Text style={styles.errorDetails}>
          {error instanceof Error ? error.message : 'Unknown error'}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    minHeight: '100%',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listContent: {
    padding: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f44336',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 14,
    color: '#666',
  },
});
