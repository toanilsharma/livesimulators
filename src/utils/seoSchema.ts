import { AppRoute, Discipline, SimulatorItem } from '../types';
import { DISCIPLINES, ALL_AVAILABLE_SIMULATORS } from '../data/simulators';
import { LABS, LabConfig } from '../config/labs';
import { SITE_URL, routeToPath } from './routes';
import { cleanLatexToPlainText } from './engineeringTheory';
import { getSimulatorFaqs, DomainFaqItem } from './engineeringScenarios';
import { HOME_FAQ_DATA } from '../components/HomeFaq';
import { DEPARTMENT_FAQ_DATA } from '../components/department/DepartmentFaq';

/**
 * Recursively cleans a schema object by omitting any undefined, null, or empty string values.
 * Guarantees zero syntax errors or undefined fields in generated JSON-LD.
 */
export function cleanSchemaNode<T = Record<string, any>>(obj: any): T {
  if (obj === null || obj === undefined) return undefined as any;
  if (Array.isArray(obj)) {
    const cleanedArr = obj
      .map((item) => cleanSchemaNode(item))
      .filter((item) => item !== undefined && item !== null);
    return cleanedArr as any;
  }
  if (typeof obj === 'object') {
    const cleanedObj: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (val === undefined || val === null || val === '') continue;
      const cleanedVal = cleanSchemaNode(val);
      if (cleanedVal !== undefined && cleanedVal !== null) {
        cleanedObj[key] = cleanedVal;
      }
    }
    return cleanedObj as any;
  }
  return obj;
}

/**
 * Founder Person Schema (Specialized Person entity for E-E-A-T attribution & authorship)
 */
export const FOUNDER_PERSON_SCHEMA: Record<string, any> = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#founder`,
  name: 'Anil Sharma',
  jobTitle: 'Founder & Industrial Reliability / Electrical Engineering Specialist',
  url: 'https://toanilsharma.co.in',
  worksFor: {
    '@id': `${SITE_URL}/#organization`,
  },
  sameAs: [
    'https://toanilsharma.co.in',
    'https://www.linkedin.com/in/toanilsharma/',
  ],
  knowsAbout: [
    'Electrical Engineering',
    'Instrumentation & Control',
    'Reliability Engineering',
    'Industrial Automation',
    'Numerical Simulation',
  ],
};

/**
 * Organization & EducationalOrganization Schema
 */
export const ORGANIZATION_SCHEMA: Record<string, any> = {
  '@type': ['Organization', 'EducationalOrganization'],
  '@id': `${SITE_URL}/#organization`,
  name: 'LiveSimulators',
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/og-default.png`,
  founder: {
    '@id': `${SITE_URL}/#founder`,
  },
  sameAs: [
    'https://mech.livesimulators.com',
    'https://designcalculators.co.in',
    'https://toanilsharma.co.in',
  ],
};

/**
 * WebSite Schema with potentialAction SearchAction
 */
