import { AppRoute, DisciplineId, SimulatorItem } from '../types';
import { DISCIPLINES, ALL_AVAILABLE_SIMULATORS } from '../data/simulators';
import { LABS } from '../config/labs';
import { routeToPath, SITE_URL } from './routes';

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

// Base Founder & Organization Schema (Validated for Google Rich Results Test)
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'EducationalOrganization'],
  '@id': `${SITE_URL}/#organization`,
  name: 'LiveSimulators',
  alternateName: 'LiveSimulators.com',
  url: SITE_URL,
  logo: `${SITE_URL}/og-default.png`,
  image: `${SITE_URL}/og-default.png`,
  description: "Don't just read engineering. See it happen. Interactive first-principles numerical engineering simulations for students, educators, and practicing engineers.",
  founder: {
    '@type': 'Person',
    name: 'Anil Sharma',
    jobTitle: 'Founder & Lead Computational Modeling Engineer',
    email: '0808miracle@gmail.com',
    url: 'https://www.linkedin.com/in/toanilsharma/',
    sameAs: ['https://www.linkedin.com/in/toanilsharma/'],
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: '0808miracle@gmail.com',
    contactType: 'customer service',
    availableLanguage: ['English'],
  },
  sameAs: ['https://www.linkedin.com/in/toanilsharma/'],
};

// Base WebSite Schema (Site-wide SearchAction)
export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'LiveSimulators',
  url: SITE_URL,
  description: "Don't just read engineering. See it happen. Interactive engineering simulations that turn theory into visual understanding.",
  publisher: {
    '@id': `${SITE_URL}/#organization`,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

// Core Engineering FAQ Schema
export const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do LiveSimulators numerical physics engines work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LiveSimulators runs client-side Float64 numerical integrators using 4th-Order Runge-Kutta (RK4) and symplectic algorithms. Differential equations and boundary conditions are solved live at 60 FPS directly in the browser with zero server latency.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are LiveSimulators models aligned with international engineering standards?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Simulations reference established industry standards including IEEE Std 1459/3002, ASME MFC-3M, ISO 5167, IEC 60076/60381, AISC 360, and SI-CODATA fundamental physical constants.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can professors and universities use LiveSimulators for classroom lectures and syllabi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. LiveSimulators is an open-access educational platform. Educators can freely demonstrate live simulations, project workbenches during lectures, and integrate simulation links into syllabus coursework.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who created LiveSimulators?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LiveSimulators was founded and engineered by Anil Sharma (email: 0808miracle@gmail.com, LinkedIn: https://www.linkedin.com/in/toanilsharma/) to transform mathematical pedagogy into visual physical intuition.',
      },
    },
  ],
};

/**
 * Generates complete SEO metadata and Schema.org JSON-LD for any route.
 */
