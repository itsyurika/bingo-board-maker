# Bingo Board Maker: Development Plan

## 1. Project Overview

The goal is to create a client-side web application that allows a user to upload a JSON file containing categorized prompts. The application will use these prompts to generate a 5x5 bingo board. The user will be able to randomize the board and download it as a printable PDF file.

### Key Features:

- **JSON File Upload**: Users can upload a `.json` file with prompts.
- **Dynamic Bingo Board Generation**: Creates a 5x5 grid populated with prompts.
- **Even Prompt Distribution**: Prompts are pulled evenly from all categories found in the JSON file.
- **Static Content**: The board will have a fixed title ("2025 Priceline Summer Party"), subtitle ("Find someone who..."), and instructions.
- **Randomization**: A "Recreate" button to generate a new board with different prompts.
- **PDF Export**: A "Download PDF" button to save the generated bingo board for printing.
- **Layout**: Each bingo tile will have sufficient space for a person to write a name. The center tile will be a "Free Space".

## 2. Recommended Tech Stack

This project can be built entirely on the client-side, which simplifies development and hosting.

- **Frontend Framework**: React. We'll use the Vite build tool for a fast and modern development environment.
- **PDF Generation**: A combination of `html2canvas` and `jsPDF`. This combination allows us to "screenshot" the HTML version of our board and place it into a PDF, ensuring the output looks exactly like the screen.
- **Styling**: Plain CSS Modules. This will keep styling simple and scoped to individual components without adding extra dependencies.
- **Deployment**: Any static site hosting service like Netlify, Vercel, or GitHub Pages.

## 3. Development Steps

Here is a step-by-step guide to building the application.

### Step 1: Project Setup

Create a new React Project using Vite:

```bash
npm create vite@latest bingo-board-maker -- --template react
cd bingo-board-maker
```

**Install Dependencies:**
Install the libraries needed for PDF generation.

```bash
npm install jspdf html2canvas
```

**Start the Development Server:**

```bash
npm run dev
```

### Step 2: Application File Structure

Create the following file structure inside the `/src` directory to organize the code logically.

```
/src
|-- /assets
|   |-- free-space.svg // An icon for the free space (optional)
|-- /components
|   |-- BingoBoard.jsx
|   |-- BingoTile.jsx
|   |-- Header.jsx
|   |-- Controls.jsx
|-- App.jsx
|-- index.css
```

### Step 3: Implement Core Logic & Components

#### App.jsx (Main Component)

This component will manage the application's state and overall layout.

**State Management (useState):**

- `prompts`: Stores the parsed JSON data from the uploaded file.
- `boardTiles`: An array of 25 strings representing the prompts for the current bingo board.

**Functions:**

- `handleFileUpload(file)`: Reads the uploaded JSON file, parses it, and stores the data in the prompts state. After parsing, it should immediately call `generateBoard` to create the first board.

- `generateBoard()`: This is the core function.
  - Check if prompts data exists.
  - Determine the categories available (e.g., personal, random, company).
  - Calculate how many prompts to select from each category to get a total of 24 (since the 25th tile is a free space). For 3 categories, that's 8 each.
  - For each category, shuffle the array of prompts and take the required number from the top.
  - Combine the selected prompts from all categories into a single array.
  - Shuffle this final array of 24 prompts to ensure random placement on the board.
  - Insert a "Free Space" marker at the center index (12).
  - Update the `boardTiles` state with this new 25-item array.

**Rendering:**

- Renders the Header, Controls, and BingoBoard components.
- Passes the necessary functions and state down as props (e.g., `generateBoard` to Controls, `boardTiles` to BingoBoard).

#### Header.jsx

A simple component to display the static titles.

**Props:** None.

**Content:**

```html
<h1>2025 Priceline Summer Party</h1>
<h2>Find someone who...</h2>
<p>Write the matching person's name. You can only use the same person twice!</p>
```

#### Controls.jsx

This component will contain the user controls for file upload, randomization, and downloading.

**Props:** `onFileUpload`, `onRecreate`, `onDownloadPdf`, `boardIsReady` (a boolean to enable/disable buttons).

**Elements:**

- **File Input**: An `<input type="file" accept=".json">` to handle the upload. Its `onChange` event will trigger `onFileUpload`.
- **Recreate Button**: A `<button>` that calls the `onRecreate` function when clicked. This button should be disabled if no board has been generated yet.
- **Download Button**: A `<button>` that calls `onDownloadPdf`. Also disabled if no board exists.

#### BingoBoard.jsx

This component is responsible for rendering the 5x5 grid.

**Props:** `tiles` (the boardTiles array), `boardRef` (a React ref to the DOM element for the PDF screenshot).

**Logic:**

- Uses CSS Grid (`grid-template-columns: repeat(5, 1fr)`) to create the 5x5 layout.
- Maps over the `tiles` prop array and renders a `BingoTile` component for each item.
- The entire component should be wrapped in a `div` that has the ref attached.

#### BingoTile.jsx

This component displays a single prompt.

**Props:** `text` (the prompt string).

**Logic:**

- If `text` is "Free Space", it can render special styling or an icon.
- Otherwise, it renders the text.

**Styling:** The CSS for this component must ensure there is enough vertical space inside the tile for the prompt text and empty space below for handwriting. Use padding and a minimum height.

### Step 4: Implement PDF Export Functionality

In `App.jsx`, create the PDF download handler.

**Function:** `handleDownloadPdf()`

1. Create a ref using `useRef()` and attach it to the BingoBoard's main div.
2. Check if the `ref.current` element exists.
3. Use `html2canvas(ref.current)` to get a canvas snapshot of the board.
4. The promise returned by `html2canvas` will yield a canvas object.
5. Inside the `.then()`, convert the canvas to a PNG image: `const imgData = canvas.toDataURL('image/png');`
6. Initialize jsPDF: `const pdf = new jsPDF('p', 'mm', 'a4');` ('p' for portrait).
7. Calculate the image dimensions to fit nicely on the A4 page.
8. Add the image to the PDF: `pdf.addImage(imgData, 'PNG', 10, 10, width, height);`
9. Trigger the download: `pdf.save('Priceline-Summer-Party-Bingo.pdf');`
