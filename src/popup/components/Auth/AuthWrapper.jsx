import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import Login from './Login';
import Register from './Register';
import PasswordGenerator from '../PG/PasswordGenerator';

const AuthWrapper = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (user) => {
    setUser(user);
  };

  const toggleAuth = () => {
    setShowLogin(!showLogin);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return showLogin ? (
      <Login onToggleAuth={toggleAuth} onLoginSuccess={handleAuthSuccess} />
    ) : (
      <Register onToggleAuth={toggleAuth} onRegisterSuccess={handleAuthSuccess} />
    );
  }

  return <PasswordGenerator user={user} />;
};

export default AuthWrapper;
