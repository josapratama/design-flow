import pptxgen from 'pptxgenjs';
import { DesignProject } from '../types';
import { getQrCodePngDataUrl } from '../utils/qrGenerator';

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

    // Slide Transitions (Native PowerPoint transition)
    if (slideData.transition && slideData.transition !== 'none') {
      try {
        (slide as any).transition = {
          type:
            slideData.transition === 'slide'
              ? 'push'
              : slideData.transition === 'zoom'
                ? 'wheel'
                : 'fade',
        };
      } catch (err) {
        console.warn('Gagal set slide transition pptx:', err);
      }
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
        case 'text': {
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

        case 'quote': {
          // Add accent vertical bar
          slide.addShape(pptx.ShapeType.rect, {
            x: posX,
            y: posY,
            w: 0.08,
            h: h,
            fill: { color: '6366F1' },
            line: { color: '6366F1', width: 0 },
          });

          const quoteTextRuns: any[] = [
            {
              text: `“${el.content || 'Kutipan'}”`,
              options: {
                italic: true,
                fontSize: el.fontSize ? Math.round(el.fontSize * 0.45) : 16,
                color: cleanHex(el.color || '#E2E8F0'),
                breakLine: !!el.subTitle,
              },
            },
          ];

          if (el.subTitle) {
            quoteTextRuns.push({
              text: `\n— ${el.subTitle}`,
              options: {
                italic: false,
                fontSize: el.fontSize ? Math.round(el.fontSize * 0.35) : 12,
                color: '94A3B8',
              },
            });
          }

          slide.addText(quoteTextRuns, {
            x: posX + 0.18,
            y: posY,
            w: Math.max(0.5, w - 0.2),
            h: h,
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

        case 'table': {
          const defaultTableText = `Indikator | Target | Realisasi | Status\nAkurasi Model | 95.0% | 99.4% | Tercapai\nLatensi Inferensi | < 20ms | 11.8ms | Optimal\nThroughput | 2.0x | 3.4x | Melampaui`;
          const tableRaw = el.content || defaultTableText;
          const rows = tableRaw
            .split('\n')
            .map(r => r.trim())
            .filter(r => r.length > 0)
            .map(r => r.split('|').map(c => c.trim()));

          if (rows.length > 0) {
            const tableData = rows.map((row, rIdx) =>
              row.map(cell => ({
                text: cell,
                options: {
                  bold: rIdx === 0,
                  color: rIdx === 0 ? 'A5B4FC' : cleanHex(el.color || '#F8FAFC'),
                  fill: rIdx === 0 ? { color: '1E1B4B' } : rIdx % 2 === 1 ? { color: '1E293B' } : { color: '0F172A' },
                  fontSize: el.fontSize ? Math.round(el.fontSize * 0.45) : 11,
                  align: 'left' as const,
                },
              }))
            );

            try {
              slide.addTable(tableData, {
                x: posX,
                y: posY,
                w: w,
                h: h,
                border: { type: 'solid', color: '334155', pt: 1 },
              });
            } catch (tblErr) {
              console.warn('Gagal menambahkan tabel pptx:', tblErr);
              slide.addShape(pptx.ShapeType.roundRect, {
                x: posX,
                y: posY,
                w: w,
                h: h,
                fill: { color: '0F172A' },
              });
            }
          }
          break;
        }

        case 'metric-card': {
          slide.addShape(pptx.ShapeType.roundRect, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: el.fill ? { color: cleanHex(el.fill) } : { color: '1E293B' },
            line: el.stroke ? { color: cleanHex(el.stroke), width: el.strokeWidth || 1 } : undefined,
          });

          // Big Metric Number
          slide.addText(el.content || '0', {
            x: posX,
            y: posY + (el.subTitle ? 0.08 : h * 0.25),
            w: w,
            h: el.subTitle ? h * 0.55 : h * 0.5,
            fontSize: el.fontSize ? Math.round(el.fontSize * 0.55) : 24,
            bold: true,
            color: cleanHex(el.color || '#38BDF8'),
            align: 'center',
            valign: 'middle',
          });

          // Subtitle
          if (el.subTitle) {
            slide.addText(el.subTitle, {
              x: posX,
              y: posY + h * 0.55,
              w: w,
              h: h * 0.35,
              fontSize: 11,
              color: '94A3B8',
              align: 'center',
              valign: 'top',
            });
          }
          break;
        }

        case 'avatar': {
          if (el.imageUrl) {
            try {
              slide.addImage({
                path: el.imageUrl,
                x: posX,
                y: posY,
                w: w,
                h: h,
                rounding: true,
              });
            } catch (avErr) {
              console.warn('Gagal menambahkan avatar image:', avErr);
              slide.addShape(pptx.ShapeType.ellipse, {
                x: posX,
                y: posY,
                w: w,
                h: h,
                fill: { color: cleanHex(el.fill || '#1E293B') },
                line: { color: cleanHex(el.stroke || '#6366F1'), width: el.strokeWidth || 2 },
              });
              slide.addText(el.content || 'DF', {
                x: posX,
                y: posY,
                w: w,
                h: h,
                fontSize: Math.round(Math.min(w, h) * 16) || 14,
                color: cleanHex(el.color || '#FFFFFF'),
                bold: true,
                align: 'center',
                valign: 'middle',
              });
            }
          } else {
            slide.addShape(pptx.ShapeType.ellipse, {
              x: posX,
              y: posY,
              w: w,
              h: h,
              fill: { color: cleanHex(el.fill || '#1E293B') },
              line: { color: cleanHex(el.stroke || '#6366F1'), width: el.strokeWidth || 2 },
            });
            slide.addText(el.content || 'DF', {
              x: posX,
              y: posY,
              w: w,
              h: h,
              fontSize: Math.round(Math.min(w, h) * 16) || 14,
              color: cleanHex(el.color || '#FFFFFF'),
              bold: true,
              align: 'center',
              valign: 'middle',
            });
          }

          // Online status badge dot
          slide.addShape(pptx.ShapeType.ellipse, {
            x: posX + w * 0.72,
            y: posY + h * 0.72,
            w: Math.max(0.12, w * 0.22),
            h: Math.max(0.12, h * 0.22),
            fill: { color: '10B981' },
            line: { color: '0F172A', width: 1.5 },
          });
          break;
        }

        case 'icon': {
          slide.addShape(pptx.ShapeType.ellipse, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: el.fill ? { color: cleanHex(el.fill) } : { color: '1E293B' },
            line: el.stroke ? { color: cleanHex(el.stroke), width: el.strokeWidth || 1 } : undefined,
          });

          slide.addText(el.iconName ? `★ ${el.iconName}` : '✦', {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fontSize: Math.round(Math.min(w, h) * 14) || 16,
            color: cleanHex(el.color || '#818CF8'),
            align: 'center',
            valign: 'middle',
            bold: true,
          });
          break;
        }

        case 'toggle': {
          const isActive = el.content !== 'off';
          slide.addShape(pptx.ShapeType.roundRect, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            rectRadius: 0.5,
            fill: { color: isActive ? cleanHex(el.fill || '#6366F1') : '334155' },
          });

          const knobSize = h * 0.75;
          const knobX = isActive ? posX + w - knobSize - (h * 0.12) : posX + (h * 0.12);
          const knobY = posY + (h * 0.125);
          slide.addShape(pptx.ShapeType.ellipse, {
            x: knobX,
            y: knobY,
            w: knobSize,
            h: knobSize,
            fill: { color: 'FFFFFF' },
          });
          break;
        }

        case 'heart': {
          slide.addShape(pptx.ShapeType.heart, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: el.fill ? { color: cleanHex(el.fill) } : { color: 'F43F5E' },
            line: el.stroke ? { color: cleanHex(el.stroke), width: el.strokeWidth || 1 } : undefined,
          });
          break;
        }

        case 'diamond': {
          slide.addShape(pptx.ShapeType.diamond, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: el.fill ? { color: cleanHex(el.fill) } : { color: '6366F1' },
            line: el.stroke ? { color: cleanHex(el.stroke), width: el.strokeWidth || 1 } : undefined,
          });
          break;
        }

        case 'speech-bubble': {
          slide.addShape(pptx.ShapeType.wedgeRoundRectCallout, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: el.fill ? { color: cleanHex(el.fill) } : { color: '1E293B' },
            line: el.stroke ? { color: cleanHex(el.stroke), width: el.strokeWidth || 1 } : { color: '6366F1', width: 1.5 },
          });
          if (el.content) {
            slide.addText(el.content, {
              x: posX,
              y: posY,
              w: w,
              h: h * 0.75,
              fontSize: el.fontSize ? Math.round(el.fontSize * 0.45) : 13,
              color: cleanHex(el.color || '#F8FAFC'),
              align: 'center',
              valign: 'middle',
            });
          }
          break;
        }

        case 'progress-bar': {
          const val = Math.min(100, Math.max(0, parseInt(el.content || '75', 10) || 75));
          // Outer container
          slide.addShape(pptx.ShapeType.roundRect, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: { color: '0F172A' },
            line: { color: '334155', width: 1 },
            rectRadius: 0.15,
          });
          // Label and % text
          slide.addText(
            [
              { text: el.subTitle || 'Progres Tugas', options: { color: 'CBD5E1', bold: true } },
              { text: `   ${val}%`, options: { color: '818CF8', bold: true } },
            ],
            {
              x: posX + 0.1,
              y: posY + 0.05,
              w: w - 0.2,
              h: h * 0.45,
              fontSize: 10,
              align: 'left',
              valign: 'middle',
            }
          );
          // Bar background
          const barTrackY = posY + h * 0.55;
          const barTrackH = Math.max(0.08, h * 0.25);
          slide.addShape(pptx.ShapeType.roundRect, {
            x: posX + 0.1,
            y: barTrackY,
            w: w - 0.2,
            h: barTrackH,
            fill: { color: '1E293B' },
            rectRadius: 0.5,
          });
          // Active bar
          slide.addShape(pptx.ShapeType.roundRect, {
            x: posX + 0.1,
            y: barTrackY,
            w: Math.max(0.1, (w - 0.2) * (val / 100)),
            h: barTrackH,
            fill: { color: '6366F1' },
            rectRadius: 0.5,
          });
          break;
        }

        case 'rating': {
          const score = Math.min(5, Math.max(1, Math.round(parseFloat(el.content || '5') || 5)));
          slide.addShape(pptx.ShapeType.roundRect, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: { color: '0F172A' },
            line: { color: '334155', width: 1 },
            rectRadius: 0.2,
          });
          const starsText = '★'.repeat(score) + '☆'.repeat(5 - score);
          slide.addText(
            [
              { text: starsText, options: { color: 'F59E0B', fontSize: 14 } },
              { text: el.subTitle ? `  ${el.subTitle}` : '', options: { color: '94A3B8', fontSize: 10 } },
            ],
            {
              x: posX + 0.1,
              y: posY,
              w: w - 0.2,
              h: h,
              align: 'left',
              valign: 'middle',
            }
          );
          break;
        }

        case 'alert-box': {
          slide.addShape(pptx.ShapeType.roundRect, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: { color: '1E1B4B' },
            line: { color: '6366F1', width: 1.5 },
            rectRadius: 0.15,
          });
          slide.addText(
            [
              { text: '💡  ', options: { fontSize: 12 } },
              { text: el.content || 'Informasi penting', options: { color: 'E2E8F0', fontSize: 11 } },
            ],
            {
              x: posX + 0.1,
              y: posY,
              w: w - 0.2,
              h: h,
              align: 'left',
              valign: 'middle',
            }
          );
          break;
        }

        case 'chat-bubble': {
          slide.addShape(pptx.ShapeType.roundRect, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: { color: '1E293B' },
            line: { color: '475569', width: 1 },
            rectRadius: 0.2,
          });
          slide.addText(
            [
              { text: (el.subTitle || 'User') + '\n', options: { color: '818CF8', bold: true, fontSize: 10 } },
              { text: el.content || 'Pesan chat...', options: { color: 'F8FAFC', fontSize: 11 } },
            ],
            {
              x: posX + 0.12,
              y: posY + 0.08,
              w: w - 0.24,
              h: h - 0.16,
              align: 'left',
              valign: 'top',
            }
          );
          break;
        }

        case 'code-snippet': {
          slide.addShape(pptx.ShapeType.roundRect, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: { color: '0A0F1D' },
            line: { color: '1E293B', width: 1 },
            rectRadius: 0.1,
          });
          slide.addText(el.content || 'console.log("Hello World");', {
            x: posX + 0.1,
            y: posY + 0.08,
            w: w - 0.2,
            h: h - 0.16,
            fontFace: 'Courier New',
            fontSize: 10,
            color: '38BDF8',
            align: 'left',
            valign: 'top',
          });
          break;
        }

        case 'qr-code': {
          const qrPng = getQrCodePngDataUrl(
            el.content || 'https://designflow.app',
            320,
            el.color || '#000000',
            el.fill || '#FFFFFF'
          );
          slide.addShape(pptx.ShapeType.roundRect, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: { color: cleanHex(el.fill || '#FFFFFF') },
            line: el.stroke ? { color: cleanHex(el.stroke), width: el.strokeWidth || 1 } : undefined,
            rectRadius: 0.12,
          });
          const captionHeight = el.subTitle ? 0.22 : 0;
          const qrSize = Math.max(0.3, Math.min(w - 0.16, h - 0.16 - captionHeight));
          try {
            slide.addImage({
              data: qrPng,
              x: posX + (w - qrSize) / 2,
              y: posY + 0.08,
              w: qrSize,
              h: qrSize,
            });
          } catch {}
          if (el.subTitle) {
            slide.addText(el.subTitle, {
              x: posX + 0.05,
              y: posY + h - 0.24,
              w: w - 0.1,
              h: 0.2,
              fontSize: 9,
              bold: true,
              color: cleanHex(el.color || '#0F172A'),
              align: 'center',
              valign: 'middle',
            });
          }
          break;
        }

        case 'card': {
          slide.addShape(pptx.ShapeType.roundRect, {
            x: posX,
            y: posY,
            w: w,
            h: h,
            fill: el.fill ? { color: cleanHex(el.fill) } : { color: '1E293B' },
            line: el.stroke ? { color: cleanHex(el.stroke), width: el.strokeWidth || 1 } : { color: '334155', width: 1 },
            rectRadius: 0.15,
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

    // Export Speaker Notes (Native PowerPoint Notes Pane)
    if (slideData.notes && slideData.notes.trim()) {
      try {
        slide.addNotes(slideData.notes.trim());
      } catch (noteErr) {
        console.warn('Gagal menambahkan speaker notes pptx:', noteErr);
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
