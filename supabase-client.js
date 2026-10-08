/* ==========================================================================
   GMSA HTU - Unified Supabase Integration & Settings Module
   ========================================================================== */

const SUPABASE_URL_KEY = 'gmsa_htu_supabase_url';
const SUPABASE_ANON_KEY = 'gmsa_htu_supabase_key';
const GMSA_LOGO_KEY = 'gmsa_htu_logo_gmsa';
const HTU_LOGO_KEY = 'gmsa_htu_logo_htu';

let supabaseClient = null;

function getSupabaseConfig() {
  const storedUrl = localStorage.getItem(SUPABASE_URL_KEY) || (window.SUPABASE_URL || '');
  const storedKey = localStorage.getItem(SUPABASE_ANON_KEY) || (window.SUPABASE_ANON_KEY || '');
  return { url: storedUrl.trim(), key: storedKey.trim() };
}

function initSupabase() {
  const { url, key } = getSupabaseConfig();
  if (url && key && window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      supabaseClient = window.supabase.createClient(url, key);
      console.log('✓ Supabase Client initialized successfully with endpoint:', url);
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      supabaseClient = null;
    }
  } else {
    supabaseClient = null;
  }
  return supabaseClient;
}

// Auto-initialize on script load
if (typeof window !== 'undefined') {
  initSupabase();
}

/* ==========================================================================
   1. Student Records API (Supabase + LocalStorage sync)
   ========================================================================== */
async function apiGetStudents() {
  const client = supabaseClient || initSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        // Map database fields to application format
        const mapped = data.map(s => ({
          id: s.id,
          fullName: s.full_name,
          indexNumber: s.index_number,
          programmeLevel: s.programme_level,
          programme: s.programme,
          contact: s.contact,
          hostel: s.hostel,
          createdAt: s.created_at
        }));
        // Update localStorage cache
        localStorage.setItem('gmsa_htu_students', JSON.stringify(mapped));
        return mapped;
      } else {
        console.warn('Supabase fetch error:', error);
      }
    } catch (err) {
      console.warn('Network error fetching from Supabase:', err);
    }
  }

  // Fallback to LocalStorage cache
  try {
    return JSON.parse(localStorage.getItem('gmsa_htu_students')) || [];
  } catch (e) {
    return [];
  }
}

async function apiSaveStudent(studentData) {
  const client = supabaseClient || initSupabase();

  // First check duplicate in local storage cache
  let localStudents = [];
  try {
    localStudents = JSON.parse(localStorage.getItem('gmsa_htu_students')) || [];
  } catch (e) {}

  const isDuplicateLocal = localStudents.some(s =>
    (s.indexNumber || '').trim().toLowerCase() === (studentData.indexNumber || '').trim().toLowerCase()
  );

  if (isDuplicateLocal) {
    return { success: false, reason: 'EXISTS' };
  }

  if (client) {
    try {
      const { data, error } = await client
        .from('students')
        .insert([{
          full_name: studentData.fullName,
          index_number: studentData.indexNumber,
          programme_level: studentData.programmeLevel,
          programme: studentData.programme,
          contact: studentData.contact,
          hostel: studentData.hostel
        }])
        .select();

      if (!error && data && data.length > 0) {
        const created = data[0];
        const newRecord = {
          id: created.id,
          fullName: created.full_name,
          indexNumber: created.index_number,
          programmeLevel: created.programme_level,
          programme: created.programme,
          contact: created.contact,
          hostel: created.hostel,
          createdAt: created.created_at
        };
        localStudents.unshift(newRecord);
        localStorage.setItem('gmsa_htu_students', JSON.stringify(localStudents));
        return { success: true, record: newRecord };
      } else if (error) {
        console.warn('Supabase insert error:', error);
        if (error.code === '23505' || (error.message && error.message.includes('unique'))) {
          return { success: false, reason: 'EXISTS' };
        }
      }
    } catch (err) {
      console.warn('Supabase insert network exception:', err);
    }
  }

  // Offline / Fallback insertion
  const fallbackRecord = {
    id: 'st_' + Date.now(),
    ...studentData,
    createdAt: new Date().toISOString()
  };
  localStudents.unshift(fallbackRecord);
  localStorage.setItem('gmsa_htu_students', JSON.stringify(localStudents));
  return { success: true, record: fallbackRecord };
}

async function apiDeleteStudent(id) {
  const client = supabaseClient || initSupabase();

  if (client && !id.startsWith('st_')) {
    try {
      const { error } = await client
        .from('students')
        .delete()
        .eq('id', id);
      if (error) console.warn('Supabase delete error:', error);
    } catch (err) {
      console.warn('Supabase delete exception:', err);
    }
  }

  let localStudents = [];
  try {
    localStudents = JSON.parse(localStorage.getItem('gmsa_htu_students')) || [];
  } catch (e) {}
  localStudents = localStudents.filter(s => s.id !== id);
  localStorage.setItem('gmsa_htu_students', JSON.stringify(localStudents));
  return true;
}

