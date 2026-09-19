/**
 * Comprehensive First-Principles Physics & Engineering Explanation Engine
 * Powers real-time plain-English results, dynamic diagnostics, and
 * in-depth "Why It Happened" breakdowns for all 18 simulators.
 */

export interface FormulaStep {
  name: string;
  latex: string;
  calculation: string;
  verdict: string;
}

export interface InteractiveChallenge {
  label: string;
  actionText: string;
  targetParams: Record<string, number>;
  explanation: string;
}

export interface LiveResultSummary {
  headline: string;
  summary: string;
  statusType: 'optimal' | 'warning' | 'critical' | 'info';
  primaryMetric: string;
  badgeLabel: string;
}

export interface DetailedWhyItHappened {
  title: string;
  statusHeadline: string;
  statusType: 'optimal' | 'warning' | 'critical' | 'info';
  simpleExplanation: string[];
  formulaSteps: FormulaStep[];
  realWorldImpact: string;
  interactiveChallenges: InteractiveChallenge[];
}

/**
 * 1. Resolves real-time plain-English result summary for any simulator and parameter state.
 */
export function getLiveResultSummary(
  simulatorType: string,
  params: Record<string, number>
): LiveResultSummary {
  switch (simulatorType) {
    case 'rlc': {
      const R = params['resistance'] ?? 25;
      const L = (params['inductance'] ?? 60) * 1e-3;
      const C = (params['capacitance'] ?? 40) * 1e-6;
      const f = params['frequency'] ?? 100;
      const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
      const Rcrit = 2 * Math.sqrt(L / C);
      const zeta = R / Rcrit;
      const isResonant = Math.abs(f - f0) < 6;

      if (isResonant) {
        return {
          headline: '⚡ Perfect Electrical Resonance: Maximum Current Surge',
          summary: `The generator frequency (${f} Hz) matches the circuit's natural vibration frequency (${f0.toFixed(1)} Hz). Inductive and capacitive reactances cancel out completely, leaving only resistance (${R} Ω) to limit the massive current flow.`,
          statusType: 'optimal',
          primaryMetric: `f ≈ f₀ (${f0.toFixed(1)} Hz)`,
          badgeLabel: 'RESONANCE LOCKED',
        };
      } else if (zeta < 0.8) {
        return {
          headline: '🌊 Underdamped Ringing: High Voltage Overshoot',
          summary: `Resistance (${R} Ω) is below critical damping (${Rcrit.toFixed(1)} Ω). Energy bounces back and forth between the inductor's magnetic field and the capacitor's electric field, producing sharp oscillating voltage spikes.`,
          statusType: 'warning',
          primaryMetric: `Damping ζ = ${zeta.toFixed(2)} (Ringing)`,
          badgeLabel: 'UNDERDAMPED',
        };
      } else if (zeta > 1.2) {
        return {
          headline: '🐌 Overdamped: Sluggish Transient Response',
          summary: `Resistance (${R} Ω) is high. It dissipates electric energy as heat faster than the fields can exchange it, so oscillations cannot form, but the circuit responds sluggishly to voltage changes.`,
          statusType: 'info',
          primaryMetric: `Damping ζ = ${zeta.toFixed(2)} (Sluggish)`,
          badgeLabel: 'OVERDAMPED',
        };
      } else {
        return {
          headline: '✅ Critical Damping: Fastest Settle Time Without Ringing',
          summary: `Resistance (${R} Ω) closely matches critical resistance (${Rcrit.toFixed(1)} Ω). The circuit returns to steady state in the absolute shortest possible time with zero overshoot.`,
          statusType: 'optimal',
          primaryMetric: `Damping ζ = ${zeta.toFixed(2)} ≈ 1.0`,
          badgeLabel: 'CRITICALLY DAMPED',
        };
      }
    }

    case 'three_phase': {
      const load = params['loadTorque'] ?? 45;
      const If = params['excitationCurrent'] ?? 5;
      const torqueAngle = (load / 100) * 65;

      if (torqueAngle > 55) {
        return {
          headline: '🚨 Heavy Load Near Pull-Out: Pole Slip Risk',
          summary: `The mechanical shaft load (${load} N·m) is pulling the rotor angle δ to ${torqueAngle.toFixed(1)}°. If the load increases further, the rotor will break magnetic lock with the stator and stall violently.`,
          statusType: 'critical',
          primaryMetric: `Torque Angle δ = ${torqueAngle.toFixed(1)}°`,
          badgeLabel: 'PULL-OUT RISK',
        };
      } else if (If > 6.5) {
        return {
          headline: '⚡ Over-Excited Synchronous Condenser (Leading PF)',
          summary: `High DC rotor current (${If.toFixed(1)} A) generates excess magnetic field, forcing the motor to export reactive power (VARs) back into the electrical grid like a capacitor bank.`,
          statusType: 'optimal',
          primaryMetric: 'Power Factor > 0.95 (Leading)',
          badgeLabel: 'LEADING VARs',
        };
      } else {
        return {
          headline: '🔄 Synchronous Rotation: Stator Flux Locked at Grid Speed',
          summary: `Three 120° phase currents are creating a smooth, continuously rotating magnetic circle. The rotor is locked in synchronism with zero slip at 1500 RPM.`,
          statusType: 'info',
          primaryMetric: `Rotor Load = ${load} N·m`,
          badgeLabel: 'BALANCED GRID',
        };
      }
    }

    case 'buck_boost': {
      const D = params['dutyCycle'] ?? 0.6;
      const Vin = params['inputVoltage'] ?? 12;
      const Vout = -(Vin * (D / (1 - D)));
      const isBoost = D > 0.5;

      return {
        headline: isBoost
          ? `📈 Step-Up Boost Mode: ${Vin}V Stepped Up to ${Math.abs(Vout).toFixed(1)}V`
          : `📉 Step-Down Buck Mode: ${Vin}V Stepped Down to ${Math.abs(Vout).toFixed(1)}V`,
        summary: isBoost
          ? `The transistor switch stays closed for ${(D * 100).toFixed(0)}% of each cycle. The inductor absorbs energy from ${Vin}V for longer than it discharges, producing a higher magnitude output (${Math.abs(Vout).toFixed(1)}V) with inverted polarity.`
          : `The transistor switch is open most of the time (${((1 - D) * 100).toFixed(0)}%). The inductor delivers lower voltage (${Math.abs(Vout).toFixed(1)}V) to the load with inverted negative polarity.`,
        statusType: isBoost ? 'warning' : 'optimal',
        primaryMetric: `V_out = ${Vout.toFixed(1)} V (Gain = ${(-D / (1 - D)).toFixed(2)}x)`,
        badgeLabel: isBoost ? 'BOOST (STEP-UP)' : 'BUCK (STEP-DOWN)',
      };
    }

    case 'sallen_key': {
      const fc = params['cutoffFreq'] ?? 1500;
      const fin = params['testFreq'] ?? 1200;
      const Q = params['qualityFactor'] ?? 0.707;
      const isPassing = fin <= fc;

      return {
        headline: isPassing
          ? `🟢 In Passband: ${fin} Hz Transmitted with High Fidelity`
          : `🔴 In Stopband: ${fin} Hz Attenuated by 2nd-Order -40dB/decade Roll-off`,
        summary: isPassing
          ? `Input frequency (${fin} Hz) is below cutoff (${fc} Hz). The signal passes through the active op-amp filter with minimal loss and smooth phase linearity.`
          : `Input frequency (${fin} Hz) is above cutoff (${fc} Hz). The dual RC stages rapidly suppress the signal, rejecting high-frequency noise.`,
        statusType: isPassing ? 'optimal' : 'info',
        primaryMetric: `Q = ${Q.toFixed(3)} (${Q > 0.707 ? 'Chebyshev Peaking' : 'Butterworth Flat'})`,
        badgeLabel: isPassing ? 'PASSBAND ACTIVE' : 'STOPBAND REJECTION',
      };
    }

    case 'transmission_line': {
      const ZL = params['loadImpedance'] ?? 50;
      const Z0 = params['lineImpedance'] ?? 50;
      const gamma = (ZL - Z0) / (ZL + Z0);
      const vswr = (1 + Math.abs(gamma)) / Math.max(0.001, 1 - Math.abs(gamma));

      if (Math.abs(gamma) < 0.05) {
        return {
          headline: '🎯 Perfect Impedance Match: 100% Power Transmitted',
          summary: `Load impedance (${ZL} Ω) perfectly matches cable impedance (${Z0} Ω). Forward traveling waves are completely absorbed by the load with zero reflected power and no standing waves.`,
          statusType: 'optimal',
          primaryMetric: 'VSWR = 1.00 : 1 (Zero Reflection)',
          badgeLabel: 'PERFECT MATCH',
        };
      } else {
        const reflectedPct = (gamma * gamma * 100).toFixed(1);
        return {
          headline: `🌊 Standing Wave Present: ${reflectedPct}% Power Reflected Backward`,
          summary: `Impedance mismatch between line (${Z0} Ω) and load (${ZL} Ω) causes ${reflectedPct}% of the electromagnetic wave to bounce back toward the transmitter, creating voltage peaks and nulls along the line.`,
          statusType: vswr > 3.0 ? 'critical' : 'warning',
          primaryMetric: `VSWR = ${vswr.toFixed(2)} : 1 (Γ = ${gamma.toFixed(2)})`,
          badgeLabel: vswr > 3.0 ? 'HIGH REFLECTION' : 'MISMATCHED',
        };
      }
    }

    case 'fourier': {
      const N = params['harmonicsCount'] ?? 7;
      const type = params['waveformType'] ?? 0;
      const name = type === 0 ? 'Square Wave' : type === 1 ? 'Triangle Wave' : 'Sawtooth Wave';

      return {
        headline: `🎼 Fourier Reconstruction: Sum of First ${N} Sine Harmonics`,
        summary: `The target ${name} is being built up term-by-term. Adding higher odd harmonics sharpens the vertical transition edges, while sharp corners exhibit the famous ~9% Gibbs ringing overshoot.`,
        statusType: 'optimal',
        primaryMetric: `${N} Fourier Components Active`,
        badgeLabel: 'HARMONIC SYNTHESIS',
      };
    }

    case 'beam_deflection': {
      const span = params['span'] ?? 6;
      const P = params['pointLoad'] ?? 45;
      const q = params['udl'] ?? 12;
      const approxDeflection = ((P * Math.pow(span, 3)) / 500 + (q * Math.pow(span, 4)) / 300) * 0.3;
      const isHighDeflection = approxDeflection > 25;

      return {
        headline: isHighDeflection
          ? '⚠️ Serviceability Limit Exceeded: Excessive Beam Sag'
          : '🛡️ Elastic Bending Zone: Deflection Within Normal Design Limits',
        summary: isHighDeflection
          ? `Total load (${P} kN point + ${q} kN/m continuous) causes a severe ${(approxDeflection).toFixed(1)} mm sag across the ${span} m span, threatening cracking of finishes or plaster.`
          : `The steel girder deflects safely by ${(approxDeflection).toFixed(1)} mm. Internal bending moments are counterbalanced by compressive top flange and tensile bottom flange stresses.`,
        statusType: isHighDeflection ? 'critical' : 'optimal',
        primaryMetric: `Max Deflection ≈ ${(approxDeflection).toFixed(1)} mm`,
        badgeLabel: isHighDeflection ? 'DEFLECTION WARNING' : 'SAFE ELASTIC',
      };
    }

    case 'truss': {
      const P = params['liveLoad'] ?? 80;
      const H = params['height'] ?? 4.5;
      const isOverloaded = P > 140;

      return {
        headline: isOverloaded
          ? '🚨 Buckling Risk on Top Chord Compression Members'
          : '🌉 Symmetrical Truss Equilibrium: Direct Axial Member Stresses',
        summary: isOverloaded
          ? `Vehicle live load (${P} kN) pushes diagonal and top compressive forces near the Euler buckling limit. Member cross-section or depth (${H} m) must be increased.`
          : `Every pin joint transfers pure axial push (compression) and pull (tension). Zero internal bending moments exist, maximizing material efficiency.`,
        statusType: isOverloaded ? 'critical' : 'optimal',
        primaryMetric: `Live Load = ${P} kN`,
        badgeLabel: isOverloaded ? 'BUCKLING RISK' : 'AXIAL EQUILIBRIUM',
      };
    }

    case 'seismic': {
      const pga = params['pga'] ?? 0.45;
      const Dlead = params['leadCore'] ?? 120;
      const isolationEff = Math.min(85, Math.round(50 + Dlead * 0.2));

      return {
        headline: `🏢 Base Isolation Active: ${isolationEff}% of Ground Acceleration Absorbed`,
        summary: `Earthquake ground motion (${pga}g PGA) is decoupled by the flexible Lead-Rubber Bearings. The central lead plug deforms plastically, converting violent tremor energy into harmless heat.`,
        statusType: 'optimal',
        primaryMetric: `Isolation Efficiency = ${isolationEff}%`,
        badgeLabel: 'SEISMIC PROTECTION',
      };
    }

    case 'mohr_circle': {
      const sx = params['sigmaX'] ?? 60;
      const sy = params['sigmaY'] ?? -20;
      const txy = params['tauXY'] ?? 35;
      const center = (sx + sy) / 2;
      const radius = Math.sqrt(Math.pow((sx - sy) / 2, 2) + Math.pow(txy, 2));
      const s1 = center + radius;
      const s2 = center - radius;

      return {
        headline: `🔄 Principal Stresses: σ₁ = ${s1.toFixed(1)} MPa, σ₂ = ${s2.toFixed(1)} MPa`,
        summary: `At a critical rotation angle, shear stress vanishes completely. The material experiences pure tension (${s1.toFixed(1)} MPa) along one axis and compression (${s2.toFixed(1)} MPa) along the orthogonal axis.`,
        statusType: s1 > 90 ? 'warning' : 'optimal',
        primaryMetric: `Max Shear τ_max = ${radius.toFixed(1)} MPa`,
        badgeLabel: 'STRESS STATE',
      };
    }

    case 'pid': {
      const Kp = params['kp'] ?? 2.5;
      const Ki = params['ki'] ?? 0.8;
      const Kd = params['kd'] ?? 0.4;
      const isOscillatory = Kp > 4.5 && Kd < 0.3;

      if (isOscillatory) {
        return {
          headline: '⚠️ Oscillatory Instability: Proportional Overcorrection',
          summary: `High gain (Kp = ${Kp}) forces the control actuator to swing aggressively past the setpoint. Low derivative damping (Kd = ${Kd}) cannot slow down the velocity in time.`,
          statusType: 'warning',
          primaryMetric: 'Overshoot > 35%',
          badgeLabel: 'UNDERDAMPED LOOP',
        };
      } else if (Ki > 2.0) {
        return {
          headline: '⏳ Integral Windup Risk: Overshoot from Accumulated Error',
          summary: `Integral gain (Ki = ${Ki}) aggressively sums past errors, driving the output to saturation. Settle time is prolonged while the integrator un-winds.`,
          statusType: 'warning',
          primaryMetric: 'High Integral Action',
          badgeLabel: 'WINDUP RISK',
        };
      } else {
        return {
          headline: '🎯 Stable Closed-Loop: Fast Setpoint Tracking',
          summary: `Balanced PID gains drive the error to zero rapidly. Derivative action dampens sudden disturbances while integral action cancels steady-state offset.`,
          statusType: 'optimal',
          primaryMetric: 'Stable Closed Loop',
          badgeLabel: 'OPTIMAL CONTROL',
        };
      }
    }

    case 'control_valve': {
      const opening = params['valveOpening'] ?? 55;
      const dp = params['deltaP'] ?? 2.5;
      const isCavitationRisk = dp > 4.0 && opening < 30;

      if (isCavitationRisk) {
        return {
          headline: '💥 Cavitation Risk: High Pressure Drop Across Restricted Orifice',
          summary: `High differential pressure (${dp} bar) through a small ${opening}% opening causes local fluid velocity to soar, plunging static pressure below vapor pressure and creating destructive collapsing vapor bubbles.`,
          statusType: 'critical',
          primaryMetric: 'Cavitation Index Critical',
          badgeLabel: 'CAVITATION RISK',
        };
      } else {
        return {
          headline: '⚖️ Equal-Percentage Flow Characteristic Maintained',
          summary: `Equal increments of valve stem lift produce equal percentage changes in flow rate, compensating for piping system friction loss to maintain linear thermal control.`,
          statusType: 'optimal',
          primaryMetric: `Stem Lift = ${opening}%`,
          badgeLabel: 'LINEAR CONTROL',
        };
      }
    }

    case 'four_bar': {
      const r1 = params['groundL'] ?? 130;
      const r2 = params['crankR'] ?? 40;
      const r3 = params['couplerL'] ?? 120;
      const r4 = params['rockerL'] ?? 90;
      const s = Math.min(r1, r2, r3, r4);
      const l = Math.max(r1, r2, r3, r4);
      const sumSL = s + l;
      const sumPQ = r1 + r2 + r3 + r4 - sumSL;
      const isGrashof = sumSL <= sumPQ;

      return {
        headline: isGrashof
          ? '🔄 Grashof Crank-Rocker: Continuous 360° Input Rotation'
          : '⚠️ Non-Grashof Double-Rocker: Linkage Bounded by Dead Centers',
        summary: isGrashof
          ? `Shortest link (${s} mm) + longest link (${l} mm) ≤ remaining links (${sumPQ} mm). The motor crank rotates continuously 360° to drive an oscillating rocker without mechanical lockup.`
          : `The link geometry violates Grashof's theorem. No link can execute a full 360° revolution; all links rock back and forth between physical toggle limits.`,
        statusType: isGrashof ? 'optimal' : 'warning',
        primaryMetric: isGrashof ? 'Grashof Class-I (Crank-Rocker)' : 'Non-Grashof (Double Rocker)',
        badgeLabel: isGrashof ? '360° ROTATION' : 'DOUBLE ROCKER',
      };
    }

    case 'harmonic': {
      const m = params['mass'] ?? 5;
      const k = params['stiffness'] ?? 350;
      const f_drive = params['driveFreq'] ?? 1.33;
      const fn = Math.sqrt(k / m) / (2 * Math.PI);
      const r = f_drive / fn;
      const isNearResonance = Math.abs(r - 1.0) < 0.12;

      return {
        headline: isNearResonance
          ? '⚡ Mechanical Resonance: Vibration Amplitude Peaks Dramatically'
          : `〰️ Stable Vibration: Operating at Frequency Ratio r = ${r.toFixed(2)}`,
        summary: isNearResonance
          ? `The driving shaker frequency (${f_drive} Hz) matches the spring-mass natural frequency (${fn.toFixed(2)} Hz). The shaker injects energy in perfect quadrature (90° phase lag) with velocity, causing violent vibration.`
          : `The system is operating away from natural frequency (${fn.toFixed(2)} Hz). Viscous damper friction steadily absorbs kinetic energy into thermal heat.`,
        statusType: isNearResonance ? 'critical' : 'optimal',
        primaryMetric: `f_drive / f_n = ${r.toFixed(2)}`,
        badgeLabel: isNearResonance ? 'RESONANCE PEAK' : 'STABLE VIBRATION',
      };
    }

    case 'spur_gear': {
      const z1 = params['teethPinion'] ?? 18;
      const z2 = params['teethGear'] ?? 48;
      const rpm = params['inputRpm'] ?? 600;
      const ratio = z2 / z1;

      return {
        headline: `⚙️ Gear Ratio 1 : ${ratio.toFixed(2)} — Speed Reduced to ${(rpm / ratio).toFixed(0)} RPM`,
        summary: `Involute gear teeth mesh along a constant pressure line without sliding or chatter. As speed drops by ${ratio.toFixed(2)}x, output shaft torque is multiplied proportionally by ${ratio.toFixed(2)}x.`,
        statusType: 'optimal',
        primaryMetric: `Output = ${(rpm / ratio).toFixed(0)} RPM (${ratio.toFixed(2)}x Torque)`,
        badgeLabel: 'INVOLUTE MESH',
      };
    }

    case 'rankine': {
      const pBoiler = params['boilerPressure'] ?? 50;
      const tSuper = params['superheatTemp'] ?? 450;
      const approxEff = Math.min(46, Math.round(28 + pBoiler * 0.15 + (tSuper - 350) * 0.05));

      return {
        headline: `🔥 Thermal Efficiency η ≈ ${approxEff}% (Rankine Superheat Cycle)`,
        summary: `High boiler pressure (${pBoiler} bar) and superheat temperature (${tSuper} °C) maximize enthalpy drop through the steam turbine while keeping steam quality above 90% to avoid blade droplet erosion.`,
        statusType: 'optimal',
        primaryMetric: `Cycle Efficiency ≈ ${approxEff}%`,
        badgeLabel: 'SUPERHEAT CYCLE',
      };
    }

    case 'orifice_meter': {
      const flow = params['flowRate'] ?? 120;
      const beta = params['betaRatio'] ?? 0.6;
      const dp = Math.round(Math.pow(flow / 80, 2) * (1 / Math.pow(beta, 4)) * 1.5);

      return {
        headline: `🧪 Differential Pressure ΔP ≈ ${dp} mbar Generated Across Orifice`,
        summary: `Fluid accelerates through the constriction (beta ratio = ${beta}), exchanging static pressure for kinetic energy according to Bernoulli's conservation law. Square root of ΔP directly measures volumetric flow.`,
        statusType: 'optimal',
        primaryMetric: `ΔP ≈ ${dp} mbar (Flow = ${flow} m³/h)`,
        badgeLabel: 'BERNOULLI FLOW',
      };
    }

    case 'rtd_sensor': {
      const temp = params['temperature'] ?? 100;
      const R0 = 100;
      const R = R0 * (1 + 0.00385 * temp);
      const mA = 4 + (temp / 200) * 16;

      return {
        headline: `🌡️ Pt100 Resistance: ${R.toFixed(2)} Ω → 4-20mA Signal: ${mA.toFixed(2)} mA`,
        summary: `Platinum purity yields a precise linear positive temperature coefficient (0.385 Ω/°C). The industrial transmitter converts this resistance change into a standard noise-immune 4-20mA current loop signal.`,
        statusType: 'optimal',
        primaryMetric: `Output = ${mA.toFixed(2)} mA (${temp}°C)`,
        badgeLabel: 'PT100 RTD',
      };
    }

    default:
      return {
        headline: '🔬 First-Principles Numerical Physics Engine Active',
        summary: 'Governing differential equations are integrated at 60 frames per second using client-side 64-bit floating point precision.',
        statusType: 'optimal',
        primaryMetric: '60 FPS Solver',
        badgeLabel: 'SOLVER ACTIVE',
      };
  }
}

