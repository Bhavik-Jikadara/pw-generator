// services/authService.js
import { auth } from '../firebase/config';
import { firebaseService } from './firebaseService';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

export const authService = {
  register: async (email, password) => {
    try {
      // First try to create the auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Then initialize the user document in Firestore
      try {
        await firebaseService.initializeUserCollection(userCredential.user.uid, {
          email: userCredential.user.email
        });
      } catch (error) {
        console.error('Error initializing user collection:', error);
        // If Firestore initialization fails, delete the auth user
        await userCredential.user.delete();
        throw new Error('Failed to initialize user data');
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Verify user document exists
      try {
        const exists = await firebaseService.checkUserExists(userCredential.user.uid);
        if (!exists) {
          // Initialize user document if it doesn't exist
          await firebaseService.initializeUserCollection(userCredential.user.uid, {
            email: userCredential.user.email
          });
        }
      } catch (error) {
        console.error('Error checking/initializing user:', error);
        throw new Error('Failed to access user data');
      }
      
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
};