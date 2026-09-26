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

function solveOpAmp(params, t) {
  const config = Math.round(params.config || 0);
  const Rf = (params.rf || 10.0) * 1e3;
  const Rin = (params.rin || 2.0) * 1e3;
  const Vin = params.vin || 2.0;
  const freq = params.freq || 1000.0;
  const Vsupply = params.vsupply || 15.0;

  const omega = 2 * Math.PI * freq;
  let gain = 1.0;
  let vOutCalc = 0.0;

  if (config === 0) {
    gain = -Rf / Rin;
    vOutCalc = Math.abs(gain) * Vin;
  } else if (config === 1) {
    gain = 1.0 + Rf / Rin;
    vOutCalc = gain * Vin;
  } else if (config === 2) {
    const C = 10e-9;
    gain = 1.0 / (omega * Rin * C);
    vOutCalc = gain * Vin;
  } else {
    const C = 10e-9;
    gain = omega * Rf * C;
    vOutCalc = gain * Vin;
  }

  const isSaturated = vOutCalc >= (Vsupply - 1.2);
  const vOutClipped = Math.min(Vsupply - 1.2, vOutCalc);
  const gbwp = 3.0; // MHz
  const bandwidth = (gbwp * 1e6) / Math.max(1, Math.abs(gain));

  const sampleCount = 100;
  const waveIn = new Float64Array(sampleCount);
  const waveOut = new Float64Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const tau = (i / sampleCount) * 2.0 * Math.PI + t * 4.0;
    const vinInstant = Vin * Math.sin(tau);
    let voutInstant = 0;
    if (config === 0) {
      voutInstant = -(Rf / Rin) * vinInstant;
    } else if (config === 1) {
      voutInstant = (1.0 + Rf / Rin) * vinInstant;
    } else if (config === 2) {
      voutInstant = -vOutCalc * Math.cos(tau);
    } else {
      voutInstant = vOutCalc * Math.cos(tau);
    }
    const vRail = Vsupply - 1.2;
    if (voutInstant > vRail) voutInstant = vRail;
    if (voutInstant < -vRail) voutInstant = -vRail;

    waveIn[i] = vinInstant;
    waveOut[i] = voutInstant;
  }

  const configNames = ['Inverting Amp', 'Non-Inverting Amp', 'Active Integrator', 'Active Differentiator'];
  const metrics = [
    { label: 'Voltage Gain Av', value: gain.toFixed(2), unit: 'V/V', description: 'Closed-loop transfer ratio' },
    { label: 'Peak Vout', value: vOutClipped.toFixed(2), unit: 'V', description: 'Output voltage swing after supply rails' },
    { label: 'Saturation State', value: isSaturated ? 'Saturated (Clipping)' : 'Linear Active', unit: '', status: isSaturated ? 'warning' : 'normal', description: 'Operation bounded by Vcc/Vee rails' },
    { label: 'Effective Bandwidth', value: bandwidth >= 1e6 ? `${(bandwidth / 1e6).toFixed(2)} MHz` : `${(bandwidth / 1e3).toFixed(1)} kHz`, unit: '', description: 'Gain-Bandwidth product upper limit (-3dB)' },
  ];

  return {
    state: {
      configName: configNames[config],
      gain,
      vOutClipped,
      isSaturated,
      bandwidth,
      waveIn: Array.from(waveIn),
      waveOut: Array.from(waveOut),
    },
    metrics,
  };
}

function solveRcTransient(params, t) {
  const circuitType = Math.round(params.circuitType || 0);
  const R = params.resistance || 100.0;
  const reactanceVal = params.reactanceVal || 100.0;
  const V0 = params.vSource || 10.0;
  const f_sw = params.switchingFreq || 10.0;

  let tau = 0;
  let energy = 0;
  if (circuitType === 0) {
    const C = reactanceVal * 1e-6;
    tau = R * C;
    energy = 0.5 * C * V0 * V0 * 1e3;
  } else {
    const L = reactanceVal * 1e-3;
    tau = L / R;
    const Imax = V0 / R;
    energy = 0.5 * L * Imax * Imax * 1e3;
  }

  const period = 1.0 / f_sw;
  const halfPeriod = period / 2.0;
  const tMod = (t * 0.2) % period;
  const isCharging = tMod < halfPeriod;
  const tLocal = isCharging ? tMod : tMod - halfPeriod;

  const expTerm = Math.exp(-tLocal / Math.max(1e-6, tau));
  let instantVal = isCharging ? (1 - expTerm) * V0 : expTerm * V0;

  const sampleCount = 100;
  const waveV = new Float64Array(sampleCount);
  const waveI = new Float64Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const timeNorm = (i / sampleCount) * period;
    const inCharge = timeNorm < halfPeriod;
    const tLoc = inCharge ? timeNorm : timeNorm - halfPeriod;
    const factor = Math.exp(-tLoc / Math.max(1e-6, tau));

    if (circuitType === 0) {
      const vc = inCharge ? V0 * (1 - factor) : V0 * factor;
      const ic = (inCharge ? (V0 / R) * factor : -(V0 / R) * factor) * 1e3;
      waveV[i] = vc;
      waveI[i] = ic;
    } else {
      const il = inCharge ? (V0 / R) * (1 - factor) : (V0 / R) * factor;
      const vl = inCharge ? V0 * factor : -V0 * factor;
      waveV[i] = vl;
      waveI[i] = il * 1e3;
    }
  }

  const metrics = [
    { label: 'Time Constant τ', value: tau < 1e-3 ? `${(tau * 1e6).toFixed(1)} µs` : `${(tau * 1e3).toFixed(2)} ms`, unit: '', description: 'Time to reach 63.2% of steady state' },
    { label: 'Rise Time (10%-90%)', value: `${(2.197 * tau * 1e3).toFixed(2)} ms`, unit: '', description: 'Transient slew transition window' },
    { label: 'Settling Time (5τ)', value: `${(5.0 * tau * 1e3).toFixed(2)} ms`, unit: '', description: 'Time to 99.3% completed equilibrium' },
    { label: 'Peak Stored Energy', value: energy.toFixed(2), unit: 'mJ', description: circuitType === 0 ? 'Capacitor electrostatic energy 0.5*C*V²' : 'Inductor magnetic field energy 0.5*L*I²' },
  ];

  return {
    state: {
      tau,
      instantVal,
      isCharging,
      waveV: Array.from(waveV),
      waveI: Array.from(waveI),
    },
    metrics,
  };
}

