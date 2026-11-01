import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Cpu,
  Building2,
  Sliders,
  FlaskConical,
  Atom,
  ShieldCheck,
  ChevronDown,
  Layers,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Scale,
  Sparkles,
} from 'lucide-react';
import { DisciplineId, SimulatorItem } from '../../types';
import { DISCIPLINES, ALL_AVAILABLE_SIMULATORS } from '../../data/simulators';
import { navigateTo } from '../../utils/routes';
import { MathView } from '../MathView';

interface ComparisonPageProps {
  onBackToHome?: () => void;
  onSelectDepartment?: (deptId: DisciplineId) => void;
  onSelectSimulator?: (sim: SimulatorItem) => void;
}

interface ComparisonFeature {
  dimension: string;
  category: string;
  liveSimulators: {
    status: 'leading' | 'supported' | 'partial' | 'unsupported';
    headline: string;
    detail: string;
  };
  phet: {
    status: 'leading' | 'supported' | 'partial' | 'unsupported';
    headline: string;
    detail: string;
  };
  falstad: {
    status: 'leading' | 'supported' | 'partial' | 'unsupported';
    headline: string;
    detail: string;
  };
  simulink: {
    status: 'leading' | 'supported' | 'partial' | 'unsupported';
    headline: string;
    detail: string;
  };
}

