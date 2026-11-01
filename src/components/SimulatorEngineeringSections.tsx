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
  Sparkles
} from 'lucide-react';
import { SimulatorItem } from '../types';
import { ALL_AVAILABLE_SIMULATORS } from '../data/simulators';
import { MathView } from './MathView';
import { getEngineeringTheory } from '../utils/engineeringTheory';
import { getSimulatorEngineeringDetails, WorkedEngineeringScenario } from '../utils/engineeringScenarios';
import { getSimulatorEngineeringContent } from '../data/simulatorEngineeringContent';

interface SimulatorEngineeringSectionsProps {
  simulator: SimulatorItem;
  onSelectSimulator?: (sim: SimulatorItem) => void;
}

export const SimulatorEngineeringSections: React.FC<SimulatorEngineeringSectionsProps> = ({
  simulator,
  onSelectSimulator,
}) => {
  const theory = getEngineeringTheory(simulator);
  const details = getSimulatorEngineeringDetails(simulator);
  const engContent = getSimulatorEngineeringContent(simulator.id);

  const directAnswerSummary = simulator.directAnswerSummary || engContent.directAnswerSummary;
  const industrialFailureCase = simulator.industrialFailureCase || engContent.industrialFailureCase;
  const faqs = (simulator.faqs && simulator.faqs.length >= 3) ? simulator.faqs : engContent.faqs;

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

  return (
    <article
      id="simulator-engineering-content"
      aria-label={`${simulator.title} Technical Overview and Engineering Specifications`}
      className="w-full bg-[#0a0f18] text-slate-100 border-t border-slate-800/80 px-3 sm:px-6 lg:px-8 py-8 space-y-10"
    >
      {/* DIRECT ANSWER SUMMARY: 50-WORD RAG-READY CITATION BLOCK */}
      <section
        id="direct-answer-summary"
        aria-labelledby="heading-direct-answer"
        className="max-w-6xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-500/30 shadow-lg space-y-2.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-400 font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Engineering Answer &amp; Formulation Citation</span>
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {simulator.standardReference || `${simulator.badge} Consensus Standard`}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-cyan-100 font-sans leading-relaxed m-0 font-medium">
          {directAnswerSummary}
        </p>
      </section>
      
      {/* SECTION 1: GOVERNING EQUATIONS & MATHEMATICAL FORMULATION */}
      <section
        id="governing-equations"
        aria-labelledby="heading-governing-equations"
        className="max-w-6xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="heading-governing-equations" className="text-lg sm:text-xl font-bold font-mono text-white m-0">
                Governing Equations &amp; Mathematical Formulation
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5 m-0">
                Exact first-principles formulations integrated at 60 FPS double-precision numerical resolution
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/50 text-cyan-300">
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

        {/* Clean Definition List of Variables & SI Units */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 m-0">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Definition of Formulation Variables &amp; Standard SI Units</span>
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono pt-1">
            {simulator.parameters.map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/70 flex flex-col gap-0.5 shadow-inner"
              >
                <dt className="text-cyan-300 font-bold flex items-center justify-between">
                  <span className="inline-flex items-center gap-1">
                    {p.name} (<MathView math={p.symbol} />)
                  </span>
                  <span className="text-[11px] text-amber-300 px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                    {p.unit || 'dimensionless'}
                  </span>
                </dt>
                <dd className="text-slate-400 font-sans text-[11px] leading-relaxed m-0 pt-0.5">
                  Range: [{p.min} to {p.max} {p.unit}] • Default: {p.default} {p.unit} — {p.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {simulator.analyticalProof && (
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/30 text-xs font-sans text-slate-300 leading-relaxed space-y-1.5">
            <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Analytical Mathematical Derivation:
            </div>
            <p className="m-0 text-slate-200">
              {simulator.analyticalProof}
            </p>
          </div>
        )}
      </section>

      {/* SECTION 2: BOUNDARY CONDITIONS & INDUSTRIAL OPERATING LIMITS */}
      <section
        id="boundary-conditions"
        aria-labelledby="heading-boundary-conditions"
        className="max-w-6xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 id="heading-boundary-conditions" className="text-lg sm:text-xl font-bold font-mono text-white m-0">
                Boundary Conditions &amp; Industrial Operating Limits
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5 m-0">
                Operational envelopes, failure modes, saturation thresholds, and applicable engineering codes
              </p>
            </div>
          </div>
          {simulator.standardReference && (
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-amber-950/60 border border-amber-800/50 text-amber-300">
              {simulator.standardReference.split('/')[0].trim()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Operational Boundaries Table */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 m-0">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Physical Operational Envelopes</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <th className="pb-2">Parameter</th>
                    <th className="pb-2">Operational Span</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {details.boundaryConditions.operationalLimits.map((lim, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-slate-200 font-medium">
                        {lim.parameter} <span className="text-cyan-400 font-mono inline-flex items-center gap-0.5">(<MathView math={lim.symbol} />)</span>
                      </td>
                      <td className="py-2 font-mono text-amber-300">{lim.operationalRange}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Failure Modes & Saturation Thresholds */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5 m-0">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Saturation Thresholds &amp; Industrial Failure Modes</span>
            </h3>
            <div className="space-y-3 text-xs">
              {/* Real-World Industrial Failure Mode, RCA & Protection Thresholds */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-950/30 via-slate-900 to-rose-950/20 border border-rose-900/50 space-y-1.5">
                <span className="font-mono font-bold text-rose-300 uppercase text-[11px] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Real-World Industrial Failure Case &amp; Root Cause Analysis (RCA):</span>
                </span>
                <p className="text-slate-200 m-0 text-xs sm:text-[13px] leading-relaxed font-sans">
                  {industrialFailureCase}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/40 space-y-1">
                <span className="font-mono font-bold text-rose-300 uppercase text-[10px]">
                  Critical Saturation Boundary:
                </span>
                <p className="text-slate-200 m-0 leading-relaxed font-sans">
                  {details.boundaryConditions.saturationThreshold}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="font-mono font-bold text-slate-400 uppercase text-[10px]">
                  Governing Failure Mechanism:
                </span>
                <p className="text-slate-300 m-0 leading-relaxed font-sans">
                  {details.boundaryConditions.failureMode}
                </p>
              </div>

              {simulator.fieldInsights && (
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 space-y-1">
                  <span className="font-mono font-bold text-emerald-300 uppercase text-[10px]">
                    Industrial Practical Remediation:
                  </span>
                  <p className="text-slate-300 m-0 leading-relaxed font-sans">
                    {simulator.fieldInsights}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Industrial Standards Reference Strip */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-mono text-slate-300">
              Referenced Consensus Standard: <strong className="text-white">{simulator.standardReference || `${simulator.badge} Engineering Consensus`}</strong>
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Publishing Authority: {simulator.standardBody || 'ISO / IEC / IEEE Standards'}
          </span>
        </div>
      </section>

      {/* SECTION 3: WORKED ENGINEERING SCENARIOS (COMPARISON TABLE) */}
      <section
        id="engineering-scenarios"
        aria-labelledby="heading-engineering-scenarios"
        className="max-w-6xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 id="heading-engineering-scenarios" className="text-lg sm:text-xl font-bold font-mono text-white m-0">
                Worked Engineering Scenarios &amp; Operating States
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5 m-0">
                Comparison of 3 realistic operational states computed from governing formulas
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/50 text-emerald-300">
            3-State Operational Matrix
          </span>
        </div>

        {/* 3-Row Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 shadow-inner">
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="bg-slate-900/95 border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="p-3 w-44">Operating State</th>
                <th className="p-3 w-60">Input Parameters</th>
                <th className="p-3">Physical Response &amp; Telemetry</th>
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
                    <p className="m-0">{sc.physicalResponse}</p>
                    <div className="font-mono text-[11px] text-emerald-400 font-bold bg-slate-900/90 px-2 py-1 rounded border border-slate-800/80 inline-block">
                      {sc.solvedMetrics}
                    </div>
                  </td>
                  <td className="p-3 align-top leading-relaxed text-[11px] text-slate-300">
                    {sc.industrialVerdict}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 4: TECHNICAL FAQ (3 DOMAIN-SPECIFIC Q&AS) */}
      <section
        id="technical-faq"
        aria-labelledby="heading-technical-faq"
        className="max-w-6xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="heading-technical-faq" className="text-lg sm:text-xl font-bold font-mono text-white m-0">
                Technical Engineering FAQ
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5 m-0">
                Targeted questions and authoritative solutions for {simulator.title}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-purple-950/60 border border-purple-800/50 text-purple-300">
            3 Domain-Specific Q&amp;As
          </span>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              open={idx === 0}
              className="group p-4 rounded-xl bg-slate-950 border border-slate-800 transition-colors"
            >
              <summary className="font-bold text-white text-xs sm:text-sm cursor-pointer select-none flex items-center justify-between list-none">
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span>{faq.question}</span>
                </span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform text-xs">
                  ▼
                </span>
              </summary>
              <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed mt-3 pl-7 m-0 border-t border-slate-800/80 pt-3">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* SECTION 5: RELATED SIMULATORS IN THIS DEPARTMENT (SITE GRAPH) */}
      <section
        id="related-simulators"
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
