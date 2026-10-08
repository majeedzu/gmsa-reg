const fs = require('fs');
const path = require('path');

const gmsaSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F7D070"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#AA7C11"/>
    </linearGradient>
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#008044"/>
      <stop offset="100%" stop-color="#004D28"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <circle cx="250" cy="250" r="235" fill="url(#goldGrad)" />
  <circle cx="250" cy="250" r="225" fill="#ffffff" />
  <circle cx="250" cy="250" r="215" fill="url(#greenGrad)" />
  <circle cx="250" cy="250" r="160" fill="#ffffff" />
  <circle cx="250" cy="250" r="152" fill="url(#greenGrad)" />
  
  <path id="textPathTop" d="M 65 250 A 185 185 0 1 1 435 250" fill="none" />
  <path id="textPathBottom" d="M 435 250 A 185 185 0 1 1 70 250" fill="none" />
  
  <text font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="21" fill="url(#goldGrad)" letter-spacing="1">
    <textPath href="#textPathTop" startOffset="50%" text-anchor="middle">
      GHANA MUSLIM STUDENTS' ASSOCIATION
    </textPath>
  </text>
  
  <text font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="url(#goldGrad)" letter-spacing="2">
    <textPath href="#textPathBottom" startOffset="50%" text-anchor="middle">
      HO TECHNICAL UNIVERSITY CHAPTER
    </textPath>
  </text>
  
  <g fill="url(#goldGrad)">
    <polygon points="50,250 55,240 65,240 57,233 60,223 50,230 40,223 43,233 35,240 45,240"/>
    <polygon points="450,250 455,240 465,240 457,233 460,223 450,230 440,223 443,233 435,240 445,240"/>
  </g>
  
  <g transform="translate(250, 230)" filter="url(#shadow)">
    <path d="M 25 -70 A 65 65 0 1 0 70 30 A 55 55 0 1 1 25 -70 Z" fill="url(#goldGrad)" />
    <polygon points="45,-45 49,-35 59,-35 51,-29 54,-19 45,-25 36,-19 39,-29 31,-35 41,-35" fill="url(#goldGrad)" />
  </g>
  
  <g transform="translate(250, 275)">
    <path d="M -5 0 Q -40 -15 -80 0 L -80 35 Q -40 20 -5 35 Z" fill="#ffffff" stroke="url(#goldGrad)" stroke-width="3"/>
    <path d="M 5 0 Q 40 -15 80 0 L 80 35 Q 40 20 5 35 Z" fill="#ffffff" stroke="url(#goldGrad)" stroke-width="3"/>
    <path d="M 0 -5 L 0 40" stroke="url(#goldGrad)" stroke-width="4"/>
    <line x1="-65" y1="10" x2="-20" y2="4" stroke="#004D28" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="-65" y1="20" x2="-20" y2="14" stroke="#004D28" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="20" y1="4" x2="65" y2="10" stroke="#004D28" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="20" y1="14" x2="65" y2="20" stroke="#004D28" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  
  <g transform="translate(250, 355)">
    <rect x="-90" y="-15" width="180" height="28" rx="14" fill="url(#goldGrad)" />
    <text font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#004D28" text-anchor="middle" y="4">UNITY IS STRENGTH</text>
  </g>
</svg>`;

const htuSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F2C59"/>
      <stop offset="100%" stop-color="#061830"/>
    </linearGradient>
    <linearGradient id="goldGradHtu" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#C59B27"/>
    </linearGradient>
  </defs>

  <circle cx="250" cy="250" r="235" fill="url(#goldGradHtu)" />
  <circle cx="250" cy="250" r="222" fill="#ffffff" />
  <circle cx="250" cy="250" r="210" fill="url(#blueGrad)" />
  <circle cx="250" cy="250" r="155" fill="#ffffff" />
  <circle cx="250" cy="250" r="147" fill="url(#blueGrad)" />

  <path id="htuTextTop" d="M 70 250 A 180 180 0 1 1 430 250" fill="none" />
  <path id="htuTextBottom" d="M 430 250 A 180 180 0 1 1 70 250" fill="none" />

  <text font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="23" fill="url(#goldGradHtu)" letter-spacing="1.5">
    <textPath href="#htuTextTop" startOffset="50%" text-anchor="middle">
      HO TECHNICAL UNIVERSITY
    </textPath>
  </text>

  <text font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="16" fill="url(#goldGradHtu)" letter-spacing="2">
    <textPath href="#htuTextBottom" startOffset="50%" text-anchor="middle">
      KNOWLEDGE - SKILL - SERVICE
    </textPath>
  </text>

  <g transform="translate(250, 240)">
    <path d="M -60 -15 L -50 -15 L -45 -30 L -55 -40 L -40 -55 L -30 -45 L -15 -50 L -15 -60 L 15 -60 L 15 -50 L 30 -45 L 40 -55 L 55 -40 L 45 -30 L 50 -15 L 60 -15 L 60 15 L 50 15 L 45 30 L 55 40 L 40 55 L 30 45 L 15 50 L 15 60 L -15 60 L -15 50 L -30 45 L -40 55 L -55 40 L -45 30 L -50 15 L -60 15 Z" fill="none" stroke="url(#goldGradHtu)" stroke-width="8"/>
    <circle cx="0" cy="0" r="42" fill="#ffffff"/>
    <circle cx="0" cy="0" r="36" fill="url(#blueGrad)"/>

    <path d="M -12 25 L 12 25 L 7 5 L -7 5 Z" fill="url(#goldGradHtu)"/>
    <path d="M -15 5 L 15 5 L 10 -8 L -10 -8 Z" fill="url(#goldGradHtu)"/>
    <path d="M 0 -35 Q 15 -18 0 -5 Q -15 -18 0 -35 Z" fill="#FF4500"/>
    <path d="M 0 -30 Q 8 -18 0 -10 Q -8 -18 0 -30 Z" fill="#FFD700"/>
  </g>

  <g transform="translate(250, 330)">
    <path d="M -50 -10 Q -25 -20 0 -10 Q 25 -20 50 -10 L 50 15 Q 25 5 0 15 Q -25 5 -50 15 Z" fill="url(#goldGradHtu)"/>
    <path d="M -46 -6 Q -23 -16 0 -7 Q 23 -16 46 -6 L 46 11 Q 23 2 0 11 Q -23 2 -46 11 Z" fill="#ffffff"/>
  </g>
</svg>`;

