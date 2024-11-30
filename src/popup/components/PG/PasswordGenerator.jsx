import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Copy, RefreshCw, Trash2, Pencil, Search, Key, Clock } from 'lucide-react';

const PasswordGenerator = () => {
  // State Management
  const [generatedValue, setGeneratedValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [mode, setMode] = useState('password');
  const [activeTab, setActiveTab] = useState('settings');
  const [words, setWords] = useState([]);
  const [history, setHistory] = useState([]);
  const [accountName, setAccountName] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedHistory, setGroupedHistory] = useState({});
  const [loading, setLoading] = useState(true);

  const historyRef = useRef([]);

  // Password Settings
  const [passwordSettings, setPasswordSettings] = useState(() => {
    const savedSettings = localStorage.getItem('passwordSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      special: false,
      avoidAmbiguous: false
    };
  });

  // Word Settings
  const [wordSettings, setWordSettings] = useState(() => {
    const savedSettings = localStorage.getItem('wordSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      numberOfWords: 1,
      separator: '',
      includeSpecial: false
    };
  });

  const updateGroupedHistory = useCallback((historyData) => {
    const grouped = historyData.reduce((acc, entry) => {
      const accountKey = entry.account || 'Unnamed Accounts';
      if (!acc[accountKey]) acc[accountKey] = [];
      acc[accountKey].push(entry);
      return acc;
    }, {});
    setGroupedHistory(grouped);
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load history
        await loadHistory();

        // Load word list
        await loadWordList();

        setLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  const loadHistory = async () => {
    try {
      const result = await new Promise((resolve) => {
        chrome.storage.local.get(['passwordHistory'], resolve);
      });

      let loadedHistory = [];
      if (result.passwordHistory) {
        loadedHistory = result.passwordHistory;
      } else {
        const localHistory = localStorage.getItem('passwordHistory');
        if (localHistory) {
          loadedHistory = JSON.parse(localHistory);
        }
      }

      historyRef.current = loadedHistory;
      setHistory(loadedHistory);
      updateGroupedHistory(loadedHistory);
    } catch (error) {
      console.error('Error loading history:', error);
      setLoading(false);
    }
  };

  const saveHistory = async (newHistory) => {
    try {
      await new Promise((resolve) => {
        chrome.storage.local.set({ passwordHistory: newHistory }, resolve);
      });
      localStorage.setItem('passwordHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const loadWordList = async () => {
    try {
      const response = await fetch('/words.txt');
      const text = await response.text();
      const wordList = text
        .split('\n')
        .map(word => word.trim())
        .filter(word => word);

      setWords(wordList);
      localStorage.setItem('wordList', JSON.stringify(wordList));
      setLoading(false);
    } catch (error) {
      console.error('Error loading words:', error);
      const cachedWords = localStorage.getItem('wordList');
      if (cachedWords) {
        setWords(JSON.parse(cachedWords));
      } else {
        setWords(['secure', 'random', 'password', 'generator', 'system']);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('passwordSettings', JSON.stringify(passwordSettings));
  }, [passwordSettings]);

  useEffect(() => {
    localStorage.setItem('wordSettings', JSON.stringify(wordSettings));
  }, [wordSettings]);

  useEffect(() => {
    localStorage.setItem('generatorMode', mode);
  }, [mode]);

  useEffect(() => {
    updateGroupedHistory(historyRef.current);
  }, [historyRef.current, updateGroupedHistory]);

  const generatePassword = useCallback(() => {
    const chars = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    let allowedChars = '';
    if (passwordSettings.uppercase) allowedChars += chars.uppercase;
    if (passwordSettings.lowercase) allowedChars += chars.lowercase;
    if (passwordSettings.numbers) allowedChars += chars.numbers;
    if (passwordSettings.special) allowedChars += chars.special;

    if (passwordSettings.avoidAmbiguous) {
      const ambiguous = new Set(['l', 'I', '1', 'O', '0', 'u', 'v', 'w', 'm', 'n']);
      allowedChars = allowedChars
        .split('')
        .filter(char => !ambiguous.has(char.toLowerCase()))
        .join('');
    }

    const length = Math.max(8, Math.min(passwordSettings.length, 32));
    if (!allowedChars) return '';

    const types = Object.entries(chars)
      .filter(([type]) => passwordSettings[type])
      .map(([_, chars]) => chars);

    let password = '';
    types.forEach(typeChars => {
      const randomChar = typeChars[Math.floor(Math.random() * typeChars.length)];
      password += randomChar;
    });

    while (password.length < length) {
      const randomIndex = Math.floor(Math.random() * allowedChars.length);
      password += allowedChars[randomIndex];
    }

    return password.split('').sort(() => Math.random() - 0.5).join('');
  }, [passwordSettings]);

  const generateWord = useCallback(() => {
    if (!words.length) return '';

    const numberOfWords = Math.max(1, Math.min(wordSettings.numberOfWords, 8));
    const selectedWords = [];
    for (let i = 0; i < numberOfWords; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      selectedWords.push(words[randomIndex]);
    }

    let phrase = selectedWords.join(wordSettings.separator);
    if (wordSettings.includeSpecial) {
      phrase += wordSettings.separator + String.fromCharCode(Math.floor(Math.random() * (126 - 33 + 1)) + 33);
    }

    return phrase;
  }, [words, wordSettings]);

  const handleGenerate = useCallback(() => {
    const newValue = mode === 'password' ? generatePassword() : generateWord();
    setGeneratedValue(newValue);
  }, [mode, generatePassword, generateWord]);

  const saveToHistory = useCallback((value, source = 'generate') => {
    if (!value) return;

    const historyEntry = {
      id: Date.now(),
      value,
      timestamp: new Date().toISOString(),
      type: mode,
      account: accountName.trim(),
      source
    };

    const newHistory = [historyEntry, ...history.slice(0, 99)];
    historyRef.current = newHistory;
    setHistory(newHistory);
    updateGroupedHistory(newHistory);
    saveHistory(newHistory);
  }, [mode, accountName, history, updateGroupedHistory]);

  const copyToClipboard = useCallback(async (text, source = 'copy') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (source === 'generate') {
        saveToHistory(text, source);
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopyError(true);
      setTimeout(() => setCopyError(false), 2000);
    }
  }, [saveToHistory]);

  const clearHistory = useCallback(() => {
    const emptyHistory = [];
    historyRef.current = emptyHistory;
    setHistory(emptyHistory);
    setGroupedHistory({});
    saveHistory(emptyHistory);
  }, []);

  const deleteHistoryEntry = useCallback((id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const updatedHistory = historyRef.current.filter(entry => entry.id !== id);
      historyRef.current = updatedHistory;
      setHistory(updatedHistory);
      updateGroupedHistory(updatedHistory);
      saveHistory(updatedHistory);
    }
  }, [updateGroupedHistory]);

  const editAccountName = useCallback((id, newName) => {
    if (!newName.trim()) {
      alert('Account name cannot be empty');
      return;
    }

    const updatedHistory = historyRef.current.map(entry =>
      entry.id === id ? { ...entry, account: newName.trim() } : entry
    );

    historyRef.current = updatedHistory;
    setHistory(updatedHistory);
    updateGroupedHistory(updatedHistory);
    setEditingId(null);
    saveHistory(updatedHistory);
  }, [updateGroupedHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Card className="w-[400px] h-[500px]">
      <CardHeader className="py-2">
        <CardTitle className="text-lg font-bold text-blue-600">
          {mode === 'password' ? 'Password Generator' : 'Word Generator'}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="relative">
          <div className="p-2 h-10 bg-blue-600 text-white rounded flex items-center justify-between">
            <span className="text-sm font-mono flex-1 text-center overflow-x-auto whitespace-nowrap">
              {generatedValue || 'Your password will appear here'}
            </span>
            {generatedValue && (
              <button
                className="ml-2 p-1 hover:bg-blue-700 rounded"
                onClick={() => copyToClipboard(generatedValue, 'copy')}
              >
                <Copy className="h-3 w-3" />
              </button>
            )}
          </div>
          {copied && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-green-500 text-white text-xs py-0.5 px-2 rounded">
              Copied!
            </div>
          )}
          {copyError && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-red-500 text-white text-xs py-0.5 px-2 rounded">
              Copy failed!
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 justify-center bg-white p-2">
          <div className="flex items-center space-x-1">
            <input
              type="radio"
              id="password"
              name="mode"
              value="password"
              checked={mode === 'password'}
              onChange={() => setMode('password')}
              className="w-3 h-3"
            />
            <Label htmlFor="password" className="text-xs font-medium">Password</Label>
          </div>

          <div className="flex items-center space-x-1">
            <input
              type="radio"
              id="word"
              name="mode"
              value="word"
              checked={mode === 'word'}
              onChange={() => setMode('word')}
              className="w-3 h-3"
            />
            <Label htmlFor="word" className="text-xs font-medium">Word</Label>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-2">
            <TabsTrigger value="settings" className="text-xs py-1">Settings</TabsTrigger>
            <TabsTrigger value="history" className="text-xs py-1">History</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-2 p-2">
            {mode === 'password' ? (
              <div className="space-y-2">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Length</Label>
                    <Input
                      type="number"
                      value={passwordSettings.length}
                      onChange={(e) => {
                        const length = Math.max(8, Math.min(parseInt(e.target.value) || 0, 32));
                        setPasswordSettings((prev) => ({ ...prev, length }));
                      }}
                      className="w-20 h-6 text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    {Object.entries({
                      uppercase: 'Uppercase (A-Z)',
                      lowercase: 'Lowercase (a-z)',
                      numbers: 'Numbers (0-9)',
                      special: 'Special (!@#$%^&*)',
                      avoidAmbiguous: 'Avoid Ambiguous'
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <Label className="text-xs font-medium">{label}</Label>
                        <Switch
                          checked={passwordSettings[key]}
                          onCheckedChange={(checked) => setPasswordSettings(prev => ({ ...prev, [key]: checked }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <Label className="text-xs font-medium">Number of Words</Label>
                  <Input
                    type="number"
                    value={wordSettings.numberOfWords}
                    onChange={(e) => setWordSettings(prev => ({ ...prev, numberOfWords: Math.max(1, Math.min(parseInt(e.target.value) || 0, 8)) }))}
                    className="w-20 h-6 text-xs"
                  />
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <Label className="text-xs font-medium">Word Separator</Label>
                  <Input
                    value={wordSettings.separator}
                    onChange={(e) => setWordSettings(prev => ({ ...prev, separator: e.target.value }))}
                    className="w-20 h-6 text-xs"
                  />
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <Label className="text-xs font-medium">Include Special Character</Label>
                  <Switch
                    checked={wordSettings.includeSpecial}
                    onCheckedChange={(checked) => setWordSettings(prev => ({ ...prev, includeSpecial: checked }))}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 mt-2">
              <Input
                type="text"
                placeholder="Account Name"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
                className="flex-1 h-6 text-xs"
              />
              <Button
                size="sm"
                onClick={handleGenerate}
                className="h-6 text-xs px-2 py-0"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Generate
              </Button>
              {generatedValue && (
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(generatedValue, 'generate')}
                  className="h-6 text-xs px-2 py-0 bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-2">
            <div className="flex items-center justify-between mb-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-8 text-xs"
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={clearHistory}
                className="h-8 text-xs ml-2"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>

            <ScrollArea className="h-[280px]">
              {Object.entries(groupedHistory)
                .filter(([account]) =>
                  account.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(([account, entries]) => (
                  <div key={account} className="mb-4">
                    <div className="bg-gray-100 p-2 rounded-t flex items-center">
                      <Key className="h-4 w-4 mr-2 text-blue-600" />
                      <h3 className="text-xs font-medium text-gray-700">{account}</h3>
                      <span className="ml-2 text-xs text-gray-500">
                        ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})
                      </span>
                    </div>
                    <div className="space-y-2">
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="bg-white p-3 border rounded-b shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="font-mono text-xs break-all">
                                {entry.value}
                              </div>
                              <div className="flex items-center text-xs text-gray-500 space-x-2">
                                <span>{new Date(entry.timestamp).toLocaleString()}</span>
                                <span>•</span>
                                <span className="capitalize">{entry.type}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => copyToClipboard(entry.value, 'history')}
                                className="p-1.5 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(entry.id);
                                  setNewAccountName(entry.account || '');
                                }}
                                className="p-1.5 rounded bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => deleteHistoryEntry(entry.id)}
                                className="p-1.5 rounded bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          {editingId === entry.id && (
                            <div className="mt-2 flex items-center space-x-2">
                              <Input
                                type="text"
                                value={newAccountName}
                                onChange={(e) => setNewAccountName(e.target.value)}
                                placeholder="New account name"
                                className="h-6 text-xs"
                              />
                              <Button
                                size="sm"
                                onClick={() => editAccountName(entry.id, newAccountName)}
                                className="h-6 text-xs px-2 py-0 bg-green-500 hover:bg-green-600 text-white"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => setEditingId(null)}
                                className="h-6 text-xs px-2 py-0 bg-gray-500 hover:bg-gray-600 text-white"
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

              {Object.keys(groupedHistory).length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-700">No History Yet</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Generated passwords will appear here
                  </p>
                </div>
              )}

              {Object.keys(groupedHistory).length > 0 &&
                Object.entries(groupedHistory)
                  .filter(([account]) =>
                    account.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 && (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <Search className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-700">No Results Found</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Try a different search term
                    </p>
                  </div>
                )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PasswordGenerator;