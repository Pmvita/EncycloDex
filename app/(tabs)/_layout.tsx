import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  console.log('TabsLayout: Rendering');
  
  try {
    return (
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#999',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#1a1a1a',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookmarks"
        options={{
          title: 'Bookmarks',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
    );
  } catch (error) {
    console.error('TabsLayout: Error:', error);
    // Return a simple view if Tabs fails
    return null;
  }
}

