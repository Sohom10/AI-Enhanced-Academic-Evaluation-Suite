"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import SubmissionReport from "@/components/SubmissionReport";
import { FadeIn } from "@/components/AnimatedComponents";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function StandaloneReportPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [role, setRole] = useState<'student' | 'teacher'>('student');

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userRole = localStorage.getItem("role") as 'student' | 'teacher';

        if (!token) {
            router.push("/login");
            return;
        }

        setRole(userRole);
        fetchSubmission(token);
    }, [id, router]);

    // Polling logic: Sync data during active AI processing
    useEffect(() => {
        if (!submission) return;
        
        const isProcessing = (submission.status || '').startsWith('ai_');
        
        if (isProcessing) {
            const token = localStorage.getItem("token") || "";
            const interval = setInterval(() => {
                fetchSubmission(token);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [submission?.status]);

    const fetchSubmission = async (token: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/submissions/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) {
                if (res.status === 403) throw new Error("Unauthorized to view this report.");
                throw new Error("Report not found or system error.");
            }

            const data = await res.json();
            setSubmission(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateScore = async (score: number, feedback: string) => {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/submissions/${id}/score`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ finalScore: score, teacherFeedback: feedback }),
        });

        if (!res.ok) throw new Error("Failed to update score");

        const updated = await res.json();
        setSubmission((prev: any) => ({ ...prev, ...updated }));
    };

    const handleReEvaluate = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:5000/api/submissions/${id}/re-evaluate`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setSubmission((prev: any) => ({ ...prev, status: 'ai_transcribing_paper' }));
            } else {
                const errorData = await res.json();
                alert(errorData.message || "Failed to start re-evaluation");
            }
        } catch (err) {
            console.error("Error re-evaluating", err);
        }
    };

    const handleExit = () => {
        if (role === 'teacher' && submission) {
            router.push(`/teacher/exam/${submission.examId}`);
        } else {
            router.push("/student");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <RefreshCw className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                <p className="text-corporate-400 font-black uppercase tracking-widest text-xs">Initializing Secure Workspace...</p>
            </div>
        );
    }

    if (error || !submission) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                    <AlertTriangle className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-black text-corporate-950 mb-4 tracking-tighter">Access Restricted</h1>
                <p className="text-corporate-500 max-w-md mb-8 font-medium">{error || "The requested evaluation report could not be retrieved."}</p>
                <button
                    onClick={() => router.back()}
                    className="px-8 py-4 bg-corporate-950 text-white font-black rounded-2xl hover:bg-corporate-800 transition-all shadow-premium"
                >
                    Return to Dashboard
                </button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white">
            <FadeIn>
                <SubmissionReport
                    isOpen={true}
                    onClose={handleExit}
                    submission={submission}
                    examTitle={submission.examTitle || "Academic Report"}
                    role={role}
                    isStandalone={true}
                    onUpdateScore={role === 'teacher' ? handleUpdateScore : undefined}
                    onReEvaluate={role === 'teacher' ? handleReEvaluate : undefined}
                />
            </FadeIn>
        </main>
    );
}
