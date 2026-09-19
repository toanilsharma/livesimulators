import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { HomeDepartmentsHub } from './components/HomeDepartmentsHub';
import { DepartmentPage } from './components/DepartmentPage';
import { DedicatedSimulatorPage } from './components/DedicatedSimulatorPage';
import { DedicatedLabPage } from './components/DedicatedLabPage';
import { WhyInteractive } from './components/WhyInteractive';
import { HowItWorks } from './components/HowItWorks';
import { AudiencePillars } from './components/AudiencePillars';
import { TrustPrinciples } from './components/TrustPrinciples';
import { IndustrialLabsSection } from './components/IndustrialLabsSection';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { CookieBanner } from './components/CookieBanner';
import { ContactPage } from './components/pages/ContactPage';
import { AboutPage } from './components/pages/AboutPage';
import { CookiePolicyPage } from './components/pages/CookiePolicyPage';
import { DisclaimerPage } from './components/pages/DisclaimerPage';
import { PrivacyPolicyPage } from './components/pages/PrivacyPolicyPage';
import { TermsPage } from './components/pages/TermsPage';
import { NotFoundPage } from './components/pages/NotFoundPage';
import { ALL_AVAILABLE_SIMULATORS, FEATURED_ELECTRICAL_SIMULATORS } from './data/simulators';
import { SimulatorItem, DisciplineId, AudiencePersona, AppRoute } from './types';
import { parsePathToRoute, routeToPath, navigateTo } from './utils/routes';
import { applySeoMetadata } from './utils/seo';
import { trackSimulatorOpen } from './utils/analytics';

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => {
    if (typeof window !== 'undefined') {
      return parsePathToRoute(window.location.pathname, window.location.hash);
    }
    return { view: 'home' };
  });

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');

  // Handle browser back/forward (popstate) and custom app navigation events
  useEffect(() => {
    // If visitor entered via legacy hash (e.g. #/about), cleanly replace with real path in address bar
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.startsWith('#/')) {
      const targetRoute = parsePathToRoute(window.location.hash.slice(1));
      const targetPath = routeToPath(targetRoute);
      window.history.replaceState({}, '', targetPath);
      setRoute(targetRoute);
    }

    const handleLocationChange = () => {
      setRoute(parsePathToRoute(window.location.pathname, window.location.hash));
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('app:navigate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('app:navigate', handleLocationChange);
    };
  }, []);

  // Update document title, canonical, OpenGraph, and Schema.org JSON-LD dynamically
  useEffect(() => {
    const meta = applySeoMetadata(route);
    const path = routeToPath(route);

    // Track page_view in Google Analytics
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'page_view', {
        page_title: meta.title,
        page_location: meta.canonicalUrl,
        page_path: path,
      });
    }
  }, [route]);

  // Navigate to a dedicated simulator page
  const handleLaunchSimulator = (simulator: SimulatorItem) => {
    trackSimulatorOpen(simulator.discipline, simulator.id);
    navigateTo(`/simulator/${simulator.id}`);
  };

  // Navigate to a dedicated department page
  const handleSelectDepartment = (deptId: DisciplineId) => {
    navigateTo(`/department/${deptId}`);
  };

  // Navigate back to home
  const handleBackToHome = () => {
    navigateTo('/');
  };

  // Dedicated Page Navigators (History API real paths)
  const handleNavigateToContact = () => {
    navigateTo('/contact');
  };

  const handleNavigateToAbout = () => {
    navigateTo('/about');
  };

  const handleNavigateToCookiePolicy = () => {
    navigateTo('/cookie-policy');
  };

  const handleNavigateToDisclaimer = () => {
    navigateTo('/disclaimer');
  };

  const handleNavigateToPrivacyPolicy = () => {
    navigateTo('/privacy-policy');
  };

  const handleNavigateToTerms = () => {
    navigateTo('/terms');
  };

  // Open search modal with an optional search term
  const handleOpenSearchWithQuery = (query: string) => {
    setSearchInitialQuery(query);
    setSearchOpen(true);
  };

  // Quick launch default workbench (RLC Resonant Circuit dedicated page)
  const handleQuickLaunch = () => {
    handleLaunchSimulator(FEATURED_ELECTRICAL_SIMULATORS[0]);
  };

  const handleOpenTopic = (topic: string) => {
    handleOpenSearchWithQuery(topic);
  };

  const handleExploreForAudience = (persona: AudiencePersona) => {
    if (persona === 'educators') {
      handleSelectDepartment('mechanical');
    } else if (persona === 'engineers') {
      handleSelectDepartment('civil');
    } else {
      handleSelectDepartment('electrical');
    }
  };

  // Helper to find simulator by ID
  const activeSimulator =
    route.view === 'simulator'
      ? ALL_AVAILABLE_SIMULATORS.find((s) => s.id === route.simulatorId) || FEATURED_ELECTRICAL_SIMULATORS[0]
      : null;

  return (
    <div
      className={`bg-[#080d16] text-slate-100 flex flex-col selection:bg-cyan-500/25 selection:text-cyan-200 w-full max-w-full overflow-x-hidden ${
        route.view === 'simulator'
          ? 'h-[100dvh] max-h-[100dvh] overflow-hidden'
          : 'min-h-screen'
      }`}
    >
      {/* 1. Global Navigation Bar (shown on all pages except full-screen workbench) */}
      {route.view !== 'simulator' && (
        <Navbar
          onOpenSearch={() => {
            setSearchInitialQuery('');
            setSearchOpen(true);
          }}
          onQuickLaunch={handleQuickLaunch}
          onSelectDiscipline={(discId) => handleSelectDepartment(discId as DisciplineId)}
          onGoHome={handleBackToHome}
          onNavigateToAbout={handleNavigateToAbout}
          onNavigateToContact={handleNavigateToContact}
        />
      )}

      {/* 2. Routing Views */}
      {route.view === 'home' && (
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          {/* Hero with Dedicated Department Buttons */}
          <Hero
            onSelectDepartment={handleSelectDepartment}
            onLaunchSimulator={handleLaunchSimulator}
          />

          {/* Dedicated Engineering Departments Hub */}
          <HomeDepartmentsHub
            onSelectDepartment={handleSelectDepartment}
            onLaunchSimulator={handleLaunchSimulator}
          />

          {/* Full-Scale Industrial Simulation Suites */}
          <IndustrialLabsSection />

          {/* Educational & Trust Pillars */}
          <WhyInteractive />
          <HowItWorks />
          <AudiencePillars onExploreForAudience={handleExploreForAudience} />
          <TrustPrinciples />
        </main>
      )}

      {route.view === 'department' && (
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          <DepartmentPage
            departmentId={route.departmentId}
            onBackToHome={handleBackToHome}
            onLaunchSimulator={handleLaunchSimulator}
          />
        </main>
      )}

      {route.view === 'simulator' && activeSimulator && (
        <main className="flex-1 min-h-0 h-full w-full max-w-full overflow-hidden flex flex-col">
          <DedicatedSimulatorPage
            simulator={activeSimulator}
            onBackToDepartment={(deptId) => handleSelectDepartment(deptId)}
            onBackToHome={handleBackToHome}
            onSelectSimulator={handleLaunchSimulator}
          />
        </main>
      )}

      {/* Dedicated Full-Scale Industrial Lab Workbench */}
      {route.view === 'lab' && (
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          <DedicatedLabPage
            labId={route.labId}
            onBack={handleBackToHome}
          />
        </main>
      )}

      {/* Dedicated World-Class Independent Pages */}
      {route.view === 'contact' && (
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          <ContactPage onBackToHome={handleBackToHome} />
        </main>
      )}

      {route.view === 'about' && (
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          <AboutPage 
            onBackToHome={handleBackToHome} 
            onNavigateToContact={handleNavigateToContact} 
          />
        </main>
      )}

      {route.view === 'cookie-policy' && (
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          <CookiePolicyPage 
            onBackToHome={handleBackToHome} 
            onNavigateToPrivacy={handleNavigateToPrivacyPolicy}
            onNavigateToContact={handleNavigateToContact} 
          />
        </main>
      )}

      {route.view === 'disclaimer' && (
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          <DisclaimerPage 
            onBackToHome={handleBackToHome} 
            onNavigateToTerms={handleNavigateToTerms}
            onNavigateToContact={handleNavigateToContact} 
          />
        </main>
      )}

      {route.view === 'privacy-policy' && (
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          <PrivacyPolicyPage 
            onBackToHome={handleBackToHome} 
            onNavigateToCookiePolicy={handleNavigateToCookiePolicy}
            onNavigateToContact={handleNavigateToContact} 
          />
        </main>
      )}

      {route.view === 'terms' && (
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          <TermsPage 
            onBackToHome={handleBackToHome} 
            onNavigateToDisclaimer={handleNavigateToDisclaimer}
            onNavigateToContact={handleNavigateToContact} 
          />
        </main>
      )}

      {/* Branded 404 Page for Unknown Routes */}
      {route.view === 'not-found' && (
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          <NotFoundPage
            attemptedPath={route.attemptedPath}
            onGoHome={handleBackToHome}
            onOpenSearch={() => {
              setSearchInitialQuery('');
              setSearchOpen(true);
            }}
            onSelectSimulator={handleLaunchSimulator}
            onSelectDepartment={handleSelectDepartment}
          />
        </main>
      )}

      {/* 3. Global Engineering Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        initialQuery={searchInitialQuery}
        onClose={() => setSearchOpen(false)}
        onSelectSimulator={(sim) => {
          setSearchOpen(false);
          handleLaunchSimulator(sim);
        }}
      />

      {/* 4. Global Footer with all compliance & legal links */}
      {route.view !== 'simulator' && (
        <Footer
          onSelectDiscipline={(discId) => handleSelectDepartment(discId as DisciplineId)}
          onOpenTopic={handleOpenTopic}
          onGoHome={handleBackToHome}
          onNavigateToAbout={handleNavigateToAbout}
          onNavigateToContact={handleNavigateToContact}
          onNavigateToCookiePolicy={handleNavigateToCookiePolicy}
          onNavigateToDisclaimer={handleNavigateToDisclaimer}
          onNavigateToPrivacyPolicy={handleNavigateToPrivacyPolicy}
          onNavigateToTerms={handleNavigateToTerms}
        />
      )}

      {/* 5. Non-intrusive Cookie Consent Banner */}
      <CookieBanner onNavigateToCookiePolicy={handleNavigateToCookiePolicy} />
    </div>
  );
}