function solveOttoCycle(params) {
  const cycleType = Math.round(params.cycleType || 0);
  const r = params.compressionRatio || (cycleType === 0 ? 9.5 : 17.0);
  const Vd_liters = params.displacement || 2.0;
  const rpm = params.rpm || 2400.0;
  const P1_bar = params.pInlet || 1.0;
  const T3_K = params.tMax || 2200.0;

  const gamma = 1.4;
  const cp = 1.005;
  const cv = 0.718;
  const R_gas = 0.287;
  const T1_K = 300.0;

  const Vd = Vd_liters * 1e-3;
  const V2 = Vd / (r - 1.0);
  const V1 = r * V2;
  const P1 = P1_bar * 1e5;

  const massAir = (P1 * V1) / (R_gas * 1e3 * T1_K);

  let eta_th = 0;
  let W_net = 0;
  let P2 = 0;
  let T2 = 0;
  let P3 = 0;
  let P4 = 0;
  let T4 = 0;

  if (cycleType === 0) {
    T2 = T1_K * Math.pow(r, gamma - 1.0);
    P2 = P1 * Math.pow(r, gamma);
    P3 = P2 * (T3_K / T2);
    T4 = T3_K * Math.pow(1.0 / r, gamma - 1.0);
    P4 = P3 * Math.pow(1.0 / r, gamma);

    const Qin = massAir * cv * (T3_K - T2);
    const Qout = massAir * cv * (T4 - T1_K);
    W_net = Qin - Qout;
    eta_th = 1.0 - 1.0 / Math.pow(r, gamma - 1.0);
  } else {
    T2 = T1_K * Math.pow(r, gamma - 1.0);
    P2 = P1 * Math.pow(r, gamma);
    P3 = P2;
    const rc = T3_K / T2;
    T4 = T3_K * Math.pow(rc / r, gamma - 1.0);
    P4 = P3 * Math.pow(rc / r, gamma);

    const Qin = massAir * cp * (T3_K - T2);
    const Qout = massAir * cv * (T4 - T1_K);
    W_net = Qin - Qout;
    eta_th = 1.0 - (1.0 / Math.pow(r, gamma - 1.0)) * ((Math.pow(rc, gamma) - 1.0) / (gamma * (rc - 1.0)));
  }

  const imep_bar = (W_net * 1e-3) / (Vd * 100);
  const cyclesPerSec = rpm / (2 * 60.0);
  const power_kW = (W_net * cyclesPerSec) / 1000.0;
  const power_hp = power_kW * 1.34102;

  const metrics = [
    { label: 'Thermal Efficiency η_th', value: `${(eta_th * 100).toFixed(1)}%`, unit: '', description: 'Air-standard ideal cycle thermodynamic efficiency' },
    { label: 'Indicated Power', value: power_kW.toFixed(1), unit: 'kW', description: `${power_hp.toFixed(0)} bhp at ${rpm} RPM` },
    { label: 'Mean Effective Pressure (IMEP)', value: imep_bar.toFixed(2), unit: 'bar', description: 'Average theoretical cylinder working pressure' },
    { label: 'Peak Pressure P_max', value: (P3 / 1e5).toFixed(1), unit: 'bar', description: 'Maximum structural cylinder combustion stress' },
  ];

  return {
    state: {
      eta_th,
      W_net,
      power_kW,
      imep_bar,
      P1: P1 / 1e5,
      P2: P2 / 1e5,
      P3: P3 / 1e5,
      P4: P4 / 1e5,
      T1: T1_K,
      T2,
      T3: T3_K,
      T4,
      r,
    },
    metrics,
  };
}

