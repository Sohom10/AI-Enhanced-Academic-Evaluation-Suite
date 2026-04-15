"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Magnetic } from './AnimatedComponents';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const { scrollY } = useScroll();
  const isLoginPage = pathname ? pathname.startsWith('/login') : false;

  // Shrink effect on scroll
  const navHeight = useTransform(scrollY, [0, 100], ["5rem", "4rem"]);
  const navBg = useTransform(
    scrollY,
    [0, 100],
    ["rgba(248, 250, 252, 0)", "rgba(255, 255, 255, 0.8)"]
  );
  const navBorder = useTransform(
    scrollY,
    [0, 100],
    ["rgba(226, 232, 240, 0)", "rgba(226, 232, 240, 0.5)"]
  );

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    const userRole = typeof window !== 'undefined' ? localStorage.getItem("role") : null;
    setIsLoggedIn(!!token);
    setRole(userRole);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole(null);
    router.push("/");
  };

  return (
    <motion.nav
      style={{ height: navHeight, backgroundColor: navBg, borderBottomColor: navBorder }}
      className="fixed top-0 w-full z-50 transition-colors backdrop-blur-md border-b flex items-center"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
        <div className="flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-shrink-0 flex items-center"
          >
            <Link href="/" className="text-lg md:text-2xl font-black tracking-tighter text-corporate-950 flex items-center gap-2 md:gap-3 group">
              <div className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0 bg-primary-700 rounded-xl md:rounded-2.5xl flex items-center justify-center text-white shadow-premium group-hover:rotate-12 transition-all duration-500">
                  <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-white opacity-20 border-2 border-white" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-corporate-400 font-black mb-[-2px] leading-none">AI Enhanced</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-corporate-950 to-primary-800 text-sm md:text-lg max-w-[150px] md:max-w-none whitespace-normal md:whitespace-nowrap leading-tight">Academic <span className="text-primary-600">Evaluation Suite</span></span>
              </div>
            </Link>
          </motion.div>

          <div className="flex items-center space-x-12">
            {isLoggedIn ? (
              <>
                <div className="hidden md:flex items-center space-x-10">
                    {role === 'admin' && (
                    <Link href="/admin" className="text-[10px] font-black uppercase tracking-[0.2em] text-corporate-400 hover:text-primary-700 transition-colors">
                        Command Center
                    </Link>
                    )}
                    {role === 'teacher' && (
                    <Link href="/teacher" className="text-[10px] font-black uppercase tracking-[0.2em] text-corporate-400 hover:text-primary-700 transition-colors">
                        Faculty Desktop
                    </Link>
                    )}
                    {role === 'student' && (
                    <Link href="/student" className="text-[10px] font-black uppercase tracking-[0.2em] text-corporate-400 hover:text-primary-700 transition-colors">
                        Identity Portal
                    </Link>
                    )}
                </div>
                <Magnetic>
                  <button 
                    onClick={handleLogout}
                    className="bg-corporate-950 hover:bg-corporate-800 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-premium"
                  >
                    Terminate Session
                  </button>
                </Magnetic>
              </>
            ) : (
              !isLoginPage && (
                <Magnetic>
                  <Link 
                    href="/login" 
                    className="bg-primary-700 hover:bg-primary-800 text-white px-8 py-3 md:px-10 md:py-3.5 rounded-2.5xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-premium hover:shadow-premium-hover active:scale-95"
                  >
                    System Access
                  </Link>
                </Magnetic>
              )
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
