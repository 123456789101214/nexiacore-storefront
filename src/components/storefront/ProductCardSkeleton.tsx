export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-2.5 sm:p-3">
      <div className="aspect-square animate-pulse rounded-xl bg-gray-100" />
      <div className="space-y-2 px-1 pt-3">
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 w-12 animate-pulse rounded bg-gray-100" />
          <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-100" />
        </div>
      </div>
    </div>
  );
}