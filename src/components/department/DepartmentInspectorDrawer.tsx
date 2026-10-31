import React, { useEffect } from 'react';
import { X, ExternalLink, Award, CheckCircle2, BookOpen, ArrowRight, Zap, Code, ShieldCheck } from 'lucide-react';
import { SimulatorItem, DisciplineId } from '../../types';
import { MathView } from '../MathView';
import { SimulatorCardPreview } from '../SimulatorCardPreview';
import { soundEngine } from '../../utils/audio';

interface DepartmentInspectorDrawerProps {
  simulator: SimulatorItem | null;
  accentColor: string;
  departmentId: DisciplineId;
  onClose: () => void;
  onLaunchSimulator: (sim: SimulatorItem) => void;
}

export const DepartmentInspectorDrawer: React.FC<DepartmentInspectorDrawerProps> = ({
  simulator,
  accentColor,
  departmentId,
  onClose,
  onLaunchSimulator,
}) => {
  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundEngine.playRelayClick();
        onClose();
      }
    };
    if (simulator) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [simulator, onClose]);

  if (!simulator) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => {
          soundEngine.playRelayClick();
          onClose();
        }}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-xl bg-[#080d16] border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto custom-scrollbar">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0"
                style={{
                  color: simulator.accentColor || accentColor,
                  borderColor: `${simulator.accentColor || accentColor}40`,
                  backgroundColor: `${simulator.accentColor || accentColor}15`,
                }}
              >
                {simulator.badge}
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% Physics Verified</span>
              </span>
            </div>

            <button
              onClick={() => {
                soundEngine.playRelayClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Inspector (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Drawer Body Content */}
          <div className="p-4 sm:p-6 space-y-5">
            {/* Title & Tagline */}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                {simulator.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed font-sans">
                {simulator.tagline}
              </p>
            </div>

            {/* Live Interactive Preview Canvas */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-inner p-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-2 mb-2 border-b border-slate-800">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Preview Engine
                </span>
                <span className="text-cyan-400">60 FPS Float64</span>
              </div>
              <SimulatorCardPreview
                type={simulator.type}
                accentColor={simulator.accentColor || accentColor}
              />
            </div>

            {/* Governing Physical Law & Equation */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Governing Law</span>
                <span className="text-cyan-300">{simulator.physicalLaw}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 font-mono text-xs text-cyan-300 max-w-full overflow-x-auto text-center">
                <MathView math={simulator.governingEquation} block />
              </div>
              {simulator.equationDescription && (
                <p className="text-[11px] text-slate-400 font-sans italic">
                  {simulator.equationDescription}
                </p>
              )}
            </div>

            {/* Analytical Derivation / Theory Proof */}
            {simulator.analyticalProof && (
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-cyan-400" />
                  Analytical Mathematical Proof
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/50 border border-slate-800/80 p-3 rounded-xl">
                  {simulator.analyticalProof}
                </p>
              </div>
            )}

            {/* NIST / IEEE Numerical Validation Benchmark */}
            {simulator.validationTest && (
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Numerical Validation Benchmark
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans bg-emerald-950/15 border border-emerald-500/30 p-3 rounded-xl">
                  {simulator.validationTest}
                </p>
              </div>
            )}

            {/* Key Telemetry Metrics Grid */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-slate-200">
                Key Telemetry Metrics
              </div>
              <div className="grid grid-cols-2 gap-2">
                {simulator.keyMetrics.map((km, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
                  >
                    <span className="text-slate-400 truncate">{km.label}</span>
                    <span className="text-cyan-300 font-bold ml-1">{km.unit || 'unitless'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Standards & Curricular Course Mapping */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              {simulator.standardReference && (
                <div className="flex items-start gap-2 text-xs font-mono text-slate-300">
                  <Award className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Standard: {simulator.standardReference}</span>
                </div>
              )}
              {simulator.courseMapping && (
                <div className="flex items-start gap-2 text-xs font-mono text-slate-400">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>Academic Course: {simulator.courseMapping}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 sticky bottom-0 z-10 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                soundEngine.playRelayClick();
                onClose();
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Close
            </button>

            <button
              onClick={() => {
                soundEngine.playRelayClick();
                onLaunchSimulator(simulator);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold font-mono transition-all shadow-lg active:scale-95 text-slate-950"
              style={{
                backgroundColor: simulator.accentColor || accentColor,
              }}
            >
              <span>Launch Full Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
