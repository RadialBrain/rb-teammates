/** Persistent product chrome for RadialBrain Teammates (not the active bot name). */
export function ProductBrand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="app-no-drag flex items-center justify-center px-1 py-1" title="Teammates">
        <img
          src="/brand/bot-avatar.svg"
          alt=""
          width={22}
          height={22}
          className="size-[22px] rounded-md"
        />
      </div>
    );
  }
  return (
    <div className="app-no-drag flex items-center gap-2.5 px-[18px] pb-2 pt-1">
      <img
        src="/brand/bot-avatar.svg"
        alt=""
        width={28}
        height={28}
        className="size-7 shrink-0 rounded-lg"
      />
      <div className="min-w-0 leading-tight">
        <div className="truncate text-[13px] font-semibold tracking-tight text-foreground">
          Teammates
        </div>
        <div className="truncate text-[11px] text-muted-foreground">RadialBrain</div>
      </div>
    </div>
  );
}
