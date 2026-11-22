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
];
