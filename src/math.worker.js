/**
 * LiveSimulators High-Performance Math & Physics Kernel
 * Web Worker executing 4th-Order Runge-Kutta (RK4) ODE Integration and Float64 Math
 * Offloads heavy computational kernels from the main UI thread to eliminate INP and TBT.
 */

function rk4StepVector(f, y, t, dt, params, tempBuffers) {
  const n = y.length;
  const k1 = tempBuffers.k1;
  const k2 = tempBuffers.k2;
  const k3 = tempBuffers.k3;
  const k4 = tempBuffers.k4;
  const yTemp = tempBuffers.yTemp;

  f(t, y, params, k1);

  const dtHalf = dt * 0.5;
  const tHalf = t + dtHalf;
  for (let i = 0; i < n; i++) {
    yTemp[i] = y[i] + dtHalf * k1[i];
  }
  f(tHalf, yTemp, params, k2);

  for (let i = 0; i < n; i++) {
    yTemp[i] = y[i] + dtHalf * k2[i];
  }
  f(tHalf, yTemp, params, k3);

  const tFull = t + dt;
  for (let i = 0; i < n; i++) {
    yTemp[i] = y[i] + dt * k3[i];
  }
  f(tFull, yTemp, params, k4);

  const dtSixth = dt / 6.0;
  for (let i = 0; i < n; i++) {
    y[i] += dtSixth * (k1[i] + 2.0 * k2[i] + 2.0 * k3[i] + k4[i]);
  }
}

const simulatorState = {
  type: null,
  params: {},
  t: 0,
  dt: 0.016,
  simSpeed: 1.0,
  stateVectors: {},
  buffers: {
    k1: new Float64Array(16),
    k2: new Float64Array(16),
    k3: new Float64Array(16),
    k4: new Float64Array(16),
    yTemp: new Float64Array(16),
  },
  tracerHistory: [],
  pidHistory: {
    pv: 30,
    integral: 0,
    lastError: 0,
    historyPv: new Array(80).fill(30),
    historySp: new Array(80).fill(65),
    historyMv: new Array(80).fill(50),
  },
  seismicHistory: new Array(100).fill(0),
};

function solveRlc(params, t, dt) {
  const R = params.resistance || 25.0;
  const L = (params.inductance || 60.0) * 1e-3;
  const C = (params.capacitance || 40.0) * 1e-6;
  const f = params.frequency || 100.0;
  const omega = 2.0 * Math.PI * f;

  const omega0 = 1.0 / Math.sqrt(L * C);
  const f0 = omega0 / (2.0 * Math.PI);
  const XL = omega * L;
  const XC = 1.0 / (omega * C);
  const Z = Math.sqrt(R * R + (XL - XC) * (XL - XC));
  const phi = Math.atan2(XL - XC, R);
  const zeta = (R / 2.0) * Math.sqrt(C / L);
  const Q = (1.0 / R) * Math.sqrt(L / C);

  if (!simulatorState.stateVectors.rlc) {
    simulatorState.stateVectors.rlc = new Float64Array([0.0, 0.0]);
  }
  const y = simulatorState.stateVectors.rlc;

  const rlcDerivs = (time, state, p, dydt) => {
    const vs = 20.0 * Math.sin(omega * time);
    const i = state[0];
    const vc = state[1];
    dydt[0] = (vs - R * i - vc) / L;
    dydt[1] = i / C;
  };

  const subDt = dt / 4.0;
  let subT = t;
  for (let s = 0; s < 4; s++) {
    rk4StepVector(rlcDerivs, y, subT, subDt, params, simulatorState.buffers);
    subT += subDt;
  }

  const wavePoints = 128;
  const channelA = new Float64Array(wavePoints);
  const channelB = new Float64Array(wavePoints);
  const currentRatio = Math.min(1.5, 45.0 / Math.max(1.0, Z));

  for (let idx = 0; idx < wavePoints; idx++) {
    const phaseFrac = (idx / wavePoints) * 4.0 * Math.PI - t * (f * 0.08);
    channelA[idx] = Math.sin(phaseFrac);
    channelB[idx] = Math.sin(phaseFrac - phi) * currentRatio;
  }

  const metrics = [
    { label: 'Resonant Frequency f₀', value: f0.toFixed(1), unit: 'Hz', description: 'Zero reactance natural frequency' },
    { label: 'Damping Ratio ζ', value: zeta.toFixed(3), unit: '', description: 'Dimensionless damping coefficient', status: zeta < 1 ? 'warning' : 'normal' },
    { label: 'Quality Factor Q', value: Q.toFixed(2), unit: '', description: 'Sharpness of frequency resonance peak' },
    { label: 'Total Impedance |Z|', value: Z.toFixed(1), unit: 'Ω', description: 'Effective AC circuit opposition to current' },
  ];

  return {
    state: {
      i: y[0],
      vc: y[1],
      f0,
      Z,
      phi,
      zeta,
      channelA: Array.from(channelA),
      channelB: Array.from(channelB),
    },
    metrics,
  };
}

