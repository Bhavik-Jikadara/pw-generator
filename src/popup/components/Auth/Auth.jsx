import React, { useState, useEffect } from 'react';
import { auth } from '../../../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseService } from '../../../services/firebaseService';
import './Auth.css';

export const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        onLogin(user);
      }
    });
    return () => unsubscribe();
  }, [onLogin]);

  const handleAuthError = (error) => {
    const errorMessages = {
      'auth/user-not-found': 'Account not found. Please sign up first.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
      'auth/invalid-email': 'Invalid email format. Please enter a valid email address.',
      'auth/email-already-in-use': 'Account already exists. Please login.',
      'auth/weak-password': 'Password is too weak. Please choose a stronger password.'
    };

    setError(errorMessages[error.code] || error.message || 'An unexpected error occurred');
    if (error.code === 'auth/user-not-found') {
      setIsLogin(false);
    } else if (error.code === 'auth/email-already-in-use') {
      setIsLogin(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Password complexity check
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userExists = await firebaseService.checkUserExists(userCredential.user.uid);
        
        if (!userExists) {
          throw new Error('Account not found. Please sign up first.');
        }
        onLogin(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await firebaseService.initializeUserCollection(
          userCredential.user.uid,
          userCredential.user.email
        );
        setIsLogin(true);
        setError('Account created successfully. Please log in.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  // Render null if we're checking auth state
  if (auth.currentUser) {
    return null;
  }

  return (
    <div className="auth-container">
      <div className="logo-container">
        <div className='logo-title'>
          <img src="/logo.png" alt="Logo" />
          <h2 className="app-title">Password Generator</h2>
        </div>
        <p className="subtitle">
          {isLogin
            ? 'Welcome back! Please login to continue'
            : 'Create an account to get started'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
            placeholder="Enter your email"
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
            placeholder={isLogin ? 'Enter your password' : 'Create a password'}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>

        <div className="toggle-auth">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="toggle-button"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
};
