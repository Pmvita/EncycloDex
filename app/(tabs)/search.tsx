import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSearch } from '../../hooks/useSearch';
import { BookCard } from '../../components/BookCard';
import { SearchBar } from '../../components/SearchBar';

export default function SearchScreen() {
  const router = useRouter();
  const { query, setQuery, results } = useSearch();

  const handleBookPress = (bookId: string) => {
    router.push(`/book/${bookId}`);
  };

  return (
    <View style={styles.container}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search all books..."
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={() => handleBookPress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {query ? 'No results found' : 'Start typing to search...'}
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
  listContent: {
    padding: 16,
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

