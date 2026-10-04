import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Zap,
  Cpu,
  Building2,
  Sliders,
  ChevronRight,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Search,
  Filter,
  Activity,
  Layers,
  FlaskConical,
  Atom,
  Gauge
} from 'lucide-react';
import { DisciplineId, SimulatorItem } from '../types';
import {
  FEATURED_ELECTRICAL_SIMULATORS,
  FEATURED_MECHANICAL_SIMULATORS,
  FEATURED_CIVIL_SIMULATORS,
  FEATURED_INSTRUMENTATION_SIMULATORS,
  FEATURED_CHEMICAL_SIMULATORS,
  FEATURED_SEMICONDUCTOR_SIMULATORS,
} from '../data/simulators';
import { MathView } from './MathView';

interface DepartmentPageProps {
  departmentId: DisciplineId;
  onBackToHome: () => void;
  onLaunchSimulator: (sim: SimulatorItem) => void;
}

// Subcategory classifier for each simulator
const getSimulatorSubCategory = (type: string): { label: string; subfield: string } => {
  switch (type) {
    case 'rlc':
      return { label: 'Analog Circuits', subfield: 'Analog Circuits' };
    case 'three_phase':
      return { label: 'Power Grid', subfield: '3-Phase AC Grids' };
    case 'buck_boost':
      return { label: 'Switching Converter', subfield: 'Power Electronics' };
    case 'sallen_key':
      return { label: 'Active Filter', subfield: 'Active Filters' };
    case 'transmission_line':
      return { label: 'RF Waveguide', subfield: 'RF Transmission Lines' };
    case 'fourier':
      return { label: 'Fourier Synthesis', subfield: 'Signal Processing' };
    case 'four_bar':
      return { label: 'Kinematic Linkage', subfield: 'Kinematics' };
    case 'rankine':
      return { label: 'Steam Power Cycle', subfield: 'Thermodynamics' };
    case 'harmonic':
      return { label: 'Vibration & Resonance', subfield: 'Structural Dynamics' };
    case 'spur_gear':
      return { label: 'Involute Gearing', subfield: 'Machine Design' };
    case 'beam_deflection':
      return { label: 'Beam Flexure', subfield: 'Structural Analysis' };
    case 'truss':
      return { label: 'Truss Bridge', subfield: 'Bridge Mechanics' };
    case 'seismic':
      return { label: 'Base Isolation', subfield: 'Earthquake Eng' };
    case 'mohr_circle':
      return { label: 'Stress Transformation', subfield: 'Stress Analysis' };
    case 'pid':
      return { label: 'Closed-Loop PID', subfield: 'Process Automation' };
    case 'control_valve':
      return { label: 'Control Valve Trim', subfield: 'Control Valves' };
    case 'current_loop':
      return { label: '4-20mA Telemetry', subfield: 'Current Loops' };
    case 'orifice_meter':
      return { label: 'DP Flow Metering', subfield: 'Flow Metering' };
    case 'cstr':
      return { label: 'CSTR Kinetics', subfield: 'Reaction Engineering' };
    case 'distillation_column':
      return { label: 'Fractional Distillation', subfield: 'Separation Processes' };
    case 'heat_exchanger':
      return { label: 'Shell & Tube Exchanger', subfield: 'Heat Transfer' };
    case 'gas_absorption':
      return { label: 'Packed Absorption', subfield: 'Mass Transfer' };
    case 'pn_junction':
      return { label: 'P-N Band Bending', subfield: 'Solid-State Physics' };
    case 'sic_switching':
      return { label: 'Wide-Bandgap SiC', subfield: 'Power Electronics' };
    case 'igbt_thermal':
      return { label: 'IGBT Thermal Foster', subfield: 'Thermal Management' };
    case 'mosfet_channel':
      return { label: 'MOSFET Inversion', subfield: 'Microelectronics' };
    case 'op_amp':
      return { label: 'Op-Amp Linear Topologies', subfield: 'Active Analog' };
    case 'rc_transient':
      return { label: 'RC & RL Transients', subfield: '1st-Order Dynamics' };
    case 'transformer_test':
      return { label: 'Transformer OC / SC', subfield: 'Magnetic Machines' };
    case 'dc_motor':
      return { label: 'DC Machine & Drive', subfield: 'Electromechanics' };
    case 'induction_motor':
      return { label: '3-Phase Induction Motor', subfield: 'AC Drives & Machinery' };
    case 'solar_pv':
      return { label: 'Solar PV & MPPT Tracking', subfield: 'Renewable Photovoltaics' };
    case 'rc_beam':
      return { label: 'RC Beam Flexure ACI 318', subfield: 'Concrete Structures' };
    case 'otto_cycle':
      return { label: '4-Stroke Otto / Diesel', subfield: 'IC Heat Engines' };
    case 'projectile':
      return { label: 'Aerodynamic Ballistics', subfield: 'Newtonian Trajectories' };
    case 'centrifugal_pump':
      return { label: 'Centrifugal Turbopump', subfield: 'Hydraulic Systems' };
    case 'refrigeration_cycle':
      return { label: 'Vapor Compression P-h', subfield: 'Thermal Refrigeration' };
    case 'bode_plot':
      return { label: 'Bode & Nyquist Stability', subfield: 'Frequency Response' };
    case 'root_locus':
      return { label: 'Evans Root Locus', subfield: 'S-Plane Control' };
    case 'batch_pfr':
      return { label: 'Batch & PFR Reactors', subfield: 'Chemical Kinetics' };
    case 'photoelectric':
      return { label: 'Photoelectric Quantum', subfield: 'Modern Physics' };
    default:
      return { label: 'Physics Engine', subfield: 'First-Principles' };
  }
};

