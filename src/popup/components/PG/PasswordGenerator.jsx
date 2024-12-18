import React, { useState, useCallback, useEffect } from 'react';
import { useToast } from '../ui/use-toast';
import {
  RefreshCw, Copy, CheckCircle2, Shield, Type, Check, Info, AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Card, CardContent } from '../ui/card';
import { firebaseService } from '../../../services/firebaseService';

const StyledLabel = ({ children, tooltip, className = "" }) => (
  <div className="flex items-center gap-2 mb-1.5">
    <Label className={`text-sm font-semibold text-foreground ${className}`}>
      {children}
    </Label>
    {tooltip && (
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    )}
  </div>
);

const ToggleOption = ({ label, checked, onChange, tooltip }) => (
  <div className="flex items-center justify-between py-1">
    <StyledLabel tooltip={tooltip} className="text-sm">
      {label}
    </StyledLabel>
    <Switch
      checked={checked}
      onCheckedChange={onChange}
      className="ml-3 data-[state=checked]:bg-primary"
    />
  </div>
);

const StrengthIndicator = ({ password }) => {
  const calculateStrength = (pwd) => {
    if (!pwd) return 0;
    let strength = 0;

    if (pwd.length >= 12) strength += 25;
    else if (pwd.length >= 8) strength += 15;

    if (/[A-Z]/.test(pwd)) strength += 25;
    if (/[a-z]/.test(pwd)) strength += 25;
    if (/[0-9]/.test(pwd)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 25;

    return Math.min(100, strength);
  };

  const strength = calculateStrength(password);
  let strengthText = '';
  let strengthColor = '';

  if (strength >= 80) {
    strengthText = 'Strong';
    strengthColor = 'bg-green-500';
  } else if (strength >= 50) {
    strengthText = 'Medium';
    strengthColor = 'bg-yellow-500';
  } else {
    strengthText = 'Weak';
    strengthColor = 'bg-red-500';
  }

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">Strength:</span>
        <span className={strengthColor.replace('bg-', 'text-')}>{strengthText}</span>
      </div>
      <Progress value={strength} className={`h-1.5 ${strengthColor}`} />
    </div>
  );
};

