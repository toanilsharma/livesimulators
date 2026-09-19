const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.resolve(__dirname, '../public/assets/labs');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function createLabSvg(title, subtitle, badgeText, accent, type) {
  title = escapeXml(title);
  subtitle = escapeXml(subtitle);
  badgeText = escapeXml(badgeText);
  const width = 800;
  const height = 480;

  let visualElements = '';
  if (type === 'power-electronics') {
    visualElements = `
      <!-- Waveforms -->
      <path d="M 60 280 L 140 280 L 140 200 L 220 200 L 220 280 L 300 280 L 300 200 L 380 200 L 380 280" fill="none" stroke="${accent}" stroke-width="3" opacity="0.9" />
      <path d="M 60 320 Q 100 270 140 320 T 220 320 T 300 320 T 380 320" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="6,4" />
      <!-- Circuit Schematic preview -->
      <rect x="420" y="190" width="320" height="150" rx="10" fill="#0f172a" stroke="#334155" />
      <text x="440" y="225" fill="${accent}" font-family="monospace" font-size="14" font-weight="bold">TOPOLOGY: SYNCHRONOUS BUCK</text>
      <text x="440" y="255" fill="#94a3b8" font-family="monospace" font-size="12">Switching Freq: 100.0 kHz</text>
      <text x="440" y="280" fill="#94a3b8" font-family="monospace" font-size="12">Efficiency η: 96.8 %</text>
      <text x="440" y="305" fill="#38bdf8" font-family="monospace" font-size="12">V_out Ripple: 12.4 mV p-p</text>
    `;
  } else if (type === 'power-systems') {
    visualElements = `
      <!-- Single line bus grid -->
      <circle cx="120" cy="250" r="30" fill="none" stroke="${accent}" stroke-width="3" />
      <text x="114" y="255" fill="${accent}" font-family="monospace" font-size="14" font-weight="bold">G1</text>
      <line x1="150" y1="250" x2="280" y2="250" stroke="#64748b" stroke-width="3" />
      <rect x="280" y="210" width="10" height="80" fill="${accent}" />
      <line x1="290" y1="230" x2="430" y2="230" stroke="#64748b" stroke-width="3" />
      <rect x="430" y="210" width="10" height="80" fill="#38bdf8" />
      <line x1="440" y1="250" x2="560" y2="250" stroke="#64748b" stroke-width="3" />
      <circle cx="590" cy="250" r="30" fill="none" stroke="#38bdf8" stroke-width="3" />
      <text x="584" y="255" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold">G2</text>
      <!-- Telemetry Box -->
      <rect x="180" y="320" width="440" height="40" rx="6" fill="#0f172a" stroke="#334155" />
      <text x="200" y="345" fill="#94a3b8" font-family="monospace" font-size="12">BUS 1: 1.00 pu | BUS 2: 0.98 pu | P_loss: 4.8 MW</text>
    `;
  } else if (type === 'safeops-ups') {
    visualElements = `
      <!-- UPS Flow -->
      <rect x="80" y="210" width="100" height="70" rx="8" fill="#0f172a" stroke="${accent}" stroke-width="2" />
      <text x="100" y="250" fill="${accent}" font-family="monospace" font-size="13" font-weight="bold">RECTIFIER</text>
      <line x1="180" y1="245" x2="260" y2="245" stroke="${accent}" stroke-width="3" />
      <rect x="260" y="210" width="100" height="70" rx="8" fill="#0f172a" stroke="${accent}" stroke-width="2" />
      <text x="282" y="250" fill="${accent}" font-family="monospace" font-size="13" font-weight="bold">INVERTER</text>
      <line x1="360" y1="245" x2="440" y2="245" stroke="${accent}" stroke-width="3" />
      <rect x="440" y="210" width="100" height="70" rx="8" fill="#0f172a" stroke="#10b981" stroke-width="2" />
      <text x="460" y="250" fill="#10b981" font-family="monospace" font-size="13" font-weight="bold">STATIC STS</text>
      <!-- Battery string -->
      <line x1="220" y1="245" x2="220" y2="330" stroke="#f59e0b" stroke-width="3" />
      <rect x="160" y="330" width="120" height="50" rx="6" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5" />
      <text x="180" y="360" fill="#f59e0b" font-family="monospace" font-size="12">BATTERY 540V</text>
      <!-- Status -->
      <text x="560" y="240" fill="#10b981" font-family="monospace" font-size="14" font-weight="bold">ONLINE NORMAL</text>
      <text x="560" y="265" fill="#94a3b8" font-family="monospace" font-size="12">THD: &amp;lt; 1.8%</text>
      <text x="560" y="290" fill="#94a3b8" font-family="monospace" font-size="12">Load: 78.4 kVA</text>
    `;
  } else {
    // electrolive
    visualElements = `
      <!-- Safety Arc Flash Gauge -->
      <circle cx="200" cy="270" r="80" fill="none" stroke="#334155" stroke-width="12" />
      <circle cx="200" cy="270" r="80" fill="none" stroke="${accent}" stroke-width="12" stroke-dasharray="250,500" />
      <text x="175" y="265" fill="${accent}" font-family="monospace" font-size="28" font-weight="bold">3.8</text>
      <text x="160" y="290" fill="#94a3b8" font-family="monospace" font-size="12">cal/cm²</text>
      <!-- Standards compliance boxes -->
      <rect x="340" y="200" width="380" height="150" rx="10" fill="#0f172a" stroke="#334155" />
      <text x="360" y="235" fill="${accent}" font-family="monospace" font-size="14" font-weight="bold">NFPA 70E / IEEE 1584 BOUNDARIES</text>
      <text x="360" y="265" fill="#94a3b8" font-family="monospace" font-size="12">Arc Flash Boundary: 1.42 m (4.65 ft)</text>
      <text x="360" y="290" fill="#94a3b8" font-family="monospace" font-size="12">Restricted Approach: 0.30 m (1.00 ft)</text>
      <text x="360" y="315" fill="#10b981" font-family="monospace" font-size="12">PPE Category: LEVEL 2 (Arc-Rated 8 cal)</text>
    `;
  }

  return `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#080e18" />
        <stop offset="100%" stop-color="#04070d" />
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.75" opacity="0.6"/>
      </pattern>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)" />
    <rect width="${width}" height="${height}" fill="url(#grid)" />

    <!-- Top Window Title Bar -->
    <rect x="0" y="0" width="${width}" height="44" fill="#0b121e" stroke="#1e293b" stroke-width="1" />
    <circle cx="25" cy="22" r="5" fill="#ef4444" opacity="0.8" />
    <circle cx="42" cy="22" r="5" fill="#eab308" opacity="0.8" />
    <circle cx="59" cy="22" r="5" fill="#22c55e" opacity="0.8" />
    <text x="80" y="26" fill="#64748b" font-family="monospace" font-size="11">LiveSimulators Professional Suite :: ${title}</text>

    <!-- Header Section -->
    <rect x="40" y="65" width="${badgeText.length * 9 + 30}" height="24" rx="12" fill="${accent}" fill-opacity="0.15" stroke="${accent}" stroke-opacity="0.4" />
    <text x="55" y="81" fill="${accent}" font-family="monospace" font-size="11" font-weight="bold">${badgeText}</text>

    <text x="40" y="125" fill="#ffffff" font-family="sans-serif" font-size="24" font-weight="800" letter-spacing="-0.5">${title}</text>
    <text x="40" y="152" fill="#94a3b8" font-family="sans-serif" font-size="13">${subtitle}</text>

    <!-- Active Workbench Display Frame -->
    <rect x="40" y="175" width="720" height="235" rx="12" fill="#080f1d" stroke="#1e293b" stroke-width="1.5" />

    ${visualElements}

    <!-- Bottom Status Strip -->
    <rect x="40" y="425" width="720" height="35" rx="8" fill="#0c1524" stroke="#1e293b" />
    <text x="60" y="447" fill="#10b981" font-family="monospace" font-size="11">● SOLVER ONLINE</text>
    <text x="210" y="447" fill="#64748b" font-family="monospace" font-size="11">ENGINE: RK4 64-BIT</text>
    <text x="390" y="447" fill="#64748b" font-family="monospace" font-size="11">LATENCY: 0.8ms</text>
    <text x="580" y="447" fill="${accent}" font-family="monospace" font-size="11">FULL LAB SUITE &#8594;</text>
  </svg>
  `;
}