export const WEBSITE_SCHEMA: Record<string, any> = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'LiveSimulators',
  url: `${SITE_URL}/`,
  publisher: {
    '@id': `${SITE_URL}/#organization`,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

/**
 * Constructs the schema for the Homepage (https://livesimulators.com/).
 * Contains WebSite, Organization, Person, BreadcrumbList, and FAQPage.
 */
export function getHomepageSchema(): { '@context': string; '@graph': Record<string, any>[] } {
  const nodes = [
    WEBSITE_SCHEMA,
    ORGANIZATION_SCHEMA,
    FOUNDER_PERSON_SCHEMA,
    {
      '@type': 'BreadcrumbList',
      '@id': `${SITE_URL}/#breadcrumb`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${SITE_URL}/`,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: HOME_FAQ_DATA.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': cleanSchemaNode(nodes),
  };
}

/**
 * Generates an array of Thing entities for the simulator's "about" field,
 * capturing the engineering discipline, governing physical laws, analytical formulas, and keywords.
 */
export function getSimulatorAboutThings(sim: SimulatorItem): Array<{ '@type': string; name: string; description?: string }> {
  const things: Array<{ '@type': string; name: string; description?: string }> = [];
  const seenNames = new Set<string>();

  const addThing = (name: string, description?: string) => {
    const trimmed = name.trim();
    if (!trimmed || seenNames.has(trimmed.toLowerCase())) return;
    seenNames.add(trimmed.toLowerCase());
    things.push(cleanSchemaNode({
      '@type': 'Thing',
      name: trimmed,
      description,
    }));
  };

  // 1. Engineering Discipline
  if (sim.disciplineName) {
    addThing(sim.disciplineName, 'Engineering Discipline');
  }

  // 2. Governing Physical Law
  if (sim.physicalLaw) {
    addThing(sim.physicalLaw, 'Governing Physical Law');
  }

  // 3. Analytical Governing Equation / Formula
  const plainFormula = cleanLatexToPlainText(sim.governingEquation);
  if (plainFormula) {
    const formulaName = sim.equationDescription ? `${sim.equationDescription}: ${plainFormula}` : plainFormula;
    addThing(formulaName, 'Analytical Governing Differential Formulation');
  }

  // 4. International Engineering Standards
  if (sim.standardReference) {
    addThing(
      sim.standardReference,
      sim.standardBody ? `Consensus standard issued by ${sim.standardBody}` : 'Applicable Consensus Standard'
    );
  }

  // 5. Course Mapping
  if (sim.courseMapping) {
    const courses = sim.courseMapping.split(',').map((c) => c.trim());
    courses.forEach((c) => addThing(c, 'Academic Curricular Course Code'));
  }

  // 6. Simulator Tags / Keywords
  if (Array.isArray(sim.tags)) {
    sim.tags.forEach((tag) => addThing(tag));
  }

  return things;
}

/**
 * Constructs the schema for an individual simulator page (https://livesimulators.com/simulator/[slug]/).
 * Injects:
 * - BreadcrumbList: Home -> [Department] -> [Simulator]
 * - ["SoftwareApplication", "LearningResource"] compound entity with full metadata
 * - FAQPage with 3 domain-specific technical FAQs
 * - Organization & Person entity references
 */
export function getSimulatorSchema(sim: SimulatorItem): { '@context': string; '@graph': Record<string, any>[] } {
  const canonicalUrl = `${SITE_URL}/simulator/${sim.id}/`;
  const dept = DISCIPLINES.find((d) => d.id === sim.discipline);
  const deptUrl = dept ? `${SITE_URL}/department/${dept.id}/` : `${SITE_URL}/`;
  const deptName = dept ? dept.name : sim.disciplineName;

  // 1. BreadcrumbList
  const breadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: deptName,
        item: deptUrl,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: sim.title,
        item: canonicalUrl,
      },
    ],
  };

  // 2. ["SoftwareApplication", "LearningResource"] compound entity
  const aboutThings = getSimulatorAboutThings(sim);

  const softwareAndLearningResource = {
    '@type': ['SoftwareApplication', 'LearningResource'],
    '@id': `${canonicalUrl}#simulator`,
    name: `Interactive ${sim.title} Simulator & Calculator`,
    alternateName: sim.title,
    description: sim.description,
    url: canonicalUrl,
    applicationCategory: 'EducationalApplication',
    applicationSubCategory: 'Engineering Simulation',
    operatingSystem: 'All (Web Browser)',
    isAccessibleForFree: true,
    browserRequirements: 'Requires modern browser with HTML5 Canvas and Float64 JavaScript engine support.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    educationalUse: [
      'Simulation',
      'Virtual Laboratory',
      'Engineering Design Verification',
      'Self-Study',
    ],
    learningResourceType: 'Interactive Simulation',
    interactivityType: 'active',
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#founder`,
      name: 'Anil Sharma',
      url: 'https://toanilsharma.co.in',
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'LiveSimulators',
      url: `${SITE_URL}/`,
    },
    about: aboutThings,
  };

  // 3. FAQPage mapped directly from 3 domain-specific technical FAQs
  const faqs: DomainFaqItem[] = getSimulatorFaqs(sim);
  const faqPage = {
    '@type': 'FAQPage',
    '@id': `${canonicalUrl}#faq`,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  const nodes = [
    ORGANIZATION_SCHEMA,
    FOUNDER_PERSON_SCHEMA,
    WEBSITE_SCHEMA,
    breadcrumbList,
    softwareAndLearningResource,
    faqPage,
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': cleanSchemaNode(nodes),
  };
}

/**
 * Constructs schema for Engineering Department routes (https://livesimulators.com/department/[id]/)
 */
export function getDepartmentSchema(dept: Discipline): { '@context': string; '@graph': Record<string, any>[] } {
  const canonicalUrl = `${SITE_URL}/department/${dept.id}/`;
  const deptSimulators = ALL_AVAILABLE_SIMULATORS.filter((s) => s.discipline === dept.id);
  const deptFaqs = DEPARTMENT_FAQ_DATA[dept.id] || [];

  const breadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: dept.name, item: canonicalUrl },
    ],
  };

  const courseSchema = {
    '@type': 'Course',
    '@id': `${canonicalUrl}#course`,
    name: `${dept.name} (${dept.code}) Virtual Engineering Laboratory`,
    description: dept.description,
    courseCode: dept.code,
    educationalCredentialAwarded: 'ABET Practical Simulation Proficiency',
    provider: {
      '@id': `${SITE_URL}/#organization`,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'Self-paced Interactive Engineering Simulations',
      instructor: {
        '@id': `${SITE_URL}/#founder`,
      },
    },
    syllabusSections: dept.subfields.map((sub, idx) => ({
      '@type': 'Syllabus',
      name: sub,
      position: idx + 1,
    })),
  };

  const itemList = {
    '@type': 'ItemList',
    '@id': `${canonicalUrl}#simulators`,
    name: `${dept.name} Interactive Simulation Suite`,
    numberOfItems: deptSimulators.length,
    itemListElement: deptSimulators.map((s, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: s.title,
      url: `${SITE_URL}/simulator/${s.id}/`,
    })),
  };

  const faqPage = {
    '@type': 'FAQPage',
    '@id': `${canonicalUrl}#faq`,
    mainEntity: deptFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const nodes = [
    ORGANIZATION_SCHEMA,
    FOUNDER_PERSON_SCHEMA,
    WEBSITE_SCHEMA,
    breadcrumbList,
    courseSchema,
    itemList,
    ...(deptFaqs.length > 0 ? [faqPage] : []),
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': cleanSchemaNode(nodes),
  };
}

