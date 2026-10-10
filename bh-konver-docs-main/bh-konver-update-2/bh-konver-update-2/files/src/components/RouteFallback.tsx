import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton prikaz dok se učitava ruta ili provjerava Premium pristup. */
export const RouteFallback = ({ label = "Učitavanje stranice" }: { label?: string }) => (
  <div className="flex min-h-screen flex-col bg-background" role="status" aria-live="polite" aria-label={label}>
    <div className="h-[4.5rem] border-b border-border/70">
      <div className="mx-auto flex h-full max-w-[90rem] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="hidden h-9 w-72 xl:block" />
        <Skeleton className="h-10 w-10 xl:hidden" />
      </div>
    </div>
    <div className="mx-auto w-full max-w-4xl flex-1 space-y-4 px-4 py-10 sm:px-6">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="mt-6 h-64 w-full" />
    </div>
    <span className="sr-only">{label}</span>
  </div>
);

export default RouteFallback;
