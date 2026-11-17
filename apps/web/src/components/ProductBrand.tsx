/** Product chrome: RadialBrain mark + Teammate. Inline with sidebar tools. */
export function ProductBrand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="app-no-drag flex items-center justify-center py-1" title="Teammate">
        <img
          src="/brand/radialbrain-mark.png"
          alt=""
          width={22}
          height={22}
          className="size-[22px] rounded-md"
        />
      </div>
    );
  }
  return (
    <div className="app-no-drag flex min-w-0 items-center gap-2">
      <img
        src="/brand/radialbrain-mark.png"
        alt=""
        width={28}
        height={28}
        className="size-7 shrink-0 rounded-lg"
      />
      <div className="min-w-0 leading-tight">
        <div className="truncate text-[14px] font-semibold tracking-tight text-foreground">
          Teammate
        </div>
        <div className="truncate text-[11px] text-muted-foreground">RadialBrain</div>
      </div>
    </div>
  );
}
