import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Search, 
  Menu, 
  X, 
  ArrowRight,
  Sliders,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  FlaskConical,
  Volume2,
  VolumeX,
  Zap,
  Cpu,
  Building2,
  Atom,
  Layers,
  Sparkles
} from 'lucide-react';
import { LABS, trackLabLaunch } from '../config/labs';
import { navigateTo } from '../utils/routes';
import { soundEngine } from '../utils/audio';
import { trackSimulatorOpen } from '../utils/analytics';
import { 
  FEATURED_ELECTRICAL_SIMULATORS,
  FEATURED_MECHANICAL_SIMULATORS,
  FEATURED_INSTRUMENTATION_SIMULATORS,
  FEATURED_CIVIL_SIMULATORS,
  FEATURED_CHEMICAL_SIMULATORS,
  FEATURED_SEMICONDUCTOR_SIMULATORS
} from '../data/simulators';
import { SimulatorItem } from '../types';

interface NavbarProps {
  onOpenSearch: () => void;
  onQuickLaunch: () => void;
  onSelectDiscipline: (disciplineId: string) => void;
  onLaunchSimulator?: (simulatorId: string) => void;
  onGoHome?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
}

interface NavDepartment {
  id: string;
  label: string;
  fullName: string;
  code: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  textClass: string;
  hoverTextClass: string;
  bgLightClass: string;
  borderClass: string;
  simulators: SimulatorItem[];
  alignClass: string;
}

const PRIMARY_DEPARTMENTS: NavDepartment[] = [
  {
    id: 'electrical',
    label: 'Electrical',
    fullName: 'Electrical & Electronic Systems',
    code: 'EE-200',
    icon: Zap,
    accentColor: '#06b6d4',
    textClass: 'text-cyan-400',
    hoverTextClass: 'hover:text-cyan-300',
    bgLightClass: 'bg-cyan-500/10',
    borderClass: 'border-cyan-500/30',
    simulators: FEATURED_ELECTRICAL_SIMULATORS,
    alignClass: 'left-0 sm:-left-4',
  },
  {
    id: 'mechanical',
    label: 'Mechanical',
    fullName: 'Mechanical & Thermal Dynamics',
    code: 'ME-400',
    icon: Cpu,
    accentColor: '#f59e0b',
    textClass: 'text-amber-400',
    hoverTextClass: 'hover:text-amber-300',
    bgLightClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
    simulators: FEATURED_MECHANICAL_SIMULATORS,
    alignClass: 'left-1/2 -translate-x-1/2',
  },
  {
    id: 'control',
    label: 'Instrumentation',
    fullName: 'Control Systems & Robotics',
    code: 'CS-300',
    icon: Sliders,
    accentColor: '#10b981',
    textClass: 'text-emerald-400',
    hoverTextClass: 'hover:text-emerald-300',
    bgLightClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
    simulators: FEATURED_INSTRUMENTATION_SIMULATORS,
    alignClass: 'left-1/2 -translate-x-1/2',
  },
  {
    id: 'civil',
    label: 'Civil',
    fullName: 'Civil & Structural Mechanics',
    code: 'CE-320',
    icon: Building2,
    accentColor: '#ec4899',
    textClass: 'text-pink-400',
    hoverTextClass: 'hover:text-pink-300',
    bgLightClass: 'bg-pink-500/10',
    borderClass: 'border-pink-500/30',
    simulators: FEATURED_CIVIL_SIMULATORS,
    alignClass: 'left-1/2 -translate-x-3/4 sm:left-auto sm:right-0',
  },
];

