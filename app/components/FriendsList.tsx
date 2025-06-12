import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, ViewStyle, TextStyle, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../theme';

type Friend = {
  id: string;
  username: string;
  online: boolean;
};

type FriendRequest = {
  id: string;
  from: string;
  to: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
};

export default function FriendsList() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchFriends = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(getFirestore(), 'users', user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const friendIds = data.friends || [];
        
        if (friendIds.length > 0) {
          const friendDocs = await Promise.all(
            friendIds.map((id: string) => getDoc(doc(getFirestore(), 'users', id)))
          );
          
          const friendsData = friendDocs
            .filter(doc => doc.exists())
            .map(doc => ({
              id: doc.id,
              username: doc.data()?.username,
              online: doc.data()?.online || false
            })) as Friend[];
          
          setFriends(friendsData);
        } else {
          setFriends([]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des amis:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste d\'amis');
    }
  };

  const fetchFriendRequests = async () => {
    if (!user) return;

    try {
      const requestsRef = collection(getFirestore(), 'friendRequests');
      const q = query(requestsRef, where('to', '==', user.uid), where('status', '==', 'pending'));
      
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as FriendRequest[];
      
      setFriendRequests(requests);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes d\'ami:', error);
      Alert.alert('Erreur', 'Impossible de charger les demandes d\'ami');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
    if (!user) return;

    try {
      const requestRef = doc(collection(getFirestore(), 'friendRequests'), request.id);
      const userRef = doc(collection(getFirestore(), 'users'), user.uid);
      const friendRef = doc(collection(getFirestore(), 'users'), request.from);

      // Mettre à jour le statut de la demande
      await updateDoc(requestRef, {
        status: 'accepted'
      });

      // Ajouter l'ami à la liste des amis de l'utilisateur
      await updateDoc(userRef, {
        friends: arrayUnion(request.from)
      });

      // Ajouter l'utilisateur à la liste des amis de l'ami
      await updateDoc(friendRef, {
        friends: arrayUnion(user.uid)
      });

      // Mettre à jour les listes locales
      setFriendRequests(prev => prev.filter(r => r.id !== request.id));
      fetchFriends(); // Recharger la liste des amis
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la demande:', error);
      Alert.alert('Erreur', 'Impossible d\'accepter la demande d\'ami');
    }
  };

  const handleRejectRequest = async (request: FriendRequest) => {
    if (!user) return;

    try {
      const requestRef = doc(collection(getFirestore(), 'friendRequests'), request.id);

      // Mettre à jour le statut de la demande
      await updateDoc(requestRef, {
        status: 'rejected'
      });

      // Mettre à jour la liste locale
      setFriendRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error('Erreur lors du rejet de la demande:', error);
      Alert.alert('Erreur', 'Impossible de rejeter la demande d\'ami');
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchFriendRequests();
  }, []);

  console.log('Amis récupérés :', friends);

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem as ViewStyle}>
      <View style={styles.friendInfo as ViewStyle}>
        <FontAwesome name="user" size={20} color={theme.colors.textSecondary} />
        <Text style={styles.friendName as TextStyle}>{item.username}</Text>
      </View>
      <View style={[
        styles.statusDot as ViewStyle,
        item.online ? styles.onlineDot as ViewStyle : styles.offlineDot as ViewStyle
      ]} />
    </View>
  );

  const renderFriendRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestItem as ViewStyle}>
      <Text style={styles.requestText as TextStyle}>
        Demande d'ami de {item.from}
      </Text>
      <View style={styles.requestActions as ViewStyle}>
        <TouchableOpacity 
          style={[styles.actionButton as ViewStyle, styles.acceptButton as ViewStyle]}
          onPress={() => handleAcceptRequest(item)}
        >
          <FontAwesome name="check" size={16} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton as ViewStyle, styles.rejectButton as ViewStyle]}
          onPress={() => handleRejectRequest(item)}
        >
          <FontAwesome name="times" size={16} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer as ViewStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={friends}
      renderItem={renderFriend}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.friendsList as ViewStyle}
      ListHeaderComponent={
        <>
          <Text style={styles.sectionTitle as TextStyle}>Mes amis</Text>
          {friendRequests.length > 0 && (
            <View style={styles.requestsSection as ViewStyle}>
              <Text style={styles.sectionTitle as TextStyle}>Demandes d'ami</Text>
              <FlatList
                data={friendRequests}
                renderItem={renderFriendRequest}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.requestsList as ViewStyle}
              />
            </View>
          )}
        </>
      }
      ListEmptyComponent={
        <Text style={styles.emptyText as TextStyle}>
          Vous n'avez pas encore d'amis
        </Text>
      }
      ListFooterComponent={
        <TouchableOpacity 
          style={styles.addButton as ViewStyle}
          onPress={() => router.push('/add-friend')}
        >
          <FontAwesome name="user-plus" size={20} color={theme.colors.text} />
          <Text style={styles.addButtonText as TextStyle}>Ajouter des amis</Text>
        </TouchableOpacity>
      }
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestsSection: {
    marginBottom: theme.spacing.md,
  },
  friendsSection: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  requestText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    flex: 1,
  },
  requestActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: theme.colors.success,
  },
  rejectButton: {
    backgroundColor: theme.colors.error,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  friendName: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
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
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    margin: theme.spacing.md,
  },
  addButtonText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  requestsList: {
    padding: theme.spacing.md,
  },
  friendsList: {
    padding: theme.spacing.md,
  },
}); 
