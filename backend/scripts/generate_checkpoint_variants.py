"""Generates alternate content variants for a skill's checkpoint tasks using
Gemini, so the same checkpoint can present a different fictional client,
color palette, and motif each time — while keeping the underlying skill
requirements (item counts, deadline, task shape) identical across variants.

Writes src/data/checkpointVariants.js. Not part of the shipped app's runtime
path — this is a one-time (or re-run-when-needed) content authoring aid,
same spirit as sync_units_from_frontend.mjs.

Usage:
    cd backend
    .venv\\Scripts\\python scripts\\generate_checkpoint_variants.py      (Windows)
"""

import json
import os
import re
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

BACKEND_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BACKEND_DIR.parent
load_dotenv(BACKEND_DIR / ".env")

API_KEY = os.environ["GEMINI_API_KEY"]
MODEL = os.environ.get("GEMINI_MODEL_PREMIUM", "gemini-3.5-flash")

client = genai.Client(api_key=API_KEY)

# Reference content pulled straight from src/data/skillMaps.js + reviewFeedback.js
# for the Desain Grafis golden path — used as a style/structure template so
# generated variants match tone, item counts, and difficulty.
CHECKPOINTS = [
    {
        "checkpoint_id": "checkpoint-1",
        "task_shape": "1 poster promosi tunggal (JPG/PNG, 1080x1080px)",
        "deadline": "7 hari",
        "n_brief_bullets": 3,
        "n_checklist": 4,
        "n_feedback_points": 2,
        "original_client": "Kopi Senja (kedai kopi, palet cokelat hangat/merah bata & kuning emas)",
        "original_brief_bullets": [
            "Wajib Terbaca Jelas: menampilkan promo bertuliskan \"DISKON 50%\" yang memiliki kontras tinggi dari background agar terbaca dalam 2 detik.",
            "Wajib Memasang Logo: harus menyertakan Logo Bulat \"KOPI SENJA\" di sisi pojok atas.",
            "Warna Identitas: menggunakan palet dominasi warna cokelat hangat / warm.",
        ],
        "original_checklist": [
            "Ukuran 1080x1080px (format Instagram Feed)",
            "Warna brand konsisten (merah bata & kuning emas)",
            "Logo & headline promo terbaca jelas dalam 2 detik",
            "Kontras teks minimal 4.5:1 sudah dicek",
        ],
        "original_feedback_points": [
            ("Hierarchy visual belum jelas", "mata tidak tahu harus lihat ke mana dulu. Nama produk perlu lebih dominan dari elemen dekoratif."),
            ("Font yang dipakai di caption terlalu tipis", "terlalu tipis untuk dibaca di ukuran mobile. Coba ganti ke weight yang lebih tebal atau ukuran minimal 14pt."),
        ],
    },
    {
        "checkpoint_id": "checkpoint-2",
        "task_shape": "1 set (3 file) desain Instagram Feed konsisten: promo, testimoni, produk baru",
        "deadline": "7 hari",
        "n_brief_bullets": 3,
        "n_checklist": 4,
        "n_feedback_points": 2,
        "original_client": "Kopi Senja (kedai kopi)",
        "original_brief_bullets": [
            "Wajib 3 Desain Konsisten: promo, testimoni, dan produk baru — grid, alignment, dan posisi logo harus sama di ketiganya.",
            "Hierarki Menyesuaikan Tujuan: elemen dominan boleh beda tiap desain (diskon/kutipan/produk), tapi sistem font & warna tetap satu.",
            "Ikuti Brand Guideline Mini: maksimal 3 warna (utama, aksen, netral), logo di posisi baku.",
        ],
        "original_checklist": [
            "Grid, margin & alignment sama di ketiga desain",
            "Elemen dominan sesuai tujuan tiap konten (promo/testimoni/produk)",
            "Palet warna & posisi logo konsisten dengan brand guideline",
            "Feedback revisi sebelumnya sudah diterapkan",
        ],
        "original_feedback_points": [
            ("Margin & grid tidak konsisten antar desain", "desain testimoni marginnya lebih sempit dibanding dua desain lain — kelihatan begitu ketiganya dijajarkan di grid feed."),
            ("Posisi logo berpindah-pindah", "di desain promo logo ada di kanan atas, tapi di desain produk baru pindah ke kiri bawah — brand guideline mini belum diikuti konsisten."),
        ],
    },
    {
        "checkpoint_id": "checkpoint-3",
        "task_shape": "1 set (5 file) konten Instagram Feed + siap diadaptasi ke Story (9:16), proyek akhir/final project",
        "deadline": "10 hari",
        "n_brief_bullets": 4,
        "n_checklist": 4,
        "n_feedback_points": 2,
        "original_client": "Toko Batik Nusantara (toko batik, motif tradisional dipadukan gaya modern untuk menjangkau pembeli muda)",
        "original_brief_bullets": [
            "Wajib 5 Konten Konsisten: satu sistem visual (grid, tipografi, warna) diterapkan di seluruh 5 desain Instagram Feed.",
            "Motif Batik Otentik: motif tradisional dipertahankan, dipadukan dengan layout & tipografi modern.",
            "Siap Multi-Format: sistem desain harus bisa diadaptasi ke Story (9:16) tanpa distorsi.",
            "Sertakan Rasional Desain: ringkasan singkat alasan di balik keputusan warna, tipografi, dan layout.",
        ],
        "original_checklist": [
            "Kelima desain menerapkan satu sistem visual yang sama",
            "Motif batik otentik terjaga, dipadukan gaya modern",
            "Layout siap diadaptasi ke format Story (9:16)",
            "Rasional desain (alasan keputusan) disertakan",
        ],
        "original_feedback_points": [
            ("Adaptasi ke Story terlihat dipaksa", "beberapa elemen headline di versi Story terlihat kepotong — perlu safe margin ekstra di layout aslinya supaya adaptasi 9:16 lebih mulus."),
            ("Rasional desain belum tertulis", "klien butuh 2-3 kalimat kenapa palet warna & tipografi ini dipilih, supaya ia percaya diri approve dan bisa jelaskan ke timnya sendiri."),
        ],
    },
]

