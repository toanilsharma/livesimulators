import React from 'react';
import { 
  AlertTriangle, 
  ArrowLeft, 
  ShieldAlert, 
  CheckCircle2, 
  FileText, 
  Cpu, 
  HardHat, 
  Scale,
  Mail
} from 'lucide-react';

interface DisclaimerPageProps {
  onBackToHome: () => void;
  onNavigateToTerms: () => void;
  onNavigateToContact: () => void;
}

export const DisclaimerPage: React.FC<DisclaimerPageProps> = ({
  onBackToHome,
  onNavigateToTerms,
  onNavigateToContact
}) => {
  return (
    <div className="min-h-screen bg-[#080d16] text-slate-100 font-sans selection:bg-cyan-500/25 selection:text-cyan-200 relative overflow-x-hidden w-full max-w-full">
      {/* Background Decorators */}
      <div className="absolute inset-0 bg-tech-grid opacity-10 pointer-events-none" />
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg group"
            id="disclaimer-back-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Simulators</span>
          </button>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-mono text-cyan-400">LEGAL & COMPLIANCE</span>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-mono text-slate-300">DISCLAIMER</span>
        </div>

        {/* Document Header */}
        <div className="border-b border-slate-800 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono mb-3">
            <AlertTriangle className="w-3.5 h-3.5" />
            ENGINEERING & NUMERICAL MODELING DISCLAIMER
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
            Engineering Simulation Disclaimer
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
            <span>LAST UPDATED: September 2026</span>
            <span>•</span>
            <span>APPLICABLE TO ALL LIVESIMULATORS WORKBENCHES</span>
          </div>
        </div>

        {/* Highlight Alert Box */}
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 mb-10 text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-display font-bold text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>Essential Notice for Engineering Practice</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            LiveSimulators is an educational, conceptual, and exploratory platform designed to build physical intuition. 
            <strong> Under no circumstances should simulation outputs, numerical values, graphs, or equations on this website 
            be utilized as the sole or primary basis for structural fabrication, electrical high-voltage installations, 
            safety-critical control systems, chemical process design, or commercial engineering sign-offs.</strong>
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8 text-xs text-slate-300 leading-relaxed font-sans">
          
          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              1. Mathematical Approximations & Boundary Idealizations
            </h3>
            <p>
              In order to execute simulations in real time (60 frames per second) directly inside the browser using 
              client-side numerical integrators (e.g. 4th-Order Runge-Kutta), certain continuous field partial differential 
              equations are modeled using lumped-parameter approximations.
            </p>
            <p>
              These models intentionally adopt classical textbook boundary idealizations, which may not account for real-world non-idealities:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400 font-mono text-[11px]">
              <li>Parasitic inductances, dielectric losses, and temperature-dependent ESR in electrical circuits.</li>
              <li>Nonlinear plastic deformation, micro-fracture propagation, or geometric warping in beam and truss elements.</li>
              <li>Non-Newtonian fluid rheology, boundary layer separation, and cavitation effects in fluid systems.</li>
              <li>Actuator saturation, quantization noise, sensor drift, and backlash in control loops.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <HardHat className="w-4 h-4 text-amber-400" />
              2. No Professional Engineering (PE) or Design Advice
            </h3>
            <p>
              The content, equations, calculators, and interactive widgets provided on LiveSimulators do not constitute 
              professional engineering advice, structural analysis reports, architectural endorsements, or safety certifications.
            </p>
            <p>
              Qualified and certified Professional Engineers (PE, SE, CEng, Eur Ing) or relevant credentialed authorities must be 
              engaged to perform full finite element analysis (FEA), computational fluid dynamics (CFD), fault current coordination 
              studies, and physical prototyping before manufacturing or deploying any engineering system into the field.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              3. Standards Citations & Third-Party Trademarks
            </h3>
            <p>
              References to industry standards bodies such as IEEE, ASME, AISC, IEC, ISO, or ASTM are provided strictly for 
              academic citation, educational cross-referencing, and pedagogical context.
            </p>
            <p>
              LiveSimulators is an independent educational platform. Mention of standards does not imply endorsement, 
              sponsorship, or certification by any formal governing body. Users seeking official compliance verification must 
              acquire authoritative copies of the applicable published standards from the respective organizations.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-purple-400" />
              4. "As Is" Provision & Limitation of Liability
            </h3>
            <p>
              LiveSimulators, its creator Anil Sharma, and any contributors provide all code, visualizations, and formulas on an 
              <strong> "AS IS" and "AS AVAILABLE"</strong> basis without warranty of any kind, whether express or implied.
            </p>
            <p>
              To the maximum extent permitted by law, LiveSimulators disclaims all liability for any direct, indirect, incidental, 
              special, or consequential damages resulting from the use or inability to use the simulators, including but not 
              limited to mechanical failure, electrical equipment damage, financial loss, or personal injury.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="font-display text-lg font-bold text-white">5. Clarifications & Discrepancy Reporting</h3>
            <p>
              If you detect any numerical boundary discrepancy, mathematical typo, or theoretical divergence in any of our 
              simulations, we encourage peer review and rapid correction. Please contact our engineering lead directly:
            </p>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1">
              <div>ENGINEERING LEAD: Anil Sharma</div>
              <div>EMAIL: <a href="mailto:0808miracle@gmail.com" className="text-cyan-300 underline">0808miracle@gmail.com</a></div>
              <div>LINKEDIN: <a href="https://www.linkedin.com/in/toanilsharma/" target="_blank" rel="noopener noreferrer" className="text-cyan-300 underline">linkedin.com/in/toanilsharma</a></div>
            </div>
          </section>

        </div>

        {/* Links Strip */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <button onClick={onNavigateToTerms} className="hover:text-cyan-300 underline">
            Review Terms of Service &rarr;
          </button>
          <button onClick={onNavigateToContact} className="hover:text-cyan-300 underline">
            Submit Technical Clarification &rarr;
          </button>
        </div>

      </div>
    </div>
  );
};
