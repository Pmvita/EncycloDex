import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function RootLayout() {
  console.log('RootLayout: Component rendering');
  
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
    return (
      <ErrorBoundary>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <Text style={{ fontSize: 18, color: '#f44336' }}>App Error</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
            {error instanceof Error ? error.message : 'Unknown error'}
          </Text>
        </View>
      </ErrorBoundary>
    );
  }
}


