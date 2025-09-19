# Installation Guide

This guide will help you install and set up the Prompt Monitor Browser Extension.

## Prerequisites

- A modern web browser (Chrome 88+, Firefox 78+, Edge 88+)
- Node.js 16+ (for development builds)
- npm or yarn (for development builds)

## Quick Installation (Pre-built)

### For Chrome/Edge Users

1. **Download the Extension**
   - Download the latest release ZIP file
   - Extract it to a folder on your computer

2. **Load the Extension**
   - Open Chrome or Edge
   - Navigate to `chrome://extensions/` (Chrome) or `edge://extensions/` (Edge)
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the folder containing the extracted extension files
   - The extension should now appear in your extensions list

3. **Verify Installation**
   - Look for the Prompt Monitor icon in your browser toolbar
   - Click the icon to open the popup
   - You should see the extension interface

### For Firefox Users

1. **Download the Extension**
   - Download the latest release ZIP file
   - Extract it to a folder on your computer

2. **Load the Extension**
   - Open Firefox
   - Navigate to `about:debugging`
   - Click "This Firefox" in the left sidebar
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from the extracted folder
   - The extension should now be loaded

3. **Verify Installation**
   - Look for the Prompt Monitor icon in your browser toolbar
   - Click the icon to open the popup
   - You should see the extension interface

## Development Installation

If you want to build the extension from source:

### 1. Clone and Setup

```bash
# Clone the repository (if from git)
git clone <repository-url>
cd prompt-monitor-extension

# Or download and extract the source code
# Navigate to the extracted folder
cd prompt-monitor-extension
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Extension

For Chrome/Edge:
```bash
npm run build
```

For Firefox:
```bash
npm run build:firefox
```

### 4. Load in Browser

Follow the same steps as the "Quick Installation" section above, but use the `dist` folder created by the build process.

## Post-Installation Setup

### 1. Grant Permissions

When you first load the extension, your browser may ask for permissions:
- **Storage**: Required to save detection history
- **Active Tab**: Required to monitor ChatGPT pages
- **Scripting**: Required to inject monitoring code

Click "Allow" or "Add extension" when prompted.

### 2. Test the Extension

1. Navigate to [ChatGPT](https://chat.openai.com) or [chatgpt.com](https://chatgpt.com)
2. Type a message containing an email address (e.g., "test@example.com")
3. Click submit
4. You should see an alert and modal popup
5. Click the extension icon to view the popup interface

### 3. Configure Settings (Optional)

- Open the extension popup
- Review the "Issues Found" and "History" tabs
- Test the dismiss functionality
- Clear history if needed

## Troubleshooting Installation

### Extension Not Loading

**Chrome/Edge:**
- Ensure "Developer mode" is enabled
- Check that you selected the correct folder (should contain manifest.json)
- Try refreshing the extensions page
- Check the browser console for errors

**Firefox:**
- Ensure you selected the manifest.json file, not the folder
- Check the browser console for errors
- Try restarting Firefox

### Extension Not Working

1. **Check Permissions**
   - Go to extension settings
   - Ensure all required permissions are granted
   - Try disabling and re-enabling the extension

2. **Verify ChatGPT Access**
   - Ensure you're on a supported ChatGPT domain
   - Try refreshing the ChatGPT page
   - Check if the extension icon appears in the toolbar

3. **Clear Extension Data**
   - Go to extension settings
   - Click "Storage" or "Details"
   - Clear all stored data
   - Reload the extension

### Build Issues

If you encounter build errors:

1. **Check Node.js Version**
   ```bash
   node --version  # Should be 16 or higher
   ```

2. **Clear Dependencies**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Check for Missing Files**
   - Ensure all source files are present
   - Check that TypeScript files compile without errors

## Uninstallation

### Remove from Browser

**Chrome/Edge:**
1. Go to `chrome://extensions/` or `edge://extensions/`
2. Find "Prompt Monitor Extension"
3. Click "Remove"
4. Confirm removal

**Firefox:**
1. Go to `about:addons`
2. Find "Prompt Monitor Extension"
3. Click the gear icon
4. Select "Remove"

### Clean Up Data

The extension stores data locally in your browser. To completely remove all data:

1. Remove the extension (see above)
2. Clear browser data for the extension (optional)
3. Restart your browser

## Security Notes

- The extension only works on ChatGPT domains
- All data is stored locally in your browser
- No data is sent to external servers
- The extension has minimal permissions

## Support

If you encounter issues during installation:

1. Check this troubleshooting guide
2. Review the main README.md file
3. Check browser compatibility requirements
4. Ensure you have the latest browser version

For additional help, please create an issue with:
- Your browser and version
- Operating system
- Steps you followed
- Error messages (if any)
