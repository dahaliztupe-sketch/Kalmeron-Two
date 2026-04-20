// @ts-nocheck
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: "easeOut" }
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } }
};
