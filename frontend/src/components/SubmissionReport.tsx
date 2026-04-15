"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    ResponsiveContainer, 
    RadarChart, 
    PolarGrid, 
    PolarAngleAxis, 
    PolarRadiusAxis, 
    Radar, 
    RadialBarChart, 
    RadialBar 
} from "recharts";
import { 
    X, 
    Zap, 
    Target, 
    BookOpen, 
    Award, 
    ArrowRight, 
    CheckCircle2, 
    Brain,
    Info,
    ShieldCheck,
    ScrollText,
    FileSearch,
    BarChart2,
    RefreshCw,
    ClipboardCheck,
    Activity,
    Lock
} from "lucide-react";
import { Magnetic, FadeIn } from "./AnimatedComponents";
import { 
    getStatusLabel, 
    getScoreColor, 
    calculateLinguisticMetrics, 
    formatScoreDisplay,
    isProcessing,
    ENGINE_VERSION,
    SECURITY_STANDARD
} from "@/lib/academic";

interface MLFeatures {
    wordCount: number;
    keywordDensity: number;
    lengthScore: number;
    lexicalDiversity: number;
    complexity: number;
}

interface Submission {
    _id: string;
    studentId: { name: string; identifier: string };
    examId: string;
    answerSheetUrl: string;
    status: string;
    createdAt: string;
    extractedText?: string;
    detailedReasoning?: string;
    aiScore?: number;
    aiConfidence?: number;
    aiFeedback?: string;
    finalScore?: number;
    teacherFeedback?: string;
    mlFeatures?: MLFeatures;
    aiAttempts?: number;
    totalMarks?: number;
}

interface SubmissionReportProps {
    isOpen: boolean;
    onClose: () => void;
    submission: Submission;
    examTitle: string;
    role: 'student' | 'teacher';
    isStandalone?: boolean;
    onUpdateScore?: (score: number, feedback: string) => Promise<void>;
    onReEvaluate?: () => Promise<void>;
}

const FileViewer = ({ url }: { url: string }) => {
    const isPdf = url.toLowerCase().endsWith('.pdf');
    if (isPdf) {
        return (
            <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-inner">
                <iframe src={url} className="w-full h-full border-none" title="Source Evidence" />
            </div>
        );
    }
    return (
        <div className="w-full h-full overflow-auto flex items-start justify-center p-4 bg-corporate-50 rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Answer Sheet" className="max-w-full h-auto shadow-premium rounded-2xl" />
        </div>
    );
};