function solveHarmonic(params, t, dt) {
  const mass = params.mass || 5.0;
  const stiffness = params.stiffness || 350.0;
  const dampingC = params.dampingC || 8.0;
  const driveFreq = params.driveFreq || 1.33;

  const omega_n = Math.sqrt(stiffness / mass);
  const fn = omega_n / (2.0 * Math.PI);
  const zeta = dampingC / (2.0 * Math.sqrt(stiffness * mass));
  const omega = 2.0 * Math.PI * driveFreq;
  const r = omega / omega_n;
  const denom = Math.sqrt(Math.pow(1.0 - r * r, 2) + Math.pow(2.0 * zeta * r, 2));
  const M = 1.0 / Math.max(0.001, denom);
  const phi = Math.atan2(2.0 * zeta * r, 1.0 - r * r);

  if (!simulatorState.stateVectors.harmonic) {
    simulatorState.stateVectors.harmonic = new Float64Array([0.05, 0.0]);
  }
  const y = simulatorState.stateVectors.harmonic;

  const harmonicDerivs = (time, state, p, dydt) => {
    const x = state[0];
    const v = state[1];
    const F0 = 25.0;
    dydt[0] = v;
    dydt[1] = (F0 * Math.cos(omega * time) - dampingC * v - stiffness * x) / mass;
  };

  const subDt = dt / 8.0;
  let subT = t;
  for (let s = 0; s < 8; s++) {
    rk4StepVector(harmonicDerivs, y, subT, subDt, params, simulatorState.buffers);
    subT += subDt;
  }

  const kineticEnergy = 0.5 * mass * y[1] * y[1];
  const potentialEnergy = 0.5 * stiffness * y[0] * y[0];
  const totalEnergy = kineticEnergy + potentialEnergy;

  const wavePoints = 128;
  const waveX = new Float64Array(wavePoints);
  const waveV = new Float64Array(wavePoints);
  for (let i = 0; i < wavePoints; i++) {
    const tau = (i / wavePoints) * 4.0 * Math.PI - omega * t;
    waveX[i] = M * Math.cos(tau - phi);
    waveV[i] = -M * omega * Math.sin(tau - phi);
  }

  const metrics = [
    { label: 'Natural Frequency f_n', value: fn.toFixed(2), unit: 'Hz', description: 'Undamped characteristic resonance frequency' },
    { label: 'Damping Ratio ζ', value: zeta.toFixed(3), unit: '', description: 'Viscous damping relative to critical' },
    { label: 'Magnification Factor M', value: M.toFixed(2), unit: 'x', description: 'Steady-state displacement amplitude gain', status: M > 4 ? 'alert' : 'normal' },
    { label: 'Phase Lag φ', value: ((phi * 180.0) / Math.PI).toFixed(1), unit: '°', description: 'Response delay behind excitation force' },
  ];

  return {
    state: {
      x: y[0],
      v: y[1],
      fn,
      zeta,
      M,
      phi,
      kineticEnergy,
      potentialEnergy,
      totalEnergy,
      waveX: Array.from(waveX),
      waveV: Array.from(waveV),
    },
    metrics,
  };
}

function solveThreePhase(params, t) {
  const f = params.frequency || 50;
  const V_ph = params.voltage || 230;
  const T_L = params.loadTorque || 45;
  const I_f = params.excitationCurrent || 5;

  const syncSpeed = (120 * f) / 4;
  const T_max = 120;
  const deltaDeg = Math.min(85, (Math.asin(Math.min(0.95, T_L / T_max)) * 180) / Math.PI);
  const pf = Math.min(1.0, 0.85 + (I_f - 5) * 0.03);
  const pActive = (3 * V_ph * (T_L * 1.2) * pf) / 1000;

  const metrics = [
    { label: 'Synchronous Speed', value: syncSpeed.toFixed(0), unit: 'RPM', description: 'Stator magnetic flux rotational velocity' },
    { label: 'Torque Angle δ', value: deltaDeg.toFixed(1), unit: '°', description: 'Rotor displacement from stator MMF', status: deltaDeg > 60 ? 'warning' : 'normal' },
    { label: 'Power Factor cos(φ)', value: pf.toFixed(2), unit: pf > 0.95 ? 'Leading' : 'Lagging', description: 'Ratio of real to apparent power' },
    { label: 'Active Real Power P', value: pActive.toFixed(1), unit: 'kW', description: 'Three-phase electromechanical output power' },
  ];

  return { state: { syncSpeed, deltaDeg, pf, pActive }, metrics };
}

function solveBuckBoost(params, t, dt) {
  const D = params.dutyCycle || 0.6;
  const Vin = params.inputVoltage || 12;
  const fsw = (params.switchingFreq || 100) * 1e3;
  const L = (params.inductance || 120) * 1e-6;
  const Rload = 20;
  const Vout = -Vin * (D / (1 - D));
  const deltaIL = (Vin * D) / (L * fsw);
  const Iout = Math.abs(Vout) / Rload;
  const ILavg = Iout / (1 - D);
  const isCCM = ILavg > deltaIL / 2;

  const metrics = [
    { label: 'Output Voltage V_out', value: Vout.toFixed(2), unit: 'V', description: 'Regulated inverted DC rail voltage' },
    { label: 'Inductor Ripple ΔI_L', value: deltaIL.toFixed(2), unit: 'A', description: 'Peak-to-peak AC magnetic choke ripple' },
    { label: 'Average Inductor Current', value: ILavg.toFixed(2), unit: 'A', description: 'Mean DC current sustained by inductor' },
    { label: 'Conduction Mode', value: isCCM ? 'CCM Continuous' : 'DCM Discontinuous', unit: '', description: 'Inductor current continuity status', status: isCCM ? 'normal' : 'warning' },
  ];

  return { state: { Vout, deltaIL, ILavg, isCCM }, metrics };
}

function solveSallenKey(params) {
  const fc = params.cutoffFreq || 1500;
  const Q = params.qualityFactor || 0.707;
  const Av = params.gain || 1.0;
  const fin = params.testFreq || 1200;

  const r = fin / fc;
  const mag = Av / Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(r / Q, 2));
  const gainDb = 20 * Math.log10(Math.max(0.001, mag));
  const phaseDeg = -Math.atan2(r / Q, 1 - r * r) * (180 / Math.PI);
  const damping = 1 / (2 * Q);

  const metrics = [
    { label: 'Gain at Test Freq', value: gainDb.toFixed(2), unit: 'dB', description: 'Signal attenuation at input frequency' },
    { label: 'Phase Shift', value: phaseDeg.toFixed(1), unit: '°', description: 'Biquad filter phase lag' },
    { label: 'Damping Factor ζ', value: damping.toFixed(3), unit: '', description: '0.707 indicates Butterworth maximally flat response' },
    { label: 'Cutoff Frequency f_c', value: fc.toString(), unit: 'Hz', description: '-3 dB transition bandwidth limit' },
  ];

  return { state: { gainDb, phaseDeg, damping, fc }, metrics };
}

