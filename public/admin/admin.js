/* ==========================================================================
   GMSA HTU - Admin Dashboard Script (Root & App Compatible)
   ========================================================================== */

const STORAGE_KEY_STUDENTS = 'gmsa_htu_students';
const STORAGE_KEY_SLIDES = 'gmsa_htu_slides';
const AUTH_KEY = 'gmsa_htu_admin_logged';

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initDashboardTabs();
  initStudentRecords();
  initSlideshowManager();
  initLogoManager();
  initSupabaseConfigForm();
});

/* ==========================================================================
   1. Instant Synchronous Admin Authentication + API Fallback
   ========================================================================== */
function initAuth() {
  const loginForm = document.getElementById('adminLoginForm');
  const logoutBtn = document.getElementById('logoutBtn');

  const isLoggedIn = sessionStorage.getItem(AUTH_KEY) === 'true';
  toggleViews(isLoggedIn);

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = (document.getElementById('username').value || '').trim();
      const pass = (document.getElementById('password').value || '').trim();

      if (!user || !pass) {
        alert('Please enter both username and password.');
        return;
      }

      // Strict credential matching for admin authentication
      const validCredentials = [
        { user: 'admin', pass: 'gmsa2026' },
        { user: 'gmsa', pass: 'gmsa2026' }
      ];

      const authenticated = validCredentials.some(
        c => c.user.toLowerCase() === user.toLowerCase() && c.pass === pass
      );

      if (authenticated) {
        sessionStorage.setItem(AUTH_KEY, 'true');
        toggleViews(true);
        renderStudentsTable();
      } else {
        alert('Access Denied: Invalid username or password.');
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem(AUTH_KEY);
      toggleViews(false);
    });
  }
}

function toggleViews(isLoggedIn) {
  const loginView = document.getElementById('loginView');
  const dashboardView = document.getElementById('dashboardView');

  if (loginView && dashboardView) {
    if (isLoggedIn) {
      loginView.style.display = 'none';
      dashboardView.style.display = 'block';
    } else {
      loginView.style.display = 'flex';
      dashboardView.style.display = 'none';
    }
  }
}

/* ==========================================================================
   2. Dashboard Navigation Tabs
   ========================================================================== */
function initDashboardTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const sectionStudents = document.getElementById('sectionStudents');
  const sectionSlideshow = document.getElementById('sectionSlideshow');
  const sectionLogos = document.getElementById('sectionLogos');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.target;
      if (sectionStudents) sectionStudents.style.display = target === 'sectionStudents' ? 'block' : 'none';
      if (sectionSlideshow) sectionSlideshow.style.display = target === 'sectionSlideshow' ? 'block' : 'none';
      if (sectionLogos) sectionLogos.style.display = target === 'sectionLogos' ? 'block' : 'none';

      if (target === 'sectionStudents') renderStudentsTable();
      if (target === 'sectionSlideshow') renderSlidesGrid();
      if (target === 'sectionLogos') updateLogoPreviews();
    });
  });
}

/* ==========================================================================
   3. Student Records Management & Excel Export
   ========================================================================== */
let allStudents = [];

function initStudentRecords() {
  const searchInput = document.getElementById('searchInput');
  const filterSelect = document.getElementById('filterLevelSelect');
  const exportBtn = document.getElementById('exportExcelBtn');

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (filterSelect) filterSelect.addEventListener('change', applyFilters);
  if (exportBtn) exportBtn.addEventListener('click', exportToExcel);

  renderStudentsTable();
}

function getStudentsFromStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_STUDENTS)) || [];
  } catch (e) {
    return [];
  }
}

async function renderStudentsTable() {
  if (typeof apiGetStudents === 'function') {
    allStudents = await apiGetStudents();
  } else {
    allStudents = getStudentsFromStorage();
  }
  updateStats(allStudents);
  applyFilters();
}

