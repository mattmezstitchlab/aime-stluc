import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, CreditCard, PenLine, Zap, Loader2 } from 'lucide-react'

type Vision = {
  first_names: string; contact_email: string; contact_phone: string;
  wedding_date: string; city: string; region: string; guest_count: number;
  style_tags: string[]; vibe_words: string; package_slug: string;
  budget_range: string; options: string[]; notes: string;
}

type Package = { id:number; slug:string; name:string; tagline:string; price_cents:number; features:string[] }

export default function Checkout() {
  const nav = useNavigate()
  const [vision, setVision] = useState<Vision | null>(null)
  const [pkg, setPkg] = useState<Package | null>(null)
  const [signed, setSigned] = useState(false)
  const [paying, setPaying] = useState(false)
  const [dispatching, setDispatching] = useState(false)
  const [dispatchResult, setDispatchResult] = useState<{ mission_id:number; matched:number; assignments:{ role:string; count:number }[] } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('aime-vision')
    if (!raw) { nav('/vision'); return }
    const v = JSON.parse(raw) as Vision
    setVision(v)
    fetch('/api/packages').then(r=>r.json()).then((pkgs: Package[]) => {
      setPkg(pkgs.find(p => p.slug === v.package_slug) ?? pkgs[0])
    })
  }, [nav])

  useEffect(() => {
    const c = canvasRef.current; if (!c) return
    const ctx = c.getContext('2d')!; ctx.strokeStyle = '#F5EFE7'; ctx.lineWidth = 2; ctx.lineCap = 'round'
    const start = (e: PointerEvent) => { drawing.current = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY) }
    const move = (e: PointerEvent) => { if (!drawing.current) return; ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); setSigned(true) }
    const end = () => { drawing.current = false }
    c.addEventListener('pointerdown', start); c.addEventListener('pointermove', move); c.addEventListener('pointerup', end); c.addEventListener('pointerleave', end)
    return () => { c.removeEventListener('pointerdown', start); c.removeEventListener('pointermove', move); c.removeEventListener('pointerup', end); c.removeEventListener('pointerleave', end) }
  }, [])

  const clearSig = () => { const c = canvasRef.current; if (!c) return; const ctx = c.getContext('2d')!; ctx.clearRect(0,0,c.width,c.height); setSigned(false) }

  const submit = async () => {
    if (!vision || !pkg || !signed) return
    setPaying(true)
    await new Promise(r => setTimeout(r, 1200))
    setPaying(false); setDispatching(true)
    const res = await fetch('/api/missions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vision, package_slug: vision.package_slug, signature_ok: true }),
    })
    const data = await res.json()
    setDispatching(false)
    setDispatchResult(data)
    sessionStorage.removeItem('aime-vision')
  }

  if (!vision || !pkg) return <div className="p-10 font-mono text-xs">Chargement...</div>

  if (dispatchResult) {
    return (
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-24 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto w-20 h-20 rounded-full bg-[color:var(--color-blood)] text-[color:var(--color-ink)] flex items-center justify-center mb-8">
          <Zap size={36}/>
        </motion.div>
        <h1 className="font-display text-6xl md:text-7xl leading-none mb-6">La machine <span className="italic text-[color:var(--color-blood)]">tourne</span>.</h1>
        <p className="text-[color:var(--color-cream-dim)] max-w-lg mx-auto mb-10">
          Mission #{String(dispatchResult.mission_id).padStart(4,'0')} créée. {dispatchResult.matched} missionnaires ont été notifiés en temps réel.
          Le premier qui valide devient votre pilote pour le jour J.
        </p>
        <div className="border hairline p-6 bg-[color:var(--color-ink-2)] text-left font-mono text-xs space-y-2 mb-10">
          <div className="text-[color:var(--color-cream-dim)] uppercase tracking-widest text-[10px] mb-2">// Log du moteur</div>
          <LogLine>MATCH — {dispatchResult.matched} missionnaires filtrés (skill ∩ zone ∩ dispo)</LogLine>
          <LogLine>NOTIFY — {dispatchResult.matched} emails + {dispatchResult.matched} SMS envoyés</LogLine>
          {dispatchResult.assignments.map(a => (
            <LogLine key={a.role}>ASSIGN — {a.count} candidat(s) attendu(s) pour {a.role}</LogLine>
          ))}
          <LogLine>BRIEF — feuille de route générée et transmise</LogLine>
          <LogLine>CONTRACT — en attente signature missionnaire</LogLine>
        </div>
        <button onClick={() => nav('/admin')} className="btn-primary">Suivre la mission en direct</button>
      </div>
    )
  }

  return (
    <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-12 grid lg:grid-cols-5 gap-10">
      <div className="lg:col-span-3">
        <div className="chip mb-4">Signature de la vision</div>
        <h1 className="font-display text-5xl md:text-6xl leading-[0.95] mb-8">Un dernier <span className="italic">geste</span>.</h1>

        <div className="border hairline p-6 bg-[color:var(--color-ink-2)] mb-8">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)] mb-4">Pacte moral — non-standard, mais réel</div>
          <p className="font-display text-xl leading-snug mb-3">« Nous, <span className="text-[color:var(--color-blood)]">{vision.first_names}</span>, mandatons AIME Wedding pour orchestrer notre union le <span className="text-[color:var(--color-blood)]">{vision.wedding_date}</span> à <span className="text-[color:var(--color-blood)]">{vision.city}</span>. »</p>
          <p className="text-sm text-[color:var(--color-cream-dim)]">Vous validez le déclenchement automatique du moteur de dispatch. Vous acceptez qu'un missionnaire vous soit assigné selon nos critères de fiabilité. Vous savez que nous ne servirons ni petits fours, ni discours du parrain.</p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest"><PenLine size={12}/> Signature numérique</div>
            <button onClick={clearSig} className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)] hover:text-[color:var(--color-blood)]">Effacer</button>
          </div>
          <div className="border hairline bg-[color:var(--color-ink-2)] relative">
            <canvas ref={canvasRef} width={800} height={200} className="w-full h-[200px] cursor-crosshair touch-none"/>
            {!signed && <div className="absolute inset-0 flex items-center justify-center pointer-events-none font-mono text-xs text-[color:var(--color-cream-dim)] uppercase tracking-widest">Signez ici avec le doigt ou la souris</div>}
          </div>
        </div>

        <button onClick={submit} disabled={!signed || paying || dispatching} className="btn-primary w-full justify-center disabled:opacity-40">
          {paying && <><Loader2 className="animate-spin" size={16}/> Paiement en cours…</>}
          {dispatching && <><Loader2 className="animate-spin" size={16}/> Dispatch en cours…</>}
          {!paying && !dispatching && <><CreditCard size={16}/> Régler {(pkg.price_cents/100).toLocaleString('fr-FR')} € et lancer la machine</>}
        </button>
        <p className="text-center text-[10px] uppercase tracking-widest font-mono text-[color:var(--color-cream-dim)] mt-3">Paiement sécurisé · Stripe simulation · SEPA/CB</p>
      </div>

      <aside className="lg:col-span-2 border hairline bg-[color:var(--color-ink-2)] p-8 h-fit sticky top-20">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)] mb-4">Récapitulatif</div>
        <h3 className="font-display text-3xl">{pkg.name}</h3>
        <div className="font-mono text-xs text-[color:var(--color-cream-dim)] uppercase tracking-widest mb-6">{pkg.tagline}</div>

        <dl className="space-y-3 text-sm mb-6">
          <Row k="Mariés" v={vision.first_names}/>
          <Row k="Date" v={vision.wedding_date}/>
          <Row k="Lieu" v={`${vision.city} — ${vision.region}`}/>
          <Row k="Invités" v={`${vision.guest_count}`}/>
          <Row k="Style" v={vision.style_tags.join(' · ')}/>
          {vision.options.length > 0 && <Row k="Options" v={vision.options.length + ' add-ons'}/>}
        </dl>

        <div className="border-t hairline pt-4 mb-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)] mb-2">Inclus dans le pack</div>
          <ul className="space-y-1 text-xs">
            {pkg.features.map(f => <li key={f} className="flex gap-2"><Check size={12} className="text-[color:var(--color-blood)] shrink-0 mt-0.5"/> {f}</li>)}
          </ul>
        </div>

        <div className="flex items-end justify-between">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)]">Total TTC</div>
          <div className="font-display text-4xl">{(pkg.price_cents/100).toLocaleString('fr-FR')} €</div>
        </div>
      </aside>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4"><dt className="text-[color:var(--color-cream-dim)]">{k}</dt><dd className="text-right">{v}</dd></div>
}
function LogLine({ children }: { children: React.ReactNode }) {
  return <div><span className="text-[color:var(--color-blood)]">▸</span> {children}</div>
}
