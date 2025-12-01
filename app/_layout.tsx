import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { SplashScreen } from '../components/SplashScreen';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Hide splash after animation
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Redirect to library screen only on initial app load/reload if on a book page
  // This prevents redirecting when user intentionally navigates to a book
  useEffect(() => {
    // Only run this once when splash finishes
    if (!showSplash && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      
      // Check if we're on a book detail page (this happens on reload)
      if (segments.length > 0 && segments[0] === 'book') {
        // Small delay to ensure navigation is ready, then redirect to library
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 100);
      }
    }
  }, [showSplash]); // Only depend on showSplash, not segments

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