/**
 * Constructs schema for Industrial Labs Pro routes (https://livesimulators.com/lab/[id]/)
 */
export function getLabSchema(lab: LabConfig): { '@context': string; '@graph': Record<string, any>[] } {
  const canonicalUrl = `${SITE_URL}/lab/${lab.id}/`;

  const breadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Industrial Labs Pro', item: `${SITE_URL}/#industrial-labs` },
      { '@type': 'ListItem', position: 3, name: lab.name, item: canonicalUrl },
    ],
  };

  const softwareApplication = {
    '@type': ['SoftwareApplication', 'LearningResource'],
    '@id': `${canonicalUrl}#lab`,
    name: `${lab.name} - Professional Industrial Laboratory`,
    description: lab.desc,
    url: canonicalUrl,
    applicationCategory: 'EducationalApplication',
    applicationSubCategory: 'Industrial Engineering Simulation',
    operatingSystem: 'All (Web Browser)',
    isAccessibleForFree: true,
    author: {
      '@type': 'Person',
      '@id': `${SITE_URL}/#founder`,
      name: 'Anil Sharma',
      url: 'https://toanilsharma.co.in',
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'LiveSimulators',
      url: `${SITE_URL}/`,
    },
    educationalUse: ['Simulation', 'Virtual Laboratory', 'Industrial Process Analysis'],
  };

  const nodes = [
    ORGANIZATION_SCHEMA,
    FOUNDER_PERSON_SCHEMA,
    WEBSITE_SCHEMA,
    breadcrumbList,
    softwareApplication,
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': cleanSchemaNode(nodes),
  };
}

