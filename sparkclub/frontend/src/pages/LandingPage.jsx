// frontend/src/pages/LandingPage.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Zap, Shield, Users, BarChart3, Calendar, Wallet, FileCheck,
  Clock, CheckCircle2, ArrowRight, Star, ChevronDown, Menu, X,
  TrendingUp, Globe, Lock, Award, Sparkles, Briefcase, BookOpen,
  Database, Settings, Bell, FileText, Target, Activity, ChevronRight,
  Play, ArrowUpRight, Layers, GitBranch, GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } }
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

function FeatureCard({ icon: Icon, title, desc, color }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
      className="group relative p-6 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.06] to-transparent backdrop-blur-sm overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
        <Icon size={18} className="text-white" />
      </div>
      <h3 className="font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}

function AnimatedCounter({ target, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function MagneticButton({ children, className = '', onClick }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleMouse = (e) => {
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left - rect.width / 2, y: e.clientY - rect.top - rect.height / 2 });
  };
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x * 0.15, y: pos.y * 0.15 }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      className="inline-flex"
      onClick={onClick}
    >
      <div className={className}>{children}</div>
    </motion.div>
  );
}

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Roles', href: '#roles' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '#docs' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeRole, setActiveRole] = useState(0);
  const [activeFAQ, setActiveFAQ] = useState(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    { icon: Wallet, title: 'Financial Governance', desc: 'Category-based budgets, fiscal year planning, and double-entry ledger with real-time tracking.' },
    { icon: ArrowRight, title: 'Approval Workflows', desc: 'Multi-stage funding approvals — student → treasurer → club head → faculty coordinator.' },
    { icon: CheckCircle2, title: 'Reimbursements', desc: 'Submit claims with receipts. Track status from pending through paid with full audit trail.' },
    { icon: Calendar, title: 'Event Management', desc: 'Proposals, RSVPs, task assignments, attendance tracking, and post-event analytics.' },
    { icon: Briefcase, title: 'Sponsorship CRM', desc: 'Pipeline stages from contacted → negotiated → committed → closed with MoU management.' },
    { icon: GraduationCap, title: 'Student Development', desc: 'Merit tracking, travel grants, certificates, performance metrics, and learning modules.' },
    { icon: CheckSquare, title: 'Task Management', desc: 'Assign tasks to team members, track progress, set deadlines, and manage priorities.' },
    { icon: BarChart3, title: 'Analytics & Reports', desc: 'Recharts visualizations with PDF and Excel exports for financial and operational reporting.' },
    { icon: Shield, title: 'Audit & Compliance', desc: 'Full audit logging, fraud indicators, policy enforcement, and SLA monitoring.' },
    { icon: BookOpen, title: 'Document Management', desc: 'Upload, version control, MoU archives, and bill storage with organized categorization.' },
    { icon: Bell, title: 'Notifications', desc: 'Role-based alerts, deadline reminders, and escalation hierarchies for critical actions.' },
    { icon: Users, title: 'Role Permissions', desc: 'Granular RBAC — Super Admin, Faculty, Club Head, Treasurer, and Student Member.' },
  ];

  const roles = [
    {
      role: 'Super Admin', icon: Shield, color: 'from-violet-600 to-purple-600',
      headline: 'Platform-Wide Control',
      desc: 'Multi-tenant management, global analytics, security settings, and bulk operations across all institutions.',
      metrics: ['Multi-Club View', 'Global Audit', 'User Management', 'Analytics Dashboard'],
      tag: 'Platform Administrator'
    },
    {
      role: 'Faculty Coordinator', icon: GraduationCap, color: 'from-blue-600 to-cyan-600',
      headline: 'Institutional Oversight',
      desc: 'Budget approvals, compliance monitoring, event authorization, and student welfare oversight.',
      metrics: ['Approve Budgets', 'Compliance Score', 'Event Authorization', 'Welfare Tracking'],
      tag: 'Institutional Guide'
    },
    {
      role: 'Club Head', icon: Target, color: 'from-orange-600 to-red-600',
      headline: 'Executive Command',
      desc: 'Event proposals, team management, sponsor pipeline, and document archives for governance.',
      metrics: ['Event Proposals', 'Team Management', 'Sponsor Pipeline', 'Document Archive'],
      tag: 'Executive Leader'
    },
    {
      role: 'Treasurer', icon: Wallet, color: 'from-emerald-600 to-teal-600',
      headline: 'Financial Control',
      desc: 'Budget allocations, transaction ledger, funding requests, and PDF/Excel reporting.',
      metrics: ['Budget Allocation', 'Transaction Ledger', 'Funding Requests', 'Export Reports'],
      tag: 'Financial Guardian'
    },
    {
      role: 'Student Member', icon: Users, color: 'from-pink-600 to-rose-600',
      headline: 'Personal Dashboard',
      desc: 'Task tracking, event RSVPs, reimbursement claims, attendance, and performance metrics.',
      metrics: ['Task Tracking', 'Event RSVPs', 'Reimbursements', 'Performance Score'],
      tag: 'Active Contributor'
    },
  ];

  const workflows = [
    { step: 1, title: 'Student Submits Request', desc: 'A student member submits a funding or reimbursement request with justification and receipts.', icon: FileText },
    { step: 2, title: 'Treasurer Reviews', desc: 'The treasurer reviews the claim, verifies receipts, and marks it as under_review.', icon: Wallet },
    { step: 3, title: 'Club Head Approves', desc: 'The club head evaluates the request against available budget and approves or requests revisions.', icon: CheckCircle2 },
    { step: 4, title: 'Faculty Validates', desc: 'The faculty coordinator validates institutional compliance and finalizes the approval.', icon: GraduationCap },
    { step: 5, title: 'Funds Released', desc: 'Once all approvals are in place, funds are released and the transaction is recorded.', icon: Zap },
    { step: 6, title: 'Audit Trail Generated', desc: 'Every action is permanently logged in the tamper-proof audit trail for compliance.', icon: Shield },
  ];

  const featureShowcase = [
    {
      title: 'Financial Governance',
      headline: 'Every Rupee, Accounted For.',
      desc: 'Track income, expenses, and budgets in real-time. Category-based allocations, fiscal year planning, and instant balance views.',
      points: ['Double-entry ledger system', 'Real-time budget tracking', 'Multi-level approvals', 'Auto-generated audit logs'],
      color: 'from-emerald-500 to-teal-600',
      bgGrad: 'from-emerald-500/5 to-teal-600/5',
      metric: { label: 'Budget Accuracy', value: '99.9%' }
    },
    {
      title: 'Event Operations',
      headline: 'Execute Events That Matter.',
      desc: 'From proposal to post-event analytics — manage RSVPs, tasks, attendance, and sponsors all in one place.',
      points: ['Proposal workflow', 'RSVP & attendance tracking', 'Task assignment & deadlines', 'Sponsor integration'],
      color: 'from-blue-500 to-indigo-600',
      bgGrad: 'from-blue-500/5 to-indigo-600/5',
      metric: { label: 'Avg. Event ROI', value: '+40%' }
    },
    {
      title: 'Student Development',
      headline: 'Grow The Next Generation.',
      desc: 'Track merit indicators, travel grants, certificates, and performance metrics for every student member.',
      points: ['Merit tracking dashboard', 'Travel grant system', 'Certificate generation', 'Performance metrics'],
      color: 'from-violet-500 to-purple-600',
      bgGrad: 'from-violet-500/5 to-purple-600/5',
      metric: { label: 'Student Growth', value: '3x' }
    },
    {
      title: 'Institutional Oversight',
      headline: 'Compliance Built In.',
      desc: 'Faculty coordinators and super admins get full visibility with fraud indicators, policy checks, and audit trails.',
      points: ['Fraud detection flags', 'Policy compliance scoring', 'SLA monitoring', 'Tamper-proof audit logs'],
      color: 'from-orange-500 to-red-600',
      bgGrad: 'from-orange-500/5 to-red-600/5',
      metric: { label: 'Compliance Rate', value: '100%' }
    },
  ];

  const testimonials = [
    { name: 'Arjun Sharma', role: 'Club Head, Tech Club', text: 'SparkClub transformed how we handle finances. Budget tracking that used to take days now happens in minutes.', avatar: 'AS' },
    { name: 'Prof. Meera Iyer', role: 'Faculty Coordinator', text: 'Finally, a platform where I can oversee all club activities with full compliance visibility. No more spreadsheet chaos.', avatar: 'MI' },
    { name: 'Priya Patel', role: 'Treasurer, Cultural Club', text: 'The reimbursement workflow is a lifesaver. Students submit claims, I review them, and everything is tracked automatically.', avatar: 'PP' },
    { name: 'Rohan Das', role: 'Student Member', text: 'I can track my tasks, submit reimbursements, and see my performance metrics all in one place. Super intuitive.', avatar: 'RD' },
    { name: 'Dr. Kavita Nair', role: 'Super Admin', text: 'Managing 15+ clubs across departments used to be a nightmare. SparkClub gives me the oversight I need.', avatar: 'KN' },
  ];

  const faqs = [
    { q: 'What is SparkClub?', a: 'SparkClub is a multi-tenant ERP platform for educational institutions to manage student club finances, events, student development, and compliance — all in one unified system.' },
    { q: 'How does multi-club management work?', a: 'Super Admins can manage multiple clubs from a single dashboard. Each club has its own isolated data, users, and budgets while sharing institutional policies.' },
    { q: 'What roles are supported?', a: 'SparkClub supports 5 roles: Super Admin (platform-level), Faculty Coordinator (institutional oversight), Club Head (executive management), Treasurer (financial control), and Student Member (operational participation).' },
    { q: 'Is SparkClub free to use?', a: 'SparkClub is open source and free for educational institutions. We offer a Starter plan (free), Institution plan, and Enterprise plan with advanced features and support.' },
    { q: 'How secure is financial data?', a: 'All financial data is protected with JWT authentication, role-based access control, and tamper-proof audit logging. Data is stored securely with SQL parameterization.' },
    { q: 'Can we customize workflows?', a: 'Yes. Institutions can customize approval chains, budget categories, notification rules, and role permissions to fit their specific governance structure.' },
  ];

  return (
    <div className="bg-[#030712] text-slate-100 overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', system-ui, sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #030712; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #334155; }
        .text-gradient { background: linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .glass { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.06); }
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(3deg); } }
        @keyframes float-reverse { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(20px) rotate(-3deg); } }
        @keyframes pulse-glow { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
        @keyframes drift { 0% { transform: translate(0, 0) scale(1); } 50% { transform: translate(30px, -30px) scale(1.05); } 100% { transform: translate(0, 0) scale(1); } }
        .float { animation: float 6s ease-in-out infinite; }
        .float-reverse { animation: float-reverse 7s ease-in-out infinite; }
        .float-delay { animation: float 8s ease-in-out infinite 2s; }
        .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .drift { animation: drift 15s ease-in-out infinite; }
      `}</style>

      {/* NAVBAR */}
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass' : 'bg-transparent'}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">SparkClub</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="hidden md:flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
              Log In
            </button>
            <MagneticButton onClick={() => navigate('/login')}>
              <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-orange-500/25 transition-shadow">
                Get Started
              </div>
            </MagneticButton>
            <button className="md:hidden text-slate-300" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden glass mx-4 mb-4 rounded-xl p-4">
              {NAV_LINKS.map(link => (
                <a key={link.label} href={link.href} className="block py-2 text-sm text-slate-400 hover:text-slate-100" onClick={() => setMobileOpen(false)}>{link.label}</a>
              ))}
              <button onClick={() => navigate('/login')} className="mt-3 w-full py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-lg">Get Started</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* HERO */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      >
        {/* Animated background mesh */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] drift" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] drift" style={{ animationDelay: '5s' }} />
          <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/8 rounded-full blur-[80px] pulse-glow" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* Floating cards */}
        <motion.div className="absolute top-32 left-[8%] hidden lg:block" animate={{ y: [0, -15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
          <div className="glass rounded-2xl p-4 w-52">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center"><TrendingUp size={12} className="text-emerald-400" /></div>
              <span className="text-xs text-slate-400">Budget</span>
            </div>
            <p className="text-lg font-bold text-slate-100">₹2,45,000</p>
            <p className="text-xs text-emerald-400">+12.5% this month</p>
          </div>
        </motion.div>
        <motion.div className="absolute top-40 right-[8%] hidden lg:block" animate={{ y: [0, 15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
          <div className="glass rounded-2xl p-4 w-48">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center"><Activity size={12} className="text-blue-400" /></div>
              <span className="text-xs text-slate-400">Events</span>
            </div>
            <p className="text-lg font-bold text-slate-100">24 Active</p>
            <p className="text-xs text-blue-400">8 pending approval</p>
          </div>
        </motion.div>
        <motion.div className="absolute bottom-40 left-[5%] hidden xl:block" animate={{ y: [0, -20, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
          <div className="glass rounded-2xl p-4 w-44">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center"><Users size={12} className="text-violet-400" /></div>
              <span className="text-xs text-slate-400">Members</span>
            </div>
            <p className="text-lg font-bold text-slate-100">1,240</p>
            <p className="text-xs text-violet-400">Across 15 clubs</p>
          </div>
        </motion.div>
        <motion.div className="absolute bottom-32 right-[6%] hidden xl:block" animate={{ y: [0, 20, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}>
          <div className="glass rounded-2xl p-4 w-48">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-orange-500/20 flex items-center justify-center"><FileCheck size={12} className="text-orange-400" /></div>
              <span className="text-xs text-slate-400">Reimbursements</span>
            </div>
            <p className="text-lg font-bold text-slate-100">₹48,500</p>
            <p className="text-xs text-orange-400">18 pending review</p>
          </div>
        </motion.div>

        {/* Center content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-400">Now in use at 100+ institutions</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[0.95]"
          >
            <span className="text-gradient">Run Every Club</span>
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Like an Enterprise.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The multi-tenant ERP platform for educational institutions — financial governance, event operations, student development, and institutional oversight, all unified.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton onClick={() => navigate('/login')}>
              <div className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300">
                <span>Get Started Free</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </MagneticButton>
            <button className="flex items-center gap-3 px-8 py-4 glass rounded-xl text-slate-300 hover:text-white hover:border-white/10 transition-all duration-300 group">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                <Play size={14} className="ml-0.5" />
              </div>
              <span className="font-medium text-sm">Watch Demo</span>
            </button>
          </motion.div>

          {/* Dashboard mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent z-10 pointer-events-none" />
            <div className="glass rounded-2xl p-3 max-w-5xl mx-auto border border-white/5">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 mb-3 px-2">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <div className="flex-1 mx-4 h-6 rounded-md bg-white/5" />
              </div>
              {/* Dashboard content */}
              <div className="bg-slate-950 rounded-xl overflow-hidden">
                <div className="flex">
                  {/* Sidebar */}
                  <div className="w-14 bg-slate-900 border-r border-slate-800 py-3 flex flex-col items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center"><Zap size={12} className="text-orange-400" /></div>
                    {[LayoutDashboard, BarChart3, Wallet, Calendar, Users].map((Icon, i) => (
                      <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-orange-500/20' : 'hover:bg-slate-800'}`}>
                        <Icon size={14} className={i === 0 ? 'text-orange-400' : 'text-slate-500'} />
                      </div>
                    ))}
                  </div>
                  {/* Main content */}
                  <div className="flex-1 p-4">
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      {[{ label: 'Total Budget', value: '₹2.45L', color: 'text-emerald-400', sub: '+12%' }, { label: 'Spent', value: '₹1.12L', color: 'text-blue-400', sub: '45%' }, { label: 'Events', value: '24', color: 'text-violet-400', sub: 'Active' }, { label: 'Members', value: '1,240', color: 'text-orange-400', sub: '+50' }].map((stat, i) => (
                        <div key={i} className="bg-slate-900 rounded-xl p-3">
                          <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                          <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                          <p className="text-xs text-slate-600">{stat.sub}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 bg-slate-900 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-slate-400 font-medium">Budget Overview</p>
                          <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400" /><div className="w-2 h-2 rounded-full bg-blue-400" /><div className="w-2 h-2 rounded-full bg-violet-400" /></div>
                        </div>
                        <div className="h-24 flex items-end gap-2">
                          {[65, 80, 45, 90, 70, 85, 55, 95, 60, 75, 88, 50].map((h, i) => (
                            <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: `hsl(${200 + i * 8}, 70%, 50%, 0.4)`, borderTop: `2px solid hsl(${200 + i * 8}, 80%, 60%)` }} />
                          ))}
                        </div>
                      </div>
                      <div className="bg-slate-900 rounded-xl p-3">
                        <p className="text-xs text-slate-400 font-medium mb-3">Recent Transactions</p>
                        {[{ name: 'Catering Service', amount: '₹4,500', status: 'expense' }, { name: 'Sponsor Payment', amount: '₹15,000', status: 'income' }, { name: 'Printing', amount: '₹800', status: 'expense' }].map((t, i) => (
                          <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0">
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${t.status === 'income' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                <ArrowUpRight size={8} className={t.status === 'income' ? 'text-emerald-400' : 'text-red-400'} />
                              </div>
                              <span className="text-xs text-slate-300">{t.name}</span>
                            </div>
                            <span className={`text-xs font-medium ${t.status === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>{t.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="mt-6 flex justify-center">
            <ChevronDown size={20} className="text-slate-600 animate-bounce" />
          </motion.div>
        </div>
      </motion.section>

      {/* TRUST / COUNTERS */}
      <Section className="py-20 px-6 border-t border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm text-slate-500 mb-10 tracking-widest uppercase">Built for modern educational organizations</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[{ value: 100, suffix: '+', label: 'Clubs Managed' }, { value: 10000, suffix: '+', label: 'Students Enabled' }, { value: 50, prefix: '₹', suffix: 'L+', label: 'Funds Governed' }, { value: 500, suffix: '+', label: 'Events Managed' }].map((stat, i) => (
              <motion.div key={i} variants={fadeUp} className="text-center">
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent mb-2">
                  {stat.prefix || ''}<AnimatedCounter target={stat.value} suffix={stat.suffix} />{stat.suffix && !stat.prefix ? stat.suffix : ''}
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* PRODUCT OVERVIEW */}
      <Section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm text-orange-400 tracking-widest uppercase mb-4">Platform Capabilities</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">govern</span>
              {' '}at scale
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 max-w-xl mx-auto">A complete ERP system built for institutional club management with enterprise-grade features.</motion.p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Feature tabs */}
            <div className="space-y-3">
              {featureShowcase.map((f, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  onClick={() => setActiveFeature(i)}
                  className={`cursor-pointer p-5 rounded-xl border transition-all duration-300 ${activeFeature === i ? 'border-white/10 glass' : 'border-white/5 hover:border-white/5 hover:bg-white/[0.02]'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center flex-shrink-0`}>
                      <Sparkles size={16} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-slate-100">{f.title}</h3>
                        {activeFeature === i && <ArrowRight size={16} className="text-slate-400" />}
                      </div>
                      <p className="text-sm text-slate-500">{f.desc}</p>
                    </div>
                  </div>
                  <AnimatePresence>
                    {activeFeature === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                          {f.points.map((p, j) => (
                            <div key={j} className="flex items-center gap-2">
                              <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                              <span className="text-xs text-slate-400">{p}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Showcase card */}
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className={`rounded-2xl border border-white/5 bg-gradient-to-br ${featureShowcase[activeFeature].bgGrad} p-8 relative overflow-hidden`}
            >
              <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${featureShowcase[activeFeature].color} opacity-10 rounded-full blur-[60px]`} />
              <div className="relative">
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${featureShowcase[activeFeature].color} text-white mb-6`}>
                  Live Dashboard
                </div>
                <h3 className="text-2xl font-bold mb-3">{featureShowcase[activeFeature].headline}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">{featureShowcase[activeFeature].desc}</p>
                {/* Metric */}
                <div className="glass rounded-xl p-5 flex items-center gap-4">
                  <div className="text-4xl font-bold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
                    {featureShowcase[activeFeature].metric.value}
                  </div>
                  <div>
                    <p className="text-sm text-slate-300 font-medium">{featureShowcase[activeFeature].metric.label}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp size={12} className="text-emerald-400" />
                      <span className="text-xs text-emerald-400">Strong performance</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ROLES SECTION */}
      <Section id="roles" className="py-24 px-6 bg-gradient-to-b from-transparent via-slate-950/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm text-orange-400 tracking-widest uppercase mb-4">Role-Based Access</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Five dashboards. One platform.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 max-w-xl mx-auto">Each role gets a purpose-built dashboard with exactly the tools they need.</motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {roles.map((r, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                onClick={() => setActiveRole(i)}
                className={`cursor-pointer group relative p-5 rounded-2xl border transition-all duration-300 overflow-hidden ${activeRole === i ? 'border-white/10 glass' : 'border-white/5 hover:border-white/10'}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500`} />
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center mb-4`}>
                  <r.icon size={18} className="text-white" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-1 text-sm">{r.role}</h3>
                <p className="text-xs text-slate-500 mb-3">{r.tag}</p>
                <div className="space-y-1">
                  {r.metrics.map((m, j) => (
                    <div key={j} className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-slate-500" />
                      <span className="text-xs text-slate-400">{m}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* WORKFLOW SCROLL STORY */}
      <Section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm text-orange-400 tracking-widest uppercase mb-4">Workflow Engine</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              From request to release
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400">A complete multi-stage approval workflow — fully automated and audited.</motion.p>
          </div>

          <div className="relative">
            {workflows.map((w, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="relative flex gap-6 mb-8 group"
              >
                {/* Line connector */}
                {i < workflows.length - 1 && (
                  <div className="absolute left-[23px] top-14 bottom-0 w-0.5 bg-gradient-to-b from-orange-500/30 to-transparent" />
                )}
                {/* Step number */}
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-orange-500/20">
                    {w.step}
                  </div>
                </div>
                {/* Content */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <w.icon size={16} className="text-orange-400" />
                    <h3 className="font-semibold text-slate-100">{w.title}</h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{w.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* FEATURE GRID */}
      <Section className="py-24 px-6 bg-gradient-to-b from-transparent via-slate-950/50 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm text-orange-400 tracking-widest uppercase mb-4">Enterprise Features</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight">Built for real institutions</motion.h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} color={['from-orange-500 to-red-600', 'from-blue-500 to-indigo-600', 'from-emerald-500 to-teal-600', 'from-violet-500 to-purple-600'][i % 4]} />
            ))}
          </div>
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm text-orange-400 tracking-widest uppercase mb-4">Testimonials</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight">Trusted by institutions</motion.h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -4 }} className="glass rounded-2xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-xs font-bold text-white">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-medium text-slate-100">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* PRICING */}
      <Section id="pricing" className="py-24 px-6 bg-gradient-to-b from-transparent via-slate-950/50 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm text-orange-400 tracking-widest uppercase mb-4">Pricing</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Simple, transparent pricing</motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400">Start free. Scale as you grow.</motion.p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Starter', price: 'Free', desc: 'For small clubs getting started with structured management.', features: ['Up to 50 members', '3 budget categories', 'Basic approvals', 'Email support'] },
              { name: 'Institution', price: '₹999', period: '/month', desc: 'For colleges managing multiple clubs with full oversight.', features: ['Unlimited members', 'Unlimited budgets', 'Multi-role dashboards', 'Priority support', 'Analytics & exports'], highlight: true },
              { name: 'Enterprise', price: 'Custom', desc: 'For universities requiring advanced compliance and multi-tenant management.', features: ['Everything in Institution', 'Custom workflows', 'API access', 'Dedicated support', 'On-premise deployment'] },
            ].map((plan, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -6 }} className={`relative rounded-2xl border p-6 ${plan.highlight ? 'border-orange-500/30 glass' : 'border-white/5 hover:border-white/10'}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-slate-100 mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-3xl font-bold text-slate-100">{plan.price}</span>
                  {plan.period && <span className="text-sm text-slate-500">{plan.period}</span>}
                </div>
                <p className="text-sm text-slate-400 mb-5">{plan.desc}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <MagneticButton onClick={() => navigate('/login')}>
                  <div className={`w-full py-3 rounded-xl font-medium text-sm text-center transition-all ${plan.highlight ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg hover:shadow-orange-500/20' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                    {plan.price === 'Free' ? 'Start Free' : plan.price === 'Custom' ? 'Contact Sales' : 'Start Trial'}
                  </div>
                </MagneticButton>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm text-orange-400 tracking-widest uppercase mb-4">FAQ</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold tracking-tight">Questions? Answered.</motion.h2>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="border border-white/5 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveFAQ(activeFAQ === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
                >
                  <span className="font-medium text-slate-100 pr-4">{faq.q}</span>
                  <ChevronRight size={16} className={`text-slate-400 flex-shrink-0 transition-transform duration-300 ${activeFAQ === i ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFAQ === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* FINAL CTA */}
      <Section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Transform{' '}
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              Club Management.
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-xl text-slate-400 mb-10">
            From spreadsheets and chaos to structured governance.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <MagneticButton onClick={() => navigate('/login')}>
              <div className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-orange-500/20 transition-all">
                Get Started Free <ArrowRight size={18} />
              </div>
            </MagneticButton>
            <button className="px-10 py-4 glass rounded-xl text-slate-300 hover:text-white transition-colors font-medium">
              Book Demo
            </button>
          </motion.div>
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center"><Zap size={14} className="text-white" /></div>
                <span className="font-bold text-lg">SparkClub</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Multi-tenant ERP for educational institution club management.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { title: 'Resources', links: ['Documentation', 'API Reference', 'Guides', 'Community'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold text-slate-200 mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}><a href="#" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">© 2024 SparkClub. MIT License. Built for educational institutions.</p>
            <div className="flex items-center gap-4">
              {[GitBranch, Globe, Lock].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <Icon size={14} className="text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}