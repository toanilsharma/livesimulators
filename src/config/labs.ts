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
  sectors: string[];
  capabilities: string[];
  standardBadge: string;
  deploymentType: string;
}

/**
 * Single source of truth for all Industrial Labs.
 * Points directly to live, active Netlify cloud deployments with external=true (opens in new tab).
 */
export const LABS: LabItem[] = [
  {
    id: 'power-electronics-lab',
    name: 'Power Electronics Lab',
    tagline: 'High-frequency switching converters, resonant inverters, and PWM gate driver dynamics.',
    dept: 'electrical',
    accent: '#06b6d4', // Cyan
    modules: 16,
    shot: '/assets/labs/power-electronics.png',
    external: true,
    url: 'https://powerelectronicslab.netlify.app',
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
    modules: 14,
    shot: '/assets/labs/power-systems.png',
    external: true,
    url: 'https://powersystemlab.netlify.app',
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
    modules: 12,
    shot: '/assets/labs/safeops-ups.png',
    external: true,
    url: 'https://upslab.netlify.app',
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
    modules: 10,
    shot: '/assets/labs/electrolive.png',
    external: true,
    url: 'https://electrolive.netlify.app',
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
