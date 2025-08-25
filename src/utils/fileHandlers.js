import { LOADING_MESSAGES } from '../constants/defaults';
import { generateBoard } from './boardGenerator';
import { checkPerformanceWarnings } from './browserSupport';
import { sanitizePromptsData, uploadRateLimiter } from './sanitization';
import {
  validateAndParseJSON,
  validateFile,
  validatePromptsData,
} from './validation';

/**
 * Handle JSON file upload with comprehensive validation
 * @param {File} file - The uploaded file
 * @param {boolean} includeFreeSpace - Whether to include free space
 * @param {Object} handlers - UI state handlers
 * @returns {Promise<{tiles: Array, promptsData: Object, warnings: Array}>}
 */
export async function handleFileUpload(
  file,
  includeFreeSpace,
  { setLoadingState, showError }
) {
  // Check rate limiting
  if (!uploadRateLimiter.canAttempt()) {
    const remainingTime = Math.ceil(
      uploadRateLimiter.getRemainingTime() / 1000
    );
    throw new Error(
      `Too many upload attempts. Please wait ${remainingTime} seconds before trying again.`
    );
  }

  uploadRateLimiter.recordAttempt();
  setLoadingState(true, LOADING_MESSAGES.PROCESSING_FILE);

  try {
    console.log('Processing file:', file.name);

    // Step 1: Validate file
    validateFile(file);

    // Step 2: Check for performance warnings
    const performanceWarnings = checkPerformanceWarnings(file.size, 0);

    setLoadingState(true, LOADING_MESSAGES.PARSING_PROMPTS);

    // Step 3: Read and parse file
    const fileText = await file.text();
    const parsedData = validateAndParseJSON(fileText);

    // Step 4: Sanitize data
    const sanitizedData = sanitizePromptsData(parsedData);

    // Step 5: Validate prompts structure and content
    const validationResult = validatePromptsData(sanitizedData, {
      includeFreeSpace,
      warnOnDuplicates: true,
    });

    // Step 6: Check for additional performance warnings based on prompt count
    const totalPrompts = Object.values(sanitizedData).reduce(
      (sum, prompts) => sum + prompts.length,
      0
    );
    const additionalWarnings = checkPerformanceWarnings(
      file.size,
      totalPrompts
    );

    setLoadingState(true, LOADING_MESSAGES.GENERATING_BOARD);

    // Step 7: Generate board
    const tiles = generateBoard(sanitizedData, includeFreeSpace);

    console.log('Board generated successfully with', tiles.length, 'tiles');

    return {
      tiles,
      promptsData: sanitizedData,
      warnings: [
        ...performanceWarnings,
        ...additionalWarnings,
        ...validationResult.warnings,
      ],
    };
  } catch (err) {
    console.error('File upload error:', err);

    // Don't show error here - let the calling component handle it
    // This allows for better error display with the ErrorDisplay component
    throw err;
  } finally {
    setLoadingState(false);
  }
}
