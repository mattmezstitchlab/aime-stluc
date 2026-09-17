import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Skull, Flame, Feather, Radio, Zap, Sparkles } from 'lucide-react'
import Marquee from '../components/Marquee'

type Package = { id: number; slug: string; name: string; tagline: string; description: string; price_cents: number; color: string; features: string[]; vibe_tags: string[]; icon: string }

const iconMap: Record<string, React.ReactNode> = {
  skull: <Skull size={32}/>, flame: <Flame size={32}/>, feather: <Feather size={32}/>, radio: <Radio size={32}/>,
}

export default function Landing() {
  const [packages, setPackages] = useState<Package[]>([])
  const [stats, setStats] = useState<{ providers: number; missions: number; regions: number } | null>(null)

  useEffect(() => {
    fetch('/api/packages').then(r => r.json()).then(setPackages).catch(()=>{})
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(()=>{})
  }, [])

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }} className="flex items-center gap-3 mb-8">
            <span className="chip on"><span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-ink)] tick"/> Machine autonome · en ligne</span>
            <span className="chip hidden md:inline-flex">Est. 2026 · Paris / Marseille / Berlin</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
            className="font-display text-[15vw] md:text-[10rem] leading-[0.85] tracking-tighter">
            <span className="block">Le mariage,</span>
            <span className="block italic">mais <span className="text-[color:var(--color-blood)]">sans</span> les</span>
            <span className="block">petits fours.</span>
          </motion.h1>

          <div className="mt-12 grid md:grid-cols-3 gap-8 items-end">
            <div className="md:col-span-2 max-w-2xl">
              <p className="text-lg md:text-xl text-[color:var(--color-cream-dim)] leading-relaxed">
                AIME est une agence de mariage alternative pilotée par une seule personne
                et une machine qui ne dort jamais. Vous choisissez une <em className="text-[color:var(--color-cream)] not-italic underline decoration-[color:var(--color-blood)] decoration-2 underline-offset-4">vision</em>,
                on déploie un commando de missionnaires (photographes punk, DJs, oféciants laïcs, cheffes tatouées) en moins de 4 heures.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/vision" className="btn-primary">Créer notre vision <ArrowUpRight size={16}/></Link>
                <Link to="/missionnaire/onboarding" className="btn-ghost">Devenir missionnaire</Link>
              </div>
            </div>
            <div className="border hairline p-5 bg-[color:var(--color-ink-2)]">
              <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)] mb-3">// Live — moteur de dispatching</div>
              <div className="space-y-2 font-mono text-xs">
                <LiveRow tag="MATCH" text="Photographe argentique → Emma & Sacha (Élopement, Vosges)"/>
                <LiveRow tag="BRIEF" text="Feuille de route générée · 12 pages"/>
                <LiveRow tag="SIGN" text="Contrat signé en 2min17"/>
                <LiveRow tag="CASH" text="Acompte transféré au missionnaire"/>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Marquee items={['Pas de nappes blanches', 'Pas de dragees', 'Pas de valse de vienne', 'Pas de discours du parrain', 'Just love & noise']} />

      {/* MANIFESTO */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-8 py-24">
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <div className="chip mb-6">Le manifeste</div>
            <h2 className="font-display text-5xl md:text-6xl leading-[0.95]">On ne célèbre pas <span className="italic text-[color:var(--color-blood)]">un contrat</span>. On célèbre <span className="italic">un pacte</span>.</h2>
          </div>
          <div className="md:col-span-8 grid sm:grid-cols-2 gap-6">
            {manifesto.map((m, i) => (
              <div key={i} className="border hairline p-6 bg-[color:var(--color-ink-2)]">
                <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)] mb-3">0{i+1}</div>
                <h3 className="font-display text-2xl mb-2">{m.t}</h3>
                <p className="text-sm text-[color:var(--color-cream-dim)] leading-relaxed">{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section id="forfaits" className="border-y hairline bg-[color:var(--color-ink-2)]">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <div className="chip mb-4">3 forfaits · zero customization inutile</div>
              <h2 className="font-display text-6xl md:text-7xl leading-[0.95]">Choisis <span className="italic">ton chaos</span>.</h2>
            </div>
            <p className="max-w-md text-[color:var(--color-cream-dim)]">Prix ferme. Prestations fermées. Ce que tu vois, c'est ce qu'on livre. Pas d'options planquées en bas d'un devis Excel.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {packages.length === 0 && Array.from({length:3}).map((_,i)=>(
              <div key={i} className="h-96 border hairline animate-pulse bg-[color:var(--color-ink)]"/>
            ))}
            {packages.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay: i*0.1 }}
                className="group relative border hairline bg-[color:var(--color-ink)] p-8 flex flex-col hover:border-[color:var(--color-blood)] transition">
                <div className="flex items-start justify-between mb-8">
                  <div className="text-[color:var(--color-blood)]">{iconMap[p.icon] ?? <Sparkles size={32}/>}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)]">Pack 0{i+1}</div>
                </div>
                <h3 className="font-display text-4xl mb-2">{p.name}</h3>
                <p className="font-mono text-xs text-[color:var(--color-cream-dim)] uppercase tracking-widest mb-6">{p.tagline}</p>
                <p className="text-sm text-[color:var(--color-cream-dim)] mb-6 leading-relaxed">{p.description}</p>
                <ul className="space-y-2 mb-8 text-sm">
                  {p.features.slice(0,5).map(f => (
                    <li key={f} className="flex gap-3 items-start"><span className="text-[color:var(--color-blood)] mt-1">+</span>{f}</li>
                  ))}
                </ul>
                <div className="mt-auto flex items-end justify-between">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)]">Tout compris</div>
                    <div className="font-display text-4xl">{(p.price_cents/100).toLocaleString('fr-FR')} €</div>
                  </div>
                  <Link to={`/vision?pack=${p.slug}`} className="btn-primary text-xs !py-2">Choisir <ArrowUpRight size={14}/></Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-8 py-24">
        <div className="chip mb-6">Comment la machine tourne</div>
        <h2 className="font-display text-6xl md:text-7xl leading-[0.95] mb-16">De ta vision <span className="italic text-[color:var(--color-blood)]">au commando</span>, en 4 heures.</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="relative">
              <div className="font-display text-7xl text-[color:var(--color-blood)] leading-none mb-4">{i+1}</div>
              <h3 className="font-display text-2xl mb-3">{s.t}</h3>
              <p className="text-sm text-[color:var(--color-cream-dim)] leading-relaxed">{s.d}</p>
              {i < steps.length-1 && <div className="hidden md:block absolute top-8 right-0 w-16 dashed-line h-px text-[color:var(--color-cream-dim)]"/>}
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="border-y hairline">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <Stat n={stats?.providers ?? 0} label="Missionnaires actifs" />
          <Stat n={stats?.missions ?? 0} label="Missions dispatchées" />
          <Stat n={stats?.regions ?? 0} label="Villes couvertes" />
          <Stat n={97} label="% de match en < 4h" suffix="" />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-8 py-28 text-center">
        <Zap className="mx-auto text-[color:var(--color-blood)] mb-6" size={44}/>
        <h2 className="font-display text-6xl md:text-8xl leading-[0.9] mb-6">On se marie <span className="italic">quand</span>?</h2>
        <p className="max-w-xl mx-auto text-[color:var(--color-cream-dim)] mb-10">Réponds à 12 questions. Choisis ton pack. Signe ta vision. La machine s'occupe du reste.</p>
        <Link to="/vision" className="btn-primary text-base">Lancer notre vision <ArrowUpRight size={18}/></Link>
      </section>
    </div>
  )
}

