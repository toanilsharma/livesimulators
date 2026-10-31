import React from 'react';
import { Award, ShieldAlert, CheckCircle2, ExternalLink, ShieldCheck, FileCheck2 } from 'lucide-react';
import { DisciplineId } from '../../types';

interface StandardRow {
  code: string;
  body: string;
  scope: string;
  simulatorName: string;
  criteria: string;
}

interface DepartmentStandardsMatrixProps {
  departmentId: DisciplineId;
  accentColor: string;
}

const DEPARTMENT_STANDARDS: Record<DisciplineId, { title: string; subtitle: string; rows: StandardRow[] }> = {
  electrical: {
    title: 'Referenced International Standards & Technical Specifications',
    subtitle: 'Mathematical formulations and boundary constraints modeled from published procedures in IEEE and IEC academic literature.',
    rows: [
      {
        code: 'IEEE Std 1459-2010',
        body: 'IEEE Power & Energy Society',
        scope: 'Definitions for the Measurement of Electric Power Quantities Under Sinusoidal, Nonsinusoidal, Balanced, or Unbalanced Conditions.',
        simulatorName: 'RLC Resonance & 3-Phase Grid',
        criteria: 'Reactive power Q, apparent power S, and power factor under resonance.',
      },
      {
        code: 'IEEE Std 519-2022',
        body: 'IEEE Power Electronics Society',
        scope: 'Standard for Harmonic Control in Electric Power Systems.',
        simulatorName: 'Fourier Series Harmonic Synthesis',
        criteria: 'Current Total Harmonic Distortion (THD) < 5.0% on public utility PCC.',
      },
      {
        code: 'IEC 60034-1:2022',
        body: 'International Electrotechnical Commission',
        scope: 'Rotating Electrical Machines - Part 1: Rating and Performance.',
        simulatorName: '3-Phase Induction Motor & DC Machine',
        criteria: 'Rotating stator magnetic field vector slip torque-speed equilibrium.',
      },
      {
        code: 'IEC 62040-3',
        body: 'International Electrotechnical Commission',
        scope: 'Uninterruptible Power Systems (UPS) - Method of Specifying Performance and Test Requirements.',
        simulatorName: 'Wide-Bandgap Buck-Boost Switching',
        criteria: 'Switching ripple voltage attenuation and transient step response time.',
      },
    ],
  },
  mechanical: {
    title: 'Referenced International Standards & Technical Specifications',
    subtitle: 'Engineering formulas, load ratings, and thermal cycles referenced from ASME, ISO, and AGMA standards literature.',
    rows: [
      {
        code: 'ASME PTC 4.4-2008',
        body: 'American Society of Mechanical Engineers',
        scope: 'Performance Test Code for Gas Turbine Heat Recovery Steam Generators.',
        simulatorName: 'Rankine Steam Power Cycle',
        criteria: 'Thermodynamic enthalpy balance and thermal efficiency validation on T-s diagrams.',
      },
      {
        code: 'ISO 10816-3:2018',
        body: 'International Organization for Standardization',
        scope: 'Mechanical Vibration - Evaluation of Machine Vibration by Measurements on Non-Rotating Parts.',
        simulatorName: 'Harmonic Oscillator & SDOF Resonance',
        criteria: 'Vibration velocity RMS threshold classification (Zone A to D).',
      },
      {
        code: 'AGMA 2001-D04',
        body: 'American Gear Manufacturers Association',
        scope: 'Fundamental Rating Factors and Calculation Methods for Involute Spur and Helical Gear Teeth.',
        simulatorName: 'Spur Gear Involute Conjugate Mesh',
        criteria: 'Contact ratio > 1.2 and conjugate involute pitch velocity tracking.',
      },
      {
        code: 'API 610 / 617 Reference',
        body: 'American Petroleum Institute',
        scope: 'Centrifugal Pumps & Axial/Centrifugal Compressors for Petroleum and Gas Industries.',
        simulatorName: 'Centrifugal Turbopump & Digital Twins',
        criteria: 'Head-capacity (H-Q) curve stability and rotor critical speed separation margin.',
      },
    ],
  },
  civil: {
    title: 'Referenced International Standards & Technical Specifications',
    subtitle: 'Elastic flexure, structural steel, and earthquake design criteria referenced from AISC, ASCE, and AASHTO.',
    rows: [
      {
        code: 'AISC 360-16',
        body: 'American Institute of Steel Construction',
        scope: 'Specification for Structural Steel Buildings.',
        simulatorName: 'Euler Column Buckling & Beam Deflection',
        criteria: 'Euler critical buckling load P_cr = π²EI/(KL)² with safety factors.',
      },
      {
        code: 'ASCE 7-22',
        body: 'American Society of Civil Engineers',
        scope: 'Minimum Design Loads and Associated Criteria for Buildings and Other Structures.',
        simulatorName: 'Seismic Base Isolation Dynamics',
        criteria: 'Response spectrum ground acceleration drift attenuation past 70%.',
      },
      {
        code: 'AASHTO LRFD Bridge Design',
        body: 'American Association of State Highway Officials',
        scope: 'AASHTO LRFD Bridge Design Specifications (9th Edition).',
        simulatorName: 'Warren Truss Bridge Rolling Loads',
        criteria: 'Influence line static equilibrium ∑F=0 under tandem HL-93 truck axles.',
      },
      {
        code: 'ASTM D3080 / D3080M',
        body: 'ASTM International',
        scope: 'Standard Test Method for Direct Shear Test of Soils Under Consolidated Drained Conditions.',
        simulatorName: "Mohr's Circle Stress Transformation",
        criteria: 'Internal friction angle φ and cohesion c Mohr-Coulomb failure envelope.',
      },
    ],
  },
  control: {
    title: 'Referenced International Standards & Technical Specifications',
    subtitle: 'Process instrumentation, valve sizing, and alarm boundaries referenced from ISA, IEC, and NAMUR.',
    rows: [
      {
        code: 'ISA-75.01.01 (IEC 60534-2-1)',
        body: 'International Society of Automation',
        scope: 'Flow Equations for Sizing Control Valves for Industrial Process Applications.',
        simulatorName: 'Control Valve Trim Dynamics',
        criteria: 'Volumetric flow rate Q calculation under choked cavitation conditions.',
      },
      {
        code: 'NAMUR NE 43',
        body: 'User Association of Automation Technology in Process Industries',
        scope: 'Standardization of the Signal Level for the Failure Information of Digital Transmitters.',
        simulatorName: '4-20mA Smart Transmitter Current Loop',
        criteria: 'Fail-low (< 3.6 mA) and fail-high (> 21.0 mA) alarm diagnostic detection.',
      },
      {
        code: 'ISO 5167-2:2022',
        body: 'International Organization for Standardization',
        scope: 'Measurement of Fluid Flow by Means of Pressure Differential Devices Inserted in Circular Cross-Section Conduits.',
        simulatorName: 'Differential Pressure Orifice Metering',
        criteria: 'Discharge coefficient C_d and expansion factor ε Bernoulli continuity.',
      },
      {
        code: 'IEC 61131-3',
        body: 'International Electrotechnical Commission',
        scope: 'Programmable Controllers - Part 3: Programming Languages (Standard PID Function Blocks).',
        simulatorName: 'Closed-Loop PID Controller',
        criteria: 'Standard parallel ISA anti-windup clamping and derivative filter N.',
      },
    ],
  },
  chemical: {
    title: 'Referenced International Standards & Technical Specifications',
    subtitle: 'Reaction engineering, separation equilibrium, and heat exchanger geometry referenced from AIChE and TEMA.',
    rows: [
      {
        code: 'TEMA Standards (10th Edition)',
        body: 'Tubular Exchanger Manufacturers Association',
        scope: 'Standards of the Tubular Exchanger Manufacturers Association (Class R, C, and B).',
        simulatorName: 'Shell & Tube Heat Exchanger',
        criteria: 'Baffle cut geometry, logarithmic mean temperature difference (LMTD), and pressure drop.',
      },
      {
        code: 'AIChE DIPPR Standards',
        body: 'American Institute of Chemical Engineers',
        scope: 'Design Institute for Physical Properties (DIPPR) Pure Component Thermodynamics.',
        simulatorName: 'Non-Isothermal CSTR Kinetics',
        criteria: 'Arrhenius reaction rate temperature dependency and Van Heerden thermal balance.',
      },
      {
        code: 'ASTM D86-20b',
        body: 'ASTM International',
        scope: 'Standard Test Method for Distillation of Petroleum Products and Liquid Fuels at Atmospheric Pressure.',
        simulatorName: 'McCabe-Thiele Distillation Column',
        criteria: 'Vapor-liquid equilibrium (VLE) theoretical tray stepping and minimum reflux ratio.',
      },
      {
        code: 'EPA 40 CFR Part 63',
        body: 'US Environmental Protection Agency',
        scope: 'National Emission Standards for Hazardous Air Pollutants for Source Categories.',
        simulatorName: 'Packed Tower Gas Absorption Column',
        criteria: 'Two-film mass transfer coefficients K_y a and gas scrubbing removal efficiency > 99%.',
      },
    ],
  },
  physics: {
    title: 'Referenced International Standards & Technical Specifications',
    subtitle: 'Power semiconductor switching, compact MOSFET modeling, and quantum physics referenced from JEDEC and IEEE EDS.',
    rows: [
      {
        code: 'JEDEC JESD24-11',
        body: 'JEDEC Solid State Technology Association',
        scope: 'Double-Pulse Test for Power Semiconductor Switching Devices.',
        simulatorName: 'Wide-Bandgap SiC MOSFET Switching',
        criteria: 'Dynamic turn-on (E_on) and turn-off (E_off) energy integral measurement.',
      },
      {
        code: 'BSIM4 Compact Model (IEEE EDS)',
        body: 'IEEE Electron Devices Society / UC Berkeley',
        scope: 'Industry Standard Compact Model for Deep Sub-Micron MOSFET Transistor Design.',
        simulatorName: 'Nanoscale MOSFET Inversion Channel',
        criteria: 'Velocity saturation, quantum threshold shift, and pinch-off channel current.',
      },
      {
        code: 'IEC 60747-9:2019',
        body: 'International Electrotechnical Commission',
        scope: 'Semiconductor Devices - Discrete Devices - Part 9: Insulated-Gate Bipolar Transistors (IGBTs).',
        simulatorName: 'IGBT Multi-Layer Thermal Foster Network',
        criteria: 'Transient thermal impedance Z_th(t) multi-stage RC Foster network response.',
      },
      {
        code: 'CODATA 2018 Recommended Values',
        body: 'Committee on Data of the International Science Council',
        scope: 'Fundamental Physical Constants (Reduced Planck Constant ħ, Electron Charge q, Permittivity ε₀).',
        simulatorName: 'Quantum Resonant Tunneling & P-N Junction',
        criteria: 'High-precision Double Precision Float64 fundamental constant evaluation.',
      },
    ],
  },
};