// Compact, distinctive 60 FPS vector preview for every single simulator
const SimulatorCardPreview: React.FC<{ type: string; accentColor: string }> = ({ type, accentColor }) => {
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
      ctx.fillStyle = '#050912';
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
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

      // 100% Unique Visualization for Each of the 24 Simulators
      if (type === 'rlc') {
        // Dual AC waves with phase shift
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
        // Bottom cord (tension - blue)
        ctx.moveTo(nodes[0][0], nodes[0][1]);
        ctx.lineTo(nodes[4][0], nodes[4][1]);
        ctx.stroke();

        // Web diagonals (compression - red)
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

        // Base ground
        ctx.fillStyle = '#334155';
        ctx.fillRect(w * 0.3, h - 8, w * 0.4, 4);

        // Isolator spring/bearing
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(bx - 10, h - 16, 20, 7);

        // Building frame
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(bx - 14, h - 44, 28, 28);
        ctx.strokeRect(bx - 14, h - 68, 28, 24);

      } else if (type === 'mohr_circle') {
        // Mohr's Circle in (sigma, tau) space
        const cx = w * 0.52, cy = midY, r = h * 0.32;
        // Axes
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(10, cy); ctx.lineTo(w - 10, cy);
        ctx.moveTo(cx - r - 8, 8); ctx.lineTo(cx - r - 8, h - 8);
        ctx.stroke();

        // Circle
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();

        // Principal stress dots
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
        ctx.moveTo(8, midY - 6); ctx.lineTo(w - 8, midY - 6); // Setpoint
        ctx.stroke();
        ctx.setLineDash([]);

        // PV Curve
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

        // Plug throttling stem
        const stroke = 6 + Math.sin(t * 2) * 5;
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cx - 5, cy - 14 + stroke, 10, 10);

        // Flow arrow
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(cx - 26, cy); ctx.lineTo(cx - 32, cy - 4); ctx.lineTo(cx - 32, cy + 4); ctx.fill();

      } else if (type === 'current_loop') {
        // 4-20mA loop circuit
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.8;
        ctx.strokeRect(w * 0.2, h * 0.25, w * 0.6, h * 0.5);

        // Pulsing dots along wires
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

        // Orifice restriction plate
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(w * 0.5 - 2, py - ph / 2, 4, 6);
        ctx.fillRect(w * 0.5 - 2, py + ph / 2 - 6, 4, 6);

        // Manometer differential height
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

        // Stirrer shaft & blades
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
        // VLE curve
        for (let x = 12; x < w * 0.55; x++) {
          const xMole = (x - 12) / (w * 0.55 - 12);
          const yMole = (2.4 * xMole) / (1 + 1.4 * xMole);
          const y = h - 10 - yMole * (h * 0.7);
          if (x === 12) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // 45 deg line
        ctx.strokeStyle = '#64748b';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(12, h - 10); ctx.lineTo(w * 0.55, h - 10 - (h * 0.7));
        ctx.stroke();
        ctx.setLineDash([]);

        // Right side: mini column shell with trays
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

        // Hot stream (Red, Top)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(w * 0.15, h * 0.35);
        ctx.lineTo(w * 0.85, h * 0.35);
        ctx.stroke();

        // Cold stream (Cyan, Bottom)
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

        // Packed mesh grid in center
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        for (let y = 20; y < h - 20; y += 7) {
          ctx.beginPath();
          ctx.moveTo(w * 0.38, y); ctx.lineTo(w * 0.38 + 28, y + 4);
          ctx.stroke();
        }

        // Rising gas streamlines (Cyan)
        ctx.fillStyle = '#06b6d4';
        const pY = (h - 16) - ((t * 20) % (h - 24));
        ctx.fillRect(w * 0.45, pY, 2.5, 2.5);

      } else if (type === 'pn_junction') {
        // P-N Junction energy band bending
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        // Ec
        ctx.beginPath();
        ctx.moveTo(12, h * 0.28);
        ctx.bezierCurveTo(w * 0.4, h * 0.28, w * 0.6, h * 0.58, w - 12, h * 0.58);
        ctx.stroke();

        // Ev
        ctx.beginPath();
        ctx.moveTo(12, h * 0.55);
        ctx.bezierCurveTo(w * 0.4, h * 0.55, w * 0.6, h * 0.85, w - 12, h * 0.85);
        ctx.stroke();

        // Fermi level
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

        // Current surge peak (Amber)
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
        const labels = ['DIE', 'DBC', 'BASE', 'HEATSINK'];
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

        // Gate oxide
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(w * 0.32, h * 0.35 - 5, w * 0.36, 5);

        // 2D Electron Inversion sheet
        ctx.fillStyle = '#10b981';
        ctx.fillRect(w * 0.32, h * 0.35, w * 0.36, 3.5);

      } else if (type === 'op_amp') {
        // Operational Amplifier inverting amplifier with rail clipping
        // Input reference wave in amber (small amplitude)
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let x = 8; x < w - 8; x++) {
          const y = midY + Math.sin((x / 16) - t * 3) * (h * 0.18);
          if (x === 8) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Output wave with 180 deg phase inversion and rail saturation clipping (+/- Vsat)
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

        // Saturation rail lines (+Vsat and -Vsat)
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

        // 63.2% tau threshold marker
        const tauX = 8 + periodW * 0.28;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(tauX, (h - 12) - 0.632 * (h * 0.72), 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Traveling charging dot along curve
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
        // Magnetic Hysteresis Loop (B-H Curve) with rotating Steinmetz flux
        const bCx = w * 0.5;
        const bCy = midY;
        const bW = w * 0.32;
        const bH = h * 0.36;

        // B-H axes
        ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bCx - bW - 12, bCy); ctx.lineTo(bCx + bW + 12, bCy);
        ctx.moveTo(bCx, bCy - bH - 8); ctx.lineTo(bCx, bCy + bH + 8);
        ctx.stroke();

        // S-shaped Hysteresis loop
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

        // Moving operating magnetic point around loop
        const loopPhase = t * 2.5;
        const ptH = Math.cos(loopPhase);
        const ptB = Math.tanh(ptH * 1.8) + (Math.sin(loopPhase) > 0 ? 0.18 : -0.18) * Math.abs(Math.sin(loopPhase));
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(bCx + ptH * bW, bCy - ptB * bH, 4, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === 'dc_motor') {
        // Rotating 2-pole DC armature & commutator with magnetic poles
        const mCx = w * 0.5;
        const mCy = midY;
        const mR = Math.min(26, h * 0.38);

        // Stator magnetic poles
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.fillRect(mCx - mR - 36, mCy - 18, 22, 36);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('N', mCx - mR - 28, mCy + 3);

        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.fillRect(mCx + mR + 14, mCy - 18, 22, 36);
        ctx.fillStyle = '#06b6d4';
        ctx.fillText('S', mCx + mR + 22, mCy + 3);

        // Armature rotor core
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mCx, mCy, mR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Rotating rotor coils
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
        // Kloss Torque-Slip Curve T(s) with breakdown torque T_max
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

        // Torque-slip curve
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

        // Breakdown peak point
        const peakX = gLeft + sm * gW;
        const peakY = gBot - gH;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(peakX, peakY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Animated operating point under variable load
        const loadSlip = 0.05 + 0.12 * (0.5 + 0.5 * Math.sin(t * 2));
        const loadTNorm = (2 * (loadSlip / sm)) / (1 + Math.pow(loadSlip / sm, 2));
        const loadX = gLeft + loadSlip * gW;
        const loadY = gBot - loadTNorm * gH;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(loadX, loadY, 4, 0, Math.PI * 2);
        ctx.fill();

      } else if (type === 'solar_pv') {
        // Dual I-V and P-V curve with glowing Maximum Power Point (MPP)
        const gLeft = 20;
        const gRight = w - 20;
        const gW = gRight - gLeft;
        const gBot = h - 14;
        const gH = h * 0.72;

        // Blue I-V Current curve
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

        // Yellow P-V Power curve
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

        // Glowing red MPP marker at summit
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
        // Reinforced Concrete Beam cross section & Whitney stress block
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
        // Aerodynamic ballistics trajectory arc with flying projectile
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

        // 1. Pump Head Curve H_pump(Q)
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

        // 2. System Resistance Curve H_sys(Q)
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

        // Impeller icon
        const impX = gRight - 22;
        const impY = 24;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
        ctx.lineWidth = 1.5;
        for (let b = 0; b < 4; b++) {
          const bAng = t * 5 + (b * Math.PI) / 2;
          ctx.beginPath();
          ctx.arc(impX + Math.cos(bAng) * 6, impY + Math.sin(bAng) * 6, 5, 0, Math.PI);
          ctx.stroke();
        }

      } else if (type === 'refrigeration_cycle') {
        // Vapor Compression P-h Mollier diagram with vapor dome & 4-stage cycle
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
        // Dual Bode frequency response (Magnitude dB + Phase deg)
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

        const freqX = bLeft + ((t * 25) % bW);
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.5)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(freqX, 8); ctx.lineTo(freqX, h - 8);
        ctx.stroke();

      } else if (type === 'root_locus') {
        // Evans Root Locus complex s-plane with migrating poles
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
        // Chemical reaction kinetics: Reactant A decay and Product B generation
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

        // Reactant [A] concentration decay (Ruby)
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

        // Product [B] concentration formation (Emerald)
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
        // Photoelectric effect: Incident photons liberating photoelectrons
        const cathodeX = 45;
        const anodeX = w - 45;

        // Cathode plate
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.fillRect(cathodeX - 8, 12, 12, h - 24);
        ctx.strokeRect(cathodeX - 8, 12, 12, h - 24);

        // Anode plate
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#64748b';
        ctx.fillRect(anodeX - 4, 12, 10, h - 24);
        ctx.strokeRect(anodeX - 4, 12, 10, h - 24);

        // Incident wavy photons
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

        // Liberated photoelectrons
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
    <div className="relative w-full h-20 rounded-xl overflow-hidden border border-slate-800 bg-[#050912] shadow-inner">
      <canvas ref={canvasRef} width={280} height={80} className="w-full h-full block" />
      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-900/90 border border-slate-700/80 text-[9px] font-mono text-cyan-400 font-bold">
        60 FPS
      </div>
    </div>
  );
};

export const DepartmentPage: React.FC<DepartmentPageProps> = ({
  departmentId,
  onBackToHome,
  onLaunchSimulator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Fundamentals' | 'Intermediate' | 'Advanced'>('all');
  const [selectedSubfield, setSelectedSubfield] = useState<string>('all');

  const departmentConfig = {
    electrical: {
      name: 'Electrical & Electronic Systems',
      shortName: 'Electrical',
      code: 'EE-200',
      icon: <Zap className="w-8 h-8 text-cyan-400" />,
      color: '#06b6d4',
      accentBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
      gradient: 'from-cyan-950/40 via-slate-900/90 to-slate-950',
      simCardHover: 'hover:border-cyan-500/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.18)] group-hover:text-cyan-300',
      description: 'First-principles numerical models spanning analog circuit transient response, RF transmission line reflections, switching power converter topologies, and three-phase rotating stator magnetic fields.',
      governingLaw: "Maxwell's Equations & Kirchhoff's Differential Laws",
      coreEquation: "v(t) = L \\frac{di}{dt} + R i(t) + \\frac{1}{C}\\int i(t)dt",
      equationDescription: 'Total dynamic voltage balance across resistive, inductive, and capacitive impedances.',
      standards: ['IEEE 1547 Grid Interconnection', 'IEEE 519 Harmonic Control', 'IEC 60034 Rotating Machines', 'IEC 62040 Switching Power'],
      simulators: FEATURED_ELECTRICAL_SIMULATORS,
      labCapacity: '6 Dedicated Physics Engines',
    },
    mechanical: {
      name: 'Mechanical & Thermal Dynamics',
      shortName: 'Mechanical',
      code: 'ME-400',
      icon: <Cpu className="w-8 h-8 text-amber-400" />,
      color: '#f59e0b',
      accentBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
      gradient: 'from-amber-950/40 via-slate-900/90 to-slate-950',
      simCardHover: 'hover:border-amber-500/60 hover:shadow-[0_0_25px_rgba(245,158,11,0.18)] group-hover:text-amber-300',
      description: 'Kinematic mechanism synthesis, thermodynamic steam power generation cycles, damped harmonic resonance vibration isolation, and AGMA involute conjugate gear meshing.',
      governingLaw: "Newtonian Classical Mechanics & 1st/2nd Laws of Thermodynamics",
      coreEquation: "m\\ddot{x} + c\\dot{x} + kx = F_0 \\cos(\\omega t)",
      equationDescription: 'Second-order linear differential equation governing forced damped harmonic oscillators.',
      standards: ['ASME PTC 4.4 Steam Generators', 'ISO 6336 Gear Load Capacity', 'ISO 10816 Mechanical Vibration', 'AGMA 2001 Involute Standard'],
      simulators: FEATURED_MECHANICAL_SIMULATORS,
      labCapacity: '4 Dedicated Physics Engines',
    },
    civil: {
      name: 'Civil & Structural Engineering',
      shortName: 'Civil',
      code: 'CE-320',
      icon: <Building2 className="w-8 h-8 text-rose-400" />,
      color: '#f43f5e',
      accentBg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
      gradient: 'from-rose-950/40 via-slate-900/90 to-slate-950',
      simCardHover: 'hover:border-rose-500/60 hover:shadow-[0_0_25px_rgba(244,63,94,0.18)] group-hover:text-rose-300',
      description: 'Differential beam bending equilibrium, moving truck live load truss bridge analysis, elastomeric seismic base isolation dynamics, and Mohr’s circle principal stress transformations.',
      governingLaw: "Euler-Bernoulli Beam Flexure & Navier-Cauchy Elastic Equilibrium",
      coreEquation: "EI \\frac{d^4 w}{dx^4} = q(x), \\quad \\sum \\vec{F}_{node} = 0",
      equationDescription: 'Fourth-order elastic beam deflection equilibrium under arbitrary distributed lateral loading.',
      standards: ['AISC 360-16 Structural Steel Buildings', 'AASHTO LRFD Bridge Design', 'ASCE 7-22 Seismic Criteria', 'ASTM D3080 Direct Shear'],
      simulators: FEATURED_CIVIL_SIMULATORS,
      labCapacity: '4 Dedicated Physics Engines',
    },
    control: {
      name: 'Instrumentation & Process Automation',
      shortName: 'Instrumentation',
      code: 'IC-300',
      icon: <Sliders className="w-8 h-8 text-emerald-400" />,
      color: '#10b981',
      accentBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
      gradient: 'from-emerald-950/40 via-slate-900/90 to-slate-950',
      simCardHover: 'hover:border-emerald-500/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.18)] group-hover:text-emerald-300',
      description: 'Closed-loop feedback stability with anti-windup PID tuning, IEC control valve flow capacity and cavitation prevention, 4-20mA smart transmitters with line drop burdens, and differential pressure orifice metering.',
      governingLaw: "Laplace Feedback Control & Bernoulli Fluid Energy Continuity",
      coreEquation: "u(t) = K_p e(t) + \\frac{K_p}{T_i}\\int e(\\tau)d\\tau + K_p T_d \\frac{de}{dt}",
      equationDescription: 'Ideal ISA parallel PID closed-loop control algorithm with dynamic rate anti-windup.',
      standards: ['ISA-75.01 Control Valve Sizing', 'IEC 60381-1 Analogue Current Signals', 'ISO 5167 Orifice Metering', 'NAMUR NE 43 Alarm Levels'],
      simulators: FEATURED_INSTRUMENTATION_SIMULATORS,
      labCapacity: '4 Dedicated Physics Engines',
    },
    chemical: {
      name: 'Chemical & Process Engineering',
      shortName: 'Chemical',
      code: 'CH-250',
      icon: <FlaskConical className="w-8 h-8 text-violet-400" />,
      color: '#8b5cf6',
      accentBg: 'bg-violet-500/15 border-violet-500/40 text-violet-300',
      gradient: 'from-violet-950/40 via-slate-900/90 to-slate-950',
      simCardHover: 'hover:border-violet-500/60 hover:shadow-[0_0_25px_rgba(139,92,246,0.18)] group-hover:text-violet-300',
      description: 'First-principles process engineering models spanning non-isothermal CSTR thermal runaway, binary sieve tray distillation McCabe-Thiele stages, TEMA Class R shell-and-tube heat transfer, and packed tower gas absorption.',
      governingLaw: "Arrhenius Reaction Kinetics, Raoult's Law & Two-Film Mass Transfer",
      coreEquation: "\\frac{dC_A}{dt} = \\frac{F}{V}(C_{A0} - C_A) - k_0 e^{-E_a/RT} C_A^2, \\quad Q = U A \\Delta T_{lm}",
      equationDescription: 'Coupled reaction mass/energy conservation and heat exchanger rating.',
      standards: ['AIChE Standard Guidelines', 'TEMA Standards 10th Edition', 'ASTM D86 Distillation', 'EPA 40 CFR 63 Scrubbers'],
      simulators: FEATURED_CHEMICAL_SIMULATORS,
      labCapacity: '4 Dedicated Physics Engines',
    },
    physics: {
      name: 'Quantum & Semiconductor Physics',
      shortName: 'Physics',
      code: 'PH-500',
      icon: <Atom className="w-8 h-8 text-sky-400" />,
      color: '#38bdf8',
      accentBg: 'bg-sky-500/15 border-sky-500/40 text-sky-300',
      gradient: 'from-sky-950/40 via-slate-900/90 to-slate-950',
      simCardHover: 'hover:border-sky-500/60 hover:shadow-[0_0_25px_rgba(56,189,248,0.18)] group-hover:text-sky-300',
      description: 'Wide-bandgap power semiconductor switching dynamics, P-N junction energy band bending, IGBT multi-layer thermal Foster networks, and nanoscale BSIM4 MOSFET inversion channels.',
      governingLaw: "Poisson-Boltzmann Equation, Maxwell Slew Rates & Fermi-Dirac Statistics",
      coreEquation: "E_{sw} = \\int v_{ds}(t) i_d(t) dt, \\quad \\phi_s = \\frac{q N_A W_{dep}^2}{2\\varepsilon_s}",
      equationDescription: 'Power semiconductor dynamic switching energy integral and surface inversion potential.',
      standards: ['JEDEC JESD24-11 Switching', 'IEC 60747 Power Semiconductors', 'IEEE EDS Standards', 'BSIM4 Compact Modeling'],
      simulators: FEATURED_SEMICONDUCTOR_SIMULATORS,
      labCapacity: '4 Dedicated Physics Engines',
    },
  }[departmentId] || {
    name: 'Engineering Laboratory Department',
    shortName: 'Engineering',
    code: 'ENG-LAB',
    icon: <Zap className="w-8 h-8 text-cyan-400" />,
    color: '#06b6d4',
    accentBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300',
    gradient: 'from-cyan-950/40 via-slate-900/90 to-slate-950',
    simCardHover: 'hover:border-cyan-500/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.18)] group-hover:text-cyan-300',
    description: 'First-principles numerical simulation models.',
    governingLaw: 'Classical Physics & Conservation Laws',
    coreEquation: '\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}',
    equationDescription: "Faraday's Law of Electromagnetic Induction.",
    standards: ['International Engineering Standards'],
    simulators: FEATURED_ELECTRICAL_SIMULATORS,
    labCapacity: '4 Dedicated Physics Engines',
  };

  // Derive distinct subfields for filtering
  const availableSubfields = Array.from(
    new Set(departmentConfig.simulators.map((s) => getSimulatorSubCategory(s.type).subfield))
  );

  // Filter simulators by search, difficulty, and subfield
  const filteredSimulators = departmentConfig.simulators.filter((sim) => {
    const subCat = getSimulatorSubCategory(sim.type);
    const matchesSearch =
      sim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subCat.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDifficulty =
      selectedDifficulty === 'all' || sim.difficulty === selectedDifficulty;

    const matchesSubfield =
      selectedSubfield === 'all' || subCat.subfield === selectedSubfield;

    return matchesSearch && matchesDifficulty && matchesSubfield;
  });

  return (
    <div className="min-h-screen bg-[#080d16] text-slate-100 py-5 sm:py-8 px-3 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 relative overflow-x-hidden w-full max-w-full">
      <div className="w-full max-w-[1920px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 min-w-0">
            <button
              onClick={onBackToHome}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5 text-slate-300 hover:underline shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Departments</span>
            </button>
            <span className="text-slate-600 shrink-0">/</span>
            <span className="text-white font-bold truncate">{departmentConfig.name}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border ${departmentConfig.accentBg}`}>
              {departmentConfig.code}
            </span>
            <span className="text-xs font-mono text-emerald-400 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Physics Verified</span>
            </span>
          </div>
        </div>

        {/* Compact, Sleek Department Banner */}
        <div
          className={`relative rounded-2xl bg-gradient-to-r ${departmentConfig.gradient} border border-slate-800 p-5 sm:p-7 shadow-xl overflow-hidden`}
        >
          {/* Subtle Ambient Glow */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ backgroundColor: departmentConfig.color }}
          />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-lg shrink-0"
                  style={{ boxShadow: `0 8px 24px -4px ${departmentConfig.color}33` }}
                >
                  {departmentConfig.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Department Laboratory
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    <span className="text-[11px] font-mono font-semibold text-cyan-400">
                      {departmentConfig.labCapacity}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {departmentConfig.name}
                  </h1>
                </div>
              </div>

              {/* Core Equation Chip */}
              <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs font-bold text-cyan-300 shrink-0 shadow-inner flex items-center gap-2 max-w-full overflow-x-auto">
                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider shrink-0">Law:</span>
                <MathView math={departmentConfig.coreEquation} />
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-3xl mb-4">
              {departmentConfig.description}
            </p>

            {/* Standards Referenced */}
            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80">
              <span className="text-xs font-mono font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                Referenced Standards Literature:
              </span>
              {departmentConfig.standards.map((std, i) => (
                <span
                  key={i}
                  className="text-xs font-mono px-2.5 py-0.8 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 font-medium"
                >
                  {std}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Catalog Control Bar: Subfields, Search & Difficulty Filter */}
        <div className="space-y-3 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-md">
          {/* Subfield Domain Filter Pills (Fast & Intuitive Navigation) */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-800/60">
            <span className="text-xs font-mono text-slate-400 mr-1 flex items-center gap-1 font-semibold">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              Subfield:
            </span>
            <button
              onClick={() => setSelectedSubfield('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedSubfield === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              All Subfields ({departmentConfig.simulators.length})
            </button>
            {availableSubfields.map((sf) => (
              <button
                key={sf}
                onClick={() => setSelectedSubfield(sf)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedSubfield === sf
                    ? 'bg-slate-100 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-950/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {sf}
              </button>
            ))}
          </div>

          {/* Search & Difficulty Filter Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white">
                Showing {filteredSimulators.length} of {departmentConfig.simulators.length} Simulators
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Input */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search simulators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Difficulty Filter */}
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-700 shrink-0">
                {(['all', 'Fundamentals', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedDifficulty(lvl)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedDifficulty === lvl
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl === 'all' ? 'All' : lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Simulators Grid: Sleek, Home-Page Proportion, Distinctive Previews */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-4.5">
          {filteredSimulators.map((sim) => {
            const subCat = getSimulatorSubCategory(sim.type);

            return (
              <div
                key={sim.id}
                id={`sim-card-${sim.id}`}
                onClick={() => onLaunchSimulator(sim)}
                className={`group p-4 rounded-2xl border border-slate-800 bg-slate-900/80 hover:bg-slate-850 cursor-pointer transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-0.5 ${departmentConfig.simCardHover}`}
              >
                <div className="space-y-3">
                  {/* Top Subcategory Badge & Difficulty Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border truncate"
                      style={{
                        color: sim.accentColor || departmentConfig.color,
                        borderColor: `${sim.accentColor || departmentConfig.color}40`,
                        backgroundColor: `${sim.accentColor || departmentConfig.color}15`,
                      }}
                    >
                      {subCat.label}
                    </span>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-slate-400">
                        {sim.difficulty}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5" title="100% Physics Verified">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* 100% Unique 60 FPS Animated Canvas Preview */}
                  <SimulatorCardPreview
                    type={sim.type}
                    accentColor={sim.accentColor || departmentConfig.color}
                  />

                  {/* Title */}
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white transition-colors line-clamp-2 leading-snug">
                      {sim.title}
                    </h3>

                    {/* Concise Engineering Tagline */}
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed font-sans">
                      {sim.tagline}
                    </p>
                  </div>

                  {/* 2 Key Telemetry Metric Readout Chips */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {sim.keyMetrics.slice(0, 2).map((km, idx) => (
                      <div
                        key={idx}
                        className="px-2 py-1 rounded-md bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px] font-mono"
                      >
                        <span className="text-slate-400 truncate">{km.label}</span>
                        <span className="text-cyan-300 font-bold ml-1 shrink-0">{km.unit || 'unitless'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer: Standard Badge & Direct Launch */}
                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-1">
                  <span
                    className="text-[11px] font-mono text-slate-400 truncate max-w-[130px]"
                    title={sim.standardReference || sim.badge}
                  >
                    {sim.badge}
                  </span>

                  <span className="text-xs font-bold font-mono text-slate-300 group-hover:text-white flex items-center gap-1 shrink-0 transition-colors">
                    <span>Launch</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dedicated Subdomain Feature Section for Mechanical Digital Twins */}
        {departmentId === 'mechanical' && (
          <section className="relative mt-8 sm:mt-12 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/90 to-[#080d16] border border-amber-500/40 p-6 sm:p-8 shadow-2xl overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-3xl space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Specialized Subdomain Workbench
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">API 610 / 617 / 618 Ref</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">ASME B31.3 Ref</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">AGMA 2001 Ref</span>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
                  Advanced Mechanical Digital Twins
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
                  For full-fidelity turbomachinery, rotor dynamics, and industrial process simulations referencing published methodologies from API 610, API 617, API 618, ASME B31.3, and AGMA standards literature for educational and technical exploration, visit our dedicated mechanical engineering workbench.
                </p>

                <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-2 border-t border-amber-500/20">
                  <strong className="text-amber-400/90 font-mono">Standards Citation &amp; Non-Affiliation Notice:</strong> All standard designations (including API, ASME, AGMA, ISO, and IEEE) are cited exclusively for technical identification and academic literature context under nominative fair use. LiveSimulators is an independent educational platform and is not affiliated with, endorsed by, certified by, or sponsored by any standards organization, nor does it claim copyright in published standards.
                </p>
              </div>

              <div className="shrink-0">
                <a
                  href="https://mech.livesimulators.com"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-display font-bold text-sm sm:text-base shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 active:scale-95 transition-all duration-200"
                >
                  <span>Launch Mechanical Digital Twins →</span>
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Empty State if Search yielded no results */}
        {filteredSimulators.length === 0 && (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-1.5">No simulators found</h3>
            <p className="text-xs text-slate-400 mb-3">
              No simulators in {departmentConfig.name} matched your search or subfield filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDifficulty('all');
                setSelectedSubfield('all');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