function solveTransmissionLine(params) {
  const ZL = params.loadImpedance || 50;
  const Z0 = params.lineImpedance || 50;
  const f = params.frequency || 300;
  const gamma = (ZL - Z0) / (ZL + Z0);
  const absGamma = Math.abs(gamma);
  const vswr = (1 + absGamma) / Math.max(0.001, 1 - absGamma);
  const returnLoss = absGamma > 0 ? -20 * Math.log10(absGamma) : 99.9;
  const wavelength = 300 / f;

  const metrics = [
    { label: 'Reflection Coeff |Γ|', value: absGamma.toFixed(3), unit: '', description: 'Fraction of incident voltage wave reflected' },
    { label: 'VSWR', value: vswr.toFixed(2), unit: ':1', description: 'Voltage Standing Wave Ratio (1.0 is ideal)', status: vswr > 2.0 ? 'warning' : 'normal' },
    { label: 'Return Loss', value: returnLoss > 50 ? '>50' : returnLoss.toFixed(1), unit: 'dB', description: 'RF power reflection attenuation' },
    { label: 'Carrier Wavelength λ', value: wavelength.toFixed(2), unit: 'm', description: 'Spatial period of TEM guided wave' },
  ];

  return { state: { absGamma, vswr, returnLoss, wavelength }, metrics };
}

function solveBeamDeflection(params) {
  const L = params.span || 6;
  const P = params.pointLoad || 45;
  const a = params.loadPos || 3;
  const q = params.udl || 12;
  const b = L - a;

  const R1 = (P * b) / L + (q * L) / 2;
  const R2 = (P * a) / L + (q * L) / 2;
  const maxM = (P * a * b) / L + (q * L * L) / 8;

  const E = 200e9;
  const I = 84.9e-6;
  const delta_mid = ((P * Math.min(a, b) * (3 * L * L - 4 * Math.min(a, b) * Math.min(a, b))) / (48 * E * I) + (5 * (q * 1000) * Math.pow(L, 4)) / (384 * E * I)) * 1000;
  const aiscLimit = (L * 1000) / 360;

  const metrics = [
    { label: 'Peak Bending Moment', value: maxM.toFixed(1), unit: 'kN·m', description: 'Maximum internal flexural bending moment' },
    { label: 'Max Deflection δ', value: delta_mid.toFixed(2), unit: 'mm', description: 'Calculated vertical beam center sag', status: delta_mid > aiscLimit ? 'alert' : 'normal' },
    { label: 'AISC Allowable (L/360)', value: aiscLimit.toFixed(1), unit: 'mm', description: 'AISC 360-16 maximum allowable live deflection' },
    { label: 'Left Reaction Force R₁', value: R1.toFixed(1), unit: 'kN', description: 'Vertical reaction support load at pin' },
  ];

  return { state: { R1, R2, maxM, delta_mid, aiscLimit }, metrics };
}

function solveTruss(params) {
  const span = params.span || 24;
  const H = params.height || 4.5;
  const P_truck = params.liveLoad || 80;
  const w_d = params.deadLoad || 15;
  const bayL = span / 6;

  const R_left = w_d * 2.5 + P_truck * 0.65;
  const maxTension = R_left * 1.8;
  const maxComp = R_left * 1.95;
  const memL = Math.sqrt(bayL * bayL + H * H);
  const P_cr = (Math.PI * Math.PI * 200e9 * 11.5e-6) / (memL * memL * 1000);
  const bucklingFactor = P_cr / maxComp;

  const metrics = [
    { label: 'Max Chord Tension', value: maxTension.toFixed(1), unit: 'kN', description: 'Tensile axial force in bottom bay chord' },
    { label: 'Max Web Compression', value: maxComp.toFixed(1), unit: 'kN', description: 'Maximum compressive load in diagonal strut' },
    { label: 'Euler Buckling P_cr', value: P_cr.toFixed(1), unit: 'kN', description: 'Critical column buckling threshold capacity' },
    { label: 'Buckling Safety Margin', value: bucklingFactor.toFixed(2), unit: 'x', description: 'AASHTO member stability factor of safety', status: bucklingFactor < 1.67 ? 'warning' : 'normal' },
  ];

  return { state: { R_left, maxTension, maxComp, P_cr, bucklingFactor }, metrics };
}

function solveSeismic(params) {
  const pga = params.pga || 0.45;
  const freq = params.frequency || 1.8;
  const dLead = params.leadCore || 120;
  const damping = params.damping || 18;

  const tnFixed = 0.45;
  const tnIsolated = 0.45 * Math.sqrt(180 / dLead) * 2.4;
  const baseShearFixed = pga * 9.81 * 450 * 0.85;
  const baseShearIso = baseShearFixed * (1 - damping / 100) * 0.35;
  const roofDrift = (pga * 9.81 / Math.pow(2 * Math.PI * freq, 2)) * 1000 * 0.4;
  const ascePass = roofDrift < 40;

  const metrics = [
    { label: 'Isolated Period T_n', value: tnIsolated.toFixed(2), unit: 's', description: 'Elongated fundamental vibration period' },
    { label: 'Base Shear Reduction', value: `${(((baseShearFixed - baseShearIso) / baseShearFixed) * 100).toFixed(0)}%`, unit: 'Absorbed', description: 'Lateral earthquake energy mitigated by LRBs' },
    { label: 'Roof Lateral Drift', value: roofDrift.toFixed(1), unit: 'mm', description: 'Peak multi-story horizontal displacement' },
    { label: 'ASCE 7-22 Drift Check', value: ascePass ? 'PASSED (<2%)' : 'EXCEEDED', unit: '', description: 'Inter-story drift safety compliance', status: ascePass ? 'normal' : 'alert' },
  ];

  return { state: { tnIsolated, roofDrift, ascePass }, metrics };
}

