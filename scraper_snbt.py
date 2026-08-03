import sqlite3
import time
import requests
import json
import os
import random

DB_FILE = "smart_choose.db"
JSON_BACKUP_PTN_SNBT = "daftar_id_ptn_snbt.json"
JSON_BACKUP_PTN_SNBP = "daftar_id_ptn_snbp.json"

# Official SNPMB Endpoints
PTN_SNBT_ENDPOINT = "https://snpmb.id/proxy-ptn-sb.php"
PRODI_SNBT_ENDPOINT = "https://snpmb.id/proxy-prodi-sb.php?ptn={id_ptn}"

PTN_SNBP_ENDPOINT = "https://snpmb.id/proxy-ptn-sn.php"
PRODI_SNBP_ENDPOINT = "https://snpmb.id/proxy-prodi-sn.php?ptn={id_ptn}"

# Master RIASEC Categories & Information
JURUSAN_MASTER = [
    {
        "id_jurusan_master": 1,
        "nama_jurusan": "Teknik Informatika / Ilmu Komputer",
        "kategori_riasec": "Investigative",
        "deskripsi": "Fokus pada rekayasa perangkat lunak, algoritma, kecerdasan buatan, dan arsitektur komputasi modern.",
        "prospek_karir": "Software Engineer, AI Developer, Data Scientist, Solutions Architect, Cybersecurity Specialist"
    },
    {
        "id_jurusan_master": 2,
        "nama_jurusan": "Kedokteran",
        "kategori_riasec": "Investigative",
        "deskripsi": "Studi kesehatan manusia, diagnosa medis, patologi, penanganan penyakit, serta ilmu biomedis terkini.",
        "prospek_karir": "Dokter Umum, Spesialis Medis, Peneliti Kesehatan, Konsultan Medis, Akademisi"
    },
    {
        "id_jurusan_master": 3,
        "nama_jurusan": "Teknik Sipil & Perencanaan",
        "kategori_riasec": "Realistic",
        "deskripsi": "Perancangan, pembangunan, dan pemeliharaan infrastruktur fisik seperti jembatan, jalan, dan gedung modern.",
        "prospek_karir": "Structural Engineer, Project Manager Kontraktor, Konsultan Pembangunan, BUMN Infrastruktur"
    },
    {
        "id_jurusan_master": 4,
        "nama_jurusan": "Desain Komunikasi Visual (DKV)",
        "kategori_riasec": "Artistic",
        "deskripsi": "Eksplorasi komunikasi visual, desain grafis, ilustrasi, branding, animasi, dan UX/UI design.",
        "prospek_karir": "UI/UX Designer, Creative Director, Brand Strategist, Animator, Graphic Designer"
    },
    {
        "id_jurusan_master": 5,
        "nama_jurusan": "Psikologi",
        "kategori_riasec": "Social",
        "deskripsi": "Studi tingkah laku manusia, proses mental, psikologi klinis, pendidikan, dan pengembangan SDM.",
        "prospek_karir": "HR Specialist, Konselor Psikologi, User Researcher, Mental Health Advocate, Consultant"
    },
    {
        "id_jurusan_master": 6,
        "nama_jurusan": "Manajemen & Bisnis",
        "kategori_riasec": "Enterprising",
        "deskripsi": "Pengelolaan strategi bisnis, operasional, finansial, kepemimpinan organisasi, dan inovasi pasar.",
        "prospek_karir": "Business Analyst, Product Manager, Corporate Strategist, Entrepreneur, Financial Advisor"
    },
    {
        "id_jurusan_master": 7,
        "nama_jurusan": "Akuntansi & Keuangan",
        "kategori_riasec": "Conventional",
        "deskripsi": "Pencatatan keuangan, auditing, analisis risiko finansial, verifikasi kepatuhan pajak dan audit internal.",
        "prospek_karir": "Auditor Publik, Financial Controller, Tax Consultant, Forensic Accountant, Investment Banker"
    },
    {
        "id_jurusan_master": 8,
        "nama_jurusan": "Teknik Elektro & Otomasi",
        "kategori_riasec": "Realistic",
        "deskripsi": "Penerapan sistem tenaga listrik, robotika, mikroelektronika, serta teknologi kendali dan IoT.",
        "prospek_karir": "Robotics Engineer, Electrical Design Engineer, Energy Analyst, Systems Integrator"
    },
    {
        "id_jurusan_master": 9,
        "nama_jurusan": "Ilmu Komunikasi & Penyiaran",
        "kategori_riasec": "Social",
        "deskripsi": "Studi media massa, hubungan masyarakat, strategi konten digital, jurnalistik, dan komunikasi publik.",
        "prospek_karir": "Public Relations Manager, Media Strategist, Corporate Communication, Content Specialist"
    },
    {
        "id_jurusan_master": 10,
        "nama_jurusan": "Hukum",
        "kategori_riasec": "Enterprising",
        "deskripsi": "Penanganan regulasi, hukum bisnis, legalitas, hak asasi manusia, advokasi litigasi dan non-litigasi.",
        "prospek_karir": "Corporate Legal Counsel, Lawyer / Advokat, Hakim, Notaris, Policy Analyst"
    },
    {
        "id_jurusan_master": 11,
        "nama_jurusan": "Farmasi & Bioteknologi",
        "kategori_riasec": "Investigative",
        "deskripsi": "Formulasi obat-obatan, penelitian biokimia, analisis farmakologi, dan sains klinis.",
        "prospek_karir": "Apoteker, Clinical Researcher, Quality Control Specialist di Industri Farmasi"
    },
    {
        "id_jurusan_master": 12,
        "nama_jurusan": "Sastra & Bahasa Inggris",
        "kategori_riasec": "Artistic",
        "deskripsi": "Studi linguistik, penerjemahan, analisa karya sastra, dan interkultural komunikasi bisnis global.",
        "prospek_karir": "Penerjemah Profesional, Content Editor, Specialist Communication, Diplomat Trainee"
    }
]

