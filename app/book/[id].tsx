import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBookById } from '../../lib/books';
import { PDFViewer } from '../../components/PDFViewer';
import { MarkdownViewer } from '../../components/MarkdownViewer';
import { ReadingProgress } from '../../components/ReadingProgress';
import { useBookmarks } from '../../hooks/useBookmarks';
import { getProgressForBook, saveReadingProgress, getNotesByBookId, saveNote, deleteNote, getBookmarksByBookId } from '../../lib/storage';
import { Bookmark, Note } from '../../types/book';

type ViewMode = 'pdf' | 'markdown';

export default function BookReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const book = id ? getBookById(id) : null;
  const { bookmarks, addBookmark, removeBookmark } = useBookmarks();

  // Redirect to home if no book ID or book not found
  useEffect(() => {
    if (!id || !book) {
      router.replace('/(tabs)');
    }
  }, [id, book, router]);

  const [viewMode, setViewMode] = useState<ViewMode>('markdown');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [progress, setProgress] = useState<number>(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (!book) return;

    // Load reading progress
    const loadProgress = async () => {
      const savedProgress = await getProgressForBook(book.id);
      if (savedProgress) {
        setProgress(savedProgress.progressPercentage);
        if (savedProgress.currentPage) {
          setCurrentPage(savedProgress.currentPage);
        }
        if (savedProgress.currentPosition) {
          setScrollPosition(savedProgress.currentPosition);
        }
      }
    };

    // Check if bookmarked
    const checkBookmark = async () => {
      const bookBookmarks = await getBookmarksByBookId(book.id);
      setIsBookmarked(bookBookmarks.length > 0);
    };

    // Load notes
    const loadNotes = async () => {
      const bookNotes = await getNotesByBookId(book.id);
      setNotes(bookNotes);
    };

    loadProgress();
    checkBookmark();
    loadNotes();

    // Set default view mode based on availability
    if (book.pdfPath && !book.markdownPath) {
      setViewMode('pdf');
    } else if (book.markdownPath && !book.pdfPath) {
      setViewMode('markdown');
    }
  }, [book]);

  const handlePageChange = (page: number, total: number) => {
    setCurrentPage(page);
    setTotalPages(total);
    const newProgress = (page / total) * 100;
    setProgress(newProgress);
    
    // Save progress
    if (book) {
      saveReadingProgress({
        bookId: book.id,
        lastReadAt: Date.now(),
        currentPage: page,
        totalPages: total,
        progressPercentage: newProgress,
      });
    }
  };

  const handleScroll = (position: number) => {
    setScrollPosition(position);
    // For markdown, we'd need total content height to calculate progress
    // This is a simplified version
  };

  const handleToggleBookmark = async () => {
    if (!book) return;

    if (isBookmarked) {
      const bookBookmarks = await getBookmarksByBookId(book.id);
      if (bookBookmarks.length > 0) {
        await removeBookmark(bookBookmarks[0].id);
        setIsBookmarked(false);
      }
    } else {
      const bookmark: Bookmark = {
        id: `${book.id}_${Date.now()}`,
        bookId: book.id,
        title: book.title,
        page: viewMode === 'pdf' ? currentPage : undefined,
        position: viewMode === 'markdown' ? scrollPosition : undefined,
        createdAt: Date.now(),
      };
      await addBookmark(bookmark);
      setIsBookmarked(true);
    }
  };

  const handleAddNote = async () => {
    if (!book || !newNote.trim()) return;

    const note: Note = {
      id: `${book.id}_note_${Date.now()}`,
      bookId: book.id,
      page: viewMode === 'pdf' ? currentPage : undefined,
      content: newNote,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveNote(note);
    setNotes([...notes, note]);
    setNewNote('');
    setShowNotesModal(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(noteId);
          setNotes(notes.filter(n => n.id !== noteId));
        },
      },
    ]);
  };

  if (!book) {
    // Show loading while redirecting
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Redirecting...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>{book.title}</Text>
        </View>
        <TouchableOpacity onPress={handleToggleBookmark} style={styles.headerButton}>
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isBookmarked ? '#4CAF50' : '#333'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowNotesModal(true)}
          style={styles.headerButton}
        >
          <Ionicons name="document-text-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* View Mode Toggle */}
      {(book.pdfPath && book.markdownPath) && (
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'pdf' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('pdf')}
          >
            <Ionicons name="document" size={20} color={viewMode === 'pdf' ? '#fff' : '#666'} />
            <Text style={[styles.viewModeText, viewMode === 'pdf' && styles.viewModeTextActive]}>
              PDF
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'markdown' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('markdown')}
          >
            <Ionicons name="text" size={20} color={viewMode === 'markdown' ? '#fff' : '#666'} />
            <Text style={[styles.viewModeText, viewMode === 'markdown' && styles.viewModeTextActive]}>
              Markdown
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reading Progress */}
      {progress > 0 && (
        <View style={styles.progressContainer}>
          <ReadingProgress
            progress={progress}
            currentPage={viewMode === 'pdf' ? currentPage : undefined}
            totalPages={viewMode === 'pdf' ? totalPages : undefined}
          />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {viewMode === 'pdf' && book.pdfPath && (
          <PDFViewer
            source={book.pdfPath}
            onPageChange={handlePageChange}
            initialPage={currentPage}
          />
        )}
        {viewMode === 'markdown' && book.markdownPath && (
          <MarkdownViewer
            source={book.markdownPath}
            onScroll={handleScroll}
            initialPosition={scrollPosition}
          />
        )}
      </View>

      {/* Notes Modal */}
      <Modal
        visible={showNotesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotesModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notes</Text>
            <TouchableOpacity onPress={() => setShowNotesModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.notesList}>
            {notes.map((note) => (
              <View key={note.id} style={styles.noteItem}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteDate}>
                    {new Date(note.createdAt).toLocaleDateString()}
                  </Text>
                  <TouchableOpacity onPress={() => handleDeleteNote(note.id)}>
                    <Ionicons name="trash-outline" size={20} color="#f44336" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.noteContent}>{note.content}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.noteInputContainer}>
            <TextInput
              style={styles.noteInput}
              placeholder="Add a note..."
              value={newNote}
              onChangeText={setNewNote}
              multiline
            />
            <TouchableOpacity
              style={[styles.addNoteButton, !newNote.trim() && styles.addNoteButtonDisabled]}
              onPress={handleAddNote}
              disabled={!newNote.trim()}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  viewModeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    gap: 6,
  },
  viewModeButtonActive: {
    backgroundColor: '#4CAF50',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  viewModeTextActive: {
    color: '#fff',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  notesList: {
    flex: 1,
    padding: 16,
  },
  noteItem: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
  },
  noteContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  noteInputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  noteInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    maxHeight: 100,
  },
  addNoteButton: {
    backgroundColor: '#4CAF50',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addNoteButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

