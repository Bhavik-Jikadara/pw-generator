import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase/config';
import { PasswordGenerator } from '../PG/PasswordGenerator';
import { ScrollArea } from '../ui/scroll-area';
import { firebaseService } from '../../../services/firebaseService';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Copy, Edit2, Trash2, Shield, Clock, LogOut, Loader2, RefreshCw, UserCircle
} from 'lucide-react';
import { toast } from '../ui/use-toast';
import CryptoJS from 'crypto-js';

export const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generator');
  const [history, setHistory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState('');
  const [copyStatus, setCopyStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError(null);
    try {
      const passwords = await firebaseService.getPasswords(user.uid);
      // Decrypt passwords using the same key used for encryption
      const decryptedPasswords = passwords.map(password => {
        try {
          const encryptionKey = `${user.uid}-${process.env.REACT_APP_ENCRYPTION_KEY || 'fallback-key'}`;
          const bytes = CryptoJS.AES.decrypt(password.value, encryptionKey);
          return {
            ...password,
            value: bytes.toString(CryptoJS.enc.Utf8)
          };
        } catch (error) {
          console.error('Decryption error:', error);
          return {
            ...password,
            value: '******'
          };
        }
      });
      setHistory(decryptedPasswords);
    } catch (err) {
      console.error('Error loading history:', err);
      setError('Failed to load password history. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to load password history.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleSavePassword = useCallback(async (newPassword) => {
    try {
      // Save the password to Firebase
      await firebaseService.addPassword(user.uid, newPassword);
      // Reload the history after saving
      await loadHistory();
      toast({
        title: 'Success',
        description: 'Password saved successfully.',
      });
    } catch (err) {
      console.error('Error saving password:', err);
      toast({
        title: 'Error',
        description: 'Failed to save password.',
        variant: 'destructive',
      });
    }
  }, [user, loadHistory]);

  const handleCopyHistoryItem = useCallback(async (value, id) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(prev => ({ ...prev, [id]: true }));

      toast({
        title: 'Success',
        description: 'Copied to clipboard!',
      });

      setTimeout(() => {
        setCopyStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[id];
          return newStatus;
        });
      }, 2000);
    } catch (err) {
      console.error('Copy error:', err);
      toast({
        title: 'Error',
        description: 'Failed to copy.',
        variant: 'destructive',
      });
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser && !user) {
      navigate('/');
    }
  }, [navigate, user]);

  useEffect(() => {
    checkAuth();
    if (user) {
      loadHistory();
    }
  }, [checkAuth, loadHistory, user]);

  const renderHistoryContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full p-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={loadHistory} variant="outline">
            Try Again
          </Button>
        </div>
      );
    }

    if (history.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No history available yet.</p>
          <Button onClick={() => setActiveTab('generator')} variant="outline">
            Generate Password
          </Button>
        </div>
      );
    }

    return history.map(entry => {
      // Define color classes based on type
      const typeColorMap = {
        password: {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-300'
        },
        word: {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-300'
        }
      };

      const typeColors = typeColorMap[entry.type] || typeColorMap.password;

      return (
        <Card 
          key={entry.id} 
          className={`p-4 mb-4 shadow-sm hover:shadow-md transition-shadow border ${typeColors.border}`}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1">
              <h3 className="font-medium">{entry.accountName}</h3>
              <div className="flex items-center space-x-2">
                <code
                  className={`text-sm p-1 rounded break-all ${typeColors.bg} ${typeColors.text}`}
                >
                  {entry.value || 'N/A'}
                </code>
                <span className="text-xs capitalize">
                  {entry.type || 'Unknown'}
                </span>
              </div>
            </div>
            <div className="flex space-x-2 ml-4">
              <Button
                onClick={() => handleCopyHistoryItem(entry.value, entry.id)}
                variant="outline"
                size="sm"
                className={copyStatus[entry.id] ? 'text-green-500' : ''}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      );
    });
  }, [history, isLoading, error, copyStatus, handleCopyHistoryItem]);

  if (!user) return null;

  return (
    <div className="w-full h-screen flex flex-col">
      <header className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <UserCircle className="w-5 h-5 text-gray-500" />
            <span className="text-sm">{user?.email}</span>
          </div>
          <Button
            variant="ghost"
            onClick={async () => {
              await auth.signOut();
              navigate('/');
            }}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-4">
        {activeTab === 'generator' ? (
          <PasswordGenerator user={user} onSave={handleSavePassword} />
        ) : (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-4">{renderHistoryContent}</div>
          </ScrollArea>
        )}
      </main>

      <nav className="border-t flex">
        {[
          { id: 'generator', icon: Shield, label: 'Generator' },
          { id: 'history', icon: Clock, label: 'History' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 p-4 text-center ${
              activeTab === id ? 'text-primary border-t-2 border-primary' : 'text-muted hover:text-foreground'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};