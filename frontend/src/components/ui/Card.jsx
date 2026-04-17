const variants = {
  default:  'bg-surface-900 border-surface-700',
  ghost:    'bg-surface-900/50 border-surface-700/50',
  gradient: 'bg-gradient-to-br from-accent-subtle to-surface-900 border-accent/20',
  elevated: 'bg-surface-800 border-surface-600 shadow-card',
};

export default function Card({
  variant = 'default',
  hover = false,
  padding = 'p-5',
  className = '',
  children,
  ...props
}) {
  return (
    <div
      className={`
        rounded-xl border transition-all duration-200
        ${variants[variant] || variants.default}
        ${hover ? 'hover:border-surface-600 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer' : ''}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Sub-components for structured cards
Card.Header = function CardHeader({ className = '', children }) {
  return (
    <div className={`pb-4 border-b border-surface-700/50 ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ className = '', children }) {
  return (
    <div className={`pt-4 ${className}`}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ className = '', children }) {
  return (
    <div className={`pt-4 border-t border-surface-700/50 ${className}`}>
      {children}
    </div>
  );
};
