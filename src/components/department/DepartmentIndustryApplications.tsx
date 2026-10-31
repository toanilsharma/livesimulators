import React from 'react';
import { Briefcase, ArrowRight, ShieldCheck, Cpu, Zap, Building2, Sliders, FlaskConical, Atom } from 'lucide-react';
import { DisciplineId } from '../../types';

interface CaseStudy {
  id: string;
  industry: string;
  title: string;
  problem: string;
  solution: string;
  metrics: string;
}

interface DepartmentIndustryApplicationsProps {
  departmentId: DisciplineId;
  accentColor: string;
}

const DEPARTMENT_APPLICATIONS: Record<DisciplineId, { heading: string; intro: string; cases: CaseStudy[] }> = {
  electrical: {
    heading: 'Real-World Industrial & Engineering Applications',
    intro: 'Connecting abstract electromagnetic theory and circuit differential equations to production systems in energy, transportation, and communications.',
    cases: [
      {
        id: 'ev-traction',
        industry: 'Electric Vehicles (EV)',
        title: '800V Traction Inverter Switching & DC-Link Filtering',
        problem: 'Extreme dv/dt switching transients in high-power silicon-carbide (SiC) traction inverters cause excessive ringing, voltage overshoot, and parasitic motor winding degradation.',
        solution: 'Engineers use canonical RLC transient damping and LC filter design to minimize peak voltage overshoot below 1.15× V_dc while maximizing inverter efficiency past 98.5%.',
        metrics: '800V Bus • 150 kHz PWM • < 1.15x Overshoot',
      },
      {
        id: 'grid-interconnect',
        industry: 'Renewable Power Grids',
        title: 'Utility Solar & Wind Inverter Interconnection (IEEE 1547)',
        problem: 'Non-linear power electronic inverters inject current harmonics into distribution transformers, causing overheating and resonance tripping during grid load steps.',
        solution: 'Simulating 3-phase rotating space vectors and Fourier harmonic cancellation allows utility engineers to enforce IEEE 519 Total Harmonic Distortion (THD) limits under 5%.',
        metrics: 'IEEE 1547 Benchmark Target • THD < 5% • 60 Hz Synchronism',
      },
      {
        id: 'telecom-rf',
        industry: 'Telecommunications & 5G',
        title: 'High-Frequency Microwave Transmission Line Matching',
        problem: 'Impedance discontinuities along 50 Ω coaxial cables and printed microstrip lines produce standing waves (VSWR > 2.0), causing signal attenuation and transmitter reflected power damage.',
        solution: 'Telegrapher wave analysis and quarter-wave impedance transformer matching eliminate reflections (Γ_L → 0), ensuring maximum radio-frequency energy delivery to phased array antennas.',
        metrics: '50 Ω Characteristic • VSWR < 1.15 • 28 GHz mmWave',
      },
    ],
  },
  mechanical: {
    heading: 'Real-World Industrial & Engineering Applications',
    intro: 'Deploying Newtonian dynamics, machine kinematic synthesis, and thermodynamic steam cycles across aerospace, automotive, and power generation.',
    cases: [
      {
        id: 'turbomachinery-vibe',
        industry: 'Aerospace & Turbomachinery',
        title: 'Gas Turbine Rotor Dynamic Balancing & Resonant Damping',
        problem: 'Unbalance in high-speed centrifugal compressors rotating at 18,000 RPM creates catastrophic synchronous vibration resonance near the critical shaft speed.',
        solution: 'Harmonic oscillator dynamic magnification modeling calculates squeeze-film damper clearance and stiffness to attenuate resonant transmissibility (T_r) below ISO 10816 vibration limits.',
        metrics: 'API 617 Reference • 18,000 RPM • ISO 10816 Zone A',
      },
      {
        id: 'auto-suspension',
        industry: 'Automotive Engineering',
        title: 'Quarter-Car SDOF Suspension & Ride Comfort Tuning',
        problem: 'Road roughness profiles excite chassis bounce modes, causing passenger fatigue and tire load fluctuations that degrade cornering traction.',
        solution: 'SDOF damping ratio optimization targets ζ = 0.25 to 0.40, achieving an optimal compromise between sprung mass acceleration suppression and road-holding tire deflection.',
        metrics: 'Damping ζ = 0.30 • Ride Comfort Peak < 1.2 m/s² • 1.2 Hz Natural Freq',
      },
      {
        id: 'steam-power',
        industry: 'Power Generation',
        title: 'Combined-Cycle Heat Recovery Steam Generator (HRSG) Rankine Cycle',
        problem: 'Subcritical steam turbine plants reject high-enthalpy thermal exhaust without optimal heat recovery, limiting overall thermal efficiency.',
        solution: 'Simulating regenerative reheat Rankine cycles with superheated boiler pressure profiles boosts cycle thermal efficiency from 32% to over 48% on T-s equilibrium diagrams.',
        metrics: 'ASME PTC 4.4 Ref • 160 Bar Superheat • 48% Thermal Efficiency',
      },
    ],
  },
  civil: {
    heading: 'Real-World Industrial & Engineering Applications',
    intro: 'Applying structural mechanics, elastic continuum equilibrium, and seismic isolation to bridges, skyscrapers, and geotechnical structures.',
    cases: [
      {
        id: 'seismic-isolation',
        industry: 'High-Rise & Seismic Engineering',
        title: 'Base Isolation of Critical Hospital Infrastructure (ASCE 7-22)',
        problem: 'Severe ground acceleration during Richter 7.5+ earthquakes causes inter-story drift that collapses non-ductile structural framing and severs lifeline utilities.',
        solution: 'Lead-rubber elastomeric bearings lengthen the fundamental structural period from 0.8s to 3.2s, shifting building response out of the high-energy earthquake acceleration plateau.',
        metrics: 'ASCE 7-22 Criteria • Drift Reduction 75% • Period T = 3.0s',
      },
      {
        id: 'bridge-truss',
        industry: 'Transportation Infrastructure',
        title: 'Long-Span Steel Truss Bridge Under Rolling Heavy Truck Loads',
        problem: 'AASHTO HL-93 truck axle configurations induce fatigue cycles and alternating tension/compression reversal in diagonal web trusses.',
        solution: 'Joint equilibrium method of analysis tracks live load envelope influence lines, preventing Euler member buckling and guaranteeing AISC 360-16 structural safety factors.',
        metrics: 'AASHTO LRFD Standards • HL-93 Tandem Loading • AISC 360-16',
      },
      {
        id: 'geotech-wall',
        industry: 'Geotechnical Engineering',
        title: 'Deep Excavation Retaining Wall Earth Pressure (Mohr-Coulomb)',
        problem: 'Urban deep foundation excavations face soil shear failure and catastrophic collapse from lateral earth pressures under high water table conditions.',
        solution: 'Mohr’s circle stress transformations calculate Rankine active and passive soil failure planes, sizing tieback anchor prestress forces to ensure factor of safety FS > 1.5.',
        metrics: 'ASTM D3080 Direct Shear • Safety Factor > 1.5 • Rankine Earth Pressure',
      },
    ],
  },
  control: {
    heading: 'Real-World Industrial & Engineering Applications',
    intro: 'Deploying closed-loop automation, anti-windup algorithms, and smart telemetry across chemical refineries, pharmaceutical manufacturing, and aerospace.',
    cases: [
      {
        id: 'refinery-pid',
        industry: 'Petrochemical Refineries',
        title: 'Distillation Column Temperature & Pressure Decoupled PID',
        problem: 'Strong thermal coupling between reboiler steam flow and reflux rate leads to severe column cycling and off-spec kerosene/diesel cuts.',
        solution: 'Industrial parallel PID algorithms with derivative filter coefficient N and dynamic anti-windup clamping stabilize tray temperatures within ±0.2°C.',
        metrics: 'ISA Parallel Form • Stability Margin > 60° PM • Settling Time < 45s',
      },
      {
        id: 'pipeline-valve',
        industry: 'Oil & Gas Pipelines',
        title: 'High-Differential Pressure Control Valve Sizing (ISA-75.01)',
        problem: 'Choked flow and rapid pressure drops across pipeline letdown valves trigger severe liquid cavitation, eroding trim plugs and vibrating pipe walls.',
        solution: 'Sizing valves using the liquid pressure recovery factor (F_L) and equal-percentage characterized trims prevents cavitation while maintaining linear control responsiveness.',
        metrics: 'ISA-75.01 Sizing • IEC 60534 Standard • Cavitation Index σ > 1.5',
      },
      {
        id: 'smart-telemetry',
        industry: 'Industrial Automation',
        title: 'Two-Wire 4-20mA Current Loop with HART Protocol',
        problem: 'Long cable runs between field pressure transmitters and central DCS racks pick up electromagnetic interference (EMI) and induce voltage drops across barrier loads.',
        solution: 'Constant current loop architecture guarantees zero signal loss over 1,500m runs, with NAMUR NE 43 alarm threshold diagnostics detecting open-circuit wiring faults.',
        metrics: 'NAMUR NE 43 Alarm Levels • 4-20mA Standard • 250 Ω HART Resistor',
      },
    ],
  },
  chemical: {
    heading: 'Real-World Industrial & Engineering Applications',
    intro: 'Applying reaction engineering, binary separation processes, and heat transfer thermodynamics to chemical processing, oil refining, and biopharma.',
    cases: [
      {
        id: 'poly-cstr',
        industry: 'Polymer Manufacturing',
        title: 'Exothermic Polymerization CSTR Thermal Runaway Prevention',
        problem: 'Highly exothermic jacketed polymer reactions produce runaway heat generation that overwhelms cooling capacity if feed rates surge unexpectedly.',
        solution: 'Van Heerden heat balance modeling identifies stable steady-state intersections between Arrhenius heat generation and jacket heat removal, ensuring fail-safe reactor trips.',
        metrics: 'AIChE Standard • ΔH_R = -95 kJ/mol • 15°C Safety Cooling Margin',
      },
      {
        id: 'crude-distill',
        industry: 'Petroleum Refining',
        title: 'Crude Oil Fractionation Sieve Tray Column Optimization',
        problem: 'Fluctuations in feed composition cause tray weeping or entrainment, lowering distillate purity and wasting multi-megawatt reboiler energy.',
        solution: 'McCabe-Thiele equilibrium operating line calculations determine optimal reflux ratios (R = 1.3× R_min) and feed tray entry locations for maximum chemical yield.',
        metrics: 'ASTM D86 Standards • 45 Theoretical Stages • 99.2% Purity',
      },
      {
        id: 'lng-hx',
        industry: 'Clean Energy & Cryogenics',
        title: 'Liquefied Natural Gas (LNG) TEMA Shell-and-Tube Heat Exchangers',
        problem: 'Cryogenic methane liquefaction requires sub-cooling across massive thermal gradients where baffle pressure drop and phase change must be tightly controlled.',
        solution: 'Logarithmic mean temperature difference (LMTD) rating with segmentally-baffled TEMA Class R geometries prevents cryogenic freezing while maximizing heat transfer duty.',
        metrics: 'TEMA Class R Ref • 10 MW Thermal Duty • LMTD ΔT = 12.5°C',
      },
    ],
  },
  physics: {
    heading: 'Real-World Industrial & Engineering Applications',
    intro: 'Bridging quantum mechanics, semiconductor band engineering, and power electronic switching to modern clean-tech and compute chips.',
    cases: [
      {
        id: 'sic-inverter',
        industry: 'Power Semiconductors & Clean Energy',
        title: 'Next-Gen 1200V Silicon Carbide (SiC) MOSFET Switching',
        problem: 'Sub-10 nanosecond switching speed in wide-bandgap SiC chips creates high voltage slew rates (dv/dt > 50 V/ns) that risk parasitic gate turn-on and shoot-through.',
        solution: 'Double-pulse inductive switching simulation calculates dynamic turn-on/turn-off switching loss integrals (E_sw), sizing gate resistors to suppress inductive voltage spikes.',
        metrics: 'JEDEC JESD24-11 Ref • 1200V / 100A • dv/dt = 45 V/ns',
      },
      {
        id: 'advanced-cmos',
        industry: 'Semiconductor Fabrication',
        title: 'Sub-3nm Gate-All-Around (GAA) Nano-Transistor Inversion',
        problem: 'Short-channel effects (drain-induced barrier lowering, DIBL) in sub-3nm chip nodes cause parasitic subthreshold leakage currents that degrade battery life.',
        solution: 'BSIM4 electrostatics and quantum confinement modeling optimize gate oxide capacitance and channel doping profiles to maximize on-to-off current ratios (I_on/I_off > 10⁶).',
        metrics: 'BSIM4 Compact Model • IEEE EDS Standards • I_on/I_off > 10⁶',
      },
      {
        id: 'quantum-devices',
        industry: 'High-Frequency & Quantum Tech',
        title: 'Terahertz Resonant Tunneling Diodes (RTD) for 6G Wireless',
        problem: 'Conventional silicon transceivers cannot generate coherent oscillations above 300 GHz due to carrier transit-time limitations.',
        solution: 'GaAs/AlGaAs quantum double-barrier resonant tunneling diodes exploit negative differential resistance (NDR) to generate continuous-wave sub-millimeter signals past 1.0 THz.',
        metrics: 'Peak-to-Valley Ratio PVCR > 4.5 • 1.1 THz Cutoff • Quantum Well w=4.8nm',
      },
    ],
  },
};

