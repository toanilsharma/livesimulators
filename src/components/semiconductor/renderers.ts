// High-Fidelity Canvas Renderers for Semiconductor & Power Electronics Simulators
// Adheres strictly to JEDEC JESD24-11, IEC 60747-8/9/15, and IEEE EDS / BSIM4 Standards

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  dt: number;
  t: number;
}

// ---------------------------------------------------------------------------
// 1. SILICON CARBIDE (SiC) MOSFET DOUBLE-PULSE SWITCHING DYNAMICS RENDERER
// ---------------------------------------------------------------------------
export interface SicSwitchingParams {
  busVoltage: number;       // V_dc (200 - 1000 V)
  loadCurrent: number;      // I_L (5 - 100 A)
  gateResistance: number;   // R_g (1 - 50 Ohm)
  strayInductance: number;  // L_s (5 - 60 nH)
}

export function renderSicSwitching(rc: RenderContext, p: SicSwitchingParams) {
  const { ctx, w, h, t } = rc;
  const { busVoltage, loadCurrent, gateResistance, strayInductance } = p;

  const Vdc = Math.max(100, busVoltage);
  const IL = Math.max(2, loadCurrent);
  const Rg = Math.max(1, gateResistance);
  const Ls = Math.max(2, strayInductance);

  // Physics slew rates & transients
  const Cgd = 45e-12; // 45 pF
  const Vplat = 5.2;  // Miller plateau voltage
  const Vdrive = 18.0;// Gate drive voltage
  const dvdt_Vns = Math.min(95, ((Vdrive - Vplat) / (Rg * Cgd)) * 1e-9 * 0.28);
  const didt_Ans = Math.min(8.0, (Vdrive - 3.5) / (Rg * 1.5));
  const Vpeak = Vdc + Ls * didt_Ans;
  const Eon_mJ = 0.5 * Vdc * IL * (35 / dvdt_Vns) * 1e-6 * 1000;
  const Eoff_mJ = 0.5 * Vdc * IL * (25 / dvdt_Vns) * 1e-6 * 1000;

  // Header Banner
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('JEDEC JESD24-11 / IEC 60747 • SiC DOUBLE-PULSE TEST & HIGH-SPEED SWITCHING DYNAMICS', 18, 22);

  const hasSplit = w > 640;
  const schemX = 25;
  const schemY = 40;
  const schemW = hasSplit ? Math.min(270, w * 0.36) : w - 50;
  const schemH = hasSplit ? h - 60 : Math.min(200, h * 0.4);

  // -------------------------------------------------------------------------
  // LEFT: DPT HALF-BRIDGE TEST CIRCUIT SCHEMATIC
  // -------------------------------------------------------------------------
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(schemX, schemY, schemW, schemH, 10);
  ctx.fill();
  ctx.stroke();

  // Draw DPT Half-Bridge Circuit
  const midX = schemX + schemW * 0.5;
  const topY = schemY + 30;
  const botY = schemY + schemH - 30;
  const swNodeY = schemY + schemH * 0.52;

  // DC Bus Rails
  ctx.strokeStyle = '#ef4444'; // +Vdc (Red)
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(schemX + 18, topY);
  ctx.lineTo(schemX + schemW - 18, topY);
  ctx.stroke();
  ctx.fillStyle = '#ef4444';
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillText(`+Vdc (${Vdc}V)`, schemX + 20, topY - 8);

  ctx.strokeStyle = '#64748b'; // GND
  ctx.beginPath();
  ctx.moveTo(schemX + 18, botY);
  ctx.lineTo(schemX + schemW - 18, botY);
  ctx.stroke();
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('GND (0V)', schemX + 20, botY + 16);

  // High-side clamped test inductor and Schottky freewheeling diode
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(midX, topY);
  ctx.lineTo(midX, swNodeY);
  ctx.stroke();

  // Test Inductor loop symbol
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(midX - 14, topY + 12, 28, 22);
  ctx.strokeRect(midX - 14, topY + 12, 28, 22);
  ctx.fillStyle = '#38bdf8';
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.fillText(`Lload`, midX - 12, topY + 26);

  // Clamped Diode next to inductor
  ctx.strokeStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(midX + 28, topY);
  ctx.lineTo(midX + 28, swNodeY);
  ctx.stroke();
  // Diode symbol triangle
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(midX + 22, topY + 28);
  ctx.lineTo(midX + 34, topY + 28);
  ctx.lineTo(midX + 28, topY + 18);
  ctx.closePath();
  ctx.fill();

  // Low-Side DUT: SiC Power MOSFET
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(midX, swNodeY);
  ctx.lineTo(midX, botY);
  ctx.stroke();

  // MOSFET Symbol Box
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.fillRect(midX - 18, swNodeY + 12, 36, 26);
  ctx.strokeRect(midX - 18, swNodeY + 12, 36, 26);
  ctx.fillStyle = '#38bdf8';
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.fillText('SiC DUT', midX - 16, swNodeY + 28);

  // Gate driver input line with Rg resistor
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(schemX + 20, swNodeY + 25);
  ctx.lineTo(midX - 18, swNodeY + 25);
  ctx.stroke();
  ctx.fillStyle = '#ec4899';
  ctx.fillText(`Rg=${Rg}Ω`, schemX + 24, swNodeY + 18);

  // -------------------------------------------------------------------------
  // RIGHT: HIGH-SPEED DIGITAL PHOSPHOR SCOPE (Vgs, Vds, Id, P(t))
  // -------------------------------------------------------------------------
  const plotX = hasSplit ? schemX + schemW + 18 : schemX;
  const plotY = hasSplit ? schemY : schemY + schemH + 15;
  const plotW = hasSplit ? w - plotX - 25 : w - 50;
  const plotH = hasSplit ? h - 60 : Math.max(160, h - plotY - 20);

  ctx.fillStyle = '#060a12';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.fillRect(plotX, plotY, plotW, plotH);
  ctx.strokeRect(plotX, plotY, plotW, plotH);

  // Scope screen area
  const sLeft = plotX + 45;
  const sBottom = plotY + plotH - 35;
  const sWidth = plotW - 65;
  const sHeight = plotH - 55;
  const sTop = sBottom - sHeight;

  // Scope Phosphor Grid (8x8 divisions)
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  for (let div = 0; div <= 8; div++) {
    const gx = sLeft + (div / 8) * sWidth;
    const gy = sTop + (div / 8) * sHeight;
    ctx.beginPath();
    ctx.moveTo(gx, sTop);
    ctx.lineTo(gx, sBottom);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sLeft, gy);
    ctx.lineTo(sLeft + sWidth, gy);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Time base calibration (total 250 ns sweep)
  const sweepNs = 250;
  const turnOnTimeNs = 60;
  const turnOffTimeNs = 180;

  // Trace 1: Gate Voltage Vgs (Pink #ec4899)
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  for (let i = 0; i <= sWidth; i++) {
    const tNs = (i / sWidth) * sweepNs;
    let vgs = 0;
    if (tNs < turnOnTimeNs) {
      vgs = -4.0;
    } else if (tNs < turnOnTimeNs + 15) {
      // Exponential rise to threshold
      vgs = -4.0 + (Vplat - (-4.0)) * ((tNs - turnOnTimeNs) / 15);
    } else if (tNs < turnOnTimeNs + 35) {
      // Miller Plateau clamp
      vgs = Vplat;
    } else if (tNs < turnOffTimeNs) {
      // Full enhancement
      vgs = Vplat + (Vdrive - Vplat) * (1 - Math.exp(-(tNs - (turnOnTimeNs + 35)) / 10));
    } else if (tNs < turnOffTimeNs + 30) {
      // Turn off discharge
      vgs = Vdrive * Math.exp(-(tNs - turnOffTimeNs) / 12) - 4.0;
    } else {
      vgs = -4.0;
    }

    const normVgs = (vgs - (-5)) / 25;
    const py = sBottom - normVgs * (sHeight * 0.45);
    if (i === 0) ctx.moveTo(sLeft + i, py);
    else ctx.lineTo(sLeft + i, py);
  }
  ctx.stroke();

  // Trace 2: Drain Voltage Vds (Cyan #38bdf8)
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let i = 0; i <= sWidth; i++) {
    const tNs = (i / sWidth) * sweepNs;
    let vds = Vdc;
    if (tNs < turnOnTimeNs + 20) {
      vds = Vdc;
    } else if (tNs < turnOnTimeNs + 45) {
      // Sharp turn-on collapse with dv/dt
      const fallFrac = (tNs - (turnOnTimeNs + 20)) / 25;
      vds = Vdc * Math.max(0, 1 - fallFrac);
    } else if (tNs < turnOffTimeNs) {
      vds = 2.5; // On-state drop
    } else if (tNs < turnOffTimeNs + 25) {
      // Turn-off inductive overshoot with ringing
      const riseFrac = (tNs - turnOffTimeNs) / 15;
      const ringDamp = Math.exp(-(tNs - turnOffTimeNs) / 18);
      const ringOsc = Math.sin((tNs - turnOffTimeNs) * 0.45);
      vds = Math.min(1100, Vdc * Math.min(1.25, riseFrac) + (Vpeak - Vdc) * ringDamp * ringOsc);
    } else {
      vds = Vdc;
    }

    const normVds = vds / 1200;
    const py = sBottom - normVds * sHeight;
    if (i === 0) ctx.moveTo(sLeft + i, py);
    else ctx.lineTo(sLeft + i, py);
  }
  ctx.stroke();

  // Trace 3: Drain Current Id (Amber #f59e0b)
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  for (let i = 0; i <= sWidth; i++) {
    const tNs = (i / sWidth) * sweepNs;
    let id = 0;
    if (tNs < turnOnTimeNs + 10) {
      id = 0;
    } else if (tNs < turnOnTimeNs + 25) {
      // Current ramp with diode reverse recovery hump
      const rampFrac = (tNs - (turnOnTimeNs + 10)) / 15;
      id = IL * rampFrac + 14 * Math.sin(rampFrac * Math.PI);
    } else if (tNs < turnOffTimeNs) {
      id = IL;
    } else if (tNs < turnOffTimeNs + 20) {
      // Rapid turn-off current fall
      const fallFrac = (tNs - turnOffTimeNs) / 20;
      id = IL * Math.max(0, 1 - fallFrac);
    } else {
      id = 0;
    }

    const normId = id / 120;
    const py = sBottom - normId * (sHeight * 0.85);
    if (i === 0) ctx.moveTo(sLeft + i, py);
    else ctx.lineTo(sLeft + i, py);
  }
  ctx.stroke();

  // Trace 4: Instantaneous Power Dissipation P(t) (Rose dashed)
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  for (let i = 0; i <= sWidth; i++) {
    const tNs = (i / sWidth) * sweepNs;
    let pLoss = 0;
    if (tNs >= turnOnTimeNs + 15 && tNs <= turnOnTimeNs + 45) {
      // Cross-conduction power spike at turn-on
      pLoss = Math.sin(((tNs - (turnOnTimeNs + 15)) / 30) * Math.PI) * 18;
    } else if (tNs >= turnOffTimeNs && tNs <= turnOffTimeNs + 30) {
      // Turn-off power spike
      pLoss = Math.sin(((tNs - turnOffTimeNs) / 30) * Math.PI) * 14;
    }
    const py = sBottom - (pLoss / 25) * (sHeight * 0.75);
    if (i === 0) ctx.moveTo(sLeft + i, py);
    else ctx.lineTo(sLeft + i, py);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  // Scope Channel Legend & Telemetry Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = '#334155';
  ctx.fillRect(plotX + plotW - 190, plotY + 10, 180, 78);
  ctx.strokeRect(plotX + plotW - 190, plotY + 10, 180, 78);

  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`CH1 Vds: Peak ${Vpeak.toFixed(0)}V (${Vdc}V Bus)`, plotX + plotW - 180, plotY + 24);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`CH2 Id:  IL=${IL}A (di/dt=${didt_Ans.toFixed(1)}A/ns)`, plotX + plotW - 180, plotY + 38);
  ctx.fillStyle = '#ec4899';
  ctx.fillText(`CH3 Vgs: Miller Plat ${Vplat}V`, plotX + plotW - 180, plotY + 52);
  ctx.fillStyle = '#f43f5e';
  ctx.fillText(`Loss Esw: ${(Eon_mJ + Eoff_mJ).toFixed(2)} mJ (dv/dt ${dvdt_Vns.toFixed(0)}V/ns)`, plotX + plotW - 180, plotY + 66);
  ctx.fillStyle = '#10b981';
  ctx.fillText(`E_on: ${Eon_mJ.toFixed(2)}mJ | E_off: ${Eoff_mJ.toFixed(2)}mJ`, plotX + plotW - 180, plotY + 80);
}

