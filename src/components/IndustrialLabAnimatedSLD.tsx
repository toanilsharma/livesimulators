import React, { useEffect, useRef, useState } from 'react';

interface IndustrialLabAnimatedSLDProps {
  labId: string;
  accentColor: string;
}

export const IndustrialLabAnimatedSLD: React.FC<IndustrialLabAnimatedSLDProps> = ({
  labId,
  accentColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // IntersectionObserver to pause rendering when card is scrolled out of viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    const particles = Array.from({ length: 28 }, (_, i) => ({
      t: (i / 28),
      speed: 0.006 + Math.random() * 0.004,
      offsetY: (Math.random() - 0.5) * 4,
    }));

    // Arc flash sparks for electrolive
    const sparks = Array.from({ length: 16 }, () => ({
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      life: Math.random(),
    }));

    const render = () => {
      time += 0.035;
      const w = canvas.width;
      const h = canvas.height;

      // Deep clean dark tech backdrop
      ctx.fillStyle = '#050914';
      ctx.fillRect(0, 0, w, h);

      // Subtle tech background grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 0.5;
      const gridSize = 24;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Render lab-specific animated SLD
      if (labId === 'power-electronics-lab') {
        renderPowerElectronicsSLD(ctx, w, h, time, particles, accentColor);
      } else if (labId === 'power-systems-lab') {
        renderPowerSystemsSLD(ctx, w, h, time, particles, accentColor);
      } else if (labId === 'safeops-ups') {
        renderSafeOpsUpsSLD(ctx, w, h, time, particles, accentColor);
      } else {
        renderElectroLiveSafetySLD(ctx, w, h, time, sparks, accentColor);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [labId, isVisible, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      className="w-full h-full block select-none bg-[#050914]"
    />
  );
};

// ============================================================================
// 1. POWER ELECTRONICS LAB: 6-Pulse Thyristor SCR Rectifier + LC Filter + Inverter
// ============================================================================
function renderPowerElectronicsSLD(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  particles: { t: number; speed: number; offsetY: number }[],
  accent: string
) {
  // Title HUD
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillText('SLD: 3Φ AC 415V ➔ 6-PULSE SCR BRIDGE ➔ LC CHOKE ➔ DC BUS', 16, 20);

  // Live Electrical Readouts Box
  const alpha = 30 + Math.sin(time * 0.5) * 15;
  const vdc = Math.round(1.35 * 415 * Math.cos((alpha * Math.PI) / 180));
  const idc = (45.2 + Math.sin(time * 0.8) * 3.1).toFixed(1);
  const thd = (3.4 + Math.sin(time * 0.3) * 0.6).toFixed(1);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(w - 180, 10, 166, 68, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText(`α FIRING ANGLE: ${alpha.toFixed(1)}°`, w - 170, 26);
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(`DC BUS VOLTAGE: ${vdc} V`, w - 170, 40);
  ctx.fillText(`DC LOAD CURRENT: ${idc} A`, w - 170, 54);
  ctx.fillStyle = '#34d399';
  ctx.fillText(`THD (IEEE 519): ${thd}%`, w - 170, 68);

  // 1. AC Source (3-Phase R-Y-B)
  const acX = 50;
  const acY = h * 0.55;

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(acX, acY, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px "IBM Plex Mono", monospace';
  ctx.fillText('3Φ AC', acX - 17, acY + 4);

  // 3-Phase Feeder Lines (R, Y, B)
  const phaseColors = ['#ef4444', '#eab308', '#3b82f6'];
  const busYOffsets = [-12, 0, 12];
  const bridgeX = 140;

  for (let i = 0; i < 3; i++) {
    const py = acY + busYOffsets[i];
    ctx.strokeStyle = phaseColors[i];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(acX + 22, py);
    ctx.lineTo(bridgeX, py);
    ctx.stroke();

    // Sinusoidal waveform modulation
    ctx.fillStyle = phaseColors[i];
    ctx.beginPath();
    ctx.arc(acX + 22 + ((time * 30 + i * 25) % (bridgeX - (acX + 22))), py, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. 6-Pulse SCR Bridge Rectifier Box
  const bW = 84;
  const bH = 100;
  const bY = acY - bH / 2;

  ctx.fillStyle = '#090e1a';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bridgeX, bY, bW, bH, 8);
  ctx.fill();
  ctx.stroke();

  // Label
  ctx.fillStyle = accent;
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText('6-PULSE SCR', bridgeX + 9, bY + 16);

  // 6 Thyristor Symbols (2 columns of 3)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      const tx = bridgeX + 22 + col * 40;
      const ty = bY + 34 + row * 24;
      const isFiring = Math.floor((time * 4 + row * 2 + col) % 6) === 0;

      ctx.strokeStyle = isFiring ? '#34d399' : '#64748b';
      ctx.fillStyle = isFiring ? 'rgba(52, 211, 153, 0.3)' : '#1e293b';
      ctx.lineWidth = 1.2;

      // Triangle diode/thyristor
      ctx.beginPath();
      ctx.moveTo(tx - 7, ty + 6);
      ctx.lineTo(tx + 7, ty + 6);
      ctx.lineTo(tx, ty - 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cathode line
      ctx.beginPath();
      ctx.moveTo(tx - 8, ty - 6);
      ctx.lineTo(tx + 8, ty - 6);
      ctx.stroke();

      // Gate firing tick
      ctx.beginPath();
      ctx.moveTo(tx - 3, ty);
      ctx.lineTo(tx - 9, ty + 3);
      ctx.stroke();
    }
  }

  // 3. DC Link Busbars (Positive Top, Negative Bottom)
  const posRailY = bY + 8;
  const negRailY = bY + bH - 8;
  const dcEndX = w - 60;

  // Positive rail (Red)
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(bridgeX + bW, posRailY);
  ctx.lineTo(dcEndX, posRailY);
  ctx.stroke();

  // Negative rail (Blue)
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(bridgeX + bW, negRailY);
  ctx.lineTo(dcEndX, negRailY);
  ctx.stroke();

  // Choke Inductor L on positive rail
  const chokeX = bridgeX + bW + 40;
  ctx.fillStyle = '#050914';
  ctx.fillRect(chokeX - 16, posRailY - 8, 32, 16);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let c = 0; c < 3; c++) {
    ctx.arc(chokeX - 10 + c * 10, posRailY, 5, Math.PI, 0, false);
  }
  ctx.stroke();
  ctx.fillStyle = '#f59e0b';
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.fillText('L = 12mH', chokeX - 16, posRailY - 12);

  // Smoothing Capacitor C between rails
  const capX = chokeX + 60;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(capX, posRailY);
  ctx.lineTo(capX, posRailY + 28);
  ctx.moveTo(capX - 10, posRailY + 28);
  ctx.lineTo(capX + 10, posRailY + 28);
  ctx.moveTo(capX - 10, posRailY + 34);
  ctx.lineTo(capX + 10, posRailY + 34);
  ctx.moveTo(capX, posRailY + 34);
  ctx.lineTo(capX, negRailY);
  ctx.stroke();
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('C = 4700µF', capX - 22, posRailY + 48);

  // Inverter / Industrial Load Block at right
  const loadX = dcEndX - 40;
  const loadY = posRailY + 12;
  const loadH = negRailY - posRailY - 24;

  ctx.fillStyle = '#0b1329';
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(loadX, loadY, 44, loadH, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('SiC/GaN', loadX + 5, loadY + 16);
  ctx.fillText('PWM VFD', loadX + 5, loadY + 28);

  // Animated Current Flow Energy Packets (from bridge -> load on positive, return on negative)
  particles.forEach((p) => {
    p.t = (p.t + p.speed) % 1;
    const px = bridgeX + bW + p.t * (dcEndX - (bridgeX + bW) - 40);

    // Flow on positive rail
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(px, posRailY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Return flow on negative rail
    const rx = dcEndX - 40 - p.t * (dcEndX - (bridgeX + bW) - 40);
    ctx.fillStyle = '#93c5fd';
    ctx.beginPath();
    ctx.arc(rx, negRailY, 2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Mini Output Waveform Monitor (Bottom Left)
  const scopeX = 16;
  const scopeY = h - 72;
  const scopeW = 120;
  const scopeH = 56;

  ctx.fillStyle = '#030712';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(scopeX, scopeY, scopeW, scopeH, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = '7px "IBM Plex Mono", monospace';
  ctx.fillText('DC RIPPLE SCOPE', scopeX + 6, scopeY + 10);

  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let sx = 0; sx < scopeW - 12; sx++) {
    const sy = scopeY + 34 + Math.sin((sx + time * 35) * 0.18) * 8 + Math.sin((sx + time * 70) * 0.36) * 2;
    if (sx === 0) ctx.moveTo(scopeX + 6 + sx, sy);
    else ctx.lineTo(scopeX + 6 + sx, sy);
  }
  ctx.stroke();
}

// ============================================================================
// 2. POWER SYSTEMS PROTECTION LAB: Transmission Grid Bus, Breaker, Fault, TCC
// ============================================================================
function renderPowerSystemsSLD(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  particles: { t: number; speed: number; offsetY: number }[],
  accent: string
) {
  // Title HUD
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillText('SLD: 400kV GRID ➔ GSU XFMR ➔ LINE PI-MODEL ➔ CB-52 ➔ FEEDER', 16, 20);

  // Live Power Flow Readouts Box
  const delta = (18.4 + Math.sin(time * 0.4) * 2.2).toFixed(1);
  const pMW = (345 + Math.sin(time * 0.6) * 12).toFixed(0);
  const qMVAR = (82 + Math.cos(time * 0.5) * 6).toFixed(0);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(w - 180, 10, 166, 68, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText(`BUS 1 VOLTAGE: 400.0 kV`, w - 170, 26);
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(`ROTOR ANGLE δ: ${delta}°`, w - 170, 40);
  ctx.fillText(`ACTIVE POWER P: ${pMW} MW`, w - 170, 54);
  ctx.fillStyle = '#34d399';
  ctx.fillText(`REACTIVE Q: ${qMVAR} MVAR`, w - 170, 68);

  const midY = h * 0.52;

  // 1. Generator 1 (G1) Slack Bus
  const genX = 45;
  ctx.strokeStyle = '#38bdf8';
  ctx.fillStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(genX, midY, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillText('G1', genX - 7, midY + 4);

  // Rotating rotor angle vector inside G1
  const rAngle = time * 2;
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(genX, midY);
  ctx.lineTo(genX + Math.cos(rAngle) * 14, midY + Math.sin(rAngle) * 14);
  ctx.stroke();

  // 2. Generator Step-Up Transformer (Two Interlocking Circles)
  const xfmrX = 110;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(xfmrX - 7, midY, 13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(xfmrX + 7, midY, 13, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '7px "IBM Plex Mono", monospace';
  ctx.fillText('Δ-Y 400kV', xfmrX - 16, midY + 26);

  // Connecting line from G1 to XFMR
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(genX + 20, midY);
  ctx.lineTo(xfmrX - 20, midY);
  ctx.stroke();

  // 3. Substation Bus 1 (Thick vertical bar)
  const bus1X = 160;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(bus1X, midY - 45);
  ctx.lineTo(bus1X, midY + 45);
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('BUS 1', bus1X - 12, midY - 50);

  // Line connection from XFMR to Bus 1
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(xfmrX + 20, midY);
  ctx.lineTo(bus1X, midY);
  ctx.stroke();

  // 4. Transmission Line Section with Pi-model reactance
  const bus2X = 350;
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(bus1X, midY - 18);
  ctx.lineTo(bus2X, midY - 18);
  ctx.moveTo(bus1X, midY + 18);
  ctx.lineTo(bus2X, midY + 18);
  ctx.stroke();

  // Transmission tower icon in center of line
  const towX = (bus1X + bus2X) / 2;
  ctx.fillStyle = '#475569';
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.fillText('LINE 1 (400kV)', towX - 28, midY - 24);
  ctx.fillText('LINE 2 (400kV)', towX - 28, midY + 30);

  // 5. Substation Bus 2 (Thick vertical bar)
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(bus2X, midY - 45);
  ctx.lineTo(bus2X, midY + 45);
  ctx.stroke();

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('BUS 2', bus2X - 12, midY - 50);

  // 6. Vacuum Circuit Breaker CB-52 & CT
  const cbX = bus2X + 50;
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(bus2X, midY);
  ctx.lineTo(cbX - 16, midY);
  ctx.stroke();

  // CB Box (Square with cross)
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#22c55e'; // Green for closed/healthy
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(cbX - 14, midY - 14, 28, 28);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cbX - 10, midY - 10);
  ctx.lineTo(cbX + 10, midY + 10);
  ctx.moveTo(cbX - 10, midY + 10);
  ctx.lineTo(cbX + 10, midY - 10);
  ctx.stroke();

  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('CB-52', cbX - 13, midY + 24);
  ctx.fillText('CLOSED', cbX - 15, midY + 34);

  // 7. Protective Relay (ANSI 50/51/67) CT circle
  const ctX = cbX + 45;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cbX + 14, midY);
  ctx.lineTo(ctX + 40, midY);
  ctx.stroke();

  // CT Ring
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ctX, midY, 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.font = '7px "IBM Plex Mono", monospace';
  ctx.fillText('CT 2000/1', ctX - 18, midY - 12);
  ctx.fillText('50/51/67', ctX - 16, midY + 18);

  // Power Flow Animated Energy Dots across Lines
  particles.forEach((p) => {
    p.t = (p.t + p.speed) % 1;
    const px = bus1X + p.t * (bus2X - bus1X);

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(px, midY - 18, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(px, midY + 18, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Log-Log TCC Curve Thumbnail Box (Bottom Left)
  const tccX = 16;
  const tccY = h - 74;
  const tccW = 125;
  const tccH = 58;

  ctx.fillStyle = '#030712';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(tccX, tccY, tccW, tccH, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = '7px "IBM Plex Mono", monospace';
  ctx.fillText('RELAY TCC COORDINATION', tccX + 6, tccY + 10);

  // Standard Inverse Curve (t = 0.14 / (I^0.02 - 1))
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = 0; x < tccW - 20; x++) {
    const normalizedI = 1.2 + (x / (tccW - 20)) * 8;
    const tVal = Math.min(tccH - 20, 150 / (normalizedI * normalizedI));
    const cy = tccY + tccH - 6 - tVal;
    if (x === 0) ctx.moveTo(tccX + 10 + x, cy);
    else ctx.lineTo(tccX + 10 + x, cy);
  }
  ctx.stroke();
}

// ============================================================================
// 3. SAFEOPS UPS: VFI Double-Conversion + Static Bypass + Battery String SLD
// ============================================================================
function renderSafeOpsUpsSLD(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  particles: { t: number; speed: number; offsetY: number }[],
  accent: string
) {
  // Title HUD
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillText('SLD: RECTIFIER ➔ 400V DC BUS / BATTERY ➔ INVERTER ➔ STATIC BYPASS', 16, 20);

  // Live UPS Status Box
  const pue = (1.12 + Math.sin(time * 0.3) * 0.02).toFixed(2);
  const battV = (408.4 + Math.sin(time * 0.5) * 1.2).toFixed(1);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(w - 180, 10, 166, 68, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText(`MODE: VFI DOUBLE CONVERSION`, w - 170, 26);
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(`DATACENTER PUE: ${pue}`, w - 170, 40);
  ctx.fillText(`BATTERY STRING: ${battV} V`, w - 170, 54);
  ctx.fillStyle = '#34d399';
  ctx.fillText(`TRANSFER: 0.00ms (ZERO-BREAK)`, w - 170, 68);

  const mainY = h * 0.62;
  const bypassY = h * 0.32;

  // 1. Dual Mains Inputs
  // Mains 1 (Normal Rectifier Feed)
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16, mainY);
  ctx.lineTo(80, mainY);
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.fillText('MAINS 1', 16, mainY - 6);

  // Mains 2 (Reserve / Bypass Feed)
  ctx.strokeStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(16, bypassY);
  ctx.lineTo(260, bypassY);
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.fillText('MAINS 2 (BYPASS)', 16, bypassY - 6);

  // 2. Rectifier / Charger Stage
  const recX = 80;
  const recW = 54;
  const recH = 46;
  ctx.fillStyle = '#0b1329';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(recX, mainY - recH / 2, recW, recH, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('PFC', recX + 18, mainY - 4);
  ctx.fillText('RECTIFIER', recX + 4, mainY + 8);

  // 3. DC Bus & Battery String (Center)
  const dcX = recX + recW;
  const battX = dcX + 45;
  const invX = battX + 45;

  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(dcX, mainY);
  ctx.lineTo(invX, mainY);
  ctx.stroke();

  // Battery Bank branch downward
  const battTopY = mainY;
  const battBottomY = h - 35;
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(battX, battTopY);
  ctx.lineTo(battX, battBottomY - 26);
  ctx.stroke();

  // Battery icon (plates)
  ctx.fillStyle = '#064e3b';
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(battX - 22, battBottomY - 24, 44, 24, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('BATTERY', battX - 18, battBottomY - 14);
  ctx.fillText('100% FLOAT', battX - 22, battBottomY - 4);

  // 4. Inverter Stage (DC to AC)
  const invW = 54;
  const invH = 46;
  ctx.fillStyle = '#0b1329';
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(invX, mainY - invH / 2, invW, invH, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('IGBT', invX + 16, mainY - 4);
  ctx.fillText('INVERTER', invX + 6, mainY + 8);

  // 5. Static Bypass Switch (Thyristor pair connecting Bypass & Inverter output)
  const stsX = invX + invW + 40;

  // Inverter feed to STS
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(invX + invW, mainY);
  ctx.lineTo(stsX, mainY);
  ctx.stroke();

  // Bypass line downward to STS
  ctx.strokeStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(260, bypassY);
  ctx.lineTo(stsX, bypassY);
  ctx.lineTo(stsX, mainY - 14);
  ctx.stroke();

  // Static Switch Box
  ctx.fillStyle = '#064e3b';
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(stsX - 14, mainY - 14, 28, 28, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('STS', stsX - 7, mainY + 3);

  // 6. Critical IT Server Load
  const loadX = stsX + 40;
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(stsX + 14, mainY);
  ctx.lineTo(loadX, mainY);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(loadX, mainY - 24, 48, 48, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('TIER IV', loadX + 8, mainY - 8);
  ctx.fillText('SERVERS', loadX + 6, mainY + 4);
  ctx.fillStyle = '#34d399';
  ctx.fillText('250 kW', loadX + 10, mainY + 16);

  // Animated Double-Conversion Energy Flow Particles
  particles.forEach((p) => {
    p.t = (p.t + p.speed) % 1;
    // Primary path: Mains -> Rectifier -> Inverter -> Load
    const totalDist = loadX - 16;
    const px = 16 + p.t * totalDist;

    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(px, mainY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ============================================================================
// 4. ELECTROLIVE SAFETY LAB: Arc Flash Plasma Boundary & Step/Touch Potentials
// ============================================================================
function renderElectroLiveSafetySLD(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  sparks: { x: number; y: number; vx: number; vy: number; life: number }[],
  accent: string
) {
  // Title HUD
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillText('SLD: SWITCHGEAR CUBICLE ➔ IEEE 1584 ARC FLASH ➔ STEP/TOUCH POTENTIAL', 16, 20);

  // Live Arc Flash & Safety Readouts Box
  const incEnergy = (8.4 + Math.sin(time * 0.4) * 0.6).toFixed(1);
  const boundary = (1.85 + Math.sin(time * 0.3) * 0.05).toFixed(2);
  const vTouch = (38.2 + Math.sin(time * 0.5) * 2.1).toFixed(1);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(w - 180, 10, 166, 68, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText(`INCIDENT ENERGY: ${incEnergy} cal/cm²`, w - 170, 26);
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(`PPE REQUIREMENT: CAT 2 (8 cal)`, w - 170, 40);
  ctx.fillText(`FLASH BOUNDARY: ${boundary} m`, w - 170, 54);
  ctx.fillStyle = '#34d399';
  ctx.fillText(`TOUCH VOLTAGE: ${vTouch} V (SAFE)`, w - 170, 68);

  const swX = 60;
  const swY = h * 0.5;

  // 1. Medium-Voltage Switchgear Cabinet
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(swX, swY - 55, 75, 110, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('MV CUBICLE', swX + 10, swY - 42);

  // 3-Phase Busbars inside cubicle
  const busColors = ['#ef4444', '#eab308', '#3b82f6'];
  for (let b = 0; b < 3; b++) {
    const by = swY - 24 + b * 20;
    ctx.strokeStyle = busColors[b];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(swX + 12, by);
    ctx.lineTo(swX + 62, by);
    ctx.stroke();
  }

  // 2. Arc Flash Plasma Discharge Zone (Center)
  const arcX = swX + 130;
  const arcY = swY;

  // Radiant Heat / Energy Expanding Wavefront Rings (IEEE 1584)
  const waveRadius = 45 + ((time * 25) % 65);
  ctx.strokeStyle = `rgba(245, 158, 11, ${1 - waveRadius / 110})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(arcX, arcY, waveRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Core Plasma Arc
  ctx.fillStyle = '#f59e0b';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(arcX, arcY, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Violent Electric Arc Lightning Lines
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 1.5;
  for (let l = 0; l < 5; l++) {
    const angle = (l * Math.PI * 2) / 5 + time * 3;
    const len = 16 + Math.random() * 14;
    ctx.beginPath();
    ctx.moveTo(arcX, arcY);
    ctx.lineTo(arcX + Math.cos(angle) * (len * 0.5) + (Math.random() - 0.5) * 8, arcY + Math.sin(angle) * (len * 0.5));
    ctx.lineTo(arcX + Math.cos(angle) * len, arcY + Math.sin(angle) * len);
    ctx.stroke();
  }

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('ARC FLASH', arcX - 22, arcY - 22);

  // Sparks particles
  sparks.forEach((s) => {
    s.life -= 0.04;
    if (s.life <= 0) {
      s.x = arcX;
      s.y = arcY;
      s.vx = (Math.random() - 0.5) * 5;
      s.vy = (Math.random() - 0.5) * 5;
      s.life = 1;
    }
    s.x += s.vx;
    s.y += s.vy;

    ctx.fillStyle = `rgba(253, 224, 71, ${s.life})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // 3. Worker Working Distance Silhouette at 18 inches
  const workerX = arcX + 110;
  const workerY = swY + 10;

  // Head
  ctx.fillStyle = '#f59e0b'; // Hard hat
  ctx.beginPath();
  ctx.arc(workerX, workerY - 32, 7, 0, Math.PI * 2);
  ctx.fill();

  // Face shield arc visor
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(workerX - 4, workerY - 32, 8, Math.PI * 0.6, Math.PI * 1.4);
  ctx.stroke();

  // Body PPE
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(workerX, workerY - 25);
  ctx.lineTo(workerX, workerY);
  ctx.lineTo(workerX - 8, workerY + 28);
  ctx.moveTo(workerX, workerY);
  ctx.lineTo(workerX + 8, workerY + 28);
  // Arms
  ctx.moveTo(workerX, workerY - 18);
  ctx.lineTo(workerX - 16, workerY - 6);
  ctx.stroke();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('18" BOUNDARY', workerX - 25, workerY + 42);

  // 4. Ground Soil Equipotential Gradient Rings (IEEE 80 Step & Touch)
  const soilY = h - 26;
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(16, soilY);
  ctx.lineTo(w - 16, soilY);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '7px "IBM Plex Mono", monospace';
  ctx.fillText('SOIL RESISTIVITY ρ = 100 Ω-m • IEEE 80 GROUND GRID', 16, soilY + 14);

  // Ground Equipotential Voltage Bell Curve
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let gx = 0; gx < w - 60; gx++) {
    const distFromFault = Math.abs(gx - (arcX - 16));
    const vGpr = 18 / (1 + distFromFault * 0.035);
    const gy = soilY - vGpr;
    if (gx === 0) ctx.moveTo(16 + gx, gy);
    else ctx.lineTo(16 + gx, gy);
  }
  ctx.stroke();
}
