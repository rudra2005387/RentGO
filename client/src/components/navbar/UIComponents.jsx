import clsx from 'clsx';

export const Avatar = ({ src, name, size = 'md', className, ...props }) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  return src ? (
    <img
      src={src}
      alt={name}
      className={clsx('rounded-full object-cover', sizes[size], className)}
      {...props}
    />
  ) : (
    <div
      className={clsx(
        'rounded-full bg-gradient-to-br from-airbnb-400 to-airbnb-600 text-white flex items-center justify-center font-semibold',
        sizes[size],
        className,
      )}
      {...props}
    >
      {name?.charAt(0)?.toUpperCase()}
    </div>
  );
};

export const Badge = ({ children, variant = 'default', size = 'md', className, ...props }) => {
  const variants = {
    default: 'bg-neutral-100 text-neutral-900',
    primary: 'bg-airbnb-50 text-airbnb-600',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span className={clsx('inline-flex items-center rounded-full font-medium', variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
