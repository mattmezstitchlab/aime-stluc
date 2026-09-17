import { Link, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  { to: '/vision', label: 'Marier-nous' },
  { to: '/missionnaire/dashboard', label: 'Missionnaires' },
  { to: '/admin', label: 'Console' },
  { to: '/architecture', label: 'Architecture' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const isMinimal = loc.pathname === '/vision' || loc.pathname === '/checkout'

  return (
    <header className="sticky top-0 z-40 border-b hairline bg-[color:var(--color-ink)]/80 backdrop-blur">
      <div className="max-w-[1400px] mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="font-display italic text-2xl leading-none text-[color:var(--color-blood)]">Æ</span>
          <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-[color:var(--color-cream)]">AIME Wedding</span>
        </Link>

        {!isMinimal && (
          <nav className="hidden md:flex items-center gap-8">
            {links.map(l => (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) => `font-mono text-[11px] uppercase tracking-[0.15em] transition ${isActive ? 'text-[color:var(--color-blood)]' : 'text-[color:var(--color-cream-dim)] hover:text-[color:var(--color-cream)]'}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login" className="font-mono text-[11px] uppercase tracking-[0.15em] text-[color:var(--color-cream-dim)] hover:text-[color:var(--color-cream)]">Se connecter</Link>
          <Link to="/vision" className="btn-primary text-xs !py-2 !px-3">→ Commencer</Link>
        </div>

        <button className="md:hidden text-[color:var(--color-cream)]" onClick={() => setOpen(o => !o)}>
          {open ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t hairline">
          <div className="px-5 py-4 flex flex-col gap-4">
            {links.map(l => <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="font-mono text-xs uppercase tracking-widest">{l.label}</NavLink>)}
            <Link to="/login" onClick={() => setOpen(false)} className="font-mono text-xs uppercase tracking-widest">Se connecter</Link>
            <Link to="/vision" onClick={() => setOpen(false)} className="btn-primary self-start">Commencer →</Link>
          </div>
        </div>
      )}
    </header>
  )
}