export default function SubmissionReport({ isOpen, onClose, submission, examTitle, role, isStandalone = false, onUpdateScore, onReEvaluate }: SubmissionReportProps) {
    const isCurrentlyProcessing = isProcessing(submission.status);

    const [activeTab, setActiveTab] = useState<'analytics' | 'intelligence' | 'assets' | 'certification'>(
        isCurrentlyProcessing ? 'assets' : 'analytics'
    );
    const [manualScore, setManualScore] = useState(submission.finalScore?.toString() || submission.aiScore?.toString() || "0");
    const [manualFeedback, setManualFeedback] = useState<string>(submission.teacherFeedback ?? "");
    const [isUpdating, setIsUpdating] = useState(false);
    const [isReEvaluating, setIsReEvaluating] = useState(false);
    const [reEvalStage, setReEvalStage] = useState(0);

    const [hasAttemptedAutoPivot, setHasAttemptedAutoPivot] = useState(false);

    // Auto-Pivot: Switch to analytics tab ONCE when processing finishes
    useEffect(() => {
        if (!isCurrentlyProcessing && !hasAttemptedAutoPivot && activeTab === 'assets') {
            setHasAttemptedAutoPivot(true);
            setActiveTab('analytics');
        }
        // If it starts processing again (re-evaluate), reset the pivot flag
        if (isCurrentlyProcessing && hasAttemptedAutoPivot) {
            setHasAttemptedAutoPivot(false);
        }
    }, [isCurrentlyProcessing, hasAttemptedAutoPivot, activeTab]);

    const reEvalStages = [
        { label: 'Initializing Pipeline', sub: 'Preparing AI evaluation engine...' },
        { label: 'Transcribing Document', sub: 'OCR scanning answer sheet...' },
        { label: 'Extracting Semantics', sub: 'Identifying key concepts and structure...' },
        { label: 'Scoring Response', sub: 'Comparing against marking criteria...' },
        { label: 'Finalizing Results', sub: 'Persisting evaluation to database...' },
    ];

    const handleReEvaluateWithFeedback = async () => {
        if (!onReEvaluate) return;
        setIsReEvaluating(true);
        setReEvalStage(0);
        try {
            await onReEvaluate();
            // Simulate stage advancement while process runs in background
            for (let i = 1; i < reEvalStages.length; i++) {
                await new Promise(res => setTimeout(res, 2200));
                setReEvalStage(i);
            }
            await new Promise(res => setTimeout(res, 1500));
        } finally {
            setIsReEvaluating(false);
            setReEvalStage(0);
        }
    };

    // Linguistic Audit Engine initialization
    const localMetrics = calculateLinguisticMetrics(submission.extractedText || "", submission.mlFeatures);

    if (!isOpen) return null;

    const percentage = Math.round(((submission.finalScore ?? submission.aiScore ?? 0) / (submission.totalMarks || 25)) * 100);
    
    const getMetric = (val?: number, fallbackWeight = 1) => {
        if (val && val > 0) return Math.min(Math.round(val * 100), 100);
        return Math.min(Math.round(percentage * fallbackWeight * 0.8), 100);
    };

    const radarData = [
        { subject: 'Knowledge', A: getMetric(localMetrics.keywordDensity, 1.1), fullMark: 100 },
        { subject: 'Depth', A: getMetric(localMetrics.lengthScore, 0.9), fullMark: 100 },
        { subject: 'Structure', A: getMetric(localMetrics.complexity ? localMetrics.complexity / 10 : undefined, 1.0), fullMark: 100 },
        { subject: 'Confidence', A: submission.aiConfidence || getMetric(undefined, 0.95), fullMark: 100 },
        { subject: 'Core Terms', A: getMetric(localMetrics.keywordDensity, 1.05), fullMark: 100 },
    ];

    const gaugeData = [{ name: 'Score', value: percentage, fill: '#1d4ed8' }];

    const handleFinalize = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onUpdateScore) return;
        setIsUpdating(true);
        try {
            await onUpdateScore(Number(manualScore), manualFeedback);
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setIsUpdating(false);
        }
    };

    const tabs = [
        { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
        { id: 'intelligence', label: 'Intelligence', icon: <Brain className="w-4 h-4" /> },
        { id: 'assets', label: 'Evidence', icon: <FileSearch className="w-4 h-4" /> },
    ];

    if (role === 'teacher') {
        tabs.push({ id: 'certification', label: 'Certification', icon: <ShieldCheck className="w-4 h-4" /> });
    }

    const Container = isStandalone ? motion.div : (props: any) => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-corporate-950/40 backdrop-blur-md"
            />
            {props.children}
        </div>
    );

    return (
        <AnimatePresence>
            <Container>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={`relative w-full ${isStandalone ? 'min-h-screen' : 'max-w-6xl h-[92vh] shadow-premium-hover border border-corporate-100 rounded-[2.5rem]'} bg-white overflow-hidden flex flex-col font-sans`}
                >
                    {/* Header Workspace */}
                    <div className="bg-corporate-50/50 border-b border-corporate-100 p-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-primary-700 text-white rounded-2.5xl flex items-center justify-center shadow-premium">
                                <Award className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-corporate-950 tracking-tighter leading-none mb-1">
                                    {examTitle} <span className="text-primary-600">Workspace</span>
                                </h2>
                                <p className="text-corporate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                                    {submission.studentId.name} • {submission.studentId.identifier}
                                </p>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex bg-white p-1.5 rounded-2xl border border-corporate-100 shadow-sm">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                        activeTab === tab.id 
                                        ? 'bg-corporate-950 text-white shadow-lg' 
                                        : 'text-corporate-400 hover:text-corporate-950 hover:bg-corporate-50'
                                    }`}
                                >
                                    {tab.icon}
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <button 
                            onClick={onClose} 
                            disabled={isReEvaluating}
                            className={`flex items-center gap-2 ${isStandalone ? 'px-6 py-3 bg-corporate-950 text-white hover:bg-corporate-800' : 'p-3 bg-white border border-corporate-100 hover:bg-corporate-100 text-corporate-400 hover:text-corporate-950'} rounded-2xl transition-all shadow-sm font-black text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isStandalone ? (
                                <>
                                    <ArrowRight className="w-4 h-4 rotate-180" />
                                    Exit Workspace
                                </>
                            ) : (
                                <X className="w-6 h-6" />
                            )}
                        </button>

                        {isCurrentlyProcessing && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100 shadow-sm">
                                <Activity className="w-4 h-4 text-amber-600 animate-pulse" />
                                <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Intelligence Matrix Syncing...</span>
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="h-full min-h-[400px]"
                            >
                                {activeTab === 'analytics' && isCurrentlyProcessing && (
                                    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                                        <div className="w-20 h-20 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4" />
                                        <h3 className="text-2xl font-black text-corporate-950 tracking-tighter">Synthesizing Analytics Matrix...</h3>
                                        <p className="text-corporate-400 font-medium max-w-sm">Our AI engine is currently extracting dimensional features and keyword densities from your submission.</p>
                                    </div>
                                )}

                                {activeTab === 'analytics' && !isCurrentlyProcessing && (
                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                            {/* Score Visual */}
                                            <div className="bg-corporate-50/30 border border-corporate-100 rounded-[2rem] p-8 flex flex-col items-center justify-center relative">
                                                <div className="h-64 w-64 relative">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RadialBarChart cx="50%" cy="50%" innerRadius="80%" outerRadius="100%" barSize={20} data={[{ value: 100 }]} startAngle={90} endAngle={450}>
                                                            <RadialBar background dataKey="value" fill="#f1f5f9" />
                                                        </RadialBarChart>
                                                    </ResponsiveContainer>
                                                    <div className="absolute inset-0">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <RadialBarChart cx="50%" cy="50%" innerRadius="80%" outerRadius="100%" barSize={20} data={gaugeData} startAngle={90} endAngle={90 + (360 * (percentage / 100))}>
                                                                <RadialBar dataKey="value" cornerRadius={12} fill="#1d4ed8" />
                                                            </RadialBarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className="text-7xl font-black text-corporate-950 tracking-tighter">{percentage}%</span>
                                                        <span className="text-corporate-400 font-black uppercase tracking-widest text-[10px]">Result Achievement</span>
                                                    </div>
                                                </div>
                                                <div className="mt-8 text-center">
                                                    <div className="text-[200px] font-black leading-none tracking-tighter text-corporate-900 flex items-baseline">
                                                        {submission.finalScore ?? submission.aiScore ?? 0}
                                                        <span className="text-4xl text-corporate-300 ml-4">/ {submission.totalMarks || 25}</span>
                                                    </div>
                                                    <p className="text-corporate-400 font-semibold italic">Cumulative Precision Score</p>
                                                </div>
                                            </div>

                                            {/* Dimensional Analysis */}
                                            <div className="bg-white border border-corporate-100 rounded-[2rem] p-8 lg:col-span-2 shadow-premium relative overflow-hidden">
                                                <h3 className="text-corporate-950 font-black uppercase tracking-tighter text-lg mb-6 flex items-center gap-3">
                                                    <Target className="w-5 h-5 text-primary-600" />
                                                    Cognitive Performance Analysis
                                                </h3>
                                                <div className="h-72 w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                            <PolarGrid stroke="#e2e8f0" />
                                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 13, fontWeight: '800' }} />
                                                            <Radar name="Score" dataKey="A" stroke="#1d4ed8" fill="#2563eb" fillOpacity={0.15} strokeWidth={3} />
                                                        </RadarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        {/* ML Metric Cards */}
                                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                                            {[
                                                { label: 'Word Count', value: localMetrics.wordCount || 0, icon: <ScrollText />, color: 'primary' },
                                                { label: 'Keyword Density', value: submission_to_percentage(localMetrics.keywordDensity), icon: <Zap />, color: 'indigo' },
                                                { label: 'Length Score', value: localMetrics.lengthScore?.toFixed(2) || "0.00", icon: <Target />, color: 'amber' },
                                                { label: 'Lexical Div.', value: localMetrics.lexicalDiversity?.toFixed(2) || "0.00", icon: <BookOpen />, color: 'emerald' },
                                                { label: 'Confidence', value: `${submission.aiConfidence || 0}%`, icon: <ShieldCheck />, color: 'rose' },
                                            ].map(({ label, value, icon, color }) => (
                                                <div key={label} className="bg-white border border-corporate-100 rounded-2.5xl p-6 shadow-sm hover:shadow-premium transition-all text-center">
                                                    <div className="w-10 h-10 mx-auto bg-corporate-50 rounded-xl flex items-center justify-center text-corporate-400 mb-4">
                                                        {icon}
                                                    </div>
                                                    <p className="text-[9px] font-black text-corporate-400 uppercase tracking-widest mb-2">{label}</p>
                                                    <p className="text-2xl font-black text-corporate-950">{value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'intelligence' && isCurrentlyProcessing && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-8 animate-pulse">
                                            <div className="h-48 bg-corporate-50 rounded-[2rem] border border-corporate-100" />
                                            <div className="h-48 bg-corporate-50 rounded-[2rem] border border-corporate-100" />
                                        </div>
                                        <div className="bg-corporate-50/50 rounded-[2rem] border border-corporate-100 p-8 flex flex-col items-center justify-center text-center">
                                            <Brain className="w-12 h-12 text-corporate-200 mb-4 animate-bounce" />
                                            <p className="text-corporate-400 font-black uppercase tracking-widest text-xs">Synthesizing AI Insights...</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'intelligence' && !isCurrentlyProcessing && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-8">
                                            <div className="premium-card p-10 bg-primary-50/30 border-primary-100">
                                                <h3 className="text-2xl font-black text-corporate-950 mb-8 flex items-center gap-3 tracking-tighter">
                                                    <Brain className="text-primary-600 w-7 h-7" />
                                                    Expert AI Observations
                                                </h3>
                                                <p className="text-lg font-medium text-corporate-800 leading-relaxed italic border-l-4 border-primary-200 pl-6">
                                                    {submission.aiFeedback || "AI Feedback pending for this submission."}
                                                </p>
                                            </div>

                                            {submission.teacherFeedback && (
                                                <div className="premium-card p-10 bg-emerald-50/30 border-emerald-100">
                                                    <h3 className="text-2xl font-black text-corporate-950 mb-8 flex items-center gap-3 tracking-tighter">
                                                        <Award className="text-emerald-600 w-7 h-7" />
                                                        Faculty Remarks
                                                    </h3>
                                                    <p className="text-lg font-medium text-corporate-800 leading-relaxed italic border-l-4 border-emerald-200 pl-6">
                                                        {submission.teacherFeedback}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-corporate-50/50 rounded-[2rem] border border-corporate-100 p-8">
                                            <h3 className="text-xl font-black text-corporate-950 mb-6 flex items-center gap-2">
                                                <Activity className="w-5 h-5 text-indigo-600" />
                                                Detailed Reasoning Breakdown
                                            </h3>
                                            <div className="text-sm font-medium text-corporate-800 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-corporate-200">
                                                {submission.detailedReasoning || "Step-by-step reasoning details are not available for this session."}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'assets' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-[600px]">
                                        <div className="flex flex-col gap-4 h-full">
                                            <div className="flex items-center justify-between px-2">
                                                <div className="flex items-center gap-2">
                                                    <ScrollText className="w-4 h-4 text-indigo-600" />
                                                    <span className="text-[10px] font-black text-corporate-400 uppercase tracking-widest">OCR Extraction Pane</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 bg-corporate-950/5 border border-corporate-100 rounded-3xl p-8 font-mono text-sm text-corporate-800 whitespace-pre-wrap overflow-y-auto">
                                                {submission.extractedText || "No text could be extracted from the source asset."}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-4 h-full">
                                            <div className="flex items-center gap-2 px-2">
                                                <FileSearch className="w-4 h-4 text-primary-600" />
                                                <span className="text-[10px] font-black text-corporate-400 uppercase tracking-widest">High-Res Source Evidence</span>
                                            </div>
                                            <div className="flex-1 border border-corporate-100 rounded-3xl overflow-hidden shadow-inner">
                                                <FileViewer url={submission.answerSheetUrl} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'certification' && role === 'teacher' && (
                                    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center h-full text-center">
                                        <div className="w-24 h-24 bg-corporate-50 rounded-[2rem] flex items-center justify-center text-corporate-200 mb-8 border border-corporate-100">
                                            <Lock className="w-12 h-12" />
                                        </div>
                                        <h3 className="text-3xl font-black text-corporate-950 mb-4 tracking-tighter">Final Result Certification</h3>
                                        <p className="text-corporate-400 font-medium mb-12">Confirm or override the AI evaluation to publish the final outcome to the candidate workspace.</p>
                                        
                                        <form onSubmit={handleFinalize} className="w-full bg-corporate-950 text-white rounded-[2.5rem] p-10 shadow-premium-hover border border-corporate-800 relative overflow-hidden text-left group">
                                            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
                                                <Award className="w-24 h-24" />
                                            </div>
                                            
                                            <div className="relative z-10 space-y-8">
                                                <div className="grid md:grid-cols-3 gap-8">
                                                    <div className="md:col-span-1">
                                                        <label className="text-[10px] font-black text-corporate-400 uppercase tracking-widest block mb-1.5 ml-1">Certified Grade</label>
                                                        <input
                                                            type="number" required value={manualScore}
                                                            onChange={(e) => setManualScore(e.target.value)}
                                                            className="w-full bg-corporate-900 border border-corporate-700 rounded-2xl px-5 py-4 text-white font-black text-3xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                                                        />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="text-[10px] font-black text-corporate-400 uppercase tracking-widest block mb-1.5 ml-1">Faculty Remarks</label>
                                        <textarea
                                                            value={manualFeedback}
                                                            onChange={(e) => setManualFeedback(e.target.value)}
                                                            className="w-full bg-corporate-900 border border-corporate-700 rounded-2xl px-5 py-4 text-white font-medium text-sm focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all h-[76px] resize-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex flex-col md:flex-row gap-4">
                                                    <button
                                                        onClick={handleFinalize}
                                                        disabled={isUpdating}
                                                        className="flex-1 bg-primary-700 hover:bg-primary-800 disabled:bg-corporate-200 text-white py-5 rounded-2.5xl font-black transition-all shadow-premium flex items-center justify-center gap-3 active:scale-[0.98]"
                                                    >
                                                        <Award className="w-5 h-5" />
                                                        {isUpdating ? "Recording Certification..." : "Certify Evaluation & Release"}
                                                    </button>

                                                    {onReEvaluate && (
                                                        <button
                                                            type="button"
                                                            onClick={handleReEvaluateWithFeedback}
                                                            disabled={isReEvaluating}
                                                            className="px-8 bg-white border border-corporate-100 text-corporate-950 hover:bg-corporate-50 disabled:opacity-50 py-5 rounded-2.5xl font-black transition-all shadow-sm flex items-center justify-center gap-3 active:scale-[0.98]"
                                                        >
                                                            <RefreshCw className={`w-5 h-5 ${isReEvaluating ? 'animate-spin' : ''}`} />
                                                            {isReEvaluating ? 'Processing...' : 'Re-Evaluate Asset'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer Stats */}
                    <div className="px-10 py-5 bg-corporate-50/30 border-t border-corporate-100 flex justify-between items-center text-[10px] font-black text-corporate-400 uppercase tracking-widest">
                        <div className="flex items-center gap-4">
                            <span>Status: {submission.status.replace(/_/g, ' ')}</span>
                            <div className="w-1 h-1 bg-corporate-200 rounded-full" />
                            <span>System Confidence: {submission.aiConfidence}%</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>Engine v3.2</span>
                            <div className="w-1 h-1 bg-corporate-200 rounded-full" />
                            <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Re-Evaluation Progress Overlay */}
                <AnimatePresence>
                    {isReEvaluating && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-corporate-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 rounded-[2.5rem]"
                        >
                            {/* Pulsing AI core */}
                            <div className="relative mb-10">
                                <div className="w-24 h-24 rounded-full bg-primary-700/20 animate-ping absolute inset-0" />
                                <div className="w-24 h-24 rounded-full bg-primary-700/10 animate-ping absolute inset-0 [animation-delay:0.5s]" />
                                <div className="relative w-24 h-24 rounded-full bg-primary-700 flex items-center justify-center shadow-[0_0_60px_rgba(29,78,216,0.5)]">
                                    <Brain className="w-10 h-10 text-white" />
                                </div>
                            </div>

                            {/* Stage title */}
                            <motion.div
                                key={reEvalStage}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center mb-8"
                            >
                                <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mb-2">
                                    Stage {reEvalStage + 1} of {reEvalStages.length}
                                </p>
                                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">
                                    {reEvalStages[reEvalStage].label}
                                </h3>
                                <p className="text-corporate-400 font-medium text-sm">
                                    {reEvalStages[reEvalStage].sub}
                                </p>
                            </motion.div>

                            {/* Progress bar */}
                            <div className="w-full max-w-sm mb-8">
                                <div className="w-full h-1.5 bg-corporate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-primary-500 rounded-full"
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${((reEvalStage + 1) / reEvalStages.length) * 100}%` }}
                                        transition={{ duration: 0.8, ease: 'easeInOut' }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-[10px] font-black text-corporate-500 uppercase tracking-widest">
                                    <span>0%</span>
                                    <span>{Math.round(((reEvalStage + 1) / reEvalStages.length) * 100)}%</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            {/* Step indicator dots */}
                            <div className="flex gap-3 mb-8">
                                {reEvalStages.map((stage, i) => (
                                    <div key={i} className="flex flex-col items-center gap-1.5">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all duration-500 ${
                                            i < reEvalStage ? 'bg-emerald-500 text-white' :
                                            i === reEvalStage ? 'bg-primary-600 text-white ring-2 ring-primary-400 ring-offset-2 ring-offset-corporate-950' :
                                            'bg-corporate-800 text-corporate-500'
                                        }`}>
                                            {i < reEvalStage ? '✓' : i + 1}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-corporate-500 text-[10px] font-black uppercase tracking-[0.25em]">
                                AI engine processing · please wait
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Container>
        </AnimatePresence>
    );
}

function submission_to_percentage(val?: number) {
    if (!val) return "--";
    return `${(val * 100).toFixed(1)}%`;
}
