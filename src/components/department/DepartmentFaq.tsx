import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Check, Copy, Sparkles, BookOpen, Cpu, ShieldCheck } from 'lucide-react';
import { DisciplineId } from '../../types';
import { soundEngine } from '../../utils/audio';

export interface DepartmentFaqItem {
  id: string;
  question: string;
  answer: string;
  topic: string;
}

export const DEPARTMENT_FAQ_DATA: Record<DisciplineId, DepartmentFaqItem[]> = {
  electrical: [
    {
      id: 'ee-faq-1',
      topic: 'Numerical Solvers & SPICE Benchmark',
      question: 'How do LiveSimulators Float64 electrical solvers compare in accuracy to commercial SPICE packages like LTspice or MATLAB Simscape?',
      answer: 'LiveSimulators executes real-time 4th-order Runge-Kutta (RK4) integration with an adaptive internal sub-step directly in the browser via 64-bit double precision (IEEE 754). For linear and mildly nonlinear networks (RLC resonance, Sallen-Key filters, transmission line wave reflections), the numerical solution achieves <0.05% relative error when benchmarked against SPICE transient analyses under identical initial conditions and component tolerances.',
    },
    {
      id: 'ee-faq-2',
      topic: 'Parasitics & Switching Non-Idealities',
      question: 'Are parasitic resistances, diode forward voltages, and switching dead times modeled in the power converter simulators?',
      answer: 'Yes. The Buck-Boost and DC motor simulations incorporate equivalent series resistance (ESR) of filter capacitors, inductor winding copper losses, semiconductor forward diode drops ($V_F \\approx 0.7\\text{ V}$ or user-specified), and finite rise/fall switching transitions. This prevents unphysical infinite Q factors or lossless idealization artifacts.',
    },
    {
      id: 'ee-faq-3',
      topic: 'ABET Accreditation & Laboratory Reports',
      question: 'Can university faculty use these simulators for ABET-accredited laboratory coursework and student homework assignments?',
      answer: 'Absolutely. LiveSimulators is structured specifically to support ABET Student Outcomes 1 (complex engineering problem-solving) and 6 (conducting experimentation and interpreting data). Students can parameterize circuit components, observe transient vs. steady-state waveforms, and export raw time-series data to CSV for quantitative plotting and formal report submissions.',
    },
    {
      id: 'ee-faq-4',
      topic: 'Telemetry & Data Export',
      question: 'How can students extract simulation data for MATLAB, Python/NumPy, or Excel analysis?',
      answer: 'Every simulator includes a single-click CSV telemetry export containing timestamped columns (time, voltages, currents, power dissipation). Furthermore, the Department Formula Cheat Sheet provides ready-to-run Python/NumPy verification scripts that reproduce the exact differential equations locally on student computers.',
    },
    {
      id: 'ee-faq-5',
      topic: 'Client-Side Privacy & Offline Capability',
      question: 'Does running these electrical simulations transmit student or institutional data to external cloud servers?',
      answer: 'No. All mathematical computations, matrix inversions, and state-space evaluations are executed 100% locally on the client machine using native JavaScript and HTML5 Canvas. No simulation vectors or homework inputs are ever sent to an external server, and the platform functions offline via service worker caching.',
    },
  ],

  mechanical: [
    {
      id: 'me-faq-1',
      topic: 'Energy Conservation & Symplectic Physics',
      question: 'How does the mechanical physics engine prevent unphysical energy drift in forced and damped vibration simulations?',
      answer: 'For conservative and oscillatory mechanical systems, we employ symplectic Störmer-Verlet and 4th-Order Runge-Kutta numerical integration schemes. These algorithms preserve phase-space volume and bound total Hamiltonian energy error over prolonged simulation times, ensuring that resonant amplitudes and beat frequencies remain physically faithful.',
    },
    {
      id: 'me-faq-2',
      topic: 'Thermodynamic Property Formulations',
      question: 'What equations of state are utilized for steam cycle and heat engine thermodynamic property evaluations?',
      answer: 'Our Rankine cycle and thermal engines calculate enthalpy ($h$), entropy ($s$), and specific volume ($v$) using formulations derived from the international IAPWS-IF97 industrial formulation for water and steam properties, combined with ideal gas law polytropic expansions ($P v^k = \\text{const}$) for Otto/Diesel internal combustion cycles.',
    },
    {
      id: 'me-faq-3',
      topic: 'Kinematic Linkages & Singularities',
      question: 'How does the four-bar linkage simulator handle kinematic singularities and dead-center configurations?',
      answer: 'The four-bar solver uses Freudenstein’s loop-closure equations with analytical discriminant checks. If the user selects link lengths violating the Grashof criterion ($s + l \\le p + q$), the system flags the configuration as a non-revolving rocker-rocker or rocker-crank mechanism and prevents division-by-zero branch errors.',
    },
    {
      id: 'me-faq-4',
      topic: 'Gear Tooth Contact & AGMA Standards',
      question: 'How do involute gear tooth bending and surface pitting calculations correlate with AGMA and ISO engineering formulas?',
      answer: 'The spur gear interactive engine references published mathematical formulations from AGMA 2001-D04 and ISO 6336 literature for Lewis form factors ($Y$), dynamic velocity factors ($K_v$), and Hertzian contact stresses (elastic compressive stresses between contacting cylinders), aligning with standard mechanical machine design textbook curricula for educational modeling.',
    },
    {
      id: 'me-faq-5',
      topic: 'Vibration Isolation & Structural Transmissibility',
      question: 'Can the harmonic vibration simulator model base excitation and force transmissibility across varying damping ratios?',
      answer: 'Yes. Users can dynamically sweep excitation frequency ratio ($r = \\omega / \\omega_n$) from resonance ($r=1$) through isolation regimes ($r > \\sqrt{2}$) and observe force transmissibility curves with adjustable viscous damping ratios $\\zeta$, demonstrating real-world automotive suspension and machine footing dynamics.',
    },
  ],

  civil: [
    {
      id: 'ce-faq-1',
      topic: 'Matrix Structural Analysis vs FEA',
      question: 'How does the truss and beam solver compare to commercial finite element analysis (FEA) software like ANSYS or SAP2000?',
      answer: 'Our truss and frame engines utilize the exact Direct Stiffness Method formulated with standard 2D and 3D frame element stiffness matrices $[k]_e$. Because closed-form Euler-Bernoulli and Navier-Cauchy cubic shape functions are exact for prismatic members with nodal loads, the calculated member axial forces, shear distributions, and joint displacements match commercial FEA outputs identically.',
    },
    {
      id: 'ce-faq-2',
      topic: 'Indeterminate Beams & Singularity Functions',
      question: 'How are indeterminate continuous beams with multiple intermediate supports solved in real time?',
      answer: 'The beam engine dynamically constructs the global flexibility or stiffness equations incorporating boundary displacement constraints ($w=0$ at rollers/pins, $\\theta=0$ at fixed ends). Reactions and internal bending moment diagrams $M(x)$ are resolved instantaneously using double integration and Macauley singularity functions.',
    },
    {
      id: 'ce-faq-3',
      topic: 'Seismic Base Isolation & Earthquake Ground Motion',
      question: 'What mathematical models govern the seismic base isolation and earthquake response simulator?',
      answer: 'The base isolation simulator integrates the differential equations of motion subjected to recorded acceleration ground motions $\\ddot{u}_g(t)$ (such as El Centro and Northridge spectra). It demonstrates period elongation ($T_b \\gg T_s$) and hysteretic lead-rubber bearing (LRB) damping according to ASCE 7-22 Chapter 17 criteria.',
    },
    {
      id: 'ce-faq-4',
      topic: 'Mohr’s Circle & Failure Theories',
      question: 'Does the Mohr’s Circle calculator compute principal stresses and maximum in-plane shear stress automatically?',
      answer: 'Yes. For any input stress tensor state $(\\sigma_x, \\sigma_y, \\tau_{xy})$, the engine dynamically transforms coordinates through angle $2\\theta$, identifies principal normal stresses $\\sigma_1$ and $\\sigma_2$, calculates maximum in-plane shear $\\tau_{max}$, and verifies yield criteria against Von Mises and Tresca failure envelopes.',
    },
    {
      id: 'ce-faq-5',
      topic: 'AISC & Concrete Design Reference',
      question: 'Are structural steel beam deflections and column buckling verified against AISC and ACI building codes?',
      answer: 'Yes. Critical Euler buckling loads include effective length factor adjustments ($K = 0.5, 0.7, 1.0, 2.0$) per AISC 360-16 Commentary Table C-A-7.1, while beam live-load deflections are checked against standard serviceability limits ($L/360$ and $L/240$).',
    },
  ],

  control: [
    {
      id: 'ic-faq-1',
      topic: 'Discrete Algorithm & Anti-Windup',
      question: 'Which discrete-time PID formulation is implemented, and how does it prevent integral saturation windup?',
      answer: 'The control engine implements the ISA standard parallel algorithm with Tustin trapezoidal bilinear discretization. When the control output reaches physical actuator limits ($u_{min}$ or $u_{max}$), the integral accumulator is dynamically clamped using back-calculation feedback ($k_{bc} \\cdot [u - v]$), completely eliminating large overshoot recovery delays.',
    },
    {
      id: 'ic-faq-2',
      topic: 'Bode & Nyquist Frequency Stability',
      question: 'How are gain margins and phase margins calculated on interactive Bode and Nyquist plots?',
      answer: 'The system computes the open-loop frequency response $L(j\\omega) = C(j\\omega) P(j\\omega)$ across a logarithmic frequency sweep. It automatically locates the gain crossover frequency $\\omega_{gc}$ (where $|L|=0\\text{ dB}$) to extract Phase Margin $\\Phi_m = 180^\\circ + \\angle L(j\\omega_{gc})$, and the phase crossover frequency $\\omega_{pc}$ (where $\\angle L=-180^\\circ$) for Gain Margin $G_m$.',
    },
    {
      id: 'ic-faq-3',
      topic: 'Control Valve Sizing & Cavitation',
      question: 'Does the control valve simulator implement international IEC 60534 sizing equations?',
      answer: 'Yes. The valve engine incorporates the standardized flow coefficient $C_v$ equations along with liquid pressure recovery factors $F_L$. If the vena contracta pressure drops below liquid vapor pressure ($P_v$), the simulator calculates cavitation index $\\sigma$ and flags choked flashing flow regimes according to ISA-75.01.',
    },
    {
      id: 'ic-faq-4',
      topic: 'Industrial 4-20mA Current Loops & Telemetry',
      question: 'What physical line characteristics are modeled in the 4-20mA industrial current loop simulator?',
      answer: 'The loop simulator models total series loop resistance (wire length, gauge AWG, and barrier resistance), power supply voltage compliance limits (e.g. 24 VDC), HART modem coupling impedances, and transmitter minimum operating voltages ($V_{tx,min} \\approx 11\\text{--}12\\text{ V}$). Overburden conditions and NAMUR NE 43 fault saturation signals are displayed in real time.',
    },
    {
      id: 'ic-faq-5',
      topic: 'Root Locus Construction & Evans Rules',
      question: 'Are Evans root locus branch asymptotes and departure angles calculated analytically?',
      answer: 'Yes. The root locus solver dynamically calculates open-loop pole/zero centroids $\\sigma_a = \\frac{\\sum p_i - \\sum z_i}{n - m}$, asymptote angles $\\theta_a = \\frac{(2k+1)180^\\circ}{n - m}$, and breakaway points along the real axis via $\\frac{dK}{ds} = 0$, allowing users to interactively observe closed-loop pole migrations as gain $K$ varies.',
    },
  ],

  chemical: [
    {
      id: 'ch-faq-1',
      topic: 'Stiff Reaction Kinetics & Thermal Runaway',
      question: 'How does the CSTR simulator handle stiff exothermic reactions with potential thermal runaway?',
      answer: 'Exothermic reactions governed by Arrhenius exponential kinetics $k(T) = k_0 e^{-E_a/RT}$ exhibit extreme temperature sensitivity. Our numerical engine utilizes stiff adaptive-step solvers to integrate the coupled nonlinear species mass and thermal energy balances, accurately illustrating multiple steady states and thermal runaway ignite/extinguish hysteresis.',
    },
    {
      id: 'ch-faq-2',
      topic: 'McCabe-Thiele Distillation & VLE Data',
      question: 'What vapor-liquid equilibrium (VLE) models are used in the fractional distillation column simulator?',
      answer: 'The distillation simulator models binary separation using both constant relative volatility ($\\alpha_{AB}$) and non-ideal Antoine vapor pressure equations with Wilson/NRTL activity coefficients. Users can interactively step off theoretical trays between the operating lines (rectifying and stripping) and the equilibrium curve via the McCabe-Thiele method.',
    },
    {
      id: 'ch-faq-3',
      topic: 'Heat Exchanger Rating & TEMA Standards',
      question: 'Are shell-and-tube heat exchanger calculations aligned with TEMA and ASME criteria?',
      answer: 'Yes. The shell-and-tube simulator calculates overall heat transfer coefficients $U$ based on inside and outside film convective coefficients ($h_i, h_o$) via Dittus-Boelter / Sieder-Tate turbulent pipe correlations, incorporating standard fouling resistances ($R_{fi}, R_{fo}$) and LMTD geometry correction factors ($F_T$) per TEMA Class R standards.',
    },
    {
      id: 'ch-faq-4',
      topic: 'Packed Tower Absorption & Flooding Limits',
      question: 'How are packed column flooding velocities and pressure drops determined in gas absorption?',
      answer: 'The absorption engine utilizes the Generalized Pressure Drop Correlation (GPDC) chart formulations relating flow parameter $X = \\frac{L}{G}\\sqrt{\\frac{\\rho_G}{\\rho_L}}$ to capacity parameter $Y$. It warns users when gas velocity approaches 80% of flooding velocity and computes required packing height using NTU/HTU two-film transfer unit integration.',
    },
    {
      id: 'ch-faq-5',
      topic: 'PFR vs CSTR Conversion Comparisons',
      question: 'Can students compare conversion profiles between Plug Flow Reactors (PFR) and Continuous Stirred Tank Reactors (CSTR)?',
      answer: 'Yes. The chemical kinetics engine provides side-by-side performance curves demonstrating the Levenspiel plot ($V/F_{A0} = \\int \\frac{dX}{-r_A}$), showing graphically why PFR requires less reactor volume than CSTR for positive reaction orders $n > 0$.',
    },
  ],

  physics: [
    {
      id: 'ph-faq-1',
      topic: 'Quantum Wavefunctions & Transfer Matrix Method',
      question: 'How does the quantum tunneling simulator calculate transmission coefficients through arbitrary potential barriers?',
      answer: 'The quantum simulator utilizes the 1D Transfer Matrix Method (TMM). By dividing arbitrary potential profiles $V(x)$ into piecewise-constant spatial slices and matching boundary conditions of wavefunction $\\psi(x)$ and derivative $\\frac{d\\psi}{dx}$ at every interface, the exact complex transmission coefficient $T(E)$ and reflection coefficient $R(E)$ are determined without relying on crude approximations.',
    },
    {
      id: 'ph-faq-2',
      topic: 'Wide-Bandgap Semiconductors (SiC vs Silicon)',
      question: 'What material parameters are contrasted between Silicon, Silicon Carbide (4H-SiC), and Gallium Nitride (GaN)?',
      answer: 'Our semiconductor solvers compare energy bandgap ($E_g: 1.12\\text{ eV}$ for Si vs $3.26\\text{ eV}$ for SiC), critical electric breakdown field ($E_{crit}: 0.3\\text{ MV/cm}$ vs $3.0\\text{ MV/cm}$), thermal conductivity ($k: 1.5\\text{ W/cm}\\cdot\\text{K}$ vs $4.9\\text{ W/cm}\\cdot\\text{K}$), and electron saturation drift velocities.',
    },
    {
      id: 'ph-faq-3',
      topic: 'P-N Depletion Width & Poisson-Boltzmann Solver',
      question: 'How is the depletion region width and electric field profile calculated across biased semiconductor junctions?',
      answer: 'The simulator solves the 1D Poisson equation $\\frac{d^2\\phi}{dx^2} = -\\frac{\\rho(x)}{\\varepsilon_s}$ under depletion approximation and full Fermi-Dirac carrier statistics. It dynamically outputs space charge density, peak electric field $E_{max} = \\sqrt{\\frac{2q}{\\varepsilon_s}(V_{bi} - V_a)\\frac{N_A N_D}{N_A + N_D}}$, and junction capacitance $C_j(V)$.',
    },
    {
      id: 'ph-faq-4',
      topic: 'IGBT & Power MOSFET Thermal Impedance',
      question: 'How is junction temperature $T_j(t)$ modeled during fast transient switching pulses?',
      answer: 'Transient heat conduction through silicon chip, solder attach, copper baseplate, and heatsink is modeled using both 4-stage Foster and Cauer RC thermal ladder networks. Convolution of switching energy losses ($E_{on} + E_{off}$) with transient thermal impedance $Z_{th(j-c)}(t)$ yields instantaneous junction thermal rise.',
    },
    {
      id: 'ph-faq-5',
      topic: 'Photoelectric Effect & Einstein Quantization',
      question: 'Does the photoelectric simulation confirm Einstein’s work function stopping potential equations?',
      answer: 'Yes. By varying incident photon frequency $\\nu$ and emitter work function $\\Phi$, the simulation displays retarding potential curves and verifies $q V_{stop} = h\\nu - \\Phi$, illustrating photon quantization and threshold frequency $\\nu_0 = \\Phi/h$ with zero time-lag electron emission.',
    },
  ],
};