function solveMohrCircle(params) {
  const sx = params.sigmaX || 140;
  const sy = params.sigmaY || 50;
  const txy = params.tauXy || 35;

  const sAvg = (sx + sy) / 2;
  const R = Math.sqrt(Math.pow((sx - sy) / 2, 2) + Math.pow(txy, 2));
  const s1 = sAvg + R;
  const s2 = sAvg - R;
  const tauMax = R;
  const phiSoil = (30 * Math.PI) / 180;
  const tauCapacity = 20 + sAvg * Math.tan(phiSoil);
  const fs = tauCapacity / tauMax;

  const metrics = [
    { label: 'Major Principal σ₁', value: s1.toFixed(1), unit: 'kPa', description: 'Maximum normal stress along principal axis' },
    { label: 'Minor Principal σ₂', value: s2.toFixed(1), unit: 'kPa', description: 'Minimum normal stress along principal axis' },
    { label: 'Max In-Plane Shear τ_max', value: tauMax.toFixed(1), unit: 'kPa', description: 'Maximum shear stress at 45° to principal plane' },
    { label: 'Mohr-Coulomb Factor of Safety', value: fs.toFixed(2), unit: 'x', description: 'Shear slip failure margin (ASTM D3080)', status: fs < 1.3 ? 'warning' : 'normal' },
  ];

  return { state: { s1, s2, tauMax, fs }, metrics };
}

function solveFourBar(params, t) {
  const r1 = params.groundL || 130;
  const r2 = params.crankR || 40;
  const r3 = params.couplerL || 120;
  const r4 = params.rockerL || 90;
  const s = Math.min(r1, r2, r3, r4);
  const l = Math.max(r1, r2, r3, r4);
  const sumSL = s + l;
  const sumPQ = r1 + r2 + r3 + r4 - sumSL;
  const isGrashof = sumSL <= sumPQ;

  const metrics = [
    { label: 'Grashof Condition', value: isGrashof ? 'Grashof Class I (Crank-Rocker)' : 'Non-Grashof (Triple Rocker)', unit: '', description: 'Continuous full rotational mobility check', status: isGrashof ? 'normal' : 'warning' },
    { label: 'Shortest Link s', value: s.toFixed(0), unit: 'mm', description: 'Crank driving element length' },
    { label: 'Longest Link l', value: l.toFixed(0), unit: 'mm', description: 'Ground fixed frame base span' },
    { label: 'Mobility Margin', value: (sumPQ - sumSL).toFixed(0), unit: 'mm', description: 'Grashof equation slack threshold' },
  ];

  return { state: { isGrashof, s, l }, metrics };
}

function solveRankine(params) {
  const P1 = params.boilerP || 80;
  const T1 = params.turbineInletT || 480;
  const P2 = params.condenserP || 0.08;
  const eta_t = (params.turbineEff || 85) / 100;

  const h1 = 2800 + (T1 - 300) * 1.9 + P1 * 0.5;
  const h2s = 2050 + P2 * 300;
  const h2 = h1 - eta_t * (h1 - h2s);
  const h3 = 173;
  const wp = 0.001 * (P1 - P2) * 100;
  const h4 = h3 + wp;
  const wt = h1 - h2;
  const qin = h1 - h4;
  const eta_th = ((wt - wp) / qin) * 100;
  const bwr = (wp / wt) * 100;

  const metrics = [
    { label: 'Cycle Thermal Efficiency η_th', value: eta_th.toFixed(2), unit: '%', description: 'Thermodynamic steam power cycle conversion' },
    { label: 'Turbine Specific Work W_t', value: wt.toFixed(1), unit: 'kJ/kg', description: 'Shaft enthalpy extraction in turbine' },
    { label: 'Feed Pump Work W_p', value: wp.toFixed(2), unit: 'kJ/kg', description: 'Compressive work on condensed feedwater' },
    { label: 'Back Work Ratio BWR', value: bwr.toFixed(2), unit: '%', description: 'Fraction of gross work consumed by pump' },
  ];

  return { state: { eta_th, wt, wp, bwr }, metrics };
}

function solveSpurGear(params) {
  const m = params.moduleM || 4;
  const z1 = params.teethPinion || 18;
  const z2 = params.teethGear || 48;
  const alphaDeg = params.pressureAngle || 20;
  const N1 = params.inputRpm || 600;

  const alpha = (alphaDeg * Math.PI) / 180;
  const d1 = m * z1;
  const d2 = m * z2;
  const C = (d1 + d2) / 2;
  const gearRatio = z2 / z1;
  const pitchVel = (Math.PI * d1 * N1) / 60000;
  const pb = Math.PI * m * Math.cos(alpha);
  const ra1 = d1 / 2 + m;
  const ra2 = d2 / 2 + m;
  const rb1 = (d1 / 2) * Math.cos(alpha);
  const rb2 = (d2 / 2) * Math.cos(alpha);
  const pathContact = Math.sqrt(ra1 * ra1 - rb1 * rb1) + Math.sqrt(ra2 * ra2 - rb2 * rb2) - C * Math.sin(alpha);
  const CR = pathContact / pb;

  const metrics = [
    { label: 'Gear Ratio i', value: `1:${gearRatio.toFixed(2)}`, unit: '', description: 'Angular speed reduction ratio' },
    { label: 'Contact Ratio CR', value: CR.toFixed(2), unit: '', description: 'Average number of pairs in continuous mesh', status: CR < 1.4 ? 'warning' : 'normal' },
    { label: 'Pitch Line Velocity V_p', value: pitchVel.toFixed(2), unit: 'm/s', description: 'Circumferential tangential mesh speed' },
    { label: 'Center Distance C', value: C.toFixed(1), unit: 'mm', description: 'Shaft axis separation distance' },
  ];

  return { state: { gearRatio, CR, pitchVel, C }, metrics };
}

function solvePid(params, dt) {
  const kp = params.kp || 2.4;
  const ti = params.ti || 8;
  const td = params.td || 0.5;
  const sp = params.setpoint || 65;

  const metrics = [
    { label: 'Proportional Gain K_p', value: kp.toFixed(2), unit: '', description: 'Instantaneous error amplifier' },
    { label: 'Integral Reset Time T_i', value: ti.toFixed(1), unit: 's', description: 'Steady-state offset elimination rate' },
    { label: 'Derivative Rate Time T_d', value: td.toFixed(2), unit: 's', description: 'Error rate-of-change dampener' },
    { label: 'Target Setpoint SP', value: sp.toFixed(0), unit: '%', description: 'Desired regulated process operating target' },
  ];

  return { state: { kp, ti, td, sp }, metrics };
}

