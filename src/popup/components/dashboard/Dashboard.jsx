import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../../firebase/config';
import { PasswordGenerator } from '../PG/PasswordGenerator';
import { ScrollArea } from '../ui/scroll-area';
import { firebaseService } from '../../../services/firebaseService';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import {
  Copy,
  LogOut,
  Loader2,
  UserCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from '../ui/use-toast';
import CryptoJS from 'crypto-js';

const CategoryTab = ({ active, label, count, onClick }) => (
  <button
    onClick={onClick}
    className={`text-sm font-medium ${
      active ? 'text-primary' : 'text-muted-foreground'
    }`}
  >
    {label} ({count})
  </button>
);

const HistoryCard = ({ entry, onCopy }) => {
  const getTypeStyles = (type) => {
    if (type === 'password') {
      return 'bg-red-50/50 text-red-900';
    }
    return 'bg-emerald-50/50 text-emerald-900';
  };

  return (
    <Card className="p-4 border hover:shadow-sm transition-shadow">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <span className="text-sm font-medium">{entry.accountName}</span>
          <Button
            onClick={() => onCopy(entry.value, entry.id)}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className={`rounded-sm px-2 py-1.5 font-mono text-sm ${getTypeStyles(entry.type)}`}>
          {entry.value}
        </div>
        <div className="text-xs text-muted-foreground">
          {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
        </div>
      </div>
    </Card>
  );
};

export const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('generator');
  const [activeFilter, setActiveFilter] = useState('all');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError(null);
    try {
      const passwords = await firebaseService.getPasswords(user.uid);
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
      setError('Failed to load history');
      toast({
        title: 'Error',
        description: 'Failed to load history',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleSavePassword = useCallback(async (newPassword) => {
    try {
      await firebaseService.addPassword(user.uid, newPassword);
      await loadHistory();
      toast({
        title: 'Success',
        description: 'Successfully saved',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save',
        variant: 'destructive',
      });
    }
  }, [user, loadHistory]);

  const handleCopy = useCallback(async (value, id) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: 'Copied!',
        description: 'Content copied to clipboard',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to copy',
        variant: 'destructive',
      });
    }
  }, []);

  useEffect(() => {
    if (!auth.currentUser && !user) {
      navigate('/');
    } else if (user) {
      loadHistory();
    }
  }, [navigate, user, loadHistory]);

  const filteredHistory = useMemo(() => {
    if (activeFilter === 'all') return history;
    return history.filter(item => item.type === activeFilter);
  }, [history, activeFilter]);

  const stats = useMemo(() => ({
    all: history.length,
    password: history.filter(item => item.type === 'password').length,
    word: history.filter(item => item.type === 'word').length,
  }), [history]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-background">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <UserCircle className="w-5 h-5" />
            <span className="text-sm">{user.email}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await auth.signOut();
              navigate('/');
            }}
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {activeTab === 'generator' ? (
          <PasswordGenerator user={user} onSave={handleSavePassword} />
        ) : (
          <div className="p-2 space-y-2">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex gap-4">
                <CategoryTab
                  active={activeFilter === 'all'}
                  label="All"
                  count={stats.all}
                  onClick={() => setActiveFilter('all')}
                />
                <CategoryTab
                  active={activeFilter === 'password'}
                  label="Passwords"
                  count={stats.password}
                  onClick={() => setActiveFilter('password')}
                />
                <CategoryTab
                  active={activeFilter === 'word'}
                  label="Words"
                  count={stats.word}
                  onClick={() => setActiveFilter('word')}
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadHistory}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-180px)]">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                  <p className="text-destructive">{error}</p>
                  <Button onClick={loadHistory} variant="outline">
                    Try Again
                  </Button>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                  <p className="text-muted-foreground">No items found</p>
                  {activeTab === 'history' && (
                    <Button onClick={() => setActiveTab('generator')} variant="outline">
                      Generate New
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHistory.map(entry => (
                    <HistoryCard
                      key={entry.id}
                      entry={entry}
                      onCopy={handleCopy}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </main>

      <footer className="border-t mt-auto bg-background">
        <div className="flex divide-x">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center justify-center gap-2 flex-1 py-3 ${
              activeTab === 'generator' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <span className="text-lg">⚡</span>
            <span className="text-sm font-medium">Generator</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center gap-2 flex-1 py-3 ${
              activeTab === 'history' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <span className="text-lg">🕒</span>
            <span className="text-sm font-medium">History</span>
          </button>
        </div>
      </footer>
    </div>
  );
};