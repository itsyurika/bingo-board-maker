import '@testing-library/jest-dom'

// Mock ResizeObserver which is not available in jsdom
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver which is not available in jsdom
global.IntersectionObserver = class IntersectionObserver {
  constructor(cb) {
    this.cb = cb
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock URL.createObjectURL for file handling tests
global.URL.createObjectURL = vi.fn(() => 'mocked-object-url')
global.URL.revokeObjectURL = vi.fn()

// Mock FileReader for file upload tests
global.FileReader = class FileReader {
  constructor() {
    this.readAsText = vi.fn()
    this.onload = null
    this.onerror = null
    this.result = null
  }
}

// Canvas mock for html2canvas
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({ data: new Array(4) })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({ data: new Array(4) })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
}))

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mocked-data-url')