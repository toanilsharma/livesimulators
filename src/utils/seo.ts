import { AppRoute, DisciplineId, SimulatorItem } from '../types';
import { DISCIPLINES, ALL_AVAILABLE_SIMULATORS } from '../data/simulators';
import { LABS } from '../config/labs';
import { routeToPath, SITE_URL } from './routes';
import { cleanLatexToPlainText } from './engineeringTheory';

export interface RouteSeoMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogType: string;
  ogImage: string;
  keywords: string[];
  jsonLd: Record<string, any>[];
}

export interface RouteConfig {
  path: string;
  title: string;
  description: string;
  keywords: string[];
  ogType: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

/**
 * Ensures title tags are strictly 60 characters or fewer for optimal search engine display without truncation.
 */
export function formatSeoTitle(mainText: string, suffix = 'LiveSimulators'): string {
  const brandSuffix = ` | ${suffix}`;
  const maxLen = 60;
  const targetMainLen = maxLen - brandSuffix.length;

  if (mainText.length <= targetMainLen) {
    return `${mainText}${brandSuffix}`;
  }

  const trimmed = mainText.slice(0, targetMainLen).trim();
  const lastSpace = trimmed.lastIndexOf(' ');
  const safeText = lastSpace > 18 ? trimmed.slice(0, lastSpace) : trimmed;
  return `${safeText}${brandSuffix}`;
}

/**
 * Central Routes Configuration:
 * Defines unique title, meta description, keywords, Open Graph type, and sitemap parameters for every route.
 */
export const CENTRAL_STATIC_ROUTES: Record<string, RouteConfig> = {
  '/': {
    path: '/',
    title: 'LiveSimulators - Interactive Engineering Simulations',
    description: "Free interactive engineering simulations and virtual laboratories. Don't just read engineering — see it happen with real-time physics in your browser.",
    keywords: [
      'engineering simulations',
      'interactive engineering',
      'virtual engineering lab',
      'RLC resonance simulator',
      'PID controller simulator',
      'RK4 physics solver',
      'circuit simulator online',
      'beam deflection visualization',
      'Anil Sharma engineering',
    ],
    ogType: 'website',
    changefreq: 'daily',
    priority: 1.0,
  },
  '/about': {
    path: '/about',
    title: 'About Us - LiveSimulators Engineering Platform',
    description: 'Learn about LiveSimulators mission, our 4th-Order Runge-Kutta (RK4) computational kernel, standards referencing (IEEE, ASME), and founder Anil Sharma.',
    keywords: ['about livesimulators', 'numerical pedagogy', 'engineering education', 'Anil Sharma founder', 'RK4 simulation engine'],
    ogType: 'article',
    changefreq: 'weekly',
    priority: 0.8,
  },
  '/contact': {
    path: '/contact',
    title: 'Contact Engineering Team - LiveSimulators',
    description: 'Direct communication desk for simulator suggestions, analytical equation inquiries, and academic collaborations with founder Anil Sharma (0808miracle@gmail.com).',
    keywords: ['contact livesimulators', 'Anil Sharma email', 'engineering simulator request', 'academic collaboration'],
    ogType: 'website',
    changefreq: 'weekly',
    priority: 0.8,
  },
  '/cookie-policy': {
    path: '/cookie-policy',
    title: 'Cookie & Telemetry Policy - LiveSimulators',
    description: 'Review our cookie disclosures, Google Analytics (G-WX8V8HH57V) telemetry details, and customize your privacy preferences using our interactive manager.',
    keywords: ['cookie policy', 'privacy preferences', 'Google tag G-WX8V8HH57V', 'ePrivacy compliance'],
    ogType: 'website',
    changefreq: 'monthly',
    priority: 0.5,
  },
  '/disclaimer': {
    path: '/disclaimer',
    title: 'Simulation Disclaimer - LiveSimulators',
    description: 'Important legal and technical notice regarding simulation approximations, boundary conditions, and the requirement for licensed Professional Engineer (PE) validation.',
    keywords: ['engineering disclaimer', 'numerical approximation', 'PE validation', 'limitation of liability'],
    ogType: 'website',
    changefreq: 'monthly',
    priority: 0.5,
  },
  '/privacy-policy': {
    path: '/privacy-policy',
    title: 'Privacy Policy - LiveSimulators',
    description: 'Transparent privacy policy detailing zero personal data sales, client-side computing architecture, user statutory rights, and data protection officer Anil Sharma.',
    keywords: ['privacy policy', 'GDPR compliance', 'CCPA CPRA', 'Anil Sharma data protection'],
    ogType: 'website',
    changefreq: 'monthly',
    priority: 0.5,
  },
  '/terms': {
    path: '/terms',
    title: 'Terms of Service - LiveSimulators',
    description: 'Terms of service and acceptable use agreement governing free educational access, classroom presentation rights, and intellectual property.',
    keywords: ['terms of service', 'educational access license', 'acceptable use', 'engineering simulation terms'],
    ogType: 'website',
    changefreq: 'monthly',
    priority: 0.5,
  },
};

// Founder Schema (Specialized Person entity for rich snippets and E-E-A-T attribution)
export const FOUNDER_PERSON_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/#founder`,
  name: 'Anil Sharma',
  jobTitle: 'Founder & Lead Computational Modeling Engineer',
  worksFor: {
    '@id': `${SITE_URL}/#organization`,
  },
  description: 'Founder of LiveSimulators. Specializes in first-principles numerical modeling, 4th-Order Runge-Kutta (RK4) ODE solvers, symplectic physics integration, and interactive engineering pedagogy.',
  email: '0808miracle@gmail.com',
  url: 'https://www.linkedin.com/in/toanilsharma/',
  sameAs: ['https://www.linkedin.com/in/toanilsharma/'],
  knowsAbout: [
    'Computational Physics',
    'Numerical Integration',
    '4th-Order Runge-Kutta (RK4)',
    'Electrical & Electronic Systems',
    'Mechanical & Thermal Engineering',
    'Structural Analysis & Civil Engineering',
    'Industrial Control Systems & PID Tuning',
    'Engineering Pedagogy',
  ],
};

