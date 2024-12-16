// src/contentScript/index.js
console.info('contentScript is running');

// Add any DOM manipulation or page interaction logic here
document.addEventListener('DOMContentLoaded', () => {
  // Your content script logic here
  console.log('DOM fully loaded and parsed');
});

// Example: Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  // Handle messages here
  sendResponse({ status: 'received' });
});