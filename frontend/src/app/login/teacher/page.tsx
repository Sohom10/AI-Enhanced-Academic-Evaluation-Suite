"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { FadeIn, Magnetic } from "@/components/AnimatedComponents";
import { Briefcase, ArrowLeft, Lock, Mail } from "lucide-react";

export default function TeacherLogin() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ identifier, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            // Protect route
            if (data.role !== 'teacher') {
                throw new Error("This login page is for Teachers only. Please use the Student Login.");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("role", data.role);
            router.push("/teacher");

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-corporate-50 relative flex flex-col justify-center items-center px-4 overflow-hidden">
            <Navbar />

            {/* Premium Dot Grid Background */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-corporate-50 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_40%,transparent_100%)]" />

            <div className="w-full max-w-md">
                <FadeIn direction="up">
                    <div className="premium-card p-10">
                        <div className="text-center mb-10">
                            <div className="h-16 w-16 bg-primary-50 text-primary-600 rounded-2.5xl flex items-center justify-center mx-auto mb-6">
                                <Briefcase className="w-8 h-8" />
                            </div>
                            <h2 className="text-3xl font-black text-corporate-950 mb-2 tracking-tighter">Faculty Access</h2>
                            <p className="text-corporate-400 font-medium">Authentication for administrative educators.</p>
                        </div>

                        {error && (
                            <div className="mb-8 bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-2xl text-sm font-bold animate-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-corporate-400 mb-2 px-1">Instructor Identifier</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        autoComplete="username"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="w-full bg-corporate-50 border border-corporate-100 rounded-2xl px-5 py-4 text-corporate-950 font-medium placeholder-corporate-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                        placeholder="EMP12345"
                                    />
                                    <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-corporate-200" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-corporate-400 mb-2 px-1">Security Key</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-corporate-50 border border-corporate-100 rounded-2xl px-5 py-4 text-corporate-950 font-medium placeholder-corporate-200 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                        placeholder="••••••••"
                                    />
                                    <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-corporate-200" />
                                </div>
                            </div>

                            <Magnetic>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full mt-4 bg-primary-700 hover:bg-primary-800 text-white font-black py-4 px-4 rounded-2.5xl transition-all shadow-premium disabled:opacity-50 text-sm uppercase tracking-widest"
                                >
                                    {isLoading ? "Authenticating..." : "Establish Secure Connection"}
                                </button>
                            </Magnetic>
                        </form>

                        <div className="mt-10 pt-8 border-t border-corporate-50 text-center">
                            <p className="text-sm text-corporate-400 font-medium">
                                Not a teacher?{" "}
                                <Link href="/login/student" className="font-black text-primary-700 hover:text-primary-800 transition-colors">
                                    Switch to Student
                                </Link>
                            </p>
                        </div>
                    </div>
                </FadeIn>

                <FadeIn direction="up" delay={0.2}>
                    <button 
                        onClick={() => router.push("/login")}
                        className="mt-8 flex items-center justify-center gap-2 w-full text-corporate-400 hover:text-corporate-950 font-black text-[10px] uppercase tracking-widest transition-colors group"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        Back to Portal Selection
                    </button>
                </FadeIn>
            </div>
        </main>
    );
}
