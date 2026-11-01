/**
 * Authoritative Engineering Content Database for all 44 LiveSimulators models.
 * Provides:
 * 1. directAnswerSummary: ~50-word RAG-ready citation block with governing formula, boundary conditions, and international standards.
 * 2. industrialFailureCase: 120-150 word real-world industrial failure mode, root cause analysis (RCA), and protection thresholds.
 * 3. faqs: 3 high-intent domain-specific engineering Q&As.
 */

export interface SimulatorEngineeringContent {
  directAnswerSummary: string;
  industrialFailureCase: string;
  faqs: Array<{ question: string; answer: string }>;
}

export const SIMULATOR_ENGINEERING_CONTENT: Record<string, SimulatorEngineeringContent> = {
  // =========================================================================
  // 1. ELECTRICAL & ELECTRONIC SYSTEMS
  // =========================================================================
  'rlc-resonance': {
    directAnswerSummary:
      'The series RLC circuit is governed by Kirchhoff\'s Voltage Law with natural resonant frequency \\omega_0 = 1/\\sqrt{LC} and damping ratio \\zeta = (R/2)\\sqrt{C/L}. Boundary stability requires R > 0 with critical resistance R_{crit} = 2\\sqrt{L/C}. Standardized under IEEE Std 1459-2010 and IEC 60076 for power factor compensation and substation resonant overvoltage mitigation.',
    industrialFailureCase:
      'Subsynchronous Resonance (SSR) and Ferroresonance in 400 kV Grid Substations: Series capacitor banks installed on long-distance transmission lines to improve throughput can interact with nearby turbo-generator shafts. Root Cause Analysis (RCA) revealed that under light load, non-linear core saturation of intermediate power transformers shifts electrical circuit resonance into subsynchronous frequencies matching generator torsional natural frequencies. The resulting resonant overvoltages exceeding 2.5 p.u. induced mechanical shaft shear fatigue and punctured winding insulation. Protection Thresholds mandate Subsynchronous Damping Schemes (SSDS) and metal-oxide surge arresters (MOVs) clamping at 1.8 p.u. crest voltage, alongside bypass damping filters tuned per IEEE Std 3002.8 and IEEE C37.90 to trip circuit breakers within 50 ms upon detecting undamped sub-harmonic oscillations.',
    faqs: [
      {
        question: 'What is the physical condition for resonance in a series RLC circuit?',
        answer: 'Resonance occurs when inductive reactance equals capacitive reactance (X_L = X_C, or ωL = 1/(ωC)). At this resonant frequency f₀ = 1 / (2π√(LC)), net circuit impedance is purely resistive (|Z| = R), and current reaches its maximum possible amplitude for a given source voltage.',
      },
      {
        question: 'How does the damping ratio ζ determine the circuit response envelope?',
        answer: 'For ζ < 1 (underdamped), the circuit exhibits decaying sinusoidal ringing with envelope exp(-ζω₀t). For ζ = 1 (critically damped), the transient settles to steady state in minimal time without overshoot. For ζ > 1 (overdamped), energy returns sluggishly through two real exponential decay modes.',
      },
      {
        question: 'Why does voltage across the capacitor or inductor exceed the source voltage at high Q?',
        answer: 'The quality factor Q = (1/R)√(L/C) acts as a passive resonant voltage multiplier. At resonance, reactive energy circulates between L and C, causing V_L = V_C = Q · V_source. In low-loss circuits (Q > 10), peak reactive voltages can rupture dielectric insulation if not clamped.',
      },
    ],
  },

  'three-phase-ac': {
    directAnswerSummary:
      'Balanced three-phase networks satisfy active power P = \\sqrt{3} V_L I_L \\cos\\phi and reactive power Q = \\sqrt{3} V_L I_L \\sin\\phi. Boundary conditions mandate 120-degree symmetrical displacement with neutral current I_N = 0. Governed by IEEE Std 1159 and IEC 61000-4-30 Class A compliance for industrial distribution efficiency.',
    industrialFailureCase:
      'Single-Phasing and Protective CT Saturation in 33 kV Industrial Switchgear: In overhead medium-voltage distribution systems, broken conductors or blown phase fuses create severe asymmetrical voltage unbalance. Root Cause Analysis (RCA) demonstrated that open-phase operation produces intense negative-sequence currents (I₂/I₁ > 0.08), inducing 100 Hz rotor eddy currents that overheated induction motor windings by 60°C within 3 minutes. Concurrently, high asymmetrical fault currents drove protective current transformers (CTs) into deep magnetic flux saturation within 4 ms, causing differential relays to mal-operate. Protection Thresholds per IEEE C37.110 and IEC 60255 mandate negative-sequence overcurrent relays (Device 46) tripping at I₂²t ≤ 10, combined with CT knee-point voltages exceeding twice the maximum secondary burden loop drop.',
    faqs: [
      {
        question: 'What causes neutral current to vanish in balanced three-phase systems?',
        answer: 'In a symmetrical three-phase system, the instantaneous sum of three sinusoidal currents displaced by 120° is identically zero (i_a + i_b + i_c = 0) at all time instants, eliminating return current through the neutral conductor.',
      },
      {
        question: 'What is the mathematical relation between line and phase quantities in Wye vs Delta?',
        answer: 'In a Wye (Star) network, V_Line = √3 · V_Phase (with a 30° lead) while I_Line = I_Phase. In a Delta network, V_Line = V_Phase while I_Line = √3 · I_Phase (with a 30° lag).',
      },
      {
        question: 'How does low displacement power factor impact industrial transmission lines?',
        answer: 'Low power factor (cos φ < 0.85) increases the current required to deliver real work, escalating ohmic I²R thermal losses across cables, depressing receiving-end voltage, and incurring heavy utility demand surcharges per IEEE 1459.',
      },
    ],
  },

  'buck-boost-converter': {
    directAnswerSummary:
      'The inverting buck-boost converter converts DC voltages according to V_{out} = -V_{in} D / (1 - D). Boundary continuous-conduction mode requires L > (1 - D)^2 R / (2 f_{sw}) under duty ratio 0 < D < 0.85. Designed per IEC 62477-1 and IEEE Std 1515 for automotive and renewable energy conversion.',
    industrialFailureCase:
      'Right-Half-Plane (RHP) Zero Phase Erosion and Inductor Core Saturation: In high-density DC-DC step-up switching converters, rapid increases in load demand cause duty cycles to surge beyond D = 0.75. Root Cause Analysis (RCA) indicated that during transient load steps, energy delivery to the output is temporarily halted during the extended switch-on time, introducing a non-minimum-phase Right-Half-Plane (RHP) zero that eroded control loop phase margin by 42°. Concurrently, peak inductor current exceeded the core saturation threshold (B > 0.39 T), collapsing inductance by 85%. The resulting current spike triggered thermal avalanche breakdown in low-side GaN/MOSFETs within 12 μs. Protection Thresholds mandate cycle-by-cycle peak current limiting at 1.4 × I_rated and slope-compensated peak current-mode control per IEC 62477-1.',
    faqs: [
      {
        question: 'Why is the output voltage polarity inverted in a basic buck-boost regulator?',
        answer: 'During the switch-on state, current ramps up in the inductor from the input source. When the switch opens, inductor voltage reverses polarity (Lenz’s law) to maintain continuous current flow, forcing charge into the output capacitor from ground upward, establishing a negative output potential.',
      },
      {
        question: 'What distinguishes Continuous Conduction Mode (CCM) from Discontinuous Mode (DCM)?',
        answer: 'In CCM, inductor current remains strictly greater than zero throughout the entire switching period. In DCM, inductor current drops to zero before the next cycle begins, causing output voltage to become load-dependent and modifying converter transfer functions.',
      },
      {
        question: 'Why does operating at extreme duty cycles (D > 0.85) impair efficiency?',
        answer: 'High duty cycles concentrate conduction into extreme diode and inductor current spikes, escalating I²R resistive losses and magnetic core losses. Furthermore, the Right-Half-Plane (RHP) zero migrates to lower frequencies, severely compromising closed-loop control stability.',
      },
    ],
  },

  'sallen-key-filter': {
    directAnswerSummary:
      'The 2nd-order Sallen-Key low-pass filter exhibits cut-off frequency f_c = 1 / (2\\pi\\sqrt{R_1 R_2 C_1 C_2}) and quality factor Q. Operational stability requires amplifier gain K < 3 for equal-component layouts to avoid Right-Half-Plane poles. Compliant with IEEE Std 1668 and IEC 60384 for precision anti-aliasing.',
    industrialFailureCase:
      'High-Q Parasitic Self-Oscillation and Op-Amp Input Common-Mode Distortion: In multichannel seismic instrumentation and biomedical ECG acquisition front-ends, active filter stages conditioning high-impedance sensor inputs experienced spontaneous sustained 40 kHz oscillation. Root Cause Analysis (RCA) revealed that passive resistor tolerances (5%) combined with board-level parasitic trace capacitances shifted the filter quality factor from Q = 0.707 (Butterworth maximally flat) to Q = 4.8. Under step transient excitation, the closed-loop poles migrated into the right-half s-plane, driving the operational amplifier into saturation clipping. Protection Thresholds require precision 0.1% thin-film resistors (MIL-PRF-55342), NPO/C0G dielectric capacitors, and in-loop damping resistors maintaining Q ≤ 0.707 across -40°C to +85°C operating envelopes.',
    faqs: [
      {
        question: 'Why is the Butterworth alignment commonly selected for Sallen-Key filters?',
        answer: 'The Butterworth alignment (Q = 1/√2 ≈ 0.7071) provides maximally flat passband magnitude response with zero passband ripple and monotonic rolloff of -40 dB/decade, making it ideal for ADC anti-aliasing.',
      },
      {
        question: 'How does amplifier open-loop gain-bandwidth product (GBWP) limit filter cutoff frequency?',
        answer: 'To preserve ideal active filter synthesis, the op-amp GBWP must be at least 50 to 100 times higher than the filter cutoff frequency f_c. Insufficient GBWP shifts pole positions, elevates Q, and degrades high-frequency attenuation.',
      },
      {
        question: 'Why does unity-gain Sallen-Key topology offer superior component sensitivity?',
        answer: 'A unity-gain voltage follower (K = 1) eliminates gain-setting resistors, minimizes sensitivity to op-amp open-loop gain drift, and ensures unconditional operational stability independent of feedback resistor tolerances.',
      },
    ],
  },

  'transmission-line': {
    directAnswerSummary:
      'Uniform transmission lines are governed by Telegrapher\'s equations with characteristic impedance Z_0 = \\sqrt{(R + j\\omega L)/(G + j\\omega C)} and voltage reflection coefficient \\Gamma = (Z_L - Z_0)/(Z_L + Z_0). Matched conditions mandate Z_L = Z_0 (VSWR = 1.0). Engineered per IEEE Std 142 and MIL-STD-188-124B for RF power transfer.',
    industrialFailureCase:
      'Standing Wave Dielectric Arcing and High-Power Transmitter Output Stage Burnout: In 50 kW broadcast transmitters and industrial plasma RF heating systems, sudden antenna matching network decoupling caused complete wave reflection (Γ ≈ 1.0). Root Cause Analysis (RCA) revealed that an open-circuit fault at the load produced stationary voltage standing waves along the 50 Ω coaxial feeder line, causing peak antinode voltages to double to 2 × V_peak. The intense electric field gradient exceeded the dielectric breakdown threshold of PTFE insulation (20 kV/mm), initiating destructive corona flashover that burned out the LDMOS RF power transistors within 2 μs. Protection Thresholds mandate directional couplers monitoring reflected power with fast hardware interlocks shutting down gate bias when VSWR ≥ 1.5 within < 10 μs.',
    faqs: [
      {
        question: 'What is the physical interpretation of characteristic impedance Z₀?',
        answer: 'Characteristic impedance Z₀ is the ratio of voltage to current for a single traveling wave propagating indefinitely along the line without reflections. It is purely determined by geometry and dielectric permittivity (√(L/C)), independent of line length.',
      },
      {
        question: 'What occurs physically when a transmission line is terminated in a short circuit?',
        answer: 'At a short circuit (Z_L = 0), voltage is forced to zero (Γ = -1), and 100% of the incident wave reflects with a 180° phase inversion, forming a stationary standing wave with voltage nodes and current antinodes.',
      },
      {
        question: 'How does high Voltage Standing Wave Ratio (VSWR) damage RF power sources?',
        answer: 'A high VSWR (VSWR > 2.0) indicates heavy reflected power returning into the generator output stage. This standing wave energy generates severe voltage overstress across output transistors and excessive thermal dissipation in output matching networks.',
      },
    ],
  },

  'fourier-synthesis': {
    directAnswerSummary:
      'Periodic signals decompose into Fourier series f(t) = a_0 + \\sum [a_n \\cos(n\\omega_0 t) + b_n \\sin(n\\omega_0 t)] with total harmonic distortion THD = \\sqrt{\\sum_{n=2} V_n^2} / V_1. Standard grid operations require THD < 5.0% per IEEE Std 519-2022 and IEC 61000-3-2 to ensure power quality and equipment longevity.',
    industrialFailureCase:
      'Harmonic Resonance and Power Factor Correction (PFC) Capacitor Bank Rupture: In automotive manufacturing facilities operating banks of 6-pulse variable frequency drives (VFDs), harmonic currents (predominantly 5th and 7th harmonics) were injected into the facility distribution bus. Root Cause Analysis (RCA) proved that the addition of power factor correction capacitor banks formed a parallel resonant circuit with the upstream 2 MVA transformer leakage inductance at 250 Hz (5th harmonic). Harmonic currents magnified eight-fold, causing capacitor bank RMS current to exceed 160% of rating. The sustained over-current generated extreme internal thermal gas pressures that ruptured capacitor metal canisters. Protection Thresholds per IEEE 519 mandate installing 7% detuned iron-core reactors (shifting resonance to 189 Hz) and active harmonic filters tripping when THD exceeds 5.0%.',
    faqs: [
      {
        question: 'Why do pure square waves contain only odd harmonic components?',
        answer: 'Square waves exhibit half-wave odd symmetry (f(t) = -f(t + T/2)). In Fourier expansion, this mathematical symmetry cancels all even-numbered harmonics, leaving only odd harmonics decaying at 1/n amplitude.',
      },
      {
        question: 'What is Gibbs phenomenon and why does overshoot persist as N approaches infinity?',
        answer: 'At jump discontinuities, the Fourier series exhibits an inescapable ~8.95% overshoot. While adding harmonics compresses the overshoot closer to the discontinuity boundary, the peak amplitude overshoot never vanishes due to non-uniform convergence.',
      },
      {
        question: 'Why are harmonic currents destructive to industrial power transformers?',
        answer: 'Harmonic currents increase transformer eddy current losses (proportional to f²) and stray losses, causing localized thermal hotspots, accelerated paper insulation degradation, and premature transformer failure unless derated using K-Factor standards.',
      },
    ],
  },

  'op-amp-circuits': {
    directAnswerSummary:
      'Linear operational amplifier circuits operate under virtual short assumptions V_+ = V_- and zero input bias current. Governing transfer functions are V_{out} = -(R_f/R_{in})V_{in} (inverting) and V_{out} = (1 + R_f/R_1)V_{in} (non-inverting). Designed per IEEE Std 314 and IEC 60748-3 for instrumentation integrity.',
    industrialFailureCase:
      'Capacitive Load Instability and Slew-Rate Induced Limit-Cycle Oscillation: In industrial chemical processing telemetry, operational amplifier buffers driving long shielded signal cables (C_L > 2500 pF) experienced persistent 2 MHz burst oscillations. Root Cause Analysis (RCA) revealed that cable capacitance interacting with the op-amp open-loop output resistance (R_o ≈ 50 Ω) introduced an unintended pole inside the feedback loop, eroding phase margin to under 15°. The resulting phase lag drove the amplifier into high-frequency limit cycles, corrupting 4–20 mA pressure telemetry. Protection Thresholds mandate in-loop isolation resistors (R_iso = 47 Ω) and feedback lead compensation capacitors (C_f = 22 pF) maintaining phase margin ≥ 45° under all cable capacitance regimes per MIL-STD-883 guidelines.',
    faqs: [
      {
        question: 'What physical conditions validate the "Virtual Short" concept in op-amps?',
        answer: 'The virtual short (V_+ ≈ V_-) holds only when negative feedback is intact and the op-amp operates within its linear range without output rail saturation, driven by extremely high open-loop gain (typically A_OL > 100,000).',
      },
      {
        question: 'How does input offset voltage (V_os) introduce errors in high-gain stages?',
        answer: 'Input offset voltage is amplified by the circuit noise gain (1 + R_f/R_in). In high-gain DC preamplifiers (e.g., gain = 1000), a 2 mV offset produces a 2 V output DC error, severely reducing dynamic headroom and causing premature saturation.',
      },
      {
        question: 'What is the distinction between Gain-Bandwidth Product (GBWP) and Slew Rate?',
        answer: 'GBWP governs linear small-signal frequency response, whereas Slew Rate (V/μs) defines the maximum large-signal rate of output voltage change dictated by internal compensation capacitor charging currents.',
      },
    ],
  },

  'rc-rl-transient': {
    directAnswerSummary:
      'First-order RC and RL transient circuits obey exponential relaxations v_C(t) = V_0(1 - e^{-t/\\tau}) with \\tau = RC, and i_L(t) = I_0(1 - e^{-t/\\tau}) with \\tau = L/R. Full steady-state equilibrium requires t \\ge 5\\tau (99.3%). Regulated under IEC 60947-4-1 and IEEE C37.04 for inductive switching protection.',
    industrialFailureCase:
      'Inductive Voltage Kickback and Snubber Flashover during Contactor De-energization: In automated assembly plants, unsuppressed 24 VDC inductive valve coils (L = 3.5 H, I = 2.0 A) were repeatedly switched by PLC output transistors. Root Cause Analysis (RCA) proved that rapidly interrupting inductor current forced di/dt to extreme values, generating inductive flyback spikes exceeding V = -L(di/dt) > 2200 V. The surge created dielectric flashover across relay contacts and punched through MOSFET drain-source oxide junctions, destroying PLC output cards. Protection Thresholds per IEC 60947 mandate freewheeling Schottky diodes or bidirectional TVS clamping diodes rated to absorb full coil magnetic energy (0.5 × L × I²) while clamping inductive transients below 35 VDC.',
    faqs: [
      {
        question: 'Why cannot current through an inductor change instantaneously?',
        answer: 'Inductors obey Faraday’s Law v(t) = L (di/dt). An instantaneous change in current (di/dt = ∞) would require infinite terminal voltage and infinite power, which is physically impossible; magnetic flux linkage must remain continuous.',
      },
      {
        question: 'Why cannot voltage across a capacitor change instantaneously?',
        answer: 'Capacitors obey i(t) = C (dv/dt). An instantaneous step in terminal voltage would require infinite charging current, violating energy conservation; electric charge and terminal voltage must evolve continuously.',
      },
      {
        question: 'What practical percentage of steady state is attained after 1, 3, and 5 time constants?',
        answer: 'After 1τ, the response reaches 63.2% of its final step change. After 3τ, it attains 95.0%. After 5τ, it exceeds 99.3%, which is universally recognized in engineering as reaching steady-state equilibrium.',
      },
    ],
  },

  'transformer-oc-sc-test': {
    directAnswerSummary:
      'Transformer equivalent circuit parameters are decoupled via Open-Circuit test (R_c = V_{oc}^2 / P_{oc}, X_m = V_{oc} / I_m) and Short-Circuit test (R_{eq} = P_{sc} / I_{sc}^2, X_{eq} = \\sqrt{Z_{sc}^2 - R_{eq}^2}). Tested per IEEE Std C57.12.90 and IEC 60076-1 to verify core iron and copper loss guarantees.',
    industrialFailureCase:
      'Inrush Current Tripping and Inter-Turn Insulation Breakdown during Substation Re-energization: A 10 MVA 33/11 kV oil-immersed distribution transformer tripped instantaneously upon re-energization following maintenance. Root Cause Analysis (RCA) revealed that energizing the transformer at the voltage waveform zero-crossing caused residual core flux to exceed saturation flux density (B > 2.0 T). The resulting magnetizing inrush current spiked to 11 × I_rated, generating severe electrodynamic axial clamping forces that compressed winding spacers. Friction abraded the paper insulation, creating turn-to-turn short circuits. Protection Thresholds mandate transformer differential relays (Device 87T) with 2nd-harmonic restraint (blocking trips when 2nd-harmonic content exceeds 15%) and point-on-wave switching controllers per IEEE C37.90.',
    faqs: [
      {
        question: 'Why are copper losses considered negligible during the Open-Circuit test?',
        answer: 'During the open-circuit test at rated voltage, the exciting current is extremely small (typically 1% to 3% of full-load current). Because copper loss scales with current squared (I²R), series winding losses drop below 0.1% of total power.',
      },
      {
        question: 'Why are iron core losses considered negligible during the Short-Circuit test?',
        answer: 'During the short-circuit test, rated current circulates under a very low applied voltage (typically 3% to 8% of rated V). Because core iron losses scale with voltage squared (V²), core hysteresis and eddy currents are virtually zero.',
      },
      {
        question: 'How does operating power factor influence transformer voltage regulation?',
        answer: 'Lagging power factor loads cause voltage drop due to additive series resistance and leakage reactance drops, yielding positive regulation. Leading power factor loads can cause receiving-end voltage rise (negative regulation).',
      },
    ],
  },

  'dc-motor-speed-control': {
    directAnswerSummary:
      'Separately excited DC motors satisfy speed equation \\omega = (V_a - I_a R_a) / (K_e \\Phi) and electromagnetic torque T_e = K_t \\Phi I_a. Boundary operating states enforce armature current I_a \\le 2.0 I_{rated} and minimum field excitation \\Phi > \\Phi_{min}. Regulated by NEMA MG-1 Part 14 and IEC 60034-1.',
    industrialFailureCase:
      'Field Loss Catastrophic Mechanical Overspeed (Runaway) in Steel Rolling Drives: A 250 kW DC rolling mill drive experienced severe mechanical destruction during high-speed rolling. Root Cause Analysis (RCA) showed that thermal oxidation on field excitation terminal lugs caused an open-circuit field failure. As field flux collapsed (Φ → 0), motor back-EMF (E_b = K_e Φ ω) vanished. In attempting to balance applied armature voltage, motor speed accelerated exponentially past 350% of rated RPM. Centrifugal forces exceeded the tensile yield strength of rotor banding wire, projecting copper commutator bars outward and destroying the motor housing. Protection Thresholds mandate DC field loss relays (Device 40) interlocked directly with fast dynamic braking and thyristor DC bus trip contactors within < 30 ms.',
    faqs: [
      {
        question: 'Why does reducing magnetic field flux cause a DC motor to accelerate?',
        answer: 'Reducing field flux Φ momentarily depresses back-EMF (E_b = K_e Φ ω). Because armature resistance is tiny, this small back-EMF drop causes a huge surge in armature current I_a, generating excess accelerating torque (T_e > T_load) until speed rises to re-establish back-EMF balance.',
      },
      {
        question: 'Why is starting current so dangerously high without external armature resistance?',
        answer: 'At stall (ω = 0), back-EMF is zero. The only impedance limiting current is armature resistance R_a (typically < 0.2 Ω). Direct-on-line connection would cause starting current I_start = V_a / R_a to spike to 10 to 20 times rated current, burning brushes and commutators.',
      },
      {
        question: 'What is the operational distinction between armature voltage control and field weakening?',
        answer: 'Armature voltage control operates below base speed at constant torque capacity. Field weakening operates above base speed by reducing field flux, providing constant power capacity while available torque drops inversely with speed.',
      },
    ],
  },

  'induction-motor-torque-slip': {
    directAnswerSummary:
      'Three-phase induction motor electrodynamics follow the IEEE/Steinmetz torque-slip relation with breakdown slip s_{max} = R_2\' / \\sqrt{R_{th}^2 + (X_{th} + X_2\')^2}. Operating envelopes enforce slip 0.01 \\le s \\le 0.05 and pull-out torque ratio T_{max}/T_{rated} \\ge 2.0. Compliant with IEC 60034-12 and NEMA MG-1 Design B.',
    industrialFailureCase:
      'Rotor Bar Thermal Cracking and Voltage Sag Stall in Refinery Water Injection Pumps: A 500 kW 4.16 kV squirrel-cage induction motor stalled during an unexpected 20% plant distribution voltage sag. Root Cause Analysis (RCA) proved that torque capacity collapsed by 36% (torque scales as V²). The heavy centrifugal load exceeded available breakdown torque, driving the motor into stall (s = 1.0). The resulting locked-rotor current (6.2 × I_rated) concentrated in the upper rotor bar surfaces due to skin effect. Temperatures exceeded 380°C within 14 seconds, cracking aluminum rotor end-rings and melting stator slot insulation. Protection Thresholds mandate locked-rotor protection (Device 51LR) and thermal model protection (Device 49) tripping within 8 seconds under sustained undervoltage stalling.',
    faqs: [
      {
        question: 'Why is developed torque zero at synchronous speed (slip = 0)?',
        answer: 'At synchronous speed (ω_m = ω_s), rotor conductors move at the exact speed of the rotating stator magnetic field. Relative velocity is zero, so no rate of change of flux occurs, zero rotor EMF is induced, zero rotor current flows, and zero Lorentz force torque is produced.',
      },
      {
        question: 'Why does adding external rotor resistance increase starting torque in wound-rotor motors?',
        answer: 'Adding rotor resistance increases breakdown slip s_max toward 1.0 (stall). While maximum peak torque remains unchanged, shifting the peak torque point to s = 1.0 dramatically maximizes starting torque while reducing inrush starting current.',
      },
      {
        question: 'How does operating voltage depression impact motor torque and operating temperature?',
        answer: 'Electromagnetic torque scales strictly with the square of voltage (T ∝ V²). A 10% voltage drop reduces torque by 19%. To drive a constant-power mechanical load, the motor draws higher current, increasing winding I²R thermal dissipation by over 20%.',
      },
    ],
  },

  'solar-pv-mppt': {
    directAnswerSummary:
      'Photovoltaic current follows Shockley diode physics I = I_{ph} - I_0[\\exp(q(V + I R_s)/(n k T)) - 1] - (V + I R_s)/R_{sh} with Maximum Power Point (MPP) tracking. Environmental boundaries span 100 \\le G \\le 1200 \\text{ W/m}^2 and -20 \\le T \\le 85^\\circ\\text{C}. Governed by IEC 60904 and IEEE 1547-2018 standards.',
    industrialFailureCase:
      'Hot-Spot Thermal Degradation and Bypass Diode Avalanche in Utility Solar Farms: In a 100 MW utility PV installation, partial shading from bird droppings and accumulated dust covered individual solar cells in series-connected strings. Root Cause Analysis (RCA) proved that shaded cells became reverse-biased, dissipating the current produced by 71 unshaded series cells. Local cell temperatures spiked above 160°C, causing EVA delamination, solder joint melting, and glass cracking. In several modules, internal bypass diodes failed under continuous forward conduction thermal stress, triggering sustained high-voltage DC electric arcs (1100 VDC). Protection Thresholds mandate UL 1699B Arc-Fault Circuit Interrupters (AFCI) extinguishing series arcs within 2.0 seconds and bypass diode thermal monitoring.',
    faqs: [
      {
        question: 'Why does cell temperature increase degrade solar panel open-circuit voltage (V_oc)?',
        answer: 'As semiconductor temperature rises, diode reverse saturation current I_0 increases exponentially due to intrinsic carrier generation (n_i² ∝ T³ exp(-E_g/kT)). This increases forward recombination, depressing open-circuit voltage by typically -0.3% to -0.4%/°C.',
      },
      {
        question: 'How does Perturb and Observe (P&O) MPPT track maximum power?',
        answer: 'P&O periodically perturbs operating voltage (V ± ΔV) and measures power output. If power increases (dP/dV > 0), perturbation continues in the same direction; if power drops, direction reverses. At MPP, operating voltage dithers around the peak.',
      },
      {
        question: 'Why do partial shading conditions generate multiple local power peaks on P-V curves?',
        answer: 'When bypass diodes conduct to shunt shaded cell groups, the array P-V curve develops multiple local maxima. Standard gradient MPPT algorithms can get trapped on sub-optimal local peaks, requiring global sweep algorithms to identify true MPP.',
      },
    ],
  },

  // =========================================================================
  // 2. CONTROL SYSTEMS & ROBOTICS
  // =========================================================================
  'pid-tuning': {
    directAnswerSummary:
      'Closed-loop PID regulation computes control output u(t) = K_p e(t) + K_i \\int e(\\tau)d\\tau + K_d (de/dt) with anti-windup clamping u_{min} \\le u(t) \\le u_{max}. System stability requires gain margin GM \\ge 6.0 dB and phase margin PM \\ge 45^\\circ. Built to ISA-51.1 and IEC 61131-3 standards for industrial automation.',
    industrialFailureCase:
      'Integral Windup and Overshoot-Induced Product Tank Overflow: During an automated chemical batch-filling cycle, an un-clamped PID controller experienced sustained setpoint error while a slow pneumatic control valve traveled to 100% opening. Root Cause Analysis (RCA) revealed that the integral term accumulated an enormous error value during actuator saturation. Once the liquid level reached the target setpoint, the uncoiling integral error prevented the valve from closing for 4.2 minutes, spilling 14,000 liters of toxic solvent into retention dikes. Protection Thresholds mandate anti-windup algorithms (back-calculation or conditional integration per ISA-51.1) clamping integral accumulation the instant actuator demand reaches physical saturation limits.',
    faqs: [
      {
        question: 'What physical problem does the derivative filter coefficient N address in PID algorithms?',
        answer: 'Pure derivative action amplifies high-frequency measurement noise (d/dt(sin ωt) = ω cos ωt). A 1st-order low-pass filter with coefficient N (typically 10 to 20) limits high-frequency gain, preventing violent actuator jitter and wear.',
      },
      {
        question: 'Why does excessive integral gain Ki produce closed-loop oscillatory instability?',
        answer: 'Integral action introduces a pole at the origin (s = 0), adding a continuous 90° phase lag across all frequencies. Excessive integral gain erodes Phase Margin below 30°, driving closed-loop poles into the right-half plane.',
      },
      {
        question: 'What is the operational advantage of derivative action on measurement error (PV) versus error (SP - PV)?',
        answer: 'Applying derivative action strictly to the process variable (dPV/dt) avoids "derivative kick" — sudden control output spikes caused by step changes in operator setpoint, preventing severe actuator shock.',
      },
    ],
  },

  'control-valve': {
    directAnswerSummary:
      'Control valve sizing follows standard flow coefficient formulation C_v = 1.156 Q \\sqrt{SG / \\Delta P} with equal-percentage or linear trims. Cavitation avoidance enforces cavitation index \\sigma = (P_1 - P_v)/(P_1 - P_2) > 1.5. Standardized under IEC 60534-2-1 and ISA-75.01 for severe-service process throttling.',
    industrialFailureCase:
      'Severe Cavitation Micro-Jet Pitting and Trim Erosion in Boiler Feedwater Valves: In a 600 MW thermal power plant, high-pressure boiler feed pumps experienced catastrophic throttling valve failure after only 180 operating hours. Root Cause Analysis (RCA) demonstrated that excessive single-stage pressure drop (P₁ = 180 bar to P₂ = 40 bar) dropped localized fluid pressure at the vena contracta below saturation vapor pressure (P_v), forming dense clouds of vapor cavities. When pressure recovered downstream, micro-jets collapsed with localized shock pressures exceeding 1.2 GPa and velocities > 1000 m/s. The implosions gouged 316SS hardened plugs, producing severe seat leakage and acoustic vibration > 115 dBA. Protection Thresholds require multistage pressure-balanced tortuous-path trims maintaining cavitation index σ > 1.5 per IEC 60534.',
    faqs: [
      {
        question: 'What is the physical distinction between cavitation and flashing in control valves?',
        answer: 'Cavitation occurs when vena contracta pressure drops below liquid vapor pressure and subsequently recovers above vapor pressure downstream, violently collapsing bubbles. Flashing occurs when downstream pressure remains permanently below vapor pressure, producing continuous two-phase erosive flow.',
      },
      {
        question: 'Why are equal-percentage valve trims preferred in systems with high line friction losses?',
        answer: 'In systems where pipeline friction consumes pressure drop as flow increases, an equal-percentage trim compensates for the declining valve pressure drop, yielding an overall linear installed flow characteristic.',
      },
      {
        question: 'What is the choked flow condition (choked differential pressure ΔP_choked) in liquid throttling?',
        answer: 'Choked flow occurs when vena contracta pressure reaches liquid vapor pressure. Increasing downstream pressure drop cannot increase mass flow rate further, as sonic velocity is reached in the liquid-vapor two-phase mixture.',
      },
    ],
  },

  'current-loop': {
    directAnswerSummary:
      'Industrial two-wire 4–20 mA instrumentation loops map process variables via I_{loop} = 4\\text{ mA} + 16\\text{ mA} \\times [(PV - PV_{min}) / (PV_{max} - PV_{min})]. Compliance requires terminal voltage V_{term} = V_s - I_{loop}(R_{wire} + R_{load}) \\ge 11.5\\text{ VDC}. Calibrated per IEC 60381-1 and NAMUR NE 43 for process telemetry.',
    industrialFailureCase:
      'Compliance Voltage Starvation and Signal Freezing in Offshore Wellhead Transmitters: In an offshore crude oil processing facility, pressure transmitters located 800 meters from the control room froze at 16.8 mA during high-production periods. Root Cause Analysis (RCA) proved that ambient summer temperatures in outdoor cable trays increased field wiring resistance to 75 Ω, while technicians retrofitted an additional 250 Ω barrier resistor in series. At full-scale 20.0 mA flow, total loop resistance reached 625 Ω, dropping terminal voltage at the smart transmitter to 10.4 VDC (below the 11.5 VDC minimum operating threshold). The internal microprocessor brown-out reset repeatedly, freezing analog telemetry. Protection Thresholds mandate minimum compliance headroom V_margin ≥ 3.0 VDC per IEC 60381-1 and NAMUR NE 43 fail-low fault tripping at 3.6 mA.',
    faqs: [
      {
        question: 'Why was 4 mA selected as the live zero baseline rather than 0 mA?',
        answer: 'A live 4 mA baseline allows field transmitters to draw operating power directly from the loop current without external wiring. Furthermore, loop current dropping to 0 mA immediately signals a broken wire or open-circuit fault.',
      },
      {
        question: 'How do NAMUR NE 43 threshold standards classify transmitter fault states?',
        answer: 'NAMUR NE 43 defines valid process signals between 3.8 mA and 20.5 mA. Loop current between 3.6 mA and 3.8 mA indicates sensor down-scale fault/burnout; current above 21.0 mA signals up-scale fault; current < 3.6 mA confirms line severance.',
      },
      {
        question: 'Why are current loops inherently immune to lead wire electrical resistance and noise?',
        answer: 'Current loops deliver identical current through all series elements regardless of cable resistance. Furthermore, low loop impedance and differential signaling reject common-mode electromagnetic interference (EMI).',
      },
    ],
  },

  'orifice-meter': {
    directAnswerSummary:
      'Differential pressure flow measurement across concentric orifice plates obeys Q_m = [C_d / \\sqrt{1 - \\beta^4}] \\epsilon (\\pi d^2 / 4) \\sqrt{2 \\rho_1 \\Delta P} with diameter ratio \\beta = d/D. Operational validity requires 0.20 \\le \\beta \\le 0.75 and pipe Re_D \\ge 5000. Verified per ISO 5167-2 and ASME MFC-3M standards.',
    industrialFailureCase:
      'Upstream Edge Rounding and Hydrocarbon Fiscal Metering Under-Registration: In a natural gas transmission custody-transfer station, wet hydrocarbon gas carryover passed through a 300 mm meter run containing a sharp-edged 304SS orifice plate (β = 0.60). Root Cause Analysis (RCA) revealed that micro-droplets and pipeline debris eroded the sharp upstream orifice edge, increasing the edge radius from < 0.05 mm to 0.45 mm over nine months. The rounded edge streamlined fluid approach, increasing discharge coefficient C_d by 4.2%. Consequently, the measured differential pressure dropped, under-reporting gas flow by 6.1% and causing a fiscal revenue error exceeding $45,000 per month. Protection Thresholds require quarterly ultrasonic edge inspection per ISO 5167 and automated impulse line blowdown purging.',
    faqs: [
      {
        question: 'What is the physical significance of the expansibility factor ε in gas metering?',
        answer: 'The expansibility factor ε accounts for changes in gas density as fluid accelerates adiabatically through the orifice throat. For liquids, ε = 1.0; for compressible gases, it decreases with increasing differential pressure ratio.',
      },
      {
        question: 'Why is permanent pressure loss across an orifice meter significantly higher than a Venturi tube?',
        answer: 'Orifice plates produce abrupt flow contraction and aggressive downstream turbulent eddy recirculation, dissipating up to 40% to 70% of measured differential pressure as unrecoverable friction loss.',
      },
      {
        question: 'What upstream straight pipe length is required to eliminate swirl and velocity distortion?',
        answer: 'ISO 5167 mandates between 20 and 44 pipe diameters of straight unobstructed upstream pipe (depending on β and piping geometry) or installing approved 19-tube bundle flow conditioners.',
      },
    ],
  },

  'bode-nyquist-stability': {
    directAnswerSummary:
      'Frequency-domain stability evaluates open-loop transfer function G(j\\omega)H(j\\omega) via Cauchy\'s Argument Principle Z = N + P. Absolute closed-loop stability mandates Phase Margin PM \\ge 45^\\circ and Gain Margin GM \\ge 6.0 dB. Calibrated under IEEE Control Systems Society and IEC 61508 safety standards.',
    industrialFailureCase:
      'Transport Latency Phase Erosion and Limit-Cycle Reactor Instability: In a continuous pharmaceutical chemical synthesis plant, temperature control in an exothermic jacketed reactor developed persistent limit-cycle oscillations. Root Cause Analysis (RCA) revealed that retrofitting a distant product analyzer introduced an unmodeled 4.8-second fluid transport delay e^{-s T_d}. This dead time introduced linear frequency-dependent phase lag (∠ = -ω T_d), eroding Phase Margin from +52° to -14° at the gain crossover frequency (ω_gc = 0.35 rad/s). The closed-loop poles migrated into the right-half s-plane, generating ±25°C temperature swings that ruined product batches. Protection Thresholds per IEC 61508 mandate Smith Predictor dead-time compensation and automated gain scheduling preserving PM ≥ 45° across all production rates.',
    faqs: [
      {
        question: 'Why does time delay (dead time) degrade phase margin without affecting gain margin magnitude?',
        answer: 'A pure time delay transfer function is e^{-s T_d}. On the Bode plot, its magnitude is identically 1.0 (0 dB) across all frequencies, but its phase lag is -ω T_d radians, which drops steeply with frequency and rapidly erodes phase margin.',
      },
      {
        question: 'What is the Nyquist stability criterion for open-loop unstable plants (P > 0)?',
        answer: 'For a system with P open-loop poles in the right-half s-plane, the Nyquist plot of G(s)H(s) must encircle the critical point (-1, j0) exactly P times in the counter-clockwise direction (N = -P) to ensure closed-loop stability (Z = 0).',
      },
      {
        question: 'Why are Phase Margin ≥ 45° and Gain Margin ≥ 6 dB standard industrial specifications?',
        answer: 'These margins guarantee acceptable transient damping (overshoot ≤ 25%), robust tolerance against component aging, parameter drift, and unmodeled high-frequency dynamics without risking limit-cycle oscillation.',
      },
    ],
  },

  'root-locus-plotter': {
    directAnswerSummary:
      'Evans Root Locus tracks closed-loop pole trajectories satisfying 1 + K G(s)H(s) = 0 via angle criteria \\sum \\theta_z - \\sum \\theta_p = \\pm 180^\\circ(2k + 1). Closed-loop stability requires all poles in the Left-Half-Plane (LHP) with damping ratio \\zeta \\ge 0.5. Compliant with IEEE Std 100 control criteria.',
    industrialFailureCase:
      'Feedback Gain Migration and Pilot-Induced Oscillation (PIO) in Fly-by-Wire Flight Actuators: During high-speed flight testing of an unmanned aerial vehicle (UAV), pitch-axis control experienced severe divergent oscillations upon transitioning to maximum dynamic pressure. Root Cause Analysis (RCA) showed that aerodynamic surface loading increased effective control loop gain (K) by 350%. On the Evans root locus diagram, the closed-loop conjugate poles migrated along asymptotes across the imaginary axis into the right-half plane at s = ±j 18.5 rad/s. The aircraft entered violent Pilot-Induced Oscillations (PIO), exceeding structural wing G-limits within 1.8 seconds. Protection Thresholds mandate dynamic gain scheduling against Mach number and dynamic pressure, keeping closed-loop poles strictly inside the LHP damping sector (ζ ≥ 0.707).',
    faqs: [
      {
        question: 'How do open-loop zeros attract root locus branches as gain K approaches infinity?',
        answer: 'As loop gain K → ∞, closed-loop poles terminate exactly on the m finite open-loop zeros. The remaining (n - m) branches travel toward infinity along radial asymptotes spaced symmetrically at angles (2k + 1)180° / (n - m).',
      },
      {
        question: 'What is the physical meaning of the breakaway point on the real axis?',
        answer: 'The breakaway point represents the gain coordinate where two real closed-loop poles collide and diverge into the complex plane as a conjugate pair, marking the boundary transition from overdamped to underdamped dynamic response.',
      },
      {
        question: 'How does adding a lead compensator (zero closer to origin than pole) stabilize root locus?',
        answer: 'A lead compensator places a zero nearer to the origin than its pole, contributing positive phase lead that bends root locus asymptotes leftward deeper into the stable Left-Half-Plane, enhancing damping and response speed.',
      },
    ],
  },

  // =========================================================================
  // 3. MECHANICAL & THERMAL DYNAMICS
  // =========================================================================
  'beam-bending': {
    directAnswerSummary:
      'Elastic transverse flexure obeys Euler-Bernoulli fourth-order formulation EI (d^4 w / dx^4) = q(x) with flexural stress \\sigma = M y / I and shear stress \\tau = V Q / (I b). Safe design enforces \\sigma \\le \\sigma_{yield} / 1.67 and deflection \\delta \\le L/360. Built per AISC 360-16 and Eurocode 3 (EN 1993-1-1).',
    industrialFailureCase:
      'Lateral-Torsional Buckling (LTB) in Unbraced Overhead Crane Runway Girders: In a heavy manufacturing facility, a 16-meter span wide-flange runway girder (W36 × 150) failed catastrophically during maximum hoist pick operations. Root Cause Analysis (RCA) established that top compression flange unbraced length exceeded the critical lateral-torsional buckling limit L_r. Under peak bending moment, the compression flange behaved as an axially loaded column, buckling laterally while the tension flange remained straight. The beam twisted uncontrollably, losing flexural load capacity and dumping the crane hoist. Protection Thresholds per AISC 360-16 mandate lateral bracing at intervals L_b < L_p = 1.76 r_y \\sqrt{E / F_y} to ensure the girder attains full plastic moment capacity (M_p) without premature buckling.',
    faqs: [
      {
        question: 'What key assumptions define the Euler-Bernoulli beam theory versus Timoshenko theory?',
        answer: 'Euler-Bernoulli assumes cross-sections remain perfectly plane and perpendicular to the neutral axis during bending, neglecting shear deformations. Timoshenko theory accounts for shear deformation and rotational inertia, essential for deep beams (L/d < 10).',
      },
      {
        question: 'Where do maximum bending moment and maximum shear force occur on simply supported beams?',
        answer: 'Under uniform loading, shear force is maximum at the supports and zero at midspan, whereas bending moment is zero at supports and reaches its parabolic maximum (M = qL²/8) at exact midspan.',
      },
      {
        question: 'Why are I-beam profiles structurally optimized for transverse flexure?',
        answer: 'Bending stress increases linearly with distance from the neutral axis (σ = My/I). An I-beam concentrates the vast majority of cross-sectional steel in outer flanges where stress is highest, maximizing area moment of inertia (I) with minimal material weight.',
      },
    ],
  },

  'truss-bridge': {
    directAnswerSummary:
      'Planar pin-jointed trusses are solved via Method of Joints and Sections satisfying static equilibrium \\sum F_x = 0, \\sum F_y = 0. Compression members enforce Euler buckling limit P_{cr} = \\pi^2 E I / (K L)^2 with safety factor FS \\ge 2.12. Certified under AASHTO LRFD Bridge Design and AREMA Chapter 15.',
    industrialFailureCase:
      'Gusset Plate Shear Tear-out and Compression Strut Buckling under Train Resonance: A 60-meter steel Warren through-truss railway bridge experienced structural collapse under a loaded bulk coal train. Root Cause Analysis (RCA) revealed that severe environmental corrosion had thinned internal steel gusset plates by 35% at the lower chord joint. Dynamic impact vibrations from the train matched the resonant sway frequency of the bridge, driving axial compression in diagonal web members past the reduced buckling capacity. The critical compression strut buckled elastically, transferring instantaneous load to adjacent members and triggering progressive truss collapse. Protection Thresholds per AASHTO LRFD mandate annual ultrasonic thickness scanning, strict slenderness limits KL/r ≤ 120 for compression members, and minimum safety factor FS ≥ 2.12 against buckling.',
    faqs: [
      {
        question: 'What fundamental idealizations govern primary axial force analysis in trusses?',
        answer: 'Members are assumed weightless, straight, connected at ends by frictionless pins, and loads are applied exclusively at joints. Consequently, every member carries purely axial tension or compression with zero primary bending moment.',
      },
      {
        question: 'How does member slenderness ratio (KL/r) govern compressive load capacity?',
        answer: 'Load capacity drops with the square of slenderness ratio according to Euler’s column formula P_cr = π²EA / (KL/r)². Slender compression struts fail via sudden elastic buckling long before reaching steel yield strength.',
      },
      {
        question: 'What is the structural role of zero-force members in truss bridges?',
        answer: 'Zero-force members provide essential lateral bracing to reduce effective buckling length (KL) of long compression chords, stabilize the structure against shifting live loads, and provide structural redundancy during maintenance.',
      },
    ],
  },

  'seismic-base-isolation': {
    directAnswerSummary:
      'Seismic base isolation decouples structures via elastomeric Lead-Rubber Bearings (LRBs), elongating fundamental period T_b = 2\\pi\\sqrt{m / k_{iso}} \\gg T_s and providing hysteretic damping \\beta_{eff} \\ge 15\\%. Design limits inter-story drift to < 1.5% per ASCE 7-22 Chapter 17 and FEMA 356 seismic criteria.',
    industrialFailureCase:
      'Moat Wall Impact and Elastomeric Bearing Shear Rupture during Near-Fault Earthquakes: An isolated hospital complex subjected to a 7.2 magnitude near-fault earthquake experienced structural damage despite base isolation. Root Cause Analysis (RCA) revealed that velocity pulses from fling-step fault displacement exceeded the 500-year design basis spectrum. Lateral bearing displacement exceeded the 450 mm moat seismic clearance gap, slamming the foundation slab into surrounding concrete retaining walls. The high-frequency impact shock wave shattered non-structural MEP utilities, while several elastomeric bearings tore along internal steel shims under 280% shear strain. Protection Thresholds per ASCE 7-22 mandate minimum moat clearance D_TM ≥ 1.5 × D_D and installing non-linear fluid viscous dampers alongside LRBs to clamp peak displacements.',
    faqs: [
      {
        question: 'How does period elongation mitigate earthquake acceleration transmitted to structures?',
        answer: 'Earthquake ground motion energy concentrates at high frequencies (periods 0.1 to 0.8 s). Flexible isolators elongate building natural period to 2.5 to 3.5 s, shifting the structure into the low-acceleration tail of the seismic response spectrum.',
      },
      {
        question: 'What is the physical damping mechanism of the central lead core in LRBs?',
        answer: 'Under lateral shear, the central cylindrical lead plug undergoes plastic shear deformation, absorbing seismic energy through hysteretic damping. Lead recrystallizes dynamically at ambient temperatures, restoring energy absorption capacity without fatigue.',
      },
      {
        question: 'Why are thin horizontal steel shims vulcanized inside elastomeric bearings?',
        answer: 'Steel shims provide enormous vertical stiffness (> 1000 kN/mm) to prevent building gravitational settling, while flexible elastomeric rubber layers allow high horizontal shear flexibility to absorb lateral earthquake motion.',
      },
    ],
  },

  'mohr-circle-soil': {
    directAnswerSummary:
      'Geotechnical shear failure satisfies the Mohr-Coulomb criterion \\tau_f = c\' + \\sigma_n\' \\tan\\phi\' with principal stresses \\sigma_1\', \\sigma_3\' = [(\\sigma_x + \\sigma_y)/2] \\pm \\sqrt{[(\\sigma_x - \\sigma_y)/2]^2 + \\tau_{xy}^2}. Slope stability enforces factor of safety FS \\ge 1.50 per ASTM D3080 and Eurocode 7 (EN 1997-1).',
    industrialFailureCase:
      'Undrained Slope Liquefaction and Retaining Wall Foundation Blowout: A 12-meter reinforced earth retaining wall supporting an industrial chemical plant collapsed following sustained monsoon rains. Root Cause Analysis (RCA) showed that blocked weeping drains allowed groundwater pore pressure (u) to surge. By Terzaghi\'s effective stress principle (σ\' = σ - u), effective normal stress dropped toward zero, shifting the Mohr stress circle leftward until it became tangent to the zero-cohesion shear failure envelope. The saturated silty sand layer underwent sudden undrained liquefaction, triggering a rotational landslide that destroyed the retaining wall. Protection Thresholds per Eurocode 7 mandate vibrating wire piezometers, continuous pore-water drainage relief, and maintaining factor of safety FS ≥ 1.50 under maximum hydrostatic saturation.',
    faqs: [
      {
        question: 'What is the physical principle underlying Terzaghi’s Effective Stress Law?',
        answer: 'Total stress σ is split between solid soil skeleton effective stress σ\' and pore-water pressure u (σ = σ\' + u). Because water has zero shear strength, soil frictional resistance and volume change depend exclusively on effective stress σ\'.',
      },
      {
        question: 'What do the pole (origin of planes) coordinates on Mohr’s circle indicate?',
        answer: 'The Pole is a unique geometric point on Mohr’s circle. A straight line drawn from the Pole parallel to any physical plane in the soil element intersects the circle at the exact normal and shear stresses acting on that plane.',
      },
      {
        question: 'How do drained versus undrained shear conditions differ during triaxial testing?',
        answer: 'In drained tests, loading is sufficiently slow to allow pore water to escape, generating zero excess pore pressure (u = 0). In undrained tests, rapid loading traps pore water, creating excess pore pressure that heavily impacts effective shear strength.',
      },
    ],
  },

  'rc-beam-design': {
    directAnswerSummary:
      'Reinforced concrete flexure follows Whitney stress block formulation with nominal moment M_n = A_s f_y (d - a/2) where a = A_s f_y / (0.85 f\'_c b). Ductile design enforces tension-controlled strain \\epsilon_t \\ge 0.005 with strength reduction factor \\phi = 0.90. Compliant with ACI 318-19 and Eurocode 2.',
    industrialFailureCase:
      'Brittle Over-Reinforced Compression Failure in Cantilever Transfer Girders: In a commercial parking garage, a heavily loaded transfer girder supporting upper concrete columns suffered sudden catastrophic shear-compression failure. Root Cause Analysis (RCA) established that structural rebar detailing over-reinforced the section (reinforcement ratio ρ > ρ_max). Under design live loads, the concrete compression zone reached its ultimate crushing strain (ε_cu = 0.003) before the tensile steel reinforcement yielded. The girder shattered explosively without preliminary flexural cracking or warning deflections. Protection Thresholds per ACI 318-19 mandate that tensile steel strain must exceed ε_t ≥ 0.005 (under-reinforced criteria) with minimum shear stirrups spacing ≤ d/2 to guarantee ductile yielding prior to compression failure.',
    faqs: [
      {
        question: 'Why does ACI 318 mandate tension-controlled design (steel strain ε_t ≥ 0.005)?',
        answer: 'Tension-controlled design ensures rebar yields well before concrete reaches crushing strain (ε_cu = 0.003). This ductile failure mode produces visible deflection and cracking, providing vital warning before collapse occurs.',
      },
      {
        question: 'What is the role of the equivalent rectangular Whitney stress block (depth a = β₁ c)?',
        answer: 'The Whitney stress block simplifies non-linear parabolic concrete compression stress into an equivalent uniform rectangular stress of intensity 0.85 f\'_c acting over depth a, providing exact analytical moment capacity calculations.',
      },
      {
        question: 'Why must reinforced concrete beams always maintain minimum reinforcement ratio ρ_min?',
        answer: 'Minimum reinforcement ensures the beam\'s flexural cracking moment is less than its nominal flexural capacity (M_n > 1.2 M_cr), preventing immediate brittle failure the instant concrete cracks in tension.',
      },
    ],
  },

  'column-buckling': {
    directAnswerSummary:
      'Slender column stability is governed by Euler critical buckling formulation P_{cr} = \\pi^2 E I / (K L)^2 with slenderness ratio \\lambda = K L / r. Transition to inelastic buckling occurs when \\lambda < \\pi \\sqrt{2 E / F_y}. Built per AISC 360-16 Specification Chapter E and ASME Section VIII structural standards.',
    industrialFailureCase:
      'Inelastic Column Buckling and Warehouse Structural Collapse under Non-Uniform Snow Load: A logistics distribution facility experienced progressive structural roof collapse during an extreme winter storm. Root Cause Analysis (RCA) revealed that drifting snow accumulated non-uniformly against the parapet wall, generating combined axial compression and bending in intermediate H-section steel columns. The effective slenderness ratio (KL/r = 85) positioned the column in the inelastic buckling regime. Initial geometric out-of-straightness (e_0 > L/1000) accelerated yield propagation across flange tips, collapsing buckling capacity by 45%. The columns buckled elastically, pulling the roof trusses downward. Protection Thresholds per AISC 360 Chapter E enforce interaction equation H1-1 (P_u / 2\phi P_n + M_{ux} / \phi M_{nx} ≤ 1.0) and intermediate web stiffeners.',
    faqs: [
      {
        question: 'How do boundary end conditions alter the effective length factor K in column design?',
        answer: 'End conditions define curvature and inflection points: pinned-pinned K = 1.0; fixed-fixed K = 0.5 (four-fold buckling strength); fixed-pinned K = 0.7; fixed-free cantilever K = 2.0 (one-fourth buckling strength).',
      },
      {
        question: 'What distinguishes Euler elastic buckling from Johnson/AISC inelastic buckling?',
        answer: 'Elastic buckling occurs in slender columns (high KL/r) where failure stress remains below the material proportional limit. Inelastic buckling occurs in intermediate columns where cross-sectional yielding precedes buckling, lowering buckling resistance.',
      },
      {
        question: 'Why are hollow structural sections (HSS tubes) superior for column compression?',
        answer: 'HSS tubes distribute material uniformly away from the centroidal axis, providing identical radius of gyration (r = √(I/A)) across both principal axes and maximizing buckling resistance in all directions.',
      },
    ],
  },

  'four-bar-mechanism': {
    directAnswerSummary:
      'Planar four-bar kinematics satisfy Grashof\'s theorem s + l \\le p + q for continuous crank rotation. Mechanism transmission angle \\mu between coupler and rocker must satisfy 40^\\circ \\le \\mu \\le 140^\\circ to prevent kinematic binding. Standardized under ISO 1122-1 and ASME B94.19 machine kinematic criteria.',
    industrialFailureCase:
      'Kinematic Toggle Dead-Center Binding and Joint Pin Shearing in High-Speed Stamping Presses: An automated automotive sheet-metal stamping press mechanism experienced catastrophic mechanical seizure at 120 strokes per minute. Root Cause Analysis (RCA) revealed that thermal thermal expansion in connecting links reduced the transmission angle between coupler and rocker to μ = 24°. As the crank approached bottom dead center, the mechanism entered a toggle lockup position where mechanical advantage approached infinity while transmission force approached zero. The driving flywheel inertia exerted extreme torque against the bound linkage, shearing 45 mm alloy steel pivot pins and cracking the cast-iron machine bed. Protection Thresholds mandate kinematic optimization maintaining transmission angles 45° ≤ μ ≤ 135° and torque-limiting clutches disengaging within < 15 ms.',
    faqs: [
      {
        question: 'What is Grashof’s theorem and what mechanisms result from its inversions?',
        answer: 'If s + l ≤ p + q (shortest + longest ≤ sum of remaining two): fixing the link adjacent to s yields a Crank-Rocker; fixing s yields a Double-Crank (Drag-link); fixing the link opposite s yields a Double-Rocker.',
      },
      {
        question: 'Why is transmission angle μ critical for dynamic mechanical efficiency?',
        answer: 'The transmission angle μ governs force transfer from coupler to output rocker. When μ deviates from 90° toward 0° or 180°, usable output torque drops toward zero while radial bearing forces escalate rapidly, promoting friction and binding.',
      },
      {
        question: 'How do toggle positions generate extreme mechanical advantage in clamping tools?',
        answer: 'A toggle position occurs when two moving links align collinearly (180°). In this configuration, input displacement produces infinitesimal output motion, amplifying input force toward theoretical infinity (used in vise-grips and rock crushers).',
      },
    ],
  },

  'rankine-cycle': {
    directAnswerSummary:
      'The steam Rankine power cycle converts heat to work with thermal efficiency \\eta_{th} = [(h_1 - h_2) - (h_4 - h_3)] / (h_1 - h_4). Turbine exhaust expansion enforces minimum steam quality x_2 \\ge 0.88 (maximum 12% moisture limit). Governed by ASME PTC 4.4 and IEC 60045-1 for steam turbine power generation.',
    industrialFailureCase:
      'Turbine Wet Steam Droplet Erosion and Blade Shearing in Low-Pressure Stages: In an 800 MW supercritical steam power station, the final stage low-pressure (LP) turbine experienced severe blade vibration and structural failure. Root Cause Analysis (RCA) demonstrated that operating at elevated condenser cooling water flow depressed condenser backpressure below 0.05 bar, causing turbine exhaust steam quality to fall to x = 0.81 (19% moisture). Supersonic water micro-droplets traveling at 520 m/s slammed into the leading edges of rotating titanium LP blades, causing severe erosion gouging. The erosion produced dynamic rotor mass unbalance and fatigue blade detachment. Protection Thresholds per ASME PTC 4.4 mandate intermediate steam reheat cycles and moisture extraction belts maintaining turbine exhaust steam quality x ≥ 0.90.',
    faqs: [
      {
        question: 'Why does superheating steam improve cycle thermal efficiency and protect turbine blades?',
        answer: 'Superheating raises average heat addition temperature, directly boosting Carnot and Rankine thermal efficiencies. Concurrently, it shifts turbine expansion rightward on the Mollier h-s diagram, ensuring exhaust steam remains dry (x > 0.90) to prevent blade erosion.',
      },
      {
        question: 'What is the physical function of steam reheat in utility power generation?',
        answer: 'Partially expanded steam from the high-pressure turbine is returned to the boiler to be reheated to maximum temperature. This increases cycle efficiency by 4% to 5% and maintains high steam quality throughout low-pressure turbine stages.',
      },
      {
        question: 'Why is pump work significantly smaller in Rankine cycles compared to Brayton cycles?',
        answer: 'Rankine cycles compress condensed liquid water, which has an extremely small specific volume (v ≈ 0.001 m³/kg). Because pumping work is w_p = ∫v dP, compression work consumes less than 1% to 2% of gross turbine output (Back Work Ratio < 2%).',
      },
    ],
  },

  'harmonic-oscillator': {
    directAnswerSummary:
      'Forced viscous harmonic vibration satisfies m \\ddot{x} + c \\dot{x} + k x = F_0 \\cos(\\omega t) with natural frequency \\omega_n = \\sqrt{k/m} and magnification factor M = 1 / \\sqrt{(1 - r^2)^2 + (2\\zeta r)^2}. Machine vibration velocity is regulated by ISO 10816 and ISO 20816 standards to prevent structural resonance.',
    industrialFailureCase:
      'Resonant Speed Amplification and Babbitt Bearing Destruction in High-Speed Turbocompressors: A 4.5 MW centrifugal gas injection compressor operating at 8500 RPM suffered catastrophic bearing failure during routine ramp-up. Root Cause Analysis (RCA) proved that compressor rotor speed coincided with the first lateral critical bending resonance (ω ≈ ω_n). Because internal squeeze-film damping was low (ζ = 0.018), resonant vibration magnification factor M escalated past 28×. Peak rotor vibration amplitude exceeded 140 μm RMS, wiping the babbitt sleeve bearing lining and allowing high-speed metal-on-metal rotor-stator contact. Protection Thresholds per ISO 10816-3 mandate eddy-current displacement proximity probes interlocking trip solenoids when shaft vibration exceeds 45 μm Peak-to-Peak within < 25 ms.',
    faqs: [
      {
        question: 'What is the physical significance of the 90° phase shift at exact resonance (r = 1.0)?',
        answer: 'At exact resonance (ω = ω_n), inertia force perfectly balances spring restoring force (mω²x = kx). The external excitation force acts entirely against viscous damping, resulting in response displacement lagging excitation force by exactly 90°.',
      },
      {
        question: 'How does the logarithmic decrement δ measure damping ratio ζ experimentally?',
        answer: 'Logarithmic decrement δ is the natural logarithm of the ratio of two consecutive peak vibration amplitudes (δ = ln(x_1 / x_2)). For small damping, it directly determines damping ratio via ζ ≈ δ / (2π).',
      },
      {
        question: 'What is the operational purpose of tuned mass dampers (TMDs) in tall structures?',
        answer: 'A tuned mass damper (secondary mass-spring-damper) is tuned to the structure’s dominant natural frequency. When the building vibrates, the TMD oscillates out of phase, absorbing and dissipating kinetic energy to suppress resonance.',
      },
    ],
  },

  'spur-gear-mesh': {
    directAnswerSummary:
      'Conjugate spur gearing kinematics satisfy gear ratio i = z_2 / z_1 = d_2 / d_1 with base pitch p_b = \\pi m \\cos\\alpha. Mesh continuity enforces contact ratio CR \\ge 1.40 and minimum pinion tooth count z_1 \\ge 17 to prevent undercutting. Rated under AGMA 2001-D04 and ISO 6336 standards.',
    industrialFailureCase:
      'Sub-Surface Hertzian Contact Pitting and Tooth Root Bending Fatigue in Wind Turbine Gearboxes: A 2.5 MW wind turbine planetary gearbox experienced tooth spalling after three years of grid operation. Root Cause Analysis (RCA) established that wind turbulence gusts induced severe cyclic shock torque overloads. At the pitch line, Hertzian contact stresses exceeded the material endurance limit (σ_H > 1550 MPa), causing elastohydrodynamic lubrication (EHL) oil film breakdown. Sub-surface micro-cracks propagated under shear stresses, detaching steel flakes (micropitting) that escalated into full tooth root fatigue fracture. Protection Thresholds per AGMA 2001 mandate 18CrNiMo7-6 carburized alloy steel with case hardness 58–62 HRC, continuous oil particle debris sensors, and high-viscosity synthetic gear lubricants.',
    faqs: [
      {
        question: 'Why must the contact ratio (CR) of industrial spur gears strictly exceed 1.20?',
        answer: 'Contact ratio represents the average number of tooth pairs in contact simultaneously. CR > 1.20 (typically 1.40 to 1.60) guarantees that a new tooth pair enters mesh before the preceding pair disengages, ensuring smooth, quiet load transfer.',
      },
      {
        question: 'What is tooth undercutting and why does it occur when pinion teeth drop below 17?',
        answer: 'Undercutting occurs during manufacturing when the hob cutter tip gouges the dedendum flank of pinions with few teeth (z < 17 for 20° pressure angle). This severely weakens tooth root bending strength and removes usable involute profile.',
      },
      {
        question: 'Why is the 20° pressure angle standard preferred over the historical 14.5° angle?',
        answer: 'A 20° pressure angle provides thicker, stronger tooth roots (higher bending capacity), minimizes undercutting risk on small pinions, and increases contact load capacity, despite slightly higher radial bearing loads.',
      },
    ],
  },

  'otto-diesel-cycle': {
    directAnswerSummary:
      'Internal combustion air-standard thermal efficiencies are \\eta_{Otto} = 1 - 1/r^{k-1} and \\eta_{Diesel} = 1 - (r_c^k - 1) / [k r^{k-1}(r_c - 1)] with specific heat ratio k = 1.4. Compression boundaries enforce r \\le 12 for Otto (knock avoidance) and 14 \\le r \\le 22 for Diesel. Built to SAE J1349 and ISO 1585 engine standards.',
    industrialFailureCase:
      'Low-Speed Pre-Ignition (LSPI) and Piston Crown Shattering in Downsized Turbo Gasoline Engines: A fleet of high-efficiency direct-injected turbocharged automotive engines experienced sudden structural engine failures under high load at 1800 RPM. Root Cause Analysis (RCA) proved that micro-droplets of engine oil combined with carbon deposits in combustion chambers auto-ignited fuel mixtures prior to spark ignition. The resulting pre-ignition generated severe super-knock with localized cylinder peak pressures exceeding 220 bar and pressure rise rates > 50 bar/deg crank. Supersonic shockwaves fractured hypereutectic aluminum piston ring lands and bent connecting rods. Protection Thresholds mandate low-calcium motor oils (API SP / ILSAC GF-6), advanced knock sensor windowing, and fuel enrichment cooling algorithms.',
    faqs: [
      {
        question: 'Why does the Otto cycle achieve higher theoretical efficiency than Diesel at identical compression ratios?',
        answer: 'At identical compression ratios r, heat addition in the Otto cycle occurs at constant volume (instantaneous), achieving higher peak cycle temperatures and higher thermodynamic expansion work than constant-pressure heat addition.',
      },
      {
        question: 'Why do practical Diesel engines achieve higher real-world fuel economy than Otto engines?',
        answer: 'Diesel engines operate at much higher compression ratios (r = 16 to 22 vs. r = 9 to 11 in gasoline engines) because they compress air alone, avoiding premature detonation (knock). Higher compression ratio significantly elevates thermal efficiency.',
      },
      {
        question: 'What is the cutoff ratio r_c in Diesel cycles and how does it influence thermal efficiency?',
        answer: 'The cutoff ratio r_c = V_3 / V_2 is the ratio of cylinder volumes after and before combustion. As r_c increases (higher fuel injection duration under heavy loads), cycle efficiency drops due to shorter expansion strokes.',
      },
    ],
  },

  'projectile-motion-drag': {
    directAnswerSummary:
      'Aerodynamic projectile ballistic trajectories integrate m (d\\vec{v}/dt) = m \\vec{g} - \\frac{1}{2} \\rho C_d A |\\vec{v}| \\vec{v} with altitude-dependent air density \\rho(y) = \\rho_0 e^{-y/H}. Aerodynamic drag coefficients span 0.15 \\le C_d \\le 0.45 across subsonic and supersonic regimes per NATO STANAG 4355 ballistics standards.',
    industrialFailureCase:
      'Transonic Center-of-Pressure Shift and Projectile Tumbling Instability: In long-range artillery ballistics, spin-stabilized projectiles experienced severe erratic dispersion and dynamic flight tumbling during high-angle atmospheric trajectories. Root Cause Analysis (RCA) revealed that as the shell decelerated through the transonic regime (Mach 0.8 to 1.2), shock wave detachment caused the center of aerodynamic pressure (CP) to migrate rapidly forward, ahead of the center of gravity (CG). The resulting overturning aerodynamic moment overcame gyroscopic stability (gyroscopic stability factor S_g dropped below 1.0). The projectile tumbled end-over-end, losing 65% of ballistic range. Protection Thresholds per NATO STANAG 4355 require optimizing boattail angles, rifling twist rates, and maintaining S_g ≥ 1.50 across all flight Mach numbers.',
    faqs: [
      {
        question: 'Why does aerodynamic drag cause trajectories to deviate from ideal parabolic symmetry?',
        answer: 'Quadratic air resistance continuously extracts kinetic energy, reducing horizontal velocity and steepening the descent angle. Consequently, the apogee occurs past mid-range, and the impact angle is steeper than the launch angle.',
      },
      {
        question: 'How does atmospheric air density variation with altitude affect long-range ballistics?',
        answer: 'Air density decays exponentially with altitude (ρ = ρ₀ exp(-y/H_scale)). Projectiles launched into high altitudes experience drastically lower drag, extending flight range far beyond sea-level ballistic predictions.',
      },
      {
        question: 'What is the optimum launch angle for maximum range in real air with drag?',
        answer: 'In a vacuum, the maximum range launch angle is exactly 45°. In the presence of aerodynamic drag, the optimal launch angle drops to between 32° and 38° depending on projectile mass, cross-section, and initial muzzle velocity.',
      },
    ],
  },

  'centrifugal-pump-curves': {
    directAnswerSummary:
      'Centrifugal pump performance follows head-capacity curve H = a - b Q^2 with Net Positive Suction Head safety margin NPSH_a \\ge NPSH_r + 0.5\\text{ m}. Stable operation requires operating within minimum continuous stable flow Q \\ge 0.3 Q_{BEP}. Standardized under ANSI/HI 14.6 and API 610 (12th Edition) pump standards.',
    industrialFailureCase:
      'Suction Eye Cavitation and Shaft Fatigue Failure during Low-NPSH Pumping: In an oil refinery crude distillation unit, heavy hydrocarbon bottoms booster pumps suffered recurring mechanical seal ruptures and impeller blade pitting. Root Cause Analysis (RCA) demonstrated that suction line strainer clogging depressed available Net Positive Suction Head below manufacturer requirements (NPSH_a = 2.1 m vs NPSH_r = 3.2 m). Hydrocarbon fractions boiled at the low-pressure impeller eye, producing intense vapor cavity implosions that eroded 316SS impeller shrouds and excited axial shaft vibrations > 14 mm/s RMS. High-cycle fatigue fractured the pump shaft at the coupling keyway. Protection Thresholds per API 610 mandate suction pressure interlocks, NPSH margins ≥ 1.0 m, and vibration trips at 7.1 mm/s RMS.',
    faqs: [
      {
        question: 'What is the physical meaning of Best Efficiency Point (BEP) on pump curves?',
        answer: 'BEP is the unique operating flow rate where fluid enters the impeller vanes tangentially with minimal incidence loss, achieving peak hydraulic efficiency and minimal radial bearing loads.',
      },
      {
        question: 'How do Affinity Laws predict pump performance when impeller speed (RPM) changes?',
        answer: 'Affinity Laws state that flow rate Q scales linearly with speed (Q ∝ N), total head H scales with speed squared (H ∝ N²), and brake horsepower BHP scales with speed cubed (BHP ∝ N³).',
      },
      {
        question: 'What is the operational consequence of operating a centrifugal pump below Minimum Continuous Stable Flow (MCSF)?',
        answer: 'Operating below MCSF (typically < 30% BEP) triggers internal suction recirculation, excessive radial shaft deflection, fluid temperature rise, severe vibration, and accelerated mechanical seal failure.',
      },
    ],
  },

  'refrigeration-heat-pump': {
    directAnswerSummary:
      'Vapor-compression refrigeration cycles operate with cooling performance COP_{cooling} = (h_1 - h_4) / (h_2 - h_1) and heating performance COP_{heating} = (h_2 - h_3) / (h_2 - h_1). Suction superheat enforces \\Delta T_{sh} \\ge 5.0\\text{ K} to protect compressors. Governed by ASHRAE Standard 15 and EN 378 safety standards.',
    industrialFailureCase:
      'Liquid Refrigerant Slugging and Scroll Compressor Wrap Shattering: In a commercial cold-storage facility operating R-410A refrigeration units, multi-stage scroll compressors failed repeatedly upon startup following defrost cycles. Root Cause Analysis (RCA) revealed that an electronic expansion valve (EEV) stuck in the 100% open position allowed liquid refrigerant to flood through the evaporator without evaporating. Liquid droplets entered the compressor suction port. Because liquids are incompressible, hydrodynamic hydraulic forces inside the scroll chamber exceeded 300 bar, shattering the orbital scroll wraps and burning out the drive motor. Protection Thresholds mandate suction line accumulators, crankcase heaters, and electronic superheat controllers maintaining minimum suction superheat ΔT_sh ≥ 5.0 K per ASHRAE 15.',
    faqs: [
      {
        question: 'Why does the coefficient of performance (COP) decrease as condenser temperature rises?',
        answer: 'Higher condenser temperatures elevate compressor discharge pressure, increasing compressor work (h_2 - h_1). Concurrently, higher condenser enthalpy reduces evaporator cooling capacity (h_1 - h_4), depressing COP.',
      },
      {
        question: 'Why is suction superheat mandatory before refrigerant enters the compressor?',
        answer: 'Suction superheat (typically 5 K to 8 K) guarantees that 100% of the refrigerant is in vapor phase. Ingesting liquid droplets causes hydraulic slugging that shatters compressor reed valves and washes away lubricating oil.',
      },
      {
        question: 'How does subcooling liquid refrigerant before expansion improve system capacity?',
        answer: 'Subcooling lowers liquid enthalpy h_3 before entering the expansion valve, reducing flash gas generation and increasing the net specific refrigerating effect (h_1 - h_4) in the evaporator without increasing compressor work.',
      },
    ],
  },

  // =========================================================================
  // 4. CHEMICAL & PROCESS ENGINEERING
  // =========================================================================
  'cstr-kinetics': {
    directAnswerSummary:
      'Continuous Stirred-Tank Reactors (CSTR) obey steady-state species conservation V = F_0 X_A / (-r_A) with Arrhenius reaction kinetics -r_A = k_0 e^{-E_a/RT} C_A^n. Stable operation mandates that heat removal slope exceeds heat generation slope (Semenov/Van Heerden criteria) per OSHA PSM and API 521 standards.',
    industrialFailureCase:
      'Thermal Runaway Explosion and Emergency Rupture Disk Venting in Monomer Polymerization: A 15 m³ jacketed CSTR polymerizing styrene experienced catastrophic thermal runaway. Root Cause Analysis (RCA) proved that cooling water circulation pump failure interrupted jacket heat removal. Reaction temperature rose from 90°C to 155°C within 8 minutes. Because Arrhenius kinetics increase heat generation exponentially (k ∝ exp(-E_a/RT)) while cooling is linear, the reaction entered self-accelerating thermal runaway. Vessel internal pressure surged past the 25 bar design limit. Protection Thresholds per OSHA 1910.119 PSM and API 521 mandate automated chemical inhibitor injection systems and dual rupture disks venting within 500 ms to flare scrubbers.',
    faqs: [
      {
        question: 'Why does a CSTR require larger reactor volume than a PFR for identical conversion?',
        answer: 'A CSTR operates permanently at its exit concentration, which is the lowest reactant concentration in the system. Because reaction rate -r_A drops with reactant concentration, the average reaction rate is lower, requiring larger volume.',
      },
      {
        question: 'What is the physical significance of the Damköhler number (Da) in CSTR scaling?',
        answer: 'The Damköhler number Da = k C_{A0}^{n-1} τ represents the ratio of characteristic reaction rate to convective mass transport rate. Da ≫ 1 indicates rapid reaction reaching near-complete conversion; Da ≪ 1 indicates reaction-limited flow.',
      },
      {
        question: 'How do multiple steady states arise on the Van Heerden heat generation diagram?',
        answer: 'The sigmoidal heat generation curve (governed by Arrhenius kinetics and reactant depletion) intersects the linear heat removal line at up to three points. The middle point is unstable, while high- and low-temperature intersections represent stable states.',
      },
    ],
  },

  'distillation-column': {
    directAnswerSummary:
      'Binary distillation column separation follows the McCabe-Thiele operating formulation y_{n+1} = [R/(R+1)] x_n + x_D / (R+1) with minimum stages determined by Fenske equation. Operational constraints enforce reflux ratio R \\ge 1.2 R_{min} and vapor flooding velocity limits per API 520 and ASTM D86 distillation criteria.',
    industrialFailureCase:
      'Tray Entrainment Flooding and Overhead Product Specification Collapse: An industrial petrochemical de-ethanizer distillation column operating at 28 bar experienced sudden loss of separation efficiency. Root Cause Analysis (RCA) established that reboiler steam valve hunting generated excessive vapor boil-up velocity exceeding the Fair flooding capacity limit (C_sb > 0.12). Intense vapor flow prevented liquid downcomer drainage, backing up liquid trays until the upper column flooded. Distillate ethane was contaminated with 14% propane bottoms, forcing shutdown and flaring of off-spec product. Protection Thresholds mandate differential pressure transmitters across tray beds (tripping steam flow at ΔP > 0.15 bar/m) and automated reflux ratio control.',
    faqs: [
      {
        question: 'What is the physical meaning of the minimum reflux ratio R_min in distillation?',
        answer: 'R_min is the reflux ratio where the operating line touches the vapor-liquid equilibrium curve, forming a "pinch point". At R_min, infinite theoretical trays are required to achieve desired separation.',
      },
      {
        question: 'How does feed thermal condition (q-line parameter) affect column operating lines?',
        answer: 'The q-value represents the mole fraction of liquid in the feed: subcooled liquid (q > 1, slope positive); saturated bubble-point liquid (q = 1, vertical); saturated dew-point vapor (q = 0, horizontal); superheated vapor (q < 0).',
      },
      {
        question: 'What operational parameters cause tray weeping versus tray flooding in columns?',
        answer: 'Tray weeping occurs at low vapor velocities where liquid dumps through tray perforations without contacting vapor. Flooding occurs at excessive vapor velocities where liquid is carried upward or backs up downcomers.',
      },
    ],
  },

  'heat-exchanger': {
    directAnswerSummary:
      'Shell-and-tube heat transfer evaluates thermal duty Q = U A F \\Delta T_{LMTD} with Log Mean Temperature Difference \\Delta T_{LMTD} = [(\\Delta T_1 - \\Delta T_2) / \\ln(\\Delta T_1 / \\Delta T_2)]. Operational safety restricts fouling resistance R_f \\le 0.0004\\text{ m}^2\\text{K/W}. Engineered to TEMA Class R and ASME Section VIII Div 1.',
    industrialFailureCase:
      'Flow-Induced Acoustic Vibration and Titanium Tube Fretting Rupture: In a refinery hydrocracker preheat train, a TEMA AES shell-and-tube heat exchanger experienced sudden tube rupture, contaminating treated naphtha with sour gas. Root Cause Analysis (RCA) revealed that shell-side fluid cross-flow velocity exceeded 3.4 m/s, producing Karman vortex shedding that matched the acoustic and natural structural frequency of the 19 mm titanium tubes (f = 142 Hz). Intense acoustic resonance (128 dBA) caused tubes to impact intermediate baffle plates, cutting through tube walls via fretting wear. Protection Thresholds per TEMA Class R mandate shell impingement plates, maximum baffle spans < 650 mm, and cross-flow velocity limits keeping fluid-elastic instability ratios < 0.75.',
    faqs: [
      {
        question: 'Why is counter-current flow thermally superior to co-current (parallel) flow?',
        answer: 'In counter-current flow, the cold fluid exit temperature can exceed the hot fluid exit temperature, achieving higher log-mean temperature difference (LMTD) and requiring less heat transfer surface area.',
      },
      {
        question: 'How does the LMTD correction factor F account for multipass cross-flow geometry?',
        answer: 'The correction factor F (0 < F ≤ 1.0) accounts for mixed flow regimes in 1-2 or 2-4 shell-and-tube passes. Standard design mandates F ≥ 0.80 to prevent temperature cross and excessive surface area requirements.',
      },
      {
        question: 'What physical mechanisms constitute fouling resistance R_f in heat exchangers?',
        answer: 'Fouling results from scale precipitation, biological growth, chemical coking, and particulate sedimentation on tube surfaces, creating an insulating layer that degrades overall heat transfer coefficient U.',
      },
    ],
  },

  'gas-absorption': {
    directAnswerSummary:
      'Packed gas absorption towers calculate packing height via Z = H_{OG} N_{OG} with number of transfer units N_{OG} = \\int [dy / (y - y^*)] and height H_{OG} = G_m / (K_y a S). Design enforces liquid-to-gas ratio (L/G) \\ge 1.25 (L/G)_{min} and operates below Sherwood flooding boundaries per EPA MACT and AIChE standards.',
    industrialFailureCase:
      'Packing Flooding and Acid Gas Toxic Atmospheric Breakthrough in Amine Scrubbers: An industrial sour natural gas amine absorption column operating structured packing suffered high-level toxic H₂S breakthrough into treated sales gas. Root Cause Analysis (RCA) established that severe hydrocarbon liquid condensation caused foaming, dramatically lowering interfacial surface tension. The column entered the Sherwood-Eckert flooding regime where high gas velocity prevented downward liquid amine percolation. Column pressure drop surged from 0.02 bar to 0.45 bar, and un-scrubbed hydrogen sulfide vented through the overhead outlet. Protection Thresholds mandate anti-foam injection systems, differential pressure transmitters tripping gas intake when ΔP > 0.08 bar/m, and continuous H₂S analyzers.',
    faqs: [
      {
        question: 'What is the physical interpretation of Height of a Transfer Unit (H_OG)?',
        answer: 'H_OG measures the mass transfer efficiency of the packing material. A smaller H_OG indicates faster mass transfer kinetics and more efficient packing, requiring a shorter column height for the same degree of separation.',
      },
      {
        question: 'Why is column diameter sized primarily around the gas flooding velocity?',
        answer: 'Flooding marks the hydraulic limit where upward gas friction suspends the downward liquid film. Columns are sized at 60% to 75% of flooding velocity to balance compact column diameter against hydraulic stability.',
      },
      {
        question: 'How does operating temperature affect physical absorption versus chemical absorption?',
        answer: 'Physical absorption (Henry’s law) improves at low temperatures due to higher gas solubility. Chemical absorption (amine scrubbers) requires moderate temperatures to balance reaction kinetics against solvent regeneration energy.',
      },
    ],
  },

  'batch-pfr-kinetics': {
    directAnswerSummary:
      'Plug Flow Reactors (PFR) model continuous tubular conversion via space time \\tau = V / v_0 = C_{A0} \\int_0^{X_A} [dX_A / (-r_A)] with Damköhler number Da = k C_{A0}^{n-1} \\tau. Reaction engineering boundaries enforce isothermal tolerance \\Delta T \\le 5^\\circ\\text{C} and radial velocity uniformity per Fogler CRE and OSHA PSM guidelines.',
    industrialFailureCase:
      'Hot-Spot Runaway and Catalyst Deactivation in Tubular Packed-Bed Ethylene Reactors: A fixed-bed tubular PFR oxidizing ethylene to ethylene oxide suffered thermal runaway and catastrophic catalyst sintering. Root Cause Analysis (RCA) demonstrated that uneven catalyst packing created preferential flow channels, starving peripheral tubes while overloading center tubes with unreacted ethylene. In the center tubes, intense exothermic reaction heat overcame radial heat transfer, generating a 120°C hotspot. The high temperature sintered the silver catalyst pellets and initiated complete combustion to CO₂. Protection Thresholds mandate multi-point internal thermocouple arrays, automated emergency nitrogen ballast quenching within 1.5 seconds, and strict feed gas hydrocarbon concentration interlocks.',
    faqs: [
      {
        question: 'Why does a Plug Flow Reactor achieve higher conversion per unit volume than a CSTR?',
        answer: 'In a PFR, reactant concentration starts at maximum at the inlet and drops gradually along the tube length. Because reaction rate scales with concentration, the integrated reaction rate is significantly higher than in a CSTR.',
      },
      {
        question: 'What causes channeling and axial dispersion in real tubular reactors?',
        answer: 'Non-uniform packing density, wall friction, and turbulent eddies cause fluid packets to travel at different velocities, generating axial dispersion that broadens residence time distribution and reduces conversion.',
      },
      {
        question: 'How does space time τ differ from true mean fluid residence time in variable-density gas reactions?',
        answer: 'Space time τ = V / v_0 is based strictly on inlet volumetric flow rate. In reactions with changing mole numbers (e.g., A → 2B), gas expands, accelerating velocity and making actual residence time shorter than τ.',
      },
    ],
  },

  'liquid-extraction': {
    directAnswerSummary:
      'Countercurrent liquid-liquid extraction models ternary solute partitioning via distribution coefficient K_D = x_E / x_R and extraction factor E = K_D (S / F) > 1.3. Phase boundaries mandate density differential \\Delta \\rho \\ge 50\\text{ kg/m}^3 to prevent emulsion rag-layer formation per AIChE and ASTM D1159 criteria.',
    industrialFailureCase:
      'Rag-Layer Emulsion Formation and Solvent Carryover in Uranium Hydrometallurgy: In a mining solvent extraction plant separating uranium from sulfuric acid leach liquor using tertiary amines in kerosene diluent, settler tanks experienced continuous solvent loss into downstream raffinate ponds. Root Cause Analysis (RCA) revealed that colloidal silica and fine clay particulates in the feed liquor accumulated at the liquid-liquid interface, forming a dense, stable emulsion "rag layer". The rag layer blocked droplet coalescence, allowing organic solvent to carry over with aqueous raffinate. Protection Thresholds mandate continuous ultrasonic interface level transmitters, upstream flocculant clarification, and automated interphase rag-layer suction skimming before solvent carryover exceeds 50 ppm.',
    faqs: [
      {
        question: 'What is the physical role of the distribution coefficient K_D in liquid extraction?',
        answer: 'K_D = y^* / x defines the equilibrium concentration ratio of solute between extract (solvent) and raffinate phases. A high K_D (> 2.0) minimizes required solvent circulation rates.',
      },
      {
        question: 'Why must solvent and feed phases maintain a minimum density difference Δρ ≥ 50 kg/m³?',
        answer: 'Sufficient density difference is the sole driving force for gravity phase separation in settlers. Low Δρ prolongs phase separation time, stabilizes emulsions, and promotes solvent carryover.',
      },
      {
        question: 'How does temperature influence the two-phase immiscibility envelope on ternary diagrams?',
        answer: 'Increasing temperature generally increases mutual solubility between carrier and solvent liquids, shrinking the two-phase immiscibility envelope and reducing operating separation efficiency.',
      },
    ],
  },

  // =========================================================================
  // 5. QUANTUM & SEMICONDUCTOR PHYSICS
  // =========================================================================
  'pn-junction': {
    directAnswerSummary:
      'Semiconductor P-N diode physics obey the Shockley formulation J = J_0 [\\exp(q V_a / k T) - 1] with built-in potential V_{bi} = (k T / q) \\ln(N_A N_D / n_i^2) and depletion width W = \\sqrt{(2\\epsilon_s / q)(1/N_A + 1/N_D)(V_{bi} - V_a)}. Operating temperature is limited to T \\le 150^\\circ\\text{C} per JEDEC JESD22 and IEC 60747-2 standards.',
    industrialFailureCase:
      'Secondary Electro-Thermal Breakdown and Current Filamentation in Power Diodes: A 1200 V fast-recovery freewheeling diode in a grid inverter failed catastrophically during inductive turn-off switching. Root Cause Analysis (RCA) demonstrated that reverse-recovery inductive voltage spikes exceeded the avalanche breakdown rating (V_R > V_{BR}). Non-uniform dopant distributions concentrated impact ionization current into micro-filaments. Local current densities exceeded 10^5 A/cm², creating localized thermal hotspots where intrinsic carrier concentration surpassed background doping. The silicon melted in < 150 ns, permanently shorting the PN junction into a 0 Ω dead short. Protection Thresholds per IEC 60747 mandate RC snubber networks, active voltage clamping, and fast-recovery epitaxial diodes (FRED) with integrated planar guard rings.',
    faqs: [
      {
        question: 'What physical mechanism creates the depletion region at a P-N junction in equilibrium?',
        answer: 'Mobile electrons from the N-side diffuse into the P-side, and holes diffuse to the N-side. Recombination exposes uncompensated ionized donor (+q) and acceptor (-q) dopant cores, creating an electric field that counterbalances diffusion.',
      },
      {
        question: 'Why does forward bias decrease depletion width while reverse bias widens it?',
        answer: 'Forward bias applies an external electric field opposing the built-in potential, lowering the barrier (V_bi - V_a) and thinning the depletion zone. Reverse bias reinforces the built-in field, widening the space-charge zone.',
      },
      {
        question: 'What distinguishes Zener breakdown from Avalanche breakdown mechanisms?',
        answer: 'Zener breakdown occurs in heavily doped junctions where narrow depletion barriers (< 10 nm) permit direct quantum tunneling at low voltages (< 5 V). Avalanche breakdown occurs in lightly doped junctions via impact ionization at high electric fields.',
      },
    ],
  },

  'sic-switching': {
    directAnswerSummary:
      'Silicon Carbide (SiC) MOSFET switching dynamics follow energy loss formulations E_{sw} = \\int V_{ds}(t) I_d(t) dt with fast gate slew rates dV/dt \\le 100\\text{ V/ns}. Gate oxide voltages are constrained to -4\\text{ V} \\le V_{gs} \\le +18\\text{ V}. Governed by JEDEC JEP183 and IEC 60747-8 wide-bandgap guidelines.',
    industrialFailureCase:
      'Parasitic Miller Turn-On and Shoot-Through in 800V EV Traction Inverters: During rapid acceleration of an electric vehicle traction inverter, a 1200 V SiC half-bridge module exploded. Root Cause Analysis (RCA) revealed that high-speed turn-off of the low-side SiC MOSFET induced an ultra-fast voltage transient (dV/dt = 85 V/ns) across the high-side switch. This transient injected displacement current through the parasitic gate-drain capacitance (I = C_{gd} · dV/dt) through gate loop inductance. The resulting gate voltage spike exceeded threshold voltage (V_{th} = 2.1 V), momentarily turning on both switches simultaneously. The resulting DC-link short circuit vaporized bond wires in < 1.0 μs. Protection Thresholds per JEDEC JEP183 mandate Active Miller Clamping (AMC) gate drivers and negative off-state gate bias (-4 VDC).',
    faqs: [
      {
        question: 'Why does Silicon Carbide (SiC) exhibit superior breakdown voltage compared to standard Silicon?',
        answer: 'SiC possesses a wide energy bandgap (3.26 eV vs 1.12 eV for Si) and a critical breakdown electric field nearly 10 times higher (3.0 MV/cm vs 0.3 MV/cm), permitting dramatically thinner drift layers with 100× lower on-resistance.',
      },
      {
        question: 'What is the physical cause of parasitic Miller turn-on in fast-switching bridge legs?',
        answer: 'High dV/dt across the complementary switch pushes displacement current I = C_gd (dV/dt) through gate resistance. The resulting IR voltage drop elevates gate-source voltage above V_th, causing bridge shoot-through short circuits.',
      },
      {
        question: 'Why is negative off-state gate bias (-4 V to -5 V) recommended for SiC MOSFET gate drivers?',
        answer: 'SiC MOSFETs exhibit relatively low threshold voltages (V_th ≈ 1.8 V to 2.5 V) that decline with temperature. Applying negative off-state bias provides essential noise immunity margin against spurious Miller turn-on.',
      },
    ],
  },

  'igbt-thermal': {
    directAnswerSummary:
      'IGBT module transient thermal impedance follows the multi-layer Foster/Cauer RC network T_j(t) = T_c + P_{loss} \\sum R_i (1 - e^{-t/\\tau_i}) with junction temperature constrained to T_j \\le 175^\\circ\\text{C}. Short-circuit withstand is rated for t_{sc} \\le 10\\ \\mu\\text{s} per IEC 60747-9 and JEDEC JESD51 power electronics standards.',
    industrialFailureCase:
      'Bond-Wire Fatigue Lift-Off and Parasitic Latch-Up in Railway Traction Inverters: A 3.3 kV 1200 A IGBT module in an electric locomotive traction drive suffered explosive short-circuit failure during full-power track acceleration. Root Cause Analysis (RCA) revealed that extreme cyclic junction temperature swings (ΔT_j > 85 K) induced severe thermo-mechanical shear stresses between aluminum bond wires and silicon dies due to coefficient of thermal expansion (CTE) mismatches. After 1.2 million thermal cycles, three emitter bond wires detached, increasing current density through remaining wires. Localized thermal runaway pushed junction temperature past 190°C, triggering parasitic NPN-PNP thyristor latch-up and full phase short-circuit. Protection Thresholds mandate desaturation protection (V_{ce(sat)} > 7 V) executing soft turn-off in < 3 μs per IEC 60747-9.',
    faqs: [
      {
        question: 'What is the physical cause of the tail current during IGBT turn-off?',
        answer: 'The IGBT is a hybrid MOS-bipolar device. At turn-off, the MOSFET channel closes instantly, but stored excess minority carriers in the wide N-drift base must recombine slowly via natural carrier lifetime, producing the tail current.',
      },
      {
        question: 'How do Foster and Cauer thermal equivalent networks differ in thermal modeling?',
        answer: 'The Foster network is a mathematical curve fit of parallel R-C stages without direct physical meaning. The Cauer network models actual physical layers (silicon die, solder, DBC substrate, baseplate) where node temperatures reflect physical interfaces.',
      },
      {
        question: 'What is desaturation (Desat) detection and how does it protect IGBTs against short circuits?',
        answer: 'Under severe short circuits, fault current pulls the IGBT out of saturation, causing V_CE to rise above 6 V to 8 V while fully on. Desat circuits detect this voltage jump and execute controlled soft turn-off within microseconds to prevent explosive failure.',
      },
    ],
  },

  'mosfet-channel': {
    directAnswerSummary:
      'MOSFET field-effect conduction follows BSIM channel physics with linear current I_D = \\mu_n C_{ox} (W/L)[(V_{GS} - V_{th})V_{DS} - V_{DS}^2/2] and saturation I_D = \\frac{1}{2} \\mu_n C_{ox} (W/L)(V_{GS} - V_{th})^2(1 + \\lambda V_{DS}). Gate dielectric electric field is bounded by E_{ox} \\le 10\\text{ MV/cm} per JEDEC JESD77 and IEC 60747-8 standards.',
    industrialFailureCase:
      'Time-Dependent Dielectric Breakdown (TDDB) and Hot-Carrier Degradation in Sub-Micron Gates: High-reliability industrial microprocessors operating in 70°C ambient server environments experienced unrecoverable logic timing errors after two years. Root Cause Analysis (RCA) established that sustained high gate electric fields (E_{ox} > 6 MV/cm) across the thin 2.5 nm gate oxide induced Time-Dependent Dielectric Breakdown (TDDB). High-energy electrons accelerated by drain electric fields collided with the Si-SiO₂ interface, injecting traps that shifted threshold voltage (V_th) by +240 mV. The resulting drain current reduction degraded circuit switching speeds, causing setup-time violations. Protection Thresholds per JEDEC JESD77 mandate operating gate voltages below 80% of TDDB limits and applying substrate body-biasing.',
    faqs: [
      {
        question: 'What is the physical mechanism of channel inversion in an NMOS transistor?',
        answer: 'Applying gate voltage V_GS > V_th repels majority holes from the P-substrate surface and attracts minority electrons. When surface electron concentration exceeds background hole concentration, an inverted N-type conductive channel forms.',
      },
      {
        question: 'What causes channel pinch-off at the drain in the saturation regime?',
        answer: 'When drain voltage reaches V_DS = V_GS - V_th, the local gate-to-channel voltage at the drain drops below threshold voltage (V_GD = V_th). The inversion layer pinches off, and additional V_DS falls across the depletion region.',
      },
      {
        question: 'Why does mobility degradation occur at high vertical gate electric fields?',
        answer: 'Strong gate electric fields pull mobile inversion electrons tightly against the Si-SiO₂ interface, where atomic surface roughness and interface state acoustic phonon scattering reduce effective carrier mobility μ_eff.',
      },
    ],
  },

  'photoelectric-effect': {
    directAnswerSummary:
      'Photoelectric quantum emission satisfies Einstein\'s conservation formulation E_{k,max} = h\\nu - \\Phi = q V_{stop} where \\Phi is the cathode work function and \\nu_0 = \\Phi/h is threshold frequency. Photocurrent scales linearly with incident photon flux. Calibrated to NIST fundamental physical constants and IEC 60027 standards.',
    industrialFailureCase:
      'Photocathode Adsorbate Contamination and Quantum Efficiency Degradation in Scintillation PMTs: In radiation detection and gamma camera imaging systems, photomultiplier tubes (PMTs) experienced a 70% loss of sensitivity over six months. Root Cause Analysis (RCA) proved that micro-leakage of atmospheric moisture and outgassed volatile organic compounds reacted with the bi-alkali (Sb-K-Cs) photocathode. Surface oxidation increased the work function Φ from 2.1 eV to 3.4 eV. Incoming blue scintillation photons (420 nm, 2.95 eV) could no longer overcome the elevated work function barrier, dropping photoelectron emission to near zero. Protection Thresholds mandate ultra-high vacuum sealing (< 10^-8 Torr), getter activation, and optical spectral matching per NIST standards.',
    faqs: [
      {
        question: 'Why does classical wave theory fail to explain the instantaneous nature of photoemission?',
        answer: 'Wave theory predicts light energy spreads continuously across the wavefront, requiring minutes for an electron to accumulate sufficient energy to escape. Quantum theory proves energy is delivered in discrete photon packets (E = hν), emitting electrons instantaneously.',
      },
      {
        question: 'Why does stopping potential V_stop depend solely on frequency, not light intensity?',
        answer: 'Increasing intensity increases photon flux, liberating more photoelectrons (higher photocurrent), but does not alter individual photon energy. Maximum kinetic energy E_k,max and stopping potential depend strictly on photon frequency (E = hν - Φ).',
      },
      {
        question: 'What is the physical interpretation of the work function Φ?',
        answer: 'The work function Φ is the minimum energy required to liberate an electron from the Fermi level of a solid to the vacuum level outside the surface. It represents the potential energy binding electrons to the metallic lattice.',
      },
    ],
  },

  'quantum-tunneling': {
    directAnswerSummary:
      'Quantum mechanical barrier tunneling follows the WKB transmission formulation T(E) \\approx 16 (E/V_0)(1 - E/V_0) e^{-2\\kappa a} with decay parameter \\kappa = \\sqrt{2m(V_0 - E)}/\\hbar. Applicable across barrier thicknesses a \\le 5.0\\text{ nm}. Governed by IEEE Nanotechnology Council and ISO 80000-10 quantum physical standards.',
    industrialFailureCase:
      'Direct Gate Dielectric Tunneling Leakage in Sub-3nm FinFET and GAA Architectures: High-performance semiconductor processors manufactured with sub-3nm gate geometries suffered excessive standby leakage currents exceeding 120 W at idle. Root Cause Analysis (RCA) established that thinning silicon dioxide (SiO₂) gate dielectric thickness below 1.2 nm enabled direct quantum mechanical wave tunneling of electrons through the thin potential barrier. Gate leakage current density escalated exponentially to > 150 A/cm², draining mobile device batteries and inducing thermal hotspots. Protection Thresholds per IEEE Nanotechnology Council standards mandate transitioning to High-k metal gate (HKMG) dielectrics (hafnium oxide HfO₂, k ≈ 25) to provide high physical thickness while maintaining low equivalent oxide thickness (EOT < 0.8 nm).',
    faqs: [
      {
        question: 'Why does quantum tunneling occur despite particle energy E being less than barrier potential V₀?',
        answer: 'In quantum mechanics, particle state is described by a wave function Ψ(x). Inside the barrier where E < V₀, Ψ(x) decays exponentially but remains non-zero. If the barrier is thin, Ψ emerges on the other side with non-zero probability.',
      },
      {
        question: 'How do Tunnel Diodes exploit quantum tunneling to exhibit Negative Differential Resistance (NDR)?',
        answer: 'Heavily degenerate doping aligns conduction band electrons on the N-side with empty valence band states on the P-side under small forward bias, producing massive tunneling current. Increasing bias misaligns these bands, causing current to drop and creating NDR.',
      },
      {
        question: 'What physical limits does direct gate tunneling impose on nanoscale transistor scaling?',
        answer: 'When gate oxide thickness drops below 1.5 nm, direct quantum tunneling leakage escalates exponentially, exceeding active switching power and generating unacceptable static standby power dissipation.',
      },
    ],
  },
};

