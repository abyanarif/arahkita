import Link from 'next/link';
import { GraduationCap, ShieldCheck, Database, Award, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-16 md:pb-8 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#F5A623] flex items-center justify-center text-slate-900 font-bold">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Smart Choose</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Platform AI & Data Analytics Rekomendasi Jurusan dan Peta Persaingan SNBT Terpercaya untuk Siswa SMA & Guru BK Indonesia.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium bg-slate-800/60 p-2 rounded-lg border border-slate-700 w-fit">
              <ShieldCheck className="w-4 h-4 text-[#F5A623]" />
              Data Resmi Proxy SNPMB 2026
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Fitur Utama</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/tes-minat" className="hover:text-amber-400 transition-colors">
                  Kuis Holland Code (RIASEC)
                </Link>
              </li>
              <li>
                <Link href="/direktori-ptn" className="hover:text-amber-400 transition-colors">
                  Cari Kampus & Jurusan PTN
                </Link>
              </li>
              <li>
                <Link href="/kalkulator-peluang" className="hover:text-amber-400 transition-colors">
                  Kalkulator Peluang SNBT
                </Link>
              </li>
              <li>
                <Link href="/dashboard-bk" className="hover:text-amber-400 transition-colors">
                  Dashboard Guru BK
                </Link>
              </li>
            </ul>
          </div>

          {/* PTN Coverage */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Cakupan PTN</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>Universitas Indonesia (UI)</li>
              <li>Institut Teknologi Bandung (ITB)</li>
              <li>Universitas Gadjah Mada (UGM)</li>
              <li>Institut Teknologi Sepuluh Nopember (ITS)</li>
              <li>140+ PTN Akademik, Vokasi & PTKIN</li>
            </ul>
          </div>

          {/* Contact / Info */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Informasi Tim</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <p>Membantu siswa memilih jurusan kuliah secara rasional berdasarkan bakat & data historis.</p>
              <div className="pt-2 text-xs flex items-center gap-1.5 text-slate-500">
                <Database className="w-3.5 h-3.5" />
                SQLite Engine + Next.js App Router
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 Smart Choose. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="flex items-center gap-1">
            Dirancang dengan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> untuk Pendidikan Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