function solveProjectile(params, t) {
  const v0 = params.launchVelocity || 80.0;
  const angleDeg = params.launchAngle || 45.0;
  const h0 = params.launchHeight || 0.0;
  const Cd = params.dragCoeff !== undefined ? params.dragCoeff : 0.47;
  const mass = params.projectileMass || 2.0;
  const area = params.crossSectionArea || 0.02;

  const g = 9.80665;
  const rho = 1.225;
  const theta = (angleDeg * Math.PI) / 180.0;

  const v0x = v0 * Math.cos(theta);
  const v0y = v0 * Math.sin(theta);
  const tFlightVac = (v0y + Math.sqrt(v0y * v0y + 2 * g * h0)) / g;
  const rangeVac = v0x * tFlightVac;
  const hMaxVac = h0 + (v0y * v0y) / (2 * g);

  const dt = 0.01;
  let posX = 0;
  let posY = h0;
  let vx = v0x;
  let vy = v0y;
  let time = 0;
  let apogee = h0;

  const trajX = [posX];
  const trajY = [posY];

  while (posY >= 0 && time < 100.0) {
    const vMag = Math.sqrt(vx * vx + vy * vy);
    const Fdrag = 0.5 * rho * Cd * area * vMag * vMag;
    const ax = -(Fdrag * (vx / vMag)) / mass;
    const ay = -g - (Fdrag * (vy / vMag)) / mass;

    vx += ax * dt;
    vy += ay * dt;
    posX += vx * dt;
    posY += vy * dt;
    time += dt;

    if (posY > apogee) apogee = posY;
    if (posY >= 0) {
      trajX.push(posX);
      trajY.push(posY);
    }
  }

  const rangeDrag = posX;
  const tFlightDrag = time;
  const impactSpeed = Math.sqrt(vx * vx + vy * vy);
  const initialKE = 0.5 * mass * v0 * v0;
  const finalKE = 0.5 * mass * impactSpeed * impactSpeed;
  const dragWorkJ = Math.max(0, initialKE + mass * g * h0 - finalKE);

  const animTime = (t * 1.5) % (tFlightDrag + 1.0);
  let curX = 0;
  let curY = h0;
  if (animTime < tFlightDrag) {
    const idx = Math.min(trajX.length - 1, Math.floor((animTime / tFlightDrag) * trajX.length));
    curX = trajX[idx];
    curY = trajY[idx];
  } else {
    curX = rangeDrag;
    curY = 0;
  }

  const metrics = [
    { label: 'Max Apogee (Height)', value: apogee.toFixed(1), unit: 'm', description: `Vacuum ideal: ${hMaxVac.toFixed(1)} m` },
    { label: 'Flight Range (Distance)', value: rangeDrag.toFixed(1), unit: 'm', description: `Vacuum ideal: ${rangeVac.toFixed(1)} m (${(((rangeDrag - rangeVac) / rangeVac) * 100).toFixed(0)}% drag reduction)` },
    { label: 'Total Flight Time', value: tFlightDrag.toFixed(2), unit: 's', description: 'Hang time until surface impact' },
    { label: 'Drag Energy Loss', value: (dragWorkJ / 1e3).toFixed(2), unit: 'kJ', description: 'Kinetic energy converted to atmospheric friction heat' },
  ];

  return {
    state: {
      apogee,
      rangeDrag,
      rangeVac,
      tFlightDrag,
      curX,
      curY,
      trajX,
      trajY,
    },
    metrics,
  };
}

function solvePhotoelectric(params) {
  const lambda_nm = params.wavelength || 380.0;
  const intensity = params.intensity || 60.0;
  const matIndex = Math.round(params.targetMaterial || 2);
  const Vret = params.retardingVoltage !== undefined ? params.retardingVoltage : 0.0;

  const materials = [
    { name: 'Cesium (Cs)', phi: 2.14 },
    { name: 'Potassium (K)', phi: 2.30 },
    { name: 'Sodium (Na)', phi: 2.36 },
    { name: 'Zinc (Zn)', phi: 4.30 },
    { name: 'Platinum (Pt)', phi: 5.65 },
  ];
  const mat = materials[Math.min(materials.length - 1, Math.max(0, matIndex))];

  const h_eVs = 4.135667696e-15;
  const c = 2.99792458e8;
  const photonE_eV = (h_eVs * c) / (lambda_nm * 1e-9);
  const freq_Hz = c / (lambda_nm * 1e-9);
  const f0_Hz = (mat.phi / h_eVs);
  const lambda0_nm = (c / f0_Hz) * 1e9;

  const Kmax_eV = Math.max(0.0, photonE_eV - mat.phi);
  const Vstop_V = Kmax_eV;
  const hasEmission = photonE_eV > mat.phi;

  let photocurrent_uA = 0;
  if (hasEmission) {
    if (Vret <= -Vstop_V) {
      photocurrent_uA = 0;
    } else if (Vret < 0) {
      const fraction = (Vret + Vstop_V) / Math.max(0.01, Vstop_V);
      photocurrent_uA = (intensity * 0.15) * Math.pow(Math.min(1.0, fraction), 1.5);
    } else {
      photocurrent_uA = (intensity * 0.15) * (1.0 + 0.15 * Math.tanh(Vret / 1.0));
    }
  }

  const metrics = [
    { label: 'Incident Photon Energy hν', value: photonE_eV.toFixed(2), unit: 'eV', description: `λ = ${lambda_nm.toFixed(0)} nm (${(freq_Hz / 1e14).toFixed(2)} × 10¹⁴ Hz)` },
    { label: 'Work Function Φ', value: mat.phi.toFixed(2), unit: 'eV', description: `${mat.name} electron binding energy` },
    { label: 'Max Kinetic Energy K_max', value: Kmax_eV.toFixed(2), unit: 'eV', description: hasEmission ? 'Photoelectron ejection excess energy' : 'Below threshold frequency (No emission)', status: hasEmission ? 'normal' : 'warning' },
    { label: 'Stopping Potential V_stop', value: Vstop_V.toFixed(2), unit: 'V', description: 'Retarding voltage required to nullify photocurrent' },
  ];

  return {
    state: {
      materialName: mat.name,
      phi: mat.phi,
      photonE_eV,
      Kmax_eV,
      Vstop_V,
      photocurrent_uA,
      hasEmission,
      lambda0_nm,
      f0_Hz,
    },
    metrics,
  };
}

