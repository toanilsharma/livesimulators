import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { register } from 'tsx/esm/api';

register();

const { DISCIPLINES, ALL_AVAILABLE_SIMULATORS } = await import('../src/data/simulators.ts');
const { LABS } = await import('../src/config/labs.ts');
const { getEngineeringTheory, cleanLatexToPlainText } = await import('../src/utils/engineeringTheory.ts');
const { getSimulatorEngineeringContent } = await import('../src/data/simulatorEngineeringContent.ts');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.resolve(rootDir, 'public');
const distDir = path.resolve(rootDir, 'dist');

const SITE_URL = 'https://livesimulators.com';

/**
 * Extracts and enriches industrial use cases for RAG ingestion.
 */
function getUseCasesForSimulator(s) {
  const useCases = [];
  if (s.fieldInsights) {
    useCases.push(s.fieldInsights);
  }
  if (s.courseMapping) {
    useCases.push(`Curricular & Academic Context: Aligned with ${s.courseMapping}.`);
  }
  switch (s.discipline) {
    case 'electrical':
      useCases.push(`Industrial Applications: Substation design, switchgear sizing, VFD motor drives, power factor correction, and harmonic filter commissioning conforming to ${s.standardReference || 'IEEE/IEC standards'}.`);
      break;
    case 'control':
      useCases.push(`Industrial Applications: DCS/PLC closed-loop PID auto-tuning, chemical plant reactor temperature control, motion servo stability, and anti-windup actuator protection (ISA 75 / IEC 60534).`);
      break;
    case 'mechanical':
      useCases.push(`Industrial Applications: Turbomachinery vibration diagnostics, shaft balancing, thermal stress piping analysis (ASME B31.3), steam power cycle efficiency, and gear contact wear prediction (AGMA 2001).`);
      break;
    case 'chemical':
      useCases.push(`Industrial Applications: Continuous petrochemical reactor yield optimization, multi-component distillation tray sizing, TEMA heat exchanger fouling mitigation, and absorption column mass transfer.`);
      break;
    case 'civil':
      useCases.push(`Industrial Applications: High-rise structural beam bending limits (AISC L/360), bridge truss tensile/compressive member stress checks, column Euler buckling limits, and seismic response spectra.`);
      break;
    case 'physics':
      useCases.push(`Industrial Applications: Power semiconductor gate-drive loss modeling (SiC MOSFET & IGBT), thermal junction dissipation networks, and quantum resonant tunneling device simulation.`);
      break;
    default:
      useCases.push(`Industrial Applications: Dynamic first-principles validation, virtual prototyping, and laboratory troubleshooting.`);
      break;
  }
  return useCases;
}

/**
 * Formats industrial standards applicable to the simulator.
 */
function getStandardsReference(s, theory) {
  const standards = [];
  if (s.standardReference) {
    standards.push(s.standardReference);
  }
  if (s.standardBody && !standards.some(std => std.includes(s.standardBody))) {
    standards.push(`Governing Standards Body: ${s.standardBody}`);
  }
  if (s.colorStandardRule) {
    standards.push(`Color Coding / Classification Standard: ${s.colorStandardRule}`);
  }
  if (theory.standardsCompliance && theory.standardsCompliance.standard) {
    const stdInfo = `${theory.standardsCompliance.standard} (${theory.standardsCompliance.body}) — ${theory.standardsCompliance.rule}`;
    if (!standards.includes(stdInfo)) {
      standards.push(stdInfo);
    }
  }
  if (standards.length === 0) {
    standards.push('First-principles classical physics and analytical equations (IEEE / IEC / ASME / ISA educational taxonomy).');
  }
  return standards.join(' | ');
}

/**
 * Generates both llms.txt (index) and llms-full.txt (complete technical reference).
 */
