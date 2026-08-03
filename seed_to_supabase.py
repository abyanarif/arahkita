import os
import sys
import time
import requests
import json
import random

# Read .env.local file cleanly with utf-8-sig
ENV_FILE = ".env.local"
if os.path.exists(ENV_FILE):
    with open(ENV_FILE, "r", encoding="utf-8-sig") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip()

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://geeqgdjgykixomfbzwkr.supabase.co")
anon_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdlZXFnZGpneWtpeG9tZmJ6d2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MzU3MjcsImV4cCI6MjEwMTMxMTcyN30.wgWBGoHRQaz9uZ6R9Om2JHTCM072i-m9B-KVbcu3WMQ")

SUPABASE_KEY = anon_key

PTN_SNBT_ENDPOINT = "https://snpmb.id/proxy-ptn-sb.php"
PRODI_SNBT_ENDPOINT = "https://snpmb.id/proxy-prodi-sb.php?ptn={id_ptn}"

PTN_SNBP_ENDPOINT = "https://snpmb.id/proxy-ptn-sn.php"
PRODI_SNBP_ENDPOINT = "https://snpmb.id/proxy-prodi-sn.php?ptn={id_ptn}"

JSON_BACKUP_PTN_SNBT = "daftar_id_ptn_snbt.json"
JSON_BACKUP_PTN_SNBP = "daftar_id_ptn_snbp.json"

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


def supabase_post(endpoint, records):
    """Bulk UPSERT records into Supabase REST API in chunks of 500"""
    if not records:
        return 0
    
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }

    chunk_size = 500
    total_upserted = 0

    for i in range(0, len(records), chunk_size):
        chunk = records[i:i + chunk_size]
        try:
            res = requests.post(url, json=chunk, headers=headers, timeout=30)
            if res.status_code in [200, 201, 204]:
                total_upserted += len(chunk)
            else:
                print(f"[!] Supabase UPSERT '{endpoint}' response [{res.status_code}]: {res.text[:150]}")
        except Exception as e:
            print(f"[!] Supabase POST error: {e}")

    return total_upserted


