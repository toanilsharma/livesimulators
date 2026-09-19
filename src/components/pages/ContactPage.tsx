import React, { useState } from 'react';
import { 
  Mail, 
  Linkedin, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  MessageSquare, 
  ArrowLeft, 
  Clock, 
  ShieldCheck, 
  Code2, 
  Layers,
  Building2,
  ExternalLink
} from 'lucide-react';

interface ContactPageProps {
  onBackToHome: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBackToHome }) => {
  const [copied, setCopied] = useState(false);
  const [category, setCategory] = useState<'simulator' | 'proof' | 'academic' | 'bug' | 'general'>('simulator');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const contactEmail = '0808miracle@gmail.com';
  const linkedinUrl = 'https://www.linkedin.com/in/toanilsharma/';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && message.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }, 3500);
    }
  };

  const categories = [
    { id: 'simulator', label: 'New Simulator Request', icon: Code2 },
    { id: 'proof', label: 'Equation / Proof Inquiry', icon: Layers },
    { id: 'academic', label: 'Academic & Course Use', icon: Building2 },
    { id: 'bug', label: 'Numerical Edge-case / Bug', icon: Sparkles },
    { id: 'general', label: 'General Feedback', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#080d16] text-slate-100 font-sans selection:bg-cyan-500/25 selection:text-cyan-200 relative overflow-x-hidden w-full max-w-full">
      {/* Background Decorators */}
      <div className="absolute inset-0 bg-tech-grid opacity-10 pointer-events-none" />
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors bg-slate-900/80 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg group"
            id="contact-back-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Simulators</span>
          </button>
          <span className="text-slate-700">/</span>
          <span className="text-xs font-mono text-cyan-400">CONTACT & LEADERSHIP</span>
        </div>

        {/* Header Section */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            DIRECT ENGINEERING CHANNEL
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight leading-tight">
            Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">LiveSimulators</span>
          </h1>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Have a simulator request, need an analytical derivation breakdown, or want to integrate 
            interactive physics simulations into your university syllabus? Reach out directly to our 
            creator and engineering team.
          </p>
        </div>

        {/* 2-Column Grid: Contact Card + Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Direct Profile & Contact Dossier */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Primary Profile Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 shadow-xl shadow-black/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/30 to-blue-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <span className="font-display font-black text-2xl text-white">AS</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-bold text-white tracking-tight">
                      Anil Sharma
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono">
                      FOUNDER
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Lead Computational Engineering & Architecture
                  </p>
                  <p className="text-cyan-400 font-mono text-[11px] mt-1">
                    LiveSimulators.com
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-4 mb-6">
                Dedicated to making advanced engineering principles intuitive through interactive, 
                first-principles client-side numerical simulations. Open for academic collaborations, 
                engineering inquiries, and continuous simulator enhancements.
              </p>

              {/* Direct Communication Channels */}
              <div className="space-y-3">
                {/* Email Channel */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[10px] font-mono uppercase text-slate-500">Official Email</div>
                      <a 
                        href={`mailto:${contactEmail}`}
                        className="text-xs font-mono text-cyan-300 hover:underline truncate block"
                        title={contactEmail}
                      >
                        {contactEmail}
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyEmail}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
                    title="Copy email to clipboard"
                    id="copy-email-btn"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* LinkedIn Channel */}
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 flex items-center justify-between group transition-all"
                  id="linkedin-profile-link"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                      <Linkedin className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-[10px] font-mono uppercase text-slate-500">Professional Network</div>
                      <span className="text-xs font-mono text-white group-hover:text-blue-300 transition-colors truncate block">
                        linkedin.com/in/toanilsharma
                      </span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                </a>
              </div>

              {/* Service Level Guarantees */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-center font-mono">
                <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60">
                  <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    <span>&lt; 24-48h</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Response Target</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60">
                  <div className="flex items-center justify-center gap-1 text-cyan-400 text-xs font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Engineering Review</div>
                </div>
              </div>

            </div>

            {/* Academic & University Usage Info Box */}
            <div className="rounded-xl border border-slate-800/90 bg-gradient-to-b from-slate-900/60 to-slate-950/90 p-5 text-xs text-slate-400 space-y-2">
              <h3 className="font-display font-semibold text-white text-xs flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                Educators & Department Heads
              </h3>
              <p className="leading-relaxed text-[11px]">
                If you are creating an electrical, mechanical, or civil engineering curriculum, 
                we can tailor default parameter sets and analytical proofs for your lecture modules at zero cost.
              </p>
            </div>

          </div>

          {/* Right Column: High-Tech Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-black/40">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                  <h2 className="font-display text-lg font-bold text-white tracking-tight">
                    Send an Engineering Inquiry
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Messages are routed directly to Anil Sharma's review desk.
                  </p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              </div>

              {submitted ? (
                <div className="py-16 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white">Transmission Dispatched</h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. Your message has been logged. Anil Sharma will review your inquiry and follow up at <span className="text-cyan-300 font-mono">{email}</span>.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white transition-colors"
                  >
                    Send Another Transmission
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Category Pill Selector */}
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                      Inquiry Nature
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.id;
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setCategory(cat.id as any)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                              isSelected
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. / Prof. / Eng. Jane Doe"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                        Your Email
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@university.edu or corp.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition-colors"
                      />
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="E.g. Request for Synchronous Grid Governor & Load-Angle Simulator"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans transition-colors"
                    />
                  </div>

                  {/* Message Body */}
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                      Message & Technical Specifications
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please share equation models, standard references (e.g. IEEE, ASME), parameter ranges, or pedagogical requirements..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans transition-colors"
                    />
                  </div>

                  {/* Submit Action Strip */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
                    <p className="text-[11px] font-mono text-slate-500">
                      Direct recipient: <span className="text-slate-300">{contactEmail}</span>
                    </p>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <a
                        href={`mailto:${contactEmail}?subject=${encodeURIComponent(subject || 'LiveSimulators Inquiry')}&body=${encodeURIComponent(message)}`}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5 justify-center"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Open Mail App</span>
                      </a>
                      <button
                        type="submit"
                        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 text-slate-950 font-display font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                        id="contact-submit-btn"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Transmit Message</span>
                      </button>
                    </div>
                  </div>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