BK_STUDENTS_SEED = [
    {"nama": "Ahmad Fauzi", "kelas": "XII MIPA 1", "sekolah": "SMA Negeri 1 Jakarta", "skor_utbk_avg": 695.5, "riasec_top": "Investigative", "pilihan_1_prodi_kode": "311001", "pilihan_2_prodi_kode": "332001", "status_rekomendasi": "Safe"},
    {"nama": "Siti Nurhaliza", "kelas": "XII MIPA 1", "sekolah": "SMA Negeri 1 Jakarta", "skor_utbk_avg": 710.0, "riasec_top": "Investigative", "pilihan_1_prodi_kode": "311001", "pilihan_2_prodi_kode": "361001", "status_rekomendasi": "Target"},
    {"nama": "Budi Pratama", "kelas": "XII MIPA 2", "sekolah": "SMA Negeri 1 Jakarta", "skor_utbk_avg": 645.0, "riasec_top": "Realistic", "pilihan_1_prodi_kode": "332005", "pilihan_2_prodi_kode": "381002", "status_rekomendasi": "Target"},
    {"nama": "Dewi Ananda", "kelas": "XII IPS 1", "sekolah": "SMA Negeri 1 Jakarta", "skor_utbk_avg": 670.0, "riasec_top": "Artistic", "pilihan_1_prodi_kode": "311006", "pilihan_2_prodi_kode": "332002", "status_rekomendasi": "Safe"},
    {"nama": "Rizky Ramadhan", "kelas": "XII IPS 1", "sekolah": "SMA Negeri 1 Jakarta", "skor_utbk_avg": 620.0, "riasec_top": "Enterprising", "pilihan_1_prodi_kode": "311004", "pilihan_2_prodi_kode": "382002", "status_rekomendasi": "Reach"},
    {"nama": "Clarissa Wijaya", "kelas": "XII MIPA 1", "sekolah": "SMA Negeri 1 Jakarta", "skor_utbk_avg": 735.0, "riasec_top": "Investigative", "pilihan_1_prodi_kode": "311002", "pilihan_2_prodi_kode": "361002", "status_rekomendasi": "Safe"},
    {"nama": "Farhan Alamsyah", "kelas": "XII MIPA 2", "sekolah": "SMA Negeri 1 Jakarta", "skor_utbk_avg": 680.0, "riasec_top": "Social", "pilihan_1_prodi_kode": "311005", "pilihan_2_prodi_kode": "333002", "status_rekomendasi": "Target"},
]


