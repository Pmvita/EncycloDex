import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { ErrorBoundary } from '../components/ErrorBoundary';
import Constants from 'expo-constants';

// Check if running in Expo Go (EAS Updates don't work with Expo Go)
// Expo Go has appOwnership === 'expo', development builds have 'standalone' or null
const isExpoGo = Constants.appOwnership === 'expo';

export default function RootLayout() {
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    // Log environment info for debugging
    console.log('EncycloDex: App initializing...');
    console.log('Execution environment:', Constants.executionEnvironment);
    console.log('Is Expo Go:', isExpoGo);
    console.log('Update ID:', Constants.expoConfig?.extra?.eas?.projectId);
    
    // Warn if using Expo Go with EAS Updates
    if (isExpoGo) {
      console.warn(
        '⚠️ EAS Updates require a development build, not Expo Go.\n' +
        'Please create a development build: eas build --profile development --platform ios'
      );
    }
  }, []);

  // Note: We'll show a warning but still allow the app to run
  // EAS Updates won't work, but local development will

  try {
    return (
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <Stack 
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="book/[id]" />
            </Stack>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('RootLayout: Fatal error:', error);
    const errorObj = error instanceof Error ? error : new Error(String(error));
    setInitError(errorObj);
    
    return (
      <ErrorBoundary>
        <View style={styles.container}>
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>App Error</Text>
            <Text style={styles.errorText}>
              {errorObj.message || 'Unknown error'}
            </Text>
            <Text style={styles.errorDetails}>
              Check the console for more details
            </Text>
          </View>
        </View>
      </ErrorBoundary>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    maxWidth: 400,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
    marginBottom: 12,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    color: '#856404',
    marginVertical: 8,
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    maxWidth: 400,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#721c24',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#721c24',
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
  },
});


