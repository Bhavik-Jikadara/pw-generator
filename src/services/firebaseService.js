// services/firebaseService.js
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { encryptionService } from '../utils/encryption';

export const firebaseService = {
  // Initialize user collection and document
  initializeUserCollection: async (uid, email) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          settings: {
            defaultExpiryDays: 90,
            defaultPasswordLength: 16
          }
        });
      }
      return true;
    } catch (error) {
      console.error('Error initializing user collection:', error);
      throw error;
    }
  },

  // Check if user exists
  checkUserExists: async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      return userDoc.exists();
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw error;
    }
  },

  // Get user's current password index
  getPasswordIndex: async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      return userDoc.exists() ? userDoc.data().passwordIndex || 0 : 0;
    } catch (error) {
      console.error('Error getting password index:', error);
      throw error;
    }
  },

  // Increment password index
  incrementPasswordIndex: async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const currentIndex = await firebaseService.getPasswordIndex(uid);
      await setDoc(userRef, {
        passwordIndex: currentIndex + 1,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return currentIndex + 1;
    } catch (error) {
      console.error('Error incrementing password index:', error);
      throw error;
    }
  },

  // Updated getPasswords method with proper error handling
  getPasswords: async (uid) => {
    try {
      const passwordsRef = collection(db, 'users', uid, 'passwords');
      const q = query(
        passwordsRef,
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(q);
      const passwords = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || data.createdAt || new Date().toISOString()
        };
      });

      // Sort on client side
      return passwords.sort((a, b) => {
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Error getting passwords:', error);
      throw error;
    }
  },

  // Updated addPassword method with proper collection path
  addPassword: async (uid, passwordData) => {
    try {
      const passwordsRef = collection(db, 'users', uid, 'passwords');

      const docData = {
        ...passwordData,
        timestamp: serverTimestamp(),
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      const docRef = await addDoc(passwordsRef, docData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding password:', error);
      throw error;
    }
  },

  deletePassword: async (uid, passwordId) => {
    try {
      // Reference to the specific password document
      const passwordRef = doc(db, 'users', uid, 'passwords', passwordId);
      
      await setDoc(passwordRef, {
        status: 'deleted',
        deletedAt: serverTimestamp()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error deleting password:', error);
      throw new Error('Failed to delete entry');
    }
  },
};