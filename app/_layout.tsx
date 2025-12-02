import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SplashScreen } from '../components/SplashScreen';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { FallbackScreen } from '../components/FallbackScreen';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('RootLayout: Component mounted');
    
    // Initialize app
    const initApp = async () => {
      try {
        console.log('RootLayout: Initializing app...');
        // Small delay to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('RootLayout: App initialized');
        setIsReady(true);
      } catch (error) {
        console.error('RootLayout: Error during initialization:', error);
        setIsReady(true); // Still show app even if init fails
      }
    };

    initApp();

    // Hide splash after animation
    const timer = setTimeout(() => {
      console.log('RootLayout: Hiding splash screen');
      setShowSplash(false);
    }, 2000);

    // Safety timeout - force hide splash after 3 seconds
    const safetyTimer = setTimeout(() => {
      console.warn('RootLayout: Splash screen timeout - forcing hide');
      setShowSplash(false);
      setIsReady(true);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimer);
    };
  }, []);

  // Show splash screen (reduced time for faster debugging)
  if (showSplash) {
    console.log('RootLayout: Rendering splash screen');
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Show loading while app initializes
  if (!isReady) {
    console.log('RootLayout: Rendering loading screen');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Initializing app...</Text>
      </View>
    );
  }

  // Render main app
  console.log('RootLayout: Rendering main app');
  
  try {
    return (
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <Stack 
              screenOptions={{ headerShown: false }}
              initialRouteName="(tabs)"
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="book/[id]" options={{ headerShown: false }} />
            </Stack>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('RootLayout: Error rendering Stack:', error);
    // Fallback to simple screen if Stack fails
    return <FallbackScreen />;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f44336',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