function solveBodePlot(params) {
  const K = params.gainK || 2.0;
  const wn = params.naturalFreq || 10.0;
  const zeta = params.dampingRatio || 0.4;
  const Td = params.timeDelay !== undefined ? params.timeDelay : 0.05;
  const wProbe = params.probeFreq || 10.0;

  const calcG = (w) => {
    const reDen = wn * wn - w * w;
    const imDen = 2 * zeta * wn * w;
    const denMag = Math.sqrt(reDen * reDen + imDen * imDen);
    const denPhi = Math.atan2(imDen, reDen);

    const mag = (K * wn * wn) / Math.max(1e-6, denMag);
    let phi = -denPhi - w * Td;
    return { mag, phi, magDb: 20 * Math.log10(Math.max(1e-4, mag)), phiDeg: (phi * 180) / Math.PI };
  };

  let w_gc = null;
  let pm_deg = null;
  for (let w = 0.1; w <= 300; w *= 1.02) {
    const g = calcG(w);
    if (g.magDb <= 0 && w_gc === null) {
      w_gc = w;
      let wrappedPhi = ((g.phiDeg % 360) + 360) % 360;
      if (wrappedPhi > 180) wrappedPhi -= 360;
      pm_deg = 180 + wrappedPhi;
      break;
    }
  }

  let w_pc = null;
  let gm_db = null;
  for (let w = 0.1; w <= 300; w *= 1.02) {
    const g = calcG(w);
    let wrappedPhi = ((g.phiDeg % 360) + 360) % 360;
    if (wrappedPhi > 180) wrappedPhi -= 360;
    if (wrappedPhi <= -180 || g.phiDeg <= -180) {
      w_pc = w;
      gm_db = -g.magDb;
      break;
    }
  }

  const probe = calcG(wProbe);
  const isStable = (pm_deg !== null && pm_deg > 0) && (gm_db === null || gm_db > 0);

  const metrics = [
    { label: 'Phase Margin PM', value: pm_deg !== null ? `${pm_deg.toFixed(1)}°` : '> 180°', unit: '', description: `Measured at ω_gc = ${w_gc ? w_gc.toFixed(1) : 'N/A'} rad/s`, status: (pm_deg !== null && pm_deg < 30) ? 'warning' : 'normal' },
    { label: 'Gain Margin GM', value: gm_db !== null ? `${gm_db.toFixed(1)} dB` : '∞ (No crossover)', unit: '', description: `Measured at ω_pc = ${w_pc ? w_pc.toFixed(1) : 'N/A'} rad/s` },
    { label: 'Closed-Loop Stability', value: isStable ? 'Asymptotically Stable' : 'Unstable / Oscillatory', unit: '', status: isStable ? 'normal' : 'alert', description: 'Cauchy argument principle encirclement test' },
    { label: 'Probe |G(jω)| at cursor', value: `${probe.magDb.toFixed(1)} dB, ${probe.phiDeg.toFixed(0)}°`, unit: '', description: `Magnitude and phase at ω = ${wProbe.toFixed(1)} rad/s` },
  ];

  return {
    state: {
      w_gc,
      w_pc,
      pm_deg,
      gm_db,
      isStable,
      probeMagDb: probe.magDb,
      probePhiDeg: probe.phiDeg,
    },
    metrics,
  };
}

function solveTransformerTest(params) {
  const Voc = params.voc || params.vPrimary || 230.0;
  const Ioc = params.ioc || 1.2;
  const Poc = params.poc || params.pCoreOc || 85.0;
  const Vsc = params.vsc || 24.0;
  const Isc = params.isc || 10.0;
  const Psc = params.psc || params.pCopperSc || 140.0;
  const pf = params.loadPowerFactor !== undefined ? params.loadPowerFactor : (params.powerFactor !== undefined ? params.powerFactor : 0.85);
  const xLoad = params.loadFraction !== undefined ? params.loadFraction : 1.0;

  const S_rated = (params.ratedKva ? params.ratedKva * 1e3 : Voc * Isc);
  const V1 = Voc;
  const V2 = params.vSecondary || 115.0;

  const cosPhi0 = Math.min(1.0, Poc / Math.max(1, Voc * Ioc));
  const sinPhi0 = Math.sqrt(Math.max(0, 1.0 - cosPhi0 * cosPhi0));
  const Iw = Ioc * cosPhi0;
  const Im = Ioc * sinPhi0;
  const Rc = Voc / Math.max(1e-4, Iw);
  const Xm = Voc / Math.max(1e-4, Im);

  const Zeq = Vsc / Math.max(1e-4, Isc);
  const Req = Psc / Math.max(1e-4, Isc * Isc);
  const Xeq = Math.sqrt(Math.max(0, Zeq * Zeq - Req * Req));

  const sinPhi = Math.sqrt(Math.max(0, 1.0 - pf * pf));
  const Pout = xLoad * S_rated * pf;
  const Pcu = xLoad * xLoad * Psc;
  const Ploss = Poc + Pcu;
  const eta = (Pout / Math.max(1, Pout + Ploss)) * 100.0;
  const xMaxEta = Math.sqrt(Poc / Math.max(1, Psc));
  const vRegPct = ((xLoad * (Isc * Req * pf + Isc * Xeq * sinPhi)) / V1) * 100.0;

  const metrics = [
    { label: 'Operating Efficiency η', value: `${eta.toFixed(2)}%`, unit: '', description: `At ${Math.round(xLoad * 100)}% load, PF = ${pf.toFixed(2)}` },
    { label: 'Voltage Regulation %VR', value: `${vRegPct.toFixed(2)}%`, unit: '', description: 'Full-load to no-load secondary voltage drop', status: vRegPct > 5.0 ? 'warning' : 'normal' },
    { label: 'Core / Shunt Branch', value: `Rc=${(Rc).toFixed(0)}Ω, Xm=${(Xm).toFixed(0)}Ω`, unit: '', description: 'Open-circuit excitation parameters' },
    { label: 'Series Impedance Zeq', value: `${Zeq.toFixed(2)} Ω (Req=${Req.toFixed(2)}Ω)`, unit: '', description: 'Short-circuit winding impedance' },
  ];

  return {
    state: { S_rated, V1, V2, I1_rated: Isc, I0: Ioc, Poc, Psc, Req, Xeq, Rc, Xm, eta, vRegPct, xMaxEta, xLoad, pf },
    metrics,
  };
}

