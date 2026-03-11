import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  AlertCircle, 
  Compass, 
  Shield, 
  Zap, 
  Target, 
  History,
  ChevronRight,
  Info,
  User,
  Sparkles,
  Camera
} from 'lucide-react';
import { generateTimelines, GenerationResult, Trajectory, TimelineData } from './services/geminiService';
import { generateCaricature } from './services/imageService';

const RISK_TOLERANCES = ['Low', 'Moderate', 'High'];
const CORE_VALUES = ['Security', 'Impact', 'Freedom', 'Mastery', 'Legacy'];
const SAVINGS_LEVELS = ['Debt', 'Minimal', 'Moderate', 'Substantial'];
const RELATIONSHIP_STATUSES = ['Single', 'Committed', 'Married', 'Complicated'];
const HEALTH_PRIORITIES = ['Low', 'Moderate', 'High'];
const PERSONALITY_ARCHETYPES = ['Analytical', 'Creative', 'Driven', 'Empathetic', 'Stoic'];
const LOCATIONS = ['Global Hub', 'Quiet Suburb', 'Digital Nomad', 'Rural'];
const AMBITIONS = ['Financial Independence', 'Artistic Legacy', 'World Domination', 'Contentment'];

const MetricCard = ({ label, value, icon: Icon, delay = 0, colorClass = "text-white" }: { label: string, value: string, icon: any, delay?: number, colorClass?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="p-5 glass-card space-y-3 border-l-2 border-white/10 hover:border-white/30 transition-colors"
  >
    <div className="flex items-center space-x-2 opacity-60">
      <Icon size={14} className={colorClass} />
      <span className="text-[10px] uppercase tracking-widest font-mono">{label}</span>
    </div>
    <p className="text-sm md:text-base leading-relaxed font-light">{value}</p>
  </motion.div>
);

const TimelinePath = ({ timelines, selectedYear, onSelectYear }: { timelines: any[], selectedYear: number, onSelectYear: (y: number) => void }) => (
  <div className="relative py-16 px-4 overflow-hidden">
    {/* Branching Line Effect */}
    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-white/5 via-white/40 to-white/5 -translate-x-1/2" />
    
    <div className="space-y-24 relative">
      {timelines.sort((a, b) => a.yearsAhead - b.yearsAhead).map((data, idx) => {
        const year = data.yearsAhead;
        const isSelected = selectedYear === year;
        
        // Cycle through colors
        const colorIndex = idx % 3;
        const glowColors = ['bg-emerald-500/20', 'bg-amber-500/20', 'bg-indigo-500/20'];
        const dotColors = ['bg-emerald-400', 'bg-amber-400', 'bg-indigo-400'];
        const btnColors = [
          isSelected ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]' : 'bg-black/40 border-emerald-500/20 text-emerald-500/40 hover:border-emerald-500/40',
          isSelected ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)]' : 'bg-black/40 border-amber-500/20 text-amber-500/40 hover:border-amber-500/40',
          isSelected ? 'bg-indigo-500 text-black border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.3)]' : 'bg-black/40 border-indigo-500/20 text-indigo-500/40 hover:border-indigo-500/40'
        ];

        return (
          <motion.div 
            key={year}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`flex items-center gap-8 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse text-right'}`}
          >
            <div className={`flex-1 space-y-2 ${idx % 2 === 0 ? 'pr-4' : 'pl-4'}`}>
              <div className="flex items-center gap-2 opacity-60 font-mono text-[10px] uppercase tracking-[0.2em]">
                <div className={`w-1.5 h-1.5 rounded-full ${dotColors[colorIndex]}`} />
                <span>Horizon {year}y</span>
              </div>
              <h4 className={`text-lg md:text-xl font-light tracking-tight transition-all duration-500 ${isSelected ? 'text-white translate-x-1' : 'text-neutral-600'}`}>
                {data?.majorMilestone || 'Milestone Pending'}
              </h4>
              {isSelected && data.funnyDetail && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-[11px] text-amber-400/80 italic font-serif leading-relaxed"
                >
                  "{data.funnyDetail}"
                </motion.p>
              )}
              <div className={`h-px w-8 bg-white/10 ${idx % 2 === 0 ? 'mr-auto' : 'ml-auto'}`} />
            </div>

            <div className="relative shrink-0">
              {isSelected && (
                <motion.div 
                  layoutId="active-glow"
                  className={`absolute inset-0 blur-2xl rounded-full ${glowColors[colorIndex]}`}
                />
              )}
              <button 
                onClick={() => onSelectYear(year)}
                className={`relative z-10 w-12 h-12 rounded-full border transition-all duration-500 flex flex-col items-center justify-center font-mono ${btnColors[colorIndex]}`}
              >
                <span className="text-[10px] font-bold">{year}</span>
                <span className="text-[6px] uppercase tracking-tighter">yr</span>
              </button>
            </div>

            <div className="flex-1" />
          </motion.div>
        );
      })}
    </div>
  </div>
);

