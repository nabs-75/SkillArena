import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { theme } from '../theme';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Créer le profil utilisateur dans Firestore
      const db = getFirestore();
      await setDoc(doc(db, 'users', user.uid), {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        points: 0,
        friends: [],
        createdAt: new Date(),
      });

      Alert.alert('Succès', 'Compte créé avec succès !', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      let errorMessage = 'Une erreur est survenue lors de l\'inscription';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Cette adresse email est déjà utilisée';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe est trop faible';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Adresse email invalide';
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesome name="user-plus" size={60} color={theme.colors.primary} />
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez la communauté SkillArena</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome name="envelope" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome name="lock" size={20} color={theme.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.buttonText}>S'inscrire</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.linkText}>
            Déjà un compte ? <Text style={styles.linkHighlight}>Se connecter</Text>
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
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  form: {
    padding: theme.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  inputIcon: {
    marginRight: theme.spacing.md,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  buttonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  linkText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.primary,
  },
  linkHighlight: {
    fontWeight: 'bold',
  },
}); 