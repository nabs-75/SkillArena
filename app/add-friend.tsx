import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDocs, getFirestore, query, setDoc, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useAuth } from './context/AuthContext';
import { theme } from './theme';

type User = {
  id: string;
  username: string;
  online: boolean;
};

export default function AddFriendScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom d\'utilisateur');
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(getFirestore(), 'users');
      const q = query(usersRef, where('username', '>=', searchQuery.toLowerCase()), where('username', '<=', searchQuery.toLowerCase() + '\uf8ff'));
      
      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .filter(doc => doc.id !== user?.uid) // Exclure l'utilisateur actuel
        .map(doc => ({
          id: doc.id,
          username: doc.data().username,
          online: doc.data().online || false
        })) as User[];
      
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      Alert.alert('Erreur', 'Impossible de rechercher des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    if (!user) return;

    try {
      const requestRef = doc(collection(getFirestore(), 'friendRequests'), userId);
      
      await setDoc(requestRef, {
        from: user.uid,
        to: userId,
        status: 'pending',
        createdAt: new Date()
      });

      Alert.alert('Succès', 'Demande d\'ami envoyée !');
      setSearchResults(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer la demande d\'ami');
    }
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userItem as ViewStyle}>
      <View style={styles.userInfo as ViewStyle}>
        <FontAwesome name="user" size={24} color={theme.colors.textSecondary} />
        <Text style={styles.username as TextStyle}>{item.username}</Text>
      </View>
      <View style={styles.userActions as ViewStyle}>
        <View style={[
          styles.statusDot as ViewStyle,
          item.online ? styles.onlineDot as ViewStyle : styles.offlineDot as ViewStyle
        ]} />
        <TouchableOpacity 
          style={styles.addButton as ViewStyle}
          onPress={() => sendFriendRequest(item.id)}
        >
          <FontAwesome name="user-plus" size={16} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.header as ViewStyle}>
        <TouchableOpacity 
          style={styles.backButton as ViewStyle}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title as TextStyle}>Ajouter des amis</Text>
      </View>

      <View style={styles.searchContainer as ViewStyle}>
        <TextInput
          style={styles.searchInput as TextStyle}
          placeholder="Rechercher un utilisateur..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchUsers}
        />
        <TouchableOpacity 
          style={styles.searchButton as ViewStyle}
          onPress={searchUsers}
        >
          <FontAwesome name="search" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer as ViewStyle}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderUser}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.resultsList as ViewStyle}
          ListEmptyComponent={
            <Text style={styles.emptyText as TextStyle}>
              {searchQuery ? 'Aucun utilisateur trouvé' : 'Recherchez un utilisateur'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  username: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  onlineDot: {
    backgroundColor: theme.colors.success,
  },
  offlineDot: {
    backgroundColor: theme.colors.error,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
}); 