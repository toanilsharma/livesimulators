/**
 * Central Google Analytics 4 (GA4) Custom Event Tracking Layer
 * Google Tag ID: G-WX8V8HH57V
 */

// Helper to safely dispatch events to Google tag / dataLayer
export function trackEvent(eventName: string, params: Record<string, any> = {}): void {
  if (typeof window !== 'undefined') {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', eventName, params);
    } else if (Array.isArray((window as any).dataLayer)) {
      (window as any).dataLayer.push({ event: eventName, ...params });
    }
  }
}

/**
 * 1. simulator_open
 * Fired when a user loads or switches into an interactive simulator workbench.
 * Params: { department: string, simulator_id: string }
 */
export function trackSimulatorOpen(department: string, simulatorId: string): void {
  trackEvent('simulator_open', {
    department,
    simulator_id: simulatorId,
  });
}

/**
 * 2. simulator_run
 * Fired when a simulation run session pauses, stops, or completes.
 * Params: { duration_s: number }
 */
export function trackSimulatorRun(durationS: number): void {
  if (durationS <= 0) return;
  trackEvent('simulator_run', {
    duration_s: Math.round(durationS),
  });
}

/**
 * 3. parameter_change
 * Fired when a user adjusts any physics/engineering parameter in the workbench.
 * Debounced per parameter ID to prevent flooding during continuous slider dragging.
 * Params: { param: string }
 */
const paramDebounceTimers: Record<string, any> = {};

export function trackParameterChange(param: string): void {
  if (paramDebounceTimers[param]) {
    clearTimeout(paramDebounceTimers[param]);
  }

  paramDebounceTimers[param] = setTimeout(() => {
    trackEvent('parameter_change', {
      param,
    });
    delete paramDebounceTimers[param];
  }, 400);
}

/**
 * 4. newsletter_signup
 * Fired when a user subscribes to the LiveSimulators Engineering Dispatch / simulator updates.
 * Params: { source: string }
 */
export function trackNewsletterSignup(source: string = 'footer'): void {
  trackEvent('newsletter_signup', {
    source,
  });
}

/**
 * 5. share
 * Fired when a user shares or copies a link to a simulator or laboratory workbench.
 * Params: { network: string } ('clipboard' | 'linkedin' | 'twitter' | 'web_share')
 */
export function trackShare(network: string): void {
  trackEvent('share', {
    network,
  });
}

/**
 * 6. lab_launch (existing)
 * Fired when a user launches one of the industrial laboratories.
 * Params: { lab_id: string, source: string }
 */
export function trackLabLaunchEvent(labId: string, source: string): void {
  trackEvent('lab_launch', {
    lab_id: labId,
    source,
  });
}