function solveControlValve(params) {
  const openPct = params.openingPct || 60;
  const P1 = params.inletPressure || 6.0;
  const P2 = params.outletPressure || 2.5;
  const maxCv = params.maxCv || 50;

  const deltaP = Math.max(0.1, P1 - P2);
  const travelNorm = openPct / 100;
  const effCv = maxCv * Math.pow(50, travelNorm - 1);
  const Q = effCv * 0.865 * Math.sqrt(deltaP);
  const sigmaC = (P1 - 0.23) / deltaP;
  const isCavitating = sigmaC < 1.5;

  const metrics = [
    { label: 'Effective Flow Coeff C_v', value: effCv.toFixed(1), unit: '', description: 'Equal-percentage throttling capacity' },
    { label: 'Flow Rate Q', value: Q.toFixed(1), unit: 'm³/h', description: 'Volumetric fluid throughput' },
    { label: 'Pressure Drop ΔP', value: deltaP.toFixed(2), unit: 'bar', description: 'Throttling differential across seat ring' },
    { label: 'Cavitation Index σ_c', value: sigmaC.toFixed(2), unit: '', description: 'Incipient cavitation safety threshold', status: isCavitating ? 'alert' : 'normal' },
  ];

  return { state: { effCv, Q, deltaP, sigmaC }, metrics };
}

function solveCurrentLoop(params) {
  const pv = params.processPressure || 6.5;
  const Rwire = params.wireResistance || 25;
  const Rload = params.loadResistance || 250;
  const Vs = params.supplyVoltage || 24;

  const loopMa = 4 + 16 * (pv / 10);
  const I_amp = loopMa * 1e-3;
  const vWire = I_amp * Rwire;
  const vAdc = I_amp * Rload;
  const vTerm = Vs - vWire - vAdc;
  const margin = vTerm - 11.5;

  const metrics = [
    { label: 'Loop Current I_loop', value: loopMa.toFixed(2), unit: 'mA', description: 'Linear transmitter process signal (4–20 mA)' },
    { label: 'Transmitter Terminal V_term', value: vTerm.toFixed(2), unit: 'VDC', description: 'Available voltage at 2-wire transmitter', status: margin < 1.0 ? 'warning' : 'normal' },
    { label: 'DCS Input Signal V_adc', value: vAdc.toFixed(2), unit: 'VDC', description: 'Voltage drop across 250Ω precision burden' },
    { label: 'Compliance Margin', value: margin.toFixed(2), unit: 'V', description: 'Headroom above 11.5V min operating threshold' },
  ];

  return { state: { loopMa, vTerm, vAdc, margin }, metrics };
}

function solveOrificeMeter(params) {
  const d = params.boreD || 60;
  const Q = params.flowRateQ || 45;
  const rho = params.fluidDensity || 1000;
  const D = 100;

  const beta = d / D;
  const A1 = (Math.PI / 4) * Math.pow(D / 1000, 2);
  const v1 = (Q / 3600) / A1;
  const Cd = 0.605;
  const deltaP_mbar = ((0.5 * rho * Math.pow(v1, 2) * (1 - Math.pow(beta, 4))) / (Math.pow(Cd, 2) * Math.pow(beta, 4))) / 100;

  const metrics = [
    { label: 'Beta Diameter Ratio β', value: beta.toFixed(3), unit: '', description: 'd/D restriction ratio (ISO 5167 recommended 0.2–0.75)' },
    { label: 'Differential Pressure ΔP', value: deltaP_mbar.toFixed(1), unit: 'mbar', description: 'Flange tap pressure difference across plate' },
    { label: 'Discharge Coefficient C_d', value: Cd.toFixed(3), unit: '', description: 'Empirical Stolz discharge calibration' },
    { label: 'Upstream Pipe Velocity', value: v1.toFixed(2), unit: 'm/s', description: 'Mean approach fluid velocity in 100mm line' },
  ];

  return { state: { beta, deltaP_mbar, Cd, v1 }, metrics };
}

function solveCstr(params) {
  const T0 = params.feedTemp || 300;
  const Tc = params.coolantTemp || 295;
  const F = params.flowRate || 15;
  const EaOverR = params.activationEnergy || 8000;
  const tau = 100 / F;
  const k0 = 1.2e8 / 60;
  const estT = Tc + 0.65 * (T0 - Tc) + 35;
  const kRate = k0 * Math.exp(-EaOverR / estT);
  const conv = (kRate * tau) / (1 + kRate * tau);
  const Da = kRate * tau;

  const metrics = [
    { label: 'Reactor Core Temp T', value: estT.toFixed(1), unit: 'K', description: 'Internal mixed bulk temperature' },
    { label: 'Reactant Conversion X_A', value: (conv * 100).toFixed(1), unit: '%', description: 'Fraction of reactant A converted to product' },
    { label: 'Reaction Rate r_A', value: (kRate * (1 - conv)).toFixed(3), unit: 'mol/(L·s)', description: 'Arrhenius kinetic reaction rate' },
    { label: 'Damköhler Number Da', value: Da.toFixed(2), unit: '', description: 'Reaction rate over mass convection rate' },
  ];

  return { state: { estT, conv, kRate, Da }, metrics };
}

function solvePnJunction(params) {
  const Va = params.biasVoltage !== undefined ? params.biasVoltage : 0.60;
  const T = params.temp || 300;
  const vBi = 0.72 * (T / 300);
  const netBarrier = Math.max(0.04, vBi - Va);
  const wUm = 0.428 * Math.sqrt(netBarrier / vBi);
  const vt = 0.0259 * (T / 300);
  let currentMa = 0;
  if (Va > 0) {
    currentMa = Math.min(250, 1e-9 * Math.exp(Va / (1.15 * vt)) * 1e3);
  } else {
    currentMa = -1e-6;
  }
  const eMaxKvc = (2 * netBarrier / (wUm * 1e-4)) * 1e-3;

  const metrics = [
    { label: 'Forward Current I_D', value: currentMa < 0.01 ? '< 0.01' : currentMa.toFixed(2), unit: 'mA', description: 'Shockley minority carrier diffusion current' },
    { label: 'Depletion Width W', value: wUm.toFixed(3), unit: 'µm', description: 'Space charge barrier thickness' },
    { label: 'Effective Barrier Height', value: netBarrier.toFixed(2), unit: 'eV', description: 'Conduction band electron barrier' },
    { label: 'Peak Junction E-Field', value: eMaxKvc.toFixed(1), unit: 'kV/cm', description: 'Maximum electrostatic gradient at junction' },
  ];

  return { state: { currentMa, wUm, netBarrier, eMaxKvc }, metrics };
}

