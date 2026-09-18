import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  id,
  className,
  leadingIcon,
  trailingIcon,
  type = 'text',
  required = false,
  ...props
}, ref) => {
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
        >
          {label} {required && <span className="text-rose-500" aria-hidden="true">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-sm">
        {leadingIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            {leadingIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            "block w-full rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200",
            "focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20",
            leadingIcon && "pl-10",
            trailingIcon && "pr-10",
            error && "border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />

        {trailingIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {trailingIcon}
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}

      {helperText && !error && (
        <p id={helperId} className="mt-1 text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
