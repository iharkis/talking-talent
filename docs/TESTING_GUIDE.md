# Testing Guide

This document provides comprehensive information about the testing framework implemented for the Talking Talent application.

## Testing Stack

- **Testing Framework**: Vitest (fast unit test framework)
- **React Testing**: @testing-library/react
- **DOM Testing Utilities**: @testing-library/jest-dom
- **User Interaction Testing**: @testing-library/user-event
- **Test Environment**: jsdom (DOM simulation)

## Test Structure

The test framework covers multiple layers of the application:

### 1. Unit Tests
- **Utility Functions** (`src/utils/*.test.ts`)
  - Date formatting and calculations
  - Validation functions
  - Storage operations
  - Helper utilities

### 2. Service Layer Tests
- **Business Logic** (`src/services/*.test.ts`)
  - Business Analyst Service
  - Talent Round Service
  - Review Service
  - Data Export Service

### 3. Component Tests
- **UI Components** (`src/components/*.test.tsx`)
  - Dashboard component
  - Layout component
  - Form components
  - Navigation components

### 4. Integration Tests
- **End-to-End Workflows** (`src/test/integration.test.tsx`)
  - Complete business analyst management workflow
  - Talent round lifecycle
  - Review creation and management
  - Cross-service data consistency

## Running Tests

### Basic Commands

```bash
# Run all tests in watch mode (development)
npm test

# Run all tests once and exit
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with UI interface
npm run test:ui

# Run tests in watch mode with file watching
npm run test:watch
```

### Test Filtering

```bash
# Run specific test file
npm test -- validation.test.ts

# Run tests matching pattern
npm test -- --grep "Business Analyst"

# Run tests in specific directory
npm test -- src/utils/
```

## Test Configuration

### Main Configuration
- **Config File**: `vitest.config.ts`
- **Setup File**: `src/test/setup.ts`
- **Test Utilities**: `src/test/test-utils.tsx`

### Key Features
- **Globals**: `describe`, `it`, `expect` are available globally
- **Environment**: jsdom for DOM simulation
- **Mocking**: Built-in vi.mock() for service and module mocking
- **Coverage**: v8 provider with multiple report formats
- **Time Mocking**: Consistent date/time for reproducible tests

## Test Patterns

### 1. Service Testing Pattern

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock dependencies
vi.mock('../utils/storage', () => ({
  saveToStorage: vi.fn(),
  loadFromStorage: vi.fn(() => []),
  generateId: vi.fn(() => 'test-id')
}));

describe('ServiceName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset service state
  });

  it('should perform expected behavior', () => {
    // Test implementation
  });
});
```

### 2. Component Testing Pattern

```typescript
import { render, screen, fireEvent } from '../test/test-utils';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', () => {
    render(<ComponentName />);
    fireEvent.click(screen.getByRole('button'));
    // Assert expected behavior
  });
});
```

### 3. Integration Testing Pattern

```typescript
describe('Workflow Name', () => {
  it('should complete full workflow', () => {
    // 1. Setup data
    // 2. Perform actions
    // 3. Verify results
    // 4. Test data consistency across services
  });
});
```

## Test Coverage Goals

The testing framework aims for comprehensive coverage:

- **Utilities**: 100% coverage (pure functions)
- **Services**: 95%+ coverage (business logic)
- **Components**: 80%+ coverage (UI behavior)
- **Integration**: Key workflows covered

### Coverage Reports

Coverage reports are generated in multiple formats:
- **Text**: Console output
- **JSON**: Machine-readable data
- **HTML**: Interactive browser report

## Mock Strategies

### 1. Service Mocking
Services are mocked at the module level to isolate units under test:

```typescript
vi.mock('../services/businessAnalystService', () => ({
  businessAnalystService: {
    getAll: vi.fn(() => []),
    create: vi.fn()
  }
}));
```

### 2. Storage Mocking
localStorage is mocked globally in setup.ts:

```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
```

### 3. Date Mocking
Consistent date/time for reproducible tests:

```typescript
const mockDate = new Date('2024-08-10T10:00:00.000Z');
vi.setSystemTime(mockDate);
```

## Test Data Helpers

Located in `src/test/test-utils.tsx`:

- `createMockBA()`: Creates mock Business Analyst
- `createMockRound()`: Creates mock Talent Round  
- `createMockReview()`: Creates mock Review
- Custom render function with providers

## Debugging Tests

### VS Code Integration
- Use VS Code Vitest extension
- Set breakpoints in test files
- Debug individual tests

### Console Debugging
```typescript
it('should debug issue', () => {
  const result = someFunction();
  console.log('Debug output:', result);
  // screen.debug(); // For React components
});
```

### Test Isolation
Each test runs in isolation:
- Fresh service instances
- Clean localStorage
- Reset date/time
- Cleared mocks

## Best Practices

### 1. Test Organization
- Group related tests with `describe`
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mock Management
- Clear mocks in `beforeEach`
- Mock at appropriate level
- Verify mock calls when needed

### 3. Assertions
- Use specific matchers
- Test both happy path and error cases
- Verify side effects

### 4. Async Testing
```typescript
it('should handle async operations', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expected);
});
```

## Continuous Integration

Tests are designed to run in CI environments:
- No external dependencies
- Consistent timing with mocked dates
- Deterministic random data via mocked generateId
- Clean setup/teardown

## Troubleshooting

### Common Issues

1. **Tests timing out**: Check for unresolved promises
2. **Mock not working**: Ensure correct import path
3. **DOM not available**: Verify jsdom environment
4. **Date inconsistency**: Use mocked time in setup

### Performance

- Tests run in parallel by default
- Use `vi.mock()` for expensive operations
- Avoid real network calls
- Keep test data minimal

## Future Enhancements

Potential improvements:
- Visual regression testing
- E2E testing with Playwright
- Performance testing
- Accessibility testing
- API contract testing

This testing framework provides a solid foundation for maintaining code quality and preventing regressions as the application evolves.