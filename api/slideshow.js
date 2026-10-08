// Vercel Serverless Function: api/slideshow.js
// Dynamic slideshow management endpoint

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (req.method === 'GET') {
    if (supabaseUrl && supabaseKey) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/slideshow?select=*&order=id.asc`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        const slides = await response.json();
        return res.status(200).json({ success: true, slides });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    return res.status(200).json({
      success: true,
      slides: [
        "/public/slide1.jpg",
        "/public/slide2.jpg",
        "/public/slide3.jpg",
        "/public/slide4.jpg",
        "/public/slide5.jpg"
      ]
    });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
};
