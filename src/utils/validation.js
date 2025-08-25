/**
 * Comprehensive validation utilities for bingo board data
 */

// Constants for validation
export const VALIDATION_LIMITS = {
  MIN_PROMPTS: 24,
  MAX_PROMPTS: 1000,
  MAX_CATEGORIES: 50,
  MIN_CATEGORIES: 1,
  MAX_PROMPT_LENGTH: 200,
  MIN_PROMPT_LENGTH: 3,
  MAX_CATEGORY_NAME_LENGTH: 50,
  MAX_FILE_SIZE: 1024 * 1024 // 1MB
}

export class ValidationError extends Error {
  constructor(message, code, details = {}) {
    super(message)
    this.name = 'ValidationError'
    this.code = code
    this.details = details
  }
}

/**
 * Validate file before processing
 * @param {File} file - File to validate
 * @throws {ValidationError} If file is invalid
 */
export function validateFile(file) {
  if (!file) {
    throw new ValidationError(
      'No file selected', 
      'NO_FILE',
      { suggestion: 'Please select a JSON file to upload' }
    )
  }

  // Check file extension
  if (!file.name.toLowerCase().endsWith('.json')) {
    throw new ValidationError(
      'Invalid file type', 
      'INVALID_FILE_TYPE',
      { 
        fileName: file.name,
        expectedType: '.json',
        suggestion: 'Please select a JSON file (.json extension)'
      }
    )
  }

  // Check file size
  if (file.size > VALIDATION_LIMITS.MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
    throw new ValidationError(
      `File too large (${sizeMB}MB)`, 
      'FILE_TOO_LARGE',
      { 
        fileSize: file.size,
        maxSize: VALIDATION_LIMITS.MAX_FILE_SIZE,
        suggestion: 'Please use a file smaller than 1MB'
      }
    )
  }

  // Check for empty file
  if (file.size === 0) {
    throw new ValidationError(
      'File is empty', 
      'EMPTY_FILE',
      { suggestion: 'Please select a file that contains JSON data' }
    )
  }
}

/**
 * Validate JSON string before parsing
 * @param {string} jsonString - JSON string to validate
 * @throws {ValidationError} If JSON is invalid
 * @returns {Object} Parsed JSON data
 */
export function validateAndParseJSON(jsonString) {
  if (!jsonString || typeof jsonString !== 'string') {
    throw new ValidationError(
      'File content is empty or invalid', 
      'EMPTY_CONTENT',
      { suggestion: 'Please check that your file contains valid JSON data' }
    )
  }

  if (jsonString.trim().length === 0) {
    throw new ValidationError(
      'File contains only whitespace', 
      'WHITESPACE_ONLY',
      { suggestion: 'Please check that your file contains valid JSON data' }
    )
  }

  let parsedData
  try {
    parsedData = JSON.parse(jsonString)
  } catch (error) {
    throw new ValidationError(
      'Invalid JSON format', 
      'INVALID_JSON',
      { 
        originalError: error.message,
        suggestion: 'Please check your JSON syntax using a JSON validator'
      }
    )
  }

  return parsedData
}

/**
 * Validate the structure and content of prompts data
 * @param {Object} data - Parsed JSON data
 * @throws {ValidationError} If data structure is invalid
 */
