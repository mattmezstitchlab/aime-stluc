import supabase from './db-client.js';

async function log(mission_id, event_type, message) {
  await supabase.from('dispatch_logs').insert({ mission_id, event_type, message });
}

function scoreProvider(provider, mission, requiredSkills) {
  let score = 0;
  const skillOverlap = provider.skills.filter(s => requiredSkills.includes(s)).length;
  score += Math.min(40, skillOverlap * 20);
  const styleOverlap = (provider.style_tags || []).filter(t => (mission.style_tags || []).includes(t)).length;
  score += Math.min(25, styleOverlap * 10);
  score += Math.min(20, (provider.reliability_score || 0) * 2);
  if ((provider.service_areas || []).includes(mission.region)) score += 10;
  score += 5;
  return score;
}

function requiredSkillsFor(pkg, options) {
  const base = ['Photographe', 'DJ', 'Coordinateur.rice'];
  const opt = [];
  if ((options || []).some(o => o.includes('Vidéaste'))) opt.push('Vidéaste');
  if ((options || []).some(o => o.includes('Groupe'))) opt.push('Groupe live');
  if ((options || []).some(o => o.includes('Officiant'))) opt.push('Officiant laïc');
  if ((options || []).some(o => o.includes('Cheffe') || o.includes('chef'))) opt.push('Chef.fe');
  if ((options || []).some(o => o.includes('Bar'))) opt.push('Bar/mixologie');
  if ((options || []).some(o => o.includes('Feu'))) opt.push('Pyrotechnicien');
  if (pkg && pkg.slug === 'full-chaos-controle') opt.push('Scénographe', 'MC/animation');
  return [...new Set([...base, ...opt])];
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('missions')
        .select('*, packages(name, price_cents), providers(stage_name)')
        .order('id', { ascending: false })
        .limit(50);
      if (error) throw error;
      const mapped = (data || []).map(m => ({
        ...m,
        package_name: m.packages?.name || '—',
        package_price_cents: m.packages?.price_cents || 0,
        assigned_provider_name: m.providers?.stage_name || null,
      }));
      return res.status(200).json(mapped);
    }

    if (req.method === 'POST') {
      const { vision, package_slug, signature_ok } = req.body;
      if (!vision || !package_slug || !signature_ok) return res.status(400).json({ error: 'Missing fields' });

      const { data: pkg, error: pkgErr } = await supabase.from('packages').select('*').eq('slug', package_slug).single();
      if (pkgErr) throw pkgErr;

      // 1. Create/find couple
      let couple;
      const existing = await supabase.from('couples').select('*').eq('email', vision.contact_email).maybeSingle();
      if (existing.data) couple = existing.data;
      else {
        const ins = await supabase.from('couples').insert({
          first_names: vision.first_names, email: vision.contact_email, phone: vision.contact_phone,
        }).select().single();
        if (ins.error) throw ins.error;
        couple = ins.data;
      }

      // 2. Create mission
      const brief = `${vision.first_names} · ${pkg.name} · ${vision.city} · ${vision.guest_count} invités · style ${(vision.style_tags||[]).join('/')}`;
      const { data: mission, error: mErr } = await supabase.from('missions').insert({
        couple_id: couple.id, package_id: pkg.id,
        wedding_date: vision.wedding_date, city: vision.city, region: vision.region,
        guest_count: vision.guest_count, style_tags: vision.style_tags || [],
        options: vision.options || [], budget_range: vision.budget_range,
        notes: vision.notes, brief,
        status: 'dispatching', amount_cents: pkg.price_cents,
        dispatched_at: new Date().toISOString(),
      }).select().single();
      if (mErr) throw mErr;

      await log(mission.id, 'CREATED', `Mission créée — ${pkg.name} · ${vision.city}`);
      await log(mission.id, 'PAYMENT', `Paiement de ${(pkg.price_cents/100).toLocaleString('fr-FR')} € confirmé (Stripe sim)`);

      // 3. Match providers
      const required = requiredSkillsFor(pkg, vision.options);
      const { data: providers } = await supabase.from('providers').select('*').eq('available', true);
      const scored = (providers || [])
        .map(p => ({ p, score: scoreProvider(p, mission, required), skillMatch: p.skills.some(s => required.includes(s)) }))
        .filter(x => x.skillMatch)
        .sort((a,b) => b.score - a.score)
        .slice(0, 10);

      await log(mission.id, 'MATCH', `${scored.length} missionnaires filtrés (skills: ${required.join(', ')})`);

      // 4. Create invitations
      if (scored.length > 0) {
        const invites = scored.map(x => ({ mission_id: mission.id, provider_id: x.p.id, status: 'pending', match_score: x.score }));
        await supabase.from('mission_invitations').insert(invites);
        await log(mission.id, 'NOTIFY', `${scored.length} invitations envoyées (email + SMS)`);
      }

      // 5. Roadmap stub
      await supabase.from('roadmaps').insert({ mission_id: mission.id, timeline_json: { generated: true, steps: 12 } });
      await log(mission.id, 'BRIEF', 'Feuille de route auto-générée (12 sections)');

      // Roles for UI recap
      const roleCount = {};
      required.forEach(r => { roleCount[r] = (roleCount[r]||0) + 1 });

      return res.status(201).json({
        mission_id: mission.id,
        matched: scored.length,
        assignments: Object.entries(roleCount).map(([role, count]) => ({ role, count })),
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
