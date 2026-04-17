export default function Skeleton({
  className = '',
  variant = 'default',
  count = 1,
}) {
  const base = 'animate-pulse bg-surface-800 rounded-lg';

  const variants = {
    default: 'h-4 w-full',
    title:   'h-6 w-3/4',
    text:    'h-4 w-full',
    card:    'h-32 w-full rounded-xl',
    avatar:  'h-10 w-10 rounded-full',
    badge:   'h-5 w-16 rounded-full',
  };

  if (count > 1) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${base} ${variants[variant] || variants.default}`} />
        ))}
      </div>
    );
  }

  return (
    <div className={`${base} ${variants[variant] || variants.default} ${className}`} />
  );
}

// Composite skeleton for common patterns
Skeleton.Card = function SkeletonCard() {
  return (
    <div className="bg-surface-900 border border-surface-700 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="title" />
          <Skeleton className="w-1/2" />
        </div>
      </div>
      <Skeleton count={3} />
    </div>
  );
};

Skeleton.StatCard = function SkeletonStatCard() {
  return (
    <div className="bg-surface-900 border border-surface-700 rounded-xl p-5 space-y-3">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
};
