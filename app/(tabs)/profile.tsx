import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../theme';
import { useFocusEffect } from '@react-navigation/native';
import FriendsList from '../components/FriendsList';
import { ScrollView } from 'react-native';

type UserProfile = {
  username: string;
  email: string;
  points: number;
  friends: string[];
  createdAt: Date;
};

const tabs = [
  { key: 'resume', label: 'Résumé' },
  { key: 'stats', label: 'Stats' },
  { key: 'badges', label: 'Badges' },
  { key: 'amis', label: 'Amis' },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('resume');

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          friends: data.friends || []
        } as UserProfile);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      Alert.alert('Erreur', 'Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  };

  // Recharger le profil à chaque fois que l'écran est affiché
  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      Alert.alert('Erreur', 'Impossible de se déconnecter');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer as ViewStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container as ViewStyle}>
        <Text style={styles.errorText as TextStyle}>Profil non trouvé</Text>
      </View>
    );
  }

  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.header as ViewStyle}>
        <Text style={styles.title as TextStyle}>Profil</Text>
        <TouchableOpacity 
          style={styles.editButton as ViewStyle}
          onPress={() => router.push('/profile/edit')}
        >
          <FontAwesome name="edit" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Onglets */}
      <View style={styles.tabContainer as ViewStyle}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab as ViewStyle,
              activeTab === tab.key && styles.activeTab as ViewStyle
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText as TextStyle,
                activeTab === tab.key && styles.activeTabText as TextStyle
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contenu selon l'onglet actif */}
      <View style={styles.content as ViewStyle}>
        {activeTab === 'resume' && (
          
          <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
            <View style={styles.profileCard as ViewStyle}>
              <View style={styles.avatarContainer as ViewStyle}>
                <FontAwesome name="user-circle" size={100} color={theme.colors.primary} />
              </View>
              <Text style={styles.username as TextStyle}>{profile.username}</Text>
              <Text style={styles.email as TextStyle}>{profile.email}</Text>
              <View style={styles.levelBadge as ViewStyle}>
                <FontAwesome name="star" size={16} color={theme.colors.warning} />
                <Text style={styles.levelText as TextStyle}>Niveau {Math.floor(profile.points / 100)}</Text>
              </View>
            </View>

            <View style={styles.statsCard as ViewStyle}>
              <View style={styles.statItem as ViewStyle}>
                <FontAwesome name="trophy" size={24} color={theme.colors.warning} />
                <Text style={styles.statValue as TextStyle}>{profile.points}</Text>
                <Text style={styles.statLabel as TextStyle}>Points</Text>
              </View>
              <View style={styles.statItem as ViewStyle}>
                <FontAwesome name="users" size={24} color={theme.colors.primary} />
                <Text style={styles.statValue as TextStyle}>{profile.friends.length}</Text>
                <Text style={styles.statLabel as TextStyle}>Amis</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.editProfileButton as ViewStyle}
              onPress={() => router.push('/profile/edit')}
            >
              <FontAwesome name="edit" size={20} color={theme.colors.text} />
              <Text style={styles.editProfileText as TextStyle}>Modifier le profil</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.signOutButton as ViewStyle}
              onPress={handleSignOut}
            >
              <FontAwesome name="sign-out" size={20} color={theme.colors.text} />
              <Text style={styles.signOutText as TextStyle}>Se déconnecter</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
        {activeTab === 'stats' && (
          <View>
            <Text style={styles.placeholderText as TextStyle}>Statistiques à venir…</Text>
          </View>
        )}
        {activeTab === 'badges' && (
          <View>
            <Text style={styles.placeholderText as TextStyle}>Badges à venir…</Text>
          </View>
        )}
        {activeTab === 'amis' && (
          <FriendsList />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  editButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  profileCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.secondary,
  },
  username: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginVertical: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.error,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  signOutText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  levelText: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    marginBottom: 24,
  },
  editProfileText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.textSecondary,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    fontSize: theme.typography.body.fontSize,
  },
}); 
