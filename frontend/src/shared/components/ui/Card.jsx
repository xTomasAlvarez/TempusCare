import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({ className, children, ...props }) => (
  <div
    className={cn(
      "rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ className, children, ...props }) => (
  <div className={cn("p-6 pb-4", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }) => (
  <h3
    className={cn("text-xl font-semibold tracking-tight text-slate-900 font-heading", className)}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }) => (
  <p className={cn("text-sm text-slate-500 mt-1", className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }) => (
  <div className={cn("p-6 pt-0 flex items-center", className)} {...props}>
    {children}
  </div>
);
