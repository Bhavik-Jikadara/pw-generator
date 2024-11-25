import React, { useState, useEffect } from 'react';
import { Lock, Clipboard, History, Save, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';

const PasswordGenerator = () => {
  const [settings, setSettings] = useState({
    length: 12,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    similar: false,
    ambiguous: false,
  });

  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [passwordHistory, setPasswordHistory] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [pattern, setPattern] = useState('');

  useEffect(() => {
    // Initialize settings from storage
    const loadSettings = async () => {
      const storage = await chrome.storage.local.get(['passwordSettings', 'passwordHistory']);
      if (storage.passwordSettings) {
        setSettings(storage.passwordSettings);
      }
      if (storage.passwordHistory) {
        setPasswordHistory(storage.passwordHistory);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = (newSettings) => {
    chrome.storage.local.set({ passwordSettings: newSettings });
    setSettings(newSettings);
  };

  const calculatePasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 12) strength += 25;
    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[a-z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 15;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 10;
    return strength;
  };

  const generatePassword = () => {
    const chars = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    // Remove similar characters if option is selected
    if (settings.similar) {
      chars.uppercase = chars.uppercase.replace(/[IO]/g, '');
      chars.lowercase = chars.lowercase.replace(/[l]/g, '');
      chars.numbers = chars.numbers.replace(/[01]/g, '');
    }

    // Remove ambiguous characters if option is selected
    if (settings.ambiguous) {
      chars.symbols = chars.symbols.replace(/[{}[\]()\/\\`~,;:.<>]/g, '');
    }

    let validChars = '';
    if (settings.uppercase) validChars += chars.uppercase;
    if (settings.lowercase) validChars += chars.lowercase;
    if (settings.numbers) validChars += chars.numbers;
    if (settings.symbols) validChars += chars.symbols;

    let generated = '';

    if (pattern) {
      // Generate password based on pattern
      generated = pattern.split('').map(char => {
        switch (char.toLowerCase()) {
          case 'a': return chars.uppercase.charAt(Math.floor(Math.random() * chars.uppercase.length));
          case 'l': return chars.lowercase.charAt(Math.floor(Math.random() * chars.lowercase.length));
          case 'n': return chars.numbers.charAt(Math.floor(Math.random() * chars.numbers.length));
          case 's': return chars.symbols.charAt(Math.floor(Math.random() * chars.symbols.length));
          default: return char;
        }
      }).join('');
    } else {
      // Ensure at least one character from each selected category
      if (settings.uppercase) generated += chars.uppercase.charAt(Math.floor(Math.random() * chars.uppercase.length));
      if (settings.lowercase) generated += chars.lowercase.charAt(Math.floor(Math.random() * chars.lowercase.length));
      if (settings.numbers) generated += chars.numbers.charAt(Math.floor(Math.random() * chars.numbers.length));
      if (settings.symbols) generated += chars.symbols.charAt(Math.floor(Math.random() * chars.symbols.length));

      // Fill remaining length
      while (generated.length < settings.length) {
        generated += validChars.charAt(Math.floor(Math.random() * validChars.length));
      }

      // Shuffle the password
      generated = generated.split('').sort(() => Math.random() - 0.5).join('');
    }

    // Apply separator (no spaces)
    const separator = settings.separator === 'hyphen' ? '-' : settings.separator === 'underscore' ? '_' : ' ';

    // Check if the pattern contains separators, and apply only between words
    const finalPassword = generated.split(' ').join(separator);

    setPassword(finalPassword);
    const strength = calculatePasswordStrength(finalPassword);
    setPasswordStrength(strength);

    // Save to history
    const newHistory = [...passwordHistory, {
      password: finalPassword,
      timestamp: new Date().toISOString(),
      strength: strength
    }].slice(-10);  // Keep last 10 passwords
    setPasswordHistory(newHistory);
    chrome.storage.local.set({ passwordHistory: newHistory });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const clearHistory = () => {
    setPasswordHistory([]);
    chrome.storage.local.remove('passwordHistory');
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Password Generator</h1>

      <Tabs defaultValue="generator" className="w-full mb-4">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-4">
          <div className="space-y-2 mb-4">
            <label className="block text-sm font-medium mb-1">Password Length: {settings.length}</label>
            <Slider
              value={[settings.length]}
              onValueChange={([value]) => saveSettings({ ...settings, length: value })}
              min={8}
              max={32}
              step={1}
              className="transition duration-300 ease-in-out"
            />
          </div>

          <div className="space-y-2 mb-4">
            {[
              { label: 'Include Uppercase (A-Z)', key: 'uppercase' },
              { label: 'Include Lowercase (a-z)', key: 'lowercase' },
              { label: 'Include Numbers (0-9)', key: 'numbers' },
              { label: 'Include Symbols (!@#$)', key: 'symbols' },
              { label: 'Exclude Similar Characters', key: 'similar' },
              { label: 'Exclude Ambiguous Symbols', key: 'ambiguous' },
            ].map(({ label, key }) => (
              <div className="flex items-center justify-between" key={key}>
                <label className="text-sm flex items-center mb-1">
                  <span className="mr-2">{label}</span>
                  <Lock className="w-4 h-4 text-gray-500" />
                </label>
                <Switch
                  checked={settings[key]}
                  onCheckedChange={(checked) => saveSettings({ ...settings, [key]: checked })}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-4">
            <label className="block text-sm font-medium">Custom Pattern (Optional)</label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Example: aaa-nnn-lll (a=uppercase, l=lowercase, n=number, s=symbol)"
              className="w-full p-2 border rounded"
            />
          </div>

          <Button
            onClick={generatePassword}
            className="w-full bg-blue-500 hover:bg-blue-600 mb-4"
          >
            Generate Password
          </Button>

          {password && (
            <div className="mt-4 p-4 bg-gray-100 rounded mb-4">
              <p className="font-mono text-center break-all text-lg">{password}</p>
              <div className="my-2">
                <Progress value={passwordStrength} className="h-2" />
                <p className="text-sm text-center mt-1">
                  Strength: {passwordStrength >= 90 ? 'Very Strong' :
                    passwordStrength >= 70 ? 'Strong' :
                      passwordStrength >= 40 ? 'Medium' : 'Weak'}
                </p>
              </div>
              <Button
                onClick={copyToClipboard}
                className="mt-2 w-full bg-green-500 hover:bg-green-600"
              >
                {copied ? (
                  <><Clipboard className="w-4 h-4 mr-2" /> Copied!</>
                ) : (
                  <><Clipboard className="w-4 h-4 mr-2" /> Copy to Clipboard</>
                )}
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {passwordHistory.length > 0 ? (
            <>
              <div className="space-y-2 mb-4">
                {passwordHistory.map((entry, index) => (
                  <div key={index} className="p-2 bg-gray-100 rounded flex justify-between items-center mb-2">
                    <span className="font-mono">{entry.password}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                      <Button
                        onClick={() => navigator.clipboard.writeText(entry.password)}
                        variant="ghost"
                        size="sm"
                      >
                        <Clipboard className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={clearHistory}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Clear History
              </Button>
            </>
          ) : (
            <Alert>
              <AlertDescription>
                No password history available yet.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PasswordGenerator;