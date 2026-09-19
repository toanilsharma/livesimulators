import { AppRoute, DisciplineId } from '../types';
import { DISCIPLINES, ALL_AVAILABLE_SIMULATORS } from '../data/simulators';
import { LABS } from '../config/labs';

export const SITE_URL = 'https://livesimulators.com';

/**
 * Converts a browser URL pathname (and optional legacy hash) to an AppRoute object.
 */
export function parsePathToRoute(pathname: string, hash?: string): AppRoute {
  // Check for legacy hash routes first (e.g. #/about, #/simulator/rlc-resonance, #/lab/power-electronics-lab)
  if (hash && hash.startsWith('#/')) {
    const hashPath = hash.slice(1); // remove '#'
    return parsePathToRoute(hashPath);
  }

  // Normalize pathname: strip trailing slash (unless it is '/')
  const cleanPath = pathname.length > 1 && pathname.endsWith('/') 
    ? pathname.slice(0, -1) 
    : pathname;

  if (!cleanPath || cleanPath === '/' || cleanPath === '') {
    return { view: 'home' };
  }

  if (cleanPath === '/about') {
    return { view: 'about' };
  }

  if (cleanPath === '/contact') {
    return { view: 'contact' };
  }

  if (cleanPath === '/cookie-policy' || cleanPath === '/cookies') {
    return { view: 'cookie-policy' };
  }

  if (cleanPath === '/disclaimer') {
    return { view: 'disclaimer' };
  }

  if (cleanPath === '/privacy-policy' || cleanPath === '/privacy') {
    return { view: 'privacy-policy' };
  }

  if (cleanPath === '/terms') {
    return { view: 'terms' };
  }

  // Match /department/:departmentId
  const deptMatch = cleanPath.match(/^\/department\/([a-zA-Z0-9_-]+)$/);
  if (deptMatch) {
    const deptId = deptMatch[1].toLowerCase() as DisciplineId;
    if (DISCIPLINES.some((d) => d.id === deptId)) {
      return { view: 'department', departmentId: deptId };
    }
    return { view: 'not-found', attemptedPath: cleanPath };
  }

  // Match /simulator/:simulatorId
  const simMatch = cleanPath.match(/^\/simulator\/([a-zA-Z0-9_-]+)$/);
  if (simMatch) {
    const simId = simMatch[1];
    if (ALL_AVAILABLE_SIMULATORS.some((s) => s.id === simId)) {
      return { view: 'simulator', simulatorId: simId };
    }
    return { view: 'not-found', attemptedPath: cleanPath };
  }

  // Match /lab/:labId
  const labMatch = cleanPath.match(/^\/lab\/([a-zA-Z0-9_-]+)$/);
  if (labMatch) {
    const labId = labMatch[1];
    if (LABS.some((l) => l.id === labId)) {
      return { view: 'lab', labId: labId };
    }
    return { view: 'not-found', attemptedPath: cleanPath };
  }

  // Return branded 404 for any unknown route
  return { view: 'not-found', attemptedPath: cleanPath };
}

/**
 * Converts an AppRoute object to its canonical URL pathname.
 */
export function routeToPath(route: AppRoute): string {
  switch (route.view) {
    case 'home':
      return '/';
    case 'about':
      return '/about';
    case 'contact':
      return '/contact';
    case 'cookie-policy':
      return '/cookie-policy';
    case 'disclaimer':
      return '/disclaimer';
    case 'privacy-policy':
      return '/privacy-policy';
    case 'terms':
      return '/terms';
    case 'department':
      return `/department/${route.departmentId}`;
    case 'simulator':
      return `/simulator/${route.simulatorId}`;
    case 'lab':
      return `/lab/${route.labId}`;
    case 'not-found':
      return route.attemptedPath || '/404';
    default:
      return '/';
  }
}

/**
 * Push or replace route in HTML5 History and notify listeners.
 */
export function navigateTo(path: string, replace = false): void {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname;
  if (currentPath !== path || window.location.hash) {
    if (replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }
    // Dispatch a popstate-like event so router components can re-render immediately
    window.dispatchEvent(new CustomEvent('app:navigate', { detail: { path } }));
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
