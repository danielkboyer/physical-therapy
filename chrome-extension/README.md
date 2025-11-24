# PT Session Recorder - Chrome Extension

Chrome extension for recording physical therapy sessions with audio capture.

## Features

- Record therapy sessions with high-quality audio
- Associate sessions with locations and customers
- Real-time recording timer
- Automatic session upload to backend
- Visual recording indicator

## Installation

### Development Mode

1. Create placeholder icons (or add your own):
   - Create an `icons` folder
   - Add `icon16.png`, `icon48.png`, and `icon128.png`

2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `chrome-extension` folder

### Production

Package the extension and publish to Chrome Web Store.

## Usage

1. Click the extension icon in Chrome toolbar
2. Log in to your clinic account
3. Select a location
4. Optionally enter customer name
5. Click "Start Recording"
6. Conduct your therapy session
7. Click "Stop Recording" when done
8. Audio is automatically uploaded

## Configuration

Update the `API_BASE_URL` in `popup.js`:

```javascript
const API_BASE_URL = 'https://your-app.vercel.app';
```

Also update `host_permissions` in `manifest.json`:

```json
"host_permissions": [
  "https://your-app.vercel.app/*"
]
```

## Technical Details

### Audio Recording

- Uses MediaRecorder API with WebM format
- Sample rate: 44.1kHz
- Includes echo cancellation and noise suppression
- Records in 1-second chunks

### Permissions

- `activeTab`: Access to current tab
- `storage`: Store recording state
- `tabCapture`: Capture audio from browser

### State Management

Recording state is persisted in Chrome storage to survive popup closes.

## Development

The extension consists of:

- `manifest.json`: Extension configuration
- `popup.html`: UI for the extension popup
- `popup.js`: Main logic for recording
- `background.js`: Service worker for background tasks
