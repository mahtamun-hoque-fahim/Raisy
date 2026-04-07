/**
 * Centralized Framer Motion variants for Raisy.
 * Import these instead of inline variant objects to keep animation DNA consistent.
 */

import type { Variants } from 'framer-motion';

// Cubic bezier tuple typed for Framer Motion 12
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: EASE, delay: i * 0.07 },
  }),
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' as const, delay: i * 0.06 },
  }),
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.45, ease: EASE, delay: i * 0.05 },
  }),
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.4, ease: EASE, delay: i * 0.06 },
  }),
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

export const barVariant: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: (pct: number) => ({
    scaleX: pct / 100,
    originX: 0,
    transition: { duration: 0.9, ease: EASE, delay: 0.15 },
  }),
};

// Page transition wrapper
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: 'easeIn' as const } },
};

// Confetti particle config
export const confettiColors = ['#FFD447', '#6BFFE4', '#FF6B6B', '#C56CF0', '#FF9F43'];
