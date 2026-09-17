import { Cpu, Database, Zap, Bell, FileText, GitBranch, Users, Package, Layers, Radio } from 'lucide-react'

export default function Architecture() {
  return (
    <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-16">
      <div className="chip mb-4">Spec technique · v0.1</div>
      <h1 className="font-display text-6xl md:text-8xl leading-[0.9] mb-4">L'architecture <span className="italic text-[color:var(--color-blood)]">de la machine</span>.</h1>
      <p className="max-w-2xl text-[color:var(--color-cream-dim)] mb-16">Schéma technique, modèle de données et règles d'orchestration du dispatcher. Document vivant, tenu à jour par le fondateur (moi).</p>

      <Block n="01" icon={<Layers />} title="Vue d'ensemble">
        <div className="grid md:grid-cols-4 gap-3 mt-6 font-mono text-xs">
          <Stack title="Frontend" items={['Vite + React 19','TypeScript','Tailwind v4','Framer Motion','React Router']}/>
          <Stack title="Backend" items={['Vercel Serverless','Node 20 (ESM)','API REST /api/*','CORS + JWT auth','Cron dispatcher']}/>
          <Stack title="Data" items={['Supabase (Postgres)','Realtime channels','RLS multi-tenant','Storage (assets)','Buckets brief PDF']}/>
          <Stack title="Ops" items={['Stripe (paiement)','Resend (email)','Twilio (SMS)','Sentry (errors)','GA4 (analytics)']}/>
        </div>
      </Block>

      <Block n="02" icon={<Users />} title="Espaces & rôles">
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <Role title="Mariés (client)" items={['Tunnel de vision (9 étapes)','Sélection forfait','Signature numérique','Paiement en ligne','Suivi mission']}/>
          <Role title="Missionnaires" items={['Onboarding profil','Compétences + zones','Portfolio public','Dashboard invitations','Historique + score fiabilité']}/>
          <Role title="Fondateur (admin)" items={['Console live','KPIs temps réel','Log dispatcher','Override manuel','Payouts + facturation']}/>
        </div>
      </Block>

      <Block n="03" icon={<Database />} title="Schéma logique de la base de données">
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <Table name="packages" cols={[['id','uuid pk'],['slug','text unique'],['name','text'],['tagline','text'],['description','text'],['price_cents','int'],['features','text[]'],['vibe_tags','text[]'],['color','text'],['icon','text']]}/>
          <Table name="couples" cols={[['id','uuid pk'],['user_id','uuid → auth.users'],['first_names','text'],['email','text'],['phone','text'],['created_at','timestamptz']]}/>
          <Table name="missions" cols={[['id','uuid pk'],['couple_id','→ couples'],['package_id','→ packages'],['wedding_date','date'],['city','text'],['region','text'],['guest_count','int'],['style_tags','text[]'],['options','text[]'],['budget_range','text'],['notes','text'],['brief','text'],['status','enum'],['assigned_provider_id','→ providers'],['dispatched_at','timestamptz'],['assigned_at','timestamptz'],['amount_cents','int'],['signature_svg','text']]}/>
          <Table name="providers" cols={[['id','uuid pk'],['user_id','→ auth.users'],['stage_name','text'],['email','text'],['phone','text'],['bio','text'],['skills','text[]'],['service_areas','text[]'],['style_tags','text[]'],['portfolio_url','text'],['hourly_rate','int'],['reliability_score','numeric'],['missions_completed','int'],['available','bool']]}/>
          <Table name="mission_invitations" cols={[['id','uuid pk'],['mission_id','→ missions'],['provider_id','→ providers'],['status','enum pending|accepted|declined|expired'],['match_score','numeric'],['sent_at','timestamptz'],['responded_at','timestamptz']]}/>
          <Table name="roadmaps" cols={[['id','uuid pk'],['mission_id','→ missions'],['timeline_json','jsonb'],['pdf_url','text'],['generated_at','timestamptz']]}/>
          <Table name="contracts" cols={[['id','uuid pk'],['mission_id','→ missions'],['provider_id','→ providers'],['terms','text'],['signed_by_provider_at','timestamptz'],['payout_cents','int']]}/>
          <Table name="notifications" cols={[['id','uuid pk'],['recipient_id','uuid'],['channel','enum email|sms|push'],['kind','text'],['payload','jsonb'],['sent_at','timestamptz']]}/>
          <Table name="dispatch_logs" cols={[['id','uuid pk'],['mission_id','→ missions'],['event_type','text (MATCH|NOTIFY|ASSIGN|BRIEF|CONTRACT|CANCEL)'],['message','text'],['created_at','timestamptz']]}/>
        </div>
      </Block>

      <Block n="04" icon={<Zap />} title="Moteur d'orchestration — règles de dispatching">
        <p className="text-[color:var(--color-cream-dim)] mt-4 mb-6">Le dispatcher est un pipeline stateless déclenché par l'événement <code className="font-mono text-[color:var(--color-blood)]">mission.created</code>. Chaque étape est idempotente et logguée dans <code className="font-mono text-[color:var(--color-blood)]">dispatch_logs</code>.</p>
        <ol className="space-y-4">
          <Rule n={1} title="Déclenchement" body="Le webhook Stripe payment_intent.succeeded (ou signature validée en dev) marque la mission en status='dispatching' et pousse un job."/>
          <Rule n={2} title="Filtrage des candidats" body="SELECT providers WHERE available=true AND skills && required_skills AND service_areas @> ARRAY[region] AND NOT EXISTS (mission conflit même date)."/>
          <Rule n={3} title="Scoring (match_score 0-100)" body="+40 recouvrement skills / +25 style_tags matching / +20 reliability_score × 2 / +10 zone stricte / +5 tarif <= budget median. Tri desc."/>
          <Rule n={4} title="Notification en fanout" body="Top-10 candidats reçoivent email (Resend) + SMS (Twilio) + entrée mission_invitations status='pending'. Log NOTIFY."/>
          <Rule n={5} title="Attribution premier-arrivé" body="Premier provider qui PUT /api/invitations status='accepted' verrouille la mission (transaction). Les autres reçoivent status='expired'."/>
          <Rule n={6} title="Fallback rotation" body="Si aucun match sous 4h, réélection avec critères relaxés (zone +100km, style optionnel). Après 12h: alerte fondateur."/>
          <Rule n={7} title="Génération feuille de route" body="Sur assignation, template Markdown → PDF (react-pdf) → storage bucket. URL signée envoyée au provider + copie mariés."/>
          <Rule n={8} title="Contrat automatique" body="Template DocuSeal + variables mission. Provider signe via lien magique. Statut mission passe à 'assigned'."/>
          <Rule n={9} title="Update reliability_score" body="J+7 après mariage: feedback mariés (NPS 1-10) + presence-check géoloc → recalcul EWMA du score. Score < 6 = shadow-ban."/>
        </ol>
      </Block>

      <Block n="05" icon={<GitBranch />} title="Flux événementiels (append-only)">
        <div className="font-mono text-xs bg-[color:var(--color-ink-2)] border hairline p-6 mt-6 overflow-x-auto">
          <pre>{`Client                Web/API                Postgres/Realtime           Providers
  |                     |                          |                         |
  |-- POST /missions -->|                          |                         |
  |                     |-- INSERT mission ------->|                         |
  |                     |-- INSERT dispatch_log -->|                         |
  |                     |                          |-- REALTIME event ------>|
  |                     |-- match+score+INSERT --->| invitations             |
  |                     |-- email+sms (fanout) --->|                         |----> Twilio/Resend
  |                     |                          |                         |
  |                     |<-- PUT /invitations «accepted» -- (first-write-wins)|
  |                     |-- UPDATE missions.assigned_provider_id ----------->|
  |                     |-- INSERT roadmap + contract ---------------------->|
  |<-- webhook SMS -----|                          |                         |`}</pre>
        </div>
      </Block>

      <Block n="06" icon={<Bell />} title="Notifications automatisées">
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <NotifCard title="Mariés" items={['Signature confirmée (email)','Missionnaire assigné (email+SMS)','Feuille de route publiée (email)','J-30 checklist finale (email)','J+7 formulaire feedback (email)']}/>
          <NotifCard title="Missionnaires" items={['Mission proposée (email+SMS instant)','Mission attribuée (email)','Contrat à signer (email + magic link)','Rappel J-7 (SMS)','Paiement effectué J+3 (email)']}/>
        </div>
      </Block>

      <Block n="07" icon={<FileText />} title="API surface (v1)">
        <div className="font-mono text-xs bg-[color:var(--color-ink-2)] border hairline p-6 mt-6 space-y-1">
          <ApiLine method="GET" path="/api/packages" note="liste publique des 3 forfaits"/>
          <ApiLine method="POST" path="/api/missions" note="crée mission + déclenche dispatcher"/>
          <ApiLine method="GET" path="/api/missions" note="liste (admin)"/>
          <ApiLine method="GET" path="/api/providers" note="liste (admin/dashboard)"/>
          <ApiLine method="POST" path="/api/providers" note="onboarding"/>
          <ApiLine method="GET" path="/api/invitations?provider_id=" note="invitations d'un provider"/>
          <ApiLine method="PUT" path="/api/invitations" note="accept/decline + verrou premier-arrivé"/>
          <ApiLine method="GET" path="/api/dispatch-logs" note="stream d'événements"/>
          <ApiLine method="GET" path="/api/stats" note="KPI console fondateur"/>
        </div>
      </Block>

      <Block n="08" icon={<Radio />} title="Principes non négociables">
        <ul className="space-y-3 mt-6">
          {['Le fondateur ne reçoit aucune notification "routing". Uniquement les alertes de rupture (>12h sans match).',
            'Chaque événement est immutable et loggué. Audit trail complet pour litiges.',
            'Aucune donnée client n’est stockée hors UE. Buckets Supabase région eu-west-3.',
            'RGPD: mariés peuvent supprimer leur compte + toutes les données en 1 clic (cascade).',
            'Le tarif fixe est un feature: la marketplace n’est PAS un devis-in-app.'].map((t,i)=>(
            <li key={i} className="flex gap-3"><Cpu size={16} className="text-[color:var(--color-blood)] shrink-0 mt-1"/><span>{t}</span></li>
          ))}
        </ul>
      </Block>
    </div>
  )
}

