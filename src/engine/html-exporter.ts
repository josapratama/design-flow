import { DesignProject, Slide } from '../types';

/**
 * Generates a self-contained, standalone offline HTML presentation file.
 * Requires ZERO external dependencies, works completely offline in any web browser.
 */
export function generateStandaloneHtmlPresentation(project: DesignProject): string {
  const title = project.title || 'Presentasi';
  const slidesDataJson = JSON.stringify(project.slides);

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - DesignFlow Slideshow</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: #030712;
      color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }
    #viewport {
      position: relative;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #030712;
    }
    #artboard-wrapper {
      position: absolute;
      top: 50%;
      left: 50%;
      transform-origin: center center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      transition: opacity 0.25s ease, transform 0.25s ease;
      overflow: hidden;
    }
    .slide-element {
      position: absolute;
      box-sizing: border-box;
    }
    /* Blank screen overlay */
    #blank-overlay {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: none;
    }
    #blank-overlay.black {
      display: block;
      background: #000000;
    }
    #blank-overlay.white {
      display: block;
      background: #ffffff;
    }
    /* Floating HUD controls */
    #hud {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 50;
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(51, 65, 85, 0.7);
      border-radius: 9999px;
      padding: 8px 18px;
      backdrop-filter: blur(12px);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      opacity: 0.15;
      transition: opacity 0.2s ease;
    }
    #hud:hover {
      opacity: 1;
    }
    .hud-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      padding: 4px 8px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: color 0.15s, background 0.15s;
    }
    .hud-btn:hover {
      color: #ffffff;
      background: rgba(51, 65, 85, 0.5);
    }
    #hud-counter {
      font-family: monospace;
      font-size: 12px;
      color: #cbd5e1;
      padding: 0 4px;
    }
    /* Progress bar */
    #progress-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      height: 4px;
      background: #6366f1;
      z-index: 60;
      transition: width 0.3s ease;
    }
    /* Speaker notes drawer */
    #notes-drawer {
      position: fixed;
      bottom: 75px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 640px;
      max-height: 200px;
      overflow-y: auto;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid #4338ca;
      border-radius: 16px;
      padding: 16px;
      z-index: 55;
      font-size: 13px;
      line-height: 1.6;
      color: #e2e8f0;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      display: none;
    }
  </style>
