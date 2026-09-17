import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Users, Zap, TrendingUp } from 'lucide-react'

type Mission = { id:number; wedding_date:string; city:string; region:string; brief:string; status:string; guest_count:number; package_name:string; package_price_cents:number; assigned_provider_name:string|null; style_tags:string[]; created_at:string }
type Log = { id:number; mission_id:number; event_type:string; message:string; created_at:string }
type Stats = { providers:number; missions:number; regions:number; revenue_cents:number; conversion_rate:number; avg_dispatch_seconds:number }

export default function Admin() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  const load = async () => {
    const [m, l, s] = await Promise.all([
      fetch('/api/missions').then(r=>r.json()),
      fetch('/api/dispatch-logs').then(r=>r.json()),
      fetch('/api/stats').then(r=>r.json()),
    ])
    setMissions(m); setLogs(l); setStats(s)
  }
  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t) }, [])

  return (
    <div className="max-w-[1500px] mx-auto px-5 md:px-8 py-10">
      <div className="flex items-baseline justify-between flex-wrap gap-4 mb-8">
        <div>
          <div className="chip mb-2"><span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-lime)] tick"/> Console fondateur · live</div>
          <h1 className="font-display text-5xl md:text-6xl leading-none">La <span className="italic text-[color:var(--color-blood)]">machine</span>, en direct.</h1>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)]">Auto-refresh 8s</div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-10">
        <Kpi icon={<Users size={16}/>} label="Missionnaires" value={String(stats?.providers ?? '–')}/>
        <Kpi icon={<Activity size={16}/>} label="Missions actives" value={String(missions.filter(m => m.status === 'dispatching' || m.status === 'assigned').length)} sub={`${missions.length} total`}/>
        <Kpi icon={<TrendingUp size={16}/>} label="CA généré" value={`${((stats?.revenue_cents ?? 0)/100).toLocaleString('fr-FR')} €`}/>
        <Kpi icon={<Zap size={16}/>} label="Dispatch moyen" value={`${Math.round(stats?.avg_dispatch_seconds ?? 0)}s`} sub="< 4h SLA"/>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)] mb-4">// Missions</h2>
          <div className="border hairline">
            <div className="grid grid-cols-12 font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)] px-4 py-3 border-b hairline bg-[color:var(--color-ink-2)]">
              <div className="col-span-1">#</div>
              <div className="col-span-3">Ville</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Pack</div>
              <div className="col-span-2">Missionnaire</div>
              <div className="col-span-2">Statut</div>
            </div>
            {missions.map(m => (
              <div key={m.id} className="grid grid-cols-12 px-4 py-3 border-b hairline text-sm items-center">
                <div className="col-span-1 font-mono text-xs">{String(m.id).padStart(4,'0')}</div>
                <div className="col-span-3">{m.city}<span className="block text-[10px] font-mono uppercase tracking-widest text-[color:var(--color-cream-dim)]">{m.region}</span></div>
                <div className="col-span-2 font-mono text-xs">{m.wedding_date}</div>
                <div className="col-span-2 text-xs">{m.package_name}</div>
                <div className="col-span-2 text-xs">{m.assigned_provider_name || <span className="text-[color:var(--color-cream-dim)]">—</span>}</div>
                <div className="col-span-2"><StatusPill status={m.status}/></div>
              </div>
            ))}
            {missions.length === 0 && <div className="p-8 text-center font-mono text-xs text-[color:var(--color-cream-dim)]">Aucune mission encore. Créez-en une depuis /vision.</div>}
          </div>
        </div>

        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)] mb-4">// Moteur de dispatch · log</h2>
          <div className="border hairline bg-[color:var(--color-ink-2)] p-4 h-[600px] overflow-auto font-mono text-xs space-y-2">
            {logs.map((l, i) => (
              <motion.div key={l.id} initial={i < 3 ? { opacity: 0, x: -10 } : false} animate={{ opacity: 1, x: 0 }} className="leading-relaxed">
                <span className="text-[color:var(--color-cream-dim)]">{new Date(l.created_at).toLocaleTimeString('fr-FR')}</span>{' '}
                <span className="text-[color:var(--color-blood)] font-bold">[{l.event_type}]</span>{' '}
                <span className="text-[color:var(--color-cream-dim)]">#{String(l.mission_id).padStart(4,'0')}</span>{' '}
                <span>{l.message}</span>
              </motion.div>
            ))}
            {logs.length === 0 && <div className="text-[color:var(--color-cream-dim)]">// waiting for events…</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

function Kpi({ icon, label, value, sub }: { icon:React.ReactNode; label:string; value:string; sub?:string }) {
  return (
    <div className="border hairline bg-[color:var(--color-ink-2)] p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)] flex items-center gap-2 mb-3">{icon}{label}</div>
      <div className="font-display text-4xl">{value}</div>
      {sub && <div className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)] mt-2">{sub}</div>}
    </div>
  )
}

function StatusPill({ status }: { status:string }) {
  const map: Record<string,{c:string;l:string}> = {
    pending: { c: 'bg-[color:var(--color-ink)] text-[color:var(--color-cream-dim)] border-[color:var(--color-line)]', l: 'En attente' },
    dispatching: { c: 'bg-[color:var(--color-blood)] text-[color:var(--color-ink)] border-[color:var(--color-blood)]', l: 'Dispatch' },
    assigned: { c: 'bg-[color:var(--color-lime)] text-[color:var(--color-ink)] border-[color:var(--color-lime)]', l: 'Assignée' },
    completed: { c: 'bg-[color:var(--color-ink-3)] text-[color:var(--color-cream)] border-[color:var(--color-line)]', l: 'Livrée' },
  }
  const s = map[status] ?? map.pending
  return <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 border ${s.c}`}>{s.l}</span>
}