export const DepartmentStandardsMatrix: React.FC<DepartmentStandardsMatrixProps> = ({
  departmentId,
  accentColor,
}) => {
  const data = DEPARTMENT_STANDARDS[departmentId] || DEPARTMENT_STANDARDS.electrical;

  return (
    <section
      id="standards"
      aria-label={data.title}
      className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7 shadow-xl space-y-5 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl border shrink-0"
            style={{
              backgroundColor: `${accentColor}15`,
              borderColor: `${accentColor}40`,
              color: accentColor,
            }}
          >
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: `${accentColor}12`,
                  borderColor: `${accentColor}30`,
                  color: accentColor,
                }}
              >
                Traceability
              </span>
              <span className="text-xs text-slate-400 font-mono">International Standards Matrix</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
              {data.title}
            </h2>
          </div>
        </div>
        <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
          {data.subtitle}
        </p>
      </div>

      {/* Standards Responsive Table */}
      <div className="overflow-x-auto custom-scrollbar rounded-xl border border-slate-800/80">
        <table className="w-full text-left border-collapse min-w-[760px] text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/90 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              <th className="py-3 px-4 w-[180px] text-white">Referenced Standard Code</th>
              <th className="py-3 px-3 w-[190px] text-white">Issuing Body (Ref)</th>
              <th className="py-3 px-4 min-w-[240px] text-white">Technical Scope &amp; Methodology</th>
              <th className="py-3 px-3 w-[170px] text-white">Laboratory Module</th>
              <th className="py-3 px-4 w-[180px] text-white">Mathematical Criteria</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {data.rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-850/60 transition-colors">
                <td className="py-3 px-4 font-bold text-cyan-300 align-top">
                  {row.code}
                </td>
                <td className="py-3 px-3 text-slate-300 align-top">
                  {row.body}
                </td>
                <td className="py-3 px-4 text-slate-300 font-sans text-xs leading-relaxed align-top">
                  {row.scope}
                </td>
                <td className="py-3 px-3 align-top font-semibold text-white">
                  {row.simulatorName}
                </td>
                <td className="py-3 px-4 text-emerald-400 text-[11px] align-top">
                  {row.criteria}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nominative Fair-Use Notice Banner */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed font-sans flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-400 font-mono">Standards Citation &amp; Nominative Fair Use Notice:</strong> All referenced engineering standard designations (including IEEE, ASME, ISO, IEC, ISA, ASTM, AIChE, and JEDEC) are cited strictly for educational identification and numerical methodology context under nominative fair use. LiveSimulators is an independent engineering educational platform and is not certified, sponsored, endorsed, or affiliated with these organizations, nor does it reproduce copyrighted standard publications.
        </div>
      </div>
    </section>
  );
};
