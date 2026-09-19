import React, { useState } from 'react';
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
  FlaskConical
} from 'lucide-react';
import { LABS, trackLabLaunch } from '../config/labs';

interface NavbarProps {
  onOpenSearch: () => void;
  onQuickLaunch: () => void;
  onSelectDiscipline: (disciplineId: string) => void;
  onGoHome?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onQuickLaunch,
  onSelectDiscipline,
  onGoHome,
  onNavigateToAbout,
  onNavigateToContact,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [labsDropdownOpen, setLabsDropdownOpen] = useState(false);

  const handleGoHome = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onGoHome) {
      onGoHome();
    }
  };

  const scrollToSection = (id: string) => {
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
    setMobileMenuOpen(false);
    onSelectDiscipline(disciplineId);
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
            <span>RK4 SYMLECTIC INTEGRATOR</span>
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
          className="flex items-center gap-2.5 group focus:outline-none"
          id="brand-logo"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
            LIVE <span className="text-cyan-400">SIMULATORS</span>
          </span>
        </a>

        {/* Desktop Minimal Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <a
            href="/"
            onClick={handleGoHome}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50 rounded-md transition-colors"
            id="nav-home"
          >
            Departments
          </a>
          
          <a
            href="/department/electrical"
            onClick={(e) => { e.preventDefault(); handleDisciplineNav('electrical'); }}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50 rounded-md transition-colors"
            id="nav-electrical"
          >
            Electrical
          </a>

          <a
            href="/department/mechanical"
            onClick={(e) => { e.preventDefault(); handleDisciplineNav('mechanical'); }}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-amber-300 hover:bg-slate-800/50 rounded-md transition-colors"
            id="nav-mechanical"
          >
            Mechanical
          </a>

          <a
            href="/department/control"
            onClick={(e) => { e.preventDefault(); handleDisciplineNav('control'); }}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-emerald-300 hover:bg-slate-800/50 rounded-md transition-colors"
            id="nav-instrumentation"
          >
            Instrumentation
          </a>

          <a
            href="/department/civil"
            onClick={(e) => { e.preventDefault(); handleDisciplineNav('civil'); }}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-pink-300 hover:bg-slate-800/50 rounded-md transition-colors"
            id="nav-civil"
          >
            Civil
          </a>

          {/* Industrial Labs Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setLabsDropdownOpen(true)}
            onMouseLeave={() => setLabsDropdownOpen(false)}
          >
            <button
              onClick={() => setLabsDropdownOpen(!labsDropdownOpen)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50 rounded-md transition-colors"
              id="nav-labs-dropdown-btn"
              aria-expanded={labsDropdownOpen}
            >
              <span>Labs</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${labsDropdownOpen ? 'rotate-180 text-cyan-400' : ''}`} />
            </button>

            {labsDropdownOpen && (
              <div className="absolute left-0 top-full mt-1 w-80 bg-[#090e1a]/95 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95">
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
                      onClick={() => {
                        setLabsDropdownOpen(false);
                        trackLabLaunch(lab.id, 'navbar_dropdown');
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
            )}
          </div>

          <a
            href="/about"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigateToAbout) onNavigateToAbout();
              else scrollToSection('why-interactive');
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50 rounded-md transition-colors"
            id="nav-about"
          >
            About
          </a>

          <a
            href="/contact"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigateToContact) onNavigateToContact();
            }}
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-cyan-300 hover:bg-slate-800/50 rounded-md transition-colors"
            id="nav-contact"
          >
            Contact
          </a>
        </nav>

        {/* Right Side: Quick Search & Primary Navigation CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          
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
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] font-display shrink-0"
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

      {/* Mobile Drawer (Clean, uncluttered, large touch targets ≥ 48px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-[#080d17] px-4 pt-3 pb-6 space-y-1.5 font-sans animate-in slide-in-from-top-2 duration-200">
          
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider px-3 pb-1">
            Navigation Menu
          </div>

          <button
            onClick={() => scrollToSection('engineering-departments')}
            className="w-full min-h-[48px] flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-medium transition-colors"
          >
            <span>Explore All Departments</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => handleDisciplineNav('electrical')}
            className="w-full min-h-[48px] flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="text-cyan-400">⚡</span>
              <span>Electrical</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => handleDisciplineNav('mechanical')}
            className="w-full min-h-[48px] flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="text-amber-400">⚙</span>
              <span>Mechanical</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => handleDisciplineNav('control')}
            className="w-full min-h-[48px] flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="text-teal-400">🎛</span>
              <span>Instrumentation & Control</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => handleDisciplineNav('chemical')}
            className="w-full min-h-[48px] flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="text-purple-400">🧪</span>
              <span>Chemical & Process</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => handleDisciplineNav('civil')}
            className="w-full min-h-[48px] flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="text-pink-400">🏛</span>
              <span>Civil & Structural</span>
            </span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Industrial Labs in Mobile Menu */}
          <div className="pt-2 pb-1">
            <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider px-3 pb-1 flex items-center gap-1.5">
              <FlaskConical className="w-3 h-3" />
              <span>Industrial Labs</span>
            </div>
            <div className="space-y-1">
              {LABS.map((lab) => (
                <a
                  key={lab.id}
                  href={lab.url}
                  target={lab.external ? '_blank' : undefined}
                  rel={lab.external ? 'noopener noreferrer' : undefined}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    trackLabLaunch(lab.id, 'navbar_dropdown');
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

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onNavigateToAbout) onNavigateToAbout();
              else scrollToSection('why-interactive');
            }}
            className="w-full min-h-[48px] flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-medium transition-colors"
          >
            <span>About Us</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onNavigateToContact) onNavigateToContact();
            }}
            className="w-full min-h-[48px] flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-200 text-sm font-medium transition-colors"
          >
            <span>Contact & Inquiries</span>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>

          {/* Primary CTA in Mobile Menu */}
          <div className="pt-3">
            <button
              onClick={() => scrollToSection('concept-discovery')}
              className="w-full min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm font-display shadow-lg shadow-cyan-950"
            >
              <span>Explore Simulators</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </header>
  );
};
