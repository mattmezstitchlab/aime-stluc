export default function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items]
  return (
    <div className="overflow-hidden border-y hairline py-4 bg-[color:var(--color-ink-2)]">
      <div className="marquee flex gap-14 whitespace-nowrap w-max">
        {doubled.map((t, i) => (
          <span key={i} className="font-display text-3xl md:text-5xl italic flex items-center gap-14">
            {t}
            <span className="text-[color:var(--color-blood)] not-italic">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}
