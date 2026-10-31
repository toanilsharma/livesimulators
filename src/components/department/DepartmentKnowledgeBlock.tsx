import React, { useState } from 'react';
import { BookOpen, Copy, Check, Terminal, Cpu, Database, Binary, ExternalLink, Sparkles } from 'lucide-react';
import { DisciplineId } from '../../types';
import { MathView } from '../MathView';
import { soundEngine } from '../../utils/audio';

interface DepartmentKnowledgeBlockProps {
  departmentId: DisciplineId;
  accentColor: string;
}

interface DisciplineKnowledgeData {
  governingSystem: string;
  differentialClass: string;
  stateSpaceVector: string;
  stateSpaceEq: string;
  solverFamily: string[];
  canonicalTextbooks: Array<{
    title: string;
    authors: string;
    edition: string;
    doiOrIsbn: string;
  }>;
  computationalTaxonomy: Array<{
    term: string;
    symbol: string;
    definition: string;
  }>;
  bibtexCitation: string;
}

const DISCIPLINE_KNOWLEDGE_BASE: Record<DisciplineId, DisciplineKnowledgeData> = {
  electrical: {
    governingSystem: "Maxwell-Heaviside Electrodynamics & Kirchhoff's Conservation Theorems",
    differentialClass: "Stiff 2nd-order ordinary differential equations & multi-conductor partial differential wave equations",
    stateSpaceVector: "\\mathbf{x}(t) = \\begin{bmatrix} i_L(t) \\\\ v_C(t) \\end{bmatrix}, \\quad \\mathbf{u}(t) = \\begin{bmatrix} v_s(t) \\\\ i_s(t) \\end{bmatrix}",
    stateSpaceEq: "\\dot{\\mathbf{x}} = \\begin{bmatrix} -R/L & -1/L \\\\ 1/C & -1/(RC) \\end{bmatrix}\\mathbf{x} + \\begin{bmatrix} 1/L \\\\ 0 \\end{bmatrix}u",
    solverFamily: [
      '4th-Order Adaptive Runge-Kutta (RK4) for transient state-space vectors',
      'Telegrapher characteristic wave decomposition for RF transmission lines',
      'Harmonic Fourier Series decomposition for nonsinusoidal AC waveforms',
      'Sallen-Key bilinear state transformation with complex conjugate poles',
    ],
    canonicalTextbooks: [
      {
        title: 'Engineering Circuit Analysis',
        authors: 'William H. Hayt, Jack E. Kemmerly, Steven M. Durbin',
        edition: '9th Edition (McGraw-Hill)',
        doiOrIsbn: 'ISBN 978-0073545516',
      },
      {
        title: 'Power Electronics: Converters, Applications, and Design',
        authors: 'Ned Mohan, Tore M. Undeland, William P. Robbins',
        edition: '3rd Edition (Wiley)',
        doiOrIsbn: 'ISBN 978-0471226932',
      },
      {
        title: 'Electric Machinery Fundamentals',
        authors: 'Stephen J. Chapman',
        edition: '5th Edition (McGraw-Hill)',
        doiOrIsbn: 'ISBN 978-0073529547',
      },
    ],
    computationalTaxonomy: [
      {
        term: 'State-Space Trajectory',
        symbol: '\\mathbf{x}(t)',
        definition: 'Minimal set of internal energy storage variables (inductor currents and capacitor voltages) completely characterizing system dynamics.',
      },
      {
        term: 'Complex Poynting Vector',
        symbol: '\\mathbf{S} = \\frac{1}{2}(\\mathbf{E} \\times \\mathbf{H}^*)',
        definition: 'Cross-product directional vector measuring instantaneous electromagnetic power density per unit cross-sectional area (W/m²).',
      },
      {
        term: 'Characteristic Impedance',
        symbol: 'Z_0 = \\sqrt{L\'/C\'}',
        definition: 'Ratio of voltage wave amplitude to current wave amplitude in a uniform transmission line in the absence of boundary reflections.',
      },
      {
        term: 'Total Harmonic Distortion',
        symbol: '\\text{THD} = \\frac{\\sqrt{\\sum_{n=2}^{\\infty} V_n^2}}{V_1}',
        definition: 'Dimensionless ratio quantifying spectral harmonic distortion relative to fundamental sinusoidal AC line voltage.',
      },
    ],
    bibtexCitation: `@article{livesimulators_electrical,
  title={First-Principles Real-Time Numerical Solvers for Electrical Systems Pedagogy},
  author={Sharma, Anil},
  journal={LiveSimulators Computational Engineering Repository},
  year={2026},
  url={https://livesimulators.com/department/electrical},
  note={ABET-Compliant Browser Solvers via 4th-Order Runge-Kutta Integration}
}`,
  },

  mechanical: {
    governingSystem: "Newton-Euler Equations of Motion & Navier-Stokes Incompressible Continuum Mechanics",
    differentialClass: "Coupled nonlinear 2nd-order dynamical equations & thermodynamic differential state relations",
    stateSpaceVector: "\\mathbf{x}(t) = \\begin{bmatrix} x(t) \\\\ \\dot{x}(t) \\end{bmatrix}, \\quad \\mathbf{u}(t) = \\begin{bmatrix} F(t) \\\\ \\tau(t) \\end{bmatrix}",
    stateSpaceEq: "\\dot{\\mathbf{x}} = \\begin{bmatrix} 0 & 1 \\\\ -k/m & -c/m \\end{bmatrix}\\mathbf{x} + \\begin{bmatrix} 0 \\\\ 1/m \\end{bmatrix}F(t)",
    solverFamily: [
      'Symplectic Störmer-Verlet & RK4 for conservation of mechanical energy',
      'Freudenstein nonlinear analytical loop-closure for 4-bar planar linkages',
      'IAPWS-IF97 steam table formulations for Rankine thermodynamic cycles',
      'Lewis bending and Hertzian contact stress formulations for AGMA gearing',
    ],
    canonicalTextbooks: [
      {
        title: "Shigley's Mechanical Engineering Design",
        authors: 'Richard G. Budynas, J. Keith Nisbett',
        edition: '11th Edition (McGraw-Hill)',
        doiOrIsbn: 'ISBN 978-0073398204',
      },
      {
        title: 'Theory of Machines and Mechanisms',
        authors: 'John J. Uicker, Gordon R. Pennock, Joseph E. Shigley',
        edition: '5th Edition (Oxford University Press)',
        doiOrIsbn: 'ISBN 978-0190264482',
      },
      {
        title: 'Fundamentals of Engineering Thermodynamics',
        authors: 'Michael J. Moran, Howard N. Shapiro, Daisie D. Boettner',
        edition: '9th Edition (Wiley)',
        doiOrIsbn: 'ISBN 978-1119391388',
      },
    ],
    computationalTaxonomy: [
      {
        term: 'Damping Ratio',
        symbol: '\\zeta = \\frac{c}{2\\sqrt{km}}',
        definition: 'Dimensionless parameter describing how oscillations in a 2nd-order mechanical system decay after disturbance.',
      },
      {
        term: 'Kinematic Grashof Criterion',
        symbol: 's + l \\le p + q',
        definition: 'Inequality determining continuous full-revolution crank rotation capability in a planar four-bar mechanism.',
      },
      {
        term: 'Rankine Thermal Efficiency',
        symbol: '\\eta_{th} = \\frac{W_{net}}{Q_{in}} = 1 - \\frac{h_4 - h_1}{h_3 - h_2}',
        definition: 'First-law thermodynamic thermodynamic efficiency of the ideal vapor power plant cycle.',
      },
      {
        term: 'Involute Contact Ratio',
        symbol: 'm_c = \\frac{L_a}{p_b}',
        definition: 'Average number of gear tooth pairs in simultaneous contact along the line of action during meshing.',
      },
    ],
    bibtexCitation: `@article{livesimulators_mechanical,
  title={Interactive Real-Time Numerical Solvers for Mechanical & Thermal Engineering},
  author={Sharma, Anil},
  journal={LiveSimulators Computational Engineering Repository},
  year={2026},
  url={https://livesimulators.com/department/mechanical},
  note={Runge-Kutta & Symplectic Dynamics Solvers}
}`,
  },

  civil: {
    governingSystem: "Euler-Bernoulli Elastic Beam Flexure & Cauchy Tensor Stress Equilibrium",
    differentialClass: "4th-order elliptic boundary value differential equations & discrete matrix structural stiffness systems",
    stateSpaceVector: "\\mathbf{d} = \\begin{bmatrix} u_1 & v_1 & \\theta_1 & \\dots & u_n & v_n & \\theta_n \\end{bmatrix}^T",
    stateSpaceEq: "\\mathbf{K}\\,\\mathbf{d} = \\mathbf{F}_{ext}, \\quad EI\\frac{d^4 w(x)}{dx^4} = q(x)",
    solverFamily: [
      'Direct stiffness matrix method with global nodal coordinate transformation',
      'Double integration and singularity functions for indeterminate beam deflections',
      'Duhamel integral and Newmark-Beta time integration for seismic ground motions',
      'Eigenvalue decomposition for principal stress tensors (Mohr Circle invariants)',
    ],
    canonicalTextbooks: [
      {
        title: 'Structural Analysis',
        authors: 'Russell C. Hibbeler',
        edition: '10th Edition (Pearson)',
        doiOrIsbn: 'ISBN 978-0134610672',
      },
      {
        title: 'Mechanics of Materials',
        authors: 'Ferdinand P. Beer, E. Russell Johnston Jr., John T. DeWolf',
        edition: '8th Edition (McGraw-Hill)',
        doiOrIsbn: 'ISBN 978-1260113273',
      },
      {
        title: 'Dynamics of Structures: Theory and Applications to Earthquake Engineering',
        authors: 'Anil K. Chopra',
        edition: '5th Edition (Pearson)',
        doiOrIsbn: 'ISBN 978-0134555126',
      },
    ],
    computationalTaxonomy: [
      {
        term: 'Flexural Rigidity',
        symbol: 'EI \\; (\\text{N}\\cdot\\text{m}^2)',
        definition: 'Product of elastic modulus E and area moment of inertia I measuring cross-sectional resistance to bending.',
      },
      {
        term: 'Mohr Principal Stresses',
        symbol: '\\sigma_{1,2} = \\frac{\\sigma_x + \\sigma_y}{2} \\pm \\sqrt{\\left(\\frac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2}',
        definition: 'Extreme normal stresses occurring on mutually orthogonal planes where shear stress is identically zero.',
      },
      {
        term: 'Euler Critical Buckling Load',
        symbol: 'P_{cr} = \\frac{\\pi^2 EI}{(KL)^2}',
        definition: 'Maximum axial compressive load a slender column can support without undergoing catastrophic lateral buckling.',
      },
      {
        term: 'Seismic Base Isolation Ratio',
        symbol: 'T_b / T_s',
        definition: 'Ratio of isolated structural natural period to fixed-base period shifting building response away from peak ground spectral acceleration.',
      },
    ],
    bibtexCitation: `@article{livesimulators_civil,
  title={First-Principles Numerical Solvers for Structural Mechanics and Earthquake Dynamics},
  author={Sharma, Anil},
  journal={LiveSimulators Computational Engineering Repository},
  year={2026},
  url={https://livesimulators.com/department/civil},
  note={Direct Stiffness & Euler-Bernoulli Elastic Boundary Solvers}
}`,
  },

  control: {
    governingSystem: "Laplace Transform Domain & State-Variable Modern Control Theory",
    differentialClass: "Linear time-invariant (LTI) & nonlinear input-saturated feedback differential equations",
    stateSpaceVector: "\\dot{\\mathbf{x}}(t) = \\mathbf{A}\\mathbf{x}(t) + \\mathbf{B}u(t), \\quad y(t) = \\mathbf{C}\\mathbf{x}(t) + Du(t)",
    stateSpaceEq: "u(t) = K_p\\left(e(t) + \\frac{1}{T_i}\\int_0^t e(\\tau)d\\tau + T_d\\frac{de(t)}{dt}\\right)",
    solverFamily: [
      'Discrete bilinear Tustin (trapezoidal) Z-transform discretization',
      'Dynamic anti-windup clamping with back-calculation feedback',
      'Newton-Raphson iterative root finding for Evans root-locus branch coordinates',
      'IEC 60534 non-choked and choked compressible/incompressible valve sizing algorithms',
    ],
    canonicalTextbooks: [
      {
        title: 'Modern Control Engineering',
        authors: 'Katsuhiko Ogata',
        edition: '5th Edition (Pearson)',
        doiOrIsbn: 'ISBN 978-0136156734',
      },
      {
        title: 'Feedback Control of Dynamic Systems',
        authors: 'Gene F. Franklin, J. David Powell, Abbas Emami-Naeini',
        edition: '8th Edition (Pearson)',
        doiOrIsbn: 'ISBN 978-0134685717',
      },
      {
        title: 'Lessons in Industrial Instrumentation',
        authors: 'Tony R. Kuphaldt',
        edition: 'Open Creative Commons Edition',
        doiOrIsbn: 'Library of Congress QA76.76',
      },
    ],
    computationalTaxonomy: [
      {
        term: 'Phase Margin',
        symbol: '\\Phi_m = 180^\\circ + \\angle L(j\\omega_{gc})',
        definition: 'Amount of additional phase lag at the gain crossover frequency required to bring the closed-loop system to the verge of instability.',
      },
      {
        term: 'Flow Coefficient',
        symbol: 'C_v = Q \\sqrt{G_f / \\Delta P}',
        definition: 'US engineering volume of 60°F water (GPM) flowing through a valve with a pressure drop of 1 psi.',
      },
      {
        term: 'Damping Ratio & Damped Frequency',
        symbol: '\\omega_d = \\omega_n \\sqrt{1 - \\zeta^2}',
        definition: 'Frequency of oscillation under damped conditions for underdamped 2nd-order poles in the complex s-plane.',
      },
      {
        term: 'Integral Windup',
        symbol: '\\int e(t)dt \\to \\pm u_{max}',
        definition: 'Accumulation of large error integral during actuator saturation causing severe post-transient overshoot.',
      },
    ],
    bibtexCitation: `@article{livesimulators_control,
  title={Real-Time Dynamic Solvers for Closed-Loop Control and Industrial Instrumentation},
  author={Sharma, Anil},
  journal={LiveSimulators Computational Engineering Repository},
  year={2026},
  url={https://livesimulators.com/department/control},
  note={Discrete Tustin Transform & IEC 60534 Hydrodynamic Solvers}
}`,
  },

  chemical: {
    governingSystem: "Navier-Stokes Transport Equations & Phenomenological Chemical Thermodynamics",
    differentialClass: "Nonlinear stiff coupled species mass, momentum, and thermal energy balances",
    stateSpaceVector: "\\mathbf{x}(t) = \\begin{bmatrix} C_A(t) \\\\ T(t) \\end{bmatrix}, \\quad \\mathbf{u}(t) = \\begin{bmatrix} F(t) \\\\ T_j(t) \\end{bmatrix}",
    stateSpaceEq: "\\frac{dC_A}{dt} = \\frac{F}{V}(C_{A0} - C_A) - k_0 e^{-E_a/RT} C_A^2, \\quad \\frac{dT}{dt} = \\frac{F}{V}(T_0 - T) + \\frac{(-\\Delta H_r)r_A}{\\rho C_p} - \\frac{UA}{\\rho V C_p}(T - T_c)",
    solverFamily: [
      'Radau / Stiff RK solvers for highly exothermic Arrhenius kinetics',
      'McCabe-Thiele graphical stepped stage equilibrium solver for binary distillation',
      'Log Mean Temperature Difference (LMTD) & \\epsilon-NTU shell-and-tube solvers',
      'Two-Film mass transfer Kremser-Brown absorption column formulation',
    ],
    canonicalTextbooks: [
      {
        title: 'Elements of Chemical Reaction Engineering',
        authors: 'H. Scott Fogler',
        edition: '6th Edition (Prentice Hall)',
        doiOrIsbn: 'ISBN 978-0135486221',
      },
      {
        title: 'Separation Process Principles',
        authors: 'J. D. Seader, Ernest J. Henley, D. Keith Roper',
        edition: '4th Edition (Wiley)',
        doiOrIsbn: 'ISBN 978-1119141082',
      },
      {
        title: 'Process Heat Transfer: Principles, Applications and Rules of Thumb',
        authors: 'Robert W. Serth, Thomas G. Lestina',
        edition: '2nd Edition (Academic Press)',
        doiOrIsbn: 'ISBN 978-0123971951',
      },
    ],
    computationalTaxonomy: [
      {
        term: 'Arrhenius Reaction Rate',
        symbol: 'k(T) = k_0 e^{-E_a/(RT)}',
        definition: 'Empirical exponential dependence of reaction velocity constant on absolute thermodynamic temperature and activation energy.',
      },
      {
        term: 'Relative Volatility',
        symbol: '\\alpha_{AB} = \\frac{y_A / x_A}{y_B / x_B}',
        definition: 'Measure of the ease with which light component A separates from heavy component B in vapor-liquid equilibrium.',
      },
      {
        term: 'Log Mean Temperature Difference',
        symbol: '\\Delta T_{lm} = \\frac{\\Delta T_1 - \\Delta T_2}{\\ln(\\Delta T_1 / \\Delta T_2)}',
        definition: 'True logarithmic temperature driving force across countercurrent and cocurrent heat exchangers.',
      },
      {
        term: 'Stripping / Absorption Factor',
        symbol: 'A = \\frac{L}{m G}',
        definition: 'Ratio of liquid solvent molar flow to equilibrium slope times vapor gas molar flow in packed columns.',
      },
    ],
    bibtexCitation: `@article{livesimulators_chemical,
  title={Interactive Float64 Solvers for Chemical Reactors, Mass Transfer, and Separation Engineering},
  author={Sharma, Anil},
  journal={LiveSimulators Computational Engineering Repository},
  year={2026},
  url={https://livesimulators.com/department/chemical},
  note={Coupled Arrhenius Kinetics and Non-Ideal VLE Solvers}
}`,
  },

  physics: {
    governingSystem: "Schroedinger Wave Mechanics & Boltzmann-Fermi Statistical Quantum Transport",
    differentialClass: "Complex 2nd-order partial differential wave equations & drift-diffusion semiconductor transport equations",
    stateSpaceVector: "\\psi(x,t) \\in \\mathbb{C}, \\quad \\mathbf{J}_{tot} = \\mathbf{J}_{n,drift} + \\mathbf{J}_{n,diff} + \\mathbf{J}_{p,drift} + \\mathbf{J}_{p,diff}",
    stateSpaceEq: "-\\frac{\\hbar^2}{2m^*}\\frac{d^2\\psi(x)}{dx^2} + V(x)\\psi(x) = E\\psi(x), \\quad \\frac{d^2\\psi}{dx^2} = -\\frac{q}{\\varepsilon}(\\rho_p - \\rho_n + N_D^+ - N_A^-)",
    solverFamily: [
      'Transfer Matrix Method (TMM) for 1D quantum barriers and resonant tunneling',
      'Poisson-Boltzmann self-consistent Poisson solver for P-N depletion space charge',
      'Drift-Diffusion semiconductor continuity solver under carrier recombination',
      'Foster & Cauer RC thermal ladder transient deconvolution for power devices',
    ],
    canonicalTextbooks: [
      {
        title: 'Solid State Electronic Devices',
        authors: 'Ben G. Streetman, Sanjay Kumar Banerjee',
        edition: '7th Edition (Pearson)',
        doiOrIsbn: 'ISBN 978-0133356038',
      },
      {
        title: 'Physics of Semiconductor Devices',
        authors: 'Simon M. Sze, Kwok K. Ng',
        edition: '3rd Edition (Wiley-Interscience)',
        doiOrIsbn: 'ISBN 978-0471143239',
      },
      {
        title: 'Introduction to Quantum Mechanics',
        authors: 'David J. Griffiths, Darrell F. Schroeter',
        edition: '3rd Edition (Cambridge University Press)',
        doiOrIsbn: 'ISBN 978-1107189638',
      },
    ],
    computationalTaxonomy: [
      {
        term: 'Fermi-Dirac Distribution',
        symbol: 'f(E) = \\frac{1}{1 + e^{(E - E_F)/k_B T}}',
        definition: 'Statistical probability that an available quantum energy state at energy E is occupied by an electron at thermodynamic equilibrium.',
      },
      {
        term: 'Quantum Tunneling Transmission',
        symbol: 'T \\approx e^{-2 \\int_{x_1}^{x_2} \\sqrt{\\frac{2m}{\\hbar^2}(V(x) - E)}\\,dx}',
        definition: 'WKB approximation for the finite probability of a particle traversing a potential barrier higher than its kinetic energy.',
      },
      {
        term: 'Built-in Junction Potential',
        symbol: 'V_{bi} = \\frac{k_B T}{q}\\ln\\left(\\frac{N_A N_D}{n_i^2}\\right)',
        definition: 'Equilibrium electrostatic contact potential developed across an abrupt P-N metallurgical interface due to carrier diffusion.',
      },
      {
        term: 'Critical Electric Breakdown Field',
        symbol: 'E_{crit} \\approx 3\\times 10^6\\,\\text{V/cm (SiC)}',
        definition: 'Peak electric field at which impact ionization runaway occurs, ~10x higher in wide-bandgap SiC compared to silicon.',
      },
    ],
    bibtexCitation: `@article{livesimulators_physics,
  title={First-Principles Quantum & Semiconductor Physics Simulations in the Browser},
  author={Sharma, Anil},
  journal={LiveSimulators Computational Engineering Repository},
  year={2026},
  url={https://livesimulators.com/department/physics},
  note={Transfer Matrix & Poisson-Boltzmann Float64 Solvers}
}`,
  },
};

