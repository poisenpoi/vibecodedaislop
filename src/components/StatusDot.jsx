export default function StatusDot({ online = true, pulse = true }) {
  const color = online ? 'bg-emerald-400' : 'bg-rose-500'
  const ring = online ? 'shadow-[0_0_10px_2px_rgba(52,211,153,0.55)]' : 'shadow-[0_0_10px_2px_rgba(244,63,94,0.55)]'
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      {online && pulse && (
        <span className="absolute inline-flex h-full w-full animate-ping-fast rounded-full bg-emerald-400/70 opacity-60" />
      )}
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color} ${ring}`} />
    </span>
  )
}
