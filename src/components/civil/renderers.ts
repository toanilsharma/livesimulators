// High-fidelity HTML5 Canvas Renderers for Civil & Structural Engineering Simulators

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  dt: number;
  t: number;
}

// =========================================================================
// RENDERER 1: Euler-Bernoulli Beam Deflection, Shear & Moment
// =========================================================================
export interface BeamBendingParams {
  lengthL: number; // m
  supportType: 'simply_supported' | 'cantilever' | 'propped_cantilever';
  pointLoadP: number; // kN
  pointLoadPos: number; // m
  udlQ: number; // kN/m
  elasticModulusE: number; // GPa
  momentOfInertiaI: number; // 10^6 mm^4 = 10^-6 m^4
  beamDepth: number; // mm
  reactionA: number; // kN
  reactionB: number; // kN
  maxDeflectionMm: number; // mm
  maxMomentKnm: number; // kN·m
  maxStressMpa: number; // MPa
  deflectionLimitAisc: number; // mm (L/360)
  isDeflectionPass: boolean;
}

export function renderBeamBending(rc: RenderContext, p: BeamBendingParams) {
  const { ctx, w, h, t } = rc;

  // Title / Schema header watermark
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('AISC 360-16 / EUROCODE 3 • EULER-BERNOULLI BEAM SOLVER', 18, 22);

  const startX = 50;
  const endX = w - 50;
  const spanPx = endX - startX;
  const beamY = 100;
  const beamHeight = 12;

  // 1. Draw Supports
  ctx.fillStyle = '#64748b';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;

  if (p.supportType === 'simply_supported') {
    // Left Support: Pin Hinge
    ctx.beginPath();
    ctx.moveTo(startX, beamY + beamHeight / 2);
    ctx.lineTo(startX - 12, beamY + beamHeight / 2 + 20);
    ctx.lineTo(startX + 12, beamY + beamHeight / 2 + 20);
    ctx.closePath();
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.stroke();

    // Ground hatching under pin
    ctx.beginPath();
    ctx.moveTo(startX - 18, beamY + beamHeight / 2 + 20);
    ctx.lineTo(startX + 18, beamY + beamHeight / 2 + 20);
    ctx.stroke();

    // Reaction arrow RA
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, beamY + beamHeight / 2 + 45);
    ctx.lineTo(startX, beamY + beamHeight / 2 + 22);
    ctx.stroke();
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(startX, beamY + beamHeight / 2 + 22);
    ctx.lineTo(startX - 4, beamY + beamHeight / 2 + 29);
    ctx.lineTo(startX + 4, beamY + beamHeight / 2 + 29);
    ctx.closePath();
    ctx.fill();
    ctx.font = '10px monospace';
    ctx.fillText(`RA = ${p.reactionA.toFixed(1)} kN`, startX - 25, beamY + beamHeight / 2 + 58);

    // Right Support: Roller
    ctx.beginPath();
    ctx.moveTo(endX, beamY + beamHeight / 2);
    ctx.lineTo(endX - 12, beamY + beamHeight / 2 + 15);
    ctx.lineTo(endX + 12, beamY + beamHeight / 2 + 15);
    ctx.closePath();
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.stroke();

    // Roller wheels
    ctx.beginPath();
    ctx.arc(endX - 6, beamY + beamHeight / 2 + 19, 3, 0, Math.PI * 2);
    ctx.arc(endX + 6, beamY + beamHeight / 2 + 19, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#94a3b8';
    ctx.fill();

    // Reaction arrow RB
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(endX, beamY + beamHeight / 2 + 45);
    ctx.lineTo(endX, beamY + beamHeight / 2 + 24);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(endX, beamY + beamHeight / 2 + 24);
    ctx.lineTo(endX - 4, beamY + beamHeight / 2 + 31);
    ctx.lineTo(endX + 4, beamY + beamHeight / 2 + 31);
    ctx.closePath();
    ctx.fill();
    ctx.fillText(`RB = ${p.reactionB.toFixed(1)} kN`, endX - 25, beamY + beamHeight / 2 + 58);

  } else if (p.supportType === 'cantilever') {
    // Left Support: Fixed Wall Clamped
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(startX - 20, beamY - 40, 20, 90);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(startX - 20, beamY - 40, 20, 90);

    // Wall hatching
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    for (let y = beamY - 35; y <= beamY + 45; y += 8) {
      ctx.beginPath();
      ctx.moveTo(startX - 20, y);
      ctx.lineTo(startX - 10, y - 8);
      ctx.stroke();
    }

    // Fixed wall moment & reaction
    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px monospace';
    ctx.fillText(`RA = ${p.reactionA.toFixed(1)} kN`, startX + 6, beamY + 40);
    ctx.fillText(`MA = ${p.maxMomentKnm.toFixed(1)} kN·m`, startX + 6, beamY + 54);

  } else {
    // Propped cantilever (Left fixed, right roller)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(startX - 20, beamY - 40, 20, 90);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(startX - 20, beamY - 40, 20, 90);

    // Roller at endX
    ctx.beginPath();
    ctx.moveTo(endX, beamY + beamHeight / 2);
    ctx.lineTo(endX - 12, beamY + beamHeight / 2 + 15);
    ctx.lineTo(endX + 12, beamY + beamHeight / 2 + 15);
    ctx.closePath();
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px monospace';
    ctx.fillText(`RB = ${p.reactionB.toFixed(1)} kN`, endX - 25, beamY + beamHeight / 2 + 42);
  }

  // 2. Draw Uniformly Distributed Load (UDL q)
  if (p.udlQ > 0) {
    const udlY = beamY - 30;
    ctx.strokeStyle = '#f59e0b';
    ctx.fillStyle = '#f59e0b';
    ctx.lineWidth = 1.2;

    // Horizontal distributor line
    ctx.beginPath();
    ctx.moveTo(startX, udlY);
    ctx.lineTo(endX, udlY);
    ctx.stroke();

    // Arrows downward
    const numArrows = 16;
    for (let i = 0; i <= numArrows; i++) {
      const ax = startX + (i / numArrows) * spanPx;
      ctx.beginPath();
      ctx.moveTo(ax, udlY);
      ctx.lineTo(ax, beamY - 2);
      ctx.stroke();

      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(ax, beamY - 2);
      ctx.lineTo(ax - 3, beamY - 7);
      ctx.lineTo(ax + 3, beamY - 7);
      ctx.closePath();
      ctx.fill();
    }
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`UDL q = ${p.udlQ.toFixed(1)} kN/m`, (startX + endX) / 2 - 50, udlY - 6);
  }

  // 3. Draw Concentrated Point Load (P)
  if (p.pointLoadP > 0) {
    const frac = Math.max(0, Math.min(1, p.pointLoadPos / p.lengthL));
    const px = startX + frac * spanPx;
    const py = beamY - 55;

    ctx.strokeStyle = '#ec4899';
    ctx.fillStyle = '#ec4899';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, beamY - 2);
    ctx.stroke();

    // Big Arrowhead
    ctx.beginPath();
    ctx.moveTo(px, beamY - 2);
    ctx.lineTo(px - 5, beamY - 12);
    ctx.lineTo(px + 5, beamY - 12);
    ctx.closePath();
    ctx.fill();

    ctx.font = 'bold 11px monospace';
    ctx.fillText(`P = ${p.pointLoadP.toFixed(0)} kN`, px - 25, py - 4);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(`x = ${p.pointLoadPos.toFixed(1)} m`, px - 20, py + 12);
  }

  // 4. Elastic Deflection Curve (Deformed Shape)
  // Scale deflection visibly on canvas
  const deflectionScale = 1.2; // visual multiplier
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#38bdf8';

  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const xRatio = i / steps;
    const xMeters = xRatio * p.lengthL;
    const canvasX = startX + xRatio * spanPx;

    // Approximate analytical deflection function for display
    let localDeflection = 0;
    if (p.supportType === 'simply_supported') {
      // w(x) = (q*x/(24*E*I))*(L^3 - 2*L*x^2 + x^3) + point load component
      const uShape = Math.sin(Math.PI * xRatio);
      localDeflection = p.maxDeflectionMm * uShape;
    } else if (p.supportType === 'cantilever') {
      // Max at tip: w(x) ~ x^2*(3L - x)
      const cShape = Math.pow(xRatio, 2) * (3 - xRatio) / 2;
      localDeflection = p.maxDeflectionMm * cShape;
    } else {
      const pShape = Math.sin(Math.PI * Math.pow(xRatio, 0.8)) * (1 - 0.3 * xRatio);
      localDeflection = p.maxDeflectionMm * pShape;
    }

    const canvasY = beamY + localDeflection * deflectionScale;

    if (i === 0) {
      ctx.moveTo(canvasX, canvasY);
    } else {
      ctx.lineTo(canvasX, canvasY);
    }
  }
  ctx.stroke();

  // Neutral axis / undeflected reference line
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(startX, beamY);
  ctx.lineTo(endX, beamY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Max deflection marker
  ctx.fillStyle = '#38bdf8';
  ctx.font = '10px monospace';
  ctx.fillText(`δ_max = ${p.maxDeflectionMm.toFixed(2)} mm (Allowable L/360: ${p.deflectionLimitAisc.toFixed(1)} mm)`, startX + spanPx * 0.35, beamY + 36);

  // =========================================================================
  // 5. SHEAR FORCE DIAGRAM (SFD)
  // =========================================================================
  const sfdBaseY = 220;
  const sfdHeight = 35;
  
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('SHEAR FORCE DIAGRAM V(x) [kN]', startX, sfdBaseY - sfdHeight - 6);

  // SFD Zero Baseline
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(startX, sfdBaseY);
  ctx.lineTo(endX, sfdBaseY);
  ctx.stroke();

  // Calculate and draw SFD curve
  ctx.beginPath();
  ctx.moveTo(startX, sfdBaseY);
  const maxVScale = Math.max(10, Math.abs(p.reactionA), Math.abs(p.reactionB), p.pointLoadP + p.udlQ * p.lengthL);

  for (let i = 0; i <= steps; i++) {
    const xRatio = i / steps;
    const xM = xRatio * p.lengthL;
    const canvasX = startX + xRatio * spanPx;

    // V(x) calculation
    let Vx = 0;
    if (p.supportType === 'simply_supported') {
      Vx = p.reactionA - p.udlQ * xM;
      if (xM > p.pointLoadPos) {
        Vx -= p.pointLoadP;
      }
    } else if (p.supportType === 'cantilever') {
      Vx = -p.udlQ * (p.lengthL - xM);
      if (xM <= p.pointLoadPos) {
        Vx -= p.pointLoadP;
      }
    } else {
      Vx = p.reactionA - p.udlQ * xM;
      if (xM > p.pointLoadPos) Vx -= p.pointLoadP;
    }

    const normY = sfdBaseY - (Vx / maxVScale) * sfdHeight;
    ctx.lineTo(canvasX, normY);
  }
  ctx.lineTo(endX, sfdBaseY);
  ctx.closePath();

  // SFD Fill & Stroke
  ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
  ctx.fill();
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Label V_max
  ctx.fillStyle = '#10b981';
  ctx.font = '10px monospace';
  ctx.fillText(`+${p.reactionA.toFixed(1)} kN`, startX + 4, sfdBaseY - (p.reactionA / maxVScale) * sfdHeight - 4);
  if (p.supportType === 'simply_supported') {
    ctx.fillText(`-${p.reactionB.toFixed(1)} kN`, endX - 55, sfdBaseY + (p.reactionB / maxVScale) * sfdHeight + 12);
  }

  // =========================================================================
  // 6. BENDING MOMENT DIAGRAM (BMD)
  // =========================================================================
  const bmdBaseY = 320;
  const bmdHeight = 40;

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('BENDING MOMENT DIAGRAM M(x) [kN·m]', startX, bmdBaseY - bmdHeight - 6);

  // BMD Zero Baseline
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(startX, bmdBaseY);
  ctx.lineTo(endX, bmdBaseY);
  ctx.stroke();

  // Calculate and draw BMD curve
  ctx.beginPath();
  ctx.moveTo(startX, bmdBaseY);
  const maxMScale = Math.max(5, p.maxMomentKnm * 1.15);

  for (let i = 0; i <= steps; i++) {
    const xRatio = i / steps;
    const xM = xRatio * p.lengthL;
    const canvasX = startX + xRatio * spanPx;

    let Mx = 0;
    if (p.supportType === 'simply_supported') {
      // M(x) = RA * x - q * x^2 / 2 - (P * (x - a) if x > a)
      Mx = p.reactionA * xM - 0.5 * p.udlQ * Math.pow(xM, 2);
      if (xM > p.pointLoadPos) {
        Mx -= p.pointLoadP * (xM - p.pointLoadPos);
      }
    } else if (p.supportType === 'cantilever') {
      // Cantilever: Hogging moment (negative)
      const distFromTip = p.lengthL - xM;
      Mx = -0.5 * p.udlQ * Math.pow(distFromTip, 2);
      if (p.pointLoadPos >= xM) {
        Mx -= p.pointLoadP * (p.pointLoadPos - xM);
      }
    } else {
      Mx = p.reactionA * xM - 0.5 * p.udlQ * Math.pow(xM, 2);
      if (xM > p.pointLoadPos) Mx -= p.pointLoadP * (xM - p.pointLoadPos);
      Mx -= 0.15 * p.maxMomentKnm; // fixed end negative moment
    }

    // Plotted with tension side down (standard structural convention)
    const normY = bmdBaseY + (Mx / maxMScale) * bmdHeight;
    ctx.lineTo(canvasX, normY);
  }
  ctx.lineTo(endX, bmdBaseY);
  ctx.closePath();

  // BMD Fill & Stroke
  ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Peak moment marker
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 10px monospace';
  ctx.fillText(`M_max = ${p.maxMomentKnm.toFixed(1)} kN·m`, startX + spanPx * 0.45, bmdBaseY + bmdHeight + 14);

  // Status Chip (AISC Deflection Check)
  ctx.font = 'bold 10px monospace';
  if (p.isDeflectionPass) {
    ctx.fillStyle = '#10b981';
    ctx.fillText('✓ AISC L/360 SERVICEABILITY PASS', endX - 220, 22);
  } else {
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('⚠ DEFLECTION EXCEEDS AISC L/360', endX - 210, 22);
  }
}

