import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Copy, RefreshCw, Trash2, Pencil, Search, Key, Shield, Clock, X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';

const PasswordGenerator = () => {
  const [generatedValue, setGeneratedValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState('password');
  const [activeTab, setActiveTab] = useState('settings');
  const [words, setWords] = useState([]);
  const [history, setHistory] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [accountName, setAccountName] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupedHistory, setGroupedHistory] = useState({});

  // Password settings with defaults
  const [passwordSettings, setPasswordSettings] = useState(() => {
    const savedSettings = localStorage.getItem('passwordSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      special: true,
      avoidAmbiguous: true
    };
  });

  const [passphraseSettings, setPassphraseSettings] = useState(() => {
    const savedSettings = localStorage.getItem('passphraseSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      numberOfWords: 4,
      separator: '-',
      capitalize: true,
      includeNumber: true
    };
  });

  // Load initial state
  useEffect(() => {
    // Check if first time
    const hasVisited = localStorage.getItem('hasVisited');
    if (hasVisited) {
      setShowWelcome(false);
    } else {
      localStorage.setItem('hasVisited', 'true');
    }

    const savedMode = localStorage.getItem('generatorMode');
    if (savedMode) setMode(savedMode);

    // Load history
    chrome.storage.local.get(['passwordHistory'], result => {
      if (result.passwordHistory) {
        setHistory(result.passwordHistory);
        updateGroupedHistory(result.passwordHistory);
      }
    });

    // Load word list
    const fetchWords = async () => {
      try {
        const response = await fetch('/words.txt');
        const text = await response.text();
        const wordList = text.split('\n').map(word => word.trim()).filter(word => word);
        setWords(wordList);
        localStorage.setItem('wordList', JSON.stringify(wordList));
      } catch (error) {
        const cachedWords = localStorage.getItem('wordList');
        if (cachedWords) {
          setWords(JSON.parse(cachedWords));
        } else {
          console.error('Error fetching words:', error);
          setWords(['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew', 'kiwi', 'lemon']);
        }
      }
    };

    fetchWords();
  }, []);

  // Group history by account name
  const updateGroupedHistory = (historyData) => {
    const grouped = historyData.reduce((acc, entry) => {
      const accountKey = entry.account || 'Unnamed Accounts';
      if (!acc[accountKey]) {
        acc[accountKey] = [];
      }
      acc[accountKey].push(entry);
      return acc;
    }, {});
    setGroupedHistory(grouped);
  };

  // Save settings whenever they change
  useEffect(() => {
    localStorage.setItem('passwordSettings', JSON.stringify(passwordSettings));
  }, [passwordSettings]);

  useEffect(() => {
    localStorage.setItem('passphraseSettings', JSON.stringify(passphraseSettings));
  }, [passphraseSettings]);

  useEffect(() => {
    localStorage.setItem('generatorMode', mode);
  }, [mode]);


  // Modified copyToClipboard to only handle copying
  const copyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Add to history when copying
      const historyEntry = {
        id: Date.now(),
        value: text,
        timestamp: new Date().toLocaleString(),
        type: mode,
        account: accountName.trim()
      };

      const newHistory = [historyEntry, ...history.slice(0, 19)];
      setHistory(newHistory);
      saveHistory(newHistory);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [mode, accountName, history]);

  // Add deleteHistoryEntry function
  const deleteHistoryEntry = useCallback((id) => {
    const updatedHistory = history.filter(entry => entry.id !== id);
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
  }, [history]);

  // Add missing clearHistory function
  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
    setGroupedHistory({});
  }, []);

  // Add missing editAccountName function
  const editAccountName = useCallback((id, newName) => {
    const updatedHistory = history.map(entry =>
      entry.id === id ? { ...entry, account: newName.trim() } : entry
    );
    setHistory(updatedHistory);
    saveHistory(updatedHistory);
    setEditingId(null);
  }, [history]);

  const saveHistory = (newHistory) => {
    chrome.storage.local.set({ passwordHistory: newHistory }, () => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        console.error('Error saving to chrome.storage:', lastError);
        localStorage.setItem('passwordHistory', JSON.stringify(newHistory));
      }
    });
    localStorage.setItem('passwordHistory', JSON.stringify(newHistory));
    updateGroupedHistory(newHistory);
  };

  // Validate password settings
  useEffect(() => {
    const hasAnyOption = Object.values(passwordSettings).some(value =>
      typeof value === 'boolean' && value === true
    );

    if (!hasAnyOption) {
      // If no options selected, default to lowercase
      setPasswordSettings(prev => ({
        ...prev,
        lowercase: true
      }));
    }
  }, [passwordSettings]);

  // Modified generatePassword with input validation
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

    if (!allowedChars) {
      return ''; // Return empty if no character types selected
    }

    const ambiguousChars = new Set(['l', 'I', '1', 'O', '0', 'u', 'v', 'w', 'm', 'n']);

    if (passwordSettings.avoidAmbiguous) {
      allowedChars = allowedChars.split('').filter(char => !ambiguousChars.has(char.toLowerCase())).join('');
    }

    // Ensure we have enough unique characters for the password length
    if (allowedChars.length < passwordSettings.length) {
      return ''; // Return empty if not enough unique characters
    }

    let password = '';
    const length = Math.max(8, Math.min(passwordSettings.length, 32));

    // Ensure at least one character from each selected type
    const types = [];
    if (passwordSettings.uppercase) types.push('uppercase');
    if (passwordSettings.lowercase) types.push('lowercase');
    if (passwordSettings.numbers) types.push('numbers');
    if (passwordSettings.special) types.push('special');

    types.forEach(type => {
      const typeChars = chars[type];
      const randomChar = typeChars[Math.floor(Math.random() * typeChars.length)];
      password += randomChar;
    });

    // Fill the rest randomly
    while (password.length < length) {
      const randomIndex = Math.floor(Math.random() * allowedChars.length);
      password += allowedChars[randomIndex];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }, [passwordSettings]);

  // Modified generatePassphrase with input validation
  const generatePassphrase = useCallback(() => {
    if (!words.length) {
      console.error('Word list is empty');
      return '';
    }

    const numberOfWords = Math.max(2, Math.min(passphraseSettings.numberOfWords, 8));
    const usedIndices = new Set();
    const phrase = [];

    try {
      while (phrase.length < numberOfWords && usedIndices.size < words.length) {
        const randomIndex = Math.floor(Math.random() * words.length);

        if (!usedIndices.has(randomIndex)) {
          usedIndices.add(randomIndex);
          let word = words[randomIndex];

          if (passphraseSettings.capitalize) {
            word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          }

          phrase.push(word);
        }
      }

      if (passphraseSettings.includeNumber) {
        phrase.push(Math.floor(Math.random() * 100).toString().padStart(2, '0'));
      }

      return phrase.join(passphraseSettings.separator || '-');
    } catch (error) {
      console.error('Error generating passphrase:', error);
      return '';
    }
  }, [words, passphraseSettings]);

  // Modified handleGenerate to not save to history
  const handleGenerate = useCallback(() => {
    try {
      const newValue = mode === 'password' ? generatePassword() : generatePassphrase();

      if (!newValue) {
        console.error('Failed to generate value');
        return;
      }

      setGeneratedValue(newValue);
      // Removed history saving from here
    } catch (error) {
      console.error('Error in handleGenerate:', error);
    }
  }, [mode, generatePassword, generatePassphrase]);

  const WelcomePopup = () => (
    <AnimatePresence>
      {showWelcome && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <Card className="w-[400px] p-6 space-y-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold text-blue-600">
                Welcome to Password Generator
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWelcome(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Secure by Default</h3>
                  <p className="text-sm text-gray-600">Pre-configured with secure settings</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Key className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Password & Passphrase</h3>
                  <p className="text-sm text-gray-600">Choose your preferred generation method</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">History Tracking</h3>
                  <p className="text-sm text-gray-600">Save and organize passwords by account</p>
                </div>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4"
                onClick={() => setShowWelcome(false)}
              >
                Get Started
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <WelcomePopup />
      <Card className="w-[600px] h-[650px] mx-auto my-2">
        <CardHeader className="py-3">
          <CardTitle className="text-xl font-bold text-blue-600">
            {mode === 'password' ? 'Password Generator' : 'Passphrase Generator'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="relative">
            <div className="p-3 h-12 bg-blue-600 text-white rounded flex items-center justify-between">
              <span className="text-base font-mono flex-1 text-center">
                {generatedValue || 'Your password will appear here'}
              </span>
              {generatedValue && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-2 p-1 hover:bg-blue-700 rounded"
                  onClick={() => copyToClipboard(generatedValue)}  // Only copy, no history update
                >
                  <Copy className="h-4 w-4" />
                </motion.button>
              )}
            </div>
            {copied && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-green-500 text-white text-sm py-1 px-3 rounded"
              >
                Copied!
              </motion.div>
            )}
          </div>

          <div className="flex items-center space-x-6 justify-center bg-white p-3">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="password"
                name="mode"
                value="password"
                checked={mode === 'password'}
                onChange={() => {
                  setMode('password');
                  setActiveTab('settings');
                }}
                className="w-4 h-4"
              />
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="passphrase"
                name="mode"
                value="passphrase"
                checked={mode === 'passphrase'}
                onChange={() => {
                  setMode('passphrase');
                  setActiveTab('settings');
                }}
                className="w-4 h-4"
              />
              <Label htmlFor="passphrase" className="text-sm font-medium">Passphrase</Label>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-3">
              <TabsTrigger value="settings" className="text-sm py-2">Settings</TabsTrigger>
              <TabsTrigger value="history" className="text-sm py-2">History</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="space-y-3 p-3">
              {mode === 'password' ? (
                <div className="space-y-3">
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Length</Label>
                      <Input
                        type="number"
                        value={passwordSettings.length}
                        onChange={(e) => {
                          const length = Math.max(8, Math.min(parseInt(e.target.value) || 0, 32));
                          setPasswordSettings((prev) => ({ ...prev, length }));
                        }}
                        className="w-24 h-8 text-sm"
                      />
                    </div>

                    <div className="space-y-3">
                      {Object.entries({
                        uppercase: 'Uppercase (A-Z)',
                        lowercase: 'Lowercase (a-z)',
                        numbers: 'Numbers (0-9)',
                        special: 'Special Characters (!@#$%^&*)',
                        avoidAmbiguous: 'Avoid Ambiguous Characters'
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <Label className="text-sm font-medium">{label}</Label>
                          <Switch
                            checked={passwordSettings[key]}
                            onCheckedChange={(checked) => setPasswordSettings(prev => ({
                              ...prev,
                              [key]: checked
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <Label className="text-sm font-medium">Number of Words</Label>
                    <Input
                      type="number"
                      value={passphraseSettings.numberOfWords}
                      onChange={(e) => setPassphraseSettings(prev => ({
                        ...prev,
                        numberOfWords: Math.max(2, Math.min(parseInt(e.target.value) || 0, 8))
                      }))}
                      className="w-24 h-8 text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <Label className="text-sm font-medium">Word Separator</Label>
                    <Input
                      value={passphraseSettings.separator}
                      onChange={(e) => setPassphraseSettings(prev => ({
                        ...prev,
                        separator: e.target.value
                      }))}
                      className="w-24 h-8 text-sm"
                    />
                  </div>

                  {Object.entries({
                    capitalize: 'Capitalize Words',
                    includeNumber: 'Include Number'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                      <Label className="text-sm font-medium">{label}</Label>
                      <Switch
                        checked={passphraseSettings[key]}
                        onCheckedChange={(checked) => setPassphraseSettings(prev => ({
                          ...prev,
                          [key]: checked
                        }))}
                      />
                    </div>
                  ))}
                </div>
              )}

// Replace the existing generate button section with this:
              <div className="flex items-center space-x-3 mt-3">
                <Input
                  type="text"
                  placeholder="Account Name"
                  value={accountName}
                  onChange={e => setAccountName(e.target.value)}
                  className="flex-1 h-8 text-sm max-w-[200px]"
                />

                <div className="flex space-x-2"> {/* Added container for buttons */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm h-8 rounded"
                    onClick={handleGenerate}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate
                  </motion.button>

                  {generatedValue && ( // Only show copy button if there's a generated value
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center px-4 bg-green-600 hover:bg-green-700 text-white text-sm h-8 rounded"
                      onClick={() => copyToClipboard(generatedValue)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </motion.button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="p-3">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search accounts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9 text-sm"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={clearHistory}
                    className="h-9 text-sm ml-2"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear History
                  </Button>
                </div>

                <ScrollArea className="h-[350px]">
                  {Object.entries(groupedHistory)
                    .filter(([account]) =>
                      account.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(([account, entries]) => (
                      <div key={account} className="mb-4">
                        <div className="bg-gray-100 p-2 rounded-t flex items-center">
                          <Key className="h-4 w-4 mr-2 text-blue-600" />
                          <h3 className="text-sm font-medium text-gray-700">{account}</h3>
                          <span className="ml-2 text-xs text-gray-500">
                            ({entries.length} {entries.length === 1 ? 'entry' : 'entries'})
                          </span>
                        </div>
                        <div className="space-y-2">
                          {entries.map((entry) => (
                            <motion.div
                              key={entry.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-white p-3 border rounded-b shadow-sm"
                            >
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <div className="font-mono text-sm break-all">
                                    {entry.value}
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500 space-x-2">
                                    <span>{entry.timestamp}</span>
                                    <span>•</span>
                                    <span className="capitalize">{entry.type}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => copyToClipboard(entry.value)}
                                    className="p-1.5 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      setEditingId(entry.id);
                                      setNewAccountName(entry.account || '');
                                    }}
                                    className="p-1.5 rounded bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => deleteHistoryEntry(entry.id)}
                                    className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </motion.button>
                                </div>

                              </div>

                              {editingId === entry.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 flex items-center space-x-2"
                                >
                                  <Input
                                    type="text"
                                    value={newAccountName}
                                    onChange={(e) => setNewAccountName(e.target.value)}
                                    placeholder="New account name"
                                    className="h-8 text-sm"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => editAccountName(entry.id, newAccountName)}
                                    className="h-8 bg-green-500 hover:bg-green-600 text-white"
                                  >
                                    Save
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => setEditingId(null)}
                                    className="h-8 bg-gray-500 hover:bg-gray-600 text-white"
                                  >
                                    Cancel
                                  </Button>
                                </motion.div>
                              )}
                            </motion.div>
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
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Toast notification for copied text */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg"
          >
            Password copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PasswordGenerator;