function updateStats(students) {
  const totalEl = document.getElementById('statTotal');
  const btechEl = document.getElementById('statBTech');
  const hndEl = document.getElementById('statHND');
  const othersEl = document.getElementById('statOthers');

  if (totalEl) totalEl.textContent = students.length;
  if (btechEl) btechEl.textContent = students.filter(s => s.programmeLevel === 'BTech').length;
  if (hndEl) hndEl.textContent = students.filter(s => s.programmeLevel === 'HND').length;
  if (othersEl) othersEl.textContent = students.filter(s => s.programmeLevel === 'Others').length;
}

function applyFilters() {
  const searchEl = document.getElementById('searchInput');
  const filterEl = document.getElementById('filterLevelSelect');
  const query = searchEl ? (searchEl.value || '').toLowerCase().trim() : '';
  const levelFilter = filterEl ? filterEl.value : 'ALL';

  const filtered = allStudents.filter(s => {
    const matchesLevel = levelFilter === 'ALL' || s.programmeLevel === levelFilter;
    const matchesQuery = !query || 
      (s.fullName && s.fullName.toLowerCase().includes(query)) ||
      (s.indexNumber && s.indexNumber.toLowerCase().includes(query)) ||
      (s.programme && s.programme.toLowerCase().includes(query)) ||
      (s.contact && s.contact.toLowerCase().includes(query)) ||
      (s.hostel && s.hostel.toLowerCase().includes(query));

    return matchesLevel && matchesQuery;
  });

  const tbody = document.getElementById('studentsTableBody');
  const emptyState = document.getElementById('emptyState');
  const table = document.getElementById('studentsTable');

  if (!tbody) return;
  tbody.innerHTML = '';

  if (filtered.length === 0) {
    if (table) table.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (table) table.style.display = 'table';
  if (emptyState) emptyState.style.display = 'none';

  filtered.forEach((st, idx) => {
    const tr = document.createElement('tr');
    
    let levelBadgeClass = 'badge-others';
    if (st.programmeLevel === 'BTech') levelBadgeClass = 'badge-btech';
    if (st.programmeLevel === 'HND') levelBadgeClass = 'badge-hnd';

    const formattedDate = st.createdAt ? new Date(st.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'N/A';

    tr.innerHTML = `
      <td><strong>${idx + 1}</strong></td>
      <td style="font-weight:600; color:#0F172A;">${escapeHtml(st.fullName)}</td>
      <td><code style="background:#E2E8F0; padding:2px 6px; border-radius:4px; font-weight:700;">${escapeHtml(st.indexNumber)}</code></td>
      <td><span class="badge-level ${levelBadgeClass}">${escapeHtml(st.programmeLevel)}</span></td>
      <td>${escapeHtml(st.programme)}</td>
      <td><a href="tel:${escapeHtml(st.contact)}" style="color:#006837; font-weight:600; text-decoration:none;">${escapeHtml(st.contact)}</a></td>
      <td>${escapeHtml(st.hostel)}</td>
      <td style="font-size:0.825rem; color:#64748B;">${formattedDate}</td>
      <td>
        <button type="button" class="btn-delete-record" data-id="${st.id}" title="Delete Record">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-delete-record').forEach(btn => {
    btn.addEventListener('click', () => {
      const recordId = btn.dataset.id;
      deleteStudent(recordId);
    });
  });
}

async function deleteStudent(id) {
  if (confirm('Are you sure you want to delete this student record? This action cannot be undone.')) {
    if (typeof apiDeleteStudent === 'function') {
      await apiDeleteStudent(id);
    } else {
      let students = getStudentsFromStorage();
      students = students.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    }
    await renderStudentsTable();
  }
}

function exportToExcel() {
  const students = getStudentsFromStorage();
  if (students.length === 0) {
    alert('No records available to export.');
    return;
  }

  const excelData = students.map((s, idx) => ({
    "S/N": idx + 1,
    "Full Name": s.fullName || "",
    "Index Number": s.indexNumber || "",
    "Programme Level": s.programmeLevel || "",
    "Programme": s.programme || "",
    "Contact Number": s.contact || "",
    "Hostel / Residence": s.hostel || "",
    "Date Registered": s.createdAt ? new Date(s.createdAt).toLocaleString() : ""
  }));

  if (typeof XLSX !== 'undefined') {
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    worksheet['!cols'] = [
      { wch: 6 },  { wch: 30 }, { wch: 18 }, { wch: 18 },
      { wch: 32 }, { wch: 18 }, { wch: 28 }, { wch: 22 }
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GMSA Students");
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `GMSA_HTU_Student_Records_${dateStr}.xlsx`);
  } else {
    exportToCSV(excelData);
  }
}

function exportToCSV(data) {
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(","));
  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `GMSA_HTU_Student_Records_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function initSlideshowManager() {
  const dropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('slideFileInput');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', async () => {
      const slides = await getSlidesFromStorage();
      if (slides.length >= 5) {
        alert('Maximum of 5 slideshow images allowed! Please replace or delete an existing image.');
        return;
      }
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleImageUpload(file);
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.style.background = '#C8E6C9';
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.style.background = '#F0FDF4';
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.background = '#F0FDF4';
      const file = e.dataTransfer.files[0];
      if (file) handleImageUpload(file);
    });
  }

  renderSlidesGrid();
}

async function getSlidesFromStorage() {
  if (typeof apiGetSlides === 'function') {
    return await apiGetSlides();
  }
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_SLIDES));
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

async function saveSlidesToStorage(slides) {
  if (typeof apiSaveSlides === 'function') {
    await apiSaveSlides(slides);
  } else {
    localStorage.setItem(STORAGE_KEY_SLIDES, JSON.stringify(slides.slice(0, 5)));
  }
  await renderSlidesGrid();
}

async function renderSlidesGrid() {
  const slides = await getSlidesFromStorage();
  const grid = document.getElementById('slidesGrid');
  const countSpan = document.getElementById('slideCountSpan');

  if (countSpan) countSpan.textContent = slides.length;
  if (!grid) return;

  grid.innerHTML = '';

  slides.forEach((src, idx) => {
    const card = document.createElement('div');
    card.className = 'slide-manage-card';

    card.innerHTML = `
      <img src="${src}" class="slide-preview-img" alt="Slide ${idx + 1}" onerror="this.onerror=null; this.src='/public/slide${idx + 1}.svg';">
      <div class="slide-card-body">
        <div class="slide-card-title">Slide #${idx + 1}</div>
        <div class="slide-card-actions">
          <button type="button" class="btn-slide-action btn-slide-replace" data-index="${idx}">Replace</button>
          <button type="button" class="btn-slide-action btn-slide-delete" data-index="${idx}">Delete</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  grid.querySelectorAll('.btn-slide-replace').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetIndex = parseInt(btn.dataset.index, 10);
      promptReplaceSlide(targetIndex);
    });
  });

  grid.querySelectorAll('.btn-slide-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetIndex = parseInt(btn.dataset.index, 10);
      deleteSlide(targetIndex);
    });
  });
}

function handleImageUpload(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file (PNG, JPG, WEBP).');
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Src = e.target.result;
    let slides = await getSlidesFromStorage();
    if (slides.length < 5) {
      slides.push(base64Src);
      await saveSlidesToStorage(slides);
    } else {
      alert('Maximum of 5 slideshow images reached! Delete or replace an existing slide.');
    }
  };
  reader.readAsDataURL(file);
}

function promptReplaceSlide(index) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        let slides = await getSlidesFromStorage();
        slides[index] = event.target.result;
        await saveSlidesToStorage(slides);
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

async function deleteSlide(index) {
  let slides = await getSlidesFromStorage();
  if (slides.length <= 1) {
    alert('You must keep at least 1 slide in the slideshow.');
    return;
  }
  if (confirm(`Are you sure you want to remove Slide #${index + 1}?`)) {
    slides.splice(index, 1);
    await saveSlidesToStorage(slides);
  }
}

/* ==========================================================================
   4. Custom Logo Manager (GMSA Logo & HTU Logo)
   ========================================================================== */
function updateLogoPreviews() {
  const gmsaPreview = document.getElementById('adminGmsaLogoPreview');
  const htuPreview = document.getElementById('adminHtuLogoPreview');

  const savedGmsa = localStorage.getItem('gmsa_htu_logo_gmsa');
  const savedHtu = localStorage.getItem('gmsa_htu_logo_htu');

  if (gmsaPreview) gmsaPreview.src = savedGmsa || '/public/gmsa-logo.svg';
  if (htuPreview) htuPreview.src = savedHtu || '/public/htu-logo.svg';

  if (typeof loadDynamicLogos === 'function') {
    loadDynamicLogos();
  }
}

function initLogoManager() {
  const uploadGmsaBtn = document.getElementById('uploadGmsaLogoBtn');
  const gmsaInput = document.getElementById('gmsaLogoFileInput');
  const resetGmsaBtn = document.getElementById('resetGmsaLogoBtn');

  const uploadHtuBtn = document.getElementById('uploadHtuLogoBtn');
  const htuInput = document.getElementById('htuLogoFileInput');
  const resetHtuBtn = document.getElementById('resetHtuLogoBtn');

  if (uploadGmsaBtn && gmsaInput) {
    uploadGmsaBtn.addEventListener('click', () => gmsaInput.click());
    gmsaInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleLogoUpload('gmsa', file);
    });
  }

  if (resetGmsaBtn) {
    resetGmsaBtn.addEventListener('click', async () => {
      if (confirm('Reset GMSA logo back to default emblem?')) {
        if (typeof apiResetLogo === 'function') await apiResetLogo('gmsa');
        else localStorage.removeItem('gmsa_htu_logo_gmsa');
        updateLogoPreviews();
      }
    });
  }

  if (uploadHtuBtn && htuInput) {
    uploadHtuBtn.addEventListener('click', () => htuInput.click());
    htuInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleLogoUpload('htu', file);
    });
  }

  if (resetHtuBtn) {
    resetHtuBtn.addEventListener('click', async () => {
      if (confirm('Reset HTU logo back to default emblem?')) {
        if (typeof apiResetLogo === 'function') await apiResetLogo('htu');
        else localStorage.removeItem('gmsa_htu_logo_htu');
        updateLogoPreviews();
      }
    });
  }

  updateLogoPreviews();
}

