import React, { useState } from 'react';
import {
  Lightbulb,
  X,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Flame,
  Zap,
  Activity,
  ChevronRight,
  Play
} from 'lucide-react';
import { MathView } from './MathView';
import {
  getLiveResultSummary,
  getDetailedWhyItHappened,
  LiveResultSummary,
  DetailedWhyItHappened
} from '../utils/simulatorExplanations';

interface WhyItHappenedCardProps {
  simulatorType: string;
  parameters: Record<string, number>;
  onApplyParameters: (newParams: Record<string, number>) => void;
}

export const WhyItHappenedCard: React.FC<WhyItHappenedCardProps> = ({
  simulatorType,
  parameters,
  onApplyParameters,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'mechanism' | 'math' | 'realworld' | 'challenges'>('mechanism');

  const liveResult: LiveResultSummary = getLiveResultSummary(simulatorType, parameters);
  const detail: DetailedWhyItHappened = getDetailedWhyItHappened(simulatorType, parameters);

  // Status color styles
  const getStatusBadgeStyle = () => {
    switch (liveResult.statusType) {
      case 'critical':
        return 'bg-rose-500/15 border-rose-500/40 text-rose-400';
      case 'warning':
        return 'bg-amber-500/15 border-amber-500/40 text-amber-300';
      case 'optimal':
        return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400';
      case 'info':
      default:
        return 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400';
    }
  };

  const getDotColor = () => {
    switch (liveResult.statusType) {
      case 'critical':
        return 'bg-rose-500';
      case 'warning':
        return 'bg-amber-400';
      case 'optimal':
        return 'bg-emerald-400';
      case 'info':
      default:
        return 'bg-cyan-400';
    }
  };

  return (
    <>
      {/* 1. Live Result HUD Strip (Always Visible Above or Below Canvas) */}
      <div className="w-full bg-slate-900/95 border-t border-b sm:border border-slate-800 sm:rounded-xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0">
        
        {/* Left: Dynamic Plain-English Interpretation */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="pt-0.5 shrink-0">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${getStatusBadgeStyle()}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()} animate-pulse`} />
              <span>{liveResult.badgeLabel}</span>
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-display font-bold text-white tracking-tight flex items-center gap-2">
              <span>{liveResult.headline}</span>
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-300 font-sans leading-relaxed mt-0.5 line-clamp-2 md:line-clamp-1">
              {liveResult.summary}
            </p>
          </div>
        </div>

        {/* Right: "Want to see why it happened?" Interactive Glowing Button */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-display font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all duration-200 active:scale-95"
            id="btn-why-it-happened"
          >
            <Lightbulb className="w-3.5 h-3.5 text-slate-950 group-hover:scale-110 transition-transform" />
            <span>Want to see why it happened?</span>
            <ArrowRight className="w-3 h-3 text-slate-950 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* 2. Detailed "Why It Happened" Deep-Dive Modal */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="w-full max-w-3xl max-h-[90dvh] bg-[#060b14] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans text-xs text-slate-300 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Lightbulb className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold block">
                    FIRST-PRINCIPLES PHYSICAL MECHANISM
                  </span>
                  <h3 className="text-base sm:text-lg font-display font-black text-white tracking-tight truncate">
                    {detail.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                title="Close modal (ESC)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tab Strip */}
            <div className="px-5 py-2 bg-slate-950 border-b border-slate-800/80 flex items-center gap-2 shrink-0 overflow-x-auto custom-scrollbar">
              <button
                onClick={() => setActiveTab('mechanism')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'mechanism'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Physical Mechanism</span>
              </button>

              <button
                onClick={() => setActiveTab('math')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'math'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Live Math Proof</span>
              </button>

              <button
                onClick={() => setActiveTab('realworld')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'realworld'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Real-World Engineering</span>
              </button>

              <button
                onClick={() => setActiveTab('challenges')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'challenges'
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Try This Next ({detail.interactiveChallenges.length})</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 flex-1 min-h-0 overflow-y-auto space-y-5 custom-scrollbar">
              
              {/* TAB 1: Physical Mechanism (Plain English) */}
              {activeTab === 'mechanism' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                    <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                      WHAT IS ACTUALLY HAPPENING PHYSICALLY:
                    </span>
                    {detail.simpleExplanation.map((para, i) => (
                      <p key={i} className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                        {para}
                      </p>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 flex items-start gap-3 text-cyan-200 text-xs">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">Key Takeaway:</span>
                      <span>The behavior on your screen is not an animation or pre-rendered video. It is a live differential equation solver conserving mass, momentum, and electromagnetic field energy!</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Live Math Proof */}
              {activeTab === 'math' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <p className="text-xs text-slate-400">
                    Here is the exact mathematical proof plugged in with your current slider values in real-time:
                  </p>

                  <div className="space-y-3">
                    {detail.formulaSteps.map((step, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{step.name}</span>
                          <span className="font-mono text-[10px] text-cyan-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                            Formula {idx + 1}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 overflow-x-auto text-center py-2 text-cyan-300">
                          <MathView math={step.latex} />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] font-mono text-slate-300 pt-1">
                          <div>
                            <span className="text-slate-500">Substitution: </span>
                            <span className="text-amber-300 font-semibold">{step.calculation}</span>
                          </div>
                          <div className="text-emerald-400 font-semibold">
                            {step.verdict}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Real-World Engineering Consequence */}
              {activeTab === 'realworld' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                    <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>INDUSTRIAL ENGINEERING SIGNIFICANCE:</span>
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {detail.realWorldImpact}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: Interactive Challenges */}
              {activeTab === 'challenges' && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  <p className="text-xs text-slate-400">
                    Click any challenge below to automatically apply those parameters to the workbench and observe how the system responds:
                  </p>

                  <div className="space-y-2.5">
                    {detail.interactiveChallenges.map((challenge, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <h5 className="font-bold text-white text-xs flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{challenge.label}</span>
                          </h5>
                          <p className="text-[11px] text-slate-400">
                            {challenge.explanation}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            onApplyParameters(challenge.targetParams);
                            setModalOpen(false);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-display text-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{challenge.actionText}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between shrink-0 text-[11px] font-mono text-slate-400">
              <span className="text-slate-500">Live numerical evaluation at 60 FPS</span>
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
              >
                Close & Return to Workbench
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
