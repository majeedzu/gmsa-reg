/* ==========================================================================
   GMSA HTU - Ghana Muslim Students' Association, Ho Technical University Chapter
   Student Page Logic & Database Integration (Root & App Compatible)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initSlideshow();
  initProgrammeSuggestions();
  initRegistrationForm();
  initModal();
});

const STORAGE_KEY_STUDENTS = 'gmsa_htu_students';
const STORAGE_KEY_SLIDES = 'gmsa_htu_slides';

/* ==========================================================================
   Comprehensive Official Ho Technical University (HTU) Programmes List
   ========================================================================== */
const HTU_PROGRAMMES = {
  BTech: [
    "BTech Agricultural & Environmental Engineering",
    "BTech Automobile Engineering",
    "BTech Biomedical Engineering",
    "BTech Building Technology",
    "BTech Civil Engineering",
    "BTech Computer Science",
    "BTech Design & Manufacturing Engineering",
    "BTech Electrical/Electronic Engineering",
    "BTech Environmental Science & Technology",
    "BTech Facilities & Estate Management",
    "BTech Fashion Design & Textiles",
    "BTech Food Science & Technology",
    "BTech Hospitality & Tourism Management",
    "BTech Industrial Art (Ceramics/Sculpture/Painting)",
    "BTech Information Technology",
    "BTech Mechanical Engineering",
    "BTech Accounting & Finance",
    "BSc Accounting (Finance / Taxation)",
    "BSc Architectural Technology",
    "BSc Economics & Innovation",
    "BSc Financial Services (Banking/Finance/Insurance)",
    "BSc Marketing with IT",
    "BSc Procurement & Supply Chain Management",
    "B.A. Communication & Applied Media Technology",
    "Bachelor of Secretaryship & Management Studies"
  ],
  HND: [
    "HND Accountancy",
    "HND Agricultural Engineering",
    "HND Agro Enterprise Development",
    "HND Automobile Engineering",
    "HND Banking & Finance",
    "HND Building Technology",
    "HND Civil Engineering",
    "HND Computer Science",
    "HND Electrical/Electronic Engineering",
    "HND Estate Management",
    "HND Fashion Design & Textiles",
    "HND Food Technology",
    "HND Hotel, Catering & Institutional Management (HCIM)",
    "HND Industrial Art",
    "HND Information & Communication Technology (ICT)",
    "HND Marketing",
    "HND Mechanical Engineering (Production/Plant)",
    "HND Purchasing & Supply",
    "HND Quantity Surveying & Construction Economics",
    "HND Secretaryship & Management Studies",
    "HND Statistics"
  ],
  Others: [
    "Diploma in Accounting",
    "Diploma in Banking & Finance",
    "Diploma in Beauty & Wellness",
    "Diploma in Communication Studies",
    "Diploma in Computer Science",
    "Diploma in Hospitality Management",
    "Diploma in Marketing",
    "Diploma in Procurement & Supply Chain Management",
    "Diploma in Secretaryship & Management Studies",
    "Diploma in Statistics with Finance",
    "MTech Automobile Engineering",
    "MTech Production Engineering",
    "MTech Refrigeration & Air Conditioning",
    "MTech Agricultural Engineering",
    "MSc Hospitality & Tourism Management",
    "Other Certificate / Non-Tertiary Programme"
  ]
};

function initProgrammeSuggestions() {
  const datalist = document.getElementById('programmeSuggestions');
  const radioButtons = document.querySelectorAll('input[name="programmeLevel"]');
  if (!datalist) return;

  function updateDatalist(level) {
    datalist.innerHTML = '';
    const items = HTU_PROGRAMMES[level] || [
      ...HTU_PROGRAMMES.BTech,
      ...HTU_PROGRAMMES.HND,
      ...HTU_PROGRAMMES.Others
    ];

    items.forEach(prog => {
      const option = document.createElement('option');
      option.value = prog;
      datalist.appendChild(option);
    });
  }

  radioButtons.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        updateDatalist(e.target.value);
      }
    });
  });

  const checkedRadio = document.querySelector('input[name="programmeLevel"]:checked');
  updateDatalist(checkedRadio ? checkedRadio.value : 'BTech');
}

function initStorage() {
  if (!localStorage.getItem(STORAGE_KEY_STUDENTS)) {
    const defaultStudents = [
      {
        id: 'st_1',
        fullName: 'Ibrahim Abubakar Mohammed',
        indexNumber: '0420190001',
        programmeLevel: 'BTech',
        programme: 'BTech Computer Science',
        contact: '0545862058',
        hostel: 'Ameen Hostel',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      },
      {
        id: 'st_2',
        fullName: 'Fatima Sulemana',
        indexNumber: '0420190045',
        programmeLevel: 'HND',
        programme: 'HND Electrical Engineering',
        contact: '0541081265',
        hostel: 'Main Campus Hostel',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'st_3',
        fullName: 'Abdul-Rahman Yussif',
        indexNumber: '0420200088',
        programmeLevel: 'BTech',
        programme: 'BTech Civil Engineering',
        contact: '0244123456',
        hostel: 'Peace Lodge',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(defaultStudents));
  }
}

function getStoredStudents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_STUDENTS)) || [];
  } catch (e) {
    return [];
  }
}