function solveDcMotor(params, t) {
  const Va = params.armatureVoltage || params.vArmature || 220.0;
  const phiRel = params.fieldCurrentRel !== undefined ? params.fieldCurrentRel : (params.iField !== undefined ? params.iField : 1.0);
  const TL = params.loadTorque !== undefined ? params.loadTorque : 25.0;
  const Rext = params.extArmatureR || 0.0;
  const Ra = (params.rArmature || 0.6) + Rext;
  const kPhi = params.fluxConstant || 1.05;

  const phi = kPhi * phiRel;
  const Kt = phi;
  const Ke = Kt;

  const Ia = TL / Math.max(0.01, Kt);
  const Eb = Math.max(0, Va - Ia * Ra);
  const omega = Math.max(0, Eb / Math.max(0.01, Ke));
  const rpm = (omega * 60.0) / (2.0 * Math.PI);
  const Pmech = TL * omega;
  const Pin = Va * Ia + 220.0 * 1.5 * phiRel;
  const eta = Math.min(99.0, Math.max(0, (Pmech / Math.max(1, Pin)) * 100.0));
  const noLoadRpm = (Va / Math.max(0.01, Ke)) * (60.0 / (2.0 * Math.PI));
  const stallTorque = Kt * (Va / Ra);

  const metrics = [
    { label: 'Rotor Speed N', value: rpm.toFixed(0), unit: 'RPM', description: `Angular velocity ω = ${omega.toFixed(1)} rad/s` },
    { label: 'Armature Current Ia', value: Ia.toFixed(1), unit: 'A', description: `Back-EMF Eb = ${Eb.toFixed(1)} V` },
    { label: 'Mechanical Power', value: (Pmech / 1000.0).toFixed(2), unit: 'kW', description: `${(Pmech / 745.7).toFixed(1)} HP at shaft` },
    { label: 'Motor Efficiency η', value: `${eta.toFixed(1)}%`, unit: '', description: 'Electromechanical conversion efficiency' },
  ];

  return {
    state: { Va, phiRel, TL, Ra, Ia, Eb, omega, rpm, noLoadRpm, stallTorque, Pmech, eta },
    metrics,
  };
}

function solveInductionMotor(params) {
  const VL = params.appliedVoltage || 400.0;
  const P = Math.round(params.poles || 4);
  const R1 = params.rStator || 0.4;
  const X1 = params.xStator || 0.8;
  const R2 = params.rRotor || 0.35;
  const X2 = params.xRotor || 0.75;
  const s = params.slip !== undefined ? params.slip : 0.04;

  const f = 50.0;
  const Ns = (120.0 * f) / P;
  const ws = (4.0 * Math.PI * f) / P;
  const V1ph = VL / Math.sqrt(3.0);

  const Xeq = X1 + X2;
  const sMax = R2 / Math.sqrt(R1 * R1 + Xeq * Xeq);
  const Tmax = (3.0 * V1ph * V1ph) / (2.0 * ws * (R1 + Math.sqrt(R1 * R1 + Xeq * Xeq)));
  const Tstart = (3.0 * V1ph * V1ph * R2) / (ws * (Math.pow(R1 + R2, 2) + Xeq * Xeq));

  const R2_eff = R2 / Math.max(0.0001, s);
  const I2 = V1ph / Math.sqrt(Math.pow(R1 + R2_eff, 2) + Xeq * Xeq);
  const T_op = (3.0 * I2 * I2 * R2_eff) / ws;
  const Nr = Ns * (1.0 - s);
  const Pmech = (1.0 - s) * ws * T_op;

  const metrics = [
    { label: 'Rotor Speed Nr', value: Nr.toFixed(0), unit: 'RPM', description: `Synchronous Ns = ${Ns.toFixed(0)} RPM, Slip s = ${(s * 100).toFixed(1)}%` },
    { label: 'Electromagnetic Torque', value: T_op.toFixed(1), unit: 'Nm', description: `Breakdown Tmax = ${Tmax.toFixed(1)} Nm` },
    { label: 'Mechanical Power', value: (Pmech / 1000.0).toFixed(1), unit: 'kW', description: `${(Pmech / 745.7).toFixed(1)} BHP mechanical output` },
    { label: 'Starting Torque Ratio', value: `${(Tstart / Math.max(1, T_op)).toFixed(2)}x`, unit: '', description: `DOL Start Torque = ${Tstart.toFixed(1)} Nm` },
  ];

  return {
    state: { Ns, Nr, s, sMax, T_op, Tmax, Tstart, Pmech, I2 },
    metrics,
  };
}

