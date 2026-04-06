import { cn } from "@/lib/utils"

/**
 * Central skeleton style: neutral muted color + pulse animation.
 * Used by TableSkeleton, card skeletons, etc. for consistent loading UX.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
