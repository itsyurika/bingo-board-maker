/**
 * Default values and constants used throughout the application
 */

export const DEFAULT_HEADER_TEXT = {
  title: "🌞 2025 Priceline Summer Party 🏖️",
  instructions: "You can use the same person only twice and can't use your own name! ✨",
  subtitle: "🔍 Find someone who..."
}

export const INITIAL_BOARD_STATS = {
  totalPrompts: 0,
  categories: [],
  generatedAt: null,
  version: 1
}

export const FILE_CONSTRAINTS = {
  MAX_SIZE: 1024 * 1024, // 1MB
  ALLOWED_EXTENSION: '.json'
}

export const MESSAGE_DISPLAY_DURATION = 5000 // 5 seconds

export const LOADING_MESSAGES = {
  PROCESSING_FILE: 'Processing JSON file...',
  PARSING_PROMPTS: 'Parsing prompts...',
  GENERATING_BOARD: 'Generating bingo board...',
  RECREATING_BOARD: 'Generating new board...',
  PREPARING_PDF: 'Preparing PDF export...',
  CAPTURING_IMAGE: 'Capturing board image...',
  GENERATING_PDF: 'Generating PDF...'
}