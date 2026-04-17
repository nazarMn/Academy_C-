const colorMap = {
  default:  'bg-surface-800 text-surface-400 border-surface-700',
  accent:   'bg-accent-subtle text-accent border-accent/25',
  success:  'bg-success-muted text-success border-success/25',
  warning:  'bg-warning-muted text-warning border-warning/25',
  danger:   'bg-danger-muted text-danger border-danger/25',
  info:     'bg-info-muted text-info border-info/25',
};

const sizeMap = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1',
};

export default function Badge({
  color = 'default',
  size = 'md',
  dot = false,
  className = '',
  children,
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-medium rounded-full border
        leading-none whitespace-nowrap
        ${colorMap[color] || colorMap.default}
        ${sizeMap[size] || sizeMap.md}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
      )}
      {children}
    </span>
  );
}

// Level badge shorthand
const levelConfig = {
  beginner:     { color: 'success',  label: 'Початківець' },
  intermediate: { color: 'warning',  label: 'Середній' },
  oop:          { color: 'accent',   label: 'ООП' },
  advanced:     { color: 'info',     label: 'Просунутий' },
};

Badge.Level = function LevelBadge({ level }) {
  const config = levelConfig[level] || levelConfig.beginner;
  return (
    <Badge color={config.color} dot>
      {config.label}
    </Badge>
  );
};
