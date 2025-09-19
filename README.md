# Prompt Monitor Browser Extension

A browser extension that monitors ChatGPT usage to detect and alert users about email addresses in their prompts, helping protect sensitive information in AI conversations.

## Features

### Core Functionality
- **Real-time Email Detection**: Automatically scans ChatGPT input fields for email addresses using advanced regex patterns
- **Instant Alerts**: Shows browser alerts and modal popups when emails are detected
- **Local Storage**: Persists detection history in browser's local storage
- **Email Dismissal**: Dismiss emails for 24 hours to prevent repeated alerts

### User Interface
- **Modern React UI**: Built with React 18 and TypeScript for type safety
- **Tabbed Interface**: 
  - **Issues Found**: Shows currently detected email addresses
  - **History**: Displays all previously detected emails with statistics
- **Responsive Design**: Works on different screen sizes with mobile-friendly layout
- **Visual Indicators**: Clear badges and status indicators for dismissed emails

### State Management
- **Redux Toolkit**: Centralized state management for consistent data flow
- **Persistent Storage**: Chrome extension storage API for data persistence
- **Real-time Updates**: Live updates between popup and content script

### Cross-Browser Support
- **Chrome/Chromium**: Full support with Manifest V3
- **Firefox**: Compatible with Manifest V2
- **Edge**: Works with Chromium-based Edge

## Installation

### Development Setup

1. **Clone and Install Dependencies**
   ```bash
   cd prompt-monitor-extension
   npm install
   ```

2. **Build the Extension**
   ```bash
   # For Chrome/Edge
   npm run build
   
   # For Firefox
   npm run build:firefox
   ```

3. **Load in Browser**
   - **Chrome/Edge**: Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", select the `dist` folder
   - **Firefox**: Go to `about:debugging`, click "This Firefox", click "Load Temporary Add-on", select `dist/manifest.json`

### Production Installation

1. Download the latest release ZIP file
2. Extract to a folder
3. Follow the browser-specific loading instructions above

## Usage

### Basic Usage
1. Install the extension
2. Navigate to ChatGPT (chat.openai.com or chatgpt.com)
3. Type a message containing an email address
4. Click submit - the extension will detect and alert you

### Extension Popup
- Click the extension icon in your browser toolbar
- View detected emails in the "Issues Found" tab
- Check detection history in the "History" tab
- Dismiss emails to prevent alerts for 24 hours

### Email Dismissal
- Click "Dismiss" on any detected email
- The email won't trigger alerts for 24 hours
- Dismissed emails show a warning badge in history

## Technical Architecture

### Project Structure
```
prompt-monitor-extension/
├── src/
│   ├── background/          # Background script
│   ├── content/            # Content script for ChatGPT monitoring
│   ├── popup/              # React popup UI
│   │   ├── components/     # React components
│   │   └── App.tsx         # Main popup app
│   ├── store/              # Redux store and slices
│   ├── utils/              # Utility functions
│   └── manifest.json       # Extension manifest
├── dist/                   # Built extension files
└── scripts/                # Build scripts
```

### Key Components

#### Content Script (`content/content.ts`)
- Monitors ChatGPT input fields using multiple selectors
- Detects email addresses using comprehensive regex
- Shows alerts and modals when emails are found
- Handles dynamic content changes with MutationObserver

#### Popup UI (`popup/`)
- React-based interface with Redux state management
- Two main tabs: Issues Found and History
- Responsive design with modern styling
- Real-time data synchronization

#### Background Script (`background/background.ts`)
- Handles extension lifecycle events
- Manages storage operations
- Processes messages between components
- Cleans up expired dismissals

#### State Management (`store/`)
- Redux Toolkit for predictable state updates
- TypeScript interfaces for type safety
- Persistent storage integration
- Action creators for all state changes

### Email Detection Algorithm

The extension uses a sophisticated email detection system:

1. **Regex Pattern**: Comprehensive regex that matches RFC 5322 compliant emails
2. **False Positive Filtering**: Removes common false positives like example@example.com
3. **Normalization**: Converts emails to lowercase and trims whitespace
4. **Deduplication**: Removes duplicate emails from the same prompt
5. **Validation**: Additional validation to ensure email format correctness

### Storage System

- **Chrome Storage API**: Uses chrome.storage.local for persistence
- **Data Structure**: Organized storage with separate keys for history and dismissals
- **Cleanup**: Automatic cleanup of expired dismissals
- **Cross-session**: Data persists across browser sessions

## Development

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Modern browser with extension support

### Available Scripts
- `npm run build` - Build for Chrome/Edge
- `npm run build:firefox` - Build for Firefox
- `npm run dev` - Development build with watch mode
- `npm run clean` - Clean dist folder

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- React functional components with hooks
- Redux Toolkit for state management

### Testing
1. Load the extension in development mode
2. Navigate to ChatGPT
3. Test with various email formats
4. Verify popup functionality
5. Test dismissal and history features

## Security Considerations

### Privacy
- **Local Storage Only**: All data stored locally in browser
- **No External Requests**: Extension doesn't send data to external servers
- **User Control**: Users can clear all data at any time

### Email Protection
- **Detection Only**: Extension detects but doesn't block or modify prompts
- **User Choice**: Users decide whether to send prompts with emails
- **Dismissal System**: Prevents alert fatigue for known safe emails

### Permissions
- **Minimal Permissions**: Only requests necessary permissions
- **Specific Domains**: Limited to ChatGPT domains only
- **No Personal Data**: Doesn't access personal browser data

## Browser Compatibility

### Supported Browsers
- **Chrome 88+**: Full support with Manifest V3
- **Edge 88+**: Full support (Chromium-based)
- **Firefox 78+**: Full support with Manifest V2
- **Opera 74+**: Full support (Chromium-based)

### Known Limitations
- Requires JavaScript enabled
- Works only on ChatGPT domains
- Email detection may have false positives/negatives
- Dismissal system resets if extension is reinstalled

## Troubleshooting

### Common Issues

**Extension not detecting emails**
- Ensure you're on a supported ChatGPT domain
- Check that the extension is enabled
- Try refreshing the ChatGPT page
- Verify the extension has necessary permissions

**Popup not opening**
- Check if extension is properly installed
- Try reloading the extension
- Clear browser cache and reload

**Storage issues**
- Clear extension data in browser settings
- Reinstall the extension
- Check browser storage permissions

### Debug Mode
1. Open browser developer tools
2. Go to Console tab
3. Look for "Prompt Monitor Extension" messages
4. Check for any error messages

## Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Guidelines
- Follow existing code style
- Add TypeScript types for new code
- Include error handling
- Update documentation as needed
- Test on multiple browsers

## License

MIT License - see LICENSE file for details

## Support

For issues, feature requests, or questions:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information
4. Include browser version and extension version

## Changelog

### Version 1.0.0
- Initial release
- Email detection in ChatGPT prompts
- React-based popup UI
- Redux state management
- Local storage persistence
- Email dismissal system
- Cross-browser compatibility
- Responsive design
