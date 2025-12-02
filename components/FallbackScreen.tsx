import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const FallbackScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>EncycloDex</Text>
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});

