// High-Fidelity Canvas Renderers for Mechanical & Thermal Engineering Simulators
// Adheres strictly to ASME, ISO, AGMA, and Kinematic Standards

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  dt: number;
  t: number;
}

// ---------------------------------------------------------------------------
// 1. FOUR-BAR GRASHOF MECHANISM RENDERER
// ---------------------------------------------------------------------------
export interface FourBarParams {
  groundL: number; // mm (r1)
  crankR: number; // mm (r2)
  couplerL: number; // mm (r3)
  rockerL: number; // mm (r4)
  rpm: number;
  couplerTracerHistory?: Array<{ x: number; y: number }>;
}

export function renderFourBar(rc: RenderContext, p: FourBarParams) {
  const { ctx, w, h, t } = rc;
  const { groundL, crankR, couplerL, rockerL, rpm } = p;

  // Title / Watermark
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText('GRASHOF CRANK-ROCKER KINEMATICS • REVOLUTE BEARINGS & COUPLER PATH', 18, 22);

  const scale = Math.min(1.4, w / 480, h / 270);
  const originX = w * 0.28;
  const originY = h * 0.68;

  const theta2 = (t * (rpm * 2 * Math.PI) / 60) % (2 * Math.PI);

  const A = { x: originX, y: originY };
  const D = { x: originX + groundL * scale, y: originY };
  const B = { 
    x: A.x + crankR * scale * Math.cos(theta2), 
    y: A.y - crankR * scale * Math.sin(theta2) 
  };

  const distBD = Math.hypot(D.x - B.x, D.y - B.y) / scale;
  const angleBD = Math.atan2(D.y - B.y, D.x - B.x);
  const cosAngle = (rockerL * rockerL + distBD * distBD - couplerL * couplerL) / (2 * rockerL * distBD);
  const clampedCos = Math.max(-1, Math.min(1, cosAngle));
  const delta = Math.acos(clampedCos);
  const angleCD = angleBD - delta;

  const C = { 
    x: D.x - rockerL * scale * Math.cos(angleCD), 
    y: D.y - rockerL * scale * Math.sin(angleCD) 
  };

  // Coupler Midpoint P (Tracer point)
  const P = {
    x: (B.x + C.x) / 2 + Math.sin(theta2) * 20 * scale,
    y: (B.y + C.y) / 2 - Math.cos(theta2) * 20 * scale,
  };

  // Transmission Angle mu (angle between coupler and rocker)
  const angleCoupler = Math.atan2(C.y - B.y, C.x - B.x);
  const angleRocker = Math.atan2(C.y - D.y, C.x - D.x);
  let muDeg = Math.abs((angleCoupler - angleRocker) * (180 / Math.PI)) % 180;
  if (muDeg > 90) muDeg = 180 - muDeg;

  // 1. Draw Ground Frame (Fixed link AD)
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 8 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(A.x, A.y);
  ctx.lineTo(D.x, D.y);
  ctx.stroke();

  // Ground base hatched triangles
  const drawGroundSupport = (pt: { x: number; y: number }, label: string) => {
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    ctx.lineTo(pt.x - 14, pt.y + 18);
    ctx.lineTo(pt.x + 14, pt.y + 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pt.x - 18, pt.y + 18);
    ctx.lineTo(pt.x + 18, pt.y + 18);
    ctx.stroke();

    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(label, pt.x - 5, pt.y - 12);
  };

  drawGroundSupport(A, 'A (O₂)');
  drawGroundSupport(D, 'D (O₄)');

  // 2. Crank Orbit Circle (Ghost)
  ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(A.x, A.y, crankR * scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // 3. Coupler Curve Tracer Path (Fading ribbon)
  if (p.couplerTracerHistory) {
    p.couplerTracerHistory.push({ x: P.x, y: P.y });
    if (p.couplerTracerHistory.length > 180) {
      p.couplerTracerHistory.shift();
    }
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ec4899';
    ctx.shadowBlur = 8;
    for (let i = 0; i < p.couplerTracerHistory.length; i++) {
      const pt = p.couplerTracerHistory[i];
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // 4. Link 2: Crank (AB) - Cyan Metallic
  const crankGrad = ctx.createLinearGradient(A.x, A.y, B.x, B.y);
  crankGrad.addColorStop(0, '#0284c7');
  crankGrad.addColorStop(1, '#38bdf8');
  ctx.strokeStyle = crankGrad;
  ctx.lineWidth = 7 * scale;
  ctx.beginPath();
  ctx.moveTo(A.x, A.y);
  ctx.lineTo(B.x, B.y);
  ctx.stroke();

  // 5. Link 3: Coupler (BC) - Amber Metallic with Coupler Plate
  ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(B.x, B.y);
  ctx.lineTo(C.x, C.y);
  ctx.lineTo(P.x, P.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const coupGrad = ctx.createLinearGradient(B.x, B.y, C.x, C.y);
  coupGrad.addColorStop(0, '#d97706');
  coupGrad.addColorStop(1, '#fbbf24');
  ctx.strokeStyle = coupGrad;
  ctx.lineWidth = 6 * scale;
  ctx.beginPath();
  ctx.moveTo(B.x, B.y);
  ctx.lineTo(C.x, C.y);
  ctx.stroke();

  // 6. Link 4: Rocker (CD) - Emerald Metallic
  const rockGrad = ctx.createLinearGradient(C.x, C.y, D.x, D.y);
  rockGrad.addColorStop(0, '#059669');
  rockGrad.addColorStop(1, '#34d399');
  ctx.strokeStyle = rockGrad;
  ctx.lineWidth = 6 * scale;
  ctx.beginPath();
  ctx.moveTo(C.x, C.y);
  ctx.lineTo(D.x, D.y);
  ctx.stroke();

  // 7. Revolute Pin Joints (A, B, C, D, P)
  const drawJointPin = (pt: { x: number; y: number }, color: string, label: string) => {
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 6 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 2 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = color;
    ctx.fillText(label, pt.x + 8, pt.y - 6);
  };

  drawJointPin(B, '#38bdf8', 'B');
  drawJointPin(C, '#34d399', 'C');
  drawJointPin(P, '#ec4899', 'Tracer P');

  // 8. Transmission Angle Gauge HUD in Top-Right
  const hudX = w - 190;
  const hudY = 45;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = muDeg < 40 ? '#ef4444' : '#10b981';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(hudX, hudY, 175, 75, 8);
  ctx.fill();
  ctx.stroke();

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('TRANSMISSION ANGLE μ', hudX + 12, hudY + 20);

  ctx.font = 'bold 18px "IBM Plex Mono", monospace';
  ctx.fillStyle = muDeg < 40 ? '#ef4444' : '#10b981';
  ctx.fillText(`${muDeg.toFixed(1)}°`, hudX + 12, hudY + 44);

  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = muDeg < 40 ? '#f87171' : '#6ee7b7';
  ctx.fillText(muDeg < 40 ? 'POOR FORCE EFFICIENCY (<40°)' : 'OPTIMAL FORCE TRANSFER (≥40°)', hudX + 12, hudY + 62);
}

// ---------------------------------------------------------------------------
// 2. DAMPED HARMONIC OSCILLATOR RENDERER
// ---------------------------------------------------------------------------
export interface HarmonicParams {
  mass: number; // kg
  stiffness: number; // N/m
  dampingC: number; // N·s/m
  driveFreq: number; // Hz
}

export function renderHarmonicOscillator(rc: RenderContext, p: HarmonicParams) {
  const { ctx, w, h, t } = rc;
  const { mass, stiffness, dampingC, driveFreq } = p;

  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('VISCOUSLY DAMPED HARMONIC OSCILLATOR • HELICAL SPRING & DASHPOT', 18, 22);

  const omega_n = Math.sqrt(stiffness / mass);
  const fn = omega_n / (2 * Math.PI);
  const zeta = dampingC / (2 * Math.sqrt(stiffness * mass));
  const omega = 2 * Math.PI * driveFreq;
  const r = omega / omega_n;
  const denom = Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(2 * zeta * r, 2));
  const M = 1 / Math.max(0.001, denom);
  const phi = Math.atan2(2 * zeta * r, 1 - r * r);

  // Left Section: Physical Mechanical Rig
  const rigX = 70;
  const rigW = Math.min(180, w * 0.3);
  const ceilingY = 55;
  const eqY = ceilingY + 140;
  const ampPx = Math.min(65, 28 * M);
  const massY = eqY + ampPx * Math.cos(omega * t - phi);
  const massW = Math.min(120, rigW * 0.85);
  const massH = 45;
  const massX = rigX + (rigW - massW) / 2;

  // Rigid Ceiling with Hatching
  ctx.fillStyle = '#334155';
  ctx.fillRect(rigX - 15, ceilingY, rigW + 30, 8);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  for (let hx = rigX - 15; hx < rigX + rigW + 25; hx += 10) {
    ctx.beginPath();
    ctx.moveTo(hx, ceilingY);
    ctx.lineTo(hx + 8, ceilingY - 8);
    ctx.stroke();
  }

  // 1. Helical Spring on Left Side
  const springX = rigX + rigW * 0.3;
  const springTopY = ceilingY + 8;
  const springBottomY = massY;
  const coils = 12;
  const springW = 18;

  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(springX, springTopY);
  const coilLen = (springBottomY - springTopY) / coils;
  for (let i = 0; i < coils; i++) {
    const cy = springTopY + (i + 0.5) * coilLen;
    const offset = (i % 2 === 0 ? 1 : -1) * springW;
    ctx.lineTo(springX + offset, cy);
  }
  ctx.lineTo(springX, springBottomY);
  ctx.stroke();

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`k = ${stiffness} N/m`, springX - 25, ceilingY + 45);

  // 2. Viscous Dashpot Damper on Right Side
  const damperX = rigX + rigW * 0.72;
  const cylW = 24;
  const cylH = 75;
  const cylY = ceilingY + 35;

  // Damper Outer Cylinder (Oil filled)
  ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
  ctx.fillRect(damperX - cylW / 2, cylY, cylW, cylH);
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2;
  ctx.strokeRect(damperX - cylW / 2, cylY, cylW, cylH);

  // Damper Top Rod from ceiling
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(damperX, ceilingY + 8);
  ctx.lineTo(damperX, cylY);
  ctx.stroke();

  // Damper Piston inside cylinder moving with mass
  const pistonY = cylY + 25 + (massY - eqY) * 0.45;
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(damperX - cylW / 2 + 3, pistonY - 4, cylW - 6, 8);

  // Piston shaft connecting to mass
  ctx.beginPath();
  ctx.moveTo(damperX, pistonY + 4);
  ctx.lineTo(damperX, massY);
  ctx.stroke();

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`c = ${dampingC} N·s/m`, damperX - 15, cylY + 50);

  // 3. Vibrating Seismic Mass
  const massGrad = ctx.createLinearGradient(massX, massY, massX, massY + massH);
  massGrad.addColorStop(0, '#334155');
  massGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = massGrad;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(massX, massY, massW, massH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'bold 12px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`MASS m = ${mass} kg`, massX + 14, massY + 28);

  // Right Section: Phase Plane & Resonance Spectrum (if screen wide enough)
  if (w > 540) {
    const specX = w * 0.45;
    const specY = 55;
    const specW = w - specX - 30;
    const specH = h - 85;

    // Background container
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(specX, specY, specW, specH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('FREQUENCY RESPONSE AMPLIFICATION CURVE M(r)', specX + 16, specY + 22);

    // Plot Frequency Curve
    const plotX = specX + 35;
    const plotY = specY + 40;
    const plotW = specW - 60;
    const plotH = specH - 65;

    // Axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(plotX, plotY + plotH);
    ctx.lineTo(plotX + plotW, plotY + plotH);
    ctx.moveTo(plotX, plotY);
    ctx.lineTo(plotX, plotY + plotH);
    ctx.stroke();

    // M(r) Curve
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = 0; px <= plotW; px++) {
      const rVal = (px / plotW) * 2.5;
      const d = Math.sqrt(Math.pow(1 - rVal * rVal, 2) + Math.pow(2 * zeta * rVal, 2));
      const mVal = 1 / Math.max(0.001, d);
      const py = plotY + plotH - Math.min(plotH - 5, (mVal / 5) * plotH);
      if (px === 0) ctx.moveTo(plotX + px, py);
      else ctx.lineTo(plotX + px, py);
    }
    ctx.stroke();

    // Current Operating Point Marker
    const curPx = (r / 2.5) * plotW;
    if (curPx >= 0 && curPx <= plotW) {
      const curPy = plotY + plotH - Math.min(plotH - 5, (M / 5) * plotH);
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(plotX + curPx, curPy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = 'bold 10px "IBM Plex Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`OPERATING (r = ${r.toFixed(2)}, M = ${M.toFixed(2)}x)`, plotX + curPx - 50, curPy - 12);
    }

    // Resonance peak vertical line at r = 1.0
    const resPx = (1.0 / 2.5) * plotW;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(plotX + resPx, plotY);
    ctx.lineTo(plotX + resPx, plotY + plotH);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('Resonance (r = 1.0)', plotX + resPx + 4, plotY + 15);
  }
}

// ---------------------------------------------------------------------------
// 3. INVOLUTE SPUR GEAR MESH RENDERER
// ---------------------------------------------------------------------------
export interface SpurGearParams {
  moduleM: number; // mm
  teethPinion: number; // z1
  teethGear: number; // z2
  pressureAngle: number; // deg
  inputRpm: number;
}

export function renderSpurGear(rc: RenderContext, p: SpurGearParams) {
  const { ctx, w, h, t } = rc;
  const { moduleM, teethPinion, teethGear, pressureAngle, inputRpm } = p;

  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('AGMA 2001-D04 INVOLUTE SPUR GEAR MESH • LINE OF ACTION & PITCH CIRCLE', 18, 22);

  const alpha = (pressureAngle * Math.PI) / 180;
  const d1 = moduleM * teethPinion;
  const d2 = moduleM * teethGear;
  const C = (d1 + d2) / 2;
  const gearRatio = teethGear / teethPinion;

  const scale = Math.min(1.1, (w * 0.7) / (d1 + d2), (h * 0.75) / Math.max(d1, d2));
  const r1Px = (d1 / 2) * scale;
  const r2Px = (d2 / 2) * scale;

  const c1X = w * 0.32;
  const c1Y = h * 0.52;
  const c2X = c1X + (r1Px + r2Px);
  const c2Y = c1Y;

  const rot1 = (t * (inputRpm * 2 * Math.PI) / 60) % (2 * Math.PI);
  const rot2 = -(rot1 / gearRatio);

  // Pitch Circles (Dash lines)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.arc(c1X, c1Y, r1Px, 0, Math.PI * 2);
  ctx.arc(c2X, c2Y, r2Px, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Base Circles
  const rb1Px = r1Px * Math.cos(alpha);
  const rb2Px = r2Px * Math.cos(alpha);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
  ctx.beginPath();
  ctx.arc(c1X, c1Y, rb1Px, 0, Math.PI * 2);
  ctx.arc(c2X, c2Y, rb2Px, 0, Math.PI * 2);
  ctx.stroke();

  // Function to draw gear teeth
  const drawGearTeeth = (cx: number, cy: number, rPitch: number, z: number, rot: number, color: string, label: string) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);

    // Gear Body Disk
    const grad = ctx.createRadialGradient(0, 0, rPitch * 0.2, 0, 0, rPitch * 1.1);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i < z; i++) {
      const aStart = (i * 2 * Math.PI) / z;
      const aMid1 = aStart + (0.35 * 2 * Math.PI) / z;
      const aMid2 = aStart + (0.65 * 2 * Math.PI) / z;
      const aEnd = aStart + (1.0 * 2 * Math.PI) / z;

      const rDed = rPitch - 1.25 * moduleM * scale;
      const rAdd = rPitch + 1.0 * moduleM * scale;

      ctx.lineTo(rDed * Math.cos(aStart), rDed * Math.sin(aStart));
      ctx.lineTo(rAdd * Math.cos(aMid1), rAdd * Math.sin(aMid1));
      ctx.lineTo(rAdd * Math.cos(aMid2), rAdd * Math.sin(aMid2));
      ctx.lineTo(rDed * Math.cos(aEnd), rDed * Math.sin(aEnd));
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Central Shaft Bore
    ctx.fillStyle = '#020617';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, rPitch * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    ctx.font = 'bold 11px "IBM Plex Mono", monospace';
    ctx.fillStyle = color;
    ctx.fillText(label, cx - 35, cy + rPitch + 28);
  };

  drawGearTeeth(c1X, c1Y, r1Px, teethPinion, rot1, '#38bdf8', `Pinion z₁ = ${teethPinion}`);
  drawGearTeeth(c2X, c2Y, r2Px, teethGear, rot2, '#f59e0b', `Gear z₂ = ${teethGear}`);

  // Line of Action across pitch point P
  const pitchPxX = c1X + r1Px;
  const pitchPxY = c1Y;
  const loaLen = Math.min(130, (r1Px + r2Px) * 0.45);

  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pitchPxX - loaLen * Math.cos(alpha), pitchPxY - loaLen * Math.sin(alpha));
  ctx.lineTo(pitchPxX + loaLen * Math.cos(alpha), pitchPxY + loaLen * Math.sin(alpha));
  ctx.stroke();

  // Pitch Point Marker P
  ctx.fillStyle = '#ec4899';
  ctx.beginPath();
  ctx.arc(pitchPxX, pitchPxY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillText('Pitch Point P', pitchPxX - 30, pitchPxY - 12);

  // Telemetry Box
  const tBoxX = w - 210;
  const tBoxY = 45;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(tBoxX, tBoxY, 195, 80, 8);
  ctx.fill();
  ctx.stroke();

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('GEAR RATIO & CONTACT', tBoxX + 12, tBoxY + 20);
  ctx.font = 'bold 16px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`i = 1 : ${gearRatio.toFixed(2)}`, tBoxX + 12, tBoxY + 44);
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`N₂ = ${(inputRpm / gearRatio).toFixed(0)} RPM (Output)`, tBoxX + 12, tBoxY + 64);
}

// ---------------------------------------------------------------------------
// 4. RANKINE STEAM TURBINE CYCLE RENDERER
// ---------------------------------------------------------------------------
export interface RankineParams {
  boilerP: number; // bar
  turbineInletT: number; // °C
  condenserP: number; // bar
  turbineEff: number; // %
}

export function renderRankineCycle(rc: RenderContext, p: RankineParams) {
  const { ctx, w, h, t } = rc;
  const { boilerP, turbineInletT, condenserP, turbineEff } = p;

  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('RANKINE SUPERHEAT STEAM POWER CYCLE • T-s DIAGRAM & TURBINE TRAIN', 18, 22);

  const diagX = 40;
  const diagY = 50;
  const diagW = Math.min(300, w * 0.42);
  const diagH = h - 90;

  // 1. T-s Diagram Container
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(diagX, diagY, diagW, diagH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('TEMPERATURE-ENTROPY (T-s) DOME', diagX + 14, diagY + 20);

  // Saturation Dome (Liquid & Vapor boundary)
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const domeBaseY = diagY + diagH - 30;
  const domePeakX = diagX + diagW * 0.45;
  const domePeakY = diagY + 45;

  ctx.moveTo(diagX + 25, domeBaseY);
  ctx.quadraticCurveTo(diagX + diagW * 0.25, domePeakY + 20, domePeakX, domePeakY);
  ctx.quadraticCurveTo(diagX + diagW * 0.7, domePeakY + 30, diagX + diagW - 25, domeBaseY);
  ctx.stroke();

  // Rankine Thermodynamic State Points (1: Turbine In, 2: Turbine Out, 3: Pump In, 4: Boiler In)
  const pt1 = { x: diagX + diagW * 0.72, y: diagY + 40 }; // Superheated steam
  const pt2 = { x: diagX + diagW * 0.75, y: domeBaseY - 10 }; // Wet steam condenser
  const pt3 = { x: diagX + 35, y: domeBaseY - 10 }; // Saturated liquid
  const pt4 = { x: diagX + 38, y: diagY + 85 }; // Compressed liquid into boiler

  // Connecting Thermodynamic Process Lines
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(pt1.x, pt1.y);
  ctx.lineTo(pt2.x, pt2.y); // Expansion in turbine
  ctx.lineTo(pt3.x, pt3.y); // Condenser heat rejection
  ctx.lineTo(pt4.x, pt4.y); // Pump compression
  ctx.lineTo(pt1.x, pt1.y); // Boiler heating
  ctx.stroke();

  const drawStatePt = (pt: { x: number; y: number }, label: string, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, pt.x + 6, pt.y - 4);
  };

  drawStatePt(pt1, '1 (Boiler Out)', '#ef4444');
  drawStatePt(pt2, '2 (Turbine Out)', '#38bdf8');
  drawStatePt(pt3, '3 (Condenser Out)', '#06b6d4');
  drawStatePt(pt4, '4 (Pump Out)', '#10b981');

  // 2. Physical Plant Loop (Right Section)
  if (w > 560) {
    const plantX = diagX + diagW + 30;
    const plantY = 50;
    const plantW = w - plantX - 30;
    const plantH = h - 90;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(plantX, plantY, plantW, plantH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = '10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('PHYSICAL EQUIPMENT FLOW LOOP', plantX + 16, plantY + 20);

    // Boiler Enclosure
    const bBoxX = plantX + 25;
    const bBoxY = plantY + 45;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(bBoxX, bBoxY, 80, 70);
    ctx.font = 'bold 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('BOILER', bBoxX + 16, bBoxY + 30);
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillText(`${boilerP} bar`, bBoxX + 18, bBoxY + 45);

    // Spinning Turbine
    const tBoxX = plantX + plantW - 110;
    const tBoxY = plantY + 45;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(tBoxX, tBoxY, 80, 70);
    ctx.font = 'bold 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('TURBINE', tBoxX + 14, tBoxY + 30);

    // Rotating Turbine Rotor Blades
    const rotSpeed = t * 6;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tBoxX + 40, tBoxY + 50, 12, 0, Math.PI * 2);
    ctx.stroke();
    for (let b = 0; b < 4; b++) {
      const ang = rotSpeed + (b * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(tBoxX + 40, tBoxY + 50);
      ctx.lineTo(tBoxX + 40 + Math.cos(ang) * 12, tBoxY + 50 + Math.sin(ang) * 12);
      ctx.stroke();
    }

    // Condenser Box
    const cBoxX = tBoxX;
    const cBoxY = plantY + plantH - 95;
    ctx.strokeStyle = '#06b6d4';
    ctx.strokeRect(cBoxX, cBoxY, 80, 60);
    ctx.font = 'bold 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#06b6d4';
    ctx.fillText('CONDENSER', cBoxX + 10, cBoxY + 28);
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillText(`${condenserP} bar`, cBoxX + 16, cBoxY + 44);

    // Feed Pump Box
    const pBoxX = bBoxX;
    const pBoxY = cBoxY;
    ctx.strokeStyle = '#10b981';
    ctx.strokeRect(pBoxX, pBoxY, 80, 60);
    ctx.font = 'bold 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText('FEED PUMP', pBoxX + 12, pBoxY + 28);
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillText('Liquid Work', pBoxX + 10, pBoxY + 44);

    // Interconnecting Pipes with Animated Steam/Water Particles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -t * 40;
    ctx.beginPath();
    // Boiler to Turbine (High-temp steam)
    ctx.moveTo(bBoxX + 80, bBoxY + 25);
    ctx.lineTo(tBoxX, bBoxY + 25);
    // Turbine to Condenser (Low-pressure steam)
    ctx.moveTo(tBoxX + 40, tBoxY + 70);
    ctx.lineTo(cBoxX + 40, cBoxY);
    // Condenser to Pump (Condensed water)
    ctx.moveTo(cBoxX, cBoxY + 30);
    ctx.lineTo(pBoxX + 80, pBoxY + 30);
    // Pump to Boiler (High-pressure water)
    ctx.moveTo(pBoxX + 40, pBoxY);
    ctx.lineTo(bBoxX + 40, bBoxY + 70);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// ---------------------------------------------------------------------------
// 5. OTTO & DIESEL HEAT ENGINE CYCLES RENDERER
// ---------------------------------------------------------------------------
export interface OttoCycleParams {
  cycleType: number; // 0=Otto, 1=Diesel
  compressionRatio: number; // r
  displacement: number; // L
  rpm: number;
  pInlet: number; // bar
  tMax: number; // K
}

export function renderOttoCycle(rc: RenderContext, p: OttoCycleParams) {
  const { ctx, w, h, t } = rc;
  const cycleType = Math.round(p.cycleType || 0);
  const r = p.compressionRatio || (cycleType === 0 ? 9.5 : 17.0);
  const rpm = p.rpm || 2400;
  const P1_bar = p.pInlet || 1.0;
  const T3_K = p.tMax || 2200;

  // Thermodynamics calculation
  const gamma = 1.4;
  const T1 = 300;
  const T2 = T1 * Math.pow(r, gamma - 1);
  const P1 = P1_bar;
  const P2 = P1 * Math.pow(r, gamma);

  let P3 = 0;
  let P4 = 0;
  let eta = 0;
  if (cycleType === 0) {
    P3 = P2 * (T3_K / T2);
    P4 = P3 * Math.pow(1 / r, gamma);
    eta = 1 - 1 / Math.pow(r, gamma - 1);
  } else {
    P3 = P2;
    const rcCut = T3_K / T2;
    P4 = P3 * Math.pow(rcCut / r, gamma);
    eta = 1 - (1 / Math.pow(r, gamma - 1)) * ((Math.pow(rcCut, gamma) - 1) / (gamma * (rcCut - 1)));
  }

  // Crank angle in 4-stroke cycle: 0 to 720 degrees (4 pi rad)
  const crankSpeedRadPerSec = (rpm / 60) * 2 * Math.PI * 0.15; // scaled for visual smoothness
  const crankTheta = (t * crankSpeedRadPerSec) % (4 * Math.PI);
  const strokePhase = Math.floor(crankTheta / Math.PI); // 0=Intake, 1=Compression, 2=Power, 3=Exhaust

  const strokeNames = [
    'STROKE 1: INTAKE (DOWN)',
    'STROKE 2: COMPRESSION (UP)',
    'STROKE 3: POWER / EXPANSION (DOWN)',
    'STROKE 4: EXHAUST (UP)',
  ];

  // Background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, w, h);

  const splitX = Math.floor(w * 0.45);

  // --- LEFT: 4-STROKE PISTON-CYLINDER ENGINE ---
  ctx.save();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.strokeRect(12, 12, splitX - 24, h - 24);

  // Title
  ctx.font = 'bold 12px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(cycleType === 0 ? 'OTTO CYCLE 4-STROKE ENGINE' : 'DIESEL CYCLE 4-STROKE ENGINE', 24, 34);
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('RECIPROCATING CRANKSHAFT MECHANISM', 24, 48);

  const engCenterX = splitX * 0.5;
  const crankCenterY = h * 0.72;
  const crankRadius = 38;
  const rodLength = 110;
  const pistonW = 74;
  const pistonH = 50;

  // Crankpin coordinate
  const crankPinX = engCenterX + crankRadius * Math.sin(crankTheta);
  const crankPinY = crankCenterY - crankRadius * Math.cos(crankTheta);

  // Piston gudgeon pin Y coordinate
  const deltaX = crankPinX - engCenterX;
  const pistonPinY = crankPinY - Math.sqrt(Math.max(1, rodLength * rodLength - deltaX * deltaX));
  const pistonTopY = pistonPinY - pistonH / 2;

  // Cylinder Bore boundaries
  const cylLeft = engCenterX - pistonW / 2 - 4;
  const cylRight = engCenterX + pistonW / 2 + 4;
  const cylTop = crankCenterY - crankRadius - rodLength - 35;
  const cylBot = crankCenterY - crankRadius + 20;

  // Cylinder Walls with cooling fins
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cylLeft, cylTop); ctx.lineTo(cylLeft, cylBot);
  ctx.moveTo(cylRight, cylTop); ctx.lineTo(cylRight, cylBot);
  ctx.stroke();

  // Cooling fins
  ctx.lineWidth = 1.5;
  for (let fy = cylTop + 15; fy < cylBot - 20; fy += 14) {
    ctx.beginPath();
    ctx.moveTo(cylLeft - 14, fy); ctx.lineTo(cylLeft, fy);
    ctx.moveTo(cylRight, fy); ctx.lineTo(cylRight + 14, fy);
    ctx.stroke();
  }

  // Cylinder Head (Top Cap)
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cylLeft - 6, cylTop);
  ctx.lineTo(cylRight + 6, cylTop);
  ctx.stroke();

  // Combustion Chamber Fire / Glow during Power Stroke (Stroke 2)
  if (strokePhase === 2) {
    const flashProgress = (crankTheta - 2 * Math.PI) / Math.PI; // 0 to 1
    const glowAlpha = Math.max(0, 0.9 * (1.0 - flashProgress * 0.8));
    ctx.fillStyle = `rgba(245, 158, 11, ${glowAlpha})`;
    ctx.fillRect(cylLeft + 2, cylTop + 2, pistonW + 4, pistonTopY - cylTop - 2);

    // Spark / Fuel flash
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(engCenterX, cylTop + 10, 8 * (1 - flashProgress * 0.5), 0, Math.PI * 2);
    ctx.fill();
  } else if (strokePhase === 1) {
    // Compression heat
    const compAlpha = (crankTheta - Math.PI) / Math.PI * 0.25;
    ctx.fillStyle = `rgba(239, 68, 68, ${compAlpha})`;
    ctx.fillRect(cylLeft + 2, cylTop + 2, pistonW + 4, pistonTopY - cylTop - 2);
  }

  // Spark plug / Fuel injector at top center
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(engCenterX - 5, cylTop - 12, 10, 12);

  // Valves
  const inValveOpen = strokePhase === 0;
  const exValveOpen = strokePhase === 3;
  // Intake valve (Left)
  ctx.strokeStyle = inValveOpen ? '#10b981' : '#64748b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(engCenterX - 22, cylTop - (inValveOpen ? 0 : 4));
  ctx.lineTo(engCenterX - 14, cylTop + (inValveOpen ? 6 : 0));
  ctx.stroke();
  // Exhaust valve (Right)
  ctx.strokeStyle = exValveOpen ? '#ef4444' : '#64748b';
  ctx.beginPath();
  ctx.moveTo(engCenterX + 14, cylTop + (exValveOpen ? 6 : 0));
  ctx.lineTo(engCenterX + 22, cylTop - (exValveOpen ? 0 : 4));
  ctx.stroke();

  // Piston
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.fillRect(engCenterX - pistonW / 2, pistonTopY, pistonW, pistonH);
  ctx.strokeRect(engCenterX - pistonW / 2, pistonTopY, pistonW, pistonH);

  // Compression rings on piston
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(engCenterX - pistonW / 2, pistonTopY + 8); ctx.lineTo(engCenterX + pistonW / 2, pistonTopY + 8);
  ctx.moveTo(engCenterX - pistonW / 2, pistonTopY + 14); ctx.lineTo(engCenterX + pistonW / 2, pistonTopY + 14);
  ctx.stroke();

  // Connecting Rod
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(engCenterX, pistonPinY);
  ctx.lineTo(crankPinX, crankPinY);
  ctx.stroke();

  // Wrist pin & Crankpin bearings
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(engCenterX, pistonPinY, 4, 0, Math.PI * 2);
  ctx.arc(crankPinX, crankPinY, 5, 0, Math.PI * 2);
  ctx.fill();

  // Crankshaft Counterweight & Web
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(engCenterX, crankCenterY, crankRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(engCenterX, crankCenterY, 8, 0, Math.PI * 2);
  ctx.fill();

  // Stroke Phase Badge
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(20, h - 56, splitX - 40, 34);
  ctx.strokeStyle = strokePhase === 2 ? '#f59e0b' : '#334155';
  ctx.strokeRect(20, h - 56, splitX - 40, 34);
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = strokePhase === 2 ? '#f59e0b' : '#38bdf8';
  ctx.fillText(strokeNames[strokePhase], 30, h - 34);

  ctx.restore();

  // --- RIGHT: P-V THERMODYNAMIC DIAGRAM ---
  ctx.save();
  const pvX = splitX + 12;
  const pvY = 12;
  const pvW = w - splitX - 24;
  const pvH = h - 24;

  ctx.fillStyle = '#020617';
  ctx.fillRect(pvX, pvY, pvW, pvH);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(pvX, pvY, pvW, pvH);

  // Diagram coordinates
  const plotLeft = pvX + 50;
  const plotRight = pvX + pvW - 25;
  const plotTop = pvY + 45;
  const plotBottom = pvY + pvH - 45;
  const pRange = P3 * 1.15;

  // Grid & Axes
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
  ctx.lineWidth = 1;
  for (let gy = 0; gy <= 5; gy++) {
    const y = plotBottom - (gy / 5) * (plotBottom - plotTop);
    ctx.beginPath(); ctx.moveTo(plotLeft, y); ctx.lineTo(plotRight, y); ctx.stroke();
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${((gy / 5) * pRange).toFixed(0)} bar`, pvX + 8, y + 3);
  }

  // Axes lines
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(plotLeft, plotTop); ctx.lineTo(plotLeft, plotBottom);
  ctx.lineTo(plotRight, plotBottom);
  ctx.stroke();

  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('VOLUME V →', plotRight - 65, plotBottom + 20);
  ctx.fillText('PRESSURE P (bar)', plotLeft - 10, plotTop - 12);

  // State Points Coordinates on diagram
  // V1 (Bottom Dead Center) = plotRight - 30
  // V2 (Top Dead Center) = plotLeft + (plotRight - plotLeft) / r
  const xV1 = plotRight - 35;
  const xV2 = plotLeft + (xV1 - plotLeft) / r;

  const yP1 = plotBottom - (P1 / pRange) * (plotBottom - plotTop);
  const yP2 = plotBottom - (P2 / pRange) * (plotBottom - plotTop);
  const yP3 = plotBottom - (P3 / pRange) * (plotBottom - plotTop);
  const yP4 = plotBottom - (P4 / pRange) * (plotBottom - plotTop);

  // Draw P-V Loop curves
  // 1 -> 2: Isentropic Compression (Cyan)
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let step = 0; step <= 30; step++) {
    const frac = step / 30;
    const v = (1 - frac) * r + frac * 1.0;
    const pVal = P1 * Math.pow(r / v, gamma);
    const x = plotLeft + ((v - 1) / (r - 1)) * (xV1 - xV2) + (xV2 - plotLeft);
    const y = plotBottom - (pVal / pRange) * (plotBottom - plotTop);
    if (step === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 2 -> 3: Heat Addition (Otto = constant V vertical line, Diesel = constant P horizontal line)
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (cycleType === 0) {
    ctx.moveTo(xV2, yP2);
    ctx.lineTo(xV2, yP3);
  } else {
    const xV3 = xV2 + (xV1 - xV2) * 0.2;
    ctx.moveTo(xV2, yP2);
    ctx.lineTo(xV3, yP3);
  }
  ctx.stroke();

  // 3 -> 4: Isentropic Expansion / Power Stroke (Emerald)
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let step = 0; step <= 30; step++) {
    const frac = step / 30;
    const v = (1 - frac) * 1.0 + frac * r;
    const pVal = P3 * Math.pow(1.0 / v, gamma);
    const x = xV2 + ((v - 1) / (r - 1)) * (xV1 - xV2);
    const y = plotBottom - (pVal / pRange) * (plotBottom - plotTop);
    if (step === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 4 -> 1: Heat Rejection (Violet)
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(xV1, yP4);
  ctx.lineTo(xV1, yP1);
  ctx.stroke();

  // State Labels (1, 2, 3, 4)
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#06b6d4'; ctx.fillText('1 (BDC)', xV1 + 6, yP1 + 4);
  ctx.fillStyle = '#f59e0b'; ctx.fillText('2 (TDC)', xV2 - 45, yP2 + 4);
  ctx.fillStyle = '#ef4444'; ctx.fillText('3 (Pmax)', xV2 - 45, yP3 - 4);
  ctx.fillStyle = '#8b5cf6'; ctx.fillText('4', xV1 + 6, yP4);

  // Live Animated Tracking Dot on P-V Diagram
  // Calculate instantaneous cylinder volume V(theta)
  const normCrank = crankTheta % (2 * Math.PI);
  const cosCr = Math.cos(normCrank);
  const vNorm = 1.0 + (r - 1.0) * 0.5 * (1.0 - cosCr); // 1 at TDC, r at BDC
  let curP = P1;

  if (strokePhase === 1) { // Compression
    curP = P1 * Math.pow(r / vNorm, gamma);
  } else if (strokePhase === 2) { // Expansion
    curP = P3 * Math.pow(1.0 / (vNorm / 1.0), gamma);
  } else if (strokePhase === 0) { // Intake
    curP = P1;
  } else { // Exhaust
    curP = P1 * 1.05;
  }

  const liveDotX = xV2 + ((vNorm - 1) / (r - 1)) * (xV1 - xV2);
  const liveDotY = plotBottom - (Math.min(pRange, curP) / pRange) * (plotBottom - plotTop);

  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(liveDotX, liveDotY, 5.5, 0, Math.PI * 2);
  ctx.fill();

  // Telemetry Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(pvX + 15, pvY + 10, pvW - 30, 32);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(pvX + 15, pvY + 10, pvW - 30, 32);
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#10b981';
  ctx.fillText(`η_th = ${(eta * 100).toFixed(1)}%`, pvX + 25, pvY + 30);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`r = ${r.toFixed(1)}:1`, pvX + 160, pvY + 30);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`P_max = ${P3.toFixed(1)} bar`, pvX + 270, pvY + 30);
  ctx.fillStyle = '#a855f7';
  ctx.fillText(`T_max = ${T3_K.toFixed(0)} K`, pvX + pvW - 140, pvY + 30);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 6. PROJECTILE MOTION WITH AERODYNAMIC DRAG RENDERER
// ---------------------------------------------------------------------------
export interface ProjectileParams {
  launchVelocity: number; // m/s
  launchAngle: number; // deg
  launchHeight: number; // m
  dragCoeff: number; // Cd
  projectileMass: number; // kg
  crossSectionArea: number; // m^2
}

export function renderProjectile(rc: RenderContext, p: ProjectileParams) {
  const { ctx, w, h, t } = rc;
  const v0 = p.launchVelocity || 80;
  const angleDeg = p.launchAngle || 45;
  const h0 = p.launchHeight || 0;
  const Cd = p.dragCoeff !== undefined ? p.dragCoeff : 0.47;
  const mass = p.projectileMass || 2.0;
  const area = p.crossSectionArea || 0.02;

  const g = 9.80665;
  const rho = 1.225;
  const theta = (angleDeg * Math.PI) / 180.0;
  const v0x = v0 * Math.cos(theta);
  const v0y = v0 * Math.sin(theta);

  // Compute numerical flight trajectory with quadratic drag
  const dtSim = 0.01;
  let posX = 0;
  let posY = h0;
  let vx = v0x;
  let vy = v0y;
  let time = 0;
  let apogee = h0;
  const dragTrajX: number[] = [posX];
  const dragTrajY: number[] = [posY];

  while (posY >= 0 && time < 80.0) {
    const vMag = Math.sqrt(vx * vx + vy * vy);
    const Fd = 0.5 * rho * Cd * area * vMag * vMag;
    const ax = -(Fd * (vx / vMag)) / mass;
    const ay = -g - (Fd * (vy / vMag)) / mass;

    vx += ax * dtSim;
    vy += ay * dtSim;
    posX += vx * dtSim;
    posY += vy * dtSim;
    time += dtSim;

    if (posY > apogee) apogee = posY;
    if (posY >= 0) {
      dragTrajX.push(posX);
      dragTrajY.push(posY);
    }
  }

  // Vacuum comparison
  const tFlightVac = (v0y + Math.sqrt(v0y * v0y + 2 * g * h0)) / g;
  const rangeVac = v0x * tFlightVac;
  const hMaxVac = h0 + (v0y * v0y) / (2 * g);

  const rangeDrag = dragTrajX[dragTrajX.length - 1];
  const maxRange = Math.max(rangeVac, rangeDrag) * 1.1;
  const maxHeight = Math.max(hMaxVac, apogee) * 1.25;

  // Background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, w, h);

  const plotLeft = 60;
  const plotRight = w - 40;
  const plotTop = 50;
  const plotBottom = h - 60;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  // Coordinate transforms
  const toScreenX = (x: number) => plotLeft + (x / maxRange) * plotW;
  const toScreenY = (y: number) => plotBottom - (y / maxHeight) * plotH;

  // Grid
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
  ctx.lineWidth = 1;
  const gridStepsX = 8;
  for (let i = 0; i <= gridStepsX; i++) {
    const dist = (i / gridStepsX) * maxRange;
    const sx = toScreenX(dist);
    ctx.beginPath(); ctx.moveTo(sx, plotTop); ctx.lineTo(sx, plotBottom); ctx.stroke();
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${dist.toFixed(0)}m`, sx - 12, plotBottom + 16);
  }

  const gridStepsY = 5;
  for (let i = 0; i <= gridStepsY; i++) {
    const el = (i / gridStepsY) * maxHeight;
    const sy = toScreenY(el);
    ctx.beginPath(); ctx.moveTo(plotLeft, sy); ctx.lineTo(plotRight, sy); ctx.stroke();
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${el.toFixed(0)}m`, plotLeft - 45, sy + 3);
  }

  // Ground Line
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(plotLeft - 10, plotBottom);
  ctx.lineTo(plotRight + 10, plotBottom);
  ctx.stroke();

  // Cannon / Launch Platform
  const canX = toScreenX(0);
  const canY = toScreenY(h0);
  const barrelLen = 22;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(canX, canY);
  ctx.lineTo(canX + barrelLen * Math.cos(theta), canY - barrelLen * Math.sin(theta));
  ctx.stroke();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(canX, canY, 6, 0, Math.PI * 2);
  ctx.fill();

  // 1. Vacuum Trajectory (Dashed Gray)
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  const vacSteps = 60;
  for (let s = 0; s <= vacSteps; s++) {
    const timeNorm = (s / vacSteps) * tFlightVac;
    const xVac = v0x * timeNorm;
    const yVac = h0 + v0y * timeNorm - 0.5 * g * timeNorm * timeNorm;
    const sx = toScreenX(xVac);
    const sy = toScreenY(Math.max(0, yVac));
    if (s === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. Aerodynamic Drag Trajectory (Vibrant Cyan-Emerald Gradient)
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let s = 0; s < dragTrajX.length; s++) {
    const sx = toScreenX(dragTrajX[s]);
    const sy = toScreenY(dragTrajY[s]);
    if (s === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // Apogee Marker
  const apogeeIdx = dragTrajY.indexOf(apogee);
  const apogeeX = toScreenX(dragTrajX[apogeeIdx >= 0 ? apogeeIdx : 0]);
  const apogeeY = toScreenY(apogee);
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(apogeeX, apogeeY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText(`Apogee: ${apogee.toFixed(1)}m`, apogeeX - 35, apogeeY - 10);

  // Animated Ball Flight along drag trajectory
  const animCycle = (t * 1.5) % (time + 1.2);
  let curProjX = 0;
  let curProjY = h0;
  if (animCycle < time) {
    const frac = animCycle / time;
    const idx = Math.min(dragTrajX.length - 1, Math.floor(frac * dragTrajX.length));
    curProjX = dragTrajX[idx];
    curProjY = dragTrajY[idx];
  } else {
    curProjX = rangeDrag;
    curProjY = 0;
  }

  const ballSx = toScreenX(curProjX);
  const ballSy = toScreenY(curProjY);

  // Projectile Glow & Particle
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(ballSx, ballSy, 6, 0, Math.PI * 2);
  ctx.fill();

  // Telemetry HUD Bar at top
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(plotLeft, 10, plotW, 34);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(plotLeft, 10, plotW, 34);

  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`RANGE WITH DRAG: ${rangeDrag.toFixed(1)}m (Vac: ${rangeVac.toFixed(1)}m)`, plotLeft + 15, 31);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`APOGEE: ${apogee.toFixed(1)}m`, plotLeft + 360, 31);
  ctx.fillStyle = '#10b981';
  ctx.fillText(`HANG TIME: ${time.toFixed(2)}s`, plotLeft + plotW - 160, 31);
}

// ---------------------------------------------------------------------------
// 8. CENTRIFUGAL PUMP & SYSTEM HYDRAULIC CURVES RENDERER (HI 14.6 / ISO 9906)
// ---------------------------------------------------------------------------
export interface CentrifugalPumpParams {
  pumpSpeed: number; // RPM
  impellerDia: number; // mm
  staticHead: number; // m
  systemResistanceK: number; // m/(m3/h)^2
}

export function renderCentrifugalPump(rc: RenderContext, p: CentrifugalPumpParams) {
  const { ctx, w, h, t } = rc;
  const N = p.pumpSpeed || 1750.0;
  const D_mm = p.impellerDia || 220.0;
  const Hstat = p.staticHead || 15.0;
  const kPipe = p.systemResistanceK || 0.004;

  const N_ratio = N / 1750.0;
  const D_ratio = D_mm / 220.0;
  const H0 = 42.0 * Math.pow(N_ratio * D_ratio, 2);
  const Qmax = 95.0 * N_ratio * Math.pow(D_ratio, 3);
  const kp = (H0 * 0.75) / Math.pow(Math.max(1, Qmax), 2);

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
  const PshaftKw = (1000.0 * 9.81 * (Qop / 3600.0) * Hop) / (1000.0 * etaHyd);

  // Background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, w, h);

  // Layout: Left 65% is hydraulic plot, Right 35% is animated pump volute & pipeline
  const plotLeft = 55;
  const plotRight = Math.floor(w * 0.64);
  const plotTop = 50;
  const plotBottom = h - 50;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  // Grid
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
  ctx.lineWidth = 1;
  ctx.strokeRect(plotLeft, plotTop, plotW, plotH);

  for (let gy = 0.25; gy <= 0.75; gy += 0.25) {
    const y = plotBottom - gy * plotH;
    ctx.beginPath();
    ctx.moveTo(plotLeft, y);
    ctx.lineTo(plotRight, y);
    ctx.stroke();
  }

  const maxPlotQ = Math.max(80, Qmax * 1.15);
  const maxPlotH = Math.max(50, H0 * 1.2);

  // 1. Pump Head Curve H(Q) - Cyan
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 3;
  ctx.beginPath();
  const qSteps = 60;
  for (let i = 0; i <= qSteps; i++) {
    const qVal = (i / qSteps) * Qmax;
    const hVal = Math.max(0, H0 - kp * qVal * qVal);
    const sx = plotLeft + (qVal / maxPlotQ) * plotW;
    const sy = plotBottom - (hVal / maxPlotH) * plotH;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // 2. System Resistance Curve H_sys(Q) - Emerald
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= qSteps; i++) {
    const qVal = (i / qSteps) * maxPlotQ;
    const hSys = Hstat + kPipe * qVal * qVal;
    const sx = plotLeft + (qVal / maxPlotQ) * plotW;
    const sy = plotBottom - (Math.min(maxPlotH, hSys) / maxPlotH) * plotH;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // 3. Efficiency Curve - Amber dashed
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= qSteps; i++) {
    const qVal = (i / qSteps) * Qmax;
    const qN = qVal / Math.max(1, Qbep);
    const eff = Math.max(0, Math.min(etaMax, 4.0 * etaMax * qN * (1.0 - 0.5 * qN)));
    const sx = plotLeft + (qVal / maxPlotQ) * plotW;
    const sy = plotBottom - (eff / 1.0) * plotH;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();
  ctx.restore();

  // 4. Operating Point Crosshair & Indicator
  if (Qop > 0) {
    const opSx = plotLeft + (Qop / maxPlotQ) * plotW;
    const opSy = plotBottom - (Hop / maxPlotH) * plotH;

    ctx.save();
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(opSx, plotBottom);
    ctx.lineTo(opSx, opSy);
    ctx.lineTo(plotLeft, opSy);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(opSx, opSy, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#f43f5e';
    ctx.fillText(`DUTY POINT (${Qop.toFixed(1)} m³/h, ${Hop.toFixed(1)}m)`, opSx - 40, opSy - 12);
  }

  // Axes labels
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('0', plotLeft - 15, plotBottom + 12);
  ctx.fillText(`${maxPlotQ.toFixed(0)} m³/h`, plotRight - 45, plotBottom + 16);
  ctx.fillText(`${maxPlotH.toFixed(0)}m`, plotLeft - 32, plotTop + 10);
  ctx.fillText('FLOW RATE Q →', plotLeft + plotW * 0.4, plotBottom + 26);

  // Right schematic: Pump Volute and Rotating Impeller
  const pumpX = plotRight + (w - plotRight) * 0.5;
  const pumpY = plotTop + plotH * 0.48;
  const rVolute = Math.min(65, (w - plotRight) * 0.35);

  // Volute Casing
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(pumpX, pumpY, rVolute, 0, Math.PI * 2);
  ctx.stroke();

  // Discharge Nozzle
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(pumpX + rVolute - 2, pumpY);
  ctx.lineTo(pumpX + rVolute - 2, pumpY - rVolute * 1.3);
  ctx.stroke();

  // Suction Flange (center)
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(pumpX, pumpY, rVolute * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Rotating Impeller Blades
  const bladeAngle = (t * (N * 2 * Math.PI) / 60.0) % (Math.PI * 2);
  const nBlades = 6;
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 3.5;
  for (let b = 0; b < nBlades; b++) {
    const a = bladeAngle + (b * 2 * Math.PI) / nBlades;
    const x1 = pumpX + Math.cos(a) * (rVolute * 0.3);
    const y1 = pumpY + Math.sin(a) * (rVolute * 0.3);
    const x2 = pumpX + Math.cos(a + 0.4) * (rVolute * 0.82);
    const y2 = pumpY + Math.sin(a + 0.4) * (rVolute * 0.82);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Animated Discharge Stream Particles
  const streamY = pumpY - rVolute * 1.3;
  ctx.fillStyle = '#38bdf8';
  for (let i = 0; i < 4; i++) {
    const pY = streamY - ((t * 120 + i * 20) % 50);
    ctx.beginPath();
    ctx.arc(pumpX + rVolute - 2, pY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`IMPELLER: Ø${D_mm.toFixed(0)}mm`, pumpX - 45, pumpY + rVolute + 25);
  ctx.fillText(`SPEED: ${N.toFixed(0)} RPM`, pumpX - 45, pumpY + rVolute + 40);

  // Top Telemetry HUD
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(plotLeft, 10, w - plotLeft - 20, 32);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(plotLeft, 10, w - plotLeft - 20, 32);

  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`Q_DUTY: ${Qop.toFixed(1)} m³/h`, plotLeft + 15, 30);
  ctx.fillStyle = '#10b981';
  ctx.fillText(`H_DUTY: ${Hop.toFixed(1)} m`, plotLeft + 180, 30);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`BHP: ${PshaftKw.toFixed(2)} kW`, plotLeft + 330, 30);
  ctx.fillStyle = '#ec4899';
  ctx.fillText(`EFFICIENCY: ${(etaHyd * 100).toFixed(1)}%`, plotLeft + 480, 30);
}

// ---------------------------------------------------------------------------
// 9. VAPOR COMPRESSION REFRIGERATION CYCLE RENDERER (ASHRAE 15 / ISO 5149)
// ---------------------------------------------------------------------------
export interface RefrigerationParams {
  evapTemp: number; // °C
  condTemp: number; // °C
  subcooling: number; // K
  superheat: number; // K
  compressorEff: number; // %
  coolingCapacityKw: number; // kW
}

export function renderRefrigerationCycle(rc: RenderContext, p: RefrigerationParams) {
  const { ctx, w, h, t } = rc;
  const Tevap = p.evapTemp !== undefined ? p.evapTemp : -5.0;
  const Tcond = p.condTemp !== undefined ? p.condTemp : 45.0;
  const dSub = p.subcooling || 5.0;
  const dSup = p.superheat || 6.0;
  const etaIsen = (p.compressorEff || 75.0) / 100.0;
  const Qcap = p.coolingCapacityKw || 10.0;

  const Pevap = Math.exp(10.5 - 2400.0 / (Tevap + 273.15));
  const Pcond = Math.exp(10.5 - 2400.0 / (Tcond + 273.15));

  const h1 = 398.0 + 0.85 * (Tevap + dSup);
  const h2s = h1 + 35.0 * Math.pow(Pcond / Math.max(0.1, Pevap), 0.28);
  const h2 = h1 + (h2s - h1) / etaIsen;
  const h3 = 200.0 + 1.4 * (Tcond - dSub);
  const h4 = h3;

  const qEvap = h1 - h4;
  const wComp = h2 - h1;
  const copR = Math.max(0.1, qEvap / Math.max(0.1, wComp));
  const copCarnot = (Tevap + 273.15) / Math.max(1, (Tcond - Tevap));
  const etaII = (copR / copCarnot) * 100.0;
  const mFlow = Qcap / Math.max(1, qEvap);
  const PcompKw = mFlow * wComp;

  // Canvas clear
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, w, h);

  // Left 62% is P-h diagram, Right 38% is animated physical refrigeration circuit
  const plotLeft = 60;
  const plotRight = Math.floor(w * 0.62);
  const plotTop = 50;
  const plotBottom = h - 50;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;

  // Grid
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
  ctx.lineWidth = 1;
  ctx.strokeRect(plotLeft, plotTop, plotW, plotH);

  // Saturation Dome Coordinates (R134a representative P-h dome)
  const hMin = 150;
  const hMax = 460;
  const pMinLog = Math.log(1.0);
  const pMaxLog = Math.log(30.0);

  const toPx = (hVal: number) => plotLeft + ((hVal - hMin) / (hMax - hMin)) * plotW;
  const toPy = (pBar: number) => {
    const lP = Math.log(Math.max(1.0, pBar));
    return plotBottom - ((lP - pMinLog) / (pMaxLog - pMinLog)) * plotH;
  };

  // Draw Saturation Dome
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const domePts = [
    { h: 180, p: 1.2 }, { h: 200, p: 2.5 }, { h: 220, p: 5.0 }, { h: 245, p: 10.0 },
    { h: 275, p: 18.0 }, { h: 300, p: 25.0 }, // Critical point
    { h: 325, p: 23.0 }, { h: 360, p: 18.0 }, { h: 390, p: 10.0 }, { h: 405, p: 5.0 },
    { h: 418, p: 2.5 }, { h: 425, p: 1.2 }
  ];
  for (let i = 0; i < domePts.length; i++) {
    const sx = toPx(domePts[i].h);
    const sy = toPy(domePts[i].p);
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // P-h Cycle Loop: 1 -> 2 -> 3 -> 4 -> 1
  const pt1 = { x: toPx(h1), y: toPy(Pevap) };
  const pt2 = { x: toPx(h2), y: toPy(Pcond) };
  const pt3 = { x: toPx(h3), y: toPy(Pcond) };
  const pt4 = { x: toPx(h4), y: toPy(Pevap) };

  // Evaporation Line (4 -> 1) - Cyan (Heat absorbed)
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pt4.x, pt4.y);
  ctx.lineTo(pt1.x, pt1.y);
  ctx.stroke();

  // Compression Line (1 -> 2) - Rose (Work input)
  ctx.strokeStyle = '#f43f5e';
  ctx.beginPath();
  ctx.moveTo(pt1.x, pt1.y);
  ctx.lineTo(pt2.x, pt2.y);
  ctx.stroke();

  // Condensation Line (2 -> 3) - Amber (Heat rejected)
  ctx.strokeStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(pt2.x, pt2.y);
  ctx.lineTo(pt3.x, pt3.y);
  ctx.stroke();

  // Expansion Valve Throttling (3 -> 4) - Emerald (Isenthalpic drop)
  ctx.strokeStyle = '#10b981';
  ctx.beginPath();
  ctx.moveTo(pt3.x, pt3.y);
  ctx.lineTo(pt4.x, pt4.y);
  ctx.stroke();

  // State Point markers
  const states = [
    { pt: pt1, lbl: '1: Evap Out', color: '#06b6d4' },
    { pt: pt2, lbl: '2: Comp Out', color: '#f43f5e' },
    { pt: pt3, lbl: '3: Cond Out', color: '#f59e0b' },
    { pt: pt4, lbl: '4: Exp Out', color: '#10b981' }
  ];

  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  states.forEach(s => {
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.pt.x, s.pt.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(s.lbl, s.pt.x + 6, s.pt.y - 4);
  });

  // Schematic Equipment Loop on right side
  const schX = plotRight + 25;
  const schW = w - schX - 25;
  const schMidX = schX + schW * 0.5;

  const compBoxY = plotTop + 25;
  const condBoxY = plotTop + plotH * 0.45;
  const expBoxY = plotTop + plotH * 0.75;
  const evapBoxY = plotTop + plotH * 0.45;

  // Draw equipment blocks
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';

  // Compressor (Top)
  ctx.fillStyle = '#1e1b4b';
  ctx.strokeStyle = '#818cf8';
  ctx.lineWidth = 1.5;
  ctx.fillRect(schMidX - 45, compBoxY - 14, 90, 28);
  ctx.strokeRect(schMidX - 45, compBoxY - 14, 90, 28);
  ctx.fillStyle = '#c7d2fe';
  ctx.fillText('COMPRESSOR', schMidX - 32, compBoxY + 3);

  // Condenser (Right)
  const condX = schMidX + schW * 0.35;
  ctx.fillStyle = '#451a03';
  ctx.strokeStyle = '#f59e0b';
  ctx.fillRect(condX - 35, condBoxY - 20, 70, 40);
  ctx.strokeRect(condX - 35, condBoxY - 20, 70, 40);
  ctx.fillStyle = '#fde68a';
  ctx.fillText('CONDENSER', condX - 28, condBoxY + 4);

  // Expansion Valve (Bottom)
  ctx.fillStyle = '#064e3b';
  ctx.strokeStyle = '#10b981';
  ctx.fillRect(schMidX - 35, expBoxY - 12, 70, 24);
  ctx.strokeRect(schMidX - 35, expBoxY - 12, 70, 24);
  ctx.fillStyle = '#a7f3d0';
  ctx.fillText('TXV VALVE', schMidX - 26, expBoxY + 4);

  // Evaporator (Left)
  const evapX = schMidX - schW * 0.35;
  ctx.fillStyle = '#083344';
  ctx.strokeStyle = '#06b6d4';
  ctx.fillRect(evapX - 35, evapBoxY - 20, 70, 40);
  ctx.strokeRect(evapX - 35, evapBoxY - 20, 70, 40);
  ctx.fillStyle = '#a5f3fc';
  ctx.fillText('EVAPORATOR', evapX - 30, evapBoxY + 4);

  // Connect equipment lines with flow pulses
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  // 1 -> Compressor
  ctx.moveTo(evapX, evapBoxY - 20);
  ctx.lineTo(evapX, compBoxY);
  ctx.lineTo(schMidX - 45, compBoxY);
  // Compressor -> Condenser
  ctx.moveTo(schMidX + 45, compBoxY);
  ctx.lineTo(condX, compBoxY);
  ctx.lineTo(condX, condBoxY - 20);
  // Condenser -> Expansion
  ctx.moveTo(condX, condBoxY + 20);
  ctx.lineTo(condX, expBoxY);
  ctx.lineTo(schMidX + 35, expBoxY);
  // Expansion -> Evaporator
  ctx.moveTo(schMidX - 35, expBoxY);
  ctx.lineTo(evapX, expBoxY);
  ctx.lineTo(evapX, evapBoxY + 20);
  ctx.stroke();

  // Top Telemetry HUD
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(plotLeft, 10, w - plotLeft - 20, 32);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(plotLeft, 10, w - plotLeft - 20, 32);

  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#10b981';
  ctx.fillText(`COP_R: ${copR.toFixed(2)} (COP_HP: ${(copR + 1).toFixed(2)})`, plotLeft + 15, 30);
  ctx.fillStyle = '#f43f5e';
  ctx.fillText(`POWER: ${PcompKw.toFixed(2)} kW`, plotLeft + 230, 30);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`CARNOT η_II: ${etaII.toFixed(1)}%`, plotLeft + 380, 30);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`FLOW: ${(mFlow * 3600).toFixed(0)} kg/h`, plotLeft + plotW - 60, 30);
}


