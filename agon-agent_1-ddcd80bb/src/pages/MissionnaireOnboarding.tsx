import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Loader2, ArrowRight } from 'lucide-react'

const SKILLS = ['Photographe', 'Vidéaste', 'DJ', 'Groupe live', 'Officiant laïc', 'Chef.fe', 'Bar/mixologie', 'Fleuriste', 'Scénographe', 'Coordinateur.rice', 'Tatoueur.se', 'MC/animation', 'Pyrotechnicien']
const REGIONS = ['Île-de-France','PACA','Occitanie','Nouvelle-Aquitaine','Bretagne','Grand Est','Auvergne-Rhône-Alpes','Hauts-de-France','Normandie','Corse','Étranger']
const STYLES = ['Rock','Bohème','Underground','Foret','Rooftop','Warehouse','Chapelle','Plage','Kink','Vintage','Cinema','DIY']

export default function MissionnaireOnboarding() {
  const nav = useNavigate()
  const [f, setF] = useState({
    stage_name: '', email: '', phone: '', bio: '',
    skills: [] as string[], service_areas: [] as string[], style_tags: [] as string[],
    hourly_rate: 400, portfolio_url: '',
  })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggle = (k: 'skills'|'service_areas'|'style_tags', v: string) =>
    setF(prev => ({ ...prev, [k]: prev[k].includes(v) ? prev[k].filter(x=>x!==v) : [...prev[k], v] }))

  const submit = async () => {
    setLoading(true)
    const res = await fetch('/api/providers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(f),
    })
    setLoading(false)
    if (res.ok) setSent(true)
  }

  if (sent) return (
    <div className="max-w-2xl mx-auto px-5 md:px-8 py-24 text-center">
      <motion.div initial={{scale:0}} animate={{scale:1}} className="w-16 h-16 rounded-full bg-[color:var(--color-blood)] text-[color:var(--color-ink)] flex items-center justify-center mx-auto mb-6"><Check size={30}/></motion.div>
      <h1 className="font-display text-6xl leading-none mb-4">Bienvenue dans <span className="italic">la meute</span>.</h1>
      <p className="text-[color:var(--color-cream-dim)] mb-8">Ton dossier est en cours de review. Dès validation, le moteur commence à te notifier des missions matching ton profil.</p>
      <button onClick={() => nav('/missionnaire/dashboard')} className="btn-primary">Voir mon dashboard <ArrowRight size={14}/></button>
    </div>
  )

  const canSubmit = f.stage_name && f.email && f.skills.length && f.service_areas.length

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-16">
      <div className="chip mb-4">Onboarding missionnaire</div>
      <h1 className="font-display text-6xl md:text-7xl leading-[0.9] mb-4">Rejoindre <span className="italic text-[color:var(--color-blood)]">le réseau</span>.</h1>
      <p className="text-[color:var(--color-cream-dim)] mb-14 max-w-xl">On accepte les prestataires qui ont un regard, un point de vue, et qui savent bosser sans qu'on leur tienne la main. La machine te dispatche, tu livres.</p>

      <div className="space-y-12">
        <Section n="01" title="Ton identité">
          <div className="grid md:grid-cols-2 gap-8">
            <Field label="Nom d'artiste / studio"><input placeholder="Studio Grain d'Argent" value={f.stage_name} onChange={e=>setF({...f, stage_name:e.target.value})}/></Field>
            <Field label="Email pro"><input type="email" placeholder="studio@grain.love" value={f.email} onChange={e=>setF({...f, email:e.target.value})}/></Field>
            <Field label="Téléphone"><input type="tel" placeholder="+33 6 12 34 56 78" value={f.phone} onChange={e=>setF({...f, phone:e.target.value})}/></Field>
            <Field label="Tarif horaire indicatif (€)"><input type="number" value={f.hourly_rate} onChange={e=>setF({...f, hourly_rate:Number(e.target.value)})}/></Field>
            <div className="md:col-span-2"><Field label="Bio courte (1-2 phrases)"><textarea rows={2} placeholder="Ce que tu fais, pour qui, et pourquoi tu es différent." value={f.bio} onChange={e=>setF({...f, bio:e.target.value})}/></Field></div>
            <div className="md:col-span-2"><Field label="URL portfolio"><input placeholder="https://…" value={f.portfolio_url} onChange={e=>setF({...f, portfolio_url:e.target.value})}/></Field></div>
          </div>
        </Section>

        <Section n="02" title="Compétences">
          <div className="flex flex-wrap gap-2">
            {SKILLS.map(s => <button key={s} onClick={()=>toggle('skills', s)} className={`chip ${f.skills.includes(s)?'on':''}`}>{s}</button>)}
          </div>
        </Section>

        <Section n="03" title="Zones d'intervention">
          <div className="flex flex-wrap gap-2">
            {REGIONS.map(r => <button key={r} onClick={()=>toggle('service_areas', r)} className={`chip ${f.service_areas.includes(r)?'on':''}`}>{r}</button>)}
          </div>
        </Section>

        <Section n="04" title="Styles de mariage">
          <div className="flex flex-wrap gap-2">
            {STYLES.map(s => <button key={s} onClick={()=>toggle('style_tags', s)} className={`chip ${f.style_tags.includes(s)?'on':''}`}>{s}</button>)}
          </div>
        </Section>

        <button onClick={submit} disabled={!canSubmit || loading} className="btn-primary disabled:opacity-40">
          {loading ? <Loader2 className="animate-spin" size={14}/> : <ArrowRight size={14}/>}
          {loading ? 'Envoi…' : 'Envoyer mon profil'}
        </button>
      </div>
    </div>
  )
}

function Section({ n, title, children }: { n:string; title:string; children:React.ReactNode }) {
  return (
    <div className="border-t hairline pt-8">
      <div className="flex items-baseline gap-4 mb-6">
        <span className="font-display text-4xl text-[color:var(--color-blood)]">{n}</span>
        <h2 className="font-display text-3xl">{title}</h2>
      </div>
      {children}
    </div>
  )
}
function Field({ label, children }: { label:string; children:React.ReactNode }) {
  return <div><label className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)]">{label}</label>{children}</div>
}