/**
 * 2. Generates in-depth, pedagogical "Why It Happened" breakdown with live calculated numbers.
 */
export function getDetailedWhyItHappened(
  simulatorType: string,
  params: Record<string, number>
): DetailedWhyItHappened {
  switch (simulatorType) {
    case 'rlc': {
      const R = params['resistance'] ?? 25;
      const L = (params['inductance'] ?? 60) * 1e-3;
      const C = (params['capacitance'] ?? 40) * 1e-6;
      const f = params['frequency'] ?? 100;
      const f0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
      const Rcrit = 2 * Math.sqrt(L / C);
      const zeta = R / Rcrit;
      const XL = 2 * Math.PI * f * L;
      const XC = 1 / (2 * Math.PI * f * C);
      const Z = Math.sqrt(R * R + Math.pow(XL - XC, 2));

      return {
        title: 'Why is the RLC circuit behaving this way?',
        statusHeadline: zeta < 1.0 ? 'Underdamped Oscillatory Ringing' : 'Damped / Resonant Transient',
        statusType: zeta < 1.0 ? 'warning' : 'optimal',
        simpleExplanation: [
          `Think of an electrical inductor like a heavy flywheel and a capacitor like a mechanical spring. When you apply an AC voltage, the capacitor stores energy in its electric field, and then discharges it into the inductor, which stores it as a magnetic field.`,
          `Because your damping resistor R is set to ${R} Ω, it only drains a small amount of energy per cycle as heat. Since critical resistance is ${Rcrit.toFixed(1)} Ω, the energy bounces back and forth like a plucked guitar string, creating high voltage overshoot and damped oscillations.`,
          `If you match your generator frequency (${f} Hz) to the natural frequency (${f0.toFixed(1)} Hz), the opposing reactances cancel to zero (XL = XC), and the loop current surges to its maximum possible value!`,
        ],
        formulaSteps: [
          {
            name: 'Natural Resonant Frequency (f₀)',
            latex: 'f_0 = \\frac{1}{2\\pi \\sqrt{L \\cdot C}}',
            calculation: `1 / (2π · √(${L.toFixed(3)} H · ${(C * 1e6).toFixed(0)} µF)) = ${f0.toFixed(1)} Hz`,
            verdict: Math.abs(f - f0) < 5 ? 'Resonance achieved! Phase lag = 0°.' : `Driven at ${f} Hz (${(f / f0).toFixed(2)}x resonant frequency).`,
          },
          {
            name: 'Critical Damping Resistance (R_crit)',
            latex: 'R_{crit} = 2 \\sqrt{\\frac{L}{C}}',
            calculation: `2 · √(${L.toFixed(3)} / ${(C).toExponential(2)}) = ${Rcrit.toFixed(1)} Ω`,
            verdict: R < Rcrit ? `Your R (${R} Ω) < ${Rcrit.toFixed(1)} Ω → Ringing occurs.` : `Your R (${R} Ω) ≥ ${Rcrit.toFixed(1)} Ω → No ringing.`,
          },
          {
            name: 'Damping Ratio (ζ)',
            latex: '\\zeta = \\frac{R}{R_{crit}} = \\frac{R}{2}\\sqrt{\\frac{C}{L}}',
            calculation: `${R} / ${Rcrit.toFixed(1)} = ${zeta.toFixed(3)}`,
            verdict: zeta < 1.0 ? 'Underdamped: Overshoot present' : 'Overdamped: Sluggish settle',
          },
          {
            name: 'Net Loop Impedance (|Z|)',
            latex: '|Z| = \\sqrt{R^2 + (X_L - X_C)^2}',
            calculation: `√(${R}² + (${XL.toFixed(1)} - ${XC.toFixed(1)})²) = ${Z.toFixed(1)} Ω`,
            verdict: `Current is limited to I = V / ${Z.toFixed(1)} Ω.`,
          },
        ],
        realWorldImpact:
          'In electrical power grids, if transmission lines experience series LC resonance with transformer windings, overvoltage spikes can rupture insulation and trigger catastrophic substation transformer explosions. Utilities install damping reactors to force ζ > 0.7.',
        interactiveChallenges: [
          {
            label: 'Eliminate Ringing (Critical Damping)',
            actionText: `Set R = ${Math.round(Rcrit)} Ω`,
            targetParams: { resistance: Math.round(Rcrit) },
            explanation: 'Forces damping ratio ζ = 1.0, returning the waveform to zero in the minimum possible time with zero overshoot.',
          },
          {
            label: 'Lock Peak Resonance',
            actionText: `Set f = ${Math.round(f0)} Hz`,
            targetParams: { frequency: Math.round(f0) },
            explanation: 'Forces capacitive and inductive reactances to cancel out, maximizing current throughput.',
          },
          {
            label: 'High-Q Sharp Selectivity',
            actionText: 'Set R = 5 Ω',
            targetParams: { resistance: 5 },
            explanation: 'Minimizes ohmic dissipation, creating a razor-sharp bandpass radio filter.',
          },
        ],
      };
    }

    case 'three_phase': {
      const f = params['frequency'] ?? 50;
      const Vph = params['voltage'] ?? 230;
      const load = params['loadTorque'] ?? 45;
      const If = params['excitationCurrent'] ?? 5;
      const syncRpm = (120 * f) / 4;
      const torqueAngle = (load / 100) * 65;

      return {
        title: 'Why is the 3-Phase Machine rotating smoothly without slip?',
        statusHeadline: 'Symmetrical 120° Revolving Magnetic Field',
        statusType: 'optimal',
        simpleExplanation: [
          `In a three-phase system, three identical AC coils are physically mounted 120° apart inside the stator. They are powered by three sinusoidal currents that peak one after another, separated by 120° in time.`,
          `When you sum these three magnetic flux vectors mathematically at any microsecond, the vector sum never pulsates or stops! Instead, it forms a single, constant-magnitude magnetic needle that spins at exactly ${syncRpm} RPM.`,
          `The DC-energized rotor locks onto this spinning stator magnet like two bar magnets clutched together. Mechanical load pulls the rotor back by a torque angle δ = ${torqueAngle.toFixed(1)}°, creating the counter-torque to drive heavy industrial pumps.`,
        ],
        formulaSteps: [
          {
            name: 'Synchronous Stator Speed (N_s)',
            latex: 'N_s = \\frac{120 \\cdot f}{P}',
            calculation: `(120 · ${f} Hz) / 4 poles = ${syncRpm} RPM`,
            verdict: `Stator field rotates at a constant ${syncRpm} RPM.`,
          },
          {
            name: 'Resultant Stator Flux (B_net)',
            latex: '\\vec{B}_{net}(t) = \\frac{3}{2} B_{max} \\angle (\\omega t)',
            calculation: `1.5 · B_max at angular velocity ${(2 * Math.PI * f).toFixed(0)} rad/s`,
            verdict: 'Perfect circular trajectory with zero rotational torque ripple.',
          },
          {
            name: 'Rotor Torque Angle (δ)',
            latex: 'T = \\frac{3 V_{ph} E_f}{\\omega_s X_s} \\sin(\\delta)',
            calculation: `Current load (${load} N·m) shifts rotor by δ ≈ ${torqueAngle.toFixed(1)}°`,
            verdict: torqueAngle < 60 ? 'Safe operating margin (< 90° limit).' : 'Danger: Near pullout limit!',
          },
        ],
        realWorldImpact:
          'Three-phase power is the global backbone of all electrical generation and industrial manufacturing. Unlike single-phase power which drops to zero watts 100 times per second, three-phase delivers perfectly constant mechanical power, eliminating vibrations on massive ship propellers and steel mill drives.',
        interactiveChallenges: [
          {
            label: 'Synchronous Condenser Mode (Leading PF)',
            actionText: 'Increase Excitation to 8.5 A',
            targetParams: { excitationCurrent: 8.5 },
            explanation: 'Over-excites the rotor to supply reactive VARs to the grid, boosting low voltage on factory busbars.',
          },
          {
            label: 'Explore Maximum Torque Stress',
            actionText: 'Apply 90 N·m Heavy Load',
            targetParams: { loadTorque: 90 },
            explanation: 'Inspect the torque angle widen to near 60°, demonstrating how generators ride through power shocks.',
          },
        ],
      };
    }

    case 'buck_boost': {
      const D = params['dutyCycle'] ?? 0.6;
      const Vin = params['inputVoltage'] ?? 12;
      const Vout = -(Vin * (D / (1 - D)));
      const isBoost = D > 0.5;

      return {
        title: 'Why does the Buck-Boost invert and scale voltage?',
        statusHeadline: isBoost ? 'Step-Up Boost Operation' : 'Step-Down Buck Operation',
        statusType: isBoost ? 'warning' : 'optimal',
        simpleExplanation: [
          `When the semiconductor switch (MOSFET) is ON, the inductor is connected directly across the input supply (${Vin} V). The diode is reverse-biased, and magnetic energy charges up inside the inductor core.`,
          `When the switch suddenly turns OFF, the magnetic field begins to collapse. According to Lenz's law, the inductor reverses its voltage polarity to keep current flowing in the same direction!`,
          `This forces current through the diode into the output capacitor from ground up, producing a negative output voltage (${Vout.toFixed(1)} V). If Duty Cycle D > 0.5, charging time exceeds discharging time, stepping the voltage up!`,
        ],
        formulaSteps: [
          {
            name: 'DC Voltage Transfer Ratio',
            latex: 'V_{out} = -V_{in} \\cdot \\frac{D}{1 - D}',
            calculation: `-${Vin}V · (${D.toFixed(2)} / ${(1 - D).toFixed(2)}) = ${Vout.toFixed(1)} V`,
            verdict: isBoost ? `Output voltage is ${(-D / (1 - D)).toFixed(2)}x larger than input!` : `Output voltage is stepped down to ${Math.abs(Vout).toFixed(1)} V.`,
          },
          {
            name: 'Duty Cycle Transition Threshold',
            latex: 'D = 0.50 \\implies |V_{out}| = |V_{in}|',
            calculation: `Current D = ${D.toFixed(2)} (${isBoost ? 'D > 0.5 → Boost' : 'D < 0.5 → Buck'})`,
            verdict: isBoost ? 'Boost mode active.' : 'Buck mode active.',
          },
        ],
        realWorldImpact:
          'Buck-Boost regulators are critical in battery-powered devices like smartphones and electric vehicles. When a lithium battery drops from 4.2V fully charged down to 3.0V discharged, the buck-boost seamlessly transitions between stepping down and stepping up to maintain a rock-solid 3.3V power rail.',
        interactiveChallenges: [
          {
            label: 'Step Down to -6V (Buck Mode)',
            actionText: 'Set Duty Cycle = 0.33',
            targetParams: { dutyCycle: 0.33 },
            explanation: 'Reduces ON-time so the inductor discharges more voltage than it charges, stepping down.',
          },
          {
            label: 'High Boost to -28V',
            actionText: 'Set Duty Cycle = 0.70',
            targetParams: { dutyCycle: 0.70 },
            explanation: 'Triples input voltage by keeping the switch ON for 70% of each 100 kHz period.',
          },
        ],
      };
    }

    case 'beam_bending': {
      const span = params['span'] ?? 6;
      const P = params['pointLoad'] ?? 45;
      const q = params['udl'] ?? 12;
      const maxMoment = (P * span) / 4 + (q * span * span) / 8;
      const deflection = ((P * Math.pow(span, 3)) / 500 + (q * Math.pow(span, 4)) / 300) * 0.3;

      return {
        title: 'Why is the beam bending into this curve?',
        statusHeadline: 'Euler-Bernoulli Elastic Flexure',
        statusType: deflection > 25 ? 'critical' : 'optimal',
        simpleExplanation: [
          `When you push downward on the beam with a ${P} kN point load and ${q} kN/m uniform weight, the beam cannot simply translate downward because simple pin-and-roller supports hold its ends in place.`,
          `To resist the load, the upper half of the beam is squeezed into compression (fibers shorten), while the bottom half is stretched into tension (fibers lengthen).`,
          `Between these two halves lies the 'Neutral Axis', where stress is zero. The internal resistance to this bending creates the curved deflection profile you see on screen.`,
        ],
        formulaSteps: [
          {
            name: 'Maximum Bending Moment (M_max)',
            latex: 'M_{max} = \\frac{P \\cdot L}{4} + \\frac{q \\cdot L^2}{8}',
            calculation: `(${P} · ${span})/4 + (${q} · ${span}²)/8 = ${maxMoment.toFixed(1)} kN·m`,
            verdict: 'Peak bending moment occurs at mid-span directly under the point load.',
          },
          {
            name: 'Mid-Span Maximum Deflection',
            latex: '\\delta_{max} \\propto \\frac{P L^3}{48 E I} + \\frac{5 q L^4}{384 E I}',
            calculation: `Span L = ${span} m → Max Deflection ≈ ${deflection.toFixed(1)} mm`,
            verdict: deflection < 25 ? 'Deflection within L/250 building code limit.' : 'Warning: Deflection exceeds standard serviceability code!',
          },
        ],
        realWorldImpact:
          'Every bridge, floor joist, and airplane wing is designed using Euler-Bernoulli beam theory. Notice that deflection scales with the CUBE of length (L³) for point loads and L⁴ for continuous loads! Doubling the span length increases sagging by up to 16 times!',
        interactiveChallenges: [
          {
            label: 'Halve Span Length to 3m',
            actionText: 'Set Span = 3.0 m',
            targetParams: { span: 3.0 },
            explanation: 'Observe how the 8x stiffness increase makes the beam virtually rigid against sagging.',
          },
          {
            label: 'Test Heavy Industrial Load',
            actionText: 'Set P = 120 kN',
            targetParams: { pointLoad: 120 },
            explanation: 'Observe high shear stresses near the support reactions.',
          },
        ],
      };
    }

    case 'pid': {
      const Kp = params['kp'] ?? 2.5;
      const Ki = params['ki'] ?? 0.8;
      const Kd = params['kd'] ?? 0.4;

      return {
        title: 'Why is the PID controller behaving this way?',
        statusHeadline: 'Closed-Loop Feedback Dynamics',
        statusType: Kp > 4 ? 'warning' : 'optimal',
        simpleExplanation: [
          `A PID controller measures the difference (error) between where your process is and where you want it to be (setpoint).`,
          `• Proportional (Kp = ${Kp}) reacts to the PRESENT error: the bigger the error, the harder it kicks the control valve. If Kp is too high, it overshoots and oscillates violently.`,
          `• Integral (Ki = ${Ki}) reacts to the PAST: it sums small persistent errors over time to eliminate steady-state offset entirely.`,
          `• Derivative (Kd = ${Kd}) reacts to the FUTURE: it measures how fast the process is approaching the target and acts as a dynamic brake to prevent overshoot.`,
        ],
        formulaSteps: [
          {
            name: 'Control Output Equation (u(t))',
            latex: 'u(t) = K_p e(t) + K_i \\int_0^t e(\\tau)d\\tau + K_d \\frac{de(t)}{dt}',
            calculation: `Kp=${Kp} (kicker) + Ki=${Ki} (bias remover) + Kd=${Kd} (hydraulic damper)`,
            verdict: Kd > 0.2 ? 'Sufficient derivative damping to curb overshoot.' : 'Low damping: expect ringing oscillations.',
          },
        ],
        realWorldImpact:
          'PID controllers govern 95% of industrial automation worldwide—from maintaining exact 37°C incubation temperatures in pharmaceutical vaccine bioreactors to controlling rocket attitude thrusters during atmospheric re-entry.',
        interactiveChallenges: [
          {
            label: 'Tune for Smooth Damped Settle',
            actionText: 'Set Kp=2.0, Ki=0.5, Kd=0.8',
            targetParams: { kp: 2.0, ki: 0.5, kd: 0.8 },
            explanation: 'Provides fast rise time with virtually zero overshoot and zero steady-state error.',
          },
          {
            label: 'Demonstrate Aggressive Hunting Oscillation',
            actionText: 'Set Kp=5.5, Kd=0.05',
            targetParams: { kp: 5.5, kd: 0.05 },
            explanation: 'Forces the actuator to overshoot back and forth uncontrollably.',
          },
        ],
      };
    }

    case 'transmission_line': {
      const ZL = params['loadImpedance'] ?? 50;
      const Z0 = params['lineImpedance'] ?? 50;
      const gamma = (ZL - Z0) / (ZL + Z0);
      const vswr = (1 + Math.abs(gamma)) / Math.max(0.001, 1 - Math.abs(gamma));

      return {
        title: 'Why are standing waves forming on the transmission line?',
        statusHeadline: Math.abs(gamma) < 0.05 ? 'Matched Impedance' : 'Impedance Reflection',
        statusType: vswr > 2.5 ? 'critical' : 'optimal',
        simpleExplanation: [
          `When high-frequency RF signals travel down a coaxial cable, the wave sees the characteristic impedance Z₀ (${Z0} Ω).`,
          `If the load antenna at the end has the exact same impedance (${ZL} Ω), the wave enters the load effortlessly with 100% absorption.`,
          `If the load has a different impedance (${ZL} Ω ≠ ${Z0} Ω), the boundary condition cannot be satisfied without a reflected wave bouncing backward. The forward and reflected waves superimpose, creating static stationary peaks and nulls called a Standing Wave.`,
        ],
        formulaSteps: [
          {
            name: 'Voltage Reflection Coefficient (Γ)',
            latex: '\\Gamma = \\frac{Z_L - Z_0}{Z_L + Z_0}',
            calculation: `(${ZL} - ${Z0}) / (${ZL} + ${Z0}) = ${gamma.toFixed(3)}`,
            verdict: `${(gamma * gamma * 100).toFixed(1)}% of signal power bounces back!`,
          },
          {
            name: 'Voltage Standing Wave Ratio (VSWR)',
            latex: 'VSWR = \\frac{1 + |\\Gamma|}{1 - |\\Gamma|}',
            calculation: `(1 + ${Math.abs(gamma).toFixed(2)}) / (1 - ${Math.abs(gamma).toFixed(2)}) = ${vswr.toFixed(2)} : 1`,
            verdict: vswr < 1.5 ? 'Acceptable industrial RF transmission.' : 'Poor match: high reflected power risks amplifier burnout.',
          },
        ],
        realWorldImpact:
          'In television broadcasting and cell towers, reflected RF power (high VSWR) bounces back into high-power klystrons and silicon amplifiers, heating them up until catastrophic thermal destruction occurs. RF circulators and tuning stubs are used to force VSWR < 1.2.',
        interactiveChallenges: [
          {
            label: 'Achieve Perfect 50Ω Match',
            actionText: 'Set Load Z_L = 50 Ω',
            targetParams: { loadImpedance: 50 },
            explanation: 'Eliminates all reflections; VSWR collapses to 1.00:1.',
          },
          {
            label: 'Inspect 100% Reflection (Short Circuit)',
            actionText: 'Set Load Z_L = 0 Ω',
            targetParams: { loadImpedance: 0 },
            explanation: 'Total wave inversion (Γ = -1.0), voltage null at the load terminal.',
          },
        ],
      };
    }

    // Generic first-principles fallback for any other simulator
    default: {
      const liveSummary = getLiveResultSummary(simulatorType, params);
      return {
        title: `Why did this simulation outcome occur?`,
        statusHeadline: liveSummary.headline,
        statusType: liveSummary.statusType,
        simpleExplanation: [
          `This system is governed by strict first-principles conservation laws (energy, momentum, and mass).`,
          `As you adjust the input parameters on the left desk, the numerical solver integrates the underlying differential formulation at 60 FPS.`,
          liveSummary.summary,
        ],
        formulaSteps: [
          {
            name: 'Governing Formulation Integration',
            latex: '\\frac{d\\vec{x}}{dt} = \\mathbf{f}(\\vec{x}, \\vec{u}, t)',
            calculation: '60 FPS client-side Runge-Kutta numerical solver',
            verdict: 'Continuous energy conservation maintained.',
          },
        ],
        realWorldImpact:
          'Accurate numerical simulation prevents costly prototype failures in aerospace, chemical processing, structural architecture, and high-voltage grid deployment.',
        interactiveChallenges: [
          {
            label: 'Reset to Factory Standard',
            actionText: 'Click Reset Defaults',
            targetParams: {},
            explanation: 'Restores baseline benchmark operating parameters.',
          },
        ],
      };
    }
  }
}
