import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Smart Choose - Platform Rekomendasi Jurusan & Analisis PTN',
  description: 'Platform rekomendasi jurusan berbasis tes minat bakat Holland RIASEC, analisis daya tampung PTN, dan estimasi peluang kelulusan SNBT & SNBP 2026.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true} className="bg-slate-50 text-slate-900 font-sans antialiased min-h-screen flex flex-col justify-between">
        <div>
          <Navbar />
          <main>{children}</main>
        </div>
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-12">
          <div className="max-w-7xl mx-auto px-4">
            <p>© 2026 Smart Choose / ArahKita - Platform Analisis SNPMB (SNBT & SNBP) & Tes Minat Bakat Siswa.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
