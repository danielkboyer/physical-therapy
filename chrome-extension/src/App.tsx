import { useState, useEffect } from 'react';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard, { type DashboardState } from './components/Dashboard';
import ProfilePage from './pages/ProfilePage';
import { trpc } from './trpc-client';

type View = 'signup' | 'login' | 'dashboard' | 'profile';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  clinicId: string;
}

/**
 * Function to be injected into Prompt EMR page to scrape patient data
 * This function will be executed in the context of the Prompt EMR page
 *
 * NOTE: This function cannot import from other files because it's serialized and injected.
 * All helper functions must be defined inline.
 */
async function scrapePromptPatientData(patientId: string) {
  console.log('[PT AI Scraper] Starting to scrape patient data for:', patientId);

  // Helper: Wait for element to appear
  const waitForElement = (selector: string, timeout = 5000): Promise<Element | null> => {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  };

  // Helper: Try multiple selectors
  const waitForAnyElement = async (
    selectors: string[],
    timeout = 5000
  ): Promise<{ element: Element; selector: string } | null> => {
    for (const selector of selectors) {
      const element = await waitForElement(selector, timeout);
      if (element) {
        return { element, selector };
      }
    }
    return null;
  };

  // Helper: Extract key-value pairs
  const extractKeyValuePairs = (
    containerSelector: string,
    labelSelector: string,
    valueSelector: string
  ): Record<string, string> => {
    const details: Record<string, string> = {};
    const containers = document.querySelectorAll(containerSelector);

    containers.forEach(container => {
      const label = container.querySelector(labelSelector)?.textContent?.trim();
      const value = container.querySelector(valueSelector)?.textContent?.trim();

      if (label && value && value !== '-') {
        details[label] = value;
      }
    });

    return details;
  };

  // Helper: Parse name with nickname
  const parseNameWithNickname = (fullNameText: string) => {
    let firstName = '';
    let lastName = '';
    let nickName: string | undefined;

    const nicknameMatch = fullNameText.match(/"([^"]+)"/);
    if (nicknameMatch) {
      nickName = nicknameMatch[1];
    }

    const nameWithoutNickname = fullNameText.replace(/"[^"]+"/, '').trim();
    const nameParts = nameWithoutNickname.split(' ').filter(part => part.length > 0);

    if (nameParts.length >= 2) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    } else if (nameParts.length === 1) {
      firstName = nameParts[0];
    }

    return { firstName, lastName, nickName };
  };

  // Wait for the name element to appear (try multiple selectors)
  const nameSelectors = [
    '.text-h4.text-p-gray600',
    '[class*="text-h4"][class*="gray600"]',
    'div.text-h4',
  ];

  const nameResult = await waitForAnyElement(nameSelectors);

  if (!nameResult) {
    console.error('[PT AI Scraper] Could not find name element after waiting');
    return { firstName: '', lastName: '', nickName: undefined };
  }

  console.log('[PT AI Scraper] Found nameElement with selector:', nameResult.selector);
  console.log('[PT AI Scraper] nameElement HTML:', nameResult.element.outerHTML);

  const fullNameText = nameResult.element.textContent?.trim() || '';
  console.log('[PT AI Scraper] fullNameText:', fullNameText);

  // Parse the name
  let { firstName, lastName, nickName } = parseNameWithNickname(fullNameText);
  console.log('[PT AI Scraper] Parsed firstName:', firstName, 'lastName:', lastName, 'nickName:', nickName);

  // Extract other details from the detail rows
  const details = extractKeyValuePairs(
    '.p-text-body',
    '.p-text-caption.text-p-gray500',
    '.text-p-gray600'
  );
  console.log('[PT AI Scraper] Extracted details:', details);

  // Use the full name from details if available, otherwise use parsed name
  const fullName = details['Name'];
  if (fullName) {
    console.log('[PT AI Scraper] Using Name from details:', fullName);
    const parts = fullName.split(' ');
    firstName = parts[0] || firstName;
    lastName = parts.slice(1).join(' ') || lastName;
  }

  nickName = details['Name Preference'] || nickName;

  console.log('[PT AI Scraper] Final result - firstName:', firstName, 'lastName:', lastName, 'nickName:', nickName);

  return {
    firstName,
    lastName,
    nickName,
  };
}

/**
 * Function to be injected into Prompt EMR visit page to scrape visit data
 * This function will be executed in the context of the Prompt EMR page
 *
 * NOTE: This function cannot import from other files because it's serialized and injected.
 * All helper functions must be defined inline.
 */
