import pptxgen from 'pptxgenjs';
import { DesignProject } from '../types';

/**
 * Generates and downloads a real, editable Microsoft PowerPoint presentation (.pptx).
 */
export async function exportToPowerPoint(project: DesignProject): Promise<void> {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.title = project.title;
  pptx.author = 'DesignFlow Studio';

  for (const slideData of project.slides) {
    const slide = pptx.addSlide();

    // Background color or wallpaper
    if (slideData.wallpaper) {
      try {
        if (slideData.wallpaper.startsWith('data:image')) {
          slide.background = { data: slideData.wallpaper };
        } else {
          slide.background = { path: slideData.wallpaper };
        }
      } catch {
        slide.background = { color: '0F172A' };
      }
    } else if (slideData.background) {
      if (slideData.background.startsWith('#')) {
        slide.background = { color: slideData.background.replace('#', '') };
      } else {
        slide.background = { color: '0F172A' };
      }
    }

    // Speaker Notes
    if (slideData.notes) {
      slide.addNotes(slideData.notes);
    }

    // Scale factors: PPTX 16:9 is 10 x 5.625 inches in pptxgenjs
    // Screen width is slideData.width (default 1920 x 1080)
    const scaleX = 10 / slideData.width;
    const scaleY = 5.625 / slideData.height;

    for (const el of slideData.elements) {
      if (el.hidden) continue;

      const posX = el.x * scaleX;
      const posY = el.y * scaleY;
      const w = el.width * scaleX;
      const h = el.height * scaleY;

      switch (el.type) {
        case 'image': {
          if (el.imageUrl) {
            try {
              if (el.imageUrl.startsWith('data:image')) {
                slide.addImage({
                  data: el.imageUrl,
                  x: posX,
                  y: posY,
                  w: w,
                  h: h,
                });
              } else {
                slide.addImage({
                  path: el.imageUrl,
                  x: posX,
                  y: posY,
                  w: w,
                  h: h,
                });
              }
            } catch (err) {
              console.warn('Gagal menambahkan gambar ke slide pptx:', err);
            }
          }
          break;
        }

        case 'heading':
        case 'text':
        case 'quote': {
          slide.addText(el.content || '', {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fontSize: el.fontSize ? Math.round(el.fontSize * 0.5) : 18,
            bold: el.fontWeight === 'bold' || el.fontWeight === 'extrabold',
            color: cleanHex(el.color || '#FFFFFF'),
            align: (el.textAlign as any) || 'left',
            valign: 'top',
          });
          break;
        }

        case 'button': {
          // Add button shape + label
          slide.addShape(pptx.ShapeType.roundRect, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: { color: cleanHex(el.fill || '#6366F1') },
            line: el.stroke ? { color: cleanHex(el.stroke), width: el.strokeWidth || 1 } : undefined,
          });
          slide.addText(el.content || 'Button', {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fontSize: 14,
            bold: true,
            color: cleanHex(el.color || '#FFFFFF'),
            align: 'center',
            valign: 'middle',
          });
          break;
        }

        case 'badge-shape': {
          slide.addShape(pptx.ShapeType.roundRect, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: el.fill ? { color: cleanHex(el.fill) } : { color: '4F46E5' },
            line: el.stroke ? { color: cleanHex(el.stroke), width: el.strokeWidth || 1 } : undefined,
            rectRadius: 0.5,
          });
          slide.addText(el.content || el.badgeText || 'BADGE', {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fontSize: el.fontSize ? Math.round(el.fontSize * 0.45) : 11,
            bold: true,
            color: cleanHex(el.color || '#FFFFFF'),
            align: 'center',
            valign: 'middle',
          });
          break;
        }

        case 'circle': {
          slide.addShape(pptx.ShapeType.ellipse, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: el.fill ? { color: cleanHex(el.fill) } : undefined,
            line: el.stroke ? { color: cleanHex(el.stroke), width: el.strokeWidth || 1 } : undefined,
          });
          break;
        }

        case 'line': {
          slide.addShape(pptx.ShapeType.line, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            line: { color: cleanHex(el.stroke || '#94A3B8'), width: el.strokeWidth || 2 },
          });
          break;
        }

        case 'triangle': {
          slide.addShape(pptx.ShapeType.triangle, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: el.fill ? { color: cleanHex(el.fill) } : { color: '6366F1' },
            line: el.stroke ? { color: cleanHex(el.stroke), width: el.strokeWidth || 1 } : undefined,
          });
          break;
        }

        case 'star': {
          slide.addShape(pptx.ShapeType.star5, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: el.fill ? { color: cleanHex(el.fill) } : { color: 'F59E0B' },
            line: el.stroke ? { color: cleanHex(el.stroke), width: el.strokeWidth || 1 } : undefined,
          });
          break;
        }

        case 'hexagon': {
          slide.addShape(pptx.ShapeType.hexagon, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: el.fill ? { color: cleanHex(el.fill) } : { color: '8B5CF6' },
            line: el.stroke ? { color: cleanHex(el.stroke), width: el.strokeWidth || 1 } : undefined,
          });
          break;
        }

        case 'arrow': {
          slide.addShape(pptx.ShapeType.rightArrow, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: el.fill ? { color: cleanHex(el.fill) } : { color: '3B82F6' },
            line: el.stroke ? { color: cleanHex(el.stroke), width: el.strokeWidth || 1 } : undefined,
          });
          break;
        }

        case 'chart': {
          const rawData = el.chartData && el.chartData.length > 0 ? el.chartData : [
            { label: 'Q1', value: 35 },
            { label: 'Q2', value: 65 },
            { label: 'Q3', value: 45 },
            { label: 'Q4', value: 90 },
          ];
          const pptxChartType =
            el.chartType === 'line'
              ? pptx.ChartType.line
              : el.chartType === 'donut'
              ? pptx.ChartType.doughnut
              : pptx.ChartType.bar;

          const chartData = [
            {
              name: el.content || 'Data',
              labels: rawData.map(d => d.label),
              values: rawData.map(d => d.value),
            },
          ];

          try {
            slide.addChart(pptxChartType, chartData, {
              x: posX,
              y: posY,
              w: w,
              h: h,
              showTitle: true,
              title: el.content || 'Grafik Analisis',
              titleFontSize: 12,
              titleColor: 'FFFFFF',
              chartColors: ['6366F1', '38BDF8', '10B981', 'F43F5E'],
            });
          } catch (chartErr) {
            console.warn('Fallback ke shape container:', chartErr);
            slide.addShape(pptx.ShapeType.roundRect, {
              x: posX,
              y: posY,
              w: w,
              h: h,
              fill: { color: '0F172A' },
              line: { color: '334155', width: 1 },
            });
          }
          break;
        }

        case 'metric-card':
        case 'card':
        case 'rect':
        default: {
          slide.addShape(pptx.ShapeType.roundRect, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: el.fill ? { color: cleanHex(el.fill) } : { color: '1E293B' },
            line: el.stroke ? { color: cleanHex(el.stroke), width: el.strokeWidth || 1 } : undefined,
          });

          if (el.content) {
            slide.addText(el.content, {
              x: posX,
              y: posY,
              w: w,
              h: h,
              fontSize: el.fontSize ? Math.round(el.fontSize * 0.45) : 14,
              color: cleanHex(el.color || '#FFFFFF'),
              bold: el.fontWeight === 'bold',
              align: (el.textAlign as any) || 'center',
              valign: 'middle',
            });
          }
          break;
        }
      }
    }
  }

  const fileName = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_presentation.pptx`;
  await pptx.writeFile({ fileName });
}

function cleanHex(hex: string): string {
  if (!hex) return 'FFFFFF';
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }
  return cleaned.substring(0, 6).toUpperCase();
}
