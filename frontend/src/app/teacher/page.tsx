"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { FadeIn, Magnetic, TiltCard } from "@/components/AnimatedComponents";
import { Plus, BookOpen, Layers, Clock, CheckCircle2, XCircle, FilePlus, ArrowRight, Filter } from "lucide-react";

interface Exam {
    _id: string;
    title: string;
    description: string;
    totalMarks: number | string;
    createdAt: string;
    questionPaperUrl: string;
    status?: 'active' | 'closed';
}

export default function TeacherDashboard() {
    const router = useRouter();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [showClosed, setShowClosed] = useState(false);

    // Form states
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [totalMarks, setTotalMarks] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "teacher") {
            router.push("/login");
            return;
        }

        fetchExams(token);
    }, [router]);

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
            setLoading(false);
        }
    };

    const handleCreateExam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsUploading(true);
        setError("");

        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("totalMarks", totalMarks);
        formData.append("questionPaper", file);

        try {
            const res = await fetch("http://localhost:5000/api/exams", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to create exam");
            }

            // Reset form
            setTitle("");
            setDescription("");
            setTotalMarks("");
            setFile(null);

            // Refresh exams list
            if (token) fetchExams(token);
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

    const handleEndExam = async (examId: string) => {
        if (!confirm("Are you sure you want to end this exam? Students will no longer be able to submit.")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:5000/api/exams/${examId}/end`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                setExams(exams.map(ex => ex._id === examId ? { ...ex, status: 'closed' } : ex));
            } else {
                const data = await res.json();
                alert(data.message || "Failed to end exam");
            }
        } catch (err) {
            console.error("Error ending exam", err);
        }
    };

    return (
        <main className="min-h-screen bg-corporate-50 pt-24 px-4 sm:px-6 lg:px-8 pb-12 relative overflow-hidden">
            <Navbar />
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/10 rounded-full blur-[140px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/10 rounded-full blur-[140px] -z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto">
                <FadeIn direction="up">
                    <header className="mb-12">
                        <h2 className="text-4xl md:text-5xl font-black text-corporate-950 mb-3 tracking-tighter">Instructor <span className="text-primary-600">Console</span></h2>
                        <p className="text-lg text-corporate-400 font-medium">Engineer assessments and manage student evaluation streams.</p>
                    </header>
                </FadeIn>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">


                    <FadeIn direction="left" delay={0.2} className="lg:col-span-4">
                        <div className="premium-card p-8 h-fit lg:sticky lg:top-28">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                                    <FilePlus className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-corporate-950 tracking-tight">New Assessment</h2>
                            </div>

                            {error && (
                                <div className="mb-6 bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl text-sm font-bold animate-in slide-in-from-top-1">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleCreateExam} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-corporate-400 mb-2 px-1">Evaluation Title</label>
                                    <input required placeholder="e.g. Advanced Neural Architectures" value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full bg-corporate-50 border border-corporate-100 rounded-2xl px-5 py-3 text-corporate-950 font-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-corporate-400 mb-2 px-1">Rubric Details</label>
                                    <textarea placeholder="Specify constraints and grading priorities..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-corporate-50 border border-corporate-100 rounded-2xl px-5 py-3 text-corporate-950 font-medium focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-corporate-400 mb-2 px-1">Total Scale</label>
                                        <input required value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} type="number" min="1" className="w-full bg-corporate-50 border border-corporate-100 rounded-2xl px-5 py-3 text-corporate-950 font-bold focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none" />
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-corporate-400 mb-2 px-1">Question Asset</label>
                                        <label className="cursor-pointer flex items-center justify-center bg-white border border-corporate-100 rounded-2xl px-4 py-3 hover:bg-corporate-50 transition-colors group/upload">
                                            <input required type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
                                            <Layers className={`w-4 h-4 mr-2 ${file ? 'text-primary-600' : 'text-corporate-300'} group-hover/upload:scale-110 transition-transform`} />
                                            <span className="text-[11px] font-black text-corporate-950 truncate max-w-[80px]">{file ? file.name : "Select File"}</span>
                                        </label>
                                    </div>
                                </div>

                                <Magnetic>
                                    <button disabled={isUploading} type="submit" className="w-full mt-4 bg-primary-700 hover:bg-primary-800 text-white py-4 rounded-2.5xl font-black transition-all shadow-premium disabled:opacity-50 flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
                                        {isUploading ? "Syncing Logic..." : <><Plus className="w-4 h-4" /> Deploy Assessment</>}
                                    </button>
                                </Magnetic>
                            </form>
                        </div>
                    </FadeIn> 

                    {/* Main Content / Exam List */}
                    <div className="lg:col-span-8 space-y-8">
                        <FadeIn direction="up" delay={0.3}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-black text-corporate-950 tracking-tight">Active Repositories</h2>
                                <button 
                                    onClick={() => setShowClosed(!showClosed)}
                                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border transition-all ${showClosed ? 'bg-primary-50 text-primary-700 border-primary-200 shadow-sm' : 'bg-white text-corporate-400 border-corporate-100 hover:text-corporate-950 shadow-premium'}`}
                                >
                                    <Filter className="w-3.5 h-3.5" />
                                    {showClosed ? "Visible: All Streams" : "Visible: Active Only"}
                                </button>
                            </div>
                        </FadeIn>

                        {loading ? (
                            <div className="text-corporate-400 font-bold animate-pulse text-center py-20 premium-card">Syncing Academic Database...</div>
                        ) : exams.length === 0 ? (
                            <div className="premium-card p-20 text-center">
                                <BookOpen className="w-16 h-16 mx-auto text-corporate-200 mb-6" />
                                <h3 className="text-xl font-bold text-corporate-950 mb-2">Zero Active Deployments</h3>
                                <p className="text-corporate-400 font-medium">No assessments found. Initialize your first evaluation stream on the left.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {exams
                                    .filter(exam => showClosed || exam.status !== 'closed')
                                    .map((exam, index) => (
                                        <FadeIn key={exam._id} direction="up" delay={0.4 + (index * 0.05)}>
                                            <TiltCard className="premium-card p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:translate-x-2 transition-all">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-2xl font-black text-corporate-950 group-hover:text-primary-700 transition-colors tracking-tight">{exam.title}</h3>
                                                        {exam.status === 'closed' ? (
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg border border-red-100 font-black text-[9px] uppercase tracking-widest">
                                                                <XCircle className="w-3 h-3" /> Terminated
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 font-black text-[9px] uppercase tracking-widest animate-pulse">
                                                                <CheckCircle2 className="w-3 h-3" /> Operational
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-corporate-400 font-medium leading-relaxed max-w-xl">{exam.description || "Assessment parameters finalized."}</p>
                                                    <div className="flex flex-wrap gap-4 mt-6">
                                                        <div className="flex items-center gap-2 bg-corporate-50 px-3 py-1.5 rounded-xl border border-corporate-100 text-[10px] font-black text-corporate-700 uppercase tracking-widest">
                                                            <Layers className="w-3.5 h-3.5" /> {exam.totalMarks} Points
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-corporate-50 px-3 py-1.5 rounded-xl border border-corporate-100 text-[10px] font-black text-corporate-700 uppercase tracking-widest">
                                                            <Clock className="w-3.5 h-3.5" /> {new Date(exam.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-0 border-corporate-50">
                                                    {exam.status !== 'closed' && (
                                                        <button
                                                            onClick={() => handleEndExam(exam._id)}
                                                            className="flex-1 md:flex-initial whitespace-nowrap bg-white hover:bg-red-50 border border-corporate-100 text-corporate-400 hover:text-red-700 py-3 px-6 rounded-2xl transition-all text-xs font-black uppercase tracking-widest"
                                                        >
                                                            End
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => router.push(`/teacher/exam/${exam._id}`)}
                                                        className="flex-1 md:flex-initial whitespace-nowrap bg-primary-700 hover:bg-primary-800 text-white py-3.5 px-8 rounded-2xl transition-all font-black text-sm shadow-premium flex items-center justify-center gap-2 group/btn"
                                                    >
                                                        Inspect
                                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                    </button>
                                                </div>
                                            </TiltCard>
                                        </FadeIn>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
