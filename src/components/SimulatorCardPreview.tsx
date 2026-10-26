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
        // Dual AC waves with phase shift & resonance
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 6; x < w - 6; x++) {
          const y = midY - Math.sin((x / 14) + t) * (h * 0.34);
          if (x === 6) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 6; x < w - 6; x++) {
          const y = midY - Math.sin((x / 14) + t - 1.1) * (h * 0.24);
          if (x === 6) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

      } else if (type === 'three_phase') {
        // 3-Phase R-Y-B balanced waveforms
        const colors = ['#ef4444', '#eab308', '#2563eb'];
        const offsets = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
        colors.forEach((col, idx) => {
          ctx.strokeStyle = col;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          for (let x = 6; x < w - 6; x++) {
            const y = midY - Math.sin((x / 14) + t + offsets[idx]) * (h * 0.32);
            if (x === 6) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });

      } else if (type === 'buck_boost') {
        // Inductor ripple current ramp
        const period = 26;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 6; x < w - 6; x++) {
          const phase = (x + t * 25) % period;
          const frac = phase / period;
          const y = frac < 0.6 ? midY + 14 - frac * 28 : midY - 14 + (frac - 0.6) * 42;
          if (x === 6) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Gate pulses on bottom
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = 6; x < w - 6; x++) {
          const frac = ((x + t * 25) % period) / period;
          const y = frac < 0.6 ? h - 14 : h - 6;
          if (x === 6) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

      } else if (type === 'sallen_key') {
        // Frequency response Bode plot
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 6; x < w - 6; x++) {
          const f = (x - 6) / (w - 12);
          const mag = 1 / Math.sqrt(1 + Math.pow(f * 2.8, 4));
          const y = h - 12 - mag * (h * 0.68);
          if (x === 6) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Cutoff -3dB marker
        const cutX = w * 0.42;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(cutX, h - 12 - 0.707 * (h * 0.68), 3, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === 'transmission_line') {
        // Standing wave envelope
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let x = 6; x < w - 6; x++) {
          const env = Math.sin((x / 16));
          const y = midY - env * Math.cos(t * 3) * (h * 0.35);
          if (x === 6) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        for (let x = 6; x < w - 6; x++) {
          const y = midY - Math.abs(Math.sin(x / 16)) * (h * 0.35);
          if (x === 6) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

      } else if (type === 'fourier') {
        // Fourier synthesis square wave
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 6; x < w - 6; x++) {
          const theta = (x / 16) - t * 2;
          const sum = Math.sin(theta) + (1 / 3) * Math.sin(3 * theta) + (1 / 5) * Math.sin(5 * theta);
          const y = midY - (4 / Math.PI) * sum * (h * 0.32);
          if (x === 6) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

      } else if (type === 'four_bar') {
        // Planar 4-bar linkage mechanism
        const ox = w * 0.28, oy = h * 0.68;
        const gx = w * 0.72, gy = h * 0.68;
        const r1 = 14;
        const ax = ox + r1 * Math.cos(t * 2);
        const ay = oy - r1 * Math.sin(t * 2);
        const bx = gx - 16 + 6 * Math.sin(t * 2);
        const by = gy - 20;

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ox, oy); ctx.lineTo(ax, ay);
        ctx.lineTo(bx, by); ctx.lineTo(gx, gy);
        ctx.stroke();

        // Pin joints
        ctx.fillStyle = '#f59e0b';
        [ [ox, oy], [ax, ay], [bx, by], [gx, gy] ].forEach(([px, py]) => {
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });

      } else if (type === 'rankine') {
        // Thermodynamic Rankine T-s vapor dome and cycle
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 12; x < w - 12; x++) {
          const norm = (x - w * 0.5) / (w * 0.35);
          const y = h - 10 - Math.max(0, 1 - norm * norm) * (h * 0.65);
          if (x === 12) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Rankine 1-2-3-4 cycle loop (Amber)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.38, h - 14);
        ctx.lineTo(w * 0.38, h - 34);
        ctx.lineTo(w * 0.65, h - 34);
        ctx.lineTo(w * 0.72, h - 14);
        ctx.closePath();
        ctx.stroke();

      } else if (type === 'harmonic') {
        // Damped decaying oscillation with envelope
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 8; x < w - 8; x++) {
          const tau = (x - 8) / (w - 16);
          const env = Math.exp(-2.2 * tau);
          const y = midY - Math.cos(tau * 20 - t * 3) * env * (h * 0.36);
          if (x === 8) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

      } else if (type === 'spur_gear') {
        // Meshing gear pitch circles
        const c1x = w * 0.38, c1y = midY, r1 = 18;
        const c2x = w * 0.62, c2y = midY, r2 = 18;

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(c1x, c1y, r1, 0, Math.PI * 2);
        ctx.arc(c2x, c2y, r2, 0, Math.PI * 2);
        ctx.stroke();

        // Rotating spokes
        ctx.beginPath();
        ctx.moveTo(c1x, c1y);
        ctx.lineTo(c1x + r1 * Math.cos(t * 2), c1y + r1 * Math.sin(t * 2));
        ctx.moveTo(c2x, c2y);
        ctx.lineTo(c2x + r2 * Math.cos(-t * 2), c2y + r2 * Math.sin(-t * 2));
        ctx.stroke();

      } else if (type === 'beam_deflection') {
        // Pinned supports
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(12, midY + 4); ctx.lineTo(6, midY + 16); ctx.lineTo(18, midY + 16); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(w - 12, midY + 4); ctx.lineTo(w - 18, midY + 16); ctx.lineTo(w - 6, midY + 16); ctx.fill();

        // Curved deflected elastic beam
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = 12; x <= w - 12; x++) {
          const norm = (x - 12) / (w - 24);
          const delta = norm * (1 - norm) * Math.sin(norm * Math.PI) * (h * 0.45);
          const y = midY + delta;
          if (x === 12) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Point load arrow
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(w * 0.5, midY - 14);
        ctx.lineTo(w * 0.5 - 4, midY - 22);
        ctx.lineTo(w * 0.5 + 4, midY - 22);
        ctx.fill();

      } else if (type === 'truss') {
        // Warren Bridge Truss
        const baseY = h * 0.72;
        const topY = h * 0.32;
        const nodes = [
          [16, baseY], [w * 0.32, baseY], [w * 0.5, topY],
          [w * 0.68, baseY], [w - 16, baseY]
        ];

        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(nodes[0][0], nodes[0][1]);
        ctx.lineTo(nodes[4][0], nodes[4][1]);
        ctx.stroke();

        ctx.strokeStyle = '#f43f5e';
        ctx.beginPath();
        ctx.moveTo(nodes[0][0], nodes[0][1]);
        ctx.lineTo(nodes[2][0], nodes[2][1]);
        ctx.lineTo(nodes[1][0], nodes[1][1]);
        ctx.lineTo(nodes[2][0], nodes[2][1]);
        ctx.lineTo(nodes[3][0], nodes[3][1]);
        ctx.lineTo(nodes[2][0], nodes[2][1]);
        ctx.lineTo(nodes[4][0], nodes[4][1]);
        ctx.stroke();

      } else if (type === 'seismic') {
        // Multi-story building swaying with base isolator
        const sway = Math.sin(t * 3) * 6;
        const bx = w * 0.5 + sway;

        ctx.fillStyle = '#334155';
        ctx.fillRect(w * 0.3, h - 8, w * 0.4, 4);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx - 10, h - 16, 20, 7);

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(bx - 14, h - 44, 28, 28);
        ctx.strokeRect(bx - 14, h - 68, 28, 24);

      } else if (type === 'mohr_circle') {
        // Mohr's Circle in (sigma, tau) space
        const cx = w * 0.52, cy = midY, r = h * 0.32;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, cy); ctx.lineTo(w - 10, cy);
        ctx.moveTo(cx - r - 8, 8); ctx.lineTo(cx - r - 8, h - 8);
        ctx.stroke();

        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(cx + r, cy, 2.5, 0, Math.PI * 2);
        ctx.arc(cx - r, cy, 2.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === 'pid') {
        // Step response with overshoot and settling
        ctx.strokeStyle = '#475569';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(8, midY - 6); ctx.lineTo(w - 8, midY - 6);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 8; x < w - 8; x++) {
          const tau = (x - 8) / (w - 16);
          const y = h - 8 - (1 - Math.exp(-4 * tau) * Math.cos(tau * 14)) * (h * 0.58);
          if (x === 8) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

      } else if (type === 'control_valve') {
        // Valve body & plug stroke
        const cx = w * 0.5, cy = midY;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 20, cy - 14, 40, 28);

        const stroke = 6 + Math.sin(t * 2) * 5;
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx - 5, cy - 14 + stroke, 10, 10);

        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(cx - 26, cy); ctx.lineTo(cx - 32, cy - 4); ctx.lineTo(cx - 32, cy + 4); ctx.fill();

      } else if (type === 'current_loop') {
        // 4-20mA loop circuit
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(w * 0.2, h * 0.25, w * 0.6, h * 0.5);

        const dotOffset = (t * 40) % 20;
        ctx.fillStyle = '#06b6d4';
        for (let x = w * 0.25 + dotOffset; x < w * 0.75; x += 22) {
          ctx.beginPath();
          ctx.arc(x, h * 0.25, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (type === 'orifice_meter') {
        // Orifice plate restriction in pipe
        const py = midY, ph = 20;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(w * 0.15, py - ph / 2, w * 0.7, ph);

        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(w * 0.5 - 2, py - ph / 2, 4, 6);
        ctx.fillRect(w * 0.5 - 2, py + ph / 2 - 6, 4, 6);

        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w * 0.4, py + ph / 2); ctx.lineTo(w * 0.4, h - 8);
        ctx.lineTo(w * 0.6, h - 8); ctx.lineTo(w * 0.6, py + ph / 2);
        ctx.stroke();

      } else if (type === 'cstr') {
        // CSTR vessel with rotating impeller
        const rx = w * 0.5, ry = midY;
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.strokeRect(rx - 18, ry - 22, 36, 44);

        ctx.strokeStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(rx, ry - 22); ctx.lineTo(rx, ry + 12);
        const bladeW = 10 * Math.cos(t * 3);
        ctx.moveTo(rx - bladeW, ry + 12); ctx.lineTo(rx + bladeW, ry + 12);
        ctx.stroke();

      } else if (type === 'distillation_column') {
        // McCabe-Thiele stepped staircase
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 12; x < w * 0.55; x++) {
          const xMole = (x - 12) / (w * 0.55 - 12);
          const yMole = (2.4 * xMole) / (1 + 1.4 * xMole);
          const y = h - 10 - yMole * (h * 0.7);
          if (x === 12) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#64748b';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(12, h - 10); ctx.lineTo(w * 0.55, h - 10 - (h * 0.7));
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(w * 0.68, 8, 22, h - 16);
        for (let i = 1; i <= 4; i++) {
          ctx.beginPath();
          ctx.moveTo(w * 0.68, 8 + i * 11);
          ctx.lineTo(w * 0.68 + 18, 8 + i * 11);
          ctx.stroke();
        }

      } else if (type === 'heat_exchanger') {
        // Baffled Shell & Tube counter-flow
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(w * 0.15, h * 0.2, w * 0.7, h * 0.6);

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(w * 0.15, h * 0.35);
        ctx.lineTo(w * 0.85, h * 0.35);
        ctx.stroke();

        ctx.strokeStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(w * 0.85, h * 0.65);
        ctx.lineTo(w * 0.15, h * 0.65);
        ctx.stroke();

      } else if (type === 'gas_absorption') {
        // Packed bed tower
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(w * 0.38, 8, 28, h - 16);

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        for (let y = 20; y < h - 20; y += 7) {
          ctx.beginPath();
          ctx.moveTo(w * 0.38, y); ctx.lineTo(w * 0.38 + 28, y + 4);
          ctx.stroke();
        }

        ctx.fillStyle = '#06b6d4';
        const pY = (h - 16) - ((t * 20) % (h - 24));
        ctx.fillRect(w * 0.45, pY, 2.5, 2.5);

      } else if (type === 'pn_junction') {
        // P-N Junction energy band bending
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(12, h * 0.28);
        ctx.bezierCurveTo(w * 0.4, h * 0.28, w * 0.6, h * 0.58, w - 12, h * 0.58);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(12, h * 0.55);
        ctx.bezierCurveTo(w * 0.4, h * 0.55, w * 0.6, h * 0.85, w - 12, h * 0.85);
        ctx.stroke();

        ctx.strokeStyle = '#f43f5e';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(12, h * 0.45); ctx.lineTo(w - 12, h * 0.45);
        ctx.stroke();
        ctx.setLineDash([]);

      } else if (type === 'sic_switching') {
        // High-speed Vds switching fall with ringing
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 8; x < w - 8; x++) {
          const frac = (x - 8) / (w - 16);
          let yVal = 0;
          if (frac < 0.3) yVal = 0.85;
          else if (frac < 0.45) yVal = 0.85 - (frac - 0.3) / 0.15 * 0.75 + Math.sin((frac - 0.3) * 35) * 0.15;
          else yVal = 0.1;
          const y = h - 10 - yVal * (h * 0.7);
          if (x === 8) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 8; x < w - 8; x++) {
          const frac = (x - 8) / (w - 16);
          let yVal = 0;
          if (frac < 0.3) yVal = 0.05;
          else if (frac < 0.45) yVal = 0.75 * Math.exp(-Math.pow((frac - 0.38) / 0.06, 2));
          else yVal = 0.45;
          const y = h - 10 - yVal * (h * 0.7);
          if (x === 8) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

      } else if (type === 'igbt_thermal') {
        // Multi-layer power module thermal stack
        const lH = (h - 20) / 4;
        const cols = ['#f43f5e', '#f59e0b', '#06b6d4', '#3b82f6'];
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = cols[i];
          ctx.fillRect(w * 0.25, 10 + i * lH, w * 0.5, lH - 2);
        }

      } else if (type === 'mosfet_channel') {
        // MOSFET Inversion Channel & Oxide
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(w * 0.2, h * 0.35, w * 0.6, h * 0.45);
        ctx.strokeStyle = '#64748b';
        ctx.strokeRect(w * 0.2, h * 0.35, w * 0.6, h * 0.45);

        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(w * 0.32, h * 0.35 - 5, w * 0.36, 5);

        ctx.fillStyle = '#10b981';
        ctx.fillRect(w * 0.32, h * 0.35, w * 0.36, 3.5);

      } else if (type === 'op_amp') {
        // Operational Amplifier inverting amplifier with rail clipping
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 8; x < w - 8; x++) {
          const y = midY + Math.sin((x / 16) - t * 3) * (h * 0.18);
          if (x === 8) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        const vSat = h * 0.35;
        for (let x = 8; x < w - 8; x++) {
          const raw = -Math.sin((x / 16) - t * 3) * (h * 0.52);
          const clipped = Math.max(-vSat, Math.min(vSat, raw));
          const y = midY + clipped;
          if (x === 8) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(8, midY - vSat); ctx.lineTo(w - 8, midY - vSat);
        ctx.moveTo(8, midY + vSat); ctx.lineTo(w - 8, midY + vSat);
        ctx.stroke();
        ctx.setLineDash([]);

      } else if (type === 'rc_transient') {
        // First-order exponential charge and discharge cycle
        const periodW = (w - 16) / 2;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = 8; x < w - 8; x++) {
          const relX = x - 8;
          const isCharging = relX < periodW;
          const tauFrac = (relX % periodW) / (periodW * 0.28);
          const norm = isCharging ? (1 - Math.exp(-tauFrac)) : Math.exp(-tauFrac);
          const y = (h - 12) - norm * (h * 0.72);
          if (x === 8) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        const tauX = 8 + periodW * 0.28;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(tauX, (h - 12) - 0.632 * (h * 0.72), 3.5, 0, Math.PI * 2);
        ctx.fill();

        const scanX = 8 + ((t * 45) % (w - 16));
        const scanRelX = scanX - 8;
        const scanIsCharge = scanRelX < periodW;
        const scanTau = (scanRelX % periodW) / (periodW * 0.28);
        const scanNorm = scanIsCharge ? (1 - Math.exp(-scanTau)) : Math.exp(-scanTau);
        const scanY = (h - 12) - scanNorm * (h * 0.72);
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(scanX, scanY, 3, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === 'transformer_test') {
        // Magnetic Hysteresis Loop (B-H Curve)
        const bCx = w * 0.5;
        const bCy = midY;
        const bW = w * 0.32;
        const bH = h * 0.36;

        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bCx - bW - 12, bCy); ctx.lineTo(bCx + bW + 12, bCy);
        ctx.moveTo(bCx, bCy - bH - 8); ctx.lineTo(bCx, bCy + bH + 8);
        ctx.stroke();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        const loopSteps = 50;
        for (let i = 0; i <= loopSteps; i++) {
          const theta = (i / loopSteps) * Math.PI;
          const hVal = Math.cos(theta);
          const bVal = Math.tanh(hVal * 1.8) + 0.18 * Math.sin(theta);
          const px = bCx + hVal * bW;
          const py = bCy - bVal * bH;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        for (let i = 0; i <= loopSteps; i++) {
          const theta = Math.PI + (i / loopSteps) * Math.PI;
          const hVal = Math.cos(theta);
          const bVal = Math.tanh(hVal * 1.8) - 0.18 * Math.sin(theta);
          const px = bCx + hVal * bW;
          const py = bCy - bVal * bH;
          ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        const loopPhase = t * 2.5;
        const ptH = Math.cos(loopPhase);
        const ptB = Math.tanh(ptH * 1.8) + (Math.sin(loopPhase) > 0 ? 0.18 : -0.18) * Math.abs(Math.sin(loopPhase));
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(bCx + ptH * bW, bCy - ptB * bH, 4, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === 'dc_motor') {
        // Rotating 2-pole DC armature & commutator
        const mCx = w * 0.5;
        const mCy = midY;
        const mR = Math.min(26, h * 0.38);

        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.fillRect(mCx - mR - 36, mCy - 18, 22, 36);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('N', mCx - mR - 28, mCy + 3);

        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.fillRect(mCx + mR + 14, mCy - 18, 22, 36);
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('S', mCx + mR + 22, mCy + 3);

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mCx, mCy, mR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const rot = t * 4;
        for (let c = 0; c < 4; c++) {
          const ang = rot + (c * Math.PI) / 2;
          const cx = mCx + Math.cos(ang) * (mR * 0.65);
          const cy = mCy + Math.sin(ang) * (mR * 0.65);
          ctx.fillStyle = c % 2 === 0 ? '#f59e0b' : '#38bdf8';
          ctx.beginPath();
          ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(mCx, mCy, 4, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === 'induction_motor') {
        // Kloss Torque-Slip Curve
        const gLeft = 24;
        const gRight = w - 24;
        const gW = gRight - gLeft;
        const gBot = h - 14;
        const gH = h * 0.68;

        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gLeft, gBot); ctx.lineTo(gRight, gBot);
        ctx.stroke();

        const sm = 0.25;
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const s = Math.max(0.005, (x - gLeft) / gW);
          const tNorm = (2 * (s / sm)) / (1 + Math.pow(s / sm, 2));
          const y = gBot - tNorm * gH;
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        const peakX = gLeft + sm * gW;
        const peakY = gBot - gH;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(peakX, peakY, 4, 0, Math.PI * 2);
        ctx.fill();

        const loadSlip = 0.05 + 0.12 * (0.5 + 0.5 * Math.sin(t * 2));
        const loadTNorm = (2 * (loadSlip / sm)) / (1 + Math.pow(loadSlip / sm, 2));
        const loadX = gLeft + loadSlip * gW;
        const loadY = gBot - loadTNorm * gH;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(loadX, loadY, 4, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === 'solar_pv') {
        // Dual I-V and P-V curve with Maximum Power Point (MPP)
        const gLeft = 20;
        const gRight = w - 20;
        const gW = gRight - gLeft;
        const gBot = h - 14;
        const gH = h * 0.72;

        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const vFrac = (x - gLeft) / gW;
          const iNorm = Math.max(0, 1 - Math.exp(12 * (vFrac - 0.95)));
          const y = gBot - iNorm * (gH * 0.88);
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        let mppX = gLeft;
        let mppY = gBot;
        let maxP = 0;
        for (let x = gLeft; x <= gRight; x++) {
          const vFrac = (x - gLeft) / gW;
          const iNorm = Math.max(0, 1 - Math.exp(12 * (vFrac - 0.95)));
          const pNorm = vFrac * iNorm * 1.35;
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

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(mppX, mppY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        const pulseR = 4.5 + Math.sin(t * 5) * 3;
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mppX, mppY, pulseR, 0, Math.PI * 2);
        ctx.stroke();

      } else if (type === 'rc_beam') {
        // Reinforced Concrete Beam cross section
        const bX = w * 0.35;
        const bY = 12;
        const bW = w * 0.3;
        const bH = h - 24;

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.fillRect(bX, bY, bW, bH);
        ctx.strokeRect(bX, bY, bW, bH);

        const aH = bH * 0.32;
        ctx.fillStyle = 'rgba(244, 63, 94, 0.45)';
        ctx.fillRect(bX + 2, bY + 2, bW - 4, aH);

        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(bX - 8, bY + aH / 0.85);
        ctx.lineTo(bX + bW + 8, bY + aH / 0.85);
        ctx.stroke();
        ctx.setLineDash([]);

        const rebarY = bY + bH - 12;
        for (let r = 0; r < 3; r++) {
          const rx = bX + 12 + (r * (bW - 24)) / 2;
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.arc(rx, rebarY, 4, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (type === 'otto_cycle') {
        // 4-Stroke Otto P-V indicator diagram
        const ox = w * 0.28;
        const oy = 14;
        const oW = w * 0.44;
        const oH = h - 28;

        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ox, oy); ctx.lineTo(ox, oy + oH);
        ctx.lineTo(ox + oW + 12, oy + oH);
        ctx.stroke();

        const p1 = [ox + oW, oy + oH - 6];
        const p2 = [ox + oW * 0.22, oy + oH - 22];
        const p3 = [ox + oW * 0.22, oy + 6];
        const p4 = [ox + oW, oy + oH * 0.45];

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(p1[0], p1[1]);
        ctx.quadraticCurveTo(ox + oW * 0.5, oy + oH - 10, p2[0], p2[1]);
        ctx.lineTo(p3[0], p3[1]);
        ctx.quadraticCurveTo(ox + oW * 0.5, oy + oH * 0.2, p4[0], p4[1]);
        ctx.closePath();
        ctx.stroke();

        const phase = (t * 1.5) % 4.0;
        let curPt = p1;
        if (phase < 1.0) {
          const frac = phase;
          curPt = [p1[0] + (p2[0] - p1[0]) * frac, p1[1] + (p2[1] - p1[1]) * Math.pow(frac, 1.4)];
        } else if (phase < 2.0) {
          const frac = phase - 1.0;
          curPt = [p2[0], p2[1] + (p3[1] - p2[1]) * frac];
        } else if (phase < 3.0) {
          const frac = phase - 2.0;
          curPt = [p3[0] + (p4[0] - p3[0]) * frac, p3[1] + (p4[1] - p3[1]) * Math.pow(frac, 0.7)];
        } else {
          const frac = phase - 3.0;
          curPt = [p4[0], p4[1] + (p1[1] - p4[1]) * frac];
        }
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(curPt[0], curPt[1], 4.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === 'projectile') {
        // Ballistics trajectory arc
        const pStartX = 20;
        const pStartY = h - 14;
        const pApexX = w * 0.48;
        const pApexY = 16;
        const pEndX = w - 24;

        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, pStartY); ctx.lineTo(w - 10, pStartY);
        ctx.stroke();

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pStartX, pStartY);
        ctx.bezierCurveTo(pStartX + (pApexX - pStartX) * 0.7, pApexY, pApexX, pApexY, pEndX, pStartY);
        ctx.stroke();

        const flightFrac = (t * 0.8) % 1.0;
        const u = 1 - flightFrac;
        const tt = flightFrac * flightFrac;
        const uu = u * u;
        const cp1x = pStartX + (pApexX - pStartX) * 0.7;
        const cp1y = pApexY;
        const cp2x = pApexX;
        const cp2y = pApexY;

        const ballX = uu * u * pStartX + 3 * uu * flightFrac * cp1x + 3 * u * tt * cp2x + tt * flightFrac * pEndX;
        const ballY = uu * u * pStartY + 3 * uu * flightFrac * cp1y + 3 * u * tt * cp2y + tt * flightFrac * pStartY;

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 4, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === 'centrifugal_pump') {
        // Pump H-Q Head Curve vs System Dynamic Friction Curve
        const gLeft = 24;
        const gRight = w - 24;
        const gW = gRight - gLeft;
        const gBot = h - 14;
        const gH = h * 0.7;

        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(gLeft, 12); ctx.lineTo(gLeft, gBot);
        ctx.lineTo(gRight, gBot);
        ctx.stroke();

        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const qFrac = (x - gLeft) / gW;
          const hNorm = 1 - 0.75 * qFrac * qFrac;
          const y = gBot - hNorm * gH;
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let x = gLeft; x <= gRight; x++) {
          const qFrac = (x - gLeft) / gW;
          const hNorm = 0.25 + 0.9 * qFrac * qFrac;
          const y = gBot - hNorm * gH;
          if (x === gLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        const dutyQ = 0.67;
        const dutyH = 1 - 0.75 * dutyQ * dutyQ;
        const dutyX = gLeft + dutyQ * gW;
        const dutyY = gBot - dutyH * gH;

        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(dutyX, dutyY, 4.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === 'refrigeration_cycle') {
        // Vapor Compression P-h Mollier diagram
        const rLeft = 24;
        const rRight = w - 24;
        const rW = rRight - rLeft;
        const rBot = h - 14;
        const rH = h * 0.72;

        ctx.strokeStyle = 'rgba(100, 116, 139, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(rLeft + rW * 0.15, rBot);
        ctx.quadraticCurveTo(rLeft + rW * 0.42, rBot - rH * 1.05, rLeft + rW * 0.85, rBot);
        ctx.stroke();

        const s1 = [rLeft + rW * 0.72, rBot - rH * 0.28];
        const s2 = [rLeft + rW * 0.84, rBot - rH * 0.85];
        const s3 = [rLeft + rW * 0.32, rBot - rH * 0.85];
        const s4 = [rLeft + rW * 0.32, rBot - rH * 0.28];

        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(s1[0], s1[1]);
        ctx.lineTo(s2[0], s2[1]);
        ctx.lineTo(s3[0], s3[1]);
        ctx.lineTo(s4[0], s4[1]);
        ctx.closePath();
        ctx.stroke();

        const cycPhase = (t * 2.5) % 4.0;
        let curState = s1;
        if (cycPhase < 1.0) {
          const f = cycPhase;
          curState = [s1[0] + (s2[0] - s1[0]) * f, s1[1] + (s2[1] - s1[1]) * f];
        } else if (cycPhase < 2.0) {
          const f = cycPhase - 1.0;
          curState = [s2[0] + (s3[0] - s2[0]) * f, s2[1] + (s3[1] - s2[1]) * f];
        } else if (cycPhase < 3.0) {
          const f = cycPhase - 2.0;
          curState = [s3[0] + (s4[0] - s3[0]) * f, s3[1] + (s4[1] - s3[1]) * f];
        } else {
          const f = cycPhase - 3.0;
          curState = [s4[0] + (s1[0] - s4[0]) * f, s4[1] + (s1[1] - s4[1]) * f];
        }
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(curState[0], curState[1], 4, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === 'bode_plot') {
        // Dual Bode frequency response
        const bLeft = 18;
        const bRight = w - 18;
        const bW = bRight - bLeft;
        const magH = (h - 24) * 0.46;
        const phaseY0 = midY + 4;
        const phaseH = (h - 24) * 0.46;

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = bLeft; x <= bRight; x++) {
          const fNorm = (x - bLeft) / bW;
          const magDb = 1 / Math.sqrt(1 + Math.pow(fNorm * 3.5, 4));
          const y = (14 + magH) - magDb * magH;
          if (x === bLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.setLineDash([3, 2]);
        ctx.beginPath();
        ctx.moveTo(bLeft, 14 + magH * 0.3); ctx.lineTo(bRight, 14 + magH * 0.3);
        ctx.stroke();

        ctx.strokeStyle = '#06b6d4';
        ctx.beginPath();
        for (let x = bLeft; x <= bRight; x++) {
          const fNorm = (x - bLeft) / bW;
          const phi = Math.atan2(Math.pow(fNorm * 3.5, 2), 1);
          const y = phaseY0 + (phi / Math.PI) * phaseH;
          if (x === bLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

      } else if (type === 'root_locus') {
        // Evans Root Locus complex s-plane
        const sCx = w * 0.58;
        const sCy = midY;

        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(14, sCy); ctx.lineTo(w - 14, sCy);
        ctx.moveTo(sCx, 8); ctx.lineTo(sCx, h - 8);
        ctx.stroke();

        const p0x = sCx;
        const p1x = sCx - 45;
        const p2x = sCx - 85;

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        [p0x, p1x, p2x].forEach(px => {
          ctx.beginPath();
          ctx.moveTo(px - 3.5, sCy - 3.5); ctx.lineTo(px + 3.5, sCy + 3.5);
          ctx.moveTo(px + 3.5, sCy - 3.5); ctx.lineTo(px - 3.5, sCy + 3.5);
          ctx.stroke();
        });

        const breakX = sCx - 22;
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(breakX, sCy);
        ctx.quadraticCurveTo(sCx - 35, sCy - 28, sCx - 15, 12);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(breakX, sCy);
        ctx.quadraticCurveTo(sCx - 35, sCy + 28, sCx - 15, h - 12);
        ctx.stroke();

        const kFrac = 0.5 + 0.5 * Math.sin(t * 2);
        const poleUpperY = sCy - kFrac * (h * 0.38);
        const poleLowerY = sCy + kFrac * (h * 0.38);
        const poleBranchX = breakX + kFrac * 8;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(poleBranchX, poleUpperY, 3.5, 0, Math.PI * 2);
        ctx.arc(poleBranchX, poleLowerY, 3.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === 'batch_pfr') {
        // Chemical reaction kinetics
        const kLeft = 24;
        const kRight = w - 24;
        const kW = kRight - kLeft;
        const kBot = h - 14;
        const kH = h * 0.72;

        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(kLeft, 12); ctx.lineTo(kLeft, kBot);
        ctx.lineTo(kRight, kBot);
        ctx.stroke();

        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let x = kLeft; x <= kRight; x++) {
          const tFrac = (x - kLeft) / kW;
          const concA = Math.exp(-2.4 * tFrac);
          const y = kBot - concA * kH;
          if (x === kLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let x = kLeft; x <= kRight; x++) {
          const tFrac = (x - kLeft) / kW;
          const concB = 1 - Math.exp(-2.4 * tFrac);
          const y = kBot - concB * kH;
          if (x === kLeft) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        const progX = kLeft + ((t * 30) % kW);
        ctx.fillStyle = '#f59e0b';
        const progFrac = (progX - kLeft) / kW;
        const progA = kBot - Math.exp(-2.4 * progFrac) * kH;
        const progB = kBot - (1 - Math.exp(-2.4 * progFrac)) * kH;
        ctx.beginPath();
        ctx.arc(progX, progA, 3.5, 0, Math.PI * 2);
        ctx.arc(progX, progB, 3.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === 'photoelectric') {
        // Photoelectric effect
        const cathodeX = 45;
        const anodeX = w - 45;

        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.fillRect(cathodeX - 8, 12, 12, h - 24);
        ctx.strokeRect(cathodeX - 8, 12, 12, h - 24);

        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#64748b';
        ctx.fillRect(anodeX - 4, 12, 10, h - 24);
        ctx.strokeRect(anodeX - 4, 12, 10, h - 24);

        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.8;
        for (let p = 0; p < 2; p++) {
          const wavePhase = t * 6 + p * 3;
          ctx.beginPath();
          for (let x = 6; x < cathodeX - 8; x++) {
            const y = 20 + p * 35 + Math.sin(x * 0.4 + wavePhase) * 6;
            if (x === 6) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        for (let e = 0; e < 5; e++) {
          const ePhase = (t * 0.7 + e * 0.22) % 1.0;
          const ex = cathodeX + 6 + ePhase * (anodeX - cathodeX - 12);
          const ey = 18 + e * 11 + Math.sin(ePhase * Math.PI) * 4;
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(ex, ey, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

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