function LiveRow({ tag, text }: { tag: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[color:var(--color-blood)]">▸</span>
      <span className="font-bold w-14 shrink-0">{tag}</span>
      <span className="text-[color:var(--color-cream-dim)]">{text}</span>
    </div>
  )
}

function Stat({ n, label, suffix='' }: { n: number; label: string; suffix?: string }) {
  return (
    <div>
      <div className="font-display text-6xl md:text-7xl leading-none">{n}<span className="text-[color:var(--color-blood)]">{suffix}</span></div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)] mt-2">{label}</div>
    </div>
  )
}

const manifesto = [
  { t: 'Zero standardization', d: 'On ne fait pas 3 devis. On fait 3 forfaits assumés. Tu choisis, ou tu passes ton chemin.' },
  { t: 'Le fondateur ne signe rien', d: "La machine est autonome. Le brief part seul. Le contrat s'exécute seul. Moi je bois un mezcal." },
  { t: 'Missionnaires, pas prestataires', d: 'Des artistes indépendants sélectionnés pour leur regard. Payés vite. Briefés bien.' },
  { t: 'Prix affiché. Pour de vrai.', d: 'Pas d’options planquées. Pas de "selon prestataire". Le montant que tu vois est le montant que tu payes.' },
]

const steps = [
  { t: 'Tu crées ta vision', d: '12 questions. On extrait ton style, ta date, ton budget réel.' },
  { t: 'Tu choisis ton pack', d: '3 forfaits, prix ferme. Tu signes numériquement, tu payes en ligne.' },
  { t: 'La machine dispatch', d: 'Le moteur filtre les missionnaires (skill, zone, dispo, fiabilité) et notifie.' },
  { t: 'On débarque', d: 'Feuilles de route auto-générées. Contrats signés. Jour J, tu profites.' },
]
