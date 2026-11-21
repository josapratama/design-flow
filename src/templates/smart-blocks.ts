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
];
