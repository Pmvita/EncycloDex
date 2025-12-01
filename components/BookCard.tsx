import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Book } from '../types/book';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../lib/categories';
import { PDFThumbnail } from './PDFThumbnail';

interface BookCardProps {
  book: Book;
  onPress: () => void;
  progress?: number;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onPress, progress }) => {
  const primaryCategory = book.categories[0] || 'Other';
  const categoryColor = CATEGORY_COLORS[primaryCategory];
  const categoryIcon = CATEGORY_ICONS[primaryCategory];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <PDFThumbnail
        source={book.pdfPath || book.markdownPath || undefined}
        categoryColor={categoryColor}
        size={60}
      />
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        
        {book.author && (
          <Text style={styles.author} numberOfLines={1}>
            {book.author}
          </Text>
        )}

        <View style={styles.categories}>
          {book.categories.slice(0, 2).map((cat, idx) => (
            <View key={idx} style={[styles.categoryTag, { backgroundColor: CATEGORY_COLORS[cat] + '20' }]}>
              <Ionicons 
                name={CATEGORY_ICONS[cat]} 
                size={10} 
                color={CATEGORY_COLORS[cat]} 
                style={styles.categoryIcon}
              />
              <Text style={[styles.categoryText, { color: CATEGORY_COLORS[cat] }]}>
                {cat}
              </Text>
            </View>
          ))}
        </View>

        {progress !== undefined && progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}

        <View style={styles.availability}>
          {book.pdfPath && (
            <View style={styles.availabilityItem}>
              <Ionicons name="document-text" size={12} color="#e74c3c" />
              <Text style={styles.availabilityText}>PDF</Text>
            </View>
          )}
          {book.markdownPath && (
            <View style={styles.availabilityItem}>
              <Ionicons name="document" size={12} color="#3498db" />
              <Text style={styles.availabilityText}>Markdown</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
    lineHeight: 18,
  },
  author: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
    gap: 4,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
  },
  categoryIcon: {
    marginRight: 3,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginRight: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#666',
    minWidth: 32,
  },
  availability: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  availabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  availabilityText: {
    fontSize: 10,
    color: '#888',
  },
});

