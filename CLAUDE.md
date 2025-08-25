# CLAUDE.md - Bingo Board Maker

This file provides development guidance for the Bingo Board Maker React application.

## Core Development Philosophy

### KISS (Keep It Simple, Stupid)

Simplicity should be a key goal in design. Choose straightforward solutions over complex ones whenever possible. Simple solutions are easier to understand, maintain, and debug.

### YAGNI (You Aren't Gonna Need It)

Avoid building functionality on speculation. Implement features only when they are needed, not when you anticipate they might be useful in the future.

### Design Principles

- **Dependency Inversion**: High-level modules should not depend on low-level modules. Both should depend on abstractions.
- **Open/Closed Principle**: Software entities should be open for extension but closed for modification.
- **Single Responsibility**: Each function, class, and module should have one clear purpose.
- **Fail Fast**: Check for potential errors early and handle them immediately when issues occur.

## 🧱 Code Structure & Modularity

### File and Function Limits

- **Never create a file longer than 500 lines of code**. If approaching this limit, refactor by splitting into modules.
- **Functions should be under 50 lines** with a single, clear responsibility.
- **Classes should be under 100 lines** and represent a single concept or entity.
- **Components should be under 200 lines** and focus on a single UI concern.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Line length should be max 100 characters** (ESLint rule in .eslintrc.js)
- **Use pnpm** for package management and always run commands with `pnpm` prefix.

### Project Architecture

Bingo Board Maker React application structure:

```
/src
    /assets
        free-space.svg          # Optional icon for free space
    /components
        BingoBoard.jsx          # 5x5 grid component
        BingoTile.jsx           # Individual tile component
        Header.jsx              # Static title/subtitle component
        Controls.jsx            # File upload, recreate, download controls
        __tests__/
            BingoBoard.test.jsx
            BingoTile.test.jsx
            Header.test.jsx
            Controls.test.jsx
    /utils
        boardGenerator.js       # Core logic for board generation
        pdfExport.js           # PDF generation utilities
        __tests__/
            boardGenerator.test.js
            pdfExport.test.js
    /styles
        App.module.css
        BingoBoard.module.css
        BingoTile.module.css
        Header.module.css
        Controls.module.css
    App.jsx                     # Main application component
    index.css                   # Global styles
    main.jsx                    # Application entry point
```

## 🛠️ Development Environment

### Bingo Board Maker Setup

Create React application using Vite and install required dependencies:

```bash
# Create new React project with Vite
npm create vite@latest bingo-board-maker -- --template react
cd bingo-board-maker

# Install PDF generation dependencies
npm install jspdf html2canvas

# Install development dependencies for testing
npm install -D @testing-library/react @testing-library/jest-dom vitest

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Required Dependencies

**Core Dependencies:**

- `react` - UI framework
- `react-dom` - React DOM rendering
- `jspdf` - PDF generation
- `html2canvas` - Screenshot HTML elements

**Development Dependencies:**

- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - Additional Jest matchers
- `vitest` - Testing framework

### Development Commands

```bash
# Run all tests
pnpm test

# Run specific tests with verbose output
pnpm test -- --verbose src/features/user-management/__tests__/UserList.test.tsx

# Run tests with coverage
pnpm test -- --coverage

# Run tests in watch mode
pnpm test:watch

# Format code
pnpm format

# Check linting
pnpm lint

# Fix linting issues automatically
pnpm lint:fix

# Type checking
pnpm type-check

# Build for production
pnpm build

# Start development server
pnpm dev

# Run pre-commit hooks
pnpm pre-commit
```

## 📋 Style & Conventions

### TypeScript Style Guide

- **Follow ESLint and Prettier** configuration in `.eslintrc.js` and `.prettierrc`
- **Always use strict TypeScript** (`"strict": true` in tsconfig.json)
- **Use double quotes for strings**
- **Use trailing commas in multi-line structures**
- **Always use type annotations** for function parameters and return types
- **Use `interface` for object shapes, `type` for unions and intersections**
- **Prefer `const` over `let`, avoid `var`**

### JSDoc Standards

Use JSDoc comments for all public functions, classes, and modules:

````typescript
/**
 * Calculate the discounted price for a product.
 *
 * @param price - Original price of the product
 * @param discountPercent - Discount percentage (0-100)
 * @param minAmount - Minimum allowed final price
 * @returns Final price after applying discount
 * @throws {Error} If discountPercent is not between 0 and 100
 * @throws {Error} If final price would be below minAmount
 *
 * @example
 * ```typescript
 * const finalPrice = calculateDiscount(100, 20);
 * console.log(finalPrice); // 80
 * ```
 */
function calculateDiscount(
  price: number,
  discountPercent: number,
  minAmount: number = 0.01
): number {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Discount percent must be between 0 and 100');
  }

  const finalPrice = price * (1 - discountPercent / 100);

  if (finalPrice < minAmount) {
    throw new Error(
      `Final price ${finalPrice} is below minimum amount ${minAmount}`
    );
  }

  return Math.round(finalPrice * 100) / 100;
}
````

### Naming Conventions

- **Variables and functions**: `camelCase`
- **Classes and interfaces**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Private methods/properties**: `_leadingUnderscore`
- **Type aliases**: `PascalCase`
- **Enum values**: `UPPER_SNAKE_CASE`
- **React components**: `PascalCase`
- **React hooks**: `use` prefix with `camelCase`
- **Files**: `kebab-case` for components, `camelCase` for utilities

### Import Organization

Group imports logically: third-party → internal → local.

```typescript
// Third-party modules first
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { z } from 'zod';

