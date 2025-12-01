import React, { useState } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Category, CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '../../lib/categories';
import { getBooksByCategory } from '../../lib/books';
import { BookCard } from '../../components/BookCard';

export default function CategoriesScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const books = selectedCategory ? getBooksByCategory(selectedCategory) : [];

  const handleCategoryPress = (category: Category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleBookPress = (bookId: string) => {
    router.push(`/book/${bookId}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.categoriesContainer}>
        {CATEGORIES.map((category) => {
          const isSelected = category === selectedCategory;
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                isSelected && { backgroundColor: CATEGORY_COLORS[category] },
              ]}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryIcon}>{CATEGORY_ICONS[category]}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  isSelected && styles.categoryLabelSelected,
                ]}
              >
                {category}
              </Text>
              <Text style={[styles.count, isSelected && styles.countSelected]}>
                {getBooksByCategory(category).length}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedCategory && (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              onPress={() => handleBookPress(item.id)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={styles.headerText}>
              {books.length} {books.length === 1 ? 'book' : 'books'} in {selectedCategory}
            </Text>
          }
        />
      )}

      {!selectedCategory && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Select a category to browse books</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  categoriesContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#fff',
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  categoryLabelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  count: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  countSelected: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
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
  },
});

