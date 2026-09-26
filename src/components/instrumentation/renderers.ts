// Canvas Renderers for 8 High-Fidelity Industrial Instrumentation Simulators
// Adhering strictly to IEC, ISO, ISA, ASME, and NIST Standards

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  dt: number;
  t: number;
}

// ---------------------------------------------------------------------------
// 1. 4-20mA CURRENT LOOP & HART FSK RENDERER (IEC 60381-1 / NAMUR NE 43)
// ---------------------------------------------------------------------------
export function renderCurrentLoop(
  rc: RenderContext,
  data: {
    processPressure: number;
    lrv: number;
    urv: number;
    calculatedCurrent: number;
    pressurePercent: number;
    wireResistance: number;
    wireVoltage: number;
    loadResistance: number;
    loadVoltage: number;
    supplyVoltage: number;
    transmitterTerminalVoltage: number;
    isComplianceVoltageHealthy: boolean;
    hartActive: boolean;
    particles: Array<{ pos: number; path: number }>;
    hartWavePhase: number;
  }
) {
  const { ctx, w, h, dt } = rc;
  const {
    processPressure, lrv, urv, calculatedCurrent, pressurePercent,
    wireResistance, wireVoltage, loadResistance, loadVoltage,
    transmitterTerminalVoltage, isComplianceVoltageHealthy,
    hartActive, particles
  } = data;

  // Transmitter Box (Left)
  const txX = 50;
  const txY = 55;
  const txW = 210;
  const txH = 205;

  // Process Pressure Pipe & Diaphragm Flange (Far Left)
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.fillRect(15, txY + 40, 35, 125);
  ctx.strokeRect(15, txY + 40, 35, 125);

  const fluidAlpha = Math.min(0.9, 0.2 + (processPressure / (urv || 10)) * 0.7);
  ctx.fillStyle = `rgba(14, 165, 233, ${fluidAlpha})`;
  ctx.fillRect(16, txY + 41, 33, 123);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillText(`P = ${processPressure.toFixed(1)} bar`, 10, txY + 28);

  // Transmitter Body Enclosure (Heavy industrial explosion-proof housing)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
  ctx.strokeStyle = isComplianceVoltageHealthy ? '#06b6d4' : '#ef4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(txX, txY, txW, txH, 12);
  ctx.fill();
  ctx.stroke();

  // Transmitter Glass Display Window
  ctx.fillStyle = '#020617';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(txX + 15, txY + 15, txW - 30, 78, 6);
  ctx.fill();
  ctx.stroke();

  // Digital LCD Display Inside Transmitter
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 17px "IBM Plex Mono", monospace';
  ctx.fillText(`${calculatedCurrent.toFixed(2)} mA`, txX + 28, txY + 44);

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`PV: ${processPressure.toFixed(2)} bar (${pressurePercent.toFixed(1)}%)`, txX + 28, txY + 62);
  ctx.fillText(`RANGE: ${lrv} - ${urv} bar`, txX + 28, txY + 77);

  // Internal Sensor Cell & V/I Regulator
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#334155';
  ctx.strokeRect(txX + 20, txY + 105, 75, 45);
  ctx.fillStyle = '#64748b';
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillText('SENSOR CELL', txX + 24, txY + 122);
  ctx.fillText('PIEZO PILLAR', txX + 24, txY + 135);

  ctx.strokeRect(txX + 115, txY + 105, 80, 45);
  ctx.fillText('4-20mA V/I', txX + 120, txY + 122);
  ctx.fillText('REGULATOR', txX + 120, txY + 135);

  // Transmitter Terminal Screws (+) and (-)
  const termPlusY = txY + 172;
  const termMinusY = txY + 188;
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(txX + txW, termPlusY, 5, 0, Math.PI * 2);
  ctx.arc(txX + txW, termMinusY, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillText(`(+) ${transmitterTerminalVoltage.toFixed(1)}V`, txX + txW - 65, termPlusY + 3);
  ctx.fillText(`(-) 0.0V`, txX + txW - 50, termMinusY + 3);

  // Field Cable Run & DCS I/O
  const dcsX = w - 170;
  const dcsY = 55;
  const dcsW = 140;
  const dcsH = 205;

  ctx.strokeStyle = isComplianceVoltageHealthy ? '#38bdf8' : '#ef4444';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(txX + txW, termPlusY);
  ctx.lineTo(dcsX, termPlusY);
  ctx.stroke();

  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(txX + txW, termMinusY);
  ctx.lineTo(dcsX, termMinusY);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillText(`Twisted Shielded Pair (R_wire = ${wireResistance} Ω)`, txX + txW + 30, termPlusY - 10);
  ctx.fillText(`ΔV_wire = ${wireVoltage.toFixed(2)} V`, txX + txW + 30, termMinusY + 18);

  // Traveling Current Particles
  if (calculatedCurrent > 0.1) {
    const particleSpeed = (calculatedCurrent / 20.0) * 0.45;
    particles.forEach((p) => {
      p.pos = (p.pos + dt * particleSpeed) % 1.0;
      const currentDistance = (dcsX - (txX + txW));
      const pxTop = dcsX - p.pos * currentDistance;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(pxTop, termPlusY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      const pxBottom = (txX + txW) + p.pos * currentDistance;
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(pxBottom, termMinusY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // HART FSK Waveform
  if (hartActive && calculatedCurrent > 0.1) {
    data.hartWavePhase += dt * 8;
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.75)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const hartStart = txX + txW + 20;
    const hartEnd = dcsX - 20;
    for (let hx = hartStart; hx < hartEnd; hx += 3) {
      const phaseMod = Math.sin((hx - hartStart) * 0.15 + data.hartWavePhase);
      const hy = termPlusY + phaseMod * 5;
      if (hx === hartStart) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.stroke();
    ctx.fillStyle = '#eab308';
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillText('HART 1200/2200 Hz FSK BURST ACTIVE', txX + txW + 50, termPlusY + 12);
  }

  // DCS Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(dcsX, dcsY, dcsW, dcsH, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillText('PLC / DCS I/O', dcsX + 15, dcsY + 25);
  ctx.fillStyle = '#64748b';
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillText('ANALOG INPUT CH1', dcsX + 15, dcsY + 38);

  const shuntY = dcsY + 70;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(dcsX + 25, shuntY, 85, 36);
  ctx.fillStyle = '#f8fafc';
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillText(`R_load: ${loadResistance} Ω`, dcsX + 30, shuntY + 18);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`V_in: ${loadVoltage.toFixed(3)} V`, dcsX + 30, shuntY + 30);

  const psuY = dcsY + 135;
  ctx.strokeRect(dcsX + 25, psuY, 85, 36);
  ctx.fillStyle = '#10b981';
  ctx.fillText(`+24 VDC PSU`, dcsX + 32, psuY + 18);
  ctx.fillStyle = '#64748b';
  ctx.fillText(`LOOP POWER`, dcsX + 32, psuY + 30);

  // Bottom Scope / Signal Strip
  const scopeX = 40;
  const scopeY = 280;
  const scopeW = w - 80;
  const scopeH = h - scopeY - 20;

  ctx.fillStyle = '#020614';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(scopeX, scopeY, scopeW, scopeH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]);
  for (let gx = scopeX + 60; gx < scopeX + scopeW; gx += 60) {
    ctx.beginPath();
    ctx.moveTo(gx, scopeY);
    ctx.lineTo(gx, scopeY + scopeH);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  ctx.fillStyle = '#64748b';
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillText('LOOP CURRENT COMPLIANCE & VOLTAGE BURDEN STRIP', scopeX + 15, scopeY + 20);

  const complianceRatio = Math.min(1.0, transmitterTerminalVoltage / 12.0);
  const barW = (scopeW - 30) * complianceRatio;
  ctx.fillStyle = isComplianceVoltageHealthy ? '#10b981' : '#ef4444';
  ctx.fillRect(scopeX + 15, scopeY + 32, barW, 14);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillText(
    `V_tx = ${transmitterTerminalVoltage.toFixed(2)} V ${isComplianceVoltageHealthy ? '(COMPLIANT ≥ 10.5V)' : '(COMPLIANCE COLLAPSE)'}`,
    scopeX + 22,
    scopeY + 43
  );

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(
    `NAMUR STATUS: ${calculatedCurrent <= 3.6 ? 'NE 43 FAIL LOW' : calculatedCurrent >= 21.0 ? 'NE 43 FAIL HIGH' : 'NORMAL IN-SPEC'} | CURRENT: ${calculatedCurrent.toFixed(2)} mA | BURDEN: ${(wireResistance + loadResistance)} Ω`,
    scopeX + 15,
    scopeY + 70
  );
}

// ---------------------------------------------------------------------------
// 2. Pt100 RTD & WHEATSTONE BRIDGE RENDERER (IEC 60751)
// ---------------------------------------------------------------------------
export function renderRtd(
  rc: RenderContext,
  data: {
    temperature: number;
    wiringConfig: '2wire' | '3wire' | '4wire';
    leadResistance: number;
    trueRtdResistance: number;
    measuredResistance: number;
    leadWireErrorC: number;
  }
) {
  const { ctx, w, h } = rc;
  const { temperature, wiringConfig, leadResistance, trueRtdResistance, measuredResistance, leadWireErrorC } = data;

  // Industrial Thermowell & Process Well (Left)
  const wellX = 60;
  const wellY = 70;
  const wellW = 200;
  const wellH = 190;

  // Process Medium Tank Color
  const tempHue = Math.max(180, Math.min(360, 200 + (temperature / 300) * 160));
  ctx.fillStyle = `hsla(${tempHue}, 70%, 25%, 0.4)`;
  ctx.fillRect(wellX - 35, wellY + 30, 45, 140);
  ctx.strokeStyle = '#475569';
  ctx.strokeRect(wellX - 35, wellY + 30, 45, 140);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillText(`Process Temp`, wellX - 45, wellY + 18);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 13px "IBM Plex Mono", monospace';
  ctx.fillText(`${temperature.toFixed(1)} °C`, wellX - 45, wellY + 32);

  // Thermowell Stainless Stem
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(wellX + 10, wellY + 60, 100, 32, [0, 8, 8, 0]);
  ctx.fill();
  ctx.stroke();

  // Internal Platinum Thin-Film Sensing Element
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(wellX + 70, wellY + 70, 30, 12);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.2;
  for (let sx = wellX + 72; sx < wellX + 98; sx += 4) {
    ctx.beginPath();
    ctx.moveTo(sx, wellY + 70);
    ctx.lineTo(sx, wellY + 82);
    ctx.stroke();
  }
  ctx.fillStyle = '#f59e0b';
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillText(`Pt100 Element (${trueRtdResistance.toFixed(2)} Ω)`, wellX + 25, wellY + 112);

  // Head Junction Box
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(wellX + 110, wellY + 35, 75, 80, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#06b6d4';
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillText('CONN HEAD', wellX + 118, wellY + 52);

  // Bridge / Kelvin Circuit (Right)
  const bX = w - 340;
  const bY = 55;
  const bW = 300;
  const bH = 220;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(bX, bY, bW, bH, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#3b82f6';
  ctx.font = 'bold 12px "IBM Plex Mono", monospace';
  ctx.fillText(
    wiringConfig === '4wire' ? '4-WIRE KELVIN SENSING CHIP' : `${wiringConfig.toUpperCase()} WHEATSTONE BRIDGE`,
    bX + 20,
    bY + 28
  );

  // Wiring Leads Connecting Head to Bridge
  const termHeadX = wellX + 185;
  const bridgeInX = bX;

  const wireColors = wiringConfig === '4wire'
    ? ['#ef4444', '#ef4444', '#ffffff', '#ffffff']
    : wiringConfig === '3wire'
    ? ['#ef4444', '#ffffff', '#ffffff']
    : ['#ef4444', '#ffffff'];

  wireColors.forEach((color, idx) => {
    const wy = wellY + 55 + idx * 18;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(termHeadX, wy);
    ctx.lineTo(bridgeInX, wy);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(termHeadX, wy, 3, 0, Math.PI * 2);
    ctx.arc(bridgeInX, wy, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = '#f59e0b';
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillText(`Lead R = ${leadResistance} Ω / conductor`, termHeadX + 15, wellY + 45);

  // Bridge Diamond Diagram inside Box
  const diamX = bX + 150;
  const diamY = bY + 120;
  const rad = 45;

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(diamX, diamY - rad); // Top
  ctx.lineTo(diamX + rad, diamY); // Right
  ctx.lineTo(diamX, diamY + rad); // Bottom
  ctx.lineTo(diamX - rad, diamY); // Left
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillText('R1 = 100Ω', diamX + 10, diamY - 25);
  ctx.fillText('R2 = 100Ω', diamX - 70, diamY - 25);
  ctx.fillText('R3 = 100Ω', diamX - 70, diamY + 30);
  ctx.fillText('Rx = RTD', diamX + 10, diamY + 30);

  // Meter Circle in Bridge Center
  ctx.fillStyle = '#020617';
  ctx.strokeStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(diamX, diamY, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillText('mV', diamX - 7, diamY + 4);

  // Bottom Results & Analysis Panel
  const panelY = 295;
  const panelH = h - panelY - 15;
  ctx.fillStyle = '#020614';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(40, panelY, w - 80, panelH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 12px "IBM Plex Mono", monospace';
  ctx.fillText('IEC 60751 CALLENDAR-VAN DUSEN CONVERSION ANALYSIS', 60, panelY + 24);

  ctx.font = '11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`True Resistance R_rtd: ${trueRtdResistance.toFixed(3)} Ω`, 60, panelY + 48);
  ctx.fillText(`Measured Resistance R_meas: ${measuredResistance.toFixed(3)} Ω`, 60, panelY + 68);

  ctx.fillStyle = wiringConfig === '2wire' ? '#f43f5e' : '#10b981';
  ctx.font = 'bold 12px "IBM Plex Mono", monospace';
  ctx.fillText(
    wiringConfig === '2wire'
      ? `LEAD WIRE ERROR: +${leadWireErrorC.toFixed(2)} °C (+${(leadResistance * 2).toFixed(2)} Ω penalty!)`
      : wiringConfig === '3wire'
      ? `3-WIRE BRIDGE CANCELLATION: Balanced Lead Residual < 0.1 °C`
      : `4-WIRE KELVIN SENSING: 0.00 °C Error (Independent of Lead Length)`,
    w / 2 - 40,
    panelY + 58
  );
}

// ---------------------------------------------------------------------------
// 3. PNEUMATIC CONTROL VALVE & FLOW TRIM RENDERER (IEC 60534 / ISA-75)
// ---------------------------------------------------------------------------
export function renderControlValve(
  rc: RenderContext,
  data: {
    controllerOutput: number;
    trimType: 'linear' | 'equal_pct' | 'quick_open';
    inletPressure: number;
    outletPressure: number;
    deltaP: number;
    calculatedCv: number;
    volumetricFlowRate: number;
    valveStemPos: number;
    bubbleParticles: Array<{ x: number; y: number; r: number; speed: number }>;
  }
) {
  const { ctx, w, h, dt } = rc;
  const {
    controllerOutput, trimType, inletPressure, outletPressure,
    deltaP, calculatedCv, volumetricFlowRate, bubbleParticles
  } = data;

  const targetLift = controllerOutput / 100.0;
  data.valveStemPos += (targetLift - data.valveStemPos) * Math.min(1.0, dt * 6);
  const lift = data.valveStemPos;

  // Actuator Diaphragm Dome (Top Center)
  const actX = w / 2 - 100;
  const actY = 30;
  const actW = 200;
  const actH = 75;

  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(actX + actW / 2, actY + 25, actW / 2, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Internal Flexible Rubber Diaphragm
  const diapDeflect = lift * 18;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(actX + 15, actY + 25);
  ctx.quadraticCurveTo(actX + actW / 2, actY + 25 + diapDeflect, actX + actW - 15, actY + 25);
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText('DIAPHRAGM ACTUATOR', actX + 50, actY + 16);

  // Heavy Return Spring
  const springTop = actY + 45;
  const springBottom = actY + 120;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const coils = 6;
  const springH = springBottom - springTop;
  for (let c = 0; c <= coils; c++) {
    const sy = springTop + (c / coils) * springH;
    const sx = actX + actW / 2 + (c % 2 === 0 ? -16 : 16);
    if (c === 0) ctx.moveTo(actX + actW / 2, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.lineTo(actX + actW / 2, springBottom);
  ctx.stroke();

  // Valve Stem Connecting Actuator to Plug
  const stemX = actX + actW / 2;
  const stemTop = actY + 25 + diapDeflect;
  const stemBottom = 220 - lift * 28;

  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(stemX - 4, stemTop, 8, stemBottom - stemTop);

  // Position Indicator Scale on Yoke
  ctx.fillStyle = '#38bdf8';
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillText(`${(lift * 100).toFixed(0)}% LIFT`, stemX + 25, (springTop + springBottom) / 2);

  // Globe Valve Body Cast (Center-Bottom)
  const bodyX = w / 2 - 170;
  const bodyY = 160;
  const bodyW = 340;
  const bodyH = 110;

  // Pipe Inflow & Outflow
  ctx.fillStyle = '#0b1329';
  ctx.fillRect(bodyX, bodyY + 30, bodyW, 55);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(bodyX, bodyY + 30, bodyW, 55);

  // Fluid Velocity Gradient through Orifice Seat
  const fluidSpeed = (volumetricFlowRate / 80.0) * 2.5;
  const waterAlpha = Math.min(0.85, 0.2 + (volumetricFlowRate / 60.0) * 0.65);
  ctx.fillStyle = `rgba(14, 165, 233, ${waterAlpha})`;
  ctx.fillRect(bodyX + 2, bodyY + 32, bodyW - 4, 51);

  // Valve Orifice Seat & Plug
  const seatX = w / 2;
  const seatY = 220;

  // Metal Orifice Seat Ring
  ctx.fillStyle = '#334155';
  ctx.fillRect(seatX - 35, seatY, 20, 15);
  ctx.fillRect(seatX + 15, seatY, 20, 15);

  // Contoured Valve Plug
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(stemX - 16, stemBottom);
  ctx.lineTo(stemX + 16, stemBottom);
  if (trimType === 'equal_pct') {
    ctx.lineTo(stemX + 12, stemBottom + 18);
    ctx.lineTo(stemX - 12, stemBottom + 18);
  } else if (trimType === 'linear') {
    ctx.lineTo(stemX + 8, stemBottom + 20);
    ctx.lineTo(stemX - 8, stemBottom + 20);
  } else {
    ctx.lineTo(stemX + 16, stemBottom + 10);
    ctx.lineTo(stemX - 16, stemBottom + 10);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Dynamic Flow Streamline Particles
  bubbleParticles.forEach((b) => {
    b.x = (b.x + dt * fluidSpeed * b.speed) % 1.0;
    const px = bodyX + b.x * bodyW;
    const py = bodyY + 35 + b.y * 45;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(px, py, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Pressure Indicators on Inlet / Outlet Flanges
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillText(`P1 = ${inletPressure.toFixed(1)} bar`, bodyX + 10, bodyY + 22);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`P2 = ${outletPressure.toFixed(1)} bar`, bodyX + bodyW - 110, bodyY + 22);

  // Bottom Valve Performance & Sizing Banner
  const btmY = 285;
  const btmH = h - btmY - 15;
  ctx.fillStyle = '#020614';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(40, btmY, w - 80, btmH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 12px "IBM Plex Mono", monospace';
  ctx.fillText(`IEC 60534 VALVE SIZING TELEMETRY: ${trimType.toUpperCase()} TRIM`, 60, btmY + 24);

  ctx.font = '11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`Effective Cv: ${calculatedCv.toFixed(2)}`, 60, btmY + 50);
  ctx.fillStyle = '#10b981';
  ctx.fillText(`Flow Q: ${volumetricFlowRate.toFixed(2)} m³/h`, 240, btmY + 50);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`Differential ΔP: ${deltaP.toFixed(2)} bar`, 440, btmY + 50);

  const isCavitating = deltaP > inletPressure * 0.55;
  ctx.fillStyle = isCavitating ? '#f43f5e' : '#10b981';
  ctx.fillText(
    isCavitating ? '⚠️ CAVITATION REGIME (Choked Flow Warning)' : '✓ FLUID FLOW REGIME: SUB-CRITICAL',
    60,
    btmY + 75
  );
}

// ---------------------------------------------------------------------------
// 4. CLOSED-LOOP PID LEVEL CONTROLLER RENDERER (ISA S51.1)
// ---------------------------------------------------------------------------
export function renderPidLoop(
  rc: RenderContext,
  data: {
    setpoint: number;
    kp: number;
    ti: number;
    td: number;
    disturbanceInflow: number;
    pidState: {
      pv: number;
      integral: number;
      lastError: number;
      historyPv: number[];
      historySp: number[];
      historyMv: number[];
    };
  }
) {
  const { ctx, w, h, dt } = rc;
  const { setpoint, kp, ti, td, disturbanceInflow, pidState } = data;

  // Real ODE step update
  const error = setpoint - pidState.pv;
  pidState.integral += error * dt;
  pidState.integral = Math.max(-40, Math.min(40, pidState.integral)); // Anti-windup
  const derivative = (error - pidState.lastError) / Math.max(0.001, dt);
  pidState.lastError = error;

  let mv = kp * error + (kp / Math.max(0.1, ti)) * pidState.integral + kp * td * derivative;
  mv = Math.max(0, Math.min(100, mv));

  const inflowRate = (mv / 100.0) * 20.0 + disturbanceInflow * 0.15;
  const outflowRate = Math.sqrt(Math.max(0, pidState.pv)) * 2.2;
  pidState.pv += (inflowRate - outflowRate) * dt * 2.5;
  pidState.pv = Math.max(0, Math.min(100, pidState.pv));

  pidState.historyPv.shift();
  pidState.historyPv.push(pidState.pv);
  pidState.historySp.shift();
  pidState.historySp.push(setpoint);
  pidState.historyMv.shift();
  pidState.historyMv.push(mv);

  // Left Side: Process Vessel / Tank P&ID
  const tankX = 50;
  const tankY = 55;
  const tankW = 140;
  const tankH = 190;

  // Glass Tank Body
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(tankX, tankY, tankW, tankH);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.strokeRect(tankX, tankY, tankW, tankH);

  // Liquid Column
  const liquidH = (pidState.pv / 100.0) * (tankH - 20);
  const liquidY = tankY + tankH - liquidH;
  ctx.fillStyle = 'rgba(14, 165, 233, 0.75)';
  ctx.fillRect(tankX + 2, liquidY, tankW - 4, liquidH - 2);

  // Inflow Pipe & Stream
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(tankX + 25, tankY - 15, 20, 15);
  if (inflowRate > 0.5) {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
    ctx.fillRect(tankX + 30, tankY, 10, liquidY - tankY);
  }

  // Setpoint Dotted Line
  const spY = tankY + tankH - (setpoint / 100.0) * (tankH - 20);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(tankX, spY);
  ctx.lineTo(tankX + tankW, spY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText(`SP: ${setpoint}%`, tankX + tankW + 8, spY + 3);

  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`PV: ${pidState.pv.toFixed(1)}%`, tankX + tankW + 8, liquidY + 3);

  // Right Side: Strip Chart Recorder
  const chartX = 230;
  const chartY = 50;
  const chartW = w - chartX - 35;
  const chartH = 210;

  ctx.fillStyle = '#020614';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(chartX, chartY, chartW, chartH, 10);
  ctx.fill();
  ctx.stroke();

  // Chart Grid Lines
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
  ctx.lineWidth = 0.8;
  ctx.setLineDash([2, 4]);
  for (let gy = 0; gy <= 4; gy++) {
    const py = chartY + 20 + gy * ((chartH - 40) / 4);
    ctx.beginPath();
    ctx.moveTo(chartX, py);
    ctx.lineTo(chartX + chartW, py);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillText(`${100 - gy * 25}%`, chartX + 8, py - 3);
  }
  ctx.setLineDash([]);

  // Plot SP (Green)
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  pidState.historySp.forEach((spVal, idx) => {
    const px = chartX + 45 + (idx / (pidState.historySp.length - 1)) * (chartW - 55);
    const py = chartY + 20 + (1.0 - spVal / 100.0) * (chartH - 40);
    if (idx === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();

  // Plot PV (Cyan)
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  pidState.historyPv.forEach((pvVal, idx) => {
    const px = chartX + 45 + (idx / (pidState.historyPv.length - 1)) * (chartW - 55);
    const py = chartY + 20 + (1.0 - pvVal / 100.0) * (chartH - 40);
    if (idx === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();

  // Plot MV (Amber)
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  pidState.historyMv.forEach((mvVal, idx) => {
    const px = chartX + 45 + (idx / (pidState.historyMv.length - 1)) * (chartW - 55);
    const py = chartY + 20 + (1.0 - mvVal / 100.0) * (chartH - 40);
    if (idx === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();

  // Legend
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#10b981';
  ctx.fillText('— SP (Setpoint)', chartX + 50, chartY + 16);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('— PV (Process Level)', chartX + 180, chartY + 16);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('— MV (Valve Output)', chartX + 330, chartY + 16);

  // Bottom Status Bar
  const btmY = 280;
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, btmY, w - 80, h - btmY - 15);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillText(
    `PID GAINS: Kp = ${kp.toFixed(2)} | Ti = ${ti.toFixed(1)}s | Td = ${td.toFixed(2)}s | MV = ${mv.toFixed(1)}% | ANTI-WINDUP: ACTIVE`,
    55,
    btmY + 24
  );
}

// ---------------------------------------------------------------------------
// 5. DP ORIFICE PLATE FLOWMETER (ISO 5167 / ASME MFC-3M)
// ---------------------------------------------------------------------------
export function renderOrificeFlow(
  rc: RenderContext,
  data: {
    pipeD: number; // mm
    boreD: number; // mm
    beta: number; // d/D
    flowRateQ: number; // m3/h
    deltaP: number; // kPa
    permLossRatio: number;
    density: number; // kg/m3
    useSquareRoot: boolean;
    lowFlowCutoff: boolean;
    outputCurrent: number;
    particles: Array<{ x: number; y: number; speed: number }>;
  }
) {
  const { ctx, w, h, dt } = rc;
  const {
    pipeD, boreD, beta, flowRateQ, deltaP, permLossRatio,
    useSquareRoot, outputCurrent, particles
  } = data;

  // Pipeline Cross Section (Horizontal)
  const pipeX = 40;
  const pipeY = 60;
  const pipeW = w - 80;
  const pipeH = 130;

  // Pipe Wall Outer Shell
  ctx.fillStyle = '#090e1a';
  ctx.fillRect(pipeX, pipeY, pipeW, pipeH);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.strokeRect(pipeX, pipeY, pipeW, pipeH);

  // Fluid Velocity Field Gradient
  const velocityNorm = Math.min(1.0, flowRateQ / 100.0);
  ctx.fillStyle = `rgba(14, 165, 233, ${0.2 + velocityNorm * 0.6})`;
  ctx.fillRect(pipeX + 2, pipeY + 4, pipeW - 4, pipeH - 8);

  // Orifice Flange Assembly (Center)
  const orifX = pipeX + pipeW * 0.42;
  const plateThick = 12;

  // Flange Bolts
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.fillRect(orifX - 22, pipeY - 14, 20, pipeH + 28);
  ctx.strokeRect(orifX - 22, pipeY - 14, 20, pipeH + 28);
  ctx.fillRect(orifX + plateThick + 2, pipeY - 14, 20, pipeH + 28);
  ctx.strokeRect(orifX + plateThick + 2, pipeY - 14, 20, pipeH + 28);

  // Orifice Plate (Stainless Steel Blade with Bevel)
  const borePixels = pipeH * beta;
  const topPlateH = (pipeH - borePixels) / 2;

  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.5;

  // Top Section
  ctx.fillRect(orifX, pipeY, plateThick, topPlateH);
  ctx.strokeRect(orifX, pipeY, plateThick, topPlateH);

  // Bottom Section
  ctx.fillRect(orifX, pipeY + pipeH - topPlateH, plateThick, topPlateH);
  ctx.strokeRect(orifX, pipeY + pipeH - topPlateH, plateThick, topPlateH);

  // Vena Contracta Streamline Envelope (narrowing downstream)
  const venaX = orifX + 35;
  const venaH = borePixels * 0.86; // contraction
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 3]);

  ctx.beginPath();
  // Top streamline
  ctx.moveTo(orifX - 40, pipeY + 10);
  ctx.quadraticCurveTo(orifX, pipeY + topPlateH, venaX, pipeY + (pipeH - venaH) / 2);
  ctx.quadraticCurveTo(venaX + 80, pipeY + 15, pipeX + pipeW, pipeY + 15);
  ctx.stroke();

  // Bottom streamline
  ctx.beginPath();
  ctx.moveTo(orifX - 40, pipeY + pipeH - 10);
  ctx.quadraticCurveTo(orifX, pipeY + pipeH - topPlateH, venaX, pipeY + pipeH - (pipeH - venaH) / 2);
  ctx.quadraticCurveTo(venaX + 80, pipeY + pipeH - 15, pipeX + pipeW, pipeY + pipeH - 15);
  ctx.stroke();
  ctx.setLineDash([]);

  // Recirculating Eddy Vortices behind Plate
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(orifX + 22, pipeY + topPlateH / 2, 12, 0, Math.PI * 1.5);
  ctx.arc(orifX + 22, pipeY + pipeH - topPlateH / 2, 12, 0, Math.PI * 1.5);
  ctx.stroke();

  // Traveling Streamline Fluid Particles (Faster at Vena Contracta)
  particles.forEach((p) => {
    let localSpeed = velocityNorm * 2.0;
    // Accelerate as x approaches vena contracta
    if (p.x > 0.38 && p.x < 0.55) {
      localSpeed *= (1.0 / Math.max(0.2, beta * beta));
    }
    p.x = (p.x + dt * localSpeed * 0.4) % 1.0;
    const px = pipeX + p.x * pipeW;
    const py = pipeY + 15 + p.y * (pipeH - 30);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, 1.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // Impulse Lines to Differential Pressure Transmitter
  const tap1X = orifX - 25; // 1 inch upstream (Flange Tap)
  const tap2X = orifX + plateThick + 25; // 1 inch downstream
  const tapY = pipeY;

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  // Upstream HP tap
  ctx.moveTo(tap1X, tapY);
  ctx.lineTo(tap1X, tapY - 35);
  ctx.lineTo(w - 220, tapY - 35);
  ctx.lineTo(w - 220, tapY - 15);
  ctx.stroke();

  // Downstream LP tap
  ctx.strokeStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(tap2X, tapY);
  ctx.lineTo(tap2X, tapY - 25);
  ctx.lineTo(w - 180, tapY - 25);
  ctx.lineTo(w - 180, tapY - 15);
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText('HP TAP (P1)', tap1X - 28, tapY - 40);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('LP TAP (P2)', tap2X + 5, tapY - 30);

  // DP Transmitter Capsule Box
  const dpBoxX = w - 240;
  const dpBoxY = 15;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(dpBoxX, dpBoxY, 150, 42, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillText('SMART dP CELL', dpBoxX + 12, dpBoxY + 16);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`ΔP = ${deltaP.toFixed(2)} kPa`, dpBoxX + 12, dpBoxY + 32);

  // Bottom Wall Pressure Profile Graph (ISO 5167 Hydraulic Gradient)
  const graphX = 40;
  const graphY = 220;
  const graphW = w - 80;
  const graphH = h - graphY - 15;

  ctx.fillStyle = '#020614';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(graphX, graphY, graphW, graphH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillText('ISO 5167 STATIC PRESSURE PROFILE & HEAD RECOVERY CURVE', graphX + 15, graphY + 18);

  // Plot Static Pressure Profile Line
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();

  const baselineY = graphY + 45;
  const maxDrop = Math.min(graphH - 60, (deltaP / 80.0) * (graphH - 60));
  const permDrop = maxDrop * permLossRatio;

  // Upstream
  ctx.moveTo(graphX + 20, baselineY);
  ctx.lineTo(orifX - 20, baselineY);
  // Sharp drop to Vena Contracta
  ctx.lineTo(venaX, baselineY + maxDrop);
  // Downstream partial pressure recovery
  ctx.quadraticCurveTo(venaX + 120, baselineY + permDrop, graphX + graphW - 20, baselineY + permDrop);
  ctx.stroke();

  // Annotations on curve
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText('P1 (Upstream)', orifX - 90, baselineY - 6);
  ctx.fillStyle = '#f43f5e';
  ctx.fillText('Vena Contracta Min Pressure (P2)', venaX - 30, baselineY + maxDrop + 14);
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Permanent Head Loss Δϖ = ${(deltaP * permLossRatio).toFixed(1)} kPa`, graphX + graphW - 240, baselineY + permDrop - 8);

  // Telemetry Readout Strip inside Graph
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`FLOW: ${flowRateQ.toFixed(1)} m³/h`, graphX + 20, graphY + graphH - 15);
  ctx.fillStyle = '#10b981';
  ctx.fillText(`β RATIO (d/D): ${beta.toFixed(3)} [${boreD}mm / ${pipeD}mm]`, graphX + 190, graphY + graphH - 15);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`TRANSMITTER: ${outputCurrent.toFixed(2)} mA (${useSquareRoot ? '√ΔP EXTRACTED' : 'RAW ΔP'})`, graphX + 460, graphY + graphH - 15);
}

// ---------------------------------------------------------------------------
// 6. THERMOCOUPLE & COLD JUNCTION COMPENSATION RENDERER (IEC 60584)
// ---------------------------------------------------------------------------
export function renderThermocouple(
  rc: RenderContext,
  data: {
    hotTemp: number; // °C
    cjcTemp: number; // °C
    tcType: 'K' | 'J' | 'T' | 'S';
    cjcEnabled: boolean;
    useExtensionWire: boolean;
    rawMv: number;
    cjcMv: number;
    netMv: number;
    indicatedTemp: number;
    seebeckCoeff: number;
    particles: Array<{ pos: number; wire: number }>;
  }
) {
  const { ctx, w, h, dt } = rc;
  const {
    hotTemp, cjcTemp, tcType, cjcEnabled, useExtensionWire,
    rawMv, cjcMv, netMv, indicatedTemp, seebeckCoeff, particles
  } = data;

  // Industrial Furnace / Heat Source (Left)
  const furnX = 40;
  const furnY = 55;
  const furnW = 160;
  const furnH = 210;

  // Furnace Refractory Wall
  ctx.fillStyle = '#1c1917';
  ctx.strokeStyle = '#78716c';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(furnX, furnY, furnW, furnH, 10);
  ctx.fill();
  ctx.stroke();

  // Radiant Glowing Core
  const heatRatio = Math.min(1.0, hotTemp / 1200.0);
  const glowGrad = ctx.createRadialGradient(furnX + 90, furnY + 110, 5, furnX + 90, furnY + 110, 75);
  glowGrad.addColorStop(0, `rgba(255, 237, 213, ${0.4 + heatRatio * 0.6})`);
  glowGrad.addColorStop(0.5, `rgba(249, 115, 22, ${0.3 + heatRatio * 0.5})`);
  glowGrad.addColorStop(1, 'rgba(68, 64, 60, 0.1)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(furnX + 5, furnY + 5, furnW - 10, furnH - 10);

  ctx.fillStyle = '#ffedd5';
  ctx.font = 'bold 12px "IBM Plex Mono", monospace';
  ctx.fillText('PROCESS FURNACE', furnX + 20, furnY + 28);
  ctx.fillStyle = '#fb923c';
  ctx.font = 'bold 15px "IBM Plex Mono", monospace';
  ctx.fillText(`T_hot = ${hotTemp.toFixed(1)} °C`, furnX + 20, furnY + 48);

  // Ceramic Protection Sheath Tube
  const sheathX = furnX + 60;
  const sheathY = furnY + 95;
  ctx.fillStyle = '#e7e5e4';
  ctx.strokeStyle = '#a8a29e';
  ctx.lineWidth = 1.5;
  ctx.fillRect(sheathX, sheathY, 80, 26);
  ctx.strokeRect(sheathX, sheathY, 80, 26);

  // Hot Junction Welded Bead
  const beadX = sheathX + 15;
  const beadY = sheathY + 13;
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.arc(beadX, beadY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText('HOT JUNCTION', beadX - 10, beadY - 14);

  // Color Codes by Standard
  const wireColorA = tcType === 'K' ? '#facc15' : tcType === 'J' ? '#ffffff' : tcType === 'T' ? '#38bdf8' : '#e2e8f0';
  const wireColorB = tcType === 'K' ? '#ef4444' : tcType === 'J' ? '#ef4444' : tcType === 'T' ? '#ef4444' : '#94a3b8';
  const legAName = tcType === 'K' ? 'Chromel (+)' : tcType === 'J' ? 'Iron (+)' : tcType === 'T' ? 'Copper (+)' : 'Pt10%Rh (+)';
  const legBName = tcType === 'K' ? 'Alumel (-)' : tcType === 'J' ? 'Constantan (-)' : tcType === 'T' ? 'Constantan (-)' : 'Platinum (-)';

  // Field Cable Run & Terminal Head
  const headX = w - 300;
  const headY = 55;
  const headW = 260;
  const headH = 210;

  const wire1Y = sheathY + 8;
  const wire2Y = sheathY + 18;
  const term1Y = headY + 75;
  const term2Y = headY + 105;

  // Conductor Wire 1 (Positive Leg)
  ctx.strokeStyle = useExtensionWire ? wireColorA : '#b45309'; // Copper wire error color
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(beadX, wire1Y);
  ctx.lineTo(headX, term1Y);
  ctx.stroke();

  // Conductor Wire 2 (Negative Leg)
  ctx.strokeStyle = useExtensionWire ? wireColorB : '#b45309';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(beadX, wire2Y);
  ctx.lineTo(headX, term2Y);
  ctx.stroke();

  // Wire Labels
  ctx.fillStyle = wireColorA;
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillText(useExtensionWire ? legAName : '⚠️ Plain Copper Wire (Mismatched!)', beadX + 90, term1Y - 10);
  ctx.fillStyle = wireColorB;
  ctx.fillText(useExtensionWire ? legBName : '⚠️ Plain Copper Wire', beadX + 90, term2Y + 16);

  // Traveling Thermoelectric Potential Particles (Seebeck electron drift)
  if (Math.abs(hotTemp - cjcTemp) > 5) {
    particles.forEach((p) => {
      p.pos = (p.pos + dt * 0.3) % 1.0;
      const curX = beadX + p.pos * (headX - beadX);
      const curY = p.wire === 0 ? wire1Y + p.pos * (term1Y - wire1Y) : wire2Y + p.pos * (term2Y - wire2Y);
      ctx.fillStyle = p.wire === 0 ? '#fde047' : '#93c5fd';
      ctx.beginPath();
      ctx.arc(curX, curY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Transmitter Enclosure & Cold Junction Isothermal Block
  ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(headX, headY, headW, headH, 12);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#06b6d4';
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillText(`TRANSMITTER (TYPE ${tcType})`, headX + 15, headY + 25);
  ctx.fillStyle = '#64748b';
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillText('ISOTHERMAL TERMINAL BLOCK', headX + 15, headY + 38);

  // Terminal Screws
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(headX, term1Y, 5, 0, Math.PI * 2);
  ctx.arc(headX, term2Y, 5, 0, Math.PI * 2);
  ctx.fill();

  // Internal CJC Temperature Sensor (Miniature Pt100 chip embedded in terminal block)
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = cjcEnabled ? '#10b981' : '#f43f5e';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(headX + 25, term1Y - 10, 110, 48);
  ctx.fillStyle = cjcEnabled ? '#10b981' : '#f43f5e';
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText('CJC SENSOR CHIP', headX + 32, term1Y + 6);
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(`T_cjc = ${cjcTemp.toFixed(1)} °C`, headX + 32, term1Y + 22);

  // High Precision Microvoltmeter LCD
  const meterY = headY + 140;
  ctx.fillStyle = '#020617';
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(headX + 15, meterY, headW - 30, 55);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 15px "IBM Plex Mono", monospace';
  ctx.fillText(`${netMv.toFixed(3)} mV`, headX + 25, meterY + 26);

  ctx.fillStyle = Math.abs(indicatedTemp - hotTemp) < 1.0 ? '#10b981' : '#f43f5e';
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillText(`Indicated: ${indicatedTemp.toFixed(1)} °C`, headX + 25, meterY + 44);

  // Bottom Seebeck Equations & Physics Analysis Strip
  const btmY = 280;
  const btmH = h - btmY - 15;
  ctx.fillStyle = '#020614';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(40, btmY, w - 80, btmH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillText(`IEC 60584 THERMOELECTRIC SEEBECK ANALYSIS (TYPE ${tcType}): S ≈ ${seebeckCoeff.toFixed(2)} µV/°C`, 60, btmY + 24);

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Raw Measured EMF: ${rawMv.toFixed(3)} mV`, 60, btmY + 48);
  ctx.fillText(`CJC Correction Voltage: +${cjcMv.toFixed(3)} mV`, 280, btmY + 48);
  ctx.fillText(`Net EMF (V_total): ${netMv.toFixed(3)} mV`, 510, btmY + 48);

  const errorDeg = indicatedTemp - hotTemp;
  ctx.fillStyle = Math.abs(errorDeg) < 0.5 ? '#10b981' : '#f43f5e';
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillText(
    Math.abs(errorDeg) < 0.5
      ? `✓ CJC COMPENSATION ACTIVE: True Process Temperature Accurate to ±0.2°C`
      : `⚠️ MEASUREMENT ERROR: ${errorDeg.toFixed(1)}°C caused by ${!cjcEnabled ? 'Disabled CJC' : 'Extension Copper Mismatch'}!`,
    60,
    btmY + 74
  );
}

// ---------------------------------------------------------------------------
// 7. HYDROSTATIC DP TANK LEVEL RENDERER (IEC 61515 / ISA-RP51.1)
// ---------------------------------------------------------------------------
export function renderHydrostaticLevel(
  rc: RenderContext,
  data: {
    tankHeight: number; // m
    levelMeters: number; // m
    levelPercent: number; // %
    sgProcess: number;
    sgSeal: number;
    mountingOffsetZ: number; // m
    tankType: 'open' | 'closed_dry' | 'closed_wet';
    blanketGasPressure: number; // bar
    pHP: number; // mmH2O
    pLP: number; // mmH2O
    deltaP: number; // mmH2O
    lrv: number;
    urv: number;
    calibrationType: 'normal' | 'suppression' | 'elevation';
    outputCurrent: number;
  }
) {
  const { ctx, w, h } = rc;
  const {
    tankHeight, levelMeters, levelPercent, sgProcess,
    mountingOffsetZ, tankType, blanketGasPressure,
    pHP, pLP, deltaP, lrv, urv, calibrationType, outputCurrent
  } = data;

  // Process Storage Tank (Left)
  const tankX = 70;
  const tankY = 40;
  const tankW = 190;
  const tankH = 180;

  // Tank Shell
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(tankX, tankY, tankW, tankH, 8);
  ctx.fill();
  ctx.stroke();

  // Blanket Gas Space (if closed tank)
  if (tankType !== 'open') {
    ctx.fillStyle = 'rgba(234, 179, 8, 0.08)';
    ctx.fillRect(tankX + 2, tankY + 2, tankW - 4, tankH - 4);
    ctx.fillStyle = '#eab308';
    ctx.font = 'bold 9px "IBM Plex Mono", monospace';
    ctx.fillText(`Blanket Gas P_gas: ${blanketGasPressure.toFixed(2)} bar`, tankX + 15, tankY + 18);
  } else {
    ctx.fillStyle = '#64748b';
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillText('OPEN TANK (P_atm = 0)', tankX + 15, tankY + 18);
  }

  // Liquid Volume
  const liquidPx = (levelPercent / 100.0) * (tankH - 30);
  const liquidTopY = tankY + tankH - liquidPx;

  ctx.fillStyle = 'rgba(14, 165, 233, 0.8)';
  ctx.fillRect(tankX + 2, liquidTopY, tankW - 4, liquidPx);

  // Liquid Meniscus Surface Ripple
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(tankX + 2, liquidTopY);
  ctx.lineTo(tankX + tankW - 2, liquidTopY);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillText(`h = ${levelMeters.toFixed(2)} m (${levelPercent.toFixed(1)}%)`, tankX + 25, liquidTopY - 8);

  // Sight Glass Scale on Left
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  for (let s = 0; s <= 4; s++) {
    const sy = tankY + 30 + s * ((tankH - 30) / 4);
    ctx.beginPath();
    ctx.moveTo(tankX - 10, sy);
    ctx.lineTo(tankX, sy);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '8px "IBM Plex Mono", monospace';
    ctx.fillText(`${(tankHeight * (1 - s / 4)).toFixed(1)}m`, tankX - 35, sy + 3);
  }

  // High Pressure (HP) Impulse Pipe (Tank Bottom to Transmitter)
  const hpTapY = tankY + tankH - 10;
  const txX = w - 240;
  const txY = hpTapY + mountingOffsetZ * 30; // Mounting offset below tank datum

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(tankX + tankW, hpTapY);
  ctx.lineTo(txX - 40, hpTapY);
  ctx.lineTo(txX - 40, txY + 20);
  ctx.lineTo(txX, txY + 20);
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText(`HP IMPULSE (P_HP = ${pHP.toFixed(0)} mmH2O)`, tankX + tankW + 15, hpTapY - 8);

  // Low Pressure (LP) Impulse Pipe
  const lpTapY = tankY + 25;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (tankType === 'open') {
    // Vented to atmosphere
    ctx.moveTo(txX, txY + 45);
    ctx.lineTo(txX - 25, txY + 45);
    ctx.stroke();
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('LP VENT (ATM)', txX - 95, txY + 48);
  } else {
    // Pipe to Tank Top
    ctx.moveTo(tankX + tankW, lpTapY);
    ctx.lineTo(txX - 25, lpTapY);
    ctx.lineTo(txX - 25, txY + 45);
    ctx.lineTo(txX, txY + 45);
    ctx.stroke();

    if (tankType === 'closed_wet') {
      // Wet Leg Seal Fluid Fill (Dark Blue/Purple)
      ctx.fillStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.fillRect(txX - 28, lpTapY, 6, txY + 45 - lpTapY);

      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 9px "IBM Plex Mono", monospace';
      ctx.fillText('WET LEG (GLYCOL SEAL POT)', txX - 175, lpTapY - 8);
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px "IBM Plex Mono", monospace';
      ctx.fillText('DRY LEG (VAPOR RETURN)', txX - 165, lpTapY - 8);
    }
  }

  // Differential Pressure Transmitter Body
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(txX, txY, 170, 75, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillText('dP LEVEL TX', txX + 15, txY + 20);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 15px "IBM Plex Mono", monospace';
  ctx.fillText(`${deltaP.toFixed(0)} mmH2O`, txX + 15, txY + 42);

  ctx.fillStyle = '#f8fafc';
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillText(`I_out: ${outputCurrent.toFixed(2)} mA`, txX + 15, txY + 62);

  // Bottom Elevation/Suppression Calibration Banner
  const btmY = 270;
  const btmH = h - btmY - 15;
  ctx.fillStyle = '#020614';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(40, btmY, w - 80, btmH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillText(
    `IEC 61515 DP LEVEL CALIBRATION: ${calibrationType.toUpperCase()} CALIBRATION`,
    60,
    btmY + 22
  );

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`High Pressure P_HP: ${pHP.toFixed(0)} mmH2O`, 60, btmY + 44);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`Low Pressure P_LP: ${pLP.toFixed(0)} mmH2O`, 270, btmY + 44);
  ctx.fillStyle = '#10b981';
  ctx.fillText(`Span ΔP: ${deltaP.toFixed(0)} mmH2O`, 480, btmY + 44);

  ctx.fillStyle = '#f8fafc';
  ctx.fillText(`Calibrated LRV (0% Level): ${lrv.toFixed(0)} mmH2O`, 60, btmY + 68);
  ctx.fillText(`Calibrated URV (100% Level): ${urv.toFixed(0)} mmH2O`, 310, btmY + 68);
  ctx.fillStyle = calibrationType === 'elevation' ? '#c084fc' : calibrationType === 'suppression' ? '#f59e0b' : '#10b981';
  ctx.fillText(
    calibrationType === 'elevation'
      ? '★ ZERO ELEVATION (Negative LRV due to wet reference leg)'
      : calibrationType === 'suppression'
      ? '★ ZERO SUPPRESSION (Positive LRV due to transmitter mounted below datum)'
      : '★ STANDARD ZERO (Transmitter aligned with datum)',
    60,
    btmY + 90
  );
}

// ---------------------------------------------------------------------------
// 8. CORIOLIS MASS FLOWMETER & RESONANT TUBE DENSITY RENDERER (ISO 10790)
// ---------------------------------------------------------------------------
export function renderCoriolisMeter(
  rc: RenderContext,
  data: {
    massFlowKgH: number;
    density: number; // kg/m3
    resonantFreqHz: number;
    phaseShiftMicrosec: number;
    volumetricFlowM3H: number;
    twoPhaseFault: boolean;
    vibrationAmp: number;
  }
) {
  const { ctx, w, h, t } = rc;
  const {
    massFlowKgH, density, resonantFreqHz, phaseShiftMicrosec,
    volumetricFlowM3H, twoPhaseFault, vibrationAmp
  } = data;

  // Mechanical U-Tube Vibration Geometry (Top Half)
  const tubeCenterX = w / 2 - 40;
  const tubeCenterY = 120;
  const tubeR = 75;

  // Vibration Oscillation Amplitude at Resonant Frequency
  const omega = resonantFreqHz * 0.1;
  const vibOffset = Math.sin(t * omega) * (twoPhaseFault ? 2 : vibrationAmp);
  const twistOffset = (phaseShiftMicrosec / 20.0) * Math.cos(t * omega) * 6;

  // Sensor Enclosure Outline
  ctx.fillStyle = '#090e1a';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(tubeCenterX - 180, 45, 360, 155, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillText('CORIOLIS DUAL RESONANT U-TUBE SENSOR CORE (ISO 10790)', tubeCenterX - 160, 65);

  // Oscillating Dual U-Tubes
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Tube 1 (Top / Upper U-Tube)
  ctx.beginPath();
  ctx.moveTo(tubeCenterX - 140, tubeCenterY + 30);
  ctx.lineTo(tubeCenterX - tubeR, tubeCenterY - 20 + vibOffset - twistOffset);
  ctx.arc(tubeCenterX, tubeCenterY - 20 + vibOffset, tubeR, Math.PI, 0, false);
  ctx.lineTo(tubeCenterX + 140, tubeCenterY + 30);
  ctx.stroke();

  // Tube 2 (Bottom / Lower U-Tube vibrating in counter-phase)
  ctx.strokeStyle = '#0284c7';
  ctx.beginPath();
  ctx.moveTo(tubeCenterX - 140, tubeCenterY + 30);
  ctx.lineTo(tubeCenterX - tubeR, tubeCenterY - 20 - vibOffset + twistOffset);
  ctx.arc(tubeCenterX, tubeCenterY - 20 - vibOffset, tubeR, Math.PI, 0, false);
  ctx.lineTo(tubeCenterX + 140, tubeCenterY + 30);
  ctx.stroke();

  // Central Electromagnetic Drive Coil
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.5;
  ctx.fillRect(tubeCenterX - 12, tubeCenterY - 20 + vibOffset - 8, 24, 16);
  ctx.strokeRect(tubeCenterX - 12, tubeCenterY - 20 + vibOffset - 8, 24, 16);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('DRIVE', tubeCenterX - 10, tubeCenterY - 20 + vibOffset + 3);

  // Left Pickoff Sensor Coil (Inlet Leg)
  const pick1X = tubeCenterX - tubeR * 0.75;
  const pick1Y = tubeCenterY - 10 + vibOffset - twistOffset;
  ctx.fillStyle = '#10b981';
  ctx.fillRect(pick1X - 8, pick1Y - 8, 16, 16);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('IN', pick1X - 5, pick1Y + 4);

  // Right Pickoff Sensor Coil (Outlet Leg)
  const pick2X = tubeCenterX + tubeR * 0.75;
  const pick2Y = tubeCenterY - 10 + vibOffset + twistOffset;
  ctx.fillStyle = '#10b981';
  ctx.fillRect(pick2X - 8, pick2Y - 8, 16, 16);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('OUT', pick2X - 8, pick2Y + 4);

  // Oscilloscope Display (Bottom Half): Dual Trace Sine Waves Showing Phase Shift
  const oscX = 40;
  const oscY = 220;
  const oscW = w - 80;
  const oscH = h - oscY - 15;

  ctx.fillStyle = '#020614';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(oscX, oscY, oscW, oscH, 8);
  ctx.fill();
  ctx.stroke();

  // Oscilloscope Graticule
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
  ctx.lineWidth = 0.8;
  ctx.setLineDash([2, 4]);
  for (let gx = oscX + 50; gx < oscX + oscW; gx += 50) {
    ctx.beginPath();
    ctx.moveTo(gx, oscY);
    ctx.lineTo(gx, oscY + oscH);
    ctx.stroke();
  }
  const midY = oscY + 50;
  ctx.beginPath();
  ctx.moveTo(oscX, midY);
  ctx.lineTo(oscX + oscW, midY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Plot Inlet Pickoff Sine Wave (Cyan)
  const waveFreq = 0.04;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let px = 0; px < oscW - 40; px += 3) {
    const py = midY + Math.sin(px * waveFreq + t * 6) * 32;
    if (px === 0) ctx.moveTo(oscX + 20 + px, py);
    else ctx.lineTo(oscX + 20 + px, py);
  }
  ctx.stroke();

  // Plot Outlet Pickoff Sine Wave (Green - Phase Delayed by Δt)
  const phaseRad = (phaseShiftMicrosec / 25.0) * 1.5;
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let px = 0; px < oscW - 40; px += 3) {
    const py = midY + Math.sin(px * waveFreq + t * 6 - phaseRad) * 32;
    if (px === 0) ctx.moveTo(oscX + 20 + px, py);
    else ctx.lineTo(oscX + 20 + px, py);
  }
  ctx.stroke();

  // Δt Time Delay Annotation
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillText(`PICKOFF PHASE DELAY: Δt = ${phaseShiftMicrosec.toFixed(2)} µs (∝ Mass Flow ṁ)`, oscX + 25, oscY + 22);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillText('— INLET COIL PICKOFF SIGNAL', oscX + 380, oscY + 22);
  ctx.fillStyle = '#10b981';
  ctx.fillText('— OUTLET COIL PICKOFF SIGNAL', oscX + 540, oscY + 22);

  // Telemetry Metrics Row
  const rowY = oscY + oscH - 20;
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillText(`ṁ: ${massFlowKgH.toFixed(0)} kg/h`, oscX + 20, rowY);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`DENSITY: ${density.toFixed(1)} kg/m³`, oscX + 170, rowY);
  ctx.fillStyle = '#10b981';
  ctx.fillText(`TUBE FREQ f0: ${resonantFreqHz.toFixed(1)} Hz`, oscX + 360, rowY);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`VOL FLOW: ${volumetricFlowM3H.toFixed(2)} m³/h`, oscX + 530, rowY);
}

// ---------------------------------------------------------------------------
// 8. BODE & NYQUIST FREQUENCY RESPONSE STABILITY RENDERER
// ---------------------------------------------------------------------------
export interface BodePlotParams {
  gainK: number;
  naturalFreq: number; // wn (rad/s)
  dampingRatio: number; // zeta
  timeDelay: number; // Td (s)
  probeFreq: number; // probe w (rad/s)
}

export function renderBodePlot(rc: RenderContext, p: BodePlotParams) {
  const { ctx, w, h } = rc;
  const K = p.gainK || 2.0;
  const wn = p.naturalFreq || 10.0;
  const zeta = p.dampingRatio || 0.4;
  const Td = p.timeDelay !== undefined ? p.timeDelay : 0.05;
  const wProbe = p.probeFreq || 10.0;

  // Background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, w, h);

  // Divide canvas: Left = Dual Bode plots (Mag & Phase), Right = Nyquist Polar Diagram
  const splitX = Math.floor(w * 0.54);

  // G(jw) calculation helper
  const calcG = (omegaVal: number) => {
    const reDen = wn * wn - omegaVal * omegaVal;
    const imDen = 2 * zeta * wn * omegaVal;
    const denMag = Math.sqrt(reDen * reDen + imDen * imDen);
    const denPhi = Math.atan2(imDen, reDen);
    const mag = (K * wn * wn) / Math.max(1e-6, denMag);
    const phi = -denPhi - omegaVal * Td;
    const magDb = 20 * Math.log10(Math.max(1e-4, mag));
    const phiDeg = (phi * 180) / Math.PI;
    return { mag, phi, magDb, phiDeg, re: mag * Math.cos(phi), im: mag * Math.sin(phi) };
  };

  // Find Gain Crossover & Phase Margin
  let w_gc: number | null = null;
  let pm_deg: number | null = null;
  for (let om = 0.1; om <= 300; om *= 1.02) {
    const g = calcG(om);
    if (g.magDb <= 0 && w_gc === null) {
      w_gc = om;
      let wrapped = ((g.phiDeg % 360) + 360) % 360;
      if (wrapped > 180) wrapped -= 360;
      pm_deg = 180 + wrapped;
      break;
    }
  }

  // Find Phase Crossover & Gain Margin
  let w_pc: number | null = null;
  let gm_db: number | null = null;
  for (let om = 0.1; om <= 300; om *= 1.02) {
    const g = calcG(om);
    let wrapped = ((g.phiDeg % 360) + 360) % 360;
    if (wrapped > 180) wrapped -= 360;
    if (wrapped <= -180 || g.phiDeg <= -180) {
      w_pc = om;
      gm_db = -g.magDb;
      break;
    }
  }

  const isStable = (pm_deg !== null && pm_deg > 0) && (gm_db === null || gm_db > 0);

  // --- LEFT: BODE DIAGRAMS (Magnitude on top, Phase on bottom) ---
  ctx.save();
  const bodeLeft = 50;
  const bodeRight = splitX - 25;
  const bodeW = bodeRight - bodeLeft;

  const wMin = 0.1;
  const wMax = 200;
  const logWMin = Math.log10(wMin);
  const logWMax = Math.log10(wMax);

  const toBodeX = (omegaVal: number) => {
    const frac = (Math.log10(Math.max(wMin, omegaVal)) - logWMin) / (logWMax - logWMin);
    return bodeLeft + frac * bodeW;
  };

  // 1. Magnitude Plot
  const magTop = 48;
  const magBot = Math.floor(h * 0.48);
  const magH = magBot - magTop;
  const dbMin = -40;
  const dbMax = 40;

  ctx.fillStyle = '#020617';
  ctx.fillRect(bodeLeft, magTop, bodeW, magH);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(bodeLeft, magTop, bodeW, magH);

  // Magnitude Grid & Decibel ticks
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
  ctx.lineWidth = 1;
  for (let db = -40; db <= 40; db += 20) {
    const y = magBot - ((db - dbMin) / (dbMax - dbMin)) * magH;
    ctx.beginPath(); ctx.moveTo(bodeLeft, y); ctx.lineTo(bodeRight, y); ctx.stroke();
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${db > 0 ? '+' : ''}${db}dB`, 10, y + 3);
  }

  // Frequency Decade grid lines
  const decades = [0.1, 1, 10, 100];
  decades.forEach((dec) => {
    const x = toBodeX(dec);
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.7)';
    ctx.beginPath(); ctx.moveTo(x, magTop); ctx.lineTo(x, magBot); ctx.stroke();
    for (let sub = 2; sub <= 9; sub++) {
      const subX = toBodeX(dec * sub);
      if (subX <= bodeRight) {
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
        ctx.beginPath(); ctx.moveTo(subX, magTop); ctx.lineTo(subX, magBot); ctx.stroke();
      }
    }
  });

  // 0 dB reference line
  const zeroDbY = magBot - ((0 - dbMin) / (dbMax - dbMin)) * magH;
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
  ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(bodeLeft, zeroDbY); ctx.lineTo(bodeRight, zeroDbY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('0 dB (Unity Gain)', bodeLeft + 8, zeroDbY - 4);

  // Draw Magnitude curve
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const plotSteps = 120;
  for (let s = 0; s <= plotSteps; s++) {
    const logOm = logWMin + (s / plotSteps) * (logWMax - logWMin);
    const om = Math.pow(10, logOm);
    const g = calcG(om);
    const x = toBodeX(om);
    const y = magBot - ((Math.min(dbMax, Math.max(dbMin, g.magDb)) - dbMin) / (dbMax - dbMin)) * magH;
    if (s === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // 2. Phase Plot
  const phaseTop = Math.floor(h * 0.54);
  const phaseBot = h - 35;
  const phaseH = phaseBot - phaseTop;
  const degMin = -270;
  const degMax = 0;

  ctx.fillStyle = '#020617';
  ctx.fillRect(bodeLeft, phaseTop, bodeW, phaseH);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(bodeLeft, phaseTop, bodeW, phaseH);

  // Phase grid lines
  for (let deg = -270; deg <= 0; deg += 45) {
    const y = phaseBot - ((deg - degMin) / (degMax - degMin)) * phaseH;
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
    ctx.beginPath(); ctx.moveTo(bodeLeft, y); ctx.lineTo(bodeRight, y); ctx.stroke();
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`${deg}°`, 10, y + 3);
  }

  // -180° reference line
  const m180Y = phaseBot - ((-180 - degMin) / (degMax - degMin)) * phaseH;
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(bodeLeft, m180Y); ctx.lineTo(bodeRight, m180Y); ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#ef4444';
  ctx.fillText('-180° (Instability Limit)', bodeLeft + 8, m180Y - 4);

  // Draw Phase curve
  ctx.strokeStyle = '#06b6d4';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let s = 0; s <= plotSteps; s++) {
    const logOm = logWMin + (s / plotSteps) * (logWMax - logWMin);
    const om = Math.pow(10, logOm);
    const g = calcG(om);
    let wrapped = ((g.phiDeg % 360) + 360) % 360;
    if (wrapped > 0) wrapped -= 360;
    const x = toBodeX(om);
    const y = phaseBot - ((Math.min(degMax, Math.max(degMin, wrapped)) - degMin) / (degMax - degMin)) * phaseH;
    if (s === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Phase Margin dimension marker at w_gc
  if (w_gc && pm_deg !== null) {
    const gcX = toBodeX(w_gc);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(gcX, magTop); ctx.lineTo(gcX, phaseBot); ctx.stroke();

    const gAtGc = calcG(w_gc);
    let wrapped = ((gAtGc.phiDeg % 360) + 360) % 360;
    if (wrapped > 0) wrapped -= 360;
    const phiGcY = phaseBot - ((Math.min(degMax, Math.max(degMin, wrapped)) - degMin) / (degMax - degMin)) * phaseH;

    // PM arrow
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(gcX, m180Y);
    ctx.lineTo(gcX, phiGcY);
    ctx.stroke();

    ctx.font = 'bold 9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText(`PM = ${pm_deg.toFixed(1)}°`, gcX + 6, (m180Y + phiGcY) / 2);
  }

  // Titles for Bode plots
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#10b981';
  ctx.fillText('BODE MAGNITUDE |G(jω)| (dB)', bodeLeft, magTop - 8);
  ctx.fillStyle = '#06b6d4';
  ctx.fillText('BODE PHASE ∠G(jω) (deg)', bodeLeft, phaseTop - 8);

  ctx.restore();

  // --- RIGHT: POLAR NYQUIST DIAGRAM ---
  ctx.save();
  const nyqX = splitX + 12;
  const nyqY = 12;
  const nyqW = w - splitX - 24;
  const nyqH = h - 24;

  ctx.fillStyle = '#020617';
  ctx.fillRect(nyqX, nyqY, nyqW, nyqH);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(nyqX, nyqY, nyqW, nyqH);

  // Title
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#a855f7';
  ctx.fillText('POLAR NYQUIST DIAGRAM & CAUCHY STABILITY', nyqX + 14, nyqY + 24);

  const nyqCx = nyqX + nyqW * 0.58;
  const nyqCy = nyqY + nyqH * 0.52;
  const nyqScale = Math.min(nyqW, nyqH) * 0.32; // scale for unit circle

  // Axes in complex plane
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(nyqX + 20, nyqCy); ctx.lineTo(nyqX + nyqW - 20, nyqCy); // Real axis
  ctx.moveTo(nyqCx, nyqY + 40); ctx.lineTo(nyqCx, nyqY + nyqH - 30); // Imag axis
  ctx.stroke();

  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Re G(jω)', nyqX + nyqW - 70, nyqCy - 6);
  ctx.fillText('+Im', nyqCx + 6, nyqY + 52);
  ctx.fillText('–Im', nyqCx + 6, nyqY + nyqH - 36);

  // Unit Circle (|G| = 1)
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(nyqCx, nyqCy, nyqScale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillText('|G|=1', nyqCx + nyqScale * 0.7, nyqCy - nyqScale * 0.7);

  // Critical Stability Point: (-1, j0)
  const critX = nyqCx - nyqScale;
  const critY = nyqCy;
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(critX, critY, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillText('(-1, j0)', critX - 52, critY - 8);

  // Draw Nyquist Contour G(jw) for w: 0.05 -> 150
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const nyqSteps = 160;
  for (let s = 0; s <= nyqSteps; s++) {
    const om = 0.05 + Math.pow(s / nyqSteps, 2.5) * 120;
    const g = calcG(om);
    const px = nyqCx + g.re * nyqScale;
    const py = nyqCy - g.im * nyqScale;
    if (s === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Draw Negative Frequency Conjugate locus (faint dashed)
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  for (let s = 0; s <= nyqSteps; s++) {
    const om = 0.05 + Math.pow(s / nyqSteps, 2.5) * 120;
    const g = calcG(om);
    const px = nyqCx + g.re * nyqScale;
    const py = nyqCy + g.im * nyqScale;
    if (s === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Probe Frequency point on Nyquist
  const probeG = calcG(wProbe);
  const probePx = nyqCx + probeG.re * nyqScale;
  const probePy = nyqCy - probeG.im * nyqScale;
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(probePx, probePy, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillText(`ω=${wProbe.toFixed(1)}`, probePx + 8, probePy + 3);

  // Stability Verdict Card at bottom
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.fillRect(nyqX + 15, nyqY + nyqH - 52, nyqW - 30, 40);
  ctx.strokeStyle = isStable ? '#10b981' : '#ef4444';
  ctx.strokeRect(nyqX + 15, nyqY + nyqH - 52, nyqW - 30, 40);

  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = isStable ? '#10b981' : '#ef4444';
  ctx.fillText(isStable ? '✓ CLOSED-LOOP SYSTEM ASYMPTOTICALLY STABLE' : '⚠ SYSTEM CLOSED-LOOP UNSTABLE / OSCILLATORY', nyqX + 25, nyqY + nyqH - 32);
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`PM = ${pm_deg !== null ? pm_deg.toFixed(1) + '°' : '>180°'} | GM = ${gm_db !== null ? gm_db.toFixed(1) + ' dB' : '∞'} | N = 0 Encirclements`, nyqX + 25, nyqY + nyqH - 18);

  ctx.restore();
}

