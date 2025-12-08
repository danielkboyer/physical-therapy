// Background service worker for Chrome extension

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Chrome Extension installed');
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);

  // Handle Prompt EMR patient page detection
  if (message.type === 'PROMPT_PATIENT_PAGE_DETECTED') {
    handlePromptPatientDetection(message, sender)
      .then(result => sendResponse(result))
      .catch(error => {
        console.error('Error handling patient detection:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }

  // Handle Prompt EMR visit page detection
  if (message.type === 'PROMPT_VISIT_PAGE_DETECTED') {
    handlePromptVisitDetection(message, sender)
      .then(result => sendResponse(result))
      .catch(error => {
        console.error('Error handling visit detection:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }

  // Default response for other messages
  sendResponse({ success: true });
  return true;
});

/**
 * Handle detection of a Prompt EMR patient page
 */
async function handlePromptPatientDetection(message: any, sender: chrome.runtime.MessageSender) {
  const { patientId, url } = message;

  console.log('[PT AI Background] Patient detected:', { patientId, url });

  // Get the tab where the message came from
  if (!sender.tab?.id) {
    throw new Error('No tab ID in sender');
  }

  // We can't directly access the DOM from the background script,
  // so we'll send a message to the side panel to handle the scraping
  // The side panel will need to inject a script into the Prompt EMR tab to scrape the data

  // For now, just store the patient info and notify the side panel
  await chrome.storage.local.set({
    lastDetectedPatient: {
      patientId,
      url,
      timestamp: Date.now(),
      tabId: sender.tab.id,
    }
  });

  // Send a message to the side panel to fetch and add the patient
  chrome.runtime.sendMessage({
    type: 'PATIENT_DETECTED_FROM_EMR',
    patientId,
    url,
    tabId: sender.tab.id,
  });

  return { success: true };
}

/**
 * Handle detection of a Prompt EMR visit page
 */
async function handlePromptVisitDetection(message: any, sender: chrome.runtime.MessageSender) {
  const { visitId, patientId, url } = message;

  console.log('[PT AI Background] Visit detected:', { visitId, patientId, url });

  // Get the tab where the message came from
  if (!sender.tab?.id) {
    throw new Error('No tab ID in sender');
  }

  // Store the visit info and notify the side panel
  await chrome.storage.local.set({
    lastDetectedVisit: {
      visitId,
      patientId,
      url,
      timestamp: Date.now(),
      tabId: sender.tab.id,
    }
  });

  // Send a message to the side panel to fetch and add the visit
  chrome.runtime.sendMessage({
    type: 'VISIT_DETECTED_FROM_EMR',
    visitId,
    patientId,
    url,
    tabId: sender.tab.id,
  });

  return { success: true };
}

// Automatically open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.sidePanel.open({ tabId: tab.id });
  }
});
