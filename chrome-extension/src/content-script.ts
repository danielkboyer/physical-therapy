/**
 * Content script that runs on Prompt EMR pages
 * Monitors URL changes and sends patient page info to extension
 */

// Store the last processed patient ID and visit ID to avoid duplicate processing
let lastProcessedPatientId: string | null = null;
let lastProcessedVisitId: string | null = null;

/**
 * Extract patient ID from the current URL
 */
function extractPatientIdFromUrl(): string | null {
  const url = window.location.href;
  console.log('[PT AI] Checking URL for patient ID:', url);
  const match = url.match(/\/patients\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  const patientId = match ? match[1] : null;
  console.log('[PT AI] Extracted patient ID:', patientId);
  return patientId;
}

/**
 * Extract visit ID and patient ID from the current URL
 * URL format: /onDeck?tab=upcoming&visitId=xxx&patientId=yyy
 */
function extractVisitInfoFromUrl(): { visitId: string; patientId: string } | null {
  const url = window.location.href;
  console.log('[PT AI] Checking URL for visit info:', url);

  // Check if we're on the On Deck page with visitId parameter
  if (!url.includes('/onDeck') || !url.includes('visitId=')) {
    return null;
  }

  const urlObj = new URL(url);
  const visitId = urlObj.searchParams.get('visitId');
  const patientId = urlObj.searchParams.get('patientId');

  if (visitId && patientId) {
    console.log('[PT AI] Extracted visit info:', { visitId, patientId });
    return { visitId, patientId };
  }

  return null;
}

/**
 * Send message to extension when patient page is detected
 */
function notifyPatientPageDetected(patientId: string) {
  // Send the current URL and let the extension handle scraping
  chrome.runtime.sendMessage({
    type: 'PROMPT_PATIENT_PAGE_DETECTED',
    patientId,
    url: window.location.href,
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('[PT AI] Error sending message:', chrome.runtime.lastError);
      return;
    }

    if (response?.success) {
      console.log('[PT AI] Patient page detected, extension notified');
      showNotification('Patient detected - Check PT AI extension');
    }
  });
}

/**
 * Send message to extension when visit page is detected
 */
function notifyVisitPageDetected(visitId: string, patientId: string) {
  // Send the current URL and let the extension handle scraping
  chrome.runtime.sendMessage({
    type: 'PROMPT_VISIT_PAGE_DETECTED',
    visitId,
    patientId,
    url: window.location.href,
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('[PT AI] Error sending message:', chrome.runtime.lastError);
      return;
    }

    if (response?.success) {
      console.log('[PT AI] Visit page detected, extension notified');
      showNotification('Visit detected - Check PT AI extension');
    }
  });
}

/**
 * Show a subtle notification to the user
 */
function showNotification(message: string) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    animation: slideIn 0.3s ease-out;
  `;

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      notification.remove();
      style.remove();
    }, 300);
  }, 3000);
}

/**
 * Check if we're on a patient page or visit page and notify extension
 */
function checkAndProcessPage() {
  // First check if we're on a visit page (On Deck)
  const visitInfo = extractVisitInfoFromUrl();
  if (visitInfo) {
    const { visitId, patientId } = visitInfo;

    // Don't process the same visit multiple times
    if (visitId === lastProcessedVisitId) {
      return;
    }

    console.log('[PT AI] Detected visit page:', { visitId, patientId });
    lastProcessedVisitId = visitId;
    lastProcessedPatientId = null; // Clear patient tracking when on visit page

    // Notify the extension
    notifyVisitPageDetected(visitId, patientId);
    return;
  }

  // If not on visit page, check for patient page
  const patientId = extractPatientIdFromUrl();

  if (!patientId) {
    lastProcessedPatientId = null;
    lastProcessedVisitId = null;
    return;
  }

  // Don't process the same patient multiple times
  if (patientId === lastProcessedPatientId) {
    return;
  }

  console.log('[PT AI] Detected patient page:', patientId);
  lastProcessedPatientId = patientId;
  lastProcessedVisitId = null; // Clear visit tracking when on patient page

  // Notify the extension
  notifyPatientPageDetected(patientId);
}

/**
 * Monitor URL changes (for single-page app navigation)
 */
function monitorUrlChanges() {
  let lastUrl = window.location.href;

  // Use MutationObserver to detect URL changes
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log('[PT AI] URL changed:', currentUrl);
      checkAndProcessPage();
    }
  });

  observer.observe(document, { subtree: true, childList: true });

  // Also listen for popstate events (back/forward navigation)
  window.addEventListener('popstate', () => {
    console.log('[PT AI] Popstate event');
    checkAndProcessPage();
  });

  // Listen for pushState/replaceState
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    console.log('[PT AI] PushState event');
    checkAndProcessPage();
  };

  history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    console.log('[PT AI] ReplaceState event');
    checkAndProcessPage();
  };
}

// Initialize when the page loads
console.log('[PT AI] Content script loaded on:', window.location.href);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('[PT AI] Content script initialized (DOMContentLoaded)');
    monitorUrlChanges();
    checkAndProcessPage();
  });
} else {
  console.log('[PT AI] Content script initialized (already loaded)');
  monitorUrlChanges();
  checkAndProcessPage();
}
