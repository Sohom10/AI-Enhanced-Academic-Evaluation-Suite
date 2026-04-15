"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { FadeIn, Magnetic, TiltCard } from "@/components/AnimatedComponents";
import { Users, BookOpen, FileText, PlusCircle, ArrowRight, ShieldCheck, Activity, Database, Briefcase } from "lucide-react";

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({ students: 0, teachers: 0, exams: 0, submissions: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchStats = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("http://localhost:5000/api/admin/stats", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "admin") {
            router.push("/login/admin");
            return;
        }

        fetchStats();

        // Implement Live Refresh every 30 seconds
        const intervalId = setInterval(fetchStats, 30000);

        return () => clearInterval(intervalId);
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-corporate-50">
                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                <p className="text-corporate-400 font-black uppercase tracking-widest text-xs">Authenticating Command Center...</p>
            </div>
        );
    }

    const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
        <FadeIn direction="up" delay={delay}>
            <div className="premium-card p-8 flex items-center space-x-6 group hover:translate-y-[-4px] transition-all">
                <div className={`p-4 rounded-2xl ${color} transition-transform group-hover:scale-110`}>
                    <Icon className="w-7 h-7" />
                </div>
                <div>
                    <p className="text-corporate-400 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
                    <p className="text-3xl font-black text-corporate-950 tracking-tight">{value}</p>
                </div>
            </div>
        </FadeIn>
    );

    return (
        <main className="min-h-screen relative bg-corporate-50 overflow-hidden pb-20">
            <Navbar />
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-100/10 rounded-full blur-[160px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-100/10 rounded-full blur-[160px] -z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
                <FadeIn direction="up">
                    <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Security Level: Global Admin
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-corporate-950 tracking-tighter mb-4">Command <span className="text-primary-600 font-black">Center</span></h1>
                            <p className="text-lg text-corporate-400 font-medium">Global synchronization and ecosystem audit interface.</p>
                        </div>
                        {lastUpdated && (
                            <div className="flex flex-col items-end">
                                <p className="text-[10px] text-corporate-300 font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Activity className="w-3.5 h-3.5" /> Pulse Refresh State
                                </p>
                                <p className="text-sm font-black text-corporate-950">
                                    {lastUpdated.toLocaleTimeString()}
                                </p>
                            </div>
                        )}
                    </div>
                </FadeIn>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    <StatCard title="Global Students" value={stats.students} icon={Users} color="bg-blue-50 text-blue-600" delay={0.2} />
                    <StatCard title="Faculty Assets" value={stats.teachers} icon={Briefcase} color="bg-indigo-50 text-indigo-600" delay={0.3} />
                    <StatCard title="Active Streams" value={stats.exams} icon={Database} color="bg-emerald-50 text-emerald-600" delay={0.4} />
                    <StatCard title="Total Packets" value={stats.submissions} icon={FileText} color="bg-primary-50 text-primary-600" delay={0.5} />
                </div>

                {/* Quick Actions */}
                <FadeIn direction="up" delay={0.6}>
                    <h2 className="text-2xl font-black text-corporate-950 mb-8 tracking-tight">Ecosystem Management</h2>
                </FadeIn>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Students Management Card */}
                    <FadeIn direction="up" delay={0.7} className="h-full">
                        <TiltCard className="premium-card p-10 h-full group hover:border-primary-100 transition-all flex flex-col">
                            <div className="flex justify-between items-start mb-10">
                                <div className="h-16 w-16 bg-blue-50 rounded-2.5xl flex items-center justify-center text-blue-600">
                                    <Users className="w-8 h-8" />
                                </div>
                                <Magnetic>
                                    <Link href="/admin/students" className="p-3 bg-white border border-corporate-100 hover:border-primary-200 rounded-2xl transition-all shadow-sm">
                                        <ArrowRight className="w-5 h-5 text-corporate-950" />
                                    </Link>
                                </Magnetic>
                            </div>
                            <h3 className="text-3xl font-black text-corporate-950 mb-4 tracking-tight">Student Repositories</h3>
                            <p className="text-corporate-400 font-medium leading-relaxed mb-10 flex-1 text-lg">Engineer student credentials and manage universal roll number mapping across all departments.</p>
                            <Link href="/admin/students" className="inline-flex items-center text-primary-600 font-black uppercase text-xs tracking-widest hover:text-primary-700 transition-colors">
                                <PlusCircle className="w-5 h-5 mr-2" /> Initialize New Student Profile
                            </Link>
                        </TiltCard>
                    </FadeIn>

                    {/* Teachers Management Card */}
                    <FadeIn direction="up" delay={0.8} className="h-full">
                        <TiltCard className="premium-card p-10 h-full group hover:border-primary-100 transition-all flex flex-col">
                            <div className="flex justify-between items-start mb-10">
                                <div className="h-16 w-16 bg-indigo-50 rounded-2.5xl flex items-center justify-center text-indigo-600">
                                    <Users className="w-8 h-8" />
                                </div>
                                <Magnetic>
                                    <Link href="/admin/teachers" className="p-3 bg-white border border-corporate-100 hover:border-primary-200 rounded-2xl transition-all shadow-sm">
                                        <ArrowRight className="w-5 h-5 text-corporate-950" />
                                    </Link>
                                </Magnetic>
                            </div>
                            <h3 className="text-3xl font-black text-corporate-950 mb-4 tracking-tight">Faculty Orchestration</h3>
                            <p className="text-corporate-400 font-medium leading-relaxed mb-10 flex-1 text-lg">Onboard specialized instructors, configure advanced permissions, and distribute departmental authority.</p>
                            <Link href="/admin/teachers" className="inline-flex items-center text-primary-600 font-black uppercase text-xs tracking-widest hover:text-primary-700 transition-colors">
                                <PlusCircle className="w-5 h-5 mr-2" /> Authenticate Faculty Member
                            </Link>
                        </TiltCard>
                    </FadeIn>
                </div>
            </div>
        </main>
    );
}
