export interface StockPhoto {
  title: string;
  category: 'tech' | 'business' | 'arch' | 'nature' | 'people' | 'abstract';
  tags: string[];
  url: string;
}

export const SAMPLE_STOCK_PHOTOS: StockPhoto[] = [
  // Tech & AI
  {
    title: 'Server Cloud & AI',
    category: 'tech',
    tags: ['server', 'ai', 'cloud', 'datacenter', 'infra'],
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Kode & Pengembangan',
    category: 'tech',
    tags: ['code', 'programming', 'developer', 'react', 'javascript'],
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Hardware & Chipset',
    category: 'tech',
    tags: ['hardware', 'chip', 'processor', 'cpu', 'electronic'],
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Siber & Jaringan',
    category: 'tech',
    tags: ['security', 'network', 'cyber', 'security', 'matrix'],
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Neon Cyberpunk Kota',
    category: 'tech',
    tags: ['cyberpunk', 'neon', 'futuristic', 'night', 'lights'],
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
  },

  // Business & Meeting
  {
    title: 'Pertemuan Eksekutif',
    category: 'business',
    tags: ['business', 'meeting', 'office', 'corporate', 'team'],
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Kolaborasi Brainstorming',
    category: 'business',
    tags: ['startup', 'discussion', 'agile', 'board', 'strategy'],
    url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Kopi & Analisis Data',
    category: 'business',
    tags: ['laptop', 'coffee', 'charts', 'finance', 'work'],
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Presentasi Ruang Sidang',
    category: 'business',
    tags: ['presentation', 'conference', 'pitch', 'slides', 'speech'],
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
  },

  // Architecture & Modern
  {
    title: 'Gedung Kaca Futuristik',
    category: 'arch',
    tags: ['architecture', 'glass', 'modern', 'skyscraper', 'building'],
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Interior Geometris',
    category: 'arch',
    tags: ['interior', 'minimalist', 'clean', 'geometry', 'space'],
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Fasad Simetris Monokrom',
    category: 'arch',
    tags: ['monochrome', 'facade', 'structure', 'design', 'lines'],
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
  },

  // Nature & Landscape
  {
    title: 'Lembah Hijau Berkabut',
    category: 'nature',
    tags: ['nature', 'fog', 'mountain', 'green', 'landscape'],
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Samudra Senja Keemasan',
    category: 'nature',
    tags: ['ocean', 'sunset', 'water', 'calm', 'horizon'],
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Puncak Bersalju',
    category: 'nature',
    tags: ['snow', 'peak', 'ice', 'winter', 'sky'],
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
  },

  // People & Community
  {
    title: 'Insinyur & Perancang',
    category: 'people',
    tags: ['person', 'focus', 'engineer', 'study', 'work'],
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Tim Startup Ceria',
    category: 'people',
    tags: ['team', 'smile', 'diversity', 'creativity', 'group'],
    url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80',
  },

  // Abstract & Dark Mode Wallpaper
  {
    title: 'Gradien Gelap Gelombang Ungu',
    category: 'abstract',
    tags: ['abstract', 'gradient', 'purple', 'waves', 'smooth'],
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Fraktal Partikel Emas',
    category: 'abstract',
    tags: ['gold', 'particles', 'dark', 'luxurious', 'glow'],
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
  },
  {
    title: 'Cairan Neon Fluida',
    category: 'abstract',
    tags: ['fluid', 'neon', 'blue', 'pink', 'wallpaper'],
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80',
  },
];
