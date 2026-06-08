import "@testing-library/jest-dom";
import { jest } from "@jest/globals";

// Mock window.matchMedia (required for Radix UI components in jsdom)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver (not available in jsdom)
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock pointer capture methods for Radix UI
HTMLElement.prototype.setPointerCapture = jest.fn() as unknown as (
  pointerId: number,
) => void;
HTMLElement.prototype.releasePointerCapture = jest.fn() as unknown as (
  pointerId: number,
) => void;
HTMLElement.prototype.hasPointerCapture = jest.fn() as unknown as (
  pointerId: number,
) => boolean;

// Mock navigator.clipboard (jsdom doesn't ship a writable Clipboard API)
Object.defineProperty(window.navigator, "clipboard", {
  writable: true,
  configurable: true,
  value: {
    writeText: jest.fn() as jest.Mock<() => Promise<void>>,
  },
});
