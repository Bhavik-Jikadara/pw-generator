import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { auth } from '../../../firebase/config';
import { PasswordGenerator } from '../PG/PasswordGenerator';
import { firebaseService } from '../../../services/firebaseService';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import {
  Copy, LogOut, Loader2, RefreshCw, Check,
  Key, FileText, Eye, EyeOff, Type
} from 'lucide-react';
import { toast } from '../ui/use-toast';

// Enhanced CategoryTab Component
const CategoryTab = ({ active, label, count, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] transition-all ${active
      ? 'bg-primary/10 text-primary font-medium'
      : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      }`}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-primary/15' : 'bg-muted'
      }`}>
      {count}
    </span>
  </button>
);

const HistoryCard = ({ entry, onCopy, onDelete }) => {
  const [copying, setCopying] = useState(false);
  const [showValue, setShowValue] = useState(false);

  const getTypeStyles = (type) => ({
    password: 'bg-blue-50/50 text-blue-900 border-blue-200',
    word: 'bg-green-50/50 text-green-900 border-green-200'
  }[type] || 'bg-gray-50 text-gray-900 border-gray-200');

  const getTypeTagStyles = (type) => ({
    password: 'bg-blue-100/50 text-blue-700 border border-blue-200',
    word: 'bg-green-100/50 text-green-700 border border-green-200'
  }[type] || 'bg-gray-100 text-gray-700 border border-gray-200');

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      if (diffInHours < 48) {
        return 'Yesterday';
      }
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const handleCopy = async () => {
    try {
      setCopying(true);
      await onCopy(entry.value);
      toast({ description: "Copied to clipboard" });
    } catch (error) {
      toast({
        description: "Failed to copy",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  };

  return (
    <Card className="group hover:shadow-md rounded-lg transition-all border border-border/50">
      <div className="p-2 space-y-1.5">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="min-w-0">
            <h3 className="font-medium text-xs truncate text-foreground/90">
              {entry.accountName}
            </h3>
            <p className="text-[10px] text-muted-foreground/80">
              {formatTimestamp(entry.timestamp)}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-1 ml-2 opacity-80 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowValue(!showValue)}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              {showValue ? (
                <EyeOff className="h-3 w-3" />
              ) : (
                <Eye className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={copying}
              className="h-6 w-6 p-0 hover:bg-muted"
            >
              {copying ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Value Display */}
        <div className={`font-mono text-xs px-2 py-1.5 rounded-md ${getTypeStyles(entry.type)} break-all transition-colors`}>
          {showValue ? entry.value : '•'.repeat(Math.min(entry.value.length, 24))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-0.5">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getTypeTagStyles(entry.type)}`}>
            {entry.type}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(entry.id)}
            className="h-5 text-[10px] text-destructive/70 hover:text-destructive hover:bg-destructive/10 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};

export const Dashboard = ({ user, className = "" }) => {
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
      setHistory(passwords);
    } catch (err) {
      console.error('History load error:', err);
      // Show a more user-friendly message
      const errorMessage = err.message.includes('index')
        ? 'Setting up database... Please wait a moment and try again.'
        : 'Failed to load history';
      setError(errorMessage);
      toast({
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleSavePassword = useCallback(async (newPassword) => {
    try {
      console.log('Attempting to save password:', newPassword); // Debug log
      await firebaseService.addPassword(user.uid, newPassword);
      await loadHistory(); // Reload history after saving
      toast({
        description: 'Successfully saved',
      });
      return true; // Return success
    } catch (err) {
      console.error('Save error:', err);
      toast({
        description: 'Failed to save',
        variant: 'destructive',
      });
      return false; // Return failure
    }
  }, [user, loadHistory]);

  useEffect(() => {
    if (activeTab === 'history') {
      console.log('Loading history on tab switch'); // Debug log
      loadHistory();
    }
  }, [activeTab, loadHistory]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      await firebaseService.deletePassword(user.uid, id);

      // Update local state to remove the deleted item
      setHistory(prevHistory => prevHistory.filter(item => item.id !== id));

      toast({
        description: 'Entry deleted successfully',
      });
    } catch (err) {
      console.error('Delete error:', err);
      toast({
        title: "Error",
        description: err.message || 'Failed to delete entry',
        variant: 'destructive',
      });
    }
  }, [user]);

  const handleCopy = useCallback(async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (err) {
      console.error('Copy error:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, loadHistory]);

  const filteredHistory = useMemo(() => {
    if (activeFilter === 'all') return history;
    return history.filter(item => item.type === activeFilter);
  }, [history, activeFilter]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      onLogout?.();
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-[550px] relative bg-background">
      {/* Reduced padding in header */}
      <header className="sticky top-0 z-20 border-b py-1.5 px-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <Key className="w-3 h-3 text-primary" />
            </div>
            <span className="text-xs font-medium truncate max-w-[180px]">{user.email}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="h-7 gap-1 text-muted-foreground hover:text-foreground px-2"
          >
            <LogOut className="w-3 h-3" />
            <span className="text-xs">Logout</span>
          </Button>
        </div>
      </header>

      {/* Optimized main content area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'generator' ? (
          <div className="p-2">
            <PasswordGenerator user={user} onSave={handleSavePassword} />
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {/* Reduced padding in filter tabs */}
            <div className="sticky top-0 z-10 px-2 py-1.5 border-b bg-background">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hidden">
                  <CategoryTab
                    active={activeFilter === 'all'}
                    label="All"
                    count={history.length}
                    icon={FileText}
                    onClick={() => setActiveFilter('all')}
                  />
                  <CategoryTab
                    active={activeFilter === 'password'}
                    label="Passwords"
                    count={history.filter(i => i.type === 'password').length}
                    icon={Key}
                    onClick={() => setActiveFilter('password')}
                  />
                  <CategoryTab
                    active={activeFilter === 'word'}
                    label="Words"
                    count={history.filter(i => i.type === 'word').length}
                    icon={Type}
                    onClick={() => setActiveFilter('word')}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadHistory}
                  className="h-6 w-6 flex-shrink-0 p-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Optimized history list spacing */}
            <div className="flex-1 overflow-y-auto px-2 py-1.5 pb-12 space-y-1.5 custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center items-center h-20">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-center py-6">
                  <p className="text-xs text-red-500">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-7 text-xs"
                    onClick={loadHistory}
                  >
                    Try Again
                  </Button>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-muted-foreground">
                    {activeFilter === 'all'
                      ? 'No entries found'
                      : `No ${activeFilter} entries found`}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 h-7 text-xs"
                    onClick={() => setActiveTab('generator')}
                  >
                    Create New
                  </Button>
                </div>
              ) : (
                filteredHistory.map(entry => (
                  <HistoryCard
                    key={entry.id}
                    entry={entry}
                    onCopy={handleCopy}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Optimized footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-20 border-t bg-background">
        <div className="grid grid-cols-2 divide-x">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
              activeTab === 'generator'
                ? 'text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Generator
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            History
          </button>
        </div>
      </footer>
    </div>
  );
};