// Base Organization Schema (Sitewide)
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'LiveSimulators',
  url: SITE_URL,
  logo: `${SITE_URL}/og-default.png`,
  sameAs: [
    'https://mech.livesimulators.com',
    'https://designcalculators.co.in',
  ],
};

// Base WebSite Schema (Sitewide SearchAction)
export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'LiveSimulators',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

// Curricular Course Codes printed on Homepage
export const HOMEPAGE_COURSE_CODES: Record<string, { code: string; name: string }> = {
  electrical: { code: 'EE-200', name: 'Electrical & Electronic Systems' },
  mechanical: { code: 'ME-400', name: 'Mechanical & Thermal Dynamics' },
  control: { code: 'IC-300', name: 'Control Systems & Instrumentation' },
  civil: { code: 'CE-320', name: 'Civil & Structural Mechanics' },
  chemical: { code: 'CH-250', name: 'Chemical & Process Engineering' },
  physics: { code: 'PH-500', name: 'Quantum & Semiconductor Physics' },
};

/**
 * Generates complete SEO metadata and Schema.org JSON-LD for any route.
 */
export function getSeoMetadata(route: AppRoute): RouteSeoMetadata {
  const path = routeToPath(route);
  // Ensure strict clean base URL by stripping any query strings or hashes
  const cleanPath = path.split('?')[0].split('#')[0];
  const canonicalUrl = `${SITE_URL}${cleanPath === '/' ? '/' : cleanPath}`;
  const defaultOgImage = `${SITE_URL}/og-default.png`;

  switch (route.view) {
    case 'home': {
      const cfg = CENTRAL_STATIC_ROUTES['/'];
      return {
        title: cfg.title,
        description: cfg.description,
        canonicalUrl,
        ogType: cfg.ogType,
        ogImage: defaultOgImage,
        keywords: cfg.keywords,
        jsonLd: [
          ORGANIZATION_SCHEMA,
          WEBSITE_SCHEMA,
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: SITE_URL,
              },
            ],
          },
        ],
      };
    }

    case 'about': {
      const cfg = CENTRAL_STATIC_ROUTES['/about'];
      return {
        title: cfg.title,
        description: cfg.description,
        canonicalUrl,
        ogType: cfg.ogType,
        ogImage: defaultOgImage,
        keywords: cfg.keywords,
        jsonLd: [
          ORGANIZATION_SCHEMA,
          FOUNDER_PERSON_SCHEMA,
          WEBSITE_SCHEMA,
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'About Us', item: canonicalUrl },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            '@id': `${canonicalUrl}#aboutpage`,
            name: 'About LiveSimulators & Founder Anil Sharma',
            description: cfg.description,
            url: canonicalUrl,
            mainEntity: {
              '@id': `${SITE_URL}/#founder`,
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'About LiveSimulators - The Numerical Pedagogy Revolution',
            author: { '@id': `${SITE_URL}/#founder` },
            publisher: { '@id': `${SITE_URL}/#organization` },
            description: 'Why interactive first-principles simulations are replacing static textbook formulas in engineering education.',
            url: canonicalUrl,
          },
        ],
      };
    }

    case 'contact': {
      const cfg = CENTRAL_STATIC_ROUTES['/contact'];
      return {
        title: cfg.title,
        description: cfg.description,
        canonicalUrl,
        ogType: cfg.ogType,
        ogImage: defaultOgImage,
        keywords: cfg.keywords,
        jsonLd: [
          ORGANIZATION_SCHEMA,
          WEBSITE_SCHEMA,
          {
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            url: canonicalUrl,
            name: 'Contact LiveSimulators Engineering Team',
            mainEntity: {
              '@type': 'Person',
              name: 'Anil Sharma',
              email: '0808miracle@gmail.com',
              url: 'https://www.linkedin.com/in/toanilsharma/',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Contact Us', item: canonicalUrl },
            ],
          },
        ],
      };
    }

    case 'cookie-policy': {
      const cfg = CENTRAL_STATIC_ROUTES['/cookie-policy'];
      return {
        title: cfg.title,
        description: cfg.description,
        canonicalUrl,
        ogType: cfg.ogType,
        ogImage: defaultOgImage,
        keywords: cfg.keywords,
        jsonLd: [
          ORGANIZATION_SCHEMA,
          WEBSITE_SCHEMA,
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Cookie Policy', item: canonicalUrl },
            ],
          },
        ],
      };
    }

    case 'disclaimer': {
      const cfg = CENTRAL_STATIC_ROUTES['/disclaimer'];
      return {
        title: cfg.title,
        description: cfg.description,
        canonicalUrl,
        ogType: cfg.ogType,
        ogImage: defaultOgImage,
        keywords: cfg.keywords,
        jsonLd: [
          ORGANIZATION_SCHEMA,
          WEBSITE_SCHEMA,
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Disclaimer', item: canonicalUrl },
            ],
          },
        ],
      };
    }

    case 'privacy-policy': {
      const cfg = CENTRAL_STATIC_ROUTES['/privacy-policy'];
      return {
        title: cfg.title,
        description: cfg.description,
        canonicalUrl,
        ogType: cfg.ogType,
        ogImage: defaultOgImage,
        keywords: cfg.keywords,
        jsonLd: [
          ORGANIZATION_SCHEMA,
          WEBSITE_SCHEMA,
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: canonicalUrl },
            ],
          },
        ],
      };
    }

    case 'terms': {
      const cfg = CENTRAL_STATIC_ROUTES['/terms'];
      return {
        title: cfg.title,
        description: cfg.description,
        canonicalUrl,
        ogType: cfg.ogType,
        ogImage: defaultOgImage,
        keywords: cfg.keywords,
        jsonLd: [
          ORGANIZATION_SCHEMA,
          WEBSITE_SCHEMA,
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: canonicalUrl },
            ],
          },
        ],
      };
    }

    case 'department': {
      const dept = DISCIPLINES.find((d) => d.id === route.departmentId) || DISCIPLINES[0];
      const deptSimulators = ALL_AVAILABLE_SIMULATORS.filter((s) => s.discipline === dept.id);
      const title = `Interactive ${dept.name} Engineering Simulators & Calculators | LiveSimulators`;
      const description = `Interactive ${dept.name} (${dept.code}) engineering simulators and calculators. ${dept.description} Solves first-principles equations governed by ${dept.coreEquation}, covering ${dept.subfields.join(', ')}. Run real-time Float64 physics solvers online.`
        .replace(/\s+/g, ' ')
        .trim();

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: dept.name, item: canonicalUrl },
        ],
      };

      const itemListSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': `${canonicalUrl}#itemlist`,
        name: `${dept.name} Simulators`,
        description: `Interactive ${dept.name} simulators and numerical physics solvers.`,
        numberOfItems: deptSimulators.length,
        itemListElement: deptSimulators.map((s, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: s.title,
          url: `${SITE_URL}/simulator/${s.id}`,
        })),
      };

      return {
        title,
        description,
        canonicalUrl,
        ogType: 'website',
        ogImage: defaultOgImage,
        keywords: [
          `${dept.name} simulator`,
          ...dept.subfields,
          'interactive engineering',
          'online engineering workbench',
        ],
        jsonLd: [
          ORGANIZATION_SCHEMA,
          WEBSITE_SCHEMA,
          breadcrumbSchema,
          itemListSchema,
        ],
      };
    }

    case 'simulator': {
      const sim = ALL_AVAILABLE_SIMULATORS.find((s) => s.id === route.simulatorId) || ALL_AVAILABLE_SIMULATORS[0];
      const dept = DISCIPLINES.find((d) => d.id === sim.discipline);
      const title = `Interactive ${sim.title} Simulator & Calculator | LiveSimulators`;
      const description = `Interactive ${sim.title} simulator & calculator. ${sim.description} Governed by ${sim.physicalLaw} (${sim.equationDescription}: ${cleanLatexToPlainText(sim.governingEquation)}). Solves real-time 60 FPS Float64 differential equations in your browser.`
        .replace(/\s+/g, ' ')
        .trim();

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { 
            '@type': 'ListItem', 
            position: 2, 
            name: dept ? dept.name : sim.disciplineName, 
            item: dept ? `${SITE_URL}/department/${dept.id}` : SITE_URL 
          },
          { '@type': 'ListItem', position: 3, name: sim.title, item: canonicalUrl },
        ],
      };

      const webApplicationSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        '@id': `${canonicalUrl}#webapplication`,
        name: `Interactive ${sim.title} Simulator & Calculator`,
        alternateName: sim.title,
        description: sim.description,
        applicationCategory: 'EngineeringApplication',
        operatingSystem: 'Web Browser',
        browserRequirements: 'Requires HTML5 Canvas and JavaScript support. Runs client-side Float64 numerical physics engine.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        url: canonicalUrl,
      };

      const courseInfo = HOMEPAGE_COURSE_CODES[sim.discipline] || {
        code: 'EE-200',
        name: 'Engineering Systems',
      };

      const learningResourceSchema = {
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        '@id': `${canonicalUrl}#learning-resource`,
        name: sim.title,
        description: sim.description,
        learningResourceType: 'Interactive Resource',
        educationalUse: 'simulation',
        educationalAlignment: [
          {
            '@type': 'AlignmentObject',
            alignmentType: 'educationalSubject',
            educationalFramework: 'EducationalOccupationalCredential',
            targetName: courseInfo.code,
            targetDescription: `${courseInfo.name} (${courseInfo.code})`,
          },
        ],
        url: canonicalUrl,
      };

      return {
        title,
        description,
        canonicalUrl,
        ogType: 'website',
        ogImage: defaultOgImage,
        keywords: [
          sim.title,
          sim.disciplineName,
          sim.physicalLaw,
          ...(sim.courseMapping ? sim.courseMapping.split(',').map((c) => c.trim()) : []),
          ...sim.tags,
          'interactive simulator',
          'first-principles solver',
          'virtual engineering lab',
        ],
        jsonLd: [
          ORGANIZATION_SCHEMA,
          WEBSITE_SCHEMA,
          breadcrumbSchema,
          webApplicationSchema,
          learningResourceSchema,
        ],
      };
    }

    case 'embed': {
      const sim = ALL_AVAILABLE_SIMULATORS.find((s) => s.id === route.simulatorId) || ALL_AVAILABLE_SIMULATORS[0];
      const title = `Interactive ${sim.title} Simulator & Calculator (Embed) | LiveSimulators`;
      const description = `Interactive virtual laboratory embed for ${sim.title}. Governed by ${sim.physicalLaw} (${sim.equationDescription}: ${cleanLatexToPlainText(sim.governingEquation)}). Solves real-time Float64 differential equations in your browser.`
        .replace(/\s+/g, ' ')
        .trim();
      return {
        title,
        description,
        canonicalUrl: `${SITE_URL}/simulator/${sim.id}`,
        ogType: 'website',
        ogImage: defaultOgImage,
        keywords: [sim.title, 'interactive embed', 'virtual lab embed', 'engineering simulator'],
        jsonLd: [
          ORGANIZATION_SCHEMA,
          WEBSITE_SCHEMA,
        ],
      };
    }

    case 'lab': {
      const lab = LABS.find((l) => l.id === route.labId) || LABS[0];
      const canonicalUrl = `${SITE_URL}/lab/${lab.id}`;
      const labOgImage = `${SITE_URL}${lab.shot}`;

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Industrial Labs Pro', item: `${SITE_URL}/#industrial-labs` },
          { '@type': 'ListItem', position: 3, name: lab.name, item: canonicalUrl },
        ],
      };

      const softwareAppSchema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        '@id': `${canonicalUrl}#software-application`,
        name: lab.name,
        description: lab.tagline,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'All Modern Web Browsers',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        author: {
          '@type': 'Person',
          name: 'Anil Sharma',
          url: 'https://www.linkedin.com/in/toanilsharma/',
        },
        publisher: {
          '@id': `${SITE_URL}/#organization`,
        },
        url: canonicalUrl,
      };

      const learningResourceSchema = {
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        '@id': `${canonicalUrl}#learning-resource`,
        name: lab.name,
        description: lab.tagline,
        learningResourceType: 'Industrial Simulation Suite',
        educationalLevel: 'Professional / Graduate Engineering',
        educationalUse: ['Industrial Simulation', 'Professional Engineering Training', 'Laboratory Workbench'],
        about: [
          ...lab.sectors,
          lab.standardBadge,
        ],
        teaches: lab.capabilities.join('. '),
        author: {
          '@type': 'Person',
          name: 'Anil Sharma',
          url: 'https://www.linkedin.com/in/toanilsharma/',
        },
        publisher: {
          '@id': `${SITE_URL}/#organization`,
        },
        isAccessibleForFree: true,
        inLanguage: 'en',
        url: canonicalUrl,
      };

      return {
        title: formatSeoTitle(lab.name),
        description: `${lab.name}: ${lab.tagline} Referencing ${lab.standardBadge} methodologies. Includes ${lab.modules} interactive modules for ${lab.sectors.join(', ')}.`,
        canonicalUrl,
        ogType: 'website',
        ogImage: labOgImage,
        keywords: [
          lab.name,
          ...lab.sectors,
          ...lab.capabilities,
          lab.standardBadge,
          'industrial lab',
          'engineering workbench',
          'power simulation',
          'IEEE standards',
        ],
        jsonLd: [
          ORGANIZATION_SCHEMA,
          WEBSITE_SCHEMA,
          breadcrumbSchema,
          softwareAppSchema,
          learningResourceSchema,
        ],
      };
    }

    case 'not-found': {
      return {
        title: '404: Page Not Found - LiveSimulators',
        description: 'The requested engineering simulator or page could not be found. Explore our interactive engineering simulations on LiveSimulators.',
        canonicalUrl: `${SITE_URL}/404`,
        ogType: 'website',
        ogImage: defaultOgImage,
        keywords: ['404 not found', 'engineering simulations'],
        jsonLd: [
          ORGANIZATION_SCHEMA,
          WEBSITE_SCHEMA,
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: 'Page Not Found', item: `${SITE_URL}/404` },
            ],
          },
        ],
      };
    }

    default:
      return {
        title: 'LiveSimulators - Interactive Engineering Simulations',
        description: 'Interactive real-time physics and engineering simulations.',
        canonicalUrl: SITE_URL,
        ogType: 'website',
        ogImage: defaultOgImage,
        keywords: ['engineering simulation'],
        jsonLd: [ORGANIZATION_SCHEMA, WEBSITE_SCHEMA],
      };
  }
}

