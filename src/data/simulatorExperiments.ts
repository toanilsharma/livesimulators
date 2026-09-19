// Guided Learning Experiments and First-Principles Educational Modules
// Empowers users to learn the core physical laws and engineering mechanics interactively

export interface GuidedExperiment {
  id: string;
  title: string;
  goal: string;
  description: string;
  expectedObservation: string;
  governingLaw: string;
  parameters: Record<string, number>;
}

export const SIMULATOR_EXPERIMENTS: Record<string, GuidedExperiment[]> = {
  // 1. RLC Resonant Circuit
  rlc: [
    {
      id: 'rlc-resonance',
      title: '1. Perfect Electrical Resonance',
      goal: 'Achieve zero phase lag (cos φ = 1.0) and maximum loop current.',
      description: 'Tune AC generator frequency f to match natural frequency f₀ = 1/(2π√LC). Reactive impedances cancel out completely (X_L = X_C), leaving pure resistance R as the sole current limiter.',
      expectedObservation: 'Watch the current i(t) waveform surge in amplitude and align in phase with driving voltage v(t). Phasor angle collapses to 0°.',
      governingLaw: 'f_0 = \\frac{1}{2\\pi \\sqrt{LC}}, \\quad X_L = X_C \\implies Z = R',
      parameters: { resistance: 10, inductance: 60, capacitance: 42, frequency: 100 }
    },
    {
      id: 'rlc-critical-damping',
      title: '2. Critical Damping Transition',
      goal: 'Eliminate oscillatory ringing without sluggish transient delay.',
      description: 'Set damping resistance R equal to critical resistance R_crit = 2√(L/C) (damping ratio ζ = 1.0). Used in analog galvanometers and high-speed bus terminators.',
      expectedObservation: 'Damping ratio ζ reaches exactly 1.000. Underdamped ringing is completely extinguished.',
      governingLaw: 'R_{crit} = 2\\sqrt{\\frac{L}{C}}, \\quad \\zeta = 1.0',
      parameters: { resistance: 75, inductance: 60, capacitance: 40, frequency: 100 }
    },
    {
      id: 'rlc-high-q',
      title: '3. High-Q Frequency Selectivity',
      goal: 'Observe sharp bandwidth filtering and high resonant magnification.',
      description: 'Reduce resistance to R = 5Ω to achieve Quality Factor Q > 7. Energy oscillates hundreds of cycles between magnetic and electric storage fields.',
      expectedObservation: 'Very high current surge at resonance; slight frequency deviations cause steep attenuation.',
      governingLaw: 'Q = \\frac{1}{R}\\sqrt{\\frac{L}{C}}',
      parameters: { resistance: 5, inductance: 100, capacitance: 25, frequency: 100 }
    }
  ],

  // 2. Three-Phase Machine
  three_phase: [
    {
      id: 'tp-balanced-grid',
      title: '1. Symmetrical 120° Balanced Grid',
      goal: 'Verify zero neutral return current and constant rotating MMF.',
      description: 'In a balanced 3-phase system (120° spatial displacement), the sum of instantaneous phase currents i_R + i_Y + i_B = 0 at all points in time.',
      expectedObservation: 'Revolving magnetic field B_net traces a perfectly circular stator trajectory with constant rotational magnitude.',
      governingLaw: '\\vec{B}_{net}(t) = \\frac{3}{2} B_{max} \\angle(\\omega t)',
      parameters: { voltage: 230, frequency: 50, loadTorque: 40, excitationCurrent: 5.0 }
    },
    {
      id: 'tp-overexcitation',
      title: '2. Over-Excitation & Leading Power Factor',
      goal: 'Use synchronous condenser mode to inject reactive power (VARs) into the grid.',
      description: 'Increase rotor excitation field current I_f above nominal. The machine delivers reactive power back into the grid, counteracting inductive factory loads.',
      expectedObservation: 'Power factor shifts from lagging into leading (>0.98 leading). Stator current helps stabilize grid voltage.',
      governingLaw: 'Q = 3 V_{ph} I_{ph} \\sin \\phi < 0 \\implies \\text{Capacitive Leading}',
      parameters: { voltage: 230, frequency: 50, loadTorque: 25, excitationCurrent: 8.5 }
    }
  ],

  // 3. Four-Bar Grashof Mechanism
  four_bar: [
    {
      id: 'fb-grashof-crank-rocker',
      title: '1. Classic Grashof Crank-Rocker',
      goal: 'Achieve continuous 360° input rotation driving an oscillating rocker.',
      description: 'According to Grashof’s theorem, when s + l ≤ p + q and link s is adjacent to the fixed ground link, the shortest link completes a full 360° rotation while the opposite link rocks.',
      expectedObservation: 'Crank AB rotates smoothly without locking; coupler tracer P draws a teardrop trajectory.',
      governingLaw: 's + l \\le p + q, \\quad \\mu \\ge 40^\\circ',
      parameters: { groundL: 130, crankR: 38, couplerL: 120, rockerL: 85, rpm: 25 }
    },
    {
      id: 'fb-transmission-angle',
      title: '2. Transmission Angle Optimization',
      goal: 'Prevent mechanical binding and toggle locking in heavy linkages.',
      description: 'Industrial machinery standards mandate transmission angle μ ≥ 40° to avoid excessive pin bearing wear and ensure smooth mechanical advantage transfer.',
      expectedObservation: 'Transmission angle gauge remains in the green zone (≥ 40°). Maximum force transmission efficiency is preserved.',
      governingLaw: '\\mu = \\arccos\\left(\\frac{r_3^2 + r_4^2 - d^2}{2 r_3 r_4}\\right)',
      parameters: { groundL: 140, crankR: 35, couplerL: 110, rockerL: 95, rpm: 20 }
    }
  ],

  // 4. Damped Harmonic Oscillator
  harmonic: [
    {
      id: 'harm-resonance-peak',
      title: '1. Dynamic Resonance Amplification',
      goal: 'Observe extreme displacement magnification at frequency ratio r = 1.0.',
      description: 'Drive the mechanical oscillator at its natural resonance frequency f_drive = f_n. Phase lag between driving force and mass displacement locks at exactly 90°.',
      expectedObservation: 'Vibration amplitude surges drastically. Magnification factor M exceeds 4.0x.',
      governingLaw: 'M = \\frac{1}{\\sqrt{(1 - r^2)^2 + (2\\zeta r)^2}}, \\quad \\phi = 90^\\circ',
      parameters: { mass: 5, stiffness: 350, dampingC: 4, driveFreq: 1.33 }
    },
    {
      id: 'harm-high-damping',
      title: '2. Super-Critical Vibration Isolation',
      goal: 'Suppress resonance using tuned viscous damping.',
      description: 'Increase viscous damping coefficient c to achieve damping ratio ζ > 0.6. Prevents destructive mechanical fatigue in bridges and turbine shafts.',
      expectedObservation: 'Resonance peak is flattened; steady-state amplitude remains stable across all excitation frequencies.',
      governingLaw: '\\zeta = \\frac{c}{2\\sqrt{k m}} \\ge 0.707',
      parameters: { mass: 5, stiffness: 350, dampingC: 35, driveFreq: 1.33 }
    }
  ],

  // 5. Involute Spur Gear Mesh
  spur_gear: [
    {
      id: 'gear-agma-high-ratio',
      title: '1. AGMA Speed Reduction & Torque Multiplication',
      goal: 'Demonstrate angular velocity reduction and torque amplification.',
      description: 'Gear ratio i = z₂ / z₁ determines proportional torque increase and speed reduction while maintaining constant pitch line velocity V_p.',
      expectedObservation: 'Driven gear rotates slower at exactly N₂ = N₁ / i; gear teeth engage smoothly along the line of action.',
      governingLaw: 'i = \\frac{z_2}{z_1} = \\frac{\\omega_1}{\\omega_2} = \\frac{T_2}{T_1}',
      parameters: { moduleM: 4, teethPinion: 18, teethGear: 54, pressureAngle: 20, inputRpm: 600 }
    },
    {
      id: 'gear-contact-ratio',
      title: '2. High Contact Ratio Mesh (CR ≥ 1.4)',
      goal: 'Ensure uninterrupted load transfer without tooth collision impact.',
      description: 'AGMA standards require Contact Ratio CR > 1.2 to guarantee that at least one tooth pair is always fully engaged before the preceding pair separates.',
      expectedObservation: 'Contact ratio bar displays CR ≥ 1.5, verifying continuous smooth mesh without tooth impact noise.',
      governingLaw: 'CR = \\frac{g_\\alpha}{p_b} \\ge 1.4',
      parameters: { moduleM: 3.5, teethPinion: 24, teethGear: 60, pressureAngle: 20, inputRpm: 500 }
    }
  ],

  // 6. Euler-Bernoulli Beam Bending
  beam_deflection: [
    {
      id: 'beam-midspan-point',
      title: '1. Midspan Point Load Deflection',
      goal: 'Measure peak bending moment M_max and check AISC L/360 live deflection limit.',
      description: 'A concentrated load P placed at midspan of a simply supported girder creates maximum flexural moment M = P·L / 4 and center deflection δ = P·L³ / (48·E·I).',
      expectedObservation: 'Maximum bending moment diagram (BMD) peaks directly beneath point load; deflection contour satisfies AISC criteria.',
      governingLaw: '\\delta_{mid} = \\frac{P L^3}{48 E I}, \\quad M_{max} = \\frac{P L}{4}',
      parameters: { span: 6.0, pointLoad: 45, loadPos: 3.0, udl: 12 }
    }
  ],

  // 7. Closed-Loop PID Control
  pid: [
    {
      id: 'pid-quarter-amplitude',
      title: '1. Ziegler-Nichols Quarter Amplitude Decay',
      goal: 'Achieve fast setpoint tracking with a 4:1 damped oscillation ratio.',
      description: 'Proportional gain K_p and reset time T_i tuned according to classic Ziegler-Nichols frequency response rules eliminate steady-state error.',
      expectedObservation: 'Liquid level in the tank smoothly rises to setpoint SP with one minor overshoot peak that settles within 3 cycles.',
      governingLaw: 'u(t) = K_p\\left(e(t) + \\frac{1}{T_i}\\int_0^t e(\\tau)d\\tau + T_d\\frac{de(t)}{dt}\\right)',
      parameters: { kp: 2.4, ti: 8.0, td: 0.5, setpoint: 65 }
    }
  ]
};

