// Background service worker for Chrome extension

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Chrome Extension installed');
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);

  // Add your message handling logic here
  sendResponse({ success: true });

  return true; // Keep message channel open for async response
});

// Automatically open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});
