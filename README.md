# Fuzzy NEWS-2 Electron App

A desktop application for the Fuzzy NEWS-2 system, providing a user-friendly interface for calculating and managing National Early Warning Score 2 (NEWS-2) assessments using fuzzy logic.

![alt text]([https://github.com/Troy-Kettle/fuzzy_news2_app/tree/59da07d852a34076d61e9febc0fe26efa0eb1394/imgs/logo.png)

## Features

- Connect to the Fuzzy NEWS-2 API
- Calculate NEWS-2 scores using fuzzy logic
- View patient history and statistics
- Track assessment trends over time
- Visualize vital signs and scores
- Dark/light theme support
- Persistent settings and recent patients

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Electron

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fuzzy-news2-electron.git
cd fuzzy-news2-electron
```![Screenshot from 2025-04-10 16-39-37](https://github.com/user-attachments/assets/370b7351-98e9-4fba-b743-545004d08250)


2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the application:
```bash
npm start![Screenshot from 2025-04-10 16-39-37](https://github.com/user-attachments/assets/2251136a-873f-4f5a-8f88-283a30bb2811)
![Screenshot from 2025-04-10 16-39-37](https://github.com/user-attachments/assets/58300d7f-8317-4a18-9949-80169a2d70ae)

# or
yarn start
```

For development with developer tools:
```bash
npm run dev
# or
yarn dev
```

## Building the Application

To build the application for distribution:

```bash
# For all platforms
npm run build

# For Windows
npm run build:win

# For macOS
npm run build:mac

# For Linux
npm run build:linux
```

The built applications will be available in the `dist` directory.

## API Connection

The application connects to the Fuzzy NEWS-2 API. By default, it connects to `http://localhost:8000`, but this can be changed in the application settings.

### API Endpoints Used

- `GET /api/health`: Check API connection
- `POST /api/calculate`: Calculate NEWS-2 score
- `GET /api/history/{patient_id}`: Get patient history
- `GET /api/statistics/{patient_id}`: Get patient statistics

## Configuration

Application settings are stored in the user's application data directory using Electron's `electron-store` package. This includes:

- API URL
- Theme preference
- Window size
- Recent patients list

## Development

### Project Structure

```
fuzzy-news2-electron/
├── main.js               # Electron main process
├── preload.js            # Preload script for secure IPC
├── renderer.js           # Main renderer process script
├── index.html            # Main application window
├── styles/               # CSS styles
├── src/                  # Source code
│   ├── api.js            # API communication
│   ├── chart-utils.js    # Chart utilities
│   ├── news2-calculator.js # Client-side NEWS-2 calculator
│   └── utils.js          # General utilities
├── assets/               # Static assets
└── package.json          # Project configuration
```

### Adding Features

When adding new features:

1. Update the main process (`main.js`) if needed for new IPC handlers
2. Add any new utility functions to the appropriate module
3. Update the renderer process (`renderer.js`) for UI interactions
4. Add any new HTML to `index.html` and CSS to `styles/main.css`

## License

MIT License - See LICENSE file for details.

## Credits

This application is designed to work with the Fuzzy NEWS-2 API, a fuzzy logic implementation of the National Early Warning Score 2 (NEWS-2) system.
