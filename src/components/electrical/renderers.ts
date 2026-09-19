// High-Fidelity Canvas Renderers for Electrical & Electronic Engineering Simulators
// Adheres strictly to IEEE, IEC, and NIST Standards

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  dt: number;
  t: number;
}

// ---------------------------------------------------------------------------
// 1. RLC RESONANT CIRCUIT & OSCILLOSCOPE RENDERER
// ---------------------------------------------------------------------------
export interface RlcParams {
  resistance: number; // ohm
  inductance: number; // mH
  capacitance: number; // uF
  frequency: number; // Hz
}

export function renderRlcCircuit(rc: RenderContext, p: RlcParams) {
  const { ctx, w, h, t } = rc;
  const { resistance, inductance, capacitance, frequency } = p;

  const R = resistance;
  const L = inductance * 1e-3;
  const C = capacitance * 1e-6;
  const f = frequency;
  const omega = 2 * Math.PI * f;
  const omega0 = 1 / Math.sqrt(L * C);
  const f0 = omega0 / (2 * Math.PI);
  const XL = omega * L;
  const XC = 1 / (omega * C);
  const Z = Math.sqrt(R * R + (XL - XC) * (XL - XC));
  const phi = Math.atan2(XL - XC, R);
  const I_peak = Math.min(2.0, 20 / Z);

  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText('IEEE 1459-2010 • SERIES RLC NETWORK SCHEMATIC & DUAL-CHANNEL PHOSPHOR SCOPE', 18, 22);

  // Left Section: Interactive Physical Schematic
  const hasSplit = w > 620;
  const schemX = 30;
  const schemY = 45;
  const schemW = hasSplit ? Math.min(260, w * 0.35) : w - 60;
  const schemH = hasSplit ? h - 75 : Math.min(120, h * 0.35);

  // Schematic Enclosure Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(schemX, schemY, schemW, schemH, 10);
  ctx.fill();
  ctx.stroke();

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('CIRCUIT TOPOLOGY', schemX + 14, schemY + 18);

  // Draw Series Circuit Loop
  const loopX = schemX + 25;
  const loopY = schemY + 35;
  const loopW = schemW - 50;
  const loopH = schemH - 60;

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(loopX, loopY, loopW, loopH);

  // 1. AC Voltage Source (Left branch)
  const srcY = loopY + loopH / 2;
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(loopX, srcY, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Sine symbol inside source
  ctx.beginPath();
  ctx.moveTo(loopX - 8, srcY);
  ctx.quadraticCurveTo(loopX - 4, srcY - 8, loopX, srcY);
  ctx.quadraticCurveTo(loopX + 4, srcY + 8, loopX + 8, srcY);
  ctx.stroke();

  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`v(t) ${f}Hz`, loopX - 22, srcY - 20);

  // 2. Resistor R (Top branch)
  const rX = loopX + loopW * 0.3;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(rX - 16, loopY - 8, 32, 16);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.strokeRect(rX - 16, loopY - 8, 32, 16);
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`R: ${R}Ω`, rX - 14, loopY - 14);

  // 3. Inductor L (Top branch right)
  const lX = loopX + loopW * 0.72;
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(lX - 8, loopY, 6, Math.PI, 0);
  ctx.arc(lX + 4, loopY, 6, Math.PI, 0);
  ctx.stroke();
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#a855f7';
  ctx.fillText(`L: ${inductance}mH`, lX - 16, loopY - 14);

  // 4. Capacitor C (Right branch)
  const capY = loopY + loopH / 2;
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(loopX + loopW - 12, capY - 10);
  ctx.lineTo(loopX + loopW + 12, capY - 10);
  ctx.moveTo(loopX + loopW - 12, capY + 10);
  ctx.lineTo(loopX + loopW + 12, capY + 10);
  ctx.stroke();
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#ec4899';
  ctx.fillText(`C: ${capacitance}µF`, loopX + loopW - 20, capY + 28);

  // Dynamic Current Charge Particles moving around the loop
  const currentSpeed = I_peak * 80;
  const loopPerimeter = 2 * (loopW + loopH);
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 6;
  const numParticles = 8;
  for (let i = 0; i < numParticles; i++) {
    const dist = ((t * currentSpeed + (i * loopPerimeter) / numParticles) % loopPerimeter + loopPerimeter) % loopPerimeter;
    let px = loopX;
    let py = loopY;
    if (dist < loopW) {
      px = loopX + dist;
      py = loopY;
    } else if (dist < loopW + loopH) {
      px = loopX + loopW;
      py = loopY + (dist - loopW);
    } else if (dist < 2 * loopW + loopH) {
      px = loopX + loopW - (dist - (loopW + loopH));
      py = loopY + loopH;
    } else {
      px = loopX;
      py = loopY + loopH - (dist - (2 * loopW + loopH));
    }
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  // Right Section: Phosphor Dual Oscilloscope & Phasor Dial
  const scopeX = hasSplit ? schemX + schemW + 20 : schemX;
  const scopeY = hasSplit ? schemY : schemY + schemH + 15;
  const scopeW = w - scopeX - 30;
  const scopeH = h - scopeY - 30;

  if (scopeW > 80 && scopeH > 60) {
    // Oscilloscope Screen Housing
    ctx.fillStyle = '#020614';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(scopeX, scopeY, scopeW, scopeH, 10);
    ctx.fill();
    ctx.stroke();

    // Oscilloscope Graticule
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    const gridSpacing = 28;
    for (let gx = scopeX + gridSpacing; gx < scopeX + scopeW; gx += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(gx, scopeY);
      ctx.lineTo(gx, scopeY + scopeH);
      ctx.stroke();
    }
    for (let gy = scopeY + gridSpacing; gy < scopeY + scopeH; gy += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(scopeX, gy);
      ctx.lineTo(scopeX + scopeW, gy);
      ctx.stroke();
    }

    const scopeMidY = scopeY + scopeH / 2;

    // Center Crosshairs
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(scopeX, scopeMidY);
    ctx.lineTo(scopeX + scopeW, scopeMidY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Channel 1: Source Voltage v(t) (Cyan Glow)
    const waveW = scopeW > 400 ? scopeW - 130 : scopeW;
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let x = 0; x < waveW; x++) {
      const timeVal = t + (x / waveW) * 0.04;
      const vy = scopeMidY - Math.sin(omega * timeVal) * (scopeH * 0.35);
      if (x === 0) ctx.moveTo(scopeX + x, vy);
      else ctx.lineTo(scopeX + x, vy);
    }
    ctx.stroke();

    // Channel 2: Loop Current i(t) (Amber Glow with phase shift phi)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    for (let x = 0; x < waveW; x++) {
      const timeVal = t + (x / waveW) * 0.04;
      const iy = scopeMidY - Math.sin(omega * timeVal - phi) * (scopeH * 0.3 * Math.min(1.4, 30 / Z));
      if (x === 0) ctx.moveTo(scopeX + x, iy);
      else ctx.lineTo(scopeX + x, iy);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Phasor Vector Radar if screen wide
    if (scopeW > 400) {
      const pDialX = scopeX + scopeW - 65;
      const pDialY = scopeMidY;
      const pDialR = Math.min(48, scopeH * 0.35);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(pDialX, pDialY, pDialR, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating Voltage Phasor (Cyan)
      const vAng = (omega * t) % (2 * Math.PI);
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pDialX, pDialY);
      ctx.lineTo(pDialX + Math.cos(vAng) * pDialR * 0.85, pDialY - Math.sin(vAng) * pDialR * 0.85);
      ctx.stroke();

      // Rotating Current Phasor (Amber with lag phi)
      const iAng = vAng - phi;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pDialX, pDialY);
      ctx.lineTo(pDialX + Math.cos(iAng) * pDialR * 0.7, pDialY - Math.sin(iAng) * pDialR * 0.7);
      ctx.stroke();

      ctx.font = '9px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('PHASOR', pDialX - 18, pDialY + pDialR + 15);
    }

    // Oscilloscope Legends
    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText('CH1: v(t) Generator', scopeX + 16, scopeY + 20);
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`CH2: i(t) Loop [Lag: ${(phi * 180 / Math.PI).toFixed(1)}°]`, scopeX + 180, scopeY + 20);
  }
}