function solveSolarPv(params, t) {
  const G = params.irradiance || 1000.0;
  const Tc = params.cellTemp !== undefined ? params.cellTemp : 25.0;
  const Ns = Math.round(params.seriesCells || 60);
  const Rs = params.rSeries || 0.008;
  const Rsh = params.rShunt || 300.0;

  const Tk = Tc + 273.15;
  const q = 1.602176634e-19;
  const kB = 1.380649e-23;
  const A = 1.25;
  const Vt = (kB * Tk) / q;
  const Isc0 = 9.2;
  const Voc0 = 0.65;
  const alpha_I = 0.0005;
  const beta_V = -0.0022;

  const Iph = (Isc0 + alpha_I * (Tk - 298.15)) * (G / 1000.0);
  const I0 = 1.5e-9 * Math.pow(Tk / 298.15, 3) * Math.exp((q * 1.12 / (A * kB)) * (1.0 / 298.15 - 1.0 / Tk));
  const Voc = Math.max(0, Ns * (Voc0 + beta_V * (Tk - 298.15)) + (Ns * Vt * Math.log(Math.max(1e-3, G / 1000.0))));

  const steps = 60;
  let Pmax = 0;
  let Vmpp = 0;
  let Impp = 0;

  for (let s = 0; s <= steps; s++) {
    const v = (s / steps) * Voc;
    const arg = Math.min(50, (v / (Ns * A * Vt)));
    const i = Math.max(0, Iph - I0 * (Math.exp(arg) - 1.0) - v / Rsh);
    const p = v * i;
    if (p > Pmax) {
      Pmax = p;
      Vmpp = v;
      Impp = i;
    }
  }

  const FF = (Pmax / Math.max(0.1, Voc * Iph)) * 100.0;
  const areaM2 = Ns * 0.024;
  const PinSun = G * areaM2;
  const moduleEff = (Pmax / Math.max(1, PinSun)) * 100.0;

  const metrics = [
    { label: 'Peak Power P_max (MPP)', value: Pmax.toFixed(1), unit: 'W', description: `Vmpp = ${Vmpp.toFixed(1)} V, Impp = ${Impp.toFixed(2)} A` },
    { label: 'Open-Circuit Voltage Voc', value: Voc.toFixed(1), unit: 'V', description: 'Zero current terminal potential' },
    { label: 'Short-Circuit Current Isc', value: Iph.toFixed(2), unit: 'A', description: 'Zero voltage saturation current' },
    { label: 'Fill Factor (FF)', value: `${FF.toFixed(1)}%`, unit: '', description: `Module efficiency η = ${moduleEff.toFixed(1)}%` },
  ];

  return {
    state: { G, Tc, Ns, Iph, Voc, Vmpp, Impp, Pmax, FF, moduleEff },
    metrics,
  };
}

function solveCentrifugalPump(params) {
  const N = params.pumpSpeed || 1750.0;
  const D_mm = params.impellerDia || 220.0;
  const Hstat = params.staticHead || 15.0;
  const kPipe = params.systemResistanceK || 0.004;

  const N_ratio = N / 1750.0;
  const D_ratio = D_mm / 220.0;

  const H0 = 42.0 * Math.pow(N_ratio * D_ratio, 2);
  const Qmax = 95.0 * N_ratio * Math.pow(D_ratio, 3);
  const kp = (H0 * 0.75) / Math.pow(Qmax, 2);

  let Qop = 0;
  let Hop = Hstat;
  if (H0 > Hstat) {
    Qop = Math.sqrt((H0 - Hstat) / (kp + kPipe));
    Hop = Hstat + kPipe * Qop * Qop;
  }

  const Qbep = Qmax * 0.65;
  const etaMax = 0.78;
  const qNorm = Qop / Math.max(1, Qbep);
  const etaHyd = Math.max(0.1, Math.min(etaMax, 4.0 * etaMax * qNorm * (1.0 - 0.5 * qNorm)));
  const rho = 1000.0;
  const g = 9.80665;
  const PshaftKw = (rho * g * (Qop / 3600.0) * Hop) / (1000.0 * etaHyd);
  const npshReq = 1.2 + 2.5 * Math.pow(Qop / Math.max(1, Qbep), 2);

  const metrics = [
    { label: 'Operating Flow Q_duty', value: Qop.toFixed(1), unit: 'm³/h', description: 'System curve intersection operating discharge' },
    { label: 'Total Dynamic Head H_duty', value: Hop.toFixed(1), unit: 'm', description: `Static lift: ${Hstat.toFixed(1)}m + Friction head` },
    { label: 'Shaft Brake Power BHP', value: PshaftKw.toFixed(2), unit: 'kW', description: `${(PshaftKw * 1.341).toFixed(1)} HP motor demand` },
    { label: 'Pump Efficiency η', value: `${(etaHyd * 100).toFixed(1)}%`, unit: '', description: `BEP: ${Qbep.toFixed(0)} m³/h, NPSHr: ${npshReq.toFixed(1)}m` },
  ];

  return {
    state: { N, D_mm, H0, Qmax, Qop, Hop, Qbep, etaHyd, PshaftKw, npshReq, Hstat },
    metrics,
  };
}

