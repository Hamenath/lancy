import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-none",
        className
      )}
      {...props}
    />
  );
}

export function DesignerCardSkeleton() {
  return (
    <div className="w-full border border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-950 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3.5">
          <Skeleton className="w-12 h-12" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-6 w-14" />
      </div>
      <div className="space-y-1.5 py-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      <div className="flex flex-wrap gap-1.5 py-1">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-10" />
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-neutral-100 dark:border-neutral-900">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}
