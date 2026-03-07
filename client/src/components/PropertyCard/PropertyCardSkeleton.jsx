import React from 'react';

export default function PropertyCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="relative w-full aspect-square rounded-2xl bg-gray-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skeleton-shimmer" />
      </div>
      <div className="pt-3 space-y-2.5">
        <div className="flex justify-between items-center">
          <div className="h-4 w-2/3 bg-gray-200 rounded-full" />
          <div className="h-4 w-10 bg-gray-200 rounded-full" />
        </div>
        <div className="h-3.5 w-1/2 bg-gray-100 rounded-full" />
        <div className="h-4 w-1/3 bg-gray-200 rounded-full mt-1" />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .skeleton-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