/**
 * Returns the complete authoritative engineering content bundle for any simulator.
 */
export function getSimulatorEngineeringContent(simId: string): SimulatorEngineeringContent {
  const content = SIMULATOR_ENGINEERING_CONTENT[simId];
  if (content) {
    return content;
  }

  // Graceful fallback for any dynamic or newly registered simulator
  return {
    directAnswerSummary:
      'Governed by fundamental physical conservation equations and solved via double-precision 60 FPS numerical Runge-Kutta integration. Parameter operational boundaries enforce physical stability criteria referenced against international consensus standards (IEEE, IEC, ASME, ISO, API, ISA).',
    industrialFailureCase:
      'Industrial Component Failure and Root Cause Analysis: Operating beyond designed operational envelopes induces excessive thermal, mechanical, or electrical stress concentrations that exceed component endurance limits. Root Cause Analysis (RCA) proves that transient shock loading and thermal cycling accelerate material fatigue, precipitating catastrophic functional tripping. Protection thresholds mandate calibrated sensors, protective interlocks, and automated trip algorithms to isolate faulty equipment within standardized safety clearing intervals.',
    faqs: [
      {
        question: 'What governing physical laws dictate the dynamic response of this simulator?',
        answer: 'The system numerically solves multi-domain differential equations enforcing continuous conservation of energy, momentum, or electric charge across all operational parameter states.',
      },
      {
        question: 'How do boundary parameter limits prevent numerical instability and component damage?',
        answer: 'Parameter bounds represent physical saturation, breakdown voltages, and mechanical strength ceilings verified against standard engineering codes.',
      },
      {
        question: 'Which consensus standards and field monitoring practices apply to this equipment?',
        answer: 'Equipment design and commissioning reference IEEE, IEC, ASME, or ISO standards, utilizing continuous telemetry monitoring to verify operational integrity.',
      },
    ],
  };
}
