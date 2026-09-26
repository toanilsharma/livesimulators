import React, { useState } from 'react';
import { BookOpen, AlertTriangle, Calculator, Award, ChevronDown, CheckCircle2, Copy, Check } from 'lucide-react';
import { SimulatorItem } from '../types';
import { MathView } from './MathView';
import { getEngineeringTheory } from '../utils/engineeringTheory';

interface EngineeringTheoryFormulasProps {
  simulator: SimulatorItem;
}

/**
 * Reusable Engineering Theory & Formulas component for all /simulator/ routes.
 * Semantic HTML (<article>, <h2>, <h3>, <section>) fully optimized for
 * 'calculator', 'formula', and 'theory' search intent and LLM retrieval.
 */
export const EngineeringTheoryFormulas: React.FC<EngineeringTheoryFormulasProps> = ({ simulator }) => {
  const theory = getEngineeringTheory(simulator);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyLatex = (latex: string, index: number) => {
    navigator.clipboard.writeText(latex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <article
      id="engineering-theory-formulas"
      className="engineering-theory-formulas my-6 rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl overflow-hidden"
      itemScope
      itemType="https://schema.org/TechArticle"
    >
      <meta itemProp="headline" content={`${simulator.title} - Governing Formulas, Equations & Step-by-Step Calculation Guide`} />
      <meta itemProp="proficiencyLevel" content={simulator.difficulty} />

      <details open className="group">
        <summary className="px-4 py-3.5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800/80 cursor-pointer select-none flex items-center justify-between text-cyan-300 hover:text-cyan-200 transition-colors">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400 shrink-0" />
            <h2 className="text-sm sm:text-base font-bold font-mono tracking-tight text-slate-100 flex items-center gap-2">
              <span>Engineering Theory, Governing Formulas &amp; Step-by-Step Calculation Guide</span>
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                FORMULA &amp; CALCULATOR GUIDE
              </span>
            </h2>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180 shrink-0" />
        </summary>

        <div className="p-4 sm:p-6 space-y-8 text-slate-200 text-sm leading-relaxed">
          {/* SECTION 1: GOVERNING EQUATIONS */}
          <section aria-labelledby="section-governing-equations" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 id="section-governing-equations" className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-mono">
                <span className="text-cyan-400">1.</span>
                <span>Governing Equations &amp; Mathematical Formulation</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                Physical Law: <strong className="text-cyan-300">{simulator.physicalLaw}</strong>
              </span>
            </div>

            <div className="space-y-4">
              {theory.governingEquations.map((eq, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wide">
                      {eq.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyLatex(eq.latex, idx)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 transition-colors"
                      title="Copy LaTeX formula to clipboard"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-400" />
                          <span>Copy LaTeX</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Accessible KaTeX equation with MathML output */}
                  <div className="py-2 px-3 rounded-lg bg-slate-900 border border-slate-800/80 overflow-x-auto custom-scrollbar">
                    <MathView math={eq.latex} block className="text-cyan-300 text-sm sm:text-base font-semibold" />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {eq.description}
                  </p>

                  {eq.variables && eq.variables.length > 0 && (
                    <div className="pt-2">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 font-bold">
                        Formula Variable Definitions:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono">
                        {eq.variables.map((v, vIdx) => (
                          <div key={vIdx} className="p-1.5 rounded bg-slate-900/60 border border-slate-800/50 flex items-start gap-2">
                            <span className="text-cyan-400 font-bold shrink-0">{v.symbol}:</span>
                            <span className="text-slate-300">
                              {v.name} {v.unit ? `[${v.unit}]` : ''} — <span className="text-slate-400 text-[11px]">{v.description}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {simulator.analyticalProof && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-cyan-900/40 space-y-2">
                <div className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Analytical First-Principles Proof &amp; Mathematical Derivation:</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {simulator.analyticalProof}
                </p>
              </div>
            )}
          </section>

          {/* SECTION 2: ASSUMPTIONS & LIMITATIONS */}
          <section aria-labelledby="section-assumptions-limitations" className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <h3 id="section-assumptions-limitations" className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-mono">
                <span className="text-amber-400">2.</span>
                <span>Engineering Assumptions &amp; Operational Limitations</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Assumptions */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Physical &amp; Numerical Assumptions:</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {theory.assumptions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limitations */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-300 uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Operational Boundaries &amp; Limitations:</span>
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  {theory.limitations.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION 3: STEP-BY-STEP CALCULATION EXAMPLE (CALCULATOR WALKTHROUGH) */}
          <section aria-labelledby="section-step-by-step-calc" className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 id="section-step-by-step-calc" className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-mono">
                <span className="text-emerald-400">3.</span>
                <span>Step-by-Step Calculation Example ({simulator.title} Calculator)</span>
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 hidden sm:inline flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5" />
                <span>WORKED NUMERICAL EXAMPLE</span>
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {theory.stepByStepExample.summary}
            </p>

            {/* Given Inputs Strip */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Given Nominal Input Parameters:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                {theory.stepByStepExample.givenInputs.map((inp, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800/80">
                    <div className="text-[10px] text-slate-400 truncate">{inp.parameter}</div>
                    <div className="text-cyan-300 font-bold">{inp.symbol} = {inp.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps Container */}
            <div className="space-y-3">
              {theory.stepByStepExample.steps.map((st) => (
                <div key={st.stepNumber} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">
                      Step {st.stepNumber}: {st.stepTitle}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Step {st.stepNumber} of {theory.stepByStepExample.steps.length}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 overflow-x-auto custom-scrollbar">
                    <MathView math={st.formulaLatex} block className="text-cyan-300 text-xs sm:text-sm font-semibold" />
                  </div>

                  <div className="p-2.5 rounded bg-slate-900/60 font-mono text-xs text-slate-300 space-y-1">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Numerical Substitution:</div>
                    <div className="text-slate-200 overflow-x-auto custom-scrollbar">{st.substitution}</div>
                    <div className="text-emerald-400 font-bold pt-1">Result: {st.stepResult}</div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {st.explanation}
                  </p>
                </div>
              ))}
            </div>

            {/* Final Solved Output Callout */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/40 border border-emerald-800/60 space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Calculated Final Output Result:</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300">
                  {theory.stepByStepExample.finalAnswer.metric}
                </span>
              </div>
              <div className="text-lg sm:text-xl font-mono font-black text-white">
                {theory.stepByStepExample.finalAnswer.value}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {theory.stepByStepExample.finalAnswer.physicalMeaning}
              </p>
              {theory.stepByStepExample.benchmarkVerification && (
                <div className="text-[11px] font-mono text-emerald-400/90 pt-1 border-t border-emerald-800/30">
                  {theory.stepByStepExample.benchmarkVerification}
                </div>
              )}
            </div>
          </section>

          {/* SECTION 4: STANDARDS & CURRICULUM */}
          <section aria-labelledby="section-standards-curriculum" className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Referenced Standard: <strong className="text-slate-200">{theory.standardsCompliance.standard}</strong> ({theory.standardsCompliance.body})</span>
              </div>
              {simulator.courseMapping && (
                <div className="text-slate-400">
                  Curriculum: <strong className="text-purple-300">{simulator.courseMapping}</strong>
                </div>
              )}
            </div>
            {simulator.textbookReferences && (
              <p className="text-xs text-slate-400">
                Standard Textbooks: <span className="text-slate-300">{simulator.textbookReferences}</span>
              </p>
            )}
          </section>
        </div>
      </details>
    </article>
  );
};