export const ComparisonPage: React.FC<ComparisonPageProps> = ({
  onBackToHome,
  onSelectDepartment,
  onSelectSimulator,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const comparisonFeatures: ComparisonFeature[] = [
    {
      dimension: 'Solver Fidelity & Mathematical Kernel',
      category: 'Numerical Physics Core',
      liveSimulators: {
        status: 'leading',
        headline: '60 FPS Float64 RK4 Engine',
        detail:
          'Continuous 4th-Order Runge-Kutta numerical integration with Butcher tableau validation. Double-precision Float64 math running directly in the client browser canvas.',
      },
      phet: {
        status: 'partial',
        headline: 'Euler / Verlet Approximations',
        detail:
          'Simplified numerical stepping tuned for K-12 conceptual demonstrations. Timesteps are clamped or variable with lower stability thresholds.',
      },
      falstad: {
        status: 'supported',
        headline: 'Modified Nodal Analysis (MNA)',
        detail:
          'Matrix-based electronic circuit solver. High performance for lumped linear/non-linear circuits, but restricted strictly to electrical network schemas.',
      },
      simulink: {
        status: 'leading',
        headline: 'Desktop ODE Solvers (ode45/ode15s)',
        detail:
          'Industry-standard variable-step numerical solvers with stiff integration capabilities, but executed on heavy desktop runtimes or closed cloud clusters.',
      },
    },
    {
      dimension: 'International Standards Compliance',
      category: 'Engineering Rigor',
      liveSimulators: {
        status: 'leading',
        headline: 'Full Consensus Standards Citation',
        detail:
          'Every model is mathematically bounded and calibrated against IEEE, IEC, API, ASME, ISA, ISO, AISC, and ACI published consensus standards.',
      },
      phet: {
        status: 'unsupported',
        headline: 'Zero Standards Compliance',
        detail:
          'Designed strictly for qualitative introductory science pedagogy; no engineering industry code references or industrial tolerance limits.',
      },
      falstad: {
        status: 'unsupported',
        headline: 'Textbook Electronic Models',
        detail:
          'Uses idealized components (ideal op-amps, theoretical diodes) without real-world IEEE/IEC equipment standards or thermal derating curves.',
      },
      simulink: {
        status: 'supported',
        headline: 'Add-On Toolboxes Only',
        detail:
          'Compliance modeling requires specialized Simscape and aerospace toolboxes with custom configuration and expensive enterprise licensing.',
      },
    },
    {
      dimension: 'Real-Time Industrial Fault Injection',
      category: 'Diagnostic Readiness',
      liveSimulators: {
        status: 'leading',
        headline: '1-Click Catastrophic Fault Regimes',
        detail:
          'Simulate real-world failure physics: control valve cavitation vs flashing, subsynchronous grid resonance, CT saturation, compliance voltage starvation, and IGBT thermal runaway.',
      },
      phet: {
        status: 'unsupported',
        headline: 'Nominal Operational Regimes Only',
        detail:
          'Sliders are strictly bounded within safe, idealized operating zones. Students cannot induce or analyze destructive failure modes.',
      },
      falstad: {
        status: 'partial',
        headline: 'Basic Circuit Short / Open',
        detail:
          'Components can be shorted or opened, but physical equipment failure mechanisms (dielectric breakdown, core saturation, wear) are not modeled.',
      },
      simulink: {
        status: 'supported',
        headline: 'Manual Scripting Required',
        detail:
          'Fault injection is achievable but requires building complex stateflow charts, custom trigger blocks, or purchasing Simscape fault add-ons.',
      },
    },
    {
      dimension: 'Dual-Domain Telemetry & Visualization',
      category: 'Analytical Instrumentation',
      liveSimulators: {
        status: 'leading',
        headline: 'Synchronous Dual-Domain Scopes',
        detail:
          'Time-domain dynamic waveforms accompanied side-by-side by frequency-domain FFT spectra, Bode plots, phasor vectors, or thermodynamic P-V / T-s state planes.',
      },
      phet: {
        status: 'partial',
        headline: 'Scalar Meters & Simple Strips',
        detail:
          'Basic needle gauges, digital numeric readouts, and simple moving bar graphs without dual-domain spectral or state-space correlation.',
      },
      falstad: {
        status: 'supported',
        headline: 'Oscilloscope Trace Windows',
        detail:
          'Clean multi-channel time-domain waveforms with simple frequency display, but strictly limited to electronic voltage and current traces.',
      },
      simulink: {
        status: 'leading',
        headline: 'Comprehensive Scope Blocks',
        detail:
          'Enterprise-grade spectrum analyzers, constellation diagrams, and loggers, though non-interactive for browser-based student access without accounts.',
      },
    },
    {
      dimension: 'Zero-Install & Mobile Browser Access',
      category: 'Accessibility & Deployment',
      liveSimulators: {
        status: 'leading',
        headline: '100% Free, Zero Login, Mobile Ready',
        detail:
          'Opens instantly in any modern web browser on mobile phones, tablets, Chromebooks, and workstations with 100% client-side privacy.',
      },
      phet: {
        status: 'leading',
        headline: 'Free HTML5 Web Access',
        detail:
          'Widely accessible HTML5 web simulations that run across mobile and desktop browsers with zero installation requirements.',
      },
      falstad: {
        status: 'supported',
        headline: 'Web Browser Port (Java/JS)',
        detail:
          'Runs in modern browsers, but retains a dense 1990s Java desktop interface that is difficult to navigate on mobile touchscreen devices.',
      },
      simulink: {
        status: 'unsupported',
        headline: 'Multi-GB Install or Paid Cloud',
        detail:
          'Requires massive 20+ GB local software installations, campus license server connectivity, or restricted MathWorks Cloud accounts ($$$).',
      },
    },
  ];

  const faqs = [
    {
      q: 'How does LiveSimulators RK4 solver compare to MATLAB Simulinks ode45?',
      a: (
        <span>
          Both LiveSimulators and MATLAB Simulink&apos;s ode45 implement explicit Runge-Kutta formulations. Simulink uses the Dormand-Prince variable-step pair for offline simulation runs, while LiveSimulators implements a high-performance 60 FPS Runge-Kutta 4th-Order (RK4) integrator compiled to native Float64 JavaScript. This enables real-time continuous feedback where users adjust parameters with zero latency while maintaining global truncation error of <MathView math="\mathcal{O}(\Delta t^4)" />, matching analytical benchmarks within 0.05% relative error.
        </span>
      ),
    },
    {
      q: 'Why is PhET often insufficient for university engineering coursework?',
      a: 'PhET Interactive Simulations (University of Colorado Boulder) is an exceptional tool for middle-school, high-school, and introductory college conceptual physics. However, PhET omits formal differential equations, international consensus standards (IEEE, IEC, ASME, API), non-linear industrial boundary limits, and equipment failure modes. LiveSimulators was engineered specifically to bridge this gap for accredited university engineering curricula (ABET / Washington Accord) and practicing plant engineers.',
    },
    {
      q: 'Can LiveSimulators workbenches be embedded into university LMS platforms?',
      a: 'Yes. LiveSimulators provides standardized zero-friction iframe embed codes for Canvas, Moodle, Blackboard, and engineering department courseware. Each embed runs self-contained client-side Float64 solvers with zero cookies or tracking requirements, preventing CLS and conforming to university IT student privacy guidelines.',
    },
    {
      q: 'Is LiveSimulators free for commercial and academic use?',
      a: 'LiveSimulators is 100% free and open-access under educational fair use. Engineering universities, community colleges, vocational institutes, and plant training centers are permitted to incorporate our workbenches into syllabi, laboratory manuals, and lecture demonstrations without licensing fees or account creation.',
    },
  ];

  const getStatusBadge = (status: ComparisonFeature['liveSimulators']['status']) => {
    switch (status) {
      case 'leading':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Leading
          </span>
        );
      case 'supported':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Supported
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> Partial / Limited
          </span>
        );
      case 'unsupported':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle className="w-3 h-3 text-rose-400" /> Unsupported / Absent
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans">
      {/* Top Breadcrumb & Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                if (onBackToHome) onBackToHome();
                else navigateTo('/');
              }}
              className="hover:text-cyan-400 transition-colors"
            >
              Home
            </a>
            <span className="text-slate-600">/</span>
            <span className="text-cyan-400 font-medium">Platform Comparison</span>
          </nav>
          <button
            onClick={() => {
              if (onBackToHome) onBackToHome();
              else navigateTo('/');
            }}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Workbench</span>
          </button>
        </div>
      </header>

      {/* Hero Header */}
      <section className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 mb-4 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            <span>COMPREHENSIVE ENGINEERING SIMULATOR BENCHMARK • 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-5">
            LiveSimulators <span className="text-slate-500 font-normal">vs.</span> PhET{' '}
            <span className="text-slate-500 font-normal">vs.</span> Falstad{' '}
            <span className="text-slate-500 font-normal">vs.</span> MATLAB Simulink
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            A technical evaluation of solver fidelity, consensus standards compliance (IEC / IEEE / API / ASME / ISA),
            real-time industrial failure modeling, and zero-install browser accessibility for engineering faculty and students.
          </p>
        </div>
      </section>

      {/* Semantic Comparison Table */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full flex-1">
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/80">
                <th scope="col" className="p-4 sm:p-5 text-xs font-mono uppercase tracking-wider text-slate-400 w-1/4">
                  Evaluation Dimension
                </th>
                <th
                  scope="col"
                  className="p-4 sm:p-5 text-sm font-bold text-cyan-300 bg-cyan-950/30 border-x border-cyan-500/20 w-1/4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-extrabold text-white">LiveSimulators</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      Our Platform
                    </span>
                  </div>
                  <span className="text-xs font-normal text-slate-400 block mt-1">60 FPS RK4 Client Solver</span>
                </th>
                <th scope="col" className="p-4 sm:p-5 text-sm font-bold text-slate-200 w-1/6">
                  <div>PhET Simulations</div>
                  <span className="text-xs font-normal text-slate-400 block mt-0.5">Univ. of Colorado</span>
                </th>
                <th scope="col" className="p-4 sm:p-5 text-sm font-bold text-slate-200 w-1/6">
                  <div>Falstad Simulator</div>
                  <span className="text-xs font-normal text-slate-400 block mt-0.5">Paul Falstad (Circuits)</span>
                </th>
                <th scope="col" className="p-4 sm:p-5 text-sm font-bold text-slate-200 w-1/6">
                  <div>MATLAB Simulink</div>
                  <span className="text-xs font-normal text-slate-400 block mt-0.5">MathWorks (Commercial)</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
              {comparisonFeatures.map((feat, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  {/* Dimension Name */}
                  <th scope="row" className="p-4 sm:p-5 align-top font-semibold text-white">
                    <div className="text-sm font-bold text-white mb-1">{feat.dimension}</div>
                    <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
                      {feat.category}
                    </span>
                  </th>

                  {/* LiveSimulators Column */}
                  <td className="p-4 sm:p-5 align-top bg-cyan-950/15 border-x border-cyan-500/20">
                    <div className="mb-2">{getStatusBadge(feat.liveSimulators.status)}</div>
                    <div className="font-bold text-white text-sm mb-1">{feat.liveSimulators.headline}</div>
                    <p className="text-xs text-slate-300 leading-relaxed">{feat.liveSimulators.detail}</p>
                  </td>

                  {/* PhET Column */}
                  <td className="p-4 sm:p-5 align-top">
                    <div className="mb-2">{getStatusBadge(feat.phet.status)}</div>
                    <div className="font-bold text-slate-200 text-sm mb-1">{feat.phet.headline}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.phet.detail}</p>
                  </td>

                  {/* Falstad Column */}
                  <td className="p-4 sm:p-5 align-top">
                    <div className="mb-2">{getStatusBadge(feat.falstad.status)}</div>
                    <div className="font-bold text-slate-200 text-sm mb-1">{feat.falstad.headline}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.falstad.detail}</p>
                  </td>

                  {/* MATLAB Simulink Column */}
                  <td className="p-4 sm:p-5 align-top">
                    <div className="mb-2">{getStatusBadge(feat.simulink.status)}</div>
                    <div className="font-bold text-slate-200 text-sm mb-1">{feat.simulink.headline}</div>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.simulink.detail}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* In-Depth Engineering Editorial Analysis */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <article className="p-6 sm:p-8 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Why 60 FPS RK4 Integration Matters</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
              Most browser physics toys rely on first-order explicit Euler stepping (<MathView math="x_{n+1} = x_n + v_n \Delta t" />). While
              adequate for simple gravity ball drops, Euler integration suffers from severe energy divergence and artificial
              damping in resonant systems.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              LiveSimulators implements a double-precision (Float64) 4th-Order Runge-Kutta kernel. By taking four weighted
              derivative evaluations per timestep (<MathView math="k_1, k_2, k_3, k_4" />), our solver achieves <MathView math="\mathcal{O}(\Delta t^5)" /> local error,
              ensuring underdamped RLC circuits, Grashof 4-bar linkages, and CSTR reactor kinetics remain numerically stable
              even during rapid transient changes.
            </p>
          </article>

          <article className="p-6 sm:p-8 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Bridging Theory &amp; International Standards</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
              Standard engineering education teaches idealized formulas: <MathView math="V = IR" />, <MathView math="Q = C_v \sqrt{\Delta P}" />, and <MathView math="\sigma = \frac{M y}{I}" />. However, actual industrial plants operate strictly under consensus standards that govern saturation,
              cavitation, and safety margins.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Every LiveSimulators workbench models international standards directly into the solver: IEEE 1459 / IEC 60076 for
              resonant grid damping, IEC 60534 for control valve vena contracta cavitation, AISC 360 L/360 limits for beam flexure,
              and ACI 318 for reinforced concrete ductility. Students learn both academic theory and industrial practice.
            </p>
          </article>

          <article className="p-6 sm:p-8 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Safe Virtual Failure Mode Exploration</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
              In physical university laboratories, safety interlocks prevent students from driving systems into catastrophic
              instability. As a consequence, young engineers rarely witness how equipment actually fails.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              LiveSimulators allows one-click fault injection: trigger subsynchronous grid resonance, drive control valves into
              choked flashing (<MathView math="P_{\text{vc}} < P_v" />), saturate current transformers with DC offsets, starve 4–20 mA loops below 12 VDC
              compliance, and induce IGBT thermal runaway. Students perform Root Cause Analysis (RCA) in a safe, visual sandbox.
            </p>
          </article>

          <article className="p-6 sm:p-8 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/30">
                <Layers className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Zero Friction for Higher Education</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3">
              Commercial tools like MATLAB Simulink require heavy multi-gigabyte installations, complex license dongles, and
              high-spec laptops that create barriers for students.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              LiveSimulators loads in under 200 ms directly in browser tabs across Chromebooks, Android, iOS, Windows, Mac, and Linux.
              Professors can paste an embed code directly into Canvas, Moodle, or lecture slides, giving 200+ students immediate
              synchronized access during lectures.
            </p>
          </article>
        </section>

        {/* High-Intent Comparison FAQ Accordions */}
        <section className="mt-16 bg-slate-900/40 rounded-2xl border border-slate-800 p-6 sm:p-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Frequently Asked Comparison Questions</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Direct engineering answers for faculty, curriculum designers, and engineering students.
            </p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((f, idx) => (
              <details
                key={idx}
                open={idx === 0}
                className="group rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-colors open:bg-slate-800/40 open:border-slate-700"
              >
                <summary className="font-semibold text-sm sm:text-base text-white cursor-pointer list-none flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-mono inline-flex items-center justify-center border border-cyan-500/30 shrink-0">
                      {idx + 1}
                    </span>
                    <span>{f.q}</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform shrink-0" />
                </summary>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-3 pl-7">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Explore Disciplines CTA */}
        <section className="mt-16 text-center bg-gradient-to-br from-cyan-950/30 via-slate-900/40 to-slate-950 border border-cyan-500/30 rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Experience First-Principles Engineering in Action
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto mb-8">
            Explore over 44 interactive workbenches and full-scale virtual laboratories across all core engineering disciplines.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 max-w-4xl mx-auto mb-8">
            {DISCIPLINES.map((dept) => (
              <a
                key={dept.id}
                href={`/departments/${dept.id}/`}
                onClick={(e) => {
                  e.preventDefault();
                  if (onSelectDepartment) onSelectDepartment(dept.id);
                  else navigateTo(`/departments/${dept.id}/`);
                }}
                className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-center transition-all group"
              >
                <div className="text-xs font-mono text-cyan-400 font-bold mb-1">{dept.code}</div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">{dept.name.split(' ')[0]}</div>
                <span className="text-[10px] text-slate-400 block mt-0.5">{dept.activeSimulatorsCount} Solvers</span>
              </a>
            ))}
          </div>

          <button
            onClick={() => {
              if (onBackToHome) onBackToHome();
              else navigateTo('/');
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
          >
            <span>Launch Complete Simulator Library</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </main>
    </div>
  );
};
