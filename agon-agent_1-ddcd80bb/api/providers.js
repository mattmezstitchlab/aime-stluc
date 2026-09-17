import supabase from './db-client.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase.from('providers').select('*').order('reliability_score', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { stage_name, email, phone, bio, skills, service_areas, style_tags, hourly_rate, portfolio_url } = req.body;
      const { data, error } = await supabase.from('providers').insert({
        stage_name, email, phone, bio,
        skills: skills || [], service_areas: service_areas || [], style_tags: style_tags || [],
        hourly_rate: hourly_rate || 400, portfolio_url,
        reliability_score: 7.5, missions_completed: 0, available: true,
      }).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
