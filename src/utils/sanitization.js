/**
 * Input sanitization and security utilities
 */

/**
 * Sanitize text input to prevent XSS and other security issues
 * @param {string} text - Text to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized text
 */
export function sanitizeText(text, options = {}) {
  if (typeof text !== 'string') {
    return ''
  }

  const {
    maxLength = 200,
    allowEmojis = true,
    allowBasicFormatting = false,
    trimWhitespace = true
  } = options

  let sanitized = text

  // Trim whitespace
  if (trimWhitespace) {
    sanitized = sanitized.trim()
  }

  // Remove or escape HTML tags
  sanitized = sanitized.replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>'"&]/g, (char) => {
    switch (char) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '"': return '&quot;'
      case "'": return '&#x27;'
      case '&': return '&amp;'
      default: return char
    }
  })

  // Remove control characters (except common whitespace)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // Handle emojis
  if (!allowEmojis) {
    // Remove emojis (basic regex, not comprehensive)
    sanitized = sanitized.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
  }

  // Handle basic formatting
  if (!allowBasicFormatting) {
    // Remove markdown-like formatting
    sanitized = sanitized.replace(/[*_`~]/g, '')
  }

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength).trim()
    // Ensure we don't cut in the middle of a word
    const lastSpace = sanitized.lastIndexOf(' ')
    if (lastSpace > maxLength * 0.8) { // Only if the last space is reasonably close to the end
      sanitized = sanitized.substring(0, lastSpace)
    }
  }

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ')

  return sanitized
}

/**
 * Sanitize category name
 * @param {string} category - Category name to sanitize
 * @returns {string} Sanitized category name
 */
export function sanitizeCategoryName(category) {
  return sanitizeText(category, {
    maxLength: 50,
    allowEmojis: true,
    allowBasicFormatting: false,
    trimWhitespace: true
  })
}

/**
 * Sanitize prompt text
 * @param {string} prompt - Prompt text to sanitize
 * @returns {string} Sanitized prompt text
 */
export function sanitizePromptText(prompt) {
  return sanitizeText(prompt, {
    maxLength: 200,
    allowEmojis: true,
    allowBasicFormatting: false,
    trimWhitespace: true
  })
}

/**
 * Deep sanitize prompts data object
 * @param {Object} data - Prompts data to sanitize
 * @returns {Object} Sanitized prompts data
 */
export function sanitizePromptsData(data) {
  if (!data || typeof data !== 'object') {
    return {}
  }

  const sanitizedData = {}

  Object.keys(data).forEach(category => {
    const sanitizedCategory = sanitizeCategoryName(category)
    
    if (sanitizedCategory && Array.isArray(data[category])) {
      sanitizedData[sanitizedCategory] = data[category]
        .map(prompt => sanitizePromptText(prompt))
        .filter(prompt => prompt && prompt.length >= 3) // Remove empty or too short prompts
    }
  })

  return sanitizedData
}

/**
 * Validate and sanitize header text
 * @param {Object} headerText - Header text object
 * @returns {Object} Sanitized header text
 */
export function sanitizeHeaderText(headerText) {
  const defaultHeader = {
    title: "🌞 2025 Priceline Summer Party 🏖️",
    instructions: "You can use the same person only twice and can't use your own name! ✨",
    subtitle: "🔍 Find someone who..."
  }

  if (!headerText || typeof headerText !== 'object') {
    return defaultHeader
  }

  return {
    title: sanitizeText(headerText.title || defaultHeader.title, { maxLength: 100 }),
    instructions: sanitizeText(headerText.instructions || defaultHeader.instructions, { maxLength: 200 }),
    subtitle: sanitizeText(headerText.subtitle || defaultHeader.subtitle, { maxLength: 100 })
  }
}

/**
 * Check for potentially malicious content
 * @param {string} text - Text to check
 * @returns {Array} Array of security warnings
 */
export function checkSecurityWarnings(text) {
  const warnings = []
  
  if (typeof text !== 'string') {
    return warnings
  }

  // Check for script injection attempts
  if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(text)) {
    warnings.push({
      type: 'SCRIPT_INJECTION',
      message: 'Script tag detected',
      suggestion: 'Remove script tags from your content'
    })
  }

  // Check for HTML injection
  if (/<[^>]+>/g.test(text)) {
    warnings.push({
      type: 'HTML_INJECTION',
      message: 'HTML tags detected',
      suggestion: 'HTML tags will be escaped for security'
    })
  }

  // Check for URL-like strings that might be suspicious
  if (/https?:\/\/[^\s]+/g.test(text)) {
    warnings.push({
      type: 'SUSPICIOUS_URL',
      message: 'URLs detected in content',
      suggestion: 'URLs in prompts may not display properly'
    })
  }

  // Check for excessive special characters
  const specialCharCount = (text.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length
  if (specialCharCount > text.length * 0.3) {
    warnings.push({
      type: 'EXCESSIVE_SPECIAL_CHARS',
      message: 'Many special characters detected',
      suggestion: 'Consider simplifying the text'
    })
  }

  return warnings
}

/**
 * Sanitize filename for safe usage
 * @param {string} filename - Filename to sanitize
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (typeof filename !== 'string') {
    return 'bingo-board'
  }

  let sanitized = filename
    // Remove file extension if present
    .replace(/\.[^/.]+$/, '')
    // Replace unsafe characters with dashes
    .replace(/[^a-zA-Z0-9\-_.]/g, '-')
    // Remove multiple consecutive dashes
    .replace(/-+/g, '-')
    // Remove leading/trailing dashes
    .replace(/^-+|-+$/g, '')
    // Limit length
    .substring(0, 50)

  // Ensure we have a valid filename
  if (!sanitized || sanitized.length < 1) {
    sanitized = 'bingo-board'
  }

  return sanitized
}

/**
 * Rate limiting for file uploads
 */
class RateLimiter {
  constructor(maxAttempts = 10, timeWindow = 60000) { // 10 attempts per minute
    this.maxAttempts = maxAttempts
    this.timeWindow = timeWindow
    this.attempts = []
  }

  canAttempt() {
    const now = Date.now()
    // Remove old attempts outside time window
    this.attempts = this.attempts.filter(time => now - time < this.timeWindow)
    
    return this.attempts.length < this.maxAttempts
  }

  recordAttempt() {
    this.attempts.push(Date.now())
  }

  getRemainingTime() {
    if (this.attempts.length === 0) return 0
    
    const oldestAttempt = Math.min(...this.attempts)
    const timeRemaining = this.timeWindow - (Date.now() - oldestAttempt)
    
    return Math.max(0, timeRemaining)
  }
}

export const uploadRateLimiter = new RateLimiter()

/**
 * Comprehensive input validation and sanitization
 * @param {any} input - Input to validate and sanitize
 * @param {string} type - Type of input ('file', 'prompts', 'header', 'text')
 * @returns {Object} Validation and sanitization result
 */
export function validateAndSanitizeInput(input, type) {
  const result = {
    isValid: true,
    sanitized: input,
    warnings: [],
    errors: []
  }

  try {
    switch (type) {
      case 'prompts':
        result.sanitized = sanitizePromptsData(input)
        break
        
      case 'header':
        result.sanitized = sanitizeHeaderText(input)
        break
        
      case 'text':
        result.sanitized = sanitizeText(input)
        result.warnings = checkSecurityWarnings(input)
        break
        
      case 'filename':
        result.sanitized = sanitizeFilename(input)
        break
        
      default:
        result.warnings.push({
          type: 'UNKNOWN_INPUT_TYPE',
          message: `Unknown input type: ${type}`
        })
    }
  } catch (error) {
    result.isValid = false
    result.errors.push({
      type: 'SANITIZATION_ERROR',
      message: 'Failed to sanitize input',
      details: error.message
    })
  }

  return result
}