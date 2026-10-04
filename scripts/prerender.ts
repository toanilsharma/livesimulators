import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import katex from 'katex';
import { DISCIPLINES, ALL_AVAILABLE_SIMULATORS } from '../src/data/simulators';
import { LABS } from '../src/config/labs';
import { AppRoute, DisciplineId, SimulatorItem } from '../src/types';
import { getSeoMetadata } from '../src/utils/seo';
import { routeToPath, SITE_URL, TOP_FLAGSHIP_EMBED_SLUGS } from '../src/utils/routes';
import { getEngineeringTheory, cleanLatexToPlainText } from '../src/utils/engineeringTheory';
import { getCrossDisciplineEquivalents } from '../src/data/crossDisciplineEquivalents';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Renders LaTeX equation into MathML & clean HTML via KaTeX,
 * and sets a plain-text fallback data attribute for screen readers & LLMs.
 */
function renderMath(latex: string, displayMode = false): string {
  if (!latex) return '';
  const plain = cleanLatexToPlainText(latex);
  try {
    const rendered = katex.renderToString(latex.trim(), {
      displayMode,
      throwOnError: false,
      output: 'htmlAndMathml',
    });
    return `<span class="math-container" data-math-plain="${escapeHtml(plain)}">${rendered}</span>`;
  } catch {
    return `<span class="math-plain" data-math-plain="${escapeHtml(plain)}">${escapeHtml(plain)}</span>`;
  }
}
 
/**
 * Generates official llms.txt and llms-full.txt files following https://llmstxt.org/
 * Enables AI search engines (Perplexity, ChatGPT/SearchGPT, Claude, Gemini) to index
 * all mathematical models, physical formulations, parameter bounds, and validation tests.
 */
function generateLlmsTxt(): { summary: string; full: string } {
  const currentYear = new Date().getFullYear();
  const entityName = 'LiveSimulators — browser-based first-principles engineering simulators';

  const summaryLines: string[] = [
    `# ${entityName}`,
    '',
    `> LiveSimulators — browser-based first-principles engineering simulators (https://livesimulators.com) is an open-access platform executing dynamic physical and mathematical models directly in the user browser at 60 FPS using Float64 numerical integrators (including 4th-Order Runge-Kutta). Built for university engineering syllabi, laboratory exploration, and industrial plant troubleshooting.`,
    '',
    '## Citation & Usage',
    'To cite LiveSimulators or any individual simulator in academic literature, research papers, course syllabi, or lab manuals, use the following plain-text citation format:',
    '',
    `Sharma, A. (${currentYear}). [Simulator Title]. LiveSimulators. Retrieved from https://livesimulators.com/simulator/[simulator-id]`,
    '',
    'BibTeX entry format:',
    '```bibtex',
    `@misc{livesimulators_[simulator_id]_${currentYear},`,
    '  author = {Sharma, A.},',
    '  title = {[Simulator Title]},',
    `  year = {${currentYear}},`,
    '  howpublished = {LiveSimulators},',
    '  url = {https://livesimulators.com/simulator/[simulator-id]}',
    '}',
    '```',
    '',
    '## Academic & Industrial Disciplines',
  ];

  for (const d of DISCIPLINES) {
    const cleanCore = cleanLatexToPlainText(d.coreEquation);
    summaryLines.push(`- [${d.name} (${d.code})](https://livesimulators.com/department/${d.id}): ${d.description} Core equation: \`${cleanCore}\``);
  }

  summaryLines.push('');
  summaryLines.push('## Interactive Engineering Simulators');
  for (const s of ALL_AVAILABLE_SIMULATORS) {
    const theory = getEngineeringTheory(s);
    const cleanEq = cleanLatexToPlainText(s.governingEquation);
    const inputs = s.parameters.map((p) => `${p.name} (${p.symbol}) [${p.unit || 'unitless'}]: default ${p.default}, range [${p.min} to ${p.max} ${p.unit || ''}]`).join('; ');
    const outputs = (s.keyMetrics && s.keyMetrics.length > 0)
      ? s.keyMetrics.map((m) => `${m.label} [${m.unit || 'dimensionless'}]`).join('; ')
      : `${theory.stepByStepExample.finalAnswer.metric} [${theory.stepByStepExample.finalAnswer.symbol}]`;
    const assumptions = theory.assumptions.join(' | ');
    const limitations = theory.limitations.join(' | ');

    summaryLines.push(`- [${s.title}](https://livesimulators.com/simulator/${s.id}): ${s.tagline}`);
    summaryLines.push(`  - Entity: ${entityName}`);
    summaryLines.push(`  - Citation: Sharma, A. (${currentYear}). ${s.title}. LiveSimulators. Retrieved from https://livesimulators.com/simulator/${s.id}`);
    summaryLines.push(`  - Governing equations (plain text): ${cleanEq}`);
    summaryLines.push(`  - Inputs (with SI units): ${inputs}`);
    summaryLines.push(`  - Outputs (with SI units): ${outputs}`);
    summaryLines.push(`  - Assumptions: ${assumptions}`);
    summaryLines.push(`  - Limitations: ${limitations}`);
  }

  summaryLines.push('');
  summaryLines.push('## Industrial Engineering Labs Workbench');
  for (const lab of LABS) {
    summaryLines.push(`- [${lab.name}](https://livesimulators.com/lab/${lab.id}): ${lab.tagline}. Discipline: ${lab.dept} | ${lab.modules} Interactive Modules | Reference: ${lab.standardBadge}.`);
  }

  summaryLines.push('');
  summaryLines.push('## Mechanical Engineering Digital Twins (Subdomain)');
  summaryLines.push('Full-fidelity mechanical simulators at https://mech.livesimulators.com. Calculations and models reference standard methodologies published in API (610/617/618), ISO (1940), ASME (B31.3), and AGMA (2001) literature for educational and preliminary design purposes.');

  summaryLines.push('');
  summaryLines.push('## Cornerstone Engineering Educational Guides');
  summaryLines.push('- [RLC Resonance Explained](https://livesimulators.com/guides/rlc-resonance-explained.html): Complete engineering guide covering 2nd-order RLC frequency response, damping ratio, quality factor, and transient impedance.');
  summaryLines.push('- [Rankine Cycle T-s Diagram](https://livesimulators.com/guides/rankine-cycle-ts-diagram.html): Complete thermodynamic guide to steam power cycles, superheat expansion, pump work, and condenser backpressure on T-s diagrams.');
  summaryLines.push('- [PID Tuning Step-by-Step](https://livesimulators.com/guides/pid-tuning-step-by-step.html): Complete guide to tuning industrial proportional, integral, and derivative loops with anti-windup clamping.');
  summaryLines.push('- [Beam Deflection Euler-Bernoulli](https://livesimulators.com/guides/beam-deflection-euler-bernoulli.html): Complete structural guide to Euler-Bernoulli 4th-order beam deflection, shear force, bending moments, and AISC L/360 limits.');
  summaryLines.push('- [Four-Bar Mechanism Kinematics](https://livesimulators.com/guides/four-bar-mechanism-kinematics.html): Complete kinematic guide to planar 4-bar link inversions, Grashof mobility, transmission angle limits, and coupler curves.');

  summaryLines.push('');
  summaryLines.push('## Verification Methodology & Quality Assurance');
  summaryLines.push('- [Numerical Methodology & Standards Reference](https://livesimulators.com/about/methodology.html): Complete documentation of 4th-Order Runge-Kutta (RK4) numerical integrator verification, Butcher tableau, and analytical benchmark proofs across 41 engineering simulators.');

  summaryLines.push('');
  summaryLines.push('## Companion Engineering Portals');
  summaryLines.push('- [DesignCalculators.co.in](https://designcalculators.co.in): Free multi-disciplinary engineering calculators (Electrical, Mechanical, Instrumentation) referencing published standards (IEEE, IEC, ASME, API, ISA).');
  summaryLines.push('- [ReliabilityTools.co.in](https://reliabilitytools.co.in): Free plant reliability, asset uptime analytics, 2P/3P Weibull failure modeling, MTBF/MTTR, RCA, and IEC 61508/61511 SIL verification.');

  summaryLines.push('');
  summaryLines.push('## Standards Reference & Non-Affiliation Notice');
  summaryLines.push('All standard designations and acronyms (IEEE, IEC, ASME, API, ISO, ISA, NFPA, ASTM, ANSI, AGMA) belong to their respective owners and are referenced solely for technical identification and academic study. LiveSimulators is an independent educational platform and makes no claim of endorsement, certification, copyright ownership, or official affiliation.');

  summaryLines.push('');
  summaryLines.push('## Full Technical Documentation');
  summaryLines.push('- [Complete Equations, Mathematical Proofs & Benchmark Tests](https://livesimulators.com/llms-full.txt): Detailed mathematical derivations, analytical validation benchmarks, and complete parameter tables for all simulators.');

  // Full technical document
  const fullLines: string[] = [
    `# ${entityName} — Complete Technical & Mathematical Knowledge Base`,
    '',
    `> Complete first-principles equations, analytical proofs, NIST/IEEE/ASME validation benchmarks, and parameter definitions for all LiveSimulators computational models.`,
    '',
    'Website: https://livesimulators.com',
    'Methodology: https://livesimulators.com/about/methodology.html',
    'Founder & Lead Computational Engineer: Anil Sharma (https://www.linkedin.com/in/toanilsharma/)',
    '',
    '## Citation & Usage',
    'To cite LiveSimulators in academic literature, university courseware, or research papers:',
    `Sharma, A. (${currentYear}). [Simulator Title]. LiveSimulators. Retrieved from https://livesimulators.com/simulator/[simulator-id]`,
    '',
    'BibTeX entry format:',
    '```bibtex',
    `@misc{livesimulators_[simulator_id]_${currentYear},`,
    '  author = {Sharma, A.},',
    '  title = {[Simulator Title]},',
    `  year = {${currentYear}},`,
    '  howpublished = {LiveSimulators},',
    '  url = {https://livesimulators.com/simulator/[simulator-id]}',
    '}',
    '```',
    '',
    '## Mechanical Engineering Digital Twins (Subdomain)',
    'Full-fidelity mechanical simulators at https://mech.livesimulators.com. Calculations and models reference the methodologies of API (610/617/618), ISO (1940), ASME (B31.3), and AGMA (2001) publications for educational and preliminary design purposes.',
    '',
    '---',
    '',
  ];

  for (const s of ALL_AVAILABLE_SIMULATORS) {
    const theory = getEngineeringTheory(s);
    const cleanEq = cleanLatexToPlainText(s.governingEquation);
    fullLines.push(`## ${s.title}`);
    fullLines.push(`- **Entity**: ${entityName}`);
    fullLines.push(`- **URL**: https://livesimulators.com/simulator/${s.id}`);
    fullLines.push(`- **Citation**: Sharma, A. (${currentYear}). ${s.title}. LiveSimulators. Retrieved from https://livesimulators.com/simulator/${s.id}`);
    fullLines.push(`- **Discipline**: ${s.disciplineName} (${s.discipline}) | **Level**: ${s.difficulty} | **Badge**: ${s.badge}`);
    fullLines.push(`- **Overview**: ${s.description}`);
    fullLines.push(`- **Physical Law**: ${s.physicalLaw}`);
    fullLines.push(`- **Governing Equations (plain text)**: ${cleanEq}`);
    for (const ge of theory.governingEquations) {
      fullLines.push(`  - ${ge.title}: ${cleanLatexToPlainText(ge.latex)} — ${ge.description}`);
    }
    fullLines.push('- **Inputs (with SI units)**:');
    for (const p of s.parameters) {
      fullLines.push(`  - \`${p.symbol}\` (${p.name}): Default ${p.default} ${p.unit || 'unitless'}, Range [${p.min} to ${p.max} ${p.unit || 'unitless'}]. ${p.description}`);
    }
    fullLines.push('- **Outputs (with SI units)**:');
    if (s.keyMetrics && s.keyMetrics.length > 0) {
      for (const m of s.keyMetrics) {
        fullLines.push(`  - ${m.label} [${m.unit || 'dimensionless'}]`);
      }
    } else {
      fullLines.push(`  - ${theory.stepByStepExample.finalAnswer.metric} (${theory.stepByStepExample.finalAnswer.symbol}): ${theory.stepByStepExample.finalAnswer.value} — ${theory.stepByStepExample.finalAnswer.physicalMeaning}`);
    }
    fullLines.push('- **Assumptions**:');
    for (const a of theory.assumptions) {
      fullLines.push(`  - ${a}`);
    }
    fullLines.push('- **Limitations**:');
    for (const l of theory.limitations) {
      fullLines.push(`  - ${l}`);
    }
    if (s.standardReference) {
      fullLines.push(`- **Referenced Standards**: ${s.standardReference}`);
    }
    if (s.analyticalProof) {
      fullLines.push(`- **Analytical Proof & Mathematical Derivation**: ${cleanLatexToPlainText(s.analyticalProof)}`);
    }
    if (s.validationTest) {
      fullLines.push(`- **Benchmark Validation Test**: ${cleanLatexToPlainText(s.validationTest)}`);
    }
    if (s.fieldInsights) {
      fullLines.push(`- **Industrial Practical Insights**: ${s.fieldInsights}`);
    }
    if (s.courseMapping) {
      fullLines.push(`- **University Course Mapping**: ${s.courseMapping}`);
    }
    if (s.textbookReferences) {
      fullLines.push(`- **Standard Textbook References**: ${s.textbookReferences}`);
    }
    if (s.faqs && s.faqs.length > 0) {
      fullLines.push('- **Frequently Asked Questions & Theoretical Concepts**:');
      for (const faq of s.faqs) {
        fullLines.push(`  - Q: ${faq.question}`);
        fullLines.push(`    A: ${cleanLatexToPlainText(faq.answer)}`);
      }
    }
    fullLines.push('');
    fullLines.push('---');
    fullLines.push('');
  }

  return {
    summary: summaryLines.join('\n'),
    full: fullLines.join('\n'),
  };
}

