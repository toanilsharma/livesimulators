import React, { useState } from 'react';
import { Copy, Check, Code, FileText, Sparkles, BookOpen } from 'lucide-react';
import { DisciplineId } from '../../types';
import { MathView } from '../MathView';
import { soundEngine } from '../../utils/audio';

interface FormulaItem {
  id: string;
  name: string;
  latex: string;
  description: string;
  pythonSnippet: string;
  variables: { symbol: string; meaning: string; unit: string }[];
}

interface DepartmentFormulaCheatSheetProps {
  departmentId: DisciplineId;
  accentColor: string;
}

const DEPARTMENT_FORMULAS: Record<DisciplineId, { title: string; subtitle: string; formulas: FormulaItem[] }> = {
  electrical: {
    title: 'Core Governing Equations & Circuit Transfer Functions',
    subtitle: 'Publication-grade mathematical models governing analog circuits, RF transmission waveguides, and power grid harmonics.',
    formulas: [
      {
        id: 'rlc-resonance',
        name: 'Series RLC 2nd-Order Differential Equation',
        latex: 'L \\frac{d^2 i(t)}{dt^2} + R \\frac{di(t)}{dt} + \\frac{1}{C} i(t) = \\frac{dv_{in}(t)}{dt}',
        description: 'Governs instantaneous energy exchange between magnetic field in inductor L and electric field in capacitor C.',
        pythonSnippet: `import numpy as np
from scipy.integrate import odeint

def rlc_derivs(state, t, R, L, C, V0, omega):
    i, di_dt = state
    # d^2i/dt^2 = (V0*omega*cos(omega*t) - R*di_dt - i/C) / L
    d2i_dt2 = (V0 * omega * np.cos(omega * t) - R * di_dt - (1.0 / C) * i) / L
    return [di_dt, d2i_dt2]

# Parameters: R=25 Ohm, L=50mH, C=50uF
t = np.linspace(0, 0.05, 1000)
sol = odeint(rlc_derivs, [0.0, 0.0], t, args=(25.0, 0.05, 50e-6, 120.0, 2*np.pi*101))`,
        variables: [
          { symbol: 'L', meaning: 'Inductance', unit: 'H (Henries)' },
          { symbol: 'R', meaning: 'Series Resistance', unit: 'Ω (Ohms)' },
          { symbol: 'C', meaning: 'Capacitance', unit: 'F (Farads)' },
          { symbol: 'ω_0', meaning: 'Natural Resonant Frequency 1/√(LC)', unit: 'rad/s' },
          { symbol: 'ζ', meaning: 'Damping Ratio (R/2)√(C/L)', unit: 'dimensionless' },
        ],
      },
      {
        id: 'telegrapher',
        name: 'Telegrapher Wave Equation & Reflection Coefficient',
        latex: '\\frac{\\partial^2 v(z,t)}{\\partial z^2} = L\' C\' \\frac{\\partial^2 v(z,t)}{\\partial t^2}, \\quad \\Gamma_L = \\frac{Z_L - Z_0}{Z_L + Z_0}',
        description: 'Distributed parameter partial differential equation governing electromagnetic propagation along high-frequency RF lines.',
        pythonSnippet: `import numpy as np

def wave_reflection(Z_load, Z0=50.0):
    # Voltage Reflection Coefficient
    gamma = (Z_load - Z0) / (Z_load + Z0)
    # Voltage Standing Wave Ratio (VSWR)
    vswr = (1.0 + np.abs(gamma)) / (1.0 - np.abs(gamma))
    return gamma, vswr

gamma, vswr = wave_reflection(Z_load=150.0 + 50.0j, Z0=50.0)
print(f"Reflection Coefficient: {gamma:.4f}, VSWR: {vswr:.2f}")`,
        variables: [
          { symbol: 'Z_0', meaning: 'Characteristic Wave Impedance √(L\'/C\')', unit: 'Ω (Ohms)' },
          { symbol: 'Z_L', meaning: 'Complex Load Impedance', unit: 'Ω (Ohms)' },
          { symbol: 'Γ_L', meaning: 'Voltage Reflection Coefficient', unit: 'complex dimensionless' },
          { symbol: 'VSWR', meaning: 'Voltage Standing Wave Ratio (1+|Γ|)/(1-|Γ|)', unit: 'ratio' },
        ],
      },
      {
        id: 'fourier',
        name: 'Fourier Harmonic Decomposition & THD',
        latex: 'v(t) = \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} \\left[ a_n \\cos(n \\omega_0 t) + b_n \\sin(n \\omega_0 t) \\right], \\quad \\text{THD} = \\frac{\\sqrt{\\sum_{n=2}^\\infty V_n^2}}{V_1}',
        description: 'Harmonic spectral breakdown of periodic periodic wave signals according to IEEE Std 519-2022.',
        pythonSnippet: `import numpy as np

def square_wave_fourier(t, f0=60.0, num_harmonics=11):
    omega0 = 2 * np.pi * f0
    v = np.zeros_like(t)
    for n in range(1, num_harmonics * 2, 2):
        v += (4.0 / (n * np.pi)) * np.sin(n * omega0 * t)
    return v

t = np.linspace(0, 0.033, 1000)
waveform = square_wave_fourier(t, f0=60.0, num_harmonics=15)`,
        variables: [
          { symbol: 'a_n, b_n', meaning: 'Euler-Fourier Spectral Coefficients', unit: 'Volts (V)' },
          { symbol: 'ω_0', meaning: 'Fundamental Grid Angular Frequency 2πf_0', unit: 'rad/s' },
          { symbol: 'THD', meaning: 'Total Harmonic Distortion (IEEE 519)', unit: '% or ratio' },
        ],
      },
    ],
  },
  mechanical: {
    title: 'Core Governing Equations & Kinematic Models',
    subtitle: 'Publication-grade mathematical formulations for structural vibration, planar linkage kinematics, and thermodynamic power cycles.',
    formulas: [
      {
        id: 'sdof-vibe',
        name: 'Forced Damped Harmonic Oscillator Equation',
        latex: 'm \\frac{d^2 x}{dt^2} + c \\frac{dx}{dt} + k x = F_0 \\cos(\\omega t), \\quad M(\\omega) = \\frac{1}{\\sqrt{(1 - r^2)^2 + (2\\zeta r)^2}}',
        description: 'Second-order linear ODE governing mechanical vibration resonance and seismic transmissibility.',
        pythonSnippet: `import numpy as np

def magnification_factor(r, zeta=0.15):
    # r = omega / omega_n
    denom = np.sqrt((1.0 - r**2)**2 + (2.0 * zeta * r)**2)
    return 1.0 / denom

r_sweep = np.linspace(0.1, 2.5, 500)
M_sweep = magnification_factor(r_sweep, zeta=0.15)
peak_index = np.argmax(M_sweep)
print(f"Resonance peak M = {M_sweep[peak_index]:.2f} at r = {r_sweep[peak_index]:.2f}")`,
        variables: [
          { symbol: 'm', meaning: 'Oscillating Mass', unit: 'kg' },
          { symbol: 'c', meaning: 'Viscous Damping Coefficient', unit: 'N·s/m' },
          { symbol: 'k', meaning: 'Spring Stiffness', unit: 'N/m' },
          { symbol: 'r', meaning: 'Frequency Ratio ω/ω_n', unit: 'dimensionless' },
          { symbol: 'M(ω)', meaning: 'Dynamic Magnification Factor', unit: 'dimensionless' },
        ],
      },
      {
        id: 'freudenstein',
        name: 'Freudenstein Loop-Closure Kinematic Equation',
        latex: 'K_1 \\cos(\\theta_4) - K_2 \\cos(\\theta_2) + K_3 = \\cos(\\theta_2 - \\theta_4), \\quad K_1 = \\frac{d}{a}, \\; K_2 = \\frac{d}{c}',
        description: 'Non-linear kinematic synthesis relating input crank angle θ₂ to output rocker angle θ₄ in 4-bar planar linkages.',
        pythonSnippet: `import numpy as np

def four_bar_output_angle(theta2_rad, a=40.0, b=120.0, c=80.0, d=150.0):
    # Freudenstein constants
    K1 = d / a
    K2 = d / c
    K3 = (a**2 - b**2 + c**2 + d**2) / (2.0 * a * c)
    A = np.cos(theta2_rad) - K1 - K2 * np.cos(theta2_rad) + K3
    B = -2.0 * np.sin(theta2_rad)
    C = K1 - (K2 + 1.0) * np.cos(theta2_rad) + K3
    # Quadratic solve for tan(theta4/2)
    t = (-B - np.sqrt(B**2 - 4.0 * A * C)) / (2.0 * A)
    return 2.0 * np.arctan(t)`,
        variables: [
          { symbol: 'a, b, c, d', meaning: 'Link Lengths (Crank, Coupler, Rocker, Ground)', unit: 'mm' },
          { symbol: 'θ_2', meaning: 'Input Crank Driver Angle', unit: 'rad or deg' },
          { symbol: 'θ_4', meaning: 'Output Rocker Follower Angle', unit: 'rad or deg' },
        ],
      },
    ],
  },
  civil: {
    title: 'Core Governing Equations & Structural Mechanics',
    subtitle: 'Differential beam flexure, 2D stress transformation, and earthquake response spectra formulations.',
    formulas: [
      {
        id: 'euler-bernoulli',
        name: 'Euler-Bernoulli Elastic Beam Flexure Equation',
        latex: 'EI \\frac{d^4 w(x)}{dx^4} = q(x), \\quad M(x) = -EI \\frac{d^2 w(x)}{dx^2}, \\quad \\sigma_{max} = \\frac{M y}{I}',
        description: 'Fourth-order differential equilibrium governing beam vertical deflection under arbitrary lateral transverse loads.',
        pythonSnippet: `import numpy as np

def simply_supported_deflection(x, P=80e3, a=5.0, L=10.0, E=200e9, I=3e-4):
    # Simply supported beam with point load P at position a
    b = L - a
    if x <= a:
        return (P * b * x / (6 * E * I * L)) * (L**2 - b**2 - x**2)
    else:
        return (P * a * (L - x) / (6 * E * I * L)) * (2 * L * x - x**2 - a**2)

x_span = np.linspace(0, 10.0, 100)
w_deflections = [simply_supported_deflection(xi) * 1000 for xi in x_span] # mm`,
        variables: [
          { symbol: 'EI', meaning: 'Flexural Rigidity (Modulus E × Second Moment of Area I)', unit: 'N·m²' },
          { symbol: 'w(x)', meaning: 'Vertical Elastic Curve Deflection', unit: 'm or mm' },
          { symbol: 'M(x)', meaning: 'Bending Moment Distribution', unit: 'N·m or kN·m' },
          { symbol: 'σ_max', meaning: 'Extreme Fiber Bending Stress', unit: 'MPa' },
        ],
      },
      {
        id: 'mohr-circle',
        name: 'Mohr\'s Circle 2D Principal Stress Transformation',
        latex: '\\sigma_{1,2} = \\frac{\\sigma_x + \\sigma_y}{2} \\pm \\sqrt{\\left(\\frac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2}, \\quad \\tan(2\\theta_p) = \\frac{2\\tau_{xy}}{\\sigma_x - \\sigma_y}',
        description: 'Eigenvalue transformation of planar stress tensor to determine principal axes and maximum shear stress.',
        pythonSnippet: `import numpy as np

def mohr_principal_stresses(sigma_x, sigma_y, tau_xy):
    center = (sigma_x + sigma_y) / 2.0
    radius = np.sqrt(((sigma_x - sigma_y) / 2.0)**2 + tau_xy**2)
    sigma_1 = center + radius
    sigma_2 = center - radius
    tau_max = radius
    theta_p = 0.5 * np.arctan2(2 * tau_xy, sigma_x - sigma_y)
    return sigma_1, sigma_2, tau_max, np.degrees(theta_p)

s1, s2, tmax, ang = mohr_principal_stresses(80.0, -40.0, 30.0)`,
        variables: [
          { symbol: 'σ_x, σ_y', meaning: 'Normal In-Plane Stresses', unit: 'MPa' },
          { symbol: 'τ_xy', meaning: 'In-Plane Shear Stress', unit: 'MPa' },
          { symbol: 'σ_1, σ_2', meaning: 'Maximum and Minimum Principal Stresses', unit: 'MPa' },
          { symbol: 'θ_p', meaning: 'Principal Plane Orientation Angle', unit: 'deg' },
        ],
      },
    ],
  },
  control: {
    title: 'Core Governing Equations & Control Algorithms',
    subtitle: 'Ideal ISA feedback algorithms, frequency-domain stability criteria, and telemetry signal loop equations.',
    formulas: [
      {
        id: 'pid-isa',
        name: 'Ideal Parallel ISA PID Algorithm with Anti-Windup',
        latex: 'u(t) = K_p e(t) + \\frac{K_p}{T_i} \\int_0^t e(\\tau) d\\tau + K_p T_d \\frac{de(t)}{dt}, \\quad G_c(s) = K_p \\left( 1 + \\frac{1}{T_i s} + T_d s \\right)',
        description: 'Standard industrial closed-loop parallel PID feedback controller transfer function.',
        pythonSnippet: `import numpy as np

class PIDController:
    def __init__(self, Kp=2.5, Ki=1.2, Kd=0.5, dt=0.01, u_min=0.0, u_max=100.0):
        self.Kp, self.Ki, self.Kd = Kp, Ki, Kd
        self.dt = dt
        self.u_min, self.u_max = u_min, u_max
        self.integral = 0.0
        self.prev_error = 0.0

    def compute(self, setpoint, process_val):
        error = setpoint - process_val
        self.integral += error * self.dt
        deriv = (error - self.prev_error) / self.dt
        self.prev_error = error
        u_raw = self.Kp * error + self.Ki * self.integral + self.Kd * deriv
        # Clamping anti-windup
        return np.clip(u_raw, self.u_min, self.u_max)`,
        variables: [
          { symbol: 'K_p', meaning: 'Proportional Gain Coefficient', unit: 'dimensionless' },
          { symbol: 'T_i, K_i', meaning: 'Integral Reset Time / Gain', unit: 's / s⁻¹' },
          { symbol: 'T_d, K_d', meaning: 'Derivative Rate Time / Gain', unit: 's' },
          { symbol: 'e(t)', meaning: 'Control Error (Setpoint - Process Variable)', unit: 'engineering units' },
        ],
      },
      {
        id: 'control-valve',
        name: 'Control Valve Flow Sizing (ISA-75.01 / IEC 60534)',
        latex: 'Q = C_v N_1 F_p \\sqrt{\\frac{\\Delta P}{SG}}, \\quad \\Delta P_{max} = F_L^2 (P_1 - F_F P_v)',
        description: 'Incompressible fluid capacity equation relating volumetric flow to valve flow coefficient and differential pressure.',
        pythonSnippet: `import numpy as np

def valve_flow_rate(Cv, delta_P_psi, SG=1.0):
    # Q in GPM for liquid flow
    return Cv * np.sqrt(delta_P_psi / SG)

q_flow = valve_flow_rate(Cv=45.0, delta_P_psi=25.0, SG=1.0)
print(f"Flow Rate: {q_flow:.2f} GPM")`,
        variables: [
          { symbol: 'C_v', meaning: 'Valve Flow Capacity Coefficient', unit: 'GPM/psi^0.5' },
          { symbol: 'ΔP', meaning: 'Pressure Drop Across Valve Body', unit: 'psi or bar' },
          { symbol: 'F_L', meaning: 'Liquid Pressure Recovery Factor', unit: 'dimensionless' },
        ],
      },
    ],
  },
  chemical: {
    title: 'Core Governing Equations & Reaction Kinetics',
    subtitle: 'Coupled reaction conservation laws, McCabe-Thiele separation, and logarithmic heat transfer equations.',
    formulas: [
      {
        id: 'cstr-energy',
        name: 'Non-Isothermal CSTR Mass & Energy Balance',
        latex: 'V \\frac{dC_A}{dt} = F(C_{A0} - C_A) - V k_0 e^{-E_a/RT} C_A^2, \\quad V \\rho C_p \\frac{dT}{dt} = F \\rho C_p (T_0 - T) + (-\\Delta H_R) V r_A - U A (T - T_c)',
        description: 'Coupled differential equations governing dynamic conversion and thermal runaway in exothermic stirred reactors.',
        pythonSnippet: `import numpy as np
from scipy.integrate import odeint

def cstr_ode(state, t, F, V, CA0, T0, k0, Ea, R_gas, delta_H, rho, Cp, UA, Tc):
    CA, T = state
    k = k0 * np.exp(-Ea / (R_gas * T))
    rA = k * CA**2
    dCA_dt = (F / V) * (CA0 - CA) - rA
    dT_dt = (F / V) * (T0 - T) + ((-delta_H * rA) / (rho * Cp)) - (UA * (T - Tc)) / (V * rho * Cp)
    return [dCA_dt, dT_dt]`,
        variables: [
          { symbol: 'C_A', meaning: 'Reactant Concentration', unit: 'mol/L' },
          { symbol: 'T', meaning: 'Reactor Operating Temperature', unit: 'K' },
          { symbol: 'E_a', meaning: 'Arrhenius Activation Energy', unit: 'J/mol' },
          { symbol: 'ΔH_R', meaning: 'Heat of Reaction (Negative for Exothermic)', unit: 'kJ/mol' },
          { symbol: 'U A', meaning: 'Cooling Jacket Heat Transfer Conductance', unit: 'W/K' },
        ],
      },
      {
        id: 'lmtd-hx',
        name: 'Heat Exchanger Rating & LMTD Equation',
        latex: 'Q = U A F \\Delta T_{lm}, \\quad \\Delta T_{lm} = \\frac{\\Delta T_1 - \\Delta T_2}{\\ln(\\Delta T_1 / \\Delta T_2)}',
        description: 'Governs steady-state thermal duty in shell-and-tube counter-current exchangers according to TEMA standards.',
        pythonSnippet: `import numpy as np

def calculate_lmtd(Th_in, Th_out, Tc_in, Tc_out):
    dt1 = Th_in - Tc_out
    dt2 = Th_out - Tc_in
    return (dt1 - dt2) / np.log(dt1 / dt2)

lmtd = calculate_lmtd(Th_in=120.0, Th_out=70.0, Tc_in=25.0, Tc_out=55.0)
print(f"LMTD: {lmtd:.2f} deg C")`,
        variables: [
          { symbol: 'Q', meaning: 'Thermal Heat Transfer Duty', unit: 'kW or W' },
          { symbol: 'U', meaning: 'Overall Heat Transfer Coefficient', unit: 'W/(m²·K)' },
          { symbol: 'ΔT_lm', meaning: 'Logarithmic Mean Temperature Difference', unit: 'K or °C' },
        ],
      },
    ],
  },
  physics: {
    title: 'Core Governing Equations & Quantum Solid-State Physics',
    subtitle: 'Poisson-Boltzmann band bending, nanoscale BSIM4 inversion transport, and wide-bandgap switching integrals.',
    formulas: [
      {
        id: 'pn-poisson',
        name: 'P-N Junction Electrostatic Band Bending',
        latex: '\\frac{d^2 \\phi(x)}{dx^2} = -\\frac{\\rho(x)}{\\varepsilon_s}, \\quad W_{dep} = \\sqrt{\\frac{2 \\varepsilon_s}{q} \\left( \\frac{1}{N_A} + \\frac{1}{N_D} \\right) (V_{bi} - V_a)}',
        description: 'Poisson-Boltzmann 1D electrostatics governing space-charge depletion width and built-in potential barrier.',
        pythonSnippet: `import numpy as np

def depletion_width(Va, Vbi=0.72, NA=1e16, ND=1e17, eps_s=11.7*8.854e-14, q=1.602e-19):
    barrier = np.maximum(0.01, Vbi - Va)
    factor = (2.0 * eps_s / q) * (1.0 / NA + 1.0 / ND)
    w_cm = np.sqrt(factor * barrier)
    return w_cm * 1e4 # convert to microns

w_dep_0V = depletion_width(Va=0.0)
w_dep_rev = depletion_width(Va=-5.0)
print(f"Depletion width @ 0V: {w_dep_0V:.3f} um | @ -5V: {w_dep_rev:.3f} um")`,
        variables: [
          { symbol: 'W_dep', meaning: 'Space-Charge Depletion Width', unit: 'µm or nm' },
          { symbol: 'V_bi', meaning: 'Built-in Junction Potential Barrier', unit: 'V' },
          { symbol: 'V_a', meaning: 'Applied External Terminal Bias', unit: 'V' },
          { symbol: 'ε_s', meaning: 'Semiconductor Permittivity', unit: 'F/cm' },
        ],
      },
      {
        id: 'sic-switching',
        name: 'SiC Power MOSFET Dynamic Switching Loss Integral',
        latex: 'E_{sw} = E_{on} + E_{off} = \\int_0^{t_{on}} v_{ds}(t) i_d(t) dt + \\int_0^{t_{off}} v_{ds}(t) i_d(t) dt',
        description: 'High-frequency double-pulse inductive switching loss integral according to JEDEC JESD24-11 standard.',
        pythonSnippet: `import numpy as np

def switching_loss(V_dc=800.0, I_load=50.0, t_rise=15e-9, t_fall=20e-9):
    # Triangular overlap approximation
    E_on = 0.5 * V_dc * I_load * t_rise
    E_off = 0.5 * V_dc * I_load * t_fall
    return E_on, E_off, (E_on + E_off)

e_on, e_off, e_tot = switching_loss()
print(f"Total Switching Energy: {e_tot*1e3:.3f} mJ")`,
        variables: [
          { symbol: 'E_sw', meaning: 'Total Dynamic Switching Energy Dissipation', unit: 'mJ or µJ' },
          { symbol: 'v_ds(t)', meaning: 'Drain-to-Source Voltage Waveform', unit: 'V' },
          { symbol: 'i_d(t)', meaning: 'Drain Terminal Current Waveform', unit: 'A' },
        ],
      },
    ],
  },
};

