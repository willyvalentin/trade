export type LivePositionHandoffControlsProps = {
  disabled?: boolean;
  label?: string;
  onViewHandoff: () => void;
};

export function LivePositionHandoffControls({
  disabled = false,
  label = "View handoff",
  onViewHandoff,
}: LivePositionHandoffControlsProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onViewHandoff();
      }}
      className="mt-3 rounded-md border border-white/15 bg-black/20 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-200 transition hover:border-cyan-300/30 hover:text-cyan-100"
    >
      {label}
    </button>
  );
}
