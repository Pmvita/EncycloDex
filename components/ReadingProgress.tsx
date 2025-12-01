import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ReadingProgressProps {
  progress: number;
  currentPage?: number;
  totalPages?: number;
  showDetails?: boolean;
}

export const ReadingProgress: React.FC<ReadingProgressProps> = ({
  progress,
  currentPage,
  totalPages,
  showDetails = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progress))}%` }]} />
      </View>
      {showDetails && (
        <View style={styles.details}>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          {currentPage !== undefined && totalPages !== undefined && (
            <Text style={styles.pageText}>
              Page {currentPage} of {totalPages}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  pageText: {
    fontSize: 12,
    color: '#666',
  },
});

