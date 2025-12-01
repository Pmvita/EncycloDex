import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types/book';
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '../lib/categories';

interface CategoryFilterProps {
  selectedCategories: Category[];
  onToggleCategory: (category: Category) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategories,
  onToggleCategory,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {CATEGORIES.map((category) => {
        const isSelected = selectedCategories.includes(category);
        const iconName = CATEGORY_ICONS[category];
        const iconColor = isSelected ? '#fff' : CATEGORY_COLORS[category];
        return (
          <TouchableOpacity
            key={category}
            style={[
              styles.chip,
              isSelected && { backgroundColor: CATEGORY_COLORS[category] },
            ]}
            onPress={() => onToggleCategory(category)}
            activeOpacity={0.7}
          >
            <Ionicons name={iconName} size={14} color={iconColor} style={styles.icon} />
            <Text
              style={[
                styles.label,
                isSelected && styles.labelSelected,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    maxHeight: 40,
  },
  contentContainer: {
    paddingHorizontal: 12,
    gap: 6,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 6,
    height: 32,
  },
  icon: {
    fontSize: 12,
    marginRight: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
  },
  labelSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});

