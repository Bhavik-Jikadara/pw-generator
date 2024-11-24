// src/components/PasswordGenerator.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { FaLock, FaClipboard } from 'react-icons/fa';

const PGenerator = () => {
  const [settings, setSettings] = useState({
    length: 12,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load saved settings from chrome.storage
    chrome.storage.local.get('passwordSettings', (result) => {
      if (result.passwordSettings) {
        setSettings(result.passwordSettings);
      }
    });
  }, []);

  const saveSettings = (newSettings) => {
    chrome.storage.local.set({ passwordSettings: newSettings });
    setSettings(newSettings);
  };

  const generatePassword = () => {
    const chars = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    let validChars = '';
    if (settings.uppercase) validChars += chars.uppercase;
    if (settings.lowercase) validChars += chars.lowercase;
    if (settings.numbers) validChars += chars.numbers;
    if (settings.symbols) validChars += chars.symbols;

    // Ensure at least one character from each selected category is included
    let generated = '';
    if (settings.uppercase) generated += chars.uppercase.charAt(Math.floor(Math.random() * chars.uppercase.length));
    if (settings.lowercase) generated += chars.lowercase.charAt(Math.floor(Math.random() * chars.lowercase.length));
    if (settings.numbers) generated += chars.numbers.charAt(Math.floor(Math.random() * chars.numbers.length));
    if (settings.symbols) generated += chars.symbols.charAt(Math.floor(Math.random() * chars.symbols.length));

    // Fill the rest of the password length with random characters from the valid set
    for (let i = generated.length; i < settings.length; i++) {
      generated += validChars.charAt(Math.floor(Math.random() * validChars.length));
    }

    // Shuffle the generated password to ensure randomness
    setPassword(generated.split('').sort(() => Math.random() - 0.5).join(''));
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

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-center">Password Generator</h1>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Password Length: {settings.length}</label>
        <Slider
          value={[settings.length]}
          onValueChange={([value]) => saveSettings({ ...settings, length: value })}
          min={8}
          max={32}
          step={1}
          className="transition duration-300 ease-in-out"
        />
      </div>

      <div className="space-y-2">
        {[
          { label: 'Include Uppercase', key: 'uppercase' },
          { label: 'Include Lowercase', key: 'lowercase' },
          { label: 'Include Numbers', key: 'numbers' },
          { label: 'Include Symbols', key: 'symbols' },
        ].map(({ label, key }) => (
          <div className="flex items-center justify-between" key={key}>
            <label className="text-sm flex items-center">
              <span className="mr-2">{label}</span>
              <FaLock className="text-gray-500" />
            </label>
            <Switch
              checked={settings[key]}
              onCheckedChange={(checked) => saveSettings({ ...settings, [key]: checked })}
              className="transition duration-300 ease-in-out"
            />
          </div>
        ))}
      </div>

      <Button
        onClick={generatePassword}
        className="w-full bg-blue-500 hover:bg-blue-600 transition duration-300 ease-in-out"
      >
        Generate Password
      </Button>

      {password && (
        <div className="mt-4 p-4 bg-gray-100 rounded relative transition duration-300 ease-in-out">
          <p className="font-mono text-center break-all text-lg">{password}</p>
          <Button
            onClick={copyToClipboard}
            className="mt-2 w-full bg-green-500 hover:bg-green-600 transition duration-300 ease-in-out"
          >
            {copied ? <><FaClipboard className="inline mr-1" /> Copied!</> : <><FaClipboard className="inline mr-1" /> Copy to Clipboard</>}
          </Button>
        </div>
      )}
    </div>
  );
};

export default PGenerator;