// Internal modules second
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/userService';

// Local modules last
import './UserForm.css';
```

## 🔄 Git Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `test/*` - Test additions or fixes

### Commit Message Format

Never include claude code, or written by claude code in commit messages

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore

Example:

```
feat(auth): add two-factor authentication

- Implement TOTP generation and validation
- Add QR code generation for authenticator apps
- Update user model with 2FA fields

Closes #123
```

## 🔍 Search Command Requirements

**CRITICAL**: Always use `rg` (ripgrep) instead of traditional `grep` and `find` commands:

```bash
# ❌ Don't use grep
grep -r "pattern" .

# ✅ Use rg instead
rg "pattern"

# ❌ Don't use find with name
find . -name "*.ts"

# ✅ Use rg with file filtering
rg --files | rg "\.ts$"
# or
rg --files -g "*.ts"
```

**Enforcement Rules:**

```
(
    r"^grep\b(?!.*\|)",
    "Use 'rg' (ripgrep) instead of 'grep' for better performance and features",
),
(
    r"^find\s+\S+\s+-name\b",
    "Use 'rg --files | rg pattern' or 'rg --files -g pattern' instead of 'find -name' for better performance",
),
```

## 🚀 GitHub Flow Workflow Summary

main (protected) ←── PR ←── feature/your-feature
↓ ↑
deploy development

### Daily Workflow:

1. git checkout main && git pull origin main
2. git checkout -b feature/new-feature
3. Make changes + tests
4. git push origin feature/new-feature
5. Create PR → Review → Merge to main

## Version Control

- Whenever code changes are made, you must record a one-line description in `.commit_message.txt` with Edit Tool. If the file doesn't already exist, create it.
  - Read `.commit_message.txt` first, and then Edit.
  - Overwrite regardless of existing content.
  - If it was a git revert related operation, make the .commit_message.txt file empty.

## ⚠️ Important Notes

- **NEVER ASSUME OR GUESS** - When in doubt, ask for clarification
- **Always verify file paths and module names** before use
- **Keep CLAUDE.md updated** when adding new patterns or dependencies
- **Test your code** - No feature is complete without tests
- **Document your decisions** - Future developers (including yourself) will thank you
- **Use TypeScript strict mode** - It catches many potential issues
- **Prefer functional components** over class components
- **Use React hooks** for state management and side effects

---

## 🎯 Bingo Board Maker Implementation Steps

### Step 1: Project Initialization ✅

1. Create React project using Vite
2. Install required dependencies (jsPDF, html2canvas)
3. Set up project structure according to architecture above
4. Configure testing environment with Vitest

### Step 2: Core Components Development

**Priority: High - Foundation components**

#### 2.1 Header Component (`src/components/Header.jsx`)

- Static component displaying:
  - Main title: "2025 Priceline Summer Party"
  - Subtitle: "Find someone who..."
  - Instructions: "Write the matching person's name. You can only use the same person twice!"
- No props required
- Simple CSS styling for typography

#### 2.2 BingoTile Component (`src/components/BingoTile.jsx`)

- **Props:** `text` (string), `isFreeSpace` (boolean)
- Renders individual bingo square
- Special styling for "Free Space" center tile
- Sufficient padding for handwritten names
- Minimum height for consistent grid layout

#### 2.3 BingoBoard Component (`src/components/BingoBoard.jsx`)

- **Props:** `tiles` (array of 25 strings), `boardRef` (React ref)
- CSS Grid layout: `grid-template-columns: repeat(5, 1fr)`
- Maps over tiles array to render BingoTile components
- Attached ref for PDF screenshot capability

#### 2.4 Controls Component (`src/components/Controls.jsx`)

- **Props:** `onFileUpload`, `onRecreate`, `onDownloadPdf`, `boardIsReady`
- File input for JSON upload (accept=".json")
- "Recreate" button for new board generation
- "Download PDF" button for export
- Proper disabled states based on app state

### Step 3: Core Logic Implementation

**Priority: High - Business logic**

#### 3.1 Board Generation Utility (`src/utils/boardGenerator.js`)

```javascript
/**
 * Generate bingo board from JSON prompts
 * @param {Object} prompts - Categorized prompts from JSON
 * @returns {string[]} Array of 25 tiles (24 prompts + 1 free space)
 */