function solveRefrigerationCycle(params) {
  const Tevap = params.evapTemp !== undefined ? params.evapTemp : -5.0;
  const Tcond = params.condTemp !== undefined ? params.condTemp : 45.0;
  const dSub = params.subcooling || 5.0;
  const dSup = params.superheat || 6.0;
  const etaIsen = (params.compressorEff || 75.0) / 100.0;
  const Qcap = params.coolingCapacityKw || 10.0;

  const Pevap = Math.exp(10.5 - 2400.0 / (Tevap + 273.15));
  const Pcond = Math.exp(10.5 - 2400.0 / (Tcond + 273.15));

  const h1 = 398.0 + 0.85 * (Tevap + dSup);
  const h2s = h1 + 35.0 * Math.pow(Pcond / Math.max(0.1, Pevap), 0.28);
  const h2 = h1 + (h2s - h1) / etaIsen;
  const h3 = 200.0 + 1.4 * (Tcond - dSub);
  const h4 = h3;

  const qEvap = h1 - h4;
  const wComp = h2 - h1;
  const qCond = h2 - h3;

  const copR = Math.max(0.1, qEvap / Math.max(0.1, wComp));
  const copHp = copR + 1.0;
  const copCarnot = (Tevap + 273.15) / Math.max(1, (Tcond - Tevap));
  const etaII = (copR / copCarnot) * 100.0;

  const mFlow = Qcap / Math.max(1, qEvap);
  const PcompKw = mFlow * wComp;

  const metrics = [
    { label: 'Cooling COP (COP_R)', value: copR.toFixed(2), unit: '', description: `Heating COP_HP = ${copHp.toFixed(2)}` },
    { label: 'Compressor Power', value: PcompKw.toFixed(2), unit: 'kW', description: `Electric input for ${Qcap.toFixed(1)} kW cooling load` },
    { label: 'Carnot 2nd-Law Efficiency', value: `${etaII.toFixed(1)}%`, unit: '', description: `Carnot ideal limit COP = ${copCarnot.toFixed(2)}` },
    { label: 'Refrigerant Mass Flow', value: (mFlow * 3600.0).toFixed(1), unit: 'kg/h', description: `Operating pressures: ${Pevap.toFixed(1)} / ${Pcond.toFixed(1)} bar` },
  ];

  return {
    state: { Tevap, Tcond, Pevap, Pcond, h1, h2, h3, h4, qEvap, wComp, qCond, copR, copHp, copCarnot, PcompKw, mFlow },
    metrics,
  };
}

function solveRootLocus(params) {
  const K = params.gainK || 5.0;
  const p1 = params.pole1 !== undefined ? params.pole1 : 0.0;
  const p2 = params.pole2 !== undefined ? params.pole2 : -2.0;
  const p3 = params.pole3 !== undefined ? params.pole3 : -5.0;
  const z1 = params.zero1 !== undefined ? params.zero1 : -4.0;

  const sigmaA = ((p1 + p2 + p3) - z1) / 2.0;

  const c2 = -(p1 + p2 + p3);
  const c1 = (p1 * p2 + p2 * p3 + p3 * p1) + K;
  const c0 = -(p1 * p2 * p3) - K * z1;

  const Q_cardan = (3 * c1 - c2 * c2) / 9.0;
  const R_cardan = (9 * c2 * c1 - 27 * c0 - 2 * c2 * c2 * c2) / 54.0;
  const D_cardan = Q_cardan * Q_cardan * Q_cardan + R_cardan * R_cardan;

  let root1 = { re: 0, im: 0 };
  let root2 = { re: 0, im: 0 };
  let root3 = { re: 0, im: 0 };

  if (D_cardan >= 0) {
    const S_val = Math.cbrt(R_cardan + Math.sqrt(D_cardan));
    const T_val = Math.cbrt(R_cardan - Math.sqrt(D_cardan));
    root1.re = -c2 / 3.0 + (S_val + T_val);
    root2.re = -c2 / 3.0 - (S_val + T_val) / 2.0;
    root2.im = (Math.sqrt(3.0) / 2.0) * (S_val - T_val);
    root3.re = root2.re;
    root3.im = -root2.im;
  } else {
    const theta_cardan = Math.acos(R_cardan / Math.sqrt(-Q_cardan * Q_cardan * Q_cardan));
    root1.re = 2 * Math.sqrt(-Q_cardan) * Math.cos(theta_cardan / 3.0) - c2 / 3.0;
    root2.re = 2 * Math.sqrt(-Q_cardan) * Math.cos((theta_cardan + 2 * Math.PI) / 3.0) - c2 / 3.0;
    root3.re = 2 * Math.sqrt(-Q_cardan) * Math.cos((theta_cardan + 4 * Math.PI) / 3.0) - c2 / 3.0;
  }

  const isStable = root1.re < 0 && root2.re < 0 && root3.re < 0;
  const domWn = Math.sqrt(root2.re * root2.re + root2.im * root2.im);
  const domZeta = domWn > 0 ? -root2.re / domWn : 1.0;

  const metrics = [
    { label: 'Closed-Loop Stability', value: isStable ? 'Asymptotically Stable' : 'Unstable (RHP Poles)', unit: '', status: isStable ? 'normal' : 'alert', description: 'All roots Re(s) < 0' },
    { label: 'Dominant Pole Pair', value: `${root2.re.toFixed(2)} ± j${Math.abs(root2.im).toFixed(2)}`, unit: '', description: `Natural frequency ωn = ${domWn.toFixed(2)} rad/s` },
    { label: 'Dominant Damping ζ', value: domZeta.toFixed(2), unit: '', description: `Estimated overshoot = ${(Math.exp(-Math.PI * domZeta / Math.sqrt(Math.max(0.01, 1 - domZeta * domZeta))) * 100).toFixed(1)}%` },
    { label: 'Asymptote Centroid σ_a', value: sigmaA.toFixed(2), unit: '', description: 'Angles = ±90° to infinity' },
  ];

  return {
    state: { K, p1, p2, p3, z1, sigmaA, root1, root2, root3, isStable, domZeta, domWn },
    metrics,
  };
}