function solveDistillationColumn(params) {
  const R = params.refluxRatio || 2.2;
  const zF = params.feedComposition || 0.45;
  const alpha = params.relativeVolatility || 2.4;
  const q = params.feedCondition || 1.0;
  const xD = 0.95;
  const xB = 0.05;
  const vleY = (x) => (alpha * x) / (1 + (alpha - 1) * x);
  let xq = zF;
  let yq = vleY(zF);
  if (Math.abs(q - 1.0) >= 0.01) {
    for (let testX = 0.05; testX <= 0.95; testX += 0.01) {
      const qY = (q / (q - 1)) * testX - zF / (q - 1);
      if (Math.abs(qY - vleY(testX)) < 0.03) {
        xq = testX;
        yq = vleY(testX);
        break;
      }
    }
  }
  const rMin = Math.max(0.2, (xD - yq) / Math.max(0.01, yq - xq));
  let curX = xD;
  let curY = xD;
  let stageCount = 0;
  for (let s = 0; s < 30 && curX > xB; s++) {
    stageCount++;
    const nextX = Math.max(0.01, curY / (alpha - (alpha - 1) * curY));
    let nextY = curY;
    if (nextX >= xq) {
      nextY = (R / (R + 1)) * nextX + xD / (R + 1);
    } else {
      const slopeStrip = (yq - xB) / Math.max(0.001, xq - xB);
      nextY = xB + slopeStrip * (nextX - xB);
    }
    curX = nextX;
    curY = nextY;
  }
  const qReboiler = 125 * (R + 1) * 0.85;

  const metrics = [
    { label: 'Theoretical Stages N', value: stageCount.toString(), unit: 'trays', description: 'McCabe-Thiele equilibrium stages including reboiler' },
    { label: 'Min Reflux Ratio R_min', value: rMin.toFixed(2), unit: '', description: 'Pinch boundary infinite-tray reflux ratio' },
    { label: 'Distillate Purity xD', value: (xD * 100).toFixed(1), unit: '%', description: 'Overhead light key molar purity' },
    { label: 'Reboiler Heat Duty', value: qReboiler.toFixed(1), unit: 'kW', description: 'Thermal vapor boil-up duty required' },
  ];

  return { state: { stageCount, rMin, xD, qReboiler }, metrics };
}

function solveHeatExchanger(params) {
  const ThIn = params.hotInletTemp || 140;
  const TcIn = params.coldInletTemp || 25;
  const mh = params.hotFlowRate || 6.5;
  const mc = params.coldFlowRate || 10.0;
  const Ch = mh * 4.18;
  const Cc = mc * 4.18;
  const Cmin = Math.min(Ch, Cc);
  const Cmax = Math.max(Ch, Cc);
  const Cr = Cmin / Cmax;
  const UA = 28.0;
  const NTU = UA / Cmin;
  const expVal = Math.exp(-NTU * (1 - Cr));
  const eff = Cr === 1.0 ? NTU / (1 + NTU) : (1 - expVal) / (1 - Cr * expVal);
  const Q_kW = eff * Cmin * (ThIn - TcIn);
  const ThOut = ThIn - Q_kW / Ch;
  const TcOut = TcIn + Q_kW / Cc;

  const metrics = [
    { label: 'Heat Duty Q', value: (Q_kW / 1000).toFixed(2), unit: 'MW', description: 'Total thermal energy transferred across tube bundle' },
    { label: 'Effectiveness ε', value: (eff * 100).toFixed(1), unit: '%', description: 'Ratio of actual heat transfer to theoretical maximum' },
    { label: 'Hot Outlet Th,out', value: ThOut.toFixed(1), unit: '°C', description: 'Process fluid temperature exiting tubes' },
    { label: 'Cold Outlet Tc,out', value: TcOut.toFixed(1), unit: '°C', description: 'Cooling fluid temperature exiting shell nozzle' },
  ];

  return { state: { Q_kW, eff, ThOut, TcOut }, metrics };
}

function solveGasAbsorption(params) {
  const G = params.gasFlow || 18;
  const LG = params.liquidGasRatio || 2.8;
  const yIn = (params.inletGasConc || 8.0) / 100;
  const H = params.henryConstant || 1.2;
  const A = LG / H;
  const eff = Math.min(0.995, Math.max(0.4, (A - Math.pow(1 / A, 3)) / (A - Math.pow(1 / A, 4))));
  const yOut = yIn * (1 - eff);
  const NTU = Math.max(1.2, Math.log((yIn - 0) / Math.max(0.0001, yOut - 0)) * (A / Math.max(0.1, A - 1)));
  const HTU = 0.65;
  const packedHeightZ = NTU * HTU;
  const floodRatio = Math.min(1.2, (G / 38) * Math.sqrt(LG / 2.5) * 0.72);

  const metrics = [
    { label: 'Removal Efficiency η', value: (eff * 100).toFixed(1), unit: '%', description: 'Fraction of pollutant gas removed by solvent' },
    { label: 'Packed Bed Depth Z', value: packedHeightZ.toFixed(2), unit: 'm', description: 'Required depth of structured/random packing' },
    { label: 'Transfer Units NTU_OG', value: NTU.toFixed(2), unit: '', description: 'Dimensionless mass transfer difficulty' },
    { label: 'Flooding Limit Fraction', value: (floodRatio * 100).toFixed(0), unit: '%', description: 'Sherwood hydrodynamic flooding ratio', status: floodRatio >= 0.85 ? 'alert' : floodRatio >= 0.7 ? 'warning' : 'normal' },
  ];

  return { state: { eff, packedHeightZ, NTU, floodRatio }, metrics };
}

