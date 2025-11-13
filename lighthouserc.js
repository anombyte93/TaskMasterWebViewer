/**
 * Lighthouse CI Configuration
 *
 * Automated performance testing with Google Lighthouse.
 * Enforces Core Web Vitals thresholds for continuous integration.
 *
 * Usage:
 * - Install: npm install -g @lhci/cli
 * - Run: lhci autorun
 * - Or: npx lighthouse http://localhost:5000 --view
 *
 * Thresholds (2024 Best Practices):
 * - FCP (First Contentful Paint): <2.0s
 * - LCP (Largest Contentful Paint): <2.5s
 * - TTI (Time to Interactive): <5.0s
 * - CLS (Cumulative Layout Shift): <0.1
 * - TBT (Total Blocking Time): <300ms
 */

module.exports = {
  ci: {
    collect: {
      // Run against production build
      startServerCommand: 'npm run build && npm start',
      startServerReadyPattern: 'Server listening',
      url: ['http://localhost:5000/'],
      numberOfRuns: 3, // Average of 3 runs for consistency
      settings: {
        preset: 'desktop',
        throttling: {
          // Simulated desktop performance
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        // Also test mobile
        // preset: 'mobile',
      },
    },
    assert: {
      assertions: {
        // Core Web Vitals (Critical)
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }], // <2s
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }], // <2.5s
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }], // <0.1
        'total-blocking-time': ['warn', { maxNumericValue: 300 }], // <300ms (warn)
        'interactive': ['warn', { maxNumericValue: 5000 }], // <5s TTI (warn)

        // Performance Score
        'categories:performance': ['warn', { minScore: 0.9 }], // 90+ score

        // Best Practices
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['warn', { minScore: 0.9 }],

        // Resource Hints
        'uses-rel-preconnect': 'off',
        'uses-rel-preload': 'off',

        // Modern Image Formats
        'modern-image-formats': 'warn',
        'uses-optimized-images': 'warn',

        // JavaScript
        'bootup-time': ['warn', { maxNumericValue: 3000 }], // <3s JS execution
        'mainthread-work-breakdown': ['warn', { maxNumericValue: 4000 }],
        'unused-javascript': 'warn',

        // Network
        'server-response-time': ['warn', { maxNumericValue: 600 }], // <600ms TTFB
        'redirects': 'error',

        // Rendering
        'dom-size': ['warn', { maxNumericValue: 1500 }], // <1500 DOM nodes
        'layout-shift-elements': 'warn',
        'non-composited-animations': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage', // Or configure your own storage
    },
  },
};
