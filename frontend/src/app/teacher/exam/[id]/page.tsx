"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { FadeIn, Magnetic } from "@/components/AnimatedComponents";
import { ArrowLeft, RefreshCw, User, Fingerprint, Activity, AlertTriangle, FileText } from "lucide-react";
import { getStatusLabel, isProcessing } from "@/lib/academic";

interface Student {
    identifier: string;
    name: string;
}

interface Submission {
    _id: string;
    studentId: Student;
    examId: string;
    answerSheetUrl: string;
    status: 'submitted' | 'ai_scanning' | 'scanned' | 'ai_evaluating' | 'evaluated' | 'reviewed' | 'ai_transcribing_paper' | 'ai_extracting_text' | 'ai_scoring';
    aiProvider?: string;
    createdAt: string;
    extractedText?: string;
    detailedReasoning?: string;
    aiScore?: number;
    aiConfidence?: number;
    finalScore?: number;
    teacherFeedback?: string;
    aiError?: string;
    aiAttempts?: number;
    mlFeatures?: {
        wordCount: number;
        keywordDensity: number;
        lengthScore: number;
        lexicalDiversity: number;
        complexity: number;
    };
}

const FileViewer = ({ url }: { url: string }) => {
    const isPdf = url.toLowerCase().endsWith('.pdf');
    if (isPdf) {
        return (
            <iframe
                src={url}
                className="w-full h-full bg-white rounded-2xl"
                title="Answer Sheet Viewer"
            />
        );
    }
    return (
        <div className="w-full h-full overflow-auto flex items-start justify-center p-4 bg-corporate-50 rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={url}
                alt="Answer Sheet"
                className="max-w-full h-auto shadow-premium rounded-2xl"
            />
        </div>
    );
};