// Dynamic First-Principles Physics State Explainer
export function getDynamicPhysicsExplanation(simulatorType: string, params: Record<string, number>): string {
  switch (simulatorType) {
    case 'rlc': {
      const R = params['resistance'] || 25;
      const L = (params['inductance'] || 60) * 1e-3;
      const C = (params['capacitance'] || 40) * 1e-6;
      const f = params['frequency'] || 100;
      const omega0 = 1 / Math.sqrt(L * C);
      const f0 = omega0 / (2 * Math.PI);
      const zeta = (R / 2) * Math.sqrt(C / L);

      if (Math.abs(f - f0) < 5) {
        return `Resonance Active: AC drive frequency (${f} Hz) is tuned within 5% of natural frequency f₀ (${f0.toFixed(1)} Hz). Net reactive impedance (X_L - X_C) cancels to near zero. Current amplitude is maximized and in-phase with source voltage.`;
      } else if (zeta < 1.0) {
        return `Underdamped Regime (ζ = ${zeta.toFixed(2)} < 1.0): Circuit energy alternates rapidly between the magnetic field in inductor L and electric field in capacitor C. Step transients cause characteristic damped sinusoidal ringing.`;
      } else {
        return `Overdamped Regime (ζ = ${zeta.toFixed(2)} ≥ 1.0): Excessive ohmic resistance R dissipates stored energy thermally as Joule heat before complete LC oscillations can develop.`;
      }
    }

    case 'three_phase': {
      const load = params['loadTorque'] || 45;
      const If = params['excitationCurrent'] || 5.0;
      return `Synchronous MMF: Operating with torque angle δ determined by mechanical shaft load (${load} Nm). Rotor excitation current (${If.toFixed(1)} A) sets internal back-EMF, achieving stable grid power synchronization without rotor slip.`;
    }

    case 'four_bar': {
      const r1 = params['groundL'] || 130;
      const r2 = params['crankR'] || 40;
      const r3 = params['couplerL'] || 120;
      const r4 = params['rockerL'] || 90;
      const s = Math.min(r1, r2, r3, r4);
      const l = Math.max(r1, r2, r3, r4);
      const sumSL = s + l;
      const sumPQ = r1 + r2 + r3 + r4 - sumSL;
      const isGrashof = sumSL <= sumPQ;

      return isGrashof
        ? `Grashof Class-I Mechanism: s + l (${sumSL} mm) ≤ p + q (${sumPQ} mm). Driving crank executes full 360° rotation without toggle lockup. Coupler midpoint traces an asymmetric non-linear motion path.`
        : `Non-Grashof Class-II (Double-Rocker): Links cannot complete a full 360° revolution; all movable links oscillate between physical dead-center limit angles.`;
    }

    case 'harmonic': {
      const m = params['mass'] || 5;
      const k = params['stiffness'] || 350;
      const c = params['dampingC'] || 8;
      const f_drive = params['driveFreq'] || 1.33;
      const fn = Math.sqrt(k / m) / (2 * Math.PI);
      const r = f_drive / fn;

      if (Math.abs(r - 1.0) < 0.1) {
        return `Harmonic Resonance Peak (r = ${r.toFixed(2)} ≈ 1.0): Excitation force is timed perfectly in quadrature (90° phase lag) with mass velocity, pumping maximum mechanical power into the system. Magnification factor surges.`;
      } else {
        return `Operating at frequency ratio r = ${r.toFixed(2)} (Natural f_n = ${fn.toFixed(2)} Hz, Drive = ${f_drive.toFixed(2)} Hz). Viscous damper dissipates kinetic energy as viscous fluid friction.`;
      }
    }

    case 'spur_gear': {
      const z1 = params['teethPinion'] || 18;
      const z2 = params['teethGear'] || 48;
      const rpm = params['inputRpm'] || 600;
      const ratio = z2 / z1;
      return `AGMA Involute Mesh: Speed reduction ratio 1:${ratio.toFixed(2)}. Input shaft rotating at ${rpm} RPM produces ${ (rpm / ratio).toFixed(0) } RPM at the output shaft with corresponding proportional torque amplification.`;
    }

    default:
      return `Physics Active: Governing equations continuously evaluated at 60 FPS using numerical integration. Parameters interact dynamically to illustrate first-principles physical conservation laws.`;
  }
}
