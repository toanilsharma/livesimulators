import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DISCIPLINES, ALL_AVAILABLE_SIMULATORS } from '../src/data/simulators';
import { LABS } from '../src/config/labs';
import { AppRoute, DisciplineId, SimulatorItem } from '../src/types';
import { getSeoMetadata } from '../src/utils/seo';
import { routeToPath, SITE_URL } from '../src/utils/routes';

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
 * Generates official llms.txt and llms-full.txt files following https://llmstxt.org/
 * Enables AI search engines (Perplexity, ChatGPT/SearchGPT, Claude, Gemini) to index
 * all mathematical models, physical formulations, parameter bounds, and validation tests.
 */
function generateLlmsTxt(): { summary: string; full: string } {
  const summaryLines: string[] = [
    '# LiveSimulators',
    '',
    '> LiveSimulators (https://livesimulators.com) is an open-access engineering simulation and virtual laboratory platform. It executes first-principles physical and mathematical models directly in the user browser at 60 FPS using Float64 numerical integrators (including 4th-Order Runge-Kutta). Built for university engineering syllabi, laboratory exploration, and industrial plant troubleshooting.',
    '',
    '## Academic & Industrial Disciplines',
  ];

  for (const d of DISCIPLINES) {
    summaryLines.push(`- [${d.name} (${d.code})](https://livesimulators.com/department/${d.id}): ${d.description} Core equation: \`${d.coreEquation}\``);
  }

  summaryLines.push('');
  summaryLines.push('## Interactive Engineering Simulators');
  for (const s of ALL_AVAILABLE_SIMULATORS) {
    summaryLines.push(`- [${s.title}](https://livesimulators.com/simulator/${s.id}): ${s.tagline} Physical law: ${s.physicalLaw}. Governing formulation: \`${s.governingEquation}\`. Level: ${s.difficulty}.`);
  }

  summaryLines.push('');
  summaryLines.push('## Industrial Engineering Labs Workbench');
  for (const lab of LABS) {
    summaryLines.push(`- [${lab.name}](https://livesimulators.com/lab/${lab.id}): ${lab.tagline}. Discipline: ${lab.dept} | ${lab.modules} Interactive Modules | Reference: ${lab.standardBadge}.`);
  }

  summaryLines.push('');
  summaryLines.push('## Companion Engineering Portals');
  summaryLines.push('- [DesignCalculators.co.in](https://designcalculators.co.in): Free multi-disciplinary engineering calculators (Electrical, Mechanical, Instrumentation) referencing published standards (IEEE, IEC, ASME, API, ISA).');
  summaryLines.push('- [ReliabilityTools.co.in](https://reliabilitytools.co.in): Free plant reliability, asset uptime analytics, 2P/3P Weibull failure modeling, MTBF/MTTR, RCA, and IEC 61508/61511 SIL verification.');

  summaryLines.push('');
  summaryLines.push('## Standards Reference & Non-Affiliation Notice');
  summaryLines.push('All standard designations and acronyms (IEEE, IEC, ASME, API, ISO, ISA, NFPA, ASTM, ANSI) belong to their respective owners and are referenced solely for technical identification and academic study. LiveSimulators is an independent educational platform and makes no claim of endorsement or official affiliation.');

  summaryLines.push('');
  summaryLines.push('## Full Technical Documentation');
  summaryLines.push('- [Complete Equations, Mathematical Proofs & Benchmark Tests](https://livesimulators.com/llms-full.txt): Detailed mathematical derivations, analytical validation benchmarks, and complete parameter tables for all simulators.');

  // Full technical document
  const fullLines: string[] = [
    '# LiveSimulators - Complete Technical & Mathematical Knowledge Base',
    '',
    '> Complete first-principles equations, analytical proofs, NIST/IEEE/ASME validation benchmarks, and parameter definitions for all LiveSimulators computational models.',
    '',
    'Website: https://livesimulators.com',
    'Founder & Lead Computational Engineer: Anil Sharma (0808miracle@gmail.com)',
    '',
    '---',
    '',
  ];

  for (const s of ALL_AVAILABLE_SIMULATORS) {
    fullLines.push(`## ${s.title}`);
    fullLines.push(`- **URL**: https://livesimulators.com/simulator/${s.id}`);
    fullLines.push(`- **Discipline**: ${s.disciplineName} (${s.discipline}) | **Level**: ${s.difficulty} | **Badge**: ${s.badge}`);
    fullLines.push(`- **Overview**: ${s.description}`);
    fullLines.push(`- **Physical Law**: ${s.physicalLaw}`);
    fullLines.push(`- **Governing Formulation**: \`${s.governingEquation}\``);
    fullLines.push(`- **Equation Description**: ${s.equationDescription}`);
    if (s.standardReference) {
      fullLines.push(`- **Referenced Standards**: ${s.standardReference}`);
    }
    if (s.analyticalProof) {
      fullLines.push(`- **Analytical Proof & Mathematical Derivation**: ${s.analyticalProof}`);
    }
    if (s.validationTest) {
      fullLines.push(`- **Benchmark Validation Test**: ${s.validationTest}`);
    }
    if (s.fieldInsights) {
      fullLines.push(`- **Industrial Practical Insights**: ${s.fieldInsights}`);
    }
    if (s.parameters && s.parameters.length > 0) {
      fullLines.push('- **Tunable Parameters**:');
      for (const p of s.parameters) {
        fullLines.push(`  - \`${p.name}\` (${p.symbol}): Range [${p.min} to ${p.max} ${p.unit}], Default: ${p.default} ${p.unit}. ${p.description}`);
      }
    }
    if (s.keyMetrics && s.keyMetrics.length > 0) {
      fullLines.push(`- **Solved Real-Time Outputs**: ${s.keyMetrics.map((m) => `${m.label} (${m.unit || 'dimensionless'})`).join(', ')}`);
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
        fullLines.push(`    A: ${faq.answer}`);
      }
    }
    if (s.tags && s.tags.length > 0) {
      fullLines.push(`- **Curricular Tags**: ${s.tags.join(', ')}`);
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
          <div style="font-family:monospace; color:#38bdf8; font-size:0.8rem; margin-bottom:0.75rem;">Core Formulation: ${escapeHtml(d.coreEquation)}</div>
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
          <div style="font-family:monospace; color:#38bdf8; font-size:0.8rem; margin-bottom:0.75rem;">Equation: ${escapeHtml(s.governingEquation)}</div>
          <div style="color:#64748b; font-size:0.75rem; margin-bottom:1rem;">Standard: ${escapeHtml(s.standardReference || 'IEEE/ASME Standard')}</div>
          <a href="/simulator/${s.id}" style="display:inline-block; padding:0.5rem 1rem; background:#06b6d4; color:#030712; border-radius:0.5rem; font-weight:bold; text-decoration:none; font-size:0.8rem;">Launch Workbench &rarr;</a>
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
            Governing Formulation: ${escapeHtml(dept.coreEquation)}
          </div>
        </header>

        <section>
          <h2 style="font-size:1.5rem; font-weight:bold; color:#ffffff; margin-bottom:1.5rem;">Interactive Workbenches in ${escapeHtml(dept.name)}</h2>
          ${simCardsHtml || '<p style="color:#94a3b8;">No simulators currently in this category.</p>'}
        </section>
      </div>
      `;
    }

    case 'simulator': {
      const sim = ALL_AVAILABLE_SIMULATORS.find((s) => s.id === route.simulatorId) || ALL_AVAILABLE_SIMULATORS[0];
      const dept = DISCIPLINES.find((d) => d.id === sim.discipline);

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

      return `
      <article style="max-width:72rem; margin:0 auto; padding:2rem 1.5rem 4rem;">
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

        <section style="margin-bottom:2.5rem; padding:1.5rem; background:#0f172a; border:1px solid #1e293b; border-radius:1rem;">
          <h2 style="font-size:1.25rem; font-weight:bold; color:#ffffff; margin-bottom:0.75rem;">Governing Physical Law & Equations</h2>
          <div style="font-family:monospace; font-size:1.1rem; color:#38bdf8; margin-bottom:0.5rem;">${escapeHtml(sim.governingEquation)}</div>
          <p style="color:#94a3b8; font-size:0.875rem; margin-bottom:0.5rem;">${escapeHtml(sim.equationDescription)}</p>
          <div style="font-size:0.8rem; color:#64748b;">Law: <strong>${escapeHtml(sim.physicalLaw)}</strong> | Standard Reference: <strong>${escapeHtml(sim.standardReference || 'IEEE / ASME Standard Reference')}</strong></div>
        </section>

        <section style="margin-bottom:2.5rem;">
          <h2 style="font-size:1.25rem; font-weight:bold; color:#ffffff; margin-bottom:1rem;">Adjustable System Parameters</h2>
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

        ${sim.analyticalProof ? `
        <section style="margin-bottom:2.5rem; padding:1.5rem; background:#0b1324; border:1px solid #1e293b; border-radius:1rem;">
          <h2 style="font-size:1.25rem; font-weight:bold; color:#ffffff; margin-bottom:0.75rem;">Analytical Proof & Derivation</h2>
          <p style="color:#cbd5e1; font-size:0.875rem; line-height:1.6;">${escapeHtml(sim.analyticalProof)}</p>
        </section>` : ''}

        ${sim.validationTest ? `
        <section style="margin-bottom:2.5rem; padding:1.5rem; background:#0b1324; border:1px solid #1e293b; border-radius:1rem;">
          <h2 style="font-size:1.25rem; font-weight:bold; color:#ffffff; margin-bottom:0.75rem;">Verification Benchmark</h2>
          <p style="color:#cbd5e1; font-size:0.875rem; line-height:1.6;">${escapeHtml(sim.validationTest)}</p>
        </section>` : ''}

        ${sim.fieldInsights ? `
        <section style="margin-bottom:2.5rem; padding:1.5rem; background:#0b1324; border:1px solid #1e293b; border-radius:1rem;">
          <h2 style="font-size:1.25rem; font-weight:bold; color:#ffffff; margin-bottom:0.75rem;">Field Engineering Insights</h2>
          <p style="color:#cbd5e1; font-size:0.875rem; line-height:1.6;">${escapeHtml(sim.fieldInsights)}</p>
        </section>` : ''}

        ${sim.courseMapping ? `
        <section style="margin-bottom:2.5rem; padding:1.5rem; background:#0b1324; border:1px solid #1e293b; border-radius:1rem;">
          <h2 style="font-size:1.25rem; font-weight:bold; color:#ffffff; margin-bottom:0.75rem;">University Syllabus & Curriculum Mapping</h2>
          <p style="color:#38bdf8; font-family:monospace; font-size:0.9rem; margin-bottom:0.5rem;">${escapeHtml(sim.courseMapping)}</p>
          ${sim.textbookReferences ? `<p style="color:#94a3b8; font-size:0.85rem;">Standard References: ${escapeHtml(sim.textbookReferences)}</p>` : ''}
        </section>` : ''}

        ${sim.faqs && sim.faqs.length > 0 ? `
        <section style="margin-bottom:2.5rem; padding:1.5rem; background:#0b1324; border:1px solid #1e293b; border-radius:1rem;">
          <h2 style="font-size:1.25rem; font-weight:bold; color:#ffffff; margin-bottom:1rem;">Frequently Asked Technical Questions</h2>
          ${sim.faqs.map(f => `
            <div style="margin-bottom:1rem; padding-bottom:1rem; border-bottom:1px solid #1e293b;">
              <h3 style="font-size:1rem; font-weight:bold; color:#f8fafc; margin-bottom:0.4rem;">${escapeHtml(f.question)}</h3>
              <p style="font-size:0.875rem; color:#94a3b8; line-height:1.6;">${escapeHtml(f.answer)}</p>
            </div>
          `).join('')}
        </section>` : ''}
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
          <a href="/simulator/${sim.id}" target="_blank" rel="noopener noreferrer" style="font-size:0.85rem; font-weight:bold; color:#06b6d4; text-decoration:none; padding:0.4rem 0.8rem; background:#0f172a; border:1px solid #1e293b; border-radius:0.5rem;">Launch Full Lab ↗</a>
        </header>
        <p style="color:#cbd5e1; font-size:0.9rem; line-height:1.6; margin-bottom:1rem;">${escapeHtml(sim.description)}</p>
        <div style="font-family:monospace; color:#38bdf8; font-size:0.9rem; padding:0.75rem; background:#0f172a; border-radius:0.5rem; margin-bottom:1rem;">
          ${escapeHtml(sim.governingEquation)}
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
        <div style="padding:2rem; background:#0f172a; border:1px solid #1e293b; border-radius:1rem; max-width:36rem;">
          <h2 style="font-size:1.25rem; font-weight:bold; color:#ffffff; margin-bottom:1rem;">Anil Sharma (Founder)</h2>
          <p style="color:#cbd5e1; font-size:0.875rem; margin-bottom:0.75rem;">
            <strong>Official Email:</strong> <a href="mailto:0808miracle@gmail.com" style="color:#38bdf8; font-family:monospace;">0808miracle@gmail.com</a>
          </p>
          <p style="color:#cbd5e1; font-size:0.875rem; margin-bottom:1rem;">
            <strong>LinkedIn Profile:</strong> <a href="https://www.linkedin.com/in/toanilsharma/" style="color:#38bdf8; font-family:monospace;" target="_blank" rel="noopener noreferrer">https://www.linkedin.com/in/toanilsharma/</a>
          </p>
          <p style="color:#64748b; font-size:0.75rem; font-family:monospace;">Average Review Turnaround: &lt; 24-48 Hours</p>
        </div>
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
  // Clean any existing injected fallback content or noscript to ensure a clean base template
  templateHtml = templateHtml.replace(
    /<div id="root">[\s\S]*?<\/div>(\s*<noscript id="seo-fallback">[\s\S]*?<\/noscript>)?/i,
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
    const regex = new RegExp(`<meta\\s+${attr}="${key}"[\\s\\S]*?>`, 'i');
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

    // 3. Set / Replace Canonical Link Tag
    const canonicalRegex = /<link\s+rel="canonical"[\s\S]*?>/i;
    const canonicalTag = `<link rel="canonical" href="${meta.canonicalUrl}" />`;
    if (canonicalRegex.test(html)) {
      html = html.replace(canonicalRegex, canonicalTag);
    } else {
      html = html.replace('</head>', `  ${canonicalTag}\n  </head>`);
    }

    // 4. Set / Replace OpenGraph & Twitter Tags
    html = setMetaTag(html, 'property', 'og:title', meta.title);
    html = setMetaTag(html, 'property', 'og:description', meta.description);
    html = setMetaTag(html, 'property', 'og:url', meta.canonicalUrl);
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
      /<div id="root">[\s\S]*?<\/div>(\s*<noscript id="seo-fallback">[\s\S]*?<\/noscript>)?/i,
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
  notFoundHtml = setMetaTag(notFoundHtml, 'property', 'og:title', notFoundMeta.title);
  notFoundHtml = setMetaTag(notFoundHtml, 'property', 'og:description', notFoundMeta.description);
  notFoundHtml = setMetaTag(notFoundHtml, 'property', 'og:image', notFoundMeta.ogImage);
  notFoundHtml = setMetaTag(notFoundHtml, 'name', 'twitter:title', notFoundMeta.title);
  notFoundHtml = setMetaTag(notFoundHtml, 'name', 'twitter:image', notFoundMeta.ogImage);
  notFoundHtml = notFoundHtml.replace(
    /<div id="root">[\s\S]*?<\/div>(\s*<noscript id="seo-fallback">[\s\S]*?<\/noscript>)?/i,
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

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
${sitemapEntries}

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
  const assetsToCopy = ['_redirects', 'robots.txt', 'og-default.png', 'llms.txt', 'llms-full.txt'];
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

  console.log('✅ SSG Prerendering Completed: All routes static, crawlable, and SEO-optimized.');
}

runPrerender().catch((err) => {
  console.error('Fatal Prerender Error:', err);
  process.exit(1);
});
