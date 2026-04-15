"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { FadeIn, Magnetic, TiltCard } from "@/components/AnimatedComponents";
import { UserPlus, Trash2, Search, GraduationCap, ArrowLeft, ShieldCheck, Mail, Lock, User } from "lucide-react";

export default function StudentManagement() {
    const router = useRouter();
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Form state
    const [formData, setFormData] = useState({ name: "", identifier: "", password: "" });
    const [formError, setFormError] = useState("");
    const [formSuccess, setFormSuccess] = useState("");

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token || role !== "admin") {
            router.push("/login/admin");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/admin/users", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStudents(data.students);
            }
        } catch (err) {
            console.error("Failed to fetch students:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [router]);

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError("");
        setFormSuccess("");

        const token = localStorage.getItem("token");
        try {
            const res = await fetch("http://localhost:5000/api/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ ...formData, role: "student" })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to add student");

            setFormSuccess("Student added successfully!");
            setFormData({ name: "", identifier: "", password: "" });
            fetchData();
        } catch (err: any) {
            setFormError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (identifier: string) => {
        if (!confirm(`Are you sure you want to delete student ${identifier}?`)) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:5000/api/admin/users/${identifier}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                fetchData();
            }
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.identifier.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-corporate-50">
                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                <p className="text-corporate-400 font-black uppercase tracking-widest text-xs">Accessing Student Directory...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen relative bg-corporate-50 overflow-hidden pb-20">
            <Navbar />
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-100/10 rounded-full blur-[160px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-100/10 rounded-full blur-[160px] -z-10 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
                <FadeIn direction="up">
                    <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <button 
                                onClick={() => router.push("/admin")}
                                className="flex items-center gap-2 text-corporate-400 hover:text-corporate-950 font-black text-[10px] uppercase tracking-widest transition-colors mb-4 group"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                                Back to Command Center
                            </button>
                            <h1 className="text-4xl md:text-5xl font-black text-corporate-950 tracking-tighter mb-2">Student <span className="text-primary-600">Repositories</span></h1>
                            <p className="text-corporate-400 font-medium leading-relaxed">System-wide enrollment and credential orchestration.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-2 bg-white border border-corporate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-corporate-400 flex items-center gap-2 shadow-sm">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Administrative Write Access
                            </span>
                        </div>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Form Section */}
                    <div className="lg:col-span-4">
                        <FadeIn direction="up" delay={0.2}>
                            <div className="premium-card p-8 sticky top-32">
                                <div className="flex items-center space-x-3 mb-8">
                                    <div className="h-12 w-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
                                        <UserPlus className="w-6 h-6" />
                                    </div>
                                    <h2 className="text-xl font-black text-corporate-950 tracking-tight">Provision Identity</h2>
                                </div>

                                {formError && <div className="mb-6 text-xs font-bold text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100 animate-in slide-in-from-top-1">{formError}</div>}
                                {formSuccess && <div className="mb-6 text-xs font-bold text-emerald-600 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 animate-in slide-in-from-top-1">{formSuccess}</div>}

                                <form onSubmit={handleAddStudent} className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-corporate-400 mb-2 px-1">Legal Name</label>
                                        <div className="relative">
                                            <input 
                                                type="text" required value={formData.name}
                                                onChange={e => setFormData({...formData, name: e.target.value})}
                                                className="w-full bg-corporate-50 border border-corporate-100 rounded-2xl px-5 py-3.5 text-corporate-950 font-medium placeholder-corporate-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                                placeholder="John Doe"
                                            />
                                            <User className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-corporate-200" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-corporate-400 mb-2 px-1">Roll Identifier</label>
                                        <div className="relative">
                                            <input 
                                                type="text" required value={formData.identifier}
                                                onChange={e => setFormData({...formData, identifier: e.target.value})}
                                                className="w-full bg-corporate-50 border border-corporate-100 rounded-2xl px-5 py-3.5 text-corporate-950 font-medium placeholder-corporate-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                                placeholder="CS2024-001"
                                            />
                                            <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-corporate-200" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-corporate-400 mb-2 px-1">Initial Key</label>
                                        <div className="relative">
                                            <input 
                                                type="password" required value={formData.password}
                                                onChange={e => setFormData({...formData, password: e.target.value})}
                                                className="w-full bg-corporate-50 border border-corporate-100 rounded-2xl px-5 py-3.5 text-corporate-950 font-medium placeholder-corporate-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                                placeholder="••••••••"
                                            />
                                            <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-corporate-200" />
                                        </div>
                                    </div>
                                    <Magnetic>
                                        <button 
                                            disabled={isSubmitting}
                                            className="w-full bg-primary-700 hover:bg-primary-800 text-white font-black py-4 rounded-2.5xl transition-all shadow-premium disabled:opacity-50 text-xs uppercase tracking-widest mt-4"
                                        >
                                            {isSubmitting ? "Processing..." : "Register Profile"}
                                        </button>
                                    </Magnetic>
                                </form>
                            </div>
                        </FadeIn>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-8">
                        <FadeIn direction="up" delay={0.4}>
                            <div className="premium-card p-10 overflow-hidden">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-2.5xl flex items-center justify-center">
                                            <GraduationCap className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-corporate-950 tracking-tight">Active Profiles</h2>
                                            <p className="text-corporate-400 font-bold text-[10px] uppercase tracking-widest mt-1">{students.length} Total Identities Synced</p>
                                        </div>
                                    </div>
                                    <div className="relative group">
                                        <Search className="w-4 h-4 text-corporate-300 absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-primary-600 transition-colors" />
                                        <input 
                                            type="text"
                                            placeholder="Audit by name or roll..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="bg-corporate-50 border border-corporate-100 rounded-2.5xl pl-12 pr-6 py-3.5 text-sm text-corporate-950 font-medium placeholder-corporate-200 focus:ring-4 focus:ring-primary-50/50 focus:border-primary-500 outline-none w-full md:w-80 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="overflow-x-auto -mx-10 px-10">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-corporate-400 text-[10px] font-black uppercase tracking-widest border-b border-corporate-50">
                                                <th className="px-6 py-5">Full Legal Identity</th>
                                                <th className="px-6 py-5">Roll Identifier</th>
                                                <th className="px-6 py-5 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-corporate-50">
                                            {filteredStudents.map((student) => (
                                                <tr key={student.identifier} className="group hover:bg-corporate-50/50 transition-colors">
                                                    <td className="px-6 py-6">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="h-10 w-10 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 font-black text-sm group-hover:bg-primary-600 group-hover:text-white transition-all">
                                                                {student.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <span className="text-base font-black text-corporate-950 block">{student.name}</span>
                                                                <span className="text-[10px] font-black text-corporate-300 uppercase tracking-widest">Authenticated Account</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <span className="text-xs font-black text-corporate-500 px-3 py-1.5 bg-white border border-corporate-100 rounded-xl shadow-sm tracking-tight">{student.identifier}</span>
                                                    </td>
                                                    <td className="px-6 py-6 text-right">
                                                        <Magnetic>
                                                            <button 
                                                                onClick={() => handleDelete(student.identifier)}
                                                                className="p-3 text-corporate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                                                title="Revoke Permission"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </Magnetic>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {filteredStudents.length === 0 && (
                                        <div className="py-24 text-center">
                                            <div className="h-20 w-20 bg-corporate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <Search className="w-8 h-8 text-corporate-200" />
                                            </div>
                                            <p className="text-corporate-400 font-black text-xs uppercase tracking-widest">No matching results found in directory.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </div>
        </main>
    );
}
