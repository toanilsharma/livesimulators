import React, { useEffect, useRef, useState } from 'react';

interface IndustrialLabAnimatedSLDProps {
  labId: string;
  accentColor: string;
  isFaultActive?: boolean;
}

export const IndustrialLabAnimatedSLD: React.FC<IndustrialLabAnimatedSLDProps> = ({
  labId,
  accentColor,
  isFaultActive = false,
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

    // Arc flash sparks for electrolive & faults
    const sparks = Array.from({ length: 24 }, () => ({
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
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

      // Render lab-specific animated SLD with fault state
      if (labId === 'power-electronics-lab') {
        renderPowerElectronicsSLD(ctx, w, h, time, particles, accentColor, isFaultActive);
      } else if (labId === 'power-systems-lab') {
        renderPowerSystemsSLD(ctx, w, h, time, particles, accentColor, isFaultActive);
      } else if (labId === 'safeops-ups') {
        renderSafeOpsUpsSLD(ctx, w, h, time, particles, accentColor, isFaultActive);
      } else {
        renderElectroLiveSafetySLD(ctx, w, h, time, sparks, accentColor, isFaultActive);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [labId, isVisible, accentColor, isFaultActive]);

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
  accent: string,
  isFault: boolean = false
) {
  // Title HUD
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillText(
    isFault 
      ? 'SLD: [EMERGENCY] SHOOT-THROUGH FAULT DETECTED ➔ DESAT CLAMP ACTIVE'
      : 'SLD: 3Φ AC 415V ➔ 6-PULSE SCR BRIDGE ➔ LC CHOKE ➔ DC BUS', 
    16, 
    20
  );

  // Live Electrical Readouts Box
  const alpha = isFault ? 0 : 30 + Math.sin(time * 0.5) * 15;
  const vdc = isFault ? Math.round(28 + Math.random() * 12) : Math.round(1.35 * 415 * Math.cos((alpha * Math.PI) / 180));
  const idc = isFault ? (128.4 + Math.random() * 20).toFixed(1) : (45.2 + Math.sin(time * 0.8) * 3.1).toFixed(1);
  const thd = isFault ? '48.2' : (3.4 + Math.sin(time * 0.3) * 0.6).toFixed(1);

  ctx.fillStyle = isFault ? 'rgba(30, 10, 15, 0.92)' : 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = isFault ? '#ef4444' : 'rgba(51, 65, 85, 0.8)';
  ctx.lineWidth = isFault ? 1.5 : 1;
  ctx.beginPath();
  ctx.roundRect(w - 195, 10, 180, 72, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isFault ? '#f87171' : '#38bdf8';
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText(isFault ? `STATUS: DESAT CLAMP ENGAGED` : `α FIRING ANGLE: ${alpha.toFixed(1)}°`, w - 185, 26);
  ctx.fillStyle = isFault ? '#ef4444' : '#f8fafc';
  ctx.fillText(isFault ? `DC LINK VOLTAGE: ${vdc} V (COLLAPSE)` : `DC BUS VOLTAGE: ${vdc} V`, w - 185, 40);
  ctx.fillText(isFault ? `FAULT CURRENT: ${idc} A (PEAK)` : `DC LOAD CURRENT: ${idc} A`, w - 185, 54);
  ctx.fillStyle = isFault ? '#f87171' : '#34d399';
  ctx.fillText(isFault ? `THD: ${thd}% (HARMONIC SPIKE)` : `THD (IEEE 519): ${thd}%`, w - 185, 68);

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
  // Perfectly terminating into 3-Phase Inverter VFD Terminals
  const posRailY = bY + 14;
  const negRailY = bY + bH - 14;
  const vfdX = bridgeX + bW + 130;
  const vfdW = 105;
  const vfdH = bH;
  const vfdY = bY;

  // Positive rail (Red) - runs directly from SCR bridge output to VFD DC(+) terminal
  ctx.strokeStyle = isFault ? '#f87171' : '#ef4444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bridgeX + bW, posRailY);
  ctx.lineTo(vfdX, posRailY);
  ctx.stroke();

  // Negative rail (Blue) - runs directly from SCR bridge output to VFD DC(-) terminal
  ctx.strokeStyle = isFault ? '#60a5fa' : '#3b82f6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bridgeX + bW, negRailY);
  ctx.lineTo(vfdX, negRailY);
  ctx.stroke();

  // DC (+) Terminal Node on VFD input
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(vfdX, posRailY, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fca5a5';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('DC(+)', vfdX - 32, posRailY - 6);

  // DC (-) Terminal Node on VFD input
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(vfdX, negRailY, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#93c5fd';
  ctx.fillText('DC(-)', vfdX - 32, negRailY + 13);

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
  const capX = chokeX + 55;
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

  // 4. 3-Phase IGBT PWM Inverter Stage (VFD)
  ctx.fillStyle = isFault ? '#1a0b12' : '#0b1329';
  ctx.strokeStyle = isFault ? '#ef4444' : '#a855f7';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(vfdX, vfdY, vfdW, vfdH, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isFault ? '#f87171' : '#c084fc';
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText(isFault ? 'DESAT ACTIVE' : '3Φ PWM INVERTER', vfdX + 10, vfdY + 16);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '7px "IBM Plex Mono", monospace';
  ctx.fillText(isFault ? 'GATE DRIVE OFF' : 'SiC/GaN VFD 415V', vfdX + 10, vfdY + 28);

  // Inverter DC-to-AC conversion symbol (triangle with sine wave inside)
  ctx.strokeStyle = isFault ? '#ef4444' : '#c084fc';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(vfdX + 22, vfdY + 42);
  ctx.lineTo(vfdX + 50, vfdY + 58);
  ctx.lineTo(vfdX + 22, vfdY + 74);
  ctx.closePath();
  ctx.stroke();

  // Mini sine wave inside inverter symbol
  ctx.beginPath();
  for (let sx = 0; sx < 20; sx++) {
    const ssy = vfdY + 58 + Math.sin((sx + time * 10) * 0.4) * 6;
    if (sx === 0) ctx.moveTo(vfdX + 26 + sx, ssy);
    else ctx.lineTo(vfdX + 26 + sx, ssy);
  }
  ctx.stroke();

  // 5. 3-Phase Induction Motor (U, V, W Output from VFD to Motor)
  const motorX = w - 55;
  const motorY = acY;
  const outYOffsets = [28, 50, 72];
  const outColors = ['#ef4444', '#eab308', '#3b82f6'];
  const outLabels = ['U', 'V', 'W'];

  for (let i = 0; i < 3; i++) {
    const oy = vfdY + outYOffsets[i];
    const my = motorY - 14 + i * 14;

    // AC feeder line from VFD output terminal to Motor
    ctx.strokeStyle = isFault ? '#64748b' : outColors[i];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(vfdX + vfdW, oy);
    ctx.lineTo(motorX - 25, my);
    ctx.stroke();

    // VFD output terminal node
    ctx.fillStyle = outColors[i];
    ctx.beginPath();
    ctx.arc(vfdX + vfdW, oy, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Label U, V, W
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 7px "IBM Plex Mono", monospace';
    ctx.fillText(outLabels[i], vfdX + vfdW + 5, oy + 2);

    // Sinusoidal energy dots on motor feed (stops during fault)
    if (!isFault) {
      const frac = ((time * 2 + i * 0.33) % 1);
      const dotX = (vfdX + vfdW) + frac * ((motorX - 25) - (vfdX + vfdW));
      const dotY = oy + frac * (my - oy);
      ctx.fillStyle = outColors[i];
      ctx.beginPath();
      ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Motor Symbol (IEC Stator & Rotor Dual Circle)
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = isFault ? '#64748b' : '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(motorX, motorY, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rotor inner circle
  ctx.strokeStyle = isFault ? '#64748b' : '#34d399';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(motorX, motorY, 15, 0, Math.PI * 2);
  ctx.stroke();

  // Motor Text & rotating shaft indicator
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText('M', motorX - 6, motorY - 2);
  ctx.font = 'bold 7px "IBM Plex Mono", monospace';
  ctx.fillText('3~', motorX - 6, motorY + 8);

  // Rotating rotor shaft ticks
  if (!isFault) {
    const rotorAngle = time * 4;
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(motorX, motorY);
    ctx.lineTo(motorX + Math.cos(rotorAngle) * 12, motorY + Math.sin(rotorAngle) * 12);
    ctx.stroke();
  }

  ctx.fillStyle = '#94a3b8';
  ctx.font = '7px "IBM Plex Mono", monospace';
  ctx.fillText('3Φ MOTOR', motorX - 18, motorY + 34);

  // Animated Current Flow Energy Packets (from bridge -> VFD DC(+) on positive, return from DC(-) on negative)
  if (!isFault) {
    particles.forEach((p) => {
      p.t = (p.t + p.speed) % 1;
      const px = bridgeX + bW + p.t * (vfdX - (bridgeX + bW));

      // Flow on positive rail into VFD
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(px, posRailY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Return flow on negative rail from VFD
      const rx = vfdX - p.t * (vfdX - (bridgeX + bW));
      ctx.fillStyle = '#93c5fd';
      ctx.beginPath();
      ctx.arc(rx, negRailY, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    // Shoot-through fault spark arcing between DC rails
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(capX + 30, posRailY);
    ctx.lineTo(capX + 30, negRailY);
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(capX + 30, (posRailY + negRailY) / 2, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mini Output Waveform Monitor (Bottom Left)
  const scopeX = 16;
  const scopeY = h - 72;
  const scopeW = 120;
  const scopeH = 56;

  ctx.fillStyle = '#030712';
  ctx.strokeStyle = isFault ? '#ef4444' : '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(scopeX, scopeY, scopeW, scopeH, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isFault ? '#f87171' : '#38bdf8';
  ctx.font = '7px "IBM Plex Mono", monospace';
  ctx.fillText(isFault ? 'FAULT TRANSIENT' : 'DC RIPPLE SCOPE', scopeX + 6, scopeY + 10);

  ctx.strokeStyle = isFault ? '#ef4444' : '#34d399';
  ctx.lineWidth = isFault ? 1.8 : 1.2;
  ctx.beginPath();
  for (let sx = 0; sx < scopeW - 12; sx++) {
    const sy = isFault
      ? scopeY + 28 + (Math.sin((sx + time * 60) * 0.4) * 16 * Math.exp(-sx * 0.04))
      : scopeY + 34 + Math.sin((sx + time * 35) * 0.18) * 8 + Math.sin((sx + time * 70) * 0.36) * 2;
    if (sx === 0) ctx.moveTo(scopeX + 6 + sx, sy);
    else ctx.lineTo(scopeX + 6 + sx, sy);
  }
  ctx.stroke();

  // Bottom Interactive Fault Indicator Ribbon
  if (isFault) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 160, h - 28, 320, 22, 11);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "IBM Plex Mono", monospace';
    ctx.fillText('⚡ FAULT ACTIVE: SHOOT-THROUGH CLAMPED • PWM INHIBITED', w / 2 - 146, h - 14);
  }
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
  accent: string,
  isFault: boolean = false
) {
  // Title HUD
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillText(
    isFault 
      ? 'SLD: [EMERGENCY] 3Φ BUS FAULT DETECTED ➔ RELAY 52 TRIPPED CB-52'
      : 'SLD: 400kV GRID ➔ GSU XFMR ➔ LINE PI-MODEL ➔ CB-52 ➔ FEEDER', 
    16, 
    20
  );

  // Live Power Flow Readouts Box
  const delta = isFault ? '0.0' : (18.4 + Math.sin(time * 0.4) * 2.2).toFixed(1);
  const pMW = isFault ? '0' : (345 + Math.sin(time * 0.6) * 12).toFixed(0);
  const ifault = (16.8 + Math.sin(time * 0.5) * 0.4).toFixed(1);

  ctx.fillStyle = isFault ? 'rgba(30, 10, 15, 0.92)' : 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = isFault ? '#ef4444' : 'rgba(51, 65, 85, 0.8)';
  ctx.lineWidth = isFault ? 1.5 : 1;
  ctx.beginPath();
  ctx.roundRect(w - 195, 10, 180, 72, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isFault ? '#f87171' : '#38bdf8';
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText(isFault ? `BREAKER 52: TRIPPED (OPEN)` : `BUS 1 VOLTAGE: 400.0 kV`, w - 185, 26);
  ctx.fillStyle = isFault ? '#ef4444' : '#f8fafc';
  ctx.fillText(isFault ? `FAULT CURRENT: ${ifault} kA` : `ROTOR ANGLE δ: ${delta}°`, w - 185, 40);
  ctx.fillText(isFault ? `CLEARED IN: 28 ms (ANSI 50)` : `ACTIVE POWER P: ${pMW} MW`, w - 185, 54);
  ctx.fillStyle = isFault ? '#34d399' : '#34d399';
  ctx.fillText(isFault ? `ZONE 1 ISOLATED • HEALTHY` : `REACTIVE Q: 82 MVAR`, w - 185, 68);

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
  ctx.strokeStyle = isFault ? '#ef4444' : '#34d399';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(bus2X, midY - 45);
  ctx.lineTo(bus2X, midY + 45);
  ctx.stroke();

  ctx.fillStyle = isFault ? '#ef4444' : '#34d399';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText(isFault ? 'BUS 2 (FAULT)' : 'BUS 2', bus2X - 16, midY - 50);

  // Electrical Arc Discharge on Bus 2 during fault
  if (isFault) {
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(bus2X, midY, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Violent lightning crackles around fault
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.5;
    for (let f = 0; f < 6; f++) {
      const angle = (f * Math.PI) / 3 + time * 4;
      const len = 14 + Math.random() * 16;
      ctx.beginPath();
      ctx.moveTo(bus2X, midY);
      ctx.lineTo(bus2X + Math.cos(angle) * len, midY + Math.sin(angle) * len);
      ctx.stroke();
    }
  }

  // 6. Vacuum Circuit Breaker CB-52 & CT
  const cbX = bus2X + 50;
  ctx.strokeStyle = isFault ? '#64748b' : '#34d399';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(bus2X, midY);
  ctx.lineTo(cbX - 16, midY);
  ctx.stroke();

  // CB Box (Square)
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = isFault ? '#ef4444' : '#22c55e'; // Red for tripped/open, Green for closed
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(cbX - 14, midY - 14, 28, 28);
  ctx.fill();
  ctx.stroke();

  if (isFault) {
    // Open contacts (Diagonal open gap)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cbX - 10, midY + 10);
    ctx.lineTo(cbX - 2, midY - 6);
    ctx.moveTo(cbX + 2, midY + 6);
    ctx.lineTo(cbX + 10, midY - 10);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 8px "IBM Plex Mono", monospace';
    ctx.fillText('CB-52', cbX - 13, midY + 24);
    ctx.fillText('TRIPPED', cbX - 17, midY + 34);
  } else {
    // Closed contacts (Cross)
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
  }

  // 7. Protective Relay (ANSI 50/51/67) CT circle
  const ctX = cbX + 45;
  ctx.strokeStyle = isFault ? '#64748b' : '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cbX + 14, midY);
  ctx.lineTo(ctX + 40, midY);
  ctx.stroke();

  // CT Ring
  ctx.strokeStyle = isFault ? '#ef4444' : '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(ctX, midY, 8, 0, Math.PI * 2);
  ctx.stroke();

  // Relay Trip Flasher
  if (isFault) {
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(ctX, midY - 18, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = isFault ? '#ef4444' : '#f59e0b';
  ctx.font = '7px "IBM Plex Mono", monospace';
  ctx.fillText('CT 2000/1', ctX - 18, midY - 12);
  ctx.fillText(isFault ? '50 TRIP' : '50/51/67', ctX - 16, midY + 18);

  // Power Flow Animated Energy Dots across Lines
  if (!isFault) {
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
  } else {
    // Intense fault flow rushing into Bus 2 fault point
    particles.forEach((p) => {
      p.t = (p.t + p.speed * 2.5) % 1;
      const px = bus1X + p.t * (bus2X - bus1X);

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(px, midY - 18, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.arc(px, midY + 18, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Log-Log TCC Curve Thumbnail Box (Bottom Left)
  const tccX = 16;
  const tccY = h - 74;
  const tccW = 125;
  const tccH = 58;

  ctx.fillStyle = '#030712';
  ctx.strokeStyle = isFault ? '#ef4444' : '#1e293b';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(tccX, tccY, tccW, tccH, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isFault ? '#f87171' : '#38bdf8';
  ctx.font = '7px "IBM Plex Mono", monospace';
  ctx.fillText(isFault ? 'ANSI 50 TRIP POINT' : 'RELAY TCC COORDINATION', tccX + 6, tccY + 10);

  // Standard Inverse Curve (t = 0.14 / (I^0.02 - 1))
  ctx.strokeStyle = isFault ? '#ef4444' : '#f59e0b';
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

  // Bottom Interactive Fault Indicator Ribbon
  if (isFault) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.92)';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 170, h - 28, 340, 22, 11);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "IBM Plex Mono", monospace';
    ctx.fillText('⚡ 3Φ BUS FAULT • RELAY 52 TRIPPED (28ms) • CB-52 OPEN (ISOLATED)', w / 2 - 158, h - 14);
  }
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
  accent: string,
  isFault: boolean = false
) {
  // Title HUD
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillText(
    isFault
      ? 'SLD: [OUTAGE] MAINS POWER LOST ➔ BATTERY INVERTER SUPPORTING TIER IV LOAD'
      : 'SLD: RECTIFIER ➔ 400V DC BUS / BATTERY ➔ INVERTER ➔ STATIC BYPASS', 
    16, 
    20
  );

  // Live UPS Status Box
  const pue = isFault ? '1.08' : (1.12 + Math.sin(time * 0.3) * 0.02).toFixed(2);
  const battV = isFault ? (388.2 - ((time * 0.5) % 8)).toFixed(1) : (408.4 + Math.sin(time * 0.5) * 1.2).toFixed(1);

  ctx.fillStyle = isFault ? 'rgba(30, 15, 10, 0.92)' : 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = isFault ? '#f59e0b' : 'rgba(51, 65, 85, 0.8)';
  ctx.lineWidth = isFault ? 1.5 : 1;
  ctx.beginPath();
  ctx.roundRect(w - 195, 10, 180, 72, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isFault ? '#fbbf24' : '#10b981';
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText(isFault ? `MODE: BATTERY DISCHARGE` : `MODE: VFI DOUBLE CONVERSION`, w - 185, 26);
  ctx.fillStyle = isFault ? '#ef4444' : '#f8fafc';
  ctx.fillText(isFault ? `MAINS 1 & 2: 0.0 V (BLACKOUT)` : `DATACENTER PUE: ${pue}`, w - 185, 40);
  ctx.fillText(isFault ? `BATTERY STRING: ${battV} V (480A)` : `BATTERY STRING: ${battV} V`, w - 185, 54);
  ctx.fillStyle = '#34d399';
  ctx.fillText(`TRANSFER: 0.00ms (ZERO BREAK)`, w - 185, 68);

  const mainY = h * 0.62;
  const bypassY = h * 0.32;

  // 1. Dual Mains Inputs
  // Mains 1 (Normal Rectifier Feed)
  ctx.strokeStyle = isFault ? '#64748b' : '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16, mainY);
  ctx.lineTo(80, mainY);
  ctx.stroke();

  ctx.fillStyle = isFault ? '#ef4444' : '#38bdf8';
  ctx.font = '8px "IBM Plex Mono", monospace';
  ctx.fillText(isFault ? 'MAINS 1 (0V)' : 'MAINS 1', 16, mainY - 6);

  // Mains 2 (Reserve / Bypass Feed)
  ctx.strokeStyle = isFault ? '#475569' : '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(16, bypassY);
  ctx.lineTo(260, bypassY);
  ctx.stroke();

  ctx.fillStyle = isFault ? '#64748b' : '#f59e0b';
  ctx.fillText(isFault ? 'BYPASS (0V)' : 'MAINS 2 (BYPASS)', 16, bypassY - 6);

  // 2. Rectifier / Charger Stage
  const recX = 80;
  const recW = 54;
  const recH = 46;
  ctx.fillStyle = isFault ? '#0a0d14' : '#0b1329';
  ctx.strokeStyle = isFault ? '#475569' : '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(recX, mainY - recH / 2, recW, recH, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isFault ? '#64748b' : '#38bdf8';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText(isFault ? 'OFFLINE' : 'PFC', recX + (isFault ? 8 : 18), mainY - 4);
  ctx.fillText('RECTIFIER', recX + 4, mainY + 8);

  // 3. DC Bus & Battery String (Center)
  const dcX = recX + recW;
  const battX = dcX + 45;
  const invX = battX + 45;

  ctx.strokeStyle = isFault ? '#38bdf8' : '#ef4444';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(dcX, mainY);
  ctx.lineTo(invX, mainY);
  ctx.stroke();

  // Battery Bank branch downward
  const battTopY = mainY;
  const battBottomY = h - 35;
  ctx.strokeStyle = isFault ? '#06b6d4' : '#10b981';
  ctx.lineWidth = isFault ? 3 : 2;
  ctx.beginPath();
  ctx.moveTo(battX, battTopY);
  ctx.lineTo(battX, battBottomY - 26);
  ctx.stroke();

  // Battery icon (plates)
  ctx.fillStyle = isFault ? '#083344' : '#064e3b';
  ctx.strokeStyle = isFault ? '#22d3ee' : '#34d399';
  ctx.lineWidth = isFault ? 2 : 1.5;
  ctx.beginPath();
  ctx.roundRect(battX - 22, battBottomY - 24, 44, 24, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isFault ? '#22d3ee' : '#34d399';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('BATTERY', battX - 18, battBottomY - 14);
  ctx.fillText(isFault ? 'DISCHARGE' : '100% FLOAT', battX - 22, battBottomY - 4);

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
  ctx.strokeStyle = isFault ? '#475569' : '#f59e0b';
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

  // Animated Energy Flow Particles
  if (!isFault) {
    // Normal: Mains -> Rectifier -> Inverter -> Load
    particles.forEach((p) => {
      p.t = (p.t + p.speed) % 1;
      const totalDist = loadX - 16;
      const px = 16 + p.t * totalDist;

      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(px, mainY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    // Outage: Battery discharging UPWARD into DC bus and into Inverter -> Load
    particles.forEach((p) => {
      p.t = (p.t + p.speed * 1.5) % 1;
      if (p.t < 0.4) {
        // Upward from battery to DC bus
        const by = (battBottomY - 24) - (p.t / 0.4) * (battBottomY - 24 - mainY);
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.arc(battX, by, 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Forward from DC bus through Inverter to Load
        const frac = (p.t - 0.4) / 0.6;
        const px = battX + frac * (loadX - battX);
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(px, mainY, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // Bottom Interactive Fault Indicator Ribbon
  if (isFault) {
    ctx.fillStyle = 'rgba(16, 185, 129, 0.92)';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 170, h - 28, 340, 22, 11);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "IBM Plex Mono", monospace';
    ctx.fillText('🚨 MAINS GRID LOST • ZERO-BREAK STS TRANSFER • BATTERY SUPPLYING LOAD', w / 2 - 160, h - 14);
  }
}

// ============================================================================
// 4. ELECTROLIVE SAFETY LAB: Visual Learning for Touch & Step Voltage + RCD/ELCB
// ============================================================================
function renderElectroLiveSafetySLD(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  sparks: { x: number; y: number; vx: number; vy: number; life: number }[],
  accent: string,
  isFault: boolean = false
) {
  // Title HUD
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 10px "IBM Plex Mono", monospace';
  ctx.fillText(
    isFault
      ? 'SLD: [LEAKAGE FAULT] CHASSIS ENERGIZED ➔ 30mA RCD DETECTED 180mA ➔ TRIPPED IN 18ms'
      : 'SLD: 415V TN-S ➔ 30mA RCD / ELCB CORE ➔ MOTOR CHASSIS ➔ V_TOUCH & V_STEP (IEEE 80)', 
    16, 
    20
  );

  // Live Electrical Safety Readouts Box
  const vTouch = isFault ? '0.0' : '0.0';
  const iLeak = isFault ? '180.0' : '0.2';
  const vStep = '1.8';

  ctx.fillStyle = isFault ? 'rgba(30, 15, 20, 0.92)' : 'rgba(15, 23, 42, 0.85)';
  ctx.strokeStyle = isFault ? '#10b981' : 'rgba(51, 65, 85, 0.8)';
  ctx.lineWidth = isFault ? 1.5 : 1;
  ctx.beginPath();
  ctx.roundRect(w - 205, 10, 190, 72, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isFault ? '#34d399' : '#38bdf8';
  ctx.font = 'bold 9px "IBM Plex Mono", monospace';
  ctx.fillText(isFault ? '30mA RCD: TRIPPED (18ms)' : 'RCD CORE: BALANCED (ΣI = 0)', w - 195, 26);
  ctx.fillStyle = isFault ? '#34d399' : '#f8fafc';
  ctx.fillText(isFault ? `TOUCH VOLTAGE: 0.0 V (CLEARED)` : `TOUCH VOLTAGE V_touch: 0.0 V`, w - 195, 40);
  ctx.fillText(isFault ? `LEAKAGE: ${iLeak}mA ➔ 0.0mA` : `EARTH LEAKAGE I_Δn: ${iLeak} mA`, w - 195, 54);
  ctx.fillStyle = '#34d399';
  ctx.fillText(`STEP VOLTAGE V_step: ${vStep} V (SAFE)`, w - 195, 68);

  const mainY = h * 0.44;
  const soilY = h - 34;

  // 1. AC Power Supply Line Inputs (Phase L1, Neutral N, Earth PE)
  const l1Y = mainY - 22;
  const nY = mainY;
  const peY = mainY + 22;
  const inX = 16;
  const rcdX = 75;

  // Phase L (Red)
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(inX, l1Y);
  ctx.lineTo(rcdX - 14, l1Y);
  ctx.stroke();
  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('L1 (230V)', inX, l1Y - 6);

  // Neutral N (Blue)
  ctx.strokeStyle = '#3b82f6';
  ctx.beginPath();
  ctx.moveTo(inX, nY);
  ctx.lineTo(rcdX - 14, nY);
  ctx.stroke();
  ctx.fillStyle = '#3b82f6';
  ctx.fillText('N (0V)', inX, nY - 6);

  // Protective Earth PE (Green/Yellow dashed)
  ctx.strokeStyle = '#22c55e';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(inX, peY);
  ctx.lineTo(rcdX - 14, peY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#22c55e';
  ctx.fillText('PE (EARTH)', inX, peY - 6);

  // 2. Toroidal Core RCD / ELCB (Visual Sensing Ring)
  const toroidW = 32;
  const toroidH = 56;
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = isFault ? '#ef4444' : '#06b6d4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(rcdX - 14, l1Y - 10, toroidW, toroidH, 16);
  ctx.fill();
  ctx.stroke();

  // Toroid Label
  ctx.fillStyle = isFault ? '#f87171' : '#22d3ee';
  ctx.font = 'bold 7px "IBM Plex Mono", monospace';
  ctx.fillText('30mA', rcdX - 10, l1Y + 12);
  ctx.fillText('RCD', rcdX - 8, l1Y + 24);
  ctx.fillText('CORE', rcdX - 9, l1Y + 36);

  // 3. ELCB Circuit Breaker Contacts (Opens on fault)
  const cbX = rcdX + 32;
  ctx.strokeStyle = isFault ? '#64748b' : '#ef4444';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(rcdX + toroidW - 14, l1Y);
  if (isFault) {
    // Open contact (diagonal break)
    ctx.lineTo(cbX, l1Y);
    ctx.lineTo(cbX + 12, l1Y - 14);
    ctx.moveTo(cbX + 18, l1Y);
    ctx.lineTo(cbX + 35, l1Y);
  } else {
    // Closed contact
    ctx.lineTo(cbX + 35, l1Y);
  }
  ctx.stroke();

  // Neutral path through breaker
  ctx.strokeStyle = isFault ? '#64748b' : '#3b82f6';
  ctx.beginPath();
  ctx.moveTo(rcdX + toroidW - 14, nY);
  ctx.lineTo(cbX + 35, nY);
  ctx.stroke();

  // Breaker status text
  ctx.fillStyle = isFault ? '#ef4444' : '#22c55e';
  ctx.font = 'bold 7px "IBM Plex Mono", monospace';
  ctx.fillText(isFault ? 'TRIPPED (18ms)' : 'ELCB CLOSED', cbX - 4, l1Y - 18);

  // 4. Equipment Cabinet / Motor Chassis (Center)
  const equipX = 175;
  const equipW = 120;
  const equipH = 100;
  const equipY = mainY - equipH / 2;

  // Outer Metallic Enclosure (Chassis Frame)
  ctx.fillStyle = isFault ? '#1c1318' : '#0b1329';
  ctx.strokeStyle = isFault ? '#f59e0b' : '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(equipX, equipY, equipW, equipH, 8);
  ctx.fill();
  ctx.stroke();

  // Enclosure Header
  ctx.fillStyle = isFault ? '#fbbf24' : '#38bdf8';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('METALLIC CHASSIS', equipX + 12, equipY + 14);
  ctx.fillStyle = '#64748b';
  ctx.font = '7px "IBM Plex Mono", monospace';
  ctx.fillText('GROUNDED MOTOR FRAME', equipX + 12, equipY + 26);

  // Internal Motor Stator Coil inside chassis
  const coilX = equipX + 40;
  const coilY = equipY + 54;
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(coilX, coilY, 18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#f59e0b';
  ctx.fillText('STATOR', coilX - 14, coilY + 3);

  // Feed lines into internal coil
  ctx.strokeStyle = isFault ? '#64748b' : '#ef4444';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(cbX + 35, l1Y);
  ctx.lineTo(coilX - 18, coilY - 8);
  ctx.stroke();

  ctx.strokeStyle = isFault ? '#64748b' : '#3b82f6';
  ctx.beginPath();
  ctx.moveTo(cbX + 35, nY);
  ctx.lineTo(coilX - 18, coilY + 8);
  ctx.stroke();

  // Protective Earth (PE) bonding from chassis to Earth Pit
  const peBondX = equipX + 18;
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(peBondX, equipY + equipH);
  ctx.lineTo(peBondX, soilY);
  ctx.stroke();

  // Earth Pit Rod in Soil
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(peBondX, soilY);
  ctx.lineTo(peBondX, soilY + 24);
  ctx.stroke();

  ctx.fillStyle = '#22c55e';
  ctx.font = '7px "IBM Plex Mono", monospace';
  ctx.fillText('EARTH ROD', peBondX - 20, soilY + 16);
  ctx.fillText('R_E = 2.4Ω', peBondX - 20, soilY + 26);

  // Fault Condition: Internal Insulation Breakdown to Chassis!
  if (isFault) {
    // Arc spark from stator to chassis wall
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(coilX + 18, coilY);
    ctx.lineTo(equipX + equipW - 4, coilY);
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(equipX + equipW - 4, coilY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 8px "IBM Plex Mono", monospace';
    ctx.fillText('⚡ FAULT TO FRAME', equipX + 36, coilY - 14);
  }

  // 5. Worker Silhouette Touching the Enclosure (Human Body Model)
  const workerX = equipX + equipW + 65;
  const workerY = mainY + 8;

  // Hand touching the metallic enclosure chassis
  const handContactX = equipX + equipW;
  const handContactY = coilY;

  // Arm extending to chassis
  ctx.strokeStyle = isFault ? '#ef4444' : '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(workerX, workerY - 16);
  ctx.lineTo(handContactX, handContactY);
  ctx.stroke();

  // Hand contact node
  ctx.fillStyle = isFault ? '#ef4444' : '#22c55e';
  ctx.beginPath();
  ctx.arc(handContactX, handContactY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Worker Head (Safety Helmet & Visor)
  ctx.fillStyle = '#f59e0b'; // Hard hat
  ctx.beginPath();
  ctx.arc(workerX, workerY - 36, 8, 0, Math.PI * 2);
  ctx.fill();

  // Face shield
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(workerX - 4, workerY - 36, 9, Math.PI * 0.6, Math.PI * 1.4);
  ctx.stroke();

  // Body Torso
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(workerX, workerY - 28);
  ctx.lineTo(workerX, workerY + 12);
  ctx.stroke();

  // Heart indicator inside worker
  ctx.fillStyle = isFault ? '#ef4444' : '#10b981';
  ctx.beginPath();
  ctx.arc(workerX - 2, workerY - 10, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Two Feet on Ground (1.0 Meter Step Separation)
  const foot1X = workerX - 14;
  const foot2X = workerX + 18;
  const footY = soilY;

  // Left Leg to Foot 1
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(workerX, workerY + 12);
  ctx.lineTo(foot1X, footY);
  ctx.stroke();

  // Right Leg to Foot 2
  ctx.beginPath();
  ctx.moveTo(workerX, workerY + 12);
  ctx.lineTo(foot2X, footY);
  ctx.stroke();

  // Safety Boots
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(foot1X - 6, footY - 4, 12, 6);
  ctx.fillRect(foot2X - 6, footY - 4, 12, 6);

  // 6. Visual Learning Dimensions: TOUCH VOLTAGE & STEP VOLTAGE (Pedagogical Core)
  
  // A. TOUCH VOLTAGE (V_touch) Dimension Arrow (from Hand to Ground)
  const dimTouchX = handContactX + 14;
  ctx.strokeStyle = isFault ? '#ef4444' : '#38bdf8';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(dimTouchX, handContactY);
  ctx.lineTo(dimTouchX, soilY);
  // Arrowheads
  ctx.moveTo(dimTouchX - 4, handContactY + 6);
  ctx.lineTo(dimTouchX, handContactY);
  ctx.lineTo(dimTouchX + 4, handContactY + 6);
  ctx.moveTo(dimTouchX - 4, soilY - 6);
  ctx.lineTo(dimTouchX, soilY);
  ctx.lineTo(dimTouchX + 4, soilY - 6);
  ctx.stroke();

  // Touch Voltage Label
  ctx.fillStyle = isFault ? '#f87171' : '#38bdf8';
  ctx.font = 'bold 8px "IBM Plex Mono", monospace';
  ctx.fillText('V_TOUCH', dimTouchX + 5, (handContactY + soilY) / 2 - 4);
  ctx.font = '7px "IBM Plex Mono", monospace';
  ctx.fillText(isFault ? '0V (CLEARED)' : '0V (SAFE)', dimTouchX + 5, (handContactY + soilY) / 2 + 8);

  // B. STEP VOLTAGE (V_step) Dimension Arrow (1.0 Meter between Feet)
  const stepDimY = soilY + 12;
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(foot1X, stepDimY);
  ctx.lineTo(foot2X, stepDimY);
  // Arrowheads
  ctx.moveTo(foot1X + 4, stepDimY - 3);
  ctx.lineTo(foot1X, stepDimY);
  ctx.lineTo(foot1X + 4, stepDimY + 3);
  ctx.moveTo(foot2X - 4, stepDimY - 3);
  ctx.lineTo(foot2X, stepDimY);
  ctx.lineTo(foot2X - 4, stepDimY + 3);
  ctx.stroke();

  // Step Voltage Label
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 7px "IBM Plex Mono", monospace';
  ctx.fillText('1.0m STEP (V_step = 1.8V)', foot1X - 8, stepDimY + 12);

  // 7. Ground Soil Equipotential Gradient Baseline (IEEE 80)
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(16, soilY);
  ctx.lineTo(w - 16, soilY);
  ctx.stroke();

  // Soil Voltage Bell Curve Gradient
  ctx.strokeStyle = isFault ? '#10b981' : '#64748b';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let gx = 0; gx < w - 40; gx++) {
    const dist = Math.abs(gx - (peBondX - 16));
    const vSoil = isFault ? 0 : 12 / (1 + dist * 0.04);
    const gy = soilY - vSoil;
    if (gx === 0) ctx.moveTo(16 + gx, gy);
    else ctx.lineTo(16 + gx, gy);
  }
  ctx.stroke();

  // 8. Animated Current Packets
  if (!isFault) {
    // Normal healthy power circulation
    const tNorm = (time * 0.8) % 1;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(inX + tNorm * (equipX - inX), l1Y, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(equipX - tNorm * (equipX - inX), nY, 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Fault: Current cleared, RCD tripped badge
    ctx.fillStyle = 'rgba(16, 185, 129, 0.92)';
    ctx.beginPath();
    ctx.roundRect(w / 2 - 180, h - 28, 360, 22, 11);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px "IBM Plex Mono", monospace';
    ctx.fillText('⚡ LEAKAGE DETECTED • 30mA RCD TRIPPED IN 18ms • HUMAN PROTECTED (0V)', w / 2 - 170, h - 14);
  }
}
