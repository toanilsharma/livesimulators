import React from 'react';
import { ChevronRight, CheckCircle2, Award, Zap, Cpu, Building2, Sliders, FlaskConical, Atom, Eye } from 'lucide-react';
import { SimulatorItem, DisciplineId } from '../../types';
import { MathView } from '../MathView';

interface DepartmentSpecTableProps {
  simulators: SimulatorItem[];
  departmentId: DisciplineId;
  accentColor: string;
  onLaunchSimulator: (sim: SimulatorItem) => void;
  onInspectSimulator?: (sim: SimulatorItem) => void;
  getSubCategory?: (type: string) => { label: string; subfield: string };
}

export const DepartmentSpecTable: React.FC<DepartmentSpecTableProps> = ({
  simulators,
  departmentId,
  accentColor,
  onLaunchSimulator,
  onInspectSimulator,
  getSubCategory,
}) => {
  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden shadow-xl backdrop-blur-sm">
      {/* Table Top Header Bar */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
            Engineering Specification &amp; Standard Syllabus Matrix
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Showing {simulators.length} Verified First-Principles Modules
        </div>
      </div>

      {/* Responsive Horizontal Scroll Wrapper */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[980px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/90 text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4 font-bold text-slate-300 w-[240px]">Laboratory Module</th>
              <th className="py-3 px-3 font-bold text-slate-300 w-[150px]">Subfield Domain</th>
              <th className="py-3 px-4 font-bold text-slate-300 min-w-[280px]">Governing Law &amp; ODE</th>
              <th className="py-3 px-3 font-bold text-slate-300 w-[200px]">Telemetry Metrics</th>
              <th className="py-3 px-3 font-bold text-slate-300 w-[180px]">Industry Standard</th>
              <th className="py-3 px-4 font-bold text-slate-300 text-right w-[110px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {simulators.map((sim) => {
              const subCat = getSubCategory ? getSubCategory(sim.type) : { label: sim.badge, subfield: sim.badge };

              return (
                <tr
                  key={sim.id}
                  className="hover:bg-slate-850/60 transition-colors group cursor-pointer"
                  onClick={() => onLaunchSimulator(sim)}
                >
                  {/* Module Title & Badges */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="font-bold text-white group-hover:text-cyan-300 transition-colors text-sm mb-1 leading-snug">
                      {sim.title}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {sim.difficulty}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5" title="100% Physics Verified">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </div>
                  </td>

                  {/* Subfield */}
                  <td className="py-3.5 px-3 align-top font-mono">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.8 rounded-md border inline-block"
                      style={{
                        color: sim.accentColor || accentColor,
                        borderColor: `${sim.accentColor || accentColor}40`,
                        backgroundColor: `${sim.accentColor || accentColor}12`,
                      }}
                    >
                      {subCat.subfield}
                    </span>
                  </td>

                  {/* Governing Law & Equation */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="text-[11px] font-mono text-slate-400 mb-1">
                      {sim.physicalLaw || 'First-Principles Differential Mechanics'}
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800/80 inline-block max-w-full overflow-x-auto text-xs text-cyan-300 font-mono">
                      <MathView math={sim.governingEquation} />
                    </div>
                  </td>

                  {/* Key Metrics */}
                  <td className="py-3.5 px-3 align-top">
                    <div className="flex flex-col gap-1">
                      {sim.keyMetrics.slice(0, 2).map((km, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800/60"
                        >
                          <span className="text-slate-400 truncate max-w-[110px]">{km.label}</span>
                          <span className="text-cyan-300 font-bold ml-1">{km.unit || 'unitless'}</span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Standard Ref */}
                  <td className="py-3.5 px-3 align-top">
                    <div className="text-[11px] font-mono text-slate-300 flex items-start gap-1">
                      <Award className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2" title={sim.standardReference || sim.badge}>
                        {sim.standardReference || sim.badge}
                      </span>
                    </div>
                  </td>

                  {/* Action Buttons: Quick Inspect & Launch */}
                  <td className="py-3.5 px-4 align-middle text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {onInspectSimulator && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspectSimulator(sim);
                          }}
                          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="Quick Inspect Model & Equations"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLaunchSimulator(sim);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shadow-sm group-hover:scale-105"
                        style={{
                          backgroundColor: `${accentColor}20`,
                          borderColor: `${accentColor}50`,
                          borderWidth: 1,
                          color: '#ffffff',
                        }}
                      >
                        <span>Launch</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