export default function App() {
  const [step, setStep] = useState<'input' | 'loading' | 'results'>('input');
  const [formData, setFormData] = useState({
    age: 28,
    profession: '',
    dilemma: '',
    riskTolerance: 'Moderate',
    coreValue: 'Impact',
    brutalHonesty: false,
    savings: 'Minimal',
    relationshipStatus: 'Single',
    healthPriority: 'Moderate',
    personality: 'Analytical',
    location: 'Global Hub',
    ambition: 'Financial Independence',
  });
  const [results, setResults] = useState<GenerationResult | null>(null);
  const [caricature, setCaricature] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedTrajectoryIndex, setSelectedTrajectoryIndex] = useState(0);
  const [selectedYear, setSelectedYear] = useState<number>(2);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    try {
      const data = await generateTimelines(
        formData.age,
        formData.profession,
        formData.dilemma,
        formData.riskTolerance,
        formData.coreValue,
        formData.brutalHonesty,
        formData.savings,
        formData.relationshipStatus,
        formData.healthPriority,
        formData.personality,
        formData.location,
        formData.ambition
      );
      setResults(data);
      setStep('results');
      
      // Generate initial caricature
      if (data.trajectories[0]) {
        setIsGeneratingImage(true);
        const img = await generateCaricature(data.trajectories[0].description);
        setCaricature(img);
        setIsGeneratingImage(false);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate timelines. Please try again.");
      setStep('input');
    }
  };

  const handleTrajectoryChange = async (index: number) => {
    setSelectedTrajectoryIndex(index);
    if (results?.trajectories[index]) {
      setIsGeneratingImage(true);
      setCaricature(null);
      const img = await generateCaricature(results.trajectories[index].description);
      setCaricature(img);
      setIsGeneratingImage(false);
    }
  };

  const currentTrajectory = results?.trajectories[selectedTrajectoryIndex];
  const currentTimeline = currentTrajectory?.timelines.find(t => t.yearsAhead === selectedYear);

  const chartData = useMemo(() => {
    if (!currentTrajectory) return [];
    return currentTrajectory.timelines.map(t => ({
      year: t.yearsAhead,
      p1: results?.trajectories[0].timelines.find(s => s.yearsAhead === t.yearsAhead)?.fulfillmentIndex,
      p2: results?.trajectories[1].timelines.find(s => s.yearsAhead === t.yearsAhead)?.fulfillmentIndex,
      p3: results?.trajectories[2].timelines.find(s => s.yearsAhead === t.yearsAhead)?.fulfillmentIndex,
    }));
  }, [currentTrajectory, results]);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-white selection:text-black overflow-x-hidden">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[150px] rounded-full" />
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-rose-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
      </div>

      <header className="p-8 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <h1 className="text-xs font-mono tracking-[0.3em] uppercase opacity-50">Past Forward // Strategic Dossier</h1>
        </div>
        {step === 'results' && (
          <button 
            onClick={() => setStep('input')}
            className="text-[10px] font-mono uppercase tracking-widest border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-all duration-300"
          >
            Recalibrate Path
          </button>
        )}
      </header>

      <main className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto w-full py-12 space-y-16"
            >
              <div className="space-y-6">
                <h2 className="text-5xl md:text-7xl font-light tracking-tighter leading-tight">
                  Map your <span className="italic">inevitable</span> futures.
                </h2>
                <p className="text-neutral-500 text-lg max-w-xl leading-relaxed">
                  Decisions are not isolated events; they are the initial conditions of a complex feedback loop. Define your parameters to see where the loop ends.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-mono">Current Coordinates / Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="input-field w-full text-2xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-mono">Current Role / Profession</label>
                    <input
                      type="text"
                      name="profession"
                      placeholder="e.g. Senior Architect"
                      value={formData.profession}
                      onChange={handleInputChange}
                      className="input-field w-full text-2xl"
                      required
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-mono">The Strategic Dilemma</label>
                    <textarea
                      name="dilemma"
                      placeholder="What decision is currently paralyzing your progress?"
                      value={formData.dilemma}
                      onChange={handleInputChange}
                      className="input-field w-full text-xl min-h-[120px] resize-none"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-mono">Risk Profile</label>
                    <div className="flex space-x-2 pt-2">
                      {RISK_TOLERANCES.map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setFormData(p => ({ ...p, riskTolerance: r }))}
                          className={`flex-1 py-2 text-xs font-mono border transition-all ${
                            formData.riskTolerance === r 
                              ? 'bg-white text-black border-white' 
                              : 'border-white/10 hover:border-white/40'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-mono">Core Value Alignment</label>
                    <select
                      name="coreValue"
                      value={formData.coreValue}
                      onChange={handleInputChange}
                      className="input-field w-full bg-transparent"
                    >
                      {CORE_VALUES.map(v => <option key={v} value={v} className="bg-black">{v}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-mono">Financial Baseline</label>
                    <select
                      name="savings"
                      value={formData.savings}
                      onChange={handleInputChange}
                      className="input-field w-full bg-transparent"
                    >
                      {SAVINGS_LEVELS.map(v => <option key={v} value={v} className="bg-black">{v}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-mono">Social Status</label>
                    <select
                      name="relationshipStatus"
                      value={formData.relationshipStatus}
                      onChange={handleInputChange}
                      className="input-field w-full bg-transparent"
                    >
                      {RELATIONSHIP_STATUSES.map(v => <option key={v} value={v} className="bg-black">{v}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-mono">Health Priority</label>
                    <select
                      name="healthPriority"
                      value={formData.healthPriority}
                      onChange={handleInputChange}
                      className="input-field w-full bg-transparent"
                    >
                      {HEALTH_PRIORITIES.map(v => <option key={v} value={v} className="bg-black">{v}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-mono">Personality Archetype</label>
                    <select
                      name="personality"
                      value={formData.personality}
                      onChange={handleInputChange}
                      className="input-field w-full bg-transparent"
                    >
                      {PERSONALITY_ARCHETYPES.map(v => <option key={v} value={v} className="bg-black">{v}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-mono">Desired Location</label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="input-field w-full bg-transparent"
                    >
                      {LOCATIONS.map(v => <option key={v} value={v} className="bg-black">{v}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-mono">Primary Ambition</label>
                    <select
                      name="ambition"
                      value={formData.ambition}
                      onChange={handleInputChange}
                      className="input-field w-full bg-transparent"
                    >
                      {AMBITIONS.map(v => <option key={v} value={v} className="bg-black">{v}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-white/5">
                  <label className="flex items-center space-x-4 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="brutalHonesty"
                        checked={formData.brutalHonesty}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className={`w-12 h-6 rounded-full transition-colors ${formData.brutalHonesty ? 'bg-white' : 'bg-neutral-800'}`}></div>
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform ${formData.brutalHonesty ? 'translate-x-6 bg-black' : 'bg-white'}`}></div>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-mono uppercase tracking-wider block">Brutal Honesty Mode</span>
                      <span className="text-[10px] opacity-40 block">Removes optimism bias from the simulation.</span>
                    </div>
                  </label>

                  <button type="submit" className="btn-primary px-12 py-4 text-lg tracking-tight">
                    Initialize Simulation
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-white/10 blur-3xl rounded-full"
                />
                <div className="w-px h-32 bg-gradient-to-b from-transparent via-white/40 to-transparent animate-pulse" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-light tracking-[0.2em] uppercase">Processing Trajectories</h3>
                <div className="flex flex-col space-y-1 opacity-40 font-mono text-[10px] uppercase tracking-widest">
                  <span>Analyzing behavioral patterns...</span>
                  <span>Calculating regret probability...</span>
                  <span>Mapping social feedback loops...</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'results' && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full space-y-12 py-8"
            >
              {/* Top Navigation & Summary */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest opacity-40">
                    <History size={12} />
                    <span>Selected Trajectory</span>
                  </div>
                  <h2 className="text-5xl md:text-6xl font-light tracking-tighter leading-tight">
                    {currentTrajectory?.title}
                  </h2>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="px-2 py-1 bg-white/5 border border-white/10 text-[8px] font-mono uppercase tracking-widest opacity-60">
                      Archetype: {formData.personality}
                    </span>
                    <span className="px-2 py-1 bg-white/5 border border-white/10 text-[8px] font-mono uppercase tracking-widest opacity-60">
                      Ambition: {formData.ambition}
                    </span>
                    <span className="px-2 py-1 bg-white/5 border border-white/10 text-[8px] font-mono uppercase tracking-widest opacity-60">
                      Risk: {formData.riskTolerance}
                    </span>
                  </div>
                  <p className="text-neutral-500 text-lg leading-relaxed italic pt-4">
                    "{currentTrajectory?.description}"
                  </p>
                </div>

                  <div className="flex flex-col space-y-4 w-full lg:w-auto">
                  <div className="flex bg-white/5 p-1 rounded-sm">
                    {results.trajectories.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => handleTrajectoryChange(i)}
                        className={`flex-1 lg:flex-none px-6 py-2 text-[10px] font-mono uppercase tracking-widest transition-all ${
                          selectedTrajectoryIndex === i 
                            ? i === 0 ? 'bg-emerald-500 text-black' : i === 1 ? 'bg-amber-500 text-black' : 'bg-indigo-500 text-black'
                            : 'hover:bg-white/10 opacity-50'
                        }`}
                      >
                        Path 0{i + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline Path Visualization - MOVED UP */}
              <div className="border-y border-white/5 bg-white/[0.02] py-4">
                <div className="px-8 flex items-center space-x-2 text-[10px] font-mono uppercase tracking-widest opacity-40 mb-4">
                  <Sparkles size={12} className="text-amber-400" />
                  <span>Temporal Trajectory Map</span>
                </div>
                <TimelinePath 
                  timelines={currentTrajectory?.timelines || []} 
                  selectedYear={selectedYear} 
                  onSelectYear={setSelectedYear} 
                />
              </div>

              {/* Comparative Analysis Section - MOVED UP */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 px-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-mono uppercase tracking-[0.2em] opacity-40">Comparative Analysis</h3>
                    <p className="text-2xl font-light tracking-tight text-emerald-400">Fulfillment Variance Across All Horizons</p>
                  </div>
                  <div className="flex gap-6">
                    {results.trajectories.map((t, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                        <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">Path 0{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-8 h-[300px] w-full border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis 
                        dataKey="year" 
                        stroke="#ffffff20" 
                        fontSize={10} 
                        tickFormatter={(v) => `Yr ${v}`}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#ffffff20" 
                        fontSize={10} 
                        domain={[0, 10]} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', fontSize: '10px', borderRadius: '8px' }}
                        itemStyle={{ padding: '2px 0' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="p1" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#10b981' }} 
                        activeDot={{ r: 6, strokeWidth: 0 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="p2" 
                        stroke="#f59e0b" 
                        strokeWidth={2} 
                        strokeDasharray="5 5" 
                        dot={{ r: 3, fill: '#f59e0b' }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="p3" 
                        stroke="#6366f1" 
                        strokeWidth={2} 
                        strokeDasharray="3 3" 
                        dot={{ r: 3, fill: '#6366f1' }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Main Bento Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Core Metrics & Caricature */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MetricCard 
                      label="Professional Trajectory" 
                      value={currentTimeline?.career || ''} 
                      icon={Target}
                      delay={0.1}
                      colorClass="text-emerald-400"
                    />
                    <MetricCard 
                      label="Economic Position" 
                      value={currentTimeline?.financial || ''} 
                      icon={Shield}
                      delay={0.2}
                      colorClass="text-amber-400"
                    />
                    <MetricCard 
                      label="Social Infrastructure" 
                      value={currentTimeline?.relationships || ''} 
                      icon={Compass}
                      delay={0.3}
                      colorClass="text-indigo-400"
                    />
                    <MetricCard 
                      label="Physiological State" 
                      value={currentTimeline?.healthStatus || ''} 
                      icon={Zap}
                      delay={0.4}
                      colorClass="text-rose-400"
                    />
                  </div>

                  {/* Future Self Caricature */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card overflow-hidden relative group"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="p-8 space-y-6">
                        <div className="flex items-center space-x-2 opacity-60">
                          <Camera size={14} className="text-violet-400" />
                          <span className="text-[10px] uppercase tracking-widest font-mono">Future Self Visualization</span>
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-3xl font-light tracking-tight">The {selectedYear}-Year Projection</h3>
                          <p className="text-neutral-400 leading-relaxed italic">
                            "A visual representation of your state in Year {selectedYear}, synthesized from behavioral data and environmental factors."
                          </p>
                          <div className="pt-4 flex items-center space-x-4">
                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest">
                              Age: {formData.age + selectedYear}
                            </div>
                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest">
                              Status: {currentTimeline?.fulfillmentIndex && currentTimeline.fulfillmentIndex > 7 ? 'Optimized' : 'Sub-Optimal'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="relative h-80 md:h-auto bg-black/40 flex items-center justify-center border-l border-white/5">
                        {isGeneratingImage ? (
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">Synthesizing Caricature...</span>
                          </div>
                        ) : caricature ? (
                          <motion.img 
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={caricature} 
                            alt="Future Self Caricature" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-center space-y-2 opacity-20">
                            <User size={48} className="mx-auto" />
                            <span className="text-[10px] font-mono uppercase tracking-widest">Image Unavailable</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Why this happened - Large block */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="p-8 glass-card space-y-6 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Info size={120} />
                    </div>
                    <div className="flex items-center space-x-2 opacity-40">
                      <TrendingUp size={14} className="text-cyan-400" />
                      <span className="text-[10px] uppercase tracking-widest font-mono">Causal Analysis</span>
                    </div>
                    <div className="space-y-4 relative z-10">
                      <h4 className="text-2xl font-light tracking-tight">Behavioral Patterns</h4>
                      <p className="text-neutral-400 leading-relaxed text-lg">
                        {currentTimeline?.whyThisHappened}
                      </p>
                    </div>
                  </motion.div>
                </div>

                {/* Right Column: Indices & Trend */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Indices Card */}
                  <div className="p-8 glass-card space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] uppercase tracking-widest font-mono opacity-40">Regret Index</span>
                          <span className="text-2xl font-light">{currentTimeline?.regretIndex}/10</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(currentTimeline?.regretIndex || 0) * 10}%` }}
                            className="h-full bg-white/40"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] uppercase tracking-widest font-mono opacity-40">Fulfillment Index</span>
                          <span className="text-2xl font-light">{currentTimeline?.fulfillmentIndex}/10</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(currentTimeline?.fulfillmentIndex || 0) * 10}%` }}
                            className="h-full bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Trend Chart */}
                    <div className="pt-8 border-t border-white/5 space-y-4">
                      <span className="text-[10px] uppercase tracking-widest font-mono opacity-40 block">20-Year Projection Trend</span>
                      <div className="h-40 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorFul" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                              dataKey="year" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }} 
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                              itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="fulfillment" stroke="#ffffff" fillOpacity={1} fill="url(#colorFul)" />
                            <Area type="monotone" dataKey="regret" stroke="rgba(255,255,255,0.3)" fill="transparent" strokeDasharray="5 5" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center space-x-4 text-[8px] font-mono uppercase tracking-widest opacity-30">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-px bg-white" />
                          <span>Fulfillment</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-px bg-white/30 border-dashed border-t" />
                          <span>Regret</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Immediate Action Card */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="p-8 bg-white text-black space-y-4"
                  >
                    <div className="flex items-center space-x-2 opacity-60">
                      <AlertCircle size={14} />
                      <span className="text-[10px] uppercase tracking-widest font-mono">Strategic Pivot</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-medium tracking-tight">Small decision today that changes this path:</h4>
                      <p className="text-sm leading-relaxed opacity-80">
                        {currentTimeline?.smallDecisionToday}
                      </p>
                    </div>
                    <button className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-[0.2em] pt-4 group">
                      <span>Acknowledge & Adapt</span>
                      <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="p-8 border-t border-white/5 text-center">
        <p className="text-[10px] uppercase tracking-[0.5em] opacity-20">
          Simulation based on behavioral feedback loops // Memento Mori
        </p>
      </footer>
    </div>
  );
}
