import "@testing-library/jest-dom";

// Mock fetch globally
global.fetch = jest.fn();

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
}));

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

