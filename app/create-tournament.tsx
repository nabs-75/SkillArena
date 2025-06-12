import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { useAuth } from './context/AuthContext';
import { theme } from './theme';

export default function CreateTournamentScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [game, setGame] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleCreate = async () => {
    if (!name || !game || !maxParticipants) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    // Combiner la date et l'heure
    const tournamentDateTime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );

    if (tournamentDateTime < new Date()) {
      Alert.alert('Erreur', 'La date et l\'heure du tournoi doivent être dans le futur');
      return;
    }

    setLoading(true);

    try {
      const db = getFirestore();
      await addDoc(collection(db, 'tournaments'), {
        name,
        game,
        maxParticipants: parseInt(maxParticipants),
        currentParticipants: 0,
        date: tournamentDateTime,
        status: 'open',
        createdBy: user?.uid,
        createdAt: new Date(),
        participants: []
      });

      Alert.alert('Succès', 'Tournoi créé avec succès !');
      router.back();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le tournoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Créer un tournoi</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom du tournoi"
        value={name}
        onChangeText={setName}
        editable={!loading}
        placeholderTextColor={theme.colors.textSecondary}
      />

      <TextInput
        style={styles.input}
        placeholder="Jeu"
        value={game}
        onChangeText={setGame}
        editable={!loading}
        placeholderTextColor={theme.colors.textSecondary}
      />

      <TextInput
        style={styles.input}
        placeholder="Nombre maximum de participants"
        value={maxParticipants}
        onChangeText={setMaxParticipants}
        keyboardType="numeric"
        editable={!loading}
        placeholderTextColor={theme.colors.textSecondary}
      />

      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateButtonText}>
          Date : {date.toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowTimePicker(true)}
      >
        <Text style={styles.dateButtonText}>
          Heure : {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(false);
            if (selectedTime) {
              setTime(selectedTime);
            }
          }}
        />
      )}

      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.text} />
        ) : (
          <Text style={styles.buttonText}>Créer le tournoi</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold',
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    fontSize: theme.typography.body.fontSize,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  dateButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: theme.colors.textSecondary,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    fontWeight: 'bold',
  },
}); 