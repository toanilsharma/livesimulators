import React, { useState, useEffect } from 'react';
import { LayoutGrid, Table, Layers, ArrowUp, Activity, BookOpen, Sliders, FileText, Briefcase, Award, Database, HelpCircle, FileCheck } from 'lucide-react';
import { DisciplineId } from '../../types';

export type DepartmentViewMode = 'grid' | 'grouped' | 'table';

interface DepartmentStickyBarProps {
  departmentId: DisciplineId;
  departmentCode: string;
  departmentName: string;
  accentColor: string;
  totalCount: number;
  filteredCount: number;
  viewMode: DepartmentViewMode;
  onViewModeChange: (mode: DepartmentViewMode) => void;
  onOpenWorksheet?: () => void;
}

export const DepartmentStickyBar: React.FC<DepartmentStickyBarProps> = ({
  departmentId,
  departmentCode,
  departmentName,
  accentColor,
  totalCount,
  filteredCount,
  viewMode,
  onViewModeChange,
  onOpenWorksheet,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar once user scrolls past top 280px
      if (window.scrollY > 280) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToAnchor = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      const yOffset = -120;
      const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (!isScrolled) return null;

  return (
    <div className="fixed top-[64px] lg:top-[97px] left-0 right-0 z-30 transition-all duration-300 animate-in fade-in slide-in-from-top-2">
      <div className="bg-[#080d16]/95 backdrop-blur-md border-b border-slate-800 shadow-xl px-4 sm:px-6 lg:px-10 xl:px-14 py-2">
        <div className="w-full max-w-[1720px] 2xl:max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-3">
          
          {/* Department Tag & Code */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border shrink-0"
              style={{
                backgroundColor: `${accentColor}15`,
                borderColor: `${accentColor}40`,
                color: accentColor,
              }}
            >
              {departmentCode}
            </span>
            <span className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px] sm:max-w-[280px]">
              {departmentName}
            </span>
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              ({filteredCount} of {totalCount} Labs)
            </span>
          </div>

          {/* Quick Anchor Navigation Links */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-mono">
            <button
              onClick={() => scrollToAnchor('hero-sandbox')}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>Sandbox</span>
            </button>

            <button
              onClick={() => scrollToAnchor('curriculum-roadmap')}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3 text-amber-400" />
              <span>Roadmap</span>
            </button>

            <button
              onClick={() => scrollToAnchor('simulators-catalog')}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <Sliders className="w-3 h-3 text-emerald-400" />
              <span>Catalog</span>
            </button>

            <button
              onClick={() => scrollToAnchor('formulas')}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <FileText className="w-3 h-3 text-violet-400" />
              <span>Formulas</span>
            </button>

            <button
              onClick={() => scrollToAnchor('applications')}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <Briefcase className="w-3 h-3 text-rose-400" />
              <span>Applications</span>
            </button>

            <button
              onClick={() => scrollToAnchor('standards')}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <Award className="w-3 h-3 text-cyan-400" />
              <span>Standards</span>
            </button>

            <button
              onClick={() => scrollToAnchor('knowledge-base')}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Taxonomy</span>
            </button>

            <button
              onClick={() => scrollToAnchor('faq')}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3 text-amber-400" />
              <span>FAQ</span>
            </button>
          </div>

          {/* Action Area: Lab Handout & View Switcher */}
          <div className="flex items-center gap-2">
            {onOpenWorksheet && (
              <button
                onClick={onOpenWorksheet}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-colors"
                title="Open ABET Laboratory Worksheet Generator"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Lab Handout</span>
              </button>
            )}

            {/* View Mode Switcher Toggle */}
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-700/80 shrink-0">
            <button
              onClick={() => onViewModeChange('grid')}
              title="Cards Grid View"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                viewMode === 'grid'
                  ? 'bg-slate-100 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>

            <button
              onClick={() => onViewModeChange('grouped')}
              title="Grouped by Sub-Discipline"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                viewMode === 'grouped'
                  ? 'bg-slate-100 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clusters</span>
            </button>

              <button
                onClick={() => onViewModeChange('table')}
                title="Engineering Spec Sheet Matrix"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                  viewMode === 'table'
                    ? 'bg-slate-100 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Spec Sheet</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
