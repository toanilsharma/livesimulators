import React from 'react';
import {
  ExternalLink,
  ArrowRight,
  FlaskConical,
  Layers,
  ShieldCheck,
  Zap,
  Cpu,
  Globe2,
  CheckCircle2,
  Sparkles,
  Server,
  Activity,
  Award
} from 'lucide-react';
import { LABS, trackLabLaunch } from '../config/labs';
import { navigateTo } from '../utils/routes';

export const IndustrialLabsSection: React.FC = () => {
  return (
    <section
      id="industrial-labs"
      className="py-16 sm:py-24 bg-gradient-to-b from-[#050811] via-[#070d1a] to-[#050811] relative overflow-hidden border-t border-b border-cyan-500/20"
    >
      {/* High-Tech Background Ambience */}
      <div className="absolute inset-0 bg-tech-grid opacity-15 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[350px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[550px] h-[300px] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Enterprise Section Banner */}
        <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-amber-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>ENTERPRISE PRO SUITES • MISSION-CRITICAL SIMULATORS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white tracking-tight leading-tight">
            Industrial <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-400">Labs Pro</span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-lg leading-relaxed font-sans max-w-3xl mx-auto">
            Heavy-duty, multi-module simulation platforms built for global industrial deployment. 
            Calibrated to international compliance codes (IEEE, IEC, NFPA, NERC) for zero-risk hardware testing, 
            fault mitigation, and operator certification.
          </p>

          {/* Global Industry Target Trust Strip */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Tier IV Data Centers</div>
                <div className="text-[10px] text-slate-400 font-mono">Continuous Power & PUE</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                <Globe2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">High-Voltage Grids</div>
                <div className="text-[10px] text-slate-400 font-mono">Transmission & Fault Flow</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Semiconductor Fabs</div>
                <div className="text-[10px] text-slate-400 font-mono">SiC/GaN PWM Dynamics</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">EHS & Arc-Flash Safety</div>
                <div className="text-[10px] text-slate-400 font-mono">NFPA 70E / IEEE 1584</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Cards Grid - Rendered FROM LABS ONLY with Enterprise Pro Highlighting */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 sm:gap-8">
          {LABS.map((lab) => (
            <div
              key={lab.id}
              id={`pro-lab-${lab.id}`}
              className="group relative bg-slate-900/85 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/60 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col shadow-2xl hover:shadow-[0_0_40px_rgba(6,182,212,0.18)]"
              style={{
                borderColor: undefined,
              }}
            >
              {/* Pro Badge Ribbon */}
              <div className="absolute top-4 right-4 z-20 pointer-events-none">
                <span 
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-widest backdrop-blur-md shadow-lg border"
                  style={{
                    backgroundColor: `${lab.accent}25`,
                    borderColor: `${lab.accent}70`,
                    color: lab.accent,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: lab.accent }} />
                  <span>PRO ENTERPRISE</span>
                </span>
              </div>

              {/* Lab Screenshot Container with Technical HUD */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 border-b border-slate-800/80">
                <img
                  src={lab.shot}
                  alt={`${lab.name} - Interactive Engineering Simulation Lab`}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                
                {/* Visual Depth Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90" />

                {/* Overlaid Technical Badge Strip */}
                <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                  <span 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-md border shadow-md"
                    style={{ 
                      backgroundColor: `${lab.accent}25`, 
                      borderColor: `${lab.accent}60`, 
                      color: '#ffffff',
                    }}
                  >
                    <Layers className="w-3.5 h-3.5" style={{ color: lab.accent }} />
                    <span>{lab.modules} Interactive Modules</span>
                  </span>

                  <span className="px-2.5 py-1 rounded-lg bg-slate-950/85 border border-slate-700/80 text-[11px] font-mono text-cyan-300 uppercase tracking-wider backdrop-blur-md font-bold">
                    {lab.standardBadge}
                  </span>
                </div>
              </div>

              {/* Lab Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  {/* Category & Title */}
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">
                    {lab.deploymentType}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white group-hover:text-cyan-300 transition-colors tracking-tight">
                    {lab.name}
                  </h3>

                  <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed font-sans">
                    {lab.tagline}
                  </p>

                  {/* Target Industry Sectors */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
                      Primary Industry Sectors:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {lab.sectors.map((sector, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-950 border border-slate-800 text-slate-300"
                        >
                          {sector}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Core Capabilities Checklist */}
                  <div className="mt-4 space-y-1.5">
                    {lab.capabilities.map((cap, cIdx) => (
                      <div key={cIdx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Launch Button */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Industrial Code Calibrated</span>
                  </div>

                  <a
                    href={lab.url}
                    target={lab.external ? '_blank' : undefined}
                    rel={lab.external ? 'noopener noreferrer' : undefined}
                    onClick={(e) => {
                      if (!lab.external) {
                        e.preventDefault();
                        trackLabLaunch(lab.id, 'home_card');
                        navigateTo(lab.url);
                      } else {
                        trackLabLaunch(lab.id, 'home_card');
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-display font-extrabold transition-all duration-200 shadow-md hover:scale-[1.02] active:scale-95"
                    style={{
                      backgroundColor: lab.accent,
                      color: '#030712',
                      boxShadow: `0 0 20px ${lab.accent}40`,
                    }}
                  >
                    <span>Launch Pro Lab</span>
                    {lab.external ? (
                      <ExternalLink className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                  </a>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
