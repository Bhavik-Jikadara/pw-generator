// firebaseService.js
import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  setDoc,
  getDoc,
  getFirestore
} from 'firebase/firestore';

const USERS_COLLECTION = 'users';
const PASSWORDS_COLLECTION = 'passwords';

export const firebaseService = {
  // Initialize user collection when they first sign up/login
  initializeUserCollection: async (userId, email) => {
    try {
      const userRef = doc(db, USERS_COLLECTION, userId);
      await setDoc(userRef, {
        email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }, { merge: true });
      
      // Create a subcollection for passwords under the user
      const userPasswordsRef = collection(db, USERS_COLLECTION, userId, PASSWORDS_COLLECTION);
      return userPasswordsRef;
    } catch (error) {
      console.error('Error initializing user:', error);
      throw error;
    }
  },

  // Add new password to user's collection
  addPassword: async (userId, data) => {
    try {
      const userPasswordsRef = collection(db, USERS_COLLECTION, userId, PASSWORDS_COLLECTION);
      const docRef = await addDoc(userPasswordsRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error adding password:', error);
      throw error;
    }
  },

  // Get all passwords for a user
  getPasswords: async (userId) => {
    try {
      const userPasswordsRef = collection(db, USERS_COLLECTION, userId, PASSWORDS_COLLECTION);
      const q = query(userPasswordsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting passwords:', error);
      throw error;
    }
  },

  // Update password entry
  updatePassword: async (userId, passwordId, data) => {
    try {
      const passwordRef = doc(db, USERS_COLLECTION, userId, PASSWORDS_COLLECTION, passwordId);
      await updateDoc(passwordRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },

  // Delete password entry
  deletePassword: async (userId, passwordId) => {
    try {
      const passwordRef = doc(db, USERS_COLLECTION, userId, PASSWORDS_COLLECTION, passwordId);
      await deleteDoc(passwordRef);
      return true;
    } catch (error) {
      console.error('Error deleting password:', error);
      throw error;
    }
  },

  async checkUserExists(userId) {
    const db = getFirestore();
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists();
  }
};