export const DepartmentFormulaCheatSheet: React.FC<DepartmentFormulaCheatSheetProps> = ({
  departmentId,
  accentColor,
}) => {
  const data = DEPARTMENT_FORMULAS[departmentId] || DEPARTMENT_FORMULAS.electrical;
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    soundEngine.playRelayClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section
      id="formulas"
      aria-label={data.title}
      className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7 shadow-xl space-y-6 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-xl border shrink-0"
            style={{
              backgroundColor: `${accentColor}15`,
              borderColor: `${accentColor}40`,
              color: accentColor,
            }}
          >
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: `${accentColor}12`,
                  borderColor: `${accentColor}30`,
                  color: accentColor,
                }}
              >
                Engineering Reference
              </span>
              <span className="text-xs text-slate-400 font-mono">LaTeX &amp; Python Ready</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
              {data.title}
            </h2>
          </div>
        </div>
        <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
          {data.subtitle}
        </p>
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {data.formulas.map((form) => (
          <div
            key={form.id}
            className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-4 sm:p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold text-white tracking-tight">
                  {form.name}
                </h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Copy LaTeX button */}
                  <button
                    onClick={() => handleCopy(form.latex, `${form.id}-latex`)}
                    className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Copy LaTeX"
                  >
                    {copiedId === `${form.id}-latex` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-400" />
                        <span>LaTeX</span>
                      </>
                    )}
                  </button>

                  {/* Copy Python code button */}
                  <button
                    onClick={() => handleCopy(form.pythonSnippet, `${form.id}-py`)}
                    className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Copy Python SciPy Snippet"
                  >
                    {copiedId === `${form.id}-py` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Code className="w-3 h-3 text-cyan-400" />
                        <span>Python</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* KaTeX Math Equation Render */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800/80 my-2.5 overflow-x-auto text-center font-mono text-cyan-300 shadow-inner">
                <MathView math={form.latex} block />
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans mt-2">
                {form.description}
              </p>
            </div>

            {/* Variable Definitions Table */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Physical Variables &amp; SI Units
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] font-mono">
                {form.variables.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-2 py-1 rounded bg-slate-900/60 border border-slate-800/60"
                  >
                    <span className="text-cyan-300 font-bold">{v.symbol}</span>
                    <span className="text-slate-400 text-right truncate ml-2">
                      {v.meaning} <span className="text-slate-500">({v.unit})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
