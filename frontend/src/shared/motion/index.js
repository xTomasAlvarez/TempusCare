/**
 * High-Craft Motion Design Tokens & Variants
 * Filosofía: "Snappy, Tactile & Subdued" (estilo Linear, Raycast y Stripe)
 */

export const snappySpring = {
  type: 'spring',
  stiffness: 420,
  damping: 30,
  mass: 0.8,
};

export const subduedSpring = {
  type: 'spring',
  stiffness: 400,
  damping: 28,
};

export const fastFade = {
  duration: 0.18,
  ease: 'easeOut',
};

// Contenedor padre orquestador de cascadas estándar
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

// Contenedor padre de cascada rápida (para tablas o listas largas)
export const fastStaggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.01,
    },
  },
};

// Elemento hijo en cascada
export const staggerItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: subduedSpring,
  },
};

// Entrada suave para páginas y contenedores principales
export const pageTransitionVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

// Transición de paneles y pestañas (Tabs Content)
export const tabContentVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: snappySpring,
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.12, ease: 'easeIn' },
  },
};

// Ciclo de vida de Modales y Diálogos
export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.14, ease: 'easeIn' } },
};

export const modalDialogVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: snappySpring },
  exit: { opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.14, ease: 'easeIn' } },
};

// Toasts y Notificaciones flotantes
export const toastVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: snappySpring },
  exit: { opacity: 0, y: -8, scale: 0.98, transition: { duration: 0.14, ease: 'easeIn' } },
};

// Píldoras y Badges
export const pillVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: snappySpring },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.12, ease: 'easeIn' } },
};

// Menús desplegables / Dropdowns / Popovers
export const dropdownVariants = {
  hidden: { opacity: 0, scale: 0.96, y: -6 },
  visible: { opacity: 1, scale: 1, y: 0, transition: snappySpring },
  exit: { opacity: 0, scale: 0.96, y: -6, transition: { duration: 0.12, ease: 'easeIn' } },
};
