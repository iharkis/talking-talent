# Testing Strategy & Organization

This document outlines the comprehensive testing strategy and organization structure for the Talking Talent application following industry best practices (2024).

## 🏗️ Test Architecture

### Directory Structure

```
tests/
├── unit/                           # Fast, isolated tests (< 10ms each)
│   ├── components/
│   │   ├── Layout.unit.test.tsx
│   │   └── Dashboard.unit.test.tsx
│   ├── services/
│   │   └── businessAnalystService.unit.test.ts
│   └── utils/
│       ├── date.unit.test.ts
│       ├── validation.unit.test.ts
│       └── storage.unit.test.ts
├── integration/                    # Multi-component workflow tests
│   ├── business-analyst-workflow.integration.test.ts
│   ├── talent-round-workflow.integration.test.ts
│   └── review-workflow.integration.test.ts
├── e2e/                           # Full user journey tests
│   ├── user-management.e2e.test.ts
│   └── dashboard-workflow.e2e.test.ts
└── shared/                        # Common test utilities
    ├── test-setup.ts
    └── test-utils.tsx
```

## 🎯 Testing Pyramid

### Unit Tests (70% of tests)
**Purpose**: Test individual functions, methods, and components in isolation
**Speed**: < 10ms per test
**Coverage**: 95%+ for utility functions, 80%+ for business logic

**Examples**:
- `validateBAData()` function with various inputs
- `formatDate()` with edge cases
- Individual component rendering
- Service method behavior with mocked dependencies

### Integration Tests (20% of tests) 
**Purpose**: Test multiple components working together
**Speed**: 50-200ms per test
**Coverage**: Key business workflows and data flow

**Examples**:
- Complete BA lifecycle (create → update → deactivate)
- Organizational hierarchy management
- Cross-service data consistency
- Error handling across service boundaries

### E2E Tests (10% of tests)
**Purpose**: Test complete user workflows in realistic environment
**Speed**: 1-10 seconds per test
**Coverage**: Critical user paths only

**Examples**:
- User creates BA, assigns to round, completes review
- Dashboard displays correct data after operations
- Navigation and UI interactions

## 🧪 Test Types & Naming

### File Naming Convention
- **Unit**: `ComponentName.unit.test.tsx` / `functionName.unit.test.ts`
- **Integration**: `workflow-name.integration.test.ts`
- **E2E**: `user-journey.e2e.test.ts`

### Test Naming Pattern
```typescript
describe('ComponentName/FunctionName - Unit Tests', () => {
  describe('specific behavior', () => {
    it('should do specific thing when condition', () => {
      // Test implementation
    });
  });
});
```

## 📋 Testing Standards

### Unit Test Structure (AAA Pattern)
```typescript
it('should calculate days until deadline correctly', () => {
  // ARRANGE
  const futureDate = new Date('2025-08-15');
  
  // ACT
  const result = getDaysUntilDeadline(futureDate);
  
  // ASSERT
  expect(result).toBeGreaterThan(0);
});
```

### Mock Strategy by Test Type

#### Unit Tests
- **Heavy Mocking**: All dependencies mocked
- **Isolated**: Each function tested independently
- **Fast**: No real I/O operations

```typescript
vi.mock('../../../src/utils/storage', () => ({
  saveToStorage: vi.fn(),
  loadFromStorage: vi.fn(() => []),
  generateId: vi.fn(() => 'test-id')
}));
```

#### Integration Tests
- **Selective Mocking**: Only external dependencies (API, localStorage)
- **Real Logic**: Business logic runs without mocks
- **Data Flow**: Test interactions between services

```typescript
// Only mock storage, let services interact naturally
vi.mock('../../src/utils/storage', () => ({
  // Storage mocks only
}));
```

#### E2E Tests
- **Minimal Mocking**: Only unavoidable external services
- **Real Environment**: Closest to production conditions
- **User Perspective**: Test from UI interactions

## 🚀 Test Execution

