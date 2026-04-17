const colorMap = {
  accent:  'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  danger:  'bg-danger',
  info:    'bg-info',
};

const sizeMap = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2',
  xl: 'h-3',
};

export default function ProgressBar({
  value = 0,
  max = 100,
  color = 'accent',
  size = 'md',
  showLabel = false,
  animated = true,
  className = '',
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-surface-500 font-medium">
            {Math.round(pct)}%
          </span>
          <span className="text-xs text-surface-500">
            {value}/{max}
          </span>
        </div>
      )}
      <div className={`w-full bg-surface-800 rounded-full overflow-hidden ${sizeMap[size]}`}>
        <div
          className={`
            ${sizeMap[size]} rounded-full
            ${colorMap[color] || colorMap.accent}
            ${animated ? 'transition-all duration-700 ease-smooth' : ''}
          `}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