export default function ExamSubmissions() {
    const router = useRouter();
    const params = useParams();
    const examId = params.id;

    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token || localStorage.getItem("role") !== "teacher") {
            router.push("/login");
            return;
        }

        if (examId) fetchSubmissions(token);
    }, [examId, router]);

    // Polling logic: Only poll if at least one submission is in an AI processing state
    useEffect(() => {
        const hasActiveAI = submissions.some(s => isProcessing(s.status));
        
        if (hasActiveAI) {
            const interval = setInterval(() => {
                fetchSubmissions();
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [submissions]);



    const fetchSubmissions = async (token?: string) => {
        const activeToken = token || localStorage.getItem("token");
        if (!activeToken) return;
        
        try {
            const res = await fetch(`http://localhost:5000/api/submissions/exam/${examId}`, {
                headers: { "Authorization": `Bearer ${activeToken}` },
                signal: AbortSignal.timeout(5000)
            });

            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

            const data = await res.json();
            const newSubmissions = Array.isArray(data) ? data : [];
            setSubmissions(newSubmissions);
        } catch (err) {
            console.warn("Polling: Backend busy or unreachable. Retrying shortly...", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateScore = async (id: string, score: number, feedback: string) => {
        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:5000/api/submissions/${id}/score`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                finalScore: score,
                teacherFeedback: feedback 
            }),
        });

        if (res.ok) {
            setSubmissions(submissions.map(sub =>
                sub._id === id ? { 
                    ...sub, 
                    finalScore: score, 
                    teacherFeedback: feedback,
                    status: 'reviewed' 
                } : sub
            ));
        } else {
            throw new Error("Failed to update score");
        }
    };




    return (
        <main className="min-h-screen bg-corporate-50 pt-24 px-4 sm:px-6 lg:px-8 pb-12 relative overflow-hidden">
            <Navbar />
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/10 rounded-full blur-[140px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/10 rounded-full blur-[140px] -z-10 pointer-events-none" />

            <div className="max-w-6xl mx-auto">
                <FadeIn direction="up">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                        <div>
                            <button
                                onClick={() => router.push("/teacher")}
                                className="flex items-center gap-2 text-corporate-400 hover:text-corporate-950 font-black text-[10px] uppercase tracking-widest transition-colors mb-4 group"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                                Back to Console
                            </button>
                            <h2 className="text-4xl md:text-5xl font-black text-corporate-950 mb-3 tracking-tighter">Evaluation <span className="text-primary-600">Stream</span></h2>
                            <p className="text-lg text-corporate-400 font-medium">Analyze student submissions and verify AI-generated insights.</p>
                        </div>
                        <Magnetic>
                            <button onClick={() => fetchSubmissions()} className="flex items-center gap-2 px-5 py-3 bg-white border border-corporate-100 rounded-2xl text-corporate-950 text-sm font-black shadow-premium hover:bg-corporate-50 transition-all group">
                                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
                                Sync Results
                            </button>
                        </Magnetic>
                    </div>
                </FadeIn>

                {loading ? (
                    <div className="premium-card p-20 text-center">
                        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-corporate-400 font-black text-xs uppercase tracking-widest">Indexing Submissions...</p>
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="premium-card p-20 text-center">
                        <User className="w-16 h-16 mx-auto text-corporate-200 mb-6" />
                        <h3 className="text-2xl font-black text-corporate-950 mb-3 tracking-tighter">Zero Submissions</h3>
                        <p className="text-corporate-400 font-medium">No students have pushed responses to this evaluation stream yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {submissions.map((sub, index) => (
                            <FadeIn key={sub._id} direction="up" delay={0.1 + (index * 0.05)}>
                                <div className="premium-card p-8 flex flex-col md:flex-row gap-8 justify-between items-start md:items-center group">
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className="h-12 w-12 bg-corporate-50 rounded-2xl flex items-center justify-center text-corporate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors font-black text-lg">
                                                {sub.studentId?.name?.charAt(0) || "?"}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-corporate-950 group-hover:text-primary-700 transition-colors tracking-tight">{sub.studentId?.name || "Anonymous Candidate"}</h3>
                                                <div className="flex items-center gap-2 text-corporate-400 font-medium text-xs">
                                                    <Fingerprint className="w-3 h-3" /> {sub.studentId?.identifier || "ID Pending"}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 mt-4 mb-6">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                                                isProcessing(sub.status) ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                                                sub.status === 'evaluated' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                sub.status === 'reviewed' ? 'bg-corporate-950 text-white border-corporate-950' :
                                                'bg-corporate-50 text-corporate-500 border-corporate-100'
                                            }`}>
                                                {getStatusLabel(sub.status)}
                                            </span>
                                        </div>

                                        {!isProcessing(sub.status) && sub.status !== 'submitted' && (
                                            <div className="bg-corporate-50/50 p-6 rounded-3xl border border-corporate-100 relative overflow-hidden group/stats">
                                                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/stats:scale-110 transition-transform">
                                                    <Activity className="w-20 h-20" />
                                                </div>
                                                <div className="flex flex-wrap gap-8">
                                                    <div>
                                                        <span className="text-[10px] text-corporate-400 uppercase font-black tracking-widest block mb-2">ML Rating</span>
                                                        <span className="text-3xl font-black text-primary-700">{sub.aiScore ?? "--"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-corporate-400 uppercase font-black tracking-widest block mb-2">Confidence</span>
                                                        <span className={`text-3xl font-black ${sub.aiConfidence && sub.aiConfidence < 70 ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                            {sub.aiConfidence !== undefined ? `${sub.aiConfidence}%` : "--"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-corporate-400 uppercase font-black tracking-widest block mb-2">Certified</span>
                                                        <span className="text-3xl font-black text-corporate-950">{sub.finalScore !== undefined ? sub.finalScore : "--"}</span>
                                                    </div>
                                                </div>
                                                {sub.aiConfidence !== undefined && sub.aiConfidence < 70 && (
                                                    <div className="mt-4 flex items-center gap-2 text-amber-700 text-[10px] font-black uppercase tracking-widest bg-amber-50 px-3 py-2 rounded-xl border border-amber-100 w-fit">
                                                        <AlertTriangle className="w-3.5 h-3.5" />
                                                        Manual Verification Recommended
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3 min-w-[200px] w-full md:w-auto pt-6 md:pt-0 border-t md:border-0 border-corporate-50">
                                        <Magnetic>
                                            <button
                                                onClick={() => router.push(`/report/${sub._id}`)}
                                                className="w-full bg-primary-700 hover:bg-primary-800 text-white py-4 rounded-2xl font-black transition-all shadow-premium text-sm uppercase tracking-widest"
                                            >
                                                Audit Response
                                            </button>
                                        </Magnetic>
                                        <a
                                            href={sub.answerSheetUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="w-full bg-white hover:bg-corporate-50 text-corporate-950 border border-corporate-100 text-center py-3.5 rounded-2xl font-black transition-all text-[11px] uppercase tracking-[0.2em] shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <FileText className="w-3.5 h-3.5" /> Source Asset
                                        </a>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
