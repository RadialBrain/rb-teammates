/** Persistent product chrome for RadialBrain Teammates (not the active bot name). */
export function ProductBrand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="app-no-drag flex items-center justify-center px-1 py-1.5" title="Teammates">
        <img
          src="/brand/bot-avatar.svg"
          alt=""
          width={24}
          height={24}
          className="size-6 rounded-full"
        />
      </div>
    );
  }
  return (
    <div className="app-no-drag flex items-center gap-3 border-b border-border/60 px-[18px] pb-3 pt-1">
      <img
        src="/brand/bot-avatar.svg"
        alt=""
        width={32}
        height={32}
        className="size-8 shrink-0 rounded-full shadow-sm ring-1 ring-black/5 dark:ring-white/10"
      />
      <div className="min-w-0 leading-[1.15]">
        <div className="truncate text-[14px] font-semibold tracking-[-0.02em] text-foreground">
          Teammates
        </div>
        <div className="truncate text-[11px] font-medium tracking-[0.01em] text-muted-foreground">
          RadialBrain
        </div>
      </div>
    </div>
  );
}