export function validatePromptsStructure(data) {
  // Check if data is an object
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ValidationError(
      'Invalid JSON structure', 
      'INVALID_STRUCTURE',
      { 
        expectedStructure: 'Object with category names as keys and arrays of prompts as values',
        receivedType: Array.isArray(data) ? 'array' : typeof data,
        suggestion: 'JSON should be an object like: {"category1": ["prompt1", "prompt2"]}'
      }
    )
  }

  const categories = Object.keys(data)
  
  // Check number of categories
  if (categories.length === 0) {
    throw new ValidationError(
      'No categories found', 
      'NO_CATEGORIES',
      { 
        suggestion: 'JSON must contain at least one category with prompts'
      }
    )
  }

  if (categories.length > VALIDATION_LIMITS.MAX_CATEGORIES) {
    throw new ValidationError(
      `Too many categories (${categories.length})`, 
      'TOO_MANY_CATEGORIES',
      { 
        categoryCount: categories.length,
        maxCategories: VALIDATION_LIMITS.MAX_CATEGORIES,
        suggestion: `Please reduce the number of categories to ${VALIDATION_LIMITS.MAX_CATEGORIES} or fewer`
      }
    )
  }

  let totalPrompts = 0
  const categoryIssues = []
  const promptIssues = []

  // Validate each category
  categories.forEach(category => {
    // Validate category name
    if (typeof category !== 'string' || category.trim() === '') {
      categoryIssues.push({
        category,
        issue: 'Category name is empty or invalid'
      })
      return
    }

    if (category.length > VALIDATION_LIMITS.MAX_CATEGORY_NAME_LENGTH) {
      categoryIssues.push({
        category,
        issue: `Category name too long (${category.length} characters)`
      })
    }

    // Validate category value is array
    if (!Array.isArray(data[category])) {
      categoryIssues.push({
        category,
        issue: 'Category must contain an array of prompts',
        receivedType: typeof data[category]
      })
      return
    }

    const prompts = data[category]

    // Check for empty categories
    if (prompts.length === 0) {
      categoryIssues.push({
        category,
        issue: 'Category contains no prompts'
      })
      return
    }

    // Validate individual prompts
    prompts.forEach((prompt, index) => {
      if (typeof prompt !== 'string') {
        promptIssues.push({
          category,
          index,
          prompt,
          issue: 'Prompt must be a string',
          receivedType: typeof prompt
        })
      } else if (prompt.trim() === '') {
        promptIssues.push({
          category,
          index,
          prompt,
          issue: 'Prompt is empty or contains only whitespace'
        })
      } else if (prompt.length < VALIDATION_LIMITS.MIN_PROMPT_LENGTH) {
        promptIssues.push({
          category,
          index,
          prompt,
          issue: `Prompt too short (${prompt.length} characters)`
        })
      } else if (prompt.length > VALIDATION_LIMITS.MAX_PROMPT_LENGTH) {
        promptIssues.push({
          category,
          index,
          prompt: prompt.substring(0, 50) + '...',
          issue: `Prompt too long (${prompt.length} characters)`
        })
      }
    })

    totalPrompts += prompts.length
  })

  // Report category issues
  if (categoryIssues.length > 0) {
    throw new ValidationError(
      `Found ${categoryIssues.length} category issue(s)`, 
      'CATEGORY_ISSUES',
      { 
        issues: categoryIssues,
        suggestion: 'Please fix the category issues and try again'
      }
    )
  }

  // Report prompt issues
  if (promptIssues.length > 0) {
    throw new ValidationError(
      `Found ${promptIssues.length} prompt issue(s)`, 
      'PROMPT_ISSUES',
      { 
        issues: promptIssues.slice(0, 10), // Show first 10 issues
        totalIssues: promptIssues.length,
        suggestion: 'Please fix the prompt issues and try again'
      }
    )
  }

  // Check total number of prompts
  if (totalPrompts < VALIDATION_LIMITS.MIN_PROMPTS) {
    throw new ValidationError(
      `Insufficient prompts (${totalPrompts})`, 
      'INSUFFICIENT_PROMPTS',
      { 
        totalPrompts,
        minRequired: VALIDATION_LIMITS.MIN_PROMPTS,
        categoriesFound: categories.length,
        suggestion: `You need at least ${VALIDATION_LIMITS.MIN_PROMPTS} prompts total. Add more prompts to existing categories or create new ones.`
      }
    )
  }

  if (totalPrompts > VALIDATION_LIMITS.MAX_PROMPTS) {
    throw new ValidationError(
      `Too many prompts (${totalPrompts})`, 
      'TOO_MANY_PROMPTS',
      { 
        totalPrompts,
        maxAllowed: VALIDATION_LIMITS.MAX_PROMPTS,
        suggestion: `Please reduce the total number of prompts to ${VALIDATION_LIMITS.MAX_PROMPTS} or fewer`
      }
    )
  }
}

/**
 * Check for duplicate prompts across all categories
 * @param {Object} data - Validated prompts data
 * @returns {Array} Array of duplicate prompts found
 */
export function findDuplicatePrompts(data) {
  const allPrompts = []
  const duplicates = []
  const promptMap = new Map()

  Object.keys(data).forEach(category => {
    data[category].forEach(prompt => {
      const normalizedPrompt = prompt.trim().toLowerCase()
      
      if (promptMap.has(normalizedPrompt)) {
        const existing = promptMap.get(normalizedPrompt)
        duplicates.push({
          prompt,
          categories: [existing.category, category],
          normalizedPrompt
        })
      } else {
        promptMap.set(normalizedPrompt, { category, prompt })
      }
    })
  })

  return duplicates
}

/**
 * Comprehensive validation function for prompts data
 * @param {Object} data - Data to validate
 * @param {Object} options - Validation options
 * @throws {ValidationError} If validation fails
 * @returns {Object} Validation results and warnings
 */
export function validatePromptsData(data, options = {}) {
  const { 
    allowDuplicates = true, 
    warnOnDuplicates = true,
    includeFreeSpace = true 
  } = options

  // Basic structure validation
  validatePromptsStructure(data)

  const results = {
    isValid: true,
    warnings: [],
    info: {
      categories: Object.keys(data).length,
      totalPrompts: Object.values(data).reduce((sum, prompts) => sum + prompts.length, 0),
      averagePromptsPerCategory: 0
    }
  }

  results.info.averagePromptsPerCategory = Math.round(
    results.info.totalPrompts / results.info.categories
  )

  // Check for duplicates
  if (warnOnDuplicates || !allowDuplicates) {
    const duplicates = findDuplicatePrompts(data)
    
    if (duplicates.length > 0) {
      if (!allowDuplicates) {
        throw new ValidationError(
          `Found ${duplicates.length} duplicate prompt(s)`, 
          'DUPLICATE_PROMPTS',
          { 
            duplicates: duplicates.slice(0, 5),
            totalDuplicates: duplicates.length,
            suggestion: 'Please remove or modify duplicate prompts'
          }
        )
      } else {
        results.warnings.push({
          type: 'DUPLICATE_PROMPTS',
          message: `Found ${duplicates.length} duplicate prompt(s)`,
          details: duplicates.slice(0, 3),
          suggestion: 'Consider removing duplicates for better variety'
        })
      }
    }
  }

  // Check prompt distribution
  const promptsNeeded = includeFreeSpace ? 24 : 25
  const categories = Object.keys(data)
  const idealPromptsPerCategory = Math.ceil(promptsNeeded / categories.length)
  
  let hasImbalancedCategories = false
  categories.forEach(category => {
    const promptCount = data[category].length
    if (promptCount < idealPromptsPerCategory && results.info.totalPrompts > promptsNeeded) {
      hasImbalancedCategories = true
    }
  })

  if (hasImbalancedCategories) {
    results.warnings.push({
      type: 'IMBALANCED_CATEGORIES',
      message: 'Some categories have very few prompts',
      suggestion: 'Consider redistributing prompts for better balance'
    })
  }

  return results
}