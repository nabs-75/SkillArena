
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../theme';
import { useFocusEffect } from '@react-navigation/native';

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

export default function TournamentsScreen() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchTournaments = async () => {
    try {
      const db = getFirestore();
      const tournamentsRef = collection(db, 'tournaments');
      
      // Récupérer tous les tournois
      const q = query(tournamentsRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      console.log('Nombre de tournois trouvés:', snapshot.size);
      
      const tournamentsData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Données du tournoi:', data);
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          participants: data.participants || []
        };
      }) as Tournament[];
      
      console.log('Tournois transformés:', tournamentsData);
      setTournaments(tournamentsData);
    } catch (error) {
      console.error('Erreur lors du chargement des tournois:', error, (error as any)?.code, (error as any)?.message);
      Alert.alert('Erreur', 'Impossible de charger les tournois');
    } finally {
      setLoading(false);
    }
  };

  // Recharger les tournois à chaque fois que l'écran est affiché
  useFocusEffect(
    React.useCallback(() => {
      fetchTournaments();
    }, [])
  );

  const renderTournament = ({ item }: { item: Tournament }) => {
    const now = new Date();
    const isPast = item.date < now;
    const isOngoing = item.status === 'ongoing';
    const isUpcoming = item.status === 'open' && !isPast;

    return (
      <TouchableOpacity 
        style={styles.tournamentCard as ViewStyle}
        onPress={() => router.push(`/tournament/${item.id}`)}
        disabled={isPast}
      >
        <View style={styles.tournamentHeader as ViewStyle}>
          <Text style={styles.tournamentName as TextStyle}>{item.name}</Text>
          <View style={[
            styles.statusBadge as ViewStyle,
            isUpcoming && styles.upcomingBadge as ViewStyle,
            isOngoing && styles.ongoingBadge as ViewStyle,
            isPast && styles.pastBadge as ViewStyle
          ]}>
            <Text style={styles.statusText as TextStyle}>
              {isPast ? 'Passé' : isOngoing ? 'En cours' : 'À venir'}
            </Text>
          </View>
        </View>

        <View style={styles.tournamentInfo as ViewStyle}>
          <View style={styles.infoItem as ViewStyle}>
            <FontAwesome name="gamepad" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText as TextStyle}>{item.game}</Text>
          </View>
          <View style={styles.infoItem as ViewStyle}>
            <FontAwesome name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText as TextStyle}>
              {item.date.toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.infoItem as ViewStyle}>
            <FontAwesome name="users" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText as TextStyle}>
              {item.participants.length}/{item.maxParticipants} participants
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer as ViewStyle}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.header as ViewStyle}>
        <Text style={styles.title as TextStyle}>Tournois</Text>
        <TouchableOpacity 
          style={styles.createButton as ViewStyle}
          onPress={() => router.push('../create-tournament')}
        >
          <FontAwesome name="plus" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {tournaments.length === 0 ? (
        <Text style={styles.emptyText as TextStyle}>Aucun tournoi disponible</Text>
      ) : (
        <FlatList
          data={tournaments}
          renderItem={renderTournament}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer as ViewStyle}
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
  createButton: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  tournamentCard: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  tournamentName: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginLeft: theme.spacing.sm,
  },
  upcomingBadge: {
    backgroundColor: theme.colors.success,
  },
  ongoingBadge: {
    backgroundColor: theme.colors.warning,
  },
  pastBadge: {
    backgroundColor: theme.colors.error,
  },
  statusText: {
    fontSize: theme.typography.small.fontSize,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  tournamentInfo: {
    gap: theme.spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
}); 
