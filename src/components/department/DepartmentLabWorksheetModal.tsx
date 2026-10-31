import React, { useState } from 'react';
import { X, Printer, Download, Copy, Check, FileText, Sparkles, BookOpen, Layers } from 'lucide-react';
import { DisciplineId, SimulatorItem } from '../../types';
import { MathView } from '../MathView';
import { soundEngine } from '../../utils/audio';

interface DepartmentLabWorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentId: DisciplineId;
  departmentName: string;
  departmentCode: string;
  accentColor: string;
  simulators: SimulatorItem[];
}

export const DepartmentLabWorksheetModal: React.FC<DepartmentLabWorksheetModalProps> = ({
  isOpen,
  onClose,
  departmentId,
  departmentName,
  departmentCode,
  accentColor,
  simulators,
}) => {
  const [selectedSimId, setSelectedSimId] = useState<string>(simulators[0]?.id || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentSim = simulators.find((s) => s.id === selectedSimId) || simulators[0];

  const generateMarkdownWorksheet = () => {
    return `# ${departmentCode} Laboratory Worksheet: ${currentSim?.title || 'Engineering Experiment'}
**Course:** ${departmentName} (${departmentCode})  
**Platform:** LiveSimulators Real-Time Computational Workbench  
**Accreditation Alignment:** ABET Student Outcome 1 (Complex Problem Solving) & Outcome 6 (Experimental Analysis)  
**URL:** https://livesimulators.com/simulator/${currentSim?.id}  

---

### Student Information
- **Student Name:** __________________________________
- **Student ID:** __________________________________
- **Lab Section / Station ID:** ____________________
- **Date Conducted:** ______________________________

---

## 1. Laboratory Objective
To analyze the transient and steady-state dynamic response of **${currentSim?.title}** governed by first-principles mathematical equations. Students will vary primary design parameters, observe real-time numerical behavior, record numerical metrics, and cross-validate experimental observations against analytical theory.

## 2. Governing Equations & Theoretical Model
$$\n${currentSim?.math || 'f(x) = 0'}\n$$

**Key Variable Definitions:**
- Reference Standard: ${currentSim?.standardRef || 'IEEE / ASME / ISO Benchmark'}
- Primary Mode: Real-time 4th-Order Runge-Kutta (RK4) integration with IEEE 754 Float64 precision.

---

## 3. Laboratory Equipment & Software
1. LiveSimulators Interactive Laboratory Workbench (${departmentName})
2. Browser with HTML5 Canvas & Web Workers enabled (Chrome, Edge, Firefox, Safari)
3. Laboratory Calculation Notebook / Python NumPy script for post-lab verification

---

## 4. Step-by-Step Experimental Procedure
1. Navigate to the online laboratory station: \`https://livesimulators.com/simulator/${currentSim?.id}\`.
2. Inspect the default initial states and confirm zero initial condition drift.
3. **Run Trial 1 (Nominal):** Set the baseline slider parameters to nominal mid-scale values. Record the peak amplitude, settling time, and steady-state equilibrium value.
4. **Run Trial 2 (Low Damping / High Stress):** Reduce damping or resistance by 50%. Observe transient oscillatory overshoot and calculate the damping ratio $\\zeta$ or quality factor $Q$.
5. **Run Trial 3 (Overdamped / Saturated Regime):** Increase parameter constraints to induce saturation or non-oscillatory exponential decay. Note the rise time.
6. Export the telemetry time-series using the **[Export CSV]** button on the simulator toolbar for archival plotting.

---

## 5. Experimental Data Collection Matrix

| Trial | Parameter 1 (Input) | Parameter 2 (Input) | Peak / Max Value (Simulated) | Settling / Response Time (Simulated) | Analytical Theoretical Target | % Error |
|---|---|---|---|---|---|---|
| **1 (Nominal)** | | | | | | |
| **2 (Transient)** | | | | | | |
| **3 (Saturated)** | | | | | | |

---

## 6. Post-Lab Quantitative Analysis Questions
1. **Model Derivation:** From the governing differential equation above, derive the characteristic equation and calculate the undamped natural frequency $\\omega_n$ or equivalent system time constant $\\tau$.
2. **Deviation Analysis:** Compare your measured simulation values with your closed-form hand calculation. What contributes to any discrepancies (e.g., discrete step size $\\Delta t$, parasitic losses)?
3. **Industrial Application:** How does this simulated system behave in modern industrial applications (e.g. power grid stability, aerospace turbomachinery, seismic isolation, or semiconductor fabrication)? Cite one published standard (such as ${currentSim?.standardRef || 'IEEE/ASME'}).

---
*Worksheet generated from LiveSimulators. Free for non-commercial academic classroom and laboratory use.*
`;
  };

  const handleCopyMarkdown = () => {
    soundEngine.playRelayClick();
    navigator.clipboard.writeText(generateMarkdownWorksheet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    soundEngine.playRelayClick();
    const md = generateMarkdownWorksheet();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${departmentCode}_Lab_${currentSim?.id || 'experiment'}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    soundEngine.playRelayClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#090d16] border border-slate-700/80 shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className="p-2 rounded-xl text-white font-mono font-bold text-xs"
              style={{ backgroundColor: `${accentColor}30`, color: accentColor }}
            >
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>ABET Coursework &amp; Lab Worksheet Generator</span>
              </h2>
              <p className="text-xs text-slate-400">
                {departmentName} ({departmentCode}) — Formatted laboratory assignment handout
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playRelayClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Lab Selector & Action Buttons */}
        <div className="p-3 sm:p-4 bg-slate-950/90 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Simulator Dropdown */}
          <div className="flex items-center gap-2 min-w-[240px]">
            <span className="text-xs font-mono text-slate-400">Select Lab:</span>
            <select
              value={selectedSimId}
              onChange={(e) => {
                soundEngine.playRelayClick();
                setSelectedSimId(e.target.value);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white px-3 py-1.5 focus:outline-none focus:border-cyan-400 max-w-[280px] truncate"
            >
              {simulators.map((sim) => (
                <option key={sim.id} value={sim.id}>
                  {sim.title}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
              title="Copy Markdown to Clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
              title="Download as .md file"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download .md</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors shadow-sm"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Worksheet Printable / Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-slate-300 font-sans text-xs sm:text-sm leading-relaxed bg-[#060a12] print:bg-white print:text-black">
          
          {/* Printable Header Box */}
          <div className="border border-slate-800 p-5 rounded-xl bg-slate-900/40 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                  {departmentCode} Laboratory Course Syllabus Handout
                </span>
                <h1 className="text-base sm:text-xl font-black text-white">
                  Experiment: {currentSim?.title}
                </h1>
              </div>
              <div className="text-right text-[11px] font-mono text-slate-400">
                <span>Accreditation: ABET EAC Outcomes 1 &amp; 6</span>
              </div>
            </div>

            {/* Student Info Lines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1 text-xs font-mono">
              <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Student Name</span>
                <span className="text-slate-400">________________________</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Student ID / Roll No</span>
                <span className="text-slate-400">________________________</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Lab Station ID</span>
                <span className="text-slate-400">Station #[ ___ ]</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block">Date Performed</span>
                <span className="text-slate-400">____ / ____ / 2026</span>
              </div>
            </div>
          </div>

          {/* Section 1: Objective */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. Objective &amp; Theoretical Background</span>
            </h2>
            <p className="text-slate-300 leading-relaxed">
              Investigate the dynamic behavior of <strong>{currentSim?.title}</strong> under varying parametric excitations. Students will evaluate numerical solutions calculated via 64-bit Runge-Kutta numerical integration and benchmark observed transient curves against theoretical mathematical derivations.
            </p>
          </div>

          {/* Section 2: Mathematical Formulation */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>2. Governing Differential Model</span>
            </h2>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-sm sm:text-base text-slate-100 overflow-x-auto">
              <MathView math={currentSim?.math || 'f(x) = 0'} displayMode={true} />
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Industry Standard Benchmark Reference: <strong className="text-slate-300">{currentSim?.standardRef || 'IEEE / ASME'}</strong>
            </p>
          </div>

          {/* Section 3: Laboratory Procedure */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>3. Experimental Procedure Protocol</span>
            </h2>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1">
              <li>Open the interactive lab station at: <code className="text-cyan-300 font-mono text-xs">livesimulators.com/simulator/{currentSim?.id}</code></li>
              <li>Verify that initial states are at rest and record baseline parameter values in Table 1 below.</li>
              <li><strong>Step Response / Nominal Test:</strong> Apply nominal excitation. Record steady-state value and peak transient response.</li>
              <li><strong>Parametric Sweep:</strong> Modify primary damping / stiffness / resistance slider by ±50% and record resulting frequency or overshoot.</li>
              <li>Export CSV waveform telemetry for detailed plotting in Python or MATLAB.</li>
            </ol>
          </div>

          {/* Section 4: Data Recording Matrix Table */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>4. Laboratory Data Collection Grid</span>
            </h2>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 font-mono">
                  <tr>
                    <th className="p-2.5">Trial</th>
                    <th className="p-2.5">Param 1 Input</th>
                    <th className="p-2.5">Param 2 Input</th>
                    <th className="p-2.5">Simulated Peak</th>
                    <th className="p-2.5">Settling Time</th>
                    <th className="p-2.5">Theoretical Calculation</th>
                    <th className="p-2.5">% Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-slate-400">
                  <tr className="bg-slate-950/40">
                    <td className="p-2.5 font-bold text-slate-200">1. Nominal</td>
                    <td className="p-2.5">[ _____ ]</td>
                    <td className="p-2.5">[ _____ ]</td>
                    <td className="p-2.5">[ _____ ]</td>
                    <td className="p-2.5">[ _____ ]</td>
                    <td className="p-2.5">[ _____ ]</td>
                    <td className="p-2.5">[ _____ % ]</td>
                  </tr>
                  <tr className="bg-slate-950/20">
                    <td className="p-2.5 font-bold text-slate-200">2. Low Damping</td>
                    <td className="p-2.5">[ _____ ]</td>
                    <td className="p-2.5">[ _____ ]</td>
                    <td className="p-2.5">[ _____ ]</td>
                    <td className="p-2.5">[ _____ ]</td>
                    <td className="p-2.5">[ _____ ]</td>
                    <td className="p-2.5">[ _____ % ]</td>
                  </tr>
                  <tr className="bg-slate-950/40">
                    <td className="p-2.5 font-bold text-slate-200">3. High Stress</td>
                    <td className="p-2.5">[ _____ ]</td>
                    <td className="p-2.5">[ _____ ]</td>
                    <td className="p-2.5">[ _____ ]</td>
                    <td className="p-2.5">[ _____ ]</td>
                    <td className="p-2.5">[ _____ ]</td>
                    <td className="p-2.5">[ _____ % ]</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: Post-Lab Analysis Questions */}
          <div className="space-y-2">
            <h2 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>5. Post-Lab Quantitative Analysis</span>
            </h2>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <p className="font-semibold text-slate-200 mb-1">
                  Question 1 (Analytical Derivation):
                </p>
                <p className="text-slate-400">
                  Derive the transfer function or characteristic roots for this system. Using your nominal slider values, calculate the expected natural frequency or time constant by hand.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <p className="font-semibold text-slate-200 mb-1">
                  Question 2 (Error &amp; Sensitivity Analysis):
                </p>
                <p className="text-slate-400">
                  Calculate the percentage difference between your theoretical calculation and the simulated output. Discuss the impact of internal numerical integration step size and parasitic damping.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <p className="font-semibold text-slate-200 mb-1">
                  Question 3 (Real-World Application):
                </p>
                <p className="text-slate-400">
                  Explain how these mathematical dynamics manifest in industrial engineering systems (referencing standard {currentSim?.standardRef || 'IEEE/ASME'}). How does a practicing engineer prevent instability or failure?
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
