// frontend/src/pages/LandingPage.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Zap, Shield, Users, BarChart3, Calendar, Wallet, FileCheck,
  Clock, CheckCircle2, ArrowRight, Star, ChevronDown, Menu, X,
  TrendingUp, Globe, Lock, Award, Sparkles, Briefcase, BookOpen,
  Database, Settings, Bell, FileText, Target, Activity, ChevronRight,
  Play, ArrowUpRight, Layers, GitBranch, GraduationCap, Brain,
  AlertTriangle, Cpu, CircuitBoard, Building, Eye, Search,
  ShieldCheck, UserCheck, Receipt, PieChart, LineChart,
  BadgeCheck, Megaphone, Send, ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassSurface from '../components/ui/GlassSurface';

// ═══════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};

const scalePop = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

const staggerFast = {
  visible: { transition: { staggerChildren: 0.06 } }
};

function Section({ children, className = '', id }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function AnimatedCounter({ target, suffix = '', prefix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, threshold: 0.5 });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const isDecimal = target % 1 !== 0;
    const update = (ts) => {
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress);
      const current = target * eased;
      setCount(isDecimal ? current : Math.floor(current));
      if (progress < 1) requestAnimationFrame(update);
      else setCount(isDecimal ? parseFloat(target.toFixed(1)) : target);
    };
    requestAnimationFrame(update);
  }, [inView, target, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function MagneticButton({ children, className = '', onClick }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleMouse = (e) => {
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: (e.clientX - rect.left - rect.width / 2) * 0.3, y: (e.clientY - rect.top - rect.height / 2) * 0.3 });
  };
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.5 }}
      className="inline-flex"
    >
      <div className={className} onClick={onClick}>{children}</div>
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, title, desc, delay = 0 }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      className="group relative bg-[#080D14] border border-white/[0.07] rounded-xl p-7 overflow-hidden transition-all duration-300 hover:border-[#00C8FF]/20 hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#00C8FF]/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="w-11 h-11 rounded-lg bg-[#00C8FF]/[0.08] border border-[#00C8FF]/[0.15] flex items-center justify-center mb-5 group-hover:bg-[#00C8FF]/[0.12] transition-colors">
          <Icon size={20} className="text-[#00C8FF]" />
        </div>
        <h3 className="font-semibold text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════
// NAVBAR
// ═══════════════════════════════════════════════

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'AI', href: '#ai' },
  { label: 'Roles', href: '#roles' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Pricing', href: '#pricing' },
];

