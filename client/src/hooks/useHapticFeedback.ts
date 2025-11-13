/**
 * useHapticFeedback Hook
 *
 * Provides haptic feedback (vibration) for touch interactions.
 * Progressive enhancement: Only works on Android devices.
 * iOS does not support the Vibration API.
 *
 * Usage:
 * const haptic = useHapticFeedback();
 * haptic.tap(); // Light tap (10ms)
 * haptic.impact(); // Medium impact (20ms)
 * haptic.success(); // Success pattern (double pulse)
 */

export type HapticPattern = 'tap' | 'impact' | 'success' | 'error';

interface HapticFeedback {
  tap: () => void;
  impact: () => void;
  success: () => void;
  error: () => void;
  vibrate: (pattern: number | number[]) => void;
  isSupported: boolean;
}

export function useHapticFeedback(): HapticFeedback {
  // Feature detection for Vibration API
  const isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const vibrate = (pattern: number | number[]) => {
    if (!isSupported) return;

    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  };

  return {
    // Light tap (10ms) - for button presses, taps
    tap: () => vibrate(10),

    // Medium impact (20ms) - for card interactions, toggles
    impact: () => vibrate(20),

    // Success pattern (double pulse) - for successful actions
    success: () => vibrate([10, 50, 10]),

    // Error pattern (long pulse) - for errors, failures
    error: () => vibrate(30),

    // Custom vibration pattern
    vibrate,

    // Check if haptic feedback is supported
    isSupported,
  };
}