const MORE_DEPARTMENTS = [
  {
    id: 'chemical',
    label: 'Chemical',
    fullName: 'Chemical & Process Engineering',
    code: 'CH-250',
    icon: FlaskConical,
    accentColor: '#8b5cf6',
    textClass: 'text-purple-400',
    simulators: FEATURED_CHEMICAL_SIMULATORS,
  },
  {
    id: 'physics',
    label: 'Semiconductor',
    fullName: 'Quantum & Semiconductor Physics',
    code: 'PH-500',
    icon: Atom,
    accentColor: '#38bdf8',
    textClass: 'text-sky-400',
    simulators: FEATURED_SEMICONDUCTOR_SIMULATORS,
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onQuickLaunch,
  onSelectDiscipline,
  onLaunchSimulator,
  onGoHome,
  onNavigateToAbout,
  onNavigateToContact,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileDept, setExpandedMobileDept] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => soundEngine.getMuted());
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (dropdownId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(dropdownId);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleAudioChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isMuted: boolean }>;
      if (customEvent.detail) {
        setIsAudioMuted(customEvent.detail.isMuted);
      }
    };
    window.addEventListener('livesimulators:audio_change', handleAudioChange);
    return () => window.removeEventListener('livesimulators:audio_change', handleAudioChange);
  }, []);

  const handleToggleAudio = () => {
    const nextMuted = soundEngine.toggleMute();
    setIsAudioMuted(nextMuted);
    if (!nextMuted) {
      soundEngine.playRelayClick();
    }
  };

  const handleGoHome = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setActiveDropdown(null);
    if (onGoHome) {
      onGoHome();
    }
  };

  const scrollToSection = (id: string) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    if (onGoHome) onGoHome();
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleDisciplineNav = (disciplineId: string) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    soundEngine.playRelayClick();
    onSelectDiscipline(disciplineId);
  };

  const handleSimulatorClick = (simulatorId: string, disciplineId: string) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    soundEngine.playRelayClick();
    trackSimulatorOpen(disciplineId, simulatorId);
    if (onLaunchSimulator) {
      onLaunchSimulator(simulatorId);
    } else {
      navigateTo(`/simulator/${simulatorId}`);
    }
  };

  const toggleMobileDept = (deptId: string) => {
    soundEngine.playRelayClick();
    setExpandedMobileDept((prev) => (prev === deptId ? null : deptId));
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#060a12]/95 backdrop-blur-md">
      
      {/* Precision Top Engineering Strip */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1 text-[11px] font-mono border-b border-slate-800/60 bg-slate-950/70 text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 font-semibold">SOLVER KERNEL ACTIVE</span>
            <span className="text-slate-600">|</span>
            <span>RK4 SYMPLECTIC INTEGRATOR</span>
          </div>
          <span className="text-slate-600">|</span>
          <span>SI CODATA CONSTRAINTS</span>
        </div>
        
        <div className="flex items-center gap-4 text-slate-500 text-[10px]">
          <span className="text-cyan-400">CLIENT-SIDE FLOAT64 PRECISION</span>
          <span className="text-slate-700">•</span>
          <span>ZERO PLUGINS REQUIRED</span>
        </div>
      </div>

      {/* Main Minimal World-Class Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LIVE SIMULATORS Wordmark */}
        <a 
          href="/" 
          onClick={handleGoHome}
          className="flex items-center gap-2.5 group focus:outline-none shrink-0"
          id="brand-logo"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
            LIVE <span className="text-cyan-400">SIMULATORS</span>
          </span>
        </a>

        {/* Desktop Minimal Navigation Links with Interactive Simulator Dropdowns */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
          <a
            href="/"
            onClick={handleGoHome}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50 rounded-md transition-colors"
            id="nav-home"
          >
            Departments
          </a>

          {/* Primary Engineering Disciplines with Simulator Hover Dropdowns */}
          {PRIMARY_DEPARTMENTS.map((dept) => {
            const isOpen = activeDropdown === dept.id;
            const DeptIcon = dept.icon;

            return (
              <div
                key={dept.id}
                className="relative"
                onMouseEnter={() => handleMouseEnter(dept.id)}
                onMouseLeave={handleMouseLeave}
              >
                <a
                  href={`/department/${dept.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleDisciplineNav(dept.id);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                    isOpen
                      ? `${dept.textClass} ${dept.bgLightClass} ${dept.borderClass} border`
                      : `text-slate-300 ${dept.hoverTextClass} hover:bg-slate-800/50`
                  }`}
                  id={`nav-${dept.id}`}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                >
                  <span>{dept.label}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-white' : 'text-slate-500'
                    }`}
                  />
                </a>

                {/* Dropdown Panel with Hover Hit-Box Bridge */}
                {isOpen && (
                  <div
                    className={`absolute top-full pt-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${dept.alignClass}`}
                    onMouseEnter={() => handleMouseEnter(dept.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div 
                      className="w-[560px] max-w-[calc(100vw-32px)] bg-[#090e1a]/95 border border-slate-700/80 rounded-2xl shadow-2xl p-3 backdrop-blur-xl"
                      style={{
                        boxShadow: `0 20px 50px rgba(0,0,0,0.7), 0 0 30px ${dept.accentColor}18`,
                      }}
                    >
                      {/* Dropdown Header */}
                      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center border"
                            style={{
                              backgroundColor: `${dept.accentColor}15`,
                              borderColor: `${dept.accentColor}40`,
                              color: dept.accentColor,
                            }}
                          >
                            <DeptIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                              <span>{dept.fullName}</span>
                              <span 
                                className="px-1.5 py-0.2 text-[9px] font-mono rounded border font-semibold"
                                style={{
                                  backgroundColor: `${dept.accentColor}15`,
                                  borderColor: `${dept.accentColor}30`,
                                  color: dept.accentColor,
                                }}
                              >
                                {dept.code}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                              {dept.simulators.length} Interactive Simulators • Client-Side Solver
                            </div>
                          </div>
                        </div>

                        <a
                          href={`/department/${dept.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleDisciplineNav(dept.id);
                          }}
                          className="text-[11px] font-medium text-slate-400 hover:text-white flex items-center gap-1 group/hub px-2 py-1 rounded-lg hover:bg-slate-800/60 transition-colors"
                        >
                          <span>Department Hub</span>
                          <ChevronRight className="w-3 h-3 group-hover/hub:translate-x-0.5 transition-transform" />
                        </a>
                      </div>

                      {/* Simulators Grid (2 Columns, Clean Cards) */}
                      <div className="grid grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1">
                        {dept.simulators.map((sim) => (
                          <a
                            key={sim.id}
                            href={`/simulator/${sim.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleSimulatorClick(sim.id, sim.discipline);
                            }}
                            className="group/item flex flex-col justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/90 border border-slate-800/80 hover:border-slate-700/80 transition-all text-left relative overflow-hidden"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <span className="text-xs font-semibold text-slate-200 group-hover/item:text-white transition-colors line-clamp-1 leading-snug">
                                {sim.title}
                              </span>
                              <ArrowRight className="w-3 h-3 text-slate-600 group-hover/item:text-cyan-400 group-hover/item:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                            </div>

                            <div className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-sans">
                              {sim.tagline}
                            </div>

                            <div className="flex items-center gap-2 mt-2 text-[10px] font-mono">
                              <span
                                className="px-1.5 py-0.2 rounded font-medium border"
                                style={{
                                  backgroundColor: `${dept.accentColor}12`,
                                  borderColor: `${dept.accentColor}25`,
                                  color: dept.accentColor,
                                }}
                              >
                                {sim.disciplineName || sim.badge}
                              </span>
                              {sim.difficulty && (
                                <span className="text-slate-500 text-[9px]">
                                  {sim.difficulty}
                                </span>
                              )}
                            </div>
                          </a>
                        ))}
                      </div>

                      {/* Dropdown Footer Strip */}
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 px-2 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Float64 Precision • Zero Plugins
                        </span>

                        <a
                          href={`/department/${dept.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleDisciplineNav(dept.id);
                          }}
                          className="font-semibold text-slate-300 hover:text-cyan-300 flex items-center gap-1 transition-colors group/view"
                        >
                          <span>Explore All {dept.label} Theory & Benchmarks</span>
                          <ArrowRight className="w-3 h-3 text-cyan-400 group-hover/view:translate-x-0.5 transition-transform" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* More Disciplines Dropdown (Chemical & Process + Semiconductor Physics) */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('more-disciplines')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => scrollToSection('concept-discovery')}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeDropdown === 'more-disciplines'
                  ? 'text-purple-400 bg-purple-500/10 border-purple-500/30 border'
                  : 'text-slate-300 hover:text-purple-300 hover:bg-slate-800/50'
              }`}
              id="nav-more-disciplines"
              aria-expanded={activeDropdown === 'more-disciplines'}
              aria-haspopup="true"
            >
              <span>More</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  activeDropdown === 'more-disciplines' ? 'rotate-180 text-white' : 'text-slate-500'
                }`}
              />
            </button>

            {activeDropdown === 'more-disciplines' && (
              <div
                className="absolute top-full pt-2 z-50 animate-in fade-in zoom-in-95 duration-150 right-0 sm:left-1/2 sm:-translate-x-1/2"
                onMouseEnter={() => handleMouseEnter('more-disciplines')}
                onMouseLeave={handleMouseLeave}
              >
                <div 
                  className="w-[580px] max-w-[calc(100vw-32px)] bg-[#090e1a]/95 border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 backdrop-blur-xl"
                  style={{
                    boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(139,92,246,0.18)',
                  }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {MORE_DEPARTMENTS.map((dept) => {
                      const DeptIcon = dept.icon;
                      return (
                        <div key={dept.id} className="space-y-2">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                            <div className="flex items-center gap-1.5">
                              <DeptIcon className={`w-3.5 h-3.5 ${dept.textClass}`} />
                              <span className="text-xs font-bold text-slate-100">{dept.label}</span>
                              <span className="text-[9px] font-mono text-slate-500">({dept.code})</span>
                            </div>
                            <a
                              href={`/department/${dept.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                handleDisciplineNav(dept.id);
                              }}
                              className="text-[10px] text-slate-400 hover:text-white transition-colors"
                            >
                              Hub →
                            </a>
                          </div>

                          <div className="space-y-1.5">
                            {dept.simulators.slice(0, 5).map((sim) => (
                              <a
                                key={sim.id}
                                href={`/simulator/${sim.id}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSimulatorClick(sim.id, sim.discipline);
                                }}
                                className="block p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 transition-all text-left group"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                                    {sim.title}
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 shrink-0" />
                                </div>
                                <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                                  {sim.tagline}
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono text-[10px]">
                      Complete Multi-Disciplinary Engineering Suite
                    </span>
                    <button
                      onClick={() => scrollToSection('engineering-departments')}
                      className="font-semibold text-slate-300 hover:text-purple-300 flex items-center gap-1 transition-colors"
                    >
                      <span>Explore All 6 Disciplines</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Industrial Labs Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => handleMouseEnter('labs')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'labs' ? null : 'labs')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-slate-900/90 hover:bg-slate-800 border rounded-lg transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)] ${
                activeDropdown === 'labs' ? 'border-cyan-400' : 'border-cyan-500/40 hover:border-cyan-400'
              }`}
              id="nav-labs-dropdown-btn"
              aria-expanded={activeDropdown === 'labs'}
              aria-haspopup="true"
            >
              <FlaskConical className="w-3.5 h-3.5 text-cyan-400" />
              <span>Industrial Labs</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/50 text-[10px] font-mono text-amber-300 font-black tracking-wider">
                PRO
              </span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeDropdown === 'labs' ? 'rotate-180 text-cyan-400' : ''}`} />
            </button>

            {activeDropdown === 'labs' && (
              <div 
                className="absolute right-0 xl:left-0 top-full pt-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseEnter={() => handleMouseEnter('labs')}
                onMouseLeave={handleMouseLeave}
              >
                <div className="w-80 bg-[#090e1a]/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2 backdrop-blur-xl">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-3 py-1.5 border-b border-slate-800 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <FlaskConical className="w-3 h-3" />
                      <span>Industrial Labs</span>
                    </span>
                    <span className="text-slate-500">{LABS.length} Suites</span>
                  </div>
                  <div className="space-y-1">
                    {LABS.map((lab) => (
                      <a
                        key={lab.id}
                        href={lab.url}
                        target={lab.external ? '_blank' : undefined}
                        rel={lab.external ? 'noopener noreferrer' : undefined}
                        onClick={(e) => {
                          setActiveDropdown(null);
                          trackLabLaunch(lab.id, 'navbar_dropdown');
                          if (!lab.external) {
                            e.preventDefault();
                            navigateTo(lab.url);
                          }
                        }}
                        className="block p-2.5 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 transition-colors group"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                          <span>{lab.name}</span>
                          {lab.external ? (
                            <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                          ) : (
                            <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-sans">{lab.tagline}</div>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono">
                          <span className="px-1.5 py-0.2 rounded font-semibold" style={{ backgroundColor: `${lab.accent}20`, color: lab.accent }}>
                            {lab.modules} Modules
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-500 capitalize">{lab.dept}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <a
            href="/about"
            onClick={(e) => {
              e.preventDefault();
              setActiveDropdown(null);
              if (onNavigateToAbout) onNavigateToAbout();
              else scrollToSection('why-interactive');
            }}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50 rounded-md transition-colors"
            id="nav-about"
          >
            About
          </a>

          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              setActiveDropdown(null);
              if (onNavigateToContact) onNavigateToContact();
            }}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50 rounded-md transition-colors"
            id="nav-contact"
          >
            Contact
          </a>
        </nav>

        {/* Right Side: Quick Search, Audio FX Toggle & Primary Navigation CTA */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Audio Synthesizer Toggle */}
          <button
            onClick={handleToggleAudio}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-mono group ${
              isAudioMuted
                ? 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
            }`}
            title={isAudioMuted ? 'Unmute physics sound effects' : 'Mute physics sound effects'}
            aria-label={isAudioMuted ? 'Unmute audio' : 'Mute audio'}
            id="nav-audio-toggle-btn"
          >
            {isAudioMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            )}
            <span className="hidden md:inline text-[11px] font-bold">
              {isAudioMuted ? 'FX OFF' : 'FX ON'}
            </span>
          </button>

          {/* Quick Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-all group"
            title="Search all simulators (Ctrl+K or /)"
            id="nav-search-btn"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] text-slate-400 bg-slate-800 border border-slate-700 rounded font-mono">
              /
            </kbd>
          </button>

          {/* Primary Navigation CTA: "Explore Simulators" */}
          <button
            onClick={() => scrollToSection('engineering-departments')}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] font-display shrink-0"
            id="nav-explore-simulators-cta"
          >
            <span>Explore Simulators</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Toggle Button (Min 44px Touch Target) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-11 h-11 flex items-center justify-center text-slate-300 hover:text-white rounded-lg border border-slate-800 bg-slate-900 active:bg-slate-800"
            aria-label="Toggle navigation"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Drawer (Clean, interactive accordions for all engineering simulators) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#080d17] px-4 pt-3 pb-6 space-y-2 font-sans animate-in slide-in-from-top-2 duration-200 max-h-[85vh] overflow-y-auto">
          
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-2 pb-0.5">
            Engineering Disciplines & Live Simulators
          </div>

          {/* Department Accordions */}
          <div className="space-y-1.5">
            {[...PRIMARY_DEPARTMENTS, ...MORE_DEPARTMENTS].map((dept) => {
              const isExpanded = expandedMobileDept === dept.id;
              const DeptIcon = dept.icon;

              return (
                <div key={dept.id} className="rounded-xl border border-slate-800/90 bg-slate-900/60 overflow-hidden">
                  <div className="flex items-center justify-between p-1">
                    <button
                      onClick={() => handleDisciplineNav(dept.id)}
                      className="flex-1 min-h-[44px] flex items-center gap-2.5 px-3 py-2 text-slate-200 text-sm font-medium hover:text-white text-left transition-colors"
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center border shrink-0"
                        style={{
                          backgroundColor: `${dept.accentColor}15`,
                          borderColor: `${dept.accentColor}40`,
                          color: dept.accentColor,
                        }}
                      >
                        <DeptIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-200">{dept.label}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {dept.simulators.length} Simulators • {dept.code}
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => toggleMobileDept(dept.id)}
                      className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
                      aria-label={`Toggle ${dept.label} simulator list`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-cyan-400' : 'text-slate-500'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Expanded Simulators List */}
                  {isExpanded && (
                    <div className="border-t border-slate-800/80 bg-slate-950/70 p-2 space-y-1 animate-in fade-in duration-150">
                      {dept.simulators.map((sim) => (
                        <a
                          key={sim.id}
                          href={`/simulator/${sim.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSimulatorClick(sim.id, sim.discipline);
                          }}
                          className="w-full min-h-[44px] flex items-center justify-between p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800/60 text-left transition-colors group"
                        >
                          <div className="flex flex-col pr-2">
                            <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors line-clamp-1">
                              {sim.title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                              {sim.disciplineName || sim.badge}
                            </span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </a>
                      ))}

                      <button
                        onClick={() => handleDisciplineNav(dept.id)}
                        className="w-full py-2.5 px-3 mt-1.5 rounded-lg bg-slate-900 border border-slate-700/60 text-xs font-semibold text-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Explore All {dept.label} Theory & Benchmarks</span>
                        <ArrowRight className="w-3 h-3 text-cyan-400" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Industrial Labs in Mobile Menu */}
          <div className="pt-2 pb-1">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider px-2 pb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FlaskConical className="w-3 h-3" />
                <span>Industrial Labs Pro</span>
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/50 text-[9px] font-mono text-amber-300 font-black">
                PRO SUITES
              </span>
            </div>
            <div className="space-y-1">
              {LABS.map((lab) => (
                <a
                  key={lab.id}
                  href={lab.url}
                  target={lab.external ? '_blank' : undefined}
                  rel={lab.external ? 'noopener noreferrer' : undefined}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    trackLabLaunch(lab.id, 'navbar_dropdown');
                    if (!lab.external) {
                      e.preventDefault();
                      navigateTo(lab.url);
                    }
                  }}
                  className="w-full min-h-[48px] flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition-colors"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-slate-200">{lab.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">{lab.modules} Modules • {lab.dept}</span>
                  </div>
                  {lab.external ? (
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  )}
                </a>
              ))}
            </div>
          </div>

          <div className="pt-1 space-y-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onNavigateToAbout) onNavigateToAbout();
                else scrollToSection('why-interactive');
              }}
              className="w-full min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-medium transition-colors"
            >
              <span>About Us</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onNavigateToContact) onNavigateToContact();
              }}
              className="w-full min-h-[44px] flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-medium transition-colors"
            >
              <span>Contact & Inquiries</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Primary CTA in Mobile Menu */}
          <div className="pt-2">
            <button
              onClick={() => scrollToSection('concept-discovery')}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm font-display shadow-lg shadow-cyan-950"
            >
              <span>Explore All Simulators</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </header>
  );
};