// ---------------------------------------------------------------------------
// 2. THREE-PHASE GRID & REVOLVING FIELD RENDERER
// ---------------------------------------------------------------------------
export interface ThreePhaseParams {
  voltage: number; // V
  frequency: number; // Hz
  loadTorque: number; // Nm
  excitationCurrent: number; // A
}

export function renderThreePhase(rc: RenderContext, p: ThreePhaseParams) {
  const { ctx, w, h, t } = rc;
  const { voltage, frequency, loadTorque, excitationCurrent } = p;

  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#ef4444';
  ctx.fillText('IEEE 141 / IEC 60034 • 3-PHASE BALANCED GRID & STATOR REVOLVING MMF', 18, 22);

  const omega = 2 * Math.PI * frequency;
  const midY = h * 0.5;

  const phaseColors = [
    { name: 'R', color: '#ef4444', phi: 0, label: 'Phase R (0°)' },
    { name: 'Y', color: '#eab308', phi: (2 * Math.PI) / 3, label: 'Phase Y (-120°)' },
    { name: 'B', color: '#2563eb', phi: (4 * Math.PI) / 3, label: 'Phase B (-240°)' },
  ];

  const waveW = w > 580 ? Math.max(220, w * 0.56) : w - 40;

  // Waveform Scope Screen
  ctx.fillStyle = '#020614';
  ctx.fillRect(30, 45, waveW - 30, h - 75);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(30, 45, waveW - 30, h - 75);

  // Neutral Zero Line
  ctx.strokeStyle = '#64748b';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(30, midY);
  ctx.lineTo(waveW, midY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw 3 Balanced Sinusoids
  phaseColors.forEach((pc) => {
    ctx.strokeStyle = pc.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 30; x <= waveW; x++) {
      const timeVal = t + ((x - 30) / (waveW - 30)) * 0.04;
      const y = midY - Math.sin(omega * timeVal - pc.phi) * (h * 0.32);
      if (x === 30) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  });

  // Stator 2D Revolving Magnetic Field Dial on Right
  if (w > 580) {
    const dialCenterX = waveW + (w - waveW) * 0.5;
    const dialCenterY = midY;
    const dialRadius = Math.min(75, h * 0.36, (w - waveW) * 0.42);

    // Stator Core Ring
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(dialCenterX, dialCenterY, dialRadius, 0, 2 * Math.PI);
    ctx.stroke();

    // 3 Stator Coils (R, Y, B at 120 deg apart)
    const coilAngles = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
    coilAngles.forEach((ang, idx) => {
      const cx = dialCenterX + Math.cos(ang) * dialRadius;
      const cy = dialCenterY - Math.sin(ang) * dialRadius;
      ctx.fillStyle = phaseColors[idx].color;
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Revolving Net Magnetic Field Vector B_net
    const rotAngle = (omega * t) % (2 * Math.PI);
    const bVecX = dialCenterX + Math.cos(rotAngle) * (dialRadius * 0.85);
    const bVecY = dialCenterY - Math.sin(rotAngle) * (dialRadius * 0.85);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = '#10b981';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(dialCenterX, dialCenterY);
    ctx.lineTo(bVecX, bVecY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Arrowhead
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(bVecX, bVecY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText('B_net (MMF)', dialCenterX - 32, dialCenterY + dialRadius + 22);
  }

  // Legend
  ctx.font = '11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#ef4444';
  ctx.fillText('■ Phase R (Red)', 40, 36);
  ctx.fillStyle = '#eab308';
  ctx.fillText('■ Phase Y (Yellow)', 175, 36);
  ctx.fillStyle = '#2563eb';
  ctx.fillText('■ Phase B (Blue)', 330, 36);
}

// ---------------------------------------------------------------------------
// 3. SYNCHRONOUS BUCK-BOOST CONVERTER RENDERER
// ---------------------------------------------------------------------------
export interface BuckBoostParams {
  dutyCycle: number; // D (0.1 - 0.9)
  inputVoltage: number; // Vin
  switchingFreq: number; // kHz
  inductance: number; // uH
}

export function renderBuckBoost(rc: RenderContext, p: BuckBoostParams) {
  const { ctx, w, h, t } = rc;
  const { dutyCycle, inputVoltage, switchingFreq, inductance } = p;

  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText('IEEE PES • SYNCHRONOUS BUCK-BOOST PWM SWITCHING TOPOLOGY', 18, 22);

  const D = dutyCycle;
  const midY1 = h * 0.32;
  const midY2 = h * 0.72;

  // Waveform 1: MOSFET Gate Drive PWM
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`MOSFET GATE DRIVE PWM (D = ${(D * 100).toFixed(0)}%, f_sw = ${switchingFreq} kHz)`, 35, midY1 - 42);

  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const periodW = Math.min(90, w / 6);
  for (let x = 30; x < w - 30; x++) {
    const phase = ((x - 30 + t * 80) % periodW) / periodW;
    const y = phase < D ? midY1 - 30 : midY1 + 10;
    if (x === 30) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Waveform 2: Triangular Inductor Current i_L(t)
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('INDUCTOR CURRENT i_L(t) [CONTINUOUS CONDUCTION MODE CCM]', 35, midY2 - 42);

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let x = 30; x < w - 30; x++) {
    const phase = ((x - 30 + t * 80) % periodW) / periodW;
    let ramp = 0;
    if (phase < D) {
      ramp = (phase / D) * 40;
    } else {
      ramp = 40 - ((phase - D) / (1 - D)) * 40;
    }
    const y = midY2 + 15 - ramp;
    if (x === 30) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// 4. SALLEN-KEY ACTIVE FILTER RENDERER
// ---------------------------------------------------------------------------
export interface SallenKeyParams {
  cutoffFreq: number; // Hz
  qualityFactor: number; // Q
  gain: number; // Av
  testFreq: number; // Hz
}

export function renderSallenKey(rc: RenderContext, p: SallenKeyParams) {
  const { ctx, w, h, t } = rc;
  const { cutoffFreq, qualityFactor, gain, testFreq } = p;

  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#8b5cf6';
  ctx.fillText('ACTIVE SALLEN-KEY 2ND-ORDER LOW-PASS FILTER • BODE PLOT & TIME PROBE', 18, 22);

  const plotX = 50;
  const plotY = 55;
  const plotW = Math.max(160, Math.min(360, w * 0.48));
  const plotH = h - 95;

  // Bode Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(plotX, plotY, plotW, plotH);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(plotX, plotY, plotW, plotH);

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#c084fc';
  ctx.fillText(`BODE MAGNITUDE CURVE (Q = ${qualityFactor.toFixed(2)})`, plotX + 12, plotY + 20);

  // Bode Magnitude Curve
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i < plotW; i++) {
    const fPlot = 50 * Math.pow(200, i / plotW);
    const r = fPlot / cutoffFreq;
    const mag = 1 / Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(r / qualityFactor, 2));
    const db = 20 * Math.log10(Math.max(0.001, mag));
    const py = plotY + 30 - db * 2.5;
    const clampedY = Math.min(plotY + plotH - 5, Math.max(plotY + 5, py));
    if (i === 0) ctx.moveTo(plotX + i, clampedY);
    else ctx.lineTo(plotX + i, clampedY);
  }
  ctx.stroke();

  // Test Frequency Cursor
  const testRatio = Math.max(0, Math.min(1, Math.log10(testFreq / 50) / Math.log10(200)));
  const curX = plotX + testRatio * plotW;
  ctx.strokeStyle = '#06b6d4';
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(curX, plotY);
  ctx.lineTo(curX, plotY + plotH);
  ctx.stroke();
  ctx.setLineDash([]);

  // Time Domain Oscilloscope Probe (Right)
  if (w > 540) {
    const scopeX = plotX + plotW + 30;
    const scopeW = w - scopeX - 30;
    const scopeMidY = plotY + plotH / 2;

    ctx.fillStyle = '#020614';
    ctx.fillRect(scopeX, plotY, scopeW, plotH);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(scopeX, plotY, scopeW, plotH);

    const rIn = testFreq / cutoffFreq;
    const probeMag = 1 / Math.sqrt(Math.pow(1 - rIn * rIn, 2) + Math.pow(rIn / qualityFactor, 2));

    // Input Signal (Ghost cyan)
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = scopeX; x < scopeX + scopeW; x++) {
      const timeVal = t + ((x - scopeX) / scopeW) * 0.03;
      const y = scopeMidY - Math.sin(2 * Math.PI * testFreq * timeVal * 0.05) * 40;
      if (x === scopeX) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Filtered Output Signal (Solid purple)
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = scopeX; x < scopeX + scopeW; x++) {
      const timeVal = t + ((x - scopeX) / scopeW) * 0.03;
      const y = scopeMidY - Math.sin(2 * Math.PI * testFreq * timeVal * 0.05) * (probeMag * 40);
      if (x === scopeX) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText('┄ Input Test Tone', scopeX + 14, plotY + 20);
    ctx.fillStyle = '#c084fc';
    ctx.fillText('— Filtered Output', scopeX + 160, plotY + 20);
  }
}

// ---------------------------------------------------------------------------
// 5. RF TRANSMISSION LINE & TEM STANDING WAVE RENDERER
// ---------------------------------------------------------------------------
export interface TransmissionLineParams {
  loadImpedance: number; // ZL
  lineImpedance: number; // Z0
  frequency: number; // MHz
}

export function renderTransmissionLine(rc: RenderContext, p: TransmissionLineParams) {
  const { ctx, w, h, t } = rc;
  const { loadImpedance, lineImpedance, frequency } = p;

  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('RF TRANSMISSION LINE • TEM PROPAGATION & VOLTAGE STANDING WAVE RATIO (VSWR)', 18, 22);

  const ZL = loadImpedance;
  const Z0 = lineImpedance;
  const gamma = (ZL - Z0) / (ZL + Z0);
  const absGamma = Math.abs(gamma);
  const vswr = (1 + absGamma) / Math.max(0.001, 1 - absGamma);

  const midY = h * 0.5;
  const lineStart = 45;
  const lineEnd = w - 45;
  const lineW = lineEnd - lineStart;

  // Waveguide Boundary Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(lineStart, midY - 60, lineW, 120);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(lineStart, midY - 60, lineW, 120);

  // Center Conductor Line
  ctx.strokeStyle = '#475569';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(lineStart, midY);
  ctx.lineTo(lineEnd, midY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Forward Wave (Ghost Cyan)
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = 0; x <= lineW; x++) {
    const pos = (x / lineW) * 8 * Math.PI;
    const inc = Math.sin(pos - t * 6);
    const y = midY - inc * 35;
    if (x === 0) ctx.moveTo(lineStart + x, y);
    else ctx.lineTo(lineStart + x, y);
  }
  ctx.stroke();

  // Net Standing Wave (Solid Sky Blue)
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let x = 0; x <= lineW; x++) {
    const pos = (x / lineW) * 8 * Math.PI;
    const inc = Math.sin(pos - t * 6);
    const ref = gamma * Math.sin(pos + t * 6);
    const y = midY - (inc + ref) * 35;
    if (x === 0) ctx.moveTo(lineStart + x, y);
    else ctx.lineTo(lineStart + x, y);
  }
  ctx.stroke();

  // Load Termination Symbol at Far Right
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(lineEnd - 6, midY - 25, 12, 50);
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#ef4444';
  ctx.fillText(`Z_L: ${ZL}Ω`, lineEnd - 35, midY - 35);

  // VSWR Metric Overlay
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = vswr > 2 ? '#ef4444' : '#10b981';
  ctx.fillText(`VSWR = ${vswr.toFixed(2)}:1 | |Γ| = ${absGamma.toFixed(3)}`, lineStart + 15, midY - 70);
}
