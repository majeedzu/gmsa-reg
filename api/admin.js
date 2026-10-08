// Vercel Serverless Function: api/admin.js
// Admin authentication & export handler

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { username, password } = req.body || {};
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'gmsa2026';

    if (username === adminUser && password === adminPass) {
      return res.status(200).json({
        success: true,
        token: `gmsa_token_${Date.now()}`,
        message: "Admin authenticated successfully"
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
};
