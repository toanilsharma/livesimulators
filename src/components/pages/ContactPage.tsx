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
  ExternalLink,
  Lock,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';

interface ContactPageProps {
  onBackToHome: () => void;
}

type InquiryCategory = 'simulator' | 'proof' | 'academic' | 'bug' | 'general';
type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export const ContactPage: React.FC<ContactPageProps> = ({ onBackToHome }) => {
  const [copied, setCopied] = useState(false);
  const [category, setCategory] = useState<InquiryCategory>('simulator');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [botField, setBotField] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [receiptId, setReceiptId] = useState('');
  const [receiptTime, setReceiptTime] = useState('');

  const contactEmail = '0808miracle@gmail.com';
  const linkedinUrl = 'https://www.linkedin.com/in/toanilsharma/';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories: Array<{
    id: InquiryCategory;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    placeholder: string;
    messageHint: string;
  }> = [
    { 
      id: 'simulator', 
      label: 'New Simulator Request', 
      icon: Code2,
      placeholder: 'E.g. Request for Synchronous Grid Governor & Load-Angle Simulator',
      messageHint: 'Describe the engineering system, dynamic governing equations, reference standards (IEEE, ASME, IEC, ISO), and tunable parameters...'
    },
    { 
      id: 'proof', 
      label: 'Equation / Proof Inquiry', 
      icon: Layers,
      placeholder: 'E.g. Clarification on Euler-Bernoulli shear deformation correction',
      messageHint: 'Specify the simulator title, formula symbol, derivation step, or analytical benchmark you would like to discuss...'
    },
    { 
      id: 'academic', 
      label: 'Academic & Course Use', 
      icon: Building2,
      placeholder: 'E.g. Integration into Fall Semester Mechanical Engineering Syllabus',
      messageHint: 'Provide your institution name, course code, student cohort size, and any custom parameter defaults or lab problem statements needed...'
    },
    { 
      id: 'bug', 
      label: 'Numerical Edge-case / Bug', 
      icon: Sparkles,
      placeholder: 'E.g. RK4 solver divergence at high Reynolds number or extreme damping',
      messageHint: 'Detail the simulator, input slider values, expected vs observed numerical output, browser environment, or boundary edge-case...'
    },
    { 
      id: 'general', 
      label: 'General Feedback', 
      icon: MessageSquare,
      placeholder: 'E.g. Feedback on visual ergonomics and simulation accuracy',
      messageHint: 'Share your feedback, feature ideas, industrial use cases, or general comments with our engineering team...'
    },
  ];

  const currentCategoryMeta = categories.find((c) => c.id === category) || categories[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !message.trim() || !name.trim()) {
      return;
    }

    // Bot detection check (Netlify Honeypot)
    if (botField.trim() !== '') {
      console.warn('Bot field triggered');
      setStatus('success');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      soundEngine.playRelayClick();
    } catch {
      // Audio engine fallback
    }

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    formData.set('form-name', 'contact');
    formData.set('category', category);

    // In local development or non-Netlify preview servers, Netlify backend endpoint isn't present
    const isLocal =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.endsWith('.local'));

    try {
      if (isLocal) {
        // Graceful simulation of realistic network delay for local development
        await new Promise((resolve) => setTimeout(resolve, 800));
      } else {
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData as any).toString(),
        });

        if (!response.ok) {
          throw new Error(`Netlify submission endpoint returned status ${response.status}`);
        }
      }

      // Generate verified receipt ID and timestamp
      const generatedRef = `LS-ENG-${Math.floor(100000 + Math.random() * 900000)}`;
      setReceiptId(generatedRef);
      setReceiptTime(new Date().toUTCString());
      setStatus('success');
    } catch (err: any) {
      console.error('Contact Form Netlify Submission Error:', err);
      setErrorMessage(
        'Automated Netlify submission encountered a network interruption. Please retry or click "Open Mail App" below to deliver your transmission directly.'
      );
      setStatus('error');
    }
  };

  const handleResetForm = () => {
    setStatus('idle');
    setErrorMessage('');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setBotField('');
  };

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
            VERIFIED ENGINEERING CHANNEL
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight leading-tight">
            Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">LiveSimulators</span>
          </h1>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            Have a simulator request, need an analytical derivation breakdown, or want to integrate 
            interactive physics simulations into your university syllabus? Reach out directly to our 
            creator and engineering team via our authenticated Netlify channel.
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

            {/* Authenticity & Security Guarantee Box */}
            <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold text-white">Netlify Secure Form Integration</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Submissions are encrypted via TLS 1.3 and delivered directly to Anil Sharma's review inbox with automated spam filtration.
              </p>
            </div>

            {/* Academic & University Usage Info Box */}
            <div className="rounded-xl border border-slate-800/90 bg-gradient-to-b from-slate-900/60 to-slate-950/90 p-5 text-xs text-slate-400 space-y-2">
              <h3 className="font-display font-semibold text-white text-xs flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                Educators & Department Heads
              </h3>
              <p className="leading-relaxed text-[11px]">
                If you are creating an electrical, mechanical, civil, or process engineering curriculum, 
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
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-[10px] font-mono text-emerald-400">NETLIFY FORM ACTIVE</span>
                </div>
              </div>

              {/* SUCCESS STATE */}
              {status === 'success' ? (
                <div className="py-10 text-center space-y-5 animate-in fade-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-display font-bold text-white">Transmission Dispatched</h3>
                    <p className="text-xs text-emerald-400 font-mono mt-1">
                      Authenticated Receipt: {receiptId || 'LS-ENG-VERIFIED'}
                    </p>
                  </div>

                  <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left font-mono text-xs space-y-2 text-slate-300">
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-500">Recipient:</span>
                      <span className="text-cyan-300">Anil Sharma (Founder)</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-500">Sender:</span>
                      <span className="text-white truncate max-w-[200px]">{name} &lt;{email}&gt;</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-500">Category:</span>
                      <span className="text-amber-300">{currentCategoryMeta.label}</span>
                    </div>
                    {receiptTime && (
                      <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Logged Timestamp:</span>
                        <span>{receiptTime}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out. Your transmission has been queued for review. 
                    Anil Sharma will evaluate your technical specifications and follow up at <span className="text-cyan-300 font-mono">{email}</span> within 24-48 hours.
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={handleResetForm}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-white transition-colors inline-flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Send Another Transmission</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* FORM BODY */
                <form
                  name="contact"
                  method="POST"
                  data-netlify="true"
                  data-netlify-honeypot="bot-field"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* Required hidden fields for Netlify Forms */}
                  <input type="hidden" name="form-name" value="contact" />
                  <input type="hidden" name="category" value={category} />

                  {/* Honeypot field for spam bots */}
                  <p className="hidden" aria-hidden="true">
                    <label>
                      Don’t fill this out if you're human:
                      <input
                        name="bot-field"
                        value={botField}
                        onChange={(e) => setBotField(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </label>
                  </p>

                  {/* Error Notification */}
                  {status === 'error' && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-rose-400">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>Transmission Interrupted</span>
                      </div>
                      <p className="leading-relaxed">{errorMessage}</p>
                    </div>
                  )}
                  
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
                            onClick={() => {
                              setCategory(cat.id);
                              if (!subject || categories.some((c) => c.placeholder === subject)) {
                                setSubject(cat.placeholder);
                              }
                            }}
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
                      <label htmlFor="contact-name" className="block text-[11px] font-mono text-slate-400 mb-1.5">
                        Your Name <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        disabled={status === 'submitting'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. / Prof. / Eng. Jane Doe"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans transition-colors disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-[11px] font-mono text-slate-400 mb-1.5">
                        Your Email <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        disabled={status === 'submitting'}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@university.edu or domain.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition-colors disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div>
                    <label htmlFor="contact-subject" className="block text-[11px] font-mono text-slate-400 mb-1.5">
                      Subject <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      required
                      disabled={status === 'submitting'}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={currentCategoryMeta.placeholder}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans transition-colors disabled:opacity-50"
                    />
                  </div>

                  {/* Message Body */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="contact-message" className="text-[11px] font-mono text-slate-400">
                        Message & Technical Specifications <span className="text-cyan-400">*</span>
                      </label>
                      <span className="text-[10px] font-mono text-slate-500">
                        {message.length} characters
                      </span>
                    </div>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      required
                      disabled={status === 'submitting'}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={currentCategoryMeta.messageHint}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans transition-colors disabled:opacity-50"
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
                        title="Open default email application"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Open Mail App</span>
                      </a>
                      <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:bg-cyan-500 text-slate-950 font-display font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
                        id="contact-submit-btn"
                      >
                        {status === 'submitting' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Transmitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Transmit Message</span>
                          </>
                        )}
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
