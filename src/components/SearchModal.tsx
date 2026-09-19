import React, { useState, useEffect } from 'react';
import { Search, X, Zap, ArrowRight, Activity, Terminal } from 'lucide-react';
import { ALL_AVAILABLE_SIMULATORS, DISCIPLINES } from '../data/simulators';
import { SimulatorItem } from '../types';
import { MathView } from './MathView';

interface SearchModalProps {
  isOpen: boolean;
  initialQuery?: string;
  onClose: () => void;
  onSelectSimulator: (sim: SimulatorItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  initialQuery = '',
  onClose,
  onSelectSimulator,
}) => {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Filter simulators
  const matchingSimulators = ALL_AVAILABLE_SIMULATORS.filter(s => {
    if (!q) return true;
    return (
      s.title.toLowerCase().includes(q) ||
      s.tagline.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.governingEquation.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-24 p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl max-h-[85dvh] rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            placeholder="Search simulators by equation, topology, or tag (e.g., RLC, VSWR, Buck, Fourier)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
            id="modal-search-input"
          />
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tag Pills */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap gap-1.5 text-[11px]">
          <span className="text-slate-500 self-center mr-1">HINTS:</span>
          {['Resonance', '3-Phase', 'Buck-Boost', 'Active Filter', 'VSWR', 'Fourier THD'].map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {matchingSimulators.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching simulators found for "{query}". Try "RLC", "Filter", or "Motor".
            </div>
          ) : (
            matchingSimulators.map((sim) => (
              <button
                key={sim.id}
                onClick={() => {
                  onSelectSimulator(sim);
                  onClose();
                }}
                className="w-full p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/50 text-left transition-all flex items-center justify-between group"
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {sim.title}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                      {sim.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">
                    {sim.tagline}
                  </p>
                  <div className="text-[11px] text-cyan-300/90 truncate">
                    <MathView math={sim.governingEquation} />
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-400 transition-all shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
          <span>{matchingSimulators.length} interactive models available</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
