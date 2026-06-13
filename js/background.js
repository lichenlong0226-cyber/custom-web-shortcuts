// Background service worker

chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(['shortcuts'], (result) => {
        if (!result.shortcuts) {
            chrome.storage.sync.set({
                shortcuts: []
            });
        }
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getShortcuts') {
        chrome.storage.sync.get(['shortcuts'], (result) => {
            sendResponse({ shortcuts: result.shortcuts || [] });
        });
        return true;
    }
});
