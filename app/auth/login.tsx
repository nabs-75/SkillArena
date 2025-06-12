import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Aucun compte trouvé avec cette adresse email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Mot de passe incorrect';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide';
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.header as ViewStyle}>
        <Text style={styles.title as TextStyle}>Connexion</Text>
      </View>

      <View style={styles.form as ViewStyle}>
        <Text style={styles.label as TextStyle}>Email</Text>
        <TextInput
          style={styles.input as TextStyle}
          value={email}
          onChangeText={setEmail}
          placeholder="Entrez votre email"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label as TextStyle}>Mot de passe</Text>
        <TextInput
          style={styles.input as TextStyle}
          value={password}
          onChangeText={setPassword}
          placeholder="Entrez votre mot de passe"
          placeholderTextColor={theme.colors.textSecondary}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.loginButton as ViewStyle}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.text} />
          ) : (
            <Text style={styles.loginButtonText as TextStyle}>Se connecter</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.registerButton as ViewStyle}
          onPress={() => router.push('/auth/register')}
        >
          <Text style={styles.registerButtonText as TextStyle}>
            Pas encore de compte ? S'inscrire
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  form: {
    padding: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: theme.spacing.md,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  loginButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.primary,
  },
}); 
