import React, { useRef, useEffect } from 'react';

/**
 * Textarea que se expande automáticamente al escribir hasta un límite máximo de altura (maxHeight),
 * sin permitir redimensionamiento manual por parte del usuario (resize-none).
 */
export const AutoResizeTextarea = ({
  value = '',
  onChange,
  maxHeight = 450,
  minHeight = 80,
  className = '',
  style = {},
  disabled = false,
  ...props
}) => {
  const textareaRef = useRef(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      const scrollHeight = el.scrollHeight;
      const targetHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      el.style.height = `${targetHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value, minHeight, maxHeight]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      disabled={disabled}
      title={props.title || props['aria-label'] || props.placeholder || 'Campo de texto clínico o descriptivo'}
      maxLength={props.maxLength ?? 2000}
      className={`resize-none overflow-y-auto leading-relaxed transition-[border-color,background-color] ${className}`}
      style={{
        ...style,
        minHeight: `${minHeight}px`,
        maxHeight: `${maxHeight}px`,
      }}
      {...props}
    />
  );
};

export default AutoResizeTextarea;
