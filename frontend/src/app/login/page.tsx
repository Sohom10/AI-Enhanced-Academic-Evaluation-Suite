"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { FadeIn, Magnetic } from "@/components/AnimatedComponents";
import { GraduationCap, Briefcase, ShieldCheck } from "lucide-react";

export default function LoginSelection() {
    return (
        <main className="min-h-screen relative flex flex-col justify-center items-center px-4 bg-corporate-50 overflow-hidden">
            <Navbar />

            {/* Premium Dot Grid Background */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-corporate-50 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_40%,transparent_100%)]" />

            <div className="w-full max-w-2xl px-4">
                <FadeIn direction="up" delay={0.1}>
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-black text-corporate-950 mb-4 tracking-tighter">Welcome Back</h2>
                        <p className="text-xl text-corporate-400 font-medium">Select your portal to continue to your dashboard</p>
                    </div>
                </FadeIn>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FadeIn direction="up" delay={0.2}>
                        <Link href="/login/student" className="group block p-8 premium-card hover:-translate-y-2">
                            <div className="h-14 w-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                                <GraduationCap className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-corporate-950 mb-3 group-hover:text-primary-700 transition-colors">Student</h3>
                            <p className="text-corporate-400 font-medium leading-relaxed">View grades, attempt exams, and manage your academic profile.</p>
                        </Link>
                    </FadeIn>

                    <FadeIn direction="up" delay={0.3}>
                        <Link href="/login/teacher" className="group block p-8 premium-card hover:-translate-y-2">
                            <div className="h-14 w-14 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                                <Briefcase className="w-7 h-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-corporate-950 mb-3 group-hover:text-primary-700 transition-colors">Teacher</h3>
                            <p className="text-corporate-400 font-medium leading-relaxed">Manage question papers, rubric evaluation, and AI insights.</p>
                        </Link>
                    </FadeIn>

                    <FadeIn direction="up" delay={0.4}>
                        <Link href="/login/admin" className="group block p-8 premium-card hover:-translate-y-2 md:col-span-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className="h-14 w-14 bg-primary-50 text-primary-600 rounded-2xl flex-shrink-0 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
                                    <ShieldCheck className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-corporate-950 mb-2 group-hover:text-primary-700 transition-colors">Administrator</h3>
                                    <p className="text-corporate-400 font-medium leading-relaxed">System-wide monitoring, user management, and administrative overrides.</p>
                                </div>
                            </div>
                        </Link>
                    </FadeIn>
                </div>

                <FadeIn direction="up" delay={0.6}>
                    <p className="mt-12 text-center text-corporate-400 font-medium">
                        Not registered yet?{" "}
                        <Link href="/register" className="font-bold text-primary-700 hover:text-primary-800 transition-colors underline underline-offset-4 decoration-primary-200">
                            Create an enterprise account
                        </Link>
                    </p>
                </FadeIn>
            </div>
        </main>
    );
}