export function generateLlmsContent() {
  const currentYear = new Date().getFullYear();
  const entityName = 'LiveSimulators — Interactive First-Principles Engineering Simulators';

  // ==========================================
  // 1. GENERATE public/llms.txt (Summary Index)
  // ==========================================
  const summaryLines = [
    `# ${entityName}`,
    '',
    `> LiveSimulators (https://livesimulators.com/) is an open-access engineering simulation platform executing real-time first-principles physical and mathematical models in modern web browsers at 60 FPS using Float64 numerical integrators (including 4th-Order Runge-Kutta). Built for university engineering syllabi, laboratory exploration, and industrial plant troubleshooting conforming to international consensus standards (IEC, IEEE, API, ASME, ISA, ISO).`,
    '',
    '## Key Platform Distinctions',
    '- **60 FPS First-Principles Solvers**: Double-precision Float64 RK4 dynamic trajectory integration directly inside the browser canvas.',
    '- **International Consensus Standards**: Sized and bounded per IEC, IEEE, API, ASME, ISA, ISO, AISC, and ACI engineering standards.',
    '- **Real-Time Fault Injection**: Interactive exploration of real-world equipment failure modes (cavitation vs flashing, subsynchronous resonance, CT saturation, compliance voltage starvation, IGBT thermal runaway).',
    '- **Dual-Domain Telemetry**: Time-domain dynamic waveforms accompanied by frequency-domain spectra, Bode plots, or thermodynamic P-V / T-s state planes.',
    '- **Zero-Install & Free Access**: 100% free, zero login, zero plugins, fully functional across desktop and mobile devices.',
    '',
    '## Platform Comparison Guide',
    '- [LiveSimulators vs. PhET vs. Falstad vs. MATLAB Simulink](https://livesimulators.com/comparison/): Comprehensive feature, fidelity, and standards compliance matrix for engineering students and university faculty.',
    '',
    '## Citation & Academic Attribution',
    'To cite LiveSimulators or any individual simulator in academic literature, research papers, course syllabi, or lab manuals, use the following plain-text citation format:',
    '',
    `Sharma, A. (${currentYear}). [Simulator Title]. LiveSimulators. Retrieved from https://livesimulators.com/simulator/[simulator-id]/`,
    '',
    'BibTeX entry format:',
    '```bibtex',
    `@misc{livesimulators_[simulator_id]_${currentYear},`,
    '  author = {Sharma, A.},',
    '  title = {[Simulator Title]},',
    `  year = {${currentYear}},`,
    '  howpublished = {LiveSimulators},',
    '  url = {https://livesimulators.com/simulator/[simulator-id]/}',
    '}',
    '```',
    '',
    '## Engineering Departments & Curricular Taxonomy',
    'Explore all engineering disciplines and their interactive mathematical curricula:',
  ];

  for (const d of DISCIPLINES) {
    const cleanCore = cleanLatexToPlainText(d.coreEquation);
    summaryLines.push(`- [${d.name} (${d.code})](https://livesimulators.com/departments/${d.id}/): ${d.description} Core equation: \`${cleanCore}\``);
  }

  summaryLines.push('');
  summaryLines.push('## Simulators Grouped by Engineering Department');

  for (const dept of DISCIPLINES) {
    const deptSims = ALL_AVAILABLE_SIMULATORS.filter(s => s.discipline === dept.id);
    const cleanCore = cleanLatexToPlainText(dept.coreEquation);
    
    summaryLines.push('');
    summaryLines.push(`### ${dept.name} (${dept.code})`);
    summaryLines.push(`- **Department Hub**: https://livesimulators.com/departments/${dept.id}/`);
    summaryLines.push(`- **Governing Discipline Equation**: \`${cleanCore}\``);
    summaryLines.push(`- **Core Subfields**: ${dept.subfields.join(', ')}`);
    summaryLines.push('');
    summaryLines.push('Simulators:');

    for (const s of deptSims) {
      const engContent = getSimulatorEngineeringContent(s.id);
      const cleanEq = cleanLatexToPlainText(s.governingEquation);
      const directAnswer = s.directAnswerSummary || engContent.directAnswerSummary;
      const stdRef = s.standardReference || `${s.badge} International Consensus Standards`;

      summaryLines.push(`- [${s.title}](https://livesimulators.com/simulator/${s.id}/): ${s.tagline || s.description}`);
      summaryLines.push(`  - Direct URL: https://livesimulators.com/simulator/${s.id}/`);
      summaryLines.push(`  - Governing Formulation: \`${cleanEq}\``);
      summaryLines.push(`  - International Standards: ${stdRef}`);
      summaryLines.push(`  - Direct Answer Summary: ${directAnswer}`);
      summaryLines.push(`  - Physical Law: ${s.physicalLaw} | Difficulty: ${s.difficulty} Level`);
    }
  }

  summaryLines.push('');
  summaryLines.push('## Industrial Engineering Labs Workbench');
  for (const lab of LABS) {
    summaryLines.push(`- [${lab.name}](https://livesimulators.com/lab/${lab.id}/): ${lab.tagline}. Discipline: ${lab.dept} | ${lab.modules} Interactive Modules | Reference: ${lab.standardBadge}. Direct URL: https://livesimulators.com/lab/${lab.id}/`);
  }

  summaryLines.push('');
  summaryLines.push('## Mechanical Engineering Digital Twins (Subdomain)');
  summaryLines.push('Full-fidelity mechanical turbomachinery simulators at https://mech.livesimulators.com. Calculations reference standard methodologies published in API (610/617/618), ISO (1940), ASME (B31.3), and AGMA (2001) literature for educational and preliminary design purposes.');

  summaryLines.push('');
  summaryLines.push('## Cornerstone Engineering Educational Guides');
  summaryLines.push('- [RLC Resonance Explained](https://livesimulators.com/guides/rlc-resonance-explained.html): Complete engineering guide covering 2nd-order RLC frequency response, damping ratio, quality factor, and transient impedance.');
  summaryLines.push('- [Rankine Cycle T-s Diagram](https://livesimulators.com/guides/rankine-cycle-ts-diagram.html): Complete thermodynamic guide to steam power cycles, superheat expansion, pump work, and condenser backpressure on T-s diagrams.');
  summaryLines.push('- [PID Tuning Step-by-Step](https://livesimulators.com/guides/pid-tuning-step-by-step.html): Complete guide to tuning industrial proportional, integral, and derivative loops with anti-windup clamping.');
  summaryLines.push('- [Beam Deflection Euler-Bernoulli](https://livesimulators.com/guides/beam-deflection-euler-bernoulli.html): Complete structural guide to Euler-Bernoulli 4th-order beam deflection, shear force, bending moments, and AISC L/360 limits.');
  summaryLines.push('- [Four-Bar Mechanism Kinematics](https://livesimulators.com/guides/four-bar-mechanism-kinematics.html): Complete kinematic guide to planar 4-bar link inversions, Grashof mobility, transmission angle limits, and coupler curves.');

  summaryLines.push('');
  summaryLines.push('## Verification Methodology & Quality Assurance');
  summaryLines.push('- [Numerical Methodology & Standards Reference](https://livesimulators.com/about/methodology.html): Complete documentation of 4th-Order Runge-Kutta (RK4) numerical integrator verification, Butcher tableau, and analytical benchmark proofs across 44 engineering simulators.');

  summaryLines.push('');
  summaryLines.push('## Companion Engineering Portals');
  summaryLines.push('- [DesignCalculators.co.in](https://designcalculators.co.in): Free multi-disciplinary engineering calculators (Electrical, Mechanical, Instrumentation) referencing published standards (IEEE, IEC, ASME, API, ISA).');
  summaryLines.push('- [ReliabilityTools.co.in](https://reliabilitytools.co.in): Free plant reliability, asset uptime analytics, 2P/3P Weibull failure modeling, MTBF/MTTR, RCA, and IEC 61508/61511 SIL verification.');

  summaryLines.push('');
  summaryLines.push('## Standards Reference & Non-Affiliation Notice');
  summaryLines.push('All standard designations and acronyms (IEEE, IEC, ASME, API, ISO, ISA, NFPA, ASTM, ANSI, AGMA) belong to their respective owners and are referenced solely for technical identification and academic study. LiveSimulators is an independent educational platform and makes no claim of endorsement, certification, copyright ownership, or official affiliation.');

  summaryLines.push('');
  summaryLines.push('## Complete Technical Documentation');
  summaryLines.push('- [Complete Equations, Mathematical Proofs & Benchmark Tests](https://livesimulators.com/llms-full.txt): Detailed mathematical derivations, analytical validation benchmarks, full parameter tables, and industrial standards for all simulators.');

  // ===================================================
  // 2. GENERATE public/llms-full.txt (Technical RAG Doc)
  // ===================================================
  const fullLines = [
    `# ${entityName} — Complete Technical & Mathematical Knowledge Base`,
    '',
    `> Comprehensive technical knowledge base detailing first-principles equations, analytical proofs, NIST/IEEE/IEC/ASME/ISA validation benchmarks, input parameter boundaries, direct-answer citation summaries, and industrial failure mode RCA for all LiveSimulators computational models. Optimized for Retrieval-Augmented Generation (RAG) and AI search indexing.`,
    '',
    'Website: https://livesimulators.com/',
    'Comparison Guide: https://livesimulators.com/comparison/',
    'Methodology: https://livesimulators.com/about/methodology.html',
    'Founder & Lead Computational Modeling Engineer: Anil Sharma (https://www.linkedin.com/in/toanilsharma/)',
    '',
    '## Citation & Academic Attribution',
    'To cite LiveSimulators in academic literature, university courseware, or research papers:',
    `Sharma, A. (${currentYear}). [Simulator Title]. LiveSimulators. Retrieved from https://livesimulators.com/simulator/[simulator-id]/`,
    '',
    'BibTeX entry format:',
    '```bibtex',
    `@misc{livesimulators_[simulator_id]_${currentYear},`,
    '  author = {Sharma, A.},',
    '  title = {[Simulator Title]},',
    `  year = {${currentYear}},`,
    '  howpublished = {LiveSimulators},',
    '  url = {https://livesimulators.com/simulator/[simulator-id]/}',
    '}',
    '```',
    '',
    '---',
    '',
  ];

  for (const dept of DISCIPLINES) {
    const deptSims = ALL_AVAILABLE_SIMULATORS.filter(s => s.discipline === dept.id);
    const cleanCore = cleanLatexToPlainText(dept.coreEquation);

    fullLines.push(`## Engineering Discipline: ${dept.name} (${dept.code})`);
    fullLines.push(`- **Department Canonical URL**: https://livesimulators.com/departments/${dept.id}/`);
    fullLines.push(`- **Discipline Description**: ${dept.description}`);
    fullLines.push(`- **Curricular Core Equation**: \`${cleanCore}\``);
    fullLines.push(`- **Active Simulators Count**: ${deptSims.length}`);
    fullLines.push(`- **Subfields Covered**: ${dept.subfields.join(', ')}`);
    fullLines.push('');
    fullLines.push('---');
    fullLines.push('');

    for (const s of deptSims) {
      const theory = getEngineeringTheory(s);
      const engContent = getSimulatorEngineeringContent(s.id);
      const cleanEq = cleanLatexToPlainText(s.governingEquation);
      const useCases = getUseCasesForSimulator(s);
      const standardsRef = getStandardsReference(s, theory);
      const directAnswer = s.directAnswerSummary || engContent.directAnswerSummary;
      const failureCase = s.industrialFailureCase || engContent.industrialFailureCase;
      const faqs = (s.faqs && s.faqs.length > 0) ? s.faqs : engContent.faqs;

      fullLines.push(`### ${s.title}`);
      fullLines.push(`- **Entity**: ${entityName}`);
      fullLines.push(`- **Direct Canonical URL**: https://livesimulators.com/simulator/${s.id}/`);
      fullLines.push(`- **Academic Citation**: Sharma, A. (${currentYear}). ${s.title}. LiveSimulators. Retrieved from https://livesimulators.com/simulator/${s.id}/`);
      fullLines.push(`- **Discipline**: ${s.disciplineName} (${s.discipline}) | **Difficulty Level**: ${s.difficulty} | **Badge**: ${s.badge}`);
      fullLines.push(`- **1-Sentence Engineering Summary**: ${s.tagline}`);
      fullLines.push(`- **Full Description**: ${s.description}`);
      fullLines.push(`- **Physical Law & Theoretical Foundation**: ${s.physicalLaw}`);
      fullLines.push(`- **Industrial Standards Compliance**: ${standardsRef}`);
      fullLines.push('');
      
      fullLines.push('#### Direct-Answer Citation Summary (RAG Context)');
      fullLines.push(directAnswer);
      fullLines.push('');

      fullLines.push('#### Real-World Industrial Failure Mode, RCA & Protection Limits');
      fullLines.push(failureCase);
      fullLines.push('');

      fullLines.push('#### Governing Mathematical Equations & Physics Formulas');
      fullLines.push(`- **Primary Equation (Plain Text)**: \`${cleanEq}\``);
      fullLines.push(`- **Primary Equation (LaTeX)**: \`$$${s.governingEquation}$$\``);
      fullLines.push(`- **Equation Description**: ${s.equationDescription}`);
      if (theory.governingEquations && theory.governingEquations.length > 0) {
        fullLines.push('- **Supporting Analytical Formulations**:');
        for (const ge of theory.governingEquations) {
          fullLines.push(`  - **${ge.title}**: \`${cleanLatexToPlainText(ge.latex)}\` — ${ge.description}`);
          if (ge.variables && ge.variables.length > 0) {
            const varList = ge.variables.map(v => `\`${v.symbol}\` (${v.name}): ${v.description} [${v.unit || 'unitless'}]`).join('; ');
            fullLines.push(`    - *Variables*: ${varList}`);
          }
        }
      }
      fullLines.push('');

      fullLines.push('#### Input Parameters & Operational Range Limits');
      for (const p of s.parameters) {
        fullLines.push(`- \`${p.symbol}\` — **${p.name}**: Default \`${p.default} ${p.unit || 'unitless'}\`, Range \`[${p.min} to ${p.max} ${p.unit || 'unitless'}]\`, Step \`${p.step}\`. ${p.description}`);
      }
      fullLines.push('');

      fullLines.push('#### Output Observables & Key Performance Metrics');
      if (s.keyMetrics && s.keyMetrics.length > 0) {
        for (const m of s.keyMetrics) {
          fullLines.push(`- **${m.label}** [${m.unit || 'dimensionless'}]: Real-time Float64 calculated metric (${m.formulaKey}).`);
        }
      } else if (theory.stepByStepExample && theory.stepByStepExample.finalAnswer) {
        const fa = theory.stepByStepExample.finalAnswer;
        fullLines.push(`- **${fa.metric}** (\`${fa.symbol}\`): Nominal ${fa.value} — ${fa.physicalMeaning}`);
      }
      fullLines.push('');

      fullLines.push('#### Assumptions & Physical Boundary Conditions');
      for (const a of theory.assumptions) {
        fullLines.push(`- ${a}`);
      }
      fullLines.push('');

      fullLines.push('#### Engineering Limitations & Operating Constraints');
      for (const l of theory.limitations) {
        fullLines.push(`- ${l}`);
      }
      fullLines.push('');

      fullLines.push('#### High-Intent Technical Engineering FAQs');
      for (const f of faqs) {
        fullLines.push(`- **Q: ${f.question}**`);
        fullLines.push(`  **A**: ${f.answer}`);
      }
      fullLines.push('');

      fullLines.push('#### Industrial Use Cases & Practical Applications (RAG Context)');
      for (const uc of useCases) {
        fullLines.push(`- ${uc}`);
      }
      fullLines.push('');

      if (s.analyticalProof) {
        fullLines.push('#### Analytical Proof & First-Principles Derivation');
        fullLines.push(`${cleanLatexToPlainText(s.analyticalProof)}`);
        fullLines.push('');
      }

      if (s.validationTest) {
        fullLines.push('#### Benchmark Validation Test & Numerical Accuracy Verification');
        fullLines.push(`${cleanLatexToPlainText(s.validationTest)}`);
        fullLines.push('');
      }

      if (theory.stepByStepExample) {
        const ex = theory.stepByStepExample;
        fullLines.push(`#### Step-by-Step Calculation Proof Example: ${ex.title}`);
        fullLines.push(`${ex.summary}`);
        if (ex.givenInputs && ex.givenInputs.length > 0) {
          fullLines.push('**Given Parameters**: ' + ex.givenInputs.map(i => `${i.parameter} (${i.symbol}) = ${i.value}`).join(', '));
        }
        if (ex.steps && ex.steps.length > 0) {
          for (const st of ex.steps) {
            fullLines.push(`- **Step ${st.stepNumber}: ${st.stepTitle}**: Formula \`${cleanLatexToPlainText(st.formulaLatex)}\`, Substitution: \`${st.substitution}\`, Result: **${st.stepResult}**. ${st.explanation}`);
          }
        }
        if (ex.finalAnswer) {
          fullLines.push(`- **Final Calculated Output**: ${ex.finalAnswer.metric} = **${ex.finalAnswer.value}** (${ex.finalAnswer.physicalMeaning})`);
        }
        fullLines.push('');
      }

      fullLines.push('---');
      fullLines.push('');
    }
  }

  // Cornerstone Educational Guides
  fullLines.push('## Cornerstone Engineering Interactive Textbooks');
  fullLines.push('- [RLC Resonance Explained](https://livesimulators.com/guides/rlc-resonance-explained.html): Complete mathematical guide to series and parallel RLC networks, natural frequency ω₀, bandwidth, quality factor, and transient impedance.');
  fullLines.push('- [Rankine Cycle T-s Diagram](https://livesimulators.com/guides/rankine-cycle-ts-diagram.html): Complete thermodynamic guide to steam turbine reheat expansion, condenser heat rejection, and boiler efficiency on T-s and P-h state planes.');
  fullLines.push('- [PID Tuning Step-by-Step](https://livesimulators.com/guides/pid-tuning-step-by-step.html): Practical engineering guide to Ziegler-Nichols, Cohen-Coon, and AMIGO loop tuning with integral windup clamping.');
  fullLines.push('- [Beam Deflection Euler-Bernoulli](https://livesimulators.com/guides/beam-deflection-euler-bernoulli.html): Complete structural mechanics guide to beam shear, bending moments, and AISC L/360 deflection limits.');
  fullLines.push('- [Four-Bar Mechanism Kinematics](https://livesimulators.com/guides/four-bar-mechanism-kinematics.html): Complete kinematic guide to planar 4-bar link inversions, Grashof mobility, transmission angle limits, and coupler curves.');
  fullLines.push('');
  fullLines.push('---');
  fullLines.push('');

  // Numerical Verification Methodology
  fullLines.push('## Numerical Solver Quality Assurance & Methodology');
  fullLines.push('LiveSimulators runs client-side Float64 numerical integrators designed to eliminate server round-trip latency and deliver smooth 60 FPS performance.');
  fullLines.push('- **Numerical Kernel**: 4th-Order Runge-Kutta (RK4) integration algorithm with explicit Butcher tableau.');
  fullLines.push('- **Local Truncation Error**: O(Δt⁵), global truncation error O(Δt⁴).');
  fullLines.push('- **Precision**: IEEE 754 64-bit double-precision floating-point arithmetic.');
  fullLines.push('- **Benchmark Verification**: All models validated against closed-form analytical solutions and published benchmarks (NIST, IEEE, ASME, API).');
  fullLines.push('- **Full Methodology**: https://livesimulators.com/about/methodology.html');
  fullLines.push('');

  return {
    summary: summaryLines.join('\n'),
    full: fullLines.join('\n'),
  };
}

