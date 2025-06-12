
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image, ViewStyle, TextStyle } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { FontAwesome } from '@expo/vector-icons';
import { theme } from '../theme';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUsername(data.username || '');
        setBio(data.bio || '');
        setProfilePicture(data.profilePicture || null);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger le profil');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let profilePictureUrl = profilePicture;

      // Si une nouvelle image a été sélectionnée, l'uploader
      if (profilePicture && profilePicture.startsWith('file://')) {
        const response = await fetch(profilePicture);
        const blob = await response.blob();
        const storage = getStorage();
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, blob);
        profilePictureUrl = await getDownloadURL(storageRef);
      }

      // Mettre à jour le profil
      await updateProfile({
        username,
        bio,
        profilePicture: profilePictureUrl
      });

      Alert.alert('Succès', 'Profil mis à jour avec succès');
      router.back();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container as ViewStyle}>
      <View style={styles.header as ViewStyle}>
        <TouchableOpacity 
          style={styles.backButton as ViewStyle}
          onPress={() => router.back()}
        >
          <FontAwesome name="arrow-left" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title as TextStyle}>Modifier le profil</Text>
      </View>

      <ScrollView style={styles.content as ViewStyle}>
        <TouchableOpacity 
          style={styles.profilePictureContainer as ViewStyle}
          onPress={pickImage}
        >
          {profilePicture ? (
            <Image
              source={{ uri: profilePicture }}
              style={styles.profilePicture as any}
            />
          ) : (
            <View style={styles.profilePicturePlaceholder as ViewStyle}>
              <FontAwesome name="user" size={40} color={theme.colors.textSecondary} />
            </View>
          )}
          <View style={styles.editIconContainer as ViewStyle}>
            <FontAwesome name="camera" size={16} color={theme.colors.text} />
          </View>
        </TouchableOpacity>

        <View style={styles.form as ViewStyle}>
          <Text style={styles.label as TextStyle}>Nom d'utilisateur</Text>
          <TextInput
            style={styles.input as TextStyle}
            value={username}
            onChangeText={setUsername}
            placeholder="Entrez votre nom d'utilisateur"
            placeholderTextColor={theme.colors.textSecondary}
          />

          <Text style={styles.label as TextStyle}>Bio</Text>
          <TextInput
            style={[styles.input as TextStyle, styles.bioInput as ViewStyle]}
            value={bio}
            onChangeText={setBio}
            placeholder="Parlez-nous de vous..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity 
            style={styles.saveButton as ViewStyle}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.text} />
            ) : (
              <Text style={styles.saveButtonText as TextStyle}>Enregistrer</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePicturePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: theme.typography.body.fontSize,
    marginBottom: theme.spacing.md,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  saveButtonText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
}); 
