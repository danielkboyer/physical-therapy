# Chrome Extension

Chrome extension that integrates with the Next.js backend.

## Features

- Authentication with backend
- Chrome storage for state persistence
- Background service worker
- Popup UI with Tailwind-style design

## Installation

### Development Mode

1. Build the extension:
   ```bash
   npm install
   npm run build
   ```

2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `chrome-extension` folder

3. Note the extension ID and update your web-app `.env.local`:
   ```env
   EXTENSION_ORIGIN=chrome-extension://your-extension-id-here
   ```

## Configuration

Update the `API_BASE_URL` in [src/popup.ts](src/popup.ts):

```typescript
const API_BASE_URL = 'https://your-app.vercel.app'; // Production URL
```

Also update `host_permissions` in [manifest.json](manifest.json):

```json
"host_permissions": [
  "https://your-app.vercel.app/*"
]
```

## Project Structure

```
chrome-extension/
├── src/                  # TypeScript source files
│   ├── popup.ts         # Popup UI logic
│   └── background.ts    # Background service worker
├── dist/                # Compiled JavaScript (auto-generated)
│   ├── popup.js
│   └── background.js
├── icons/               # Extension icons
├── popup.html           # Popup UI
├── manifest.json        # Extension manifest
├── package.json
└── tsconfig.json        # TypeScript config
```

## Development

### Build Commands

```bash
# Install dependencies
npm install

# One-time build
npm run build

# Watch mode (auto-rebuild on file changes)
npm run watch
```

### Development Workflow

1. Make changes to TypeScript files in `src/`
2. Run `npm run build` or `npm run watch`
3. Go to `chrome://extensions/` and click the refresh icon
4. Test your changes

### Debugging

- **Popup**: Right-click popup → "Inspect"
- **Background Worker**: Go to `chrome://extensions/` → Click "service worker"
- **Errors**: Check `chrome://extensions/` for error badges

## Permissions

The extension currently has these permissions (edit in [manifest.json](manifest.json)):

- `activeTab`: Access to current tab
- `storage`: Store data locally
- `tabCapture`: Capture tab audio/video

## Publishing to Chrome Web Store

1. Build the extension:
   ```bash
   npm run build
   ```

2. Create a ZIP file of the entire `chrome-extension` folder

3. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)

4. Upload the ZIP file

5. Fill in the required metadata

6. Submit for review

## Customization

### Icons

Replace the icon files in the `icons/` folder:
- `icon16.png` - 16x16px
- `icon48.png` - 48x48px
- `icon128.png` - 128x128px

### Popup UI

Edit [popup.html](popup.html) to customize the user interface.

### Business Logic

Edit [src/popup.ts](src/popup.ts) and [src/background.ts](src/background.ts) to add your custom functionality.
