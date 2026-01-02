/**
 * Authentication Middleware for Express.js routes
 * Validates Supabase JWT tokens for protected endpoints
 */

const validateAuthToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Neautorizovan pristup. Token nije pronađen.' 
    });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token || token.length < 10) {
    return res.status(401).json({ 
      error: 'Neautorizovan pristup. Neispravan token.' 
    });
  }

  // Token validation would be done via Supabase
  // For now, we just check if token exists
  // In production, verify with Supabase Admin API
  req.userToken = token;
  next();
};

module.exports = { validateAuthToken };
