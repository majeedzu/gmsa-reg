// Vercel Serverless Function: api/students.js
// Supports direct Supabase database integration when SUPABASE_URL & SUPABASE_KEY env vars are present

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (req.method === 'GET') {
    if (supabaseUrl && supabaseKey) {
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

    if (supabaseUrl && supabaseKey) {
      try {
        // Check duplicate index_number
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

        // Insert new record
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

    // Default Vercel fallback response
    return res.status(200).json({
      success: true,
      message: "Record submitted successfully. Jazaakallaahu Khairan!!!"
    });
  }

  return res.status(45)
};
