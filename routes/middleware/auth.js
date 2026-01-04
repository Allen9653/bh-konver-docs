/**
 * Authentication Middleware for Express.js routes
 * Validates Supabase JWT tokens for protected endpoints
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const validateAuthToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Neautorizovan pristup. Token nije pronađen.' 
      });
    }

    // Validacija tokena preko Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('[AUTH] Token validation failed:', error?.message);
      return res.status(401).json({ 
        error: 'Neautorizovan pristup. Neispravan token.' 
      });
    }

    // Ako je validan, dodaj user info u request
    req.user = user;
    next();
  } catch (err) {
    console.error('[AUTH] Auth check failed:', err.message);
    return res.status(500).json({ 
      error: 'Greška pri provjeri autentifikacije.' 
    });
  }
};

module.exports = { validateAuthToken };