function solveSicSwitching(params) {
  const Vdc = params.busVoltage || 600;
  const IL = params.loadCurrent || 35;
  const Rg = params.gateResistance || 5;
  const Ls = params.strayInductance || 15;
  const Cgd = 45e-12;
  const Vplat = 5.2;
  const Vdrive = 18.0;
  const dvdt_Vns = Math.min(95, ((Vdrive - Vplat) / (Rg * Cgd)) * 1e-9 * 0.28);
  const didt_Ans = Math.min(8.0, (Vdrive - 3.5) / (Rg * 1.5));
  const Vpeak = Vdc + Ls * didt_Ans;
  const Eon_mJ = 0.5 * Vdc * IL * (35 / dvdt_Vns) * 1e-6 * 1000;
  const Eoff_mJ = 0.5 * Vdc * IL * (25 / dvdt_Vns) * 1e-6 * 1000;

  const metrics = [
    { label: 'Turn-On Loss E_on', value: Eon_mJ.toFixed(2), unit: 'mJ', description: 'Energy dissipated during switch-on interval' },
    { label: 'Turn-Off Loss E_off', value: Eoff_mJ.toFixed(2), unit: 'mJ', description: 'Energy dissipated during switch-off interval' },
    { label: 'Peak Slew Rate dv/dt', value: dvdt_Vns.toFixed(0), unit: 'V/ns', description: 'Drain voltage rate of fall/rise during transition' },
    { label: 'Peak Voltage Overshoot', value: Vpeak.toFixed(0), unit: 'V', description: 'Maximum inductive inductive drain spike (Vdc + Ls*di/dt)' },
  ];

  return { state: { dvdt_Vns, didt_Ans, Vpeak, Eon_mJ, Eoff_mJ }, metrics };
}

function solveIgbtThermal(params) {
  const fsw = params.switchingFreq || 12;
  const Ic = params.collectorCurrent || 90;
  const D = params.dutyCycle || 0.55;
  const Rsa = params.heatsinkRth || 0.22;
  const Vce = 1.75;
  const Pcond = Vce * Ic * D;
  const Psw = (0.011 * (Ic / 90)) * (fsw * 1000);
  const Ptot = Pcond + Psw;
  const Rjc = 0.18;
  const Rcs = 0.08;
  const Ta = 40.0;
  const Ts = Ta + Ptot * Rsa;
  const Tc = Ts + Ptot * Rcs;
  const Tj = Tc + Ptot * Rjc;
  const margin = 175 - Tj;

  const metrics = [
    { label: 'Junction Temp Tj', value: Tj.toFixed(1), unit: '°C', description: 'Peak internal silicon active junction temperature', status: Tj > 175 ? 'alert' : Tj > 145 ? 'warning' : 'normal' },
    { label: 'Total Power Loss Ptot', value: Ptot.toFixed(0), unit: 'W', description: 'Combined conduction and switching loss heat generation' },
    { label: 'Case Temp Tc', value: Tc.toFixed(1), unit: '°C', description: 'Module copper baseplate contact temperature' },
    { label: 'SOA Safety Margin', value: margin.toFixed(1), unit: '°C', description: 'Headroom below 175°C maximum rating' },
  ];

  return { state: { Tj, Ptot, Tc, margin }, metrics };
}

function solveMosfetChannel(params) {
  const Vgs = params.gateVoltage !== undefined ? params.gateVoltage : 1.8;
  const Vds = Math.max(0, params.drainVoltage !== undefined ? params.drainVoltage : 1.2);
  const tox = params.oxideThickness || 3.2;
  const logNa = params.substrateDoping || 17;
  const phiF = 0.0259 * Math.log(Math.pow(10, logNa) / 1.5e10);
  const Cox = (3.9 * 8.854e-14) / (tox * 1e-7);
  const Vfb = -0.85;
  const gamma = Math.sqrt(2 * 11.7 * 8.854e-14 * 1.602e-19 * Math.pow(10, logNa)) / Cox;
  const Vth = Vfb + 2 * phiF + gamma * Math.sqrt(2 * phiF);
  const Voverdrive = Vgs - Vth;
  const isCutoff = Voverdrive <= 0;
  const Vds_sat = Math.max(0.01, Voverdrive);
  const isSaturation = !isCutoff && Vds >= Vds_sat;
  let Id_mA = 0;
  if (!isCutoff) {
    const beta = (380 * Cox * (10 / 0.5)) * 1e3;
    if (!isSaturation) {
      Id_mA = beta * (Voverdrive * Vds - (Vds * Vds) / 2);
    } else {
      Id_mA = 0.5 * beta * Math.pow(Voverdrive, 2);
    }
  }
  const Qinv = isCutoff ? 0 : Cox * Voverdrive * 1e6;

  const metrics = [
    { label: 'Drain Current ID', value: Id_mA.toFixed(2), unit: 'mA', description: 'Total carrier drift current through channel' },
    { label: 'Threshold Voltage Vth', value: Vth.toFixed(2), unit: 'V', description: 'Gate voltage required for strong surface inversion' },
    { label: 'Inversion Charge Qinv', value: Qinv.toFixed(2), unit: 'µC/cm²', description: 'Mobile 2D electron sheet density under oxide' },
    { label: 'Channel State', value: isCutoff ? 'Cutoff' : isSaturation ? 'Pinch-Off Saturation' : 'Linear Triode', unit: '', description: 'Operating regime along channel' },
  ];

  return { state: { Id_mA, Vth, Qinv, isCutoff, isSaturation }, metrics };
}