def init_db(conn):
    cursor = conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("DROP TABLE IF EXISTS historis_snbt")
    cursor.execute("DROP TABLE IF EXISTS historis_snbp")
    cursor.execute("DROP TABLE IF EXISTS prodi")
    cursor.execute("DROP TABLE IF EXISTS ptn")

    cursor.execute("""
    CREATE TABLE ptn (
        id_ptn TEXT PRIMARY KEY,
        kode_ptn TEXT NOT NULL,
        nama_ptn TEXT NOT NULL,
        jenis_ptn TEXT CHECK(jenis_ptn IN ('Akademik', 'Vokasi', 'PTKIN')),
        provinsi_1 TEXT,
        provinsi_2 TEXT,
        website TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE prodi (
        kode_prodi TEXT PRIMARY KEY,
        id_ptn TEXT NOT NULL,
        nama_prodi TEXT NOT NULL,
        jenjang TEXT,
        daya_tampung_sekarang INTEGER,
        daya_tampung_snbt INTEGER,
        daya_tampung_snbp INTEGER,
        portofolio TEXT,
        FOREIGN KEY (id_ptn) REFERENCES ptn(id_ptn)
    );
    """)

    cursor.execute("""
    CREATE TABLE historis_snbt (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kode_prodi TEXT NOT NULL,
        tahun INTEGER NOT NULL,
        peminat INTEGER NOT NULL,
        daya_tampung INTEGER NOT NULL,
        keketatan_persen REAL NOT NULL,
        FOREIGN KEY (kode_prodi) REFERENCES prodi(kode_prodi)
    );
    """)

    cursor.execute("""
    CREATE TABLE historis_snbp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kode_prodi TEXT NOT NULL,
        tahun INTEGER NOT NULL,
        peminat INTEGER NOT NULL,
        daya_tampung INTEGER NOT NULL,
        terima INTEGER,
        keketatan_persen REAL NOT NULL,
        FOREIGN KEY (kode_prodi) REFERENCES prodi(kode_prodi)
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS jurusan_info (
        id_jurusan_master INTEGER PRIMARY KEY,
        nama_jurusan TEXT NOT NULL,
        kategori_riasec TEXT NOT NULL,
        deskripsi TEXT,
        prospek_karir TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS siswa (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        kelas TEXT NOT NULL,
        sekolah TEXT NOT NULL,
        skor_utbk_avg REAL,
        riasec_top TEXT,
        pilihan_1_prodi_kode TEXT,
        pilihan_2_prodi_kode TEXT,
        status_rekomendasi TEXT
    );
    """)
    conn.commit()


