"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { FadeIn, Magnetic } from "@/components/AnimatedComponents";
import { User, IdCard, Lock, ChevronRight } from "lucide-react";

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [name, setName] = useState("");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam === 'teacher' || roleParam === 'student') {
            setRole(roleParam);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, identifier, password, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Registration failed");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);

            if (data.role === 'teacher') {
                router.push("/teacher");
            } else {
                router.push("/student");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FadeIn direction="up" delay={0.2}>
            <div className="w-full max-w-xl premium-card p-10 md:p-14">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-black text-corporate-950 mb-3 tracking-tighter">Create Account</h2>
                    <p className="text-lg text-corporate-400 font-medium tracking-tight">Join the Academic AI Excellence Suite</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-corporate-950 mb-3 uppercase tracking-widest">I am a...</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole("student")}
                                className={`py-3.5 px-4 rounded-2xl border-2 text-sm font-bold transition-all duration-300 ${role === "student"
                                    ? "bg-primary-50 border-primary-600 text-primary-700 shadow-sm"
                                    : "bg-white border-corporate-100 text-corporate-400 hover:border-corporate-200"
                                    }`}
                            >
                                Student
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("teacher")}
                                className={`py-3.5 px-4 rounded-2xl border-2 text-sm font-bold transition-all duration-300 ${role === "teacher"
                                    ? "bg-primary-50 border-primary-600 text-primary-700 shadow-sm"
                                    : "bg-white border-corporate-100 text-corporate-400 hover:border-corporate-200"
                                    }`}
                            >
                                Teacher
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="group">
                            <label className="block text-sm font-bold text-corporate-950 mb-2 font-mono uppercase tracking-tighter">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-corporate-400 group-focus-within:text-primary-600 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-corporate-50 border border-corporate-100 rounded-2xl pl-12 pr-4 py-4 text-corporate-950 placeholder-corporate-400 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-corporate-950 mb-2 font-mono uppercase tracking-tighter">
                                {role === "teacher" ? "Identity Reference" : "Roll Number"}
                            </label>
                            <div className="relative">
                                <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-corporate-400 group-focus-within:text-primary-600 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="w-full bg-corporate-50 border border-corporate-100 rounded-2xl pl-12 pr-4 py-4 text-corporate-950 placeholder-corporate-400 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                                    placeholder={role === "teacher" ? "EMP_ID_2026" : "U_ROLL_001"}
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-corporate-950 mb-2 font-mono uppercase tracking-tighter">Security Key</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-corporate-400 group-focus-within:text-primary-600 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-corporate-50 border border-corporate-100 rounded-2xl pl-12 pr-4 py-4 text-corporate-950 placeholder-corporate-400 focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <Magnetic>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-700 hover:bg-primary-800 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-premium hover:shadow-premium-hover mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-lg"
                        >
                            {isLoading ? "Provisioning..." : "Finalize Registration"}
                            {!isLoading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </Magnetic>
                </form>

                <p className="mt-10 text-center text-corporate-400 font-medium">
                    Already have access?{" "}
                    <Link href="/login" className="font-bold text-primary-700 hover:text-primary-800 transition-colors underline underline-offset-4 decoration-primary-100">
                        Portal Login
                    </Link>
                </p>
            </div>
        </FadeIn>
    );
}

export default function Register() {
    return (
        <main className="min-h-screen relative flex flex-col justify-center items-center px-4 py-32 bg-corporate-50 overflow-hidden">
            <Navbar />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/30 rounded-full blur-[100px] pointer-events-none -z-10" />

            <Suspense fallback={<div className="text-corporate-400 font-bold animate-pulse">Initializing Portal...</div>}>
                <RegisterForm />
            </Suspense>
        </main>
    );
}
