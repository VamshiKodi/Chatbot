import { supabase } from '../config/supabase.js';

// Verifies the Supabase JWT sent in the Authorization header
// and attaches the authenticated user to req.user
export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: missing token' });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Unauthorized: invalid token' });
  }

  req.user = data.user;
  next();
};

// Requires requireAuth to have run first; checks the admin role server-side
export const requireAdmin = async (req, res, next) => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', req.user.id)
    .single();

  if (error || profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: admin access required' });
  }

  next();
};