/**
 * Updates DOM head tags dynamically during client-side navigation.
 */
export function applySeoMetadata(route: AppRoute): RouteSeoMetadata {
  const meta = getSeoMetadata(route);
  if (typeof document === 'undefined') return meta;

  // 1. Update Title
  document.title = meta.title;

  // 2. Helper to set or create meta tag
  const setMeta = (name: string, content: string, isProperty = false) => {
    const attr = isProperty ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  // Standard Meta Tags
  setMeta('description', meta.description);
  setMeta('keywords', meta.keywords.join(', '));
  setMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large');

  // OpenGraph Tags
  setMeta('og:title', meta.title, true);
  setMeta('og:description', meta.description, true);
  setMeta('og:url', meta.canonicalUrl, true);
  setMeta('og:type', meta.ogType, true);
  setMeta('og:image', meta.ogImage, true);

  // Twitter Card Tags
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', meta.title);
  setMeta('twitter:description', meta.description);
  setMeta('twitter:image', meta.ogImage);

  // 3. Strict Canonical Link Tag (dynamically strips ALL query parameters and hashes)
  const cleanCanonical = meta.canonicalUrl.split('?')[0].split('#')[0];
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', cleanCanonical);

  // Ensure only 1 canonical tag exists
  const allCanonicals = document.querySelectorAll('link[rel="canonical"]');
  if (allCanonicals.length > 1) {
    for (let i = 1; i < allCanonicals.length; i++) {
      allCanonicals[i].remove();
    }
  }

  // 4. Update JSON-LD Script with valid Schema.org @graph format strictly in <head>
  let jsonLdEl = document.getElementById('seo-jsonld') as HTMLScriptElement;
  if (!jsonLdEl) {
    jsonLdEl = document.createElement('script');
    jsonLdEl.id = 'seo-jsonld';
    jsonLdEl.type = 'application/ld+json';
    document.head.appendChild(jsonLdEl);
  } else if (jsonLdEl.parentElement !== document.head) {
    document.head.appendChild(jsonLdEl);
  }

  const graphData = {
    '@context': 'https://schema.org',
    '@graph': meta.jsonLd.map((node) => {
      const { '@context': _, ...cleanNode } = node;
      return cleanNode;
    }),
  };

  jsonLdEl.textContent = JSON.stringify(graphData, null, 2);

  return meta;
}