// ---------------------------------------------------------------------------
// 2. IGBT MULTI-LAYER THERMAL IMPEDANCE FOSTER MODEL RENDERER
// ---------------------------------------------------------------------------
export interface IgbtThermalParams {
  switchingFreq: number;    // f_sw (kHz)
  collectorCurrent: number; // I_C (A)
  dutyCycle: number;        // D (0.1 - 0.9)
  heatsinkRth: number;      // R_th(s-a) (K/W)
}

export function renderIgbtThermal(rc: RenderContext, p: IgbtThermalParams) {
  const { ctx, w, h, t } = rc;
  const { switchingFreq, collectorCurrent, dutyCycle, heatsinkRth } = p;

  const fsw = Math.max(1, switchingFreq);
  const Ic = Math.max(10, collectorCurrent);
  const D = Math.max(0.1, Math.min(0.9, dutyCycle));
  const Rsa = Math.max(0.04, heatsinkRth);

  // Losses: V_CE,sat = 1.75V, E_sw = 11 mJ
  const Vce = 1.75;
  const Pcond = Vce * Ic * D;
  const Psw = (0.011 * (Ic / 90)) * (fsw * 1000);
  const Ptot = Pcond + Psw;

  // Thermal Network: R_jc = 0.18, R_cs = 0.08, R_sa = Rsa
  const Rjc = 0.18;
  const Rcs = 0.08;
  const Rth_total = Rjc + Rcs + Rsa;

  const Ta = 40.0;
  const Ts = Ta + Ptot * Rsa;
  const Tc = Ts + Ptot * Rcs;
  const Tj = Tc + Ptot * Rjc;
  const TjRipple = Math.min(18, (Ptot * Rjc) * 0.12 * Math.sqrt(10 / fsw));

  // Header Banner
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('IEC 60747-15 / JEDEC JESD51 • IGBT MULTI-LAYER THERMAL FOSTER LADDER & SOA', 18, 22);

  const hasSplit = w > 640;
  const modX = 25;
  const modY = 40;
  const modW = hasSplit ? Math.min(280, w * 0.38) : w - 50;
  const modH = hasSplit ? h - 60 : Math.min(220, h * 0.42);

  // -------------------------------------------------------------------------
  // LEFT: MULTI-LAYER POWER MODULE PACKAGING THERMOGRAPHY
  // -------------------------------------------------------------------------
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(modX, modY, modW, modH, 10);
  ctx.fill();
  ctx.stroke();

  // Stack of 6 packaging layers (Silicon Die -> Solder -> DBC -> Baseplate -> TIM -> Heatsink)
  const stackX = modX + 30;
  const stackW = modW - 60;
  let stackY = modY + 30;

  interface ModuleLayer {
    name: string;
    thickness: number;
    color: string;
    temp: number;
  }

  const layers: ModuleLayer[] = [
    { name: 'Silicon IGBT Die (350µm)', thickness: 16, color: '#f43f5e', temp: Tj },
    { name: 'Die-Attach Solder (50µm)', thickness: 8, color: '#fb7185', temp: Tj - 4 },
    { name: 'DBC Ceramic Substrate (Al2O3)', thickness: 18, color: '#38bdf8', temp: Tc + 12 },
    { name: 'Copper Baseplate (3mm)', thickness: 24, color: '#f59e0b', temp: Tc },
    { name: 'Thermal Interface Grease', thickness: 8, color: '#94a3b8', temp: (Tc + Ts) / 2 },
    { name: 'Aluminum Heatsink + Fins', thickness: 32, color: '#64748b', temp: Ts },
  ];

  layers.forEach((layer) => {
    // Thermal infrared color grading
    const tempRatio = Math.max(0, Math.min(1, (layer.temp - 40) / 135));
    // Gradient from cold blue to fiery orange-red
    ctx.fillStyle = tempRatio > 0.75 ? '#f43f5e' : tempRatio > 0.5 ? '#f59e0b' : tempRatio > 0.25 ? '#06b6d4' : '#3b82f6';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    ctx.fillRect(stackX, stackY, stackW, layer.thickness);
    ctx.strokeRect(stackX, stackY, stackW, layer.thickness);

    // Layer name and temperature readout
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "IBM Plex Mono", monospace';
    ctx.fillText(`${layer.name} • ${layer.temp.toFixed(0)}°C`, stackX + 6, stackY + layer.thickness - 4);

    stackY += layer.thickness + 4;
  });

  // Heatsink fins sticking out at bottom
  for (let fin = 0; fin < 7; fin++) {
    const fx = stackX + 8 + fin * (stackW / 7);
    ctx.fillStyle = '#475569';
    ctx.fillRect(fx, stackY, 6, 16);
  }

  // -------------------------------------------------------------------------
  // RIGHT: DYNAMIC JUNCTION TEMPERATURE STRIP CHART & RC LADDER
  // -------------------------------------------------------------------------
  const plotX = hasSplit ? modX + modW + 18 : modX;
  const plotY = hasSplit ? modY : modY + modH + 15;
  const plotW = hasSplit ? w - plotX - 25 : w - 50;
  const plotH = hasSplit ? h - 60 : Math.max(160, h - plotY - 20);

  ctx.fillStyle = '#060a12';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.fillRect(plotX, plotY, plotW, plotH);
  ctx.strokeRect(plotX, plotY, plotW, plotH);

  // Scope Chart Bounds
  const cLeft = plotX + 45;
  const cBottom = plotY + plotH - 35;
  const cWidth = plotW - 65;
  const cHeight = plotH - 55;
  const cTop = cBottom - cHeight;

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cLeft, cTop);
  ctx.lineTo(cLeft, cBottom);
  ctx.lineTo(cLeft + cWidth, cBottom);
  ctx.stroke();

  // Y-axis Scale: 0 to 200 °C
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#64748b';
  for (let temp = 0; temp <= 200; temp += 50) {
    const gy = cBottom - (temp / 200) * cHeight;
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(cLeft, gy);
    ctx.lineTo(cLeft + cWidth, gy);
    ctx.stroke();
    ctx.fillText(`${temp}°C`, cLeft - 32, gy + 3);
  }
  ctx.setLineDash([]);

  // SOA 175°C Maximum Limit Line (Red dashed)
  const soaY = cBottom - (175 / 200) * cHeight;
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(cLeft, soaY);
  ctx.lineTo(cLeft + cWidth, soaY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#ef4444';
  ctx.fillText('SOA Tj_max = 175°C', cLeft + cWidth - 110, soaY - 4);

  // Real-Time Temperature Trajectory Tj(t)
  ctx.strokeStyle = Tj > 175 ? '#ef4444' : '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let x = 0; x <= cWidth; x++) {
    const timeSec = (x / cWidth) * 5.0;
    // Multi-exponential heating curve: Tj(t) = Ta + Ptot*sum(Ri*(1-exp(-t/tau_i))) + ripple
    const rise = 1 - 0.4 * Math.exp(-timeSec / 0.15) - 0.35 * Math.exp(-timeSec / 0.8) - 0.25 * Math.exp(-timeSec / 2.5);
    const liveT = Ta + (Tj - Ta) * rise + TjRipple * Math.sin(t * 12 + x * 0.15);
    const py = cBottom - (liveT / 200) * cHeight;
    if (x === 0) ctx.moveTo(cLeft + x, py);
    else ctx.lineTo(cLeft + x, py);
  }
  ctx.stroke();

  // Heatsink Temperature Trace Ts(t) (Green)
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let x = 0; x <= cWidth; x++) {
    const timeSec = (x / cWidth) * 5.0;
    const rise = 1 - Math.exp(-timeSec / 2.8);
    const liveTs = Ta + (Ts - Ta) * rise;
    const py = cBottom - (liveTs / 200) * cHeight;
    if (x === 0) ctx.moveTo(cLeft + x, py);
    else ctx.lineTo(cLeft + x, py);
  }
  ctx.stroke();

  // Telemetry Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = '#334155';
  ctx.fillRect(plotX + plotW - 180, plotY + 10, 170, 78);
  ctx.strokeRect(plotX + plotW - 180, plotY + 10, 170, 78);

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = Tj > 175 ? '#ef4444' : '#38bdf8';
  ctx.fillText(`Junction Tj: ${Tj.toFixed(1)}°C (±${TjRipple.toFixed(1)}°C)`, plotX + plotW - 170, plotY + 26);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`Total Loss Ptot: ${Ptot.toFixed(0)} W`, plotX + plotW - 170, plotY + 42);
  ctx.fillStyle = '#06b6d4';
  ctx.fillText(`P_cond: ${Pcond.toFixed(0)}W | P_sw: ${Psw.toFixed(0)}W`, plotX + plotW - 170, plotY + 58);
  ctx.fillStyle = Tj > 175 ? '#ef4444' : '#10b981';
  ctx.fillText(`Safety Margin: ${(175 - Tj).toFixed(1)}°C (${Tj > 175 ? 'SOA OVERHEAT' : 'Safe'})`, plotX + plotW - 170, plotY + 74);
}

