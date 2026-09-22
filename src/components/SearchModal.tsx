import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Zap, 
  ArrowRight, 
  Terminal, 
  Volume2, 
  VolumeX, 
  Monitor, 
  Download, 
  Code2, 
  Layers, 
  FlaskConical, 
  Compass,
  CornerDownLeft,
  Sparkles
} from 'lucide-react';
import { ALL_AVAILABLE_SIMULATORS, DISCIPLINES } from '../data/simulators';
import { LABS } from '../config/labs';
import { SimulatorItem } from '../types';
import { MathView } from './MathView';
import { soundEngine } from '../utils/audio';
import { navigateTo } from '../utils/routes';

interface SearchModalProps {
  isOpen: boolean;
  initialQuery?: string;
  onClose: () => void;
  onSelectSimulator: (sim: SimulatorItem) => void;
}

type PaletteCategory = 'all' | 'simulators' | 'labs' | 'commands';

interface CommandAction {
  id: string;
  command: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  initialQuery = '',
  onClose,
  onSelectSimulator,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeCategory, setActiveCategory] = useState<PaletteCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setQuery(initialQuery);
    setSelectedIndex(0);
    setActionFeedback(null);
  }, [initialQuery, isOpen]);

  // Command Action Registry
  const commands: CommandAction[] = [
    {
      id: 'cmd-audio',
      command: '/audio',
      title: 'Toggle Audio Synthesizer FX',
      description: soundEngine.getMuted() ? 'Turn ON synthesized relay and arc flash sounds' : 'Mute all physics audio effects',
      icon: soundEngine.getMuted() ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />,
      action: () => {
        const nextMuted = soundEngine.toggleMute();
        setActionFeedback(nextMuted ? 'Audio FX Muted' : 'Audio FX Enabled (Unmuted)');
        setTimeout(() => setActionFeedback(null), 2000);
      }
    },
    {
      id: 'cmd-crt',
      command: '/crt',
      title: 'Toggle CRT Phosphor Persistence',
      description: 'Switch scope displays between modern digital and green CRT phosphor trail',
      icon: <Monitor className="w-4 h-4 text-cyan-400" />,
      action: () => {
        const current = localStorage.getItem('livesimulators_crt_mode') === 'true';
        localStorage.setItem('livesimulators_crt_mode', current ? 'false' : 'true');
        window.dispatchEvent(new CustomEvent('livesimulators:crt_change', { detail: { enabled: !current } }));
        setActionFeedback(!current ? 'CRT Phosphor Mode Activated' : 'Digital Vector Mode Activated');
        setTimeout(() => setActionFeedback(null), 2000);
      }
    },
    {
      id: 'cmd-fault',
      command: '/fault',
      title: 'Jump to Industrial Fault Simulator Section',
      description: 'Scroll directly to Stage 2 Enterprise Pro suites & simulated fault triggers',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      action: () => {
        onClose();
        navigateTo('/');
        setTimeout(() => {
          const el = document.getElementById('industrial-labs');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 80);
      }
    },
    {
      id: 'cmd-pwa',
      command: '/pwa',
      title: 'Install Offline Desktop App (PWA)',
      description: 'Register offline service worker and prompt standalone application install',
      icon: <Download className="w-4 h-4 text-blue-400" />,
      action: () => {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js').then(() => {
            setActionFeedback('Offline PWA Service Worker Active');
          }).catch(() => {
            setActionFeedback('PWA installation ready via browser address bar');
          });
        }
        setTimeout(() => setActionFeedback(null), 2500);
      }
    },
    {
      id: 'cmd-embed',
      command: '/embed',
      title: 'Open University LMS Embed Guide',
      description: 'Generate iframe snippet for Canvas, Moodle, and Blackboard',
      icon: <Code2 className="w-4 h-4 text-purple-400" />,
      action: () => {
        onClose();
        navigateTo('/simulator/rlc-resonance');
        setActionFeedback('Opening simulator workbench for embed code...');
      }
    }
  ];

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();
  const isCommandMode = q.startsWith('/') || activeCategory === 'commands';

  // Filter items based on query & category
  const filteredCommands = commands.filter(c => {
    if (!q || q === '/') return true;
    const cleanQ = q.startsWith('/') ? q.slice(1) : q;
    return c.command.toLowerCase().includes(cleanQ) || c.title.toLowerCase().includes(cleanQ) || c.description.toLowerCase().includes(cleanQ);
  });

  const filteredSimulators = ALL_AVAILABLE_SIMULATORS.filter(s => {
    if (activeCategory === 'commands' || activeCategory === 'labs') return false;
    if (!q || isCommandMode) return activeCategory !== 'commands';
    return (
      s.title.toLowerCase().includes(q) ||
      s.tagline.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.governingEquation.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  const filteredLabs = LABS.filter(l => {
    if (activeCategory === 'commands' || activeCategory === 'simulators') return false;
    if (!q || isCommandMode) return activeCategory === 'all' || activeCategory === 'labs';
    return (
      l.name.toLowerCase().includes(q) ||
      l.tagline.toLowerCase().includes(q) ||
      l.dept.toLowerCase().includes(q) ||
      l.standardBadge.toLowerCase().includes(q)
    );
  });

  // Calculate total unified items for keyboard arrow navigation
  const unifiedItems: Array<
    | { type: 'cmd'; item: CommandAction }
    | { type: 'lab'; item: typeof LABS[0] }
    | { type: 'sim'; item: SimulatorItem }
  > = [];

  if (isCommandMode || activeCategory === 'commands') {
    filteredCommands.forEach(c => unifiedItems.push({ type: 'cmd', item: c }));
  }

  if (!isCommandMode || activeCategory === 'all') {
    if (activeCategory === 'all' || activeCategory === 'labs') {
      filteredLabs.forEach(l => unifiedItems.push({ type: 'lab', item: l }));
    }
    if (activeCategory === 'all' || activeCategory === 'simulators') {
      filteredSimulators.forEach(s => unifiedItems.push({ type: 'sim', item: s }));
    }
  }

  // Handle keyboard navigation (Arrow Up, Arrow Down, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, unifiedItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + unifiedItems.length) % Math.max(1, unifiedItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = unifiedItems[selectedIndex];
      if (current) {
        if (current.type === 'cmd') {
          current.item.action();
        } else if (current.type === 'lab') {
          onClose();
          navigateTo(current.item.url);
        } else {
          onSelectSimulator(current.item);
          onClose();
        }
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-20 p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl max-h-[85dvh] rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col font-mono animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Command HUD Header */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            {isCommandMode ? <Terminal className="w-4 h-4 text-amber-400" /> : <Search className="w-4 h-4 text-cyan-400" />}
          </div>
          <input
            type="text"
            placeholder="Type a command (/audio, /crt, /fault, /pwa) or search 43+ modules..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            autoFocus
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
            id="modal-search-input"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Ribbon */}
        {actionFeedback && (
          <div className="px-4 py-2 bg-cyan-500/20 border-b border-cyan-500/40 text-cyan-300 text-xs flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{actionFeedback}</span>
            </span>
          </div>
        )}

        {/* Category Tabs Strip */}
        <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-1.5 text-xs overflow-x-auto custom-scrollbar">
          <button
            type="button"
            onClick={() => { setActiveCategory('all'); setSelectedIndex(0); }}
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              activeCategory === 'all' && !q.startsWith('/')
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Items
          </button>

          <button
            type="button"
            onClick={() => { setActiveCategory('commands'); setSelectedIndex(0); setQuery('/' ); }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              activeCategory === 'commands' || q.startsWith('/')
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3 h-3 text-amber-400" />
            <span>Commands (/)</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveCategory('labs'); setSelectedIndex(0); if (q.startsWith('/')) setQuery(''); }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              activeCategory === 'labs'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FlaskConical className="w-3 h-3 text-purple-400" />
            <span>Industrial Labs ({LABS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveCategory('simulators'); setSelectedIndex(0); if (q.startsWith('/')) setQuery(''); }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              activeCategory === 'simulators'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3 text-blue-400" />
            <span>Simulators ({ALL_AVAILABLE_SIMULATORS.length})</span>
          </button>
        </div>

        {/* Unified Results List */}
        <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {unifiedItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching commands or models found for "{query}". Try "/audio", "/crt", "RLC", or "UPS".
            </div>
          ) : (
            unifiedItems.map((entry, idx) => {
              const isSelected = idx === selectedIndex;

              if (entry.type === 'cmd') {
                const cmd = entry.item;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => cmd.action()}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-slate-800 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 pr-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                        {cmd.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs group-hover:text-amber-300">
                            {cmd.title}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-950/60 text-amber-400 border border-amber-800/40">
                            {cmd.command}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {cmd.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Execute</span>
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              }

              if (entry.type === 'lab') {
                const lab = entry.item;
                return (
                  <button
                    key={lab.id}
                    onClick={() => {
                      onClose();
                      navigateTo(lab.url);
                    }}
                    className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-slate-800 border border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                        : 'bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 pr-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                        <FlaskConical className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs group-hover:text-purple-300">
                            {lab.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800/40">
                            PRO SUITE • {lab.modules} MODS
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {lab.tagline}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                  </button>
                );
              }

              // Simulator item
              const sim = entry.item;
              return (
                <button
                  key={sim.id}
                  onClick={() => {
                    onSelectSimulator(sim);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-slate-800 border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80'
                  }`}
                >
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {sim.title}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                        {sim.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">{sim.discipline}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {sim.tagline}
                    </p>
                    <div className="text-[11px] text-cyan-300/90 truncate">
                      <MathView math={sim.governingEquation} />
                    </div>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-400 transition-all shrink-0">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer with Keyboard Hotkey Shortcuts */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 bg-slate-850 border border-slate-700 rounded text-[10px]">↑↓</kbd>
              <span className="text-slate-500">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 bg-slate-850 border border-slate-700 rounded text-[10px]">↵</kbd>
              <span className="text-slate-500">Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.2 bg-slate-850 border border-slate-700 rounded text-[10px]">Esc</kbd>
              <span className="text-slate-500">Close</span>
            </span>
          </div>
          <span className="text-slate-500 hidden sm:inline">{unifiedItems.length} items available</span>
        </div>
      </div>
    </div>
  );
};
