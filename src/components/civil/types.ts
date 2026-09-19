export type CivilSimulatorMode = 
  | 'beam_bending'
  | 'truss_analysis'
  | 'seismic_isolation'
  | 'mohr_circle';

export interface CivilItemInfo {
  id: CivilSimulatorMode;
  name: string;
  shortName: string;
  category: 'Structural Mechanics' | 'Bridge & Framed Structures' | 'Earthquake Engineering' | 'Geotechnical & Materials';
  standards: string;
  tagline: string;
  equation: string;
}

export const CIVIL_MODES: CivilItemInfo[] = [
  {
    id: 'beam_bending',
    name: 'Euler-Bernoulli Beam Deflection, Shear & Moment',
    shortName: 'Beam Bending',
    category: 'Structural Mechanics',
    standards: 'AISC 360-16 • Eurocode 3 • ASTM A36',
    tagline: 'Shear Force (SFD), Bending Moment (BMD), elastic curve deflection & extreme fiber stress.',
    equation: 'EI \\frac{d^4 w}{dx^4} = q(x), \\quad \\sigma_{max} = \\frac{M_{max} y}{I}'
  },
  {
    id: 'truss_analysis',
    name: 'Warren & Pratt Truss Bridge Analysis',
    shortName: 'Truss Bridge',
    category: 'Bridge & Framed Structures',
    standards: 'AASHTO LRFD • Eurocode 3 • Method of Joints',
    tagline: 'Method of joints equilibrium, tension/compression axial members & Euler column buckling.',
    equation: '\\sum \\vec{F}_{node} = 0, \\quad P_{cr} = \\frac{\\pi^2 E I}{(K L)^2}'
  },
  {
    id: 'seismic_isolation',
    name: 'Seismic Base Isolation & Dynamic Response',
    shortName: 'Seismic Isolation',
    category: 'Earthquake Engineering',
    standards: 'ASCE 7-22 • Eurocode 8 • FEMA P-750',
    tagline: 'Fixed-base vs elastomeric base-isolated building dynamics, period shift & drift reduction.',
    equation: 'M \\ddot{u} + C \\dot{u} + K u = -M \\ddot{u}_g(t), \\quad T_n = 2\\pi \\sqrt{\\frac{m}{k}}'
  },
  {
    id: 'mohr_circle',
    name: 'Mohr’s Circle & Soil Shear Slip Failure',
    shortName: 'Mohr’s Circle & Soil',
    category: 'Geotechnical & Materials',
    standards: 'ASTM D3080 • Eurocode 7 • Terzaghi / Coulomb',
    tagline: '2D plane stress transformation, principal stresses (σ₁, σ₂) & Mohr-Coulomb shear slip criterion.',
    equation: '\\tau_f = c + \\sigma_n \\tan \\phi, \\quad R = \\sqrt{\\left(\\frac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2}'
  }
];
