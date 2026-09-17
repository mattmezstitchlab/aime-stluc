import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

type Package = { id: number; slug: string; name: string; tagline: string; price_cents: number; features: string[]; vibe_tags: string[] }

type Vision = {
  first_names: string
  contact_email: string
  contact_phone: string
  wedding_date: string
  city: string
  region: string
  guest_count: number
  style_tags: string[]
  vibe_words: string
  package_slug: string
  budget_range: string
  options: string[]
  notes: string
}

const STYLE_OPTIONS = ['Rock', 'Bohème', 'Underground', 'Foret', 'Rooftop', 'Warehouse', 'Chapelle', 'Plage', 'Kink', 'Vintage', 'Cinema', 'DIY']
const OPTIONS_LIST = ['Photographe argentique','Vidéaste super 8','DJ set live','Groupe garage','Officiant laïc','Cheffe tatouée','Bar mezcal','Tatoueur événement','Feu d’artifice','Van vintage','Traduction bilingue']
const BUDGETS = ['< 5k €','5–12k €','12–25k €','25–50k €','50k+ €']

const STEPS = [
  'Vos prénoms',
  'Le contact',
  'La date',
  'Le lieu',
  'Combien vous êtes',
  'Votre style',
  'Le pack',
  'Vos options',
  'Vos mots à nous',
]