function Block({ n, icon, title, children }: { n:string; icon:React.ReactNode; title:string; children:React.ReactNode }) {
  return (
    <section className="border-t hairline pt-10 pb-14">
      <div className="flex items-baseline gap-5 mb-4">
        <span className="font-display text-5xl text-[color:var(--color-blood)]">{n}</span>
        <div className="flex items-center gap-3">
          <span className="text-[color:var(--color-cream-dim)]">{icon}</span>
          <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  )
}
function Stack({ title, items }: { title:string; items:string[] }) {
  return (
    <div className="border hairline p-4 bg-[color:var(--color-ink-2)]">
      <div className="text-[color:var(--color-blood)] uppercase tracking-widest mb-3">{title}</div>
      <ul className="space-y-1 text-[color:var(--color-cream-dim)]">{items.map(i => <li key={i}>· {i}</li>)}</ul>
    </div>
  )
}
function Role({ title, items }: { title:string; items:string[] }) {
  return (
    <div className="border hairline p-6">
      <h3 className="font-display text-2xl mb-4">{title}</h3>
      <ul className="space-y-1 text-sm text-[color:var(--color-cream-dim)]">{items.map(i => <li key={i} className="flex gap-2"><span className="text-[color:var(--color-blood)]">→</span>{i}</li>)}</ul>
    </div>
  )
}
function Table({ name, cols }: { name:string; cols:[string,string][] }) {
  return (
    <div className="border hairline">
      <div className="px-4 py-2 font-mono text-xs border-b hairline bg-[color:var(--color-ink-2)] flex items-center gap-2">
        <Package size={12} className="text-[color:var(--color-blood)]"/>{name}
      </div>
      <div className="divide-y divide-[color:var(--color-line)] font-mono text-[11px]">
        {cols.map(([k,t]) => (
          <div key={k} className="px-4 py-1.5 flex justify-between gap-4">
            <span>{k}</span><span className="text-[color:var(--color-cream-dim)]">{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
function Rule({ n, title, body }: { n:number; title:string; body:string }) {
  return (
    <li className="border hairline bg-[color:var(--color-ink-2)] p-5 flex gap-5">
      <div className="font-display text-4xl text-[color:var(--color-blood)] leading-none shrink-0">{String(n).padStart(2,'0')}</div>
      <div>
        <div className="font-display text-xl mb-1">{title}</div>
        <p className="text-sm text-[color:var(--color-cream-dim)]">{body}</p>
      </div>
    </li>
  )
}
function NotifCard({ title, items }: { title:string; items:string[] }) {
  return (
    <div className="border hairline p-5 bg-[color:var(--color-ink-2)]">
      <div className="font-display text-xl mb-3">{title}</div>
      <ul className="space-y-2 text-sm">{items.map(i => <li key={i} className="flex gap-2"><Bell size={14} className="text-[color:var(--color-blood)] shrink-0 mt-0.5"/> {i}</li>)}</ul>
    </div>
  )
}
function ApiLine({ method, path, note }: { method:string; path:string; note:string }) {
  const c = method === 'GET' ? 'text-[color:var(--color-lime)]' : 'text-[color:var(--color-blood)]'
  return <div><span className={`${c} font-bold w-16 inline-block`}>{method}</span> <span className="text-[color:var(--color-cream)]">{path}</span> <span className="text-[color:var(--color-cream-dim)]">// {note}</span></div>
}