export const PasswordGenerator = ({ user }) => {
  const { toast } = useToast();
  const [mode, setMode] = useState('password');
  const [generatedValue, setGeneratedValue] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [expiryDays, setExpiryDays] = useState(90);

  // Add word-specific state at the top level
  const [words, setWords] = useState([]);
  const [wordCount, setWordCount] = useState(1);
  const [separator, setSeparator] = useState('-');

  // Load words on component mount
  useEffect(() => {
    fetch('/words.txt')
      .then(response => response.text())
      .then(text => {
        setWords(text.split('\n').filter(word => word.trim()));
      })
      .catch(error => console.error('Error loading words:', error));
  }, []);

  const [passwordSettings, setPasswordSettings] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: false,
    includeSpecialChars: false
  });

  // Password generation function
  const generatePassword = useCallback(() => {
    const chars = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      special: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    let allowedChars = '';
    let mandatoryChars = '';

    if (passwordSettings.includeUppercase) {
      allowedChars += chars.uppercase;
      mandatoryChars += chars.uppercase[Math.floor(Math.random() * 26)];
    }
    if (passwordSettings.includeLowercase) {
      allowedChars += chars.lowercase;
      mandatoryChars += chars.lowercase[Math.floor(Math.random() * 26)];
    }
    if (passwordSettings.includeNumbers) {
      allowedChars += chars.numbers;
      mandatoryChars += chars.numbers[Math.floor(Math.random() * 10)];
    }
    if (passwordSettings.includeSpecialChars) {
      allowedChars += chars.special;
      mandatoryChars += chars.special[Math.floor(Math.random() * chars.special.length)];
    }

    let password = mandatoryChars;
    for (let i = mandatoryChars.length; i < passwordSettings.length; i++) {
      password += allowedChars[Math.floor(Math.random() * allowedChars.length)];
    }

    password = password.split('')
      .sort(() => Math.random() - 0.5)
      .join('');

    setGeneratedValue(password);
    setHasCopied(false);
  }, [passwordSettings]);

  // Word generation function
  const generateWord = useCallback(() => {
    if (words.length === 0) return;

    const selectedWords = Array(wordCount)
      .fill(0)
      .map(() => words[Math.floor(Math.random() * words.length)])
      .join(separator);

    setGeneratedValue(selectedWords);
    setHasCopied(false);
  }, [words, wordCount, separator]);

  // Unified generation function
  const handleGeneration = useCallback(() => {
    if (mode === 'password') {
      generatePassword();
    } else {
      generateWord();
    }
  }, [mode, generatePassword, generateWord]);

  // Update WordGenerator to be settings-only component
  const WordGenerator = () => (
    <div className="space-y-2">
      <div>
        <StyledLabel tooltip="Number of words to combine">
          Word Count: <span className="font-mono">{wordCount}</span>
        </StyledLabel>
        <Slider
          value={[wordCount]}
          onValueChange={([value]) => setWordCount(value)}
          max={6}
          min={2}
          step={1}
          className="mt-2"
        />
      </div>

      <div className="flex justify-around space-y-1.5">
        <StyledLabel tooltip="Character to separate words">
          Separator
        </StyledLabel>
        <div className="flex gap-2 mt-2">
          {['-', '_', '.', '#'].map((sep) => (
            <Button
              key={sep}
              variant={separator === sep ? "default" : "outline"}
              size="sm"
              onClick={() => setSeparator(sep)}
              className={`h-6 px-2 text-xs ${
                separator === sep 
                  ? 'bg-black text-white hover:bg-black/90' 
                  : 'hover:bg-muted'
              }`}
            >
              {sep}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );


  const handleCopy = async () => {
    if (!generatedValue) return;

    try {
      setCopying(true);
      await navigator.clipboard.writeText(generatedValue);
      setHasCopied(true);
      toast({
        description: "Copied to clipboard. You can now save the value."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  };

  const handleSave = async () => {
    if (!generatedValue || !accountName.trim()) {
      toast({
        title: "Error",
        description: "Please generate a value and enter an account name.",
        variant: "destructive"
      });
      return;
    }

    if (!hasCopied) {
      toast({
        title: "Error",
        description: "Please copy the value before saving",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const passwordData = {
        value: generatedValue,
        accountName: accountName.trim(),
        type: mode,
        expiresAt: new Date(Date.now() + (expiryDays * 24 * 60 * 60 * 1000)).toISOString()
      };

      await firebaseService.addPassword(user.uid, passwordData);

      setAccountName('');
      setGeneratedValue('');
      setHasCopied(false);

      toast({
        description: "Successfully saved"
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: "Failed to save",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Modified mode change handler
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setGeneratedValue(''); // Clear generated value when mode changes
    setHasCopied(false);   // Reset copy state
    setAccountName('');    // Optionally clear account name too
  };

  return (
    <div className="space-y-2">
      <Card>
        <CardContent className="p-2">
          {/* Mode Toggle with updated handlers */}
          <div className="flex items-center justify-between mb-2">
            <StyledLabel className="text-xs">Generation Mode</StyledLabel>
            <div className="flex items-center gap-1 p-0.5 bg-muted rounded-md">
              <Button
                variant={mode === 'password' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('password')}
                className={`h-6 text-xs px-2 ${
                  mode === 'password' 
                    ? 'bg-black text-white hover:bg-black/90' 
                    : 'hover:bg-muted-foreground/10'
                }`}
              >
                <Shield className="w-3 h-3 mr-1" />
                Password
              </Button>
              <Button
                variant={mode === 'word' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleModeChange('word')}
                className={`h-6 text-xs px-2 ${
                  mode === 'word' 
                    ? 'bg-black text-white hover:bg-black/90' 
                    : 'hover:bg-muted-foreground/10'
                }`}
              >
                <Type className="w-3 h-3 mr-1" />
                Word
              </Button>
            </div>
          </div>

          {/* Settings Section */}
          {mode === 'word' ? (
            <div className="space-y-2">
              <div>
                <StyledLabel tooltip="Number of words to combine">
                  Word Count: <span className="font-mono">{wordCount}</span>
                </StyledLabel>
                <Slider
                  value={[wordCount]}
                  onValueChange={([value]) => setWordCount(value)}
                  max={6}
                  min={2}
                  step={1}
                  className="mt-1.5"
                />
              </div>

              <div className="flex justify-around space-y-1.5">
                <StyledLabel tooltip="Character to separate words">
                  Separator
                </StyledLabel>
                <div className="flex gap-2 mt-2">
                  {['-', '_', '.', '#'].map((sep) => (
                    <Button
                      key={sep}
                      variant={separator === sep ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSeparator(sep)}
                      className={`h-6 px-2 text-xs ${
                        separator === sep 
                          ? 'bg-black text-white hover:bg-black/90' 
                          : 'hover:bg-muted'
                      }`}
                    >
                      {sep}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <StyledLabel tooltip="Password length">Length</StyledLabel>
                <div className="flex items-center gap-2">
                  <Slider
                    value={[passwordSettings.length]}
                    onValueChange={([value]) =>
                      setPasswordSettings(prev => ({ ...prev, length: value }))}
                    max={32}
                    min={8}
                    step={1}
                    className="mt-1.5"
                  />
                  <span className="text-xs font-mono w-6 text-center">
                    {passwordSettings.length}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-1.5">
                <ToggleOption
                  label="Uppercase (A-Z)"
                  checked={passwordSettings.includeUppercase}
                  onChange={(checked) =>
                    setPasswordSettings(prev => ({ ...prev, includeUppercase: checked }))}
                  tooltip="Include uppercase letters"
                />
                <ToggleOption
                  label="Lowercase (a-z)"
                  checked={passwordSettings.includeLowercase}
                  onChange={(checked) =>
                    setPasswordSettings(prev => ({ ...prev, includeLowercase: checked }))}
                  tooltip="Include lowercase letters"
                />
                <ToggleOption
                  label="Numbers (0-9)"
                  checked={passwordSettings.includeNumbers}
                  onChange={(checked) =>
                    setPasswordSettings(prev => ({ ...prev, includeNumbers: checked }))}
                  tooltip="Include numbers"
                />
                <ToggleOption
                  label="Special (!@#$...)"
                  checked={passwordSettings.includeSpecialChars}
                  onChange={(checked) =>
                    setPasswordSettings(prev => ({ ...prev, includeSpecialChars: checked }))}
                  tooltip="Include special characters"
                />
              </div>
            </div>
          )}

          {/* Generated Value Section */}
          <div className="space-y-1.5 mt-2">
            <div>
              <StyledLabel>Generated {mode === 'password' ? 'Password' : 'Word'}</StyledLabel>
              <div className="relative mt-1.5">
                <Input
                  type="text"
                  value={generatedValue}
                  readOnly
                  className="font-mono text-sm bg-muted/50 h-9"
                  placeholder={`${mode === 'word' ? 'Combined words' : 'Password'} will appear here`}
                />
                {generatedValue && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      disabled={copying}
                      className="h-7 px-2"
                    >
                      {copying ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGeneration}
                      className="h-7 px-2"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>

              {mode === 'password' && generatedValue && (
                <div className="mt-1.5">
                  <StrengthIndicator password={generatedValue} />
                </div>
              )}
            </div>

            {/* Account Details */}
            <div className="space-y-1.5">
              <div>
                <StyledLabel>Account Name</StyledLabel>
                <Input
                  placeholder="e.g., Gmail, Twitter, Netflix"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="mt-1.5 h-9"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-background pt-2 grid grid-cols-2 gap-2">
            <Button
              onClick={handleGeneration}
              disabled={loading || (mode === 'word' && words.length === 0)}
              className="h-9 text-sm"
            >
              Generate {mode === 'password' ? 'Password' : 'Word'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleSave}
              disabled={loading || !generatedValue || !accountName || !hasCopied}
              className="h-9 text-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordGenerator;