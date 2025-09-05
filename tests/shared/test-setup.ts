import '@testing-library/jest-dom';
import { beforeEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock Date.now for consistent testing with UTC timezone
process.env.TZ = 'UTC';
const mockDate = new Date('2024-08-10T10:00:00.000Z');
vi.setSystemTime(mockDate);

// Global console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Filter out known test warnings/errors
console.error = (...args) => {
  const message = args.join(' ');
  
  // Filter out expected error messages from tests
  if (
    message.includes('Failed to save to localStorage') ||
    message.includes('Failed to load from localStorage') ||
    message.includes('Storage quota exceeded') ||
    message.includes('localStorage unavailable')
  ) {
    return; // Suppress expected error logs in unit tests
  }
  
  originalConsoleError(...args);
};

console.warn = (...args) => {
  const message = args.join(' ');
  
  // Filter out React testing warnings we can't easily fix
  if (
    message.includes('Warning: ReactDOM.render is no longer supported') ||
    message.includes('Warning: An invalid form control')
  ) {
    return;
  }
  
  originalConsoleWarn(...args);
};

// Clear all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
  
  // Reset DOM
  document.body.innerHTML = '';
  
  // Reset any global state
  if (typeof window !== 'undefined') {
    // Reset location if mocked
    if (window.location && typeof window.location === 'object') {
      Object.defineProperty(window.location, 'pathname', {
        value: '/',
        writable: true,
      });
    }
  }
});