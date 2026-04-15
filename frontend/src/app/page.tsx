"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { 
  FadeIn, 
  TiltCard, 
  Magnetic, 
  ScrollReveal 
} from "@/components/AnimatedComponents";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Zap, Target, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-corporate-50 flex flex-col font-sans">
      <Navbar />

      {/* Premium Dot Grid Background */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-corporate-50 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,#000_40%,transparent_100%)]" />

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-32 flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        <FadeIn direction="up" delay={0.2} distance={30}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-semibold mb-8 hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-4 h-4" />
            <span>Redefining Academic Excellence with AI</span>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.4} distance={40}>
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tighter text-corporate-950 mb-8 max-w-5xl leading-[0.9] md:leading-[1.1]">
            Intelligent <span className="gradient-text">Exam Grading</span> Built for the Future
          </h1>
        </FadeIn>

        <FadeIn direction="up" delay={0.6} distance={20}>
          <p className="mt-4 text-xl sm:text-2xl text-corporate-400 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            Upload handwritten exam papers, and let our AI handle the evaluation with precision, speed, and fairness.
          </p>
        </FadeIn>

        <FadeIn direction="up" delay={0.8}>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24">
            <Magnetic>
              <Link
                href="/register?role=teacher"
                className="group relative px-10 py-5 bg-primary-700 hover:bg-primary-800 text-white rounded-full font-bold text-lg transition-all shadow-premium hover:shadow-premium-hover flex items-center gap-3 active:scale-95"
              >
                Launch for Teachers
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Magnetic>
            
            <Magnetic>
              <Link
                href="/login"
                className="px-10 py-5 bg-white hover:bg-corporate-100 text-corporate-950 border border-corporate-100 rounded-full font-bold text-lg transition-all hover:shadow-premium active:scale-95 shadow-premium"
              >
                Sign In
              </Link>
            </Magnetic>
          </div>
        </FadeIn>

        {/* 3D Visual Section */}
        <div className="w-full max-w-5xl mx-auto px-4 perspective-[2000px]">
          <FadeIn direction="up" delay={1.0} distance={100}>
            <TiltCard>
              <div className="relative w-full rounded-3xl border border-white/40 bg-white/20 p-2 md:p-3 shadow-premium backdrop-blur-xl group transform-gpu will-change-transform">
                {/* Glowing ambient light behind the dark card */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-2xl rounded-3xl z-0 transform-gpu" />
                
                <div className="w-full h-[450px] md:h-[500px] rounded-2xl bg-gradient-to-br from-[#0a1128]/98 to-[#040814]/98 flex flex-col md:flex-row items-stretch overflow-hidden relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/10 z-10 transform-gpu">
                  
                  {/* Left Side: 3D Floating Papers */}
                  <div className="flex-1 p-8 flex items-center justify-center relative overflow-hidden flex-col">
                    {/* Background Light Glare */}
                    <motion.div 
                       animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                       transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                       className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-[80px]" 
                    />
                    <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                    
                    {/* The Paper Stack */}
                    <motion.div 
                       animate={{ y: [0, -10, 0] }}
                       transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                       className="relative w-48 h-64 mt-8 [perspective:1000px]"
                    >
                       {/* Back Paper */}
                       <motion.div 
                          animate={{ rotate: [-6, -4, -6], y: [0, -4, 0] }}
                          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -inset-2 bg-white/20 rounded-lg transform backdrop-blur-sm shadow-xl border border-white/10" 
                       />
                       {/* Middle Paper */}
                       <motion.div 
                          animate={{ rotate: [-3, -1, -3], x: [0, 2, 0], y: [0, -2, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                          className="absolute -inset-1 bg-white/40 rounded-lg transform backdrop-blur-sm shadow-xl border border-white/20" 
                       />
                       
                       {/* Top Paper */}
                       <motion.div 
                          animate={{ rotate: [0, 1, 0] }}
                          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                          className="absolute inset-0 bg-gradient-to-b from-white/90 to-white/70 rounded-lg flex flex-col p-5 space-y-3 shadow-2xl overflow-hidden ring-1 ring-white/50 backdrop-blur-md z-10"
                       >
                         {/* Folded corner effect */}
                         <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-transparent via-white/50 to-white shadow-[-2px_2px_4px_rgba(0,0,0,0.1)] rounded-bl-lg z-20" />
                         
                         {/* Laser Scanner */}
                         <motion.div 
                           animate={{ top: ["-10%", "110%", "-10%"] }}
                           transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                           className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_25px_8px_rgba(34,211,238,0.7)] z-20 will-change-transform"
                         >
                            <div className="absolute inset-0 bg-white/50 blur-[2px]" />
                         </motion.div>
                         
                         {/* UI Chip floating on paper */}
                         <motion.div 
                           initial={{ scale: 0, opacity: 0 }}
                           animate={{ scale: 1, opacity: 1, y: [0, -6, 0] }} 
                           transition={{ 
                             scale: { type: "spring", stiffness: 200, damping: 10, delay: 1.5 },
                             y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }
                           }}
                           className="absolute bottom-6 -left-6 z-30 bg-blue-500/80 border border-cyan-300/30 text-white shadow-[0_0_20px_rgba(34,211,238,0.4)] text-[10px] font-black tracking-widest px-4 py-2 rounded-xl backdrop-blur-lg transform-gpu"
                         >
                           CONFIDENCE: 99.4%
                         </motion.div>
                         
                         {/* Content lines simulating handwriting */}
                         <div className="h-2 bg-slate-300/80 rounded w-full mt-2" />
                         <div className="h-2 bg-slate-300/80 rounded w-10/12" />
                         <div className="h-2 bg-slate-300/80 rounded w-11/12 mt-4" />
                         <div className="h-2 bg-slate-300/80 rounded w-4/5" />
                         <div className="h-2 bg-slate-400/80 rounded w-full mt-4" />
                         <div className="h-2 bg-slate-400/80 rounded w-2/3" />
                       </motion.div>
                    </motion.div>
                  </div>

                  {/* Right Side: Data Feed Terminal */}
                  <div className="flex-1 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
                    <div className="relative z-10">
                       <div className="inline-flex items-center gap-2 mb-4">
                         <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_currentColor] animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Live Telemetry</span>
                       </div>
                       <h3 className="text-3xl md:text-5xl font-normal text-white mb-10 tracking-tight" style={{ fontFamily: "ui-sans-serif, system-ui", letterSpacing: "-0.03em" }}>
                         Real-Time<br/>Evaluation
                       </h3>
                       
                       {/* Loading bars with comet trails */}
                       <div className="space-y-8">
                          {[
                            { label: "Optical Layout Parsing", width: "85%", delay: 0 },
                            { label: "Semantic Context Recognition", width: "70%", delay: 0.5 },
                            { label: "Rubric Traversal Alignment", width: "60%", delay: 1 }
                          ].map((stat, i) => (
                            <div key={i} className="flex flex-col gap-3 relative">
                               <div className="flex justify-between text-[9px] uppercase tracking-[0.1em] text-blue-200/70">
                                 <span>{stat.label}</span>
                               </div>
                               <div className="w-full h-1.5 rounded-full bg-slate-800/80 relative">
                                 {/* Infinite Light Sweep Container (clamped to border radius) */}
                                 <div className="absolute inset-0 overflow-hidden rounded-full">
                                   <motion.div
                                      initial={{ left: "-20%" }}
                                      animate={{ left: "120%" }}
                                      transition={{ duration: 2, ease: "linear", repeat: Infinity, delay: stat.delay }}
                                      className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg]"
                                   />
                                 </div>
                                 {/* Progress Bar (Visible overflow for glow) */}
                                 <motion.div 
                                    initial={{ width: "0%" }}
                                    animate={{ width: stat.width }} 
                                    transition={{ duration: 2, ease: "easeOut", delay: stat.delay + 0.5 }} 
                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-white relative shadow-[0_0_10px_rgba(34,211,238,0.5)] transform-gpu will-change-[width]" 
                                 >
                                    {/* Comet Glow Head */}
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-[4px] shadow-[0_0_15px_rgba(255,255,255,1)]" />
                                 </motion.div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </TiltCard>
          </FadeIn>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="section-padding relative bg-white border-y border-corporate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="mb-20 text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-corporate-950 mb-6 tracking-tighter">Engineered for Accuracy</h2>
            <p className="text-xl text-corporate-400 font-medium">State-of-the-art vision and language models working together to automate the complex world of academic evaluation.</p>
          </div>

          <ScrollReveal staggered>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  title: "Automated OCR", 
                  desc: "Instantly digitize handwritten answers using advanced optical character recognition.",
                  icon: <Zap className="w-6 h-6 text-primary-500" />
                },
                { 
                  title: "AI Evaluation", 
                  desc: "Grade student answers fairly against your custom rubrics and answer keys in seconds.",
                  icon: <Target className="w-6 h-6 text-primary-500" />
                },
                { 
                  title: "Manual Override", 
                  desc: "Always stay in control. Review AI scores and adjust them manually before finalizing.",
                  icon: <ShieldCheck className="w-6 h-6 text-primary-500" />
                }
              ].map((feature, i) => (
                <FadeIn key={i} direction="up" delay={i * 0.1}>
                  <div className="premium-card p-10 h-full group hover:-translate-y-4 hover:border-primary-500/20">
                    <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-corporate-950 mb-4 group-hover:text-primary-700 transition-colors">{feature.title}</h3>
                    <p className="text-corporate-400 leading-relaxed font-medium text-lg">{feature.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-corporate-100 bg-corporate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-corporate-950 font-bold text-lg md:text-xl tracking-tighter">AI Enhanced Academic Evaluation Suite<span className="text-primary-600">.</span></div>
          <div className="flex gap-8">
            <Link href="#" className="text-corporate-400 hover:text-corporate-950 transition-colors font-medium">Privacy</Link>
            <Link href="#" className="text-corporate-400 hover:text-corporate-950 transition-colors font-medium">Terms</Link>
            <Link href="#" className="text-corporate-400 hover:text-corporate-950 transition-colors font-medium">Support</Link>
          </div>
          <p className="text-corporate-400 font-medium text-sm md:text-base">© 2026 AI Enhanced Academic Evaluation Suite. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
