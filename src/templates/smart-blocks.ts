import { DesignElement } from '../types';

export interface SmartBlockDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'slide' | 'uiux' | 'all';
  generateElements: (startX: number, startY: number) => DesignElement[];
}

export const SMART_BLOCKS: SmartBlockDefinition[] = [
  // 1. TIMELINE / ROADMAP 4 TAHAP
  {
    id: 'timeline-4-steps',
    name: 'Garis Waktu / Timeline (4 Tahap)',
    description: 'Rangkaian 4 fase alur penelitian atau proyek bertahap dengan nomor dan deskripsi.',
    icon: 'GitCommit',
    category: 'all',
    generateElements: (startX = 120, startY = 360) => {
      const now = Date.now();
      const elements: DesignElement[] = [];
      const stepWidth = 360;
      const gap = 40;

      // Connecting line
      elements.push({
        id: `el_${now}_line`,
        type: 'line',
        name: 'Garis Penghubung',
        x: startX + 50,
        y: startY + 40,
        width: (stepWidth + gap) * 3,
        height: 4,
        zIndex: 1,
        stroke: '#4f46e5',
        strokeWidth: 4,
        strokeDash: 'solid',
      });

      const steps = [
        { num: '01', title: 'Fase Analisis', desc: 'Identifikasi masalah & studi literatur' },
        { num: '02', title: 'Fase Desain', desc: 'Pemodelan arsitektur & antarmuka UI' },
        { num: '03', title: 'Fase Bangun', desc: 'Implementasi kode & integrasi sistem' },
        { num: '04', title: 'Fase Uji Coba', desc: 'Evaluasi akurasi & pengujian pengguna' },
      ];

      steps.forEach((s, idx) => {
        const xPos = startX + idx * (stepWidth + gap);

        // Step number badge
        elements.push({
          id: `el_${now}_badge_${idx}`,
          type: 'button',
          name: `Badge ${s.num}`,
          x: xPos + 140,
          y: startY + 16,
          width: 50,
          height: 50,
          zIndex: 3,
          content: s.num,
          fill: '#6366f1',
          borderRadius: 25,
          fontSize: 18,
          fontWeight: 'bold',
        });

        // Step card
        elements.push({
          id: `el_${now}_card_${idx}`,
          type: 'card',
          name: `Kartu ${s.title}`,
          x: xPos,
          y: startY + 80,
          width: stepWidth,
          height: 180,
          zIndex: 2,
          fill: '#131b2e',
          stroke: '#1e293b',
          strokeWidth: 1,
          borderRadius: 18,
          content: `${s.title}\n\n${s.desc}`,
          fontSize: 16,
          color: '#cbd5e1',
          textAlign: 'center',
        });
      });

      return elements;
    },
  },

  // 2. TIM / PEMBICARA 3 KOLOM
  {
    id: 'team-3-cards',
    name: 'Profil Tim / Dewan Penguji (3 Kolom)',
    description: '3 kartu profil lengkap dengan avatar foto, nama pejabat/anggota, dan perannya.',
    icon: 'Users',
    category: 'all',
    generateElements: (startX = 180, startY = 320) => {
      const now = Date.now();
      const elements: DesignElement[] = [];
      const cardWidth = 460;
      const gap = 50;

      const members = [
        {
          name: 'Dr. Hendra Kurniawan',
          role: 'Dosen Pembimbing Utama',
          img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        },
        {
          name: 'Josa Pratama',
          role: 'Ketua Peneliti / Mahasiswa',
          img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
        },
        {
          name: 'Prof. Rina Wijaya',
          role: 'Dosen Penguji Ahli',
          img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
        },
      ];

      members.forEach((m, idx) => {
        const xPos = startX + idx * (cardWidth + gap);

        // Container Card
        elements.push({
          id: `el_${now}_teamcard_${idx}`,
          type: 'card',
          name: `Kartu ${m.name}`,
          x: xPos,
          y: startY,
          width: cardWidth,
          height: 380,
          zIndex: 1,
          fill: '#131b2e',
          stroke: '#1e293b',
          borderRadius: 24,
          content: `\n\n\n\n\n\n\n\n${m.name}\n${m.role}`,
          fontSize: 18,
          color: '#f8fafc',
          textAlign: 'center',
        });

        // Photo
        elements.push({
          id: `el_${now}_teamimg_${idx}`,
          type: 'image',
          name: `Foto ${m.name}`,
          x: xPos + (cardWidth - 140) / 2,
          y: startY + 30,
          width: 140,
          height: 140,
          zIndex: 2,
          imageUrl: m.img,
          borderRadius: 70,
        });
      });

      return elements;
    },
  },

  // 3. MATRIKS SWOT (4 KUADRAN)
  {
    id: 'swot-matrix',
    name: 'Matriks SWOT (4 Kuadran)',
    description: 'Analisis Strength, Weakness, Opportunity, dan Threat dalam kotak berwarna harmonis.',
    icon: 'Grid',
    category: 'all',
    generateElements: (startX = 240, startY = 240) => {
      const now = Date.now();
      const elements: DesignElement[] = [];
      const boxW = 680;
      const boxH = 240;
      const gap = 20;

      const swot = [
        {
          title: '💪 STRENGTHS (KEKUATAN)',
          color: '#10b981',
          content: '• Akurasi ekstraksi OCR tinggi mencapai 98.4%\n• Waktu latensi pencarian < 0.5 detik\n• Antarmuka web responsif dan ergonomis',
          x: startX,
          y: startY,
        },
        {
          title: '⚠️ WEAKNESSES (KELEMAHAN)',
          color: '#ef4444',
          content: '• Ketergantungan pada resolusi scanner fisik\n• Membutuhkan memori server untuk indexing\n• Format naskah kuno tulisan tangan butuh model khusus',
          x: startX + boxW + gap,
          y: startY,
        },
        {
          title: '🚀 OPPORTUNITIES (PELUANG)',
          color: '#3b82f6',
          content: '• Kebijakan digitalisasi arsip nasional SPBE\n• Integrasi ke LLM AI untuk ringkasan dokumen otomatis\n• Penerapan pada instansi desa & perpustakaan',
          x: startX,
          y: startY + boxH + gap,
        },
        {
          title: '🛡️ THREATS (TANTANGAN)',
          color: '#f59e0b',
          content: '• Resiko kebocoran data jika hak akses tidak dikontrol\n• Resistensi perubahan staf dari sistem manual ke digital\n• Fluktuasi koneksi jaringan pada kantor pelosok',
          x: startX + boxW + gap,
          y: startY + boxH + gap,
        },
      ];

      swot.forEach((item, idx) => {
        elements.push({
          id: `el_${now}_swot_${idx}`,
          type: 'card',
          name: item.title,
          x: item.x,
          y: item.y,
          width: boxW,
          height: boxH,
          zIndex: 1,
          fill: '#131b2e',
          stroke: item.color,
          strokeWidth: 2,
          borderRadius: 20,
          content: `${item.title}\n\n${item.content}`,
          fontSize: 16,
          color: '#f1f5f9',
          textAlign: 'left',
        });
      });

      return elements;
    },
  },

  // 4. KARTU PAKET HARGA (3 TIER)
  {
    id: 'pricing-3-tiers',
    name: 'Paket Harga / Pricing (3 Tingkat)',
    description: '3 kartu paket langganan (Starter, Pro Rekomendasi, Enterprise) dengan fitur & CTA.',
    icon: 'CreditCard',
    category: 'all',
    generateElements: (startX = 220, startY = 280) => {
      const now = Date.now();
      const elements: DesignElement[] = [];
      const w = 450;
      const gap = 30;

      const tiers = [
        {
          name: 'Paket Basic',
          price: 'Gratis',
          desc: 'Cocok untuk mahasiswa & tugas akhir individu',
          accent: '#64748b',
          cta: 'Pilih Basic',
        },
        {
          name: 'Paket Pro (Favorit)',
          price: 'Rp 99.000 / bln',
          desc: 'Akses penuh OCR unlimited & ekspor PowerPoint',
          accent: '#6366f1',
          cta: 'Mulai Uji Coba Pro',
        },
        {
          name: 'Paket Enterprise',
          price: 'Hubungi Kami',
          desc: 'Lisensi kampus, dedicated server, & integrasi SSO',
          accent: '#10b981',
          cta: 'Kontak Tim Sales',
        },
      ];

      tiers.forEach((t, idx) => {
        const xPos = startX + idx * (w + gap);
        const isHighlight = idx === 1;

        elements.push({
          id: `el_${now}_price_${idx}`,
          type: 'card',
          name: `Kartu ${t.name}`,
          x: xPos,
          y: startY - (isHighlight ? 20 : 0),
          width: w,
          height: 480 + (isHighlight ? 40 : 0),
          zIndex: isHighlight ? 3 : 1,
          fill: isHighlight ? '#1e1b4b' : '#131b2e',
          stroke: t.accent,
          strokeWidth: isHighlight ? 2 : 1,
          borderRadius: 24,
          content: `${t.name}\n\n${t.price}\n\n${t.desc}\n\n• Akses Editor Visual & Kode\n• Ekspor Dokumen PPTX & PDF\n• Dukungan Teknis 24 Jam`,
          fontSize: 18,
          color: '#ffffff',
          textAlign: 'center',
        });

        elements.push({
          id: `el_${now}_pricecta_${idx}`,
          type: 'button',
          name: `Tombol ${t.name}`,
          x: xPos + 40,
          y: startY + 390 + (isHighlight ? 30 : 0),
          width: w - 80,
          height: 52,
          zIndex: isHighlight ? 4 : 2,
          content: t.cta,
          fill: isHighlight ? '#4f46e5' : '#334155',
          borderRadius: 14,
          fontSize: 16,
        });
      });

      return elements;
    },
  },
  // 6. DASHBOARD 4 KPI & METRIK
  {
    id: 'kpi-dashboard-4-metrics',
    name: 'Dashboard 4 KPI & Metrik',
    description: '4 kartu ringkasan metrik statistik kinerja dengan indikator pertumbuhan persentase.',
    icon: 'TrendingUp',
    category: 'all',
    generateElements: (startX = 80, startY = 320) => {
      const now = Date.now();
      const elements: DesignElement[] = [];
      const w = 340;
      const h = 200;
      const gap = 30;

      const metrics = [
        { label: 'Total Pengguna Aktif', value: '124,500+', growth: '+24.8%', color: '#38bdf8' },
        { label: 'Pendapatan Bulanan (MRR)', value: 'Rp 485 Juta', growth: '+18.2%', color: '#34d399' },
        { label: 'Tingkat Konversi Pitch', value: '42.6%', growth: '+8.4%', color: '#a78bfa' },
        { label: 'Uptime Sistem & Server', value: '99.98%', growth: 'Stabil', color: '#fbbf24' },
      ];

      metrics.forEach((m, idx) => {
        const xPos = startX + idx * (w + gap);

        elements.push({
          id: `el_${now}_kpicard_${idx}`,
          type: 'card',
          name: `Kartu KPI ${m.label}`,
          x: xPos,
          y: startY,
          width: w,
          height: h,
          zIndex: 1,
          fill: '#131b2e',
          stroke: '#1e293b',
          strokeWidth: 1.5,
          borderRadius: 20,
          shadow: 'md',
        });

        elements.push({
          id: `el_${now}_kpilbl_${idx}`,
          type: 'text',
          name: `Label ${m.label}`,
          x: xPos + 24,
          y: startY + 24,
          width: w - 48,
          height: 28,
          zIndex: 2,
          content: m.label,
          fontSize: 14,
          color: '#94a3b8',
        });

        elements.push({
          id: `el_${now}_kpival_${idx}`,
          type: 'heading',
          name: `Nilai ${m.label}`,
          x: xPos + 24,
          y: startY + 60,
          width: w - 48,
          height: 52,
          zIndex: 2,
          content: m.value,
          fontSize: 34,
          fontWeight: 'bold',
          color: '#ffffff',
        });

        // Badge growth
        elements.push({
          id: `el_${now}_kpibadge_${idx}`,
          type: 'button',
          name: `Growth ${m.label}`,
          x: xPos + 24,
          y: startY + 128,
          width: 110,
          height: 32,
          zIndex: 2,
          content: m.growth,
          fill: '#064e3b',
          stroke: '#059669',
          color: '#34d399',
          borderRadius: 9999,
          fontSize: 13,
        });
      });

      return elements;
    },
  },
  // 7. KOMPARASI: MASALAH VS SOLUSI
  {
    id: 'problem-solution-comparison',
    name: 'Komparasi Masalah vs Solusi',
    description: '2 kartu komparasi berdampingan untuk slide pitch deck masalah utama audiens & solusi produk.',
    icon: 'Split',
    category: 'all',
    generateElements: (startX = 120, startY = 240) => {
      const now = Date.now();
      const elements: DesignElement[] = [];
      const cardW = 700;
      const cardH = 500;
      const gap = 80;

      // Problem card (Rose theme)
      elements.push({
        id: `el_${now}_prob_bg`,
        type: 'card',
        name: 'Kartu Masalah (Problem)',
        x: startX,
        y: startY,
        width: cardW,
        height: cardH,
        zIndex: 1,
        fill: '#1c131a',
        stroke: '#f43f5e',
        strokeWidth: 2,
        borderRadius: 24,
        shadow: 'lg',
      });

      elements.push({
        id: `el_${now}_prob_badge`,
        type: 'button',
        name: 'Badge Masalah',
        x: startX + 36,
        y: startY + 36,
        width: 170,
        height: 36,
        zIndex: 2,
        content: 'TANTANGAN SAAT INI',
        fill: '#4c0519',
        stroke: '#f43f5e',
        color: '#fda4af',
        borderRadius: 9999,
        fontSize: 12,
      });

      elements.push({
        id: `el_${now}_prob_title`,
        type: 'heading',
        name: 'Judul Masalah',
        x: startX + 36,
        y: startY + 90,
        width: cardW - 72,
        height: 50,
        zIndex: 2,
        content: 'Proses Manual, Lambat, & Rawan Kesalahan',
        fontSize: 26,
        fontWeight: 'bold',
        color: '#ffffff',
      });

      elements.push({
        id: `el_${now}_prob_desc`,
        type: 'text',
        name: 'Deskripsi Masalah',
        x: startX + 36,
        y: startY + 160,
        width: cardW - 72,
        height: 280,
        zIndex: 2,
        content:
          '• Waktu pembuatan slide presentasi memakan rata-rata 6-10 jam kerja per sesi.\n\n• Desain inkonsisten antar anggota tim dan format file berantakan.\n\n• Sulit mengubah format desain menjadi kode web siap produksi secara instan.\n\n• Ketiadaan live annotation saat presentasi dan feedback kolaborasi tertunda.',
        fontSize: 18,
        color: '#cbd5e1',
      });

      // Solution card (Emerald theme)
      const solX = startX + cardW + gap;

      elements.push({
        id: `el_${now}_sol_bg`,
        type: 'card',
        name: 'Kartu Solusi (Solution)',
        x: solX,
        y: startY,
        width: cardW,
        height: cardH,
        zIndex: 1,
        fill: '#0d1f1b',
        stroke: '#10b981',
        strokeWidth: 2,
        borderRadius: 24,
        shadow: 'lg',
      });

      elements.push({
        id: `el_${now}_sol_badge`,
        type: 'button',
        name: 'Badge Solusi',
        x: solX + 36,
        y: startY + 36,
        width: 170,
        height: 36,
        zIndex: 2,
        content: 'SOLUSI TEROBOSAN',
        fill: '#022c22',
        stroke: '#10b981',
        color: '#6ee7b7',
        borderRadius: 9999,
        fontSize: 12,
      });

      elements.push({
        id: `el_${now}_sol_title`,
        type: 'heading',
        name: 'Judul Solusi',
        x: solX + 36,
        y: startY + 90,
        width: cardW - 72,
        height: 50,
        zIndex: 2,
        content: 'DesignFlow Studio Otomatis Berbasis Vektor & Kode',
        fontSize: 26,
        fontWeight: 'bold',
        color: '#ffffff',
      });

      elements.push({
        id: `el_${now}_sol_desc`,
        type: 'text',
        name: 'Deskripsi Solusi',
        x: solX + 36,
        y: startY + 160,
        width: cardW - 72,
        height: 280,
        zIndex: 2,
        content:
          '• Buat presentasi profesional dalam hitungan detik dengan Smart Blocks siap pakai.\n\n• Sistem tema global konsisten dengan 1 klik (Midnight, Cyberpunk, Emerald).\n\n• Ekspor instan ke PowerPoint PPTX asli, PDF resolusi tinggi, atau Tailwind React.\n\n• Live interactive laser pointer & live doodle annotation saat mode presentasi F5.',
        fontSize: 18,
        color: '#cbd5e1',
      });

      return elements;
    },
  },

  // 8. TESTIMONIAL & KUTIPAN KONSUMEN
  {
    id: 'testimonial-quote-card',
    name: 'Kutipan & Testimonial Tokoh',
    description: 'Kartu testimonial dengan kutipan inspiratif, nama tokoh, avatar, dan badge kepuasan 5 bintang.',
    icon: 'Quote',
    category: 'all',
    generateElements: (startX = 360, startY = 260) => {
      const now = Date.now();
      const elements: DesignElement[] = [];
      const cardW = 1200;
      const cardH = 460;

      // Card container
      elements.push({
        id: `el_${now}_quote_bg`,
        type: 'card',
        name: 'Wadah Testimonial',
        x: startX,
        y: startY,
        width: cardW,
        height: cardH,
        zIndex: 1,
        fill: '#131b2e',
        stroke: '#3b82f6',
        strokeWidth: 1.5,
        borderRadius: 24,
        shadow: 'xl',
      });

      // Rating badge 5 stars
      elements.push({
        id: `el_${now}_quote_rating`,
        type: 'button',
        name: 'Rating Bintang',
        x: startX + 60,
        y: startY + 45,
        width: 180,
        height: 36,
        zIndex: 2,
        content: '★★★★★ 5.0 RATING',
        fill: '#172554',
        stroke: '#3b82f6',
        color: '#fbbf24',
        borderRadius: 9999,
        fontSize: 12,
      });

      // Quote element
      elements.push({
        id: `el_${now}_quote_text`,
        type: 'quote',
        name: 'Kutipan Testimonial',
        x: startX + 60,
        y: startY + 105,
        width: cardW - 120,
        height: 180,
        zIndex: 2,
        content:
          'DesignFlow Studio mengubah cara tim kami mempresentasikan arsitektur sistem ke dewan direksi. Slide terstruktur, rendering kode instan, dan ekspor PowerPoint asli membuat produktivitas melonjak hingga 4 kali lipat.',
        subTitle: 'Dr. Michael Hansen — VP of Engineering, Global Tech Labs',
        fontSize: 24,
        color: '#f8fafc',
      });

      // Avatar
      elements.push({
        id: `el_${now}_quote_avatar`,
        type: 'avatar',
        name: 'Avatar Tokoh',
        x: startX + 60,
        y: startY + 320,
        width: 72,
        height: 72,
        zIndex: 2,
        imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        borderRadius: 9999,
      });

      // Name & Title
      elements.push({
        id: `el_${now}_quote_name`,
        type: 'heading',
        name: 'Nama Tokoh',
        x: startX + 150,
        y: startY + 325,
        width: 600,
        height: 32,
        zIndex: 2,
        content: 'Dr. Michael Hansen',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
      });

      elements.push({
        id: `el_${now}_quote_role`,
        type: 'text',
        name: 'Jabatan Tokoh',
        x: startX + 150,
        y: startY + 360,
        width: 600,
        height: 28,
        zIndex: 2,
        content: 'VP of Engineering, Global Tech Labs • Mantan Riset AI',
        fontSize: 15,
        color: '#94a3b8',
      });

      return elements;
    },
  },
  // 9. MATRIKS ANALISIS SWOT (4 KUADRAN STRATEGIS)
  {
    id: 'swot-analysis-matrix',
    name: 'Matriks Analisis SWOT (4 Kuadran)',
    description: 'Tata letak 4 kartu kuadran strategis: Strengths (Kekuatan), Weaknesses (Kelemahan), Opportunities (Peluang), dan Threats (Ancaman).',
    icon: 'Grid',
    category: 'all',
    generateElements: (startX = 120, startY = 200) => {
      const now = Date.now();
      const elements: DesignElement[] = [];
      const cardW = 480;
      const cardH = 280;
      const gapX = 30;
      const gapY = 24;

      const quadrants = [
        {
          key: 'S',
          title: 'STRENGTHS (KEKUATAN)',
          badgeColor: '#059669',
          badgeBg: '#064e3b',
          badgeText: '#34d399',
          cardBg: '#0b1d19',
          cardBorder: '#059669',
          col: 0,
          row: 0,
          content: '• Keunggulan arsitektur model inferensi ultra cepat (< 12ms)\n• Dataset proprietary berlabel akurasi tinggi (99.4%)\n• Efisiensi biaya infrastruktur 40% lebih rendah dibanding kompetitor',
        },
        {
          key: 'W',
          title: 'WEAKNESSES (KELEMAHAN)',
          badgeColor: '#e11d48',
          badgeBg: '#4c0519',
          badgeText: '#fda4af',
          cardBg: '#1c131a',
          cardBorder: '#e11d48',
          col: 1,
          row: 0,
          content: '• Ketergantungan awal pada konektivitas cloud bandwidth tinggi\n• Edukasi adopsi pengguna baru masih memerlukan panduan onboarding\n• Variasi format input legacy masih dalam tahap standardisasi',
        },
        {
          key: 'O',
          title: 'OPPORTUNITIES (PELUANG)',
          badgeColor: '#0284c7',
          badgeBg: '#082f49',
          badgeText: '#38bdf8',
          cardBg: '#0c1a29',
          cardBorder: '#0284c7',
          col: 0,
          row: 1,
          content: '• Lonjakan adopsi digitalisasi dokumen di sektor enterprise & publik\n• Integrasi API langsung ke ekosistem ERP dan alur kerja analitik tim\n• Ekspansi ke perangkat edge mobile melalui model kuantisasi ringan',
        },
        {
          key: 'T',
          title: 'THREATS (ANCAMAN)',
          badgeColor: '#d97706',
          badgeBg: '#451a03',
          badgeText: '#fcd34d',
          cardBg: '#1f160d',
          cardBorder: '#d97706',
          col: 1,
          row: 1,
          content: '• Regulasi kepatuhan privasi data & residensi regional yang dinamis\n• Akselerasi model open-source alternatif dengan dukungan komunitas luas\n• Potensi fluktuasi biaya penyedia GPU komputasi global',
        },
      ];

      quadrants.forEach((q, idx) => {
        const xPos = startX + q.col * (cardW + gapX);
        const yPos = startY + q.row * (cardH + gapY);

        // Card Container
        elements.push({
          id: `el_${now}_swot_card_${idx}`,
          type: 'card',
          name: `Kuadran ${q.key} - ${q.title}`,
          x: xPos,
          y: yPos,
          width: cardW,
          height: cardH,
          zIndex: 1,
          fill: q.cardBg,
          stroke: q.cardBorder,
          strokeWidth: 1.5,
          borderRadius: 20,
          shadow: 'md',
        });

        // Quadrant Pill Badge
        elements.push({
          id: `el_${now}_swot_badge_${idx}`,
          type: 'button',
          name: `Badge ${q.key}`,
          x: xPos + 24,
          y: yPos + 20,
          width: 240,
          height: 32,
          zIndex: 2,
          content: q.title,
          fill: q.badgeBg,
          stroke: q.cardBorder,
          color: q.badgeText,
          borderRadius: 9999,
          fontSize: 11,
          fontWeight: 'bold',
        });

        // Content Text
        elements.push({
          id: `el_${now}_swot_txt_${idx}`,
          type: 'text',
          name: `Poin ${q.key}`,
          x: xPos + 24,
          y: yPos + 64,
          width: cardW - 48,
          height: cardH - 80,
          zIndex: 2,
          content: q.content,
          fontSize: 14,
          lineHeight: 1.6,
          color: '#e2e8f0',
        });
      });

      return elements;
    },
  },

  // 11. GRID TESTIMONI PELANGGAN (3 ULASAN)
  {
    id: 'customer-testimonials-grid',
    name: 'Grid Testimoni Pelanggan (3 Ulasan)',
    description: '3 kartu ulasan sosial proof berisi rating bintang 5, kutipan testimoni, avatar, nama, dan jabatan.',
    icon: 'Users',
    category: 'all',
    generateElements: (startX = 240, startY = 320) => {
      const now = Date.now();
      const elements: DesignElement[] = [];
      const cardW = 440;
      const cardH = 340;
      const gap = 30;

      const testimonials = [
        {
          rating: '★★★★★',
          quote: '“DesignFlow memangkas waktu persiapan sidang presentasi kami hingga 70%. Alur kerja visual dan kode DSL-nya benar-benar luar biasa!”',
          author: 'Dr. Sarah Amalia',
          role: 'Dosen Pembimbing & Peneliti AI',
          initials: 'SA',
          avatarBg: '#4f46e5',
        },
        {
          rating: '★★★★★',
          quote: '“Kemampuan mengekspor ke kode React 19 + Tailwind bersih membuat proses transisi dari slide pitch ke prototipe MVP aplikasi sangat cepat.”',
          author: 'Rian Pratama',
          role: 'Lead Frontend Engineer',
          initials: 'RP',
          avatarBg: '#059669',
        },
        {
          rating: '★★★★★',
          quote: '“Fitur Teleprompter Podium dan mode audiens multi-layar membuat saya percaya diri saat berbicara di depan ratusan delegasi konferensi.”',
          author: 'Farhan Maulana',
          role: 'Founder & CEO FinTech',
          initials: 'FM',
          avatarBg: '#d97706',
        },
      ];

      testimonials.forEach((t, idx) => {
        const xPos = startX + idx * (cardW + gap);

        // Container Card
        elements.push({
          id: `el_${now}_testi_card_${idx}`,
          type: 'card',
          name: `Kartu Testimoni ${t.author}`,
          x: xPos,
          y: startY,
          width: cardW,
          height: cardH,
          zIndex: 1,
          fill: '#131b2e',
          stroke: '#1e293b',
          strokeWidth: 1.5,
          borderRadius: 20,
          shadow: 'lg',
        });

        // 5 Star Rating
        elements.push({
          id: `el_${now}_testi_stars_${idx}`,
          type: 'text',
          name: `Rating Bintang ${idx + 1}`,
          x: xPos + 24,
          y: startY + 24,
          width: 140,
          height: 24,
          zIndex: 2,
          content: t.rating,
          fontSize: 18,
          color: '#f59e0b',
        });

        // Quote Content
        elements.push({
          id: `el_${now}_testi_quote_${idx}`,
          type: 'text',
          name: `Kutipan ${t.author}`,
          x: xPos + 24,
          y: startY + 60,
          width: cardW - 48,
          height: 160,
          zIndex: 2,
          content: t.quote,
          fontSize: 15,
          lineHeight: 1.6,
          color: '#cbd5e1',
        });

        // Avatar Initials Circle
        elements.push({
          id: `el_${now}_testi_avt_${idx}`,
          type: 'avatar',
          name: `Avatar ${t.author}`,
          x: xPos + 24,
          y: startY + 244,
          width: 52,
          height: 52,
          zIndex: 2,
          fill: t.avatarBg,
          content: t.initials,
          color: '#ffffff',
          borderRadius: 9999,
        });

        // Author Name & Role
        elements.push({
          id: `el_${now}_testi_meta_${idx}`,
          type: 'text',
          name: `Identitas ${t.author}`,
          x: xPos + 88,
          y: startY + 246,
          width: cardW - 110,
          height: 48,
          zIndex: 2,
          content: `${t.author}\n${t.role}`,
          fontSize: 14,
          lineHeight: 1.4,
          color: '#ffffff',
          fontWeight: 'semibold',
        });
      });

      return elements;
    },
  },

  // 12. GRID TANYA JAWAB / FAQ (4 PERTANYAAN)
  {
    id: 'app-faq-accordion-grid',
    name: 'Grid Tanya Jawab / FAQ (4 Kolom)',
    description: '4 kartu tanya jawab interaktif untuk mengatasi keraguan audiens atau pelanggan.',
    icon: 'HelpCircle',
    category: 'all',
    generateElements: (startX = 240, startY = 320) => {
      const now = Date.now();
      const elements: DesignElement[] = [];
      const boxW = 680;
      const boxH = 170;
      const gapX = 40;
      const gapY = 24;

      const faqs = [
        {
          q: '❓ Apakah DesignFlow mendukung ekspor ke format PowerPoint (.pptx)?',
          a: 'Ya, Anda dapat langsung mengunduh seluruh presentasi ke format PPTX asli dengan tata letak teks dan bentuk yang tetap dapat diedit.',
          x: startX,
          y: startY,
        },
        {
          q: '⚡ Bisakah saya menggunakan kode DSL untuk membuat slide secara otomatis?',
          a: 'Tentu! Format DSL deklaratif mendukung pembuatan dan modifikasi slide instan dengan AI atau editor teks favorit Anda.',
          x: startX + boxW + gapX,
          y: startY,
        },
        {
          q: '🔒 Di mana data presentasi dan desain saya disimpan?',
          a: 'Seluruh proyek tersimpan 100% lokal di browser menggunakan IndexedDB aman tanpa mengirimkan konten rahasia ke cloud luar.',
          x: startX,
          y: startY + boxH + gapY,
        },
        {
          q: '💻 Apakah mode presentasi mendukung presenter layar ganda?',
          a: 'Ya, cukup klik Buka Layar Audiens untuk menampilkan slide murni ke proyektor sembari Anda melihat teleprompter naskah di laptop.',
          x: startX + boxW + gapX,
          y: startY + boxH + gapY,
        },
      ];

      faqs.forEach((faq, idx) => {
        elements.push({
          id: `el_${now}_faq_card_${idx}`,
          type: 'card',
          name: `FAQ ${idx + 1}`,
          x: faq.x,
          y: faq.y,
          width: boxW,
          height: boxH,
          zIndex: 1,
          fill: '#131b2e',
          stroke: '#1e293b',
          strokeWidth: 1.5,
          borderRadius: 18,
          shadow: 'md',
        });

        elements.push({
          id: `el_${now}_faq_txt_${idx}`,
          type: 'text',
          name: `Konten FAQ ${idx + 1}`,
          x: faq.x + 24,
          y: faq.y + 18,
          width: boxW - 48,
          height: boxH - 36,
          zIndex: 2,
          content: `${faq.q}\n\n${faq.a}`,
          fontSize: 14,
          lineHeight: 1.6,
          color: '#e2e8f0',
        });
      });

      return elements;
    },
  },

  // 13. KARTU PROFIL TIM (3 KOLOM)
  {
    id: 'team-profiles-3-cols',
    name: 'Profil Anggota Tim (3 Kolom)',
    description: '3 kartu anggota tim inti lengkap dengan foto avatar, peran kepemimpinan, dan lencana keahlian.',
    icon: 'Users',
    category: 'all',
    generateElements: (startX = 240, startY = 320) => {
      const now = Date.now();
      const elements: DesignElement[] = [];
      const cardW = 440;
      const cardH = 340;
      const gap = 30;

      const members = [
        {
          name: 'Adrian Wijaya, M.Sc.',
          role: 'Chief Technology Officer',
          tag: 'AI & Cloud Infrastructure',
          bio: '10+ tahun memimpin tim arsitektur distributed computing dan model NLP multimodal.',
          initials: 'AW',
          avatarBg: '#4f46e5',
        },
        {
          name: 'Nadia Salsabila, B.Des.',
          role: 'Head of Product & Design',
          tag: 'Design System & UX Strategy',
          bio: 'Praktisi human-centered design dengan portofolio produk SaaS terkemuka di Asia Tenggara.',
          initials: 'NS',
          avatarBg: '#0891b2',
        },
        {
          name: 'Dimas Ardiansyah',
          role: 'Lead Fullstack Architect',
          tag: 'React 19 & WebAssembly',
          bio: 'Spesialis optimalisasi performa rendering kanvas grafis dan interoperabilitas kode deklaratif.',
          initials: 'DA',
          avatarBg: '#059669',
        },
      ];

      members.forEach((m, idx) => {
        const xPos = startX + idx * (cardW + gap);

        // Container Card
        elements.push({
          id: `el_${now}_team_card_${idx}`,
          type: 'card',
          name: `Kartu ${m.name}`,
          x: xPos,
          y: startY,
          width: cardW,
          height: cardH,
          zIndex: 1,
          fill: '#131b2e',
          stroke: '#1e293b',
          strokeWidth: 1.5,
          borderRadius: 20,
          shadow: 'lg',
        });

        // Avatar
        elements.push({
          id: `el_${now}_team_avt_${idx}`,
          type: 'avatar',
          name: `Avatar ${m.name}`,
          x: xPos + 24,
          y: startY + 24,
          width: 60,
          height: 60,
          zIndex: 2,
          fill: m.avatarBg,
          content: m.initials,
          color: '#ffffff',
          borderRadius: 9999,
        });

        // Name & Role Header
        elements.push({
          id: `el_${now}_team_hdr_${idx}`,
          type: 'text',
          name: `Header ${m.name}`,
          x: xPos + 96,
          y: startY + 24,
          width: cardW - 120,
          height: 60,
          zIndex: 2,
          content: `${m.name}\n${m.role}`,
          fontSize: 15,
          lineHeight: 1.4,
          color: '#ffffff',
          fontWeight: 'bold',
        });

        // Pill Tag Badge
        elements.push({
          id: `el_${now}_team_pill_${idx}`,
          type: 'button',
          name: `Tag ${m.name}`,
          x: xPos + 24,
          y: startY + 100,
          width: 220,
          height: 28,
          zIndex: 2,
          content: m.tag,
          fill: 'rgba(99, 102, 241, 0.15)',
          stroke: '#4f46e5',
          color: '#a5b4fc',
          borderRadius: 9999,
          fontSize: 10,
          fontWeight: 'semibold',
        });

        // Bio
        elements.push({
          id: `el_${now}_team_bio_${idx}`,
          type: 'text',
          name: `Bio ${m.name}`,
          x: xPos + 24,
          y: startY + 144,
          width: cardW - 48,
          height: 160,
          zIndex: 2,
          content: m.bio,
          fontSize: 14,
          lineHeight: 1.6,
          color: '#cbd5e1',
        });
      });

      return elements;
    },
  },

  // 14. MATRIKS PERBANDINGAN FITUR (VERSUS MATRIX)
  {
    id: 'versus-comparison-matrix',
    name: 'Matriks Perbandingan (Versus / Solusi)',
    description: '2 kartu pembanding berdampingan: Cara Konvensional (Silang) vs Solusi DesignFlow (Centang).',
    icon: 'Split',
    category: 'all',
    generateElements: (startX = 240, startY = 280) => {
      const now = Date.now();
      const elements: DesignElement[] = [];
      const cardW = 680;
      const cardH = 460;
      const gap = 40;

      // Card 1: Cara Lama / Konvensional (Red accent)
      elements.push({
        id: `el_${now}_vs_card_old`,
        type: 'card',
        name: 'Kartu Cara Konvensional',
        x: startX,
        y: startY,
        width: cardW,
        height: cardH,
        zIndex: 1,
        fill: '#181119',
        stroke: '#e11d48',
        strokeWidth: 2,
        borderRadius: 22,
        shadow: 'xl',
      });

      elements.push({
        id: `el_${now}_vs_title_old`,
        type: 'heading',
        name: 'Judul Cara Lama',
        x: startX + 30,
        y: startY + 30,
        width: cardW - 60,
        height: 48,
        zIndex: 2,
        content: '✕ Cara Konvensional',
        fontSize: 24,
        color: '#f43f5e',
        fontWeight: 'bold',
      });

      elements.push({
        id: `el_${now}_vs_text_old`,
        type: 'text',
        name: 'Daftar Masalah Lama',
        x: startX + 30,
        y: startY + 95,
        width: cardW - 60,
        height: cardH - 120,
        zIndex: 2,
        content:
          '✕ Desain slide manual memakan waktu berjam-jam\n\n' +
          '✕ Sulit mengubah format slide ke kode web aplikasi yang nyata\n\n' +
          '✕ File presentasi ukuran raksasa dan rentan korup format\n\n' +
          '✕ Bergantung pada koneksi internet cloud pihak ketiga yang tidak aman\n\n' +
          '✕ Tampilan panggung presenter monoton tanpa kendali teleprompter pintar',
        fontSize: 16,
        lineHeight: 1.6,
        color: '#cbd5e1',
      });

      // Card 2: Solusi Modern DesignFlow (Indigo & Emerald accent highlight)
      elements.push({
        id: `el_${now}_vs_card_new`,
        type: 'card',
        name: 'Kartu Solusi DesignFlow',
        x: startX + cardW + gap,
        y: startY,
        width: cardW,
        height: cardH,
        zIndex: 1,
        fill: '#0f172a',
        stroke: '#10b981',
        strokeWidth: 2.5,
        borderRadius: 22,
        shadow: 'glow-emerald',
      });

      elements.push({
        id: `el_${now}_vs_title_new`,
        type: 'heading',
        name: 'Judul Solusi Modern',
        x: startX + cardW + gap + 30,
        y: startY + 30,
        width: cardW - 60,
        height: 48,
        zIndex: 2,
        content: '✓ Dengan DesignFlow Studio',
        fontSize: 24,
        color: '#34d399',
        fontWeight: 'bold',
      });

      elements.push({
        id: `el_${now}_vs_text_new`,
        type: 'text',
        name: 'Daftar Keunggulan Modern',
        x: startX + cardW + gap + 30,
        y: startY + 95,
        width: cardW - 60,
        height: cardH - 120,
        zIndex: 2,
        content:
          '✓ Sinkronisasi visual & kode DSL deklaratif instan dua arah\n\n' +
          '✓ Ekspor langsung ke React 19 + Tailwind CSS produksi siap pakai\n\n' +
          '✓ 100% Penyimpanan lokal offline IndexedDB super cepat & privat\n\n' +
          '✓ Pustaka Smart Blocks & Palet Harmonisasi Warna Terpadu\n\n' +
          '✓ Mode Presenter Canggih dengan Teleprompter, Laser, & Layar Audiens Ganda',
        fontSize: 16,
        lineHeight: 1.6,
        color: '#ffffff',
      });

      return elements;
    },
  },

  // 15. KARTU 3 PILAR UTAMA / FITUR INTI
  {
    id: 'key-pillars-3-cards',
    name: '3 Pilar Utama / Fitur Inti (3 Kolom)',
    description: '3 kartu pilar strategis bernomor urut (01, 02, 03) dengan judul, uraian solusi, dan tombol aksi.',
    icon: 'Layers',
    category: 'all',
    generateElements: (startX = 240, startY = 300) => {
      const now = Date.now();
      const elements: DesignElement[] = [];
      const cardW = 440;
      const cardH = 380;
      const gap = 30;

      const pillars = [
        {
          num: '01',
          title: 'Arsitektur Skalabel',
          desc: 'Dibangun di atas fondasi React 19 mutakhir dengan rendering kanvas sub-milidetik untuk alur kerja grafis tanpa lag.',
          accent: '#6366f1',
          bg: '#131b2e',
        },
        {
          num: '02',
          title: 'Privasi & Offline Pertama',
          desc: 'Seluruh aset, slide, dan kode DSL tersimpan secara lokal di mesin Anda dengan IndexedDB aman tanpa risiko kebocoran data.',
          accent: '#06b6d4',
          bg: '#131b2e',
        },
        {
          num: '03',
          title: 'Ekspor Produksi Bersih',
          desc: 'Hasilkan kode React + Tailwind CSS bersih, dokumen naskah cetak, serta presentasi PowerPoint .pptx dalam 1 klik.',
          accent: '#10b981',
          bg: '#131b2e',
        },
      ];

      pillars.forEach((p, idx) => {
        const xPos = startX + idx * (cardW + gap);

        // Container Card
        elements.push({
          id: `el_${now}_pillar_card_${idx}`,
          type: 'card',
          name: `Pilar ${p.num} - ${p.title}`,
          x: xPos,
          y: startY,
          width: cardW,
          height: cardH,
          zIndex: 1,
          fill: p.bg,
          stroke: p.accent,
          strokeWidth: 1.5,
          borderRadius: 22,
          shadow: 'lg',
        });

        // Number Badge
        elements.push({
          id: `el_${now}_pillar_num_${idx}`,
          type: 'text',
          name: `Nomor ${p.num}`,
          x: xPos + 24,
          y: startY + 24,
          width: 80,
          height: 36,
          zIndex: 2,
          content: p.num,
          fontSize: 32,
          fontWeight: 'extrabold',
          color: p.accent,
        });

        // Title Heading
        elements.push({
          id: `el_${now}_pillar_hdr_${idx}`,
          type: 'heading',
          name: `Judul Pilar ${p.num}`,
          x: xPos + 24,
          y: startY + 70,
          width: cardW - 48,
          height: 40,
          zIndex: 2,
          content: p.title,
          fontSize: 20,
          fontWeight: 'bold',
          color: '#ffffff',
        });

        // Description
        elements.push({
          id: `el_${now}_pillar_desc_${idx}`,
          type: 'text',
          name: `Uraian Pilar ${p.num}`,
          x: xPos + 24,
          y: startY + 120,
          width: cardW - 48,
          height: 160,
          zIndex: 2,
          content: p.desc,
          fontSize: 15,
          lineHeight: 1.6,
          color: '#cbd5e1',
        });

        // Action Button
        elements.push({
          id: `el_${now}_pillar_btn_${idx}`,
          type: 'button',
          name: `Tombol Pilar ${p.num}`,
          x: xPos + 24,
          y: startY + 300,
          width: cardW - 48,
          height: 46,
          zIndex: 2,
          content: 'Pelajari Selengkapnya →',
          fill: 'rgba(255, 255, 255, 0.06)',
          stroke: p.accent,
          color: '#ffffff',
          borderRadius: 12,
          fontSize: 13,
          fontWeight: 'semibold',
        });
      });

      return elements;
    },
  },
  {
    id: 'bento-grid-4-cards',
    name: 'Bento Grid Showcase (4-Card Apple Style)',
    description: 'Layout bento asimetris modern: 1 kartu hero pilar utama + 3 kartu modular interaktif dengan metrik dan fitur',
    category: 'all',
    icon: 'LayoutGrid',
    generateElements: (originX = 120, originY = 240) => {
      const now = Date.now();
      const elements: DesignElement[] = [];

      const totalW = 1100;
      const totalH = 480;
      const gap = 20;

      // Left Column (Hero Card): width 530, height 480
      const heroW = 530;
      const heroH = totalH;

      // 1. Hero Card Background
      elements.push({
        id: `el_${now}_bento_hero_bg`,
        type: 'card',
        name: 'Hero Bento Card',
        x: originX,
        y: originY,
        width: heroW,
        height: heroH,
        zIndex: 1,
        fill: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%)',
        stroke: 'rgba(99, 102, 241, 0.4)',
        strokeWidth: 1.5,
        borderRadius: 24,
        shadow: '2xl',
      });

      // Hero Badge
      elements.push({
        id: `el_${now}_bento_hero_badge`,
        type: 'badge-shape',
        name: 'Hero Badge',
        x: originX + 28,
        y: originY + 28,
        width: 140,
        height: 32,
        zIndex: 2,
        content: 'CORE ENGINE V2',
        fill: 'rgba(99, 102, 241, 0.25)',
        stroke: '#818cf8',
        color: '#c7d2fe',
        fontSize: 11,
        fontWeight: 'bold',
        borderRadius: 8,
      });

      // Hero Title
      elements.push({
        id: `el_${now}_bento_hero_title`,
        type: 'heading',
        name: 'Hero Title',
        x: originX + 28,
        y: originY + 76,
        width: heroW - 56,
        height: 80,
        zIndex: 2,
        content: 'Arsitektur Modular Generasi Berikutnya',
        fontSize: 28,
        fontWeight: 'extrabold',
        color: '#ffffff',
        lineHeight: 1.25,
      });

      // Hero Description
      elements.push({
        id: `el_${now}_bento_hero_desc`,
        type: 'text',
        name: 'Hero Description',
        x: originX + 28,
        y: originY + 168,
        width: heroW - 56,
        height: 110,
        zIndex: 2,
        content: 'Platform terintegrasi yang menyatukan alur kerja desain modern, rendering instan, dan kolaborasi tanpa hambatan dengan presisi tingkat piksel.',
        fontSize: 15,
        lineHeight: 1.6,
        color: '#94a3b8',
      });

      // Hero Stat Inner Card
      elements.push({
        id: `el_${now}_bento_hero_stat`,
        type: 'card',
        name: 'Hero Stat Inner Card',
        x: originX + 28,
        y: originY + 295,
        width: heroW - 56,
        height: 85,
        zIndex: 2,
        fill: 'rgba(0, 0, 0, 0.35)',
        stroke: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
      });

      elements.push({
        id: `el_${now}_bento_hero_stat_num`,
        type: 'heading',
        name: 'Hero Stat Number',
        x: originX + 48,
        y: originY + 305,
        width: 180,
        height: 40,
        zIndex: 3,
        content: '99.99%',
        fontSize: 26,
        fontWeight: 'extrabold',
        color: '#38bdf8',
      });

      elements.push({
        id: `el_${now}_bento_hero_stat_lbl`,
        type: 'text',
        name: 'Hero Stat Label',
        x: originX + 48,
        y: originY + 348,
        width: 220,
        height: 24,
        zIndex: 3,
        content: 'Uptime SLA Ketersediaan Sistem',
        fontSize: 11,
        color: '#94a3b8',
      });

      // Hero CTA Button
      elements.push({
        id: `el_${now}_bento_hero_btn`,
        type: 'button',
        name: 'Hero CTA Button',
        x: originX + 28,
        y: originY + 400,
        width: heroW - 56,
        height: 48,
        zIndex: 2,
        content: 'Eksplorasi Ekosistem →',
        fill: '#6366f1',
        color: '#ffffff',
        borderRadius: 14,
        fontSize: 14,
        fontWeight: 'semibold',
        shadow: 'glow-indigo',
      });

      // Right Column
      const rightX = originX + heroW + gap;
      const rightW = totalW - heroW - gap;
      const topH = 225;
      const bottomH = totalH - topH - gap;

      // Card 2: Top Wide Card (Enterprise Security)
      elements.push({
        id: `el_${now}_bento_sec_bg`,
        type: 'card',
        name: 'Security Card',
        x: rightX,
        y: originY,
        width: rightW,
        height: topH,
        zIndex: 1,
        fill: 'linear-gradient(135deg, #021a12 0%, #0f172a 100%)',
        stroke: 'rgba(16, 185, 129, 0.4)',
        strokeWidth: 1.5,
        borderRadius: 24,
        shadow: 'xl',
      });

      elements.push({
        id: `el_${now}_bento_sec_badge`,
        type: 'badge-shape',
        name: 'Security Badge',
        x: rightX + 24,
        y: originY + 22,
        width: 140,
        height: 28,
        zIndex: 2,
        content: 'SOC-2 COMPLIANT',
        fill: 'rgba(16, 185, 129, 0.2)',
        stroke: '#34d399',
        color: '#6ee7b7',
        fontSize: 10,
        fontWeight: 'bold',
        borderRadius: 8,
      });

      elements.push({
        id: `el_${now}_bento_sec_title`,
        type: 'heading',
        name: 'Security Title',
        x: rightX + 24,
        y: originY + 62,
        width: rightW - 48,
        height: 40,
        zIndex: 2,
        content: 'Keamanan Tingkat Enterprise',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
      });

      elements.push({
        id: `el_${now}_bento_sec_desc`,
        type: 'text',
        name: 'Security Description',
        x: rightX + 24,
        y: originY + 110,
        width: rightW - 48,
        height: 80,
        zIndex: 2,
        content: 'Enkripsi end-to-end 256-bit standar industri perbankan dengan audit trail real-time dan isolasi data terlindungi.',
        fontSize: 13,
        lineHeight: 1.5,
        color: '#94a3b8',
      });

      // Bottom Row: 2 Split Cards
      const subCardW = (rightW - gap) / 2;
      const bottomY = originY + topH + gap;

      // Card 3: Bottom Left (Live Sync / Collaboration)
      elements.push({
        id: `el_${now}_bento_collab_bg`,
        type: 'card',
        name: 'Collaboration Card',
        x: rightX,
        y: bottomY,
        width: subCardW,
        height: bottomH,
        zIndex: 1,
        fill: 'linear-gradient(135deg, #180512 0%, #0f172a 100%)',
        stroke: 'rgba(244, 63, 94, 0.35)',
        strokeWidth: 1.5,
        borderRadius: 24,
        shadow: 'lg',
      });

      elements.push({
        id: `el_${now}_bento_collab_badge`,
        type: 'badge-shape',
        name: 'Collab Badge',
        x: rightX + 20,
        y: bottomY + 20,
        width: 105,
        height: 26,
        zIndex: 2,
        content: '⚡ REAL-TIME',
        fill: 'rgba(244, 63, 94, 0.2)',
        stroke: '#fb7185',
        color: '#fecdd3',
        fontSize: 10,
        fontWeight: 'bold',
        borderRadius: 8,
      });

      elements.push({
        id: `el_${now}_bento_collab_title`,
        type: 'heading',
        name: 'Collab Title',
        x: rightX + 20,
        y: bottomY + 58,
        width: subCardW - 40,
        height: 35,
        zIndex: 2,
        content: 'Sinkronisasi Cepat',
        fontSize: 17,
        fontWeight: 'bold',
        color: '#ffffff',
      });

      elements.push({
        id: `el_${now}_bento_collab_desc`,
        type: 'text',
        name: 'Collab Desc',
        x: rightX + 20,
        y: bottomY + 100,
        width: subCardW - 40,
        height: 95,
        zIndex: 2,
        content: 'Kolaborasi multi-tim bebas konflik dengan latensi ultra rendah di bawah 30 milidetik.',
        fontSize: 12,
        lineHeight: 1.5,
        color: '#94a3b8',
      });

      // Card 4: Bottom Right (Productivity Boost Metric)
      const card4X = rightX + subCardW + gap;
      elements.push({
        id: `el_${now}_bento_metric_bg`,
        type: 'card',
        name: 'Metric Card',
        x: card4X,
        y: bottomY,
        width: subCardW,
        height: bottomH,
        zIndex: 1,
        fill: 'linear-gradient(135deg, #0e0b1f 0%, #0f172a 100%)',
        stroke: 'rgba(168, 85, 247, 0.35)',
        strokeWidth: 1.5,
        borderRadius: 24,
        shadow: 'lg',
      });

      elements.push({
        id: `el_${now}_bento_metric_num`,
        type: 'heading',
        name: 'Metric Number',
        x: card4X + 20,
        y: bottomY + 25,
        width: subCardW - 40,
        height: 48,
        zIndex: 2,
        content: '+140%',
        fontSize: 34,
        fontWeight: 'extrabold',
        color: '#c084fc',
      });

      elements.push({
        id: `el_${now}_bento_metric_title`,
        type: 'heading',
        name: 'Metric Title',
        x: card4X + 20,
        y: bottomY + 80,
        width: subCardW - 40,
        height: 28,
        zIndex: 2,
        content: 'Efisiensi Waktu Tim',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#ffffff',
      });

      elements.push({
        id: `el_${now}_bento_metric_desc`,
        type: 'text',
        name: 'Metric Desc',
        x: card4X + 20,
        y: bottomY + 115,
        width: subCardW - 40,
        height: 80,
        zIndex: 2,
        content: 'Diukur berdasarkan hasil survei implementasi pada 1.500+ organisasi produktif.',
        fontSize: 12,
        lineHeight: 1.45,
        color: '#94a3b8',
      });

      return elements;
    },
  },
  {
    id: 'hero-header-cover',
    name: 'Cover Presentasi / Hero Header Modern',
    description: 'Header pembuka slide presentasi lengkap: eyebrow badge neon, headline besar, lead text, 2 tombol CTA, dan rating proof',
    icon: 'Sparkles',
    category: 'all',
    generateElements: (startX = 120, startY = 160) => {
      const now = Date.now();
      const elements: DesignElement[] = [];

      // 1. Eyebrow Badge Pill
      elements.push({
        id: `el_${now}_hero_badge`,
        type: 'badge-shape',
        name: 'Hero Eyebrow Pill',
        x: startX,
        y: startY,
        width: 220,
        height: 36,
        zIndex: 2,
        content: '✨ INOVASI DIGITAL 2026',
        fill: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
        stroke: '#818cf8',
        strokeWidth: 1.5,
        color: '#c7d2fe',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
        borderRadius: 20,
      });

      // 2. Main Large Headline
      elements.push({
        id: `el_${now}_hero_title`,
        type: 'heading',
        name: 'Hero Display Title',
        x: startX,
        y: startY + 54,
        width: 880,
        height: 120,
        zIndex: 2,
        content: 'Membangun Solusi Masa Depan dengan Presisi & Kecepatan',
        fontSize: 46,
        fontWeight: 'extrabold',
        color: '#ffffff',
        lineHeight: 1.2,
        shadow: 'glow-indigo',
      });

      // 3. Lead Paragraph Subtitle
      elements.push({
        id: `el_${now}_hero_lead`,
        type: 'text',
        name: 'Hero Lead Text',
        x: startX,
        y: startY + 185,
        width: 780,
        height: 85,
        zIndex: 2,
        content: 'Platform terintegrasi yang memberdayakan tim desain dan rekayasa untuk berkolaborasi tanpa batas, mempercepat peluncuran produk, dan mencapai dampak maksimal.',
        fontSize: 18,
        lineHeight: 1.6,
        color: '#94a3b8',
      });

      // 4. Primary CTA Button (Gradient)
      elements.push({
        id: `el_${now}_hero_btn_primary`,
        type: 'button',
        name: 'Tombol Aksi Utama',
        x: startX,
        y: startY + 285,
        width: 210,
        height: 52,
        zIndex: 2,
        content: 'Mulai Sekarang Gratis →',
        fill: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        color: '#ffffff',
        fontSize: 15,
        fontWeight: 'bold',
        borderRadius: 14,
        shadow: 'glow-indigo',
      });

      // 5. Secondary CTA Button (Glassmorphic)
      elements.push({
        id: `el_${now}_hero_btn_sec`,
        type: 'button',
        name: 'Tombol Aksi Sekunder',
        x: startX + 226,
        y: startY + 285,
        width: 180,
        height: 52,
        zIndex: 2,
        content: 'Jadwalkan Demo',
        fill: 'rgba(255, 255, 255, 0.05)',
        stroke: 'rgba(255, 255, 255, 0.2)',
        strokeWidth: 1.5,
        color: '#e2e8f0',
        fontSize: 15,
        fontWeight: 'semibold',
        borderRadius: 14,
      });

      // 6. Social Proof / Trust Badge
      elements.push({
        id: `el_${now}_hero_proof_card`,
        type: 'card',
        name: 'Social Proof Card',
        x: startX,
        y: startY + 360,
        width: 440,
        height: 48,
        zIndex: 2,
        fill: 'rgba(15, 23, 42, 0.7)',
        stroke: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        content: '⭐⭐⭐⭐⭐ 4.9/5 dari 2.500+ Tim Profesional Terkemuka',
        fontSize: 12,
        color: '#cbd5e1',
      });

      return elements;
    },
  },
  {
    id: 'milestone-timeline-vertical',
    name: 'Roadmap Milestone Vertikal (4 Fase)',
    description: 'Rangkaian 4 fase peta jalan proyek vertikal dengan garis kontinu, node status berwarna, dan kartu uraian capaian',
    icon: 'GitBranch',
    category: 'all',
    generateElements: (startX = 160, startY = 160) => {
      const now = Date.now();
      const elements: DesignElement[] = [];

      const phases = [
        {
          phase: 'FASE 01',
          time: 'Kuartal 1',
          title: 'Fondasi Sistem & Desain Arsitektur',
          desc: 'Riset kebutuhan pengguna, penyusunan arsitektur sistem modular, dan pembentukan fondasi komponen inti.',
          status: 'SELESAI',
          accent: '#10b981',
          badgeBg: 'rgba(16, 185, 129, 0.2)',
          badgeText: '#6ee7b7',
        },
        {
          phase: 'FASE 02',
          time: 'Kuartal 2',
          title: 'Pengembangan Inti & Rilis MVP',
          desc: 'Pengembangan modul utama, peluncuran versi pengujian internal, dan validasi kinerja bersama early adopters.',
          status: 'SELESAI',
          accent: '#10b981',
          badgeBg: 'rgba(16, 185, 129, 0.2)',
          badgeText: '#6ee7b7',
        },
        {
          phase: 'FASE 03',
          time: 'Kuartal 3',
          title: 'Penskalaan & Integrasi Multi-Platform',
          desc: 'Peningkatan kapasitas infrastruktur cloud, sinkronisasi waktu-nyata, dan integrasi API pihak ketiga.',
          status: 'SEDANG BERJALAN',
          accent: '#6366f1',
          badgeBg: 'rgba(99, 102, 241, 0.25)',
          badgeText: '#a5b4fc',
        },
        {
          phase: 'FASE 04',
          time: 'Kuartal 4',
          title: 'Ekspansi Ekosistem & Adopsi Global',
          desc: 'Peluncuran fitur otomasi cerdas, perluasan jaringan mitra strategis, dan peluncuran pasar publik.',
          status: 'DIRENCANAKAN',
          accent: '#f59e0b',
          badgeBg: 'rgba(245, 158, 11, 0.2)',
          badgeText: '#fcd34d',
        },
      ];

      const itemGap = 110;
      const totalH = (phases.length - 1) * itemGap;

      // Continuous connecting vertical line
      elements.push({
        id: `el_${now}_vtime_line`,
        type: 'line',
        name: 'Garis Vertikal Penghubung',
        x: startX + 18,
        y: startY + 20,
        width: 4,
        height: totalH,
        zIndex: 1,
        stroke: 'rgba(99, 102, 241, 0.35)',
        strokeWidth: 4,
      });

      phases.forEach((p, idx) => {
        const yPos = startY + (idx * itemGap);

        // Glowing node circle
        elements.push({
          id: `el_${now}_vtime_node_${idx}`,
          type: 'circle',
          name: `Node ${p.phase}`,
          x: startX + 8,
          y: yPos + 10,
          width: 24,
          height: 24,
          zIndex: 3,
          fill: p.accent,
          stroke: '#0f172a',
          strokeWidth: 3,
          shadow: p.status === 'SEDANG BERJALAN' ? 'glow-indigo' : 'md',
        });

        // Stage Card Container
        elements.push({
          id: `el_${now}_vtime_card_${idx}`,
          type: 'card',
          name: `Kartu ${p.phase}`,
          x: startX + 54,
          y: yPos,
          width: 780,
          height: 94,
          zIndex: 2,
          fill: p.status === 'SEDANG BERJALAN' ? 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)' : 'rgba(15, 23, 42, 0.8)',
          stroke: p.status === 'SEDANG BERJALAN' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(255, 255, 255, 0.08)',
          strokeWidth: p.status === 'SEDANG BERJALAN' ? 1.5 : 1,
          borderRadius: 16,
          shadow: 'md',
        });

        // Phase & Time Badge
        elements.push({
          id: `el_${now}_vtime_badge_${idx}`,
          type: 'badge-shape',
          name: `Status Badge ${p.phase}`,
          x: startX + 74,
          y: yPos + 16,
          width: 140,
          height: 26,
          zIndex: 3,
          content: `${p.phase} • ${p.time}`,
          fill: 'rgba(255, 255, 255, 0.06)',
          stroke: 'rgba(255, 255, 255, 0.15)',
          color: '#cbd5e1',
          fontSize: 10,
          fontWeight: 'bold',
          borderRadius: 6,
        });

        // Status Pill
        elements.push({
          id: `el_${now}_vtime_status_${idx}`,
          type: 'badge-shape',
          name: `Pill Status ${p.phase}`,
          x: startX + 224,
          y: yPos + 16,
          width: 130,
          height: 26,
          zIndex: 3,
          content: p.status,
          fill: p.badgeBg,
          stroke: p.accent,
          color: p.badgeText,
          fontSize: 10,
          fontWeight: 'extrabold',
          borderRadius: 6,
        });

        // Title
        elements.push({
          id: `el_${now}_vtime_title_${idx}`,
          type: 'heading',
          name: `Judul ${p.phase}`,
          x: startX + 74,
          y: yPos + 48,
          width: 320,
          height: 32,
          zIndex: 3,
          content: p.title,
          fontSize: 15,
          fontWeight: 'bold',
          color: '#ffffff',
        });

        // Description
        elements.push({
          id: `el_${now}_vtime_desc_${idx}`,
          type: 'text',
          name: `Deskripsi ${p.phase}`,
          x: startX + 410,
          y: yPos + 22,
          width: 400,
          height: 58,
          zIndex: 3,
          content: p.desc,
          fontSize: 12,
          lineHeight: 1.5,
          color: '#94a3b8',
        });
      });

      return elements;
    },
  },
  // 17. CALL TO ACTION & FINAL SLIDE BANNER (PENUTUP PRESENTASI)
  {
    id: 'cta-banner-final-slide',
    name: 'Banner Penutup & Panggilan Aksi (Final Slide CTA)',
    description: 'Tata letak penutup presentasi premium lengkap dengan ucapan terima kasih, pesan penutup, tombol aksi ganda, dan kartu kontak tim.',
    icon: 'Sparkles',
    category: 'all',
    generateElements: (startX = 160, startY = 130) => {
      const now = Date.now();
      const elements: DesignElement[] = [];
      const bannerW = 1600;
      const bannerH = 800;

      // Outer Container Card
      elements.push({
        id: `el_${now}_cta_bg`,
        type: 'card',
        name: 'Wadah Utama Penutup (CTA)',
        x: startX,
        y: startY,
        width: bannerW,
        height: bannerH,
        zIndex: 1,
        fill: '#0b1120',
        stroke: '#3b82f6',
        strokeWidth: 2,
        borderRadius: 32,
        shadow: '2xl',
      });

      // Accent Top Decorative Bar
      elements.push({
        id: `el_${now}_cta_bar`,
        type: 'card',
        name: 'Garis Aksen Atas',
        x: startX + 40,
        y: startY + 2,
        width: bannerW - 80,
        height: 6,
        zIndex: 2,
        fill: '#38bdf8',
        borderRadius: 9999,
      });

      // Eyebrow Pill Badge
      elements.push({
        id: `el_${now}_cta_badge`,
        type: 'badge-shape',
        name: 'Badge Sesi Tanya Jawab',
        x: startX + 60,
        y: startY + 60,
        width: 320,
        height: 36,
        zIndex: 2,
        content: '✨ TERIMA KASIH • SESI Q&A DIBUKA',
        fill: '#1e293b',
        stroke: '#38bdf8',
        color: '#7dd3fc',
        borderRadius: 9999,
        fontSize: 12,
        fontWeight: 'bold',
      });

      // Big Title / Headline
      elements.push({
        id: `el_${now}_cta_title`,
        type: 'heading',
        name: 'Judul Utama Penutup',
        x: startX + 60,
        y: startY + 116,
        width: bannerW - 120,
        height: 90,
        zIndex: 2,
        content: 'Mari Bangun Masa Depan Digital Bersama Kami',
        fontSize: 46,
        fontWeight: 'extrabold',
        color: '#ffffff',
      });

      // Subheading / Lead Paragraph
      elements.push({
        id: `el_${now}_cta_desc`,
        type: 'text',
        name: 'Pesan Deskripsi Penutup',
        x: startX + 60,
        y: startY + 215,
        width: 1200,
        height: 70,
        zIndex: 2,
        content:
          'Kami siap mewujudkan konsep produk digital Anda menjadi kenyataan yang berdampak tinggi. Diskusikan kebutuhan bisnis Anda atau jadwalkan sesi konsultasi teknologi hari ini.',
        fontSize: 20,
        lineHeight: 1.6,
        color: '#94a3b8',
      });

      // Action Button 1: Primary CTA
      elements.push({
        id: `el_${now}_cta_btn_primary`,
        type: 'button',
        name: 'Tombol Aksi Utama (Konsultasi)',
        x: startX + 60,
        y: startY + 310,
        width: 280,
        height: 56,
        zIndex: 2,
        content: 'Jadwalkan Konsultasi Gratis →',
        fill: '#2563eb',
        color: '#ffffff',
        borderRadius: 14,
        fontSize: 15,
        fontWeight: 'bold',
        shadow: 'lg',
      });

      // Action Button 2: Secondary / Pitch Deck
      elements.push({
        id: `el_${now}_cta_btn_secondary`,
        type: 'button',
        name: 'Tombol Aksi Kedua (Pitch Deck)',
        x: startX + 360,
        y: startY + 310,
        width: 250,
        height: 56,
        zIndex: 2,
        content: 'Unduh Pitch Deck (PDF)',
        fill: 'rgba(255, 255, 255, 0.06)',
        stroke: 'rgba(255, 255, 255, 0.2)',
        color: '#f1f5f9',
        borderRadius: 14,
        fontSize: 15,
        fontWeight: 'semibold',
      });

      // Contact Info Cards (3 Columns)
      const contactCards = [
        {
          label: 'SUREL BISNIS',
          val: 'halo@designflow.id',
          sub: 'Waktu respon < 24 jam',
          accent: '#38bdf8',
        },
        {
          label: 'TELEPON & WHATSAPP',
          val: '+62 812-3456-7890',
          sub: 'Senin - Jumat (09:00 - 18:00 WIB)',
          accent: '#34d399',
        },
        {
          label: 'KANTOR & SITUS WEB',
          val: 'www.designflow.id',
          sub: 'SCBD Lot 28, Senayan, Jakarta Selatan',
          accent: '#818cf8',
        },
      ];

      const cardW = 460;
      const cardGap = 50;
      const contactStartY = startY + 410;

      contactCards.forEach((c, idx) => {
        const cX = startX + 60 + idx * (cardW + cardGap);

        // Card Container
        elements.push({
          id: `el_${now}_contact_box_${idx}`,
          type: 'card',
          name: `Kartu Kontak ${c.label}`,
          x: cX,
          y: contactStartY,
          width: cardW,
          height: 180,
          zIndex: 2,
          fill: '#0f172a',
          stroke: 'rgba(255, 255, 255, 0.08)',
          strokeWidth: 1,
          borderRadius: 20,
        });

        // Eyebrow Label
        elements.push({
          id: `el_${now}_contact_lbl_${idx}`,
          type: 'badge-shape',
          name: `Label Kontak ${idx + 1}`,
          x: cX + 24,
          y: contactStartY + 24,
          width: 170,
          height: 26,
          zIndex: 3,
          content: c.label,
          fill: 'rgba(255, 255, 255, 0.05)',
          stroke: c.accent,
          color: c.accent,
          fontSize: 10,
          fontWeight: 'extrabold',
          borderRadius: 6,
        });

        // Main Contact Value
        elements.push({
          id: `el_${now}_contact_val_${idx}`,
          type: 'heading',
          name: `Isi Kontak ${idx + 1}`,
          x: cX + 24,
          y: contactStartY + 62,
          width: cardW - 48,
          height: 38,
          zIndex: 3,
          content: c.val,
          fontSize: 20,
          fontWeight: 'bold',
          color: '#ffffff',
        });

        // Subtitle / Note
        elements.push({
          id: `el_${now}_contact_sub_${idx}`,
          type: 'text',
          name: `Keterangan Kontak ${idx + 1}`,
          x: cX + 24,
          y: contactStartY + 110,
          width: cardW - 48,
          height: 44,
          zIndex: 3,
          content: c.sub,
          fontSize: 13,
          lineHeight: 1.4,
          color: '#94a3b8',
        });
      });

      return elements;
    },
  },
];
