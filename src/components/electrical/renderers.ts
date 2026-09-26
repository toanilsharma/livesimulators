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