/**
 * Builds rich, accessible, crawler-indexable semantic HTML content for each route.
 * When search engine bots or users without JS inspect <div id="root">, they see complete content.
 */
function renderContentForRoute(route: AppRoute): string {
  switch (route.view) {
    case 'home': {
      const deptListHtml = DISCIPLINES.map(
        (d) => `
        <article class="dept-card" style="border:1px solid #1e293b; padding:1.5rem; border-radius:1rem; margin-bottom:1rem; background:#0b1324;">
          <h3 style="font-size:1.25rem; font-weight:bold; color:#f8fafc; margin-bottom:0.5rem;">
            <a href="/department/${d.id}" style="color:#38bdf8; text-decoration:none;">${escapeHtml(d.name)} (${d.code})</a>
          </h3>
          <p style="color:#94a3b8; font-size:0.875rem; line-height:1.5; margin-bottom:0.75rem;">${escapeHtml(d.description)}</p>
          ${d.id === 'mechanical' ? '<div style="margin-bottom:0.75rem;"><a href="https://mech.livesimulators.com" target="_blank" rel="noopener" style="color:#f59e0b; font-size:0.8rem; font-family:monospace; text-decoration:underline;">Advanced Turbomachinery &amp; Rotor Dynamics &rarr;</a></div>' : ''}
          <div style="font-family:monospace; color:#38bdf8; font-size:0.8rem; margin-bottom:0.75rem;">Core Formulation: ${renderMath(d.coreEquation, false)}</div>
          <div style="color:#64748b; font-size:0.75rem;">Active Simulators: ${d.activeSimulatorsCount} | Subfields: ${escapeHtml(d.subfields.join(', '))}</div>
        </article>
      `
      ).join('');

      const simListHtml = ALL_AVAILABLE_SIMULATORS.map(
        (s) => `
        <li style="margin-bottom:0.5rem;">
          <a href="/simulator/${s.id}" style="color:#38bdf8; text-decoration:none; font-weight:600;">${escapeHtml(s.title)}</a>
          <span style="color:#94a3b8; font-size:0.8rem;"> — ${escapeHtml(s.tagline)}</span>
        </li>
      `
      ).join('');

      return `
      <header style="max-width:72rem; margin:0 auto; padding:3rem 1.5rem;">
        <span style="font-family:monospace; font-size:0.75rem; color:#38bdf8; letter-spacing:0.1em;">SOLVER KERNEL ACTIVE • FLOAT64 REAL-TIME NUMERICAL RIGOR</span>
        <h1 style="font-size:2.5rem; font-weight:900; color:#ffffff; margin:1rem 0;">
          <span style="display:block; font-size:1rem; color:#38bdf8; font-family:monospace; margin-bottom:0.5rem; letter-spacing:0.05em;">LIVESIMULATORS • INTERACTIVE ENGINEERING SIMULATIONS</span>
          Don't Just Read Engineering. See It Happen.
        </h1>
        <p style="font-size:1.125rem; color:#cbd5e1; max-width:48rem; line-height:1.7;">
          Free interactive engineering simulations and virtual laboratories. Don't just read engineering — see it happen with real-time physics in your browser across electrical, mechanical, civil, and control disciplines.
        </p>
      </header>

      <main style="max-width:72rem; margin:0 auto; padding:0 1.5rem 4rem;">
        <section style="margin-bottom:3rem;">
          <h2 style="font-size:1.75rem; font-weight:800; color:#ffffff; margin-bottom:1.5rem;">Engineering Disciplines</h2>
          <div class="dept-grid">${deptListHtml}</div>
        </section>

        <section style="margin-bottom:3rem; padding:2rem; background:#0f172a; border-radius:1rem; border:1px solid #1e293b;">
          <h2 style="font-size:1.75rem; font-weight:800; color:#ffffff; margin-bottom:1rem;">Complete Interactive Simulation Library</h2>
          <p style="color:#94a3b8; margin-bottom:1.5rem; font-size:0.875rem;">Explore our comprehensive collection of first-principles client-side solvers:</p>
          <ul style="list-style-type:disc; padding-left:1.5rem; color:#94a3b8;">${simListHtml}</ul>
        </section>

        <section style="margin-bottom:3rem; padding:2rem; background:#0b1324; border-radius:1rem; border:1px solid #1e293b;">
          <h2 style="font-size:1.5rem; font-weight:bold; color:#ffffff; margin-bottom:1rem;">Platform Architecture & Numerical Integrity</h2>
          <p style="color:#cbd5e1; font-size:0.875rem; line-height:1.6; margin-bottom:1rem;">
            Every simulation executes directly inside the user's browser using 4th-Order Runge-Kutta (RK4) integration algorithms. Discrete parameter adjustments trigger continuous differential solutions evaluated at 60 frames per second without network lag.
          </p>
          <div style="font-family:monospace; font-size:0.8rem; color:#38bdf8;">
            STANDARDS: IEEE Std 1459, ASME MFC-3M, ISO 5167, IEC 60076, AISC 360, SI-CODATA 2022
          </div>
        </section>
      </main>
      `;
    }

    case 'department': {
      const dept = DISCIPLINES.find((d) => d.id === route.departmentId) || DISCIPLINES[0];
      const deptSims = ALL_AVAILABLE_SIMULATORS.filter((s) => s.discipline === dept.id);

      const simCardsHtml = deptSims.map(
        (s) => `
        <article style="border:1px solid #1e293b; padding:1.5rem; border-radius:1rem; margin-bottom:1.5rem; background:#0b1324;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span style="font-family:monospace; font-size:0.75rem; color:#38bdf8;">${escapeHtml(s.badge)}</span>
            <span style="font-family:monospace; font-size:0.75rem; color:#f59e0b;">${escapeHtml(s.difficulty)}</span>
          </div>
          <h3 style="font-size:1.35rem; font-weight:bold; color:#ffffff; margin-bottom:0.5rem;">
            <a href="/simulator/${s.id}" style="color:#ffffff; text-decoration:none;">${escapeHtml(s.title)}</a>
          </h3>
          <p style="color:#94a3b8; font-size:0.875rem; line-height:1.5; margin-bottom:0.75rem;">${escapeHtml(s.description)}</p>
          <div style="font-family:monospace; color:#38bdf8; font-size:0.8rem; margin-bottom:0.75rem;">Equation: ${renderMath(s.governingEquation, false)}</div>
          <div style="color:#64748b; font-size:0.75rem; margin-bottom:1rem;">Standard: ${escapeHtml(s.standardReference || 'IEEE/ASME Standard')}</div>
          <a href="/simulator/${s.id}" onclick="gtag('event', 'simulator_launch', {'simulator': '${escapeHtml(s.title).replace(/'/g, "\\'")}'});" style="display:inline-block; padding:0.5rem 1rem; background:#06b6d4; color:#030712; border-radius:0.5rem; font-weight:bold; text-decoration:none; font-size:0.8rem;">Launch Workbench &rarr;</a>
        </article>
      `
      ).join('');

      return `
      <div style="max-w:72rem; margin:0 auto; padding:2rem 1.5rem 4rem;">
        <nav style="font-family:monospace; font-size:0.8rem; color:#64748b; margin-bottom:2rem;">
          <a href="/" style="color:#38bdf8; text-decoration:none;">Home</a> / 
          <span style="color:#94a3b8;">${escapeHtml(dept.name)}</span>
        </nav>
        <header style="margin-bottom:3rem;">
          <span style="font-family:monospace; font-size:0.8rem; color:#38bdf8;">DEPARTMENT CODE: ${dept.code}</span>
          <h1 style="font-size:2.5rem; font-weight:900; color:#ffffff; margin:0.75rem 0;">${escapeHtml(dept.name)} Simulators Hub</h1>
          <p style="font-size:1.125rem; color:#cbd5e1; max-width:48rem; line-height:1.6;">${escapeHtml(dept.description)}</p>
          <div style="font-family:monospace; color:#38bdf8; font-size:0.9rem; margin-top:1rem; padding:1rem; background:#0f172a; border-radius:0.5rem; border:1px solid #1e293b;">
            Governing Formulation: ${renderMath(dept.coreEquation, false)}
          </div>
        </header>

        ${dept.id === 'electrical' ? `
        <section class="curriculum-track-section" aria-label="Curriculum Track: Circuit Theory I Lab Sequence" style="margin-top:2.5rem; margin-bottom:2.5rem; padding:1.75rem; background:linear-gradient(135deg, rgba(6,182,212,0.1) 0%, #0b1324 100%); border:1px solid rgba(6,182,212,0.4); border-radius:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; border-bottom:1px solid #1e293b; padding-bottom:1rem; margin-bottom:1.5rem;">
            <div>
              <span style="font-family:monospace; font-size:0.75rem; color:#38bdf8; text-transform:uppercase; letter-spacing:0.05em; font-weight:bold; background:#0f172a; padding:0.25rem 0.5rem; border-radius:0.25rem; border:1px solid rgba(6,182,212,0.3);">Curriculum Track • Related Concepts</span>
              <h2 style="font-size:1.5rem; font-weight:bold; color:#ffffff; margin:0.5rem 0 0 0;">
                <a href="/simulator/rlc-resonance" style="color:#38bdf8; text-decoration:underline;">Circuit Theory I Lab Sequence</a>
              </h2>
            </div>
            <p style="color:#94a3b8; font-size:0.875rem; max-width:32rem; margin:0; line-height:1.5;">
              Recommended progressive laboratory sequence spanning 2nd-order differential equations, active filtering, harmonic decomposition, and transmission line wave physics.
            </p>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem;">
            <div style="padding:1rem; background:#070d19; border:1px solid #1e293b; border-radius:0.5rem;">
              <span style="font-family:monospace; font-size:0.7rem; color:#64748b;">Step 01 • 2nd-Order ODE</span>
              <h3 style="font-size:0.95rem; margin:0.25rem 0;"><a href="/simulator/rlc-resonance" style="color:#ffffff; text-decoration:none; font-weight:bold;">RLC Circuit Resonance &rarr;</a></h3>
              <p style="color:#94a3b8; font-size:0.8rem; margin:0; line-height:1.4;">Series/parallel RLC frequency response, quality factor, and transient damping.</p>
            </div>
            <div style="padding:1rem; background:#070d19; border:1px solid #1e293b; border-radius:0.5rem;">
              <span style="font-family:monospace; font-size:0.7rem; color:#64748b;">Step 02 • Active Biquad</span>
              <h3 style="font-size:0.95rem; margin:0.25rem 0;"><a href="/simulator/sallen-key-filter" style="color:#ffffff; text-decoration:none; font-weight:bold;">Sallen-Key Active Filter &rarr;</a></h3>
              <p style="color:#94a3b8; font-size:0.8rem; margin:0; line-height:1.4;">Op-amp frequency selectivity, Butterworth vs Chebyshev peaking, and phase roll-off.</p>
            </div>
            <div style="padding:1rem; background:#070d19; border:1px solid #1e293b; border-radius:0.5rem;">
              <span style="font-family:monospace; font-size:0.7rem; color:#64748b;">Step 03 • Harmonic Theory</span>
              <h3 style="font-size:0.95rem; margin:0.25rem 0;"><a href="/simulator/fourier-synthesis" style="color:#ffffff; text-decoration:none; font-weight:bold;">Fourier Series Synthesis &rarr;</a></h3>
              <p style="color:#94a3b8; font-size:0.8rem; margin:0; line-height:1.4;">Harmonic decomposition of square and triangle waves, Gibbs phenomenon, and IEEE 519 THD.</p>
            </div>
            <div style="padding:1rem; background:#070d19; border:1px solid #1e293b; border-radius:0.5rem;">
              <span style="font-family:monospace; font-size:0.7rem; color:#64748b;">Step 04 • Wave Propagation</span>
              <h3 style="font-size:0.95rem; margin:0.25rem 0;"><a href="/simulator/transmission-line" style="color:#ffffff; text-decoration:none; font-weight:bold;">RF Transmission Line &rarr;</a></h3>
              <p style="color:#94a3b8; font-size:0.8rem; margin:0; line-height:1.4;">Distributed parameter telegrapher equations, impedance mismatch, and VSWR.</p>
            </div>
          </div>
        </section>
        ` : ''}

        ${dept.id === 'mechanical' ? `
        <section class="curriculum-track-section" aria-label="Curriculum Track: Mechanical Dynamics Sequence" style="margin-top:2.5rem; margin-bottom:2.5rem; padding:1.75rem; background:linear-gradient(135deg, rgba(245,158,11,0.1) 0%, #0b1324 100%); border:1px solid rgba(245,158,11,0.4); border-radius:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; border-bottom:1px solid #1e293b; padding-bottom:1rem; margin-bottom:1.5rem;">
            <div>
              <span style="font-family:monospace; font-size:0.75rem; color:#f59e0b; text-transform:uppercase; letter-spacing:0.05em; font-weight:bold; background:#0f172a; padding:0.25rem 0.5rem; border-radius:0.25rem; border:1px solid rgba(245,158,11,0.3);">Curriculum Track • Related Concepts</span>
              <h2 style="font-size:1.5rem; font-weight:bold; color:#ffffff; margin:0.5rem 0 0 0;">
                <a href="/simulator/harmonic-oscillator" style="color:#f59e0b; text-decoration:underline;">Mechanical Dynamics Sequence</a>
              </h2>
            </div>
            <p style="color:#94a3b8; font-size:0.875rem; max-width:32rem; margin:0; line-height:1.5;">
              Progressive mechanical engineering sequence connecting single-degree-of-freedom vibrations to multi-bar linkage kinematics, machine gearing, and thermodynamic steam cycles.
            </p>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem;">
            <div style="padding:1rem; background:#070d19; border:1px solid #1e293b; border-radius:0.5rem;">
              <span style="font-family:monospace; font-size:0.7rem; color:#64748b;">Step 01 • Vibrations &amp; SDOF</span>
              <h3 style="font-size:0.95rem; margin:0.25rem 0;"><a href="/simulator/harmonic-oscillator" style="color:#ffffff; text-decoration:none; font-weight:bold;">Harmonic Oscillator &rarr;</a></h3>
              <p style="color:#94a3b8; font-size:0.8rem; margin:0; line-height:1.4;">Mass-spring-damper resonance, dynamic magnification factor M(ω), and 90° phase shift.</p>
            </div>
            <div style="padding:1rem; background:#070d19; border:1px solid #1e293b; border-radius:0.5rem;">
              <span style="font-family:monospace; font-size:0.7rem; color:#64748b;">Step 02 • Planar Kinematics</span>
              <h3 style="font-size:0.95rem; margin:0.25rem 0;"><a href="/simulator/four-bar-mechanism" style="color:#ffffff; text-decoration:none; font-weight:bold;">4-Bar Mechanism &rarr;</a></h3>
              <p style="color:#94a3b8; font-size:0.8rem; margin:0; line-height:1.4;">Grashof mobility criterion, Freudenstein loop closure, and transmission angle tracking.</p>
            </div>
            <div style="padding:1rem; background:#070d19; border:1px solid #1e293b; border-radius:0.5rem;">
              <span style="font-family:monospace; font-size:0.7rem; color:#64748b;">Step 03 • Machine Elements</span>
              <h3 style="font-size:0.95rem; margin:0.25rem 0;"><a href="/simulator/spur-gear-mesh" style="color:#ffffff; text-decoration:none; font-weight:bold;">Spur Gear Mesh &rarr;</a></h3>
              <p style="color:#94a3b8; font-size:0.8rem; margin:0; line-height:1.4;">Conjugate involute tooth action, pitch line velocity, and AGMA 2001 contact ratio.</p>
            </div>
            <div style="padding:1rem; background:#070d19; border:1px solid #1e293b; border-radius:0.5rem;">
              <span style="font-family:monospace; font-size:0.7rem; color:#64748b;">Step 04 • Thermodynamics</span>
              <h3 style="font-size:0.95rem; margin:0.25rem 0;"><a href="/simulator/rankine-cycle" style="color:#ffffff; text-decoration:none; font-weight:bold;">Rankine Cycle &rarr;</a></h3>
              <p style="color:#94a3b8; font-size:0.8rem; margin:0; line-height:1.4;">Steam boiler heat addition, non-isentropic turbine expansion, and thermal efficiency on T-s diagrams.</p>
            </div>
          </div>
        </section>
        ` : ''}

        ${dept.id === 'mechanical' ? `
        <section style="margin-top:3rem; padding:2rem; background:linear-gradient(135deg, rgba(120,53,15,0.3), #0b1324); border-radius:1rem; border:1px solid rgba(245,158,11,0.4);">
          <span style="font-family:monospace; font-size:0.75rem; color:#f59e0b; text-transform:uppercase; letter-spacing:0.05em; font-weight:bold;">Specialized Subdomain Workbench • API 610 / 617 / 618 Ref • ASME B31.3 Ref • AGMA 2001 Ref</span>
          <h2 style="font-size:1.75rem; font-weight:bold; color:#ffffff; margin:0.75rem 0;">Advanced Mechanical Digital Twins</h2>
          <p style="color:#cbd5e1; font-size:0.95rem; line-height:1.6; margin-bottom:1rem; max-width:48rem;">
            For full-fidelity turbomachinery, rotor dynamics, and industrial process simulations referencing published methodologies from API 610, API 617, API 618, ASME B31.3, and AGMA standards literature for educational and technical exploration, visit our dedicated mechanical engineering workbench.
          </p>
          <div style="font-family:monospace; font-size:0.75rem; color:#94a3b8; margin-bottom:1.5rem; line-height:1.5; border-top:1px solid rgba(245,158,11,0.2); padding-top:0.75rem;">
            Non-Affiliation Notice: All standard designations (API, ASME, AGMA, ISO, IEEE) are cited strictly for technical identification and academic literature context under nominative fair use. LiveSimulators is an independent educational platform and is not affiliated with, endorsed by, certified by, or sponsored by any standards organization, nor does it claim copyright in published standards.
          </div>
          <a href="https://mech.livesimulators.com" target="_blank" rel="noopener" style="display:inline-block; padding:0.75rem 1.5rem; background:#f59e0b; color:#030712; border-radius:0.5rem; font-weight:bold; text-decoration:none; font-size:0.9rem;">
            Launch Mechanical Digital Twins &rarr;
          </a>
        </section>
        ` : ''}
      </div>
      `;
    }

    case 'simulator': {
      const sim = ALL_AVAILABLE_SIMULATORS.find((s) => s.id === route.simulatorId) || ALL_AVAILABLE_SIMULATORS[0];
      const dept = DISCIPLINES.find((d) => d.id === sim.discipline);
      const theory = getEngineeringTheory(sim);

      const paramsHtml = sim.parameters.map(
        (p) => `
        <tr>
          <td style="padding:0.75rem; border-bottom:1px solid #1e293b; font-family:monospace; color:#38bdf8;">${escapeHtml(p.name)} (${p.symbol})</td>
          <td style="padding:0.75rem; border-bottom:1px solid #1e293b; font-family:monospace; color:#f8fafc;">${p.default} ${p.unit}</td>
          <td style="padding:0.75rem; border-bottom:1px solid #1e293b; font-family:monospace; color:#94a3b8;">${p.min} to ${p.max} ${p.unit}</td>
          <td style="padding:0.75rem; border-bottom:1px solid #1e293b; color:#cbd5e1; font-size:0.8rem;">${escapeHtml(p.description)}</td>
        </tr>
      `
      ).join('');

      // Formulate Accessible KaTeX / MathML Equations
      const equationsHtml = theory.governingEquations.map((eq) => {
        const katexHtml = renderMath(eq.latex, true);

        const varListHtml = eq.variables && eq.variables.length > 0
          ? `
          <div style="margin-top:0.75rem; font-size:0.8rem; font-family:monospace; color:#94a3b8;">
            <div style="font-weight:bold; color:#cbd5e1; margin-bottom:0.25rem;">Variable Definitions:</div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:0.4rem;">
              ${eq.variables.map(v => `<div style="padding:0.35rem 0.5rem; background:#0f172a; border-radius:0.25rem; border:1px solid #1e293b;"><strong style="color:#38bdf8;">${escapeHtml(v.symbol)}</strong>: ${escapeHtml(v.name)} ${v.unit ? `[${escapeHtml(v.unit)}]` : ''} — <span style="color:#64748b;">${escapeHtml(v.description)}</span></div>`).join('')}
            </div>
          </div>`
          : '';

        return `
        <div style="margin-bottom:1.25rem; padding:1.25rem; background:#0b1324; border:1px solid #1e293b; border-radius:0.75rem;">
          <h3 style="font-size:1rem; font-weight:bold; color:#38bdf8; font-family:monospace; margin-bottom:0.5rem;">${escapeHtml(eq.title)}</h3>
          <div style="margin:0.75rem 0; overflow-x:auto;">${katexHtml}</div>
          <p style="color:#cbd5e1; font-size:0.875rem; line-height:1.6; margin-bottom:0.5rem;">${escapeHtml(eq.description)}</p>
          ${varListHtml}
        </div>
        `;
      }).join('');

      // Assumptions & Limitations HTML
      const assumptionsHtml = theory.assumptions.map(a => `<li style="margin-bottom:0.5rem;"><strong style="color:#fbbf24;">•</strong> ${escapeHtml(a)}</li>`).join('');
      const limitationsHtml = theory.limitations.map(l => `<li style="margin-bottom:0.5rem;"><strong style="color:#f43f5e;">•</strong> ${escapeHtml(l)}</li>`).join('');

      // Step-by-Step Calculator Example HTML
      const givenInputsHtml = theory.stepByStepExample.givenInputs.map(inp => `
        <div style="padding:0.5rem; background:#0f172a; border:1px solid #1e293b; border-radius:0.375rem; font-family:monospace; font-size:0.8rem;">
          <div style="color:#94a3b8; font-size:0.75rem;">${escapeHtml(inp.parameter)}</div>
          <div style="color:#38bdf8; font-weight:bold;">${escapeHtml(inp.symbol)} = ${escapeHtml(inp.value)}</div>
        </div>
      `).join('');

      const stepsHtml = theory.stepByStepExample.steps.map(st => {
        const stepKatex = renderMath(st.formulaLatex, true);
        const substHtml = renderMath(st.substitution, false);
        const resultHtml = renderMath(st.stepResult, false);
        return `
        <div style="margin-bottom:1rem; padding:1rem; background:#0b1324; border:1px solid #1e293b; border-radius:0.75rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; flex-wrap:wrap; gap:0.5rem;">
            <h4 style="font-size:0.95rem; font-weight:bold; color:#10b981; font-family:monospace; margin:0;">Step ${st.stepNumber}: ${escapeHtml(st.stepTitle)}</h4>
            <span style="font-size:0.75rem; font-family:monospace; color:#64748b; background:#0f172a; padding:0.2rem 0.5rem; border-radius:0.25rem;">Step ${st.stepNumber} of ${theory.stepByStepExample.steps.length}</span>
          </div>
          <div style="margin:0.5rem 0; overflow-x:auto;">${stepKatex}</div>
          <div style="padding:0.6rem; background:#070d19; border-radius:0.375rem; font-family:monospace; font-size:0.8rem; color:#cbd5e1; margin-bottom:0.5rem;">
            <div style="color:#64748b; font-size:0.7rem; text-transform:uppercase;">Numerical Substitution:</div>
            <div style="color:#f8fafc; margin:0.25rem 0;">${substHtml}</div>
            <div style="color:#34d399; font-weight:bold;">Result: ${resultHtml}</div>
          </div>
          <p style="font-size:0.8rem; color:#94a3b8; line-height:1.5; margin:0;">${escapeHtml(st.explanation)}</p>
        </div>
        `;
      }).join('');

      return `
      <article class="engineering-theory-formulas" itemscope itemtype="https://schema.org/TechArticle" style="max-width:72rem; margin:0 auto; padding:2rem 1.5rem 4rem;">
        <nav style="font-family:monospace; font-size:0.8rem; color:#64748b; margin-bottom:1.5rem;">
          <a href="/" style="color:#38bdf8; text-decoration:none;">Home</a> / 
          <a href="/department/${dept ? dept.id : 'electrical'}" style="color:#38bdf8; text-decoration:none;">${escapeHtml(dept ? dept.name : sim.disciplineName)}</a> / 
          <span style="color:#94a3b8;">${escapeHtml(sim.title)}</span>
        </nav>

        <header style="margin-bottom:2.5rem;">
          <div style="display:flex; gap:0.5rem; margin-bottom:0.75rem; flex-wrap:wrap;">
            <span style="padding:0.25rem 0.5rem; background:#0369a1; color:#ffffff; font-family:monospace; font-size:0.75rem; border-radius:0.25rem;">${escapeHtml(sim.badge)}</span>
            <span style="padding:0.25rem 0.5rem; background:#065f46; color:#ffffff; font-family:monospace; font-size:0.75rem; border-radius:0.25rem;">${escapeHtml(sim.difficulty)}</span>
            <span style="padding:0.25rem 0.5rem; background:#1e293b; color:#cbd5e1; font-family:monospace; font-size:0.75rem; border-radius:0.25rem;">${escapeHtml(sim.disciplineName)}</span>
          </div>
          <h1 style="font-size:2.5rem; font-weight:900; color:#ffffff; margin-bottom:0.75rem;">${escapeHtml(sim.title)}</h1>
          <p style="font-size:1.15rem; color:#38bdf8; font-weight:600; margin-bottom:1rem;">${escapeHtml(sim.tagline)}</p>
          <p style="font-size:1rem; color:#cbd5e1; line-height:1.6; max-width:54rem;">${escapeHtml(sim.description)}</p>
        </header>

        ${TOP_FLAGSHIP_EMBED_SLUGS.includes(sim.id as any) ? `
        <!-- Embed this lab section for flagship simulators (Prompt Requirements 1-3) -->
        <details class="embed-lab-details" style="margin-bottom:2rem; padding:1rem 1.25rem; background:#0b1324; border:1px solid rgba(168,85,247,0.4); border-radius:0.75rem; box-shadow:0 4px 15px rgba(0,0,0,0.3);">
          <summary style="font-size:1rem; font-weight:700; color:#c084fc; cursor:pointer; font-family:monospace; user-select:none;">
            Embed this lab
          </summary>
          <div style="margin-top:0.75rem;">
            <p style="font-size:0.85rem; color:#94a3b8; margin-bottom:0.5rem; line-height:1.4;">
              Copy and paste the HTML snippet below to embed this interactive first-principles simulator directly into Canvas, Moodle, Blackboard, or course websites:
            </p>
            <textarea readonly rows="3" onclick="this.select(); document.execCommand('copy'); gtag('event', 'embed_copy', {'simulator': '${escapeHtml(sim.title).replace(/'/g, "\\'")}'});" style="width:100%; box-sizing:border-box; background:#030712; color:#c084fc; border:1px solid #1e293b; border-radius:0.5rem; padding:0.6rem 0.75rem; font-family:monospace; font-size:0.8rem; line-height:1.4; resize:vertical; cursor:pointer;"><iframe src="https://livesimulators.com/simulator/${sim.id}?embed=1" width="100%" height="600" frameborder="0" title="${escapeHtml(sim.title)}"></iframe></textarea>
            <p style="font-size:0.8rem; color:#cbd5e1; margin-top:0.4rem; margin-bottom:0;">
              Please credit LiveSimulators when embedding in your course materials.
            </p>
          </div>
        </details>
        ` : ''}

        <!-- Interactive 60 FPS Physics Canvas Stage (Initial Payload Dimensions prevent CLS) -->
        <div class="simulator-canvas-stage" style="width:100%; aspect-ratio:16/9; max-height:540px; background:#060b13; border:1px solid #1e293b; border-radius:1rem; position:relative; overflow:hidden; margin-bottom:2.5rem;">
          <canvas width="1200" height="675" style="width:100%; height:100%; aspect-ratio:16/9; display:block; background:#060b13;"></canvas>
          <div style="position:absolute; bottom:1rem; left:1rem; font-family:monospace; font-size:0.75rem; color:#38bdf8; background:rgba(3,7,18,0.85); padding:0.35rem 0.75rem; border-radius:0.375rem; border:1px solid #1e293b;">
            FLOAT64 NUMERICAL RK4 SOLVER ACTIVE • 60 FPS CANVAS
          </div>
        </div>

        <!-- REUSABLE ENGINEERING THEORY, GOVERNING FORMULAS & STEP-BY-STEP CALCULATOR GUIDE -->
        <details open class="theory-formulas-accordion" style="margin-bottom:2.5rem; padding:1.5rem; background:#070d19; border:1px solid #0284c7; border-radius:1rem; box-shadow:0 10px 25px -5px rgba(0,0,0,0.5);">
          <summary style="font-size:1.35rem; font-weight:900; color:#38bdf8; cursor:pointer; margin-bottom:1.25rem; user-select:none; font-family:monospace;">
            📘 Engineering Theory, Governing Formulas &amp; Step-by-Step Calculation Guide
          </summary>

          <div style="margin-top:1.5rem; space-y:2rem;">
            <!-- 1. Governing Equations & MathML / KaTeX Mathematical Formulation -->
            <section style="margin-bottom:2rem;">
              <h2 style="font-size:1.35rem; font-weight:bold; color:#ffffff; font-family:monospace; margin-bottom:1rem; border-bottom:1px solid #1e293b; padding-bottom:0.5rem;">
                <span style="color:#38bdf8;">1.</span> Governing Equations &amp; Mathematical Formulation
              </h2>
              ${equationsHtml}

              ${sim.analyticalProof ? `
              <div style="margin-top:1rem; padding:1rem; background:#0f172a; border-radius:0.5rem; border:1px solid #1e293b;">
                <div style="font-size:0.85rem; font-weight:bold; color:#38bdf8; margin-bottom:0.5rem; font-family:monospace;">ANALYTICAL PROOF &amp; FIRST-PRINCIPLES DERIVATION:</div>
                <p style="color:#cbd5e1; font-size:0.875rem; line-height:1.6; margin:0;">${escapeHtml(sim.analyticalProof)}</p>
              </div>` : ''}
            </section>

            <!-- 2. Engineering Assumptions & Operational Limitations -->
            <section style="margin-bottom:2rem;">
              <h2 style="font-size:1.35rem; font-weight:bold; color:#ffffff; font-family:monospace; margin-bottom:1rem; border-bottom:1px solid #1e293b; padding-bottom:0.5rem;">
                <span style="color:#fbbf24;">2.</span> Engineering Assumptions &amp; Operational Limitations
              </h2>
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:1rem;">
                <div style="padding:1.25rem; background:#0b1324; border:1px solid #1e293b; border-radius:0.75rem;">
                  <h3 style="font-size:0.95rem; font-weight:bold; color:#fbbf24; font-family:monospace; margin-bottom:0.75rem;">Physical &amp; Numerical Assumptions</h3>
                  <ul style="list-style:none; padding-left:0; margin:0; font-size:0.85rem; color:#cbd5e1; line-height:1.6;">
                    ${assumptionsHtml}
                  </ul>
                </div>
                <div style="padding:1.25rem; background:#0b1324; border:1px solid #1e293b; border-radius:0.75rem;">
                  <h3 style="font-size:0.95rem; font-weight:bold; color:#f43f5e; font-family:monospace; margin-bottom:0.75rem;">Operational Boundaries &amp; Limitations</h3>
                  <ul style="list-style:none; padding-left:0; margin:0; font-size:0.85rem; color:#cbd5e1; line-height:1.6;">
                    ${limitationsHtml}
                  </ul>
                </div>
              </div>
            </section>

            <!-- 3. Step-by-Step Calculation Example & Calculator Guide -->
            <section style="margin-bottom:2rem;">
              <h2 style="font-size:1.35rem; font-weight:bold; color:#ffffff; font-family:monospace; margin-bottom:1rem; border-bottom:1px solid #1e293b; padding-bottom:0.5rem;">
                <span style="color:#34d399;">3.</span> Step-by-Step Calculation Example (${escapeHtml(sim.title)} Calculator)
              </h2>
              <p style="color:#cbd5e1; font-size:0.9rem; line-height:1.6; margin-bottom:1rem;">
                ${escapeHtml(theory.stepByStepExample.summary)}
              </p>

              <!-- Given Nominal Inputs -->
              <div style="margin-bottom:1.25rem; padding:1rem; background:#0b1324; border:1px solid #1e293b; border-radius:0.75rem;">
                <div style="font-size:0.8rem; font-weight:bold; font-family:monospace; color:#94a3b8; text-transform:uppercase; margin-bottom:0.5rem;">
                  Given Nominal Input Parameters:
                </div>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.5rem;">
                  ${givenInputsHtml}
                </div>
              </div>

              <!-- Calculation Steps -->
              <div>
                ${stepsHtml}
              </div>

              <!-- Final Solved Output Result Callout -->
              <div style="margin-top:1rem; padding:1.25rem; background:linear-gradient(135deg, rgba(6,78,59,0.3) 0%, rgba(11,19,36,0.9) 100%); border:1px solid #059669; border-radius:0.75rem;">
                <div style="font-size:0.8rem; font-weight:bold; font-family:monospace; color:#34d399; text-transform:uppercase;">
                  Calculated Output: ${escapeHtml(theory.stepByStepExample.finalAnswer.metric)}
                </div>
                <div style="font-size:1.5rem; font-weight:900; font-family:monospace; color:#ffffff; margin:0.35rem 0;">
                  ${escapeHtml(theory.stepByStepExample.finalAnswer.value)}
                </div>
                <p style="color:#cbd5e1; font-size:0.85rem; line-height:1.6; margin:0;">
                  ${escapeHtml(theory.stepByStepExample.finalAnswer.physicalMeaning)}
                </p>
                ${theory.stepByStepExample.benchmarkVerification ? `
                <div style="margin-top:0.5rem; padding-top:0.5rem; border-top:1px solid rgba(5,150,105,0.3); font-size:0.8rem; font-family:monospace; color:#34d399;">
                  ${escapeHtml(theory.stepByStepExample.benchmarkVerification)}
                </div>` : ''}
              </div>
            </section>

            <!-- 4. Referenced Engineering Standards & Verification -->
            <section style="margin-bottom:2rem;">
              <h2 style="font-size:1.25rem; font-weight:bold; color:#ffffff; font-family:monospace; margin-bottom:0.75rem;">
                <span style="color:#06b6d4;">4.</span> Referenced Engineering Standards &amp; Verification
              </h2>
              <div style="padding:1rem; background:#0b1324; border:1px solid #1e293b; border-radius:0.5rem;">
                <div style="font-size:0.9rem; font-weight:bold; color:#34d399; font-family:monospace;">
                  STANDARD: ${escapeHtml(sim.standardReference || sim.badge)}
                </div>
                <div style="font-size:0.8rem; color:#94a3b8; margin-top:0.25rem;">
                  Referenced Body: ${escapeHtml(sim.standardBody || 'ISO / IEC / IEEE / AISC Literature')}
                </div>
                ${sim.colorStandardRule ? `
                <div style="margin-top:0.5rem; font-family:monospace; font-size:0.8rem; color:#cbd5e1;">
                  Color Rule: ${escapeHtml(sim.colorStandardRule)}
                </div>` : ''}
              </div>
            </section>

            <!-- 5. Adjustable System Parameters & Dynamic Range -->
            <section style="margin-bottom:2rem;">
              <h2 style="font-size:1.25rem; font-weight:bold; color:#ffffff; font-family:monospace; margin-bottom:0.75rem;">
                <span style="color:#cbd5e1;">5.</span> Adjustable System Parameters &amp; Dynamic Range
              </h2>
              <table style="width:100%; border-collapse:collapse; text-align:left; background:#0b1324; border:1px solid #1e293b; border-radius:0.5rem; overflow:hidden;">
                <thead style="background:#0f172a; color:#f8fafc; font-size:0.8rem; font-family:monospace;">
                  <tr>
                    <th style="padding:0.75rem; border-bottom:1px solid #1e293b;">Parameter</th>
                    <th style="padding:0.75rem; border-bottom:1px solid #1e293b;">Nominal Value</th>
                    <th style="padding:0.75rem; border-bottom:1px solid #1e293b;">Dynamic Range</th>
                    <th style="padding:0.75rem; border-bottom:1px solid #1e293b;">Physical Role</th>
                  </tr>
                </thead>
                <tbody>${paramsHtml}</tbody>
              </table>
            </section>

            ${sim.courseMapping ? `
            <!-- 6. University Syllabus & Curriculum Mapping -->
            <section style="margin-bottom:2rem;">
              <h2 style="font-size:1.25rem; font-weight:bold; color:#ffffff; font-family:monospace; margin-bottom:0.75rem;">
                <span style="color:#a855f7;">6.</span> University Syllabus &amp; Curriculum Mapping
              </h2>
              <div style="padding:1rem; background:#0b1324; border:1px solid #1e293b; border-radius:0.5rem;">
                <p style="color:#38bdf8; font-family:monospace; font-size:0.9rem; margin:0 0 0.5rem 0;">${escapeHtml(sim.courseMapping)}</p>
                ${sim.textbookReferences ? `<p style="color:#94a3b8; font-size:0.85rem; margin:0;">Standard References: ${escapeHtml(sim.textbookReferences)}</p>` : ''}
              </div>
            </section>` : ''}

            ${sim.faqs && sim.faqs.length > 0 ? `
            <!-- 7. Frequently Asked Technical Questions -->
            <section style="margin-bottom:1rem;">
              <h2 style="font-size:1.25rem; font-weight:bold; color:#ffffff; font-family:monospace; margin-bottom:0.75rem;">
                <span style="color:#38bdf8;">7.</span> Frequently Asked Technical Questions
              </h2>
              ${sim.faqs.map(f => `
                <div style="margin-bottom:1rem; padding:1rem; background:#0b1324; border:1px solid #1e293b; border-radius:0.5rem;">
                  <h3 style="font-size:0.95rem; font-weight:bold; color:#f8fafc; margin-bottom:0.4rem;">${escapeHtml(f.question)}</h3>
                  <p style="font-size:0.85rem; color:#94a3b8; line-height:1.6; margin:0;">${escapeHtml(f.answer)}</p>
                </div>
              `).join('')}
            </section>` : ''}
            <!-- Telemetry & Student Lab Tools -->
            <section style="margin-top:1.5rem; padding:1.25rem; background:#0b1324; border:1px solid #1e293b; border-radius:0.75rem; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:1rem;">
              <div>
                <div style="font-size:0.9rem; font-weight:bold; color:#ffffff; font-family:monospace;">Laboratory Submission &amp; LMS Integration</div>
                <div style="font-size:0.8rem; color:#94a3b8; margin-top:0.25rem;">Download calculation worksheet or embed this 60 FPS simulator directly into Canvas / Moodle.</div>
              </div>
              <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
                <button type="button" onclick="gtag('event', 'worksheet_download', {'simulator': '${escapeHtml(sim.title).replace(/'/g, "\\'")}'}); window.print();" style="padding:0.5rem 1rem; background:#881337; color:#fecdd3; border:1px solid #e11d48; border-radius:0.5rem; font-size:0.8rem; font-weight:bold; cursor:pointer;">
                  Worksheet PDF 🖨️
                </button>
                <button type="button" onclick="gtag('event', 'embed_copy', {'simulator': '${escapeHtml(sim.title).replace(/'/g, "\\'")}'}); navigator.clipboard.writeText('<iframe src=&quot;https://livesimulators.com/embed/${sim.id}&quot; width=&quot;100%&quot; height=&quot;650&quot; style=&quot;border:1px solid #1e293b; border-radius:12px;&quot; allow=&quot;fullscreen&quot;></iframe>'); alert('LMS embed code copied to clipboard!');" style="padding:0.5rem 1rem; background:#581c87; color:#f3e8ff; border:1px solid #a855f7; border-radius:0.5rem; font-size:0.8rem; font-weight:bold; cursor:pointer;">
                  Copy LMS Embed Code 📋
                </button>
              </div>
            </section>
          </div>
        </details>

        <!-- Related Concepts & Cross-Discipline Equivalents Section -->
        ${(() => {
          const equivalents = getCrossDisciplineEquivalents(sim.id);
          if (equivalents.length === 0) return '';
          return `
          <section class="related-concepts-section" aria-label="Related Physics Concepts" style="margin-bottom:2.5rem; padding:1.5rem; background:#070d19; border:1px solid rgba(6,182,212,0.4); border-radius:1rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:0.75rem; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.5rem;">
              <h2 style="font-size:1.25rem; font-weight:bold; color:#ffffff; font-family:monospace; margin:0; display:flex; align-items:center; gap:0.5rem;">
                <span style="color:#38bdf8;">Related Concepts</span> • <span style="font-size:0.85rem; color:#94a3b8; font-weight:normal;">Cross-Discipline Isomorphisms</span>
              </h2>
              <span style="font-family:monospace; font-size:0.75rem; color:#38bdf8; background:rgba(6,182,212,0.1); padding:0.25rem 0.5rem; border-radius:0.25rem; border:1px solid rgba(6,182,212,0.3);">
                Shared Differential Equation Structure
              </span>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:1rem;">
              ${equivalents.map(eq => {
                const targetSim = ALL_AVAILABLE_SIMULATORS.find(s => s.id === eq.targetSimulatorId);
                return `
                <div style="padding:1.25rem; background:#0b1324; border:1px solid #1e293b; border-radius:0.75rem; display:flex; flex-direction:column; justify-content:space-between;">
                  <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                      <span style="font-family:monospace; font-size:0.75rem; color:#34d399; background:rgba(16,185,129,0.1); padding:0.2rem 0.5rem; border-radius:0.25rem;">${escapeHtml(eq.relationshipType)}</span>
                      ${targetSim ? `<span style="font-family:monospace; font-size:0.75rem; color:#94a3b8;">${escapeHtml(targetSim.disciplineName)}</span>` : ''}
                    </div>
                    <h3 style="font-size:1rem; font-weight:bold; margin:0.25rem 0 0.5rem 0;">
                      <a href="/simulator/${eq.targetSimulatorId}" style="color:#38bdf8; text-decoration:none; display:inline-flex; align-items:center; gap:0.35rem;">
                        ${escapeHtml(eq.anchorText)} &rarr;
                      </a>
                    </h3>
                    <p style="color:#cbd5e1; font-size:0.85rem; line-height:1.5; margin:0;">
                      ${escapeHtml(eq.subtitle)}
                    </p>
                  </div>
                  ${eq.sharedMathematicalLaw ? `
                  <div style="margin-top:0.75rem; padding-top:0.5rem; border-top:1px solid #1e293b; font-family:monospace; font-size:0.75rem; color:#64748b;">
                    Governing Law: <span style="color:#94a3b8;">${escapeHtml(eq.sharedMathematicalLaw)}</span>
                  </div>` : ''}
                </div>
                `;
              }).join('')}
            </div>
          </section>
          `;
        })()}

        <!-- How to cite this simulator section immediately above footer -->
        <section class="citation-section" aria-label="How to cite this simulator" style="margin-top:2.5rem; margin-bottom:2rem; padding:1.5rem; background:#0b1324; border:1px solid #1e293b; border-radius:0.75rem;">
          <h3 style="font-size:1.25rem; font-weight:bold; color:#ffffff; font-family:monospace; margin:0 0 0.75rem 0;">How to cite this simulator</h3>
          <p style="color:#cbd5e1; font-size:0.875rem; line-height:1.6; margin-bottom:1rem;">
            Sharma, A. (${new Date().getFullYear()}). ${escapeHtml(sim.title)}. LiveSimulators. Retrieved from https://livesimulators.com/simulator/${sim.id}
          </p>
          <div style="position:relative; margin-bottom:1rem;">
            <pre style="background:#030712; border:1px solid #1e293b; border-radius:0.5rem; padding:1rem; overflow-x:auto; margin:0;"><code class="bibtex" style="font-family:monospace; font-size:0.8rem; color:#38bdf8;">@misc{livesimulators_${sim.id.replace(/-/g, '_')}_${new Date().getFullYear()},
  author = {Sharma, A.},
  title = {{${escapeHtml(sim.title)}}},
  year = {${new Date().getFullYear()}},
  howpublished = {LiveSimulators},
  url = {https://livesimulators.com/simulator/${sim.id}}
}</code></pre>
          </div>
          <button type="button" onclick="navigator.clipboard.writeText(&quot;@misc{livesimulators_${sim.id.replace(/-/g, '_')}_${new Date().getFullYear()},\\n  author = {Sharma, A.},\\n  title = {{${escapeHtml(sim.title).replace(/"/g, '\\"')}}},\\n  year = {${new Date().getFullYear()}},\\n  howpublished = {LiveSimulators},\\n  url = {https://livesimulators.com/simulator/${sim.id}}\\n}&quot;); gtag('event', 'cite_copy', {'simulator': '${escapeHtml(sim.title).replace(/'/g, "\\'")}'}); alert('Citation copied to clipboard!');" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.5rem 1rem; background:#0284c7; color:#ffffff; border:none; border-radius:0.5rem; font-weight:bold; font-size:0.8rem; cursor:pointer;">
            Copy citation
          </button>
        </section>

        <!-- Pre-rendered Semantic Footer -->
        <footer style="margin-top:2.5rem; padding-top:2rem; border-top:1px solid #1e293b; color:#64748b; font-size:0.8rem; display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:1rem;">
          <div>
            <strong style="color:#ffffff;">LiveSimulators</strong> — Browser-based first-principles engineering simulators. © ${new Date().getFullYear()}.
          </div>
          <div style="display:flex; gap:1.25rem; flex-wrap:wrap;">
            <a href="/" style="color:#94a3b8; text-decoration:none;">Home</a>
            <a href="/about" style="color:#94a3b8; text-decoration:none;">About</a>
            <a href="/about/methodology.html" style="color:#38bdf8; text-decoration:none;">Methodology &amp; Verification</a>
            <a href="/contact" style="color:#94a3b8; text-decoration:none;">Contact</a>
            <a href="/privacy-policy" style="color:#94a3b8; text-decoration:none;">Privacy Policy</a>
            <a href="/terms" style="color:#94a3b8; text-decoration:none;">Terms</a>
          </div>
        </footer>
      </article>
      `;
    }

    case 'embed': {
      const sim = ALL_AVAILABLE_SIMULATORS.find((s) => s.id === route.simulatorId) || ALL_AVAILABLE_SIMULATORS[0];
      return `
      <div style="font-family:sans-serif; background:#030712; color:#f8fafc; padding:1.5rem; border-radius:0.75rem; min-height:100vh;">
        <header style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #1e293b; padding-bottom:1rem; margin-bottom:1.5rem;">
          <div>
            <span style="font-family:monospace; font-size:0.75rem; color:#38bdf8; letter-spacing:0.05em;">LIVESIMULATORS • VIRTUAL LAB EMBED</span>
            <h1 style="font-size:1.5rem; font-weight:800; color:#ffffff; margin:0.25rem 0;">${escapeHtml(sim.title)}</h1>
          </div>
          <a href="/simulator/${sim.id}" onclick="gtag('event', 'simulator_launch', {'simulator': '${escapeHtml(sim.title).replace(/'/g, "\\'")}'});" target="_blank" rel="noopener noreferrer" style="font-size:0.85rem; font-weight:bold; color:#06b6d4; text-decoration:none; padding:0.4rem 0.8rem; background:#0f172a; border:1px solid #1e293b; border-radius:0.5rem;">Launch Full Lab ↗</a>
        </header>
        <p style="color:#cbd5e1; font-size:0.9rem; line-height:1.6; margin-bottom:1rem;">${escapeHtml(sim.description)}</p>
        <div style="font-family:monospace; color:#38bdf8; font-size:0.9rem; padding:0.75rem; background:#0f172a; border-radius:0.5rem; margin-bottom:1rem;">
          ${renderMath(sim.governingEquation, false)}
        </div>
        <p style="color:#64748b; font-size:0.8rem;">Physical Law: ${escapeHtml(sim.physicalLaw)} | Reference: ${escapeHtml(sim.standardReference || 'Standard Reference')}</p>
      </div>
      `;
    }

    case 'about': {
      return `
      <div style="max-width:64rem; margin:0 auto; padding:3rem 1.5rem 4rem;">
        <nav style="font-family:monospace; font-size:0.8rem; color:#64748b; margin-bottom:2rem;">
          <a href="/" style="color:#38bdf8; text-decoration:none;">Home</a> / <span style="color:#94a3b8;">About Us</span>
        </nav>
        <h1 style="font-size:2.5rem; font-weight:900; color:#ffffff; margin-bottom:1rem;">About LiveSimulators</h1>
        <p style="font-size:1.25rem; color:#38bdf8; font-weight:600; margin-bottom:1.5rem;">"Don't Just Read Engineering. See It Happen."</p>
        <div style="color:#cbd5e1; font-size:1rem; line-height:1.7; space-y:1.5rem;">
          <p style="margin-bottom:1.25rem;">
            Traditional engineering education suffers from an abstraction gap: students spend hundreds of hours manipulating complex differential equations, boundary integrals, and Laplace transforms without developing physical intuition for dynamic states.
          </p>
          <p style="margin-bottom:1.25rem;">
            LiveSimulators closes this gap by implementing client-side Float64 numerical integrators (4th-Order Runge-Kutta RK4) running at 60 FPS in standard modern web browsers.
          </p>
          <p style="margin-bottom:1.25rem;">
            Founded by <strong>Anil Sharma</strong> (Founder & Lead Computational Modeling Engineer), LiveSimulators is dedicated to universal, open-access engineering education.
          </p>
          <div style="padding:1.5rem; background:#0f172a; border:1px solid #1e293b; border-radius:0.75rem; margin-top:2rem;">
            <h3 style="color:#ffffff; font-size:1.1rem; margin-bottom:0.5rem;">Creator & Engineering Leadership</h3>
            <p style="color:#94a3b8; font-size:0.875rem; margin-bottom:0.5rem;">Anil Sharma — Founder & Lead Computational Engineer</p>
            <p style="color:#94a3b8; font-size:0.875rem; margin-bottom:0.5rem;">Email: <a href="mailto:0808miracle@gmail.com" style="color:#38bdf8;">0808miracle@gmail.com</a></p>
            <p style="color:#94a3b8; font-size:0.875rem;">LinkedIn: <a href="https://www.linkedin.com/in/toanilsharma/" style="color:#38bdf8;" target="_blank" rel="noopener noreferrer">https://www.linkedin.com/in/toanilsharma/</a></p>
          </div>
        </div>
      </div>
      `;
    }

    case 'contact': {
      return `
      <div style="max-width:64rem; margin:0 auto; padding:3rem 1.5rem 4rem;">
        <nav style="font-family:monospace; font-size:0.8rem; color:#64748b; margin-bottom:2rem;">
          <a href="/" style="color:#38bdf8; text-decoration:none;">Home</a> / <span style="color:#94a3b8;">Contact Us</span>
        </nav>
        <h1 style="font-size:2.5rem; font-weight:900; color:#ffffff; margin-bottom:1rem;">Contact Engineering Team</h1>
        <p style="font-size:1.125rem; color:#cbd5e1; margin-bottom:2rem;">Direct communication desk with founder Anil Sharma for simulator requests, formula proofs, and syllabus partnerships.</p>
        <div style="padding:2rem; background:#0f172a; border:1px solid #1e293b; border-radius:1rem; max-width:36rem; margin-bottom:2rem;">
          <h2 style="font-size:1.25rem; font-weight:bold; color:#ffffff; margin-bottom:1rem;">Anil Sharma (Founder)</h2>
          <p style="color:#cbd5e1; font-size:0.875rem; margin-bottom:0.75rem;">
            <strong>Official Email:</strong> <a href="mailto:0808miracle@gmail.com" style="color:#38bdf8; font-family:monospace;">0808miracle@gmail.com</a>
          </p>
          <p style="color:#cbd5e1; font-size:0.875rem; margin-bottom:1rem;">
            <strong>LinkedIn Profile:</strong> <a href="https://www.linkedin.com/in/toanilsharma/" style="color:#38bdf8; font-family:monospace;" target="_blank" rel="noopener noreferrer">https://www.linkedin.com/in/toanilsharma/</a>
          </p>
          <p style="color:#64748b; font-size:0.75rem; font-family:monospace;">Average Review Turnaround: &lt; 24-48 Hours</p>
        </div>

        <form name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" style="padding:2rem; background:#0f172a; border:1px solid #1e293b; border-radius:1rem; max-width:36rem;">
          <input type="hidden" name="form-name" value="contact" />
          <div style="display:none;"><label>Don't fill this out: <input name="bot-field" /></label></div>
          <p style="margin-bottom:1rem;">
            <label style="display:block; color:#cbd5e1; margin-bottom:0.5rem; font-size:0.875rem;">Your Name</label>
            <input type="text" name="name" required style="width:100%; padding:0.5rem; background:#020617; border:1px solid #334155; border-radius:0.375rem; color:#fff;" />
          </p>
          <p style="margin-bottom:1rem;">
            <label style="display:block; color:#cbd5e1; margin-bottom:0.5rem; font-size:0.875rem;">Your Email</label>
            <input type="email" name="email" required style="width:100%; padding:0.5rem; background:#020617; border:1px solid #334155; border-radius:0.375rem; color:#fff;" />
          </p>
          <p style="margin-bottom:1rem;">
            <label style="display:block; color:#cbd5e1; margin-bottom:0.5rem; font-size:0.875rem;">Inquiry Category</label>
            <input type="text" name="category" value="Simulator Request" style="width:100%; padding:0.5rem; background:#020617; border:1px solid #334155; border-radius:0.375rem; color:#fff;" />
          </p>
          <p style="margin-bottom:1rem;">
            <label style="display:block; color:#cbd5e1; margin-bottom:0.5rem; font-size:0.875rem;">Subject</label>
            <input type="text" name="subject" required style="width:100%; padding:0.5rem; background:#020617; border:1px solid #334155; border-radius:0.375rem; color:#fff;" />
          </p>
          <p style="margin-bottom:1rem;">
            <label style="display:block; color:#cbd5e1; margin-bottom:0.5rem; font-size:0.875rem;">Message</label>
            <textarea name="message" required rows="5" style="width:100%; padding:0.5rem; background:#020617; border:1px solid #334155; border-radius:0.375rem; color:#fff;"></textarea>
          </p>
          <p>
            <button type="submit" style="padding:0.75rem 1.5rem; background:#06b6d4; color:#020617; font-weight:bold; border-radius:0.5rem; border:none; cursor:pointer;">Send Message</button>
          </p>
        </form>
      </div>
      `;
    }

    case 'cookie-policy': {
      return `
      <div style="max-width:64rem; margin:0 auto; padding:3rem 1.5rem 4rem;">
        <h1 style="font-size:2.5rem; font-weight:900; color:#ffffff; margin-bottom:1rem;">Cookie & Telemetry Policy</h1>
        <p style="color:#cbd5e1; line-height:1.6;">
          LiveSimulators utilizes client-side Float64 computation that does not require tracking cookies. We integrate Google Analytics (G-WX8V8HH57V) strictly for anonymous aggregated performance telemetry. Users may toggle analytics cookies at any time.
        </p>
      </div>
      `;
    }

    case 'disclaimer': {
      return `
      <div style="max-width:64rem; margin:0 auto; padding:3rem 1.5rem 4rem;">
        <h1 style="font-size:2.5rem; font-weight:900; color:#ffffff; margin-bottom:1rem;">Engineering Simulation Disclaimer</h1>
        <p style="color:#cbd5e1; line-height:1.6;">
          All models and interactive visualizers are designed for pedagogical and educational purposes. Simulations incorporate classical boundary approximations and do not substitute for licensed Professional Engineer (PE) stamped designs or physical lab testing.
        </p>
      </div>
      `;
    }

    case 'privacy-policy': {
      return `
      <div style="max-width:64rem; margin:0 auto; padding:3rem 1.5rem 4rem;">
        <h1 style="font-size:2.5rem; font-weight:900; color:#ffffff; margin-bottom:1rem;">Privacy Policy (GDPR & CCPA)</h1>
        <p style="color:#cbd5e1; line-height:1.6;">
          LiveSimulators maintains a strict zero-sale personal data policy. Calculations occur locally in client browser memory. Point of contact: Anil Sharma (0808miracle@gmail.com).
        </p>
      </div>
      `;
    }

    case 'terms': {
      return `
      <div style="max-width:64rem; margin:0 auto; padding:3rem 1.5rem 4rem;">
        <h1 style="font-size:2.5rem; font-weight:900; color:#ffffff; margin-bottom:1rem;">Terms of Service</h1>
        <p style="color:#cbd5e1; line-height:1.6;">
          Open educational access license permitting students, professors, and researchers to demonstrate and interact with simulations with standard scientific attribution.
        </p>
      </div>
      `;
    }

    case 'lab': {
      const lab = LABS.find((l) => l.id === route.labId) || LABS[0];
      const capabilitiesHtml = lab.capabilities.map((c) => `<li style="margin-bottom:0.5rem; color:#cbd5e1;">${escapeHtml(c)}</li>`).join('');
      const sectorsHtml = lab.sectors.map((s) => `<span style="display:inline-block; margin-right:0.5rem; margin-bottom:0.5rem; padding:0.25rem 0.75rem; background:#0b1324; border:1px solid #1e293b; border-radius:0.5rem; color:#38bdf8; font-size:0.75rem;">${escapeHtml(s)}</span>`).join('');

      return `
      <article style="max-width:72rem; margin:0 auto; padding:2rem 1.5rem 4rem;">
        <nav style="font-family:monospace; font-size:0.8rem; color:#64748b; margin-bottom:1.5rem;">
          <a href="/" style="color:#38bdf8; text-decoration:none;">Home</a> / 
          <a href="/#industrial-labs" style="color:#38bdf8; text-decoration:none;">Industrial Labs</a> / 
          <span style="color:#ffffff;">${escapeHtml(lab.name)}</span>
        </nav>

        <header style="margin-bottom:2.5rem; padding:2.5rem; background:#0b1324; border:1px solid #1e293b; border-radius:1rem;">
          <div style="font-family:monospace; font-size:0.75rem; color:#38bdf8; margin-bottom:0.75rem;">
            ${escapeHtml(lab.deploymentType)} • ${escapeHtml(lab.standardBadge)} • ${lab.modules} INTERACTIVE MODULES
          </div>
          <h1 style="font-size:2.5rem; font-weight:900; color:#ffffff; margin-bottom:1rem;">
            ${escapeHtml(lab.name)}
          </h1>
          <p style="font-size:1.125rem; color:#cbd5e1; max-width:54rem; line-height:1.7;">
            ${escapeHtml(lab.tagline)}
          </p>
        </header>

        <section style="margin-bottom:2.5rem; padding:2rem; background:#0f172a; border:1px solid #1e293b; border-radius:1rem;">
          <h2 style="font-size:1.5rem; font-weight:800; color:#ffffff; margin-bottom:1rem;">Primary Industry Sectors</h2>
          <div>${sectorsHtml}</div>
        </section>

        <section style="margin-bottom:2.5rem; padding:2rem; background:#0f172a; border:1px solid #1e293b; border-radius:1rem;">
          <h2 style="font-size:1.5rem; font-weight:800; color:#ffffff; margin-bottom:1rem;">Core Capabilities & Analytical Solvers</h2>
          <ul style="list-style-type:disc; padding-left:1.5rem;">${capabilitiesHtml}</ul>
        </section>
      </article>
      `;
    }

    case 'not-found': {
      return `
      <div style="max-width:48rem; margin:0 auto; padding:5rem 1.5rem; text-align:center; font-family:sans-serif;">
        <div style="display:inline-block; padding:0.25rem 0.75rem; background:rgba(244,63,94,0.15); border:1px solid rgba(244,63,94,0.4); color:#f43f5e; font-family:monospace; font-size:0.75rem; border-radius:9999px; margin-bottom:1.5rem;">STATUS: 404_ROUTE_UNDEFINED</div>
        <h1 style="font-size:4.5rem; font-weight:900; color:#f43f5e; margin:0 0 0.5rem; line-height:1;">404</h1>
        <h2 style="font-size:1.75rem; font-weight:bold; color:#ffffff; margin-bottom:1rem;">Coordinate Not Found in Numerical Field</h2>
        <p style="color:#94a3b8; margin-bottom:2rem; font-size:1rem; line-height:1.6;">The requested route does not correspond to an active engineering simulator, department workbench, or institutional page.</p>
        <div>
          <a href="/" style="display:inline-block; padding:0.75rem 1.5rem; background:#06b6d4; color:#030712; font-weight:bold; border-radius:0.75rem; text-decoration:none; font-size:0.875rem;">Return to Home Hub &rarr;</a>
        </div>
      </div>
      `;
    }

    default:
      return '<div id="root"></div>';
  }
}