export default function Vision() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const [step, setStep] = useState(0)
  const [packages, setPackages] = useState<Package[]>([])
  const [v, setV] = useState<Vision>({
    first_names: '', contact_email: '', contact_phone: '',
    wedding_date: '', city: '', region: '', guest_count: 40,
    style_tags: [], vibe_words: '',
    package_slug: params.get('pack') || '', budget_range: '',
    options: [], notes: '',
  })

  useEffect(() => { fetch('/api/packages').then(r=>r.json()).then(setPackages) }, [])

  const canNext = useMemo(() => {
    switch (step) {
      case 0: return v.first_names.trim().length > 2
      case 1: return /\S+@\S+/.test(v.contact_email)
      case 2: return !!v.wedding_date
      case 3: return v.city.trim().length > 1
      case 4: return v.guest_count > 0
      case 5: return v.style_tags.length >= 1
      case 6: return !!v.package_slug
      case 7: return true
      case 8: return true
      default: return true
    }
  }, [step, v])

  const total = STEPS.length
  const pct = Math.round(((step+1)/total)*100)

  const toggle = (key: 'style_tags' | 'options', val: string) => {
    setV(prev => ({ ...prev, [key]: prev[key].includes(val) ? prev[key].filter(x => x !== val) : [...prev[key], val] }))
  }

  const submit = () => {
    sessionStorage.setItem('aime-vision', JSON.stringify(v))
    nav('/checkout')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="border-b hairline">
        <div className="max-w-[900px] mx-auto px-5 md:px-8 h-12 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)]">
          <span>Étape {String(step+1).padStart(2,'0')} / {String(total).padStart(2,'0')} · {STEPS[step]}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-px bg-[color:var(--color-line)]">
          <div className="h-full bg-[color:var(--color-blood)] transition-all" style={{ width: `${pct}%` }}/>
        </div>
      </div>

      <div className="flex-1 flex items-center">
        <div className="w-full max-w-[900px] mx-auto px-5 md:px-8 py-16">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: .3 }}>
              {step === 0 && (
                <Field label="Vos prénoms, celui de votre partenaire." hint="On ne demande pas de nom de famille. On n'est pas la mairie.">
                  <input autoFocus placeholder="Emma & Sacha" value={v.first_names} onChange={e => setV({...v, first_names: e.target.value})}/>
                </Field>
              )}
              {step === 1 && (
                <div className="space-y-8">
                  <Field label="On vous joint comment ?" hint="Un email obligatoire. Un téléphone si vous voulez qu'on soit réels.">
                    <input autoFocus type="email" placeholder="emma@sacha.love" value={v.contact_email} onChange={e => setV({...v, contact_email: e.target.value})}/>
                  </Field>
                  <Field label="Téléphone (optionnel)">
                    <input type="tel" placeholder="+33 6 12 34 56 78" value={v.contact_phone} onChange={e => setV({...v, contact_phone: e.target.value})}/>
                  </Field>
                </div>
              )}
              {step === 2 && (
                <Field label="La date. La vraie." hint="Si vous hésitez encore, mettez la fourchette la plus probable.">
                  <input autoFocus type="date" value={v.wedding_date} onChange={e => setV({...v, wedding_date: e.target.value})}/>
                </Field>
              )}
              {step === 3 && (
                <div className="space-y-8">
                  <Field label="Où ça se passe ?" hint="Ville ou village. On dispatch nos missionnaires selon leur rayon d'intervention.">
                    <input autoFocus placeholder="Marseille" value={v.city} onChange={e => setV({...v, city: e.target.value})}/>
                  </Field>
                  <Field label="Région / département">
                    <select value={v.region} onChange={e => setV({...v, region: e.target.value})}>
                      <option value="">Sélectionnez</option>
                      {['Île-de-France','PACA','Occitanie','Nouvelle-Aquitaine','Bretagne','Grand Est','Auvergne-Rhône-Alpes','Hauts-de-France','Normandie','Corse','Étranger'].map(r => <option key={r}>{r}</option>)}
                    </select>
                  </Field>
                </div>
              )}
              {step === 4 && (
                <Field label="Combien de gens vont pleurer ?" hint="Nombre d'invités estimé.">
                  <div className="flex items-baseline gap-4">
                    <input autoFocus type="number" min={2} max={500} value={v.guest_count} onChange={e => setV({...v, guest_count: Number(e.target.value)})} className="!text-4xl font-display"/>
                    <span className="font-mono text-xs uppercase tracking-widest text-[color:var(--color-cream-dim)]">personnes</span>
                  </div>
                </Field>
              )}
              {step === 5 && (
                <Field label="Vibe check." hint="Sélectionnez tous les mots-clés qui résonnent. Minimum 1.">
                  <div className="flex flex-wrap gap-2 mt-4">
                    {STYLE_OPTIONS.map(s => (
                      <button key={s} onClick={() => toggle('style_tags', s)} className={`chip ${v.style_tags.includes(s) ? 'on' : ''}`}>{s}</button>
                    ))}
                  </div>
                  <textarea rows={2} placeholder="Un mot qu'on ne trouve nulle part ?" value={v.vibe_words} onChange={e => setV({...v, vibe_words: e.target.value})} className="mt-8"/>
                </Field>
              )}
              {step === 6 && (
                <div>
                  <Field label="Choisissez votre chaos." hint="Prix ferme, tout inclus."/>
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    {packages.map(p => (
                      <button key={p.id} onClick={() => setV({...v, package_slug: p.slug})}
                        className={`text-left border p-6 transition ${v.package_slug === p.slug ? 'border-[color:var(--color-blood)] bg-[color:var(--color-ink-2)]' : 'hairline hover:border-[color:var(--color-cream-dim)]'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)]">{p.tagline}</span>
                          {v.package_slug === p.slug && <Check size={18} className="text-[color:var(--color-blood)]"/>}
                        </div>
                        <div className="font-display text-2xl">{p.name}</div>
                        <div className="font-display text-3xl text-[color:var(--color-blood)] mt-2">{(p.price_cents/100).toLocaleString('fr-FR')} €</div>
                      </button>
                    ))}
                  </div>
                  <Field label="Budget total indépendant du pack" hint="Aide la machine à calibrer les options additionnelles." >
                    <div className="flex flex-wrap gap-2 mt-4">
                      {BUDGETS.map(b => <button key={b} onClick={() => setV({...v, budget_range: b})} className={`chip ${v.budget_range === b ? 'on' : ''}`}>{b}</button>)}
                    </div>
                  </Field>
                </div>
              )}
              {step === 7 && (
                <Field label="Options additionnelles." hint="Rien n'est obligatoire. Chaque option déclenche un dispatch séparé.">
                  <div className="flex flex-wrap gap-2 mt-4">
                    {OPTIONS_LIST.map(o => (
                      <button key={o} onClick={() => toggle('options', o)} className={`chip ${v.options.includes(o) ? 'on' : ''}`}>{o}</button>
                    ))}
                  </div>
                </Field>
              )}
              {step === 8 && (
                <Field label="Un dernier mot." hint="Ce que vous refusez, ce que vous rêvez, ce qui vous fait peur.">
                  <textarea rows={5} autoFocus placeholder="On ne veut ni pièce montée ni valse. On veut du smoke, du karaoké et Bowie à fond." value={v.notes} onChange={e => setV({...v, notes: e.target.value})}/>
                </Field>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t hairline sticky bottom-0 bg-[color:var(--color-ink)]/90 backdrop-blur">
        <div className="max-w-[900px] mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <button onClick={() => setStep(s => Math.max(0, s-1))} disabled={step===0} className="btn-ghost disabled:opacity-30"><ArrowLeft size={14}/> Retour</button>
          {step < total-1 ? (
            <button onClick={() => setStep(s => s+1)} disabled={!canNext} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">Continuer <ArrowRight size={14}/></button>
          ) : (
            <button onClick={submit} className="btn-primary">Voir notre vision <ArrowRight size={14}/></button>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children?: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-4xl md:text-6xl leading-[0.95] mb-3">{label}</h2>
      {hint && <p className="text-[color:var(--color-cream-dim)] text-sm mb-6">{hint}</p>}
      {children}
    </div>
  )
}