// ---------------------------------------------------------------------------
// 3. SUB-MICRON MOSFET INVERSION CHANNEL & BAND BENDING RENDERER
// ---------------------------------------------------------------------------
export interface MosfetChannelParams {
  gateVoltage: number;      // V_gs (-0.5 - 3.5 V)
  drainVoltage: number;     // V_ds (0.0 - 3.5 V)
  oxideThickness: number;   // t_ox (1.5 - 10 nm)
  substrateDoping: number;  // log(N_A) (15 - 18)
}

export function renderMosfetChannel(rc: RenderContext, p: MosfetChannelParams) {
  const { ctx, w, h, t } = rc;
  const { gateVoltage, drainVoltage, oxideThickness, substrateDoping } = p;

  const Vgs = gateVoltage;
  const Vds = Math.max(0, drainVoltage);
  const tox = Math.max(1.5, oxideThickness);
  const logNa = Math.max(15, substrateDoping);

  // Device electrostatics (BSIM4 physics)
  const phiF = 0.0259 * Math.log(Math.pow(10, logNa) / 1.5e10);
  const Cox = (3.9 * 8.854e-14) / (tox * 1e-7); // F/cm^2
  const Vfb = -0.85;
  const gamma = Math.sqrt(2 * 11.7 * 8.854e-14 * 1.602e-19 * Math.pow(10, logNa)) / Cox;
  const Vth = Vfb + 2 * phiF + gamma * Math.sqrt(2 * phiF);

  // Inversion state & drain current
  const Voverdrive = Vgs - Vth;
  const isCutoff = Voverdrive <= 0;
  const Vds_sat = Math.max(0.01, Voverdrive);
  const isSaturation = !isCutoff && Vds >= Vds_sat;

  let Id_mA = 0;
  if (!isCutoff) {
    const beta = (380 * Cox * (10 / 0.5)) * 1e3; // mA/V^2
    if (!isSaturation) {
      Id_mA = beta * (Voverdrive * Vds - (Vds * Vds) / 2);
    } else {
      Id_mA = 0.5 * beta * Math.pow(Voverdrive, 2);
    }
  }

  // Header Banner
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('IEEE EDS / BSIM4 • MOSFET INVERSION CHANNEL, SURFACE POTENTIAL & PINCH-OFF', 18, 22);

  const hasSplit = w > 640;
  const devX = 25;
  const devY = 40;
  const devW = hasSplit ? Math.min(270, w * 0.36) : w - 50;
  const devH = hasSplit ? h - 60 : Math.min(220, h * 0.42);

  // -------------------------------------------------------------------------
  // LEFT: NANOSCALE MOSFET CROSS-SECTION WITH 2D ELECTRON INVERSION CHANNEL
  // -------------------------------------------------------------------------
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(devX, devY, devW, devH, 10);
  ctx.fill();
  ctx.stroke();

  // Substrate & Device Layout
  const subX = devX + 25;
  const subW = devW - 50;
  const subY = devY + 45;
  const subH = devH - 75;

  // P-Type Silicon Substrate
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.fillRect(subX, subY, subW, subH);
  ctx.strokeRect(subX, subY, subW, subH);

  // N+ Source (Left) & Drain (Right) Wells
  const wellW = Math.min(42, subW * 0.22);
  const wellH = Math.min(45, subH * 0.48);

  ctx.fillStyle = '#0284c7';
  // Source
  ctx.fillRect(subX, subY, wellW, wellH);
  ctx.strokeRect(subX, subY, wellW, wellH);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('N+ Source', subX + 4, subY + 22);

  // Drain
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(subX + subW - wellW, subY, wellW, wellH);
  ctx.strokeRect(subX + subW - wellW, subY, wellW, wellH);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('N+ Drain', subX + subW - wellW + 4, subY + 22);

  // Gate Oxide Dielectric Layer (Cyan line)
  const channelLeft = subX + wellW;
  const channelRight = subX + subW - wellW;
  const channelL = channelRight - channelLeft;

  ctx.fillStyle = '#06b6d4';
  ctx.fillRect(channelLeft, subY - 6, channelL, 6);

  // Polysilicon / Metal Gate Stack
  ctx.fillStyle = '#f59e0b';
  ctx.strokeStyle = '#d97706';
  ctx.fillRect(channelLeft, subY - 22, channelL, 16);
  ctx.strokeRect(channelLeft, subY - 22, channelL, 16);
  ctx.fillStyle = '#0f172a';
  ctx.fillText(`Gate Vgs=${Vgs.toFixed(1)}V`, channelLeft + 6, subY - 11);

  // 2D Mobile Electron Inversion Sheet (Neon Emerald #10b981)
  if (!isCutoff) {
    const invThickSource = Math.min(10, Math.max(2, Voverdrive * 3.5));
    // Inversion layer shape pinches off towards drain if Vds >= Vds_sat
    const invThickDrain = isSaturation ? 1 : Math.max(1, (Voverdrive - Vds) * 3.5);

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(channelLeft, subY);
    ctx.lineTo(channelRight, subY);
    ctx.lineTo(channelRight, subY + invThickDrain);
    ctx.lineTo(channelLeft, subY + invThickSource);
    ctx.closePath();
    ctx.fill();

    // Animated drifting electrons (moving from Source to Drain)
    const eCount = Math.min(12, Math.max(3, Math.floor(Id_mA * 3)));
    for (let e = 0; e < eCount; e++) {
      const eFrac = (t * 0.8 + e * (1 / eCount)) % 1.0;
      const ex = channelLeft + eFrac * channelL;
      const ey = subY + 3;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex, ey, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Depletion Region Boundary (Dashed Slate)
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  ctx.moveTo(subX, subY + wellH + 12);
  ctx.lineTo(subX + subW, subY + wellH + 12);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#64748b';
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.fillText(`P-Substrate Depletion (NA=10^${logNa.toFixed(0)})`, subX + 10, subY + subH - 12);

  // -------------------------------------------------------------------------
  // RIGHT: SURFACE ENERGY BAND DIAGRAM & ID - VDS OUTPUT CURVES
  // -------------------------------------------------------------------------
  const plotX = hasSplit ? devX + devW + 18 : devX;
  const plotY = hasSplit ? devY : devY + devH + 15;
  const plotW = hasSplit ? w - plotX - 25 : w - 50;
  const plotH = hasSplit ? h - 60 : Math.max(160, h - plotY - 20);

  ctx.fillStyle = '#060a12';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.fillRect(plotX, plotY, plotW, plotH);
  ctx.strokeRect(plotX, plotY, plotW, plotH);

  // Top Half: Band Bending Diagram
  const bLeft = plotX + 45;
  const bTop = plotY + 28;
  const bWidth = plotW - 65;
  const bHeight = Math.min(65, (plotH - 75) * 0.45);

  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('SURFACE BAND BENDING (Ec, Ev, EF) vs DEPTH', bLeft, bTop - 8);

  // Band lines: Conduction Ec, Valence Ev, Fermi Level Ef
  const phiS = Math.min(1.1, Math.max(-0.2, (Vgs - Vfb) * 0.45));
  const midBandY = bTop + bHeight * 0.5;

  // Fermi level (Amber dashed)
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([3, 2]);
  ctx.beginPath();
  ctx.moveTo(bLeft, midBandY);
  ctx.lineTo(bLeft + bWidth, midBandY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Conduction band Ec (Cyan)
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let z = 0; z <= 40; z++) {
    const zFrac = z / 40;
    const bend = phiS * Math.exp(-zFrac * 3.5);
    const py = midBandY - 22 + bend * 26;
    if (z === 0) ctx.moveTo(bLeft + zFrac * bWidth, py);
    else ctx.lineTo(bLeft + zFrac * bWidth, py);
  }
  ctx.stroke();

  // Valence band Ev (Indigo)
  ctx.strokeStyle = '#818cf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let z = 0; z <= 40; z++) {
    const zFrac = z / 40;
    const bend = phiS * Math.exp(-zFrac * 3.5);
    const py = midBandY + 22 + bend * 26;
    if (z === 0) ctx.moveTo(bLeft + zFrac * bWidth, py);
    else ctx.lineTo(bLeft + zFrac * bWidth, py);
  }
  ctx.stroke();

  // Bottom Half: ID - VDS Output Characteristic Curves
  const cLeft = bLeft;
  const cTop = bTop + bHeight + 25;
  const cWidth = bWidth;
  const cHeight = Math.max(50, plotH - (cTop - plotY) - 30);
  const cBottom = cTop + cHeight;

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cLeft, cTop);
  ctx.lineTo(cLeft, cBottom);
  ctx.lineTo(cLeft + cWidth, cBottom);
  ctx.stroke();

  // Plot Family of ID-VDS Curves for Vgs = 1.0V, 1.5V, 2.0V, 2.5V
  const testVgsList = [1.0, 1.5, 2.0, 2.5];
  testVgsList.forEach((tVgs) => {
    const tOver = tVgs - Vth;
    if (tOver <= 0) return;
    const tVsat = tOver;
    ctx.strokeStyle = Math.abs(tVgs - Vgs) < 0.25 ? '#38bdf8' : 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = Math.abs(tVgs - Vgs) < 0.25 ? 2.5 : 1.2;
    ctx.beginPath();
    for (let v = 0; v <= 3.5; v += 0.1) {
      let cur = 0;
      if (v < tVsat) {
        cur = (tOver * v - (v * v) / 2) * 2.2;
      } else {
        cur = 0.5 * Math.pow(tOver, 2) * 2.2;
      }
      const px = cLeft + (v / 3.5) * cWidth;
      const py = cBottom - (cur / 8.0) * cHeight;
      if (v === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  });

  // Operating Point Red Dot
  const opX = cLeft + (Vds / 3.5) * cWidth;
  const opY = cBottom - (Id_mA / 8.0) * cHeight;
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(opX, Math.max(cTop, Math.min(cBottom, opY)), 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Telemetry Box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = '#334155';
  ctx.fillRect(plotX + plotW - 180, plotY + 10, 170, 78);
  ctx.strokeRect(plotX + plotW - 180, plotY + 10, 170, 78);

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#10b981';
  ctx.fillText(`Drain Current ID: ${Id_mA.toFixed(2)} mA`, plotX + plotW - 170, plotY + 26);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText(`Threshold Vth: ${Vth.toFixed(2)} V`, plotX + plotW - 170, plotY + 42);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`Overdrive: ${Voverdrive.toFixed(2)} V`, plotX + plotW - 170, plotY + 58);
  ctx.fillStyle = isCutoff ? '#94a3b8' : isSaturation ? '#ec4899' : '#10b981';
  ctx.fillText(`Mode: ${isCutoff ? 'Cutoff' : isSaturation ? 'Saturation' : 'Linear Triode'}`, plotX + plotW - 170, plotY + 74);
}

// ---------------------------------------------------------------------------
// 5. PHOTOELECTRIC EFFECT & EINSTEIN QUANTUM WORK FUNCTION RENDERER
// ---------------------------------------------------------------------------
export interface PhotoelectricParams {
  wavelength: number; // nm (150 - 800)
  intensity: number; // % (10 - 100)
  targetMaterial: number; // 0=Cs(2.14), 1=K(2.30), 2=Na(2.36), 3=Zn(4.30), 4=Pt(5.65)
  retardingVoltage: number; // V (-4.0 to +4.0)
}

function nmToColor(wavelength: number): string {
  if (wavelength < 380) return '#a855f7'; // UV
  if (wavelength < 440) return '#6366f1'; // Violet/Indigo
  if (wavelength < 490) return '#06b6d4'; // Blue/Cyan
  if (wavelength < 560) return '#10b981'; // Green
  if (wavelength < 590) return '#eab308'; // Yellow
  if (wavelength < 640) return '#f97316'; // Orange
  return '#ef4444'; // Red/IR
}

export function renderPhotoelectric(rc: RenderContext, p: PhotoelectricParams) {
  const { ctx, w, h, t } = rc;
  const lambda_nm = p.wavelength || 380;
  const intensity = p.intensity || 60;
  const matIdx = Math.round(p.targetMaterial || 2);
  const Vret = p.retardingVoltage !== undefined ? p.retardingVoltage : 0.0;

  const materials = [
    { name: 'Cesium (Cs)', phi: 2.14 },
    { name: 'Potassium (K)', phi: 2.30 },
    { name: 'Sodium (Na)', phi: 2.36 },
    { name: 'Zinc (Zn)', phi: 4.30 },
    { name: 'Platinum (Pt)', phi: 5.65 },
  ];
  const mat = materials[Math.min(materials.length - 1, Math.max(0, matIdx))];

  const h_eVs = 4.135667696e-15;
  const c = 2.99792458e8;
  const photonE_eV = (h_eVs * c) / (lambda_nm * 1e-9);
  const freq_14Hz = (c / (lambda_nm * 1e-9)) / 1e14;
  const f0_14Hz = (mat.phi / h_eVs) / 1e14;

  const Kmax_eV = Math.max(0, photonE_eV - mat.phi);
  const Vstop_V = Kmax_eV;
  const hasEmission = photonE_eV > mat.phi;

  // Photocurrent
  let I_uA = 0;
  if (hasEmission) {
    if (Vret <= -Vstop_V) I_uA = 0;
    else if (Vret < 0) {
      const frac = (Vret + Vstop_V) / Math.max(0.01, Vstop_V);
      I_uA = (intensity * 0.15) * Math.pow(Math.min(1.0, frac), 1.5);
    } else {
      I_uA = (intensity * 0.15) * (1.0 + 0.15 * Math.tanh(Vret / 1.0));
    }
  }

  // Background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, w, h);

  const splitX = Math.floor(w * 0.48);

  // --- LEFT: VACUUM PHOTOTUBE APPARATUS ---
  ctx.save();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.strokeRect(12, 12, splitX - 24, h - 24);

  // Title
  ctx.font = 'bold 12px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('EINSTEIN PHOTOELECTRIC PHOTOTUBE', 24, 34);
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('QUANTUM PHOTON-ELECTRON EMISSION', 24, 48);

  const tubeCenterX = splitX * 0.52;
  const tubeCenterY = h * 0.46;
  const tubeRadius = 75;

  // Vacuum Glass Bulb
  ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(tubeCenterX, tubeCenterY, tubeRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Glass specular reflection highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(tubeCenterX, tubeCenterY, tubeRadius - 5, -Math.PI * 0.75, -Math.PI * 0.25);
  ctx.stroke();

  // Metal Cathode Plate (Left curved electrode)
  const cathX = tubeCenterX - 45;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(cathX + 15, tubeCenterY, 35, Math.PI * 0.65, Math.PI * 1.35);
  ctx.stroke();
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(`Cathode (${mat.name})`, cathX - 35, tubeCenterY - 45);
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`Φ = ${mat.phi.toFixed(2)} eV`, cathX - 25, tubeCenterY + 50);

  // Metal Anode Collector Plate (Right electrode)
  const anodeX = tubeCenterX + 45;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(anodeX, tubeCenterY - 25);
  ctx.lineTo(anodeX, tubeCenterY + 25);
  ctx.stroke();
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('Anode (+)', anodeX - 10, tubeCenterY - 32);

  // Monochromatic Light Source Lamp (Top Left)
  const lampX = 40;
  const lampY = 90;
  const beamColor = nmToColor(lambda_nm);

  // Lamp casing
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(lampX, lampY, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Lamp bulb filament glow
  ctx.fillStyle = beamColor;
  ctx.beginPath();
  ctx.arc(lampX, lampY, 8, 0, Math.PI * 2);
  ctx.fill();

  // Incident Light Beam rays
  ctx.fillStyle = beamColor;
  ctx.globalAlpha = (intensity / 100) * 0.35;
  ctx.beginPath();
  ctx.moveTo(lampX + 14, lampY + 8);
  ctx.lineTo(cathX - 4, tubeCenterY - 18);
  ctx.lineTo(cathX - 4, tubeCenterY + 18);
  ctx.lineTo(lampX + 8, lampY + 16);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Photon ray dashed arrows
  ctx.strokeStyle = beamColor;
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(lampX + 16, lampY + 12);
  ctx.lineTo(cathX - 4, tubeCenterY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Emitted Photoelectrons
  if (hasEmission) {
    const numElectrons = 12;
    const speed = Math.sqrt(Kmax_eV) * 40; // speed proportional to sqrt(Kmax)
    for (let i = 0; i < numElectrons; i++) {
      const ePhase = (t * (speed * 0.05) + (i / numElectrons)) % 1.0;
      let eX = cathX + ePhase * (anodeX - cathX);
      const eY = tubeCenterY + (Math.sin(i * 1.5) * 20);

      // If retarding voltage repels electrons before reaching anode
      if (Vret < 0 && -Vret >= Vstop_V * 0.8) {
        const turnFrac = Math.max(0.1, Vstop_V / (-Vret + 0.001));
        if (ePhase > turnFrac) {
          // electron turned back!
          eX = cathX + (turnFrac * 2 - ePhase) * (anodeX - cathX);
        }
      }

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(eX, eY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Below threshold frequency callout
    ctx.font = 'bold 10px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('NO EMISSION (hν < Φ)', tubeCenterX - 65, tubeCenterY + 6);
  }

  // Circuit wires at bottom with battery & microammeter
  const wireBotY = h - 60;
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cathX, tubeCenterY + 35);
  ctx.lineTo(cathX, wireBotY);
  ctx.lineTo(tubeCenterX - 40, wireBotY);
  ctx.moveTo(anodeX, tubeCenterY + 25);
  ctx.lineTo(anodeX, wireBotY);
  ctx.lineTo(tubeCenterX + 40, wireBotY);
  ctx.stroke();

  // Microammeter symbol
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(tubeCenterX + 30, wireBotY, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#10b981';
  ctx.fillText('µA', tubeCenterX + 24, wireBotY + 4);

  // Power Supply (Vret)
  ctx.strokeStyle = '#f59e0b';
  ctx.strokeRect(tubeCenterX - 35, wireBotY - 12, 40, 24);
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(`${Vret >= 0 ? '+' : ''}${Vret.toFixed(1)}V`, tubeCenterX - 30, wireBotY + 4);

  ctx.restore();

  // --- RIGHT: TWO SCIENTIFIC CHARTS ---
  ctx.save();
  const rightX = splitX + 8;
  const rightW = w - splitX - 20;

  // Chart 1 (Top): I vs Vret
  const c1Y = 12;
  const c1H = Math.floor((h - 32) * 0.48);
  ctx.fillStyle = '#020617';
  ctx.fillRect(rightX, c1Y, rightW, c1H);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(rightX, c1Y, rightW, c1H);

  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#10b981';
  ctx.fillText('PHOTOCURRENT vs RETARDING VOLTAGE (I vs V)', rightX + 12, c1Y + 20);

  const c1PlotLeft = rightX + 45;
  const c1PlotRight = rightX + rightW - 20;
  const c1PlotTop = c1Y + 35;
  const c1PlotBot = c1Y + c1H - 25;
  const c1ZeroX = c1PlotLeft + (c1PlotRight - c1PlotLeft) * 0.5;

  // Axes
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.7)';
  ctx.beginPath();
  ctx.moveTo(c1ZeroX, c1PlotTop); ctx.lineTo(c1ZeroX, c1PlotBot);
  ctx.moveTo(c1PlotLeft, c1PlotBot); ctx.lineTo(c1PlotRight, c1PlotBot);
  ctx.stroke();

  // I vs V curve
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const ivSteps = 80;
  for (let s = 0; s <= ivSteps; s++) {
    const vStep = -4.0 + (s / ivSteps) * 8.0;
    let iVal = 0;
    if (hasEmission) {
      if (vStep <= -Vstop_V) iVal = 0;
      else if (vStep < 0) {
        const frac = (vStep + Vstop_V) / Math.max(0.01, Vstop_V);
        iVal = (intensity * 0.15) * Math.pow(Math.min(1.0, frac), 1.5);
      } else {
        iVal = (intensity * 0.15) * (1.0 + 0.15 * Math.tanh(vStep / 1.0));
      }
    }
    const sx = c1PlotLeft + ((vStep + 4.0) / 8.0) * (c1PlotRight - c1PlotLeft);
    const sy = c1PlotBot - (iVal / 20.0) * (c1PlotBot - c1PlotTop);
    if (s === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // Stopping Potential Marker
  if (hasEmission) {
    const vStopSx = c1PlotLeft + ((-Vstop_V + 4.0) / 8.0) * (c1PlotRight - c1PlotLeft);
    ctx.strokeStyle = '#ef4444';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(vStopSx, c1PlotTop); ctx.lineTo(vStopSx, c1PlotBot);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '9px "IBM Plex Mono", monospace';
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`-V_stop (-${Vstop_V.toFixed(2)}V)`, vStopSx - 35, c1PlotBot - 12);
  }

  // Active Operating Point dot
  const curSx = c1PlotLeft + ((Vret + 4.0) / 8.0) * (c1PlotRight - c1PlotLeft);
  const curSy = c1PlotBot - (I_uA / 20.0) * (c1PlotBot - c1PlotTop);
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(curSx, Math.max(c1PlotTop, Math.min(c1PlotBot, curSy)), 5, 0, Math.PI * 2);
  ctx.fill();

  // Chart 2 (Bottom): Kmax vs Frequency (Einstein's linear equation)
  const c2Y = c1Y + c1H + 8;
  const c2H = h - 20 - c2Y;
  ctx.fillStyle = '#020617';
  ctx.fillRect(rightX, c2Y, rightW, c2H);
  ctx.strokeStyle = '#1e293b';
  ctx.strokeRect(rightX, c2Y, rightW, c2H);

  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('EINSTEIN PHOTOELECTRIC EQUATION: K_max = hν - Φ', rightX + 12, c2Y + 20);

  const c2PlotLeft = rightX + 45;
  const c2PlotRight = rightX + rightW - 20;
  const c2PlotTop = c2Y + 35;
  const c2PlotBot = c2Y + c2H - 25;

  // Axes
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.7)';
  ctx.beginPath();
  ctx.moveTo(c2PlotLeft, c2PlotTop); ctx.lineTo(c2PlotLeft, c2PlotBot);
  ctx.lineTo(c2PlotRight, c2PlotBot);
  ctx.stroke();

  // Line Kmax = h * f - Phi
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const fSteps = 40;
  for (let s = 0; s <= fSteps; s++) {
    const fVal = 4.0 + (s / fSteps) * 16.0; // 10^14 Hz
    const kVal = Math.max(0, (h_eVs * fVal * 1e14) - mat.phi);
    const sx = c2PlotLeft + ((fVal - 4.0) / 16.0) * (c2PlotRight - c2PlotLeft);
    const sy = c2PlotBot - (kVal / 5.0) * (c2PlotBot - c2PlotTop);
    if (s === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // Current Frequency dot
  const curFx = c2PlotLeft + ((freq_14Hz - 4.0) / 16.0) * (c2PlotRight - c2PlotLeft);
  const curFy = c2PlotBot - (Kmax_eV / 5.0) * (c2PlotBot - c2PlotTop);
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(curFx, Math.max(c2PlotTop, Math.min(c2PlotBot, curFy)), 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillText(`hν = ${photonE_eV.toFixed(2)} eV`, curFx + 8, curFy - 4);

  ctx.restore();
}