async function runPrerender() {
  console.log('⚡ Starting LiveSimulators SSG Prerendering Pipeline...');

  if (!fs.existsSync(distDir)) {
    console.error('Error: dist directory does not exist. Run "vite build" first.');
    process.exit(1);
  }

  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('Error: dist/index.html does not exist.');
    process.exit(1);
  }

  let templateHtml = fs.readFileSync(templatePath, 'utf8');
  // Clean any existing injected fallback content to ensure a clean base template
  templateHtml = templateHtml.replace(
    /<div id="root">[\s\S]*?<\/div>(\s*<div id="seo-fallback">[\s\S]*?<\/div>|\s*<noscript id="seo-fallback">[\s\S]*?<\/noscript>)?/i,
    '<div id="root"></div>'
  );

  // Define all routes to prerender
  const routesToPrerender: AppRoute[] = [
    { view: 'home' },
    { view: 'about' },
    { view: 'contact' },
    { view: 'cookie-policy' },
    { view: 'disclaimer' },
    { view: 'privacy-policy' },
    { view: 'terms' },
    ...DISCIPLINES.map((d) => ({ view: 'department' as const, departmentId: d.id })),
    ...ALL_AVAILABLE_SIMULATORS.map((s) => ({ view: 'simulator' as const, simulatorId: s.id })),
    ...ALL_AVAILABLE_SIMULATORS.map((s) => ({ view: 'embed' as const, simulatorId: s.id })),
    ...LABS.map((l) => ({ view: 'lab' as const, labId: l.id })),
  ];

  console.log(`📦 Prerendering ${routesToPrerender.length} distinct routes...`);

  function setMetaTag(html: string, attr: 'property' | 'name', key: string, content: string): string {
    const regex = new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`, 'i');
    const tag = `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`;
    if (regex.test(html)) {
      return html.replace(regex, tag);
    } else {
      return html.replace('</head>', `  ${tag}\n  </head>`);
    }
  }

  for (const route of routesToPrerender) {
    const meta = getSeoMetadata(route);
    const routePath = routeToPath(route);
    const contentHtml = renderContentForRoute(route);

    let html = templateHtml;

    // 1. Replace Title
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);

    // 2. Set / Replace Description
    html = setMetaTag(html, 'name', 'description', meta.description);

    // 2b. Strictly inject/replace robots tag in raw pre-rendered HTML
    html = setMetaTag(html, 'name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large');

    // 3. Set / Replace Canonical Link Tag (strictly strips all query parameters)
    const cleanCanonicalUrl = meta.canonicalUrl.split('?')[0].split('#')[0];
    const canonicalRegex = /<link\s+rel="canonical"[^>]*>/i;
    const canonicalTag = `<link rel="canonical" href="${cleanCanonicalUrl}" />`;
    if (canonicalRegex.test(html)) {
      html = html.replace(canonicalRegex, canonicalTag);
    } else {
      html = html.replace('</head>', `  ${canonicalTag}\n  </head>`);
    }

    // 4. Set / Replace OpenGraph & Twitter Tags
    html = setMetaTag(html, 'property', 'og:title', meta.title);
    html = setMetaTag(html, 'property', 'og:description', meta.description);
    html = setMetaTag(html, 'property', 'og:url', cleanCanonicalUrl);
    html = setMetaTag(html, 'property', 'og:type', meta.ogType);
    html = setMetaTag(html, 'property', 'og:image', meta.ogImage);

    html = setMetaTag(html, 'name', 'twitter:card', 'summary_large_image');
    html = setMetaTag(html, 'name', 'twitter:title', meta.title);
    html = setMetaTag(html, 'name', 'twitter:description', meta.description);
    html = setMetaTag(html, 'name', 'twitter:image', meta.ogImage);

    // 5. Replace / Inject JSON-LD Script with @graph format
    const graphData = {
      '@context': 'https://schema.org',
      '@graph': meta.jsonLd.map((node) => {
        const { '@context': _, ...cleanNode } = node;
        return cleanNode;
      }),
    };
    const jsonLdString = JSON.stringify(graphData, null, 2);
    if (html.includes('id="seo-jsonld"')) {
      html = html.replace(
        /<script type="application\/ld\+json" id="seo-jsonld">[\s\S]*?<\/script>/i,
        `<script type="application/ld+json" id="seo-jsonld">\n${jsonLdString}\n    </script>`
      );
    } else {
      html = html.replace(
        '</head>',
        `  <script type="application/ld+json" id="seo-jsonld">\n${jsonLdString}\n  </script>\n  </head>`
      );
    }

    // 6. Inject Pre-rendered Semantic HTML for search crawlers inside <noscript>
    // Keeping <div id="root"></div> clean prevents the browser from flashing raw fallback HTML
    // to real users when opening livesimulators.com, while main.tsx removes #seo-fallback on hydration
    // to maintain strictly 1 canonical <h1> for headless crawlers.
    html = html.replace(
      /<div id="root">[\s\S]*?<\/div>(\s*<div id="seo-fallback">[\s\S]*?<\/div>|\s*<noscript id="seo-fallback">[\s\S]*?<\/noscript>)?/i,
      `<div id="root"></div>\n    <noscript id="seo-fallback">\n${contentHtml}\n    </noscript>`
    );

    // 7. Output directory and file
    let targetFile: string;
    if (routePath === '/') {
      targetFile = path.join(distDir, 'index.html');
    } else {
      const pageDir = path.join(distDir, routePath.replace(/^\//, ''));
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }
      targetFile = path.join(pageDir, 'index.html');
    }

    fs.writeFileSync(targetFile, html, 'utf8');
  }

  // Generate 404.html with branded 404 content for static hosts
  const notFoundMeta = getSeoMetadata({ view: 'not-found' });
  const notFoundContent = renderContentForRoute({ view: 'not-found' });
  let notFoundHtml = templateHtml;
  notFoundHtml = notFoundHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(notFoundMeta.title)}</title>`);
  notFoundHtml = setMetaTag(notFoundHtml, 'name', 'description', notFoundMeta.description);
  notFoundHtml = setMetaTag(notFoundHtml, 'name', 'robots', 'noindex, follow');
  notFoundHtml = setMetaTag(notFoundHtml, 'property', 'og:title', notFoundMeta.title);
  notFoundHtml = setMetaTag(notFoundHtml, 'property', 'og:description', notFoundMeta.description);
  notFoundHtml = setMetaTag(notFoundHtml, 'property', 'og:image', notFoundMeta.ogImage);
  notFoundHtml = setMetaTag(notFoundHtml, 'name', 'twitter:title', notFoundMeta.title);
  notFoundHtml = setMetaTag(notFoundHtml, 'name', 'twitter:image', notFoundMeta.ogImage);
  notFoundHtml = notFoundHtml.replace(
    /<div id="root">[\s\S]*?<\/div>(\s*<div id="seo-fallback">[\s\S]*?<\/div>|\s*<noscript id="seo-fallback">[\s\S]*?<\/noscript>)?/i,
    `<div id="root"></div>\n    <noscript id="seo-fallback">\n${notFoundContent}\n    </noscript>`
  );
  fs.writeFileSync(path.join(distDir, '404.html'), notFoundHtml, 'utf8');

  // Build-generated sitemap.xml with today's lastmod for all routes
  const today = new Date().toISOString().split('T')[0];
  const sitemapEntries = routesToPrerender
    .filter((r) => r.view !== 'embed')
    .map((r) => {
    const p = routeToPath(r);
    let freq = 'weekly';
    let prio = '0.8';
    if (p === '/') {
      freq = 'daily';
      prio = '1.0';
    } else if (p.startsWith('/department/') || p.startsWith('/simulator/') || p.startsWith('/lab/')) {
      freq = 'weekly';
      prio = '0.9';
    } else if (p === '/about' || p === '/contact') {
      freq = 'weekly';
      prio = '0.8';
    } else {
      freq = 'monthly';
      prio = '0.5';
    }
    return `  <url>
    <loc>${SITE_URL}${p === '/' ? '/' : p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${prio}</priority>
  </url>`;
  }).join('\n\n');

  // Cornerstone Educational Guides & Methodology Documentation
  const guideUrls = [
    '/about/methodology.html',
    '/for-professors.html',
    '/guides/rlc-resonance-explained.html',
    '/guides/rankine-cycle-ts-diagram.html',
    '/guides/pid-tuning-step-by-step.html',
    '/guides/beam-deflection-euler-bernoulli.html',
    '/guides/four-bar-mechanism-kinematics.html',
  ];
  const guideSitemapEntries = guideUrls.map((p) => `  <url>
    <loc>${SITE_URL}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
${sitemapEntries}

${guideSitemapEntries}

</urlset>
`;
  const publicDir = path.resolve(__dirname, '../public');
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log('🗺️ Generated sitemap.xml with lastmod for all routes');

  // Build-generated llms.txt and llms-full.txt (https://llmstxt.org)
  const { summary: llmsTxtContent, full: llmsFullTxtContent } = generateLlmsTxt();
  fs.writeFileSync(path.join(publicDir, 'llms.txt'), llmsTxtContent, 'utf8');
  fs.writeFileSync(path.join(distDir, 'llms.txt'), llmsTxtContent, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'llms-full.txt'), llmsFullTxtContent, 'utf8');
  fs.writeFileSync(path.join(distDir, 'llms-full.txt'), llmsFullTxtContent, 'utf8');
  console.log('🤖 Generated llms.txt & llms-full.txt for AI Search & LLM Discovery');

  // Copy static assets from public to dist
  const assetsToCopy = ['_redirects', 'robots.txt', 'og-default.png', 'llms.txt', 'llms-full.txt', 'manifest.webmanifest', 'sw.js', 'contact-form.html', 'for-professors.html'];
  for (const asset of assetsToCopy) {
    const srcFile = path.join(publicDir, asset);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join(distDir, asset));
      console.log(`📄 Copied public/${asset} to dist/${asset}`);
    }
  }

  const publicLabsDir = path.join(publicDir, 'assets/labs');
  const distLabsDir = path.join(distDir, 'assets/labs');
  if (fs.existsSync(publicLabsDir)) {
    if (!fs.existsSync(distLabsDir)) {
      fs.mkdirSync(distLabsDir, { recursive: true });
    }
    const files = fs.readdirSync(publicLabsDir);
    for (const f of files) {
      fs.copyFileSync(path.join(publicLabsDir, f), path.join(distLabsDir, f));
    }
    console.log('📄 Copied public/assets/labs to dist/assets/labs');
  }

  const publicHubDir = path.join(publicDir, 'assets/hub');
  const distHubDir = path.join(distDir, 'assets/hub');
  if (fs.existsSync(publicHubDir)) {
    if (!fs.existsSync(distHubDir)) {
      fs.mkdirSync(distHubDir, { recursive: true });
    }
    const files = fs.readdirSync(publicHubDir);
    for (const f of files) {
      fs.copyFileSync(path.join(publicHubDir, f), path.join(distHubDir, f));
    }
    console.log('📄 Copied public/assets/hub to dist/assets/hub');
  }

  const publicGuidesDir = path.join(publicDir, 'guides');
  const distGuidesDir = path.join(distDir, 'guides');
  if (fs.existsSync(publicGuidesDir)) {
    if (!fs.existsSync(distGuidesDir)) {
      fs.mkdirSync(distGuidesDir, { recursive: true });
    }
    const files = fs.readdirSync(publicGuidesDir);
    for (const f of files) {
      fs.copyFileSync(path.join(publicGuidesDir, f), path.join(distGuidesDir, f));
    }
    console.log('📄 Copied public/guides to dist/guides');
  }

  const publicAboutDir = path.join(publicDir, 'about');
  const distAboutDir = path.join(distDir, 'about');
  if (fs.existsSync(publicAboutDir)) {
    if (!fs.existsSync(distAboutDir)) {
      fs.mkdirSync(distAboutDir, { recursive: true });
    }
    const files = fs.readdirSync(publicAboutDir);
    for (const f of files) {
      fs.copyFileSync(path.join(publicAboutDir, f), path.join(distAboutDir, f));
    }
    console.log('📄 Copied public/about to dist/about');
  }

  console.log('✅ SSG Prerendering Completed: All routes static, crawlable, and SEO-optimized.');
}

runPrerender().catch((err) => {
  console.error('Fatal Prerender Error:', err);
  process.exit(1);
});
