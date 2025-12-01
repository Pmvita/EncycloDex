import React, { useState, useMemo } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useBooks } from '../../hooks/useBooks';
import { BookCard } from '../../components/BookCard';
import { SearchBar } from '../../components/SearchBar';
import { CategoryFilter } from '../../components/CategoryFilter';
import { Category } from '../../types/book';
import { getProgressForBook } from '../../lib/storage';
import { useEffect } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const { books, loading } = useBooks();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [bookProgress, setBookProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadProgress = async () => {
      const progressMap: Record<string, number> = {};
      for (const book of books) {
        const progress = await getProgressForBook(book.id);
        if (progress) {
          progressMap[book.id] = progress.progressPercentage;
        }
      }
      setBookProgress(progressMap);
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
    router.push(`/book/${bookId}`);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading books...</Text>
      </View>
    );
  }

  console.log('Total books:', books.length);
  console.log('Filtered books:', filteredBooks.length);
  console.log('Selected categories:', selectedCategories);

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
        <CategoryFilter
          selectedCategories={selectedCategories}
          onToggleCategory={handleToggleCategory}
        />
      </View>
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {books.length === 0 
                ? 'No books loaded' 
                : selectedCategories.length > 0 || searchQuery.trim()
                  ? 'No books found matching filters'
                  : 'No books found'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

