import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock performance.now() if not available
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
  } as any;
}
