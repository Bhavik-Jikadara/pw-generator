import React, { useState } from 'react';
import { auth } from '../../../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseService } from '../../../services/firebaseService';
import { cn } from '../../lib/utils';
import "./Auth.css";

export const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

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

  return (
    <div className="flex flex-col min-h-full p-6 bg-background">
      <div className="flex flex-col items-center justify-center flex-1">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <img src="/logo.png" alt="Logo" className="w-16 h-16" />
            <h1 className="text-2xl font-bold">Password Generator</h1>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? 'Welcome back! Please login to continue'
                : 'Create an account to get started'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
                  "text-sm ring-offset-background file:border-0 file:bg-transparent",
                  "file:text-sm file:font-medium placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
                  "text-sm ring-offset-background file:border-0 file:bg-transparent",
                  "file:text-sm file:font-medium placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-ring focus-visible:ring-offset-2",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
                placeholder={isLogin ? "Enter your password" : "Create a password"}
                required
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "inline-flex w-full items-center justify-center rounded-md",
                "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
                "hover:bg-primary/90 focus-visible:outline-none",
                "focus-visible:ring-2 focus-visible:ring-ring",
                "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              )}
            >
              {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="inline-flex w-full items-center justify-center text-sm text-muted-foreground hover:text-primary"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};