export const DepartmentIndustryApplications: React.FC<DepartmentIndustryApplicationsProps> = ({
  departmentId,
  accentColor,
}) => {
  const data = DEPARTMENT_APPLICATIONS[departmentId] || DEPARTMENT_APPLICATIONS.electrical;

  return (
    <section
      id="applications"
      aria-label={data.heading}
      className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7 shadow-xl space-y-6 backdrop-blur-sm"
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
            <Briefcase className="w-5 h-5" />
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
                Field Implementation
              </span>
              <span className="text-xs text-slate-400 font-mono">Industry Case Studies</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
              {data.heading}
            </h2>
          </div>
        </div>
        <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
          {data.intro}
        </p>
      </div>

      {/* Case Studies 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {data.cases.map((c) => (
          <div
            key={c.id}
            className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                  style={{
                    color: accentColor,
                    borderColor: `${accentColor}40`,
                    backgroundColor: `${accentColor}15`,
                  }}
                >
                  {c.industry}
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>

              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                {c.title}
              </h3>

              <div className="space-y-2 text-xs font-sans">
                <div className="bg-slate-900/60 border border-slate-800/60 p-2.5 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 block">
                    Engineering Challenge:
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {c.problem}
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-800/60 p-2.5 rounded-lg space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                    Mathematical Solution:
                  </span>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {c.solution}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="text-cyan-300 font-semibold">{c.metrics}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