export function getSeoMetadata(route: AppRoute): RouteSeoMetadata {
  const path = routeToPath(route);
  const canonicalUrl = `${SITE_URL}${path}`;
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
          FAQ_SCHEMA,
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
            '@type': 'Article',
            headline: 'About LiveSimulators - The Numerical Pedagogy Revolution',
            author: { '@type': 'Person', name: 'Anil Sharma' },
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
      const shortDept = dept.name.split('(')[0].trim();
      return {
        title: formatSeoTitle(`${shortDept} Simulators`),
        description: `Explore interactive ${dept.name} simulations. ${dept.description.slice(0, 140)}... Run real-time differential equation solutions online.`,
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
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
              { '@type': 'ListItem', position: 2, name: dept.name, item: canonicalUrl },
            ],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${dept.name} Simulators Hub`,
            description: dept.description,
            url: canonicalUrl,
            about: {
              '@type': 'DefinedTerm',
              name: dept.name,
              termCode: dept.code,
            },
          },
        ],
      };
    }

    case 'simulator': {
      const sim = ALL_AVAILABLE_SIMULATORS.find((s) => s.id === route.simulatorId) || ALL_AVAILABLE_SIMULATORS[0];
      const dept = DISCIPLINES.find((d) => d.id === sim.discipline);
      const cleanDesc = `${sim.tagline} ${sim.description}`.slice(0, 155);

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

      const learningResourceSchema = {
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        '@id': `${canonicalUrl}#learning-resource`,
        name: sim.title,
        description: sim.description,
        learningResourceType: 'Simulation',
        educationalLevel: sim.difficulty,
        educationalUse: ['Simulation', 'Instruction', 'Laboratory Exploration'],
        about: [
          sim.disciplineName,
          sim.physicalLaw,
          sim.standardReference || 'International Engineering Standards',
        ],
        teaches: `Governing physical formulation: ${sim.governingEquation}. ${sim.equationDescription}`,
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

      const techArticleSchema = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: `${sim.title} - Mathematical Formulation & Analytical Proof`,
        description: sim.analyticalProof || sim.description,
        proficiencyLevel: sim.difficulty,
        author: {
          '@type': 'Person',
          name: 'Anil Sharma',
        },
        publisher: {
          '@id': `${SITE_URL}/#organization`,
        },
        dependencies: sim.standardReference || 'Engineering Standard Reference',
        url: canonicalUrl,
      };

      const courseSchema = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        '@id': `${canonicalUrl}#course`,
        name: `${sim.title} - Virtual Laboratory Module`,
        description: sim.description,
        courseCode: sim.courseMapping ? sim.courseMapping.split(',')[0].trim() : `${dept?.code || 'ENG-100'}`,
        provider: {
          '@id': `${SITE_URL}/#organization`,
        },
        educationalCredentialAwarded: 'Open Academic Access',
        isAccessibleForFree: true,
        hasCourseInstance: {
          '@type': 'CourseInstance',
          courseMode: 'online',
          courseWorkload: 'PT30M',
          instructor: {
            '@type': 'Person',
            name: 'Anil Sharma',
          },
        },
      };

      const faqList = (sim.faqs && sim.faqs.length > 0)
        ? sim.faqs
        : [
            {
              question: `What physical formulation governs the ${sim.title}?`,
              answer: `The ${sim.title} is governed by ${sim.physicalLaw}, evaluated via ${sim.equationDescription}: ${sim.governingEquation}.`,
            },
            {
              question: `How is the ${sim.title} utilized in engineering curricula?`,
              answer: `Students and professors use this interactive model in ${sim.courseMapping || (dept ? dept.name : 'Engineering')} coursework to observe real-time dynamic response, measure key output metrics, and verify theoretical textbook derivations without physical hardware constraints.`,
            },
            {
              question: `Can educators embed the ${sim.title} into university LMS platforms like Canvas or Moodle?`,
              answer: `Yes, LiveSimulators supports standard iframe embeds (<iframe src="https://livesimulators.com/embed/${sim.id}" width="100%" height="600"></iframe>) for direct integration into Canvas, Moodle, Blackboard, and laboratory worksheets.`,
            },
          ];

      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqList.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.answer,
          },
        })),
      };

      return {
        title: formatSeoTitle(sim.title),
        description: cleanDesc,
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
          learningResourceSchema,
          techArticleSchema,
          courseSchema,
          faqSchema,
        ],
      };
    }

    case 'embed': {
      const sim = ALL_AVAILABLE_SIMULATORS.find((s) => s.id === route.simulatorId) || ALL_AVAILABLE_SIMULATORS[0];
      return {
        title: formatSeoTitle(`${sim.title} (Embed)`),
        description: `Interactive embed for ${sim.title}. First-principles engineering simulation for laboratory coursework.`,
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

  // 3. Canonical Link Tag
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', meta.canonicalUrl);

  // 4. Update JSON-LD Script with @graph format
  let jsonLdEl = document.getElementById('seo-jsonld') as HTMLScriptElement;
  if (!jsonLdEl) {
    jsonLdEl = document.createElement('script');
    jsonLdEl.id = 'seo-jsonld';
    jsonLdEl.type = 'application/ld+json';
    document.head.appendChild(jsonLdEl);
  }

  const graphData = {
    '@context': 'https://schema.org',
    '@graph': meta.jsonLd.map((node) => {
      const { '@context': _, ...cleanNode } = node;
      return cleanNode;
    }),
  };

  jsonLdEl.textContent = JSON.stringify(graphData);

  return meta;
}
