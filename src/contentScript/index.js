// src/contentScript/index.js
console.info('contentScript is running');

// Example: Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  // Handle messages here
  sendResponse({ status: 'received' });
});