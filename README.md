# DesignFlow Studio 🎨⚡

> **Platform Desain Dwimoda (Visual + Kode DSL) seperti Canva & Figma** untuk pembuatan Slide Presentasi (PowerPoint), Desain UI/UX & Wireframing, serta Desain Grafis Bebas.

---

## 🚀 Fitur Unggulan

### 1. Dual-Way Engine (Kode ↔ Visual)
- **Visual Canvas**: Drag-and-drop elemen, 8-titik transform resize handles, snapping guide cerdas, dan pengurutan z-index.
- **Code Editor Real-Time (Design DSL)**: Kode deklaratif yang mudah dipahami manusia. Perubahan di kanvas langsung memperbarui kode, dan ketikan di editor langsung memantulkan visualnya.

### 2. Mode Desain Terpadu
- 📽️ **PPT & Slide Presentasi**:
  - Format 16:9 (Full HD) dan 4:3.
  - Multi-slide deck dengan strip thumbnail interaktif di bawah kanvas.
  - **Mode Presenter Fullscreen**: Tampilan slideshow lengkap dengan timer presentasi, navigasi keyboard panah, podium notes, dan audio narration recording.
  - **Ekspor Asli Microsoft PowerPoint (`.pptx`)**: Menghasilkan elemen bentuk, shape, teks, dan tabel asli yang bisa diedit kembali di MS Office / Google Slides.
- 📱 **UI/UX & Wireframing**:
  - Preset perangkat: iPhone 15, Android, iPad Air, MacBook Desktop.
  - Pustaka komponen UI: Navbar, Button (Primer/Sekunder), Form Input, Kartu Metrik/Statistik, Bottom Tab Bar.
  - **Ekspor Kode Produksi**: Menghasilkan komponen **React 19 + Tailwind CSS** siap pakai.
  - **Slide-to-Slide Prototyping Link**: Navigasi interaktif antar slide saat presentasi.
- 🎨 **Desain Grafis & Media Sosial**:
  - Instagram Post (1080x1080), Instagram Story (1080x1920), Dokumen A4, YouTube Thumbnail.
  - Dynamic QR Code Generator: Elemen QR code vektor interaktif dengan kustomisasi URL/teks, warna modul, dan resolusi.
  - Layer manager (bring to front, send to back, step forward/backward).
  - Ekspor gambar resolusi tinggi (PNG, JPEG, SVG) dan dokumen multi-halaman PDF.

### 3. Polyglot Hub Translation Ready 🌐
- Terintegrasi penuh dengan ekosistem **Polyglot Hub** (`http://localhost:4000` / VPS).
- Dukungan 3 Bahasa: **Bahasa Indonesia (ID)**, **English (EN)**, dan **日本語 (JA)**.
- Sinkronisasi otomatis via CLI `bun run sync:i18n` dengan zero-latency runtime fallback.

### 4. Version History & Checkpoints ⏱️
- Simpan snapshot proyek sewaktu-waktu.
- Review riwayat perubahan dengan preview thumbnail, timestamp, dan catatan modifikasi.
- Kemampuan *Rollback / Restore* instan dan unduh arsip JSON checkpoint.

### 5. 100% Native Dialog & Responsive Layout 📱💻
- Bebas dari `alert()` atau `confirm()` browser bawaan — digantikan dengan sistem modal modern berpendar gelap yang terisolasi aman dari benturan viewport atas/bawah (*anti-clipping safe margins*).
- Responsif penuh untuk perangkat Smartphone, Tablet, Laptop, dan Desktop Monitor lebar.

---

## 🛠️ Tech Stack

- **Framework**: React 19, TypeScript
- **Bundler & Tooling**: Vite 8 (Rolldown engine), PostCSS
- **Styling**: Tailwind CSS 4, Lucide React Icons
- **Document Exporter**: PptxGenJS (PowerPoint .pptx), jsPDF (PDF), html-to-image (PNG/SVG)
- **Animation & FX**: Canvas Confetti
- **Deployment**: Docker Multi-stage (Bun + Nginx Alpine)

---

## 💻 Menjalankan Secara Lokal

```bash
# Masuk ke direktori
cd "d:\coding\raspberry pi\project\design-flow"

# Install dependensi
bun install

# Jalankan server pengembangan
bun run dev

# Sinkronisasi kamus Polyglot Hub
bun run sync:i18n

# Kompilasi produksi
bun run build
```

---

## 🐳 Deployment (Docker)

```bash
# Build image
docker build -t design-flow .

# Jalankan container
docker run -d -p 8080:80 --name design-flow-app design-flow
```
