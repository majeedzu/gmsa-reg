// Vercel Serverless Function: api/students.js
// Handles student registration & unique index_number verification

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

  // Check if valid real Supabase credentials are configured
  const isRealSupabase = supabaseUrl && 
                         !supabaseUrl.includes('your-project-id') && 
                         supabaseKey && 
                         !supabaseKey.includes('your-actual-supabase');

  if (req.method === 'GET') {
    if (isRealSupabase) {
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/students?select=*&order=created_at.desc`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        const data = await response.json();
        return res.status(200).json({ success: true, data });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }
    return res.status(200).json({ success: true, message: "Client LocalStorage active" });
  }

  if (req.method === 'POST') {
    const { fullName, indexNumber, programmeLevel, programme, contact, hostel } = req.body || {};

    if (!fullName || !indexNumber || !programmeLevel || !programme || !contact || !hostel) {
      return res.status(400).json({ success: false, reason: "MISSING_FIELDS" });
    }

    if (isRealSupabase) {
      try {
        // Check duplicate index_number in Supabase
        const checkRes = await fetch(`${supabaseUrl}/rest/v1/students?index_number=eq.${encodeURIComponent(indexNumber)}`, {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          }
        });
        const existing = await checkRes.json();

        if (Array.isArray(existing) && existing.length > 0) {
          return res.status(409).json({
            success: false,
            reason: "EXISTS",
            message: "Your record already exist. Jazaakallaahu Khairan!!!"
          });
        }

        // Insert new record to Supabase
        const insertRes = await fetch(`${supabaseUrl}/rest/v1/students`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            full_name: fullName,
            index_number: indexNumber,
            programme_level: programmeLevel,
            programme: programme,
            contact: contact,
            hostel: hostel
          })
        });

        const created = await insertRes.json();
        return res.status(201).json({
          success: true,
          message: "Record submitted successfully. Jazaakallaahu Khairan!!!",
          data: created
        });
      } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
    }

    // Default fast response when running on Vercel without Supabase env configured
    return res.status(200).json({
      success: true,
      message: "Record submitted successfully. Jazaakallaahu Khairan!!!"
    });
  }

  return res.status(405).json({ error: "Method Not Allowed" });
};
