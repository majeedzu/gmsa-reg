/* ==========================================================================
   GMSA HTU - Admin Dashboard Script
   ========================================================================== */

const STORAGE_KEY_STUDENTS = 'gmsa_htu_students';
const STORAGE_KEY_SLIDES = 'gmsa_htu_slides';
const AUTH_KEY = 'gmsa_htu_admin_logged';

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initDashboardTabs();
  initStudentRecords();
  initSlideshowManager();
});

/* ==========================================================================
   1. Admin Authentication
   ========================================================================== */
function initAuth() {
  const loginForm = document.getElementById('adminLoginForm');
  const logoutBtn = document.getElementById('logoutBtn');

  const isLoggedIn = sessionStorage.getItem(AUTH_KEY) === 'true';
  toggleViews(isLoggedIn);

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('username').value.trim();
      const pass = document.getElementById('password').value.trim();

      if (user === 'admin' && (pass === 'gmsa2026' || pass === 'admin')) {
        sessionStorage.setItem(AUTH_KEY, 'true');
        toggleViews(true);
        renderStudentsTable();
      } else {
        alert('Invalid credentials! Please try username: admin / password: gmsa2026');
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

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const target = tab.dataset.target;
      if (target === 'sectionStudents') {
        sectionStudents.style.display = 'block';
        sectionSlideshow.style.display = 'none';
        renderStudentsTable();
      } else {
        sectionStudents.style.display = 'none';
        sectionSlideshow.style.display = 'block';
        renderSlidesGrid();
      }
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

function renderStudentsTable() {
  allStudents = getStudentsFromStorage();
  updateStats(allStudents);
  applyFilters();
}

function updateStats(students) {
  document.getElementById('statTotal').textContent = students.length;
  document.getElementById('statBTech').textContent = students.filter(s => s.programmeLevel === 'BTech').length;
  document.getElementById('statHND').textContent = students.filter(s => s.programmeLevel === 'HND').length;
  document.getElementById('statOthers').textContent = students.filter(s => s.programmeLevel === 'Others').length;
}

function applyFilters() {
  const query = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  const levelFilter = document.getElementById('filterLevelSelect').value;

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
    table.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  table.style.display = 'table';
  emptyState.style.display = 'none';

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

  // Attach delete handlers
  tbody.querySelectorAll('.btn-delete-record').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const recordId = btn.dataset.id;
      deleteStudent(recordId);
    });
  });
}

function deleteStudent(id) {
  if (confirm('Are you sure you want to delete this student record? This action cannot be undone.')) {
    let students = getStudentsFromStorage();
    students = students.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    renderStudentsTable();
  }
}

function exportToExcel() {
  const students = getStudentsFromStorage();
  if (students.length === 0) {
    alert('No records available to export.');
    return;
  }

  // Format data for Excel
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
    // Generate .xlsx file via SheetJS
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Auto column widths
    const colWidths = [
      { wch: 6 },  // S/N
      { wch: 30 }, // Full Name
      { wch: 18 }, // Index Number
      { wch: 18 }, // Level
      { wch: 32 }, // Programme
      { wch: 18 }, // Contact
      { wch: 28 }, // Hostel
      { wch: 22 }  // Date
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GMSA Students");

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `GMSA_HTU_Student_Records_${dateStr}.xlsx`);
  } else {
    // CSV Fallback
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

/* ==========================================================================
   4. Slideshow Manager (Max 5 Images)
   ========================================================================== */
function initSlideshowManager() {
  const dropzone = document.getElementById('uploadDropzone');
  const fileInput = document.getElementById('slideFileInput');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => {
      const slides = getSlidesFromStorage();
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

function getSlidesFromStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY_SLIDES));
    if (saved && Array.isArray(saved) && saved.length > 0) return saved;
  } catch (e) {}
  
  // Defaults (5 images)
  return [
    '../../public/slide1.jpg',
    '../../public/slide2.jpg',
    '../../public/slide3.jpg',
    '../../public/slide4.jpg',
    '../../public/slide5.jpg'
  ];
}

function saveSlidesToStorage(slides) {
  localStorage.setItem(STORAGE_KEY_SLIDES, JSON.stringify(slides.slice(0, 5)));
  renderSlidesGrid();
}

function renderSlidesGrid() {
  const slides = getSlidesFromStorage();
  const grid = document.getElementById('slidesGrid');
  const countSpan = document.getElementById('slideCountSpan');

  if (countSpan) countSpan.textContent = slides.length;
  if (!grid) return;

  grid.innerHTML = '';

  slides.forEach((src, idx) => {
    const card = document.createElement('div');
    card.className = 'slide-manage-card';

    card.innerHTML = `
      <img src="${src}" class="slide-preview-img" alt="Slide ${idx + 1}">
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

  // Action Handlers
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
  reader.onload = (e) => {
    const base64Src = e.target.result;
    let slides = getSlidesFromStorage();
    if (slides.length < 5) {
      slides.push(base64Src);
      saveSlidesToStorage(slides);
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
      reader.onload = (event) => {
        let slides = getSlidesFromStorage();
        slides[index] = event.target.result;
        saveSlidesToStorage(slides);
      };
      reader.readAsDataURL(file);
    }
  };
  input.click();
}

function deleteSlide(index) {
  let slides = getSlidesFromStorage();
  if (slides.length <= 1) {
    alert('You must keep at least 1 slide in the slideshow.');
    return;
  }
  if (confirm(`Are you sure you want to remove Slide #${index + 1}?`)) {
    slides.splice(index, 1);
    saveSlidesToStorage(slides);
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
