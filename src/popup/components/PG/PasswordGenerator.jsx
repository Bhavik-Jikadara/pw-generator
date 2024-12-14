import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Copy, CheckCircle2, Settings2, Star, Shield
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Card, CardContent, CardFooter
} from '../ui/card';
import { toast } from '../ui/use-toast';
import CryptoJS from 'crypto-js';

const PasswordGenerator = ({ user, onSave }) => {
  const [generatedValue, setGeneratedValue] = useState('');
  const [accountName, setAccountName] = useState('');
  const [mode, setMode] = useState('password'); // Replacing radio buttons with dropdown
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [words, setWords] = useState([]);
  const [passwordSettings, setPasswordSettings] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSpecialChars: false,
  });

  useEffect(() => {
    fetch('/words.txt')
      .then(res => res.text())
      .then(text => setWords(text.split('\n').map(word => word.trim())))
      .catch(err => console.error('Error loading words:', err));
  }, []);

  const generatePassword = () => {
    if (mode === 'password') {
      const chars = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      };

      let allowedChars = '';
      if (passwordSettings.includeUppercase) allowedChars += chars.uppercase;
      if (passwordSettings.includeLowercase) allowedChars += chars.lowercase;
      if (passwordSettings.includeNumbers) allowedChars += chars.numbers;
      if (passwordSettings.includeSpecialChars) allowedChars += chars.special;

      let password = '';
      for (let i = 0; i < passwordSettings.length; i++) {
        password += allowedChars[Math.floor(Math.random() * allowedChars.length)];
      }

      setGeneratedValue(password);
    } else if (mode === 'word' && words.length > 0) {
      const randomIndex = Math.floor(Math.random() * words.length);
      setGeneratedValue(words[randomIndex]);
    } else {
      toast({
        title: "Error",
        description: "No words available for generation.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!generatedValue || !accountName.trim()) {
      toast({
        title: "Error",
        description: "Please generate a value and enter an account name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const encryptionKey = `${user.uid}-${process.env.REACT_APP_ENCRYPTION_KEY || 'fallback-key'}`;
      const encryptedValue = CryptoJS.AES.encrypt(generatedValue, encryptionKey).toString();
      const newPassword = {
        value: encryptedValue,
        accountName: accountName.trim(),
        type: mode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSave(newPassword);
      setAccountName('');
      setGeneratedValue('');
      toast({
        title: "Success",
        description: "Password saved successfully.",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full p-4">
      <CardContent className="space-y-6">
        <div>
          <Label className="text-lg font-medium">Generation Mode</Label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full p-2 border rounded-lg text-gray-700"
          >
            <option value="password">Password</option>
            <option value="word">Word</option>
          </select>
        </div>

        <div>
          <Label className="text-lg font-medium">Generated {mode}</Label>
          <div className="relative">
            <Input
              type="text"
              value={generatedValue}
              readOnly
              className="w-full pr-10 font-mono bg-gray-50"
              placeholder={`Generated ${mode} will appear here`}
            />
            {generatedValue && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => {
                  navigator.clipboard.writeText(generatedValue);
                  toast({ description: "Copied to clipboard!" });
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        <div>
          <Label className="text-lg font-medium">Account Name</Label>
          <Input
            placeholder="e.g., Gmail, Twitter"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            className="w-full"
          />
        </div>
      </CardContent>

      <CardFooter className="flex justify-between mt-6">
        <Button
          className="w-1/2"
          onClick={generatePassword}
          disabled={loading || (mode === 'word' && words.length === 0)}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Generate
        </Button>
        <Button
          className="w-1/2"
          onClick={handleSave}
          disabled={loading || !generatedValue || !accountName}
          variant="secondary"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Save
        </Button>
      </CardFooter>
    </Card>
  );
};

export { PasswordGenerator };