PROMPT_TEMPLATE = """Kamu membantu menulis 2 VARIAN ALTERNATIF untuk sebuah checkpoint di platform belajar desain grafis WADAH. \
Ini untuk skill "Desain Grafis". Checkpoint ini menguji skill yang SAMA setiap kali dikerjakan, tapi brief-nya (klien fiktif UMKM, \
palet warna, dan motif/tema visual) harus berbeda-beda supaya tidak monoton kalau dikerjakan ulang.

TUGAS checkpoint ini: {task_shape}
Deadline: {deadline}
Klien ASLI (jangan dipakai lagi, buat yang BEDA): {original_client}

Brief bullet ASLI (buat {n_brief_bullets} versi baru dengan STRUKTUR sama tapi klien/warna/tema beda):
{original_brief_bullets_text}

Checklist submission ASLI (buat {n_checklist} versi baru — kategori requirement-nya harus SAMA jenisnya, cuma nilai warna/klien-nya beda):
{original_checklist_text}

Feedback reviewer ASLI untuk submission pertama yang masih perlu revisi (buat {n_feedback_points} poin kritik baru, jenis masalahnya boleh mirip levelnya tapi detail spesifiknya harus cocok sama klien/brief baru):
{original_feedback_points_text}

ATURAN:
- Invent klien UMKM fiktif Indonesia yang BEDA total dari klien asli (nama, jenis usaha, palet warna, dan — khusus kalau brief aslinya punya elemen budaya/motif — tema visual budaya lain yang berbeda).
- Bahasa Indonesia casual-profesional, gaya sama seperti versi asli.
- JUMLAH item (brief bullets, checklist, feedback points) harus PERSIS sama dengan versi asli.
- `checklist` submission harus tetap menguji kategori skill yang sama (ukuran kanvas/sistem visual, konsistensi warna brand, keterbacaan/hierarki, dll — sesuaikan sama checkpoint ini) tapi dengan nilai spesifik (warna, motif) sesuai klien baru.
- `feedback.checklist` (reminder revisi) harus berupa ringkasan actionable dari `feedback.points`, PERSIS {n_feedback_points} item.
- `approvedComment` merujuk balik ke nama klien baru dan terasa positif/menyemangati.
- `info` itu 1 kalimat pendek yang menyebut nama klien baru.
- `instruction` itu 1 kalimat "Kumpulkan ... sesuai brief di atas" yang menyebut nama klien baru.

Balas HANYA dengan JSON array berisi TEPAT 2 objek, tidak ada teks lain, tidak ada markdown fence. Setiap objek punya bentuk PERSIS:
{{
  "clientName": string,
  "info": string,
  "instruction": string,
  "briefBullets": [{{"strong": string, "rest": string}}, ...],
  "checklist": [string, ...],
  "feedback": {{
    "intro": string,
    "points": [{{"title": string, "detail": string}}, ...],
    "checklist": [string, ...],
    "approvedComment": string
  }}
}}
"""


