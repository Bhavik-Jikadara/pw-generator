// src/components/WordGenerator.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { FaClipboard } from 'react-icons/fa';

const WGenerator = () => {
  const [wordCount, setWordCount] = useState(3);
  const [words, setWords] = useState('');
  const [copied, setCopied] = useState(false);
  const [wordList, setWordList] = useState([]);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await fetch('/words.txt'); // Fetch the .txt file from the public directory
        const text = await response.text(); // Read the text content
        const wordsArray = text.split('\n'); // Split the text into an array of words
        setWordList(wordsArray); // Set the word list state
      } catch (error) {
        console.error('Error fetching words:', error);
      }
    };

    fetchWords();
  }, []);

  const generateWords = () => {
    const generated = [];
    for (let i = 0; i < wordCount; i++) {
      const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
      generated.push(randomWord);
    }
    setWords(generated.join(' '));
  };

  const copyToClipboard = async () => {
    try {
      const formattedWords = words.replace(/ /g, '-');
      await navigator.clipboard.writeText(formattedWords);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold text-center">Word Generator</h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Number of Words: {wordCount}</label>
        <Slider
          value={[wordCount]}
          onValueChange={([value]) => setWordCount(value)}
          min={1}
          max={10}
          step={1}
          className="transition duration-300 ease-in-out"
        />
      </div>

      <Button 
        onClick={generateWords}
        className="w-full bg-blue-500 hover:bg-blue-600 transition duration-300 ease-in-out"
      >
        Generate Words
      </Button>

      {words && (
        <div className="mt-4 p-4 bg-gray-100 rounded relative transition duration-300 ease-in-out">
          <p className="text-center break-all text-lg font-mono">{words}</p>
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

export default WGenerator;