function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? '' : 'bg-transparent'
      }`}
    >
      {scrolled ? (
        <GlassSurface
          width="100%"
          height="64"
          borderRadius={0}
          backgroundOpacity={0.85}
          saturation={1.5}
          distortionScale={-100}
          blur={14}
          className="px-6 md:px-20 flex items-center justify-between border-b border-white/[0.07]"
        >
          <NavbarContent navigate={navigate} setMobileOpen={setMobileOpen} mobileOpen={mobileOpen} />
        </GlassSurface>
      ) : (
        <div className="h-16 px-6 md:px-20 flex items-center justify-between">
          <NavbarContent navigate={navigate} setMobileOpen={setMobileOpen} mobileOpen={mobileOpen} />
        </div>
      )}
      {scrolled ? (
        <GlassSurface
          width="100%"
          height="64"
          borderRadius={0}
          backgroundOpacity={0.85}
          saturation={1.5}
          distortionScale={-100}
          blur={14}
          className="px-6 md:px-20 flex items-center justify-between border-b border-white/[0.07]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C8FF] to-[#7B5FFF] flex items-center justify-center">
              <Zap size={14} className="text-[#020408]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">SparkClub</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} className="text-sm text-white/50 hover:text-white transition-colors tracking-wide">
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="hidden md:block text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
              Log In
            </button>
            <MagneticButton onClick={() => navigate('/login')}>
              <div className="px-5 py-2 bg-[#00C8FF] text-[#020408] text-sm font-bold rounded-lg hover:shadow-[0_8px_30px_rgba(0,200,255,0.35)] transition-shadow">
                Get Started
              </div>
            </MagneticButton>
            <button className="md:hidden text-white/60" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </GlassSurface>
      ) : (
        <div className="h-16 px-6 md:px-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C8FF] to-[#7B5FFF] flex items-center justify-center">
              <Zap size={14} className="text-[#020408]" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">SparkClub</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} className="text-sm text-white/50 hover:text-white transition-colors tracking-wide">
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="hidden md:block text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
              Log In
            </button>
            <MagneticButton onClick={() => navigate('/login')}>
              <div className="px-5 py-2 bg-[#00C8FF] text-[#020408] text-sm font-bold rounded-lg hover:shadow-[0_8px_30px_rgba(0,200,255,0.35)] transition-shadow">
                Get Started
              </div>
            </MagneticButton>
            <button className="md:hidden text-white/60" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-16 left-0 right-0 bg-[#020408]/95 backdrop-blur-xl border-b border-white/[0.07] p-6 md:hidden"
          >
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} className="block py-3 text-sm text-white/50 hover:text-white" onClick={() => setMobileOpen(false)}>
                {link.label}
              </a>
            ))}
            <button onClick={() => { navigate('/login'); setMobileOpen(false); }} className="mt-3 w-full py-3 bg-[#00C8FF] text-[#020408] text-sm font-bold rounded-lg">
              Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

// ═══════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════

function HeroSection() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  return (
    <motion.section
      style={{ y: heroY, opacity: heroOpacity }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
    >
      {/* Background layers */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[80%] bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(0,200,255,0.12)_0%,rgba(123,95,255,0.08)_40%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Floating cards */}
      <motion.div className="absolute top-32 left-[5%] hidden xl:block" animate={{ y: [0, -15, 0], x: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="bg-[#080D14]/80 backdrop-blur-sm border border-white/[0.07] rounded-xl p-4 w-56">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-[#00FF9F]/[0.1] flex items-center justify-center"><TrendingUp size={10} className="text-[#00FF9F]" /></div>
            <span className="text-[10px] text-white/40 tracking-wider uppercase font-mono">Budget</span>
          </div>
          <p className="text-lg font-bold text-white font-mono">₹2,45,000</p>
          <p className="text-[10px] text-[#00FF9F] font-mono">+12.5% this month</p>
        </div>
      </motion.div>

      <motion.div className="absolute top-40 right-[5%] hidden xl:block" animate={{ y: [0, 15, 0], x: [0, 8, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="bg-[#080D14]/80 backdrop-blur-sm border border-white/[0.07] rounded-xl p-4 w-52">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-[#7B5FFF]/[0.1] flex items-center justify-center"><Brain size={10} className="text-[#7B5FFF]" /></div>
            <span className="text-[10px] text-white/40 tracking-wider uppercase font-mono">AI Review</span>
          </div>
          <p className="text-sm font-medium text-white">Anomaly Detected</p>
          <p className="text-[10px] text-[#FFB800] font-mono">Flagged for review</p>
        </div>
      </motion.div>

      <motion.div className="absolute bottom-40 left-[8%] hidden 2xl:block" animate={{ y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="bg-[#080D14]/80 backdrop-blur-sm border border-white/[0.07] rounded-xl p-4 w-48">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-[#00C8FF]/[0.1] flex items-center justify-center"><Users size={10} className="text-[#00C8FF]" /></div>
            <span className="text-[10px] text-white/40 tracking-wider uppercase font-mono">Members</span>
          </div>
          <p className="text-lg font-bold text-white font-mono">12,400</p>
          <p className="text-[10px] text-[#00C8FF] font-mono">Across 320 clubs</p>
        </div>
      </motion.div>

      <motion.div className="absolute bottom-32 right-[8%] hidden 2xl:block" animate={{ y: [0, 20, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="bg-[#080D14]/80 backdrop-blur-sm border border-white/[0.07] rounded-xl p-4 w-52">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md bg-[#00FF9F]/[0.1] flex items-center justify-center"><CheckCircle2 size={10} className="text-[#00FF9F]" /></div>
            <span className="text-[10px] text-white/40 tracking-wider uppercase font-mono">Approval</span>
          </div>
          <p className="text-sm font-medium text-white">₹48,000 Released</p>
          <p className="text-[10px] text-[#00FF9F] font-mono">All stages cleared ✓</p>
        </div>
      </motion.div>

      {/* Center content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00C8FF]/20 bg-[#00C8FF]/[0.05] mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#00FF9F] animate-pulse" />
          <span className="text-[11px] text-[#00C8FF] font-mono tracking-widest uppercase">SPARKCLUB · AI-POWERED GOVERNANCE PLATFORM</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 leading-[0.92]"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          <span className="block text-white">GOVERN.</span>
          <span className="block text-white">FINANCE.</span>
          <span className="block bg-gradient-to-r from-[#00C8FF] via-[#00C8FF] to-[#7B5FFF] bg-clip-text text-transparent">DEVELOP.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          The unified AI command layer for every club, every budget, every decision across your entire institution.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <MagneticButton onClick={() => navigate('/login')}>
            <div className="group flex items-center gap-3 px-8 py-4 bg-[#00C8FF] text-[#020408] font-bold rounded-lg hover:shadow-[0_8px_30px_rgba(0,200,255,0.35)] transition-all duration-300">
              <span>Request Early Access</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </MagneticButton>
          <button className="flex items-center gap-3 px-8 py-4 border border-white/[0.1] rounded-lg text-white/60 hover:text-white hover:border-white/[0.2] transition-all duration-300 group">
            <div className="w-9 h-9 rounded-full bg-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
              <Play size={14} className="ml-0.5" />
            </div>
            <span className="font-medium text-sm">Watch 90-Second Demo</span>
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-sm text-white/30 font-mono"
        >
          Trusted by 40+ institutions · 12,000+ active members · ₹4.2Cr managed
        </motion.p>
      </div>

      {/* Data ticker */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/[0.05] bg-[#020408]/80 backdrop-blur-sm overflow-hidden py-3">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 text-xs font-mono text-white/30 px-4">
              <span className="text-[#00FF9F]">BUDGET APPROVED</span> <span>₹48,000</span> <span className="text-[#00C8FF]">TECH CLUB</span>
              <span className="text-white/10">·</span>
              <span className="text-[#7B5FFF]">AI FLAGGED</span> <span>DUPLICATE EXPENSE</span> <span className="text-[#FFB800]">RESOLVED</span>
              <span className="text-white/10">·</span>
              <span className="text-[#00FF9F]">EVENT REGISTERED</span> <span>340 ATTENDEES</span>
              <span className="text-white/10">·</span>
              <span className="text-[#00C8FF]">MEMBER MILESTONE</span> <span>5-STAR RATING</span>
              <span className="text-white/10">·</span>
              <span className="text-[#00FF9F]">FUNDING RELEASED</span> <span>₹1,20,000</span> <span className="text-[#00C8FF]">CULTURAL COUNCIL</span>
              <span className="text-white/10">·</span>
              <span className="text-[#7B5FFF]">COMPLIANCE CHECK</span> <span>PASSED</span> <span className="text-[#00FF9F]">ALL CLEAR</span>
              <span className="text-white/10">·</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="absolute bottom-16 left-1/2 -translate-x-1/2">
        <ChevronDown size={20} className="text-white/20 animate-bounce" />
      </motion.div>
    </motion.section>
  );
}

// ═══════════════════════════════════════════════
// STATS BAR
// ═══════════════════════════════════════════════

function StatsBar() {
  return (
    <Section className="py-16 px-6 border-y border-white/[0.07] bg-[#080D14]">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px">
        {[
          { value: 40, suffix: '+', label: 'Institutions Onboarded' },
          { value: 320, suffix: '+', label: 'Active Student Clubs' },
          { value: 4.2, prefix: '₹', suffix: 'Cr', label: 'Budgets Managed', decimal: true },
          { value: 98.7, suffix: '%', label: 'Approval Accuracy', decimal: true },
        ].map((stat, i) => (
          <motion.div key={i} variants={fadeUp} className="text-center py-6 md:py-8">
            <p className="text-3xl md:text-5xl font-bold text-white font-mono mb-2">
              {stat.prefix && <span className="text-white/60">{stat.prefix}</span>}
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-xs text-white/40 tracking-wider uppercase">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════
// FEATURE ALPHA — Multi-Club Governance
// ═══════════════════════════════════════════════

function FeatureAlpha() {
  return (
    <Section id="features" className="py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[3fr_2fr] gap-12 lg:gap-20 items-center">
        <div>
          <motion.p variants={fadeUp} className="text-[11px] text-[#00C8FF] font-mono tracking-[0.15em] uppercase mb-4">Multi-Club Governance</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white tracking-tight leading-[1.1] mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
            Every Club.<br />One Command Center.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-white/50 leading-relaxed mb-8 max-w-lg">
            SparkClub gives institutional administrators and student leaders a unified overview of all club activity — budgets, events, members, approvals — across every organization in real time.
          </motion.p>
          <motion.div variants={stagger} className="space-y-4">
            {[
              { icon: Layers, text: 'Multi-club dashboard with drill-down' },
              { icon: Users, text: 'Unified member registry across all clubs' },
              { icon: BarChart3, text: 'Cross-club budget comparisons' },
              { icon: ShieldCheck, text: 'Automated compliance tracking' },
              { icon: LineChart, text: 'Institutional analytics & reporting' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00C8FF]/[0.08] border border-[#00C8FF]/[0.15] flex items-center justify-center flex-shrink-0">
                  <item.icon size={14} className="text-[#00C8FF]" />
                </div>
                <span className="text-sm text-white/60">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div variants={fadeRight} className="relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00C8FF]/[0.08] rounded-full blur-[80px]" />
          <div className="relative bg-[#080D14] border border-white/[0.07] rounded-2xl p-5">
            {/* Mock dashboard */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              <div className="flex-1 h-5 rounded bg-white/[0.03] ml-2" />
            </div>
            <div className="space-y-3">
              {[
                { name: 'Tech Club', budget: '₹2.4L', spent: '68%', status: 'active', color: '#00C8FF' },
                { name: 'Cultural Council', budget: '₹3.8L', spent: '45%', status: 'active', color: '#7B5FFF' },
                { name: 'Sports Federation', budget: '₹1.6L', spent: '82%', status: 'warning', color: '#FFB800' },
                { name: 'Literary Society', budget: '₹90K', spent: '31%', status: 'active', color: '#00FF9F' },
              ].map((club, i) => (
                <div key={i} className="bg-[#0D1520] rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: `${club.color}15`, color: club.color }}>
                    {club.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-white">{club.name}</span>
                      <span className="text-xs font-mono text-white/40">{club.budget}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: club.spent, background: club.color }} />
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    club.status === 'active' ? 'bg-[#00FF9F]/[0.1] text-[#00FF9F]' : 'bg-[#FFB800]/[0.1] text-[#FFB800]'
                  }`}>{club.spent}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════
