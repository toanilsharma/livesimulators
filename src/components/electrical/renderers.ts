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

// ---------------------------------------------------------------------------
// 6. OPERATIONAL AMPLIFIER (OP-AMP) CIRCUITS RENDERER
// ---------------------------------------------------------------------------
export interface OpAmpParams {
  config: number; // 0=inverting, 1=non-inverting, 2=integrator, 3=differentiator
  rf: number; // kOhm
  rin: number; // kOhm
  vin: number; // V
  freq: number; // Hz
  vsupply: number; // V
}

export function renderOpAmp(rc: RenderContext, p: OpAmpParams) {
  const { ctx, w, h, t } = rc;
  const config = Math.round(p.config || 0);
  const Rf = (p.rf || 10) * 1e3;
  const Rin = (p.rin || 2) * 1e3;
  const Vin = p.vin || 2.0;
  const freq = p.freq || 1000;
  const Vsupply = p.vsupply || 15.0;

  const vRail = Vsupply - 1.2;
  const omega = 2 * Math.PI * freq;
  let gain = 1.0;
  if (config === 0) gain = -Rf / Rin;
  else if (config === 1) gain = 1.0 + Rf / Rin;
  else if (config === 2) gain = 1.0 / (omega * Rin * 10e-9);
  else gain = omega * Rf * 10e-9;

  const vOutPeakUnclipped = Math.abs(gain) * Vin;
  const isSaturated = vOutPeakUnclipped >= vRail;
  const vOutPeak = Math.min(vRail, vOutPeakUnclipped);

  const configNames = ['Inverting Amplifier', 'Non-Inverting Amplifier', 'Active Integrator', 'Active Differentiator'];

  // Background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, w, h);

  // Divide canvas into Left: Schematic, Right: Oscilloscope
  const splitX = Math.floor(w * 0.46);

  // --- LEFT: SCHEMATIC ---
  ctx.save();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.strokeRect(12, 12, splitX - 24, h - 24);

  // Title
  ctx.font = 'bold 12px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(configNames[config].toUpperCase(), 24, 34);
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('ANALOG ACTIVE OP-AMP KERNEL', 24, 48);

  // Op-Amp Triangle coordinates
  const triX = splitX * 0.58;
  const triY = h * 0.52;
  const triW = 80;
  const triH = 90;

  // Triangle body
  ctx.strokeStyle = '#38bdf8';
  ctx.fillStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(triX - triW / 2, triY - triH / 2);
  ctx.lineTo(triX - triW / 2, triY + triH / 2);
  ctx.lineTo(triX + triW / 2, triY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inverting (-) and Non-inverting (+) text
  ctx.font = 'bold 16px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f87171';
  ctx.fillText('–', triX - triW / 2 + 10, triY - 14);
  ctx.fillStyle = '#34d399';
  ctx.fillText('+', triX - triW / 2 + 10, triY + 24);

  // Power rails (+Vcc, -Vee)
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(triX, triY - triH / 4 - 6);
  ctx.lineTo(triX, triY - triH / 2 - 20);
  ctx.moveTo(triX, triY + triH / 4 + 6);
  ctx.lineTo(triX, triY + triH / 2 + 20);
  ctx.stroke();
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#ef4444';
  ctx.fillText(`+${Vsupply}V`, triX - 12, triY - triH / 2 - 24);
  ctx.fillStyle = '#3b82f6';
  ctx.fillText(`-${Vsupply}V`, triX - 12, triY + triH / 2 + 32);

  // Terminal pins
  const invPinY = triY - 18;
  const nonPinY = triY + 18;
  const pinStartX = triX - triW / 2;
  const outPinX = triX + triW / 2;

  // Output wire
  ctx.strokeStyle = isSaturated ? '#ef4444' : '#06b6d4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(outPinX, triY);
  ctx.lineTo(splitX - 30, triY);
  ctx.stroke();
  ctx.fillStyle = isSaturated ? '#ef4444' : '#06b6d4';
  ctx.beginPath();
  ctx.arc(splitX - 30, triY, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillText(`Vout`, splitX - 25, triY - 6);

  // Circuit Wiring based on config
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.8;

  if (config === 0 || config === 2 || config === 3) {
    // Inverting / Integrator / Differentiator: Non-inverting (+) connected to GND
    ctx.beginPath();
    ctx.moveTo(pinStartX, nonPinY);
    ctx.lineTo(pinStartX - 35, nonPinY);
    ctx.lineTo(pinStartX - 35, nonPinY + 30);
    ctx.stroke();
    // GND symbol
    const gX = pinStartX - 35;
    const gY = nonPinY + 30;
    ctx.beginPath();
    ctx.moveTo(gX - 10, gY); ctx.lineTo(gX + 10, gY);
    ctx.moveTo(gX - 6, gY + 3); ctx.lineTo(gX + 6, gY + 3);
    ctx.moveTo(gX - 2, gY + 6); ctx.lineTo(gX + 2, gY + 6);
    ctx.stroke();

    // Input branch to (-)
    const inJuncX = pinStartX - 60;
    ctx.beginPath();
    ctx.moveTo(pinStartX, invPinY);
    ctx.lineTo(inJuncX, invPinY);
    ctx.stroke();

    // Input Component (Rin or Cin)
    ctx.beginPath();
    ctx.moveTo(inJuncX, invPinY);
    ctx.lineTo(inJuncX - 60, invPinY);
    ctx.stroke();
    // Box
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(inJuncX - 48, invPinY - 10, 36, 20);
    ctx.strokeRect(inJuncX - 48, invPinY - 10, 36, 20);
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(config === 3 ? '10nF' : `${(Rin / 1e3).toFixed(1)}k`, inJuncX - 44, invPinY + 4);

    // AC Vin source
    const srcX = inJuncX - 85;
    ctx.beginPath();
    ctx.moveTo(inJuncX - 60, invPinY);
    ctx.lineTo(srcX, invPinY);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(srcX - 12, invPinY, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('~', srcX - 16, invPinY + 4);
    ctx.fillText(`Vin ${Vin}V`, srcX - 35, invPinY - 18);

    // Feedback Loop (above triangle)
    const fbTopY = triY - triH / 2 - 35;
    const fbOutX = outPinX + 25;
    ctx.beginPath();
    ctx.moveTo(inJuncX, invPinY);
    ctx.lineTo(inJuncX, fbTopY);
    ctx.lineTo(fbOutX, fbTopY);
    ctx.lineTo(fbOutX, triY);
    ctx.stroke();
    // Feedback Component (Rf or Cf)
    const fbCompX = (inJuncX + fbOutX) / 2;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(fbCompX - 22, fbTopY - 10, 44, 20);
    ctx.strokeRect(fbCompX - 22, fbTopY - 10, 44, 20);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(config === 2 ? '10nF (Cf)' : `${(Rf / 1e3).toFixed(0)}k (Rf)`, fbCompX - 18, fbTopY + 4);

    // Virtual ground label
    ctx.font = 'bold 9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#a855f7';
    ctx.fillText('V_– ≈ 0V (Virtual GND)', inJuncX - 20, invPinY - 8);
  } else {
    // Non-inverting amplifier
    // Vin connected to (+)
    ctx.beginPath();
    ctx.moveTo(pinStartX, nonPinY);
    ctx.lineTo(pinStartX - 60, nonPinY);
    ctx.stroke();
    const srcX = pinStartX - 80;
    ctx.beginPath();
    ctx.arc(srcX, nonPinY, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('~', srcX - 4, nonPinY + 4);
    ctx.fillText(`Vin ${Vin}V`, srcX - 25, nonPinY - 18);

    // Feedback network to (-)
    const fbNodeX = pinStartX - 40;
    const fbTopY = triY - triH / 2 - 35;
    const fbOutX = outPinX + 25;
    ctx.beginPath();
    ctx.moveTo(pinStartX, invPinY);
    ctx.lineTo(fbNodeX, invPinY);
    ctx.lineTo(fbNodeX, fbTopY);
    ctx.lineTo(fbOutX, fbTopY);
    ctx.lineTo(fbOutX, triY);
    ctx.stroke();

    // Rf box
    const fbCompX = (fbNodeX + fbOutX) / 2;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(fbCompX - 22, fbTopY - 10, 44, 20);
    ctx.strokeRect(fbCompX - 22, fbTopY - 10, 44, 20);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${(Rf / 1e3).toFixed(0)}k (Rf)`, fbCompX - 18, fbTopY + 4);

    // Rin from (-) down to GND
    const gndY = triY + 50;
    ctx.beginPath();
    ctx.moveTo(fbNodeX, invPinY);
    ctx.lineTo(fbNodeX, gndY);
    ctx.stroke();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(fbNodeX - 12, (invPinY + gndY) / 2 - 12, 24, 24);
    ctx.strokeRect(fbNodeX - 12, (invPinY + gndY) / 2 - 12, 24, 24);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${(Rin / 1e3).toFixed(1)}k`, fbNodeX - 10, (invPinY + gndY) / 2 + 4);
  }
  ctx.restore();

  // --- RIGHT: DUAL-TRACE OSCILLOSCOPE ---
  ctx.save();
  const oscX = splitX + 8;
  const oscY = 12;
  const oscW = w - splitX - 20;
  const oscH = h - 24;

  ctx.fillStyle = '#020617';
  ctx.fillRect(oscX, oscY, oscW, oscH);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(oscX, oscY, oscW, oscH);

  // CRT Scope Grid
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
  ctx.lineWidth = 1;
  const gridDivsX = 10;
  const gridDivsY = 8;
  for (let gx = 1; gx < gridDivsX; gx++) {
    const x = oscX + (gx / gridDivsX) * oscW;
    ctx.beginPath();
    ctx.moveTo(x, oscY);
    ctx.lineTo(x, oscY + oscH);
    ctx.stroke();
  }
  for (let gy = 1; gy < gridDivsY; gy++) {
    const y = oscY + (gy / gridDivsY) * oscH;
    ctx.beginPath();
    ctx.moveTo(oscX, y);
    ctx.lineTo(oscX + oscW, y);
    ctx.stroke();
  }

  // Center axes
  const midY = oscY + oscH / 2;
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.7)';
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(oscX, midY); ctx.lineTo(oscX + oscW, midY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Rail Clipping Lines
  const vScale = (oscH * 0.4) / (Vsupply + 2);
  const railTopY = midY - vRail * vScale;
  const railBotY = midY + vRail * vScale;
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(oscX, railTopY); ctx.lineTo(oscX + oscW, railTopY);
  ctx.moveTo(oscX, railBotY); ctx.lineTo(oscX + oscW, railBotY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#ef4444';
  ctx.fillText(`+V_SAT (+${vRail.toFixed(1)}V)`, oscX + 10, railTopY - 4);
  ctx.fillText(`-V_SAT (-${vRail.toFixed(1)}V)`, oscX + 10, railBotY + 12);

  // Waveform 1: Vin (Amber #f59e0b)
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const pts = 120;
  for (let i = 0; i <= pts; i++) {
    const phase = (i / pts) * 4 * Math.PI - t * 4;
    const v = Vin * Math.sin(phase);
    const x = oscX + (i / pts) * oscW;
    const y = midY - v * vScale;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Waveform 2: Vout (Cyan #06b6d4, Clipped in Red if saturated)
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= pts; i++) {
    const phase = (i / pts) * 4 * Math.PI - t * 4;
    let vOut = 0;
    if (config === 0) vOut = -(Rf / Rin) * Vin * Math.sin(phase);
    else if (config === 1) vOut = (1 + Rf / Rin) * Vin * Math.sin(phase);
    else if (config === 2) vOut = -vOutPeakUnclipped * Math.cos(phase);
    else vOut = vOutPeakUnclipped * Math.cos(phase);

    // Apply rail saturation clipping
    vOut = Math.max(-vRail, Math.min(vRail, vOut));
    const x = oscX + (i / pts) * oscW;
    const y = midY - vOut * vScale;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = isSaturated ? '#f43f5e' : '#06b6d4';
  ctx.stroke();

  // Legend & Telemetry box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.fillRect(oscX + 10, oscY + 10, oscW - 20, 36);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(oscX + 10, oscY + 10, oscW - 20, 36);

  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`CH1 (Amber): Vin = ${Vin.toFixed(1)} Vpk`, oscX + 20, oscY + 24);
  ctx.fillStyle = isSaturated ? '#f43f5e' : '#06b6d4';
  ctx.fillText(`CH2: Vout = ${vOutPeak.toFixed(2)} Vpk | Av = ${gain.toFixed(2)}`, oscX + 20, oscY + 38);

  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = isSaturated ? '#ef4444' : '#10b981';
  ctx.fillText(isSaturated ? '⚠ RAIL SATURATION CLIPPING' : '✓ LINEAR ACTIVE MODE', oscX + oscW - 210, oscY + 28);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 7. RC & RL TRANSIENT RESPONSE RENDERER
// ---------------------------------------------------------------------------
export interface RcTransientParams {
  circuitType: number; // 0=RC, 1=RL
  resistance: number; // Ohm
  reactanceVal: number; // uF for RC, mH for RL
  vSource: number; // V
  switchingFreq: number; // Hz
}

export function renderRcTransient(rc: RenderContext, p: RcTransientParams) {
  const { ctx, w, h, t } = rc;
  const circuitType = Math.round(p.circuitType || 0);
  const R = p.resistance || 100;
  const reactanceVal = p.reactanceVal || 100;
  const V0 = p.vSource || 10;
  const f_sw = p.switchingFreq || 10;

  let tau = 0;
  if (circuitType === 0) tau = R * (reactanceVal * 1e-6);
  else tau = (reactanceVal * 1e-3) / R;

  const period = 1.0 / f_sw;
  const halfT = period / 2.0;
  const cycleTime = (t * 0.4) % period;
  const isCharging = cycleTime < halfT;
  const locT = isCharging ? cycleTime : cycleTime - halfT;
  const expTerm = Math.exp(-locT / Math.max(1e-5, tau));

  // Background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, w, h);

  const splitX = Math.floor(w * 0.44);

  // --- LEFT: CIRCUIT SCHEMATIC ---
  ctx.save();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.strokeRect(12, 12, splitX - 24, h - 24);

  // Title
  ctx.font = 'bold 12px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(circuitType === 0 ? 'RC CAPACITIVE TRANSIENT' : 'RL INDUCTIVE TRANSIENT', 24, 34);
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('FIRST-ORDER ODE SWITCHING DYNAMICS', 24, 48);

  const cx = splitX * 0.48;
  const cy = h * 0.52;

  // Circuit loop
  const loopW = 160;
  const loopH = 130;
  const leftX = cx - loopW / 2;
  const rightX = cx + loopW / 2;
  const topY = cy - loopH / 2;
  const botY = cy + loopH / 2;

  // Bottom conductor to GND
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leftX, botY);
  ctx.lineTo(rightX, botY);
  ctx.stroke();

  // DC Source on left
  ctx.beginPath();
  ctx.moveTo(leftX, botY);
  ctx.lineTo(leftX, cy + 20);
  ctx.moveTo(leftX, cy - 20);
  ctx.lineTo(leftX, topY);
  ctx.stroke();

  // Battery symbol
  ctx.strokeStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(leftX - 16, cy - 8); ctx.lineTo(leftX + 16, cy - 8); // + plate
  ctx.moveTo(leftX - 9, cy + 8); ctx.lineTo(leftX + 9, cy + 8);   // - plate
  ctx.stroke();
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`+${V0}V`, leftX - 45, cy + 4);

  // SPDT Switch on top left
  const swX1 = leftX + 25;
  const swX2 = leftX + 60;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (isCharging) {
    ctx.moveTo(swX1, topY);
    ctx.lineTo(swX2, topY); // closed connection to V0
  } else {
    ctx.moveTo(swX1, topY);
    ctx.lineTo(swX2, topY - 18); // open to ground discharge
  }
  ctx.stroke();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(swX1, topY, 4, 0, Math.PI * 2);
  ctx.arc(swX2, topY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillText(isCharging ? 'STATE: CHARGE' : 'STATE: DISCHARGE', leftX + 10, topY - 24);

  // Resistor R in top branch
  const rX = cx + 15;
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(swX2, topY);
  ctx.lineTo(rX - 25, topY);
  ctx.moveTo(rX + 25, topY);
  ctx.lineTo(rightX, topY);
  ctx.stroke();

  // Resistor symbol box
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(rX - 22, topY - 12, 44, 24);
  ctx.strokeStyle = '#f59e0b';
  ctx.strokeRect(rX - 22, topY - 12, 44, 24);
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillText(`${R}Ω`, rX - 14, topY + 4);

  // Right vertical branch (Capacitor or Inductor)
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(rightX, topY);
  ctx.lineTo(rightX, cy - 20);
  ctx.moveTo(rightX, cy + 20);
  ctx.lineTo(rightX, botY);
  ctx.stroke();

  if (circuitType === 0) {
    // Capacitor parallel plates
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(rightX - 16, cy - 8); ctx.lineTo(rightX + 16, cy - 8);
    ctx.moveTo(rightX - 16, cy + 8); ctx.lineTo(rightX + 16, cy + 8);
    ctx.stroke();
    ctx.font = 'bold 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText(`${reactanceVal}µF`, rightX + 18, cy + 4);

    // Charge glow
    const qLevel = isCharging ? (1 - expTerm) : expTerm;
    ctx.fillStyle = `rgba(6, 182, 212, ${qLevel * 0.4})`;
    ctx.fillRect(rightX - 14, cy - 6, 28, 12);
  } else {
    // Inductor coils
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let c = 0; c < 4; c++) {
      const coilY = cy - 16 + c * 10;
      ctx.arc(rightX, coilY, 6, Math.PI * 1.5, Math.PI * 0.5, false);
    }
    ctx.stroke();
    ctx.font = 'bold 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`${reactanceVal}mH`, rightX + 18, cy + 4);
  }
  ctx.restore();

  // --- RIGHT: TRANSIENT OSCILLOSCOPE ---
  ctx.save();
  const oscX = splitX + 8;
  const oscY = 12;
  const oscW = w - splitX - 20;
  const oscH = h - 24;

  ctx.fillStyle = '#020617';
  ctx.fillRect(oscX, oscY, oscW, oscH);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(oscX, oscY, oscW, oscH);

  // Grid
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
  ctx.lineWidth = 1;
  for (let gx = 1; gx < 10; gx++) {
    const x = oscX + (gx / 10) * oscW;
    ctx.beginPath(); ctx.moveTo(x, oscY); ctx.lineTo(x, oscY + oscH); ctx.stroke();
  }
  for (let gy = 1; gy < 8; gy++) {
    const y = oscY + (gy / 8) * oscH;
    ctx.beginPath(); ctx.moveTo(oscX, y); ctx.lineTo(oscX + oscW, y); ctx.stroke();
  }

  const pBot = oscY + oscH - 35;
  const pTop = oscY + 45;
  const pHeight = pBot - pTop;

  // Waveform plot
  const pts = 140;
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= pts; i++) {
    const normT = (i / pts) * period;
    const inCharge = normT < halfT;
    const lT = inCharge ? normT : normT - halfT;
    const factor = Math.exp(-lT / Math.max(1e-5, tau));
    const val = inCharge ? V0 * (1 - factor) : V0 * factor;

    const x = oscX + (i / pts) * oscW;
    const y = pBot - (val / (V0 * 1.15)) * pHeight;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Current Waveform (Emerald #10b981)
  const Imax = V0 / R;
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let i = 0; i <= pts; i++) {
    const normT = (i / pts) * period;
    const inCharge = normT < halfT;
    const lT = inCharge ? normT : normT - halfT;
    const factor = Math.exp(-lT / Math.max(1e-5, tau));
    const curVal = inCharge ? Imax * factor : -Imax * factor;

    const x = oscX + (i / pts) * oscW;
    const y = pBot - ((curVal + Imax) / (2.3 * Imax)) * pHeight;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 63.2% tau marker line
  const tauX = oscX + (tau / period) * oscW;
  if (tauX < oscX + oscW * 0.48) {
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(tauX, pTop); ctx.lineTo(tauX, pBot);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`τ = ${(tau * 1e3).toFixed(2)}ms (63.2%)`, tauX + 4, pTop + 14);
  }

  // Active time probe line
  const curProbeX = oscX + (cycleTime / period) * oscW;
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(curProbeX, pTop);
  ctx.lineTo(curProbeX, pBot);
  ctx.stroke();

  // Header telemetry bar
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(oscX + 10, oscY + 8, oscW - 20, 32);
  ctx.strokeRect(oscX + 10, oscY + 8, oscW - 20, 32);
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`V(t) [Cyan]: ${(circuitType === 0 ? (isCharging ? V0 * (1 - expTerm) : V0 * expTerm) : 0).toFixed(2)} V`, oscX + 20, oscY + 28);
  ctx.fillStyle = '#10b981';
  ctx.fillText(`i(t) [Emerald]: ${(Imax * expTerm * 1e3).toFixed(1)} mA`, oscX + 220, oscY + 28);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`τ = ${(tau * 1e3).toFixed(2)} ms`, oscX + oscW - 140, oscY + 28);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 8. TRANSFORMER OPEN-CIRCUIT & SHORT-CIRCUIT TEST RENDERER
// ---------------------------------------------------------------------------
export interface TransformerTestParams {
  voc?: number;
  ioc?: number;
  poc?: number;
  vsc?: number;
  isc?: number;
  psc?: number;
  loadPowerFactor?: number;
  ratedKva?: number;
  vPrimary?: number;
  vSecondary?: number;
  pCoreOc?: number;
  iOcPercent?: number;
  pCopperSc?: number;
  vScPercent?: number;
  loadFraction?: number;
  powerFactor?: number;
}

export function renderTransformerTest(rc: RenderContext, p: TransformerTestParams) {
  const { ctx, w, h, t } = rc;
  const Voc = p.voc || p.vPrimary || 230;
  const Ioc = p.ioc || 1.2;
  const Poc = p.poc || p.pCoreOc || 85;
  const Vsc = p.vsc || 24;
  const Isc = p.isc || 10;
  const Psc = p.psc || p.pCopperSc || 140;
  const pf = p.loadPowerFactor !== undefined ? p.loadPowerFactor : (p.powerFactor !== undefined ? p.powerFactor : 0.85);
  const xLoad = p.loadFraction !== undefined ? p.loadFraction : 1.0;

  const S_rated = (p.ratedKva ? p.ratedKva * 1e3 : Voc * Isc);
  const V1 = Voc;
  const V2 = p.vSecondary || Math.round(Voc / 2);
  const I1_rated = Isc;
  const Req = Psc / Math.max(1e-3, Isc * Isc);
  const Zeq = Vsc / Math.max(1e-3, Isc);
  const Xeq = Math.sqrt(Math.max(0, Zeq * Zeq - Req * Req));

  const cosPhi0 = Math.min(1.0, Poc / Math.max(1, Voc * Ioc));
  const Ic = Ioc * cosPhi0;
  const Im = Ioc * Math.sqrt(Math.max(0, 1 - cosPhi0 * cosPhi0));
  const Rc_calc = Voc / Math.max(1e-3, Ic);
  const Xm_calc = Voc / Math.max(1e-3, Im);

  const sinPhi = Math.sqrt(Math.max(0, 1.0 - pf * pf));
  const Pout = xLoad * S_rated * pf;
  const Pcu = xLoad * xLoad * Psc;
  const eta = (Pout / Math.max(1, Pout + Poc + Pcu)) * 100.0;
  const vReg = ((xLoad * (I1_rated * Req * pf + I1_rated * Xeq * sinPhi)) / V1) * 100.0;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, w, h);

  const splitX = Math.floor(w * 0.48);

  // Left: Transformer Core & Winding Schematic
  ctx.save();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.strokeRect(12, 12, splitX - 24, h - 24);

  ctx.font = 'bold 12px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText('TRANSFORMER OC / SC EQUIVALENT CIRCUIT', 24, 34);
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('IEEE C57.12 / IEC 60076 TESTING STANDARD', 24, 48);

  // Laminated Core
  const coreX = splitX * 0.5;
  const coreY = h * 0.50;
  const coreW = 140;
  const coreH = 150;
  const limbW = 28;

  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(coreX - coreW / 2, coreY - coreH / 2, coreW, coreH);
  ctx.fillRect(coreX - coreW / 2, coreY - coreH / 2, coreW, coreH);

  // Inner window
  ctx.fillStyle = '#090d16';
  ctx.fillRect(coreX - coreW / 2 + limbW, coreY - coreH / 2 + limbW, coreW - 2 * limbW, coreH - 2 * limbW);
  ctx.strokeRect(coreX - coreW / 2 + limbW, coreY - coreH / 2 + limbW, coreW - 2 * limbW, coreH - 2 * limbW);

  // Animated Magnetic Flux (Pulsing dashed loop inside core)
  const fluxAlpha = 0.4 + 0.4 * Math.sin(t * 5);
  ctx.strokeStyle = `rgba(6, 182, 212, ${fluxAlpha})`;
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.lineDashOffset = -t * 20;
  const fX = coreX - coreW / 2 + limbW / 2;
  const fY = coreY - coreH / 2 + limbW / 2;
  const fW = coreW - limbW;
  const fH = coreH - limbW;
  ctx.strokeRect(fX, fY, fW, fH);
  ctx.setLineDash([]);

  // Primary Winding (Copper Coils on left limb)
  const pLimbX = coreX - coreW / 2;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  for (let c = 0; c < 8; c++) {
    const yC = coreY - coreH / 2 + limbW + 8 + c * 11;
    ctx.beginPath();
    ctx.moveTo(pLimbX - 8, yC);
    ctx.lineTo(pLimbX + limbW + 8, yC);
    ctx.stroke();
  }
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`Primary: ${V1}V`, pLimbX - 45, coreY - coreH / 2 - 8);

  // Secondary Winding (Cyan Coils on right limb)
  const sLimbX = coreX + coreW / 2 - limbW;
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 5;
  for (let c = 0; c < 5; c++) {
    const yC = coreY - coreH / 2 + limbW + 15 + c * 16;
    ctx.beginPath();
    ctx.moveTo(sLimbX - 8, yC);
    ctx.lineTo(sLimbX + limbW + 8, yC);
    ctx.stroke();
  }
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`Secondary: ${V2}V`, sLimbX - 10, coreY - coreH / 2 - 8);

  // Voltmeter / Wattmeter Telemetry below
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(24, h - 68, splitX - 48, 44);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(24, h - 68, splitX - 48, 44);
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`OC TEST: Poc = ${Poc} W (Core Loss) | I0 = ${Ioc.toFixed(2)} A (Rc = ${Rc_calc.toFixed(0)} Ω, Xm = ${Xm_calc.toFixed(0)} Ω)`, 34, h - 50);
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`SC TEST: Psc = ${Psc} W (Cu Loss) | Req = ${Req.toFixed(2)} Ω, Xeq = ${Xeq.toFixed(2)} Ω`, 34, h - 34);

  ctx.restore();

  // Right: Efficiency & Voltage Regulation Curves
  ctx.save();
  const rightX = splitX + 8;
  const rightW = w - splitX - 20;

  // Top Graph: Efficiency vs Load Factor x (0 to 1.3)
  const g1Y = 12;
  const g1H = Math.floor((h - 32) * 0.48);
  ctx.fillStyle = '#020617';
  ctx.fillRect(rightX, g1Y, rightW, g1H);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(rightX, g1Y, rightW, g1H);

  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#10b981';
  ctx.fillText('EFFICIENCY CURVE η vs LOAD FACTOR x', rightX + 12, g1Y + 20);

  const plot1Left = rightX + 45;
  const plot1Right = rightX + rightW - 20;
  const plot1Top = g1Y + 32;
  const plot1Bot = g1Y + g1H - 24;

  ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
  ctx.beginPath();
  ctx.moveTo(plot1Left, plot1Top); ctx.lineTo(plot1Left, plot1Bot);
  ctx.lineTo(plot1Right, plot1Bot);
  ctx.stroke();

  // Efficiency curve plot
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const eSteps = 50;
  for (let i = 0; i <= eSteps; i++) {
    const xF = 0.05 + (i / eSteps) * 1.25;
    const pO = xF * S_rated * pf;
    const pC = xF * xF * Psc;
    const e = (pO / (pO + Poc + pC)) * 100.0;
    const sx = plot1Left + (xF / 1.3) * (plot1Right - plot1Left);
    const sy = plot1Bot - ((e - 85) / 15) * (plot1Bot - plot1Top);
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, Math.max(plot1Top, Math.min(plot1Bot, sy)));
  }
  ctx.stroke();

  // Operating Point Dot on Efficiency
  const curEtaX = plot1Left + (xLoad / 1.3) * (plot1Right - plot1Left);
  const curEtaY = plot1Bot - ((eta - 85) / 15) * (plot1Bot - plot1Top);
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(curEtaX, Math.max(plot1Top, Math.min(plot1Bot, curEtaY)), 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillText(`η=${eta.toFixed(1)}%`, curEtaX + 8, curEtaY - 4);

  // Bottom Graph: Voltage Regulation %VR vs Load Factor
  const g2Y = g1Y + g1H + 8;
  const g2H = h - 20 - g2Y;
  ctx.fillStyle = '#020617';
  ctx.fillRect(rightX, g2Y, rightW, g2H);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(rightX, g2Y, rightW, g2H);

  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('VOLTAGE REGULATION %VR (IEC / IEEE STANDARD)', rightX + 12, g2Y + 20);

  const plot2Left = rightX + 45;
  const plot2Right = rightX + rightW - 20;
  const plot2Top = g2Y + 32;
  const plot2Bot = g2Y + g2H - 24;

  ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
  ctx.beginPath();
  ctx.moveTo(plot2Left, plot2Top); ctx.lineTo(plot2Left, plot2Bot);
  ctx.lineTo(plot2Right, plot2Bot);
  ctx.stroke();

  // %VR Line
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= eSteps; i++) {
    const xF = (i / eSteps) * 1.3;
    const vrVal = ((xF * (I1_rated * Req * pf + I1_rated * Xeq * sinPhi)) / V1) * 100.0;
    const sx = plot2Left + (xF / 1.3) * (plot2Right - plot2Left);
    const sy = plot2Bot - (vrVal / 8.0) * (plot2Bot - plot2Top);
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, Math.max(plot2Top, Math.min(plot2Bot, sy)));
  }
  ctx.stroke();

  // Current VR Dot
  const curVrX = plot2Left + (xLoad / 1.3) * (plot2Right - plot2Left);
  const curVrY = plot2Bot - (vReg / 8.0) * (plot2Bot - plot2Top);
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(curVrX, Math.max(plot2Top, Math.min(plot2Bot, curVrY)), 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillText(`VR=${vReg.toFixed(2)}%`, curVrX + 8, curVrY - 4);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 9. DC MOTOR SPEED CONTROL & FLUX WEAKENING RENDERER
// ---------------------------------------------------------------------------
export interface DcMotorParams {
  armatureVoltage?: number;
  fieldCurrentRel?: number;
  extArmatureR?: number;
  loadTorque?: number;
  vArmature?: number;
  iField?: number;
  rArmature?: number;
  fluxConstant?: number;
}

export function renderDcMotor(rc: RenderContext, p: DcMotorParams) {
  const { ctx, w, h, t } = rc;
  const Va = p.armatureVoltage || p.vArmature || 220;
  const phiRel = p.fieldCurrentRel !== undefined ? p.fieldCurrentRel : (p.iField !== undefined ? p.iField : 1.0);
  const TL = p.loadTorque !== undefined ? p.loadTorque : 25;
  const Rext = p.extArmatureR || 0;
  const Ra = (p.rArmature || 0.6) + Rext;
  const kPhi = p.fluxConstant || 1.05;

  const phi = kPhi * phiRel;
  const Kt = phi;
  const Ke = Kt;
  const Ia = TL / Math.max(0.01, Kt);
  const Eb = Math.max(0, Va - Ia * Ra);
  const omega = Math.max(0, Eb / Math.max(0.01, Ke));
  const rpm = (omega * 60.0) / (2.0 * Math.PI);
  const Pmech = TL * omega;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, w, h);

  const splitX = Math.floor(w * 0.46);

  // Left: DC Motor Rotor & Commutator Animation
  ctx.save();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.strokeRect(12, 12, splitX - 24, h - 24);

  ctx.font = 'bold 12px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText('DC SHUNT MOTOR ELECTRODYNAMICS', 24, 34);
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('WARD-LEONARD & FIELD FLUX WEAKENING', 24, 48);

  const rotCenterX = splitX * 0.5;
  const rotCenterY = h * 0.48;
  const rotorRadius = 65;

  // Stator Field Poles (North on Left, South on Right)
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  // N Pole
  ctx.beginPath();
  ctx.arc(rotCenterX - 95, rotCenterY, 35, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.lineTo(rotCenterX - 110, rotCenterY);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.font = 'bold 14px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#ef4444';
  ctx.fillText('N', rotCenterX - 85, rotCenterY + 5);

  // S Pole
  ctx.beginPath();
  ctx.arc(rotCenterX + 95, rotCenterY, 35, Math.PI * 0.6, Math.PI * 1.4);
  ctx.lineTo(rotCenterX + 110, rotCenterY);
  ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('S', rotCenterX + 75, rotCenterY + 5);

  // Rotating Armature Core
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(rotCenterX, rotCenterY, rotorRadius, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Rotating Armature Slots & Conductors
  const rotAngle = t * (rpm / 60) * 2 * Math.PI * 0.15;
  const slots = 12;
  for (let s = 0; s < slots; s++) {
    const a = rotAngle + (s / slots) * 2 * Math.PI;
    const condX = rotCenterX + Math.cos(a) * (rotorRadius - 10);
    const condY = rotCenterY + Math.sin(a) * (rotorRadius - 10);
    ctx.fillStyle = s < 6 ? '#f59e0b' : '#06b6d4';
    ctx.beginPath();
    ctx.arc(condX, condY, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Commutator Segments & Carbon Brushes
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(rotCenterX, rotCenterY, 18, 0, Math.PI * 2);
  ctx.fill();
  // Brushes (Top and Bottom)
  ctx.fillStyle = '#64748b';
  ctx.fillRect(rotCenterX - 6, rotCenterY - 26, 12, 8);
  ctx.fillRect(rotCenterX - 6, rotCenterY + 18, 12, 8);

  // Telemetry HUD below
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(20, h - 56, splitX - 40, 36);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(20, h - 56, splitX - 40, 36);
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#10b981';
  ctx.fillText(`SPEED: ${rpm.toFixed(0)} RPM`, 30, h - 34);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`Ia: ${Ia.toFixed(1)} A`, 160, h - 34);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`Eb: ${Eb.toFixed(1)} V`, 250, h - 34);

  ctx.restore();

  // Right: Torque-Speed Curve (T vs N)
  ctx.save();
  const rightX = splitX + 8;
  const rightW = w - splitX - 20;
  const plotY = 12;
  const plotH = h - 24;

  ctx.fillStyle = '#020617';
  ctx.fillRect(rightX, plotY, rightW, plotH);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(rightX, plotY, rightW, plotH);

  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText('TORQUE-SPEED CHARACTERISTIC CURVE (N vs T)', rightX + 16, plotY + 24);

  const pLeft = rightX + 50;
  const pRight = rightX + rightW - 25;
  const pTop = plotY + 45;
  const pBot = plotY + plotH - 35;

  ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pLeft, pTop); ctx.lineTo(pLeft, pBot);
  ctx.lineTo(pRight, pBot);
  ctx.stroke();

  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('TORQUE T (Nm) →', pRight - 80, pBot + 20);
  ctx.fillText('SPEED N (RPM)', pLeft - 10, pTop - 12);

  const noLoadN = (Va / Math.max(0.01, Ke)) * (60.0 / (2.0 * Math.PI));
  const stallT = Kt * (Va / Ra);

  // Speed-Torque Linear drooping curve
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const maxPlotT = Math.max(100, TL * 2.2);
  for (let s = 0; s <= 40; s++) {
    const tVal = (s / 40) * maxPlotT;
    const nVal = Math.max(0, noLoadN * (1.0 - (tVal / stallT)));
    const sx = pLeft + (tVal / maxPlotT) * (pRight - pLeft);
    const sy = pBot - (nVal / (noLoadN * 1.15)) * (pBot - pTop);
    if (s === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, Math.max(pTop, Math.min(pBot, sy)));
  }
  ctx.stroke();

  // Operating Point Dot
  const opX = pLeft + (TL / maxPlotT) * (pRight - pLeft);
  const opY = pBot - (rpm / (noLoadN * 1.15)) * (pBot - pTop);
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(opX, Math.max(pTop, Math.min(pBot, opY)), 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText(`OPERATING POINT (${TL}Nm, ${rpm.toFixed(0)}RPM)`, opX - 50, opY - 12);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 10. 3-PHASE INDUCTION MOTOR TORQUE-SLIP RENDERER
// ---------------------------------------------------------------------------
export interface InductionMotorParams {
  appliedVoltage: number;
  poles: number;
  rStator: number;
  xStator: number;
  rRotor: number;
  xRotor: number;
  slip: number;
}

export function renderInductionMotor(rc: RenderContext, p: InductionMotorParams) {
  const { ctx, w, h } = rc;
  const VL = p.appliedVoltage || 400;
  const P = Math.round(p.poles || 4);
  const R1 = p.rStator || 0.4;
  const X1 = p.xStator || 0.8;
  const R2 = p.rRotor || 0.35;
  const X2 = p.xRotor || 0.75;
  const s = p.slip !== undefined ? p.slip : 0.04;

  const f = 50.0;
  const Ns = (120.0 * f) / P;
  const ws = (4.0 * Math.PI * f) / P;
  const V1ph = VL / Math.sqrt(3.0);
  const Xeq = X1 + X2;
  const sMax = R2 / Math.sqrt(R1 * R1 + Xeq * Xeq);
  const Tmax = (3.0 * V1ph * V1ph) / (2.0 * ws * (R1 + Math.sqrt(R1 * R1 + Xeq * Xeq)));

  const calcT = (slipVal: number) => {
    const r2Eff = R2 / Math.max(1e-4, slipVal);
    const i2 = V1ph / Math.sqrt(Math.pow(R1 + r2Eff, 2) + Xeq * Xeq);
    return (3.0 * i2 * i2 * r2Eff) / ws;
  };

  const Top = calcT(s);
  const Tstart = calcT(1.0);
  const Nr = Ns * (1.0 - s);

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, w, h);

  const plotLeft = 60;
  const plotRight = w - 40;
  const plotTop = 45;
  const plotBottom = h - 55;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  // Grid & Axes
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
  ctx.lineWidth = 1;
  ctx.strokeRect(plotLeft, plotTop, plotW, plotH);

  // Torque-Slip Curve
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 3;
  ctx.beginPath();
  const steps = 100;
  const maxPlotT = Tmax * 1.25;

  for (let i = 0; i <= steps; i++) {
    const slipStep = (i / steps); // 0 to 1
    const tVal = calcT(slipStep);
    const sx = plotLeft + slipStep * plotW;
    const sy = plotBottom - (tVal / maxPlotT) * plotH;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // Peak Breakdown Torque Marker
  const tmaxSx = plotLeft + sMax * plotW;
  const tmaxSy = plotBottom - (Tmax / maxPlotT) * plotH;
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(tmaxSx, tmaxSy, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText(`BREAKDOWN Tmax = ${Tmax.toFixed(0)}Nm (s = ${(sMax * 100).toFixed(0)}%)`, tmaxSx - 40, tmaxSy - 10);

  // Starting Torque Marker (s = 1.0)
  const tstartSx = plotRight;
  const tstartSy = plotBottom - (Tstart / maxPlotT) * plotH;
  ctx.fillStyle = '#ec4899';
  ctx.beginPath();
  ctx.arc(tstartSx, tstartSy, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillText(`Tstart = ${Tstart.toFixed(0)}Nm`, tstartSx - 85, tstartSy + 16);

  // Active Operating Point
  const curSx = plotLeft + s * plotW;
  const curSy = plotBottom - (Top / maxPlotT) * plotH;
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(curSx, curSy, 6, 0, Math.PI * 2);
  ctx.fill();

  // Telemetry HUD Bar at top
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(plotLeft, 10, plotW, 30);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(plotLeft, 10, plotW, 30);

  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`ROTOR SPEED Nr = ${Nr.toFixed(0)} RPM (Ns = ${Ns.toFixed(0)})`, plotLeft + 15, 28);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`TORQUE = ${Top.toFixed(1)} Nm`, plotLeft + 300, 28);
  ctx.fillStyle = '#10b981';
  ctx.fillText(`SLIP s = ${(s * 100).toFixed(1)}%`, plotLeft + plotW - 140, 28);
}

// ---------------------------------------------------------------------------
// 11. SOLAR PV I-V & MAXIMUM POWER POINT TRACKER (MPPT) RENDERER
// ---------------------------------------------------------------------------
export interface SolarPvParams {
  irradiance: number;
  cellTemp: number;
  seriesCells: number;
  rSeries: number;
  rShunt: number;
}

export function renderSolarPv(rc: RenderContext, p: SolarPvParams) {
  const { ctx, w, h } = rc;
  const G = p.irradiance || 1000;
  const Tc = p.cellTemp !== undefined ? p.cellTemp : 25;
  const Ns = Math.round(p.seriesCells || 60);

  const Tk = Tc + 273.15;
  const Vt = (1.38e-23 * Tk) / 1.602e-19;
  const Iph = (9.2 + 0.0005 * (Tk - 298.15)) * (G / 1000.0);
  const I0 = 1.5e-9 * Math.pow(Tk / 298.15, 3);
  const Voc = Math.max(10, Ns * (0.65 - 0.0022 * (Tk - 298.15)) + Ns * Vt * Math.log(Math.max(1e-3, G / 1000.0)));

  const calcI = (v: number) => {
    const arg = Math.min(45, v / (Ns * 1.25 * Vt));
    return Math.max(0, Iph - I0 * (Math.exp(arg) - 1.0) - v / 300.0);
  };

  let Pmax = 0;
  let Vmpp = 0;
  let Impp = 0;
  const steps = 60;
  for (let s = 0; s <= steps; s++) {
    const v = (s / steps) * Voc;
    const i = calcI(v);
    const pow = v * i;
    if (pow > Pmax) {
      Pmax = pow;
      Vmpp = v;
      Impp = i;
    }
  }

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, w, h);

  const plotLeft = 55;
  const plotRight = w - 35;
  const plotTop = 45;
  const plotBottom = h - 45;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  // Grid
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
  ctx.strokeRect(plotLeft, plotTop, plotW, plotH);

  // Curve 1: Current vs Voltage (Cyan #06b6d4)
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let s = 0; s <= steps; s++) {
    const v = (s / steps) * Voc;
    const i = calcI(v);
    const sx = plotLeft + (v / Voc) * plotW;
    const sy = plotBottom - (i / (Iph * 1.15)) * plotH;
    if (s === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // Curve 2: Power vs Voltage (Amber #f59e0b)
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let s = 0; s <= steps; s++) {
    const v = (s / steps) * Voc;
    const i = calcI(v);
    const pow = v * i;
    const sx = plotLeft + (v / Voc) * plotW;
    const sy = plotBottom - (pow / (Pmax * 1.25)) * plotH;
    if (s === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // Maximum Power Point Marker
  const mppSx = plotLeft + (Vmpp / Voc) * plotW;
  const mppSy = plotBottom - (Pmax / (Pmax * 1.25)) * plotH;
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(mppSx, mppSy, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f43f5e';
  ctx.fillText(`MPPT: ${Pmax.toFixed(0)}W (${Vmpp.toFixed(1)}V, ${Impp.toFixed(1)}A)`, mppSx - 60, mppSy - 12);

  // Telemetry HUD Bar at top
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(plotLeft, 10, plotW, 30);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(plotLeft, 10, plotW, 30);

  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`IRRADIANCE G: ${G.toFixed(0)} W/m²`, plotLeft + 15, 28);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`CELL TEMP: ${Tc.toFixed(0)}°C`, plotLeft + 220, 28);
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`Voc: ${Voc.toFixed(1)}V | Isc: ${Iph.toFixed(2)}A`, plotLeft + 370, 28);
  ctx.fillStyle = '#10b981';
  ctx.fillText(`P_MPP: ${Pmax.toFixed(1)}W`, plotLeft + plotW - 130, 28);
}


