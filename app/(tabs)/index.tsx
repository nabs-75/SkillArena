import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function HomeScreen() {
  const { user } = useAuth();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }
    };
    fetchUsername();
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur SkillArena</Text>
      <Text style={styles.subtitle}>Connecté en tant que : {username || user?.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
}); 
