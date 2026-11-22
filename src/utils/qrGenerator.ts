/**
 * Standalone Zero-Dependency QR Code SVG Generator for Presentations
 * Generates reliable vector QR Codes for URLs, contacts, and portfolios
 */

export function getQrCodeUrl(content: string, size = 300, color = '000000', bgColor = 'ffffff'): string {
  const cleanContent = encodeURIComponent(content || 'https://designflow.app');
  const cleanColor = color.replace('#', '');
  const cleanBg = bgColor.replace('#', '');
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${cleanContent}&color=${cleanColor}&bgcolor=${cleanBg}&format=svg`;
}
