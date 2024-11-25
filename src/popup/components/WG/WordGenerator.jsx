import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Select, SelectItem } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Copy, RefreshCw, Check, Trash2 } from 'lucide-react';

const WordGenerator = () => {
  const [wordCount, setWordCount] = useState(3);
  const [words, setWords] = useState('');
  const [copied, setCopied] = useState(false);
  const [wordList, setWordList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    capitalize: false,
    separator: 'space',
    minLength: 3,
    maxLength: 12,
  });
  const [history, setHistory] = useState([]);

  // Fetch the word list on initial load
  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/words.txt');
      if (!response.ok) throw new Error('Network response was not ok');
      const text = await response.text();
      const wordsArray = text
        .split('\n')
        .filter((word) => word.length >= settings.minLength && word.length <= settings.maxLength);
      setWordList(wordsArray);
    } catch (error) {
      setError('Failed to load word list. Please try again.');
      console.error('Error fetching words:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatWord = (word) => {
    if (!word) return '';
    return settings.capitalize
      ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      : word.toLowerCase();
  };

  const getSeparator = () => {
    switch (settings.separator) {
      case 'hyphen':
        return '-';
      case 'underscore':
        return '_';
      case 'dot':
        return '.';
      default:
        return ' ';
    }
  };

  const generateWords = () => {
    if (!wordList.length) {
      setError('Word list is empty. Please reload the page.');
      return;
    }

    // Generate words and apply separator
    const generated = Array.from({ length: wordCount }, () => {
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      return formatWord(randomWord);
    });

    const separator = getSeparator();
    const generatedString = generated.join(separator);

    setWords(generatedString);
    setHistory((prev) => [generatedString, ...prev].slice(0, 10));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(words);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
      console.error('Failed to copy:', err);
    }
  };

  const clearHistory = () => setHistory([]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Word Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="generator">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Words: {wordCount}</label>
                <Slider
                  value={[wordCount]}
                  onValueChange={([value]) => setWordCount(value)}
                  min={1}
                  max={10}
                  step={1}
                  className="w-64"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Capitalize Words</label>
                <Switch
                  checked={settings.capitalize}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, capitalize: checked }))
                  }
                />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Separator</label>
                  <Select
                    value={settings.separator} // Bind state
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, separator: value })) // Update state dynamically
                    }
                  >
                    <SelectItem value="space">Space</SelectItem>
                    <SelectItem value="hyphen">Hyphen</SelectItem>
                    <SelectItem value="underscore">Underscore</SelectItem>
                    <SelectItem value="dot">Dot</SelectItem>
                  </Select>
                </div>
                <Button
                  onClick={generateWords}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                  disabled={loading}
                >
                  {loading ? <RefreshCw className="animate-spin" /> : 'Generate Words'}
                </Button>
              </div>

              {words && (
                <div className="space-y-4 mt-4">
                  <div className="p-4 bg-secondary rounded-md">
                    <p className="text-center break-all text-lg font-mono">{words}</p>
                  </div>

                  <Button onClick={copyToClipboard} variant="outline" className="w-full">
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy to Clipboard
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history">
            {history.length > 0 ? (
              <div className="space-y-2">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="p-2 bg-secondary/50 rounded text-sm font-mono cursor-pointer hover:bg-secondary"
                    onClick={() => navigator.clipboard.writeText(item)}
                  >
                    {item}
                  </div>
                ))}
                <Button onClick={clearHistory} variant="destructive" className="w-full mt-4">
                  <Trash2 className="mr-2 h-4 w-4" /> Clear History
                </Button>
              </div>
            ) : (
              <Alert>
                <AlertDescription>No history available yet.</AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WordGenerator;