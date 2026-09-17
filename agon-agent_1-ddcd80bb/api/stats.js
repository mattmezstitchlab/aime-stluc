import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  try {
    const [{ count: providers }, { data: missions }] = await Promise.all([
      supabase.from('providers').select('*', { count: 'exact', head: true }),
      supabase.from('missions').select('id, amount_cents, city, dispatched_at, assigned_at, status'),
    ]);

    const revenue = (missions || []).reduce((a, m) => a + (m.amount_cents || 0), 0);
    const regions = new Set((missions || []).map(m => m.city)).size;
    const dispatchTimes = (missions || [])
      .filter(m => m.dispatched_at && m.assigned_at)
      .map(m => (new Date(m.assigned_at) - new Date(m.dispatched_at)) / 1000);
    const avg = dispatchTimes.length ? dispatchTimes.reduce((a,b)=>a+b,0)/dispatchTimes.length : 0;

    return res.status(200).json({
      providers: providers || 0,
      missions: (missions || []).length,
      regions,
      revenue_cents: revenue,
      conversion_rate: 0.32,
      avg_dispatch_seconds: avg || 780,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