### NPM Scripts
```bash
# Run all tests
npm test

# Run by type
npm run test:unit              # Fast feedback loop
npm run test:integration       # Business logic validation  
npm run test:e2e              # User workflow validation

# Development workflow
npm run test:unit:watch        # TDD development
npm run test:integration:watch # Integration development

# CI/CD workflow
npm run test:run              # All tests once
npm run test:coverage         # With coverage report
```

### Execution Order (CI/CD Pipeline)
1. **Unit Tests** → Fast feedback, fail early
2. **Lint & Type Check** → Code quality gates
3. **Integration Tests** → Business logic validation
4. **Build** → Compilation verification
5. **E2E Tests** → User experience validation

## 📊 Coverage Goals

| Test Type | Coverage Target | Focus Area |
|-----------|----------------|------------|
| **Unit** | 95%+ | Pure functions, business logic |
| **Integration** | 80%+ | Service interactions, workflows |
| **E2E** | 60%+ | Critical user paths |

### Coverage Exclusions
- Configuration files (`*.config.ts`)
- Type definitions (`*.d.ts`)
- Test utilities and mocks
- Third-party library wrappers (minimal logic)

## 🛠️ Testing Tools & Libraries

### Core Testing Stack
- **Vitest**: Fast unit test runner with TypeScript support
- **React Testing Library**: Component testing with user-centric approach
- **jsdom**: DOM simulation for component tests
- **@testing-library/jest-dom**: Enhanced assertions

### Test Utilities
- **Mock Helpers**: Consistent mock data generation
- **Test Constants**: Reusable test data and IDs  
- **Custom Matchers**: Domain-specific assertions
- **Setup Scripts**: Global test configuration

## 🔧 Development Workflow

### TDD Cycle
1. **Red**: Write failing test
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code while keeping tests green

### Adding New Features
1. Start with unit tests for new functions
2. Add integration tests for workflows
3. Add E2E tests for user-facing features
4. Ensure all test types pass before PR

### Debugging Tests
```bash
# Single test file
npm test -- validation.unit.test.ts

# Specific test pattern
npm test -- --grep "should validate email"

# Debug mode with UI
npm run test:ui
```

## 🚨 Quality Gates

### Pre-commit Hooks
- Run unit tests (< 2 seconds)
- Lint and type check
- Prettier formatting

### Pull Request Requirements  
- All tests passing
- Coverage maintained/improved
- Integration tests for new workflows
- E2E tests for user-facing changes

### Production Deployment
- Full test suite passes
- Coverage reports reviewed
- Performance tests (if applicable)
- Manual QA sign-off

## 📈 Metrics & Monitoring

### Test Metrics to Track
- **Test Execution Time**: Unit < 10ms, Integration < 200ms
- **Test Coverage**: By type and overall
- **Test Reliability**: Flaky test identification
- **Test Maintenance**: Updates required per feature

### Performance Benchmarks
- Full test suite: < 30 seconds
- Unit tests only: < 5 seconds  
- Coverage generation: < 10 seconds
- CI/CD pipeline: < 5 minutes

## 🔄 Maintenance Strategy

### Regular Reviews
- **Weekly**: Test execution times and flaky tests
- **Monthly**: Coverage trends and gap analysis  
- **Quarterly**: Test strategy effectiveness review

### Test Hygiene
- Remove obsolete tests with removed features
- Update test data to match current business rules
- Refactor tests when implementation changes
- Keep test documentation current

## 🎓 Best Practices Summary

### ✅ DO
- Write tests before/with implementation (TDD)
- Use descriptive test names explaining behavior
- Test one thing per test case
- Mock external dependencies consistently
- Use shared test utilities for common patterns

### ❌ DON'T  
- Test implementation details
- Create overly complex test setups
- Ignore flaky tests
- Mock what you're testing
- Duplicate test logic across files

This testing strategy provides a solid foundation for maintaining code quality and preventing regressions as the application evolves. Regular review and adaptation of these practices ensures continued effectiveness.