import React, { useState, useEffect } from 'react';
import { Auth } from './components/auth/Auth';
import { Dashboard } from './components/dashboard/Dashboard';
import { ToastProvider, Toaster } from './components/ui/toast';
import { BrowserRouter } from 'react-router-dom';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

export const Popup = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize auth state
    const initAuth = async () => {
      try {
        // Check if there's a stored user
        const storedUser = localStorage.getItem('pw_gen_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            const userData = {
              uid: user.uid,
              email: user.email,
            };
            setUser(userData);
            localStorage.setItem('pw_gen_user', JSON.stringify(userData));
          } else {
            setUser(null);
            localStorage.removeItem('pw_gen_user');
          }
          setLoading(false);
        });

        // Cleanup function
        return () => {
          unsubscribe();
        };
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
        setLoading(false);
      }
    };

    initAuth();

    // Add listener for extension context invalidation
    const handleExtensionContextInvalidated = () => {
      // Clear local state
      setUser(null);
      localStorage.removeItem('pw_gen_user');

      // Reload the extension popup
      window.location.reload();
    };

    // Listen for extension context invalidation
    if (chrome.runtime && chrome.runtime.onSuspend) {
      chrome.runtime.onSuspend.addListener(handleExtensionContextInvalidated);
    }

    return () => {
      if (chrome.runtime && chrome.runtime.onSuspend) {
        chrome.runtime.onSuspend.removeListener(handleExtensionContextInvalidated);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="w-[400px] h-[550px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[400px] h-[550px] flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="w-[400px] min-h-[550px] bg-background text-foreground">
          {user ? (
            <Dashboard user={user} />
          ) : (
            <Auth onLogin={(userData) => {
              setUser(userData);
              localStorage.setItem('pw_gen_user', JSON.stringify(userData));
            }} />
          )}
        </div>
        <Toaster />
      </ToastProvider>
    </BrowserRouter>
  );
};