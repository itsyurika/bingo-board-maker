import { describe, it, expect, vi } from 'vitest'
import { generateBoard, generateBoardFromFile } from '../boardGenerator.js'

describe('boardGenerator', () => {
  const mockPrompts = {
    personal: [
      'has traveled abroad',
      'speaks multiple languages',
      'owns a pet',
      'plays a sport',
      'can cook well'
    ],
    work: [
      'has led a team',
      'has given presentations',
      'works remotely',
      'has changed careers',
      'has a certification'
    ],
    hobbies: [
      'plays an instrument',
      'enjoys reading',
      'likes gardening',
      'collects something',
      'does crafts',
      'loves photography',
      'plays video games',
      'enjoys hiking',
      'watches movies',
      'listens to podcasts',
      'plays board games',
      'does puzzles',
      'enjoys dancing',
      'likes cooking',
      'practices martial arts'
    ]
  }

  describe('generateBoard', () => {
    it('should generate a board with 25 tiles including free space by default', () => {
      const board = generateBoard(mockPrompts)
      
      expect(board).toHaveLength(25)
      expect(board).toContain('FREE_SPACE')
      
      // Should have exactly 1 free space and 24 prompts
      const freeSpaceCount = board.filter(tile => tile === 'FREE_SPACE').length
      const promptCount = board.filter(tile => tile !== 'FREE_SPACE').length
      
      expect(freeSpaceCount).toBe(1)
      expect(promptCount).toBe(24)
    })

    it('should generate a board with 25 prompts when includeFreeSpace is false', () => {
      const board = generateBoard(mockPrompts, false)
      
      expect(board).toHaveLength(25)
      expect(board).not.toContain('FREE_SPACE')
      
      // All tiles should contain prompts
      const promptCount = board.filter(tile => tile !== 'FREE_SPACE' && tile !== '').length
      expect(promptCount).toBe(25)
    })

    it('should generate different boards on multiple calls (randomization)', () => {
      const board1 = generateBoard(mockPrompts)
      const board2 = generateBoard(mockPrompts)
      
      // Boards should be different (very unlikely to be identical with proper randomization)
      expect(board1).not.toEqual(board2)
    })

    it('should include prompts from all categories', () => {
      const board = generateBoard(mockPrompts)
      const prompts = board.filter(tile => tile !== 'FREE_SPACE')
      
      // Check that we have prompts from each category
      const hasPersonalPrompt = prompts.some(prompt => 
        mockPrompts.personal.includes(prompt)
      )
      const hasWorkPrompt = prompts.some(prompt => 
        mockPrompts.work.includes(prompt)
      )
      const hasHobbyPrompt = prompts.some(prompt => 
        mockPrompts.hobbies.includes(prompt)
      )
      
      expect(hasPersonalPrompt).toBe(true)
      expect(hasWorkPrompt).toBe(true)
      expect(hasHobbyPrompt).toBe(true)
    })

    it('should handle categories with different sizes', () => {
      const unevenPrompts = {
        small: ['prompt1', 'prompt2'],
        large: Array.from({ length: 20 }, (_, i) => `large_prompt_${i + 1}`)
      }
      
      const board = generateBoard(unevenPrompts)
      
      expect(board).toHaveLength(25)
      expect(board).toContain('FREE_SPACE')
      
      const prompts = board.filter(tile => tile !== 'FREE_SPACE')
      expect(prompts).toHaveLength(24)
    })

    it('should not include duplicate prompts', () => {
      const board = generateBoard(mockPrompts)
      const prompts = board.filter(tile => tile !== 'FREE_SPACE')
      const uniquePrompts = [...new Set(prompts)]
      
      expect(prompts.length).toBe(uniquePrompts.length)
    })

    describe('error handling', () => {
      it('should throw error for invalid input (not an object)', () => {
        expect(() => generateBoard(null)).toThrow('Invalid JSON: Must be an object with categories')
        expect(() => generateBoard('invalid')).toThrow('Invalid JSON: Must be an object with categories')
        expect(() => generateBoard(123)).toThrow('Invalid JSON: Must be an object with categories')
      })

      it('should throw error for empty categories object', () => {
        expect(() => generateBoard({})).toThrow('Invalid JSON: Must contain at least one category')
      })

      it('should throw error for non-array category values', () => {
        const invalidPrompts = {
          personal: 'not an array',
          work: ['valid prompt']
        }
        
        expect(() => generateBoard(invalidPrompts)).toThrow('Invalid JSON: Category "personal" must be an array')
      })

      it('should throw error for empty category arrays', () => {
        const invalidPrompts = {
          personal: [],
          work: ['valid prompt']
        }
        
        expect(() => generateBoard(invalidPrompts)).toThrow('Invalid JSON: Category "personal" cannot be empty')
      })

      it('should throw error for insufficient total prompts', () => {
        const insufficientPrompts = {
          small: ['prompt1', 'prompt2']
        }
        
        expect(() => generateBoard(insufficientPrompts)).toThrow('Insufficient prompts: Need at least 24 prompts total, found 2')
      })
    })

    describe('edge cases', () => {
      it('should handle exactly 24 prompts with free space', () => {
        const exactPrompts = {
          category: Array.from({ length: 24 }, (_, i) => `prompt_${i + 1}`)
        }
        
        const board = generateBoard(exactPrompts, true)
        
        expect(board).toHaveLength(25)
        expect(board).toContain('FREE_SPACE')
        
        const prompts = board.filter(tile => tile !== 'FREE_SPACE')
        expect(prompts).toHaveLength(24)
      })

      it('should handle exactly 25 prompts without free space', () => {
        const exactPrompts = {
          category: Array.from({ length: 25 }, (_, i) => `prompt_${i + 1}`)
        }
        
        const board = generateBoard(exactPrompts, false)
        
        expect(board).toHaveLength(25)
        expect(board).not.toContain('FREE_SPACE')
        
        const uniquePrompts = [...new Set(board)]
        expect(uniquePrompts).toHaveLength(25)
      })

      it('should handle more prompts than needed', () => {
        const manyPrompts = {
          category1: Array.from({ length: 30 }, (_, i) => `cat1_prompt_${i + 1}`),
          category2: Array.from({ length: 25 }, (_, i) => `cat2_prompt_${i + 1}`)
        }
        
        const board = generateBoard(manyPrompts)
        
        expect(board).toHaveLength(25)
        expect(board).toContain('FREE_SPACE')
        
        const prompts = board.filter(tile => tile !== 'FREE_SPACE')
        expect(prompts).toHaveLength(24)
      })
    })
  })

  describe('generateBoardFromFile', () => {
    it('should successfully generate board from valid JSON file with free space', async () => {
      const mockFile = new File([JSON.stringify(mockPrompts)], 'test.json', {
        type: 'application/json'
      })

      const board = await generateBoardFromFile(mockFile, true)
      
      expect(board).toHaveLength(25)
      expect(board).toContain('FREE_SPACE')
    })

    it('should successfully generate board from valid JSON file without free space', async () => {
      const mockFile = new File([JSON.stringify(mockPrompts)], 'test.json', {
        type: 'application/json'
      })

      const board = await generateBoardFromFile(mockFile, false)
      
      expect(board).toHaveLength(25)
      expect(board).not.toContain('FREE_SPACE')
    })

    it('should throw error for invalid JSON syntax', async () => {
      const mockFile = new File(['{ invalid json }'], 'test.json', {
        type: 'application/json'
      })

      await expect(generateBoardFromFile(mockFile)).rejects.toThrow('Invalid JSON file: Please check file format and try again')
    })

    it('should throw validation error for invalid prompts structure', async () => {
      const invalidPrompts = { personal: 'not an array' }
      const mockFile = new File([JSON.stringify(invalidPrompts)], 'test.json', {
        type: 'application/json'
      })

      await expect(generateBoardFromFile(mockFile)).rejects.toThrow('Invalid JSON: Category "personal" must be an array')
    })

    it('should handle file reading errors', async () => {
      // Mock a file that fails to read
      const mockFile = {
        text: vi.fn().mockRejectedValue(new Error('File reading failed'))
      }

      await expect(generateBoardFromFile(mockFile)).rejects.toThrow('File reading failed')
    })
  })

  describe('distribution logic', () => {
    it('should distribute prompts fairly across categories', () => {
      const testPrompts = {
        cat1: Array.from({ length: 10 }, (_, i) => `cat1_${i}`),
        cat2: Array.from({ length: 10 }, (_, i) => `cat2_${i}`),
        cat3: Array.from({ length: 10 }, (_, i) => `cat3_${i}`)
      }

      const board = generateBoard(testPrompts)
      const prompts = board.filter(tile => tile !== 'FREE_SPACE')

      // Count prompts from each category
      const cat1Count = prompts.filter(p => p.startsWith('cat1_')).length
      const cat2Count = prompts.filter(p => p.startsWith('cat2_')).length
      const cat3Count = prompts.filter(p => p.startsWith('cat3_')).length

      // Should be roughly equal distribution (24 prompts / 3 categories = 8 each)
      expect(cat1Count).toBe(8)
      expect(cat2Count).toBe(8)
      expect(cat3Count).toBe(8)
    })

    it('should handle remainder distribution correctly', () => {
      const testPrompts = {
        cat1: Array.from({ length: 10 }, (_, i) => `cat1_${i}`),
        cat2: Array.from({ length: 10 }, (_, i) => `cat2_${i}`)
      }

      const board = generateBoard(testPrompts)
      const prompts = board.filter(tile => tile !== 'FREE_SPACE')

      // 24 prompts / 2 categories = 12 each
      const cat1Count = prompts.filter(p => p.startsWith('cat1_')).length
      const cat2Count = prompts.filter(p => p.startsWith('cat2_')).length

      expect(cat1Count).toBe(12)
      expect(cat2Count).toBe(12)
    })
  })
})