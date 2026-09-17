import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../lib/supabase'
import { signInWithGoogle } from '../lib/googleAuth'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const nav = useNavigate()
  const [mode, setMode] = useState<'signin'|'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true)
    const fn = mode === 'signin' ? supabase.auth.signInWithPassword : supabase.auth.signUp
    const { error } = await fn.call(supabase.auth, { email, password })
    setLoading(false)
    if (error) setErr(error.message); else nav('/admin')
  }

  return (
    <div className="max-w-md mx-auto px-5 md:px-8 py-20">
      <h1 className="font-display text-5xl mb-2">{mode === 'signin' ? 'Retour dans le noir.' : 'Bienvenue dans le noir.'}</h1>
      <p className="text-[color:var(--color-cream-dim)] mb-8 text-sm">Compte démo : <code className="font-mono text-[color:var(--color-blood)]">demo@aime.wedding</code> / <code className="font-mono text-[color:var(--color-blood)]">rocknroll</code></p>

      <form onSubmit={submit} className="space-y-6">
        <div><label className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)]">Email</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div>
        <div><label className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)]">Mot de passe</label><input type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)}/></div>
        {err && <div className="font-mono text-xs text-[color:var(--color-blood)]">{err}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading && <Loader2 className="animate-spin" size={14}/>}
          {mode === 'signin' ? 'Se connecter' : 'Créer le compte'}
        </button>
      </form>

      <div className="my-6 text-center font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)]">— ou —</div>
      <button onClick={() => signInWithGoogle('AIME Wedding')} className="btn-ghost w-full justify-center">Continuer avec Google</button>

      <div className="mt-8 text-center">
        <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} className="font-mono text-[10px] uppercase tracking-widest text-[color:var(--color-cream-dim)] hover:text-[color:var(--color-cream)]">
          {mode === 'signin' ? "Pas encore de compte ? Créer" : "Déjà inscrit ? Se connecter"}
        </button>
      </div>
    </div>
  )
}