const labs = [
  {
    name: 'power-electronics.png',
    title: 'Power Electronics Laboratory',
    subtitle: 'High-Frequency Inverters, DC-DC Converters & Gate Drive Dynamics',
    badge: '16 MODULES • ELECTRICAL',
    accent: '#06b6d4',
    type: 'power-electronics'
  },
  {
    name: 'power-systems.png',
    title: 'Power Systems & Grid Stability Lab',
    subtitle: 'Newton-Raphson Load Flow, Swing Equations & Fault Transient Solvers',
    badge: '14 MODULES • ELECTRICAL',
    accent: '#3b82f6',
    type: 'power-systems'
  },
  {
    name: 'safeops-ups.png',
    title: 'SafeOps UPS Systems Laboratory',
    subtitle: 'Double-Conversion Topologies, Static Transfer Switch & DC Bus Dynamics',
    badge: '12 MODULES • INSTRUMENTATION',
    accent: '#10b981',
    type: 'safeops-ups'
  },
  {
    name: 'electrolive.png',
    title: 'ElectroLive Electrical Safety Lab',
    subtitle: 'Arc Flash Incident Energy Calculations, IEEE 1584 & NFPA 70E Boundaries',
    badge: '10 MODULES • ELECTRICAL',
    accent: '#f59e0b',
    type: 'electrolive'
  },
];

async function generateAll() {
  for (const lab of labs) {
    const svg = createLabSvg(lab.title, lab.subtitle, lab.badge, lab.accent, lab.type);
    const dest = path.join(outDir, lab.name);
    await sharp(Buffer.from(svg))
      .png({ quality: 95 })
      .toFile(dest);
    console.log(`✅ Created lab screenshot: ${dest}`);
  }
}

generateAll().catch(console.error);
