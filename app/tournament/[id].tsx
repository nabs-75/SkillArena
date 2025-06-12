
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, FlatList, ViewStyle, TextStyle } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../theme';

type Tournament = {
  id: string;
  name: string;
  game: string;
  date: Date;
  participants: string[];
  maxParticipants: number;
  status: 'open' | 'ongoing' | 'completed';
  prize: string;
  createdBy: string;
  createdAt: Date;
};

type Participant = {
  id: string;
  username: string;
};

export default function TournamentDetailScreen() {
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    if (!id || typeof id !== 'string') return;

    try {
      const db = getFirestore();
      const tournamentDoc = await getDoc(doc(db, 'tournaments', id));
      
      if (tournamentDoc.exists()) {
        const data = tournamentDoc.data();
        setTournament({
          id: tournamentDoc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          participants: data.participants || []
        } as Tournament);

        // Récupérer les informations des participants
        if (data.participants && data.participants.length > 0) {
          const participantsDocs = await Promise.all(
            data.participants.map((userId: string) => getDoc(doc(db, 'users', userId)))
          );
          
          const participantsData = participantsDocs
            .filter(doc => doc.exists())
            .map(doc => ({
              id: doc.id,
              username: doc.data()?.username
            })) as Participant[];
          
          setParticipants(participantsData);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du tournoi:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails du tournoi');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user || !tournament) return;

    try {
      const db = getFirestore();
      const tournamentRef = doc(db, 'tournaments', tournament.id);

      // Vérifier si l'utilisateur est déjà inscrit
      if (tournament.participants.includes(user.uid)) {
        Alert.alert('Information', 'Vous êtes déjà inscrit à ce tournoi');
        return;
      }

      // Vérifier si le tournoi est complet
      if (tournament.participants.length >= tournament.maxParticipants) {
        Alert.alert('Information', 'Ce tournoi est complet');
        return;
      }

      // Mettre à jour le tournoi
      await updateDoc(tournamentRef, {
        participants: arrayUnion(user.uid)
      });

      Alert.alert('Succès', 'Vous êtes inscrit au tournoi !');
      fetchTournament(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      Alert.alert('Erreur', 'Impossible de s\'inscrire au tournoi');
    }
  };

  const renderParticipant = ({ item }: { item: Participant }) => (
    <View style={styles.participantItem as ViewStyle}>
      <FontAwesome name="user" size={16} color={theme.colors.textSecondary} />
      <Text style={styles.participantName as TextStyle}>{item.username}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer as ViewStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={styles.container as ViewStyle}>
        <Text style={styles.errorText as TextStyle}>Tournoi non trouvé</Text>
      </View>
    );
  }

  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.header as ViewStyle}>
        <TouchableOpacity 
          style={styles.backButton as ViewStyle}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title as TextStyle}>{tournament.name}</Text>
      </View>

      <View style={styles.content as ViewStyle}>
        <View style={styles.infoCard as ViewStyle}>
          <View style={styles.infoItem as ViewStyle}>
            <FontAwesome name="gamepad" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText as TextStyle}>{tournament.game}</Text>
          </View>
          <View style={styles.infoItem as ViewStyle}>
            <FontAwesome name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText as TextStyle}>
              {tournament.date.toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoItem as ViewStyle}>
            <FontAwesome name="users" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText as TextStyle}>
              {tournament.participants.length}/{tournament.maxParticipants} participants
            </Text>
          </View>
          <View style={styles.infoItem as ViewStyle}>
            <FontAwesome name="trophy" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText as TextStyle}>
              {tournament.prize} points
            </Text>
          </View>
        </View>

        <View style={styles.participantsSection as ViewStyle}>
          <Text style={styles.sectionTitle as TextStyle}>Participants</Text>
          {participants.length === 0 ? (
            <Text style={styles.emptyText as TextStyle}>Aucun participant pour le moment</Text>
          ) : (
            <FlatList
              data={participants}
              renderItem={renderParticipant}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.participantsList as ViewStyle}
            />
          )}
        </View>

        {tournament.status === 'open' && (
          <TouchableOpacity 
            style={styles.registerButton as ViewStyle}
            onPress={handleRegister}
            disabled={tournament.participants.includes(user?.uid || '')}
          >
            <Text style={styles.registerButtonText as TextStyle}>
              {tournament.participants.includes(user?.uid || '') 
                ? 'Déjà inscrit' 
                : 'S\'inscrire'}
            </Text>
          </TouchableOpacity>
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
  content: {
    padding: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  participantsSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  participantsList: {
    gap: theme.spacing.sm,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
  },
  participantName: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  registerButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
}); 
