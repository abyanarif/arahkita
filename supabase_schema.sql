-- ========================================================
-- SUPABASE POSTGRESQL SCHEMA FOR SMART CHOOSE / ARAHKITA
-- Complete Schema: PTN, Prodi, Historis, Profiles, Vouchers, Transactions
-- ========================================================

-- 1. Table PTN
CREATE TABLE IF NOT EXISTS public.ptn (
    id_ptn TEXT PRIMARY KEY,
    kode_ptn TEXT NOT NULL,
    nama_ptn TEXT NOT NULL,
    jenis_ptn TEXT CHECK (jenis_ptn IN ('Akademik', 'Vokasi', 'PTKIN')),
    provinsi_1 TEXT,
    provinsi_2 TEXT,
    website TEXT
);

-- 2. Table Prodi
CREATE TABLE IF NOT EXISTS public.prodi (
    kode_prodi TEXT PRIMARY KEY,
    id_ptn TEXT NOT NULL REFERENCES public.ptn(id_ptn) ON DELETE CASCADE,
    nama_prodi TEXT NOT NULL,
    jenjang TEXT,
    daya_tampung_sekarang INTEGER DEFAULT 50,
    daya_tampung_snbt INTEGER DEFAULT 50,
    daya_tampung_snbp INTEGER DEFAULT 40,
    portofolio TEXT DEFAULT 'Tidak Ada'
);

-- 3. Table Historis Seleksi (Combines SNBT & SNBP)
CREATE TABLE IF NOT EXISTS public.historis_seleksi (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    kode_prodi TEXT NOT NULL REFERENCES public.prodi(kode_prodi) ON DELETE CASCADE,
    jalur TEXT NOT NULL CHECK (jalur IN ('SNBT', 'SNBP')),
    tahun INTEGER NOT NULL,
    peminat INTEGER NOT NULL,
    daya_tampung INTEGER NOT NULL,
    terima INTEGER DEFAULT 0,
    keketatan_persen DOUBLE PRECISION NOT NULL
);

-- 4. Table Jurusan Master (RIASEC Holland Code Info)
CREATE TABLE IF NOT EXISTS public.jurusan_master (
    id_jurusan_master INTEGER PRIMARY KEY,
    nama_jurusan TEXT NOT NULL,
    kategori_riasec TEXT NOT NULL,
    deskripsi TEXT,
    prospek_karir TEXT
);

-- 5. Table Siswa (BK Teacher Dashboard & Student Mapping)
CREATE TABLE IF NOT EXISTS public.siswa (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nama TEXT NOT NULL,
    kelas TEXT NOT NULL,
    sekolah TEXT NOT NULL,
    skor_utbk_avg DOUBLE PRECISION DEFAULT 650.0,
    riasec_top TEXT DEFAULT 'Investigative',
    pilihan_1_prodi_kode TEXT,
    pilihan_2_prodi_kode TEXT,
    status_rekomendasi TEXT DEFAULT 'Target'
);

-- 6. Table User Profiles (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('siswa', 'guru_bk', 'admin')) DEFAULT 'siswa',
    school_name TEXT DEFAULT 'SMA Negeri 1 Indonesia',
    is_premium BOOLEAN DEFAULT FALSE,
    premium_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Table Vouchers (Discount / License Keys)
