import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t hairline mt-24">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <span className="font-display italic text-3xl leading-none text-[color:var(--color-blood)]">Æ</span>
            <span className="font-mono text-[11px] tracking-[0.25em] uppercase">AIME Wedding</span>
          </div>
          <p className="mt-4 font-display text-2xl leading-tight max-w-md">
            L'agence qui refuse le mariage <span className="italic text-[color:var(--color-blood)]">en série</span>.
          </p>
          <p className="mt-3 text-xs text-[color:var(--color-cream-dim)] font-mono">
            Une machine autonome. Un fondateur. Zero cravate.
          </p>
        </div>
        <FooterCol title="Mariés" items={[['Notre manifeste','/'], ['Les 3 forfaits','/#forfaits'], ['Créer notre vision','/vision']]} />
        <FooterCol title="Missionnaires" items={[['Rejoindre le réseau','/missionnaire/onboarding'], ['Dashboard','/missionnaire/dashboard']]} />
        <FooterCol title="Machine" items={[['Architecture','/architecture'], ['Console fondateur','/admin']]} />
      </div>
      <div className="border-t hairline">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-5 flex flex-col md:flex-row justify-between gap-2 font-mono text-[11px] text-[color:var(--color-cream-dim)] uppercase tracking-widest">
          <span>© {new Date().getFullYear()} AIME Wedding — Made with rage &amp; love</span>
          <span className="flex items-center gap-2">Statut moteur <span className="inline-block w-2 h-2 rounded-full bg-[color:var(--color-lime)] tick"/> Opérationnel</span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, items }: { title: string; items: [string,string][] }) {
  return (
    <div>
      <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[color:var(--color-cream-dim)] mb-4">{title}</h4>
      <ul className="space-y-2">
        {items.map(([label, href]) => (
          <li key={label}><Link to={href} className="text-sm hover:text-[color:var(--color-blood)]">{label}</Link></li>
        ))}
      </ul>
    </div>
  )
}
