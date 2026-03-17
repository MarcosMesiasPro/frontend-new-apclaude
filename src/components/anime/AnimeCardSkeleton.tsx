export function AnimeCardSkeleton() {
  return (
    <div className="block">
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden skeleton" />
      <div className="mt-2 px-1 space-y-2">
        <div className="h-3 rounded skeleton" />
        <div className="h-3 w-2/3 rounded skeleton" />
      </div>
    </div>
  );
}
