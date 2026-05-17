import Shimmer from '@/components/ui/shimmer';

export function OverviewStatsShimmer() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-28 rounded-xl border bg-card overflow-hidden">
          <Shimmer style={{ height: '100%', borderRadius: 12 }} />
        </div>
      ))}
    </div>
  );
}

export function OverviewListsShimmer() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {Array.from({ length: 2 }).map((_, cardIndex) => (
        <div key={cardIndex} className="rounded-xl border bg-card p-6 space-y-4">
          <div className="h-6 w-40 rounded-md overflow-hidden">
            <Shimmer style={{ height: '100%' }} />
          </div>
          <div className="h-4 w-64 rounded-md overflow-hidden">
            <Shimmer style={{ height: '100%' }} />
          </div>
          {Array.from({ length: 4 }).map((__, rowIndex) => (
            <div key={rowIndex} className="h-16 rounded-lg overflow-hidden border">
              <Shimmer style={{ height: '100%', borderRadius: 8 }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