function handleLogoUpload(type, file) {
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file (PNG, JPG, SVG, WEBP).');
    return;
  }
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Data = e.target.result;
    if (typeof apiSaveLogo === 'function') {
      await apiSaveLogo(type, base64Data);
    } else {
      localStorage.setItem(type === 'gmsa' ? 'gmsa_htu_logo_gmsa' : 'gmsa_htu_logo_htu', base64Data);
    }
    updateLogoPreviews();
    alert(`Custom ${type.toUpperCase()} logo saved successfully!`);
  };
  reader.readAsDataURL(file);
}

/* ==========================================================================
   5. Supabase Credentials Configuration Handler
   ========================================================================== */
function initSupabaseConfigForm() {
  const form = document.getElementById('supabaseConfigForm');
  const urlInput = document.getElementById('adminSupabaseUrl');
  const keyInput = document.getElementById('adminSupabaseKey');
  const statusSpan = document.getElementById('supabaseConfigStatus');

  if (urlInput) urlInput.value = localStorage.getItem('gmsa_htu_supabase_url') || '';
  if (keyInput) keyInput.value = localStorage.getItem('gmsa_htu_supabase_key') || '';

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = (urlInput ? urlInput.value : '').trim();
      const key = (keyInput ? keyInput.value : '').trim();

      localStorage.setItem('gmsa_htu_supabase_url', url);
      localStorage.setItem('gmsa_htu_supabase_key', key);

      if (typeof initSupabase === 'function') {
        initSupabase();
      }

      if (statusSpan) {
        statusSpan.textContent = '✓ Supabase credentials saved! Connecting...';
        setTimeout(async () => {
          statusSpan.textContent = '';
          await renderStudentsTable();
        }, 1500);
      }
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}