async function scrapePromptVisitData(visitId: string, patientId: string) {
  console.log('[PT AI Scraper] Starting to scrape visit data for:', { visitId, patientId });

  // Helper: Wait for element to appear
  const waitForElement = (selector: string, timeout = 5000): Promise<Element | null> => {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  };

  // Helper: Parse name with nickname (same as patient scraper)
  const parseNameWithNickname = (fullNameText: string) => {
    let firstName = '';
    let lastName = '';
    let nickName: string | undefined;

    const nicknameMatch = fullNameText.match(/"([^"]+)"/);
    if (nicknameMatch) {
      nickName = nicknameMatch[1];
    }

    const nameWithoutNickname = fullNameText.replace(/"[^"]+"/, '').trim();
    const nameParts = nameWithoutNickname.split(' ').filter(part => part.length > 0);

    if (nameParts.length >= 2) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    } else if (nameParts.length === 1) {
      firstName = nameParts[0];
    }

    return { firstName, lastName, nickName };
  };

  // Extract patient name from the page
  const patientNameElement = await waitForElement('.text-h4.text-p-gray600');
  let patientFirstName = '';
  let patientLastName = '';
  let patientNickName: string | undefined;

  if (patientNameElement) {
    const fullNameText = patientNameElement.textContent?.trim() || '';
    const parsedName = parseNameWithNickname(fullNameText);
    patientFirstName = parsedName.firstName;
    patientLastName = parsedName.lastName;
    patientNickName = parsedName.nickName;
    console.log('[PT AI Scraper] Extracted patient name:', { patientFirstName, patientLastName, patientNickName });
  }

  // Extract visit date and time from the page
  let visitDateStr = '';
  let visitTimeStr = '';

  // Try to get date from the header at the top of the page
  // Look for the visit header that shows date info (e.g., "Tomorrow - Visit 1 - Initial Evaluation")
  const visitHeaderSelectors = [
    '.text-subtitle2',
    '[class*="text-subtitle"]',
    '.text-h6',
    '.text-subtitle1',
  ];

  for (const selector of visitHeaderSelectors) {
    const headerElement = document.querySelector(selector);
    if (headerElement) {
      const headerText = headerElement.textContent?.trim() || '';
      console.log('[PT AI Scraper] Found header:', headerText, 'with selector:', selector);

      // Check if this header contains date info
      if (headerText.toLowerCase().includes('tomorrow') ||
          headerText.toLowerCase().includes('today') ||
          headerText.toLowerCase().includes('visit')) {

        if (headerText.toLowerCase().includes('tomorrow')) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          visitDateStr = tomorrow.toISOString().split('T')[0];
          console.log('[PT AI Scraper] Using tomorrow as date:', visitDateStr);
          break;
        } else if (headerText.toLowerCase().includes('today')) {
          visitDateStr = new Date().toISOString().split('T')[0];
          console.log('[PT AI Scraper] Using today as date:', visitDateStr);
          break;
        }
      }
    }
  }

  // If no date found from header, try the sidebar date headers
  if (!visitDateStr) {
    const sidebarDateHeaders = document.querySelectorAll('.text-subtitle1, .text-h6');
    for (const dateHeader of Array.from(sidebarDateHeaders)) {
      const headerText = dateHeader.textContent?.trim() || '';
      console.log('[PT AI Scraper] Checking sidebar header:', headerText);

      if (headerText.toLowerCase().includes('tomorrow')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        visitDateStr = tomorrow.toISOString().split('T')[0];
        break;
      } else if (headerText.toLowerCase().includes('today')) {
        visitDateStr = new Date().toISOString().split('T')[0];
        break;
      } else if (headerText.match(/\d+\s+visits?/i)) {
        // This is the "16 visits" header, skip it
        continue;
      }
    }
  }

  // Extract time from the schedule list items
  // Look for all time elements in the left sidebar
  const timeElements = document.querySelectorAll('.text-left');
  console.log('[PT AI Scraper] Found time elements:', timeElements.length);

  // Try to find the highlighted/selected visit
  const visitElements = document.querySelectorAll('.q-item');
  for (const visitElement of Array.from(visitElements)) {
    // Check various ways a visit could be selected
    const computedStyle = window.getComputedStyle(visitElement);
    const bgColor = computedStyle.backgroundColor;
    const isHighlighted =
      visitElement.classList.contains('bg-blue-100') ||
      visitElement.classList.contains('q-router-link--active') ||
      visitElement.classList.contains('bg-blue') ||
      bgColor.includes('rgb') && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'rgb(255, 255, 255)';

    if (isHighlighted) {
      console.log('[PT AI Scraper] Found highlighted visit element');

      // Look for time within this element
      const timeElement = visitElement.querySelector('.text-left');
      if (timeElement) {
        visitTimeStr = timeElement.textContent?.trim() || '';
        console.log('[PT AI Scraper] Extracted time from highlighted element:', visitTimeStr);
        break;
      }
    }
  }

  // If still no time found, try to extract from the first time element (fallback)
  if (!visitTimeStr && timeElements.length > 0) {
    visitTimeStr = timeElements[0].textContent?.trim() || '';
    console.log('[PT AI Scraper] Using first time element as fallback:', visitTimeStr);
  }

  // If we found time, combine it with the date
  let visitDateTime: string | null = null;
  if (visitDateStr && visitTimeStr) {
    // Parse time (e.g., "7:00am" to 24-hour format)
    const timeParts = visitTimeStr.match(/(\d+):(\d+)(am|pm)/i);
    if (timeParts) {
      let hours = parseInt(timeParts[1]);
      const minutes = parseInt(timeParts[2]);
      const meridiem = timeParts[3].toLowerCase();

      if (meridiem === 'pm' && hours !== 12) {
        hours += 12;
      } else if (meridiem === 'am' && hours === 12) {
        hours = 0;
      }

      // Construct ISO datetime string
      visitDateTime = `${visitDateStr}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
      console.log('[PT AI Scraper] Constructed visit date/time:', visitDateTime);
    }
  }

  console.log('[PT AI Scraper] Final result:', {
    patientFirstName,
    patientLastName,
    patientNickName,
    visitDateTime
  });

  return {
    patient: {
      firstName: patientFirstName,
      lastName: patientLastName,
      nickName: patientNickName,
    },
    visitDateTime,
  };
}

function App() {
  const [currentView, setCurrentView] = useState<View>('signup');
  const [user, setUser] = useState<StoredUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedDashboardState, setSavedDashboardState] = useState<DashboardState | undefined>(undefined);

  // Get tRPC utils for invalidation
  const utils = trpc.useUtils();

  // Check for integrations when user logs in
  const { data: integrations } = trpc.emrIntegration.getByClinic.useQuery(
    { clinicId: user?.clinicId || '' },
    { enabled: !!user?.clinicId }
  );

  // Create patient mutation with automatic query invalidation
  const createPatientMutation = trpc.patient.create.useMutation({
    onSuccess: (createdPatient) => {
      // Invalidate the patients query to refresh the list
      utils.patient.getByClinic.invalidate({ clinicId: createdPatient.clinicId });

      // Navigate to the patient profile
      setSavedDashboardState({
        currentView: { type: 'patient-profile', patientId: createdPatient.id },
        currentTab: 'patients',
        searchQuery: '',
      });
      setCurrentView('dashboard');
    },
  });

  // Create visit mutation with automatic query invalidation
  const createVisitMutation = trpc.visit.create.useMutation({
    onSuccess: (createdVisit) => {
      // Invalidate the visits queries to refresh the lists
      utils.visit.getByClinic.invalidate({ clinicId: createdVisit.clinicId });
      utils.visit.getByPatient.invalidate({ patientId: createdVisit.patientId });

      // Navigate to the specific visit with patientId for proper breadcrumb navigation
      setSavedDashboardState({
        currentView: { type: 'visit', visitId: createdVisit.id, patientId: createdVisit.patientId },
        currentTab: 'visits',
        searchQuery: '',
      });
      setCurrentView('dashboard');
    },
  });

  useEffect(() => {
    // Check if user is logged in
    chrome.storage.local.get(['user', 'isLoggedIn'], (result) => {
      if (result.isLoggedIn && result.user) {
        setUser(result.user as StoredUser);
        setCurrentView('dashboard');
      } else {
        setCurrentView('login');
      }
    });

    // Listen for patient detection messages from background script
    // Note: We can't use the messageListener pattern because it won't have access to the latest user state
    // Instead, we'll check storage when messages arrive
  }, []);

  // Separate effect for message listener that has access to user state
  useEffect(() => {
    const messageListener = async (message: any, _sender: any, sendResponse: any) => {
      console.log('[PT AI App] Received message:', message);
      console.log('[PT AI App] Current user:', user);

      if (message.type === 'PATIENT_DETECTED_FROM_EMR') {
        console.log('[PT AI App] Processing patient detection');

        const { patientId, tabId } = message;

        if (!user?.clinicId) {
          console.error('[PT AI] No clinic ID, cannot add patient');
          sendResponse({ success: false, error: 'No clinic ID' });
          return;
        }

        try {
          console.log('[PT AI] Scraping patient data from tab:', tabId);

          // Execute a script in the Prompt EMR tab to scrape patient data
          const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: scrapePromptPatientData,
            args: [patientId],
          });

          if (!results || results.length === 0 || !results[0].result) {
            console.error('[PT AI] Failed to scrape patient data');
            sendResponse({ success: false, error: 'Failed to scrape patient data' });
            return;
          }

          const patientData = results[0].result;
          console.log('[PT AI] Scraped patient data:', patientData);

          // Add patient to database via tRPC
          console.log('[PT AI] Creating patient with data:', {
            firstName: patientData.firstName,
            lastName: patientData.lastName,
            nickName: patientData.nickName,
            clinicId: user.clinicId,
            externalId: patientId,
          });

          await createPatientMutation.mutateAsync({
            firstName: patientData.firstName,
            lastName: patientData.lastName,
            nickName: patientData.nickName || null,
            clinicId: user.clinicId,
            externalId: patientId,
          });

          console.log('[PT AI] Patient added successfully');
          sendResponse({ success: true });
        } catch (error) {
          console.error('[PT AI] Error adding patient from EMR:', error);
          sendResponse({ success: false, error: String(error) });
        }

        return true;
      }

      if (message.type === 'VISIT_DETECTED_FROM_EMR') {
        console.log('[PT AI App] Processing visit detection');

        const { visitId, patientId, tabId } = message;

        if (!user?.clinicId) {
          console.error('[PT AI] No clinic ID, cannot add visit');
          sendResponse({ success: false, error: 'No clinic ID' });
          return;
        }

        try {
          console.log('[PT AI] Scraping visit data from tab:', tabId);

          // Execute a script in the Prompt EMR tab to scrape visit data
          const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: scrapePromptVisitData,
            args: [visitId, patientId],
          });

          if (!results || results.length === 0 || !results[0].result) {
            console.error('[PT AI] Failed to scrape visit data');
            sendResponse({ success: false, error: 'Failed to scrape visit data' });
            return;
          }

          const visitData = results[0].result;
          console.log('[PT AI] Scraped visit data:', visitData);

          // First, ensure the patient exists (merge patient data)
          console.log('[PT AI] Creating/updating patient with data:', {
            firstName: visitData.patient.firstName,
            lastName: visitData.patient.lastName,
            nickName: visitData.patient.nickName,
            clinicId: user.clinicId,
            externalId: patientId,
          });

          const createdPatient = await createPatientMutation.mutateAsync({
            firstName: visitData.patient.firstName,
            lastName: visitData.patient.lastName,
            nickName: visitData.patient.nickName || null,
            clinicId: user.clinicId,
            externalId: patientId,
          });

          console.log('[PT AI] Patient created/updated:', createdPatient);

          // Now create/update the visit
          // Use current date/time as fallback if visit date/time not found
          const visitDate = visitData.visitDateTime || new Date().toISOString();

          if (!visitData.visitDateTime) {
            console.warn('[PT AI] No visit date/time found, using current date/time as fallback');
          }

          console.log('[PT AI] Creating visit with data:', {
            patientId: createdPatient.id,
            clinicId: user.clinicId,
            visitDate: visitDate,
            externalId: visitId,
          });

          await createVisitMutation.mutateAsync({
            patientId: createdPatient.id,
            clinicId: user.clinicId,
            visitDate: visitDate,
            externalId: visitId,
          });

          console.log('[PT AI] Visit added successfully');
          sendResponse({ success: true });
        } catch (error) {
          console.error('[PT AI] Error adding visit from EMR:', error);
          sendResponse({ success: false, error: String(error) });
        }

        return true;
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [user, createPatientMutation, createVisitMutation]);

  // Set default tab based on whether integrations exist
  useEffect(() => {
    if (user && currentView === 'dashboard' && integrations !== undefined && !savedDashboardState) {
      const hasActiveIntegration = integrations.some(int => int.isActive);
      if (!hasActiveIntegration) {
        setSavedDashboardState({
          currentView: { type: 'integrations' },
          currentTab: 'integrations',
          searchQuery: '',
        });
      } else {
        // Set default to patients if integrations exist
        setSavedDashboardState({
          currentView: { type: 'patients' },
          currentTab: 'patients',
          searchQuery: '',
        });
      }
    }
  }, [user, currentView, integrations, savedDashboardState]);

  const handleLoginSuccess = (userData: StoredUser) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleSignupSuccess = () => {
    setCurrentView('login');
  };

  const handleLogout = () => {
    chrome.storage.local.remove(['user', 'isLoggedIn'], () => {
      setUser(null);
      setCurrentView('login');
      setSavedDashboardState(undefined);
    });
  };

  const handleProfileClick = (state: DashboardState) => {
    setSavedDashboardState(state);
    setCurrentView('profile');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  return (
    <>
      {currentView === 'signup' && (
        <Signup
          onSuccess={handleSignupSuccess}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      )}
      {currentView === 'login' && (
        <Login
          onSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setCurrentView('signup')}
        />
      )}
      {currentView === 'dashboard' && user && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onProfileClick={handleProfileClick}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          initialState={savedDashboardState}
        />
      )}
      {currentView === 'profile' && user && (
        <ProfilePage
          user={user}
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

export default App;
