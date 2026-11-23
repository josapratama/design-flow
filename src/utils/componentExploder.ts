import { DesignElement } from '../types';

/**
 * Explodes a compound Navbar element into individual editable elements:
 * - 1 rect (Navbar background container)
 * - 1 heading (Brand logo/name)
 * - N text elements (Navigation links)
 * - 1 button (CTA action button)
 * All linked by a single shared groupId (Figma-Style Grouping).
 */
export function explodeNavbar(el: DesignElement): DesignElement[] {
  const brand = el.subTitle || 'App Branding';
  const navLinks = (el.content && el.content.trim() ? el.content : 'Home, Fitur, Harga')
    .split(/[,|]/)
    .map(s => s.trim())
    .filter(Boolean);
  const cta = el.value !== undefined ? el.value : 'Masuk';
  const groupId = 'group_' + Math.random().toString(36).substring(2, 9);
  const baseZ = el.zIndex || 1;

  // 1. Background Container
  const bgElement: DesignElement = {
    id: 'el_' + Math.random().toString(36).substring(2, 9),
    type: 'rect',
    name: 'Navbar Background',
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    zIndex: baseZ,
    fill: el.fill || '#0f172a',
    stroke: el.stroke || '#1e293b',
    strokeWidth: el.strokeWidth || 1,
    borderRadius: el.borderRadius || 12,
    groupId,
  };

  // 2. Brand Name / Logo
  const brandWidth = Math.min(180, Math.max(120, brand.length * 10 + 36));
  const brandElement: DesignElement = {
    id: 'el_' + Math.random().toString(36).substring(2, 9),
    type: 'heading',
    name: 'Brand Logo',
    x: el.x + 16,
    y: el.y + Math.max(0, (el.height - 28) / 2),
    width: brandWidth,
    height: 28,
    zIndex: baseZ + 1,
    content: '⚡ ' + brand,
    fontSize: 15,
    fontWeight: 'bold',
    color: el.color || '#818cf8',
    groupId,
  };

  // 3. CTA Button (if any)
  const ctaWidth = cta ? Math.min(110, Math.max(70, cta.length * 9 + 28)) : 0;
  const ctaElement: DesignElement | null = cta
    ? {
        id: 'el_' + Math.random().toString(36).substring(2, 9),
        type: 'button',
        name: 'CTA Masuk',
        x: el.x + el.width - ctaWidth - 16,
        y: el.y + Math.max(0, (el.height - 34) / 2),
        width: ctaWidth,
        height: 34,
        zIndex: baseZ + 2,
        content: cta,
        fill: '#4f46e5',
        color: '#ffffff',
        borderRadius: 8,
        groupId,
      }
    : null;

  // 4. Nav Links
  const linkElements: DesignElement[] = [];
  const linksEnd = ctaElement ? ctaElement.x - 20 : el.x + el.width - 16;
  const linkWidth = 65;
  const totalLinksWidth = navLinks.length * linkWidth;
  const linkStartX = Math.max(brandElement.x + brandWidth + 16, linksEnd - totalLinksWidth);

  navLinks.forEach((link, idx) => {
    linkElements.push({
      id: 'el_' + Math.random().toString(36).substring(2, 9),
      type: 'text',
      name: `Menu Link: ${link}`,
      x: linkStartX + idx * linkWidth,
      y: el.y + Math.max(0, (el.height - 24) / 2),
      width: linkWidth,
      height: 24,
      zIndex: baseZ + 1,
      content: link,
      fontSize: 13,
      fontWeight: 'medium',
      color: '#cbd5e1',
      textAlign: 'center',
      groupId,
    });
  });

  return [bgElement, brandElement, ...linkElements, ...(ctaElement ? [ctaElement] : [])];
}

/**
 * Explodes a compound Bottom Navigation element into individual editable elements:
 * - 1 rect (Bottom nav background container)
 * - N text elements (Navigation tab links)
 * All linked by a single shared groupId (Figma-Style Grouping).
 */
export function explodeBottomNav(el: DesignElement): DesignElement[] {
  const tabs = (el.content && el.content.trim() ? el.content : 'Beranda, Eksplor, Dompet, Profil')
    .split(/[,|]/)
    .map(s => s.trim())
    .filter(Boolean);
  const groupId = 'group_' + Math.random().toString(36).substring(2, 9);
  const baseZ = el.zIndex || 1;

  // 1. Background
  const bgElement: DesignElement = {
    id: 'el_' + Math.random().toString(36).substring(2, 9),
    type: 'rect',
    name: 'Bottom Nav Background',
    x: el.x,
    y: el.y,
    width: el.width,
    height: el.height,
    zIndex: baseZ,
    fill: el.fill || '#0f172a',
    stroke: el.stroke || '#1e293b',
    strokeWidth: el.strokeWidth || 1,
    borderRadius: el.borderRadius || 0,
    groupId,
  };

  // 2. Each Tab Item (as individual text link)
  const tabWidth = el.width / Math.max(1, tabs.length);
  const tabElements: DesignElement[] = tabs.map((tab, idx) => ({
    id: 'el_' + Math.random().toString(36).substring(2, 9),
    type: 'text',
    name: `Tab: ${tab}`,
    x: el.x + idx * tabWidth,
    y: el.y + Math.max(0, (el.height - 24) / 2),
    width: tabWidth,
    height: 24,
    zIndex: baseZ + 1,
    content: tab,
    fontSize: 12,
    fontWeight: idx === 0 ? 'bold' : 'normal',
    color: idx === 0 ? '#818cf8' : '#94a3b8',
    textAlign: 'center',
    groupId,
  }));

  return [bgElement, ...tabElements];
}