function solveFourier(params, t) {
  const N = Math.round(params.harmonicsCount || 7);
  const f0 = params.fundamentalFreq || 50.0;
  const waveType = Math.round(params.waveformType || 0);

  const sampleCount = 128;
  const samples = new Float64Array(sampleCount);

  for (let idx = 0; idx < sampleCount; idx++) {
    const tau = (idx / sampleCount) * 4.0 * Math.PI + t * (f0 * 0.05);
    let sum = 0.0;
    for (let n = 1; n <= N; n += 2) {
      if (waveType === 0) {
        sum += (4.0 / Math.PI) * (1.0 / n) * Math.sin(n * tau);
      } else if (waveType === 1) {
        const sign = ((n - 1) / 2) % 2 === 0 ? 1.0 : -1.0;
        sum += (8.0 / (Math.PI * Math.PI)) * sign * (1.0 / (n * n)) * Math.sin(n * tau);
      } else {
        sum += (2.0 / Math.PI) * (1.0 / n) * Math.sin(n * tau);
      }
    }
    samples[idx] = sum;
  }

  const metrics = [
    { label: 'Harmonic Limit N', value: N.toString(), unit: 'terms', description: 'Number of synthesized Fourier components' },
    { label: 'Fundamental Freq f₀', value: f0.toFixed(0), unit: 'Hz', description: 'Base frequency of primary harmonic' },
    { label: 'THD Distortion', value: (100.0 / Math.sqrt(N)).toFixed(1), unit: '%', description: 'Total Harmonic Distortion approximation' },
    { label: 'Gibbs Overshoot', value: '8.95%', unit: '', description: 'Discontinuous jump phenomenon overshoot' },
  ];

  return { state: { samples: Array.from(samples) }, metrics };
}

function computeSimulation(type, params, t, dt) {
  switch (type) {
    case 'rlc':
      return solveRlc(params, t, dt);
    case 'harmonic':
      return solveHarmonic(params, t, dt);
    case 'three_phase':
      return solveThreePhase(params, t);
    case 'buck_boost':
      return solveBuckBoost(params, t, dt);
    case 'sallen_key':
      return solveSallenKey(params);
    case 'transmission_line':
      return solveTransmissionLine(params);
    case 'beam_deflection':
      return solveBeamDeflection(params);
    case 'truss':
      return solveTruss(params);
    case 'seismic':
      return solveSeismic(params);
    case 'mohr_circle':
      return solveMohrCircle(params);
    case 'four_bar':
      return solveFourBar(params, t);
    case 'rankine':
      return solveRankine(params);
    case 'spur_gear':
      return solveSpurGear(params);
    case 'pid':
      return solvePid(params, dt);
    case 'control_valve':
      return solveControlValve(params);
    case 'current_loop':
      return solveCurrentLoop(params);
    case 'orifice_meter':
      return solveOrificeMeter(params);
    case 'cstr':
      return solveCstr(params);
    case 'pn_junction':
      return solvePnJunction(params);
    case 'distillation_column':
      return solveDistillationColumn(params);
    case 'heat_exchanger':
      return solveHeatExchanger(params);
    case 'gas_absorption':
      return solveGasAbsorption(params);
    case 'sic_switching':
      return solveSicSwitching(params);
    case 'igbt_thermal':
      return solveIgbtThermal(params);
    case 'mosfet_channel':
      return solveMosfetChannel(params);
    case 'fourier':
      return solveFourier(params, t);
    default:
      return {
        state: { t, genericVal: Math.sin(t * 2.0) },
        metrics: [],
      };
  }
}

self.onmessage = function (event) {
  const msg = event.data;
  if (!msg) return;

  switch (msg.type) {
    case 'INIT': {
      simulatorState.type = msg.simulatorType;
      simulatorState.params = { ...msg.params };
      simulatorState.t = msg.t || 0;
      simulatorState.dt = msg.dt || 0.016;
      simulatorState.simSpeed = msg.simSpeed || 1.0;

      const result = computeSimulation(
        simulatorState.type,
        simulatorState.params,
        simulatorState.t,
        simulatorState.dt
      );

      self.postMessage({
        type: 'STATE_UPDATE',
        simulatorType: simulatorState.type,
        state: result.state,
        metrics: result.metrics,
        t: simulatorState.t,
      });
      break;
    }

    case 'SET_PARAMS': {
      if (msg.params) {
        simulatorState.params = { ...simulatorState.params, ...msg.params };
      }
      if (msg.simulatorType) {
        simulatorState.type = msg.simulatorType;
      }
      if (typeof msg.t === 'number') {
        simulatorState.t = msg.t;
      }

      const result = computeSimulation(
        simulatorState.type,
        simulatorState.params,
        simulatorState.t,
        simulatorState.dt
      );

      self.postMessage({
        type: 'STATE_UPDATE',
        simulatorType: simulatorState.type,
        state: result.state,
        metrics: result.metrics,
        t: simulatorState.t,
      });
      break;
    }

    case 'STEP': {
      if (msg.simulatorType) {
        simulatorState.type = msg.simulatorType;
      }
      if (msg.params) {
        simulatorState.params = { ...simulatorState.params, ...msg.params };
      }
      const dt = msg.dt || 0.016;
      simulatorState.dt = dt;
      simulatorState.t = (typeof msg.t === 'number') ? msg.t : simulatorState.t + dt;

      const result = computeSimulation(
        simulatorState.type,
        simulatorState.params,
        simulatorState.t,
        simulatorState.dt
      );

      self.postMessage({
        type: 'STATE_UPDATE',
        simulatorType: simulatorState.type,
        state: result.state,
        metrics: result.metrics,
        t: simulatorState.t,
      });
      break;
    }

    case 'RESET': {
      simulatorState.t = 0;
      simulatorState.tracerHistory = [];
      simulatorState.stateVectors = {};
      simulatorState.pidHistory = {
        pv: 30,
        integral: 0,
        lastError: 0,
        historyPv: new Array(80).fill(30),
        historySp: new Array(80).fill(65),
        historyMv: new Array(80).fill(50),
      };

      const result = computeSimulation(
        simulatorState.type,
        simulatorState.params,
        0,
        simulatorState.dt
      );

      self.postMessage({
        type: 'STATE_UPDATE',
        simulatorType: simulatorState.type,
        state: result.state,
        metrics: result.metrics,
        t: 0,
      });
      break;
    }

    default:
      break;
  }
};