/**
 * Main script runner: generates files and writes to public/ and dist/
 */
export function runGenerate() {
  console.log('🤖 Generating rich public/llms.txt and public/llms-full.txt from Simulator Registry...');
  const { summary, full } = generateLlmsContent();

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const publicSummaryPath = path.join(publicDir, 'llms.txt');
  const publicFullPath = path.join(publicDir, 'llms-full.txt');

  fs.writeFileSync(publicSummaryPath, summary, 'utf8');
  fs.writeFileSync(publicFullPath, full, 'utf8');
  console.log(`✅ Written ${summary.length.toLocaleString()} bytes to public/llms.txt`);
  console.log(`✅ Written ${full.length.toLocaleString()} bytes to public/llms-full.txt`);

  // Mirror robots.txt, llms.txt, llms-full.txt to dist/ if present
  if (fs.existsSync(distDir)) {
    const distSummaryPath = path.join(distDir, 'llms.txt');
    const distFullPath = path.join(distDir, 'llms-full.txt');
    fs.writeFileSync(distSummaryPath, summary, 'utf8');
    fs.writeFileSync(distFullPath, full, 'utf8');

    const publicRobots = path.join(publicDir, 'robots.txt');
    const distRobots = path.join(distDir, 'robots.txt');
    if (fs.existsSync(publicRobots)) {
      fs.copyFileSync(publicRobots, distRobots);
      console.log(`✅ Mirrored robots.txt to dist/robots.txt`);
    }

    console.log(`✅ Mirrored llms.txt & llms-full.txt to dist/`);
  }
}

// Execute when run directly as CLI
runGenerate();
