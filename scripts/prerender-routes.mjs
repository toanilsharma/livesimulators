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
const { getSimulatorEngineeringContent } = await import('../src/data/simulatorEngineeringContent.ts');
const {
  generateSimulatorUniqueParagraph,
  getDetailedWhyItHappened,
  getLiveResultSummary
} = await import('../src/utils/simulatorExplanations.ts');
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
  const engContent = getSimulatorEngineeringContent(sim.id);
  const directAnswer = sim.directAnswerSummary || engContent.directAnswerSummary;
  const failureCase = sim.industrialFailureCase || engContent.industrialFailureCase;
  const faqs = (sim.faqs && sim.faqs.length > 0) ? sim.faqs : engContent.faqs;
  const relatedSims = ALL_AVAILABLE_SIMULATORS.filter(
    (s) => s.discipline === sim.discipline && s.id !== sim.id
  ).slice(0, 6);

  // Dynamic Unique Paragraph and Explanations
  const defaultParams = {};
  sim.parameters.forEach((p) => {
    defaultParams[p.symbol] = p.default;
  });
  const uniqueParagraph = generateSimulatorUniqueParagraph(sim, defaultParams);
  const whyDetail = getDetailedWhyItHappened(sim.type, defaultParams);
  const liveResult = getLiveResultSummary(sim.type, defaultParams);

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
          Dynamic Range: [${escapeHtml(p.min)} to ${escapeHtml(p.max)} ${escapeHtml(p.unit || '')}] &bull; Calibrated Default: ${escapeHtml(p.default)} ${escapeHtml(p.unit || '')} &mdash; ${escapeHtml(p.description)}
        </dd>
      </div>`
    )
    .join('');

  // Telemetry sensor probe cards
  const telemetryList = (sim.keyMetrics && sim.keyMetrics.length > 0)
    ? sim.keyMetrics
    : sim.parameters.slice(0, 4).map((p) => ({
        label: p.name,
        unit: p.unit || '',
        formulaKey: p.symbol,
      }));

  const telemetryCards = telemetryList
    .map(
      (m, idx) => `
      <div style="background: rgba(3, 7, 18, 0.75); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 0.5rem; padding: 0.85rem 1rem; margin-bottom: 0.6rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
          <span style="color: #34d399; font-weight: 700; font-family: monospace; font-size: 0.9rem;">
            Probe #${idx + 1}: ${escapeHtml(m.label)}
          </span>
          <span style="color: #a7f3d0; font-family: monospace; font-size: 0.75rem; background: rgba(6, 78, 59, 0.4); border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.15rem 0.45rem; border-radius: 4px;">
            ${escapeHtml(m.unit || 'SI Standard')}
          </span>
        </div>
        <p style="color: #cbd5e1; font-size: 0.825rem; line-height: 1.5; margin: 0 0 0.35rem 0;">
          Continuous 60 FPS numerical telemetry register tracking ${escapeHtml(m.label)} state space dynamics under ${escapeHtml(sim.physicalLaw)}.
        </p>
        <div style="font-family: monospace; font-size: 0.75rem; color: #6ee7b7;">
          Register Spec: Float64 Double-Precision &bull; Active Dynamic Sensor Probe
        </div>
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

  // Assumptions & Limitations HTML
  const assumptionsList = (theory.assumptions || []).map((a) => `<li style="margin-bottom: 0.4rem; color: #cbd5e1;">&bull; ${escapeHtml(a)}</li>`).join('');
  const limitationsList = (theory.limitations || []).map((l) => `<li style="margin-bottom: 0.4rem; color: #cbd5e1;">&bull; ${escapeHtml(l)}</li>`).join('');

  // FAQs list (<details><summary> accordions)
  const faqItems = faqs
    .map(
      (f, idx) => `
      <details ${idx === 0 ? 'open' : ''} style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.6rem; padding: 1rem 1.25rem; margin-bottom: 0.75rem;">
        <summary style="font-size: 0.95rem; font-weight: 700; color: #ffffff; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; outline: none;">
          <span style="background: rgba(168, 85, 247, 0.2); color: #d8b4fe; font-family: monospace; font-size: 0.8rem; width: 1.4rem; height: 1.4rem; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;">${idx + 1}</span>
          <span>${escapeHtml(f.question)}</span>
        </summary>
        <p style="color: #cbd5e1; font-size: 0.875rem; line-height: 1.65; margin: 0.75rem 0 0 0; padding-left: 1.9rem;">
          ${escapeHtml(f.answer)}
        </p>
      </details>`
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
  <article id="seo-static-content" style="max-width: 68rem; margin: 0 auto; padding: 2.5rem 1.5rem; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
    
    <!-- Semantic Article Header: <h1> Title, Discipline Badge & Technical Summary -->
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

    <!-- Simulation Controls Aside -->
    <aside aria-label="Simulation Controls" data-nosnippet="true" aria-hidden="true" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.5rem; padding: 0.75rem 1rem; margin-bottom: 2rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; font-size: 0.85rem; font-family: monospace; color: #94a3b8;">
      <div>
        <strong style="color: #38bdf8;">SIMULATION WORKBENCH:</strong> 60 FPS First-Principles Solver | Double-Precision Integration
      </div>
      <div>
        <span>Controls: Pause &bull; 0.5x / 1x / 2x &bull; Reset &bull; Scope Cursors &bull; Guided Labs</span>
      </div>
    </aside>

    <!-- 5-Section Jump Navigation Bar for Quick User & Crawler Traversal -->
    <nav aria-label="Engineering Documentation Sections" style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.5rem; padding: 0.75rem 1rem; margin-bottom: 2.5rem; display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; font-size: 0.85rem; font-family: monospace;">
      <strong style="color: #38bdf8;">DOCUMENTATION SECTIONS:</strong>
      <a href="#section-insight" style="color: #fbbf24; text-decoration: none; padding: 0.25rem 0.6rem; background: rgba(245, 158, 11, 0.15); border-radius: 4px; border: 1px solid rgba(245, 158, 11, 0.3);">1. Insight</a>
      <a href="#section-theory" style="color: #38bdf8; text-decoration: none; padding: 0.25rem 0.6rem; background: rgba(6, 182, 212, 0.15); border-radius: 4px; border: 1px solid rgba(6, 182, 212, 0.3);">2. Theory</a>
      <a href="#section-telemetry" style="color: #34d399; text-decoration: none; padding: 0.25rem 0.6rem; background: rgba(16, 185, 129, 0.15); border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);">3. Telemetry</a>
      <a href="#section-standards" style="color: #93c5fd; text-decoration: none; padding: 0.25rem 0.6rem; background: rgba(59, 130, 246, 0.15); border-radius: 4px; border: 1px solid rgba(59, 130, 246, 0.3);">4. Standards</a>
      <a href="#section-curriculum" style="color: #c084fc; text-decoration: none; padding: 0.25rem 0.6rem; background: rgba(168, 85, 247, 0.15); border-radius: 4px; border: 1px solid rgba(168, 85, 247, 0.3);">5. Curriculum</a>
    </nav>

    <!-- SECTION 1: INSIGHT & DYNAMIC PHYSICAL PHENOMENON OVERVIEW -->
    <section id="section-insight" aria-labelledby="heading-insight" style="background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(245, 158, 11, 0.35); border-left: 4px solid #f59e0b; border-radius: 0.75rem; padding: 1.75rem; margin-bottom: 2.5rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
      <h2 id="heading-insight" style="font-size: 1.35rem; font-weight: 700; color: #fbbf24; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
        <span>✦</span> Section 1: Physical Phenomenon Insight &amp; Analytical Summary
      </h2>
      <div style="background: rgba(8, 145, 178, 0.12); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 0.5rem; padding: 1rem 1.25rem; margin-bottom: 1.25rem;">
        <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #38bdf8; margin: 0 0 0.4rem 0; font-family: monospace;">
          Direct Engineering Formulation Summary:
        </h3>
        <p style="color: #e2e8f0; font-size: 0.925rem; line-height: 1.65; margin: 0;">
          ${escapeHtml(directAnswer)}
        </p>
      </div>
      <div style="background: rgba(3, 7, 18, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; padding: 1.15rem 1.25rem; margin-bottom: 1.25rem;">
        <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #fbbf24; margin: 0 0 0.4rem 0; font-family: monospace;">
          Dynamic Simulator State &amp; Parameter Integration:
        </h3>
        <p style="color: #cbd5e1; font-size: 0.925rem; line-height: 1.7; margin: 0;">
          ${escapeHtml(uniqueParagraph)}
        </p>
      </div>
      ${whyDetail.physicalMechanism ? `
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 0.5rem; padding: 1rem 1.25rem; margin-bottom: 1rem;">
        <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #38bdf8; margin: 0 0 0.4rem 0; font-family: monospace;">
          Physical Mechanism Breakdown:
        </h3>
        <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.65; margin: 0 0 0.5rem 0;">
          ${escapeHtml(whyDetail.physicalMechanism)}
        </p>
        ${whyDetail.behaviorAcrossRange ? `
        <p style="color: #94a3b8; font-size: 0.85rem; line-height: 1.6; margin: 0;">
          <strong>Dynamic Behavior Across Parameter Spectrum:</strong> ${escapeHtml(whyDetail.behaviorAcrossRange)}
        </p>` : ''}
      </div>` : ''}
      ${whyDetail.industrialReality ? `
      <div style="background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.25); border-radius: 0.5rem; padding: 1rem 1.25rem;">
        <h3 style="font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #93c5fd; margin: 0 0 0.4rem 0; font-family: monospace;">
          Industrial Operating Reality:
        </h3>
        <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.65; margin: 0;">
          ${escapeHtml(whyDetail.industrialReality)}
        </p>
      </div>` : ''}
    </section>

    <!-- SECTION 2: THEORY & GOVERNING EQUATIONS -->
    <section id="section-theory" aria-labelledby="heading-theory" style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(6, 182, 212, 0.35); border-left: 4px solid #06b6d4; border-radius: 0.75rem; padding: 1.75rem; margin-bottom: 2.5rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);">
      <h2 id="heading-theory" style="font-size: 1.35rem; font-weight: 700; color: #38bdf8; margin: 0 0 0.75rem 0; display: flex; align-items: center; gap: 0.5rem;">
        <span>&fnof;(x)</span> Section 2: Theory &amp; Governing Equations
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
      <dl style="margin: 0 0 1.25rem 0; padding: 0;">
        ${variableDefinitions}
      </dl>

      ${sim.analyticalProof ? `
      <div style="background: rgba(3, 7, 18, 0.8); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 0.5rem; padding: 1rem 1.25rem; margin-bottom: 1.25rem;">
        <strong style="color: #38bdf8; font-family: monospace; font-size: 0.85rem; display: block; margin-bottom: 0.35rem;">
          First-Principles Analytical Derivation:
        </strong>
        <p style="color: #cbd5e1; font-size: 0.875rem; margin: 0; line-height: 1.6;">
          ${escapeHtml(cleanLatexToPlainText(sim.analyticalProof))}
        </p>
      </div>` : ''}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-top: 1rem;">
        <div style="background: rgba(3, 7, 18, 0.6); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 0.5rem; padding: 1rem;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: #fbbf24; font-family: monospace; text-transform: uppercase; margin: 0 0 0.5rem 0;">Physical Assumptions</h4>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.825rem; line-height: 1.5;">${assumptionsList}</ul>
        </div>
        <div style="background: rgba(3, 7, 18, 0.6); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 0.5rem; padding: 1rem;">
          <h4 style="font-size: 0.85rem; font-weight: 700; color: #f43f5e; font-family: monospace; text-transform: uppercase; margin: 0 0 0.5rem 0;">Operational Boundaries</h4>
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.825rem; line-height: 1.5;">${limitationsList}</ul>
        </div>
      </div>
    </section>

    <!-- SECTION 3: LIVE TELEMETRY DEFINITIONS -->
    <section id="section-telemetry" aria-labelledby="heading-telemetry" style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(16, 185, 129, 0.35); border-left: 4px solid #10b981; border-radius: 0.75rem; padding: 1.75rem; margin-bottom: 2.5rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);">
      <h2 id="heading-telemetry" style="font-size: 1.35rem; font-weight: 700; color: #34d399; margin: 0 0 0.75rem 0; display: flex; align-items: center; gap: 0.5rem;">
        <span>⚡</span> Section 3: Live Telemetry &amp; Sensor Probe Definitions
      </h2>
      <p style="color: #cbd5e1; font-size: 0.95rem; margin: 0 0 1rem 0;">
        Real-time sensor outputs, state vector variables, and continuous 60 FPS numerical integration probe registers:
      </p>
      <div style="margin-bottom: 1.25rem;">
        ${telemetryCards}
      </div>
      <div style="background: rgba(3, 7, 18, 0.8); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 0.5rem; padding: 1rem; font-family: monospace; font-size: 0.825rem; color: #94a3b8; display: flex; flex-wrap: wrap; justify-content: space-between; gap: 0.5rem;">
        <div><strong style="color: #34d399;">INTEGRATION ENGINE:</strong> Float64 Double-Precision RK4 Solver</div>
        <div><strong style="color: #38bdf8;">SAMPLING FREQUENCY:</strong> 60 FPS Continuous Real-Time</div>
      </div>
    </section>

    <!-- SECTION 4: APPLICABLE ENGINEERING STANDARDS -->
    <section id="section-standards" aria-labelledby="heading-standards" style="background: rgba(30, 41, 59, 0.45); border: 1px solid rgba(59, 130, 246, 0.35); border-left: 4px solid #3b82f6; border-radius: 0.75rem; padding: 1.75rem; margin-bottom: 2.5rem;">
      <h2 id="heading-standards" style="font-size: 1.35rem; font-weight: 700; color: #93c5fd; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
        <span>🏆</span> Section 4: Applicable Engineering Standards &amp; Failure RCA
      </h2>
      <div style="font-size: 0.95rem; color: #cbd5e1; line-height: 1.7;">
        <div style="background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.35); border-radius: 0.5rem; padding: 1rem 1.25rem; margin-bottom: 1.25rem;">
          <h3 style="font-size: 0.85rem; font-weight: 700; color: #93c5fd; text-transform: uppercase; letter-spacing: 0.05em; font-family: monospace; margin: 0 0 0.35rem 0;">
            Published Consensus Standard:
          </h3>
          <div style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem;">
            ${escapeHtml(standardsText)}
          </div>
          <div style="font-size: 0.85rem; color: #94a3b8; font-family: monospace;">
            Standards Authority: ${escapeHtml(standardsBody)}
          </div>
        </div>

        <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 0.5rem; padding: 1rem 1.25rem; margin-bottom: 1.25rem;">
          <h3 style="font-size: 0.9rem; font-weight: 700; color: #f87171; text-transform: uppercase; letter-spacing: 0.05em; font-family: monospace; margin: 0 0 0.5rem 0;">
            Industrial Failure Mode, RCA &amp; Protection Limits:
          </h3>
          <p style="color: #cbd5e1; font-size: 0.9rem; line-height: 1.65; margin: 0;">
            ${escapeHtml(failureCase)}
          </p>
        </div>

        ${sim.validationTest ? `
        <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 0.5rem; padding: 1rem 1.25rem; margin-bottom: 1.25rem;">
          <h3 style="font-size: 0.85rem; font-weight: 700; color: #34d399; text-transform: uppercase; letter-spacing: 0.05em; font-family: monospace; margin: 0 0 0.35rem 0;">
            Numerical Benchmark Validation (Error Threshold &lt; 0.2%):
          </h3>
          <p style="color: #cbd5e1; font-size: 0.875rem; font-family: monospace; line-height: 1.6; margin: 0;">
            ${escapeHtml(sim.validationTest)}
          </p>
        </div>` : ''}

        ${sim.colorStandardRule ? `
        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 0.5rem; padding: 1rem 1.25rem; margin-bottom: 1.25rem;">
          <strong style="color: #f59e0b; font-size: 0.85rem; font-family: monospace; display: block; margin-bottom: 0.25rem;">
            Waveform &amp; Color Topology Rule:
          </strong>
          <p style="color: #cbd5e1; font-size: 0.875rem; font-family: monospace; margin: 0;">
            ${escapeHtml(sim.colorStandardRule)}
          </p>
        </div>` : ''}

        <p style="margin: 0 0 0.75rem 0;">
          <strong style="color: #f59e0b;">Critical Saturation Boundary:</strong>
          ${escapeHtml(details.boundaryConditions.saturationThreshold)}
        </p>
        <p style="margin: 0 0 0.75rem 0;">
          <strong style="color: #f87171;">Governing Failure Mechanism:</strong>
          ${escapeHtml(details.boundaryConditions.failureMode)}
        </p>
        ${sim.fieldInsights ? `
        <p style="margin: 0;">
          <strong style="color: #34d399;">Field Engineering Remediation:</strong>
          ${escapeHtml(sim.fieldInsights)}
        </p>` : ''}
      </div>
    </section>

    <!-- SECTION 5: UNIVERSITY CURRICULUM MAPPING & SCENARIOS -->
    <section id="section-curriculum" aria-labelledby="heading-curriculum" style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(168, 85, 247, 0.35); border-left: 4px solid #a855f7; border-radius: 0.75rem; padding: 1.75rem; margin-bottom: 2.5rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);">
      <h2 id="heading-curriculum" style="font-size: 1.35rem; font-weight: 700; color: #c084fc; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
        <span>🎓</span> Section 5: University Curriculum Mapping &amp; Worked Scenarios
      </h2>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
        <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 0.5rem; padding: 1rem;">
          <h3 style="font-size: 0.85rem; font-weight: 700; color: #c084fc; text-transform: uppercase; letter-spacing: 0.05em; font-family: monospace; margin: 0 0 0.4rem 0;">
            University Course Alignment:
          </h3>
          <p style="color: #e2e8f0; font-size: 0.9rem; font-family: monospace; margin: 0;">
            ${escapeHtml(sim.courseMapping || 'ENG-101 / Core Engineering Curriculum')}
          </p>
        </div>
        <div style="background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 0.5rem; padding: 1rem;">
          <h3 style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.05em; font-family: monospace; margin: 0 0 0.4rem 0;">
            Standard Textbook References:
          </h3>
          <p style="color: #cbd5e1; font-size: 0.875rem; line-height: 1.5; margin: 0;">
            ${escapeHtml(sim.textbookReferences || 'First-Principles Engineering Curriculum Standard References')}
          </p>
        </div>
      </div>

      <h3 style="font-size: 1.1rem; font-weight: 700; color: #ffffff; margin: 0 0 0.75rem 0;">
        Worked Engineering Scenarios &amp; Operating States (3-State Comparison)
      </h3>
      <p style="color: #94a3b8; font-size: 0.9rem; margin-bottom: 1rem;">
        Comparison of 3 realistic operating regimes computed from first-principles governing formulations:
      </p>
      <div style="overflow-x: auto; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.75rem; margin-bottom: 1.5rem;">
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

      <h3 style="font-size: 1.1rem; font-weight: 700; color: #c084fc; margin: 0 0 0.75rem 0;">
        Frequently Asked Technical Questions:
      </h3>
      <div>
        ${faqItems}
      </div>
    </section>

    <!-- SECTION 6: INTERNAL SITE GRAPH NAVIGATION LINKS -->
    <section id="section-related" aria-labelledby="heading-related-simulators" style="margin-top: 2rem; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 1.75rem;">
      <h3 id="heading-related-simulators" style="font-size: 1.2rem; font-weight: 700; color: #ffffff; margin: 0 0 1rem 0;">
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

  // Collect unique standards referenced across all simulators in this department
  const standardsSet = new Set();
  sims.forEach((s) => {
    if (s.standardReference) standardsSet.add(s.standardReference);
    if (s.standardBody) standardsSet.add(s.standardBody);
  });
  const standardsList = Array.from(standardsSet);

  const standardsHtml = standardsList.length > 0
    ? `
    <section id="department-standards" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 2rem;">
      <h2 style="font-size: 1.25rem; font-weight: 700; color: #38bdf8; margin: 0 0 0.75rem 0;">
        Referenced International Consensus Standards (${standardsList.length})
      </h2>
      <p style="color: #94a3b8; font-size: 0.875rem; margin-bottom: 1rem;">
        Mathematical boundaries, physical tolerance thresholds, and sizing criteria across ${escapeHtml(dept.name)} conform to published industry codes:
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
        ${standardsList.map((std) => `<span style="background: rgba(6,182,212,0.12); border: 1px solid rgba(6,182,212,0.3); color: #a5f3fc; padding: 0.35rem 0.65rem; border-radius: 4px; font-family: monospace; font-size: 0.8rem;">${escapeHtml(std)}</span>`).join('')}
      </div>
    </section>`
    : '';

  const simCards = sims
    .map(
      (s) => `
      <li style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.5rem; padding: 1.25rem; margin-bottom: 0.75rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.5rem;">
          <h3 style="margin: 0; font-size: 1.15rem;">
            <a href="/simulator/${s.id}/" style="color: #38bdf8; text-decoration: underline; font-weight: 700;">
              ${escapeHtml(s.title)} &rarr;
            </a>
          </h3>
          <span style="font-size: 0.75rem; font-family: monospace; background: rgba(6,182,212,0.15); border: 1px solid rgba(6,182,212,0.3); color: #38bdf8; padding: 0.15rem 0.5rem; border-radius: 4px;">
            ${escapeHtml(s.badge)} &bull; ${escapeHtml(s.difficulty)} Level
          </span>
        </div>
        <p style="color: #cbd5e1; font-size: 0.9rem; margin: 0 0 0.5rem 0; line-height: 1.5;">${escapeHtml(s.tagline || s.description)}</p>
        <div style="font-size: 0.8rem; font-family: monospace; color: #a5f3fc; background: #030712; padding: 0.4rem 0.6rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 0.5rem; word-break: break-word;">
          Governing Formulation: \`${escapeHtml(cleanLatexToPlainText(s.governingEquation))}\`
        </div>
        ${s.standardReference ? `<div style="font-size: 0.75rem; color: #94a3b8; font-family: monospace;">Standard: ${escapeHtml(s.standardReference)}</div>` : ''}
      </li>`
    )
    .join('');

  return `
  <article id="seo-static-content" style="max-width: 62rem; margin: 0 auto; padding: 2.5rem 1.5rem; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6;">
    <header style="margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 1.5rem;">
      <nav aria-label="Breadcrumb" style="font-size: 0.85rem; font-family: monospace; color: #06b6d4; margin-bottom: 0.75rem;">
        <a href="/" style="color: #06b6d4; text-decoration: none;">Home</a> / 
        <span style="color: #94a3b8;">${escapeHtml(dept.name)}</span>
      </nav>
      <div style="font-size: 0.85rem; font-family: monospace; color: #06b6d4; text-transform: uppercase; margin-bottom: 0.5rem;">
        University Engineering Department Hub &bull; ${escapeHtml(dept.code)}
      </div>
      <h1 style="font-size: 2.4rem; font-weight: 800; color: #ffffff; margin: 0 0 1rem 0; line-height: 1.25;">
        ${escapeHtml(dept.name)} Simulators Hub &amp; Curricular Syllabus (${escapeHtml(dept.code)})
      </h1>
      <p style="font-size: 1.15rem; color: #cbd5e1; margin: 0 0 1.25rem 0; line-height: 1.6;">
        ${escapeHtml(dept.description)}
      </p>
      <div style="background: #030712; padding: 1.25rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.12); font-family: monospace; color: #a5f3fc; font-size: 1.05rem; overflow-x: auto;">
        <div style="font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.35rem;">Canonical Governing Formulation:</div>
        \`${escapeHtml(cleanCore)}\`
      </div>
    </header>

    <section id="department-syllabus" style="margin-bottom: 2rem; background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.75rem; padding: 1.5rem;">
      <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0 0 0.75rem 0;">
        Department Syllabus Overview &amp; Curricular Subfields
      </h2>
      <p style="color: #cbd5e1; font-size: 0.95rem; margin-bottom: 1rem; line-height: 1.6;">
        The ${escapeHtml(dept.name)} curriculum covers key fundamental and advanced topics across undergraduate and postgraduate coursework. Interactive solvers replace static derivations with live dynamic parameter testing:
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
        ${dept.subfields.map((sub) => `<span style="background: rgba(255,255,255,0.08); padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.85rem; color: #cbd5e1;">${escapeHtml(sub)}</span>`).join('')}
      </div>
    </section>

    ${standardsHtml}

    <section id="department-simulators">
      <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin: 0 0 1rem 0;">
        Interactive Engineering Simulators (${sims.length} Active Workbenches)
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
    case 'comparison':
      return `
      <article id="seo-static-content" style="max-width: 68rem; margin: 0 auto; padding: 2.5rem 1.5rem; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6;">
        <header style="margin-bottom: 2.5rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 2rem;">
          <div style="font-size: 0.85rem; font-family: monospace; color: #06b6d4; text-transform: uppercase; margin-bottom: 0.5rem;">Comprehensive Evaluation &bull; 2026 Edition</div>
          <h1 style="font-size: 2.5rem; font-weight: 800; color: #ffffff; margin: 0 0 1rem 0;">
            LiveSimulators vs. PhET vs. Falstad vs. MATLAB Simulink: Engineering Simulator Comparison
          </h1>
          <p style="font-size: 1.15rem; color: #cbd5e1; max-width: 50rem; margin: 0 auto;">
            A rigorous engineering comparison of 60 FPS Runge-Kutta numerical fidelity, international standards compliance (IEC / IEEE / API / ASME / ISA), real-time industrial fault modeling, and zero-install browser access.
          </p>
        </header>

        <section style="margin-bottom: 3rem; overflow-x: auto;">
          <h2 style="font-size: 1.4rem; font-weight: 700; color: #ffffff; margin-bottom: 1rem;">Platform Comparison Matrix</h2>
          <table style="width: 100%; border-collapse: collapse; text-align: left; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.5rem; font-size: 0.85rem;">
            <thead>
              <tr style="background: rgba(3,7,18,0.8); border-bottom: 1px solid rgba(255,255,255,0.15); color: #94a3b8; font-family: monospace;">
                <th style="padding: 1rem;">Evaluation Dimension</th>
                <th style="padding: 1rem; color: #38bdf8; background: rgba(6,182,212,0.15);">LiveSimulators</th>
                <th style="padding: 1rem;">PhET Simulations</th>
                <th style="padding: 1rem;">Falstad Circuit Simulator</th>
                <th style="padding: 1rem;">MATLAB Simulink</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                <td style="padding: 1rem; font-weight: bold; color: #ffffff;">Solver Fidelity (60 FPS RK4)</td>
                <td style="padding: 1rem; background: rgba(6,182,212,0.08); color: #a5f3fc;"><strong>60 FPS Float64 RK4 Engine</strong>: Continuous 4th-Order Runge-Kutta double-precision integration in browser canvas with Butcher tableau proof.</td>
                <td style="padding: 1rem; color: #cbd5e1;">Euler / low-order Verlet approximations tuned for K-12 conceptual demos. Timesteps clamped.</td>
                <td style="padding: 1rem; color: #cbd5e1;">Modified Nodal Analysis (MNA) matrix solver; excellent for lumped circuits, restricted strictly to electrical networks.</td>
                <td style="padding: 1rem; color: #cbd5e1;">Desktop variable-step ODE solvers (ode45/ode15s), but requires heavy desktop installations or paid MathWorks cloud.</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                <td style="padding: 1rem; font-weight: bold; color: #ffffff;">Standards Compliance (IEC/IEEE/ASME/API/ISA)</td>
                <td style="padding: 1rem; background: rgba(6,182,212,0.08); color: #a5f3fc;"><strong>Full Consensus Standards</strong>: Sized and calibrated against IEEE 1459, IEC 60076, IEC 60534, ISA-75, API 610/617, ASME B31.3, AISC 360, and ACI 318.</td>
                <td style="padding: 1rem; color: #cbd5e1;">Zero standards compliance (designed purely for qualitative introductory science pedagogy).</td>
                <td style="padding: 1rem; color: #cbd5e1;">Idealized textbook models without IEEE/IEC equipment standards, thermal derating, or tolerances.</td>
                <td style="padding: 1rem; color: #cbd5e1;">Compliance toolboxes available (Simscape, Aerospace Blockset), requiring enterprise licenses ($2,000–$10,000+/seat).</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                <td style="padding: 1rem; font-weight: bold; color: #ffffff;">Real-Time Industrial Fault Injection</td>
                <td style="padding: 1rem; background: rgba(6,182,212,0.08); color: #a5f3fc;"><strong>1-Click Industrial Failure Regimes</strong>: Real-time simulation of control valve cavitation vs flashing, subsynchronous resonance, CT saturation, compliance starvation, and IGBT thermal runaway.</td>
                <td style="padding: 1rem; color: #cbd5e1;">Strictly nominal bounds; zero equipment failure or destructive physical regimes modeled.</td>
                <td style="padding: 1rem; color: #cbd5e1;">Basic short circuit and open circuit only; no equipment failure physics or component degradation.</td>
                <td style="padding: 1rem; color: #cbd5e1;">Supported via manual custom Stateflow scripting or paid Simscape fault injection extensions.</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                <td style="padding: 1rem; font-weight: bold; color: #ffffff;">Dual-Domain Telemetry</td>
                <td style="padding: 1rem; background: rgba(6,182,212,0.08); color: #a5f3fc;"><strong>Synchronous Dual-Domain Scopes</strong>: Time-domain oscilloscopes paired side-by-side with frequency-domain FFT, Bode plots, phasor vectors, or P-V / T-s state planes.</td>
                <td style="padding: 1rem; color: #cbd5e1;">Scalar meters and simple single-variable strip charts without dual-domain spectral correlation.</td>
                <td style="padding: 1rem; color: #cbd5e1;">Dual-trace electronic oscilloscope windows; restricted strictly to electronic voltages and currents.</td>
                <td style="padding: 1rem; color: #cbd5e1;">Comprehensive via Scope and Spectrum Analyzer blocks, but non-interactive for browser web learners without accounts.</td>
              </tr>
              <tr>
                <td style="padding: 1rem; font-weight: bold; color: #ffffff;">Zero-Install Browser Access</td>
                <td style="padding: 1rem; background: rgba(6,182,212,0.08); color: #a5f3fc;"><strong>100% Free &amp; Zero-Install</strong>: Instant access across mobile, tablet, and desktop browsers with 100% client-side Float64 computation and privacy.</td>
                <td style="padding: 1rem; color: #cbd5e1;">Free HTML5 web access, but limited to conceptual K-12/early college physics demonstrations.</td>
                <td style="padding: 1rem; color: #cbd5e1;">Web browser Java/JS port, but retains a 1990s desktop interface that is difficult to use on mobile devices.</td>
                <td style="padding: 1rem; color: #cbd5e1;">Requires massive 20+ GB local software installations or restricted campus license server tokens.</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section style="margin-bottom: 2.5rem;">
          <h2 style="font-size: 1.35rem; font-weight: 700; color: #ffffff; margin-bottom: 1rem;">Platform Selection Guide for Engineering Faculty</h2>
          <p style="color: #cbd5e1; line-height: 1.6;">
            PhET is ideal for introductory high-school physics intuition. Falstad is optimal for quick hobbyist breadboard circuit drafting. MATLAB Simulink remains standard for deep offline engineering R&amp;D. <strong>LiveSimulators</strong> was created specifically for accredited engineering higher education and industrial plant troubleshooting: delivering continuous 60 FPS Runge-Kutta numerical rigor, real-time industrial fault injection, and consensus standards compliance directly inside the web browser.
          </p>
        </section>
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
  const departmentRoutes = [];
  for (const d of DISCIPLINES) {
    departmentRoutes.push({ view: 'department', departmentId: d.id, customPath: `/departments/${d.id}/` });
    departmentRoutes.push({ view: 'department', departmentId: d.id, customPath: `/department/${d.id}/` });
  }
  // Common aliases for department routes
  departmentRoutes.push({ view: 'department', departmentId: 'control', customPath: '/departments/instrumentation/' });
  departmentRoutes.push({ view: 'department', departmentId: 'control', customPath: '/department/instrumentation/' });

  const routesToPrerender = [
    { view: 'home' },
    { view: 'about' },
    { view: 'comparison' },
    { view: 'contact' },
    { view: 'cookie-policy' },
    { view: 'disclaimer' },
    { view: 'privacy-policy' },
    { view: 'terms' },
    ...departmentRoutes,
    ...ALL_AVAILABLE_SIMULATORS.map((s) => ({ view: 'simulator', simulatorId: s.id })),
    ...ALL_AVAILABLE_SIMULATORS.map((s) => ({ view: 'embed', simulatorId: s.id })),
    ...LABS.map((l) => ({ view: 'lab', labId: l.id })),
  ];

  console.log(`📦 Discovered ${routesToPrerender.length} distinct routes to pre-render.`);

  // 2. Pre-render each route
  let generatedCount = 0;
  for (const route of routesToPrerender) {
    const meta = getSeoMetadata(route);
    const routePath = route.customPath || routeToPath(route);

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
  const uniqueUrls = new Map();
  for (const r of routesToPrerender) {
    if (r.view === 'embed') continue;
    const p = r.customPath || routeToPath(r);
    const locPath = p === '/' ? '/' : (p.endsWith('/') ? p : `${p}/`);
    const fullUrl = `${SITE_URL}${locPath}`;
    
    let freq = 'weekly';
    let prio = '0.8';
    if (locPath === '/') {
      freq = 'daily';
      prio = '1.0';
    } else if (
      locPath.startsWith('/departments/') ||
      locPath.startsWith('/department/') ||
      locPath.startsWith('/simulator/') ||
      locPath.startsWith('/lab/') ||
      locPath === '/comparison/'
    ) {
      freq = 'weekly';
      prio = '0.9';
    } else if (locPath === '/about/' || locPath === '/contact/') {
      freq = 'weekly';
      prio = '0.8';
    } else {
      freq = 'monthly';
      prio = '0.5';
    }

    if (!uniqueUrls.has(fullUrl)) {
      uniqueUrls.set(fullUrl, { freq, prio });
    }
  }

  const sitemapEntries = Array.from(uniqueUrls.entries())
    .map(([url, cfg]) => `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${cfg.freq}</changefreq>
    <priority>${cfg.prio}</priority>
  </url>`)
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
