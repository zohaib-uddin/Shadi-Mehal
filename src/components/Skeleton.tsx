import React from 'react';
import { cn } from '../lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rectangular' }) => {
  return (
    <div 
      className={cn(
        "animate-pulse bg-slate-200",
        variant === 'circular' ? "rounded-full" : "rounded-2xl",
        className
      )}
    />
  );
};

export const CardSkeleton: React.FC<{ count?: number, gridCols?: string }> = ({ count = 5, gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-5" }) => {
  return (
    <div className={cn("grid gap-8", gridCols)}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex flex-col gap-4">
          <Skeleton className="aspect-[4/5] rounded-[40px]" />
          <Skeleton className="h-6 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-lg" />
        </div>
      ))}
    </div>
  );
};

export const GallerySkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-[3.5rem]" />
      ))}
    </div>
  );
};
