import { Category } from '../types/book';
import { Ionicons } from '@expo/vector-icons';

export const CATEGORIES: Category[] = [
  'Hermetic',
  'Kabbalah',
  'Enochian',
  'Egyptian',
  'Biblical',
  'Solomonic',
  'Maps',
  'Other',
];

export const CATEGORY_COLORS: Record<Category, string> = {
  Hermetic: '#8B4513',
  Kabbalah: '#4B0082',
  Enochian: '#000080',
  Egyptian: '#FFD700',
  Biblical: '#006400',
  Solomonic: '#8B0000',
  Maps: '#4682B4',
  Other: '#696969',
};

export const CATEGORY_ICONS: Record<Category, keyof typeof Ionicons.glyphMap> = {
  Hermetic: 'diamond',
  Kabbalah: 'star',
  Enochian: 'planet',
  Egyptian: 'sunny',
  Biblical: 'book',
  Solomonic: 'shield',
  Maps: 'map',
  Other: 'library',
};

