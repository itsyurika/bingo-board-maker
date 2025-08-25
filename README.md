# Bingo Board Maker

A modern React application that generates customizable bingo boards from categorized JSON data. Perfect for creating icebreaker activities, team building exercises, or educational games.

## 🌐 Live Demo

**Try it out:** [🎲✨ Bingo Board Maker](https://itsyurika.github.io/bingo-board-maker/)

---

## 🎯 Features

- **Custom Bingo Boards**: Generate 5x5 bingo boards from your own categorized prompts
- **JSON File Upload**: Upload structured JSON files with categorized prompts
- **Free Space Option**: Toggle between including or excluding a free space in the center
- **PDF Export**: Download your generated boards as high-quality PDF files
- **Board Recreation**: Generate new boards with the same prompts for multiple games
- **Header Customization**: Add custom titles and subtitles to your boards
- **Preview Mode**: See a sample board before uploading your data
- **Comprehensive Validation**: Robust error handling and validation for uploaded files
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd bingo-board-maker
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`

## 📋 How to Use

### 1. Prepare Your JSON File

Create a JSON file with categorized prompts. The format should be:

```json
{
  "category1": ["prompt 1", "prompt 2", "prompt 3"],
  "category2": ["prompt 4", "prompt 5", "prompt 6"]
}
```

**Requirements:**

- At least 24 prompts total (25 if not using free space)
- Maximum 50 categories
- Maximum 1000 total prompts
- Each prompt: 3-200 characters
- Category names: 1-50 characters
- File size: Maximum 1MB

### 2. Upload Your File

1. Click the "Upload JSON File" button
2. Select your prepared JSON file
3. The app will validate your file and generate a bingo board

### 3. Customize Your Board

- **Header**: Add a custom title and subtitle
- **Free Space**: Toggle whether to include a free space in the center
- **Recreate**: Generate a new board with the same prompts

### 4. Export Your Board

Click "Download PDF" to save your bingo board as a PDF file.

## 📁 JSON File Examples

### Icebreaker Bingo

```json
{
  "Personal": [
    "has traveled to more than 5 countries",
    "speaks more than 2 languages",
    "has run a marathon",
    "owns more than 3 pets",
    "can play a musical instrument"
  ],
  "Work": [
    "has worked here for over 5 years",
    "has given a presentation to executives",
    "leads a team of more than 10 people",
    "has won an award at work",
    "has mentored someone"
  ],
  "Hobbies": [
    "knows how to juggle",
    "has met a celebrity",
    "can solve a Rubik's cube",
    "has climbed a mountain",
    "knows sign language"
  ]
}
```

### Educational Bingo

```json
{
  "Science": [
    "can name all planets in our solar system",
    "knows what DNA stands for",
    "has conducted a science experiment",
    "can explain photosynthesis",
    "knows the chemical formula for water"
  ],
  "History": [
    "can name 3 US presidents",
    "knows when World War II ended",
    "has visited a historical site",
    "can name the first moon landing year",
    "knows what the Declaration of Independence is"
  ]
}
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Project Structure

```
src/
├── components/          # React components
│   ├── BingoBoard.jsx  # Main board display
│   ├── BingoTile.jsx   # Individual tile component
│   ├── Controls.jsx    # Upload and control panel
│   └── ErrorDisplay.jsx # Error handling component
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
│   ├── boardGenerator.js    # Board generation logic
│   ├── fileHandlers.js      # File upload handling
│   ├── pdfHandlers.js       # PDF export functionality
│   └── validation.js        # Data validation
├── data/               # Sample data and constants
└── styles/             # CSS modules
```

## 🔧 Technical Details

- **Framework**: React 19 with Vite
- **Styling**: CSS Modules
- **PDF Generation**: jsPDF with html2canvas
- **Testing**: Vitest with React Testing Library
- **Linting**: ESLint with React-specific rules

## 🐛 Troubleshooting

### Common Issues

1. **"File too large"**: Ensure your JSON file is under 1MB
2. **"Insufficient prompts"**: Make sure you have at least 24 prompts total
3. **"Invalid JSON"**: Check that your JSON syntax is correct
4. **PDF download fails**: Try refreshing the page and generating the board again

### Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Happy Bingo Making! 🎲**
