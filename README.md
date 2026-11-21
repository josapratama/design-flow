# DesignFlow Studio 🎨⚡

> **Platform Desain Dwimoda (Visual + Kode DSL) seperti Canva & Figma** untuk pembuatan Slide Presentasi (PowerPoint), Desain UI/UX & Wireframing, serta Desain Grafis Bebas.

---

## 🚀 Fitur Unggulan

### 1. Dual-Way Engine (Kode $\leftrightarrow$ Visual)
- **Visual Canvas**: Drag-and-drop elemen, 8-titik transform resize handles, snapping guide cerdas, dan pengurutan z-index.
- **Code Editor Real-Time (Design DSL)**: Kode deklaratif yang mudah dipahami manusia. Perubahan di kanvas langsung memperbarui kode, dan ketikan di editor langsung memantulkan visualnya.

### 2. Mode Desain Terpadu
- 📽️ **PPT & Slide Presentasi**:
  - Format 16:9 (Full HD) dan 4:3.
  - Multi-slide deck dengan strip thumbnail interaktif di bawah kanvas.
  - **Mode Presenter Fullscreen**: Tampilan slideshow lengkap dengan timer presentasi, navigasi keyboard panah, dan catatan pembicara (*speaker notes*).
  - **Ekspor Asli Microsoft PowerPoint (`.pptx`)**: Menghasilkan elemen bentuk, shape, teks, dan tabel asli yang bisa diedit kembali di MS Office / Google Slides.
- 📱 **UI/UX & Wireframing**:
  - Preset perangkat: iPhone 15, Android, iPad Air, MacBook Desktop.
  - Pustaka komponen UI: Navbar, Button (Primer/Sekunder), Form Input, Kartu Metrik/Statistik, Bottom Tab Bar.
  - **Ekspor Kode Produksi**: Menghasilkan komponen **React 19 + Tailwind CSS** siap pakai.
- 🎨 **Desain Grafis & Media Sosial**:
  - Instagram Post (1080x1080), Instagram Story (1080x1920), Dokumen A4, YouTube Thumbnail.
  - Layer manager (bring to front, send to back, step forward/backward).
  - Ekspor gambar resolusi tinggi (PNG, JPEG, SVG) dan dokumen multi-halaman PDF.

---

## 🛠️ Tech Stack

- **Framework**: React 19, TypeScript
- **Bundler & Tooling**: Vite 8 (Rolldown engine), PostCSS
- **Styling**: Tailwind CSS 4, Lucide React Icons
- **Document Exporter**: PptxGenJS (PowerPoint .pptx), jsPDF (PDF), html-to-image (PNG/SVG)
- **Animation & FX**: Canvas Confetti

---

## 💻 Menjalankan Secara Lokal

```bash
# Masuk ke direktori
cd "d:\coding\raspberry pi\project\design-flow"

# Install dependensi
bun install

# Jalankan server pengembangan
bun run dev

# Kompilasi produksi
bun run build
```