// FEATURE BETA — AI Finance
// ═══════════════════════════════════════════════

function FeatureBeta() {
  return (
    <Section className="py-24 md:py-32 px-6 bg-gradient-to-b from-transparent via-[#080D14]/50 to-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-[11px] text-[#7B5FFF] font-mono tracking-[0.15em] uppercase mb-4">Intelligent Finance</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white tracking-tight leading-[1.1] mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
            Budgets That<br />Think Ahead.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
            AI-powered expense tracking, anomaly detection, and budget forecasting ensure every rupee is accounted for.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: BarChart3,
              title: 'Smart Budgets',
              desc: 'AI predicts overspend risk 2 weeks before it happens. Category-level forecasts with confidence intervals.',
              color: 'from-[#00C8FF] to-[#00C8FF]/50',
              bgGrad: 'from-[#00C8FF]/5 to-transparent',
            },
            {
              icon: AlertTriangle,
              title: 'Anomaly Detection',
              desc: 'Flags duplicate expenses, unusual patterns, and policy violations in real-time with severity scoring.',
              color: 'from-[#7B5FFF] to-[#7B5FFF]/50',
              bgGrad: 'from-[#7B5FFF]/5 to-transparent',
            },
            {
              icon: GitBranch,
              title: 'Approval Flows',
              desc: 'Multi-stage approval routing with role-aware escalation. Every decision logged in tamper-proof audit trails.',
              color: 'from-[#00FF9F] to-[#00FF9F]/50',
              bgGrad: 'from-[#00FF9F]/5 to-transparent',
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className={`relative bg-[#080D14] border border-white/[0.07] rounded-2xl p-8 overflow-hidden group hover:border-white/[0.12] transition-all duration-300`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGrad} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-6`}>
                  <card.icon size={22} className="text-[#020408]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════
// AI CORE SECTION
// ═══════════════════════════════════════════════

function AICoreSection() {
  return (
    <Section id="ai" className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse_60%_60%_at_center,rgba(123,95,255,0.15)_0%,rgba(0,200,255,0.08)_50%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-[11px] text-[#7B5FFF] font-mono tracking-[0.15em] uppercase mb-4">Artificial Intelligence</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white tracking-tight leading-[1.1] mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
            The Brain Behind<br />Every Decision.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            SparkClub's AI engine processes every transaction, every event request, every member interaction — learning your institution's patterns to deliver proactive intelligence.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#7B5FFF]/[0.08] border border-[#7B5FFF]/[0.2]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#7B5FFF] animate-pulse" />
            <span className="text-[10px] text-[#B49FFF] font-mono tracking-wider uppercase">Powered by Adaptive AI · LIVE</span>
          </motion.div>
        </div>

        {/* AI Orb + Capabilities */}
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-12">
          {/* Orb */}
          <motion.div variants={scalePop} className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0">
            {/* Outer ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-[#00C8FF]/20 border-t-[#00C8FF]/60"
            />
            {/* Inner mesh */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-8 rounded-full border border-[#7B5FFF]/15 border-b-[#7B5FFF]/40"
            />
            {/* Core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00C8FF] to-[#7B5FFF] shadow-[0_0_60px_rgba(0,200,255,0.3)]"
              />
            </div>
            {/* Orbiting nodes */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <motion.div
                key={i}
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 12 + i * 2, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: 'center' }}
              >
                <div
                  className="absolute w-3 h-3 rounded-full bg-[#7B5FFF]/40 border border-[#7B5FFF]/60"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `rotate(${angle}deg) translateX(${140}px)`,
                    transformOrigin: 'center',
                  }}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Capabilities */}
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            {[
              { icon: BarChart3, label: 'Smart Budget Forecasting' },
              { icon: AlertTriangle, label: 'Anomaly Detection' },
              { icon: ShieldCheck, label: 'Policy Compliance AI' },
              { icon: FileText, label: 'Auto-Categorization' },
              { icon: Calendar, label: 'Event Load Prediction' },
              { icon: Users, label: 'Member Sentiment Analysis' },
              { icon: GitBranch, label: 'Approval Route Intelligence' },
              { icon: Brain, label: 'Natural Language Reports' },
            ].map((cap, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#080D14]/60 border border-white/[0.05] hover:border-[#7B5FFF]/20 transition-colors"
              >
                <cap.icon size={14} className="text-[#7B5FFF] flex-shrink-0" />
                <span className="text-xs text-white/60">{cap.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════
// ROLE GOVERNANCE
// ═══════════════════════════════════════════════

function RoleGovernance() {
  const [activeRole, setActiveRole] = useState(0);
  const roles = [
    {
      role: 'Institutional Administrator',
      icon: Building,
      color: 'from-[#7B5FFF] to-[#7B5FFF]/50',
      superpower: 'Oversight without micromanagement',
      desc: 'See all clubs, all budgets, all events from one unified view. Cross-institutional analytics and compliance dashboards.',
      features: ['Multi-club overview', 'Global compliance', 'User management', 'Analytics dashboard'],
    },
    {
      role: 'Club President',
      icon: Target,
      color: 'from-[#00C8FF] to-[#00C8FF]/50',
      superpower: 'Lead with total clarity',
      desc: 'Manage members, track budgets, approve requests, and orchestrate events from a single command center.',
      features: ['Member management', 'Budget tracking', 'Request approvals', 'Event orchestration'],
    },
    {
      role: 'Finance Officer',
      icon: Wallet,
      color: 'from-[#00FF9F] to-[#00FF9F]/50',
      superpower: 'Zero financial surprises',
      desc: 'Real-time budget tracking, AI anomaly alerts, and automated reconciliation across all club finances.',
      features: ['Budget monitoring', 'AI anomaly alerts', 'Transaction ledger', 'Export reports'],
    },
    {
      role: 'Faculty Advisor',
      icon: GraduationCap,
      color: 'from-[#FFB800] to-[#FFB800]/50',
      superpower: 'Guide without the paperwork',
      desc: 'Event approvals, member conduct tracking, and institutional compliance — all streamlined.',
      features: ['Event approvals', 'Conduct tracking', 'Compliance scoring', 'Welfare oversight'],
    },
    {
      role: 'Club Member',
      icon: Users,
      color: 'from-[#FF6B35] to-[#FF6B35]/50',
      superpower: 'Contribute. Earn. Grow.',
      desc: 'Attendance tracking, point system, achievements, and personal development metrics.',
      features: ['Task tracking', 'Attendance', 'Reimbursements', 'Performance score'],
    },
  ];

  return (
    <Section id="roles" className="py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-[11px] text-[#00C8FF] font-mono tracking-[0.15em] uppercase mb-4">Role-Based Governance</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white tracking-tight leading-[1.1] mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
            Five Roles.<br />One System.
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-[1fr_1fr] gap-8 items-start">
          {/* Role tabs */}
          <div className="space-y-2">
            {roles.map((r, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                onClick={() => setActiveRole(i)}
                className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 ${
                  activeRole === i ? 'border-[#00C8FF]/20 bg-[#080D14]' : 'border-white/[0.05] hover:border-white/[0.1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${r.color} flex items-center justify-center flex-shrink-0`}>
                    <r.icon size={16} className="text-[#020408]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-sm">{r.role}</h3>
                    <p className="text-xs text-white/40">{r.superpower}</p>
                  </div>
                  {activeRole === i && <ChevronRight size={16} className="text-[#00C8FF]" />}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Active role detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeRole}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-[#080D14] border border-white/[0.07] rounded-2xl p-8"
            >
              <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${roles[activeRole].color} text-[#020408] mb-6`}>
                {roles[activeRole].superpower}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">{roles[activeRole].role}</h3>
              <p className="text-sm text-white/50 leading-relaxed mb-8">{roles[activeRole].desc}</p>
              <div className="grid grid-cols-2 gap-3">
                {roles[activeRole].features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-[#0D1520] border border-white/[0.05]">
                    <CheckCircle2 size={14} className="text-[#00FF9F] flex-shrink-0" />
                    <span className="text-xs text-white/60">{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════
// WORKFLOW SECTION
// ═══════════════════════════════════════════════

function WorkflowSection() {
  const workflows = [
    { step: 1, title: 'Club Member Submits Request', desc: 'A member submits a budget or reimbursement request with justification and receipts.', icon: FileText },
    { step: 2, title: 'AI Engine Reviews', desc: 'Automatic policy check, anomaly detection, and risk scoring before human review.', icon: Brain },
    { step: 3, title: 'Finance Officer Validates', desc: 'The finance officer reviews flagged items and verifies budget availability.', icon: Wallet },
    { step: 4, title: 'Club President Approves', desc: 'Final sign-off from the club head with full context and AI recommendations.', icon: Target },
    { step: 5, title: 'Funds Released', desc: 'Once all approvals are in place, funds are disbursed and the transaction is recorded.', icon: Zap },
    { step: 6, title: 'Audit Trail Generated', desc: 'Every action is permanently logged in the tamper-proof audit trail for compliance.', icon: Shield },
  ];

  return (
    <Section id="workflow" className="py-24 md:py-32 px-6 bg-gradient-to-b from-transparent via-[#080D14]/50 to-transparent">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-[11px] text-[#00C8FF] font-mono tracking-[0.15em] uppercase mb-4">Approval Engine</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-white tracking-tight leading-[1.1] mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
            From Request<br />to Release.
          </motion.h2>
          <motion.p variants={fadeUp} className="text-lg text-white/50 max-w-lg mx-auto">
            A complete multi-stage approval workflow — fully automated, AI-assisted, and audited.
          </motion.p>
        </div>

        <div className="relative">
          {workflows.map((w, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="relative flex gap-6 mb-8 group"
            >
              {i < workflows.length - 1 && (
                <div className="absolute left-[23px] top-14 bottom-0 w-0.5 bg-gradient-to-b from-[#00C8FF]/30 to-transparent" />
              )}
              <div className="flex-shrink-0 relative z-10">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00C8FF] to-[#7B5FFF] flex items-center justify-center text-[#020408] font-bold text-sm shadow-[0_0_20px_rgba(0,200,255,0.2)]">
                  {w.step}
                </div>
              </div>
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-3 mb-2">
                  <w.icon size={16} className="text-[#00C8FF]" />
                  <h3 className="font-semibold text-white">{w.title}</h3>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">{w.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════
// FEATURE GRID
// ═══════════════════════════════════════════════

function FeatureGrid() {
  const features = [
    { icon: Wallet, title: 'Financial Management', desc: 'Category-based budgets, fiscal year planning, and real-time ledger tracking.' },
    { icon: GitBranch, title: 'Approval Workflows', desc: 'Multi-stage funding approvals with role-aware routing and escalation.' },
    { icon: Receipt, title: 'Reimbursements', desc: 'Submit claims with receipts. Track status from pending through paid.' },
    { icon: Calendar, title: 'Event Management', desc: 'Proposals, RSVPs, task assignments, attendance, and post-event analytics.' },
    { icon: Briefcase, title: 'Sponsorship CRM', desc: 'Pipeline stages from contacted to closed with MoU management.' },
    { icon: GraduationCap, title: 'Student Development', desc: 'Merit tracking, travel grants, certificates, and performance metrics.' },
    { icon: FileCheck, title: 'Task Management', desc: 'Assign tasks, track progress, set deadlines, and manage priorities.' },
    { icon: BarChart3, title: 'Analytics & Reports', desc: 'Recharts visualizations with PDF and Excel export capabilities.' },
    { icon: Shield, title: 'Audit & Compliance', desc: 'Full audit logging, fraud indicators, and policy enforcement.' },
    { icon: BookOpen, title: 'Document Management', desc: 'Upload, version control, MoU archives, and organized bill storage.' },
    { icon: Bell, title: 'Notifications', desc: 'Role-based alerts, deadline reminders, and escalation hierarchies.' },
    { icon: Users, title: 'Role Permissions', desc: 'Granular RBAC — 5 distinct roles with precise access control.' },
  ];

  return (
    <Section className="py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-[11px] text-[#00C8FF] font-mono tracking-[0.15em] uppercase mb-4">Enterprise Features</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Built for real institutions
          </motion.h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} delay={i * 0.05} />
          ))}
        </div>
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════
// TESTIMONIALS
// ═══════════════════════════════════════════════

function Testimonials() {
  const testimonials = [
    { name: 'Dr. Priya Menon', role: 'Dean of Student Affairs, Manipal University', text: 'SparkClub transformed how we govern 47 clubs. What used to take a committee now happens automatically.', avatar: 'PM' },
    { name: 'Rohit Sharma', role: 'Student Finance Head, IIT Bombay', text: 'Our finance team reclaimed 15 hours per week. The AI flags things before we even notice them.', avatar: 'RS' },
    { name: 'Ananya Krishnan', role: 'Club President, BITS Pilani', text: 'For the first time, every club has a real professional experience. Members actually show up and engage.', avatar: 'AK' },
  ];

  return (
    <Section className="py-24 md:py-32 px-6 bg-gradient-to-b from-transparent via-[#080D14]/50 to-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-[11px] text-[#00C8FF] font-mono tracking-[0.15em] uppercase mb-4">Testimonials</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Voices from the field
          </motion.h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i} variants={fadeUp} whileHover={{ y: -4 }} className="bg-[#080D14] border border-white/[0.07] rounded-2xl p-7">
              <div className="flex items-center gap-1 mb-5">
                {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-[#FFB800] fill-[#FFB800]" />)}
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00C8FF] to-[#7B5FFF] flex items-center justify-center text-xs font-bold text-[#020408]">{t.avatar}</div>
                <div>
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.p variants={fadeUp} className="text-center mt-10 text-sm text-white/30 font-mono">
          4.9★ average rating · 92% retention · 3× engagement increase
        </motion.p>
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════════

function Pricing() {
  const navigate = useNavigate();
  return (
    <Section id="pricing" className="py-24 md:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-[11px] text-[#00C8FF] font-mono tracking-[0.15em] uppercase mb-4">Pricing</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
            Simple, transparent pricing
          </motion.h2>
          <motion.p variants={fadeUp} className="text-white/50">Start free. Scale as you grow.</motion.p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Starter', price: 'Free', desc: 'For small clubs getting started with structured management.', features: ['Up to 50 members', '3 budget categories', 'Basic approvals', 'Email support'] },
            { name: 'Institution', price: '₹999', period: '/month', desc: 'For colleges managing multiple clubs with full oversight.', features: ['Unlimited members', 'Unlimited budgets', 'Multi-role dashboards', 'Priority support', 'Analytics & exports'], highlight: true },
            { name: 'Enterprise', price: 'Custom', desc: 'For universities requiring advanced compliance and multi-tenant management.', features: ['Everything in Institution', 'Custom workflows', 'API access', 'Dedicated support', 'On-premise deployment'] },
          ].map((plan, i) => (
            <motion.div key={i} variants={fadeUp} whileHover={{ y: -6 }} className={`relative rounded-2xl border p-7 ${plan.highlight ? 'border-[#00C8FF]/30 bg-[#080D14]' : 'border-white/[0.07] hover:border-white/[0.12]'}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#00C8FF] text-[#020408] text-xs font-bold">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-bold text-white font-mono">{plan.price}</span>
                {plan.period && <span className="text-sm text-white/40">{plan.period}</span>}
              </div>
              <p className="text-sm text-white/40 mb-6">{plan.desc}</p>
              <ul className="space-y-2.5 mb-7">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle2 size={14} className="text-[#00FF9F] flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <MagneticButton onClick={() => navigate('/login')}>
                <div className={`w-full py-3 rounded-lg font-bold text-sm text-center transition-all ${plan.highlight ? 'bg-[#00C8FF] text-[#020408] hover:shadow-[0_8px_30px_rgba(0,200,255,0.35)]' : 'bg-white/[0.05] text-white/60 hover:bg-white/[0.1] hover:text-white'}`}>
                  {plan.price === 'Free' ? 'Start Free' : plan.price === 'Custom' ? 'Contact Sales' : 'Start Trial'}
                </div>
              </MagneticButton>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════
// FAQ
// ═══════════════════════════════════════════════

function FAQ() {
  const [activeFAQ, setActiveFAQ] = useState(null);
  const faqs = [
    { q: 'What is SparkClub?', a: 'SparkClub is a multi-tenant ERP platform for educational institutions to manage student club finances, events, student development, and compliance — all in one unified system.' },
    { q: 'How does multi-club management work?', a: 'Super Admins can manage multiple clubs from a single dashboard. Each club has its own isolated data, users, and budgets while sharing institutional policies.' },
    { q: 'What roles are supported?', a: 'SparkClub supports 5 roles: Institutional Administrator, Club President, Finance Officer, Faculty Advisor, and Club Member — each with purpose-built dashboards.' },
    { q: 'Is AI optional?', a: 'Yes. AI features enhance the platform but are not required. All core functionality — budgets, approvals, events — works without AI. AI adds predictive insights and anomaly detection.' },
    { q: 'Can institutions customize workflows?', a: 'Yes. Institutions can customize approval chains, budget categories, notification rules, and role permissions to fit their specific governance structure.' },
    { q: 'How secure is financial data?', a: 'All financial data is protected with JWT authentication, role-based access control, and tamper-proof audit logging. Data is stored securely with SQL parameterization.' },
  ];

  return (
    <Section className="py-24 md:py-32 px-6 bg-gradient-to-b from-transparent via-[#080D14]/50 to-transparent">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-[11px] text-[#00C8FF] font-mono tracking-[0.15em] uppercase mb-4">FAQ</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            Questions? Answered.
          </motion.h2>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={fadeUp} className="border border-white/[0.07] rounded-xl overflow-hidden">
              <button
                onClick={() => setActiveFAQ(activeFAQ === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-medium text-white pr-4 text-sm">{faq.q}</span>
                <ChevronRight size={16} className={`text-white/30 flex-shrink-0 transition-transform duration-300 ${activeFAQ === i ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence>
                {activeFAQ === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="px-5 pb-5 text-sm text-white/40 leading-relaxed">{faq.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════
// CTA SECTION
// ═══════════════════════════════════════════════

function CTASection() {
  const navigate = useNavigate();
  return (
    <Section className="py-24 md:py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse_60%_60%_at_center,rgba(0,200,255,0.15)_0%,rgba(123,95,255,0.20)_50%,rgba(0,200,255,0.10)_100%)]" />
      </div>
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.p variants={fadeUp} className="text-[11px] text-[#00C8FF] font-mono tracking-[0.15em] uppercase mb-4">Early Access Program</motion.p>
        <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[0.95]" style={{ fontFamily: "'Syne', sans-serif" }}>
          Be First.<br />
          <span className="bg-gradient-to-r from-[#00C8FF] to-[#7B5FFF] bg-clip-text text-transparent">Lead First.</span>
        </motion.h2>
        <motion.p variants={fadeUp} className="text-lg text-white/50 mb-10 max-w-xl mx-auto leading-relaxed">
          SparkClub is expanding to select institutions. Early access partners receive dedicated onboarding, custom configuration, and founding member pricing.
        </motion.p>
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <MagneticButton onClick={() => navigate('/login')}>
            <div className="flex items-center gap-3 px-10 py-4 bg-[#00C8FF] text-[#020408] font-bold rounded-lg hover:shadow-[0_8px_30px_rgba(0,200,255,0.35)] transition-all">
              Request Founding Access <ArrowRight size={18} />
            </div>
          </MagneticButton>
          <button className="px-10 py-4 border border-white/[0.1] rounded-lg text-white/60 hover:text-white hover:border-white/[0.2] transition-all font-medium text-sm">
            Book Demo
          </button>
        </motion.div>
        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-white/30">
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#00FF9F]" /> No credit card required</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#00FF9F]" /> Onboarding in 48 hours</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-[#00FF9F]" /> Cancel or pause anytime</span>
        </motion.div>
      </div>
    </Section>
  );
}

// ═══════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════

function Footer() {
  return (
    <footer className="border-t border-white/[0.07] pt-16 pb-8 px-6 bg-[#020408]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00C8FF] to-[#7B5FFF] flex items-center justify-center"><Zap size={14} className="text-[#020408]" /></div>
              <span className="font-bold text-lg text-white">SparkClub</span>
            </div>
            <p className="text-xs text-white/30 leading-relaxed mb-4">The AI-powered command layer for multi-club governance, finance, and student development.</p>
            <div className="flex items-center gap-2">
              {[GitBranch, Globe, Lock].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-white/[0.03] flex items-center justify-center hover:bg-white/[0.08] transition-colors">
                  <Icon size={14} className="text-white/30" />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
            { title: 'Resources', links: ['Documentation', 'API Reference', 'Guides', 'Community'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-semibold text-white/80 mb-4 text-xs tracking-wider uppercase">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link}><a href="#" className="text-xs text-white/30 hover:text-white/60 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.07] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20">© 2025 SparkClub Technologies. All rights reserved.</p>
          <p className="text-xs text-white/20">Privacy Policy · Terms of Service · Cookie Policy</p>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════
// MAIN LANDING PAGE
// ═══════════════════════════════════════════════

export default function LandingPage() {
  return (
    <div className="bg-[#020408] text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', 'Inter', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #020408; }
        ::-webkit-scrollbar-thumb { background: #1a2332; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #2a3a4e; }
        html { scroll-behavior: smooth; }
      `}</style>

      <Navbar />

      <main>
        <HeroSection />
        <StatsBar />
        <FeatureAlpha />
        <FeatureBeta />
        <AICoreSection />
        <RoleGovernance />
        <WorkflowSection />
        <FeatureGrid />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}