// =========================================================================
// RENDERER 2: Warren & Pratt Truss Bridge Analysis
// =========================================================================
export interface TrussParams {
  trussType: 'warren' | 'pratt' | 'howe';
  spanM: number;
  heightM: number;
  truckPosFraction: number; // 0.0 to 1.0
  liveLoadP: number; // kN
  deadLoadNode: number; // kN per bottom node
  materialYieldMpa: number; // MPa
  members: {
    id: string;
    from: [number, number];
    to: [number, number];
    forceKn: number;
    isTension: boolean;
    isZero: boolean;
    stressRatio: number;
  }[];
  reactionLeftKn: number;
  reactionRightKn: number;
  maxTensionKn: number;
  maxCompressionKn: number;
  eulerCriticalKn: number;
}

export function renderTrussAnalysis(rc: RenderContext, p: TrussParams) {
  const { ctx, w, h, t } = rc;

  // Header Title
  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#10b981';
  ctx.fillText('AASHTO LRFD / METHOD OF JOINTS • PLANE TRUSS BRIDGE SOLVER', 18, 22);

  const startX = 60;
  const endX = w - 60;
  const bridgeSpanPx = endX - startX;
  const botY = 240;
  const topY = 110;
  const riverY = botY + 45;

  // 1. Draw River & Abutment Piers
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(startX - 30, botY, 30, 80);
  ctx.fillRect(endX, botY, 30, 80);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(startX - 30, botY, 30, 80);
  ctx.strokeRect(endX, botY, 30, 80);

  // Water background
  ctx.fillStyle = '#082f49';
  ctx.fillRect(startX, riverY, bridgeSpanPx, 50);
  // Animated water ripples
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const yW = riverY + 12 + i * 10;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += 15) {
      const dy = Math.sin(x * 0.04 + t * 2 + i) * 2;
      if (x === startX) ctx.moveTo(x, yW + dy);
      else ctx.lineTo(x, yW + dy);
    }
    ctx.stroke();
  }

  // 2. Abutment Reactions (Upward Vectors)
  ctx.strokeStyle = '#10b981';
  ctx.fillStyle = '#10b981';
  ctx.lineWidth = 2.5;

  // RA
  ctx.beginPath();
  ctx.moveTo(startX, botY + 45);
  ctx.lineTo(startX, botY + 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(startX, botY + 8);
  ctx.lineTo(startX - 4, botY + 16);
  ctx.lineTo(startX + 4, botY + 16);
  ctx.closePath();
  ctx.fill();
  ctx.font = '10px monospace';
  ctx.fillText(`RA = ${p.reactionLeftKn.toFixed(1)} kN`, startX - 25, botY + 58);

  // RB
  ctx.beginPath();
  ctx.moveTo(endX, botY + 45);
  ctx.lineTo(endX, botY + 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(endX, botY + 8);
  ctx.lineTo(endX - 4, botY + 16);
  ctx.lineTo(endX + 4, botY + 16);
  ctx.closePath();
  ctx.fill();
  ctx.fillText(`RB = ${p.reactionRightKn.toFixed(1)} kN`, endX - 25, botY + 58);

  // 3. Draw Truss Members (Color-coded: Blue/Cyan = Tension, Red/Orange = Compression, Gray = Zero-force)
  p.members.forEach((m) => {
    const x1 = startX + m.from[0] * bridgeSpanPx;
    const y1 = botY - m.from[1] * (botY - topY);
    const x2 = startX + m.to[0] * bridgeSpanPx;
    const y2 = botY - m.to[1] * (botY - topY);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);

    if (m.isZero) {
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (m.isTension) {
      // Tension (T) -> Cyan
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.5 + Math.min(4, m.stressRatio * 4.5);
      ctx.stroke();
    } else {
      // Compression (C) -> Orange / Coral
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5 + Math.min(4, m.stressRatio * 4.5);
      ctx.stroke();
    }
  });

  // 4. Draw Truss Joints / Nodal Pins
  const nodes = [
    // Bottom Chord (y=0)
    [0, 0], [0.166, 0], [0.333, 0], [0.5, 0], [0.666, 0], [0.833, 0], [1.0, 0],
    // Top Chord (y=1)
    [0.166, 1], [0.333, 1], [0.5, 1], [0.666, 1], [0.833, 1]
  ];

  nodes.forEach(([nx, ny]) => {
    const cx = startX + nx * bridgeSpanPx;
    const cy = botY - ny * (botY - topY);

    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Central bolt
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.fill();
  });

  // 5. Draw Moving Live Truck / Concentrated Load along bridge deck
  const truckX = startX + p.truckPosFraction * bridgeSpanPx;
  const truckY = botY - 14;

  // Truck Icon / Body
  ctx.fillStyle = '#eab308';
  ctx.fillRect(truckX - 16, truckY - 10, 32, 10);
  ctx.fillStyle = '#ca8a04';
  ctx.fillRect(truckX + 4, truckY - 18, 12, 8); // Cabin
  // Wheels
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(truckX - 10, truckY, 3.5, 0, Math.PI * 2);
  ctx.arc(truckX + 10, truckY, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Live Load Downward Force Arrow
  ctx.strokeStyle = '#eab308';
  ctx.fillStyle = '#eab308';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(truckX, truckY - 32);
  ctx.lineTo(truckX, truckY - 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(truckX, truckY - 20);
  ctx.lineTo(truckX - 4, truckY - 26);
  ctx.lineTo(truckX + 4, truckY - 26);
  ctx.closePath();
  ctx.fill();

  ctx.font = 'bold 10px monospace';
  ctx.fillText(`P_live = ${p.liveLoadP} kN`, truckX - 35, truckY - 36);

  // 6. Member State Legend & Critical Euler Buckling Inspection Strip
  const legendY = 320;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(startX, legendY, bridgeSpanPx, 48);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(startX, legendY, bridgeSpanPx, 48);

  // Legend Items
  ctx.font = '10px monospace';
  // Tension
  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(startX + 15, legendY + 12, 14, 4);
  ctx.fillText(`TENSION (T): Max +${p.maxTensionKn.toFixed(1)} kN`, startX + 36, legendY + 18);

  // Compression
  ctx.fillStyle = '#f97316';
  ctx.fillRect(startX + 15, legendY + 28, 14, 4);
  ctx.fillText(`COMPRESSION (C): Max -${p.maxCompressionKn.toFixed(1)} kN (Euler P_cr = ${p.eulerCriticalKn.toFixed(1)} kN)`, startX + 36, legendY + 34);

  // Zero-force
  ctx.fillStyle = '#64748b';
  ctx.fillText('--- ZERO-FORCE MEMBER', startX + bridgeSpanPx - 160, legendY + 18);
  const bucklingOk = p.maxCompressionKn <= p.eulerCriticalKn;
  ctx.fillStyle = bucklingOk ? '#10b981' : '#f43f5e';
  ctx.fillText(bucklingOk ? '✓ BUCKLING SAFE' : '⚠ BUCKLING RISK', startX + bridgeSpanPx - 160, legendY + 34);
}

// =========================================================================
// RENDERER 3: Seismic Base Isolation & Dynamic Response
// =========================================================================
export interface SeismicParams {
  systemType: 'fixed_base' | 'isolated';
  pgaG: number; // g
  earthquakeFreqHz: number; // Hz
  soilStiffness: 'rock' | 'dense_soil' | 'soft_clay';
  leadCoreDiameterMm: number;
  dampingRatioZeta: number; // %
  timePeriodTn: number; // s
  maxRoofDriftMm: number;
  baseShearVbKn: number;
  driftLimitAsce: number; // mm
  isDriftPass: boolean;
  seismicHistory: number[];
  driftHistory: number[];
}

export function renderSeismicIsolation(rc: RenderContext, p: SeismicParams) {
  const { ctx, w, h, t } = rc;

  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#ec4899';
  ctx.fillText('ASCE 7-22 / EUROCODE 8 • SEISMIC MULTI-STORY ISOLATION DYNAMICS', 18, 22);

  const groundY = 270;
  const groundShaking = Math.sin(t * p.earthquakeFreqHz * 2 * Math.PI) * (p.pgaG * 25);

  // 1. Shaking Bedrock / Soil Foundation
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(30, groundY, w - 60, 95);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(30, groundY, w - 60, 95);

  // Soil seismic shear wave propagation lines
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  for (let y = groundY + 15; y < groundY + 90; y += 16) {
    ctx.beginPath();
    for (let x = 30; x <= w - 30; x += 10) {
      const wave = Math.sin(x * 0.05 - t * 6 + y * 0.1) * (p.pgaG * 4);
      if (x === 30) ctx.moveTo(x, y + wave);
      else ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }

  // Foundation Ground Acceleration Vector
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '10px monospace';
  ctx.fillText(`GROUND EXCITATION: PGA = ${p.pgaG.toFixed(2)}g (f = ${p.earthquakeFreqHz.toFixed(1)} Hz)`, 45, groundY + 30);
  ctx.fillText(`SOIL DEPOSIT: ${p.soilStiffness.toUpperCase()} | Tn = ${p.timePeriodTn.toFixed(2)} s`, 45, groundY + 48);

  // 2. Comparison Building Frame Setup
  // We draw the active building model in the center
  const bldgWidth = 140;
  const storyHeight = 38;
  const numStories = 4;
  const centerX = w / 2 + groundShaking;

  if (p.systemType === 'isolated') {
    // -------------------------------------------------------------
    // BASE-ISOLATED BUILDING (with Elastomeric Lead-Rubber Bearings)
    // -------------------------------------------------------------
    const isolatorY = groundY - 18;
    const bearingHeight = 18;
    const isolatorShearX = -groundShaking * 0.82; // Bearing accommodates shear strain

    // Draw Left & Right Isolator Bearings
    const bearingLeftX = centerX - bldgWidth / 2 + 10;
    const bearingRightX = centerX + bldgWidth / 2 - 30;

    [bearingLeftX, bearingRightX].forEach((bx) => {
      // Bottom mounting plate
      ctx.fillStyle = '#475569';
      ctx.fillRect(bx, groundY - 4, 28, 4);

      // Rubber-Steel alternating laminate layers (distorted by shear)
      for (let lyr = 0; lyr < 5; lyr++) {
        const lyY = groundY - 4 - (lyr + 1) * 2.8;
        const shiftX = (lyr / 5) * isolatorShearX;
        ctx.fillStyle = lyr % 2 === 0 ? '#1e293b' : '#64748b';
        ctx.fillRect(bx + shiftX, lyY, 28, 2.5);
      }

      // Central Lead Core Plug
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(bx + 11 + isolatorShearX * 0.5, groundY - 16, 6, 12);

      // Top mounting plate
      ctx.fillStyle = '#475569';
      ctx.fillRect(bx + isolatorShearX, isolatorY, 28, 4);
    });

    // Rigid Superstructure Base Slab
    const superstructureBaseX = centerX + isolatorShearX;
    const baseSlabY = isolatorY - 8;
    ctx.fillStyle = '#334155';
    ctx.fillRect(superstructureBaseX - bldgWidth / 2, baseSlabY, bldgWidth, 8);

    // Superstructure floors (nearly rigid body motion - minimal inter-story drift!)
    for (let s = 0; s < numStories; s++) {
      const flY = baseSlabY - (s + 1) * storyHeight;
      // Slight elastic drift
      const storyDrift = (s / numStories) * (p.maxRoofDriftMm * 0.15);
      const floorX = superstructureBaseX + storyDrift;

      // Floor slab
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(floorX - bldgWidth / 2, flY, bldgWidth, 6);
      ctx.strokeStyle = '#06b6d4';
      ctx.strokeRect(floorX - bldgWidth / 2, flY, bldgWidth, 6);

      // Columns
      const prevY = flY + storyHeight;
      const prevX = superstructureBaseX + ((s - 1) / numStories) * (p.maxRoofDriftMm * 0.15);

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      // Left Column
      ctx.beginPath();
      ctx.moveTo(prevX - bldgWidth / 2 + 10, prevY);
      ctx.lineTo(floorX - bldgWidth / 2 + 10, flY + 6);
      ctx.stroke();

      // Right Column
      ctx.beginPath();
      ctx.moveTo(prevX + bldgWidth / 2 - 10, prevY);
      ctx.lineTo(floorX + bldgWidth / 2 - 10, flY + 6);
      ctx.stroke();

      // Interior Cross Bracing or windows
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fillRect(floorX - 35, flY + 10, 30, 20);
      ctx.fillRect(floorX + 5, flY + 10, 30, 20);
    }

    // Label on structure
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('BASE-ISOLATED: 85% SEISMIC ENERGY ABSORBED IN BEARINGS', superstructureBaseX - 110, 50);

  } else {
    // -------------------------------------------------------------
    // FIXED-BASE BUILDING (Violent Inter-Story Racking Shear Drift)
    // -------------------------------------------------------------
    const baseSlabY = groundY - 6;
    ctx.fillStyle = '#475569';
    ctx.fillRect(centerX - bldgWidth / 2, baseSlabY, bldgWidth, 6);

    // Columns bending violently with large cumulative racking drift
    let currentDrift = 0;
    for (let s = 0; s < numStories; s++) {
      const flY = baseSlabY - (s + 1) * storyHeight;
      const storyDriftInc = Math.sin(t * p.earthquakeFreqHz * 2 * Math.PI + s * 0.5) * (p.maxRoofDriftMm * 0.6);
      currentDrift += storyDriftInc;
      const floorX = centerX + currentDrift;

      // Floor slab
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(floorX - bldgWidth / 2, flY, bldgWidth, 6);
      ctx.strokeStyle = '#f43f5e';
      ctx.strokeRect(floorX - bldgWidth / 2, flY, bldgWidth, 6);

      // Columns (bent with high plastic hinge stress)
      const prevY = flY + storyHeight;
      const prevX = centerX + (currentDrift - storyDriftInc);

      ctx.strokeStyle = Math.abs(storyDriftInc) > 8 ? '#f43f5e' : '#f59e0b';
      ctx.lineWidth = 3;

      // Left Column
      ctx.beginPath();
      ctx.moveTo(prevX - bldgWidth / 2 + 10, prevY);
      ctx.bezierCurveTo(
        prevX - bldgWidth / 2 + 10, prevY - 15,
        floorX - bldgWidth / 2 + 10, flY + 20,
        floorX - bldgWidth / 2 + 10, flY + 6
      );
      ctx.stroke();

      // Right Column
      ctx.beginPath();
      ctx.moveTo(prevX + bldgWidth / 2 - 10, prevY);
      ctx.bezierCurveTo(
        prevX + bldgWidth / 2 - 10, prevY - 15,
        floorX + bldgWidth / 2 - 10, flY + 20,
        floorX + bldgWidth / 2 - 10, flY + 6
      );
      ctx.stroke();

      // Flashing Plastic Hinge warning dots
      if (Math.abs(storyDriftInc) > 8) {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(prevX - bldgWidth / 2 + 10, prevY, 4, 0, Math.PI * 2);
        ctx.arc(floorX - bldgWidth / 2 + 10, flY + 6, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('FIXED-BASE: HIGH INTER-STORY DRIFT & PLASTIC HINGE STRESS', centerX - 130, 50);
  }

  // 3. Right Corner Scope: Real-Time Roof Drift vs ASCE Limit
  const scopeX = w - 210;
  const scopeY = 70;
  ctx.fillStyle = '#020617';
  ctx.fillRect(scopeX, scopeY, 190, 85);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(scopeX, scopeY, 190, 85);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px monospace';
  ctx.fillText('ROOF DRIFT Δ VS ASCE 7-22', scopeX + 8, scopeY + 14);

  // ASCE limit line (red)
  ctx.strokeStyle = '#f43f5e';
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(scopeX + 5, scopeY + 30);
  ctx.lineTo(scopeX + 185, scopeY + 30);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillText(`LIMIT: ${p.driftLimitAsce.toFixed(1)} mm`, scopeX + 110, scopeY + 27);

  // Waveform trace
  ctx.strokeStyle = p.isDriftPass ? '#10b981' : '#f43f5e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let i = 0; i < p.driftHistory.length; i++) {
    const dx = scopeX + 5 + (i / p.driftHistory.length) * 180;
    const dy = scopeY + 55 - (p.driftHistory[i] / Math.max(1, p.driftLimitAsce * 1.5)) * 35;
    if (i === 0) ctx.moveTo(dx, dy);
    else ctx.lineTo(dx, dy);
  }
  ctx.stroke();

  // Drift Pass/Fail badge
  ctx.font = 'bold 10px monospace';
  if (p.isDriftPass) {
    ctx.fillStyle = '#10b981';
    ctx.fillText('✓ ASCE 7-22 DRIFT PASS', scopeX + 8, scopeY + 75);
  } else {
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('⚠ EXCEEDS 2% DRIFT LIMIT', scopeX + 8, scopeY + 75);
  }
}

// =========================================================================
// RENDERER 4: Mohr’s Circle of Stress & Soil Shear Failure
// =========================================================================
export interface MohrParams {
  sigmaX: number; // kPa (Normal Stress X)
  sigmaY: number; // kPa (Normal Stress Y)
  tauXy: number; // kPa (Shear Stress XY)
  cohesionC: number; // kPa (Soil cohesion)
  frictionAnglePhiDeg: number; // deg (Soil friction angle)
  planeAngleThetaDeg: number; // deg (User rotated plane)
  sigmaAvg: number; // kPa
  radiusR: number; // kPa
  sigma1: number; // kPa (Major Principal)
  sigma2: number; // kPa (Minor Principal)
  tauMax: number; // kPa
  principalAngleDeg: number; // deg
  sigmaTheta: number; // kPa on plane theta
  tauTheta: number; // kPa on plane theta
  factorOfSafety: number;
  isShearFailure: boolean;
}

export function renderMohrCircle(rc: RenderContext, p: MohrParams) {
  const { ctx, w, h, t } = rc;

  ctx.font = 'bold 11px monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('ASTM D3080 / EUROCODE 7 • MOHR’S CIRCLE & MOHR-COULOMB SHEAR CRITERION', 18, 22);

  // Left Half: Mohr's Circle in (σ, τ) space
  const circleCenterX = w * 0.32;
  const circleCenterY = 190;
  const maxStressSpan = Math.max(120, p.sigma1 + 40, p.radiusR * 2 + 50);
  const pxPerKpa = 110 / maxStressSpan;

  // Coordinate Axes (Normal Stress σ Horizontal, Shear Stress τ Vertical)
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.2;

  // Horizontal axis (σ)
  ctx.beginPath();
  ctx.moveTo(30, circleCenterY);
  ctx.lineTo(circleCenterX + 160, circleCenterY);
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.fillText('NORMAL STRESS σ [kPa]', circleCenterX + 70, circleCenterY + 16);

  // Vertical axis (τ)
  ctx.beginPath();
  ctx.moveTo(circleCenterX - 110, 45);
  ctx.lineTo(circleCenterX - 110, 335);
  ctx.stroke();
  ctx.fillText('SHEAR τ [kPa]', circleCenterX - 105, 55);

  // Center & Radius in canvas pixels
  const cX = circleCenterX - 110 + p.sigmaAvg * pxPerKpa;
  const cY = circleCenterY;
  const rPx = Math.max(5, p.radiusR * pxPerKpa);

  // 1. Draw Mohr's Circle
  ctx.beginPath();
  ctx.arc(cX, cY, rPx, 0, Math.PI * 2);
  ctx.strokeStyle = p.isShearFailure ? '#f43f5e' : '#06b6d4';
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.fillStyle = p.isShearFailure ? 'rgba(244, 63, 94, 0.12)' : 'rgba(6, 182, 212, 0.1)';
  ctx.fill();

  // Circle Center Point
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(cX, cY, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '9px monospace';
  ctx.fillText(`C (${p.sigmaAvg.toFixed(1)}, 0)`, cX - 25, cY + 15);

  // Principal Stresses Points on Axis (σ1 and σ2)
  const s1X = cX + rPx;
  const s2X = cX - rPx;
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(s1X, cY, 4, 0, Math.PI * 2);
  ctx.arc(s2X, cY, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillText(`σ1 = ${p.sigma1.toFixed(1)}`, s1X - 10, cY - 10);
  ctx.fillText(`σ2 = ${p.sigma2.toFixed(1)}`, s2X - 25, cY - 10);

  // 2. Mohr-Coulomb Failure Envelope Line: τ_f = c + σ * tan(φ)
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 4]);

  const tanPhi = Math.tan((p.frictionAnglePhiDeg * Math.PI) / 180);
  const envStartSigma = 0;
  const envStartTau = p.cohesionC;
  const envEndSigma = maxStressSpan * 1.3;
  const envEndTau = p.cohesionC + envEndSigma * tanPhi;

  const envStartX = circleCenterX - 110 + envStartSigma * pxPerKpa;
  const envStartY = circleCenterY - envStartTau * pxPerKpa;
  const envEndX = circleCenterX - 110 + envEndSigma * pxPerKpa;
  const envEndY = circleCenterY - envEndTau * pxPerKpa;

  ctx.beginPath();
  ctx.moveTo(envStartX, envStartY);
  ctx.lineTo(envEndX, envEndY);
  ctx.stroke();

  // Symmetric lower envelope
  ctx.beginPath();
  ctx.moveTo(envStartX, circleCenterY + envStartTau * pxPerKpa);
  ctx.lineTo(envEndX, circleCenterY + envEndTau * pxPerKpa);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#f59e0b';
  ctx.font = '9px monospace';
  ctx.fillText(`MOHR-COULOMB ENVELOPE: τ = ${p.cohesionC.toFixed(0)} + σ·tan(${p.frictionAnglePhiDeg}°)`, envStartX + 10, envStartY - 10);

  // 3. Current Rotated State Point (2θ angle on circle)
  const angleRad2Theta = (2 * p.planeAngleThetaDeg * Math.PI) / 180;
  const ptX = cX + rPx * Math.cos(angleRad2Theta);
  const ptY = cY - rPx * Math.sin(angleRad2Theta);

  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cX, cY);
  ctx.lineTo(ptX, ptY);
  ctx.stroke();

  ctx.fillStyle = '#ec4899';
  ctx.beginPath();
  ctx.arc(ptX, ptY, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '9px monospace';
  ctx.fillText(`PLANE θ (${p.sigmaTheta.toFixed(1)}, ${p.tauTheta.toFixed(1)})`, ptX + 8, ptY - 4);

  // =========================================================================
  // Right Half: 2D Differential Material / Soil Element (Rotated by θ)
  // =========================================================================
  const elemCenterX = w * 0.76;
  const elemCenterY = 190;
  const elemSize = 65;

  ctx.save();
  ctx.translate(elemCenterX, elemCenterY);
  ctx.rotate((-p.planeAngleThetaDeg * Math.PI) / 180);

  // Element body
  ctx.fillStyle = p.isShearFailure ? 'rgba(244, 63, 94, 0.25)' : '#1e293b';
  ctx.fillRect(-elemSize / 2, -elemSize / 2, elemSize, elemSize);
  ctx.strokeStyle = p.isShearFailure ? '#f43f5e' : '#38bdf8';
  ctx.lineWidth = 2;
  ctx.strokeRect(-elemSize / 2, -elemSize / 2, elemSize, elemSize);

  // If failure, draw dynamic rupture slip crack
  if (p.isShearFailure) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-elemSize / 2, -elemSize / 4);
    ctx.lineTo(elemSize / 2, elemSize / 4);
    ctx.stroke();
  }

  // Normal Stress Arrows (σ_theta) on faces
  ctx.strokeStyle = '#38bdf8';
  ctx.fillStyle = '#38bdf8';
  ctx.lineWidth = 1.5;

  // Right face normal arrow
  ctx.beginPath();
  ctx.moveTo(elemSize / 2, 0);
  ctx.lineTo(elemSize / 2 + 20, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(elemSize / 2 + 20, 0);
  ctx.lineTo(elemSize / 2 + 14, -4);
  ctx.lineTo(elemSize / 2 + 14, 4);
  ctx.closePath();
  ctx.fill();

  // Left face normal arrow
  ctx.beginPath();
  ctx.moveTo(-elemSize / 2, 0);
  ctx.lineTo(-elemSize / 2 - 20, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-elemSize / 2 - 20, 0);
  ctx.lineTo(-elemSize / 2 - 14, -4);
  ctx.lineTo(-elemSize / 2 - 14, 4);
  ctx.closePath();
  ctx.fill();

  // Shear Stress Arrows (τ_theta) along faces
  if (Math.abs(p.tauTheta) > 1) {
    ctx.strokeStyle = '#f59e0b';
    ctx.fillStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    // Right face shear arrow (pointing up or down depending on sign)
    const sign = p.tauTheta >= 0 ? -1 : 1;
    ctx.beginPath();
    ctx.moveTo(elemSize / 2 + 6, -sign * 18);
    ctx.lineTo(elemSize / 2 + 6, sign * 18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(elemSize / 2 + 6, sign * 18);
    ctx.lineTo(elemSize / 2 + 3, sign * 12);
    ctx.lineTo(elemSize / 2 + 9, sign * 12);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();

  // Label for the rotated element
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '10px monospace';
  ctx.fillText(`ROTATED STRESS ELEMENT (θ = ${p.planeAngleThetaDeg}°)`, elemCenterX - 110, elemCenterY - elemSize - 18);

  // Factor of Safety HUD Box
  const hudY = 320;
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(30, hudY, w - 60, 45);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(30, hudY, w - 60, 45);

  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(`PRINCIPAL STRESSES: σ₁ = ${p.sigma1.toFixed(1)} kPa | σ₂ = ${p.sigma2.toFixed(1)} kPa | τ_max = ${p.tauMax.toFixed(1)} kPa (θp = ${p.principalAngleDeg.toFixed(1)}°)`, 45, hudY + 18);

  ctx.fillStyle = p.isShearFailure ? '#f43f5e' : '#10b981';
  ctx.fillText(
    p.isShearFailure 
      ? `⚠ SHEAR FAILURE (FS = ${p.factorOfSafety.toFixed(2)} < 1.0) • CRITERION EXCEEDED` 
      : `✓ STABLE (FS = ${p.factorOfSafety.toFixed(2)} ≥ 1.0) • MOHR-COULOMB SAFETY MARGIN OK`, 
    45, 
    hudY + 34
  );
}

// ---------------------------------------------------------------------------
// 7. REINFORCED CONCRETE (RC) BEAM FLEXURAL DESIGN RENDERER (ACI 318-19 / Eurocode 2)
// ---------------------------------------------------------------------------
export interface RcBeamParams {
  beamWidth?: number; // mm (b)
  beamDepth?: number; // mm (h)
  cover?: number; // mm
  fc?: number; // concrete strength MPa
  fy?: number; // steel yield MPa
  rebarCount?: number; // number of bars
  barDiameter?: number; // mm
  appliedMoment?: number; // Mu in kNm
}

export function renderRcBeam(rc: RenderContext, p: RcBeamParams) {
  const { ctx, w, h } = rc;
  const b = p.beamWidth || 300.0;
  const depthH = p.beamDepth || 500.0;
  const cover = p.cover || 40.0;
  const fc = p.fc || 30.0;
  const fy = p.fy || 500.0;
  const nBars = Math.round(p.rebarCount || 4);
  const dBar = p.barDiameter || 20.0;
  const Mu = p.appliedMoment || 180.0;

  const d = depthH - cover - dBar / 2.0;
  const Ast = nBars * (Math.PI * dBar * dBar / 4.0);
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

  // Background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, w, h);

  // Layout: 3 Columns
  // Col 1: Concrete Section (w: 30%)
  // Col 2: Strain Diagram (w: 30%)
  // Col 3: Whitney Stress Block & Force Couple (w: 35%)
  const topY = 65;
  const botY = h - 60;
  const viewH = botY - topY;

  // Section scale
  const scale = viewH / depthH;
  const secW = b * scale;
  const secH = depthH * scale;

  // -------------------------------------------------------------
  // COLUMN 1: Cross-Section b x h
  // -------------------------------------------------------------
  const secX = 45;
  const secY = topY;

  // Concrete fill with subtle grid
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(secX, secY, secW, secH);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.strokeRect(secX, secY, secW, secH);

  // Stirrup / Tie bar (greenish outline)
  const stirrupPad = (cover - 10) * scale;
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(secX + stirrupPad, secY + stirrupPad, secW - 2 * stirrupPad, secH - 2 * stirrupPad);

  // Neutral axis dashed line across concrete section
  const naY = secY + c * scale;
  ctx.save();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(secX - 10, naY);
  ctx.lineTo(secX + secW + 10, naY);
  ctx.stroke();
  ctx.restore();

  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`N.A. (c = ${c.toFixed(0)}mm)`, secX + secW + 12, naY + 3);

  // Compression Zone hatched fill
  ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
  ctx.fillRect(secX, secY, secW, c * scale);

  // Rebar Tension Bars
  const rebarY = secY + d * scale;
  const barSpacing = (secW - 2 * cover * scale) / Math.max(1, nBars - 1);
  ctx.fillStyle = '#38bdf8';
  for (let i = 0; i < nBars; i++) {
    const rx = secX + cover * scale + i * barSpacing;
    ctx.beginPath();
    ctx.arc(rx, rebarY, (dBar / 2) * scale * 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.stroke();
  }

  // Dimension labels
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`b = ${b.toFixed(0)}mm`, secX + secW * 0.3, secY - 8);
  ctx.fillText(`h = ${depthH.toFixed(0)}mm`, secX - 35, secY + secH * 0.5);
  ctx.fillText(`${nBars}-Ø${dBar.toFixed(0)} (As=${Ast.toFixed(0)}mm²)`, secX, secY + secH + 20);

  // -------------------------------------------------------------
  // COLUMN 2: Strain Diagram ε
  // -------------------------------------------------------------
  const strainX = secX + secW + 130;
  const zeroStrainX = strainX + 45;

  // Zero axis
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(zeroStrainX, secY);
  ctx.lineTo(zeroStrainX, secY + secH);
  ctx.stroke();

  // Strain Profile line
  const epsTopPx = 45; // corresponds to 0.003
  const epsBotPx = epsTopPx * (eps_t / eps_c);
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(zeroStrainX - epsTopPx, secY);
  ctx.lineTo(zeroStrainX + Math.min(80, epsBotPx), rebarY);
  ctx.stroke();

  // Strain values
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f43f5e';
  ctx.fillText(`ε_c = 0.003`, zeroStrainX - epsTopPx - 65, secY + 10);
  ctx.fillStyle = '#10b981';
  ctx.fillText(`ε_t = ${eps_t.toFixed(4)}`, zeroStrainX + Math.min(80, epsBotPx) + 8, rebarY + 4);

  ctx.fillStyle = '#94a3b8';
  ctx.fillText('STRAIN PROFILE', strainX - 10, secY - 8);

  // -------------------------------------------------------------
  // COLUMN 3: Whitney Equivalent Stress Block (0.85 f'c) & Forces
  // -------------------------------------------------------------
  const stressX = zeroStrainX + 130;
  const zeroStressX = stressX + 50;
  const aPx = a * scale;

  // Zero stress line
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(zeroStressX, secY);
  ctx.lineTo(zeroStressX, secY + secH);
  ctx.stroke();

  // Whitney Stress Block (Depth a)
  const stressBlockW = 55;
  ctx.fillStyle = 'rgba(249, 115, 22, 0.4)';
  ctx.fillRect(zeroStressX - stressBlockW, secY, stressBlockW, aPx);
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 2;
  ctx.strokeRect(zeroStressX - stressBlockW, secY, stressBlockW, aPx);

  // Resultant Compressive Force Arrow Cc (at a/2)
  const ccY = secY + aPx / 2.0;
  ctx.strokeStyle = '#f43f5e';
  ctx.fillStyle = '#f43f5e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(zeroStressX + 35, ccY);
  ctx.lineTo(zeroStressX - 10, ccY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(zeroStressX - 10, ccY);
  ctx.lineTo(zeroStressX - 4, ccY - 4);
  ctx.lineTo(zeroStressX - 4, ccY + 4);
  ctx.fill();

  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f43f5e';
  ctx.fillText(`Cc = 0.85 f'c b a`, zeroStressX + 42, ccY + 3);

  // Resultant Tensile Force Arrow Ts (at d)
  ctx.strokeStyle = '#06b6d4';
  ctx.fillStyle = '#06b6d4';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(zeroStressX - 10, rebarY);
  ctx.lineTo(zeroStressX + 35, rebarY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(zeroStressX + 35, rebarY);
  ctx.lineTo(zeroStressX + 29, rebarY - 4);
  ctx.lineTo(zeroStressX + 29, rebarY + 4);
  ctx.fill();

  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`Ts = Ast fy`, zeroStressX + 42, rebarY + 3);

  // Lever Arm jd
  ctx.strokeStyle = '#94a3b8';
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(zeroStressX + 25, ccY);
  ctx.lineTo(zeroStressX + 25, rebarY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillText(`(d - a/2) = ${(d - a/2).toFixed(0)}mm`, zeroStressX + 30, (ccY + rebarY) / 2);

  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`WHITNEY STRESS BLOCK (a = ${a.toFixed(1)}mm)`, stressX - 15, secY - 8);

  // Top Telemetry HUD
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(45, 10, w - 90, 34);
  ctx.strokeStyle = isSafe ? '#10b981' : '#f43f5e';
  ctx.strokeRect(45, 10, w - 90, 34);

  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#10b981';
  ctx.fillText(`φMn = ${phiMn.toFixed(1)} kNm (φ = ${phi.toFixed(2)})`, 60, 31);
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`Mu = ${Mu.toFixed(1)} kNm`, 260, 31);
  ctx.fillStyle = isSafe ? '#10b981' : '#f43f5e';
  ctx.fillText(`UTILIZATION = ${utilization.toFixed(1)}% (${isSafe ? 'ADEQUATE' : 'OVERLOAD'})`, 420, 31);
  ctx.fillStyle = isTensionControlled ? '#10b981' : '#f59e0b';
  ctx.fillText(isTensionControlled ? 'DUCTILE FAILURE (Tension-controlled)' : 'BRITTLE / TRANSITION', w - 340, 31);
}

