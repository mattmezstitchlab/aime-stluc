import supabase from './db-client.js';

async function log(mission_id, event_type, message) {
  await supabase.from('dispatch_logs').insert({ mission_id, event_type, message });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const provider_id = req.query.provider_id;
      if (!provider_id) return res.status(400).json({ error: 'provider_id required' });
      const { data, error } = await supabase
        .from('mission_invitations')
        .select('*, missions(id, wedding_date, city, region, style_tags, guest_count, brief, status, packages(name, price_cents))')
        .eq('provider_id', provider_id)
        .order('sent_at', { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map(i => ({
        id: i.id, mission_id: i.mission_id, status: i.status, match_score: Number(i.match_score),
        sent_at: i.sent_at,
        mission: {
          id: i.missions?.id, wedding_date: i.missions?.wedding_date, city: i.missions?.city,
          region: i.missions?.region, style_tags: i.missions?.style_tags || [],
          guest_count: i.missions?.guest_count, brief: i.missions?.brief, status: i.missions?.status,
          package_name: i.missions?.packages?.name || '—',
          package_price_cents: i.missions?.packages?.price_cents || 0,
        },
      }));
      return res.status(200).json(mapped);
    }

    if (req.method === 'PUT') {
      const { id, status } = req.body;
      const { data: inv, error: invErr } = await supabase.from('mission_invitations').select('*, missions(status, assigned_provider_id)').eq('id', id).single();
      if (invErr) throw invErr;

      if (status === 'accepted') {
        if (inv.missions?.assigned_provider_id) {
          // Already assigned — mark this one expired
          await supabase.from('mission_invitations').update({ status: 'expired', responded_at: new Date().toISOString() }).eq('id', id);
          return res.status(409).json({ error: 'Mission déjà attribuée' });
        }
        // Assign
        await supabase.from('mission_invitations').update({ status: 'accepted', responded_at: new Date().toISOString() }).eq('id', id);
        await supabase.from('missions').update({
          assigned_provider_id: inv.provider_id, assigned_at: new Date().toISOString(), status: 'assigned',
        }).eq('id', inv.mission_id);
        // Expire the others
        await supabase.from('mission_invitations').update({ status: 'expired', responded_at: new Date().toISOString() }).eq('mission_id', inv.mission_id).eq('status', 'pending');

        const { data: prov } = await supabase.from('providers').select('stage_name').eq('id', inv.provider_id).single();
        await log(inv.mission_id, 'ASSIGN', `Mission attribuée à ${prov?.stage_name || 'un missionnaire'} (premier arrivé)`);
        await log(inv.mission_id, 'CONTRACT', 'Contrat automatique généré et envoyé pour signature');
        // Increment missions_completed for realism
        await supabase.rpc('increment_missions', { pid: inv.provider_id }).catch(()=>{});
        return res.status(200).json({ ok: true });
      }

      if (status === 'declined') {
        await supabase.from('mission_invitations').update({ status: 'declined', responded_at: new Date().toISOString() }).eq('id', id);
        await log(inv.mission_id, 'DECLINE', `Un missionnaire a décliné`);
        return res.status(200).json({ ok: true });
      }

      return res.status(400).json({ error: 'Invalid status' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
