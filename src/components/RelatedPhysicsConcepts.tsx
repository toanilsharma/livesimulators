import React from 'react';
import { Network, ArrowRight, Share2, Compass, Layers, Zap, Cpu, Sliders, FlaskConical, Building2, Atom } from 'lucide-react';
import { SimulatorItem, DisciplineId } from '../types';
import { ALL_AVAILABLE_SIMULATORS } from '../data/simulators';
import { getCrossDisciplineEquivalents, CrossDisciplineEquivalent } from '../data/crossDisciplineEquivalents';
import { MathView } from './MathView';

interface RelatedPhysicsConceptsProps {
  currentSimulatorId: string;
  onSelectSimulator?: (simulator: SimulatorItem) => void;
  compact?: boolean;
}

const DISCIPLINE_ICONS: Record<DisciplineId, React.ReactNode> = {
  electrical: <Zap className="w-3.5 h-3.5 text-cyan-400" />,
  mechanical: <Cpu className="w-3.5 h-3.5 text-amber-400" />,
  control: <Sliders className="w-3.5 h-3.5 text-emerald-400" />,
  chemical: <FlaskConical className="w-3.5 h-3.5 text-purple-400" />,
  civil: <Building2 className="w-3.5 h-3.5 text-pink-400" />,
  physics: <Atom className="w-3.5 h-3.5 text-sky-400" />,
};

export const RelatedPhysicsConcepts: React.FC<RelatedPhysicsConceptsProps> = ({
  currentSimulatorId,
  onSelectSimulator,
  compact = false,
}) => {
  const equivalents: CrossDisciplineEquivalent[] = getCrossDisciplineEquivalents(currentSimulatorId);

  // If no specific equivalents registered, fallback to peer simulators in other disciplines or return null
  if (equivalents.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Related Physics Concepts"
      className={`rounded-xl border border-cyan-900/40 bg-gradient-to-br from-slate-950/95 via-slate-900/90 to-slate-950/95 shadow-xl overflow-hidden ${
        compact ? 'p-2.5 space-y-2' : 'p-4 sm:p-5 space-y-3.5'
      }`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Related Physics Concepts</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-normal">
                Cross-Discipline Equivalents
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Isomorphic systems sharing identical differential equations, conservation laws, or transfer functions.
            </p>
          </div>
        </div>
      </div>

      {/* Cross-Discipline Linking Cards List */}
      <div className="space-y-2.5">
        {equivalents.map((item, idx) => {
          const targetSim = ALL_AVAILABLE_SIMULATORS.find((s) => s.id === item.targetSimulatorId);
          const href = `/simulator/${item.targetSimulatorId}`;

          return (
            <div
              key={idx}
              className="group relative rounded-xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900/90 hover:border-cyan-500/50 p-3 sm:p-3.5 transition-all duration-200 shadow-sm hover:shadow-cyan-950/30"
            >
              {/* Primary Anchor Link with Required Exact Text */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start sm:items-center gap-2 min-w-0">
                  {targetSim && (
                    <div className="p-1 rounded bg-slate-800 border border-slate-700 shrink-0 mt-0.5 sm:mt-0">
                      {DISCIPLINE_ICONS[targetSim.discipline]}
                    </div>
                  )}

                  <div>
                    {/* Standard HTML <a> tag with explicit anchor text for SEO crawler topical authority */}
                    <a
                      href={href}
                      onClick={(e) => {
                        // Support standard left-click client navigation while allowing cmd/ctrl-click for new tab
                        if (!e.ctrlKey && !e.metaKey && !e.shiftKey && onSelectSimulator && targetSim) {
                          e.preventDefault();
                          onSelectSimulator(targetSim);
                        }
                      }}
                      className="text-xs sm:text-sm font-bold text-cyan-300 hover:text-cyan-200 group-hover:underline underline-offset-4 decoration-cyan-400/60 inline-flex items-center gap-1.5 transition-colors"
                      title={item.tooltipText}
                    >
                      <span>{item.anchorText}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0" />
                    </a>

                    {targetSim && (
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {targetSim.disciplineName} • {targetSim.title}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mathematical Relationship Classification Tag */}
                <div className="shrink-0 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/80">
                    {item.relationshipType}
                  </span>
                </div>
              </div>

              {/* Required 1-Sentence Subtitle / Tooltip explaining mathematical link */}
              <p className="text-[11px] text-slate-300 leading-relaxed mt-2 pl-0.5 border-l-2 border-cyan-500/40 pl-2">
                {item.subtitle}
              </p>

              {/* Shared Equation (KaTeX View) */}
              {item.differentialEquationLatex && (
                <div className="mt-2 p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 overflow-x-auto text-xs text-cyan-300 font-mono">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono mb-1">
                    Equivalence Equation ({item.sharedMathematicalLaw}):
                  </div>
                  <MathView math={item.differentialEquationLatex} block />
                </div>
              )}

              {/* Variable Isomorphism Mapping Matrix */}
              {item.isomorphicMappings && item.isomorphicMappings.length > 0 && (
                <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[10px] font-mono">
                  {item.isomorphicMappings.map((map, mIdx) => (
                    <div
                      key={mIdx}
                      className="px-2 py-1 rounded bg-slate-950/60 border border-slate-800/60 flex items-center justify-between text-slate-400"
                    >
                      <span className="text-cyan-400 truncate pr-1">{map.domainA}</span>
                      <span className="text-slate-400 shrink-0">⟺</span>
                      <span className="text-amber-400 truncate pl-1 text-right">{map.domainB}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