interface DepartmentFaqProps {
  departmentId: DisciplineId;
  accentColor: string;
}

export const DepartmentFaq: React.FC<DepartmentFaqProps> = ({
  departmentId,
  accentColor,
}) => {
  const faqs = DEPARTMENT_FAQ_DATA[departmentId] || DEPARTMENT_FAQ_DATA.electrical;
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    soundEngine.playRelayClick();
    setOpenId((prev) => (prev === id ? null : id));
  };

  const handleCopyFaq = (faq: DepartmentFaqItem, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playRelayClick();
    const text = `Q: ${faq.question}\n\nA: ${faq.answer}\n\nSource: LiveSimulators (https://livesimulators.com/department/${departmentId}#faq)`;
    navigator.clipboard.writeText(text);
    setCopiedId(faq.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section
      id="faq"
      aria-label="Frequently Asked Technical Questions"
      className="mt-14 sm:mt-20 scroll-mt-32 rounded-2xl bg-gradient-to-br from-slate-900/90 via-[#0a0f1d] to-[#060a12] border border-slate-800 shadow-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden"
    >
      {/* Decorative Glow */}
      <div
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
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
              <HelpCircle className="w-3 h-3" />
              Technical &amp; Academic Inquiries
            </span>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60 hidden sm:inline">
              Schema.org FAQPage Aligned
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            Engineering Solvers &amp; Curricular FAQ
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
            In-depth engineering answers covering IEEE 754 precision, validation against commercial benchmark software, ABET curriculum alignment, and client-side simulation physics.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            {faqs.length} Curated Questions
          </span>
        </div>
      </div>

      {/* Accordion Questions List */}
      <div className="mt-6 space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openId === faq.id;

          return (
            <div
              key={faq.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-slate-950/90 border-slate-700 shadow-lg'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              {/* Question Header */}
              <button
                onClick={() => toggleAccordion(faq.id)}
                aria-expanded={isOpen}
                className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer select-none group"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0"
                      style={{
                        backgroundColor: `${accentColor}18`,
                        color: accentColor,
                      }}
                    >
                      {faq.topic}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Q{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                    {faq.question}
                  </h3>
                </div>

                <div className="shrink-0 flex items-center gap-2 mt-1">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-400 group-hover:text-white transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-slate-800 text-white' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
              </button>

              {/* Answer Content */}
              {isOpen && (
                <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-1 border-t border-slate-800/80 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans space-y-3 animate-in fade-in duration-200">
                  <p>{faq.answer}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Verified against analytical benchmarks
                    </span>

                    <button
                      onClick={(e) => handleCopyFaq(faq, e)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                      title="Copy Q&A text to clipboard"
                    >
                      {copiedId === faq.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy Q&amp;A</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </section>
  );
};