/* ==========================================================================
   2. Custom Logos & Site Settings API
   ========================================================================== */
async function loadDynamicLogos() {
  const client = supabaseClient || initSupabase();

  let gmsaLogo = localStorage.getItem(GMSA_LOGO_KEY);
  let htuLogo = localStorage.getItem(HTU_LOGO_KEY);

  if (client && (!gmsaLogo || !htuLogo)) {
    try {
      const { data, error } = await client
        .from('settings')
        .select('*')
        .in('key', ['gmsa_logo', 'htu_logo']);

      if (!error && Array.isArray(data)) {
        data.forEach(item => {
          if (item.key === 'gmsa_logo' && item.value) {
            gmsaLogo = item.value;
            localStorage.setItem(GMSA_LOGO_KEY, gmsaLogo);
          }
          if (item.key === 'htu_logo' && item.value) {
            htuLogo = item.value;
            localStorage.setItem(HTU_LOGO_KEY, htuLogo);
          }
        });
      }
    } catch (err) {
      console.warn('Error loading logos from Supabase:', err);
    }
  }

  // Apply to GMSA Logos on page
  if (gmsaLogo) {
    document.querySelectorAll('#gmsaLogoImg, #loginLogoImg, .admin-nav-brand img').forEach(img => {
      img.src = gmsaLogo;
      img.style.display = 'block';
    });
  }

  // Apply to HTU Logos on page
  if (htuLogo) {
    document.querySelectorAll('#htuLogoImg').forEach(img => {
      img.src = htuLogo;
      img.style.display = 'block';
    });
  }
}

async function apiSaveLogo(logoType, base64OrUrl) {
  const keyName = logoType === 'gmsa' ? GMSA_LOGO_KEY : HTU_LOGO_KEY;
  const dbKey = logoType === 'gmsa' ? 'gmsa_logo' : 'htu_logo';

  localStorage.setItem(keyName, base64OrUrl);
  loadDynamicLogos();

  const client = supabaseClient || initSupabase();
  if (client) {
    try {
      await client
        .from('settings')
        .upsert({ key: dbKey, value: base64OrUrl, updated_at: new Date().toISOString() });
    } catch (err) {
      console.warn('Error saving logo to Supabase:', err);
    }
  }
}

async function apiResetLogo(logoType) {
  const keyName = logoType === 'gmsa' ? GMSA_LOGO_KEY : HTU_LOGO_KEY;
  const dbKey = logoType === 'gmsa' ? 'gmsa_logo' : 'htu_logo';
  const defaultSrc = logoType === 'gmsa' ? '/public/gmsa-logo.svg' : '/public/htu-logo.svg';

  localStorage.removeItem(keyName);

  if (logoType === 'gmsa') {
    document.querySelectorAll('#gmsaLogoImg, #loginLogoImg, .admin-nav-brand img').forEach(img => {
      img.src = defaultSrc;
      img.style.display = 'block';
    });
  } else {
    document.querySelectorAll('#htuLogoImg').forEach(img => {
      img.src = defaultSrc;
      img.style.display = 'block';
    });
  }

  const client = supabaseClient || initSupabase();
  if (client) {
    try {
      await client.from('settings').delete().eq('key', dbKey);
    } catch (e) {}
  }
}

/* ==========================================================================
   3. Slideshow Management API
   ========================================================================== */
async function apiGetSlides() {
  const client = supabaseClient || initSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('slideshow')
        .select('*')
        .order('id', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const slideUrls = data.map(s => s.image_url);
        localStorage.setItem('gmsa_htu_slides', JSON.stringify(slideUrls));
        return slideUrls;
      }
    } catch (err) {
      console.warn('Error fetching slides from Supabase:', err);
    }
  }

  try {
    const saved = JSON.parse(localStorage.getItem('gmsa_htu_slides'));
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
  } catch (e) {}

  return [
    '/public/slide1.jpg',
    '/public/slide2.jpg',
    '/public/slide3.jpg',
    '/public/slide4.jpg',
    '/public/slide5.jpg'
  ];
}

async function apiSaveSlides(slidesArray) {
  const cleanSlides = slidesArray.slice(0, 5);
  localStorage.setItem('gmsa_htu_slides', JSON.stringify(cleanSlides));

  const client = supabaseClient || initSupabase();
  if (client) {
    try {
      // Refresh slideshow table with new slides
      await client.from('slideshow').delete().neq('id', 0);
      const rows = cleanSlides.map((url, i) => ({
        image_url: url,
        title: `Slide #${i + 1}`
      }));
      await client.from('slideshow').insert(rows);
    } catch (err) {
      console.warn('Error saving slides to Supabase:', err);
    }
  }
}

// Auto-run logo loading on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    loadDynamicLogos();
  });
}