def build_prompt(cp: dict) -> str:
    bullets_text = "\n".join(f"- {b}" for b in cp["original_brief_bullets"])
    checklist_text = "\n".join(f"- {c}" for c in cp["original_checklist"])
    feedback_text = "\n".join(f"- {t}: {d}" for t, d in cp["original_feedback_points"])
    return PROMPT_TEMPLATE.format(
        task_shape=cp["task_shape"],
        deadline=cp["deadline"],
        original_client=cp["original_client"],
        n_brief_bullets=cp["n_brief_bullets"],
        n_checklist=cp["n_checklist"],
        n_feedback_points=cp["n_feedback_points"],
        original_brief_bullets_text=bullets_text,
        original_checklist_text=checklist_text,
        original_feedback_points_text=feedback_text,
    )


def generate_variants(cp: dict) -> list:
    prompt = build_prompt(cp)
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json", temperature=1.0),
    )
    text = response.text.strip()
    text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()
    variants = json.loads(text)
    assert isinstance(variants, list) and len(variants) == 2, f"Expected 2 variants, got {variants!r}"
    for v in variants:
        assert len(v["briefBullets"]) == cp["n_brief_bullets"], v
        assert len(v["checklist"]) == cp["n_checklist"], v
        assert len(v["feedback"]["points"]) == cp["n_feedback_points"], v
        assert len(v["feedback"]["checklist"]) == cp["n_feedback_points"], v
    return variants


def js_string(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def render_js(all_variants: dict) -> str:
    lines = []
    lines.append("// AI-generated alternate content for Desain Grafis checkpoints — each")
    lines.append("// checkpoint keeps the same underlying skill test (same item counts, same")
    lines.append("// task shape/deadline) but a different fictional client, color palette, and")
    lines.append("// motif per variant, so repeating a checkpoint doesn't feel identical every")
    lines.append("// time. Generated by backend/scripts/generate_checkpoint_variants.py — the")
    lines.append("// checklist/briefBullets fields here REPLACE (not merge with) the matching")
    lines.append("// fields on the skillMaps.js node when a variant is active.")
    lines.append("export const CHECKPOINT_VARIANTS = {")
    lines.append("  desain: {")
    for cp_id, variants in all_variants.items():
        lines.append(f"    {js_string(cp_id)}: [")
        for v in variants:
            lines.append("      {")
            lines.append(f"        clientName: {js_string(v['clientName'])},")
            lines.append(f"        info: {js_string(v['info'])},")
            lines.append(f"        instruction: {js_string(v['instruction'])},")
            lines.append("        briefBullets: [")
            for b in v["briefBullets"]:
                lines.append(f"          {{ strong: {js_string(b['strong'])}, rest: {js_string(b['rest'])} }},")
            lines.append("        ],")
            lines.append("        checklist: [")
            for c in v["checklist"]:
                lines.append(f"          {js_string(c)},")
            lines.append("        ],")
            lines.append("        feedback: {")
            lines.append(f"          intro: {js_string(v['feedback']['intro'])},")
            lines.append("          points: [")
            for p in v["feedback"]["points"]:
                lines.append(f"            {{ title: {js_string(p['title'])}, detail: {js_string(p['detail'])} }},")
            lines.append("          ],")
            lines.append("          checklist: [")
            for c in v["feedback"]["checklist"]:
                lines.append(f"            {js_string(c)},")
            lines.append("          ],")
            lines.append(f"          approvedComment: {js_string(v['feedback']['approvedComment'])},")
            lines.append("        },")
            lines.append("      },")
        lines.append("    ],")
    lines.append("  },")
    lines.append("};")
    lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    all_variants = {}
    for cp in CHECKPOINTS:
        print(f"Generating variants for {cp['checkpoint_id']}...")
        all_variants[cp["checkpoint_id"]] = generate_variants(cp)
        for v in all_variants[cp["checkpoint_id"]]:
            print(f"  - {v['clientName']}")

    out_path = FRONTEND_DIR / "src/data/checkpointVariants.js"
    out_path.write_text(render_js(all_variants), encoding="utf-8")
    print(f"\nWrote {out_path}")
