const API_BASE_URL = 'http://localhost:3000'; // Change to production URL

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await checkAuth();
});

// Setup event listeners
function setupEventListeners(): void {
  const actionBtn = document.getElementById('actionBtn');
  const loginBtn = document.getElementById('loginBtn');

  actionBtn?.addEventListener('click', handleAction);
  loginBtn?.addEventListener('click', openLogin);
}

// Check authentication with backend
async function checkAuth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
      credentials: 'include'
    });

    if (!response.ok) {
      showLoginPrompt();
      return false;
    }

    const data = await response.json();
    if (!data.user) {
      showLoginPrompt();
      return false;
    }

    // Store user data
    await chrome.storage.local.set({ user: data.user });
    showMainContent();
    return true;
  } catch (error) {
    console.error('Auth check failed:', error);
    showLoginPrompt();
    return false;
  }
}

// Show/hide UI sections
function showLoginPrompt(): void {
  const loginPrompt = document.getElementById('loginPrompt');
  const mainContent = document.getElementById('mainContent');
  if (loginPrompt) loginPrompt.style.display = 'block';
  if (mainContent) mainContent.style.display = 'none';
}

function showMainContent(): void {
  const loginPrompt = document.getElementById('loginPrompt');
  const mainContent = document.getElementById('mainContent');
  if (loginPrompt) loginPrompt.style.display = 'none';
  if (mainContent) mainContent.style.display = 'block';
}

function openLogin(): void {
  chrome.tabs.create({ url: `${API_BASE_URL}/login` });
}

// Main action handler
async function handleAction(): Promise<void> {
  try {
    const { user } = await chrome.storage.local.get('user');
    if (!user) {
      showError('Not authenticated');
      return;
    }

    // Add your action logic here
    console.log('Action triggered for user:', user);

  } catch (error) {
    console.error('Action error:', error);
    showError('Action failed: ' + (error as Error).message);
  }
}

// Error display
function showError(message: string): void {
  const errorDiv = document.getElementById('error');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }
}
