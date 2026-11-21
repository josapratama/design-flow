import { toPng, toJpeg, toSvg } from 'html-to-image';
import jsPDF from 'jspdf';
import { DesignProject } from '../types';

const exportFilter = (node: HTMLElement) => {
  if (node.classList && (node.classList.contains('transform-handles') || node.classList.contains('export-ignore'))) {
    return false;
  }
  if (node.getAttribute && node.getAttribute('data-export-ignore') === 'true') {
    return false;
  }
  return true;
};

/**
 * Exports the active HTML artboard node as PNG or JPEG image.
 */
export async function exportArtboardToImage(
  element: HTMLElement,
  format: 'png' | 'jpeg' | 'svg',
  fileName: string = 'designflow-export'
): Promise<void> {
  let dataUrl: string;

  const options = {
    quality: 0.98,
    pixelRatio: 2, // 2x high resolution
    filter: exportFilter,
  };

  if (format === 'png') {
    dataUrl = await toPng(element, options);
  } else if (format === 'jpeg') {
    dataUrl = await toJpeg(element, options);
  } else {
    dataUrl = await toSvg(element, options);
  }

  const link = document.createElement('a');
  link.download = `${fileName}.${format}`;
  link.href = dataUrl;
  link.click();
}

/**
 * Exports all project slides into a single multi-page PDF document.
 */
export async function exportProjectToPDF(
  project: DesignProject,
  artboardElementsMap: Map<string, HTMLElement>
): Promise<void> {
  if (project.slides.length === 0) return;

  const firstSlide = project.slides[0];
  const orientation = firstSlide.width > firstSlide.height ? 'landscape' : 'portrait';

  const pdf = new jsPDF({
    orientation,
    unit: 'px',
    format: [firstSlide.width, firstSlide.height],
  });

  for (let i = 0; i < project.slides.length; i++) {
    const slide = project.slides[i];
    const el = artboardElementsMap.get(slide.id);

    if (el) {
      const imgData = await toPng(el, { quality: 0.95, pixelRatio: 1.5, filter: exportFilter });
      if (i > 0) {
        pdf.addPage([slide.width, slide.height], slide.width > slide.height ? 'landscape' : 'portrait');
      }
      pdf.addImage(imgData, 'PNG', 0, 0, slide.width, slide.height);
    }
  }

  pdf.save(`${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`);
}
