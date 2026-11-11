import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext(null);

const STORAGE_KEYS = {
  HIGH_CONTRAST: 'tempuscare_high_contrast',
  FONT_SCALE: 'tempuscare_font_scale',
};

export const FONT_SCALES = {
  NORMAL: 'normal',
  LARGE: 'large',
  XLARGE: 'xlarge',
};

const FONT_SIZE_MAP = {
  [FONT_SCALES.NORMAL]: '16px',
  [FONT_SCALES.LARGE]: '18px',
  [FONT_SCALES.XLARGE]: '20px',
};

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.HIGH_CONTRAST) === 'true';
    } catch {
      return false;
    }
  });

  const [fontScale, setFontScale] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FONT_SCALE);
      return Object.values(FONT_SCALES).includes(saved) ? saved : FONT_SCALES.NORMAL;
    } catch {
      return FONT_SCALES.NORMAL;
    }
  });

  // Aplicar modo de alto contraste a la raíz del documento (HTML)
  useEffect(() => {
    try {
      if (highContrast) {
        document.documentElement.classList.add('high-contrast');
        localStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, 'true');
      } else {
        document.documentElement.classList.remove('high-contrast');
        localStorage.setItem(STORAGE_KEYS.HIGH_CONTRAST, 'false');
      }
    } catch {
      // Ignorar fallos de acceso a localStorage en sandbox
    }
  }, [highContrast]);

  // Aplicar escalado dinámico de fuente en px al root del HTML (Tailwind rem escala proporcionalmente)
  useEffect(() => {
    try {
      const rootSize = FONT_SIZE_MAP[fontScale] || '16px';
      document.documentElement.style.fontSize = rootSize;
      localStorage.setItem(STORAGE_KEYS.FONT_SCALE, fontScale);
    } catch {
      // Ignorar fallos
    }
  }, [fontScale]);

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const resetAccessibility = () => {
    setHighContrast(false);
    setFontScale(FONT_SCALES.NORMAL);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        setHighContrast,
        toggleHighContrast,
        fontScale,
        setFontScale,
        resetAccessibility,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility debe ser utilizado dentro de un AccessibilityProvider');
  }
  return context;
};
