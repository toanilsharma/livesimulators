/**
 * Cross-Discipline Mathematical Equivalents Linking Matrix
 * Establishes ontological topical authority and entity mapping across engineering disciplines
 * based on shared differential equations, state-space representations, and conservation laws.
 */

export interface IsomorphicMapping {
  domainA: string;
  domainB: string;
}

export interface CrossDisciplineEquivalent {
  sourceSimulatorId: string;
  targetSimulatorId: string;
  anchorText: string;
  relationshipType: 'Differential Equation' | 'Conservation Law' | 'Feedback Dynamics' | 'State-Space Isomorphism';
  differentialEquationLatex?: string;
  subtitle: string;
  tooltipText: string;
  sharedMathematicalLaw: string;
  isomorphicMappings?: IsomorphicMapping[];
}

export const CROSS_DISCIPLINE_EQUIVALENTS: CrossDisciplineEquivalent[] = [
  // 1. Electrical RLC Resonance -> Mechanical Damped Harmonic Oscillator
  {
    sourceSimulatorId: 'rlc-resonance',
    targetSimulatorId: 'harmonic-oscillator',
    anchorText: 'Mechanical Equivalent: Mass-Spring-Damper System',
    relationshipType: 'Differential Equation',
    differentialEquationLatex: 'L\\frac{d^2q}{dt^2} + R\\frac{dq}{dt} + \\frac{q}{C} = v(t) \\iff m\\ddot{x} + c\\dot{x} + kx = F(t)',
    subtitle: 'Both systems are governed by 2nd-order linear ODEs linking kinetic/magnetic inertia with potential/electrostatic compliance.',
    tooltipText: 'Governed by identical canonical 2nd-order differential equations: Inductance L maps to Mass m, Resistance R maps to Damper c, and Capacitance 1/C maps to Spring k.',
    sharedMathematicalLaw: 'Canonical 2nd-Order Linear Ordinary Differential Equation (ODE)',
    isomorphicMappings: [
      { domainA: 'Inductance (L) [Henry]', domainB: 'Inertial Mass (m) [kg]' },
      { domainA: 'Resistance (R) [Ohm]', domainB: 'Viscous Damping (c) [N·s/m]' },
      { domainA: 'Elastance (1/C) [Farad⁻¹]', domainB: 'Spring Constant (k) [N/m]' },
      { domainA: 'Charge q(t) / Current i(t)', domainB: 'Displacement x(t) / Velocity v(t)' },
    ],
  },

  // 2. Electrical Buck-Boost Converter -> Thermal Heat Exchanger
  {
    sourceSimulatorId: 'buck-boost-converter',
    targetSimulatorId: 'heat-exchanger',
    anchorText: 'Conservation of Energy Equivalent: Thermal Systems',
    relationshipType: 'Conservation Law',
    differentialEquationLatex: '\\langle v_L \\rangle_{T_{sw}} = 0 \\iff \\dot{Q} = U A \\Delta T_{lm} = \\dot{m} C_p (T_{out} - T_{in})',
    subtitle: 'Both systems are governed by first-principles energy conservation equations linking energy storage rates with continuous input/output transfer gradients.',
    tooltipText: 'Governed by dynamic energy conservation laws: inductor volt-second flux balance maps to convective heat transfer and fluid thermal enthalpy exchange.',
    sharedMathematicalLaw: 'First Law of Thermodynamics & Electromagnetic Conservation of Energy',
    isomorphicMappings: [
      { domainA: 'Inductor Volt-Second Balance', domainB: 'Thermal Enthalpy Rate Balance (Q = m·Cp·ΔT)' },
      { domainA: 'PWM Duty Cycle (D)', domainB: 'Heat Exchanger Thermal Effectiveness (ε)' },
      { domainA: 'Output Filter Capacitance (C)', domainB: 'Thermal Mass Fluid Capacitance (m·Cp)' },
      { domainA: 'Switching Frequency (f_sw)', domainB: 'Fluid Mass Flow Velocity (m_dot)' },
    ],
  },

  // 3. Control Systems PID Tuning -> Thermal CSTR Runaway
  {
    sourceSimulatorId: 'pid-tuning',
    targetSimulatorId: 'cstr-kinetics',
    anchorText: 'Thermal CSTR Runaway: Closed-Loop Process Dynamics',
    relationshipType: 'Feedback Dynamics',
    differentialEquationLatex: 'u(t) = K_p e(t) + K_i \\int_0^t e(\\tau)d\\tau + K_d \\frac{de}{dt} \\iff V\\frac{dC_A}{dt} = F(C_{A0} - C_A) - V k_0 e^{-E/RT} C_A',
    subtitle: 'Both systems are governed by feedback-controlled error minimization subject to non-linear dead-time, thermal runaway sensitivity, and closed-loop phase margins.',
    tooltipText: 'Governed by closed-loop feedback stabilization: PID actuator response directly prevents exponential thermal runaway in non-linear exothermic CSTR reactors.',
    sharedMathematicalLaw: 'Lyapunov Stability & Non-Linear Feedback Regulation',
    isomorphicMappings: [
      { domainA: 'Controller Error e(t)', domainB: 'Reactor Temperature Excursion (T - T_setpoint)' },
      { domainA: 'Integral Gain (Ki)', domainB: 'Thermal Mass Holdup & Reset Action' },
      { domainA: 'Derivative Gain (Kd)', domainB: 'Jacket Cooling Anticipation & Runaway Quenching' },
      { domainA: 'Actuator Saturation', domainB: 'Cooling Jacket Valve Flow Limit' },
    ],
  },

  // 4. Reciprocal: Mechanical Damped Harmonic Oscillator -> Electrical RLC Resonance
  {
    sourceSimulatorId: 'harmonic-oscillator',
    targetSimulatorId: 'rlc-resonance',
    anchorText: 'Electrical Equivalent: Series RLC Circuit',
    relationshipType: 'Differential Equation',
    differentialEquationLatex: 'm\\ddot{x} + c\\dot{x} + kx = F_0 \\cos(\\omega t) \\iff L\\frac{d^2q}{dt^2} + R\\frac{dq}{dt} + \\frac{q}{C} = V_0 \\cos(\\omega t)',
    subtitle: 'Both systems are governed by 2nd-order linear ODEs where mechanical mass, damping, and springs map directly to electrical inductance, resistance, and capacitance.',
    tooltipText: 'Physical isomorphism: mechanical resonant frequency ω₀ = √(k/m) corresponds directly to electrical resonant frequency ω₀ = 1/√(LC).',
    sharedMathematicalLaw: 'Canonical 2nd-Order Linear Ordinary Differential Equation (ODE)',
    isomorphicMappings: [
      { domainA: 'Oscillator Mass (m)', domainB: 'Inductor Choke (L)' },
      { domainA: 'Viscous Damper (c)', domainB: 'Damping Resistor (R)' },
      { domainA: 'Spring Stiffness (k)', domainB: 'Capacitive Reciprocal (1/C)' },
      { domainA: 'Resonance Peak Amplification (Q)', domainB: 'Electrical Quality Factor (Q = ω₀L/R)' },
    ],
  },

  // 5. Reciprocal: Thermal Heat Exchanger -> Electrical Buck-Boost Converter
  {
    sourceSimulatorId: 'heat-exchanger',
    targetSimulatorId: 'buck-boost-converter',
    anchorText: 'Power Electronics Equivalent: Switching Energy Converter',
    relationshipType: 'Conservation Law',
    differentialEquationLatex: '\\dot{Q} = U A \\Delta T_{lm} \\iff P_{in} = V_{in} I_{in} = V_{out} I_{out} = P_{out}',
    subtitle: 'Both systems are governed by continuous energy conservation balances where enthalpy transport parallels switched electromagnetic energy storage.',
    tooltipText: 'Energy balance equivalent: fluid temperature differential across tube bundles behaves like switched voltage transformation across reactive elements.',
    sharedMathematicalLaw: 'Conservation of Energy & Thermodynamic Flux Transfer',
    isomorphicMappings: [
      { domainA: 'Thermal Enthalpy Transfer Rate', domainB: 'Inductive Energy Transfer Rate' },
      { domainA: 'Heat Transfer Surface Area (A)', domainB: 'Magnetic Core Choke Volume' },
      { domainA: 'Overall Coefficient (U)', domainB: 'Conversion Efficiency (η)' },
    ],
  },

  // 6. Reciprocal: Chemical CSTR Kinetics -> Control Systems PID Tuning
  {
    sourceSimulatorId: 'cstr-kinetics',
    targetSimulatorId: 'pid-tuning',
    anchorText: 'Control Systems Equivalent: Closed-Loop PID Controller',
    relationshipType: 'Feedback Dynamics',
    differentialEquationLatex: '\\frac{dT}{dt} = \\frac{F}{V}(T_0 - T) + \\frac{(-\\Delta H) r_A}{\\rho C_p} - \\frac{UA}{\\rho V C_p}(T - T_j) \\iff u(t) = \\text{PID}(e)',
    subtitle: 'Exothermic chemical reactor stability and runaway suppression rely on 3-term closed-loop PID feedback control.',
    tooltipText: 'Continuous stirred tank jacket temperature and runaway avoidance require real-time proportional-integral-derivative tuning.',
    sharedMathematicalLaw: 'Closed-Loop Non-Linear Stability & Process Regulation',
    isomorphicMappings: [
      { domainA: 'Exothermic Reaction Heat Generation', domainB: 'Unstable Open-Loop Pole in Right Half-Plane' },
      { domainA: 'Jacket Coolant Flow Modulation', domainB: 'Manipulated Variable Controller Output u(t)' },
      { domainA: 'Reactor Steady-State Temperature', domainB: 'Set-Point Reference Tracking' },
    ],
  },

  // 7. RC / RL Transient -> Chemical Kinetics
  {
    sourceSimulatorId: 'rc-rl-transient',
    targetSimulatorId: 'cstr-kinetics',
    anchorText: 'Chemical Kinetics Equivalent: 1st-Order Reaction Kinetics',
    relationshipType: 'Differential Equation',
    differentialEquationLatex: '\\frac{dv}{dt} + \\frac{1}{RC}v = \\frac{V_0}{RC} \\iff \\frac{dC_A}{dt} + k C_A = 0',
    subtitle: 'Both systems are governed by 1st-order linear differential equations exhibiting characteristic exponential decay curves.',
    tooltipText: 'Mathematical isomorphism: electrical time constant τ = RC maps directly to chemical residence time and half-life τ = 1/k.',
    sharedMathematicalLaw: '1st-Order Homogeneous Linear Differential Equation',
    isomorphicMappings: [
      { domainA: 'RC Time Constant (τ = RC)', domainB: 'Chemical Reaction Time Constant (τ = 1/k)' },
      { domainA: 'Capacitor Voltage Discharge', domainB: 'Reactant Concentration Depletion' },
    ],
  },

  // 8. Bode & Nyquist Stability -> Electrical RLC Resonance
  {
    sourceSimulatorId: 'bode-nyquist-stability',
    targetSimulatorId: 'rlc-resonance',
    anchorText: 'Circuit Dynamics Equivalent: Resonance & Quality Factor',
    relationshipType: 'State-Space Isomorphism',
    differentialEquationLatex: 'G(s) = \\frac{\\omega_n^2}{s^2 + 2\\zeta\\omega_n s + \\omega_n^2} \\iff H(s) = \\frac{1}{LC s^2 + RC s + 1}',
    subtitle: 'Both systems evaluate complex frequency-domain Laplace poles to determine phase margins and damping ratios.',
    tooltipText: 'Exact transfer function isomorphism: control loop resonance peak Mp and phase margin directly model RLC circuit Q-factor and impedance phase.',
    sharedMathematicalLaw: 'Laplace S-Domain Transfer Function & Frequency Response',
  },

  // 9. Civil Beam Bending -> Mechanical Damped Harmonic Oscillator
  {
    sourceSimulatorId: 'beam-bending',
    targetSimulatorId: 'harmonic-oscillator',
    anchorText: 'Structural Dynamics Equivalent: Modal Beam Vibrations',
    relationshipType: 'Differential Equation',
    differentialEquationLatex: 'EI \\frac{\\partial^4 w}{\\partial x^4} + \\rho A \\frac{\\partial^2 w}{\\partial t^2} = 0 \\iff m\\ddot{x} + kx = 0',
    subtitle: 'Both systems solve elasticity and inertial balance differential equations governing structural flexure and natural frequencies.',
    tooltipText: 'Continuous Euler-Bernoulli beam deflection discretizes into modal mass-spring-damper degrees of freedom.',
    sharedMathematicalLaw: 'Euler-Bernoulli Elastic Continuum & Modal Dynamics',
  },

  // 10. DC Motor Speed Control -> Control Systems PID Tuning
  {
    sourceSimulatorId: 'dc-motor-speed-control',
    targetSimulatorId: 'pid-tuning',
    anchorText: 'Control Systems Equivalent: Motor Velocity Regulation',
    relationshipType: 'Feedback Dynamics',
    differentialEquationLatex: 'J\\frac{d\\omega}{dt} + b\\omega = K_t i_a, \\quad L_a\\frac{di_a}{dt} + R_a i_a = v_a - K_b \\omega',
    subtitle: 'Electro-mechanical torque-velocity dynamics require closed-loop feedback compensation for load disturbance rejection.',
    tooltipText: 'DC motor back-EMF and inertia constitute a classic 2nd-order plant regulated by PID velocity and current loops.',
    sharedMathematicalLaw: 'Coupled Electro-Mechanical State-Space Dynamics',
  },
];

/**
 * Helper to retrieve all cross-discipline mathematical equivalents for a given simulator ID.
 */
export function getCrossDisciplineEquivalents(simulatorId: string): CrossDisciplineEquivalent[] {
  return CROSS_DISCIPLINE_EQUIVALENTS.filter((eq) => eq.sourceSimulatorId === simulatorId);
}
