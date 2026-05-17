import Shimmer from '@/components/ui/shimmer';

interface TableShimmerProps {
  rows?: number;
  columns?: number;
}

export function TableShimmer({ rows = 6, columns = 5 }: TableShimmerProps) {
  return (
    <div className="space-y-2 p-4">
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={`head-${index}`} className="h-8 rounded-md overflow-hidden">
            <Shimmer style={{ height: '100%' }} />
          </div>
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((__, colIndex) => (
            <div key={colIndex} className="h-12 rounded-md overflow-hidden">
              <Shimmer style={{ height: '100%' }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
