export interface LabModule {
  id: string;
  name: string;
  tag: string;
  description?: string;
}

export interface LabItem {
  id: string;
  name: string;
  tagline: string;
  dept: string;
  accent: string;
  modules: number;
  shot: string;
  external: boolean;
  url: string;
  embedUrl: string;
  standaloneUrl?: string; // Direct Dynadot CNAME / Netlify external portal for multi-monitor / fullscreen CAD workflows
  moduleList: LabModule[];
  sectors: string[];
  capabilities: string[];
  standardBadge: string;
  deploymentType: string;
}

/**
 * Single source of truth for all Industrial Labs.
 * Internal canonical route (/lab/:id) ensures 100% brand immersion and maximum SEO/LLM authority on livesimulators.com.
 * embedUrl points to the secure cloud computational workbench engine.
 * standaloneUrl points to the dedicated Dynadot CNAME / Netlify external portal.
 */
export const LABS: LabItem[] = [
  {
    id: 'power-electronics-lab',
    name: 'Power Electronics Lab',
    tagline: 'High-frequency switching converters, resonant inverters, and PWM gate driver dynamics.',
    dept: 'electrical',
    accent: '#06b6d4', // Cyan
    modules: 8, // Corrected: Exactly 08 modules
    shot: '/assets/labs/power-electronics.png',
    external: false,
    url: '/lab/power-electronics-lab',
    embedUrl: 'https://powerelectronics.livesimulators.com',
    standaloneUrl: 'https://powerelectronics.livesimulators.com',
    moduleList: [
      { id: 'foundation', name: 'Fundamentals Lab', tag: 'Diodes, SCR, MOSFET & BJT Switching' },
      { id: 'six-pulse', name: '6-Pulse Controlled Rectifier', tag: '3Φ SCR Alpha Firing & LC Filter' },
      { id: 'dual-charger', name: 'Dual-Bank DC Charger', tag: '220VDC Substation Bus Tie & Ground Fault' },
      { id: 'sts', name: 'Static Transfer Switch (STS)', tag: '<4ms Sub-Cycle Dual AC Source Transfer' },
      { id: 'soft-starter', name: 'SCR Soft Starter', tag: 'Voltage Ramp & Inrush Current Limit' },
      { id: 'harmonics-apf', name: 'Harmonics & Active Filter', tag: 'Passive LC & APF with FFT THD Analyzer' },
      { id: 'inverter-pwm', name: 'Inverter PWM Dynamics', tag: 'Sinusoidal PWM & LC Filter Topology' },
      { id: 'dcdc-converters', name: 'DC-DC Switching Topologies', tag: 'Buck, Boost & Buck-Boost CCM/DCM' }
    ],
    sectors: ['Renewable Energy', 'EV Powertrains', 'Grid Inverters', 'Industrial VFDs'],
    capabilities: [
      'High-frequency SiC/GaN semiconductor switching dynamics',
      'Resonant soft-switching ZVS/ZCS inverter topologies',
      'Real-time harmonic Fourier spectrum (THD) analysis'
    ],
    standardBadge: 'IEEE 1547 / IEC 62040-3',
    deploymentType: 'Industrial Power Workbench',
  },
  {
    id: 'power-systems-lab',
    name: 'Power Systems Lab',
    tagline: 'Transmission line power flow, transient swing stability, and symmetrical fault analysis.',
    dept: 'electrical',
    accent: '#3b82f6', // Blue
    modules: 25, // Corrected: Exactly 25 modules
    shot: '/assets/labs/power-systems.png',
    external: false,
    url: '/lab/power-systems-lab',
    embedUrl: 'https://powersystemlab.netlify.app',
    standaloneUrl: 'https://powersystemlab.netlify.app',
    moduleList: [
      { id: 'sld-explorer', name: 'Interactive SLD Explorer', tag: 'Single-Line Diagram Dynamic Topology' },
      { id: 'load-flow', name: 'Newton-Raphson Load Flow', tag: 'Multi-Bus Real & Reactive Power Balance' },
      { id: 'short-circuit-iec', name: 'IEC 60909 Short Circuit', tag: 'Symmetrical & Peak Fault Currents' },
      { id: 'fuse-physics', name: 'Fuse Physics (IEC 60269)', tag: 'Pre-Arcing & Joule Total Clearing I²t' },
      { id: 'mcb-tripping', name: 'MCB Dual-Zone Tripping', tag: 'B, C, D Curve Thermal-Magnetic Physics' },
      { id: 'mccb-acb', name: 'MCCB / ACB Electronic Trip', tag: 'LSI / LSIG Adjustable Threshold Curves' },
      { id: 'protection-coordination', name: 'Protection Selectivity', tag: 'Upstream & Downstream Series Discrimination' },
      { id: 'tcc-curves', name: 'Log-Log TCC Curve Studio', tag: 'Time-Current Characteristic Curve Overlay' },
      { id: 'arc-flash-study', name: 'IEEE 1584 Arc Flash Study', tag: 'Incident Energy cal/cm² & Boundary Radius' },
      { id: 'grounding-grid', name: 'IEEE 80 Substation Grounding', tag: 'Step & Touch Potential Voltage Gradients' },
      { id: 'ct-saturation', name: 'CT Saturation & Burden', tag: 'Knee-Point Voltage & Excitation Curve' },
      { id: 'relay-50-51', name: 'Overcurrent Relay (50/51)', tag: 'Definite Time & Standard Inverse Curves' },
      { id: 'relay-67', name: 'Directional Overcurrent (67)', tag: 'Voltage Polarized Forward/Reverse Trip' },
      { id: 'differential-87', name: 'Differential Protection (87)', tag: 'Dual-Slope Biased Restraint Characteristic' },
      { id: 'distance-21', name: 'Distance Protection (21)', tag: 'Zone 1, 2, 3 Mho & Quadrilateral Impedance' },
      { id: 'transient-stability', name: 'Rotor Angle Swing Stability', tag: 'Equal-Area Criterion Dynamic Simulation' },
      { id: 'sil-loading', name: 'Surge Impedance Loading', tag: 'Ferranti Effect & Line Reactive Compensation' },
      { id: 'transformer-inrush', name: 'Transformer Inrush Current', tag: 'Flux Asymmetry & 2nd Harmonic Restraint' },
      { id: 'motor-starting', name: 'Motor Starting Voltage Dip', tag: 'DOL vs Star-Delta vs VFD Impact on Grid' },
      { id: 'capacitor-switching', name: 'Capacitor Bank Transients', tag: 'Inrush Peak & High-Frequency Ringing' },
      { id: 'harmonic-resonance', name: 'Grid Harmonic Resonance', tag: 'Parallel Resonance & Detuned Reactor Sizing' },
      { id: 'ngr-sizing', name: 'Neutral Grounding Resistor', tag: 'Limit Ground Fault Current & Overvoltage' },
      { id: 'ufls-scheme', name: 'Underfrequency Load Shedding', tag: 'df/dt ROCOF & Priority Feeder Dropping' },
      { id: 'surge-arrester', name: 'Surge Arrester & Insulation', tag: 'BIL Margin & Metal-Oxide Varistor Protection' },
      { id: 'ats-bus-transfer', name: 'Automatic Bus Transfer Scheme', tag: 'Fast / In-Phase / Residual Voltage Transfer' }
    ],
    sectors: ['Transmission Grids', 'Substation EPCs', 'Renewable Microgrids', 'Utility Operations'],
    capabilities: [
      'Multi-bus Newton-Raphson & Gauss-Seidel power flow',
      'Symmetrical & asymmetrical fault transients (SLG, LL, DLG, 3-Phase)',
      'Equal-area criterion rotor angle swing stability analysis'
    ],
    standardBadge: 'IEEE 141 / NERC PRC-002',
    deploymentType: 'Utility Transmission Suite',
  },
  {
    id: 'safeops-ups',
    name: 'SafeOps UPS',
    tagline: 'Double-conversion topology, static bypass transitions, and battery string impedance.',
    dept: 'instrumentation',
    accent: '#10b981', // Emerald
    modules: 2, // Corrected: Exactly 02 modules
    shot: '/assets/labs/safeops-ups.png',
    external: false,
    url: '/lab/safeops-ups',
    embedUrl: 'https://upslab.netlify.app',
    standaloneUrl: 'https://upslab.netlify.app',
    moduleList: [
      { id: 'double-conversion-vfi', name: 'Online Double-Conversion (VFI)', tag: 'Static Bypass Zero-Transfer & Inverter Sync' },
      { id: 'battery-pue-thermal', name: 'Battery String & PUE Optimizer', tag: 'Internal Resistance Degradation & Thermal Loss' }
    ],
    sectors: ['Tier IV Data Centers', 'Semiconductor Fabs', 'Hospital ICU Backup', 'Telecom Hubs'],
    capabilities: [
      'Online double-conversion VFI static bypass zero-transfer switching',
      'Battery string internal resistance & runtime degradation models',
      'Power Usage Effectiveness (PUE) & thermal heat loss optimization'
    ],
    standardBadge: 'IEC 62040-3 / Uptime Tier IV',
    deploymentType: 'Critical Power Simulator',
  },
  {
    id: 'electrolive-electrical-safety',
    name: 'ElectroLive Electrical Safety',
    tagline: 'Arc flash incident energy, NFPA 70E boundary calculations, and touch/step potential.',
    dept: 'electrical',
    accent: '#f59e0b', // Amber
    modules: 9, // Corrected: Exactly 9 modules
    shot: '/assets/labs/electrolive.png',
    external: false,
    url: '/lab/electrolive-electrical-safety',
    embedUrl: 'https://electrolive.livesimulators.com',
    standaloneUrl: 'https://electrolive.livesimulators.com',
    moduleList: [
      { id: 'ac-shock', name: 'AC Shock Physics (IEC 60479-1)', tag: 'Body Impedance, Ventricular Fibrillation Zones' },
      { id: 'dc-shock', name: 'DC Shock & Electrolytic Hazard', tag: 'Tissue Dissociation, Constant Polar Conduction' },
      { id: 'arc-flash', name: 'Arc Flash Incident Energy', tag: 'IEEE 1584-2018 cal/cm² & PPE Level Selection' },
      { id: 'earth-fault', name: 'Earth Fault & Ground Potential Rise', tag: 'IEEE 80 Substation GPR & Fault Current Dispersion' },
      { id: 'step-touch', name: 'Step & Touch Potential Instrument', tag: 'Soil Resistivity, Foot Resistance & Shock Boundaries' },
      { id: 'short-circuit', name: 'Short Circuit Dynamic Forces', tag: 'IEC 60909 Electromagnetic & Thermal Stress' },
      { id: 'mcb-physics', name: 'MCB Thermal-Magnetic Physics', tag: 'IEC 60898 B, C, D Curve Bimetal & Solenoid Action' },
      { id: 'loto-protocol', name: 'Lockout / Tagout (OSHA 1910.147)', tag: 'Zero-Energy State Verification & Isolation Checklist' },
      { id: 'shock-first-aid', name: 'Electrical Shock First Aid & CPR', tag: 'Cardiac Arrest Response, AED & Emergency Protocol' }
    ],
    sectors: ['High-Voltage Operations', 'Mine Sites & Heavy EPC', 'OSHA & EHS Compliance', 'Industrial Plants'],
    capabilities: [
      'IEEE 1584-2018 arc-flash incident energy (cal/cm²) calculation',
      'NFPA 70E boundary distance & PPE Category 1–4 auto-selection',
      'Step & touch potential soil grounding grid voltage gradient'
    ],
    standardBadge: 'NFPA 70E / IEEE 1584 / OSHA',
    deploymentType: 'Life-Safety Compliance Suite',
  },
];

/**
 * Dispatches GA4 telemetry event when any lab is launched from any UI surface.
 */
export function trackLabLaunch(labId: string, source: 'home_card' | 'navbar_dropdown' | 'footer' | string): void {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'lab_launch', {
      lab_id: labId,
      source: source,
    });
  }
}
