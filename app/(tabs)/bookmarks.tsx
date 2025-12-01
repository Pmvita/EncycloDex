import React from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBookmarks } from '../../hooks/useBookmarks';
import { getBookById } from '../../lib/books';
import { BookCard } from '../../components/BookCard';

export default function BookmarksScreen() {
  const router = useRouter();
  const { bookmarks, loading, removeBookmark } = useBookmarks();

  const booksWithBookmarks = bookmarks
    .map(bookmark => {
      const book = getBookById(bookmark.bookId);
      return book ? { book, bookmark } : null;
    })
    .filter(Boolean) as Array<{ book: any; bookmark: any }>;

  const handleBookPress = (bookId: string) => {
    router.push(`/book/${bookId}`);
  };

  const handleRemoveBookmark = async (bookmarkId: string) => {
    await removeBookmark(bookmarkId);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading bookmarks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={booksWithBookmarks}
        keyExtractor={(item) => item.bookmark.id}
        renderItem={({ item }) => (
          <View style={styles.bookmarkItem}>
            <BookCard
              book={item.book}
              onPress={() => handleBookPress(item.book.id)}
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveBookmark(item.bookmark.id)}
            >
              <Ionicons name="bookmark" size={20} color="#4CAF50" />
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bookmark-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No bookmarks yet</Text>
            <Text style={styles.emptySubtext}>
              Bookmark books to access them quickly
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkItem: {
    marginBottom: 12,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginTop: 8,
  },
  removeText: {
    marginLeft: 4,
    color: '#4CAF50',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});