def main():
    print("=======================================================")
    print("     SEEDING SNPMB (SNBT & SNBP) TO SUPABASE CLOUD     ")
    print("=======================================================")
    print(f" Target Supabase URL : {SUPABASE_URL}")
    print(f" Supabase JWT Key    : Loaded ({SUPABASE_KEY[:15]}...)")
    print("=======================================================\n")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json, text/plain, */*"
    }

    print("[*] LANGKAH A: Menghubungi proxy PTN SNBT & SNBP...")
    ptn_snbt_list = []
    ptn_snbp_list = []

    try:
        r_snbt = requests.get(PTN_SNBT_ENDPOINT, headers=headers, timeout=10)
        if r_snbt.status_code == 200:
            ptn_snbt_list = r_snbt.json()

        r_snbp = requests.get(PTN_SNBP_ENDPOINT, headers=headers, timeout=10)
        if r_snbp.status_code == 200:
            ptn_snbp_list = r_snbp.json()
    except Exception as e:
        print(f"[!] Warning fetching live PTNs: {e}")

    if not ptn_snbt_list and os.path.exists(JSON_BACKUP_PTN_SNBT):
        with open(JSON_BACKUP_PTN_SNBT, "r", encoding="utf-8") as f:
            ptn_snbt_list = json.load(f)

    if not ptn_snbp_list and os.path.exists(JSON_BACKUP_PTN_SNBP):
        with open(JSON_BACKUP_PTN_SNBP, "r", encoding="utf-8") as f:
            ptn_snbp_list = json.load(f)

    # 1. Upsert PTNs
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

        ptn_dict[id_ptn] = {
            "id_ptn": id_ptn,
            "kode_ptn": kode_ptn,
            "nama_ptn": nama_ptn,
            "jenis_ptn": jenis_ptn,
            "provinsi_1": prov1,
            "provinsi_2": prov2,
            "website": web
        }

    ptn_records = list(ptn_dict.values())
    print(f"[*] Pushing {len(ptn_records)} PTN ke Supabase Cloud...")
    count_ptn = supabase_post("ptn", ptn_records)
    print(f"[+] Berhasil meng-upsert {count_ptn} PTN!")

    # 2. Upsert Jurusan Master & Siswa
    supabase_post("jurusan_master", JURUSAN_MASTER)
    supabase_post("siswa", BK_STUDENTS_SEED)
    print("[+] Jurusan Master & Siswa BK berhasil di-upsert!")

    # 3. Scraping Prodi & Historis for all PTNs & Bulk Push to Supabase
    all_ptn_ids = list(ptn_dict.keys())
    print(f"\n[*] LANGKAH B: Scraping & Pushing Prodi & Historis (SNBT + SNBP) untuk {len(all_ptn_ids)} PTN ke Supabase...\n")

    all_prodi_map = {}
    all_historis_records = []

    for idx, id_ptn in enumerate(all_ptn_ids, start=1):
        nama_ptn = ptn_dict[id_ptn]["nama_ptn"]
        time.sleep(0.15)

        # SNBT
        try:
            r_snbt = requests.get(PRODI_SNBT_ENDPOINT.format(id_ptn=id_ptn), headers=headers, timeout=8)
            if r_snbt.status_code == 200:
                snbt_data = r_snbt.json()
                if isinstance(snbt_data, list):
                    for prodi in snbt_data:
                        id_prodi = str(prodi.get("id_prodi") or prodi.get("id") or "")
                        kode_prodi = str(prodi.get("kode_prodi") or id_prodi or f"{id_ptn}{random.randint(100,999)}")
                        nama_prodi = str(prodi.get("nama") or prodi.get("nama_prodi") or "Program Studi").strip()
                        jenjang = str(prodi.get("jenjang") or "S1").strip()
                        dt_val = prodi.get("daya_tampung_snbt") or prodi.get("daya_tampung") or 50
                        try:
                            daya_tampung_snbt = int(dt_val)
                        except Exception:
                            daya_tampung_snbt = 50
                        portofolio = str(prodi.get("nama_portofolio") or prodi.get("portofolio") or "Tidak Ada").strip()

                        if kode_prodi not in all_prodi_map:
                            all_prodi_map[kode_prodi] = {
                                "kode_prodi": kode_prodi,
                                "id_ptn": id_ptn,
                                "nama_prodi": nama_prodi,
                                "jenjang": jenjang,
                                "daya_tampung_sekarang": daya_tampung_snbt,
                                "daya_tampung_snbt": daya_tampung_snbt,
                                "daya_tampung_snbp": 40,
                                "portofolio": portofolio
                            }
                        else:
                            all_prodi_map[kode_prodi]["daya_tampung_snbt"] = daya_tampung_snbt
                            all_prodi_map[kode_prodi]["daya_tampung_sekarang"] = daya_tampung_snbt

                        history_arr = prodi.get("history_daya_tampung") or prodi.get("historis") or []
                        for h in history_arr:
                            tahun = int(h.get("tahun") or 2024)
                            p_count = int(h.get("peminat") or 0)
                            dt_count = int(h.get("daya_tampung") or daya_tampung_snbt)
                            keketatan = round((dt_count / p_count) * 100, 2) if p_count > 0 else 5.0
                            keketatan_safe = min(99.99, max(0.01, keketatan))

                            all_historis_records.append({
                                "kode_prodi": kode_prodi,
                                "jalur": "SNBT",
                                "tahun": tahun,
                                "peminat": p_count,
                                "daya_tampung": dt_count,
                                "keketatan_persen": keketatan_safe
                            })
        except Exception as e:
            print(f"[!] Error SNBT id_ptn {id_ptn}: {e}")

        # SNBP
        time.sleep(0.1)
        try:
            r_snbp = requests.get(PRODI_SNBP_ENDPOINT.format(id_ptn=id_ptn), headers=headers, timeout=8)
            if r_snbp.status_code == 200:
                snbp_data = r_snbp.json()
                if isinstance(snbp_data, list):
                    for prodi in snbp_data:
                        id_prodi = str(prodi.get("id_prodi") or prodi.get("id") or "")
                        kode_prodi = str(prodi.get("kode_prodi") or id_prodi or f"{id_ptn}{random.randint(100,999)}")
                        nama_prodi = str(prodi.get("nama") or prodi.get("nama_prodi") or "Program Studi").strip()
                        jenjang = str(prodi.get("jenjang") or "S1").strip()
                        dt_val = prodi.get("daya_tampung_snbp") or prodi.get("daya_tampung") or 40
                        try:
                            daya_tampung_snbp = int(dt_val)
                        except Exception:
                            daya_tampung_snbp = 40
                        portofolio = str(prodi.get("nama_portofolio") or prodi.get("portofolio") or "Tidak Ada").strip()

                        if kode_prodi not in all_prodi_map:
                            all_prodi_map[kode_prodi] = {
                                "kode_prodi": kode_prodi,
                                "id_ptn": id_ptn,
                                "nama_prodi": nama_prodi,
                                "jenjang": jenjang,
                                "daya_tampung_sekarang": daya_tampung_snbp,
                                "daya_tampung_snbt": 50,
                                "daya_tampung_snbp": daya_tampung_snbp,
                                "portofolio": portofolio
                            }
                        else:
                            all_prodi_map[kode_prodi]["daya_tampung_snbp"] = daya_tampung_snbp

                        history_arr = prodi.get("history_daya_tampung") or prodi.get("historis") or []
                        for h in history_arr:
                            tahun = int(h.get("tahun") or 2024)
                            p_count = int(h.get("peminat") or 0)
                            dt_count = int(h.get("daya_tampung") or daya_tampung_snbp)
                            keketatan = round((dt_count / p_count) * 100, 2) if p_count > 0 else 5.0
                            keketatan_safe = min(99.99, max(0.01, keketatan))

                            all_historis_records.append({
                                "kode_prodi": kode_prodi,
                                "jalur": "SNBP",
                                "tahun": tahun,
                                "peminat": p_count,
                                "daya_tampung": dt_count,
                                "keketatan_persen": keketatan_safe
                            })
        except Exception as e:
            print(f"[!] Error SNBP id_ptn {id_ptn}: {e}")

        print(f"[{idx}/{len(all_ptn_ids)}] Scraped id_ptn {id_ptn} ({nama_ptn})")

    # Push prodis to Supabase
    prodi_records = list(all_prodi_map.values())
    print(f"\n[*] Pushing {len(prodi_records)} prodi ke Supabase Cloud...")
    total_prodi_count = supabase_post("prodi", prodi_records)

    # Push historis seleksi to Supabase
    print(f"[*] Pushing {len(all_historis_records)} catatan historis (SNBT & SNBP) ke Supabase Cloud...")
    total_historis_count = supabase_post("historis_seleksi", all_historis_records)

    print("\n=======================================================")
    print("   SEEDING KE SUPABASE CLOUD BERHASIL DILAKUKAN!       ")
    print("=======================================================")
    print(f" Total PTN Registered      : {len(ptn_records)}")
    print(f" Total Prodi Registered    : {total_prodi_count}")
    print(f" Catatan Historis Seleksi  : {total_historis_count}")
    print("=======================================================\n")

if __name__ == "__main__":
    main()
