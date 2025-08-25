/**
 * Sample tiles data for preview board
 * Used when no JSON file has been uploaded yet
 */

export const baseSampleTiles = [
  'has traveled to more than 5 countries',
  'speaks more than 2 languages',
  'has run a marathon',
  'owns more than 3 pets',
  'can play a musical instrument',
  'has appeared on TV',
  'has worked here for over 5 years',
  'has given a presentation to executives',
  'leads a team of more than 10 people',
  'has been skydiving',
  'knows how to juggle',
  'has met a celebrity',
  'can speak 3+ languages',
  'has been to all 7 continents',
  'plays in a band',
  'has written a book',
  'can solve a Rubik\'s cube',
  'has climbed a mountain',
  'knows sign language',
  'has been on a cruise',
  'can cook without recipes',
  'has won a contest',
  'has been in a movie',
  'can do a backflip',
  'has a pet cat',
  'has won a contest or competition'
]

/**
 * Generate sample tiles based on Free Space setting
 * @param {boolean} includeFreeSpace - Whether to include free space
 * @returns {string[]} Array of 25 tiles
 */
export function generateSampleTiles(includeFreeSpace = true) {
  if (includeFreeSpace) {
    // Insert FREE_SPACE at center (index 12) and use 24 prompts
    const tiles = Array(25).fill('')
    let promptIndex = 0
    for (let i = 0; i < 25; i++) {
      if (i === 12) {
        tiles[i] = 'FREE_SPACE'
      } else {
        tiles[i] = baseSampleTiles[promptIndex]
        promptIndex++
      }
    }
    return tiles
  } else {
    // Use all 25 prompts, no free space
    return baseSampleTiles.slice(0, 25)
  }
}