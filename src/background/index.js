// src/background/index.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'COPY_TO_CLIPBOARD') {
        try {
            navigator.clipboard.writeText(request.text)
                .then(() => sendResponse({ success: true }))
                .catch(err => sendResponse({ success: false, error: err.message }));
        } catch (err) {
            sendResponse({ success: false, error: err.message });
        }
        return true;
    }
});