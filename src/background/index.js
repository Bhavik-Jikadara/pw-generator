// src/background/index.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'COPY_TO_CLIPBOARD') {
        // Create a temporary textarea element
        const textArea = document.createElement('textarea');
        textArea.value = request.text;
        document.body.appendChild(textArea);

        try {
            // Select and copy the text
            textArea.select();
            document.execCommand('copy');
            sendResponse({ success: true });
        } catch (err) {
            console.error('Failed to copy text:', err);
            sendResponse({ success: false, error: err.message });
        } finally {
            // Clean up
            document.body.removeChild(textArea);
        }

        return true; // Required for async response
    }
});