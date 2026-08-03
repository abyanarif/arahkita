import '@/app/globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Smart Choose - Platform Rekomendasi Jurusan & Analisis PTN',
  description: 'Platform rekomendasi jurusan berbasis tes minat bakat Holland Code (RIASEC), analisis daya tampung & keketatan historis 5 tahun SNBT PTN se-Indonesia.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-[#F5A623] selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
