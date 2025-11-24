# Extension Icons

Place your extension icons in this directory:

- `icon16.png` - 16x16 pixels (toolbar icon)
- `icon48.png` - 48x48 pixels (extension management page)
- `icon128.png` - 128x128 pixels (Chrome Web Store)

## Creating Icons

### Option 1: Use a Design Tool

Create icons in:
- Figma
- Adobe Illustrator
- Canva
- Sketch

### Option 2: Use an Online Generator

- [favicon.io](https://favicon.io) - Free favicon generator
- [realfavicongenerator.net](https://realfavicongenerator.net)
- [Icon Generator](https://icon.kitchen)

### Option 3: Simple SVG Template

Create an SVG file and convert to PNG at different sizes:

```svg
<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" fill="#3b82f6" rx="20"/>
  <text x="64" y="80" text-anchor="middle"
        font-size="60" fill="white" font-family="Arial">
    PT
  </text>
</svg>
```

Save as `icon.svg` and use an online tool to convert to PNG at required sizes.

## Design Guidelines

### Recommended Style

- Simple and recognizable
- Works well at small sizes
- Clear contrast
- Professional medical/therapy theme

### Color Suggestions

- Primary: Blue (#3b82f6) - Trust, professionalism
- Accent: Green (#10b981) - Health, growth
- Background: White or light gray

### Icon Ideas

- Microphone icon (🎙️)
- Stethoscope
- Medical cross with audio waves
- PT initials
- Clipboard with audio waves

## Quick Placeholder Solution

For development, you can use emoji-based icons:

1. Go to [favicon.io/emoji-favicons](https://favicon.io/emoji-favicons)
2. Select 🎙️ (microphone) emoji
3. Generate and download
4. Rename files to match requirements
5. Place in this directory
