/**
 * Simple bearer token authentication middleware
 */
function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.substring(7);
  const validToken = process.env.API_KEY;

  if (!validToken) {
    console.error("API_KEY not configured in environment");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  if (token !== validToken) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  next();
}

module.exports = auth;
