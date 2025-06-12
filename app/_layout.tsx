import { Stack } from 'expo-router';
import AuthProvider from './context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ title: 'Connexion' }} />
        <Stack.Screen name="auth/register" options={{ title: 'Inscription' }} />
        <Stack.Screen name="create-tournament" options={{ title: 'Créer un tournoi' }} />
        <Stack.Screen name="profile/edit" options={{ title: 'Modifier le profil' }} />
        <Stack.Screen name="add-friend" options={{ title: 'Ajouter un ami' }} />
      </Stack>
    </AuthProvider>
  );
}