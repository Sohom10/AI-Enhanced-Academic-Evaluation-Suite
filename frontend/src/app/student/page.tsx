"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import SubmissionReport from "@/components/SubmissionReport";
import { FadeIn, Magnetic } from "@/components/AnimatedComponents";
import { Info, ArrowRight, BookOpen, CheckCircle2, CloudUpload, X } from "lucide-react";
import {
    getStatusLabel,
    getScoreColor,
    formatScoreDisplay,
    isProcessing
} from "@/lib/academic";

interface Exam {
    _id: string;
    title: string;
    description: string;
    totalMarks: number | string;
    questionPaperUrl: string;
    status?: 'active' | 'closed';
}

interface Submission {
    _id: string;
    examId: string;
    examTitle: string;
    totalMarks: number | string;
    finalScore?: number;
    aiScore?: number;
    aiConfidence?: number;
    aiFeedback?: string;
    detailedReasoning?: string;
    status: string;
    createdAt: string;
    answerSheetUrl: string;
    examStatus?: 'active' | 'closed';
    mlFeatures?: {
        wordCount: number;
        keywordDensity: number;
        lengthScore: number;
        complexity: number;
    };
}

export default function StudentDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'exams' | 'submissions'>('exams');
    
    // Exams State
    const [exams, setExams] = useState<Exam[]>([]);
    const [loadingExams, setLoadingExams] = useState(true);
    
    // Submissions State
    const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(true);

    // Submission modal state
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "student") {
            router.push("/login");
            return;
        }

        fetchExams(token);
        fetchMySubmissions(token);
    }, [router]);

    // Polling logic: Only poll if any submission is in a 'processing' state
    useEffect(() => {
        const hasProcessing = mySubmissions.some(s => isProcessing(s.status));

        if (hasProcessing) {
            const token = localStorage.getItem("token") || "";
            const interval = setInterval(() => {
                fetchMySubmissions(token);
            }, 3000); 
            return () => clearInterval(interval);
        }
    }, [mySubmissions]);


    const fetchExams = async (token: string) => {
        try {
            const res = await fetch("http://localhost:5000/api/exams", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            setExams(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching exams", err);
        } finally {
            setLoadingExams(false);
        }
    };

    const fetchMySubmissions = async (token: string) => {
        try {
            const res = await fetch("http://localhost:5000/api/submissions/student/my-submissions", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            setMySubmissions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching submissions", err);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const handleUploadAnswerSheet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !selectedExam) return;

        setIsUploading(true);
        setError("");
        setSuccess("");

        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("examId", selectedExam._id);
        formData.append("answerSheet", file);

        try {
            const res = await fetch("http://localhost:5000/api/submissions", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to submit answer sheet");
            }

            setSuccess("Answer sheet submitted successfully! AI is evaluating it.");
            setFile(null);
            setTimeout(() => {
                setSelectedExam(null);
                fetchMySubmissions(token || "");
                setActiveTab('submissions');
            }, 2000);

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <main className="min-h-screen bg-corporate-50 pt-24 px-4 sm:px-6 lg:px-8 pb-12 relative overflow-hidden">
            <Navbar />
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-100/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

            <div className="max-w-6xl mx-auto space-y-12">
                
                {/* Header & Tabs */}
                <FadeIn direction="up">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-corporate-950 mb-3 tracking-tighter">Student <span className="text-primary-600">Portal</span></h2>
                            <p className="text-lg text-corporate-400 font-medium">Monitor your academic evaluations and upcoming assessments.</p>
                        </div>
                        <div className="flex bg-white p-1.5 rounded-2xl shadow-premium border border-corporate-100">
                            <button 
                                onClick={() => setActiveTab('exams')}
                                className={`px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'exams' ? 'bg-primary-700 text-white shadow-premium' : 'text-corporate-400 hover:text-corporate-900'}`}
                            >
                                Available Exams
                            </button>
                            <button 
                                onClick={() => setActiveTab('submissions')}
                                className={`px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'submissions' ? 'bg-primary-700 text-white shadow-premium' : 'text-corporate-400 hover:text-corporate-900'}`}
                            >
                                Evaluation History
                            </button>
                        </div>
                    </div>
                </FadeIn>

                {activeTab === 'exams' && (
                    <FadeIn direction="up" delay={0.2}>
                        {loadingExams ? (
                            <div className="text-corporate-400 font-bold animate-pulse text-center py-20 premium-card">Initializing Exams...</div>
                        ) : exams.filter(e => e.status !== 'closed').length === 0 ? (
                            <div className="premium-card p-20 text-center">
                                <BookOpen className="w-16 h-16 mx-auto text-corporate-200 mb-6" />
                                <h3 className="text-2xl font-black text-corporate-950 mb-3 tracking-tighter">No Active Exams</h3>
                                <p className="text-corporate-400 font-medium">There are no examinations scheduled at this moment. Check back later.</p>
                            </div>
                        ) : (
                            <div className="grid gap-8 md:grid-cols-2">
                                {exams
                                    .filter(exam => exam.status !== 'closed')
                                    .map((exam) => (
                                    <div key={exam._id} className="premium-card p-8 flex flex-col justify-between hover:-translate-y-2 transition-all group">
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="h-12 w-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                                                    <BookOpen className="w-6 h-6" />
                                                </div>
                                                <span className="bg-corporate-50 text-corporate-900 text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-corporate-100">{exam.totalMarks} Marks</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-corporate-950 mb-3 group-hover:text-primary-700 transition-colors tracking-tight">{exam.title}</h3>
                                            <p className="text-corporate-400 font-medium mb-8 leading-relaxed line-clamp-2">{exam.description || "No description provided for this academic evaluation."}</p>

                                            <div className="pt-6 border-t border-corporate-50">
                                                <a
                                                    href={exam.questionPaperUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-primary-700 hover:text-primary-800 text-sm font-black flex items-center gap-2 group/link"
                                                >
                                                    <CloudUpload className="h-4 w-4 group-hover/link:translate-y-[-1px] transition-transform" />
                                                    Reference Materials
                                                </a>
                                            </div>
                                        </div>

                                        <Magnetic>
                                            <button
                                                onClick={() => { setSelectedExam(exam); setError(""); setSuccess(""); }}
                                                className="w-full mt-8 py-4 rounded-2xl font-black transition-all bg-primary-700 text-white hover:bg-primary-800 shadow-premium active:scale-95"
                                            >
                                                Initiate Assessment
                                            </button>
                                        </Magnetic>
                                    </div>
                                ))}
                            </div>
                        )}
                    </FadeIn>
                )}

                {activeTab === 'submissions' && (
                    <FadeIn direction="up" delay={0.2} className="space-y-8">
                        {loadingSubmissions ? (
                            <div className="text-corporate-400 font-bold animate-pulse text-center py-20 premium-card">Syncing Evaluation History...</div>
                        ) : mySubmissions.filter(s => s.examStatus !== 'closed').length === 0 ? (
                            <div className="premium-card p-20 text-center">
                                <CheckCircle2 className="w-16 h-16 mx-auto text-corporate-200 mb-6" />
                                <h3 className="text-2xl font-black text-corporate-950 mb-3 tracking-tighter">Evaluation Inbox Empty</h3>
                                <p className="text-corporate-400 font-medium">You haven't submitted any answer sheets for active exams yet.</p>
                            </div>
                        ) : (
                            mySubmissions
                                .filter(sub => sub.examStatus !== 'closed')
                                .map((sub) => (
                                <div key={sub._id} className="premium-card p-8 flex flex-col md:flex-row gap-8 justify-between items-start group">
                                    <div className="flex-1 w-full">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-2xl font-black text-corporate-950 mb-2 tracking-tight group-hover:text-primary-700 transition-colors">{sub.examTitle}</h3>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-corporate-400 font-bold text-xs uppercase tracking-widest">{new Date(sub.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                    <div className="w-1 h-1 bg-corporate-200 rounded-full" />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                                                        sub.status === 'reviewed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                        sub.status === 'evaluated' ? 'bg-primary-50 text-primary-700 border-primary-100' :
                                                        isProcessing(sub.status) ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                        'bg-corporate-50 text-corporate-500 border-corporate-100'
                                                    }`}>
                                                        {getStatusLabel(sub.status || 'submitted')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-corporate-50/50 p-8 rounded-[2rem] border border-corporate-100 mt-6 relative overflow-hidden group/insights">
                                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover/insights:scale-110 transition-transform">
                                                <CheckCircle2 className="w-24 h-24" />
                                            </div>
                                            <div className="flex flex-col lg:flex-row gap-10">
                                                <div className="flex-shrink-0">
                                                    <span className="text-[10px] text-corporate-400 uppercase font-black tracking-[0.2em] block mb-3">Certified Grade</span>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-6xl font-black text-corporate-950 tracking-tighter">
                                                            {(sub.status === 'reviewed' || sub.status === 'evaluated') ? (sub.finalScore !== undefined ? sub.finalScore : (sub.aiScore || "--")) : "--"}
                                                        </span>
                                                        <span className="text-2xl font-black text-corporate-300">/ {sub.totalMarks}</span>
                                                    </div>
                                                    
                                                    {isProcessing(sub.status) ? (
                                                        <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl w-fit shadow-sm">
                                                            <div className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></div>
                                                            <span className="text-[10px] text-amber-700 font-black uppercase tracking-widest">Synthesis In Progress</span>
                                                        </div>
                                                    ) : sub.status === 'submitted' || sub.status === 'scanned' ? (
                                                        <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-corporate-50 border border-corporate-100 rounded-xl w-fit shadow-sm">
                                                            <div className="w-2 h-2 rounded-full bg-corporate-400"></div>
                                                            <span className="text-[10px] text-corporate-500 font-black uppercase tracking-widest">Awaiting Manual Audit</span>
                                                        </div>
                                                    ) : sub.aiConfidence !== undefined && (
                                                        <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-white border border-corporate-100 rounded-xl w-fit shadow-sm">
                                                            <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"></div>
                                                            <span className="text-[10px] text-primary-700 font-black uppercase tracking-widest">Confidence: {sub.aiConfidence}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div className="text-lg font-medium text-corporate-800 leading-relaxed italic mb-8 relative">
                                                        <span className="text-4xl text-primary-200 absolute -top-4 -left-4 font-serif opacity-50">&quot;</span>
                                                        {(sub.status === 'reviewed' || sub.status === 'evaluated') ? (sub.aiFeedback ? sub.aiFeedback : "The evaluation phase was completed successfully.") : "The Intelligence Matrix is currently analyzing your submission and extracting semantic insights."}
                                                    </div>
                                                    <button 
                                                        onClick={() => router.push(`/report/${sub._id}`)}
                                                        className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-corporate-100 text-corporate-950 font-black rounded-2xl transition-all shadow-premium hover:bg-corporate-50 group/btn"
                                                    >
                                                        <Info className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                                                        {sub.status === 'evaluated' || sub.status === 'reviewed' ? "Full Dimensional Analysis" : "Inspect Evaluation Evidence"}
                                                        <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </FadeIn>
                )}
            </div>

            {/* Submission Modal */}
            {selectedExam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-corporate-950/40 backdrop-blur-md">
                    <FadeIn direction="up" scale={0.9} className="w-full max-w-xl">
                        <div className="premium-card p-10 bg-white relative shadow-2xl">
                            <button
                                onClick={() => setSelectedExam(null)}
                                className="absolute top-6 right-6 text-corporate-300 hover:text-corporate-950 bg-corporate-50 p-3 rounded-2xl transition-all hover:rotate-90"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <h3 className="text-3xl font-black text-corporate-950 mb-3 tracking-tighter">Submit <span className="text-primary-600">Response</span></h3>
                            <p className="text-corporate-400 font-medium text-lg mb-8 leading-relaxed">Securely upload your finalized response for <strong className="text-corporate-900 font-black">{selectedExam.title}</strong></p>

                            {error && <div className="mb-6 bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl text-sm font-bold animate-in slide-in-from-top-1">{error}</div>}
                            {success && <div className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-700 px-6 py-4 rounded-2xl text-sm font-bold animate-in slide-in-from-top-1">{success}</div>}

                            <form onSubmit={handleUploadAnswerSheet}>
                                <div className="border-[3px] border-dashed border-corporate-100 hover:border-primary-500 bg-corporate-50/50 rounded-3xl p-12 text-center transition-all group/upload cursor-pointer relative">
                                    <input
                                        type="file"
                                        required
                                        accept="image/*,.pdf"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        id="file-upload"
                                    />
                                    <div className="flex flex-col items-center">
                                        <div className="h-20 w-20 bg-white rounded-2.5xl flex items-center justify-center mb-6 shadow-premium group-hover/upload:scale-110 transition-transform duration-500">
                                            <CloudUpload className="h-10 w-10 text-primary-600" />
                                        </div>
                                        <span className="text-xl font-black text-corporate-950 mb-2">{file ? file.name : "Select Asset"}</span>
                                        <span className="text-corporate-400 font-medium">Standard High Fidelity Scans Supported</span>
                                    </div>
                                </div>

                                <Magnetic>
                                    <button
                                        disabled={isUploading || !file}
                                        type="submit"
                                        className="w-full mt-10 bg-primary-700 hover:bg-primary-800 disabled:bg-corporate-50 disabled:text-corporate-300 text-white font-black py-5 rounded-2.5xl transition-all shadow-premium active:scale-95 text-lg"
                                    >
                                        {isUploading ? "Verifying Stream..." : "Finalize Submission"}
                                    </button>
                                </Magnetic>
                            </form>
                        </div>
                    </FadeIn>
                </div>
            )}
        </main>
    );
}
