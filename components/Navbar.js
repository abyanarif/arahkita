'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, Compass, Calculator, GraduationCap, Users, LogIn, LogOut, Crown, ShieldAlert, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        const json = await res.json();
        if (json.success) {
          setProfile(json.data);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/login');
  };

  const navItems = [
    { label: 'Direktori PTN', href: '/direktori-ptn', icon: Compass },
    { label: 'Tes Minat (RIASEC)', href: '/tes-minat', icon: GraduationCap },
    { label: 'Kalkulator Peluang', href: '/kalkulator-peluang', icon: Calculator },
    { label: 'Dashboard BK', href: '/dashboard-bk', icon: Users },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-[#3157AC] flex items-center justify-center text-white font-extrabold shadow-md group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-[#F5A623]" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-slate-900 tracking-tight">ArahKita</span>
              <span className="text-[10px] font-bold text-[#F5A623] block leading-none">Smart Choose 2026</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#EFF4FF] text-[#3157AC]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#3157AC]' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Auth Action Area */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-8 bg-slate-100 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* Profile Badge */}
                <div className="hidden sm:flex flex-col items-end text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span>{profile?.full_name || user.email.split('@')[0]}</span>
                    {profile?.is_premium ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[#D48813] text-[10px] font-extrabold border border-amber-300 flex items-center gap-0.5">
                        <Crown className="w-3 h-3 text-[#F5A623]" /> PREMIUM
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                        FREE
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    {profile?.role === 'admin' ? '⚡ Admin' : profile?.role === 'guru_bk' ? '👨‍🏫 Guru BK' : '🎓 Siswa'}
                  </span>
                </div>

                {/* Admin Link if Admin */}
                {profile?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-800 hover:bg-purple-200 text-xs font-bold border border-purple-300 flex items-center gap-1"
                  >
                    <Shield className="w-3.5 h-3.5 text-purple-700" /> Admin
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                  title="Keluar / Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-slate-700 hover:text-slate-900 text-xs font-bold border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" /> Masuk
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-[#3157AC] hover:bg-[#223F82] text-white text-xs font-bold shadow-md transition-all"
                >
                  Daftar Akun
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