export const DepartmentKnowledgeBlock: React.FC<DepartmentKnowledgeBlockProps> = ({
  departmentId,
  accentColor,
}) => {
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const data = DISCIPLINE_KNOWLEDGE_BASE[departmentId] || DISCIPLINE_KNOWLEDGE_BASE.electrical;

  const handleCopyBibtex = () => {
    soundEngine.playRelayClick();
    navigator.clipboard.writeText(data.bibtexCitation);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  return (
    <section
      id="knowledge-base"
      aria-label="Computational Knowledge Base and Technical Taxonomy"
      className="mt-14 sm:mt-20 scroll-mt-32 rounded-2xl bg-gradient-to-br from-slate-900/90 via-[#0a0f1d] to-[#060a12] border border-slate-800 shadow-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden"
    >
      {/* Ambient background decoration */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-5 pointer-events-none bg-cyan-500" />

      {/* Header with structured badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1.5"
              style={{
                backgroundColor: `${accentColor}15`,
                borderColor: `${accentColor}40`,
                color: accentColor,
              }}
            >
              <Database className="w-3 h-3" />
              Machine &amp; LLM Citable Knowledge Base
            </span>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 hidden sm:inline">
              ISO / ABET Ontology
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>Computational Taxonomy &amp; Mathematical Formulation</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
            Explicit differential formulation, state-variable representations, numerical discretization schemes, and canonical literature citations for search indexing, academic literature citation, and AI attribution.
          </p>
        </div>

        {/* Copy Citation Button */}
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={handleCopyBibtex}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all active:scale-95 shadow-sm"
            title="Copy BibTeX Citation for Academic Papers"
          >
            {copiedBibtex ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">BibTeX Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy BibTeX</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: Mathematical Foundation & State Vector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
        
        {/* Left Column: Governing Differential System */}
        <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            <Binary className="w-4 h-4 text-cyan-400" />
            <span>Differential System Classification</span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-0.5">Primary Governing Laws:</span>
              <p className="text-sm font-semibold text-white">{data.governingSystem}</p>
            </div>

            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-0.5">Differential Equation Class:</span>
              <p className="text-xs text-slate-300 font-mono bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                {data.differentialClass}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">State Vector &amp; Boundary Inputs:</span>
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 overflow-x-auto text-xs text-slate-200">
                <MathView math={data.stateSpaceVector} displayMode={true} />
              </div>
            </div>

            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-1">State-Space Differential Formulation:</span>
              <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 overflow-x-auto text-xs text-slate-200">
                <MathView math={data.stateSpaceEq} displayMode={true} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Numerical Solvers & Integration Schemes */}
        <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Numerical Integration Schemes</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              All physics calculations execute in real time inside client-side Web Workers utilizing native double-precision IEEE 754 64-bit floating point arithmetic with zero cloud latency.
            </p>

            <ul className="space-y-2.5">
              {data.solverFamily.map((solver, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60"
                >
                  <span
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-mono font-bold mt-0.5"
                    style={{
                      backgroundColor: `${accentColor}20`,
                      color: accentColor,
                    }}
                  >
                    0{idx + 1}
                  </span>
                  <span className="leading-relaxed">{solver}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* BibTeX Preview Box */}
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-violet-400" />
                BibTeX Entry
              </span>
              <span className="text-[10px] text-slate-400">Click button above to copy</span>
            </div>
            <pre className="text-[10px] font-mono text-slate-400 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 overflow-x-auto leading-relaxed select-all">
              {data.bibtexCitation}
            </pre>
          </div>
        </div>

      </div>

      {/* Technical Taxonomy Dictionary Terms */}
      <div className="mt-6 pt-6 border-t border-slate-800/80">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Core Domain Nomenclature &amp; Variable Definitions</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data.computationalTaxonomy.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-xs font-bold text-white">{item.term}</span>
              </div>
              <div className="bg-slate-900/80 px-2 py-1 rounded border border-slate-800 text-xs font-mono text-cyan-300 mb-2 overflow-x-auto">
                <MathView math={item.symbol} displayMode={false} />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                {item.definition}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Authoritative Academic Literature & Textbooks */}
      <div className="mt-6 pt-6 border-t border-slate-800/80">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Authoritative Curriculum References &amp; Textbooks</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.canonicalTextbooks.map((book, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 flex flex-col justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-200 mb-1 leading-snug">
                  {book.title}
                </p>
                <p className="text-[11px] text-slate-400 font-sans mb-1">
                  {book.authors}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {book.edition}
                </p>
              </div>
              <span className="text-[10px] font-mono text-cyan-400/80 mt-2 block border-t border-slate-800/50 pt-1.5">
                {book.doiOrIsbn}
              </span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
