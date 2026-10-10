type AdSenseSlotProps = {
  slotId: string;
  format?: "leaderboard" | "rectangle";
};

const formatClasses = {
  leaderboard: "min-h-[100px] sm:min-h-[90px]",
  rectangle: "min-h-[250px] max-w-[336px]",
};

export function AdSenseSlot({ slotId, format = "leaderboard" }: AdSenseSlotProps) {
  return (
    <aside
      aria-label="Rezervisan prostor za oglas"
      data-ad-slot={slotId}
      data-ad-format={format}
      className={`mx-auto flex w-full ${formatClasses[format]} items-center justify-center overflow-hidden border-y border-dashed border-border/70 px-4 py-5 text-center`}
    >
      <span className="text-[10px] font-medium uppercase text-muted-foreground/60">Oglasni prostor</span>
    </aside>
  );
}
