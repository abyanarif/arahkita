'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Ticket, Database, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyAdmin() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
        const json = await res.json();
        const role = json.data?.role;

        if (role !== 'admin') {
          // If not admin, redirect to directory
          router.push('/direktori-ptn');
        } else {
          setIsAdmin(true);
        }
      } catch (e) {
        console.error(e);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    verifyAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-600">Verifikasi hak akses administrator...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  const adminMenu = [
    { label: 'Overview Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Manajemen Pengguna', href: '/admin/users', icon: Users },
    { label: 'Generator Voucher', href: '/admin/vouchers', icon: Ticket },
    { label: 'Katalog & Data Sync', href: '/admin/data', icon: Database },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Admin Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 leading-none">Admin Panel</h3>
                <span className="text-[10px] text-slate-500 font-semibold">Supabase Cloud Control</span>
              </div>
            </div>

            <nav className="space-y-1">
              {adminMenu.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/direktori-ptn"
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors p-2"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Aplikasi
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-6">{children}</main>
      </div>
    </div>
  );
}
