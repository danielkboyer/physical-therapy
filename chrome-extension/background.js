// Background service worker for Chrome extension

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('PT Session Recorder installed');
});

// Keep service worker alive during recording
let keepAliveInterval;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_RECORDING') {
    // Start keep-alive ping
    keepAliveInterval = setInterval(() => {
      console.log('Keep alive ping');
    }, 20000);

    sendResponse({ success: true });
  }

  if (message.type === 'STOP_RECORDING') {
    // Stop keep-alive ping
    if (keepAliveInterval) {
      clearInterval(keepAliveInterval);
      keepAliveInterval = null;
    }

    sendResponse({ success: true });
  }

  return true; // Keep message channel open for async response
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup
  chrome.action.openPopup();
});

// Monitor recording state
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.isRecording) {
    const isRecording = changes.isRecording.newValue;

    // Update extension icon based on recording state
    if (isRecording) {
      chrome.action.setBadgeText({ text: 'REC' });
      chrome.action.setBadgeBackgroundColor({ color: '#dc2626' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }
});
