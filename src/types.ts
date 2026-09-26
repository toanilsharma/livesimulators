export type DisciplineId =
  | 'electrical'
  | 'control'
  | 'mechanical'
  | 'chemical'
  | 'civil'
  | 'physics';

export type SimulatorType =
  | 'rlc'
  | 'buck_boost'
  | 'three_phase'
  | 'sallen_key'
  | 'transmission_line'
  | 'fourier'
  | 'pid'
  | 'beam_deflection'
  | 'truss'
  | 'seismic'
  | 'mohr_circle'
  | 'four_bar'
  | 'rankine'
  | 'harmonic'
  | 'spur_gear'
  | 'control_valve'
  | 'current_loop'
  | 'orifice_meter'
  | 'cstr'
  | 'distillation_column'
  | 'heat_exchanger'
  | 'gas_absorption'
  | 'pn_junction'
  | 'sic_switching'
  | 'igbt_thermal'
  | 'mosfet_channel'
  | 'op_amp'
  | 'rc_transient'
  | 'otto_cycle'
  | 'projectile'
  | 'photoelectric'
  | 'bode_plot';

export interface ParameterDef {
  id: string;
  name: string;
  symbol: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit: string;
  description: string;
}

export interface SimulatorItem {
  id: string;
  title: string;
  discipline: DisciplineId;
  disciplineName: string;
  badge: string;
  difficulty: 'Fundamentals' | 'Intermediate' | 'Advanced';
  tagline: string;
  description: string;
  governingEquation: string;
  equationDescription: string;
  physicalLaw: string;
  parameters: ParameterDef[];
  presetNames?: { label: string; values: Record<string, number> }[];
  tags: string[];
  keyMetrics: { label: string; unit: string; formulaKey: string }[];
  accentColor: string; // e.g. '#06b6d4' | '#10b981' | '#f59e0b' | '#8b5cf6'
  type: SimulatorType;
  standardReference?: string;
  standardBody?: string;
  analyticalProof?: string;
  validationTest?: string;
  fieldInsights?: string;
  colorStandardRule?: string;
  courseMapping?: string;
  textbookReferences?: string;
  faqs?: Array<{ question: string; answer: string }>;
}

export interface DisciplineInfo {
  id: DisciplineId;
  name: string;
  code: string;
  iconName: string;
  description: string;
  coreEquation: string;
  activeSimulatorsCount: number;
  subfields: string[];
  primaryColor: string;
}

export type AudiencePersona = 'students' | 'educators' | 'engineers';

export type AppRoute =
  | { view: 'home' }
  | { view: 'department'; departmentId: DisciplineId }
  | { view: 'simulator'; simulatorId: string }
  | { view: 'embed'; simulatorId: string }
  | { view: 'lab'; labId: string }
  | { view: 'about' }
  | { view: 'contact' }
  | { view: 'cookie-policy' }
  | { view: 'disclaimer' }
  | { view: 'privacy-policy' }
  | { view: 'terms' }
  | { view: 'not-found'; attemptedPath?: string };

