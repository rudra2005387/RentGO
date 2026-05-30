import { forwardRef } from 'react';
import clsx from 'clsx';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  isLoading = false,
  className,
  ...props
}, ref) => {
  const baseStyles = clsx(
    'inline-flex items-center justify-center font-medium transition-all duration-250 rounded-lg',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-airbnb-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    fullWidth && 'w-full',
  );

  const variants = {
    primary: clsx(
      'bg-airbnb-500 text-white hover:bg-airbnb-600',
      'active:bg-airbnb-700 shadow-sm hover:shadow-md',
    ),
    secondary: clsx(
      'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
      'active:bg-neutral-300 border border-neutral-200',
    ),
    tertiary: clsx(
      'bg-transparent text-neutral-900 hover:bg-neutral-50',
      'border border-neutral-200',
    ),
    ghost: clsx(
      'bg-transparent text-neutral-900 hover:bg-neutral-50',
    ),
    danger: clsx(
      'bg-error text-white hover:bg-red-600',
      'active:bg-red-700 shadow-sm hover:shadow-md',
    ),
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm gap-2',
    md: 'px-4 py-2.5 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-3',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
