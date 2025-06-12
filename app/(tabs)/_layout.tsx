import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

export default function TabLayout() {
  const { user, loading } = useAuth();

  // Afficher un indicateur de chargement pendant l'initialisation
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Si pas d'utilisateur connecté, ne pas afficher les tabs
  if (!user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#4285F4',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tournaments"
        options={{
          title: 'Tournois',
          tabBarIcon: ({ color }) => <FontAwesome name="trophy" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
} 
