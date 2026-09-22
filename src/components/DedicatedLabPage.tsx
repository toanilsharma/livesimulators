import React, { useState } from 'react';
import {
  ArrowLeft,
  Maximize2,
  Minimize2,
  Share2,
  Check,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Award,
  Sparkles,
  ExternalLink,
  Info,
  Cpu,
  Zap,
  Activity,
  ChevronLeft,
  ChevronRight,
  Code,
  Copy,
  X
} from 'lucide-react';
import { LABS, LabItem } from '../config/labs';
import { navigateTo } from '../utils/routes';

interface DedicatedLabPageProps {
  labId: string;
  onBack: () => void;
}

export const DedicatedLabPage: React.FC<DedicatedLabPageProps> = ({ labId, onBack }) => {
  const lab = LABS.find((l) => l.id === labId) || LABS[0];
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [embedHeight, setEmbedHeight] = useState('750');

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className={`min-h-screen bg-[#070b14] text-slate-100 ${isFullscreen ? 'fixed inset-0 z-50 overflow-hidden' : 'py-5 sm:py-7 px-3 sm:px-6 lg:px-8'}`}>
      <div className={`${isFullscreen ? 'h-full flex flex-col' : 'max-w-7xl mx-auto space-y-5 sm:space-y-6'}`}>

        {/* Top Navigation & Status HUD */}
        <div className={`flex flex-wrap items-center justify-between gap-3 ${isFullscreen ? 'px-4 py-2.5 bg-slate-950/95 border-b border-slate-800 shrink-0' : 'pb-4 border-b border-slate-800'}`}>
          {/* Left: Breadcrumbs & Back */}
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-400 min-w-0">
            <button
              onClick={onBack}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-slate-300 hover:underline shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Labs</span>
            </button>
            <span className="text-slate-600 shrink-0">/</span>
            <span className="text-white font-bold truncate max-w-[200px] sm:max-w-[320px]">{lab.name}</span>
          </div>

          {/* Right: Technical Badges & Toolbar Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Engine Live Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE WORKBENCH ACTIVE</span>
            </div>

            {/* Standard Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-cyan-300 font-bold">
              <Award className="w-3 h-3 text-cyan-400" />
              <span>{lab.standardBadge}</span>
            </div>

            {/* Copy Link Button */}
            <button
              onClick={handleCopyLink}
              title="Copy link to lab"
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </button>

            {/* LMS Embed Button */}
            <button
              onClick={() => setShowEmbedModal(true)}
              title="Embed this industrial lab into Canvas, Moodle, or Blackboard LMS"
              className="px-2.5 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-xs font-mono text-purple-300 font-bold transition-colors flex items-center gap-1.5"
            >
              <Code className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Embed in LMS</span>
            </button>

            {/* Direct Standalone CNAME External Launch */}
            {(lab.standaloneUrl || lab.embedUrl) && (
              <a
                href={lab.standaloneUrl || lab.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Launch standalone CAD portal in new window"
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Standalone</span>
              </a>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Workbench'}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-xs font-mono text-cyan-300 font-bold transition-colors flex items-center gap-1.5"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modules Quick-Access Side Scroller Bar */}
        {!isFullscreen && (
          <div className="p-3 rounded-2xl bg-[#090e1a]/95 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between gap-2 mb-2 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                  {lab.name} Modules ({lab.modules}):
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                  Select module inside the workbench toolbar or browse below
                </span>
              </div>

              {/* Scroll Arrows */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('dedicated-lab-module-scroller');
                    if (el) el.scrollBy({ left: -260, behavior: 'smooth' });
                  }}
                  aria-label="Scroll modules left"
                  className="p-1 rounded-md bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('dedicated-lab-module-scroller');
                    if (el) el.scrollBy({ left: 260, behavior: 'smooth' });
                  }}
                  aria-label="Scroll modules right"
                  className="p-1 rounded-md bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Horizontal Module Chips */}
            <div
              id="dedicated-lab-module-scroller"
              className="flex gap-2 overflow-x-auto pb-1 scroll-smooth scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-950"
              style={{ scrollbarWidth: 'thin' }}
            >
              {lab.moduleList?.map((mod, idx) => (
                <div
                  key={mod.id}
                  className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/50 transition-all text-xs font-medium text-slate-300 select-none group/chip"
                >
                  <span
                    className="px-1.5 py-0.5 rounded font-mono text-[9px] font-bold"
                    style={{ backgroundColor: `${lab.accent}25`, color: lab.accent }}
                  >
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-bold text-white group-hover/chip:text-cyan-300 transition-colors">
                      {mod.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans max-w-[200px] truncate">
                      {mod.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Lab Engine Frame */}
        <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl ${isFullscreen ? 'flex-1 rounded-none border-none' : 'h-[76vh] md:h-[82vh]'}`}>
          {/* Loading Spinner Skeleton */}
          {iframeLoading && (
            <div className="absolute inset-0 z-10 bg-slate-950 flex flex-col items-center justify-center gap-4 text-center p-6">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
                <div className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-cyan-400 border-b-transparent border-l-transparent animate-spin" />
                <div className="absolute inset-2 rounded-full bg-slate-900 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">Initializing {lab.name}</h3>
                <p className="text-xs font-mono text-slate-400 mt-1">Loading numerical solvers & IEEE/IEC standard models...</p>
              </div>
            </div>
          )}

          {/* Embedded Full High-Performance Canvas Engine */}
          <iframe
            src={lab.embedUrl}
            title={lab.name}
            onLoad={() => setIframeLoading(false)}
            className="w-full h-full border-0 block"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
          />
        </div>

        {/* Technical Overview & Capabilities Drawer (Shown in standard view) */}
        {!isFullscreen && (
          <div className="space-y-6 pt-2">
            {/* 4 Feature Highlights Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Architecture</div>
                <div className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{lab.modules} Interactive Modules</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Standards Body</div>
                <div className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{lab.standardBadge}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Deployment Suite</div>
                <div className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{lab.deploymentType}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Computational Engine</div>
                <div className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>Float64 Real-Time Solver</span>
                </div>
              </div>
            </div>

            {/* In-Depth Engineering Details Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 space-y-6">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  About {lab.name}
                </h2>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed font-sans max-w-4xl">
                  {lab.tagline} Engineered for university engineering faculties, industrial electrical engineers, and utility operators requiring verified first-principles behavioral simulations under international engineering codes.
                </p>
              </div>

              {/* Primary Industry Sectors */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5 font-bold">
                  Target Industry Sectors:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {lab.sectors.map((sector, sIdx) => (
                    <span
                      key={sIdx}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-950 border border-slate-800 text-slate-200"
                    >
                      {sector}
                    </span>
                  ))}
                </div>
              </div>

              {/* Core Engineering Capabilities */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5 font-bold">
                  Core Technical Capabilities & Analytical Solvers:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {lab.capabilities.map((cap, cIdx) => (
                    <div
                      key={cIdx}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs sm:text-sm text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic & Industrial Disclaimer Banner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3 text-xs text-slate-400 font-sans">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="text-slate-200">Engineering Reference Context:</strong> Mathematical formulations, boundary conditions, and device curves execute client-side using deterministic physics equations referencing published industry standard literature ({lab.standardBadge}) for educational exploration. No endorsement or formal affiliation is implied.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Universal LMS & Course Embed Modal */}
      {showEmbedModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowEmbedModal(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-5 sm:p-6 space-y-4 font-sans max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    Embed {lab.name} in LMS / Portal
                  </h3>
                  <p className="text-xs text-slate-400">
                    Seamless responsive iFrame for Canvas, Moodle, Blackboard, or Intranet
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEmbedModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Height Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs font-mono text-slate-300">Target Display Height:</span>
              <div className="flex items-center gap-1.5">
                {['600', '750', '900', '100%'].map((hVal) => (
                  <button
                    key={hVal}
                    onClick={() => setEmbedHeight(hVal)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-colors ${
                      embedHeight === hVal
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {hVal === '100%' ? '100%' : `${hVal}px`}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">
                  HTML Embed Code:
                </span>
                <button
                  onClick={() => {
                    const snippet = `<iframe src="https://livesimulators.com/lab/${lab.id}" width="100%" height="${embedHeight}" style="border:1px solid #1e293b; border-radius:12px; max-width:100%;" allow="fullscreen" loading="lazy"></iframe>`;
                    navigator.clipboard.writeText(snippet);
                    setEmbedCopied(true);
                    setTimeout(() => setEmbedCopied(false), 2500);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
                    embedCopied
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  {embedCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{embedCopied ? 'Copied to Clipboard!' : 'Copy Embed Code'}</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-purple-300 break-all select-all leading-relaxed">
                {`<iframe src="https://livesimulators.com/lab/${lab.id}" width="100%" height="${embedHeight}" style="border:1px solid #1e293b; border-radius:12px; max-width:100%;" allow="fullscreen" loading="lazy"></iframe>`}
              </div>
            </div>

            {/* LMS Instructions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  <span>Canvas LMS</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Edit Page &gt; Click <strong>Insert &gt; Embed</strong> or switch to HTML view (`&lt;/&gt;`) and paste snippet.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  <span>Moodle LMS</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Add Activity &gt; <strong>Page or Label</strong> &gt; Toggle HTML toolbar button &gt; Paste iframe code.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  <span>Blackboard / Web</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Build Content &gt; <strong>Item / Embed HTML</strong> &gt; Paste and check 'Open in frame'.
                </p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <a
                href={`/lab/${lab.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Direct canonical link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => setShowEmbedModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