</head>
<body>
  <div id="viewport">
    <div id="artboard-wrapper"></div>
  </div>

  <div id="blank-overlay"></div>

  <div id="notes-drawer"></div>

  <div id="hud">
    <button class="hud-btn" id="prev-btn" title="Slide Sebelumnya (← / Panah Kiri)">◀</button>
    <span id="hud-counter">1 / 1</span>
    <button class="hud-btn" id="next-btn" title="Slide Selanjutnya (→ / Spasi)">▶</button>
    <button class="hud-btn" id="notes-btn" title="Catatan Pembicara (N)">📝 Notes</button>
    <button class="hud-btn" id="fs-btn" title="Layar Penuh (F)">⛶ Fullscreen</button>
  </div>

  <div id="progress-bar"></div>

  <script>
    const slides = ${slidesDataJson};
    let currentIndex = 0;
    let blankMode = 'none';
    let showNotes = false;

    const wrapper = document.getElementById('artboard-wrapper');
    const counter = document.getElementById('hud-counter');
    const progressBar = document.getElementById('progress-bar');
    const notesDrawer = document.getElementById('notes-drawer');
    const blankOverlay = document.getElementById('blank-overlay');

    function renderSlide(index) {
      if (index < 0 || index >= slides.length) return;
      currentIndex = index;
      const slide = slides[index];

      // Update HUD & Progress
      counter.textContent = (currentIndex + 1) + ' / ' + slides.length;
      progressBar.style.width = (((currentIndex + 1) / slides.length) * 100) + '%';

      // Update Notes
      if (slide.notes && slide.notes.trim()) {
        notesDrawer.innerHTML = '<strong>Catatan Slide ' + (currentIndex + 1) + ':</strong><br>' + escapeHtml(slide.notes);
      } else {
        notesDrawer.innerHTML = '<em>(Tidak ada catatan pembicara untuk slide ini)</em>';
      }

      // Set dimensions & background
      const width = slide.width || 1920;
      const height = slide.height || 1080;
      wrapper.style.width = width + 'px';
      wrapper.style.height = height + 'px';

      if (slide.wallpaper) {
        wrapper.style.background = "url('" + slide.wallpaper + "') center / cover no-repeat";
      } else {
        wrapper.style.background = slide.background || '#090d16';
      }

      // Render Elements
      let html = '';
      (slide.elements || []).forEach(el => {
        if (el.hidden) return;
        const style = [
          'left:' + el.x + 'px',
          'top:' + el.y + 'px',
          'width:' + el.width + 'px',
          'height:' + el.height + 'px',
          'z-index:' + (el.zIndex || 1),
          el.opacity !== undefined ? 'opacity:' + el.opacity : '',
          el.borderRadius ? 'border-radius:' + el.borderRadius + 'px' : '',
          el.fill ? 'background-color:' + el.fill : '',
          el.stroke ? 'border:' + (el.strokeWidth || 1) + 'px solid ' + el.stroke : '',
        ].filter(Boolean).join(';');

        let innerContent = '';
        if (el.type === 'heading' || el.type === 'text') {
          const fontStyle = [
            'color:' + (el.color || '#ffffff'),
            'font-size:' + (el.fontSize || 18) + 'px',
            'font-weight:' + (el.fontWeight || 500),
            'text-align:' + (el.textAlign || 'left'),
            'line-height:' + (el.lineHeight || 1.4),
            'padding: 4px 6px',
            'white-space: pre-wrap',
            'word-break: break-word',
          ].join(';');
          innerContent = '<div style="' + fontStyle + '">' + escapeHtml(el.content || '') + '</div>';
        } else if (el.type === 'image' && el.imageUrl) {
          innerContent = '<img src="' + el.imageUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;" />';
        } else if (el.type === 'button') {
          innerContent = '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:' + (el.color || '#ffffff') + ';font-weight:bold;font-size:14px;">' + escapeHtml(el.content || '') + '</div>';
        }

        html += '<div class="slide-element" style="' + style + '">' + innerContent + '</div>';
      });

      wrapper.innerHTML = html;
      resizeSlide();
    }

    function resizeSlide() {
      const slide = slides[currentIndex] || { width: 1920, height: 1080 };
      const w = slide.width || 1920;
      const h = slide.height || 1080;
      const scale = Math.min((window.innerWidth * 0.98) / w, (window.innerHeight * 0.98) / h);
      wrapper.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
    }

    function goToNext() {
      if (currentIndex < slides.length - 1) {
        renderSlide(currentIndex + 1);
      }
    }

    function goToPrev() {
      if (currentIndex > 0) {
        renderSlide(currentIndex - 1);
      }
    }

    function toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    window.addEventListener('resize', resizeSlide);
    window.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrev();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        showNotes = !showNotes;
        notesDrawer.style.display = showNotes ? 'block' : 'none';
      } else if (e.key.toLowerCase() === 'b') {
        blankMode = blankMode === 'black' ? 'none' : 'black';
        blankOverlay.className = blankMode;
      } else if (e.key.toLowerCase() === 'w') {
        blankMode = blankMode === 'white' ? 'none' : 'white';
        blankOverlay.className = blankMode;
      } else if (e.key === 'Home') {
        renderSlide(0);
      } else if (e.key === 'End') {
        renderSlide(slides.length - 1);
      }
    });

    document.getElementById('prev-btn').addEventListener('click', goToPrev);
    document.getElementById('next-btn').addEventListener('click', goToNext);
    document.getElementById('fs-btn').addEventListener('click', toggleFullscreen);
    document.getElementById('notes-btn').addEventListener('click', () => {
      showNotes = !showNotes;
      notesDrawer.style.display = showNotes ? 'block' : 'none';
    });

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Initialize first slide
    renderSlide(0);
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