function saveStudent(studentData) {
  const students = getStoredStudents();
  const isDuplicate = students.some(s => 
    s.indexNumber.trim().toLowerCase() === studentData.indexNumber.trim().toLowerCase()
  );

  if (isDuplicate) {
    return { success: false, reason: 'EXISTS' };
  }

  const newRecord = {
    id: 'st_' + Date.now(),
    ...studentData,
    createdAt: new Date().toISOString()
  };

  students.push(newRecord);
  localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  
  syncToApi(newRecord);

  return { success: true, record: newRecord };
}

function syncToApi(record) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  fetch('/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
    signal: controller.signal
  }).then(res => res.json())
    .catch(() => {})
    .finally(() => clearTimeout(timeoutId));
}

function initSlideshow() {
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prevSlideBtn');
  const nextBtn = document.getElementById('nextSlideBtn');
  const container = document.getElementById('slideshowContainer');

  if (!slides.length) return;

  let currentIndex = 0;
  let slideInterval = null;

  const customSlides = JSON.parse(localStorage.getItem(STORAGE_KEY_SLIDES) || '[]');
  if (customSlides && customSlides.length > 0) {
    slides.forEach((slide, idx) => {
      if (customSlides[idx]) {
        const img = slide.querySelector('img');
        if (img) img.src = customSlides[idx];
      }
    });
  }

  function showSlide(index) {
    if (index >= slides.length) currentIndex = 0;
    else if (index < 0) currentIndex = slides.length - 1;
    else currentIndex = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentIndex);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function nextSlide() { showSlide(currentIndex + 1); }
  function prevSlide() { showSlide(currentIndex - 1); }

  function startAutoPlay() {
    stopAutoPlay();
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoPlay() {
    if (slideInterval) clearInterval(slideInterval);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); startAutoPlay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); startAutoPlay(); });

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      showSlide(idx);
      startAutoPlay();
    });
  });

  if (container) {
    container.addEventListener('mouseenter', stopAutoPlay);
    container.addEventListener('mouseleave', startAutoPlay);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'ArrowLeft') prevSlide();
  });

  startAutoPlay();
}

function initRegistrationForm() {
  const form = document.getElementById('studentRegistrationForm');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const indexNumber = document.getElementById('indexNumber').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const programmeLevelInput = form.querySelector('input[name="programmeLevel"]:checked');
    const programmeLevel = programmeLevelInput ? programmeLevelInput.value : 'BTech';
    const programme = document.getElementById('programme').value.trim();
    const hostel = document.getElementById('hostel').value.trim();

    if (!fullName || !indexNumber || !contact || !programme || !hostel) {
      showModal({
        status: 'EXISTS',
        title: 'Missing Required Fields',
        message: 'Please fill in all mandatory fields before submitting.'
      });
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Submitting Record...</span>';
    }

    try {
      const result = saveStudent({
        fullName,
        indexNumber,
        contact,
        programmeLevel,
        programme,
        hostel
      });

      if (result.success) {
        showModal({
          status: 'SUCCESS',
          title: 'Success!',
          message: 'Record submitted successfully. Jazaakallaahu Khairan!!!'
        });
        form.reset();
      } else {
        showModal({
          status: 'EXISTS',
          title: 'Duplicate Record',
          message: 'Your record already exist. Jazaakallaahu Khairan!!!'
        });
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Submit Record</span>';
      }
    }
  });
}

function initModal() {
  const modalOverlay = document.getElementById('feedbackModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) hideModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideModal();
  });
}

function showModal({ status, title, message }) {
  const modalOverlay = document.getElementById('feedbackModal');
  const modalIcon = document.getElementById('modalIcon');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');

  if (!modalOverlay) return;

  if (status === 'SUCCESS') {
    modalIcon.className = 'modal-icon success';
    modalIcon.innerHTML = '✓';
    modalTitle.className = 'modal-title success';
  } else {
    modalIcon.className = 'modal-icon exists';
    modalIcon.innerHTML = 'ℹ';
    modalTitle.className = 'modal-title exists';
  }

  modalTitle.textContent = title;
  modalMessage.textContent = message;

  modalOverlay.classList.add('active');
}

function hideModal() {
  const modalOverlay = document.getElementById('feedbackModal');
  if (modalOverlay) modalOverlay.classList.remove('active');
}
