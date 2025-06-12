import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCtnqPWz9xZMy8VetMtnl28Cad7IIz3QPQ",
  authDomain: "app-gamer-f7418.firebaseapp.com",
  projectId: "app-gamer-f7418",
  storageBucket: "app-gamer-f7418.firebasestorage.app",
  messagingSenderId: "1000124707786",
  appId: "1:1000124707786:web:448deed755a4ede45ed533"
};

// Initialisation SÛRE (évite le bug "no app")
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
