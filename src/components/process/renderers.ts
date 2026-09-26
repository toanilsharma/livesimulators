// High-Fidelity Canvas Renderers for Chemical & Process Engineering Simulators
// Adheres strictly to AIChE, TEMA Class R/B/C, ASME Section VIII, and API Standards

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  dt: number;
  t: number;
}

// ---------------------------------------------------------------------------
// 1. BINARY DISTILLATION COLUMN & MCCABE-THIELE STAGES RENDERER
// ---------------------------------------------------------------------------
export interface DistillationParams {
  refluxRatio: number;      // R = L/D
  feedComposition: number;  // z_F (0.15 - 0.75)
  relativeVolatility: number; // alpha (1.2 - 4.0)
  feedCondition: number;    // q (0.0 - 1.4)
}

export function renderDistillationColumn(rc: RenderContext, p: DistillationParams) {
  const { ctx, w, h, t } = rc;
  const { refluxRatio, feedComposition, relativeVolatility, feedCondition } = p;

  const R = Math.max(0.6, refluxRatio);
  const zF = Math.max(0.15, Math.min(0.85, feedComposition));
  const alpha = Math.max(1.15, relativeVolatility);
  const q = Math.max(0.01, feedCondition);

  const xD = 0.95;
  const xB = 0.05;

  // Header Banner
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#c084fc';
  ctx.fillText('AIChE / ASTM D86 • SIEVE TRAY DISTILLATION COLUMN & DYNAMIC McCABE-THIELE VLE', 18, 22);

  const hasSplit = w > 640;
  const colX = 25;
  const colY = 40;
  const colW = hasSplit ? Math.min(270, w * 0.36) : w - 50;
  const colH = hasSplit ? h - 60 : Math.min(240, h * 0.42);

  // -------------------------------------------------------------------------
  // LEFT: COLUMN SHELL & SIEVE TRAY HYDRAULICS
  // -------------------------------------------------------------------------
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(colX, colY, colW, colH, 10);
  ctx.fill();
  ctx.stroke();

  // Draw Column Shell Cylinder
  const towerW = Math.min(74, colW * 0.38);
  const towerX = colX + (colW - towerW) / 2;
  const towerTop = colY + 32;
  const towerBottom = colY + colH - 42;
  const towerH = towerBottom - towerTop;

  // Column Outer Wall
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.roundRect(towerX, towerTop, towerW, towerH, [towerW / 2, towerW / 2, towerW / 2, towerW / 2]);
  ctx.fill();
  ctx.stroke();

  // Internal Trays (8 active trays)
  const numTrays = 8;
  const traySpacing = (towerH - 30) / (numTrays + 1);

  for (let i = 1; i <= numTrays; i++) {
    const ty = towerTop + 15 + i * traySpacing;
    const isLeftDowncomer = i % 2 === 0;

    // Tray deck
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const trayStartX = isLeftDowncomer ? towerX + 8 : towerX + 4;
    const trayEndX = isLeftDowncomer ? towerX + towerW - 4 : towerX + towerW - 8;
    ctx.moveTo(trayStartX, ty);
    ctx.lineTo(trayEndX, ty);
    ctx.stroke();

    // Downcomer apron
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const dcX = isLeftDowncomer ? towerX + 8 : towerX + towerW - 8;
    ctx.moveTo(dcX, ty);
    ctx.lineTo(dcX, ty + traySpacing * 0.65);
    ctx.stroke();

    // Froth layer and animated vapor bubbles on tray
    const bubbleCount = 4;
    for (let b = 0; b < bubbleCount; b++) {
      const bx = trayStartX + 6 + (b * (trayEndX - trayStartX - 12)) / (bubbleCount - 1);
      const bPhase = (t * 5 + i * 1.5 + b * 2.2) % 1.0;
      const by = ty - bPhase * 7;
      ctx.fillStyle = b % 2 === 0 ? 'rgba(192, 132, 252, 0.8)' : 'rgba(56, 189, 248, 0.8)';
      ctx.beginPath();
      ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Overhead Condenser Loop
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(towerX + towerW / 2, towerTop);
  ctx.lineTo(towerX + towerW / 2, towerTop - 14);
  ctx.lineTo(colX + colW - 20, towerTop - 14);
  ctx.lineTo(colX + colW - 20, towerTop + 10);
  ctx.stroke();

  // Distillate drum box
  ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
  ctx.strokeStyle = '#06b6d4';
  ctx.fillRect(colX + colW - 32, towerTop + 10, 24, 18);
  ctx.strokeRect(colX + colW - 32, towerTop + 10, 24, 18);

  // Distillate arrow
  ctx.fillStyle = '#06b6d4';
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.fillText('xD 95%', colX + colW - 38, towerTop + 38);

  // Bottom Reboiler Loop
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(towerX + towerW / 2, towerBottom);
  ctx.lineTo(towerX + towerW / 2, towerBottom + 16);
  ctx.lineTo(colX + 22, towerBottom + 16);
  ctx.lineTo(colX + 22, towerBottom - 8);
  ctx.stroke();

  // Kettle reboiler box
  ctx.fillStyle = 'rgba(244, 63, 94, 0.2)';
  ctx.strokeStyle = '#f43f5e';
  ctx.fillRect(colX + 12, towerBottom - 18, 20, 18);
  ctx.strokeRect(colX + 12, towerBottom - 18, 20, 18);

  // Feed Stream Input
  const feedTrayY = towerTop + 15 + 4 * traySpacing;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(colX + 10, feedTrayY);
  ctx.lineTo(towerX, feedTrayY);
  ctx.stroke();
  ctx.fillStyle = '#f59e0b';
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.fillText(`Feed zF=${(zF * 100).toFixed(0)}%`, colX + 8, feedTrayY - 4);

  // -------------------------------------------------------------------------
  // RIGHT: McCABE-THIELE y-x EQUILIBRIUM DIAGRAM & STAGES
  // -------------------------------------------------------------------------
  const plotX = hasSplit ? colX + colW + 18 : colX;
  const plotY = hasSplit ? colY : colY + colH + 15;
  const plotW = hasSplit ? w - plotX - 25 : w - 50;
  const plotH = hasSplit ? h - 60 : Math.max(160, h - plotY - 20);

  ctx.fillStyle = '#060a12';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.fillRect(plotX, plotY, plotW, plotH);
  ctx.strokeRect(plotX, plotY, plotW, plotH);

  // Axis bounds
  const mLeft = plotX + 45;
  const mBottom = plotY + plotH - 35;
  const mSize = Math.min(plotW - 65, plotH - 55);
  const mTop = mBottom - mSize;
  const mRight = mLeft + mSize;

  // Grid lines
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  for (let g = 0; g <= 10; g += 2) {
    const gx = mLeft + (g / 10) * mSize;
    const gy = mBottom - (g / 10) * mSize;
    ctx.beginPath();
    ctx.moveTo(gx, mTop);
    ctx.lineTo(gx, mBottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(mLeft, gy);
    ctx.lineTo(mRight, gy);
    ctx.stroke();

    ctx.font = '8px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText((g / 10).toFixed(1), gx - 8, mBottom + 12);
    ctx.fillText((g / 10).toFixed(1), mLeft - 22, gy + 3);
  }
  ctx.setLineDash([]);

  // Axis Labels
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Liquid Mole Fraction x (Light Key)', mLeft + mSize / 2 - 80, mBottom + 26);
  ctx.save();
  ctx.translate(mLeft - 28, mTop + mSize / 2 + 35);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Vapor Mole Fraction y', 0, 0);
  ctx.restore();

  // 45-degree diagonal line (y = x)
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(mLeft, mBottom);
  ctx.lineTo(mRight, mTop);
  ctx.stroke();

  // VLE Equilibrium Curve: y = (alpha * x) / (1 + (alpha - 1)*x)
  const vleY = (xVal: number) => (alpha * xVal) / (1 + (alpha - 1) * xVal);

  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i <= 60; i++) {
    const xVal = i / 60;
    const yVal = vleY(xVal);
    const px = mLeft + xVal * mSize;
    const py = mBottom - yVal * mSize;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Feed q-line intersection point (xq, yq)
  let xq = zF;
  let yq = zF;
  if (Math.abs(q - 1.0) < 0.001) {
    xq = zF;
    yq = vleY(zF);
  } else {
    for (let testX = 0.05; testX <= 0.95; testX += 0.005) {
      const qY = (q / (q - 1)) * testX - zF / (q - 1);
      const vY = vleY(testX);
      if (Math.abs(qY - vY) < 0.02) {
        xq = testX;
        yq = vY;
        break;
      }
    }
  }

  // Draw feed q-line from (zF, zF)
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(mLeft + zF * mSize, mBottom - zF * mSize);
  ctx.lineTo(mLeft + xq * mSize, mBottom - yq * mSize);
  ctx.stroke();
  ctx.setLineDash([]);

  // Rectifying Operating Line from (xD, xD) through (xq, yq)
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(mLeft + xD * mSize, mBottom - xD * mSize);
  ctx.lineTo(mLeft + xq * mSize, mBottom - yq * mSize);
  ctx.stroke();

  // Stripping Operating Line from (xB, xB) to (xq, yq)
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(mLeft + xB * mSize, mBottom - xB * mSize);
  ctx.lineTo(mLeft + xq * mSize, mBottom - yq * mSize);
  ctx.stroke();

  // Stepped Equilibrium Stages (McCabe-Thiele Staircase)
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 1.8;
  let curX = xD;
  let curY = xD;
  let stageCount = 0;

  ctx.beginPath();
  ctx.moveTo(mLeft + curX * mSize, mBottom - curY * mSize);

  for (let s = 0; s < 25 && curX > xB; s++) {
    stageCount++;
    const nextX = Math.max(0.01, curY / (alpha - (alpha - 1) * curY));
    ctx.lineTo(mLeft + nextX * mSize, mBottom - curY * mSize);

    let nextY = curY;
    if (nextX >= xq) {
      nextY = (R / (R + 1)) * nextX + xD / (R + 1);
    } else {
      const slopeStrip = (yq - xB) / Math.max(0.001, xq - xB);
      nextY = xB + slopeStrip * (nextX - xB);
    }

    ctx.lineTo(mLeft + nextX * mSize, mBottom - nextY * mSize);
    curX = nextX;
    curY = nextY;
  }
  ctx.stroke();

  // Minimum reflux ratio R_min estimation
  const rMin = Math.max(0.2, (xD - yq) / Math.max(0.01, yq - xq));

  // Telemetry HUD overlay in top-right of plot
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = '#334155';
  ctx.fillRect(plotX + plotW - 170, plotY + 10, 160, 68);
  ctx.strokeRect(plotX + plotW - 170, plotY + 10, 160, 68);

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#ec4899';
  ctx.fillText(`Stages N: ${stageCount} trays`, plotX + plotW - 160, plotY + 26);
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`Reflux R: ${R.toFixed(2)} (Rmin: ${rMin.toFixed(2)})`, plotX + plotW - 160, plotY + 42);
  ctx.fillStyle = '#c084fc';
  ctx.fillText(`Ratio R/Rmin: ${(R / rMin).toFixed(2)}x`, plotX + plotW - 160, plotY + 58);
  ctx.fillStyle = '#10b981';
  ctx.fillText(`Bottoms xB: ${(xB * 100).toFixed(0)}%`, plotX + plotW - 160, plotY + 72);
}

// ---------------------------------------------------------------------------
// 2. SHELL-AND-TUBE HEAT EXCHANGER (TEMA CLASS R/B/C) RENDERER
// ---------------------------------------------------------------------------
export interface HeatExchangerParams {
  hotInletTemp: number;   // Th_in (deg C)
  coldInletTemp: number;  // Tc_in (deg C)
  hotFlowRate: number;    // kg/s
  coldFlowRate: number;   // kg/s
}

export function renderHeatExchanger(rc: RenderContext, p: HeatExchangerParams) {
  const { ctx, w, h, t } = rc;
  const { hotInletTemp, coldInletTemp, hotFlowRate, coldFlowRate } = p;

  const ThIn = Math.max(50, hotInletTemp);
  const TcIn = Math.max(5, coldInletTemp);
  const mh = Math.max(1, hotFlowRate);
  const mc = Math.max(1, coldFlowRate);

  // Thermodynamics calculation: cp = 4.18 kJ/kg.K
  const Ch = mh * 4.18; // kW/K
  const Cc = mc * 4.18; // kW/K
  const Cmin = Math.min(Ch, Cc);
  const Cmax = Math.max(Ch, Cc);
  const Cr = Cmin / Cmax;

  // NTU rating for UA = 28 kW/K
  const UA = 28.0;
  const NTU = UA / Cmin;

  // Counterflow effectiveness
  const expVal = Math.exp(-NTU * (1 - Cr));
  const eff = Cr === 1.0 ? NTU / (1 + NTU) : (1 - expVal) / (1 - Cr * expVal);
  const Q_kW = eff * Cmin * (ThIn - TcIn);

  const ThOut = ThIn - Q_kW / Ch;
  const TcOut = TcIn + Q_kW / Cc;

  // Header Banner
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#c084fc';
  ctx.fillText('TEMA CLASS R / ASME VIII • 1-2 SHELL-AND-TUBE HEAT EXCHANGER & AXIAL GRADIENT', 18, 22);

  const hasSplit = w > 640;
  const exX = 25;
  const exY = 40;
  const exW = hasSplit ? Math.min(320, w * 0.44) : w - 50;
  const exH = hasSplit ? h - 60 : Math.min(200, h * 0.4);

  // -------------------------------------------------------------------------
  // LEFT: TEMA 1-2 EXCHANGER CAD CUTAWAY
  // -------------------------------------------------------------------------
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(exX, exY, exW, exH, 10);
  ctx.fill();
  ctx.stroke();

  // Exchanger Dimensions
  const shellX = exX + 45;
  const shellY = exY + (exH - 90) / 2;
  const shellW = exW - 90;
  const shellH = 90;

  // Shell Cylinder Body
  ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(shellX, shellY, shellW, shellH, 12);
  ctx.fill();
  ctx.stroke();

  // Channel Heads (Flanged Bonnets) on Left & Right
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  // Left stationary head
  ctx.beginPath();
  ctx.roundRect(shellX - 22, shellY - 5, 22, shellH + 10, [12, 0, 0, 12]);
  ctx.fill();
  ctx.stroke();
  // Right return head
  ctx.beginPath();
  ctx.roundRect(shellX + shellW, shellY - 5, 22, shellH + 10, [0, 12, 12, 0]);
  ctx.fill();
  ctx.stroke();

  // 4 Segmental Baffles
  const numBaffles = 4;
  const bSpacing = shellW / (numBaffles + 1);
  for (let b = 1; b <= numBaffles; b++) {
    const bx = shellX + b * bSpacing;
    const isTopCut = b % 2 === 1;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (isTopCut) {
      ctx.moveTo(bx, shellY + 22);
      ctx.lineTo(bx, shellY + shellH - 2);
    } else {
      ctx.moveTo(bx, shellY + 2);
      ctx.lineTo(bx, shellY + shellH - 22);
    }
    ctx.stroke();
  }

  // Horizontal Tube Bundle (5 visible tubes)
  const numTubes = 5;
  const tSpacing = (shellH - 20) / (numTubes + 1);
  for (let i = 1; i <= numTubes; i++) {
    const ty = shellY + 10 + i * tSpacing;
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(shellX - 18, ty);
    ctx.lineTo(shellX + shellW + 18, ty);
    ctx.stroke();
  }

  // Animated Shell Fluid Particles (Zigzag Cold Stream in Teal)
  for (let pIdx = 0; pIdx < 16; pIdx++) {
    const pFrac = (t * 0.4 + pIdx * 0.065) % 1.0;
    const px = shellX + 10 + pFrac * (shellW - 20);
    const baffleIdx = Math.floor(pFrac * (numBaffles + 1));
    const isUp = baffleIdx % 2 === 0;
    const py = isUp ? shellY + 20 + Math.sin(pFrac * Math.PI * 4) * 18 : shellY + shellH - 20 - Math.sin(pFrac * Math.PI * 4) * 18;

    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(px, py, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Shell & Tube Nozzle Tags
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f43f5e';
  ctx.fillText(`Hot In: ${ThIn.toFixed(0)}°C`, shellX - 25, shellY - 14);
  ctx.fillText(`Hot Out: ${ThOut.toFixed(0)}°C`, shellX + shellW - 10, shellY + shellH + 24);
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`Cold In: ${TcIn.toFixed(0)}°C`, shellX + 8, shellY + shellH + 24);
  ctx.fillText(`Cold Out: ${TcOut.toFixed(0)}°C`, shellX + shellW - 25, shellY - 14);

  // -------------------------------------------------------------------------
  // RIGHT: AXIAL TEMPERATURE DISTRIBUTION T(z)
  // -------------------------------------------------------------------------
  const plotX = hasSplit ? exX + exW + 18 : exX;
  const plotY = hasSplit ? exY : exY + exH + 15;
  const plotW = hasSplit ? w - plotX - 25 : w - 50;
  const plotH = hasSplit ? h - 60 : Math.max(160, h - plotY - 20);

  ctx.fillStyle = '#060a12';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.fillRect(plotX, plotY, plotW, plotH);
  ctx.strokeRect(plotX, plotY, plotW, plotH);

  // Graph Bounds
  const gLeft = plotX + 45;
  const gBottom = plotY + plotH - 35;
  const gWidth = plotW - 65;
  const gHeight = plotH - 55;
  const gTop = gBottom - gHeight;

  // Axis lines
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(gLeft, gTop);
  ctx.lineTo(gLeft, gBottom);
  ctx.lineTo(gLeft + gWidth, gBottom);
  ctx.stroke();

  // Y-axis temperature scale
  const maxTempScale = Math.max(200, ThIn + 20);
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#64748b';
  for (let tempVal = 0; tempVal <= maxTempScale; tempVal += 50) {
    const gy = gBottom - (tempVal / maxTempScale) * gHeight;
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(gLeft, gy);
    ctx.lineTo(gLeft + gWidth, gy);
    ctx.stroke();
    ctx.fillText(`${tempVal}°C`, gLeft - 32, gy + 3);
  }
  ctx.setLineDash([]);

  // Plot Hot Fluid Curve Th(z) (Ruby Red)
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let z = 0; z <= 50; z++) {
    const zFrac = z / 50;
    const tempHot = ThIn - (ThIn - ThOut) * (1 - Math.exp(-2.2 * zFrac)) / (1 - Math.exp(-2.2));
    const px = gLeft + zFrac * gWidth;
    const py = gBottom - (tempHot / maxTempScale) * gHeight;
    if (z === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Plot Cold Fluid Curve Tc(z) (Cyan)
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let z = 0; z <= 50; z++) {
    const zFrac = z / 50;
    const tempCold = TcOut - (TcOut - TcIn) * zFrac;
    const px = gLeft + zFrac * gWidth;
    const py = gBottom - (tempCold / maxTempScale) * gHeight;
    if (z === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Labels on axes
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Normalized Exchanger Axial Length z / L', gLeft + gWidth / 2 - 90, gBottom + 22);

  // Telemetry Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = '#334155';
  ctx.fillRect(plotX + plotW - 180, plotY + 10, 170, 72);
  ctx.strokeRect(plotX + plotW - 180, plotY + 10, 170, 72);

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#ec4899';
  ctx.fillText(`Heat Duty Q: ${(Q_kW / 1000).toFixed(2)} MW`, plotX + plotW - 170, plotY + 26);
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`Effectiveness ε: ${(eff * 100).toFixed(1)}%`, plotX + plotW - 170, plotY + 42);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`NTU Units: ${NTU.toFixed(2)}`, plotX + plotW - 170, plotY + 58);
  ctx.fillStyle = '#10b981';
  ctx.fillText(`Cap Ratio Cr: ${Cr.toFixed(2)}`, plotX + plotW - 170, plotY + 74);
}

// ---------------------------------------------------------------------------
// 3. PACKED GAS ABSORPTION TOWER & FLOODING HYDRAULICS RENDERER
// ---------------------------------------------------------------------------
export interface GasAbsorptionParams {
  gasFlow: number;          // G_m (kmol/h)
  liquidGasRatio: number;   // L/G (1.0 - 6.0)
  inletGasConc: number;     // y_in (%)
  henryConstant: number;    // H (0.5 - 3.0)
}

export function renderGasAbsorption(rc: RenderContext, p: GasAbsorptionParams) {
  const { ctx, w, h, t } = rc;
  const { gasFlow, liquidGasRatio, inletGasConc, henryConstant } = p;

  const G = Math.max(5, gasFlow);
  const LG = Math.max(1.0, liquidGasRatio);
  const yIn = Math.max(0.5, inletGasConc) / 100;
  const H = Math.max(0.2, henryConstant);

  // Absorption factor A = L / (H * G)
  const A = LG / H;
  const eff = Math.min(0.995, Math.max(0.4, (A - Math.pow(1 / A, 3)) / (A - Math.pow(1 / A, 4))));
  const yOut = yIn * (1 - eff);

  const NTU = Math.max(1.2, Math.log((yIn - 0) / Math.max(0.0001, yOut - 0)) * (A / Math.max(0.1, A - 1)));
  const HTU = 0.65;
  const packedHeightZ = NTU * HTU;

  const floodRatio = Math.min(1.2, (G / 38) * Math.sqrt(LG / 2.5) * 0.72);
  const isFlooded = floodRatio >= 0.85;

  // Header Banner
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#c084fc';
  ctx.fillText('AIChE / EPA MACT • PACKED ABSORPTION SCRUBBER & TWO-FILM HYDRAULICS', 18, 22);

  const hasSplit = w > 640;
  const towX = 25;
  const towY = 40;
  const towW = hasSplit ? Math.min(270, w * 0.38) : w - 50;
  const towH = hasSplit ? h - 60 : Math.min(220, h * 0.42);

  // -------------------------------------------------------------------------
  // LEFT: PACKED COLUMN SCHEMATIC
  // -------------------------------------------------------------------------
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(towX, towY, towW, towH, 10);
  ctx.fill();
  ctx.stroke();

  // Column Geometry
  const colW = Math.min(68, towW * 0.36);
  const colX = towX + (towW - colW) / 2;
  const colTop = towY + 30;
  const colBottom = towY + towH - 35;
  const colH = colBottom - colTop;

  // Outer Scrubber Column Vessel
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = isFlooded ? '#ef4444' : '#94a3b8';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(colX, colTop, colW, colH, [colW / 2, colW / 2, 8, 8]);
  ctx.fill();
  ctx.stroke();

  // Liquid Distributor Sprays at Top
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(colX - 16, colTop + 24);
  ctx.lineTo(colX + colW / 2, colTop + 24);
  ctx.lineTo(colX + colW / 2, colTop + 32);
  ctx.stroke();

  // Spray Droplets
  for (let s = 0; s < 5; s++) {
    const sx = colX + 12 + s * 11;
    const sy = colTop + 34 + ((t * 40 + s * 15) % 18);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Packed Bed Section
  const bedTop = colTop + 55;
  const bedBottom = colBottom - 45;
  const bedH = bedBottom - bedTop;

  ctx.fillStyle = isFlooded ? 'rgba(239, 68, 68, 0.25)' : 'rgba(51, 65, 85, 0.4)';
  ctx.fillRect(colX + 4, bedTop, colW - 8, bedH);

  // Trickling solvent film on packing
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.lineWidth = 1;
  for (let row = bedTop; row < bedBottom; row += 10) {
    ctx.beginPath();
    ctx.moveTo(colX + 6, row);
    ctx.lineTo(colX + colW - 6, row + 4);
    ctx.stroke();
  }

  // Countercurrent Gas Streamlines
  for (let g = 0; g < 4; g++) {
    const gx = colX + 14 + g * 12;
    const gy = bedBottom - ((t * 30 + g * 20) % (bedH + 20));
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(gx, gy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Gas Inlet Nozzle at Bottom
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(colX - 16, colBottom - 25);
  ctx.lineTo(colX, colBottom - 25);
  ctx.stroke();
  ctx.fillStyle = '#f59e0b';
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.fillText(`Gas In: ${(yIn * 100).toFixed(1)}%`, colX - 28, colBottom - 30);

  // Clean Gas Outlet Nozzle at Top
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(colX + colW / 2, colTop);
  ctx.lineTo(colX + colW / 2, colTop - 12);
  ctx.lineTo(towX + towW - 15, colTop - 12);
  ctx.stroke();
  ctx.fillStyle = '#10b981';
  ctx.fillText(`Clean Out: ${(yOut * 100).toFixed(2)}%`, towX + towW - 55, colTop - 16);

  // -------------------------------------------------------------------------
  // RIGHT: CONCENTRATION PROFILE & FLOODING GAUGE
  // -------------------------------------------------------------------------
  const plotX = hasSplit ? towX + towW + 18 : towX;
  const plotY = hasSplit ? towY : towY + towH + 15;
  const plotW = hasSplit ? w - plotX - 25 : w - 50;
  const plotH = hasSplit ? h - 60 : Math.max(160, h - plotY - 20);

  ctx.fillStyle = '#060a12';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.fillRect(plotX, plotY, plotW, plotH);
  ctx.strokeRect(plotX, plotY, plotW, plotH);

  // Solute Concentration Curve y(z) vs Bed Height z
  const cLeft = plotX + 45;
  const cBottom = plotY + plotH - 35;
  const cWidth = plotW - 130;
  const cHeight = plotH - 55;
  const cTop = cBottom - cHeight;

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cLeft, cTop);
  ctx.lineTo(cLeft, cBottom);
  ctx.lineTo(cLeft + cWidth, cBottom);
  ctx.stroke();

  // Plot Gas Solute Curve y(z)
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let z = 0; z <= 40; z++) {
    const zFrac = z / 40;
    const yVal = yOut + (yIn - yOut) * (1 - zFrac);
    const px = cLeft + (yVal / (yIn * 1.1)) * cWidth;
    const py = cBottom - zFrac * cHeight;
    if (z === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Axis labels
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Solute Mole Fraction y', cLeft + cWidth / 2 - 50, cBottom + 18);
  ctx.save();
  ctx.translate(cLeft - 24, cTop + cHeight / 2 + 25);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Packed Height z (m)', 0, 0);
  ctx.restore();

  // SHERWOOD FLOODING GAUGE BAR (on right of plot)
  const fgX = plotX + plotW - 55;
  const fgY = cTop + 10;
  const fgW = 18;
  const fgH = cHeight - 20;

  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#475569';
  ctx.fillRect(fgX, fgY, fgW, fgH);
  ctx.strokeRect(fgX, fgY, fgW, fgH);

  // Flooding Fill Level
  const fillH = Math.min(fgH, floodRatio * fgH);
  const isDanger = floodRatio >= 0.85;
  ctx.fillStyle = isDanger ? '#ef4444' : floodRatio >= 0.7 ? '#f59e0b' : '#10b981';
  ctx.fillRect(fgX + 2, fgY + fgH - fillH, fgW - 4, fillH);

  // 85% flood warning line
  const warnY = fgY + fgH * (1 - 0.85);
  ctx.strokeStyle = '#ef4444';
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(fgX - 4, warnY);
  ctx.lineTo(fgX + fgW + 4, warnY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('FLOOD', fgX - 6, fgY - 6);
  ctx.fillText(`${(floodRatio * 100).toFixed(0)}%`, fgX - 2, fgY + fgH + 12);

  // Telemetry HUD
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = '#334155';
  ctx.fillRect(cLeft + 8, cTop + 8, 160, 68);
  ctx.strokeRect(cLeft + 8, cTop + 8, 160, 68);

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#10b981';
  ctx.fillText(`Efficiency: ${(eff * 100).toFixed(1)}%`, cLeft + 16, cTop + 24);
  ctx.fillStyle = '#c084fc';
  ctx.fillText(`Packed Height Z: ${packedHeightZ.toFixed(2)} m`, cLeft + 16, cTop + 40);
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`NTU_OG: ${NTU.toFixed(2)}`, cLeft + 16, cTop + 56);
  ctx.fillStyle = isFlooded ? '#ef4444' : '#f59e0b';
  ctx.fillText(`Flooding: ${(floodRatio * 100).toFixed(0)}% (${isFlooded ? 'FLOOD ALERT' : 'Normal'})`, cLeft + 16, cTop + 70);
}

// ---------------------------------------------------------------------------
// 4. BATCH REACTOR & PLUG FLOW REACTOR (PFR) KINETICS RENDERER (Levenspiel / Fogler)
// ---------------------------------------------------------------------------
export interface BatchPfrParams {
  reactorType?: number; // 0 = Batch Reactor, 1 = Plug Flow Reactor
  order?: number; // 1 or 2
  kRate?: number; // rate constant at 50°C
  tempC?: number; // temperature °C
  actEnergy?: number; // Ea in kJ/mol
  ca0?: number; // mol/L
  volOrTime?: number; // min or L
}

export function renderBatchPfr(rc: RenderContext, p: BatchPfrParams) {
  const { ctx, w, h, t } = rc;
  const reactorType = Math.round(p.reactorType || 0);
  const order = Math.round(p.order || 1);
  const k0 = p.kRate || 0.05;
  const tempC = p.tempC || 65.0;
  const Ea = (p.actEnergy || 45.0) * 1e3;
  const Ca0 = p.ca0 || 2.0;
  const t_or_V = p.volOrTime || 30.0;

  const R_gas = 8.314462;
  const T_ref = 323.15;
  const Tk = tempC + 273.15;
  const k = k0 * Math.exp((-Ea / R_gas) * (1.0 / Tk - 1.0 / T_ref));

  const calcConcentrations = (timeVal: number) => {
    let Xa = 0;
    if (order === 1) {
      Xa = 1.0 - Math.exp(-k * timeVal);
    } else {
      Xa = (k * Ca0 * timeVal) / (1.0 + k * Ca0 * timeVal);
    }
    const Ca = Ca0 * (1.0 - Xa);
    const Cb = Ca0 * Xa;
    return { Xa, Ca, Cb };
  };

  const currentSol = calcConcentrations(t_or_V);
  const Da = order === 1 ? k * t_or_V : k * Ca0 * t_or_V;

  // Background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, w, h);

  // Layout: Left 60% Concentration Plot, Right 40% Physical Reactor
  const plotLeft = 55;
  const plotRight = Math.floor(w * 0.60);
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

  const maxPlotT = Math.max(60, t_or_V * 1.5);
  const maxPlotC = Ca0 * 1.15;

  // Concentration Curve A: C_A(t) - Cyan (Reactant Consumption)
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 3;
  ctx.beginPath();
  const cSteps = 60;
  for (let i = 0; i <= cSteps; i++) {
    const tVal = (i / cSteps) * maxPlotT;
    const { Ca } = calcConcentrations(tVal);
    const sx = plotLeft + (tVal / maxPlotT) * plotW;
    const sy = plotBottom - (Ca / maxPlotC) * plotH;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // Concentration Curve B: C_B(t) - Amber (Product Yield)
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= cSteps; i++) {
    const tVal = (i / cSteps) * maxPlotT;
    const { Cb } = calcConcentrations(tVal);
    const sx = plotLeft + (tVal / maxPlotT) * plotW;
    const sy = plotBottom - (Cb / maxPlotC) * plotH;
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // Operating Point on Curves
  const curSx = plotLeft + (t_or_V / maxPlotT) * plotW;
  const curSyA = plotBottom - (currentSol.Ca / maxPlotC) * plotH;
  const curSyB = plotBottom - (currentSol.Cb / maxPlotC) * plotH;

  // Dotted vertical line
  ctx.save();
  ctx.setLineDash([2, 3]);
  ctx.strokeStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(curSx, plotBottom);
  ctx.lineTo(curSx, plotTop);
  ctx.stroke();
  ctx.restore();

  // Markers
  ctx.fillStyle = '#06b6d4';
  ctx.beginPath();
  ctx.arc(curSx, curSyA, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(curSx, curSyB, 5.5, 0, Math.PI * 2);
  ctx.fill();

  // Axis labels
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('0', plotLeft - 15, plotBottom + 12);
  ctx.fillText(`${Ca0.toFixed(1)} M`, plotLeft - 36, plotTop + 10);
  ctx.fillText(reactorType === 0 ? 'RESIDENCE TIME t (min) →' : 'REACTOR VOLUME V (L) →', plotLeft + plotW * 0.3, plotBottom + 26);
  ctx.fillStyle = '#06b6d4';
  ctx.fillText('C_A (Reactant)', plotLeft + 15, plotTop + 20);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('C_B (Product)', plotLeft + 120, plotTop + 20);

  // Right schematic: Physical Reactor Model
  const rX = plotRight + 25;
  const rW = w - rX - 25;
  const rMidX = rX + rW * 0.5;

  if (reactorType === 0) {
    // -------------------------------------------------------------
    // Stirred Jacketed Batch Reactor Vessel
    // -------------------------------------------------------------
    const vW = Math.min(130, rW * 0.75);
    const vH = plotH * 0.75;
    const vX = rMidX - vW * 0.5;
    const vY = plotTop + (plotH - vH) * 0.5;

    // Jacket Outer Shell (Orange heat transfer jacket)
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 6;
    ctx.strokeRect(vX - 6, vY + 15, vW + 12, vH - 20);

    // Vessel Body
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.fillRect(vX, vY, vW, vH);
    ctx.strokeRect(vX, vY, vW, vH);

    // Fluid Level with dynamic color blend (Blue to Orange as conversion increases)
    const fluidH = vH * 0.8;
    const fluidY = vY + (vH - fluidH);
    const redCh = Math.floor(6 + 230 * currentSol.Xa);
    const blueCh = Math.floor(212 * (1.0 - currentSol.Xa));
    ctx.fillStyle = `rgba(${redCh}, 120, ${blueCh}, 0.5)`;
    ctx.fillRect(vX + 2, fluidY, vW - 4, fluidH - 2);

    // Rotating Agitator Shaft & Impeller
    const shaftX = vX + vW * 0.5;
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(shaftX, vY - 12);
    ctx.lineTo(shaftX, fluidY + fluidH * 0.75);
    ctx.stroke();

    // Impeller Blades with rotation
    const impAngle = (t * 8.0) % (Math.PI * 2);
    const impW = Math.cos(impAngle) * (vW * 0.35);
    const impY = fluidY + fluidH * 0.75;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(shaftX - impW, impY);
    ctx.lineTo(shaftX + impW, impY);
    ctx.stroke();

    // Swirl particles
    ctx.fillStyle = '#f8fafc';
    for (let pIdx = 0; pIdx < 6; pIdx++) {
      const pAng = impAngle + (pIdx * Math.PI) / 3.0;
      const px = shaftX + Math.cos(pAng) * (vW * 0.28);
      const py = impY - 20 + Math.sin(pAng * 2.0) * 15;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.font = 'bold 9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('JACKETED BATCH REACTOR', rMidX - 60, vY - 8);
    ctx.fillText(`T = ${tempC.toFixed(0)}°C`, rMidX - 25, vY + vH + 20);

  } else {
    // -------------------------------------------------------------
    // Tubular Plug Flow Reactor (PFR)
    // -------------------------------------------------------------
    const pfrW = Math.min(180, rW * 0.9);
    const pfrH = 45;
    const pfrX = rMidX - pfrW * 0.5;
    const pfrY = plotTop + plotH * 0.45;

    // Tube Body
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.fillRect(pfrX, pfrY, pfrW, pfrH);
    ctx.strokeRect(pfrX, pfrY, pfrW, pfrH);

    // Color Gradient across axial length (Cyan feed -> Amber effluent)
    const grad = ctx.createLinearGradient(pfrX, pfrY, pfrX + pfrW, pfrY);
    grad.addColorStop(0, 'rgba(6, 182, 212, 0.6)');
    grad.addColorStop(1, `rgba(245, 158, 11, ${0.3 + currentSol.Xa * 0.6})`);
    ctx.fillStyle = grad;
    ctx.fillRect(pfrX + 2, pfrY + 2, pfrW - 4, pfrH - 4);

    // Flow particles moving through PFR
    ctx.fillStyle = '#f8fafc';
    for (let fIdx = 0; fIdx < 8; fIdx++) {
      const fX = pfrX + ((t * 80 + fIdx * 25) % pfrW);
      const fY = pfrY + 12 + (fIdx % 3) * 10;
      ctx.beginPath();
      ctx.arc(fX, fY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Inflow & Outflow Arrows
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(pfrX - 22, pfrY + pfrH * 0.5);
    ctx.lineTo(pfrX, pfrY + pfrH * 0.5);
    ctx.stroke();

    ctx.strokeStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(pfrX + pfrW, pfrY + pfrH * 0.5);
    ctx.lineTo(pfrX + pfrW + 22, pfrY + pfrH * 0.5);
    ctx.stroke();

    ctx.font = 'bold 9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('TUBULAR PLUG FLOW (PFR)', rMidX - 60, pfrY - 14);
    ctx.fillText('FEED IN', pfrX - 35, pfrY + pfrH + 16);
    ctx.fillText('PRODUCT OUT', pfrX + pfrW - 25, pfrY + pfrH + 16);
  }

  // Top Telemetry HUD
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(plotLeft, 10, w - plotLeft - 20, 32);
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(plotLeft, 10, w - plotLeft - 20, 32);

  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#10b981';
  ctx.fillText(`CONVERSION X_A: ${(currentSol.Xa * 100).toFixed(1)}%`, plotLeft + 15, 30);
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`C_A: ${currentSol.Ca.toFixed(3)} M`, plotLeft + 220, 30);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`C_B: ${currentSol.Cb.toFixed(3)} M`, plotLeft + 350, 30);
  ctx.fillStyle = '#ec4899';
  ctx.fillText(`Da: ${Da.toFixed(2)} | k: ${k.toFixed(3)}`, plotLeft + plotW - 10, 30);
}

