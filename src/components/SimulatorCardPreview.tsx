import React, { useRef, useEffect } from 'react';

interface SimulatorCardPreviewProps {
  type: string;
  accentColor: string;
  className?: string;
  height?: number;
  showFps?: boolean;
}

// Crisp, high-DPI 60 FPS vector preview for every single simulator
export const SimulatorCardPreview: React.FC<SimulatorCardPreviewProps> = ({
  type,
  accentColor,
  className = '',
  height = 50,
  showFps = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Tech Grid Background
      ctx.fillStyle = '#060b14';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 18) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const midY = h * 0.5;

      // 100% Unique Visualization for Each Simulator Type
      if (type === 'rlc') {
        // Miniature R-L-C circuit with animated current flow and 3 distinguishable waveforms:
        // Underdamped (oscillatory), Critically damped (fastest non-overshoot), Overdamped (sluggish)
        const splitX = Math.floor(w * 0.38);

        // --- LEFT: Miniature R-L-C Circuit Schematic ---
        const cLeft = 10, cTop = 8, cRight = splitX - 8, cBot = h - 8;
        const cMidY = (cTop + cBot) * 0.5;

        // Conductive loop wires
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(cLeft, cTop, cRight - cLeft, cBot - cTop);

        // AC Source Circle on left rail
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cLeft - 5, cMidY - 7, 10, 14);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cLeft, cMidY, 6, 0, Math.PI * 2);
        ctx.stroke();
        // Sine wave symbol inside source
        ctx.beginPath();
        ctx.moveTo(cLeft - 3, cMidY);
        ctx.quadraticCurveTo(cLeft - 1.5, cMidY - 3, cLeft, cMidY);
        ctx.quadraticCurveTo(cLeft + 1.5, cMidY + 3, cLeft + 3, cMidY);
        ctx.stroke();

        // Resistor R (Top rail zig-zag)
        const rx = cLeft + (cRight - cLeft) * 0.45;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(rx - 8, cTop - 4, 16, 8);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(rx - 8, cTop);
        ctx.lineTo(rx - 5, cTop - 3);
        ctx.lineTo(rx - 1, cTop + 3);
        ctx.lineTo(rx + 3, cTop - 3);
        ctx.lineTo(rx + 6, cTop + 3);
        ctx.lineTo(rx + 8, cTop);
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('R', rx - 3, cTop - 5);

        // Inductor L (Right rail loops)
        const ly = cMidY;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cRight - 4, ly - 9, 8, 18);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let k = -2; k <= 2; k++) {
          const cy = ly + k * 3;
          ctx.arc(cRight, cy, 3, -Math.PI * 0.5, Math.PI * 0.5, false);
        }
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('L', cRight + 5, ly + 2);

        // Capacitor C (Bottom rail plates)
        const cx = rx;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx - 6, cBot - 5, 12, 10);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx - 3, cBot - 4); ctx.lineTo(cx - 3, cBot + 4);
        ctx.moveTo(cx + 3, cBot - 4); ctx.lineTo(cx + 3, cBot + 4);
        ctx.stroke();
        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('C', cx - 3, cBot + 7);

        // Animated current flow charges (pulsing dots in loop)
        const loopPerim = 2 * (cRight - cLeft + cBot - cTop);
        const flowPos = (t * 40) % loopPerim;
        for (let p = 0; p < 4; p++) {
          const d = (flowPos + (p * loopPerim) / 4) % loopPerim;
          let px = cLeft, py = cTop;
          if (d < cRight - cLeft) {
            px = cLeft + d; py = cTop;
          } else if (d < (cRight - cLeft) + (cBot - cTop)) {
            px = cRight; py = cTop + (d - (cRight - cLeft));
          } else if (d < 2 * (cRight - cLeft) + (cBot - cTop)) {
            px = cRight - (d - (cRight - cLeft + cBot - cTop)); py = cBot;
          } else {
            px = cLeft; py = cBot - (d - (2 * (cRight - cLeft) + cBot - cTop));
          }
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // --- RIGHT: 3 Distinguishable Waveforms (Underdamped, Critical, Overdamped) ---
        const gLeft = splitX + 8;
        const gRight = w - 8;
        const gW = gRight - gLeft;
        const gTop = 8;
        const gBot = h - 8;
        const gH = gBot - gTop;
        const stepTargetY = gTop + gH * 0.35; // Steady-state unity line

        // Target steady-state dashed line
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(gLeft, stepTargetY); ctx.lineTo(gRight, stepTargetY);
        ctx.stroke();
        ctx.setLineDash([]);

        // 1. Underdamped (ζ = 0.2): Oscillatory overshoot decay (Cyan #06b6d4)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const tau = ((x - gLeft) / gW) * 14;
          const resp = 1 - Math.exp(-0.25 * tau) * Math.cos(2.2 * tau);
          const y = gBot - resp * (gBot - stepTargetY);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 2. Critically Damped (ζ = 1.0): Fastest rise without overshoot (Amber #f59e0b)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const tau = ((x - gLeft) / gW) * 7;
          const resp = 1 - (1 + tau) * Math.exp(-tau);
          const y = gBot - resp * (gBot - stepTargetY);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 3. Overdamped (ζ = 2.5): Sluggish exponential (Purple #c084fc)
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const tau = ((x - gLeft) / gW) * 5;
          const resp = 1 - (1.1 * Math.exp(-0.5 * tau) - 0.1 * Math.exp(-2.5 * tau));
          const y = gBot - resp * (gBot - stepTargetY);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Animated probe on underdamped curve
        const scanFrac = (t * 0.4) % 1;
        const scanTau = scanFrac * 14;
        const scanResp = 1 - Math.exp(-0.25 * scanTau) * Math.cos(2.2 * scanTau);
        const scanX = gLeft + scanFrac * gW;
        const scanY = gBot - scanResp * (gBot - stepTargetY);
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(scanX, scanY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Labels / Legend
        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('ζ<1', gRight - 36, gTop + 8);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('ζ=1', gRight - 22, gTop + 8);
        ctx.fillStyle = '#c084fc';
        ctx.fillText('ζ>1', gRight - 8, gTop + 8);

      } else if (type === 'three_phase') {
        // 3-Phase AC Synchronous Motor: 3 coloured phase waveforms + Rotating magnetic field inside motor cross-section
        const splitX = Math.floor(w * 0.48);

        // --- LEFT: 3 Coloured Phase Waveforms (R-Y-B, 120° apart) ---
        const colors = ['#ef4444', '#eab308', '#3b82f6']; // Red, Yellow, Blue phases
        const offsets = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
        const waveMidY = h * 0.5;

        // Zero reference line
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, waveMidY); ctx.lineTo(splitX - 6, waveMidY);
        ctx.stroke();

        colors.forEach((col, idx) => {
          ctx.strokeStyle = col;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let x = 8; x <= splitX - 6; x++) {
            const ang = (x / 14) + t * 2.2 + offsets[idx];
            const y = waveMidY - Math.sin(ang) * (h * 0.32);
            if (x === 8) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });

        // Vertical instantaneous time cursor
        const cursorX = 8 + ((t * 22) % (splitX - 16));
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(cursorX, 6); ctx.lineTo(cursorX, h - 6);
        ctx.stroke();
        ctx.setLineDash([]);

        // Phase labels
        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#ef4444'; ctx.fillText('R', 10, 10);
        ctx.fillStyle = '#eab308'; ctx.fillText('Y', 20, 10);
        ctx.fillStyle = '#3b82f6'; ctx.fillText('B', 30, 10);

        // --- RIGHT: Rotating Magnetic Field Inside Stator Cross-Section ---
        const mCx = splitX + (w - splitX) * 0.5;
        const mCy = h * 0.5;
        const mR = Math.min(20, h * 0.38);

        // Stator Outer Ring
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mCx, mCy, mR + 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 6 Salient Stator Coils (R, B', Y, R', B, Y')
        const currentRot = t * 2.2;
        for (let p = 0; p < 6; p++) {
          const pAng = (p * Math.PI) / 3;
          const px = mCx + Math.cos(pAng) * mR;
          const py = mCy + Math.sin(pAng) * mR;
          const phaseIdx = p % 3;
          const coilCurrent = Math.sin(currentRot + offsets[phaseIdx]);
          ctx.fillStyle = coilCurrent > 0 ? colors[phaseIdx] : '#334155';
          ctx.beginPath();
          ctx.arc(px, py, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Rotor Airgap Circle
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(mCx, mCy, mR - 4, 0, Math.PI * 2);
        ctx.fill();

        // Rotating Magnetic Field Vector (Arrow Bnet)
        const bAng = currentRot;
        const bLen = mR - 6;
        const bTipX = mCx + Math.cos(bAng) * bLen;
        const bTipY = mCy + Math.sin(bAng) * bLen;

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(mCx - Math.cos(bAng) * (bLen * 0.4), mCy - Math.sin(bAng) * (bLen * 0.4));
        ctx.lineTo(bTipX, bTipY);
        ctx.stroke();

        // Rotor N-S Poles aligned with field
        ctx.fillStyle = '#ef4444'; // North
        ctx.beginPath();
        ctx.arc(mCx + Math.cos(bAng) * 4, mCy + Math.sin(bAng) * 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3b82f6'; // South
        ctx.beginPath();
        ctx.arc(mCx - Math.cos(bAng) * 4, mCy - Math.sin(bAng) * 4, 3, 0, Math.PI * 2);
        ctx.fill();

        // Center Shaft
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(mCx, mCy, 2, 0, Math.PI * 2);
        ctx.fill();

        // Rotating field speed badge
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('ωs:RMF', w - 34, 10);

      } else if (type === 'buck_boost') {
        // Buck-Boost DC-DC Switching Regulator: MOSFET switch, Inductor, Diode, Capacitor circuit + Gate pulses & Output voltage
        const splitX = Math.floor(w * 0.52);

        // --- LEFT: Buck-Boost Circuit Topology ---
        const cLeft = 10, cTop = 10, cRight = splitX - 6, cBot = h - 10;

        // Switch State: duty cycle D = 0.6
        const cycle = (t * 3.5) % 1;
        const isSwOn = cycle < 0.6;

        // Input Vin rail
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(cLeft, cTop + 4); ctx.lineTo(cLeft + 14, cTop + 4);
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('+Vin', cLeft - 2, cTop + 1);

        // Power MOSFET Q1 (High side switch)
        const qx = cLeft + 18, qy = cTop + 4;
        ctx.strokeStyle = isSwOn ? '#06b6d4' : '#64748b';
        ctx.lineWidth = 2;
        ctx.strokeRect(qx, qy - 4, 10, 8);
        ctx.fillStyle = isSwOn ? '#06b6d4' : '#64748b';
        ctx.font = 'bold 6px monospace';
        ctx.fillText('MOS', qx + 1, qy + 2);

        // Shunt Storage Inductor L1 (down to ground)
        const lx = qx + 16;
        ctx.strokeStyle = isSwOn ? '#f59e0b' : '#64748b';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(qx + 10, qy);
        ctx.lineTo(lx, qy);
        // Inductor coils downward
        for (let k = 0; k < 3; k++) {
          ctx.arc(lx, qy + 6 + k * 6, 3, -Math.PI * 0.5, Math.PI * 0.5, false);
        }
        ctx.lineTo(lx, cBot);
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('L', lx + 5, qy + 14);

        // Catch Diode D1 (pointing reverse to output for negative buck-boost)
        const dx = lx + 14, dy = qy;
        ctx.strokeStyle = !isSwOn ? '#ec4899' : '#64748b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(lx, dy); ctx.lineTo(dx - 5, dy);
        // Diode symbol (pointing left for negative rail)
        ctx.moveTo(dx - 5, dy - 4); ctx.lineTo(dx + 5, dy); ctx.lineTo(dx - 5, dy + 4); ctx.closePath();
        ctx.moveTo(dx - 5, dy - 5); ctx.lineTo(dx - 5, dy + 5);
        ctx.stroke();
        ctx.fillStyle = !isSwOn ? '#ec4899' : '#64748b';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('D', dx - 2, dy - 5);

        // Output Filter Capacitor C1 & Negative Vout rail
        const cx = cRight - 4;
        ctx.strokeStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(dx + 5, dy); ctx.lineTo(cx, dy);
        ctx.lineTo(cx, dy + 6);
        // Cap plates
        ctx.moveTo(cx - 4, dy + 6); ctx.lineTo(cx + 4, dy + 6);
        ctx.moveTo(cx - 4, dy + 10); ctx.lineTo(cx + 4, dy + 10);
        ctx.lineTo(cx, cBot);
        ctx.lineTo(cLeft, cBot); // Ground return
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('-Vout', cx - 18, dy + 4);

        // Flow packet animation
        const flowDot = (t * 80) % 60;
        ctx.fillStyle = isSwOn ? '#f59e0b' : '#ec4899';
        ctx.beginPath();
        if (isSwOn) {
          ctx.arc(qx + (flowDot % 26), qy, 1.8, 0, Math.PI * 2);
        } else {
          ctx.arc(lx + (flowDot % 24), dy, 1.8, 0, Math.PI * 2);
        }
        ctx.fill();

        // --- RIGHT: Waveforms (PWM Gate, Inductor Ripple Current, Filtered DC Vout) ---
        const gLeft = splitX + 6, gRight = w - 6;

        // 1. Gate Pulses Vgs (Top)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        const pwmPeriod = 22;
        for (let x = gLeft; x <= gRight; x++) {
          const frac = ((x - gLeft + t * 40) % pwmPeriod) / pwmPeriod;
          const y = frac < 0.6 ? 8 : 16;
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 6px monospace';
        ctx.fillText('Vgs(D=60%)', gLeft, 7);

        // 2. Inductor Ripple Current IL(t) (Middle)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const frac = ((x - gLeft + t * 40) % pwmPeriod) / pwmPeriod;
          const y = frac < 0.6 ? 32 - frac * 10 : 26 + (frac - 0.6) * 15;
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 6px monospace';
        ctx.fillText('iL(t)', gLeft, 24);

        // 3. Negative Output DC Voltage with switching ripple (Bottom)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const rip = Math.sin((x / 3) + t * 15) * 1.5;
          const y = h - 8 + rip;
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 6px monospace';
        ctx.fillText('Vo:-18V', gRight - 36, h - 11);

      } else if (type === 'sallen_key') {
        // 2nd-Order Sallen-Key Active Low-Pass Filter: Op-Amp + RC circuit + Frequency response curve (-40 dB/dec rolloff)
        const splitX = Math.floor(w * 0.46);

        // --- LEFT: Sallen-Key 2nd-Order Active RC Circuit ---
        const cLeft = 10;
        const cMidY = h * 0.58;

        // Input Vin -> R1 -> Node A -> R2 -> Op-Amp Non-Inverting (+)
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cLeft, cMidY);
        ctx.lineTo(cLeft + 8, cMidY);
        // Resistor R1
        ctx.lineTo(cLeft + 12, cMidY - 3); ctx.lineTo(cLeft + 16, cMidY + 3);
        ctx.lineTo(cLeft + 20, cMidY - 3); ctx.lineTo(cLeft + 24, cMidY);
        // Node A
        const nodeAx = cLeft + 26;
        ctx.lineTo(nodeAx, cMidY);
        // Resistor R2
        ctx.lineTo(nodeAx + 4, cMidY - 3); ctx.lineTo(nodeAx + 8, cMidY + 3);
        ctx.lineTo(nodeAx + 12, cMidY - 3); ctx.lineTo(nodeAx + 16, cMidY);
        const nonInvX = nodeAx + 20;
        ctx.lineTo(nonInvX, cMidY);
        ctx.stroke();

        // Node A dot
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(nodeAx, cMidY, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Op-Amp Triangle (Right aligned)
        const opX = nonInvX + 6, opY = cMidY - 4;
        const opW = 18, opH = 18;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(opX, opY - opH * 0.5);
        ctx.lineTo(opX + opW, opY);
        ctx.lineTo(opX, opY + opH * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Pin symbols (+ and -)
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('+', opX + 2, opY + 5);
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('-', opX + 2, opY - 2);

        // Feedback Capacitor C1 (from Node A up and over to Vout)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(nodeAx, cMidY);
        ctx.lineTo(nodeAx, 12);
        ctx.lineTo(nodeAx + 14, 12);
        // C1 plates
        ctx.moveTo(nodeAx + 14, 9); ctx.lineTo(nodeAx + 14, 15);
        ctx.moveTo(nodeAx + 17, 9); ctx.lineTo(nodeAx + 17, 15);
        ctx.moveTo(nodeAx + 17, 12);
        ctx.lineTo(opX + opW + 4, 12);
        ctx.lineTo(opX + opW + 4, opY);
        ctx.stroke();

        // Shunt Capacitor C2 (from non-inverting terminal to ground)
        ctx.strokeStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(nonInvX - 2, cMidY);
        ctx.lineTo(nonInvX - 2, cMidY + 8);
        ctx.moveTo(nonInvX - 5, cMidY + 8); ctx.lineTo(nonInvX + 1, cMidY + 8);
        ctx.moveTo(nonInvX - 5, cMidY + 11); ctx.lineTo(nonInvX + 1, cMidY + 11);
        ctx.stroke();

        // Output wire and Unity Gain feedback to inverting (-) input
        ctx.strokeStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(opX + opW, opY);
        ctx.lineTo(opX + opW + 6, opY);
        ctx.lineTo(opX + opW + 6, opY - 9);
        ctx.lineTo(opX - 3, opY - 9);
        ctx.lineTo(opX - 3, opY - 3);
        ctx.lineTo(opX, opY - 3);
        ctx.stroke();

        // Labels
        ctx.font = 'bold 6px monospace';
        ctx.fillStyle = '#f59e0b'; ctx.fillText('R1', cLeft + 12, cMidY - 5);
        ctx.fillText('R2', nodeAx + 4, cMidY - 5);
        ctx.fillStyle = '#06b6d4'; ctx.fillText('C1', nodeAx + 10, 8);

        // --- RIGHT: Frequency Response Bode Plot & -40 dB/dec roll-off ---
        const gLeft = splitX + 8, gRight = w - 8;
        const gW = gRight - gLeft;
        const gTop = 10, gBot = h - 8;
        const gH = gBot - gTop;

        // Grid lines (0 dB baseline and -3 dB line)
        const zeroDbY = gTop + 6;
        const cutY = zeroDbY + gH * 0.28; // -3dB
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gLeft, zeroDbY); ctx.lineTo(gRight, zeroDbY);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(244, 63, 94, 0.35)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(gLeft, cutY); ctx.lineTo(gRight, cutY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Sallen-Key 2nd-order Butterworth Response Curve |H(f)| = 1 / sqrt(1 + (f/fc)^4)
        const cutX = gLeft + gW * 0.42;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const fRatio = (x - gLeft) / (cutX - gLeft);
          const mag = 1 / Math.sqrt(1 + Math.pow(Math.max(0.01, fRatio), 4));
          const y = zeroDbY + (1 - mag) * (gH - 8);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // -3dB Cutoff Point Marker
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(cutX, cutY, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Traveling sweep probe dot
        const sweepX = gLeft + ((t * 24) % gW);
        const sweepFRatio = (sweepX - gLeft) / (cutX - gLeft);
        const sweepMag = 1 / Math.sqrt(1 + Math.pow(Math.max(0.01, sweepFRatio), 4));
        const sweepY = zeroDbY + (1 - sweepMag) * (gH - 8);
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(sweepX, sweepY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Annotations
        ctx.font = 'bold 6px monospace';
        ctx.fillStyle = '#f43f5e'; ctx.fillText('fc (-3dB)', cutX - 16, cutY - 4);
        ctx.fillStyle = '#38bdf8'; ctx.fillText('-40dB/dec', gRight - 42, gBot - 3);

      } else if (type === 'transmission_line') {
        // RF Transmission Line & Reflection Coefficient: Incident and reflected traveling waves + Γ and VSWR
        const splitX = Math.floor(w * 0.64);

        // --- LEFT/CENTER: Two-Conductor Transmission Line & Traveling Wave Interference ---
        const gLeft = 10, gRight = splitX - 6;
        const tMidY = h * 0.5;

        // Conductor Rails (Characteristic Impedance Z0 = 50 Ω)
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gLeft, 8); ctx.lineTo(gRight, 8); // Top signal trace
        ctx.moveTo(gLeft, h - 8); ctx.lineTo(gRight, h - 8); // Bottom ground plane
        ctx.stroke();

        // Source generator Z0
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('Zs=50Ω', gLeft, 18);

        // Terminating Load ZL on right
        ctx.fillStyle = '#f43f5e';
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(gRight - 6, 8, 6, h - 16);
        ctx.font = 'bold 7px monospace';
        ctx.fillText('ZL', gRight - 16, tMidY + 2);

        // Wave Parameters: Γ = 0.5 (Reflection coefficient)
        const gamma = 0.52;
        const kWave = 0.12;

        // 1. Incident Wave V+(x,t) (Cyan, moving right: kx - wt)
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight - 6; x++) {
          const y = tMidY - Math.cos(kWave * x - t * 3.5) * (h * 0.22);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 2. Reflected Wave V-(x,t) (Rose, moving left: kx + wt)
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight - 6; x++) {
          const y = tMidY - gamma * Math.cos(kWave * x + t * 3.5 + Math.PI * 0.7) * (h * 0.22);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 3. Composite Standing Wave |V(x, t)| (Bold Neon Purple #c084fc)
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight - 6; x++) {
          const vFwd = Math.cos(kWave * x - t * 3.5);
          const vRev = gamma * Math.cos(kWave * x + t * 3.5 + Math.PI * 0.7);
          const y = tMidY - (vFwd + vRev) * (h * 0.22);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Standing Wave Envelope (Dotted max / min boundaries)
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.35)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        for (let x = gLeft; x <= gRight - 6; x++) {
          const env = Math.sqrt(1 + gamma * gamma + 2 * gamma * Math.cos(2 * kWave * x + Math.PI * 0.7));
          const yTop = tMidY - env * (h * 0.22);
          if (x === gLeft) ctx.moveTo(x, yTop);
          else ctx.lineTo(x, yTop);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // --- RIGHT: RF Vector Telemetry (Γ Phasor Circle & VSWR Gauge) ---
        const sCx = splitX + (w - splitX) * 0.5;
        const sCy = h * 0.5;
        const sR = Math.min(18, h * 0.36);

        // Smith / Complex Reflection Unit Circle |Γ| <= 1
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(sCx, sCy, sR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sCx - sR, sCy); ctx.lineTo(sCx + sR, sCy);
        ctx.moveTo(sCx, sCy - sR); ctx.lineTo(sCx, sCy + sR);
        ctx.stroke();

        // Reflection Vector Γ phasor
        const gAng = t * 1.8;
        const gLen = sR * gamma;
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sCx, sCy);
        ctx.lineTo(sCx + Math.cos(gAng) * gLen, sCy - Math.sin(gAng) * gLen);
        ctx.stroke();
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(sCx + Math.cos(gAng) * gLen, sCy - Math.sin(gAng) * gLen, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Telemetry Readouts
        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('Γ:0.52', w - 34, 11);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('VSWR:3.2', w - 38, h - 8);

      } else if (type === 'fourier') {
        // Fourier Series Harmonic Decomposition & THD: Animated square wave reconstructed from individual harmonics + THD
        const splitX = Math.floor(w * 0.62);

        // --- LEFT/CENTER: Harmonic Synthesis & Gibbs Ripple ---
        const gLeft = 10, gRight = splitX - 6;
        const fMidY = h * 0.5;

        // Target Ideal Square Wave (Dim dotted line)
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        const sqPeriod = 42;
        for (let x = gLeft; x <= gRight; x++) {
          const phase = ((x - gLeft + t * 24) % sqPeriod) / sqPeriod;
          const y = phase < 0.5 ? fMidY - (h * 0.32) : fMidY + (h * 0.32);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Individual Constituent Harmonics:
        // Fundamental n=1 (Cyan)
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const theta = ((x - gLeft + t * 24) / sqPeriod) * 2 * Math.PI;
          const y = fMidY - (4 / Math.PI) * Math.sin(theta) * (h * 0.28);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 3rd Harmonic n=3 (Amber)
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const theta = ((x - gLeft + t * 24) / sqPeriod) * 2 * Math.PI;
          const y = fMidY - (4 / (3 * Math.PI)) * Math.sin(3 * theta) * (h * 0.28);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Reconstructed Composite Waveform (N=5 harmonics, bold Magenta #ec4899)
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const theta = ((x - gLeft + t * 24) / sqPeriod) * 2 * Math.PI;
          const harmSum = Math.sin(theta) + (1 / 3) * Math.sin(3 * theta) + (1 / 5) * Math.sin(5 * theta);
          const y = fMidY - (4 / Math.PI) * harmSum * (h * 0.28);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // --- RIGHT: Discrete Harmonic Spectrum Bars & THD ---
        const bLeft = splitX + 8, bRight = w - 8;
        const bW = bRight - bLeft;
        const bBot = h - 8;
        const maxBarH = h - 18;

        // Harmonics amplitudes: n=1, 3, 5, 7
        const harms = [
          { n: 1, amp: 1.0, col: '#06b6d4' },
          { n: 3, amp: 0.33, col: '#f59e0b' },
          { n: 5, amp: 0.20, col: '#10b981' },
          { n: 7, amp: 0.14, col: '#a855f7' },
        ];
        const barSlotW = bW / harms.length;

        harms.forEach((hm, idx) => {
          const bx = bLeft + idx * barSlotW + 3;
          const bh = hm.amp * maxBarH;
          ctx.fillStyle = hm.col;
          ctx.fillRect(bx, bBot - bh, barSlotW - 5, bh);
          ctx.font = 'bold 6px monospace';
          ctx.fillText(`${hm.n}f`, bx, bBot + 7);
        });

        // THD Badge
        ctx.fillStyle = '#ec4899';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('THD:11%', bLeft, 8);

      } else if (type === 'four_bar') {
        // Continuous Planar 4-Bar Grashof Kinematics & Coupler Curves
        // Fixed ground pivots O2 and O4
        const O2x = w * 0.22, O2y = h * 0.74;
        const O4x = w * 0.64, O4y = h * 0.74;
        const r1 = O4x - O2x; // Ground frame length ~134px
        const r2 = 14;        // Crank length (shortest link)
        const r3 = 94;        // Coupler link
        const r4 = 52;        // Rocker link

        // Continuous 360-deg crank rotation
        const theta2 = t * 2.2;
        const Ax = O2x + r2 * Math.cos(theta2);
        const Ay = O2y - r2 * Math.sin(theta2);

        // Analytical circle-circle intersection for Rocker Joint B (Freudenstein loop closure)
        const dx = O4x - Ax;
        const dy = O4y - Ay;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let Bx = O4x, By = O4y - r4;
        if (dist > 0 && dist <= r3 + r4 && dist >= Math.abs(r3 - r4)) {
          const a = (r3 * r3 - r4 * r4 + dist * dist) / (2 * dist);
          const hPerp = Math.sqrt(Math.max(0, r3 * r3 - a * a));
          const midX = Ax + (a * dx) / dist;
          const midYPos = Ay + (a * dy) / dist;
          Bx = midX - (hPerp * dy) / dist;
          By = midYPos + (hPerp * dx) / dist;
        }

        // Attached Coupler Tracer Point P
        const mx = (Ax + Bx) * 0.5;
        const my = (Ay + By) * 0.5;
        const clen = Math.max(1, Math.hypot(Bx - Ax, By - Ay));
        const nx = -(By - Ay) / clen;
        const ny = (Bx - Ax) / clen;
        const Px = mx + nx * 16;
        const Py = my + ny * 16;

        // Trace Full Continuous Coupler Trajectory Curve (Neon Pink #ec4899)
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.25)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        const steps = 40;
        for (let s = 0; s <= steps; s++) {
          const ang = (s / steps) * Math.PI * 2;
          const kAx = O2x + r2 * Math.cos(ang);
          const kAy = O2y - r2 * Math.sin(ang);
          const kdx = O4x - kAx, kdy = O4y - kAy;
          const kdist = Math.sqrt(kdx * kdx + kdy * kdy);
          if (kdist > 0 && kdist <= r3 + r4 && kdist >= Math.abs(r3 - r4)) {
            const ka = (r3 * r3 - r4 * r4 + kdist * kdist) / (2 * kdist);
            const khPerp = Math.sqrt(Math.max(0, r3 * r3 - ka * ka));
            const kBx = kAx + (ka * kdx) / kdist - (khPerp * kdy) / kdist;
            const kBy = kAy + (ka * kdy) / kdist + (khPerp * kdx) / kdist;
            const kmx = (kAx + kBx) * 0.5;
            const kmy = (kAy + kBy) * 0.5;
            const kclen = Math.max(1, Math.hypot(kBx - kAx, kBy - kAy));
            const knx = -(kBy - kAy) / kclen;
            const kny = (kBx - kAx) / kclen;
            const kPx = kmx + knx * 16;
            const kPy = kmy + kny * 16;
            if (s === 0) ctx.moveTo(kPx, kPy);
            else ctx.lineTo(kPx, kPy);
          }
        }
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Ground base support line & hatch
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(O2x - 12, O2y); ctx.lineTo(O4x + 12, O4y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ground hatched pivot triangles
        [ [O2x, O2y], [O4x, O4y] ].forEach(([gx, gy]) => {
          ctx.fillStyle = '#1e293b';
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(gx, gy); ctx.lineTo(gx - 6, gy + 8); ctx.lineTo(gx + 6, gy + 8); ctx.closePath();
          ctx.fill(); ctx.stroke();
        });

        // Crank Circle sweep trajectory (dashed amber)
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(O2x, O2y, r2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Coupler Link Triangle body (Cyan #06b6d4)
        ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(Ax, Ay); ctx.lineTo(Bx, By); ctx.lineTo(Px, Py); ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Crank Link (Amber #f59e0b)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(O2x, O2y); ctx.lineTo(Ax, Ay);
        ctx.stroke();

        // Rocker Link (Emerald #10b981)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(O4x, O4y); ctx.lineTo(Bx, By);
        ctx.stroke();

        // Pin Joints (Silver metallic rivets)
        [ [O2x, O2y], [O4x, O4y], [Ax, Ay], [Bx, By] ].forEach(([jx, jy], idx) => {
          ctx.fillStyle = idx < 2 ? '#cbd5e1' : (idx === 2 ? '#fbbf24' : '#34d399');
          ctx.beginPath();
          ctx.arc(jx, jy, 2.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        // Pulsing Coupler Tracer Point P
        const pulse = 3 + Math.sin(t * 6) * 1.5;
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(Px, Py, pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // High-Tech Micro Legends on Right
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('CRANK', w - 74, 14);
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('COUPLER', w - 74, 25);
        ctx.fillStyle = '#10b981';
        ctx.fillText('ROCKER', w - 74, 36);
        ctx.fillStyle = '#ec4899';
        ctx.fillText('TRACE', w - 74, 47);

      } else if (type === 'rankine') {
        // Thermodynamic Rankine Steam Power Cycle with Equipment & Miniature T-s Diagram
        const splitX = w * 0.60;

        // --- LEFT: Plant Equipment & Steam/Water Flow Loop ---
        // Pipe circuit coordinates
        const pLeft = 18, pRight = splitX - 12;
        const pTop = 13, pBot = h - 13;

        // Pipe connecting lines
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 3;
        ctx.strokeRect(pLeft, pTop, pRight - pLeft, pBot - pTop);

        // Boiler (Left, red/amber)
        const bW = 28, bH = h * 0.55;
        const bX = pLeft - 6, bY = midY - bH * 0.5;
        const bGrad = ctx.createLinearGradient(bX, bY, bX + bW, bY + bH);
        bGrad.addColorStop(0, '#f59e0b');
        bGrad.addColorStop(1, '#ef4444');
        ctx.fillStyle = bGrad;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.2;
        ctx.fillRect(bX, bY, bW, bH);
        ctx.strokeRect(bX, bY, bW, bH);

        // Boiler flame burner ripples below
        ctx.fillStyle = '#f97316';
        const flameOffset = Math.sin(t * 8) * 2;
        ctx.beginPath();
        ctx.arc(bX + bW * 0.5 + flameOffset, bY + bH + 2, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('BOIL', bX + 4, bY + bH * 0.6);

        // Turbine (Top Right, expanding casing)
        const tX = pRight - 28, tY = pTop - 8;
        const tW = 26, tH = 16;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(tX, tY + 4);
        ctx.lineTo(tX + tW, tY);
        ctx.lineTo(tX + tW, tY + tH);
        ctx.lineTo(tX, tY + tH - 4);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Spinning turbine rotor blade
        const tRot = t * 6;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tX + tW * 0.5 - 4 * Math.cos(tRot), tY + tH * 0.5 - 4 * Math.sin(tRot));
        ctx.lineTo(tX + tW * 0.5 + 4 * Math.cos(tRot), tY + tH * 0.5 + 4 * Math.sin(tRot));
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 6.5px monospace';
        ctx.fillText('TURB', tX + 4, tY - 1);

        // Condenser (Bottom Right)
        const cX = pRight - 26, cY = pBot - 7;
        const cW = 28, cH = 14;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(cX, cY, cW, cH);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.fillRect(cX, cY, cW, cH);

        // Condenser cooling coil wave
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let cx = cX + 2; cx < cX + cW - 2; cx += 5) {
          ctx.moveTo(cx, cY + 2); ctx.lineTo(cx, cY + cH - 2);
        }
        ctx.stroke();

        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 6.5px monospace';
        ctx.fillText('COND', cX + 4, cY + cH + 7);

        // Feedwater Pump (Bottom Left)
        const pmX = pLeft + 16, pmY = pBot;
        ctx.fillStyle = '#064e3b';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(pmX, pmY, 6, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Pump spinning cross
        const pmRot = t * 5;
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pmX - 4 * Math.cos(pmRot), pmY - 4 * Math.sin(pmRot));
        ctx.lineTo(pmX + 4 * Math.cos(pmRot), pmY + 4 * Math.sin(pmRot));
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 6.5px monospace';
        ctx.fillText('PUMP', pmX - 8, pmY + 11);

        // Animated Flow Particles (Steam = Red/Gold, Water = Cyan)
        const flowTime = (t * 22) % 100;
        // Top steam pipe (Boiler -> Turbine)
        for (let i = 0; i < 3; i++) {
          const fx = bX + bW + ((flowTime + i * 33) % (tX - (bX + bW)));
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(fx, pTop, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        // Down steam exhaust (Turbine -> Condenser)
        for (let i = 0; i < 2; i++) {
          const fy = tY + tH + ((flowTime + i * 50) % (cY - (tY + tH)));
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(pRight, fy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        // Bottom water pipe (Condenser -> Pump)
        for (let i = 0; i < 3; i++) {
          const fx = cX - ((flowTime + i * 33) % (cX - (pmX + 6)));
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.arc(fx, pBot, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        // Vertical return pipe (Pump -> Boiler)
        for (let i = 0; i < 2; i++) {
          const fy = pBot - ((flowTime + i * 50) % (pBot - (bY + bH)));
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(pLeft, fy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // --- RIGHT: Miniature T-s Diagram ---
        const tsLeft = splitX + 8;
        const tsRight = w - 10;
        const tsW = tsRight - tsLeft;
        const tsTop = 10, tsBot = h - 10;
        const tsH = tsBot - tsTop;

        // T-s Axes
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tsLeft, tsTop); ctx.lineTo(tsLeft, tsBot);
        ctx.lineTo(tsRight, tsBot);
        ctx.stroke();

        // Saturation Vapor Dome (Bell curve)
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = tsLeft + 2; x <= tsRight - 2; x++) {
          const nx = (x - (tsLeft + tsW * 0.42)) / (tsW * 0.38);
          const y = tsBot - Math.max(0, 1 - nx * nx) * (tsH * 0.72);
          if (x === tsLeft + 2) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Rankine 1-2-3-4 State Points on T-s
        const s1 = [tsLeft + tsW * 0.88, tsTop + tsH * 0.15]; // Superheated steam
        const s2 = [tsLeft + tsW * 0.88, tsBot - tsH * 0.18]; // Turbine exhaust
        const s3 = [tsLeft + tsW * 0.22, tsBot - tsH * 0.18]; // Saturated water
        const s4 = [tsLeft + tsW * 0.22, tsBot - tsH * 0.28]; // Compressed liquid

        // Cycle boundary (Amber)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(s1[0], s1[1]);
        ctx.lineTo(s2[0], s2[1]);
        ctx.lineTo(s3[0], s3[1]);
        ctx.lineTo(s4[0], s4[1]);
        // Boiler heating curve up through vapor dome
        ctx.quadraticCurveTo(tsLeft + tsW * 0.5, tsTop + tsH * 0.25, s1[0], s1[1]);
        ctx.stroke();

        // Orbiting state tracer dot on T-s curve
        const tsPhase = (t * 2.0) % 4.0;
        let tPt = s1;
        if (tsPhase < 1.0) {
          const f = tsPhase;
          tPt = [s1[0], s1[1] + (s2[1] - s1[1]) * f];
        } else if (tsPhase < 2.0) {
          const f = tsPhase - 1.0;
          tPt = [s2[0] + (s3[0] - s2[0]) * f, s2[1]];
        } else if (tsPhase < 2.5) {
          const f = (tsPhase - 2.0) / 0.5;
          tPt = [s3[0], s3[1] + (s4[1] - s3[1]) * f];
        } else {
          const f = (tsPhase - 2.5) / 1.5;
          tPt = [s4[0] + (s1[0] - s4[0]) * f, s4[1] + (s1[1] - s4[1]) * f];
        }
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(tPt[0], tPt[1], 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('T-s', tsRight - 16, tsTop + 8);

      } else if (type === 'harmonic') {
        // Damped Forced Harmonic Oscillator & Resonance Peak
        const splitX = w * 0.46;

        // Current drive frequency sweeps smoothly through resonance
        const fNorm = 0.4 + 1.3 * (0.5 + 0.5 * Math.sin(t * 0.8)); // 0.4 to 1.7
        const zeta = 0.12;
        const mag = 1 / Math.sqrt(Math.pow(1 - fNorm * fNorm, 2) + Math.pow(2 * zeta * fNorm, 2));
        const amp = Math.min(18, 3 + mag * 3.2);

        // --- LEFT: Physical Mass-Spring-Damper System ---
        const wallX = 14;
        const baseY = midY;
        const massDisp = Math.cos(t * fNorm * 4) * amp;
        const massX = 72 + massDisp;
        const massW = 24, massH = 24;

        // Ground/Wall support
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(wallX, baseY - 20); ctx.lineTo(wallX, baseY + 20);
        ctx.stroke();

        // Wall hatch marks
        for (let y = baseY - 18; y <= baseY + 18; y += 6) {
          ctx.beginPath();
          ctx.moveTo(wallX - 6, y + 4); ctx.lineTo(wallX, y);
          ctx.stroke();
        }

        // Helical Spring k (Top half)
        const spY = baseY - 7;
        const spStartX = wallX;
        const spEndX = massX;
        const spLen = spEndX - spStartX;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(spStartX, spY);
        const coils = 6;
        for (let c = 1; c <= coils; c++) {
          const cx = spStartX + (c - 0.5) * (spLen / coils);
          const cy = spY + (c % 2 === 1 ? -6 : 6);
          ctx.lineTo(cx, cy);
        }
        ctx.lineTo(spEndX, spY);
        ctx.stroke();

        // Dashpot Damper c (Bottom half)
        const dpY = baseY + 7;
        const cylW = 24, cylH = 10;
        const cylX = wallX + 6;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        // Cylinder housing
        ctx.strokeRect(cylX, dpY - cylH * 0.5, cylW, cylH);
        // Moving piston & rod
        const rodEndX = massX;
        const pistonX = Math.min(cylX + cylW - 2, Math.max(cylX + 2, cylX + 10 + massDisp * 0.5));
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(pistonX - 2, dpY - cylH * 0.4, 4, cylH * 0.8);
        ctx.beginPath();
        ctx.moveTo(pistonX, dpY); ctx.lineTo(rodEndX, dpY);
        ctx.stroke();

        // Moving Mass Block M
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = fNorm > 0.95 && fNorm < 1.05 ? '#ef4444' : '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.fillRect(massX, baseY - massH * 0.5, massW, massH);
        ctx.strokeRect(massX, baseY - massH * 0.5, massW, massH);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('m', massX + 8, baseY + 3);

        // External Driving Force Arrow F(t)
        const forceX = massX + massW + 4;
        const forceLen = Math.cos(t * fNorm * 4) * 12;
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(forceX, baseY); ctx.lineTo(forceX + forceLen, baseY);
        ctx.stroke();

        // --- RIGHT: Resonance Peak & Frequency Response ---
        const gLeft = splitX + 8;
        const gRight = w - 10;
        const gW = gRight - gLeft;
        const gBot = h - 12;
        const gH = h * 0.72;

        // Frequency axes
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gLeft, 10); ctx.lineTo(gLeft, gBot);
        ctx.lineTo(gRight, gBot);
        ctx.stroke();

        // Analytical Resonance Peak Curve M(w)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const rVal = ((x - gLeft) / gW) * 2.0; // 0 to 2.0
          const mVal = 1 / Math.sqrt(Math.pow(1 - rVal * rVal, 2) + Math.pow(2 * zeta * rVal, 2));
          const y = gBot - Math.min(1.0, mVal / 4.4) * gH;
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Resonance frequency marker line (r = 1.0)
        const r1X = gLeft + 0.5 * gW;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(r1X, 10); ctx.lineTo(r1X, gBot);
        ctx.stroke();
        ctx.setLineDash([]);

        // Sliding Operating Point dot on resonance curve
        const opX = gLeft + (fNorm / 2.0) * gW;
        const opY = gBot - Math.min(1.0, mag / 4.4) * gH;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(opX, opY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('RESONANCE', gRight - 46, 12);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('ω=ωn', r1X - 10, gBot + 9);

      } else if (type === 'spur_gear') {
        // Involute Spur Gear Mesh Dynamics & Backlash Clearance
        const c1x = w * 0.34, c1y = midY;
        const c2x = w * 0.66, c2y = midY;
        const r1 = 22; // Pinion pitch radius
        const r2 = 34; // Gear pitch radius
        const z1 = 12; // Pinion teeth
        const z2 = 18; // Gear teeth

        const rot1 = t * 1.5;
        const rot2 = -rot1 * (z1 / z2) + 0.16; // Add subtle backlash phase shift

        // Function to draw realistic gear with teeth
        const drawGear = (cx: number, cy: number, rPitch: number, teeth: number, rotAngle: number, color: string) => {
          const rBase = rPitch * 0.94;
          const rAdd = rPitch + 5;
          const rDed = rPitch - 5;
          const halfTooth = (Math.PI * 2) / teeth / 4;

          ctx.strokeStyle = color;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
          ctx.lineWidth = 1.8;
          ctx.beginPath();

          for (let i = 0; i < teeth; i++) {
            const angle = rotAngle + (i * Math.PI * 2) / teeth;
            const a1 = angle - halfTooth * 1.3;
            const a2 = angle - halfTooth * 0.7;
            const a3 = angle + halfTooth * 0.7;
            const a4 = angle + halfTooth * 1.3;

            const p1x = cx + rDed * Math.cos(a1), p1y = cy + rDed * Math.sin(a1);
            const p2x = cx + rAdd * Math.cos(a2), p2y = cy + rAdd * Math.sin(a2);
            const p3x = cx + rAdd * Math.cos(a3), p3y = cy + rAdd * Math.sin(a3);
            const p4x = cx + rDed * Math.cos(a4), p4y = cy + rDed * Math.sin(a4);

            if (i === 0) ctx.moveTo(p1x, p1y);
            else ctx.lineTo(p1x, p1y);
            ctx.lineTo(p2x, p2y);
            ctx.lineTo(p3x, p3y);
            ctx.lineTo(p4x, p4y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Hub center & spokes
          ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
          ctx.lineWidth = 1.2;
          for (let s = 0; s < 4; s++) {
            const sa = rotAngle + (s * Math.PI) / 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + (rPitch - 6) * Math.cos(sa), cy + (rPitch - 6) * Math.sin(sa));
            ctx.stroke();
          }
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.arc(cx, cy, 4, 0, Math.PI * 2);
          ctx.fill();
        };

        // Draw Driving Pinion (Amber) and Driven Gear (Cyan)
        drawGear(c1x, c1y, r1, z1, rot1, '#f59e0b');
        drawGear(c2x, c2y, r2, z2, rot2, '#06b6d4');

        // Pitch Point & 20-deg Line of Action
        const pitchX = c1x + (c2x - c1x) * (r1 / (r1 + r2));
        const pitchY = midY;
        const loAngle = 20 * (Math.PI / 180);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pitchX - 24 * Math.cos(loAngle), pitchY + 24 * Math.sin(loAngle));
        ctx.lineTo(pitchX + 24 * Math.cos(loAngle), pitchY - 24 * Math.sin(loAngle));
        ctx.stroke();

        // Active Tooth Contact Point Spark (Driving side)
        const contactX = pitchX + 4 * Math.cos(t * 5);
        const contactY = pitchY - 4 * Math.sin(t * 5);
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(contactX, contactY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Visible Backlash Clearance Highlight
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(pitchX - 3, pitchY + 4, 4, 0, Math.PI * 0.8);
        ctx.stroke();

        // Micro Legends
        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('PINION z=12', 12, 12);
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('GEAR z=18', w - 60, 12);
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('CONTACT', pitchX - 16, h - 6);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('BACKLASH jt', pitchX - 22, 10);

      } else if (type === 'beam_deflection') {
        // Euler-Bernoulli Beam Deflection, Shear (SFD) & Bending Moment (BMD)
        const beamStartX = 18, beamEndX = w - 18;
        const beamSpan = beamEndX - beamStartX;
        const loadX = beamStartX + beamSpan * 0.45; // Concentrated load P at 45% span
        const baseBeamY = 16;

        // Pinned Support at Left (Triangle)
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(beamStartX, baseBeamY + 3);
        ctx.lineTo(beamStartX - 6, baseBeamY + 11);
        ctx.lineTo(beamStartX + 6, baseBeamY + 11);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Roller Support at Right (Circle Rollers + Plate)
        ctx.beginPath();
        ctx.arc(beamEndX - 3, baseBeamY + 7, 3, 0, Math.PI * 2);
        ctx.arc(beamEndX + 3, baseBeamY + 7, 3, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.strokeRect(beamEndX - 7, baseBeamY + 10, 14, 2);

        // Ground Hatch Marks under supports
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        for (let x = beamStartX - 8; x <= beamStartX + 8; x += 4) {
          ctx.beginPath(); ctx.moveTo(x, baseBeamY + 14); ctx.lineTo(x - 3, baseBeamY + 17); ctx.stroke();
        }
        for (let x = beamEndX - 8; x <= beamEndX + 8; x += 4) {
          ctx.beginPath(); ctx.moveTo(x, baseBeamY + 14); ctx.lineTo(x - 3, baseBeamY + 17); ctx.stroke();
        }

        // Concentrated Load Arrow P (Crimson)
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(loadX, 3); ctx.lineTo(loadX, baseBeamY - 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(loadX, baseBeamY);
        ctx.lineTo(loadX - 3.5, baseBeamY - 5);
        ctx.lineTo(loadX + 3.5, baseBeamY - 5);
        ctx.closePath();
        ctx.fill();

        // Uniform Distributed Load UDL (small arrows across top)
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 1;
        for (let x = beamStartX + 8; x < beamEndX - 8; x += 18) {
          if (Math.abs(x - loadX) > 10) {
            ctx.beginPath();
            ctx.moveTo(x, 7); ctx.lineTo(x, baseBeamY - 2);
            ctx.stroke();
          }
        }

        // Curved Deflected Elastic Beam Centroidal Axis w(x) (Neon Pink)
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        const maxDelta = 7.5;
        for (let x = beamStartX; x <= beamEndX; x++) {
          const xi = (x - beamStartX) / beamSpan;
          // Analytical deflection curve shape for simply supported beam under point load
          const delta = xi < 0.45
            ? maxDelta * (xi / 0.45) * (1 - 0.3 * xi * xi)
            : maxDelta * ((1 - xi) / 0.55) * (1 - 0.3 * (1 - xi) * (1 - xi));
          const y = baseBeamY + delta;
          if (x === beamStartX) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // --- Miniature Diagrams at Bottom ---
        // Left: Shear Force Diagram (SFD)
        const sfdLeft = 18, sfdRight = w * 0.46;
        const sfdW = sfdRight - sfdLeft;
        const sfdMidY = h - 10;
        const sfdLoadX = sfdLeft + sfdW * 0.45;

        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sfdLeft, sfdMidY); ctx.lineTo(sfdRight, sfdMidY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(sfdLeft, sfdMidY);
        ctx.lineTo(sfdLeft, sfdMidY - 6);
        ctx.lineTo(sfdLoadX, sfdMidY - 6);
        ctx.lineTo(sfdLoadX, sfdMidY + 5);
        ctx.lineTo(sfdRight, sfdMidY + 5);
        ctx.lineTo(sfdRight, sfdMidY);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Right: Bending Moment Diagram (BMD)
        const bmdLeft = w * 0.54, bmdRight = w - 18;
        const bmdW = bmdRight - bmdLeft;
        const bmdBaseY = h - 6;
        const bmdLoadX = bmdLeft + bmdW * 0.45;

        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bmdLeft, bmdBaseY); ctx.lineTo(bmdRight, bmdBaseY);
        ctx.stroke();

        ctx.fillStyle = 'rgba(6, 182, 212, 0.18)';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(bmdLeft, bmdBaseY);
        ctx.lineTo(bmdLoadX, bmdBaseY - 10);
        ctx.lineTo(bmdRight, bmdBaseY);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Engineering Labels
        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('P (45kN)', loadX - 12, 6);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('SFD (V)', sfdLeft + 2, sfdMidY - 7);
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('BMD (Mmax)', bmdLoadX - 16, bmdBaseY - 11);

      } else if (type === 'truss') {
        // 2D Warren Truss Bridge with Moving Truck Live Load & Stress Color-Coding
        const bStartX = 20, bEndX = w - 20;
        const bSpan = bEndX - bStartX;
        const bBotY = h - 13;
        const bTopY = 12;
        const numPanels = 6;
        const panelW = bSpan / numPanels;

        // Bottom Deck Nodes (L0 to L6)
        const lowerNodes: [number, number][] = [];
        for (let i = 0; i <= numPanels; i++) {
          lowerNodes.push([bStartX + i * panelW, bBotY]);
        }

        // Top Chord Nodes (U1 to U5)
        const upperNodes: [number, number][] = [];
        for (let i = 1; i <= numPanels; i++) {
          upperNodes.push([bStartX + (i - 0.5) * panelW, bTopY]);
        }

        // Moving Truck Load Position across lower deck chord
        const truckProgress = (t * 0.3) % 1.0;
        const truckX = bStartX + truckProgress * bSpan;
        const truckPanel = Math.min(numPanels - 1, Math.floor(truckProgress * numPanels));

        // Draw Members with Dynamic Axial Tension (Cyan) & Compression (Amber/Red)
        // 1. Bottom Chord (Predominantly Tension #06b6d4)
        for (let i = 0; i < numPanels; i++) {
          const isMid = i === 2 || i === 3;
          ctx.strokeStyle = isMid ? '#06b6d4' : '#38bdf8';
          ctx.lineWidth = isMid ? 3.0 : 2.2;
          ctx.beginPath();
          ctx.moveTo(lowerNodes[i][0], lowerNodes[i][1]);
          ctx.lineTo(lowerNodes[i + 1][0], lowerNodes[i + 1][1]);
          ctx.stroke();
        }

        // 2. Top Chord (Predominantly Compression #f59e0b)
        for (let i = 0; i < upperNodes.length - 1; i++) {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3.2;
          ctx.beginPath();
          ctx.moveTo(upperNodes[i][0], upperNodes[i][1]);
          ctx.lineTo(upperNodes[i + 1][0], upperNodes[i + 1][1]);
          ctx.stroke();
        }

        // 3. Web Diagonals (Warren Web Pattern)
        for (let i = 0; i < numPanels; i++) {
          // Diagonal 1: Lower[i] to Upper[i]
          const isComp1 = i < truckPanel;
          ctx.strokeStyle = isComp1 ? '#f59e0b' : '#06b6d4';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(lowerNodes[i][0], lowerNodes[i][1]);
          ctx.lineTo(upperNodes[i][0], upperNodes[i][1]);
          ctx.stroke();

          // Diagonal 2: Upper[i] to Lower[i+1]
          const isComp2 = i >= truckPanel;
          ctx.strokeStyle = isComp2 ? '#f59e0b' : '#06b6d4';
          ctx.beginPath();
          ctx.moveTo(upperNodes[i][0], upperNodes[i][1]);
          ctx.lineTo(lowerNodes[i + 1][0], lowerNodes[i + 1][1]);
          ctx.stroke();
        }

        // Supports
        // Left Pin
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(lowerNodes[0][0], lowerNodes[0][1]);
        ctx.lineTo(lowerNodes[0][0] - 5, lowerNodes[0][1] + 8);
        ctx.lineTo(lowerNodes[0][0] + 5, lowerNodes[0][1] + 8);
        ctx.closePath();
        ctx.fill();

        // Right Roller
        ctx.beginPath();
        ctx.arc(lowerNodes[numPanels][0], lowerNodes[numPanels][1] + 4, 3, 0, Math.PI * 2);
        ctx.fill();

        // Gusset Pin Joints (Rivets)
        [...lowerNodes, ...upperNodes].forEach(([nx, ny]) => {
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.arc(nx, ny, 2.2, 0, Math.PI * 2);
          ctx.fill();
        });

        // Moving Truck Load Indicator (Rose #f43f5e)
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(truckX - 8, bBotY - 8, 16, 6);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(truckX - 4, bBotY - 1, 2, 0, Math.PI * 2);
        ctx.arc(truckX + 4, bBotY - 1, 2, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Downward Axle Force Arrow
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(truckX, bBotY - 14); ctx.lineTo(truckX, bBotY - 9);
        ctx.stroke();

        // Micro Legend
        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('COMP (C)', bStartX + 4, 9);
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('TENS (T)', bEndX - 44, 9);
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('AASHTO TRUCK', w * 0.42, 9);

      } else if (type === 'seismic') {
        // Seismic Base Isolation: Comparative Fixed-Base vs Isolated Building
        const gShake = Math.sin(t * 3.4) * 6; // Ground seismic shear displacement
        const bGroundY = h - 10;

        // Ground Bedrock Foundation Line
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(10, bGroundY); ctx.lineTo(w - 10, bGroundY);
        ctx.stroke();

        // --- LEFT: Fixed-Base Building (Non-Isolated, High Drift) ---
        const fbBaseX = w * 0.28 + gShake;
        const bW = 34;
        const storyH = 10;
        const numStories = 4;

        // Fixed Ground Connection Plate
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(fbBaseX - bW * 0.5, bGroundY - 3, bW, 4);

        // Frame columns flexing with whipping inter-story drift (S-curve deformation)
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.6;
        for (let s = 1; s <= numStories; s++) {
          const prevDrift = Math.pow((s - 1) / numStories, 1.4) * (-gShake * 1.8);
          const curDrift = Math.pow(s / numStories, 1.4) * (-gShake * 1.8);
          const sy = bGroundY - s * storyH;
          const py = bGroundY - (s - 1) * storyH;

          // Columns
          ctx.beginPath();
          ctx.moveTo(fbBaseX - bW * 0.5 + prevDrift, py);
          ctx.quadraticCurveTo(fbBaseX - bW * 0.5 + (prevDrift + curDrift) * 0.5, (py + sy) * 0.5, fbBaseX - bW * 0.5 + curDrift, sy);
          ctx.moveTo(fbBaseX + bW * 0.5 + prevDrift, py);
          ctx.quadraticCurveTo(fbBaseX + bW * 0.5 + (prevDrift + curDrift) * 0.5, (py + sy) * 0.5, fbBaseX + bW * 0.5 + curDrift, sy);
          ctx.stroke();

          // Floor Slabs
          ctx.strokeStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.moveTo(fbBaseX - bW * 0.5 + curDrift, sy);
          ctx.lineTo(fbBaseX + bW * 0.5 + curDrift, sy);
          ctx.stroke();
        }

        // Stress warning at fixed base
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(fbBaseX, bGroundY - 5, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // --- RIGHT: Base-Isolated Building (Lead-Rubber Bearing LRB) ---
        const isoBaseX = w * 0.72 + gShake;
        const isoFloorX = w * 0.72 + gShake * 0.15; // Building stays nearly still

        // Lead-Rubber Bearing (LRB) Layer (Shear Deformation absorbs 80%+)
        const lrbW = 16, lrbH = 8;
        const lrbLeftX = isoBaseX - bW * 0.4;
        const lrbRightX = isoBaseX + bW * 0.4;
        const lrbTopLeftX = isoFloorX - bW * 0.4;
        const lrbTopRightX = isoFloorX + bW * 0.4;

        // Elastomeric Rubber Bearings
        [ [lrbLeftX, lrbTopLeftX], [lrbRightX, lrbTopRightX] ].forEach(([botX, topX]) => {
          ctx.fillStyle = '#10b981';
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(botX - lrbW * 0.5, bGroundY - 2);
          ctx.lineTo(topX - lrbW * 0.5, bGroundY - lrbH - 2);
          ctx.lineTo(topX + lrbW * 0.5, bGroundY - lrbH - 2);
          ctx.lineTo(botX + lrbW * 0.5, bGroundY - 2);
          ctx.closePath();
          ctx.fill(); ctx.stroke();

          // Central Lead Yielding Core (Amber)
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(botX - 2, bGroundY - 2);
          ctx.lineTo(topX - 2, bGroundY - lrbH - 2);
          ctx.lineTo(topX + 2, bGroundY - lrbH - 2);
          ctx.lineTo(botX + 2, bGroundY - 2);
          ctx.closePath();
          ctx.fill();
        });

        // Isolated Superstructure (Translates purely as a rigid body with minimal drift)
        const isoStartY = bGroundY - lrbH - 2;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.8;
        for (let s = 1; s <= numStories; s++) {
          const sy = isoStartY - s * storyH;
          const py = isoStartY - (s - 1) * storyH;

          // Straight Rigid Columns
          ctx.beginPath();
          ctx.moveTo(isoFloorX - bW * 0.5, py); ctx.lineTo(isoFloorX - bW * 0.5, sy);
          ctx.moveTo(isoFloorX + bW * 0.5, py); ctx.lineTo(isoFloorX + bW * 0.5, sy);
          ctx.stroke();

          // Floor Slabs
          ctx.strokeStyle = '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(isoFloorX - bW * 0.5, sy); ctx.lineTo(isoFloorX + bW * 0.5, sy);
          ctx.stroke();
        }

        // Labels
        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('FIXED (HIGH DRIFT)', 14, 11);
        ctx.fillStyle = '#10b981';
        ctx.fillText('LRB ISOLATED (85% SAFE)', w * 0.54, 11);

      } else if (type === 'mohr_circle') {
        // Mohr’s Circle of Stress & Soil Shear Slip Failure Envelope
        const splitX = w * 0.44;

        // --- LEFT: Stressed 2D Soil/Material Element undergoing rotation ---
        const elemX = splitX * 0.5, elemY = midY;
        const elemS = 22;
        const rotTheta = t * 1.2;

        ctx.save();
        ctx.translate(elemX, elemY);
        ctx.rotate(rotTheta);

        // Stressed Cube
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-elemS * 0.5, -elemS * 0.5, elemS, elemS);
        ctx.strokeRect(-elemS * 0.5, -elemS * 0.5, elemS, elemS);

        // Normal Stresses sigma_x and sigma_y (Cyan arrows)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.6;
        // sigma_x outward
        ctx.beginPath();
        ctx.moveTo(elemS * 0.5, 0); ctx.lineTo(elemS * 0.5 + 8, 0);
        ctx.moveTo(-elemS * 0.5, 0); ctx.lineTo(-elemS * 0.5 - 8, 0);
        // sigma_y outward
        ctx.moveTo(0, -elemS * 0.5); ctx.lineTo(0, -elemS * 0.5 - 8);
        ctx.moveTo(0, elemS * 0.5); ctx.lineTo(0, elemS * 0.5 + 8);
        ctx.stroke();

        // In-plane Shear Stress tau_xy (Amber arrows along faces)
        ctx.strokeStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(-elemS * 0.4, -elemS * 0.5 - 3); ctx.lineTo(elemS * 0.4, -elemS * 0.5 - 3);
        ctx.moveTo(elemS * 0.5 + 3, -elemS * 0.4); ctx.lineTo(elemS * 0.5 + 3, elemS * 0.4);
        ctx.stroke();

        // Slip Failure Plane (Dashed Rose)
        ctx.strokeStyle = '#f43f5e';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(-elemS * 0.5, elemS * 0.5); ctx.lineTo(elemS * 0.5, -elemS * 0.5);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();

        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('ELEMENT (σ,τ)', 8, 10);

        // --- RIGHT: Mohr's Circle & Coulomb Failure Envelope ---
        const gLeft = splitX + 8;
        const gRight = w - 10;
        const gW = gRight - gLeft;
        const gBot = h - 11;
        const gH = h * 0.72;
        const cCenterY = midY;

        // Coordinate axes (sigma horizontal, tau vertical)
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gLeft, cCenterY); ctx.lineTo(gRight, cCenterY);
        ctx.moveTo(gLeft + 12, 10); ctx.lineTo(gLeft + 12, gBot);
        ctx.stroke();

        // Mohr Circle Center and Radius
        const cRadius = 18;
        const cCenterX = gLeft + 12 + gW * 0.48;

        // Mohr-Coulomb Failure Envelope: tau = c + sigma * tan(phi) (Amber)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(gLeft + 12, cCenterY - 14); // Cohesion intercept c
        ctx.lineTo(gRight, cCenterY - 24);
        ctx.stroke();

        // Mohr Stress Circle (Sky Blue)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(cCenterX, cCenterY, cRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Principal Stresses sigma_1 and sigma_2 on baseline
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(cCenterX + cRadius, cCenterY, 3, 0, Math.PI * 2); // sigma_1
        ctx.arc(cCenterX - cRadius, cCenterY, 3, 0, Math.PI * 2); // sigma_2
        ctx.fill();

        // Rotating state point on Mohr Circle
        const ptSigma = cCenterX + cRadius * Math.cos(rotTheta * 2);
        const ptTau = cCenterY - cRadius * Math.sin(rotTheta * 2);
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(ptSigma, ptTau, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Micro Legend
        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText("MOHR'S CIRCLE", gLeft + 22, 11);
        ctx.fillStyle = '#10b981';
        ctx.fillText('σ1', cCenterX + cRadius - 4, cCenterY + 10);
        ctx.fillStyle = '#10b981';
        ctx.fillText('σ2', cCenterX - cRadius - 4, cCenterY + 10);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('τ = c+σ tanφ', gRight - 54, 11);

      } else if (type === 'pid') {
        // Industrial Closed-Loop PID Tuning & Anti-Windup Process Loop
        const splitX = w * 0.48;

        // --- LEFT: Industrial Process Vessel, Control Valve, Transmitter & Controller ---
        // Cylindrical Process Tank
        const tX = 48, tY = 12, tW = 32, tH = h - 26;
        const liquidLevel = 0.65 + 0.05 * Math.sin(t * 1.5);

        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.fillRect(tX, tY, tW, tH);
        ctx.strokeRect(tX, tY, tW, tH);

        // Process Liquid inside tank
        ctx.fillStyle = 'rgba(6, 182, 212, 0.35)';
        const lH = tH * liquidLevel;
        ctx.fillRect(tX + 1, tY + tH - lH, tW - 2, lH);

        // Inflow Pipe & Control Valve (Left)
        const vX = 22, vY = tY + 8;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(10, vY); ctx.lineTo(tX, vY);
        ctx.stroke();

        // Valve Body & Actuator
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(vX - 5, vY - 4); ctx.lineTo(vX + 5, vY - 4);
        ctx.lineTo(vX - 5, vY + 4); ctx.lineTo(vX + 5, vY + 4);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Actuator dome
        ctx.strokeRect(vX - 4, vY - 10, 8, 5);

        // Level Transmitter (LT) mounted on tank side (Right)
        const ltX = tX + tW + 6, ltY = tY + tH * 0.4;
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(ltX, ltY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(tX + tW, ltY); ctx.lineTo(ltX, ltY);
        ctx.stroke();

        // Industrial PID Controller Block (Bottom)
        const cX = 16, cY = h - 12;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.2;
        ctx.fillRect(cX, cY - 2, splitX - 26, 11);
        ctx.strokeRect(cX, cY - 2, splitX - 26, 11);

        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#10b981';
        ctx.fillText('PID CTRL [SP:65% PV:65%]', cX + 4, cY + 6);

        // Telemetry Signals (dashed P&ID control lines)
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        // LT to Controller
        ctx.moveTo(ltX, ltY + 4); ctx.lineTo(ltX, cY); ctx.lineTo(cX + splitX - 26, cY);
        // Controller to Valve
        ctx.moveTo(vX, cY - 2); ctx.lineTo(vX, vY + 4);
        ctx.stroke();
        ctx.setLineDash([]);

        // --- RIGHT: DCS Process Trend Window (SP vs PV) ---
        const trLeft = splitX + 8;
        const trRight = w - 10;
        const trW = trRight - trLeft;
        const trBot = h - 12;
        const trH = h * 0.72;

        ctx.fillStyle = '#050a14';
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.fillRect(trLeft, 10, trW, trH);
        ctx.strokeRect(trLeft, 10, trW, trH);

        // Scope Grid
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
        for (let y = 10 + trH * 0.25; y < 10 + trH; y += trH * 0.25) {
          ctx.beginPath(); ctx.moveTo(trLeft, y); ctx.lineTo(trRight, y); ctx.stroke();
        }

        // Setpoint (SP) Line (Cyan Dashed)
        const spY = trBot - trH * 0.65;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(trLeft, spY); ctx.lineTo(trRight, spY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Process Variable (PV) Response Curve (Solid Emerald with Anti-Windup Smooth Settling)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = trLeft; x <= trRight; x++) {
          const tau = (x - trLeft) / (trW * 0.55);
          // Realistic first-order plus dead time PID step response with gentle anti-windup settling
          const pvNorm = tau < 0.1 ? 0 : 0.65 * (1 - Math.exp(-3.5 * (tau - 0.1)) * Math.cos((tau - 0.1) * 4.5));
          const y = trBot - Math.min(trH * 0.95, pvNorm * trH);
          if (x === trLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Pulsing Live Operating PV Dot
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(trRight - 2, spY, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('SP (Cyan)', trLeft + 4, 8);
        ctx.fillStyle = '#10b981';
        ctx.fillText('PV (Emerald)', trLeft + 52, 8);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('ANTI-WINDUP', trRight - 54, 8);

      } else if (type === 'control_valve') {
        // Pneumatic Control Valve Flow Cv & Cavitation Phenomena
        const splitX = w * 0.52;

        // --- LEFT: Cutaway Industrial Globe Control Valve Body & Actuator ---
        const vBodyX = 22, vBodyW = splitX - 32;
        const pipeY = midY + 4;
        const throatW = 14, throatH = 14;

        // Upstream and Downstream Flanged Pipe Body
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(10, pipeY - 10); ctx.lineTo(vBodyX + 8, pipeY - 10);
        ctx.lineTo(vBodyX + vBodyW * 0.5 - throatW * 0.5, pipeY - 2);
        ctx.lineTo(vBodyX + vBodyW * 0.5 + throatW * 0.5, pipeY - 2);
        ctx.lineTo(vBodyX + vBodyW - 8, pipeY - 10);
        ctx.lineTo(splitX - 6, pipeY - 10);
        ctx.lineTo(splitX - 6, pipeY + 10);
        ctx.lineTo(vBodyX + vBodyW - 8, pipeY + 10);
        ctx.lineTo(vBodyX + vBodyW * 0.5 + throatW * 0.5, pipeY + 4);
        ctx.lineTo(vBodyX + vBodyW * 0.5 - throatW * 0.5, pipeY + 4);
        ctx.lineTo(vBodyX + 8, pipeY + 10);
        ctx.lineTo(10, pipeY + 10);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Pneumatic Diaphragm Actuator Dome (Top)
        const actX = vBodyX + vBodyW * 0.5;
        const actY = 8;
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(actX, actY + 4, 12, Math.PI, 0);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Valve Stem Position reciprocating smoothly
        const stemLift = 4 + Math.sin(t * 2.5) * 3;
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(actX, actY + 4); ctx.lineTo(actX, pipeY - 8 + stemLift);
        ctx.stroke();

        // Parabolic Contoured Valve Plug
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(actX - 5, pipeY - 8 + stemLift);
        ctx.lineTo(actX + 5, pipeY - 8 + stemLift);
        ctx.lineTo(actX, pipeY - 1 + stemLift);
        ctx.closePath();
        ctx.fill();

        // High-Speed Liquid Flow Streamlines (Emerald)
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(12, pipeY); ctx.lineTo(actX - 6, pipeY);
        ctx.lineTo(actX + 6, pipeY); ctx.lineTo(splitX - 8, pipeY);
        ctx.stroke();

        // Cavitation Vapor Bubbles forming at Vena Contracta and Collapsing Downstream!
        const cavTime = (t * 28) % 30;
        for (let i = 0; i < 4; i++) {
          const bx = actX + 4 + ((cavTime + i * 8) % (splitX - 12 - actX));
          const by = pipeY + (Math.sin(i * 2 + t * 5) * 3.5);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
          ctx.fill();

          // Bubble collapse implosion shockwave (Crimson)
          if (bx > actX + 16) {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('DIAPHRAGM', actX - 18, 5);

        // --- RIGHT: Differential Pressure & Cavitation Index Gauges ---
        const gLeft = splitX + 8;
        const gRight = w - 10;
        const gW = gRight - gLeft;

        // P1 & P2 Industrial Pressure Bar Meters
        const p1Val = 6.0, p2Val = 2.0; // High delta P -> Cavitation
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
        ctx.strokeRect(gLeft, 14, gW, 8);
        ctx.strokeRect(gLeft, 27, gW, 8);

        // P1 Upstream Bar (Cyan)
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(gLeft + 1, 15, (gW - 2) * (p1Val / 10), 6);
        // P2 Downstream Bar (Amber)
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(gLeft + 1, 28, (gW - 2) * (p2Val / 10), 6);

        // Flashing Cavitation Warning Box
        ctx.fillStyle = '#7f1d1d';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.2;
        ctx.fillRect(gLeft, 40, gW, 11);
        ctx.strokeRect(gLeft, 40, gW, 11);

        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('P1: 6.0 bar', gLeft + 2, 11);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('P2: 2.0 bar', gLeft + 2, 25);
        ctx.fillStyle = '#fecaca';
        ctx.fillText('⚠ CAVITATION CHOKE', gLeft + 4, 48);

      } else if (type === 'current_loop') {
        // 4-20mA Current Loop Transmitter, 24V Supply & Burden Resistor
        const lLeft = 20, lRight = w - 20;
        const lTop = 13, lBot = h - 13;

        // Industrial 2-Wire Loop Circuit Wires
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.strokeRect(lLeft, lTop, lRight - lLeft, lBot - lTop);

        // 1. Regulated 24V DC Loop Power Supply (Top Left)
        const psW = 34, psH = 16;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.4;
        ctx.fillRect(lLeft - 6, lTop - 8, psW, psH);
        ctx.strokeRect(lLeft - 6, lTop - 8, psW, psH);

        // Power Supply LED
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(lLeft + psW - 12, lTop - 2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('24VDC', lLeft - 2, lTop + 3);

        // 2. Smart Field Transmitter with Digital LCD (Right Side)
        const trX = lRight - 28, trY = midY - 14;
        const trW = 32, trH = 28;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.6;
        ctx.fillRect(trX, trY, trW, trH);
        ctx.strokeRect(trX, trY, trW, trH);

        // Circular Display Bezel & LCD Screen
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.arc(trX + trW * 0.5, trY + trH * 0.5, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#34d399';
        ctx.stroke();

        // 3. DCS / PLC Precision Burden Resistor (Bottom Left, 250 ohm)
        const rW = 34, rH = 14;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.4;
        ctx.fillRect(lLeft - 6, lBot - 6, rW, rH);
        ctx.strokeRect(lLeft - 6, lBot - 6, rW, rH);

        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('250Ω DCS', lLeft - 4, lBot + 4);

        // Animated Current Flow & Live-Zero Sweep (4.0 mA to 20.0 mA)
        const curMa = 4.0 + 16.0 * (0.5 + 0.5 * Math.sin(t * 1.5));
        const flowStep = (t * 26) % 60;

        // Current flow circulating beads (Emerald)
        for (let i = 0; i < 4; i++) {
          const fx = lLeft + psW + ((flowStep + i * 28) % (lRight - lLeft - psW - 10));
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(fx, lTop, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        for (let i = 0; i < 4; i++) {
          const fx = lRight - ((flowStep + i * 28) % (lRight - lLeft - rW - 10));
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(fx, lBot, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Live Digital Readout on Center
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.2;
        ctx.fillRect(w * 0.36, midY - 9, 64, 18);
        ctx.strokeRect(w * 0.36, midY - 9, 64, 18);

        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#34d399';
        ctx.fillText(`I = ${curMa.toFixed(1)} mA`, w * 0.36 + 6, midY + 3);

        // Compliance Voltage Check
        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('COMPLIANCE: >12V OK', w * 0.36 - 6, h - 3);

      } else if (type === 'orifice_meter') {
        // Differential Pressure Orifice Plate Flowmeter & dP Transmitter
        const splitX = w * 0.58;

        // --- LEFT: Pipe Cross-Section, Orifice Restriction & Streamlines ---
        const pipeTopY = midY - 12;
        const pipeBotY = midY + 12;
        const orX = splitX * 0.48;
        const orBore = 12; // Throat opening (beta = 0.5)

        // Industrial Pipe Walls
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.fillRect(10, pipeTopY, splitX - 16, 24);
        ctx.strokeRect(10, pipeTopY, splitX - 16, 24);

        // Flange Pair Assembly at Orifice
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.fillRect(orX - 6, pipeTopY - 4, 5, 32);
        ctx.fillRect(orX + 1, pipeTopY - 4, 5, 32);

        // Square-Edged Orifice Plate with Tab (Amber)
        ctx.fillStyle = '#f59e0b';
        // Upper plate barrier
        ctx.fillRect(orX - 1, pipeTopY, 2, (24 - orBore) * 0.5);
        // Lower plate barrier
        ctx.fillRect(orX - 1, pipeBotY - (24 - orBore) * 0.5, 2, (24 - orBore) * 0.5);
        // Plate identification tab sticking up
        ctx.fillRect(orX - 2, pipeTopY - 9, 4, 5);

        // Animated Fluid Flow Streamlines (Cyan)
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 1.4;
        const flowOffset = (t * 22) % 20;

        // Streamlines converging through orifice into narrow vena contracta
        ctx.beginPath();
        ctx.moveTo(12, pipeTopY + 3);
        ctx.quadraticCurveTo(orX, pipeTopY + 7, orX + 10, pipeTopY + 8);
        ctx.lineTo(splitX - 16, pipeTopY + 4);
        ctx.moveTo(12, pipeBotY - 3);
        ctx.quadraticCurveTo(orX, pipeBotY - 7, orX + 10, pipeBotY - 8);
        ctx.lineTo(splitX - 16, pipeBotY - 4);
        ctx.moveTo(12, midY); ctx.lineTo(splitX - 16, midY);
        ctx.stroke();

        // Pressure Tap Ports (P1 Upstream, P2 Downstream)
        const tap1X = orX - 10, tap2X = orX + 12;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(tap1X, pipeTopY); ctx.lineTo(tap1X, 9);
        ctx.stroke();
        ctx.strokeStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(tap2X, pipeTopY); ctx.lineTo(tap2X, 9);
        ctx.stroke();

        // --- RIGHT: Differential Pressure (dP) Transmitter & U-Tube ---
        const dpX = splitX + 8;
        const dpW = w - 10 - dpX;

        // Smart dP Transmitter Housing
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.4;
        ctx.fillRect(dpX + 4, 9, dpW - 8, 22);
        ctx.strokeRect(dpX + 4, 9, dpW - 8, 22);

        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#34d399';
        ctx.fillText('ΔP = 186.4 mbar', dpX + 7, 22);

        // Flow relationship equation badge
        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('Q = k·√(ΔP)', dpX + 14, h - 8);

        // Tap Connection Lines leading to dP cell
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tap1X, 9); ctx.lineTo(dpX + 4, 15);
        ctx.moveTo(tap2X, 9); ctx.lineTo(dpX + 4, 25);
        ctx.stroke();

        // Micro Legends
        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('P1 (HIGH)', 12, pipeTopY - 6);
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('P2 (LOW)', orX + 10, pipeTopY - 6);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('ISO 5167', orX - 16, h - 3);

      } else if (type === 'cstr') {
        // Non-Isothermal CSTR & Thermal Runaway: Jacketed reactor with agitator + Van Heerden Heat Gen vs Removal S-curve
        const splitX = Math.floor(w * 0.44);

        // --- LEFT: Jacketed CSTR Vessel & Agitator ---
        const rCx = splitX * 0.5, rCy = h * 0.52;
        const rW = 26, rH = 34;

        // Outer Cooling Jacket (Cyan #06b6d4)
        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(rCx - rW * 0.5 - 5, rCy - rH * 0.5 + 4, rW + 10, rH - 4, [0, 0, 8, 8]);
        ctx.fill(); ctx.stroke();

        // Jacket Coolant Inlet/Outlet Nozzles with flow arrows
        ctx.strokeStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(rCx - rW * 0.5 - 9, rCy + 8); ctx.lineTo(rCx - rW * 0.5 - 5, rCy + 8); // Coolant In
        ctx.moveTo(rCx + rW * 0.5 + 5, rCy - 8); ctx.lineTo(rCx + rW * 0.5 + 9, rCy - 8); // Coolant Out
        ctx.stroke();

        // Inner Reactor Vessel (Violet #8b5cf6)
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.roundRect(rCx - rW * 0.5, rCy - rH * 0.5, rW, rH, [4, 4, 6, 6]);
        ctx.fill(); ctx.stroke();

        // Liquid Level in Reactor
        ctx.fillStyle = 'rgba(139, 92, 246, 0.35)';
        ctx.fillRect(rCx - rW * 0.5 + 1, rCy - rH * 0.5 + 7, rW - 2, rH - 9);

        // Rotating Agitator Shaft & Impeller
        const impRot = t * 6;
        const bladeSpan = Math.cos(impRot) * 9;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(rCx, rCy - rH * 0.5 - 4); ctx.lineTo(rCx, rCy + 8); // Shaft
        ctx.moveTo(rCx - bladeSpan, rCy + 8); ctx.lineTo(rCx + bladeSpan, rCy + 8); // Impeller blades
        ctx.stroke();

        // Vortex mixing particles
        for (let p = 0; p < 3; p++) {
          const pAng = impRot + (p * Math.PI * 2) / 3;
          const px = rCx + Math.cos(pAng) * 6;
          const py = rCy + 4 + Math.sin(pAng) * 3;
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(px, py, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Reactant Feed In & Product Out
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(rCx - 6, rCy - rH * 0.5 - 5); ctx.lineTo(rCx - 6, rCy - rH * 0.5); // Feed In
        ctx.moveTo(rCx + rW * 0.5, rCy + 4); ctx.lineTo(rCx + rW * 0.5 + 6, rCy + 4); // Overflow Out
        ctx.stroke();

        // Readouts
        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('T:348K', 8, 10);
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('Tc:295K', 8, h - 3);

        // --- RIGHT: Van Heerden Heat Generation S-Curve vs Linear Removal Line ---
        const gLeft = splitX + 6, gRight = w - 8;
        const gW = gRight - gLeft;
        const gBot = h - 10;
        const gH = h * 0.72;

        // Temperature Axis T
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gLeft, gBot); ctx.lineTo(gRight, gBot);
        ctx.stroke();

        // Linear Heat Removal Line Q_rem = UA(T - Tc) + F*rho*Cp(T - T0) (Emerald #10b981)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(gLeft + 4, gBot - 4);
        ctx.lineTo(gRight - 4, gBot - gH * 0.9);
        ctx.stroke();

        // Sigmoidal Reaction Heat Generation S-Curve Q_gen(T) ~ Arrhenius exp(-E/RT) (Rose #f43f5e)
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const tNorm = (x - gLeft) / gW;
          const qGen = 1 / (1 + Math.exp(-9 * (tNorm - 0.48)));
          const y = gBot - qGen * (gH * 0.95);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Dynamic operating point oscillating near upper ignition/runaway state
        const opTNorm = 0.65 + 0.08 * Math.sin(t * 2);
        const opQGen = 1 / (1 + Math.exp(-9 * (opTNorm - 0.48)));
        const opX = gLeft + opTNorm * gW;
        const opY = gBot - opQGen * (gH * 0.95);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(opX, opY, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Annotations
        ctx.font = 'bold 6px monospace';
        ctx.fillStyle = '#f43f5e'; ctx.fillText('Q_gen', gRight - 28, 11);
        ctx.fillStyle = '#10b981'; ctx.fillText('Q_rem', gRight - 28, 20);
        ctx.fillStyle = '#f59e0b'; ctx.fillText('STABLE STEADY STATE', gLeft, 10);

      } else if (type === 'distillation_column') {
        // Binary Distillation Column & McCabe-Thiele Stages: Tray tower cutaway + VLE equilibrium curve, q-line & stepped stages
        const splitX = Math.floor(w * 0.40);

        // --- LEFT: Distillation Column Superstructure with Bubbling Trays ---
        const colX = splitX * 0.45;
        const colW = 20, colTop = 8, colBot = h - 8;
        const numTrays = 5;

        // Column Shell (Domed top and bottom)
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(colX - colW * 0.5, colTop, colW, colBot - colTop, 6);
        ctx.fill(); ctx.stroke();

        // Internal Sieve Trays & Downcomers
        const traySpacing = (colBot - colTop - 12) / (numTrays + 1);
        for (let i = 1; i <= numTrays; i++) {
          const ty = colTop + 6 + i * traySpacing;
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          if (i % 2 === 1) {
            ctx.moveTo(colX - colW * 0.5 + 2, ty); ctx.lineTo(colX + colW * 0.5 - 4, ty);
          } else {
            ctx.moveTo(colX - colW * 0.5 + 4, ty); ctx.lineTo(colX + colW * 0.5 - 2, ty);
          }
          ctx.stroke();

          // Froth / Bubbles on tray
          ctx.fillStyle = '#38bdf8';
          const bPhase = (t * 4 + i) % 1;
          ctx.beginPath();
          ctx.arc(colX - 2 + Math.sin(i * 2) * 4, ty - 2 - bPhase * 2, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Overhead Vapor line to Condenser (Top)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(colX, colTop);
        ctx.lineTo(colX + colW * 0.5 + 6, colTop);
        ctx.lineTo(colX + colW * 0.5 + 6, colTop + 8);
        ctx.stroke();

        // Bottom Reboiler vapor return (Bottom)
        ctx.strokeStyle = '#f43f5e';
        ctx.beginPath();
        ctx.moveTo(colX, colBot);
        ctx.lineTo(colX - colW * 0.5 - 5, colBot);
        ctx.lineTo(colX - colW * 0.5 - 5, colBot - 6);
        ctx.stroke();

        // Feed line (Mid-column)
        ctx.strokeStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(colX - colW * 0.5 - 7, colTop + (colBot - colTop) * 0.5);
        ctx.lineTo(colX - colW * 0.5, colTop + (colBot - colTop) * 0.5);
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 6px monospace';
        ctx.fillText('zF', 4, colTop + (colBot - colTop) * 0.5 + 2);

        // --- RIGHT: McCabe-Thiele x-y Diagram & Equilibrium Stepped Stages ---
        const gLeft = splitX + 6, gRight = w - 8;
        const gW = gRight - gLeft;
        const gTop = 10, gBot = h - 8;
        const gH = gBot - gTop;

        // 45° Diagonal Reference Line (y = x)
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(gLeft, gBot); ctx.lineTo(gRight, gTop);
        ctx.stroke();
        ctx.setLineDash([]);

        // VLE Equilibrium Curve: y = (alpha * x) / (1 + (alpha - 1) * x) with alpha = 2.4 (Violet #8b5cf6)
        const alpha = 2.4;
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const xFrac = (x - gLeft) / gW;
          const yFrac = (alpha * xFrac) / (1 + (alpha - 1) * xFrac);
          const py = gBot - yFrac * gH;
          if (x === gLeft) ctx.moveTo(x, py);
          else ctx.lineTo(x, py);
        }
        ctx.stroke();

        // Feed q-Line (Amber #f59e0b) from zF = 0.45
        const zfX = gLeft + 0.45 * gW;
        const zfY = gBot - 0.45 * gH;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(zfX, zfY);
        ctx.lineTo(zfX, zfY - gH * 0.28);
        ctx.stroke();

        // Stepped Equilibrium Stages (McCabe-Thiele Staircase in Emerald #10b981)
        const xD = 0.92, xB = 0.08;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        let curX = xD;
        let curY = xD;
        ctx.moveTo(gLeft + curX * gW, gBot - curY * gH);
        for (let s = 0; s < 6; s++) {
          if (curX <= xB) break;
          const xVle = curY / (alpha - curY * (alpha - 1));
          ctx.lineTo(gLeft + xVle * gW, gBot - curY * gH);
          const yNext = Math.max(xB, 0.68 * xVle + 0.28);
          ctx.lineTo(gLeft + xVle * gW, gBot - yNext * gH);
          curX = xVle;
          curY = yNext;
        }
        ctx.stroke();

        // Annotations
        ctx.font = 'bold 6px monospace';
        ctx.fillStyle = '#8b5cf6'; ctx.fillText('VLE α=2.4', gLeft + 4, 10);
        ctx.fillStyle = '#10b981'; ctx.fillText('N: 8 STAGES', gRight - 48, 10);
        ctx.fillStyle = '#38bdf8'; ctx.fillText('xD: 95%', gRight - 36, gBot - 4);

      } else if (type === 'heat_exchanger') {
        // Shell-and-Tube Heat Exchanger & ε-NTU Rating: 1-2 TEMA E shell, U-tube bundle & baffles + Temperature gradients
        const splitX = Math.floor(w * 0.58);

        // --- LEFT/CENTER: 1-2 TEMA E Shell-and-Tube Cutaway ---
        const sX = 10, sY = 10, sW = splitX - 18, sH = h - 20;

        // Outer Cylindrical Shell
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(sX, sY, sW, sH, 4);
        ctx.fill(); ctx.stroke();

        // Hot Fluid Nozzles (Shell Side): Inlet Top Left, Outlet Bottom Right
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(sX + 8, sY - 5, 8, 5); // Hot In
        ctx.fillRect(sX + sW - 16, sY + sH, 8, 5); // Hot Out
        ctx.font = 'bold 6px monospace';
        ctx.fillText('Th,in', sX + 2, sY - 6);
        ctx.fillText('Th,out', sX + sW - 22, sY + sH + 7);

        // Segmented Baffles (Amber #f59e0b) forcing crossflow
        const numBaffles = 4;
        const bffSpacing = sW / (numBaffles + 1);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.8;
        for (let b = 1; b <= numBaffles; b++) {
          const bx = sX + b * bffSpacing;
          ctx.beginPath();
          if (b % 2 === 1) {
            ctx.moveTo(bx, sY); ctx.lineTo(bx, sY + sH * 0.75);
          } else {
            ctx.moveTo(bx, sY + sH * 0.25); ctx.lineTo(bx, sY + sH);
          }
          ctx.stroke();
        }

        // Internal U-Tube Bundle (Cold Fluid passes inside tubes, Cyan #06b6d4)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.4;
        for (let row = -1; row <= 1; row++) {
          const ty = sY + sH * 0.5 + row * 6;
          ctx.beginPath();
          ctx.moveTo(sX + 4, ty);
          ctx.lineTo(sX + sW - 6, ty);
          ctx.stroke();
        }

        // Animated shell-side hot fluid flow particles weaving around baffles
        const flowTime = t * 30;
        for (let p = 0; p < 5; p++) {
          const pFrac = ((flowTime + p * 28) % 120) / 120;
          const px = sX + 8 + pFrac * (sW - 16);
          const py = sY + sH * 0.5 + Math.sin(pFrac * Math.PI * 4) * (sH * 0.32);
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // --- RIGHT: Temperature Profiles & ε-NTU Performance ---
        const pLeft = splitX + 4, pRight = w - 6;
        const pW = pRight - pLeft;
        const pBot = h - 10;
        const pH = h * 0.68;

        // Hot Stream Temperature Curve (Rose #f43f5e, cools from 140°C -> 74°C)
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let x = pLeft; x <= pRight; x++) {
          const frac = (x - pLeft) / pW;
          const tH = 0.95 - 0.42 * (1 - Math.exp(-2.2 * frac));
          const y = pBot - tH * pH;
          if (x === pLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Cold Stream Temperature Curve (Cyan #06b6d4, heats from 25°C -> 68°C counterflow)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let x = pLeft; x <= pRight; x++) {
          const frac = (x - pLeft) / pW;
          const tC = 0.18 + 0.38 * Math.exp(-2.2 * (1 - frac));
          const y = pBot - tC * pH;
          if (x === pLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Performance Telemetry
        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('ε: 58%', pLeft, 10);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('NTU: 1.8', pLeft + 32, 10);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText('LMTD: 42°C', pLeft, h - 3);

      } else if (type === 'gas_absorption') {
        // Packed Gas Absorption Tower & Flooding Hydraulics: Countercurrent tower + Whitman Two-Film & Sherwood flooding gauge
        const splitX = Math.floor(w * 0.44);

        // --- LEFT: Countercurrent Packed Bed Absorption Tower ---
        const tCx = splitX * 0.48;
        const tW = 24, tTop = 8, tBot = h - 8;

        // Tower Shell
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(tCx - tW * 0.5, tTop, tW, tBot - tTop, 5);
        ctx.fill(); ctx.stroke();

        // Top Liquid Solvent Spray Distributor (Showering downward)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(tCx - 6, tTop + 5); ctx.lineTo(tCx + 6, tTop + 5);
        ctx.stroke();
        // Spray droplets
        for (let d = -2; d <= 2; d++) {
          const dropY = tTop + 7 + ((t * 25 + d * 5) % 10);
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(tCx + d * 3.5, dropY, 1, 0, Math.PI * 2);
          ctx.fill();
        }

        // Packed Bed Matrix (Structured Pall Rings Texture)
        const bedTop = tTop + 14, bedBot = tBot - 12;
        ctx.fillStyle = 'rgba(71, 85, 105, 0.25)';
        ctx.fillRect(tCx - tW * 0.5 + 2, bedTop, tW - 4, bedBot - bedTop);

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        for (let ry = bedTop + 4; ry < bedBot - 2; ry += 5) {
          ctx.beginPath();
          ctx.moveTo(tCx - tW * 0.5 + 4, ry); ctx.lineTo(tCx + tW * 0.5 - 4, ry + 2);
          ctx.stroke();
        }

        // Ascending Gas Stream (Cyan streamlines moving UP)
        const gasPhase = (t * 22) % 18;
        ctx.fillStyle = '#06b6d4';
        for (let g = 0; g < 3; g++) {
          const gy = bedBot - ((gasPhase + g * 8) % (bedBot - bedTop));
          ctx.beginPath();
          ctx.arc(tCx - 4 + g * 4, gy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Nozzles
        ctx.font = 'bold 6px monospace';
        ctx.fillStyle = '#10b981'; ctx.fillText('L (SOLVENT)', 6, tTop + 6);
        ctx.fillStyle = '#06b6d4'; ctx.fillText('G (GAS)', 6, tBot - 2);

        // --- RIGHT: Whitman Two-Film Gradient & Sherwood Flooding Gauge ---
        const gLeft = splitX + 6, gRight = w - 8;
        const gW = gRight - gLeft;

        // 1. Two-Film Mass Transfer Gradient (Top Half)
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 6.5px monospace';
        ctx.fillText('WHITMAN TWO-FILM (GAS ⇄ LIQ)', gLeft, 10);

        const fMidY = 24;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(gLeft + 4, fMidY - 8); ctx.lineTo(gLeft + gW * 0.45, fMidY);
        ctx.stroke();

        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(gLeft + gW * 0.55, fMidY); ctx.lineTo(gRight - 4, fMidY + 8);
        ctx.stroke();

        // Interface Line
        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(gLeft + gW * 0.5, fMidY - 9); ctx.lineTo(gLeft + gW * 0.5, fMidY + 9);
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. Sherwood-Eckert Flooding Gauge (Bottom Half)
        const barY = h - 14;
        const barH = 7;
        ctx.fillStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.fillRect(gLeft, barY, gW, barH);

        ctx.fillStyle = '#10b981';
        ctx.fillRect(gLeft, barY, gW * 0.7, barH);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(gLeft + gW * 0.7, barY, gW * 0.15, barH);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(gLeft + gW * 0.85, barY, gW * 0.15, barH);

        // Operating needle (68% loading)
        const needleX = gLeft + (0.68 + 0.04 * Math.sin(t * 3)) * gW;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(needleX, barY + barH * 0.5, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#10b981';
        ctx.fillText('EFF: 95.2% | Z: 2.8m | 68% FLOOD', gLeft, h - 3);

      } else if (type === 'pn_junction') {
        // P-N Junction Diode Band Bending & Carrier Transport: P-N crystal depletion space-charge + Energy band diagram (Ec, Ev, Ef)
        const splitX = Math.floor(w * 0.46);

        // --- LEFT: Physical Metallurgical Junction (P-region, Depletion Layer W, N-region) ---
        const jX = 10, jY = 10, jW = splitX - 18, jH = h - 20;
        const midJX = jX + jW * 0.5;

        // P-type Region (Left, violet tint)
        ctx.fillStyle = 'rgba(129, 140, 248, 0.2)';
        ctx.fillRect(jX, jY, jW * 0.5, jH);
        // N-type Region (Right, cyan tint)
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.fillRect(midJX, jY, jW * 0.5, jH);

        // Crystal Border
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(jX, jY, jW, jH);

        // Depletion Space-Charge Region (Width W collapsing under forward bias)
        const biasV = 0.60;
        const depW = Math.max(8, 22 * Math.sqrt(Math.max(0.05, 1 - biasV / 0.7)));
        ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
        ctx.fillRect(midJX - depW * 0.5, jY, depW, jH);
        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(midJX - depW * 0.5, jY, depW, jH);
        ctx.setLineDash([]);

        // Fixed Ion Charges: Acceptors (-q in p-side depletion) and Donors (+q in n-side depletion)
        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#ef4444'; ctx.fillText('⊖', midJX - depW * 0.4 - 2, jY + jH * 0.5 + 3);
        ctx.fillStyle = '#38bdf8'; ctx.fillText('⊕', midJX + depW * 0.1, jY + jH * 0.5 + 3);

        // Mobile Carrier Diffusion: Holes (red) from P->N, Electrons (cyan) from N->P
        const pCarrierX = jX + 4 + ((t * 25) % (jW - 8));
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(pCarrierX, jY + 5, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 6px monospace';
        ctx.fillStyle = '#818cf8'; ctx.fillText('p-type', jX + 2, jY - 3);
        ctx.fillStyle = '#38bdf8'; ctx.fillText('n-type', jX + jW - 24, jY - 3);

        // --- RIGHT: Energy Band Diagram Ec, Ev, Ef & Barrier Collapse ---
        const bLeft = splitX + 6, bRight = w - 8;
        const bW = bRight - bLeft;
        const bMidX = bLeft + bW * 0.5;

        // Conduction Band Ec(x) (Cyan #38bdf8, smooth sigmoidal drop across junction)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = bLeft; x <= bRight; x++) {
          const norm = (x - bMidX) / (depW * 0.8);
          const drop = 1 / (1 + Math.exp(-2.8 * norm));
          const y = 14 + drop * (h * 0.35);
          if (x === bLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Valence Band Ev(x) (Indigo #818cf8, parallel 1.12 eV below Ec)
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = bLeft; x <= bRight; x++) {
          const norm = (x - bMidX) / (depW * 0.8);
          const drop = 1 / (1 + Math.exp(-2.8 * norm));
          const y = 30 + drop * (h * 0.35);
          if (x === bLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Fermi Level Ef (Dashed Amber #f59e0b)
        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(bLeft, 22); ctx.lineTo(bMidX - 2, 22); // Efp
        ctx.moveTo(bMidX + 2, 36); ctx.lineTo(bRight, 36); // Efn
        ctx.stroke();
        ctx.setLineDash([]);

        // Readouts
        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#38bdf8'; ctx.fillText('Ec', bLeft, 12);
        ctx.fillStyle = '#818cf8'; ctx.fillText('Ev', bLeft, 28);
        ctx.fillStyle = '#f59e0b'; ctx.fillText('Va: +0.65V', bRight - 46, 10);
        ctx.fillStyle = '#10b981'; ctx.fillText('W: 0.23µm', bRight - 44, h - 3);

      } else if (type === 'sic_switching') {
        // Silicon Carbide (SiC) MOSFET Double-Pulse Test: Ultra-fast dv/dt (48 V/ns), Miller plateau & inductive ringing
        const splitX = Math.floor(w * 0.44);

        // --- LEFT: Double-Pulse Test (DPT) Circuit Topology ---
        const cLeft = 10, cTop = 8, cW = splitX - 18;
        const cMidX = cLeft + cW * 0.5;

        // High Voltage DC Bus (+600V)
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cLeft, cTop + 4); ctx.lineTo(cLeft + cW, cTop + 4);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 6px monospace';
        ctx.fillText('+Vdc: 600V', cLeft, cTop + 2);

        // Inductive Load L_load
        const ly = cTop + 8;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let k = 0; k < 3; k++) {
          ctx.arc(cMidX, ly + 4 + k * 5, 2.5, -Math.PI * 0.5, Math.PI * 0.5, false);
        }
        ctx.stroke();

        // Freewheeling SiC Schottky Diode in parallel with load
        ctx.strokeStyle = '#06b6d4';
        ctx.strokeRect(cMidX + 10, ly + 2, 8, 12);
        ctx.font = 'bold 6px monospace';
        ctx.fillText('FWD', cMidX + 9, ly + 10);

        // SiC MOSFET DUT Switch Symbol
        const qy = ly + 20;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(cMidX - 6, qy, 12, 12);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 6.5px monospace';
        ctx.fillText('SiC', cMidX - 5, qy + 8);

        // Gate Driver Rg pulse
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cLeft + 2, qy + 6); ctx.lineTo(cMidX - 6, qy + 6);
        ctx.stroke();
        ctx.fillStyle = '#ec4899';
        ctx.fillText('Rg', cLeft + 4, qy + 4);

        // --- RIGHT: Ultra-Fast Double-Pulse Oscilloscope Waveforms ---
        const gLeft = splitX + 6, gRight = w - 8;
        const gW = gRight - gLeft;
        const gBot = h - 8;

        // 1. Drain Voltage Vds(t) (Cyan #38bdf8, ultra-steep drop with high dv/dt & inductive ringing)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const frac = (x - gLeft) / gW;
          let vNorm = 0.9;
          if (frac >= 0.32 && frac <= 0.44) {
            vNorm = 0.9 - ((frac - 0.32) / 0.12) * 0.85;
          } else if (frac > 0.44 && frac <= 0.75) {
            const ring = Math.sin((frac - 0.44) * 45) * Math.exp(-(frac - 0.44) * 8) * 0.22;
            vNorm = 0.05 + ring;
          } else if (frac > 0.75) {
            vNorm = 0.05;
          }
          const y = gBot - vNorm * (h * 0.72);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 2. Drain Current Id(t) (Amber #f59e0b, rising current with reverse recovery spike)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const frac = (x - gLeft) / gW;
          let iNorm = 0.05;
          if (frac >= 0.28 && frac <= 0.38) {
            iNorm = 0.05 + ((frac - 0.28) / 0.10) * 0.75;
          } else if (frac > 0.38 && frac <= 0.46) {
            iNorm = 0.80 + 0.15 * Math.sin((frac - 0.38) * 40);
          } else if (frac > 0.46) {
            iNorm = 0.65;
          }
          const y = gBot - iNorm * (h * 0.68);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 3. Gate Voltage Vgs(t) with Miller Plateau (Pink #ec4899)
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const frac = (x - gLeft) / gW;
          let gNorm = 0.05;
          if (frac >= 0.22 && frac < 0.30) gNorm = 0.05 + ((frac - 0.22) / 0.08) * 0.35;
          else if (frac >= 0.30 && frac <= 0.44) gNorm = 0.40;
          else if (frac > 0.44 && frac <= 0.58) gNorm = 0.40 + ((frac - 0.44) / 0.14) * 0.45;
          else if (frac > 0.58) gNorm = 0.85;
          const y = gBot - gNorm * (h * 0.45);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Annotations
        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#38bdf8'; ctx.fillText('dv/dt: 48V/ns', gLeft, 10);
        ctx.fillStyle = '#ec4899'; ctx.fillText('Vplat: 5.2V', gLeft + 64, 10);
        ctx.fillStyle = '#f59e0b'; ctx.fillText('Eon: 0.42mJ', gRight - 46, h - 3);

      } else if (type === 'igbt_thermal') {
        // IGBT Module Multi-Layer Thermal Foster Network & SOA: Physical package cross-section + 4-stage RC network & Tj ripple
        const splitX = Math.floor(w * 0.48);

        // --- LEFT: Physical IGBT Power Module Multi-Layer Package Stack ---
        const pLeft = 10, pRight = splitX - 10;
        const pW = pRight - pLeft;

        // Layer 1: Silicon Die (Hot Red #f43f5e, Tj = 145°C) with bond wires
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(pLeft + pW * 0.25, 8, pW * 0.5, 6);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 5.5px monospace';
        ctx.fillText('Si DIE (Tj)', pLeft + pW * 0.3, 13);

        // Gold Bond Wires looping up
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(pLeft + pW * 0.12, 14);
        ctx.quadraticCurveTo(pLeft + pW * 0.2, 3, pLeft + pW * 0.3, 8);
        ctx.stroke();

        // Layer 2: Solder attach
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(pLeft + pW * 0.2, 14, pW * 0.6, 2.5);

        // Layer 3: DBC Ceramic Substrate (Al2O3 / AlN, Cyan #38bdf8)
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(pLeft + pW * 0.1, 16.5, pW * 0.8, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('DBC CERAMIC', pLeft + pW * 0.25, 21.5);

        // Layer 4: Solder layer
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(pLeft + pW * 0.05, 22.5, pW * 0.9, 2.5);

        // Layer 5: Copper Baseplate (Amber #f59e0b, Tc = 85°C)
        ctx.fillStyle = '#d97706';
        ctx.fillRect(pLeft, 25, pW, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Cu BASEPLATE (Tc)', pLeft + pW * 0.2, 31);

        // Layer 6: Heatsink Fins (Slate #64748b)
        ctx.fillStyle = '#334155';
        ctx.fillRect(pLeft, 33, pW, 4);
        for (let fin = 0; fin < 6; fin++) {
          ctx.fillRect(pLeft + 3 + fin * (pW / 6), 37, 3, h - 39);
        }

        // --- RIGHT: 4-Stage Foster Thermal Ladder & Dynamic Tj Ripple Waveform ---
        const gLeft = splitX + 6, gRight = w - 8;
        const gW = gRight - gLeft;
        const gBot = h - 8;
        const gH = h * 0.72;

        // SOA Safe Operating Area Maximum Rating Threshold (175°C Red Dashed Line)
        const soaY = gBot - gH * 0.92;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(gLeft, soaY); ctx.lineTo(gRight, soaY);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 6px monospace';
        ctx.fillText('SOA LIMIT: 175°C', gRight - 58, soaY - 2);

        // Junction Temperature Ripple Tj(t) (Rose #f43f5e)
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const frac = (x - gLeft) / gW;
          const ripple = Math.sin((frac * 12) + t * 4) * 0.08 + Math.sin((frac * 36) + t * 8) * 0.03;
          const tjNorm = 0.68 + ripple;
          const y = gBot - tjNorm * gH;
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Case Temperature Baseline Tc (Amber #f59e0b, 85°C steady)
        const tcY = gBot - 0.38 * gH;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(gLeft, tcY); ctx.lineTo(gRight, tcY);
        ctx.stroke();

        // Readouts
        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#f43f5e'; ctx.fillText('Tj: 145°C', gLeft, 11);
        ctx.fillStyle = '#f59e0b'; ctx.fillText('Tc: 85°C', gLeft, 22);
        ctx.fillStyle = '#10b981'; ctx.fillText('MARGIN: 30°C (PASS)', gLeft, h - 3);

      } else if (type === 'mosfet_channel') {
        // MOSFET Inversion Channel, Band Bending & 2D Electron Gas: Nanoscale FET cross-section + pinch-off & Id-Vds saturation curve
        const splitX = Math.floor(w * 0.48);

        // --- LEFT: Nanoscale MOSFET Device Cross-Section ---
        const fLeft = 10, fTop = 10, fW = splitX - 18, fH = h - 20;

        // P-Type Silicon Substrate Body
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.4;
        ctx.fillRect(fLeft, fTop + 10, fW, fH - 10);
        ctx.strokeRect(fLeft, fTop + 10, fW, fH - 10);

        // N+ Source Well (Left) & N+ Drain Well (Right)
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(fLeft + 2, fTop + 10, 10, 12);
        ctx.fillRect(fLeft + fW - 12, fTop + 10, 10, 12);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 6px monospace';
        ctx.fillText('N+', fLeft + 3, fTop + 18);
        ctx.fillText('N+', fLeft + fW - 11, fTop + 18);

        // Gate Oxide Dielectric (tox = 3.2nm, Cyan #38bdf8)
        const chLeft = fLeft + 12, chRight = fLeft + fW - 12;
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(chLeft, fTop + 7, chRight - chLeft, 3);

        // Metal Gate Electrode (Top)
        ctx.fillStyle = '#64748b';
        ctx.fillRect(chLeft, fTop, chRight - chLeft, 7);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('GATE (Vgs)', chLeft + 4, fTop + 5.5);

        // 2D Electron Inversion Sheet (Emerald #10b981) with Pinch-off towards Drain
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(chLeft, fTop + 10);
        ctx.lineTo(chLeft, fTop + 14);
        ctx.lineTo(chRight - 4, fTop + 11);
        ctx.lineTo(chRight, fTop + 10);
        ctx.closePath();
        ctx.fill();

        // Depletion boundary underneath channel
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(chLeft, fTop + 10, chRight - chLeft, 10);
        ctx.setLineDash([]);

        // --- RIGHT: Output ID - VDS Characteristic & Pinch-Off Operating Point ---
        const gLeft = splitX + 6, gRight = w - 8;
        const gW = gRight - gLeft;
        const gBot = h - 8;
        const gH = h * 0.72;

        // Axes
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gLeft, gBot); ctx.lineTo(gRight, gBot);
        ctx.stroke();

        // Parabolic Triode Region transitioning into Flat Saturation Plateau
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        const vSatFrac = 0.42;
        for (let x = gLeft; x <= gRight; x++) {
          const vFrac = (x - gLeft) / gW;
          let idNorm = 0;
          if (vFrac < vSatFrac) {
            idNorm = (2 * vFrac - Math.pow(vFrac / vSatFrac, 2) * vSatFrac) * (1 / (vSatFrac * 1.0));
          } else {
            idNorm = 1.0 + 0.08 * (vFrac - vSatFrac);
          }
          const y = gBot - idNorm * (gH * 0.85);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Operating Saturation Point Marker (Rose #f43f5e)
        const opX = gLeft + 0.65 * gW;
        const opY = gBot - 1.02 * (gH * 0.85);
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(opX, opY, 3.8, 0, Math.PI * 2);
        ctx.fill();

        // Annotations
        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#10b981'; ctx.fillText('2DEG INVERSION', gLeft, 10);
        ctx.fillStyle = '#f43f5e'; ctx.fillText('PINCH-OFF (SAT)', opX - 30, opY - 6);
        ctx.fillStyle = '#38bdf8'; ctx.fillText('ID: 3.58mA', gRight - 46, h - 3);

      } else if (type === 'op_amp') {
        // Operational Amplifier Linear & Filter: Actual op-amp symbol with feedback circuit + input/output waveforms with rail clipping
        const splitX = Math.floor(w * 0.44);

        // --- LEFT: Operational Amplifier Circuit Symbol & Feedback Loop ---
        const opX = 28, opY = h * 0.52;
        const opW = 20, opH = 20;

        // Op-Amp Body Triangle
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(opX, opY - opH * 0.5);
        ctx.lineTo(opX + opW, opY);
        ctx.lineTo(opX, opY + opH * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Pin inputs: Inverting (-) top, Non-Inverting (+) bottom
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('-', opX + 3, opY - 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('+', opX + 3, opY + 6);

        // Input Resistor Rin to (-) terminal
        const inLeft = 8;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(inLeft, opY - 4);
        ctx.lineTo(inLeft + 5, opY - 4);
        // Rin zig-zag
        ctx.lineTo(inLeft + 8, opY - 7); ctx.lineTo(inLeft + 11, opY - 1);
        ctx.lineTo(inLeft + 14, opY - 7); ctx.lineTo(inLeft + 17, opY - 4);
        ctx.lineTo(opX, opY - 4);
        ctx.stroke();

        // Feedback Resistor Rf (from output back to inverting pin)
        const rfY = opY - 14;
        ctx.strokeStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(opX + opW, opY);
        ctx.lineTo(opX + opW + 6, opY);
        ctx.lineTo(opX + opW + 6, rfY);
        ctx.lineTo(opX + 14, rfY);
        // Rf zig-zag
        ctx.lineTo(opX + 11, rfY - 2); ctx.lineTo(opX + 7, rfY + 2);
        ctx.lineTo(opX + 3, rfY - 2); ctx.lineTo(opX, rfY);
        ctx.lineTo(opX - 6, rfY);
        ctx.lineTo(opX - 6, opY - 4);
        ctx.lineTo(opX, opY - 4);
        ctx.stroke();

        // Non-inverting (+) grounded
        ctx.strokeStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(opX, opY + 4);
        ctx.lineTo(opX - 8, opY + 4);
        ctx.lineTo(opX - 8, opY + 10);
        // Ground lines
        ctx.moveTo(opX - 12, opY + 10); ctx.lineTo(opX - 4, opY + 10);
        ctx.moveTo(opX - 10, opY + 12); ctx.lineTo(opX - 6, opY + 12);
        ctx.stroke();

        // Output wire
        ctx.strokeStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(opX + opW, opY); ctx.lineTo(splitX - 6, opY);
        ctx.stroke();

        // Labels
        ctx.font = 'bold 6px monospace';
        ctx.fillStyle = '#f59e0b'; ctx.fillText('Rin', inLeft + 4, opY + 6);
        ctx.fillStyle = '#06b6d4'; ctx.fillText('Rf', opX + 4, rfY - 3);

        // --- RIGHT: Dual-Trace Oscilloscope & Saturation Clipping ---
        const gLeft = splitX + 8, gRight = w - 8;
        const gMidY = h * 0.5;
        const vSat = h * 0.36;

        // Saturation Rails +Vsat and -Vsat
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(gLeft, gMidY - vSat); ctx.lineTo(gRight, gMidY - vSat);
        ctx.moveTo(gLeft, gMidY + vSat); ctx.lineTo(gRight, gMidY + vSat);
        ctx.stroke();
        ctx.setLineDash([]);

        // Trace 1: Input vin(t) (Amber, low amplitude)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const y = gMidY + Math.sin((x / 14) - t * 3) * (h * 0.16);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Trace 2: Output vout(t) (Inverted 180° by -Rf/Rin, clipped at +/- Vsat)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const raw = -Math.sin((x / 14) - t * 3) * (h * 0.55);
          const clipped = Math.max(-vSat, Math.min(vSat, raw));
          const y = gMidY + clipped;
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Rail labels
        ctx.font = 'bold 6px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('+Vsat', gRight - 28, gMidY - vSat - 2);
        ctx.fillText('-Vsat', gRight - 28, gMidY + vSat + 7);
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('Av=-Rf/Rin', gLeft, 8);

      } else if (type === 'rc_transient') {
        // RC & RL Circuit Transients & Exponential Time Constants: Switchable circuit + 63.2% tau point marker
        const splitX = Math.floor(w * 0.38);

        // --- LEFT: Miniature Switchable Circuit (V0, SPDT Switch, R, C, L) ---
        const cLeft = 10, cRight = splitX - 6;
        const cTop = 10, cBot = h - 8;
        const cMidY = (cTop + cBot) * 0.5;

        // DC Source V0
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(cLeft, cMidY - 7, 8, 14);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 6px monospace';
        ctx.fillText('V0', cLeft + 1, cMidY + 3);

        // SPDT Switch toggling between Charge and Discharge
        const swPeriod = 6;
        const isCharging = (t % swPeriod) < (swPeriod * 0.55);
        const swPoleX = cLeft + 16, swPoleY = cTop + 4;
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cLeft + 8, cMidY);
        ctx.lineTo(swPoleX, swPoleY);
        // Switch blade
        const swBladeEndX = swPoleX + 8;
        const swBladeEndY = isCharging ? swPoleY : swPoleY + 12;
        ctx.moveTo(swPoleX, swPoleY);
        ctx.lineTo(swBladeEndX, swBladeEndY);
        ctx.stroke();

        // Resistor R
        const rx = swBladeEndX + 6;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(swBladeEndX, swPoleY);
        ctx.lineTo(rx, swPoleY - 3); ctx.lineTo(rx + 4, swPoleY + 3);
        ctx.lineTo(rx + 8, swPoleY - 3); ctx.lineTo(rx + 12, swPoleY);
        ctx.stroke();

        // Capacitor C & Inductor L down to ground
        const capX = cRight - 4;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(rx + 12, swPoleY); ctx.lineTo(capX, swPoleY);
        ctx.lineTo(capX, cMidY - 3);
        // Capacitor plates
        ctx.moveTo(capX - 4, cMidY - 3); ctx.lineTo(capX + 4, cMidY - 3);
        ctx.moveTo(capX - 4, cMidY + 1); ctx.lineTo(capX + 4, cMidY + 1);
        ctx.moveTo(capX, cMidY + 1); ctx.lineTo(capX, cBot);
        ctx.lineTo(cLeft + 4, cBot);
        ctx.lineTo(cLeft + 4, cMidY + 7);
        ctx.stroke();

        // Circuit labels
        ctx.font = 'bold 6px monospace';
        ctx.fillStyle = '#f59e0b'; ctx.fillText('R', rx + 2, swPoleY - 4);
        ctx.fillStyle = '#06b6d4'; ctx.fillText('C', capX + 5, cMidY);
        ctx.fillStyle = isCharging ? '#10b981' : '#f43f5e';
        ctx.fillText(isCharging ? 'CHG' : 'DIS', cLeft + 14, cBot - 2);

        // --- RIGHT: Exponential Charge/Discharge Curve with Highlighted 63.2% Point ---
        const gLeft = splitX + 8, gRight = w - 8;
        const gW = gRight - gLeft;
        const gTop = 10, gBot = h - 8;
        const gH = gBot - gTop;
        const vMaxY = gTop + 4;

        // Vmax asymptotic reference line
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gLeft, vMaxY); ctx.lineTo(gRight, vMaxY);
        ctx.stroke();

        // 63.2% Voltage threshold line (v = 0.632 V0)
        const tau63Y = gBot - 0.632 * (gBot - vMaxY);
        const tau1X = gLeft + gW * 0.28; // t = 1 tau

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        // Horizontal line to 63.2%
        ctx.moveTo(gLeft, tau63Y); ctx.lineTo(tau1X, tau63Y);
        // Vertical line down to 1 tau
        ctx.lineTo(tau1X, gBot);
        ctx.stroke();
        ctx.setLineDash([]);

        // Exponential Charging Curve: v(t) = V0 * (1 - e^(-t/tau))
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const tNorm = ((x - gLeft) / (tau1X - gLeft));
          const vFrac = 1 - Math.exp(-tNorm);
          const y = gBot - vFrac * (gBot - vMaxY);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Highlighted 63.2% Time Constant Reticle Marker
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(tau1X, tau63Y, 3.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Dynamic scanning probe dot
        const scanFrac = ((t * 0.6) % 1);
        const scanX = gLeft + scanFrac * gW;
        const scanTNorm = (scanX - gLeft) / (tau1X - gLeft);
        const scanV = 1 - Math.exp(-scanTNorm);
        const scanY = gBot - scanV * (gBot - vMaxY);
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(scanX, scanY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Annotations
        ctx.font = 'bold 6px monospace';
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('63.2% (1τ)', tau1X + 4, tau63Y + 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('τ = RC', gRight - 34, 8);

      } else if (type === 'transformer_test') {
        // Single-Phase Transformer OC & SC Tests: Primary/secondary diagram with OC/SC connections + Equivalent circuit parameters
        const splitX = Math.floor(w * 0.48);

        // State toggles between OC (Open Circuit) and SC (Short Circuit)
        const isOc = (t % 6) < 3;

        // --- LEFT: Transformer Core & Winding Assembly ---
        const tCx = 12, tTop = 10, tW = splitX - 22, tH = h - 20;
        const legW = 6;

        // Laminated Iron Core (Rectangular yoke)
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(tCx, tTop, tW, tH);
        ctx.clearRect(tCx + legW, tTop + legW, tW - 2 * legW, tH - 2 * legW);
        ctx.strokeRect(tCx + legW, tTop + legW, tW - 2 * legW, tH - 2 * legW);

        // Primary Winding N1 (Left leg)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.2;
        for (let k = 0; k < 5; k++) {
          const wy = tTop + legW + 3 + k * 5;
          ctx.beginPath();
          ctx.moveTo(tCx - 3, wy); ctx.lineTo(tCx + legW + 2, wy);
          ctx.stroke();
        }

        // Secondary Winding N2 (Right leg)
        const secLegX = tCx + tW - legW;
        ctx.strokeStyle = '#38bdf8';
        for (let k = 0; k < 5; k++) {
          const wy = tTop + legW + 3 + k * 5;
          ctx.beginPath();
          ctx.moveTo(secLegX - 2, wy); ctx.lineTo(secLegX + legW + 3, wy);
          ctx.stroke();
        }

        // Core Magnetic Flux Lines (Circulating dashed amber loop)
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(tCx + legW * 0.5, tTop + legW * 0.5, tW - legW, tH - legW);
        ctx.setLineDash([]);

        // Test Connections on Secondary Terminals:
        if (isOc) {
          // OC: Open Circuit with Voltmeter
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(tCx + tW + 8, tTop + tH * 0.5, 4.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 6px monospace';
          ctx.fillText('V', tCx + tW + 6, tTop + tH * 0.5 + 2);
        } else {
          // SC: Short Circuit with Copper Bar
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(secLegX + legW + 3, tTop + legW + 3);
          ctx.lineTo(tCx + tW + 6, tTop + legW + 3);
          ctx.lineTo(tCx + tW + 6, tTop + tH - legW);
          ctx.lineTo(secLegX + legW + 3, tTop + tH - legW);
          ctx.stroke();
        }

        // Test Mode Badge
        ctx.fillStyle = isOc ? '#10b981' : '#ef4444';
        ctx.font = 'bold 7px monospace';
        ctx.fillText(isOc ? 'OC TEST' : 'SC TEST', tCx, h - 2);

        // --- RIGHT: Equivalent Circuit Schematic & Extracted Parameters ---
        const eLeft = splitX + 6, eRight = w - 6;
        const eMidY = h * 0.45;

        // Equivalent T-Circuit (Shunt branch for OC, Series branch for SC)
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(eLeft, eMidY); ctx.lineTo(eRight, eMidY);
        ctx.stroke();

        if (isOc) {
          // Display Shunt Branch: Rc (core loss) || Xm (magnetizing)
          const shX = eLeft + (eRight - eLeft) * 0.45;
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(shX, eMidY); ctx.lineTo(shX, eMidY + 16);
          ctx.stroke();
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 7px monospace';
          ctx.fillText('Rc ∥ Xm', shX + 4, eMidY + 14);

          // Parameters extracted from OC test
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 7px monospace';
          ctx.fillText('Rc: 1.8 kΩ', eLeft, 10);
          ctx.fillText('Xm: 540 Ω', eLeft, 20);
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('Core Loss (P0)', eLeft, h - 3);
        } else {
          // Display Series Branch: Req + jXeq (copper losses & leakage)
          const sX = eLeft + (eRight - eLeft) * 0.35;
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.8;
          ctx.strokeRect(sX, eMidY - 3, 14, 6);
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 6px monospace';
          ctx.fillText('Zeq', sX + 1, eMidY + 2);

          // Parameters extracted from SC test
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 7px monospace';
          ctx.fillText('Req: 0.85 Ω', eLeft, 10);
          ctx.fillText('Xeq: 2.30 Ω', eLeft, 20);
          ctx.fillStyle = '#94a3b8';
          ctx.fillText('Copper Loss (Psc)', eLeft, h - 3);
        }

      } else if (type === 'dc_motor') {
        // DC Motor Separately Excited Speed Control: Rotating armature shaft + Armature voltage, field current, RPM and torque
        const splitX = Math.floor(w * 0.52);

        // --- LEFT/CENTER: DC Motor Cross-Section (Stator Poles, Commutator & Shaft) ---
        const mCx = splitX * 0.48;
        const mCy = h * 0.5;
        const mR = Math.min(20, h * 0.38);

        // Stator Magnetic Field Poles: North (Top/Left) & South (Bottom/Right)
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(mCx - mR - 10, mCy - 12, 10, 24);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('N', mCx - mR - 7, mCy + 3);

        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.strokeStyle = '#3b82f6';
        ctx.strokeRect(mCx + mR, mCy - 12, 10, 24);
        ctx.fillStyle = '#3b82f6';
        ctx.fillText('S', mCx + mR + 3, mCy + 3);

        // Magnetic Flux Lines across Airgap (N -> S)
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(mCx - mR, mCy - 6); ctx.lineTo(mCx + mR, mCy - 6);
        ctx.moveTo(mCx - mR, mCy + 6); ctx.lineTo(mCx + mR, mCy + 6);
        ctx.stroke();
        ctx.setLineDash([]);

        // Cylindrical Armature Rotor
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(mCx, mCy, mR - 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rotating Rotor Conductors & Commutator Segments
        const rot = t * 4.5;
        for (let c = 0; c < 6; c++) {
          const cAng = rot + (c * Math.PI) / 3;
          const cx = mCx + Math.cos(cAng) * (mR * 0.62);
          const cy = mCy + Math.sin(cAng) * (mR * 0.62);
          ctx.fillStyle = Math.sin(cAng) > 0 ? '#f59e0b' : '#06b6d4';
          ctx.beginPath();
          ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Center Rotating Output Shaft
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(mCx, mCy, 3, 0, Math.PI * 2);
        ctx.fill();

        // Directional Rotation / Torque Arrow
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(mCx, mCy, mR + 3, rot, rot + Math.PI * 0.7);
        ctx.stroke();

        // --- RIGHT: DCS Motor Speed & Drive Telemetry Panel ---
        const pLeft = splitX + 4;
        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('Va: 220V', pLeft, 11);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('If: 1.25A', pLeft + 48, 11);

        ctx.fillStyle = '#10b981';
        ctx.fillText('Speed: 1480 RPM', pLeft, 23);
        ctx.fillStyle = '#ec4899';
        ctx.fillText('Torque: 28.5 N·m', pLeft, 35);

        // Dynamic Speed Gauge Bar
        const barW = w - pLeft - 10;
        ctx.fillStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.fillRect(pLeft, 40, barW, 6);
        ctx.fillStyle = '#10b981';
        const fillW = (0.75 + 0.15 * Math.sin(t * 2)) * barW;
        ctx.fillRect(pLeft, 40, fillW, 6);

      } else if (type === 'induction_motor') {
        // 3-Phase Induction Motor Torque-Slip & Breakdown: Motor rotor/stator animation + Torque-slip curve with breakdown torque & slip
        const splitX = Math.floor(w * 0.44);

        // --- LEFT: Stator & Squirrel-Cage Rotor Animation ---
        const mCx = 24, mCy = h * 0.5;
        const mR = Math.min(20, h * 0.38);

        // 3-Phase Stator Ring with Rotating Magnetic Field
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mCx, mCy, mR + 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Stator Synchronous Field Vector (rotating fast at ws)
        const wsRot = t * 3.5;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(mCx, mCy);
        ctx.lineTo(mCx + Math.cos(wsRot) * mR, mCy + Math.sin(wsRot) * mR);
        ctx.stroke();

        // Squirrel-Cage Rotor (rotating slightly slower at wr = ws * (1 - s))
        const wrRot = t * 3.1;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(mCx, mCy, mR - 3, 0, Math.PI * 2);
        ctx.fill();

        // Rotor Aluminum Bars
        for (let b = 0; b < 8; b++) {
          const bAng = wrRot + (b * Math.PI) / 4;
          const bx = mCx + Math.cos(bAng) * (mR * 0.65);
          const by = mCy + Math.sin(bAng) * (mR * 0.65);
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Shaft
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(mCx, mCy, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // --- RIGHT: Complete Kloss Torque-Slip Curve ---
        const gLeft = splitX + 6, gRight = w - 8;
        const gW = gRight - gLeft;
        const gBot = h - 8;
        const gH = h * 0.72;

        // Slip Axis s = 0 (left, sync speed) to s = 1.0 (right, standstill)
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gLeft, gBot); ctx.lineTo(gRight, gBot);
        ctx.stroke();

        // Kloss Torque-Slip Formula: T/Tmax = 2 / (s/sm + sm/s)
        const sm = 0.22;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const s = Math.max(0.005, (x - gLeft) / gW);
          const tNorm = (2 * (s / sm)) / (1 + Math.pow(s / sm, 2));
          const y = gBot - tNorm * gH;
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Breakdown Torque Point (Tmax at sm)
        const peakX = gLeft + sm * gW;
        const peakY = gBot - gH;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(peakX, peakY, 3.8, 0, Math.PI * 2);
        ctx.fill();

        // Operating Point at Normal Low Slip (s = 0.04)
        const sOp = 0.05 + 0.02 * Math.sin(t * 2);
        const opX = gLeft + sOp * gW;
        const opTNorm = (2 * (sOp / sm)) / (1 + Math.pow(sOp / sm, 2));
        const opY = gBot - opTNorm * gH;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(opX, opY, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Labels
        ctx.font = 'bold 6px monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('Tmax (Breakdown)', peakX - 22, peakY - 3);
        ctx.fillStyle = '#10b981';
        ctx.fillText('s_op:4%', opX + 4, opY + 4);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('s=0', gLeft, gBot + 6);
        ctx.fillText('s=1', gRight - 14, gBot + 6);

      } else if (type === 'solar_pv') {
        // Solar PV Cell Single-Diode Model & MPPT Tracking: Solar panel with changing sunlight intensity + I-V and P-V curves + moving MPPT marker
        const splitX = Math.floor(w * 0.42);

        // Irradiance variation G = 700 to 1000 W/m²
        const irrFrac = 0.75 + 0.25 * Math.sin(t * 1.5);
        const irrVal = Math.round(irrFrac * 1000);

        // --- LEFT: Solar PV Panel Module & Incident Sunlight Rays ---
        const pX = 10, pY = 16, pW = splitX - 18, pH = h - 24;

        // Incident Sunlight Photon Rays (pulsing yellow/amber lines)
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
        ctx.lineWidth = 1.2;
        for (let ray = 0; ray < 4; ray++) {
          const rx = pX + 4 + ray * 7;
          ctx.beginPath();
          ctx.moveTo(rx, 6);
          ctx.lineTo(rx + 4, pY);
          ctx.stroke();
        }

        // PV Panel Glass & Silicon Wafer Surface (Deep blue)
        ctx.fillStyle = '#1e3a8a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(pX, pY, pW, pH);

        // Photovoltaic Cell Busbars / Grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 0.8;
        // Horizontal grid
        ctx.beginPath();
        ctx.moveTo(pX, pY + pH * 0.5); ctx.lineTo(pX + pW, pY + pH * 0.5);
        // Vertical grid
        ctx.moveTo(pX + pW * 0.33, pY); ctx.lineTo(pX + pW * 0.33, pY + pH);
        ctx.moveTo(pX + pW * 0.66, pY); ctx.lineTo(pX + pW * 0.66, pY + pH);
        ctx.stroke();

        // Irradiance readout
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 7px monospace';
        ctx.fillText(`${irrVal}W/m²`, pX, h - 2);

        // --- RIGHT: Dual I-V and P-V Curves with Active MPPT Tracker ---
        const gLeft = splitX + 6, gRight = w - 8;
        const gW = gRight - gLeft;
        const gBot = h - 8;
        const gH = h * 0.72;

        // 1. Current-Voltage (I-V) Curve (Cyan #06b6d4)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const vFrac = (x - gLeft) / gW;
          const iNorm = Math.max(0, irrFrac * (1 - Math.exp(10 * (vFrac - 0.94))));
          const y = gBot - iNorm * (gH * 0.85);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 2. Power-Voltage (P-V) Curve (Amber #f59e0b)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        let mppX = gLeft, mppY = gBot, maxP = 0;
        for (let x = gLeft; x <= gRight; x++) {
          const vFrac = (x - gLeft) / gW;
          const iNorm = Math.max(0, irrFrac * (1 - Math.exp(10 * (vFrac - 0.94))));
          const pNorm = vFrac * iNorm * 1.45;
          const y = gBot - pNorm * gH;
          if (pNorm > maxP) {
            maxP = pNorm;
            mppX = x;
            mppY = y;
          }
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Animated Perturb & Observe (P&O) MPPT Tracking Marker
        const dither = Math.sin(t * 6) * 3;
        const trackX = mppX + dither;
        const trackVFrac = (trackX - gLeft) / gW;
        const trackINorm = Math.max(0, irrFrac * (1 - Math.exp(10 * (trackVFrac - 0.94))));
        const trackP = trackVFrac * trackINorm * 1.45;
        const trackY = gBot - trackP * gH;

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(trackX, trackY, 4, 0, Math.PI * 2);
        ctx.fill();

        // MPPT Radar Pulse Ring
        const pPulse = 4 + (Math.sin(t * 8) * 0.5 + 0.5) * 4;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(trackX, trackY, pPulse, 0, Math.PI * 2);
        ctx.stroke();

        // Labels
        ctx.font = 'bold 6px monospace';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('I-V', gLeft + 4, 10);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('P-V', gLeft + 24, 10);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('MPP (P&O)', trackX - 20, trackY - 6);

      } else if (type === 'rc_beam') {
        // Reinforced Concrete Beam Cross-Section, Whitney Stress Block & Force Couple
        const splitX = w * 0.46;

        // --- LEFT: Concrete Beam Cross-Section (b x h) with Rebar & Stirrup ---
        const bX = 22, bY = 9;
        const bW = splitX - 32, bH = h - 18;
        const cover = 4;
        const dEff = bH - 7; // Effective depth d to tension steel

        // Outer Concrete Rectangular Boundary (Slate #1e293b)
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.8;
        ctx.fillRect(bX, bY, bW, bH);
        ctx.strokeRect(bX, bY, bW, bH);

        // Internal Perimeter Shear Stirrup Tie (Dashed steel wire)
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([2, 1.5]);
        ctx.strokeRect(bX + cover, bY + cover, bW - 2 * cover, bH - 2 * cover);
        ctx.setLineDash([]);

        // Top 2 Compression Hanger Rebars
        [bX + cover + 3, bX + bW - cover - 3].forEach(rx => {
          ctx.fillStyle = '#94a3b8';
          ctx.beginPath();
          ctx.arc(rx, bY + cover + 3, 2, 0, Math.PI * 2);
          ctx.fill();
        });

        // Bottom 4 Longitudinal Tension Rebars (As, Cyan #38bdf8 with glow)
        const numBars = 4;
        for (let i = 0; i < numBars; i++) {
          const rx = bX + cover + 3 + i * ((bW - 2 * cover - 6) / (numBars - 1));
          const ry = bY + dEff;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(rx, ry, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Cross-section dimension callout
        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('b×h', bX + bW * 0.5 - 6, bY + bH * 0.5);

        // --- RIGHT: Whitney Equivalent Rectangular Compressive Stress Block ---
        const wLeft = splitX + 8;
        const wRight = w - 10;
        const wW = wRight - wLeft;

        // Beam depth datum axis
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wLeft, bY); ctx.lineTo(wLeft, bY + bH);
        ctx.stroke();

        // Neutral Axis (N.A.) dashed sky blue line at depth c
        const naDepth = bH * 0.42;
        const naY = bY + naDepth;
        ctx.strokeStyle = '#38bdf8';
        ctx.setLineDash([3, 2]);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(wLeft - 6, naY); ctx.lineTo(wRight, naY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Whitney Equivalent Compression Block (depth a = beta1 * c, uniform stress 0.85 f'c)
        const aDepth = naDepth * 0.85; // a = beta1 * c
        const blockW = wW * 0.52;
        ctx.fillStyle = 'rgba(249, 115, 22, 0.25)';
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 1.5;
        ctx.fillRect(wLeft, bY, blockW, aDepth);
        ctx.strokeRect(wLeft, bY, blockW, aDepth);

        // Hatching lines inside Whitney stress block
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.5)';
        ctx.lineWidth = 0.8;
        for (let y = bY + 3; y < bY + aDepth; y += 4) {
          ctx.beginPath(); ctx.moveTo(wLeft, y); ctx.lineTo(wLeft + blockW, y); ctx.stroke();
        }

        // Resultant Compressive Force Vector Cc (Orange pointing left into beam)
        const ccY = bY + aDepth * 0.5;
        ctx.strokeStyle = '#f97316';
        ctx.fillStyle = '#f97316';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(wLeft + blockW + 16, ccY); ctx.lineTo(wLeft + blockW, ccY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(wLeft + blockW, ccY);
        ctx.lineTo(wLeft + blockW + 4, ccY - 3);
        ctx.lineTo(wLeft + blockW + 4, ccY + 3);
        ctx.closePath();
        ctx.fill();

        // Resultant Tensile Force Vector Ts (Cyan pointing right)
        const tsY = bY + dEff;
        ctx.strokeStyle = '#38bdf8';
        ctx.fillStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(wLeft, tsY); ctx.lineTo(wLeft + blockW + 16, tsY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(wLeft + blockW + 16, tsY);
        ctx.lineTo(wLeft + blockW + 12, tsY - 3);
        ctx.lineTo(wLeft + blockW + 12, tsY + 3);
        ctx.closePath();
        ctx.fill();

        // Internal Moment Couple Lever Arm (d - a/2)
        ctx.strokeStyle = '#a855f7';
        ctx.setLineDash([2, 2]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wLeft + blockW + 10, ccY); ctx.lineTo(wLeft + blockW + 10, tsY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Micro Labels
        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#f97316';
        ctx.fillText('0.85 f\'c (a)', wLeft + 2, bY + aDepth * 0.6);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('N.A.', wRight - 22, naY - 2);
        ctx.fillStyle = '#f97316';
        ctx.fillText('Cc', wLeft + blockW + 18, ccY + 3);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('Ts=As·fy', wLeft + blockW + 18, tsY + 3);
        ctx.fillStyle = '#a855f7';
        ctx.fillText('Mn=Ts·(d-a/2)', wLeft + 4, h - 3);

      } else if (type === 'otto_cycle') {
        // Otto & Diesel 4-Stroke IC Engine Kinematics & Synchronized P-V Indicator Loop
        const splitX = w * 0.44;

        // Crankshaft & Piston Kinematics
        const Ocx = splitX * 0.5, Ocy = h - 11;
        const rCrank = 9;
        const lRod = 24;
        const crankAngle = t * 2.4;
        const pinX = Ocx + rCrank * Math.sin(crankAngle);
        const pinY = Ocy - rCrank * Math.cos(crankAngle);

        const pistonY = Ocy - rCrank * Math.cos(crankAngle) - Math.sqrt(Math.max(0, lRod * lRod - Math.pow(rCrank * Math.sin(crankAngle), 2)));
        const pistonW = 24, pistonH = 10;
        const pistonX = Ocx - pistonW * 0.5;

        // Cylinder Head and Walls
        const cylTop = 9, cylBot = h - 14;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pistonX - 3, cylTop); ctx.lineTo(pistonX - 3, cylBot);
        ctx.moveTo(pistonX + pistonW + 3, cylTop); ctx.lineTo(pistonX + pistonW + 3, cylBot);
        ctx.moveTo(pistonX - 3, cylTop); ctx.lineTo(pistonX + pistonW + 3, cylTop);
        ctx.stroke();

        // 4-Stroke Phase (Intake, Compression, Power, Exhaust across 720 deg)
        const cycleRad = (crankAngle % (Math.PI * 4) + Math.PI * 4) % (Math.PI * 4);
        let strokeName = 'INTAKE';
        let strokeColor = '#06b6d4';
        let chamberColor = 'rgba(6, 182, 212, 0.25)';

        if (cycleRad < Math.PI) {
          strokeName = 'INTAKE';
          strokeColor = '#06b6d4';
          chamberColor = 'rgba(6, 182, 212, 0.3)';
        } else if (cycleRad < Math.PI * 2) {
          strokeName = 'COMPRESSION';
          strokeColor = '#f59e0b';
          chamberColor = 'rgba(245, 158, 11, 0.35)';
        } else if (cycleRad < Math.PI * 3) {
          strokeName = 'POWER';
          strokeColor = '#ef4444';
          chamberColor = 'rgba(239, 68, 68, 0.6)';
        } else {
          strokeName = 'EXHAUST';
          strokeColor = '#a855f7';
          chamberColor = 'rgba(168, 85, 247, 0.25)';
        }

        // Combustion Chamber Gas Fill
        ctx.fillStyle = chamberColor;
        ctx.fillRect(pistonX - 2, cylTop + 1, pistonW + 4, Math.max(1, pistonY - cylTop));

        // Spark Ignition flash on Power stroke
        if (cycleRad >= Math.PI * 2 && cycleRad <= Math.PI * 2.3) {
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(Ocx, cylTop + 3, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Piston Block
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.fillRect(pistonX, pistonY, pistonW, pistonH);
        ctx.strokeRect(pistonX, pistonY, pistonW, pistonH);

        // Connecting Rod (Pinion -> Wrist pin)
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(Ocx, pistonY + pistonH * 0.5); ctx.lineTo(pinX, pinY);
        ctx.stroke();

        // Crank Counterweight & Pin
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(Ocx, Ocy); ctx.lineTo(pinX, pinY);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(Ocx, Ocy, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // --- RIGHT: Synchronized P-V Indicator Diagram ---
        const pvLeft = splitX + 10;
        const pvRight = w - 10;
        const pvW = pvRight - pvLeft;
        const pvBot = h - 12;
        const pvH = h * 0.72;

        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pvLeft, 10); ctx.lineTo(pvLeft, pvBot);
        ctx.lineTo(pvRight, pvBot);
        ctx.stroke();

        // Otto P-V 4-State Cycle Loop
        const pt1 = [pvRight - 4, pvBot - 4];
        const pt2 = [pvLeft + pvW * 0.22, pvBot - pvH * 0.35];
        const pt3 = [pvLeft + pvW * 0.22, pvBot - pvH * 0.95];
        const pt4 = [pvRight - 4, pvBot - pvH * 0.42];

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pt1[0], pt1[1]);
        ctx.quadraticCurveTo(pvLeft + pvW * 0.55, pvBot - pvH * 0.15, pt2[0], pt2[1]);
        ctx.lineTo(pt3[0], pt3[1]);
        ctx.quadraticCurveTo(pvLeft + pvW * 0.55, pvBot - pvH * 0.55, pt4[0], pt4[1]);
        ctx.closePath();
        ctx.stroke();

        // Calculate synchronized marker on P-V curve from engine phase
        let pvDot = pt1;
        if (cycleRad < Math.PI) {
          // Intake: horizontal isobar
          const f = cycleRad / Math.PI;
          pvDot = [pt2[0] + (pt1[0] - pt2[0]) * f, pt1[1]];
        } else if (cycleRad < Math.PI * 2) {
          // Compression: 1 -> 2
          const f = (cycleRad - Math.PI) / Math.PI;
          pvDot = [pt1[0] + (pt2[0] - pt1[0]) * f, pt1[1] + (pt2[1] - pt1[1]) * Math.pow(f, 1.4)];
        } else if (cycleRad < Math.PI * 2.4) {
          // Combustion: 2 -> 3
          const f = (cycleRad - Math.PI * 2) / 0.4;
          pvDot = [pt2[0], pt2[1] + (pt3[1] - pt2[1]) * f];
        } else if (cycleRad < Math.PI * 3) {
          // Power expansion: 3 -> 4
          const f = (cycleRad - Math.PI * 2.4) / (Math.PI * 0.6);
          pvDot = [pt3[0] + (pt4[0] - pt3[0]) * f, pt3[1] + (pt4[1] - pt3[1]) * Math.pow(f, 0.7)];
        } else {
          // Exhaust blowdown & expulsion: 4 -> 1
          const f = (cycleRad - Math.PI * 3) / Math.PI;
          pvDot = [pt4[0] + (pt1[0] - pt4[0]) * f, pt4[1] + (pt1[1] - pt4[1]) * f];
        }

        ctx.fillStyle = strokeColor;
        ctx.beginPath();
        ctx.arc(pvDot[0], pvDot[1], 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Stroke Name Badge
        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = strokeColor;
        ctx.fillText(strokeName, pvRight - 55, 12);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('P-V', pvLeft + 3, 10);

      } else if (type === 'projectile') {
        // Projectile Motion & Ballistics with Aerodynamic Drag
        const pStartX = 22, pStartY = h - 12;
        const gBot = pStartY;

        // Ground baseline
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, gBot); ctx.lineTo(w - 10, gBot);
        ctx.stroke();

        // Cannon barrel at 45 deg
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(pStartX - 6, pStartY + 2); ctx.lineTo(pStartX + 8, pStartY - 8);
        ctx.stroke();

        // 1. Ideal Vacuum Path (Dashed Slate/Cyan Parabola)
        const vacEndX = w * 0.88;
        const vacApexX = pStartX + (vacEndX - pStartX) * 0.5;
        const vacApexY = 9;

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.setLineDash([3, 2]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pStartX, pStartY);
        ctx.quadraticCurveTo(vacApexX, vacApexY - 8, vacEndX, pStartY);
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. Realistic Aerodynamic Quadratic Drag Path (Solid Amber #f59e0b)
        // Steeper descent, lower apogee, shorter range
        const dragEndX = w * 0.56;
        const dragApexX = pStartX + (dragEndX - pStartX) * 0.42; // Apogee shifted backward
        const dragApexY = 19;

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(pStartX, pStartY);
        ctx.bezierCurveTo(pStartX + (dragApexX - pStartX) * 0.8, dragApexY - 4, dragApexX + 15, dragApexY - 2, dragEndX, pStartY);
        ctx.stroke();

        // Projectile along Drag Trajectory
        const flightTime = (t * 0.9) % 1.0;
        // Bezier evaluation for drag path
        const u = 1 - flightTime;
        const tt = flightTime * flightTime;
        const uu = u * u;
        const cp1x = pStartX + (dragApexX - pStartX) * 0.8, cp1y = dragApexY - 4;
        const cp2x = dragApexX + 15, cp2y = dragApexY - 2;

        const bX = uu * u * pStartX + 3 * uu * flightTime * cp1x + 3 * u * tt * cp2x + tt * flightTime * dragEndX;
        const bY = uu * u * pStartY + 3 * uu * flightTime * cp1y + 3 * u * tt * cp2y + tt * flightTime * pStartY;

        // Velocity vector arrow (Cyan)
        const bVx = 3 * uu * (cp1x - pStartX) + 6 * u * flightTime * (cp2x - cp1x) + 3 * tt * (dragEndX - cp2x);
        const bVy = 3 * uu * (cp1y - pStartY) + 6 * u * flightTime * (cp2y - cp1y) + 3 * tt * (pStartY - cp2y);
        const vLen = Math.hypot(bVx, bVy);
        if (vLen > 0) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(bX, bY); ctx.lineTo(bX + (bVx / vLen) * 9, bY + (bVy / vLen) * 9);
          ctx.stroke();

          // Opposing Drag Force vector (Red)
          ctx.strokeStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(bX, bY); ctx.lineTo(bX - (bVx / vLen) * 7, bY - (bVy / vLen) * 7);
          ctx.stroke();
        }

        // Projectile Cannonball
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(bX, bY, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Ghost Projectile along Ideal Vacuum Path
        const vacU = 1 - flightTime;
        const vacX = pStartX * vacU * vacU + 2 * vacU * flightTime * vacApexX + flightTime * flightTime * vacEndX;
        const vacY = pStartY * vacU * vacU + 2 * vacU * flightTime * (vacApexY - 8) + flightTime * flightTime * pStartY;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.beginPath();
        ctx.arc(vacX, vacY, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Delta Range Marker (Range Loss)
        ctx.strokeStyle = '#f43f5e';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(dragEndX, gBot + 3); ctx.lineTo(vacEndX, gBot + 3);
        ctx.stroke();
        ctx.setLineDash([]);

        // Micro Legends
        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.fillText('IDEAL VACUUM', w - 74, 12);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('AIR DRAG (Cd)', w - 74, 23);
        ctx.fillStyle = '#f43f5e';
        ctx.fillText('ΔR RANGE LOSS', dragEndX + 8, gBot + 10);

      } else if (type === 'centrifugal_pump') {
        // Centrifugal Pump Impeller Flow & System Operating Duty Point
        const splitX = w * 0.44;

        // --- LEFT: Centrifugal Pump Volute & Rotating Impeller ---
        const px = splitX * 0.48, py = midY;
        const impR = 17;

        // Volute Spiral Casing
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(px, py, impR + 5, 0, Math.PI * 1.6);
        // Discharge nozzle tangent
        ctx.lineTo(px + impR + 10, py - impR - 6);
        ctx.lineTo(px + impR + 3, py - impR - 6);
        ctx.stroke();

        // Rotating Backward-Curved Impeller Vanes
        const impAngle = t * 3.2;
        const numVanes = 6;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.8;
        for (let i = 0; i < numVanes; i++) {
          const a = impAngle + (i * Math.PI * 2) / numVanes;
          const rInner = 5, rOuter = impR;
          const x1 = px + rInner * Math.cos(a), y1 = py + rInner * Math.sin(a);
          const x2 = px + rOuter * Math.cos(a + 0.5), y2 = py + rOuter * Math.sin(a + 0.5);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.quadraticCurveTo(px + (rInner + 6) * Math.cos(a + 0.2), py + (rInner + 6) * Math.sin(a + 0.2), x2, y2);
          ctx.stroke();
        }

        // Center Suction Eye
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();

        // Animated Water Flow (Suction in -> Discharge out)
        const flowT = (t * 24) % 40;
        // Radial out particles
        for (let i = 0; i < 3; i++) {
          const rFrac = ((flowT + i * 14) % 30) / 30;
          const a = impAngle + i * 2.1 + rFrac * 1.5;
          const fx = px + (5 + rFrac * 14) * Math.cos(a);
          const fy = py + (5 + rFrac * 14) * Math.sin(a);
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Discharge exit jet particles
        for (let i = 0; i < 2; i++) {
          const dy = py - impR - ((flowT + i * 20) % 18);
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.arc(px + impR + 6, dy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 7px monospace';
        ctx.fillText('IMPELLER', 8, 12);

        // --- RIGHT: H-Q Pump vs System Resistance Curves ---
        const gLeft = splitX + 8;
        const gRight = w - 10;
        const gW = gRight - gLeft;
        const gBot = h - 12;
        const gH = h * 0.72;

        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gLeft, 10); ctx.lineTo(gLeft, gBot);
        ctx.lineTo(gRight, gBot);
        ctx.stroke();

        // Pump Head Curve H_pump(Q) = H0 - kp * Q^2 (Cyan)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const qFrac = (x - gLeft) / gW;
          const hNorm = 0.95 - 0.72 * qFrac * qFrac;
          const y = gBot - hNorm * gH;
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // System Friction Curve H_sys(Q) = H_stat + k_pipe * Q^2 (Emerald)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const qFrac = (x - gLeft) / gW;
          const hNorm = 0.22 + 0.88 * qFrac * qFrac;
          const y = gBot - hNorm * gH;
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Duty Point Intersection (Q_duty, H_duty)
        const dutyQFrac = 0.67;
        const dutyX = gLeft + dutyQFrac * gW;
        const dutyY = gBot - (0.95 - 0.72 * dutyQFrac * dutyQFrac) * gH;

        // Dashed Projection Lines
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(dutyX, gBot); ctx.lineTo(dutyX, dutyY); ctx.lineTo(gLeft, dutyY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Pulsing Duty Point Target
        const pulseR = 3.5 + Math.sin(t * 6) * 1.5;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(dutyX, dutyY, pulseR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('H-PUMP', gLeft + 4, 12);
        ctx.fillStyle = '#10b981';
        ctx.fillText('H-SYS', gRight - 36, gBot - gH * 0.85);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('DUTY POINT', dutyX - 24, dutyY - 6);

      } else if (type === 'refrigeration_cycle') {
        // Vapor-Compression Refrigeration Loop & Miniature P-h Mollier Diagram
        const splitX = w * 0.52;

        // --- LEFT: 4-Component Refrigerant Loop ---
        const rLeft = 16, rRight = splitX - 10;
        const rTop = 13, rBot = h - 13;

        // Base piping rectangle
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(rLeft, rTop, rRight - rLeft, rBot - rTop);

        // 1. Compressor (Bottom Left, Red #ef4444)
        const compX = rLeft + 8, compY = rBot;
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(compX, compY, 7, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Compressor moving piston stroke
        const compStroke = Math.sin(t * 7) * 3;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(compX - 3 + compStroke, compY - 3, 6, 6);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 6.5px monospace';
        ctx.fillText('COMP', compX - 8, compY + 11);

        // 2. Condenser (Top, Heat Rejection #f59e0b)
        const condX1 = rLeft + 16, condX2 = rRight - 16;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = condX1; x <= condX2; x += 6) {
          ctx.moveTo(x, rTop - 4); ctx.lineTo(x + 3, rTop + 4);
        }
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 6.5px monospace';
        ctx.fillText('COND (Qout)', condX1, rTop - 5);

        // 3. Thermostatic Expansion Valve TXV (Right, Emerald #10b981)
        const txvX = rRight, txvY = midY;
        ctx.fillStyle = '#10b981';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Hourglass throttling restriction
        ctx.moveTo(txvX - 5, txvY - 6); ctx.lineTo(txvX + 5, txvY - 6);
        ctx.lineTo(txvX - 5, txvY + 6); ctx.lineTo(txvX + 5, txvY + 6);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 6.5px monospace';
        ctx.fillText('TXV', txvX - 22, txvY + 2);

        // 4. Evaporator (Bottom, Cooling #06b6d4)
        const evapX1 = rLeft + 24, evapX2 = rRight - 12;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = evapX1; x <= evapX2; x += 6) {
          ctx.moveTo(x, rBot - 4); ctx.lineTo(x + 3, rBot + 4);
        }
        ctx.stroke();

        ctx.fillStyle = '#06b6d4';
        ctx.font = 'bold 6.5px monospace';
        ctx.fillText('EVAP (Qin)', evapX1, rBot - 5);

        // Animated Refrigerant Beads (Changing Color Across Cycle)
        const rTime = (t * 22) % 100;
        // High-P vapor: Compressor -> Condenser (Red/Orange)
        for (let i = 0; i < 2; i++) {
          const fy = rBot - ((rTime + i * 50) % (rBot - rTop));
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(rLeft, fy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        // Subcooling liquid: Condenser -> TXV (Amber)
        for (let i = 0; i < 2; i++) {
          const fy = rTop + ((rTime + i * 50) % (txvY - rTop));
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(rRight, fy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        // Flash liquid-vapor mixture: TXV -> Evaporator (Cyan)
        for (let i = 0; i < 2; i++) {
          const fy = txvY + ((rTime + i * 50) % (rBot - txvY));
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(rRight, fy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
        // Low-P saturated vapor: Evaporator -> Compressor (Ice Blue)
        for (let i = 0; i < 3; i++) {
          const fx = rRight - ((rTime + i * 33) % (rRight - (compX + 8)));
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.arc(fx, rBot, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // --- RIGHT: Miniature P-h (Pressure-Enthalpy) Diagram ---
        const phLeft = splitX + 8;
        const phRight = w - 10;
        const phW = phRight - phLeft;
        const phBot = h - 12;
        const phH = h * 0.72;

        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(phLeft, 10); ctx.lineTo(phLeft, phBot);
        ctx.lineTo(phRight, phBot);
        ctx.stroke();

        // Skewed P-h Vapor Dome (Mollier saturation curve)
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(phLeft + phW * 0.12, phBot);
        ctx.quadraticCurveTo(phLeft + phW * 0.42, 10, phLeft + phW * 0.88, phBot);
        ctx.stroke();

        // 4 State Points on P-h:
        // 1: Saturated/Superheated vapor at P_low
        // 2: Compressed high-temp vapor at P_high (slanted right)
        // 3: Saturated/Subcooled liquid at P_high
        // 4: Throttled mixture at P_low (strictly vertical drop h3 = h4)
        const p1 = [phLeft + phW * 0.78, phBot - phH * 0.28];
        const p2 = [phLeft + phW * 0.92, phBot - phH * 0.85];
        const p3 = [phLeft + phW * 0.32, phBot - phH * 0.85];
        const p4 = [phLeft + phW * 0.32, phBot - phH * 0.28];

        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.lineTo(p2[0], p2[1]);
        ctx.lineTo(p3[0], p3[1]);
        ctx.lineTo(p4[0], p4[1]);
        ctx.closePath();
        ctx.stroke();

        // Orbiting state indicator dot
        const cPhase = (t * 2.2) % 4.0;
        let cPt = p1;
        if (cPhase < 1.0) {
          const f = cPhase;
          cPt = [p1[0] + (p2[0] - p1[0]) * f, p1[1] + (p2[1] - p1[1]) * f];
        } else if (cPhase < 2.0) {
          const f = cPhase - 1.0;
          cPt = [p2[0] + (p3[0] - p2[0]) * f, p2[1]];
        } else if (cPhase < 3.0) {
          const f = cPhase - 2.0;
          cPt = [p3[0], p3[1] + (p4[1] - p3[1]) * f];
        } else {
          const f = cPhase - 3.0;
          cPt = [p4[0] + (p1[0] - p4[0]) * f, p4[1]];
        }

        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(cPt[0], cPt[1], 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('P-h', phLeft + 3, 10);
        ctx.fillStyle = '#ec4899';
        ctx.fillText('COP', phRight - 22, 10);

      } else if (type === 'bode_plot') {
        // Industrial Frequency Response Analyzer: Dual Bode (Mag/Phase) & Polar Nyquist Trajectory
        const splitX = w * 0.52;

        // --- LEFT: Dual Logarithmic Bode Plot (Mag on Top, Phase on Bottom) ---
        const bLeft = 16, bRight = splitX - 10;
        const bW = bRight - bLeft;
        const magTop = 10, magH = (h - 22) * 0.46;
        const phaseTop = magTop + magH + 4, phaseH = magH;

        // 1. Magnitude Plot Box
        ctx.fillStyle = '#050a14';
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bLeft, magTop, bW, magH);

        // 0 dB Unity Gain Line
        const db0Y = magTop + magH * 0.5;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(bLeft, db0Y); ctx.lineTo(bRight, db0Y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Bode Magnitude Curve (Emerald #10b981)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        for (let x = bLeft; x <= bRight; x++) {
          const fNorm = (x - bLeft) / bW;
          const magDb = 1 / Math.sqrt(Math.pow(1 - Math.pow(fNorm * 2.8, 2), 2) + Math.pow(2 * 0.35 * fNorm * 2.8, 2));
          const y = (db0Y) - (Math.log10(magDb) * 12);
          if (x === bLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 2. Phase Plot Box
        ctx.strokeRect(bLeft, phaseTop, bW, phaseH);

        // -180 deg Phase Crossover Line
        const deg180Y = phaseTop + phaseH * 0.78;
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(bLeft, deg180Y); ctx.lineTo(bRight, deg180Y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Bode Phase Curve (Cyan #06b6d4)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        for (let x = bLeft; x <= bRight; x++) {
          const fNorm = (x - bLeft) / bW;
          const phi = Math.atan2(2 * 0.35 * fNorm * 2.8, 1 - Math.pow(fNorm * 2.8, 2));
          const y = phaseTop + (phi / Math.PI) * (phaseH * 0.85);
          if (x === bLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Highlight Phase Margin (PM) with Cyan Caliper Bracket at 0 dB gain crossover
        const gcX = bLeft + bW * 0.44;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(gcX, phaseTop + 2); ctx.lineTo(gcX, deg180Y);
        ctx.stroke();

        // Highlight Gain Margin (GM) with Amber Caliper Bracket at -180 deg phase crossover
        const pcX = bLeft + bW * 0.72;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pcX, magTop + 2); ctx.lineTo(pcX, db0Y);
        ctx.stroke();

        // --- RIGHT: Polar Nyquist Diagram & Critical Point (-1, j0) ---
        const nyqLeft = splitX + 8;
        const nyqRight = w - 10;
        const nyqW = nyqRight - nyqLeft;
        const nyqCx = nyqLeft + nyqW * 0.62;
        const nyqCy = midY;

        // Complex Plane Axes
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nyqLeft, nyqCy); ctx.lineTo(nyqRight, nyqCy);
        ctx.moveTo(nyqCx, 10); ctx.lineTo(nyqCx, h - 10);
        ctx.stroke();

        // Unit Circle |G| = 1 (Dashed)
        const uR = 16;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(nyqCx, nyqCy, uR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Critical Point (-1, j0) (Crimson Crosshair)
        const critX = nyqCx - uR;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(critX - 3.5, nyqCy - 3.5); ctx.lineTo(critX + 3.5, nyqCy + 3.5);
        ctx.moveTo(critX + 3.5, nyqCy - 3.5); ctx.lineTo(critX - 3.5, nyqCy + 3.5);
        ctx.stroke();

        // Polar Nyquist Trajectory (Violet #8b5cf6)
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(nyqCx, nyqCy);
        ctx.bezierCurveTo(nyqCx - 4, nyqCy - 22, nyqCx - 28, nyqCy - 16, nyqCx - 12, nyqCy);
        ctx.bezierCurveTo(nyqCx - 28, nyqCy + 16, nyqCx - 4, nyqCy + 22, nyqCx, nyqCy);
        ctx.stroke();

        // Dynamic Frequency Probe Dot Orbiting Nyquist Locus
        const nPhase = (t * 2.2) % (Math.PI * 2);
        const ptX = nyqCx - 14 + 11 * Math.cos(nPhase);
        const ptY = nyqCy + 9 * Math.sin(nPhase);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(ptX, ptY, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Micro Labels
        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#10b981';
        ctx.fillText('BODE GM/PM', bLeft + 2, 8);
        ctx.fillStyle = '#a855f7';
        ctx.fillText('NYQUIST', nyqLeft + 4, 8);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('(-1,j0)', critX - 16, nyqCy - 5);

      } else if (type === 'root_locus') {
        // Evans Root Locus Plotter: Complex s-Plane, Stability Boundaries & Moving Poles
        const sCx = w * 0.55;
        const sCy = midY;

        // Stability Region Shading:
        // Left-Half Plane (LHP, sigma < 0): Stable (Dark Emerald Tint)
        ctx.fillStyle = 'rgba(6, 78, 59, 0.12)';
        ctx.fillRect(10, 8, sCx - 10, h - 16);
        // Right-Half Plane (RHP, sigma > 0): Unstable (Dark Crimson Tint)
        ctx.fillStyle = 'rgba(127, 29, 29, 0.12)';
        ctx.fillRect(sCx, 8, w - 10 - sCx, h - 16);

        // Real (sigma) and Imaginary (j*omega) Axes
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, sCy); ctx.lineTo(w - 10, sCy); // Real axis
        ctx.stroke();

        // Bold Imaginary j*omega Stability Boundary
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(sCx, 8); ctx.lineTo(sCx, h - 8);
        ctx.stroke();

        // Centroid & Asymptotes (Amber Dashed at +/- 90 deg)
        const sigmaA = sCx - 28;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(sigmaA, 8); ctx.lineTo(sigmaA, h - 8);
        ctx.stroke();
        ctx.setLineDash([]);

        // Open-Loop Poles (P0 at origin, P1 at -2, P2 at -5)
        const p0x = sCx;
        const p1x = sCx - 38;
        const p2x = sCx - 76;
        const zeroX = sCx - 58; // Open-loop zero at -4

        // Draw Open-Loop Poles (Blue 'x')
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        [p0x, p1x, p2x].forEach(px => {
          ctx.beginPath();
          ctx.moveTo(px - 3.5, sCy - 3.5); ctx.lineTo(px + 3.5, sCy + 3.5);
          ctx.moveTo(px + 3.5, sCy - 3.5); ctx.lineTo(px - 3.5, sCy + 3.5);
          ctx.stroke();
        });

        // Draw Open-Loop Zero (Emerald 'o')
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(zeroX, sCy, 3.5, 0, Math.PI * 2);
        ctx.stroke();

        // Root Locus Real Axis Segments (Cyan)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p0x, sCy); ctx.lineTo(p1x, sCy); // Segment between 0 and -2
        ctx.moveTo(zeroX, sCy); ctx.lineTo(p2x, sCy); // Segment between -4 and -5
        ctx.stroke();

        // Curved Root Locus Breakaway Branches escaping to asymptotes
        const breakX = sCx - 19;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(breakX, sCy);
        ctx.quadraticCurveTo(sCx - 32, sCy - 26, sigmaA, 8);
        ctx.moveTo(breakX, sCy);
        ctx.quadraticCurveTo(sCx - 32, sCy + 26, sigmaA, h - 8);
        ctx.stroke();

        // Moving Closed-Loop Poles sliding along branches as Gain K varies (Rose #f43f5e)
        const kSweep = 0.5 + 0.5 * Math.sin(t * 2.2);
        const poleYOffset = 4 + kSweep * (h * 0.36);
        const poleX = breakX - kSweep * 9;

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(poleX, sCy - poleYOffset, 4, 0, Math.PI * 2);
        ctx.arc(poleX, sCy + poleYOffset, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Region & EVANS Labels
        ctx.font = 'bold 7px monospace';
        ctx.fillStyle = '#10b981';
        ctx.fillText('STABLE LHP', 14, 12);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('UNSTABLE RHP', sCx + 6, 12);
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('ROOT LOCUS (K)', w * 0.36, h - 3);

      } else if (type === 'batch_pfr') {
        // Batch Reactor & Plug Flow Reactor (PFR) Kinetics: Dual reactor comparison (Batch tank vs Tubular PFR) + Concentration & Conversion XA
        const splitX = Math.floor(w * 0.48);

        // --- LEFT: Dual Reactor Topology Comparison (Top: Batch Stirred Tank, Bottom: Tubular PFR) ---
        const rLeft = 10, rW = splitX - 18;

        // 1. Batch Reactor Vessel (Top)
        const bCx = rLeft + rW * 0.25, bCy = 14;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(bCx - 10, bCy - 9, 20, 18, 4);
        ctx.fill(); ctx.stroke();
        // Stirrer blade
        ctx.strokeStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(bCx, bCy - 8); ctx.lineTo(bCx, bCy + 4);
        ctx.moveTo(bCx - 5 * Math.cos(t * 5), bCy + 4); ctx.lineTo(bCx + 5 * Math.cos(t * 5), bCy + 4);
        ctx.stroke();
        ctx.font = 'bold 6px monospace';
        ctx.fillStyle = '#8b5cf6';
        ctx.fillText('BATCH (t)', bCx + 13, bCy + 2);

        // 2. Tubular Plug Flow Reactor PFR (Bottom)
        const pY = h - 16;
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.4;
        ctx.strokeRect(rLeft, pY - 5, rW, 10);

        // Moving fluid plugs with flat velocity profile transitioning from Reactant A (Cyan) -> Product B (Amber)
        const pLen = rW - 4;
        for (let plug = 0; plug < 4; plug++) {
          const plugFrac = ((t * 20 + plug * 22) % pLen) / pLen;
          const px = rLeft + 2 + plugFrac * pLen;
          ctx.fillStyle = plugFrac < 0.5 ? '#06b6d4' : '#f59e0b';
          ctx.fillRect(px, pY - 4, 3, 8);
        }
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('TUBULAR PFR (τ = V/v0)', rLeft, pY - 7);

        // --- RIGHT: Reaction Kinetics Trajectories CA(t), CB(t) and Conversion XA ---
        const gLeft = splitX + 6, gRight = w - 8;
        const gW = gRight - gLeft;
        const gBot = h - 8;
        const gH = h * 0.72;

        // Reactant A Decay Curve: CA(t) = CA0 * exp(-k*t) (Cyan #06b6d4)
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const frac = (x - gLeft) / gW;
          const cA = Math.exp(-2.8 * frac);
          const y = gBot - cA * gH;
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Product B Accumulation Curve: CB(t) = CA0 * (1 - exp(-k*t)) (Amber #f59e0b)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const frac = (x - gLeft) / gW;
          const cB = 1 - Math.exp(-2.8 * frac);
          const y = gBot - cB * gH;
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Fractional Conversion Curve XA (Emerald #10b981)
        ctx.strokeStyle = '#10b981';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const frac = (x - gLeft) / gW;
          const xA = 1 - Math.exp(-2.8 * frac);
          const y = gBot - xA * gH;
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Dynamic reaction progress scan dot
        const scanFrac = (t * 0.5) % 1;
        const scanX = gLeft + scanFrac * gW;
        const scanCA = gBot - Math.exp(-2.8 * scanFrac) * gH;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(scanX, scanCA, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Telemetry
        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#06b6d4'; ctx.fillText('CA', gLeft, 10);
        ctx.fillStyle = '#f59e0b'; ctx.fillText('CB', gLeft + 16, 10);
        ctx.fillStyle = '#10b981'; ctx.fillText('XA: 94.8%', gRight - 46, 10);
        ctx.fillStyle = '#cbd5e1'; ctx.fillText('Da: 2.8 (1st Ord)', gLeft, h - 3);

      } else if (type === 'photoelectric') {
        // Photoelectric Effect & Einstein Quantum Work Function: Vacuum phototube apparatus + Stopping potential Vstop & Kmax
        const splitX = Math.floor(w * 0.48);

        // --- LEFT: Quantum Phototube Vacuum Chamber ---
        const tLeft = 10, tW = splitX - 18;
        const tMidY = h * 0.5;

        // Evacuated Glass Tube Envelope
        ctx.fillStyle = '#090d16';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(tLeft, 8, tW, h - 16, 8);
        ctx.fill(); ctx.stroke();

        // Metal Cathode Emitter (Left, Work Function Phi = 2.36 eV, Sodium)
        const catX = tLeft + 8;
        ctx.fillStyle = '#475569';
        ctx.fillRect(catX, 12, 5, h - 24);
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 5.5px monospace';
        ctx.fillText('CAT', catX - 7, tMidY);

        // Collector Anode Plate (Right)
        const anoX = tLeft + tW - 12;
        ctx.fillStyle = '#334155';
        ctx.fillRect(anoX, 12, 4, h - 24);
        ctx.fillText('ANO', anoX + 6, tMidY);

        // Incoming Monochromatic Light Wave-Packets (Photons, h*nu)
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.6;
        for (let p = 0; p < 2; p++) {
          const pPhase = t * 8 + p * 3;
          ctx.beginPath();
          for (let x = tLeft + 2; x < catX; x++) {
            const y = 16 + p * 16 + Math.sin(x * 0.6 + pPhase) * 3;
            if (x === tLeft + 2) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Ejected Photoelectrons (Cyan particles flying towards anode with Kmax)
        for (let e = 0; e < 4; e++) {
          const eFrac = ((t * 1.2 + e * 0.28) % 1.0);
          const ex = catX + 5 + eFrac * (anoX - catX - 7);
          const ey = 14 + e * 7 + Math.sin(eFrac * Math.PI) * 2;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(ex, ey, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }

        // --- RIGHT: Einstein Stopping Potential Relation & Energy Conservation ---
        const gLeft = splitX + 6, gRight = w - 8;
        const gW = gRight - gLeft;
        const gBot = h - 8;
        const gH = h * 0.72;

        // Einstein Linear Relation: Kmax = h*nu - Phi (Slope = h, intercept = -Phi)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        const f0Frac = 0.32;
        ctx.moveTo(gLeft + f0Frac * gW, gBot);
        ctx.lineTo(gRight, gBot - gH * 0.9);
        ctx.stroke();

        // Threshold Cutoff Frequency Marker f0
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(gLeft + f0Frac * gW, gBot, 3.2, 0, Math.PI * 2);
        ctx.fill();

        // Negative work function intercept below axis (dashed)
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(gLeft, gBot + 4);
        ctx.lineTo(gLeft + f0Frac * gW, gBot);
        ctx.stroke();
        ctx.setLineDash([]);

        // Photocurrent I vs Retarding Voltage V curve (Sharp cutoff at -Vstop)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const vFrac = (x - gLeft) / gW;
          let iNorm = 0;
          if (vFrac >= 0.25) {
            iNorm = 1 - Math.exp(-6 * (vFrac - 0.25));
          }
          const y = gBot - iNorm * (gH * 0.55);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Annotations
        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#c084fc'; ctx.fillText('hν: 4.14eV', gLeft, 10);
        ctx.fillStyle = '#f59e0b'; ctx.fillText('Φ: 2.36eV (Na)', gLeft + 48, 10);
        ctx.fillStyle = '#38bdf8'; ctx.fillText('Vstop: -1.78V', gRight - 54, h - 3);

      } else if (type === 'column_buckling') {
        // Euler Column Buckling & P-Delta Instability: Compressive load, lateral sinusoidal deflection + AISC 360-16 column curve
        const splitX = Math.floor(w * 0.44);

        // --- LEFT: Vertical Column Member with Boundary Constraints & Lateral Deflection ---
        const colX = splitX * 0.48;
        const colTop = 10, colBot = h - 10;
        const colH = colBot - colTop;

        // Undeflected Centroidal Reference Axis (Dashed Slate)
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.4)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(colX, colTop); ctx.lineTo(colX, colBot);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated Lateral Buckling Deflection w(x) = delta * sin(pi * y / L) (Cyan #06b6d4)
        const amp = 9 + Math.sin(t * 3.5) * 2.2;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let y = colTop; y <= colBot; y++) {
          const frac = (y - colTop) / colH;
          const latDef = Math.sin(frac * Math.PI) * amp;
          const px = colX + latDef;
          if (y === colTop) ctx.moveTo(px, y);
          else ctx.lineTo(px, y);
        }
        ctx.stroke();

        // Top Pinned Hinge Support
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(colX, colTop, 3.5, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Bottom Fixed / Pinned Base Support
        ctx.beginPath();
        ctx.moveTo(colX - 8, colBot); ctx.lineTo(colX + 8, colBot);
        ctx.lineTo(colX + 5, colBot + 4); ctx.lineTo(colX - 5, colBot + 4);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Axial Compressive Load Arrow P (Rose #f43f5e) pulsing downward
        const pPulse = Math.sin(t * 3.5) * 2;
        ctx.strokeStyle = '#f43f5e';
        ctx.fillStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(colX, 2); ctx.lineTo(colX, colTop - 4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(colX, colTop - 2 + pPulse);
        ctx.lineTo(colX - 3.5, colTop - 6 + pPulse);
        ctx.lineTo(colX + 3.5, colTop - 6 + pPulse);
        ctx.closePath();
        ctx.fill();

        ctx.font = 'bold 6px monospace';
        ctx.fillStyle = '#f43f5e'; ctx.fillText('P:3500kN', 4, 10);
        ctx.fillStyle = '#06b6d4'; ctx.fillText('K=1.0', 4, h - 3);

        // --- RIGHT: AISC 360-16 Inelastic/Elastic Column Curve & P-Delta ---
        const gLeft = splitX + 6, gRight = w - 8;
        const gW = gRight - gLeft;
        const gBot = h - 8;
        const gH = h * 0.72;

        // Slenderness Axis λ on Bottom
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gLeft, gBot); ctx.lineTo(gRight, gBot);
        ctx.stroke();

        // AISC Critical Buckling Curve Fcr(λ) (Amber #f59e0b)
        // Transitions from Johnson inelastic parabola to Euler elastic hyperbola at λ_c = 4.71*sqrt(E/Fy) ≈ 113
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const lamTransFrac = 0.52;
        for (let x = gLeft; x <= gRight; x++) {
          const frac = (x - gLeft) / gW;
          let fNorm = 0;
          if (frac <= lamTransFrac) {
            // Inelastic Johnson: 1 - 0.45 * (frac/lamTransFrac)^2
            fNorm = 0.92 - 0.38 * Math.pow(frac / lamTransFrac, 1.8);
          } else {
            // Elastic Euler hyperbola ~ 1 / λ²
            const ratio = lamTransFrac / Math.max(0.01, frac);
            fNorm = 0.54 * Math.pow(ratio, 1.9);
          }
          const y = gBot - fNorm * gH;
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Active Column Slenderness Operating Marker (Emerald #10b981)
        const opFrac = 0.38;
        const opX = gLeft + opFrac * gW;
        const opY = gBot - (0.92 - 0.38 * Math.pow(opFrac / lamTransFrac, 1.8)) * gH;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(opX, opY, 3.8, 0, Math.PI * 2);
        ctx.fill();

        // Annotations
        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#10b981'; ctx.fillText('Pcr: 8277kN', gLeft, 10);
        ctx.fillStyle = '#f59e0b'; ctx.fillText('λ: 63.9', gRight - 36, 10);
        ctx.fillStyle = '#cbd5e1'; ctx.fillText('P-Δ: 1.73x | AISC 360', gLeft, h - 3);

      } else if (type === 'liquid_extraction') {
        // Liquid-Liquid Extraction (LLE) & Ternary Phase Equilibrium: Countercurrent RDC column + Hunter-Nash ternary diagram
        const splitX = Math.floor(w * 0.42);

        // --- LEFT: Countercurrent Liquid-Liquid Extraction Column (RDC Column) ---
        const colCx = splitX * 0.48;
        const colW = 20, colTop = 8, colBot = h - 8;

        // Column Shell (Domed top and bottom)
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(colCx - colW * 0.5, colTop, colW, colBot - colTop, 5);
        ctx.fill(); ctx.stroke();

        // Central Rotating Agitator Shaft & Rotor Discs (Amber #f59e0b)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(colCx, colTop + 2); ctx.lineTo(colCx, colBot - 2);
        ctx.stroke();

        const numRotors = 4;
        const rSpacing = (colBot - colTop - 12) / (numRotors + 1);
        for (let r = 1; r <= numRotors; r++) {
          const ry = colTop + 6 + r * rSpacing;
          const discSpan = Math.cos(t * 6 + r) * 7;
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(colCx - discSpan, ry); ctx.lineTo(colCx + discSpan, ry);
          ctx.stroke();

          // Stator baffle rings on column wall
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(colCx - colW * 0.5, ry - 3); ctx.lineTo(colCx - colW * 0.5 + 4, ry - 3);
          ctx.moveTo(colCx + colW * 0.5 - 4, ry - 3); ctx.lineTo(colCx + colW * 0.5, ry - 3);
          ctx.stroke();
        }

        // Ascending Dispersed Droplets (Light Solvent Extract Phase, Cyan #06b6d4)
        for (let d = 0; d < 5; d++) {
          const dropFrac = ((t * 20 + d * 22) % 100) / 100;
          const dy = (colBot - 6) - dropFrac * (colBot - colTop - 12);
          const dx = colCx - 4 + Math.sin(dropFrac * Math.PI * 4 + d) * 3;
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.arc(dx, dy, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Continuous Heavy Raffinate Phase (Descending downward, Rose #f43f5e)
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 5.5px monospace';
        ctx.fillText('E1', colCx + 12, colTop + 6);
        ctx.fillText('RN', colCx - 18, colBot - 2);

        // --- RIGHT: Equilateral Gibbs Ternary Phase Diagram & Hunter-Nash Stages ---
        const gLeft = splitX + 8, gRight = w - 8;
        const gW = gRight - gLeft;
        const gBot = h - 8;
        const gTop = 10;
        const gH = gBot - gTop;

        // Equilateral Triangular Boundary (Carrier A, Solute B, Solvent C)
        const tApexX = gLeft + gW * 0.5, tApexY = gTop + 2;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(gLeft, gBot);
        ctx.lineTo(tApexX, tApexY);
        ctx.lineTo(gRight, gBot);
        ctx.closePath();
        ctx.stroke();

        // Binodal Miscibility Envelope (Violet #8b5cf6)
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(gLeft + 4, gBot);
        ctx.quadraticCurveTo(tApexX, gTop + gH * 0.28, gRight - 6, gBot);
        ctx.stroke();

        // Interior Equilibrium Tie Lines (Amber #f59e0b)
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 1;
        for (let tl = 1; tl <= 3; tl++) {
          const f = tl * 0.24;
          const lx = gLeft + 4 + f * (tApexX - gLeft) * 0.85;
          const ly = gBot - f * gH * 0.65;
          const rx = gRight - 6 - f * (gRight - tApexX) * 0.72;
          const ry = gBot - f * gH * 0.52;
          ctx.beginPath();
          ctx.moveTo(lx, ly); ctx.lineTo(rx, ry);
          ctx.stroke();
        }

        // Stepped Extraction Stages (Emerald #10b981)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(gLeft + gW * 0.7, gBot);
        ctx.lineTo(gLeft + gW * 0.55, gTop + gH * 0.48);
        ctx.lineTo(gLeft + gW * 0.38, gTop + gH * 0.62);
        ctx.lineTo(gLeft + gW * 0.22, gBot);
        ctx.stroke();

        // Telemetry
        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#8b5cf6'; ctx.fillText('N: 5 STAGES', gLeft, 10);
        ctx.fillStyle = '#10b981'; ctx.fillText('Rec: 95%', gRight - 42, 10);
        ctx.fillStyle = '#38bdf8'; ctx.fillText('Ef: 1.38 | HUNTER-NASH', gLeft, h - 3);

      } else if (type === 'quantum_tunneling') {
        // Quantum Barrier Tunneling & Resonant Diode (RTD) NDR: Double-barrier quantum well + NDR I-V curve
        const splitX = Math.floor(w * 0.46);

        // --- LEFT: AlGaAs/GaAs Double-Barrier Quantum Well Heterostructure Potential Profile ---
        const qLeft = 10, qRight = splitX - 10;
        const qW = qRight - qLeft;
        const qBot = h - 10;
        const qH = h * 0.72;
        const bH = qH * 0.78; // Barrier height

        // Barrier 1 and Barrier 2 coordinates
        const b1X = qLeft + qW * 0.32, bW = qW * 0.12;
        const b2X = qLeft + qW * 0.56;

        // Background potential barriers (Slate #334155 fill)
        ctx.fillStyle = 'rgba(51, 65, 85, 0.45)';
        ctx.fillRect(b1X, qBot - bH, bW, bH);
        ctx.fillRect(b2X, qBot - bH, bW, bH);

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(qLeft, qBot);
        ctx.lineTo(b1X, qBot);
        ctx.lineTo(b1X, qBot - bH);
        ctx.lineTo(b1X + bW, qBot - bH);
        ctx.lineTo(b1X + bW, qBot);
        ctx.lineTo(b2X, qBot);
        ctx.lineTo(b2X, qBot - bH);
        ctx.lineTo(b2X + bW, qBot - bH);
        ctx.lineTo(b2X + bW, qBot);
        ctx.lineTo(qRight, qBot);
        ctx.stroke();

        // Resonant Bound State E1 in Quantum Well (Violet #a855f7 dashed)
        const e1Y = qBot - bH * 0.42;
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(b1X + bW, e1Y); ctx.lineTo(b2X, e1Y);
        ctx.stroke();

        // Undulating Schrödinger Wavefunction Real(Psi) (Cyan #38bdf8)
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let x = qLeft; x <= qRight; x++) {
          let psi = 0;
          if (x < b1X) {
            // Incident + reflected standing wave
            psi = Math.sin((x - qLeft) * 0.65 - t * 7) * 5;
          } else if (x >= b1X && x < b1X + bW) {
            // Evanescent decay
            const frac = (x - b1X) / bW;
            psi = Math.sin(-t * 7) * 5 * Math.exp(-2.2 * frac);
          } else if (x >= b1X + bW && x < b2X) {
            // Resonant standing wave enhancement in well
            const frac = (x - (b1X + bW)) / (b2X - (b1X + bW));
            psi = Math.sin(frac * Math.PI) * 8 * Math.cos(t * 7);
          } else if (x >= b2X && x < b2X + bW) {
            // Second evanescent barrier
            const frac = (x - b2X) / bW;
            psi = Math.sin(t * 7) * 3.5 * Math.exp(-2.2 * frac);
          } else {
            // Transmitted propagating plane wave
            psi = Math.sin((x - (b2X + bW)) * 0.65 - t * 7) * 3.5;
          }
          const py = e1Y - psi;
          if (x === qLeft) ctx.moveTo(x, py);
          else ctx.lineTo(x, py);
        }
        ctx.stroke();

        // Micro Label
        ctx.font = 'bold 6px monospace';
        ctx.fillStyle = '#a855f7'; ctx.fillText('E1', b1X + bW + 2, e1Y - 3);
        ctx.fillStyle = '#38bdf8'; ctx.fillText('Ψ(x)', qLeft + 2, 10);

        // --- RIGHT: Resonant Tunneling Diode (RTD) NDR I-V Curve ---
        const gLeft = splitX + 6, gRight = w - 8;
        const gW = gRight - gLeft;
        const gBot = h - 8;
        const gH = h * 0.72;

        // Bias Voltage Axis
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gLeft, gBot); ctx.lineTo(gRight, gBot);
        ctx.stroke();

        // N-Shaped NDR I-V Characteristic Curve (Emerald #10b981)
        // Rises up to peak (Vpeak, Ipeak), drops sharply down to valley (Vvalley, Ivalley), then rises
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        const vPkFrac = 0.38, vVyFrac = 0.62;
        for (let x = gLeft; x <= gRight; x++) {
          const frac = (x - gLeft) / gW;
          let iNorm = 0;
          if (frac <= vPkFrac) {
            iNorm = (frac / vPkFrac) * 0.92;
          } else if (frac > vPkFrac && frac <= vVyFrac) {
            // Negative Differential Resistance drop
            const dropF = (frac - vPkFrac) / (vVyFrac - vPkFrac);
            iNorm = 0.92 - dropF * (0.92 - 0.16);
          } else {
            // Valley thermionic leakage rise
            const riseF = (frac - vVyFrac) / (1 - vVyFrac);
            iNorm = 0.16 + Math.pow(riseF, 2) * 0.75;
          }
          const y = gBot - iNorm * gH;
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Dynamic NDR operating point oscillating across peak
        const opBiasF = 0.38 + 0.12 * Math.sin(t * 3);
        let opINorm = 0;
        if (opBiasF <= vPkFrac) opINorm = (opBiasF / vPkFrac) * 0.92;
        else if (opBiasF <= vVyFrac) opINorm = 0.92 - ((opBiasF - vPkFrac) / (vVyFrac - vPkFrac)) * 0.76;
        else opINorm = 0.16 + Math.pow((opBiasF - vVyFrac) / (1 - vVyFrac), 2) * 0.75;

        const opX = gLeft + opBiasF * gW;
        const opY = gBot - opINorm * gH;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(opX, opY, 3.8, 0, Math.PI * 2);
        ctx.fill();

        // Telemetry
        ctx.font = 'bold 6.5px monospace';
        ctx.fillStyle = '#10b981'; ctx.fillText('PVCR: 6.76', gLeft, 10);
        ctx.fillStyle = '#ef4444'; ctx.fillText('Vpk: 0.14V', gRight - 46, 10);
        ctx.fillStyle = '#38bdf8'; ctx.fillText('T(E)≈1.0 | NDR ACTIVE', gLeft, h - 3);
      } else {
        // Fallback for custom or newly added physics engine types
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 8; x < w - 8; x++) {
          const y = midY - Math.sin((x / 14) + t) * (h * 0.32);
          if (x === 8) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [type, accentColor]);

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-slate-800/90 bg-[#060b14] shadow-inner group/preview ${className}`}
      style={{ height: `${height}px` }}
    >
      <canvas
        ref={canvasRef}
        width={320}
        height={height}
        className="w-full h-full block"
      />
      
      {/* High-Tech HUD Badges */}
      {showFps && (
        <div className="absolute top-1 right-1 flex items-center gap-1">
          <span className="flex items-center gap-1 px-1 py-0.2 rounded bg-slate-950/85 border border-slate-800 text-[8px] font-mono font-bold text-emerald-400 backdrop-blur-sm">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            <span>60 FPS</span>
          </span>
        </div>
      )}

      {/* Tech Corner Reticle Accents */}
      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-cyan-500/40 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-cyan-500/40 pointer-events-none" />
    </div>
  );
};
