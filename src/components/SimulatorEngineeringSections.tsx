import React from 'react';
import {
  BookOpen,
  ShieldAlert,
  Table,
  HelpCircle,
  Award,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  Activity,
  GraduationCap,
  Play,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { SimulatorItem } from '../types';
import { ALL_AVAILABLE_SIMULATORS } from '../data/simulators';
import { MathView } from './MathView';
import { RichMathText } from './RichMathText';
import { getEngineeringTheory } from '../utils/engineeringTheory';
import { getSimulatorEngineeringDetails, WorkedEngineeringScenario } from '../utils/engineeringScenarios';
import { getSimulatorEngineeringContent } from '../data/simulatorEngineeringContent';
import {
  getLiveResultSummary,
  getDetailedWhyItHappened,
  generateSimulatorUniqueParagraph
} from '../utils/simulatorExplanations';

export interface SimulatorEngineeringSectionsProps {
  simulator: SimulatorItem;
  params?: Record<string, number>;
  metrics?: Array<{
    label: string;
    value: string | number;
    unit: string;
    description?: string;
    status?: string;
  }>;
  onApplyParameters?: (params: Record<string, number>) => void;
  onSelectSimulator?: (sim: SimulatorItem) => void;
}

export const SimulatorEngineeringSections: React.FC<SimulatorEngineeringSectionsProps> = ({
  simulator,
  params = {},
  metrics = [],
  onApplyParameters,
  onSelectSimulator,
}) => {
  const theory = getEngineeringTheory(simulator);
  const details = getSimulatorEngineeringDetails(simulator);
  const engContent = getSimulatorEngineeringContent(simulator.id);

  const directAnswerSummary = simulator.directAnswerSummary || engContent.directAnswerSummary;
  const industrialFailureCase = simulator.industrialFailureCase || engContent.industrialFailureCase;
  const faqs = simulator.faqs && simulator.faqs.length >= 3 ? simulator.faqs : engContent.faqs;

  // Live dynamic explanations and unique paragraph
  const liveResult = getLiveResultSummary(simulator.type, params);
  const whyDetail = getDetailedWhyItHappened(simulator.type, params);
  const uniqueParagraph = generateSimulatorUniqueParagraph(simulator, params);

  const relatedSimulators = ALL_AVAILABLE_SIMULATORS.filter(
    (s) => s.discipline === simulator.discipline && s.id !== simulator.id
  ).slice(0, 6);

  const getStateBadgeStyle = (state: WorkedEngineeringScenario['state']) => {
    switch (state) {
      case 'Fault / Saturation State':
        return 'bg-rose-500/15 border-rose-500/40 text-rose-300';
      case 'High-Load / Boundary Condition':
        return 'bg-amber-500/15 border-amber-500/40 text-amber-300';
      case 'Nominal Design Point':
      default:
        return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300';
    }
  };

  const getStatusBadgeStyle = (statusType: string) => {
    switch (statusType) {
      case 'critical':
        return 'bg-rose-500/15 border-rose-500/40 text-rose-300';
      case 'warning':
        return 'bg-amber-500/15 border-amber-500/40 text-amber-300';
      case 'optimal':
        return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300';
      case 'info':
      default:
        return 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300';
    }
  };

  // Compile full telemetry list from live probes or key metrics fallback
  const telemetryProbes =
    metrics && metrics.length > 0
      ? metrics
      : (simulator.keyMetrics || []).map((km) => ({
          label: km.label,
          value: 'Dynamic Float64',
          unit: km.unit || '',
          description: `Monitors primary performance indicator (${km.label}) derived from ${simulator.physicalLaw}.`,
          status: 'normal',
        }));

  return (
    <article
      id="simulator-engineering-content"
      aria-label={`${simulator.title} Technical Overview, First-Principles Theory, and Engineering Standards`}
      className="w-full bg-[#0a0f18] text-slate-100 border-t border-slate-800/80 px-3 sm:px-6 lg:px-8 py-10 space-y-12"
    >
      {/* 5-Section Jump Navigation Bar for Students & Screen Readers */}
      <nav
        aria-label="Engineering Documentation Sections"
        className="max-w-6xl mx-auto p-2.5 rounded-xl bg-slate-900/95 border border-slate-800 shadow-md flex items-center justify-between flex-wrap gap-2 text-xs font-mono"
      >
        <span className="text-slate-400 font-bold uppercase text-[10.5px] px-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Full Documentation:</span>
        </span>
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <a
            href="#section-insight"
            className="px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>1. Insight</span>
          </a>
          <a
            href="#section-theory"
            className="px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 transition-colors flex items-center gap-1"
          >
            <BookOpen className="w-3 h-3 text-cyan-400" />
            <span>2. Theory</span>
          </a>
          <a
            href="#section-telemetry"
            className="px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 transition-colors flex items-center gap-1"
          >
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>3. Telemetry</span>
          </a>
          <a
            href="#section-standards"
            className="px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-blue-500/20 hover:text-blue-300 text-slate-300 transition-colors flex items-center gap-1"
          >
            <Award className="w-3 h-3 text-blue-400" />
            <span>4. Standards</span>
          </a>
          <a
            href="#section-curriculum"
            className="px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-purple-500/20 hover:text-purple-300 text-slate-300 transition-colors flex items-center gap-1"
          >
            <GraduationCap className="w-3 h-3 text-purple-400" />
            <span>5. Curriculum</span>
          </a>
          <a
            href="#workbench-stage"
            className="px-2.5 py-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-500/40 transition-colors flex items-center gap-1 ml-auto"
            title="Return to the interactive simulation workbench canvas"
          >
            <Play className="w-3 h-3 text-cyan-400 fill-cyan-400" />
            <span>Back to Simulator &uarr;</span>
          </a>
        </div>
      </nav>

      {/* =========================================================================
          SECTION 1: INSIGHT & FIRST-PRINCIPLES PHYSICAL DIAGNOSTICS
          ========================================================================= */}
      <section
        id="section-insight"
        aria-labelledby="heading-insight"
        className="max-w-6xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="heading-insight" className="text-lg sm:text-xl font-bold font-mono text-white m-0">
                1. Insight &amp; First-Principles Machine State
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5 m-0">
                Real-time physical interpretation, dynamic state diagnosis, and failure prevention
              </p>
            </div>
          </div>
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${getStatusBadgeStyle(liveResult.statusType)}`}>
            {liveResult.badgeLabel}
          </span>
        </div>

        {/* Direct Engineering Answer Block */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-950 to-blue-950/40 border border-cyan-500/40 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-cyan-500/20 text-xs font-mono">
            <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Direct Engineering Formulation Citation</span>
            </span>
            <span className="text-slate-400 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              {simulator.standardReference?.split('/')[0].trim() || `${simulator.badge} Consensus`}
            </span>
          </div>
          <RichMathText
            as="p"
            className="text-xs sm:text-sm text-cyan-100 font-sans leading-relaxed m-0 font-medium"
            mathClassName="text-cyan-300 font-bold text-sm sm:text-base font-mono"
            boldClassName="text-white font-bold tracking-tight"
          >
            {directAnswerSummary}
          </RichMathText>
        </div>

        {/* Dynamic Live Result Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Current Operational Diagnostic:</span>
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/60 shadow-sm">
                {liveResult.primaryMetric}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white m-0 tracking-tight">
              {liveResult.headline}
            </h3>
            <RichMathText as="p" className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans m-0">
              {liveResult.summary}
            </RichMathText>

            {/* Dedicated Canonical Governing Formulation Callout Block */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between text-[10.5px] font-mono uppercase text-cyan-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Canonical Governing Equation ({simulator.physicalLaw})</span>
                </span>
                <span className="text-slate-500 text-[9px] font-normal hidden sm:inline">60 FPS Double-Precision Solver</span>
              </div>
              <div className="py-1.5 px-3 rounded-lg bg-slate-950/90 border border-slate-800 overflow-x-auto custom-scrollbar">
                <MathView math={simulator.governingEquation} block className="text-cyan-300 text-sm sm:text-base font-bold" />
              </div>
              <p className="text-[11px] text-slate-400 font-sans leading-relaxed m-0">
                {simulator.equationDescription}
              </p>
            </div>

            {/* Active Operating Coordinates */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-2 border-t border-slate-800/80">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Active Coordinates:</span>
              {simulator.parameters.map((p) => {
                const val = params[p.id] ?? p.default;
                return (
                  <span key={p.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 shadow-sm">
                    <span className="text-slate-500">{p.symbol || p.name}:</span>
                    <strong className="text-cyan-300">{val}</strong>
                    <span className="text-slate-500 text-[10px]">{p.unit}</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-950 to-amber-950/20 border border-amber-800/50 space-y-2.5 flex flex-col justify-between shadow-xl">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Industrial Reality</span>
                </div>
                <span className="text-[9.5px] font-mono text-amber-300 font-bold px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-800/60 uppercase">
                  Critical Reliability
                </span>
              </div>
              <RichMathText as="p" className="text-xs text-slate-200 leading-relaxed font-sans m-0">
                {whyDetail.realWorldImpact}
              </RichMathText>
            </div>
            <div className="pt-2 border-t border-amber-800/40 text-[10.5px] font-mono text-amber-300/80">
              <span>Standard Verification: </span>
              <strong className="text-white">{simulator.standardReference?.split('/')[0].trim() || 'ISO / IEEE / ASME'}</strong>
            </div>
          </div>
        </div>

        {/* Dynamic Parameter Sensitivity & Operational Envelope Matrix */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800">
            <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Parameter Sensitivity &amp; Machine Dynamics Matrix ({simulator.parameters.length} Controls):</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Hover/inspect slider sensitivity on physical state
            </span>
          </div>

          {/* 2 to 3 column Grid of Parameter Influence Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {simulator.parameters.map((p) => {
              const val = params[p.id] ?? p.default;
              return (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-colors space-y-1.5 shadow-inner"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-white truncate flex items-center gap-1">
                      <span>{p.name}</span>
                      <span className="text-cyan-400 font-semibold">(<MathView math={p.symbol} />)</span>
                    </span>
                    <span className="font-mono text-cyan-300 font-bold bg-slate-950 px-2 py-0.5 rounded text-[11px] border border-slate-800 shadow-sm shrink-0">
                      {val} {p.unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed m-0 line-clamp-2">
                    {p.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
                    <span>Range: <strong className="text-slate-300">[{p.min} - {p.max} {p.unit}]</strong></span>
                    <span>Baseline: <strong className="text-slate-300">{p.default}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Synthesized Narrative Summary */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider flex items-center gap-1">
              <Info className="w-3 h-3 text-amber-400" />
              <span>Dynamic Machine Synthesis &amp; Control Coupling:</span>
            </span>
            <RichMathText as="p" className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans m-0">
              {uniqueParagraph}
            </RichMathText>
          </div>
        </div>

        {/* Physical Mechanism Breakdown Points */}
        {whyDetail.simpleExplanation && whyDetail.simpleExplanation.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 shadow-xl">
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Step-by-Step Physical Mechanism Breakdown ({whyDetail.simpleExplanation.length} Physical Stages)</span>
            </div>
            <div className="space-y-2.5">
              {whyDetail.simpleExplanation.map((point, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/30 transition-all flex items-start gap-3 shadow-inner"
                >
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-cyan-500/30 shadow-sm">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <RichMathText as="p" className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans m-0">
                    {point}
                  </RichMathText>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Challenges / Regimes to Test in Workbench */}
        {whyDetail.interactiveChallenges && whyDetail.interactiveChallenges.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 m-0">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Interactive Benchmarks &amp; Operating Challenges (Click to Apply):</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {whyDetail.interactiveChallenges.map((ch, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-2.5"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{ch.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed m-0 font-sans">
                      {ch.explanation}
                    </p>
                  </div>
                  {onApplyParameters && (
                    <button
                      type="button"
                      onClick={() => onApplyParameters(ch.targetParams)}
                      className="self-start px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{ch.actionText}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 2: THEORY & GOVERNING EQUATIONS
          ========================================================================= */}
      <section
        id="section-theory"
        aria-labelledby="heading-theory"
        className="max-w-6xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="heading-theory" className="text-lg sm:text-xl font-bold font-mono text-white m-0">
                2. Theory &amp; Governing Equations
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5 m-0">
                Exact first-principles formulations integrated at 60 FPS double-precision numerical resolution
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/50 text-cyan-300 font-bold">
            {simulator.physicalLaw}
          </span>
        </div>

        {/* Equations List */}
        <div className="space-y-4">
          {theory.governingEquations.map((eq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-3">
              <div className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wide">
                {eq.title}
              </div>
              <div className="py-2.5 px-3 rounded-lg bg-slate-900 border border-slate-800/80 overflow-x-auto custom-scrollbar">
                <MathView math={eq.latex} block className="text-cyan-300 text-sm sm:text-base font-semibold" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed m-0 font-sans">
                {eq.description}
              </p>
            </div>
          ))}
        </div>

        {/* Clean Definition List of Variables & SI Units from Slider Config */}
        <div className="space-y-2.5 pt-2">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 m-0">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Definition of Formulation Variables &amp; Standard SI Units</span>
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono pt-1">
            {simulator.parameters.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-1 shadow-inner"
              >
                <dt className="text-cyan-300 font-bold flex items-center justify-between">
                  <span className="inline-flex items-center gap-1">
                    {p.name} (<MathView math={p.symbol} />)
                  </span>
                  <span className="text-[11px] text-amber-300 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {p.unit || 'dimensionless'}
                  </span>
                </dt>
                <dd className="text-slate-400 font-sans text-[11px] leading-relaxed m-0 pt-0.5">
                  Operating Range: <strong className="text-slate-200">[{p.min} to {p.max} {p.unit}]</strong> • Baseline Default: <strong className="text-slate-200">{p.default} {p.unit}</strong> — {p.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Analytical Derivation */}
        {simulator.analyticalProof && (
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/30 text-xs font-sans text-slate-300 leading-relaxed space-y-2">
            <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Step-by-Step Analytical Derivation &amp; Proof:</span>
            </div>
            <RichMathText as="p" className="m-0 text-slate-200 leading-relaxed font-sans">
              {simulator.analyticalProof}
            </RichMathText>
          </div>
        )}

        {/* Mathematical Assumptions & Physical Limitations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Governing Physical Assumptions:</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed list-disc pl-4 font-sans m-0">
              {theory.assumptions.map((ass, i) => (
                <li key={i}>
                  <RichMathText as="span">{ass}</RichMathText>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Model Boundary Limitations:</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed list-disc pl-4 font-sans m-0">
              {theory.limitations.map((lim, i) => (
                <li key={i}>
                  <RichMathText as="span">{lim}</RichMathText>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: LIVE TELEMETRY DEFINITIONS & SENSOR PROBES
          ========================================================================= */}
      <section
        id="section-telemetry"
        aria-labelledby="heading-telemetry"
        className="max-w-6xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 id="heading-telemetry" className="text-lg sm:text-xl font-bold font-mono text-white m-0">
                3. Live Telemetry Definitions &amp; Virtual Probes
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5 m-0">
                Measurement registers, sensor probe nodes, mathematical keys, and alert thresholds
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 font-bold">
            Float64 Real-Time Probe Bus
          </span>
        </div>

        {/* Telemetry Definition Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {telemetryProbes.map((probe, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition-colors flex flex-col justify-between gap-2 shadow-inner"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white truncate">
                    {probe.label}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {probe.unit || 'unitless'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed m-0 line-clamp-3">
                  {probe.description || `Sensor probe node tracking ${probe.label} under dynamic operational excitations.`}
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10.5px] font-mono">
                <span className="text-slate-500">Live Reading:</span>
                <span className="text-emerald-400 font-bold">
                  {probe.value} {probe.unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Mathematical Key Metrics Formula Alignment */}
        {simulator.keyMetrics && simulator.keyMetrics.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 m-0">
              <Table className="w-3.5 h-3.5 text-cyan-400" />
              <span>Solver Key Metric Extraction Formulas</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-mono">
              {simulator.keyMetrics.map((km, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">{km.label}</div>
                  <div className="text-cyan-300 font-semibold truncate">Key: {km.formulaKey || 'computed'}</div>
                  <div className="text-amber-400 text-[10px]">Standard Unit: {km.unit || 'dimensionless'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 4: APPLICABLE ENGINEERING STANDARDS & VALIDATION BENCHMARKS
          ========================================================================= */}
      <section
        id="section-standards"
        aria-labelledby="heading-standards"
        className="max-w-6xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 id="heading-standards" className="text-lg sm:text-xl font-bold font-mono text-white m-0">
                4. Applicable Engineering Standards &amp; Validation Benchmarks
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5 m-0">
                International consensus codes, publishing authorities, NIST/IEEE benchmarks, and saturation limits
              </p>
            </div>
          </div>
          {simulator.standardReference && (
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-blue-950/60 border border-blue-800/50 text-blue-300 font-bold">
              {simulator.standardReference.split('/')[0].trim()}
            </span>
          )}
        </div>

        {/* Standards Citation & Body Strip */}
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold font-mono text-[11px] uppercase">
              <Award className="w-4 h-4" />
              <span>Referenced International Consensus Standard:</span>
            </div>
            <div className="text-sm font-bold text-white">
              {simulator.standardReference || `${simulator.badge} Consensus Standard`}
            </div>
          </div>
          <div className="text-slate-300 font-mono text-xs text-left sm:text-right">
            <span className="text-slate-500 block text-[10px] uppercase">Promulgating Body:</span>
            <strong className="text-cyan-300">{simulator.standardBody || 'ISO / IEC / IEEE Engineering Body'}</strong>
          </div>
        </div>

        {/* Real-World Industrial Failure Case & Root Cause Analysis (RCA) */}
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-rose-950/30 via-slate-950 to-rose-950/20 border border-rose-900/50 space-y-2">
          <div className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Real-World Industrial Failure Case &amp; Root Cause Analysis (RCA):</span>
          </div>
          <RichMathText as="p" className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans m-0">
            {industrialFailureCase}
          </RichMathText>
        </div>

        {/* Numerical Benchmark Verification & Color Topology Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {simulator.validationTest && (
            <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 space-y-1.5">
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>NIST / IEEE Numerical Benchmark Verification (Error &lt; 0.2%):</span>
              </div>
              <RichMathText as="p" className="text-slate-300 text-xs font-mono leading-relaxed m-0">
                {simulator.validationTest}
              </RichMathText>
            </div>
          )}

          {simulator.colorStandardRule && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Color Topology &amp; Standard Waveform Rules:</span>
              </div>
              <RichMathText as="p" className="text-slate-300 text-xs font-mono leading-relaxed m-0">
                {simulator.colorStandardRule}
              </RichMathText>
            </div>
          )}
        </div>

        {/* Boundary Conditions & Operational Envelopes Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <h3 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 m-0">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Physical Operational Envelopes</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="pb-2">Parameter</th>
                    <th className="pb-2">Operating Domain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {details.boundaryConditions.operationalLimits.map((lim, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-slate-200">
                        {lim.parameter} <span className="text-cyan-400">(<MathView math={lim.symbol} />)</span>
                      </td>
                      <td className="py-2 text-amber-300 font-bold">{lim.operationalRange}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
            <h3 className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5 m-0">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              <span>Critical Saturation Thresholds &amp; Remediation</span>
            </h3>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-0.5">
                <span className="font-mono font-bold text-rose-300 uppercase text-[10px]">Critical Threshold:</span>
                <RichMathText as="p" className="text-slate-200 m-0 leading-relaxed font-sans">{details.boundaryConditions.saturationThreshold}</RichMathText>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-0.5">
                <span className="font-mono font-bold text-slate-400 uppercase text-[10px]">Governing Failure:</span>
                <RichMathText as="p" className="text-slate-300 m-0 leading-relaxed font-sans">{details.boundaryConditions.failureMode}</RichMathText>
              </div>
              {simulator.fieldInsights && (
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-0.5">
                  <span className="font-mono font-bold text-emerald-300 uppercase text-[10px]">Field Remediation:</span>
                  <RichMathText as="p" className="text-slate-300 m-0 leading-relaxed font-sans">{simulator.fieldInsights}</RichMathText>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: UNIVERSITY CURRICULUM MAPPING & ACADEMIC REFERENCES
          ========================================================================= */}
      <section
        id="section-curriculum"
        aria-labelledby="heading-curriculum"
        className="max-w-6xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 id="heading-curriculum" className="text-lg sm:text-xl font-bold font-mono text-white m-0">
                5. University Curriculum Mapping &amp; Textbook References
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5 m-0">
                ABET accredited engineering course alignment, authoritative textbook syllabi, and technical FAQs
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-purple-950/60 border border-purple-800/50 text-purple-300 font-bold">
            {simulator.disciplineName}
          </span>
        </div>

        {/* Academic Course Alignment & Textbooks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-1.5">
            <div className="text-xs font-mono font-bold text-purple-400 uppercase flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4" />
              <span>University Course Syllabus Alignment:</span>
            </div>
            <p className="text-xs sm:text-sm font-mono text-slate-200 leading-relaxed m-0 font-semibold">
              {simulator.courseMapping || 'ENG-101 / Engineering Core Curriculum'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Standard Textbook References &amp; Chapters:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans m-0">
              {simulator.textbookReferences || 'First-Principles Engineering Curriculum Standard References'}
            </p>
          </div>
        </div>

        {/* Worked Engineering Scenarios Table (3 Operational Regimes) */}
        <div className="space-y-2.5 pt-2">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 m-0">
            <Table className="w-4 h-4 text-emerald-400" />
            <span>Worked Engineering Scenarios &amp; Operating States (3-State Matrix)</span>
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 shadow-inner">
            <table className="w-full border-collapse text-left text-xs font-sans">
              <thead>
                <tr className="bg-slate-900/95 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="p-3 w-44">Operating State</th>
                  <th className="p-3 w-60">Input Parameters</th>
                  <th className="p-3">Physical Response &amp; Solved Telemetry</th>
                  <th className="p-3 w-64">Engineering Diagnostic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {details.scenarios.map((sc, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3 align-top space-y-1.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStateBadgeStyle(sc.state)}`}>
                        {sc.state}
                      </span>
                      <div className="font-bold text-white text-xs leading-tight">
                        {sc.name}
                      </div>
                    </td>
                    <td className="p-3 align-top font-mono text-[11px] text-cyan-300 space-y-1">
                      {sc.parameters.map((p, pIdx) => (
                        <div key={pIdx} className="truncate">
                          <span className="text-slate-400">{p.symbol}:</span> <strong>{p.value}</strong> <span className="text-slate-500 text-[10px]">{p.unit}</span>
                        </div>
                      ))}
                    </td>
                    <td className="p-3 align-top space-y-1.5 leading-relaxed text-slate-300 text-xs">
                      <RichMathText as="p" className="m-0 leading-relaxed font-sans">{sc.physicalResponse}</RichMathText>
                      <div className="font-mono text-[11px] text-emerald-400 font-bold bg-slate-900/90 px-2 py-1 rounded border border-slate-800/80 inline-block">
                        {sc.solvedMetrics}
                      </div>
                    </td>
                    <td className="p-3 align-top leading-relaxed text-[11px] text-slate-300">
                      <RichMathText as="div" className="leading-relaxed font-sans">{sc.industrialVerdict}</RichMathText>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical FAQ Accordion */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 m-0">
              <HelpCircle className="w-4 h-4 text-purple-400" />
              <span>Frequently Asked Technical Questions ({faqs.length}):</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Indexed Solutions for Engineering Examinations
            </span>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                open={idx === 0}
                className="group p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <summary className="font-bold text-white text-xs sm:text-sm cursor-pointer select-none flex items-center justify-between list-none">
                  <span className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{faq.question}</span>
                  </span>
                  <span className="text-slate-500 group-open:rotate-180 transition-transform text-xs">
                    ▼
                  </span>
                </summary>
                <div className="mt-3 pl-7 border-t border-slate-800/80 pt-3">
                  <RichMathText as="p" className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed m-0">
                    {faq.answer}
                  </RichMathText>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: RELATED SIMULATORS IN THIS DEPARTMENT (SITE GRAPH)
          ========================================================================= */}
      <section
        id="section-related"
        aria-labelledby="heading-related-simulators"
        className="max-w-6xl mx-auto pt-4 border-t border-slate-800/80 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 id="heading-related-simulators" className="text-sm font-bold font-mono text-white m-0">
              Related {simulator.disciplineName} Laboratories &amp; Simulators
            </h3>
          </div>
          <a
            href={`/department/${simulator.discipline}/`}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Explore Department Hub</span>
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {relatedSimulators.map((rel) => (
            <a
              key={rel.id}
              href={`/simulator/${rel.id}/`}
              onClick={(e) => {
                if (onSelectSimulator && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  onSelectSimulator(rel);
                }
              }}
              className="p-3.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="text-[10px] font-mono text-cyan-400 font-semibold mb-1">
                  {rel.badge} • {rel.difficulty}
                </div>
                <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {rel.title}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 m-0 font-sans leading-relaxed">
                  {rel.tagline}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 pt-2.5 mt-2 border-t border-slate-800/60">
                <span>Launch Lab</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </section>
    </article>
  );
};