function createSlideSvg(num, title, subtitle, bgGrad1, bgGrad2) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500" width="1200" height="500">
    <defs>
      <linearGradient id="bg${num}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGrad1}"/>
        <stop offset="100%" stop-color="${bgGrad2}"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#F7D070"/>
        <stop offset="100%" stop-color="#D4AF37"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="500" fill="url(#bg${num})" />
    <g opacity="0.08" fill="#ffffff">
      <circle cx="100" cy="100" r="200" stroke="#fff" stroke-width="4" fill="none"/>
      <circle cx="1100" cy="400" r="250" stroke="#fff" stroke-width="4" fill="none"/>
      <polygon points="600,50 650,150 750,150 670,220 700,320 600,250 500,320 530,220 450,150 550,150" />
    </g>
    <rect width="1200" height="500" fill="rgba(0,0,0,0.35)"/>
    
    <rect x="0" y="0" width="1200" height="8" fill="url(#goldGrad)"/>
    <rect x="0" y="492" width="1200" height="8" fill="url(#goldGrad)"/>

    <g transform="translate(600, 230)" text-anchor="middle">
      <rect x="-420" y="-120" width="840" height="220" rx="16" fill="rgba(0,40,20,0.4)" stroke="url(#goldGrad)" stroke-width="2"/>
      <text font-family="'Segoe UI', Roboto, sans-serif" font-weight="bold" font-size="44" fill="#ffffff" y="-40" letter-spacing="1">
        ${title}
      </text>
      <text font-family="'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="24" fill="#F7D070" y="20" letter-spacing="0.5">
        ${subtitle}
      </text>
      <g transform="translate(0, 65)">
        <rect x="-160" y="-18" width="320" height="36" rx="18" fill="#006837" stroke="#D4AF37" stroke-width="1.5"/>
        <text font-family="'Segoe UI', Roboto, sans-serif" font-weight="bold" font-size="14" fill="#ffffff" y="5">HTU GMSA CHAPTER 2026</text>
      </g>
    </g>
  </svg>`;
}

const slides = [
  createSlideSvg(1, "Welcome to GMSA HTU", "Fostering Brotherhood, Unity & Islamic Values on Campus", "#004D28", "#0B3C26"),
  createSlideSvg(2, "Annual GMSA Orientation", "Empowering Muslim Students Through Faith and Academic Excellence", "#0A2540", "#004D28"),
  createSlideSvg(3, "Weekly Da'wah & Quranic Circles", "Nurturing Spiritual Growth and Knowledge Sharing", "#1B4D3E", "#002B19"),
  createSlideSvg(4, "Community Service & Outreach", "Building Strong Bonds Within Ho Technical University & Beyond", "#005F73", "#0A2F35"),
  createSlideSvg(5, "Unity is Strength", "Ghana Muslim Students' Association - Ho Technical University Chapter", "#2D4030", "#004D28")
];

const targetDirs = [
  path.join(__dirname, 'public'),
  path.join(__dirname, 'images')
];

targetDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(path.join(dir, 'gmsa-logo.svg'), gmsaSvg);
  fs.writeFileSync(path.join(dir, 'gmsa-logo.png'), gmsaSvg);

  fs.writeFileSync(path.join(dir, 'htu-logo.svg'), htuSvg);
  fs.writeFileSync(path.join(dir, 'htu-logo.png'), htuSvg);

  slides.forEach((slideContent, index) => {
    const num = index + 1;
    fs.writeFileSync(path.join(dir, `slide${num}.svg`), slideContent);
    fs.writeFileSync(path.join(dir, `slide${num}.jpg`), slideContent);
    fs.writeFileSync(path.join(dir, `slide${num}.png`), slideContent);
  });
});

try {
  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const filesToCopy = ['index.html', 'style.css', 'script.js', 'supabase-client.js', 'gmsa-logo.svg', 'htu-logo.svg', 'bg-hero.jpg'];
  filesToCopy.forEach(file => {
    const src = path.join(__dirname, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(publicDir, file));
    }
  });

  const adminSrc = path.join(__dirname, 'admin');
  const adminDest = path.join(publicDir, 'admin');
  if (fs.existsSync(adminSrc)) {
    if (!fs.existsSync(adminDest)) fs.mkdirSync(adminDest, { recursive: true });
    fs.readdirSync(adminSrc).forEach(f => {
      if (fs.statSync(path.join(adminSrc, f)).isFile()) {
        fs.copyFileSync(path.join(adminSrc, f), path.join(adminDest, f));
      }
    });
  }
} catch (e) {
  console.log("Mirror warning:", e.message);
}

console.log("Assets and public build bundle successfully created!");