function solveBatchPfr(params) {
  const reactorType = Math.round(params.reactorType || 0);
  const order = Math.round(params.order || 1);
  const k0 = params.kRate || 0.05;
  const tempC = params.tempC || 65.0;
  const Ea = (params.actEnergy || 45.0) * 1e3;
  const Ca0 = params.ca0 || 2.0;
  const t_or_V = params.volOrTime || 30.0;

  const R_gas = 8.314462;
  const T_ref = 323.15;
  const Tk = tempC + 273.15;
  const k = k0 * Math.exp((-Ea / R_gas) * (1.0 / Tk - 1.0 / T_ref));

  let Xa = 0;
  let Ca = 0;
  let Cb = 0;
  let rate = 0;

  if (order === 1) {
    Xa = 1.0 - Math.exp(-k * t_or_V);
    Ca = Ca0 * (1.0 - Xa);
    Cb = Ca0 * Xa;
    rate = k * Ca;
  } else {
    Xa = (k * Ca0 * t_or_V) / (1.0 + k * Ca0 * t_or_V);
    Ca = Ca0 * (1.0 - Xa);
    Cb = Ca0 * Xa;
    rate = k * Ca * Ca;
  }

  const Da = order === 1 ? k * t_or_V : k * Ca0 * t_or_V;
  const yieldPct = Xa * 100.0;

  const metrics = [
    { label: 'Fractional Conversion X_A', value: `${yieldPct.toFixed(1)}%`, unit: '', description: `Reactant consumed in ${t_or_V.toFixed(0)} ${reactorType === 0 ? 'min' : 'L'}` },
    { label: 'Effluent Conc C_A', value: Ca.toFixed(3), unit: 'mol/L', description: `Initial C_A0 = ${Ca0.toFixed(2)} mol/L` },
    { label: 'Product Conc C_B', value: Cb.toFixed(3), unit: 'mol/L', description: `Reaction rate r_A = ${rate.toFixed(4)} mol/(L·min)` },
    { label: 'Damköhler Number Da', value: Da.toFixed(2), unit: '', description: `Rate constant k(T) = ${k.toFixed(4)} at ${tempC.toFixed(0)}°C` },
  ];

  return {
    state: { reactorType, order, k, Tk, Ca0, t_or_V, Xa, Ca, Cb, rate, Da },
    metrics,
  };
}

function solveRcBeam(params) {
  const b = params.beamWidth || 300.0;
  const h = params.beamDepth || 500.0;
  const cover = params.cover || 40.0;
  const fc = params.fc || 30.0;
  const fy = params.fy || 500.0;
  const nBars = Math.round(params.rebarCount || 4);
  const dBar = params.barDiameter || 20.0;
  const Mu = params.appliedMoment || 180.0;

  const d = h - cover - dBar / 2.0;
  const Ast = nBars * (Math.PI * dBar * dBar / 4.0);
  const rho = Ast / (b * d);

  const a = (Ast * fy) / (0.85 * fc * b);
  const beta1 = Math.max(0.65, Math.min(0.85, 0.85 - 0.05 * ((fc - 28.0) / 7.0)));
  const c = a / beta1;

  const eps_c = 0.003;
  const eps_t = eps_c * (d - c) / Math.max(1, c);
  const isTensionControlled = eps_t >= 0.005;
  const phi = isTensionControlled ? 0.90 : Math.max(0.65, 0.65 + (eps_t - 0.002) * (0.25 / 0.003));

  const Mn = (Ast * fy * (d - a / 2.0)) * 1e-6;
  const phiMn = phi * Mn;
  const utilization = (Mu / Math.max(1, phiMn)) * 100.0;
  const isSafe = utilization <= 100.0;

  const metrics = [
    { label: 'Design Capacity φMn', value: phiMn.toFixed(1), unit: 'kNm', description: `Nominal Mn = ${Mn.toFixed(1)} kNm, Strength reduction φ = ${phi.toFixed(2)}` },
    { label: 'Moment Demand Mu', value: Mu.toFixed(1), unit: 'kNm', description: `Section Utilization = ${utilization.toFixed(1)}%`, status: isSafe ? 'normal' : 'alert' },
    { label: 'Neutral Axis Depth c', value: `${c.toFixed(1)} mm`, unit: '', description: `Whitney block a = ${a.toFixed(1)} mm (d = ${d.toFixed(0)} mm)` },
    { label: 'Steel Strain ε_t', value: eps_t.toFixed(4), unit: '', description: isTensionControlled ? 'Tension-Controlled Ductile Failure' : 'Transition / Compression Failure', status: isTensionControlled ? 'normal' : 'warning' },
  ];

  return {
    state: { b, h, d, Ast, a, c, beta1, eps_t, phi, Mn, phiMn, Mu, utilization, isSafe, isTensionControlled },
    metrics,
  };
}

function computeSimulation(type, params, t, dt) {
  switch (type) {
    case 'transformer_test':
      return solveTransformerTest(params);
    case 'dc_motor':
      return solveDcMotor(params, t);
    case 'induction_motor':
      return solveInductionMotor(params);
    case 'solar_pv':
      return solveSolarPv(params, t);
    case 'centrifugal_pump':
      return solveCentrifugalPump(params);
    case 'refrigeration_cycle':
      return solveRefrigerationCycle(params);
    case 'root_locus':
      return solveRootLocus(params);
    case 'batch_pfr':
      return solveBatchPfr(params);
    case 'rc_beam':
      return solveRcBeam(params);
    case 'op_amp':
      return solveOpAmp(params, t);
    case 'rc_transient':
      return solveRcTransient(params, t);
    case 'otto_cycle':
      return solveOttoCycle(params);
    case 'projectile':
      return solveProjectile(params, t);
    case 'photoelectric':
      return solvePhotoelectric(params);
    case 'bode_plot':
      return solveBodePlot(params);
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
