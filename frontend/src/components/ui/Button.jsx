import { forwardRef } from 'react';

const variants = {
  primary:   'bg-accent text-white hover:bg-accent-hover shadow-sm hover:shadow-glow',
  secondary: 'bg-surface-800 text-surface-50 border border-surface-700 hover:bg-surface-700 hover:border-surface-600',
  ghost:     'text-surface-400 hover:text-surface-50 hover:bg-surface-800',
  danger:    'bg-danger text-white hover:bg-red-600',
  success:   'bg-success text-white hover:bg-green-600',
  outline:   'border border-accent text-accent hover:bg-accent-subtle',
};

const sizes = {
  sm:  'h-8 px-3 text-sm gap-1.5',
  md:  'h-9 px-4 text-sm gap-2',
  lg:  'h-10 px-5 text-base gap-2',
  xl:  'h-12 px-6 text-base gap-2.5',
};

const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg
        transition-all duration-200 ease-smooth
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
        disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
