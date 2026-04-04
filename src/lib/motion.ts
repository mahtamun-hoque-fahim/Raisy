/**
 * Centralized Framer Motion variants for Raisy.
 * Import these instead of inline variant objects to keep animation DNA consistent.
 */

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 },
  }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut', delay: i * 0.06 },
  }),
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 },
  }),
};

export const slideRight = {
  hidden: { opacity: 0, x: -20 },
  visible: (i = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 },
  }),
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

export const barVariant = {
  hidden: { scaleX: 0, originX: 0 },
  visible: (pct: number) => ({
    scaleX: pct / 100,
    originX: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 },
  }),
};

// Page transition wrapper
export const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25, ease: 'easeIn' } },
};

// Confetti particle config
export const confettiColors = ['#FFD447', '#6BFFE4', '#FF6B6B', '#C56CF0', '#FF9F43'];
