/**
 * Skeleton loading primitives — use for listings, reviews, gallery, dashboard.
 * All shapes pulse with the global .skeleton animation.
 */

export function SkeletonBox({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function SkeletonText({ className = '', width = 'w-full' }) {
  return <div className={`skeleton rounded h-4 ${width} ${className}`} />;
}

export function SkeletonCircle({ size = 'w-10 h-10' }) {
  return <div className={`skeleton rounded-full ${size}`} />;
}

/** Skeleton card matching the Airbnb property card shape */
export function SkeletonPropertyCard() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="aspect-[4/3] skeleton rounded-2xl" />
      <div className="space-y-2">
        <div className="h-4 skeleton rounded-lg w-3/4" />
        <div className="h-3 skeleton rounded-lg w-1/2" />
        <div className="h-4 skeleton rounded-lg w-1/3" />
      </div>
    </div>
  );
}

/** Skeleton for a review card */
export function SkeletonReviewCard() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 skeleton rounded-full" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 skeleton rounded w-28" />
          <div className="h-2.5 skeleton rounded w-20" />
        </div>
      </div>
      <div className="h-3 skeleton rounded w-full" />
      <div className="h-3 skeleton rounded w-5/6" />
    </div>
  );
}

/** Skeleton for the listing detail gallery (mosaic) */
export function SkeletonGallery() {
  return (
    <div className="grid grid-cols-4 grid-rows-2 gap-1 rounded-xl overflow-hidden" style={{ aspectRatio: '2.2 / 1' }}>
      <div className="col-span-2 row-span-2 skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}

/** Skeleton grid for dashboard stat cards */
export function SkeletonDashboardCards({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <div className="h-3 skeleton rounded w-1/2" />
          <div className="h-7 skeleton rounded w-3/4" />
          <div className="h-2 skeleton rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}
