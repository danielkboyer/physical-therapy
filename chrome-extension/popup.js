const API_BASE_URL = 'http://localhost:3000'; // Change to production URL

let isRecording = false;
let sessionId = null;
let startTime = null;
let timerInterval = null;
let mediaRecorder = null;
let audioChunks = [];

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await loadLocations();
  setupEventListeners();
  await checkRecordingState();
});

// Check authentication
async function checkAuth() {
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

    chrome.storage.local.set({ user: data.user });
    return true;
  } catch (error) {
    console.error('Auth check failed:', error);
    showLoginPrompt();
    return false;
  }
}

function showLoginPrompt() {
  document.getElementById('loginPrompt').style.display = 'block';
  document.getElementById('mainContent').style.display = 'none';
}

function openLogin() {
  chrome.tabs.create({ url: `${API_BASE_URL}/login` });
}

// Load locations
async function loadLocations() {
  try {
    const { user } = await chrome.storage.local.get('user');
    if (!user) return;

    const response = await fetch(`${API_BASE_URL}/api/locations?clinicId=${user.clinicId}`, {
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Failed to load locations');

    const data = await response.json();
    const locationSelect = document.getElementById('location');

    data.locations.forEach(location => {
      const option = document.createElement('option');
      option.value = location.id;
      option.textContent = location.name;
      locationSelect.appendChild(option);
    });
  } catch (error) {
    showError('Failed to load locations: ' + error.message);
  }
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('startBtn').addEventListener('click', startRecording);
  document.getElementById('stopBtn').addEventListener('click', stopRecording);
}

// Start recording
async function startRecording() {
  try {
    const locationId = document.getElementById('location').value;
    const customerName = document.getElementById('customer').value;

    if (!locationId) {
      showError('Please select a location');
      return;
    }

    const { user } = await chrome.storage.local.get('user');
    if (!user) {
      showError('Not authenticated');
      return;
    }

    // Create session
    const response = await fetch(`${API_BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        locationId,
        therapistId: user.id,
        customerName: customerName || 'Guest Customer'
      })
    });

    if (!response.ok) throw new Error('Failed to create session');

    const data = await response.json();
    sessionId = data.session.id;

    // Request audio capture permission
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    });

    // Start recording
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm'
    });

    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      await uploadRecording();
    };

    mediaRecorder.start(1000); // Capture every second

    // Update UI
    isRecording = true;
    startTime = Date.now();
    updateUI();
    startTimer();

    // Save state
    await chrome.storage.local.set({
      isRecording: true,
      sessionId,
      startTime,
      locationId,
      customerName
    });

  } catch (error) {
    console.error('Start recording error:', error);
    showError('Failed to start recording: ' + error.message);
  }
}

// Stop recording
async function stopRecording() {
  try {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();

      // Stop all tracks
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }

    stopTimer();

    // Update state
    isRecording = false;
    await chrome.storage.local.set({
      isRecording: false,
      sessionId: null,
      startTime: null
    });

    updateUI();
  } catch (error) {
    console.error('Stop recording error:', error);
    showError('Failed to stop recording: ' + error.message);
  }
}

// Upload recording
async function uploadRecording() {
  try {
    if (audioChunks.length === 0) {
      showError('No audio data recorded');
      return;
    }

    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

    // Convert to base64 for now (in production, upload to storage service)
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Audio = reader.result.split(',')[1];

      // End session
      const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          audioBlob: base64Audio
        })
      });

      if (!response.ok) throw new Error('Failed to save recording');

      sessionId = null;
      audioChunks = [];

      alert('Recording saved successfully!');
    };

    reader.readAsDataURL(audioBlob);
  } catch (error) {
    console.error('Upload error:', error);
    showError('Failed to upload recording: ' + error.message);
  }
}

// Check recording state
async function checkRecordingState() {
  const state = await chrome.storage.local.get(['isRecording', 'sessionId', 'startTime', 'locationId', 'customerName']);

  if (state.isRecording && state.sessionId) {
    isRecording = true;
    sessionId = state.sessionId;
    startTime = state.startTime;
    updateUI();
    startTimer();
  }
}

// Update UI
function updateUI() {
  const status = document.getElementById('status');
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const recordingInfo = document.getElementById('recordingInfo');

  if (isRecording) {
    status.textContent = 'Recording';
    status.className = 'status recording';
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    recordingInfo.style.display = 'block';

    chrome.storage.local.get(['user', 'locationId', 'customerName'], (data) => {
      document.getElementById('therapistName').textContent = data.user?.name || 'Unknown';
      document.getElementById('recordingLocation').textContent = document.getElementById('location').selectedOptions[0]?.text || 'Unknown';
      document.getElementById('recordingCustomer').textContent = data.customerName || 'Guest';
    });
  } else {
    status.textContent = 'Idle';
    status.className = 'status idle';
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    recordingInfo.style.display = 'none';
  }
}

// Timer
function startTimer() {
  timerInterval = setInterval(() => {
    if (startTime) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      document.getElementById('timer').textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Show error
function showError(message) {
  const errorDiv = document.getElementById('error');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}
