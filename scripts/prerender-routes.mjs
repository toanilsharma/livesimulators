import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { register } from 'tsx/esm/api';

// Register tsx ESM loader to seamlessly import TypeScript project files
register();

const { DISCIPLINES, ALL_AVAILABLE_SIMULATORS } = await import('../src/data/simulators.ts');
const { LABS } = await import('../src/config/labs.ts');
const { getEngineeringTheory, cleanLatexToPlainText } = await import('../src/utils/engineeringTheory.ts');
const { getSimulatorEngineeringDetails } = await import('../src/utils/engineeringScenarios.ts');
const { getSeoMetadata } = await import('../src/utils/seo.ts');
const { getRouteSchema } = await import('../src/utils/seoSchema.ts');
const { routeToPath, SITE_URL } = await import('../src/utils/routes.ts');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const publicDir = path.resolve(rootDir, 'public');

function escapeHtml(str) {
  if (str === null || str === undefined || str === '') return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Helper to inject or replace meta tags in the HTML template.
 */
function setMetaTag(html, attr, key, content) {
  const regex = new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`, 'i');
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`;
  if (regex.test(html)) {
    return html.replace(regex, tag);
  } else {
    return html.replace('</head>', `  ${tag}\n  </head>`);
  }
}

/**
 * Generates rich semantic HTML for an individual simulator page.
 * Injected directly inside <div id="root"> before React hydration.
 */
function renderSimulatorStaticContent(sim) {
  const dept = DISCIPLINES.find((d) => d.id === sim.discipline);
  const theory = getEngineeringTheory(sim);
  const details = getSimulatorEngineeringDetails(sim);
  const cleanEq = cleanLatexToPlainText(sim.governingEquation);
  const relatedSims = ALL_AVAILABLE_SIMULATORS.filter(
    (s) => s.discipline === sim.discipline && s.id !== sim.id
  ).slice(0, 6);

  // Definition list of variables
  const variableDefinitions = sim.parameters
    .map(
      (p) => `
      <div style="background: rgba(3, 7, 18, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.5rem; padding: 0.75rem 1rem; margin-bottom: 0.5rem;">
        <dt style="color: #38bdf8; font-weight: bold; font-family: monospace; display: flex; justify-content: space-between;">
          <span>${escapeHtml(p.name)} (${escapeHtml(p.symbol)})</span>
          <span style="color: #fbbf24; font-size: 0.8rem; background: rgba(15, 23, 42, 0.8); padding: 0.1rem 0.4rem; border-radius: 4px;">${escapeHtml(p.unit || 'dimensionless')}</span>
        </dt>
        <dd style="color: #cbd5e1; font-size: 0.85rem; margin: 0.25rem 0 0 0; line-height: 1.5;">
          Range: [${escapeHtml(p.min)} to ${escapeHtml(p.max)} ${escapeHtml(p.unit || '')}] &bull; Default: ${escapeHtml(p.default)} ${escapeHtml(p.unit || '')} &mdash; ${escapeHtml(p.description)}
        </dd>
      </div>`
    )
    .join('');

  // Worked scenarios 3-row table
  const scenarioRows = details.scenarios
    .map((sc) => {
      let badgeBg = 'rgba(16, 185, 129, 0.15)';
      let badgeBorder = 'rgba(16, 185, 129, 0.35)';
      let badgeColor = '#6ee7b7';
      if (sc.state === 'Fault / Saturation State') {
        badgeBg = 'rgba(239, 68, 68, 0.15)';
        badgeBorder = 'rgba(239, 68, 68, 0.35)';
        badgeColor = '#fca5a5';
      } else if (sc.state === 'High-Load / Boundary Condition') {
        badgeBg = 'rgba(245, 158, 11, 0.15)';
        badgeBorder = 'rgba(245, 158, 11, 0.35)';
        badgeColor = '#fcd34d';
      }

      const paramText = sc.parameters
        .map((p) => `<span style="display: block; font-family: monospace; color: #38bdf8;"><span style="color: #94a3b8;">${escapeHtml(p.symbol)}:</span> ${escapeHtml(p.value)} <span style="color: #64748b; font-size: 0.75rem;">${escapeHtml(p.unit)}</span></span>`)
        .join('');

      return `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.08); vertical-align: top;">
        <td style="padding: 1rem 0.75rem; width: 25%;">
          <span style="display: inline-block; font-size: 0.7rem; font-family: monospace; font-weight: bold; background: ${badgeBg}; border: 1px solid ${badgeBorder}; color: ${badgeColor}; padding: 0.2rem 0.5rem; border-radius: 4px; margin-bottom: 0.35rem;">
            ${escapeHtml(sc.state)}
          </span>
          <div style="font-weight: bold; color: #ffffff; font-size: 0.9rem;">${escapeHtml(sc.name)}</div>
        </td>
        <td style="padding: 1rem 0.75rem; width: 25%;">
          ${paramText}
        </td>
        <td style="padding: 1rem 0.75rem; color: #cbd5e1; font-size: 0.85rem; line-height: 1.6;">
          <p style="margin: 0 0 0.5rem 0;">${escapeHtml(sc.physicalResponse)}</p>
          <div style="font-family: monospace; font-size: 0.8rem; color: #34d399; font-weight: bold; background: rgba(3, 7, 18, 0.6); padding: 0.35rem 0.6rem; border-radius: 4px; display: inline-block; border: 1px solid rgba(255,255,255,0.06);">
            ${escapeHtml(sc.solvedMetrics)}
          </div>
        </td>
        <td style="padding: 1rem 0.75rem; color: #94a3b8; font-size: 0.825rem; line-height: 1.5; width: 25%;">
          ${escapeHtml(sc.industrialVerdict)}
        </td>
      </tr>`;
    })
    .join('');

  // FAQs list
  const faqItems = details.faqs
    .map(
      (f, idx) => `
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.6rem; padding: 1rem 1.25rem; margin-bottom: 0.75rem;">
        <h3 style="font-size: 0.95rem; font-weight: 700; color: #ffffff; margin: 0 0 0.5rem 0; display: flex; align-items: flex-start; gap: 0.5rem;">
          <span style="background: rgba(168, 85, 247, 0.2); color: #d8b4fe; font-family: monospace; font-size: 0.8rem; width: 1.4rem; height: 1.4rem; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;">${idx + 1}</span>
          <span>${escapeHtml(f.question)}</span>
        </h3>
        <p style="color: #cbd5e1; font-size: 0.875rem; line-height: 1.65; margin: 0; padding-left: 1.9rem;">
          ${escapeHtml(f.answer)}
        </p>
      </div>`
    )
    .join('');

  // Related simulators links
  const relatedLinks = relatedSims
    .map(
      (rel) => `
      <li style="margin-bottom: 0.5rem;">
        <a href="/simulator/${rel.id}/" style="color: #38bdf8; text-decoration: underline; font-weight: 500; font-size: 0.95rem;">
          ${escapeHtml(rel.title)} &rarr;
        </a>
        <span style="display: block; font-size: 0.8rem; color: #94a3b8; margin-top: 0.15rem;">${escapeHtml(rel.tagline)}</span>
      </li>`
    )
    .join('');

  const standardsText = sim.standardReference || `${sim.badge} International Consensus Standards`;
  const standardsBody = sim.standardBody || 'ISO / IEC / IEEE Standards Body';

  return `
  <article id="seo-static-content" style="max-width: 62rem; margin: 0 auto; padding: 2.5rem 1.5rem; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
    
    <!-- 1. Semantic Article Header: <h1> Title, Discipline Badge & Technical Summary -->
    <header style="margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 1.5rem;">
      <div style="font-size: 0.85rem; font-family: monospace; text-transform: uppercase; letter-spacing: 0.08em; color: #06b6d4; margin-bottom: 0.6rem; display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem;">
        <a href="/department/${dept ? dept.id : sim.discipline}/" style="color: #06b6d4; text-decoration: none; font-weight: bold;">
          ${escapeHtml(sim.disciplineName)}
        </a>
        <span>&bull;</span>
        <span>${escapeHtml(sim.difficulty)} Level</span>
        <span>&bull;</span>
        <span style="background: rgba(6,182,212,0.15); padding: 0.15rem 0.5rem; border-radius: 4px; border: 1px solid rgba(6,182,212,0.3); color: #38bdf8;">${escapeHtml(sim.badge)}</span>
        ${sim.standardReference ? `<span>&bull;</span> <span style="background: rgba(59,130,246,0.15); padding: 0.15rem 0.5rem; border-radius: 4px; border: 1px solid rgba(59,130,246,0.3); color: #93c5fd;">${escapeHtml(sim.standardReference.split('/')[0].trim())}</span>` : ''}
      </div>
      <h1 style="font-size: 2.25rem; font-weight: 800; color: #ffffff; margin: 0 0 0.75rem 0; line-height: 1.25;">
        ${escapeHtml(sim.title)} &mdash; ${escapeHtml(sim.disciplineName)}
      </h1>
      <p style="font-size: 1.15rem; color: #cbd5e1; margin: 0; line-height: 1.6;">
        ${escapeHtml(sim.description)}
      </p>
    </header>

    <!-- Simulation Controls Aside (Crawlers recognize this as non-text toolbar) -->
    <aside aria-label="Simulation Controls" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.5rem; padding: 0.75rem 1rem; margin-bottom: 2rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; font-size: 0.85rem; font-family: monospace; color: #94a3b8;">
      <div>
        <strong style="color: #38bdf8;">SIMULATION WORKBENCH:</strong> 60 FPS First-Principles Solver | Double-Precision Integration
      </div>
      <div>
        <span>Controls: Pause &bull; 0.5x / 1x / 2x &bull; Reset &bull; Scope Cursors &bull; Guided Labs</span>
      </div>
    </aside>

    <!-- SECTION 1: GOVERNING EQUATIONS & MATHEMATICAL FORMULATION -->
    <section id="governing-equations" style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(6, 182, 212, 0.35); border-radius: 0.75rem; padding: 1.75rem; margin-bottom: 2.5rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);">
      <h2 style="font-size: 1.35rem; font-weight: 700; color: #38bdf8; margin: 0 0 0.75rem 0; display: flex; align-items: center; gap: 0.5rem;">
        <span>&fnof;(x)</span> Governing Equations &amp; Mathematical Formulation
      </h2>
      <p style="color: #cbd5e1; font-size: 0.95rem; margin: 0 0 1rem 0;">
        <strong>Governing Physical Law:</strong> ${escapeHtml(sim.physicalLaw)} &mdash; ${escapeHtml(sim.equationDescription)}. Continuous dynamic trajectory integration satisfies the canonical differential/algebraic equations:
      </p>
      <div style="background: #030712; padding: 1.25rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.12); font-family: 'Courier New', Courier, monospace; font-size: 1.15rem; color: #a5f3fc; overflow-x: auto; white-space: pre-wrap; word-break: break-word; margin-bottom: 1.25rem;">
${escapeHtml(cleanEq)}
      </div>

      <h3 style="font-size: 0.95rem; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em; font-family: monospace; margin: 0 0 0.75rem 0;">
        Definition of Formulation Variables &amp; Standard SI Units
      </h3>
      <dl style="margin: 0; padding: 0;">
        ${variableDefinitions}
      </dl>

      ${sim.analyticalProof ? `
      <div style="background: rgba(3, 7, 18, 0.8); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 0.5rem; padding: 1rem; margin-top: 1.25rem;">
        <strong style="color: #38bdf8; font-family: monospace; font-size: 0.85rem; display: block; margin-bottom: 0.35rem;">
          Analytical Mathematical Derivation:
        </strong>
        <p style="color: #cbd5e1; font-size: 0.875rem; margin: 0; line-height: 1.6;">
          ${escapeHtml(cleanLatexToPlainText(sim.analyticalProof))}
        </p>
      </div>` : ''}
    </section>

    <!-- SECTION 2: BOUNDARY CONDITIONS & INDUSTRIAL OPERATING LIMITS -->
    <section id="boundary-conditions" style="background: rgba(30, 41, 59, 0.45); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.75rem; padding: 1.75rem; margin-bottom: 2.5rem;">
      <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0 0 1rem 0; border-left: 4px solid #f59e0b; padding-left: 0.75rem;">
        Boundary Conditions &amp; Industrial Operating Limits
      </h2>
      <div style="font-size: 0.95rem; color: #cbd5e1; line-height: 1.7;">
        <p style="margin: 0 0 1rem 0;">
          <strong style="color: #f59e0b;">Critical Saturation Boundary:</strong>
          ${escapeHtml(details.boundaryConditions.saturationThreshold)}
        </p>
        <p style="margin: 0 0 1rem 0;">
          <strong style="color: #f87171;">Governing Failure Mechanism:</strong>
          ${escapeHtml(details.boundaryConditions.failureMode)}
        </p>
        <p style="margin: 0 0 1rem 0;">
          <strong style="color: #38bdf8;">Referenced Industrial Standards:</strong>
          ${escapeHtml(standardsText)} (Standards Authority: ${escapeHtml(standardsBody)})
        </p>
        ${sim.fieldInsights ? `
        <p style="margin: 0 0 1rem 0;">
          <strong style="color: #34d399;">Field Engineering Remediation:</strong>
          ${escapeHtml(sim.fieldInsights)}
        </p>` : ''}
        ${sim.courseMapping ? `
        <p style="margin: 0;">
          <strong style="color: #c084fc;">University Curricular Alignment:</strong>
          ${escapeHtml(sim.courseMapping)}
        </p>` : ''}
      </div>
    </section>

    <!-- SECTION 3: WORKED ENGINEERING SCENARIOS (COMPARISON TABLE) -->
    <section id="engineering-scenarios" style="margin-bottom: 2.5rem;">
      <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0 0 1rem 0; border-left: 4px solid #10b981; padding-left: 0.75rem;">
        Worked Engineering Scenarios &amp; Operating States
      </h2>
      <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 1rem;">
        Comparison of 3 realistic operating regimes computed from first-principles governing formulations:
      </p>
      <div style="overflow-x: auto; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.75rem;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
          <thead>
            <tr style="background: rgba(3, 7, 18, 0.8); border-bottom: 1px solid rgba(255,255,255,0.15); color: #94a3b8; font-family: monospace; font-size: 0.8rem; text-transform: uppercase;">
              <th style="padding: 0.75rem 0.75rem;">Operating State</th>
              <th style="padding: 0.75rem 0.75rem;">Input Parameters</th>
              <th style="padding: 0.75rem 0.75rem;">Physical Response &amp; Solved Metrics</th>
              <th style="padding: 0.75rem 0.75rem;">Engineering Diagnostic</th>
            </tr>
          </thead>
          <tbody>
            ${scenarioRows}
          </tbody>
        </table>
      </div>
    </section>

    <!-- SECTION 4: TECHNICAL FAQ (3 DOMAIN-SPECIFIC Q&AS) -->
    <section id="technical-faq" style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.75rem; padding: 1.75rem; margin-bottom: 2.5rem;">
      <h2 style="font-size: 1.35rem; font-weight: 700; color: #c084fc; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
        <span>?</span> Technical Engineering FAQ
      </h2>
      <p style="color: #94a3b8; font-size: 0.95rem; margin-bottom: 1.25rem;">
        Domain-specific questions, stability boundaries, and industrial troubleshooting for ${escapeHtml(sim.title)}:
      </p>
      <div>
        ${faqItems}
      </div>
    </section>

    <!-- SECTION 5: INTERNAL SITE GRAPH NAVIGATION LINKS -->
    <section id="related-simulators" style="margin-top: 2rem; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 1.75rem;">
      <h3 style="font-size: 1.2rem; font-weight: 700; color: #ffffff; margin: 0 0 1rem 0;">
        Related ${escapeHtml(sim.disciplineName)} Simulators &amp; Laboratories
      </h3>
      <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1rem;">
        Explore complementary interactive models within ${escapeHtml(dept ? dept.name : sim.disciplineName)}:
      </p>
      <ul style="list-style-type: none; padding: 0; margin: 0 0 1.5rem 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem;">
        ${relatedLinks}
      </ul>
      <div>
        <a href="/department/${dept ? dept.id : sim.discipline}/" style="display: inline-block; padding: 0.6rem 1.25rem; background: rgba(6,182,212,0.15); border: 1px solid rgba(6,182,212,0.4); border-radius: 0.5rem; color: #38bdf8; text-decoration: none; font-weight: 600; font-size: 0.9rem;">
          Explore Complete ${escapeHtml(dept ? dept.name : sim.disciplineName)} Hub &rarr;
        </a>
      </div>
    </section>

  </article>`;
}

/**
 * Generates semantic static HTML for department pages.
 */
function renderDepartmentStaticContent(dept) {
  const sims = ALL_AVAILABLE_SIMULATORS.filter((s) => s.discipline === dept.id);
  const cleanCore = cleanLatexToPlainText(dept.coreEquation);

  const simCards = sims
    .map(
      (s) => `
      <li style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.5rem; padding: 1.25rem; margin-bottom: 0.75rem;">
        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.15rem;">
          <a href="/simulator/${s.id}/" style="color: #38bdf8; text-decoration: underline; font-weight: 700;">
            ${escapeHtml(s.title)} &rarr;
          </a>
        </h3>
        <p style="color: #cbd5e1; font-size: 0.9rem; margin: 0 0 0.5rem 0; line-height: 1.5;">${escapeHtml(s.tagline)}</p>
        <div style="font-size: 0.8rem; font-family: monospace; color: #94a3b8;">
          Equation: \`${escapeHtml(cleanLatexToPlainText(s.governingEquation))}\`
        </div>
      </li>`
    )
    .join('');

  return `
  <article id="seo-static-content" style="max-width: 58rem; margin: 0 auto; padding: 2.5rem 1.5rem; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
    <header style="margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 1.5rem;">
      <p style="font-size: 0.85rem; font-family: monospace; color: #06b6d4; text-transform: uppercase; margin: 0 0 0.5rem 0;">Engineering Department &bull; ${escapeHtml(dept.code)}</p>
      <h1 style="font-size: 2.4rem; font-weight: 800; color: #ffffff; margin: 0 0 1rem 0;">
        ${escapeHtml(dept.name)} (${escapeHtml(dept.code)})
      </h1>
      <p style="font-size: 1.15rem; color: #cbd5e1; margin: 0 0 1.25rem 0; line-height: 1.6;">
        ${escapeHtml(dept.description)}
      </p>
      <div style="background: #030712; padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1); font-family: monospace; color: #a5f3fc; font-size: 1.05rem;">
        Core Discipline Equation: \`${escapeHtml(cleanCore)}\`
      </div>
    </header>

    <section style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.4rem; font-weight: 700; color: #ffffff; margin: 0 0 1rem 0;">Curricular Subfields &amp; Focus Domains</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        ${dept.subfields.map((sub) => `<span style="background: rgba(255,255,255,0.08); padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.85rem; color: #cbd5e1;">${escapeHtml(sub)}</span>`).join('')}
      </div>
    </section>

    <section>
      <h2 style="font-size: 1.4rem; font-weight: 700; color: #ffffff; margin: 0 0 1rem 0;">
        Interactive Engineering Simulators (${sims.length})
      </h2>
      <ul style="list-style-type: none; padding: 0; margin: 0;">
        ${simCards}
      </ul>
    </section>
  </article>`;
}

/**
 * Generates semantic static HTML for lab pages.
 */
function renderLabStaticContent(lab) {
  const modulesList = lab.moduleList
    ? lab.moduleList.map((m) => `<li style="padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.06);"><strong style="color: #38bdf8;">${escapeHtml(m.name)}</strong>: <span style="color: #94a3b8;">${escapeHtml(m.tag)}</span></li>`).join('')
    : '';

  return `
  <article id="seo-static-content" style="max-width: 58rem; margin: 0 auto; padding: 2.5rem 1.5rem; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
    <header style="margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 1.5rem;">
      <div style="font-size: 0.85rem; font-family: monospace; color: #06b6d4; text-transform: uppercase; margin-bottom: 0.5rem;">Industrial Laboratory Suite &bull; ${escapeHtml(lab.dept)}</div>
      <h1 style="font-size: 2.4rem; font-weight: 800; color: #ffffff; margin: 0 0 1rem 0;">${escapeHtml(lab.name)}</h1>
      <p style="font-size: 1.15rem; color: #cbd5e1; margin: 0 0 1rem 0; line-height: 1.6;">${escapeHtml(lab.tagline)}</p>
      <div style="font-size: 0.9rem; color: #94a3b8;">Referencing Standard: <strong style="color: #fbbf24;">${escapeHtml(lab.standardBadge)}</strong> &bull; ${lab.modules} Interactive Modules</div>
    </header>

    <section style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.3rem; font-weight: 700; color: #ffffff; margin: 0 0 0.75rem 0;">Target Sectors &amp; Plant Environments</h2>
      <p style="color: #cbd5e1;">${escapeHtml(lab.sectors.join(', '))}</p>
    </section>

    <section style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.3rem; font-weight: 700; color: #ffffff; margin: 0 0 0.75rem 0;">Key Engineering Capabilities</h2>
      <ul style="color: #cbd5e1; padding-left: 1.25rem;">
        ${lab.capabilities.map((c) => `<li style="margin-bottom: 0.5rem;">${escapeHtml(c)}</li>`).join('')}
      </ul>
    </section>

    <section>
      <h2 style="font-size: 1.3rem; font-weight: 700; color: #ffffff; margin: 0 0 0.75rem 0;">Included Laboratory Workbench Modules</h2>
      <ul style="list-style-type: none; padding: 0;">
        ${modulesList}
      </ul>
    </section>
  </article>`;
}

/**
 * Generates semantic static HTML for the homepage.
 */
function renderHomeStaticContent() {
  const deptList = DISCIPLINES.map(
    (d) => `
    <li style="margin-bottom: 1rem; background: rgba(30,41,59,0.4); padding: 1.25rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.08);">
      <h3 style="margin: 0 0 0.5rem 0;"><a href="/department/${d.id}/" style="color: #38bdf8; text-decoration: underline; font-weight: bold;">${escapeHtml(d.name)} (${escapeHtml(d.code)}) &rarr;</a></h3>
      <p style="color: #cbd5e1; font-size: 0.95rem; margin: 0 0 0.5rem 0;">${escapeHtml(d.description)}</p>
      <div style="font-family: monospace; font-size: 0.85rem; color: #94a3b8;">Core Equation: \`${escapeHtml(cleanLatexToPlainText(d.coreEquation))}\`</div>
    </li>`
  ).join('');

  return `
  <article id="seo-static-content" style="max-width: 58rem; margin: 0 auto; padding: 2.5rem 1.5rem; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
    <header style="margin-bottom: 2.5rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 2rem;">
      <h1 style="font-size: 2.75rem; font-weight: 800; color: #ffffff; margin: 0 0 1rem 0; line-height: 1.2;">
        LiveSimulators &mdash; Interactive Engineering Simulators &amp; Virtual Labs
      </h1>
      <p style="font-size: 1.2rem; color: #cbd5e1; max-width: 44rem; margin: 0 auto; line-height: 1.6;">
        Free open-access interactive engineering simulations and virtual laboratories. Don't just read engineering formulas &mdash; see them in action with real-time 60 FPS physics in your browser.
      </p>
    </header>

    <section style="margin-bottom: 2.5rem;">
      <h2 style="font-size: 1.6rem; font-weight: 700; color: #ffffff; margin: 0 0 1.25rem 0;">Engineering Disciplines &amp; Curricular Workbenches</h2>
      <ul style="list-style-type: none; padding: 0; margin: 0;">
        ${deptList}
      </ul>
    </section>

    <section style="margin-bottom: 2rem;">
      <h2 style="font-size: 1.6rem; font-weight: 700; color: #ffffff; margin: 0 0 1.25rem 0;">Industrial Labs Pro Suites</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem;">
        ${LABS.map((l) => `
        <div style="background: rgba(30,41,59,0.3); padding: 1rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.08);">
          <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;"><a href="/lab/${l.id}/" style="color: #38bdf8; text-decoration: underline;">${escapeHtml(l.name)} &rarr;</a></h3>
          <p style="color: #94a3b8; font-size: 0.85rem; margin: 0;">${escapeHtml(l.tagline)}</p>
        </div>`).join('')}
      </div>
    </section>
  </article>`;
}

/**
 * Generates semantic static HTML for static informational pages.
 */
function renderStaticPageContent(view) {
  switch (view) {
    case 'about':
      return `
      <article id="seo-static-content" style="max-width: 52rem; margin: 0 auto; padding: 2.5rem 1.5rem; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.7;">
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #ffffff; margin: 0 0 1rem 0;">About LiveSimulators &mdash; The Numerical Pedagogy Platform</h1>
        <p style="font-size: 1.1rem; color: #cbd5e1; margin-bottom: 1.5rem;">LiveSimulators is an independent educational engineering platform dedicated to replacing static textbook equations with real-time, interactive, first-principles simulations.</p>
        <p>Built with 4th-Order Runge-Kutta (RK4) numerical ODE solvers and symplectic physics integrators running client-side at 60 FPS in modern browsers.</p>
        <p>Founded by Anil Sharma. Calculations reference published methodologies in IEEE, IEC, ASME, API, and ISA literature.</p>
      </article>`;
    case 'contact':
      return `
      <article id="seo-static-content" style="max-width: 52rem; margin: 0 auto; padding: 2.5rem 1.5rem; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.7;">
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #ffffff; margin: 0 0 1rem 0;">Contact LiveSimulators Engineering Desk</h1>
        <p style="font-size: 1.1rem; color: #cbd5e1;">Have suggestions for new simulator models, analytical equation corrections, or university laboratory collaborations? Reach out directly to founder Anil Sharma at <code>0808miracle@gmail.com</code>.</p>
      </article>`;
    case 'terms':
      return `
      <article id="seo-static-content" style="max-width: 52rem; margin: 0 auto; padding: 2.5rem 1.5rem; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.7;">
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #ffffff; margin: 0 0 1rem 0;">Terms of Service &mdash; LiveSimulators</h1>
        <p style="font-size: 1.1rem; color: #cbd5e1;">LiveSimulators provides open-access engineering simulators for educational and training purposes. All computational simulations are numerical approximations.</p>
      </article>`;
    case 'privacy-policy':
      return `
      <article id="seo-static-content" style="max-width: 52rem; margin: 0 auto; padding: 2.5rem 1.5rem; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.7;">
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #ffffff; margin: 0 0 1rem 0;">Privacy Policy &mdash; LiveSimulators</h1>
        <p style="font-size: 1.1rem; color: #cbd5e1;">LiveSimulators operates client-side in your web browser. We do not sell user data. Telemetry is limited to standard performance analytics.</p>
      </article>`;
    case 'disclaimer':
      return `
      <article id="seo-static-content" style="max-width: 52rem; margin: 0 auto; padding: 2.5rem 1.5rem; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.7;">
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #ffffff; margin: 0 0 1rem 0;">Simulation Disclaimer &mdash; LiveSimulators</h1>
        <p style="font-size: 1.1rem; color: #cbd5e1;">Simulations provided on this platform are for academic study, concept verification, and educational exploration. Critical plant designs require verification by licensed Professional Engineers.</p>
      </article>`;
    case 'cookie-policy':
      return `
      <article id="seo-static-content" style="max-width: 52rem; margin: 0 auto; padding: 2.5rem 1.5rem; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.7;">
        <h1 style="font-size: 2.25rem; font-weight: 800; color: #ffffff; margin: 0 0 1rem 0;">Cookie Policy &mdash; LiveSimulators</h1>
        <p style="font-size: 1.1rem; color: #cbd5e1;">Review disclosures on telemetry and cookie settings across the LiveSimulators platform.</p>
      </article>`;
    default:
      return '<article id="seo-static-content"><h1>LiveSimulators</h1></article>';
  }
}

/**
 * Main post-build static pre-rendering pipeline.
 */
async function runPrerenderRoutes() {
  console.log('⚡ Starting LiveSimulators Post-Build Static HTML Pre-Rendering Pipeline...');

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

  // Strip any old static placeholder inside <div id="root">
  templateHtml = templateHtml.replace(
    /<div id="root">[\s\S]*?<\/div>(\s*<div id="seo-fallback">[\s\S]*?<\/div>|\s*<noscript id="seo-fallback">[\s\S]*?<\/noscript>)?/i,
    '<div id="root"></div>'
  );

  // 1. Discover all routes
  const routesToPrerender = [
    { view: 'home' },
    { view: 'about' },
    { view: 'contact' },
    { view: 'cookie-policy' },
    { view: 'disclaimer' },
    { view: 'privacy-policy' },
    { view: 'terms' },
    ...DISCIPLINES.map((d) => ({ view: 'department', departmentId: d.id })),
    ...ALL_AVAILABLE_SIMULATORS.map((s) => ({ view: 'simulator', simulatorId: s.id })),
    ...ALL_AVAILABLE_SIMULATORS.map((s) => ({ view: 'embed', simulatorId: s.id })),
    ...LABS.map((l) => ({ view: 'lab', labId: l.id })),
  ];

  console.log(`📦 Discovered ${routesToPrerender.length} distinct routes to pre-render.`);

  // 2. Pre-render each route
  let generatedCount = 0;
  for (const route of routesToPrerender) {
    const meta = getSeoMetadata(route);
    const routePath = routeToPath(route);

    let html = templateHtml;

    // 2a. Replace Title
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);

    // 2b. Set Description & Robots meta tags
    html = setMetaTag(html, 'name', 'description', meta.description);
    html = setMetaTag(html, 'name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large');

    // 2c. Set Strict Canonical Link Tag with trailing slash
    const cleanCanonicalUrl = meta.canonicalUrl.split('?')[0].split('#')[0];
    const canonicalRegex = /<link\s+rel="canonical"[^>]*>/i;
    const canonicalTag = `<link rel="canonical" href="${cleanCanonicalUrl}" />`;
    if (canonicalRegex.test(html)) {
      html = html.replace(canonicalRegex, canonicalTag);
    } else {
      html = html.replace('</head>', `  ${canonicalTag}\n  </head>`);
    }

    // 2d. Set OpenGraph & Twitter tags
    html = setMetaTag(html, 'property', 'og:title', meta.title);
    html = setMetaTag(html, 'property', 'og:description', meta.description);
    html = setMetaTag(html, 'property', 'og:url', cleanCanonicalUrl);
    html = setMetaTag(html, 'property', 'og:type', meta.ogType);
    html = setMetaTag(html, 'property', 'og:image', meta.ogImage);

    html = setMetaTag(html, 'name', 'twitter:card', 'summary_large_image');
    html = setMetaTag(html, 'name', 'twitter:title', meta.title);
    html = setMetaTag(html, 'name', 'twitter:description', meta.description);
    html = setMetaTag(html, 'name', 'twitter:image', meta.ogImage);

    // 2e. Set Schema.org JSON-LD Script
    const graphData = getRouteSchema(route);
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

    // 3. Inject Semantic Static HTML directly inside <div id="root">
    let staticContent = '';
    if (route.view === 'simulator') {
      const sim = ALL_AVAILABLE_SIMULATORS.find((s) => s.id === route.simulatorId);
      staticContent = sim ? renderSimulatorStaticContent(sim) : '';
    } else if (route.view === 'department') {
      const dept = DISCIPLINES.find((d) => d.id === route.departmentId);
      staticContent = dept ? renderDepartmentStaticContent(dept) : '';
    } else if (route.view === 'lab') {
      const lab = LABS.find((l) => l.id === route.labId);
      staticContent = lab ? renderLabStaticContent(lab) : '';
    } else if (route.view === 'home') {
      staticContent = renderHomeStaticContent();
    } else {
      staticContent = renderStaticPageContent(route.view);
    }

    // Replace <div id="root"></div> with populated root containing semantic static article
    html = html.replace(
      /<div id="root">[\s\S]*?<\/div>/i,
      `<div id="root">\n${staticContent}\n</div>`
    );

    // 4. Output route-specific index.html in dist/
    let targetFile;
    if (routePath === '/') {
      targetFile = path.join(distDir, 'index.html');
    } else {
      const cleanSubDir = routePath.replace(/^\//, '').replace(/\/$/, '');
      const pageDir = path.join(distDir, cleanSubDir);
      if (!fs.existsSync(pageDir)) {
        fs.mkdirSync(pageDir, { recursive: true });
      }
      targetFile = path.join(pageDir, 'index.html');
    }

    fs.writeFileSync(targetFile, html, 'utf8');
    generatedCount++;
  }

  // 5. Generate 404.html with branded not-found content
  const notFoundMeta = getSeoMetadata({ view: 'not-found' });
  let notFoundHtml = templateHtml;
  notFoundHtml = notFoundHtml.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(notFoundMeta.title)}</title>`);
  notFoundHtml = setMetaTag(notFoundHtml, 'name', 'description', notFoundMeta.description);
  notFoundHtml = setMetaTag(notFoundHtml, 'name', 'robots', 'noindex, follow');
  notFoundHtml = setMetaTag(notFoundHtml, 'property', 'og:title', notFoundMeta.title);
  notFoundHtml = setMetaTag(notFoundHtml, 'property', 'og:description', notFoundMeta.description);
  notFoundHtml = setMetaTag(notFoundHtml, 'property', 'og:image', notFoundMeta.ogImage);
  notFoundHtml = notFoundHtml.replace(
    /<div id="root">[\s\S]*?<\/div>/i,
    `<div id="root">
      <article id="seo-static-content" style="max-width:48rem; margin:0 auto; padding:5rem 1.5rem; text-align:center; font-family:sans-serif;">
        <h1 style="font-size:4.5rem; font-weight:900; color:#f43f5e; margin:0 0 0.5rem; line-height:1;">404</h1>
        <h2 style="font-size:1.75rem; font-weight:bold; color:#ffffff; margin-bottom:1rem;">Coordinate Not Found in Numerical Field</h2>
        <p style="color:#94a3b8; margin-bottom:2rem; font-size:1rem; line-height:1.6;">The requested route does not correspond to an active engineering simulator, department workbench, or institutional page.</p>
        <div>
          <a href="/" style="display:inline-block; padding:0.75rem 1.5rem; background:#06b6d4; color:#030712; font-weight:bold; border-radius:0.75rem; text-decoration:none; font-size:0.875rem;">Return to Home Hub &rarr;</a>
        </div>
      </article>
    </div>`
  );
  fs.writeFileSync(path.join(distDir, '404.html'), notFoundHtml, 'utf8');

  // 6. Generate dist/sitemap.xml and public/sitemap.xml with today's lastmod and trailing slashes
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
      } else if (p === '/about/' || p === '/contact/' || p === '/about' || p === '/contact') {
        freq = 'weekly';
        prio = '0.8';
      } else {
        freq = 'monthly';
        prio = '0.5';
      }
      const locPath = p === '/' ? '/' : (p.endsWith('/') ? p : `${p}/`);
      return `  <url>
    <loc>${SITE_URL}${locPath}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${prio}</priority>
  </url>`;
    })
    .join('\n\n');

  const guideUrls = [
    '/about/methodology.html',
    '/for-professors.html',
    '/guides/rlc-resonance-explained.html',
    '/guides/rankine-cycle-ts-diagram.html',
    '/guides/pid-tuning-step-by-step.html',
    '/guides/beam-deflection-euler-bernoulli.html',
    '/guides/four-bar-mechanism-kinematics.html',
  ];
  const guideSitemapEntries = guideUrls
    .map(
      (p) => `  <url>
    <loc>${SITE_URL}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join('\n\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
${sitemapEntries}

${guideSitemapEntries}

</urlset>
`;
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log('🗺️ Generated public/sitemap.xml & dist/sitemap.xml with standard trailing slashes');

  // 7. Copy static assets from public/ to dist/
  const assetsToCopy = [
    '_redirects',
    '_headers',
    'robots.txt',
    'og-default.png',
    'llms.txt',
    'llms-full.txt',
    'manifest.webmanifest',
    'sw.js',
    'contact-form.html',
    'for-professors.html',
  ];
  for (const asset of assetsToCopy) {
    const srcFile = path.join(publicDir, asset);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join(distDir, asset));
    }
  }

  // Copy directory assets
  const dirAssets = ['assets/labs', 'assets/hub', 'guides', 'about'];
  for (const dirAsset of dirAssets) {
    const srcSubDir = path.join(publicDir, dirAsset);
    const distSubDir = path.join(distDir, dirAsset);
    if (fs.existsSync(srcSubDir)) {
      if (!fs.existsSync(distSubDir)) {
        fs.mkdirSync(distSubDir, { recursive: true });
      }
      fs.cpSync(srcSubDir, distSubDir, { recursive: true });
    }
  }

  console.log(`✅ Static pre-rendering completed: ${generatedCount} route-specific index.html files generated.`);
}

runPrerenderRoutes();
