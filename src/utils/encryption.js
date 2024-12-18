// utils/encryption.js
import CryptoJS from 'crypto-js';
import { ENCRYPTION_KEY } from '../firebase/config';

export const encryptionService = {
  encrypt: (value, uid) => {
    if (!value || !uid) return '';
    try {
      const key = `${uid}-${ENCRYPTION_KEY}`;
      return CryptoJS.AES.encrypt(value, key).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt value');
    }
  },

  decrypt: (encryptedValue, uid) => {
    if (!encryptedValue || !uid) return '';
    try {
      const key = `${uid}-${ENCRYPTION_KEY}`;
      const bytes = CryptoJS.AES.decrypt(encryptedValue, key);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt value');
    }
  }
};