def seed_master_tables(conn):
    cursor = conn.cursor()
    cursor.execute("DELETE FROM jurusan_info")
    for item in JURUSAN_MASTER:
        cursor.execute("""
        INSERT INTO jurusan_info (id_jurusan_master, nama_jurusan, kategori_riasec, deskripsi, prospek_karir)
        VALUES (?, ?, ?, ?, ?)
        """, (item["id_jurusan_master"], item["nama_jurusan"], item["kategori_riasec"], item["deskripsi"], item["prospek_karir"]))
    
    cursor.execute("DELETE FROM siswa")
    for s in BK_STUDENTS_SEED:
        cursor.execute("""
        INSERT INTO siswa (nama, kelas, sekolah, skor_utbk_avg, riasec_top, pilihan_1_prodi_kode, pilihan_2_prodi_kode, status_rekomendasi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (s["nama"], s["kelas"], s["sekolah"], s["skor_utbk_avg"], s["riasec_top"], s["pilihan_1_prodi_kode"], s["pilihan_2_prodi_kode"], s["status_rekomendasi"]))
    conn.commit()


def scrape_all():
    conn = sqlite3.connect(DB_FILE, timeout=30.0)
    init_db(conn)
    seed_master_tables(conn)
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Referer": "https://snpmb.id"
    }

    print("[*] LANGKAH A: Menghubungi Proxy PTN SNBT & SNBP...")
    ptn_snbt_list = []
    ptn_snbp_list = []

    try:
        r_snbt = requests.get(PTN_SNBT_ENDPOINT, headers=headers, timeout=10)
        if r_snbt.status_code == 200:
            ptn_snbt_list = r_snbt.json()
            with open(JSON_BACKUP_PTN_SNBT, "w", encoding="utf-8") as f:
                json.dump(ptn_snbt_list, f, indent=2, ensure_ascii=False)
            print(f"[+] SNBT: Berhasil mengambil {len(ptn_snbt_list)} PTN!")

        r_snbp = requests.get(PTN_SNBP_ENDPOINT, headers=headers, timeout=10)
        if r_snbp.status_code == 200:
            ptn_snbp_list = r_snbp.json()
            with open(JSON_BACKUP_PTN_SNBP, "w", encoding="utf-8") as f:
                json.dump(ptn_snbp_list, f, indent=2, ensure_ascii=False)
            print(f"[+] SNBP: Berhasil mengambil {len(ptn_snbp_list)} PTN!")
    except Exception as e:
        print(f"[!] Warning fetching live PTN endpoints: {e}")

    # Fallback to local backup files if empty
    if not ptn_snbt_list and os.path.exists(JSON_BACKUP_PTN_SNBT):
        with open(JSON_BACKUP_PTN_SNBT, "r", encoding="utf-8") as f:
            ptn_snbt_list = json.load(f)
            
    if not ptn_snbp_list and os.path.exists(JSON_BACKUP_PTN_SNBP):
        with open(JSON_BACKUP_PTN_SNBP, "r", encoding="utf-8") as f:
            ptn_snbp_list = json.load(f)

    cursor = conn.cursor()

    # Combine PTNs to get unique set of id_ptns
    ptn_dict = {}
    for item in (ptn_snbt_list + ptn_snbp_list):
        id_ptn = str(item.get("id_ptn") or item.get("id") or "").strip()
        if not id_ptn or id_ptn in ptn_dict:
            continue
        kode_ptn = str(item.get("kode_ptn") or id_ptn).strip()
        nama_ptn = str(item.get("nama") or item.get("nama_ptn") or "PTN Indonesia").strip()
        web = str(item.get("web") or item.get("website") or f"https://{id_ptn}.ac.id").strip()
        
        is_vokasi = item.get("is_vokasi") == 1
        is_ptkin = item.get("is_ptkin") == 1
        jenis_ptn = "Vokasi" if is_vokasi else ("PTKIN" if is_ptkin else "Akademik")

        prov_array = item.get("provinsi") or []
        prov1 = "Indonesia"
        prov2 = "Indonesia"
        if isinstance(prov_array, list) and len(prov_array) > 0:
            p_obj = prov_array[0]
            prov1 = str(p_obj.get("nama_prov1") or "Indonesia").strip()
            prov2 = str(p_obj.get("nama_prov2") or prov1).strip()
        elif isinstance(item.get("provinsi_1"), str):
            prov1 = item.get("provinsi_1")
            prov2 = item.get("provinsi_2") or prov1

        ptn_dict[id_ptn] = {
            "id_ptn": id_ptn,
            "kode_ptn": kode_ptn,
            "nama_ptn": nama_ptn,
            "jenis_ptn": jenis_ptn,
            "provinsi_1": prov1,
            "provinsi_2": prov2,
            "website": web
        }

    for ptn in ptn_dict.values():
        cursor.execute("""
        INSERT OR REPLACE INTO ptn (id_ptn, kode_ptn, nama_ptn, jenis_ptn, provinsi_1, provinsi_2, website)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (ptn["id_ptn"], ptn["kode_ptn"], ptn["nama_ptn"], ptn["jenis_ptn"], ptn["provinsi_1"], ptn["provinsi_2"], ptn["website"]))

    conn.commit()
    print(f"[+] Total {len(ptn_dict)} PTN tersimpan ke database SQLite.")

    # LANGKAH B: Looping Seluruh id_ptn untuk SNBT dan SNBP
    all_ptn_ids = list(ptn_dict.keys())
    print(f"\n[*] LANGKAH B: Melakukan scraping data Prodi & Historis SNBT + SNBP untuk {len(all_ptn_ids)} PTN...\n")

    total_prodi_inserted = 0
    total_snbt_inserted = 0
    total_snbp_inserted = 0

    for idx, id_ptn in enumerate(all_ptn_ids, start=1):
        nama_ptn = ptn_dict[id_ptn]["nama_ptn"]
        time.sleep(0.2)

        # 1. Fetch SNBT Prodi Data
        snbt_prodi_count = 0
        try:
            r_snbt = requests.get(PRODI_SNBT_ENDPOINT.format(id_ptn=id_ptn), headers=headers, timeout=8)
            if r_snbt.status_code == 200:
                snbt_data = r_snbt.json()
                if isinstance(snbt_data, list):
                    snbt_prodi_count = len(snbt_data)
                    for prodi in snbt_data:
                        id_prodi = str(prodi.get("id_prodi") or prodi.get("id") or "")
                        kode_prodi = str(prodi.get("kode_prodi") or id_prodi or f"{id_ptn}{random.randint(100,999)}")
                        nama_prodi = str(prodi.get("nama") or prodi.get("nama_prodi") or "Program Studi").strip()
                        jenjang = str(prodi.get("jenjang") or "S1").strip()
                        
                        dt_val = prodi.get("daya_tampung_snbt") or prodi.get("daya_tampung") or 50
                        try:
                            daya_tampung_snbt = int(dt_val)
                        except (ValueError, TypeError):
                            daya_tampung_snbt = 50
                            
                        portofolio = str(prodi.get("nama_portofolio") or prodi.get("portofolio") or "Tidak Ada").strip()

                        cursor.execute("""
                        INSERT INTO prodi (kode_prodi, id_ptn, nama_prodi, jenjang, daya_tampung_sekarang, daya_tampung_snbt, portofolio)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(kode_prodi) DO UPDATE SET
                            daya_tampung_snbt = excluded.daya_tampung_snbt,
                            daya_tampung_sekarang = excluded.daya_tampung_snbt
                        """, (kode_prodi, id_ptn, nama_prodi, jenjang, daya_tampung_snbt, daya_tampung_snbt, portofolio))
                        total_prodi_inserted += 1

                        # Insert SNBT History
                        history_arr = prodi.get("history_daya_tampung") or prodi.get("historis") or []
                        for h in history_arr:
                            tahun = int(h.get("tahun") or 2024)
                            p_count = int(h.get("peminat") or 0)
                            dt_count = int(h.get("daya_tampung") or daya_tampung_snbt)
                            keketatan = round((dt_count / p_count) * 100, 2) if p_count > 0 else 5.0

                            cursor.execute("""
                            INSERT INTO historis_snbt (kode_prodi, tahun, peminat, daya_tampung, keketatan_persen)
                            VALUES (?, ?, ?, ?, ?)
                            """, (kode_prodi, tahun, p_count, dt_count, keketatan))
                            total_snbt_inserted += 1
        except Exception as e:
            print(f"[!] Error SNBT id_ptn {id_ptn}: {e}")

        # 2. Fetch SNBP Prodi Data
        time.sleep(0.15)
        snbp_prodi_count = 0
        try:
            r_snbp = requests.get(PRODI_SNBP_ENDPOINT.format(id_ptn=id_ptn), headers=headers, timeout=8)
            if r_snbp.status_code == 200:
                snbp_data = r_snbp.json()
                if isinstance(snbp_data, list):
                    snbp_prodi_count = len(snbp_data)
                    for prodi in snbp_data:
                        id_prodi = str(prodi.get("id_prodi") or prodi.get("id") or "")
                        kode_prodi = str(prodi.get("kode_prodi") or id_prodi or f"{id_ptn}{random.randint(100,999)}")
                        nama_prodi = str(prodi.get("nama") or prodi.get("nama_prodi") or "Program Studi").strip()
                        jenjang = str(prodi.get("jenjang") or "S1").strip()
                        
                        dt_val = prodi.get("daya_tampung_snbp") or prodi.get("daya_tampung") or 40
                        try:
                            daya_tampung_snbp = int(dt_val)
                        except (ValueError, TypeError):
                            daya_tampung_snbp = 40
                            
                        portofolio = str(prodi.get("nama_portofolio") or prodi.get("portofolio") or "Tidak Ada").strip()

                        cursor.execute("""
                        INSERT INTO prodi (kode_prodi, id_ptn, nama_prodi, jenjang, daya_tampung_snbp, portofolio)
                        VALUES (?, ?, ?, ?, ?, ?)
                        ON CONFLICT(kode_prodi) DO UPDATE SET
                            daya_tampung_snbp = excluded.daya_tampung_snbp
                        """, (kode_prodi, id_ptn, nama_prodi, jenjang, daya_tampung_snbp, portofolio))

                        # Insert SNBP History
                        history_arr = prodi.get("history_daya_tampung") or prodi.get("historis") or []
                        for h in history_arr:
                            tahun = int(h.get("tahun") or 2024)
                            p_count = int(h.get("peminat") or 0)
                            dt_count = int(h.get("daya_tampung") or daya_tampung_snbp)
                            terima_count = int(h.get("terima") or dt_count)
                            keketatan = round((dt_count / p_count) * 100, 2) if p_count > 0 else 5.0

                            cursor.execute("""
                            INSERT INTO historis_snbp (kode_prodi, tahun, peminat, daya_tampung, terima, keketatan_persen)
                            VALUES (?, ?, ?, ?, ?, ?)
                            """, (kode_prodi, tahun, p_count, dt_count, terima_count, keketatan))
                            total_snbp_inserted += 1
        except Exception as e:
            print(f"[!] Error SNBP id_ptn {id_ptn}: {e}")

        print(f"[{idx}/{len(all_ptn_ids)}] id_ptn {id_ptn} ({nama_ptn}): {snbt_prodi_count} prodi SNBT & {snbp_prodi_count} prodi SNBP di-scrape")

        if idx % 10 == 0:
            conn.commit()

    conn.commit()

    # Final summary statistics
    cursor.execute("SELECT COUNT(*) FROM ptn")
    final_ptn_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM prodi")
    final_prodi_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM historis_snbt")
    final_snbt_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM historis_snbp")
    final_snbp_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM jurusan_info")
    final_master_count = cursor.fetchone()[0]

    print("\n=======================================================")
    print("      DATABASE SMART CHOOSE (SNBT & SNBP) SEEDED       ")
    print("=======================================================")
    print(f" Total PTN Registered      : {final_ptn_count}")
    print(f" Total Prodi Registered    : {final_prodi_count}")
    print(f" Catatan Historis SNBT     : {final_snbt_count}")
    print(f" Catatan Historis SNBP     : {final_snbp_count}")
    print(f" Jurusan Master (RIASEC)   : {final_master_count}")
    print("=======================================================\n")

    conn.close()

if __name__ == "__main__":
    scrape_all()
