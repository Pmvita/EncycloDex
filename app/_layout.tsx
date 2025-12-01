import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { SplashScreen } from '../components/SplashScreen';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Hide splash after animation
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Redirect to library screen on app start/reload if on a book page
  useEffect(() => {
    if (!showSplash && segments.length > 0) {
      // Check if we're on a book detail page
      if (segments[0] === 'book') {
        // Redirect to library screen
        router.replace('/(tabs)');
      }
    }
  }, [showSplash, segments, router]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
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
  );
}