/**
 * Constructs schema for static information pages (About, Contact, Privacy, Terms, Disclaimer, Cookie Policy)
 */
export function getStaticPageSchema(route: AppRoute): { '@context': string; '@graph': Record<string, any>[] } {
  const path = routeToPath(route);
  const cleanPath = path.split('?')[0].split('#')[0];
  const canonicalPath = cleanPath === '/' ? '/' : cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  const breadcrumbList = {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: route.view.charAt(0).toUpperCase() + route.view.slice(1).replace('-', ' '),
        item: canonicalUrl,
      },
    ],
  };

  let specificPageNode: Record<string, any>;

  switch (route.view) {
    case 'about':
      specificPageNode = {
        '@type': 'AboutPage',
        '@id': `${canonicalUrl}#aboutpage`,
        name: 'About LiveSimulators & Founder Anil Sharma',
        description: 'First-principles numerical simulation engine and engineering education platform created by Anil Sharma.',
        url: canonicalUrl,
        mainEntity: {
          '@id': `${SITE_URL}/#founder`,
        },
      };
      break;

    case 'contact':
      specificPageNode = {
        '@type': 'ContactPage',
        '@id': `${canonicalUrl}#contactpage`,
        name: 'Contact LiveSimulators Engineering Team',
        description: 'Technical inquiries, simulator suggestions, and academic collaborations with founder Anil Sharma.',
        url: canonicalUrl,
        mainEntity: {
          '@id': `${SITE_URL}/#organization`,
        },
      };
      break;

    default:
      specificPageNode = {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        name: `LiveSimulators - ${route.view.charAt(0).toUpperCase() + route.view.slice(1).replace('-', ' ')}`,
        url: canonicalUrl,
      };
      break;
  }

  const nodes = [
    ORGANIZATION_SCHEMA,
    FOUNDER_PERSON_SCHEMA,
    WEBSITE_SCHEMA,
    breadcrumbList,
    specificPageNode,
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': cleanSchemaNode(nodes),
  };
}

/**
 * Universal Route Schema Resolver.
 * Returns the complete `@graph` JSON-LD object for any AppRoute with guaranteed syntax validity.
 */
export function getRouteSchema(route: AppRoute): { '@context': string; '@graph': Record<string, any>[] } {
  switch (route.view) {
    case 'home':
      return getHomepageSchema();

    case 'simulator': {
      const sim = ALL_AVAILABLE_SIMULATORS.find((s) => s.id === route.simulatorId) || ALL_AVAILABLE_SIMULATORS[0];
      return getSimulatorSchema(sim);
    }

    case 'embed': {
      const sim = ALL_AVAILABLE_SIMULATORS.find((s) => s.id === route.simulatorId) || ALL_AVAILABLE_SIMULATORS[0];
      return getSimulatorSchema(sim);
    }

    case 'department': {
      const dept = DISCIPLINES.find((d) => d.id === route.departmentId) || DISCIPLINES[0];
      return getDepartmentSchema(dept);
    }

    case 'lab': {
      const lab = LABS.find((l) => l.id === route.labId) || LABS[0];
      return getLabSchema(lab);
    }

    default:
      return getStaticPageSchema(route);
  }
}

/**
 * Returns the array of graph nodes for an AppRoute, suitable for passing to legacy meta managers.
 */
export function getRouteSchemaNodes(route: AppRoute): Record<string, any>[] {
  const schema = getRouteSchema(route);
  return schema['@graph'];
}
