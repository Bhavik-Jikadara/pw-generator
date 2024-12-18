import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Auth } from './components/auth/Auth';
import { Dashboard } from './components/dashboard/Dashboard';
import { Toaster } from './components/ui/toast';
import { TooltipProvider } from './components/ui/tooltip';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

export const Popup = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('pw_gen_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }

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

        return () => unsubscribe();
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleAuthStateChange = (user) => {
    if (user) {
      const userData = {
        uid: user.uid,
        email: user.email,
      };
      setUser(userData);
      localStorage.setItem('pw_gen_user', JSON.stringify(userData));
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 bg-background">
        <div className="text-center text-destructive">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <TooltipProvider>
        <div className="w-[385px] h-[545px] overflow-hidden bg-background">
          <div className="flex flex-col h-full">
            {user ? (
              <Dashboard user={user} />
            ) : (
              <Auth onLogin={handleAuthStateChange} />
            )}
          </div>
          <Toaster />
        </div>
      </TooltipProvider>
    </BrowserRouter>
  );
};