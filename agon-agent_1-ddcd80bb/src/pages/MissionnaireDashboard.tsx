import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Users, Sparkles, Check, X, Star, Clock } from 'lucide-react'

type Provider = { id:number; stage_name:string; skills:string[]; service_areas:string[]; style_tags:string[]; reliability_score:number; missions_completed:number; hourly_rate:number; bio:string }
type Invite = {
  id:number; mission_id:number; status:string; match_score:number; sent_at:string;
  mission: { id:number; wedding_date:string; city:string; region:string; style_tags:string[]; guest_count:number; brief:string; package_name:string; package_price_cents:number; status:string }
}

export default function MissionnaireDashboard() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)

  const loadProviders = async () => {
    const res = await fetch('/api/providers'); const data = await res.json(); setProviders(data)
    if (data.length && selected === null) setSelected(data[0].id)
  }
  const loadInvites = async (pid:number) => {
    setLoading(true)
    const res = await fetch(`/api/invitations?provider_id=${pid}`); const data = await res.json()
    setInvites(data); setLoading(false)
  }

  useEffect(() => { loadProviders() }, [])
  useEffect(() => { if (selected) loadInvites(selected) }, [selected])

  const respond = async (id:number, status:'accepted'|'declined') => {
    await fetch('/api/invitations', {
      method: 'PUT', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ id, status })
    })
    if (selected) loadInvites(selected)
  }

  const current = providers.find(p => p.id === selected)

  return (
    <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-10">
      <div className="flex items-baseline justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="chip mb-2">Espace missionnaire</div>
          <h1 className="font-display text-5xl md:text-6xl leading-none">Missions <span className="italic text-[color:var(--color-blood)]">assignées</span>.</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)]">Impersonner :</span>
          <select value={selected ?? ''} onChange={e=>setSelected(Number(e.target.value))} className="!w-auto !py-1 border hairline px-3">
            {providers.map(p => <option key={p.id} value={p.id}>{p.stage_name}</option>)}
          </select>
        </div>
      </div>

      {current && (
        <div className="grid lg:grid-cols-4 gap-4 mb-8">
          <ProfileStat label="Score fiabilité" value={current.reliability_score.toFixed(1)} icon={<Star size={16}/>} suffix="/10"/>
          <ProfileStat label="Missions livées" value={String(current.missions_completed)} icon={<Check size={16}/>}/>
          <ProfileStat label="Tarif horaire" value={`${current.hourly_rate}`} icon={<Sparkles size={16}/>} suffix=" €"/>
          <ProfileStat label="Skills" value={current.skills.slice(0,2).join(' · ')} icon={<Users size={16}/>} suffix={current.skills.length > 2 ? ` +${current.skills.length-2}` : ''}/>
        </div>
      )}

      <div className="border-b hairline mb-6">
        <div className="flex gap-6 font-mono text-[10px] uppercase tracking-widest">
          <span className="pb-3 border-b-2 border-[color:var(--color-blood)] text-[color:var(--color-cream)]">Missions à traiter ({invites.filter(i=>i.status==='pending').length})</span>
          <span className="pb-3 text-[color:var(--color-cream-dim)]">Historique ({invites.filter(i=>i.status!=='pending').length})</span>
        </div>
      </div>

      {loading && <div className="font-mono text-xs text-[color:var(--color-cream-dim)]">Chargement des missions…</div>}
      {!loading && invites.length === 0 && (
        <div className="border hairline p-12 text-center">
          <div className="font-display text-2xl mb-2">Aucune mission pour l'instant.</div>
          <p className="text-sm text-[color:var(--color-cream-dim)]">Le moteur t'enverra un email + SMS dès qu'une union matche ton profil.</p>
        </div>
      )}

      <div className="space-y-4">
        {invites.filter(i => i.status === 'pending').map((inv, idx) => (
          <motion.div key={inv.id} initial={{opacity:0, y:12}} animate={{opacity:1, y:0}} transition={{ delay: idx*0.05 }}
            className="border hairline bg-[color:var(--color-ink-2)] p-6 grid md:grid-cols-12 gap-6">
            <div className="md:col-span-2">
              <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)] mb-1">Match score</div>
              <div className="font-display text-5xl text-[color:var(--color-blood)] leading-none">{Math.round(inv.match_score)}<span className="text-lg text-[color:var(--color-cream-dim)]">/100</span></div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)] mt-3 flex items-center gap-1"><Clock size={10}/> {new Date(inv.sent_at).toLocaleString('fr-FR', { dateStyle:'short', timeStyle:'short' })}</div>
            </div>
            <div className="md:col-span-7">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-blood)]">Mission #{String(inv.mission_id).padStart(4,'0')}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)]">· {inv.mission.package_name}</span>
              </div>
              <h3 className="font-display text-3xl mb-3">{inv.mission.brief}</h3>
              <div className="flex flex-wrap gap-4 text-xs text-[color:var(--color-cream-dim)] mb-3">
                <span className="flex items-center gap-1"><Calendar size={12}/>{inv.mission.wedding_date}</span>
                <span className="flex items-center gap-1"><MapPin size={12}/>{inv.mission.city} — {inv.mission.region}</span>
                <span className="flex items-center gap-1"><Users size={12}/>{inv.mission.guest_count} invités</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {inv.mission.style_tags.map(t => <span key={t} className="chip !py-0.5 !text-[10px]">{t}</span>)}
              </div>
            </div>
            <div className="md:col-span-3 flex md:flex-col gap-2 items-end justify-end">
              <button onClick={() => respond(inv.id, 'accepted')} className="btn-primary w-full justify-center"><Check size={14}/> Accepter</button>
              <button onClick={() => respond(inv.id, 'declined')} className="btn-ghost w-full justify-center"><X size={14}/> Passer</button>
            </div>
          </motion.div>
        ))}

        {invites.filter(i => i.status !== 'pending').length > 0 && (
          <div className="pt-10">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)] mb-4">Historique</h3>
            <div className="space-y-2">
              {invites.filter(i => i.status !== 'pending').map(inv => (
                <div key={inv.id} className="border hairline p-4 flex items-center gap-4 justify-between">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)]">#{String(inv.mission_id).padStart(4,'0')} · {inv.mission.city}</div>
                    <div className="font-display text-lg">{inv.mission.brief.slice(0,60)}</div>
                  </div>
                  <span className={`chip ${inv.status==='accepted'?'on':''}`}>{inv.status==='accepted'?'Acceptée':inv.status==='declined'?'Déclinée':inv.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ProfileStat({ label, value, icon, suffix = '' }: { label:string; value:string; icon:React.ReactNode; suffix?:string }) {
  return (
    <div className="border hairline p-5 bg-[color:var(--color-ink-2)]">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)] flex items-center gap-2 mb-2">{icon}{label}</div>
      <div className="font-display text-3xl">{value}<span className="text-lg text-[color:var(--color-cream-dim)]">{suffix}</span></div>
    </div>
  )
}
