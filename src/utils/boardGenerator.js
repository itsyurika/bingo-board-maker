/**
 * Board Generation Utility
 * Handles creating randomized bingo boards from categorized JSON prompts
 */

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} New shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Validate JSON structure for required format
 * @param {Object} data - Parsed JSON data
 * @throws {Error} If data structure is invalid
 */
function validatePromptsData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid JSON: Must be an object with categories')
  }

  const categories = Object.keys(data)
  if (categories.length === 0) {
    throw new Error('Invalid JSON: Must contain at least one category')
  }

  let totalPrompts = 0
  categories.forEach(category => {
    if (!Array.isArray(data[category])) {
      throw new Error(`Invalid JSON: Category "${category}" must be an array`)
    }
    if (data[category].length === 0) {
      throw new Error(`Invalid JSON: Category "${category}" cannot be empty`)
    }
    totalPrompts += data[category].length
  })

  if (totalPrompts < 24) {
    throw new Error(`Insufficient prompts: Need at least 24 prompts total, found ${totalPrompts}`)
  }
}

/**
 * Generate bingo board from JSON prompts
 * @param {Object} prompts - Categorized prompts from JSON
 * @returns {string[]} Array of 25 tiles (24 prompts + 1 free space)
 * @throws {Error} If prompts data is invalid
 * 
 * @example
 * const prompts = {
 *   personal: ['has traveled abroad', 'speaks multiple languages'],
 *   work: ['has led a team', 'has given presentations'],
 *   hobbies: ['plays an instrument', 'enjoys cooking']
 * }
 * const board = generateBoard(prompts)
 * // Returns array of 25 strings with 'FREE_SPACE' at index 12
 */
export function generateBoard(prompts) {
  // Validate input data
  validatePromptsData(prompts)

  // Extract categories and calculate distribution
  const categories = Object.keys(prompts)
  const totalCategories = categories.length
  const promptsPerCategory = Math.floor(24 / totalCategories)
  const remainderPrompts = 24 % totalCategories

  const selectedPrompts = []

  // Select prompts from each category
  categories.forEach((category, index) => {
    const categoryPrompts = prompts[category]
    const shuffledCategory = shuffleArray(categoryPrompts)
    
    // Calculate how many prompts to take from this category
    let promptsToTake = promptsPerCategory
    if (index < remainderPrompts) {
      promptsToTake += 1 // Distribute remainder prompts to first few categories
    }

    // Ensure we don't take more prompts than available in category
    const actualPromptsToTake = Math.min(promptsToTake, shuffledCategory.length)
    
    // Add selected prompts to our collection
    selectedPrompts.push(...shuffledCategory.slice(0, actualPromptsToTake))
  })

  // If we still need more prompts (edge case), fill from random categories
  while (selectedPrompts.length < 24) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    const availablePrompts = prompts[randomCategory].filter(
      prompt => !selectedPrompts.includes(prompt)
    )
    
    if (availablePrompts.length > 0) {
      const randomPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)]
      selectedPrompts.push(randomPrompt)
    }
  }

  // Trim to exactly 24 if we somehow got more
  const finalPrompts = selectedPrompts.slice(0, 24)

  // Shuffle the final prompts for random board placement
  const shuffledPrompts = shuffleArray(finalPrompts)

  // Create 25-item array with free space at center (index 12)
  const boardTiles = Array(25).fill('')
  
  // Fill positions 0-11 and 13-24, leaving 12 for free space
  let promptIndex = 0
  for (let i = 0; i < 25; i++) {
    if (i === 12) {
      boardTiles[i] = 'FREE_SPACE' // Special marker for free space
    } else {
      boardTiles[i] = shuffledPrompts[promptIndex]
      promptIndex++
    }
  }

  return boardTiles
}

/**
 * Parse JSON file and generate board
 * @param {File} file - JSON file from file input
 * @returns {Promise<string[]>} Promise resolving to board tiles array
 * @throws {Error} If file parsing or board generation fails
 */
export async function generateBoardFromFile(file) {
  try {
    const fileText = await file.text()
    const promptsData = JSON.parse(fileText)
    return generateBoard(promptsData)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON file: Please check file format and try again')
    }
    throw error // Re-throw validation errors as-is
  }
}