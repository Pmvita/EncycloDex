export type Category = 
  | 'Hermetic'
  | 'Kabbalah'
  | 'Enochian'
  | 'Egyptian'
  | 'Biblical'
  | 'Solomonic'
  | 'Maps'
  | 'Other';

export interface Book {
  id: string;
  title: string;
  author?: string;
  description?: string;
  categories: Category[];
  pdfPath?: string;
  markdownPath?: string;
  coverImage?: string;
  folderName: string;
}

export interface Bookmark {
  id: string;
  bookId: string;
  title: string;
  page?: number;
  section?: string;
  position?: number; // For markdown scroll position
  createdAt: number;
  note?: string;
}

export interface Note {
  id: string;
  bookId: string;
  page?: number;
  section?: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReadingProgress {
  bookId: string;
  lastReadAt: number;
  currentPage?: number;
  currentPosition?: number; // For markdown
  progressPercentage: number;
  totalPages?: number;
}

export interface BookMetadata {
  books: Book[];
  lastUpdated: number;
}