CREATE TABLE IF NOT EXISTS public.vouchers (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER DEFAULT 100,
    valid_days INTEGER DEFAULT 30,
    max_uses INTEGER DEFAULT 100,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Table Transactions (Payment History)
CREATE TABLE IF NOT EXISTS public.transactions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    status TEXT CHECK (status IN ('pending', 'success', 'failed')) DEFAULT 'pending',
    payment_method TEXT DEFAULT 'Qris',
    voucher_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexing for fast queries
CREATE INDEX IF NOT EXISTS idx_prodi_id_ptn ON public.prodi(id_ptn);
CREATE INDEX IF NOT EXISTS idx_prodi_nama ON public.prodi(nama_prodi);
CREATE INDEX IF NOT EXISTS idx_historis_kode_prodi ON public.historis_seleksi(kode_prodi);
CREATE INDEX IF NOT EXISTS idx_historis_jalur ON public.historis_seleksi(jalur);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ptn ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prodi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historis_seleksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jurusan_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Allow Public ALL access for PTN, Prodi, Historis, Jurusan Master, Siswa, Profiles, Vouchers, Transactions
DROP POLICY IF EXISTS "Allow Public All PTN" ON public.ptn;
DROP POLICY IF EXISTS "Allow Public All Prodi" ON public.prodi;
DROP POLICY IF EXISTS "Allow Public All Historis" ON public.historis_seleksi;
DROP POLICY IF EXISTS "Allow Public All Jurusan Master" ON public.jurusan_master;
DROP POLICY IF EXISTS "Allow Public All Siswa" ON public.siswa;
DROP POLICY IF EXISTS "Allow Public All Profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow Public All Vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Allow Public All Transactions" ON public.transactions;

CREATE POLICY "Allow Public All PTN" ON public.ptn FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public All Prodi" ON public.prodi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public All Historis" ON public.historis_seleksi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public All Jurusan Master" ON public.jurusan_master FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public All Siswa" ON public.siswa FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public All Profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public All Vouchers" ON public.vouchers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public All Transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- Automated Function to Sync auth.users -> public.profiles on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, school_name, is_premium)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'siswa'),
    COALESCE(new.raw_user_meta_data->>'school_name', 'SMA Negeri 1 Indonesia'),
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger firing after user creation in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed Default Admin & Vouchers
INSERT INTO public.vouchers (code, discount_percent, valid_days, max_uses, is_active)
VALUES 
  ('ARAHKITASMB2026', 100, 90, 500, true),
  ('PREMIUM30', 100, 30, 1000, true),
  ('BKSURABAYA2026', 100, 365, 200, true)
ON CONFLICT (code) DO NOTHING;

-- ========================================================
-- PHASE 2 MIGRATION: Assessment & Matching Engine
-- Run AFTER the base schema above has been applied
-- ========================================================

-- Enable pgvector extension (must be done first in Supabase Dashboard
-- under Database > Extensions > vector, OR via SQL below)
CREATE EXTENSION IF NOT EXISTS vector;

-- ── ALTER TABLE prodi: tambah kolom Assessment & Matching ──────────

ALTER TABLE public.prodi
  ADD COLUMN IF NOT EXISTS riasec_profile    JSONB    DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS major_vector      vector(26),
  ADD COLUMN IF NOT EXISTS akademik_minimum  JSONB    DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS must_have_traits  TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS gaya_kerja        JSONB    DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS keketatan_snbt    FLOAT    DEFAULT 10.0,
  ADD COLUMN IF NOT EXISTS prospek_karir     JSONB    DEFAULT '{}';

-- Keterangan kolom prodi baru:
-- riasec_profile   : { R: 0.8, I: 0.9, A: 0.2, S: 0.4, E: 0.5, C: 0.6 }
-- major_vector     : float[26] — representasi 26 dimensi prodi
-- akademik_minimum : { utbk_min: 650, rapor_min: 80, mapel_kunci: ["Matematika","Fisika"] }
-- must_have_traits : ["Tidak buta warna"] — syarat eliminasi keras
-- gaya_kerja       : { outdoor: 0.3, teamwork: 0.7, analytical: 0.9, creative: 0.2 }
-- keketatan_snbt   : persentase penerimaan SNBT (override dari historis)
-- prospek_karir    : { entry: ["Junior Dev"], mid: ["Senior Dev"], ai_resistance: 0.75 }

-- ── ALTER TABLE profiles: tambah kolom Student Assessment ──────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS student_vector    vector(26),
  ADD COLUMN IF NOT EXISTS riasec_result     JSONB    DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS academic_scores   JSONB    DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS assessment_status TEXT     DEFAULT 'not_started'
                                             CHECK (assessment_status IN ('not_started', 'in_progress', 'completed'));

-- Keterangan kolom profiles baru:
-- student_vector    : float[26] — hasil kalkulasi dari assessment 5 modul
-- riasec_result     : { topTraits: ["I","R","A"], scores: { R: 4, I: 5, ... } }
-- academic_scores   : { matematika: 88, fisika: 82, biologi: 75, ... }
-- assessment_status : 'not_started' | 'in_progress' | 'completed'

-- ── Index untuk Vector Similarity Search ───────────────────────────

-- Index cosine similarity untuk major_vector (IVFFlat)
-- Catatan: Buat index setelah ada data (minimal 1 baris dengan vector tidak NULL)
-- CREATE INDEX IF NOT EXISTS idx_prodi_major_vector
--   ON public.prodi USING ivfflat (major_vector vector_cosine_ops) WITH (lists = 100);

-- Index konvensional untuk filtering assessment
CREATE INDEX IF NOT EXISTS idx_profiles_assessment_status ON public.profiles(assessment_status);
CREATE INDEX IF NOT EXISTS idx_prodi_riasec_profile ON public.prodi USING GIN(riasec_profile);
CREATE INDEX IF NOT EXISTS idx_prodi_must_have_traits ON public.prodi USING GIN(must_have_traits);