function generateBoard(prompts) {
  // 1. Extract categories from JSON structure
  // 2. Calculate prompts per category (24 total / number of categories)
  // 3. Randomly select prompts from each category
  // 4. Shuffle combined prompts array
  // 5. Insert "Free Space" at index 12 (center)
  // 6. Return 25-item array
}
```

#### 3.2 PDF Export Utility (`src/utils/pdfExport.js`)

```javascript
/**
 * Export bingo board to PDF
 * @param {HTMLElement} boardElement - DOM element to screenshot
 * @param {string} filename - PDF filename
 */
async function exportToPdf(boardElement, filename) {
  // 1. Use html2canvas to capture board element
  // 2. Convert canvas to image data
  // 3. Initialize jsPDF in portrait mode
  // 4. Calculate dimensions for A4 page
  // 5. Add image to PDF and trigger download
}
```

### Step 4: Main App Integration

**Priority: High - State management and coordination**

#### 4.1 App Component State (`src/App.jsx`)

```javascript
const [prompts, setPrompts] = useState(null); // JSON data
const [boardTiles, setBoardTiles] = useState([]); // Current board
const boardRef = useRef(null); // PDF export ref
```

#### 4.2 App Component Functions

- `handleFileUpload(file)` - Parse JSON, validate structure, generate initial board
- `handleRecreate()` - Generate new board with same prompts
- `handleDownloadPdf()` - Export current board to PDF

### Step 5: Styling Implementation

**Priority: Medium - Visual polish**

#### 5.1 CSS Modules Structure

- `App.module.css` - Main layout and container styles
- `BingoBoard.module.css` - Grid layout, responsive design
- `BingoTile.module.css` - Tile styling, typography, spacing
- `Header.module.css` - Title and instruction styling
- `Controls.module.css` - Button and input styling

#### 5.2 Design Requirements

- **Responsive Design:** Works on desktop and tablet
- **Print-Friendly:** Clean, high-contrast styling for PDF export
- **Accessibility:** Proper color contrast, focus states
- **Typography:** Clear, readable fonts with adequate spacing

### Step 6: Testing Implementation

**Priority: Medium - Quality assurance**

#### 6.1 Unit Tests

- `boardGenerator.test.js` - Test board generation logic
- `pdfExport.test.js` - Test PDF functionality (with mocks)
- Component tests for all React components

#### 6.2 Integration Tests

- File upload workflow
- Board generation and recreation
- PDF export process

### Step 7: Error Handling & Validation

**Priority: Medium - Robustness**

#### 7.1 JSON Validation

- Verify file is valid JSON
- Check required structure (categories with prompt arrays)
- Display helpful error messages for invalid files

#### 7.2 Edge Cases

- Empty categories
- Insufficient prompts (< 24 total)
- Large prompt text handling
- Network/browser compatibility issues

### Step 8: Performance Optimization

**Priority: Low - Polish**

#### 8.1 Optimizations

- Memoize board generation for same prompts
- Lazy load PDF generation libraries
- Optimize bundle size for deployment

#### 8.2 Deployment Preparation

- Build optimization
- Static hosting setup (Netlify/Vercel/GitHub Pages)
- Environment configuration

### JSON File Format Expected

```json
{
  "personal": [
    "has traveled to more than 5 countries",
    "speaks more than 2 languages",
    "has run a marathon"
  ],
  "company": [
    "has worked here for over 5 years",
    "has given a presentation to executives",
    "leads a team of more than 10 people"
  ],
  "random": [
    "owns more than 3 pets",
    "can play a musical instrument",
    "has appeared on TV"
  ]
}
```

### Development Priority Order

1. **Setup & Core Components** (Steps 1-2)
2. **Business Logic** (Step 3)
3. **Main App Integration** (Step 4)
4. **Basic Styling** (Step 5)
5. **Testing** (Step 6)
6. **Error Handling** (Step 7)
7. **Optimization** (Step 8)

---

_This document is a living guide. Update it as the project evolves and new patterns emerge._
