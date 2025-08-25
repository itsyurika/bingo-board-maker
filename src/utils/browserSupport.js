/**
 * Browser compatibility and feature detection utilities
 */

import { ValidationError } from './validation'

/**
 * Check if current browser supports required features
 * @returns {Object} Support information
 */
export function checkBrowserSupport() {
  const support = {
    fileReader: typeof FileReader !== 'undefined',
    canvas: !!document.createElement('canvas').getContext,
    webgl: false,
    localStorage: false,
    fetch: typeof fetch === 'function',
    promises: typeof Promise !== 'undefined',
    es6: false,
    modules: false
  }

  // Check WebGL support
  try {
    const canvas = document.createElement('canvas')
    support.webgl = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch (e) {
    support.webgl = false
  }

  // Check localStorage
  try {
    localStorage.setItem('test', 'test')
    localStorage.removeItem('test')
    support.localStorage = true
  } catch (e) {
    support.localStorage = false
  }

  // Check ES6 support
  try {
    eval('const test = () => {}; [1,2,3].map(x => x * 2);')
    support.es6 = true
  } catch (e) {
    support.es6 = false
  }

  // Check module support
  support.modules = 'noModule' in HTMLScriptElement.prototype

  return support
}

/**
 * Validate browser compatibility for the application
 * @throws {ValidationError} If browser is not supported
 */
export function validateBrowserCompatibility() {
  const support = checkBrowserSupport()
  const issues = []

  if (!support.fileReader) {
    issues.push('FileReader API is not supported')
  }

  if (!support.canvas) {
    issues.push('HTML5 Canvas is not supported')
  }

  if (!support.fetch) {
    issues.push('Fetch API is not supported')
  }

  if (!support.promises) {
    issues.push('Promises are not supported')
  }

  if (!support.es6) {
    issues.push('ES6 features are not supported')
  }

  if (issues.length > 0) {
    throw new ValidationError(
      'Browser not supported',
      'BROWSER_NOT_SUPPORTED',
      {
        issues,
        supportedBrowsers: [
          'Chrome 60+',
          'Firefox 55+',
          'Safari 12+',
          'Edge 79+'
        ],
        suggestion: 'Please update your browser or use a modern browser'
      }
    )
  }
}

/**
 * Get browser information
 * @returns {Object} Browser details
 */
export function getBrowserInfo() {
  const ua = navigator.userAgent
  const browser = {
    name: 'Unknown',
    version: 'Unknown',
    engine: 'Unknown'
  }

  // Detect browser
  if (ua.includes('Chrome') && !ua.includes('Edge')) {
    browser.name = 'Chrome'
    browser.version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown'
  } else if (ua.includes('Firefox')) {
    browser.name = 'Firefox'
    browser.version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown'
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser.name = 'Safari'
    browser.version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown'
  } else if (ua.includes('Edge')) {
    browser.name = 'Edge'
    browser.version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown'
  }

  // Detect engine
  if (ua.includes('WebKit')) {
    browser.engine = 'WebKit'
  } else if (ua.includes('Gecko')) {
    browser.engine = 'Gecko'
  } else if (ua.includes('Trident')) {
    browser.engine = 'Trident'
  }

  return browser
}

/**
 * Check if PDF generation is supported
 * @returns {boolean} Whether PDF generation is supported
 */
export function isPdfGenerationSupported() {
  const support = checkBrowserSupport()
  
  // PDF generation requires Canvas and FileReader
  return support.canvas && support.fileReader
}

/**
 * Check memory constraints for large operations
 * @returns {Object} Memory information
 */
export function checkMemoryConstraints() {
  const memory = {
    available: false,
    used: 0,
    total: 0,
    limit: 0
  }

  // Check if memory API is available
  if ('memory' in performance) {
    const mem = performance.memory
    memory.available = true
    memory.used = mem.usedJSHeapSize
    memory.total = mem.totalJSHeapSize
    memory.limit = mem.jsHeapSizeLimit
  }

  return memory
}

/**
 * Warn user about potential performance issues
 * @param {number} fileSize - File size in bytes
 * @param {number} promptCount - Number of prompts
 * @returns {Array} Array of warnings
 */
export function checkPerformanceWarnings(fileSize = 0, promptCount = 0) {
  const warnings = []
  const memory = checkMemoryConstraints()

  // Large file warning
  if (fileSize > 500 * 1024) { // 500KB
    warnings.push({
      type: 'LARGE_FILE',
      message: 'Large file detected',
      details: `File size: ${(fileSize / 1024).toFixed(2)} KB`,
      suggestion: 'Processing may take longer than usual'
    })
  }

  // Many prompts warning
  if (promptCount > 500) {
    warnings.push({
      type: 'MANY_PROMPTS',
      message: 'Large number of prompts',
      details: `${promptCount} prompts detected`,
      suggestion: 'Consider reducing the number of prompts for better performance'
    })
  }

  // Memory warning
  if (memory.available && memory.used > memory.limit * 0.8) {
    warnings.push({
      type: 'HIGH_MEMORY_USAGE',
      message: 'High memory usage detected',
      details: `Using ${Math.round(memory.used / 1024 / 1024)}MB of ${Math.round(memory.limit / 1024 / 1024)}MB`,
      suggestion: 'Close other tabs or applications to free up memory'
    })
  }

  return warnings
}

/**
 * Initialize browser support checking
 * @returns {Object} Initialization result
 */
export function initializeBrowserSupport() {
  try {
    validateBrowserCompatibility()
    
    return {
      supported: true,
      browser: getBrowserInfo(),
      support: checkBrowserSupport(),
      warnings: []
    }
  } catch (error) {
    return {
      supported: false,
      error,
      browser: getBrowserInfo(),
      support: checkBrowserSupport(),
      warnings: []
    }
  }
}