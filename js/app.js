/**
 * Main Controller for DocScanner Web
 * Manages UI navigation, touch gesture handling, magnifier, and bilingual localization.
 */

// Bilingual Strings
const I18N = {
  he: {
    appTitle: "📄 סורק מסמכים",
    langBtn: "EN",
    welcomeTitle: "סריקת מסמך חדש",
    welcomeSubtitle: "צלם מסמך ישירות מהאייפון או בחר תמונה מגלריית התמונות.",
    privacyNote: "🔒 100% פרטי: כל העיבוד מתבצע במכשיר בלבד ללא שרת",
    btnCamera: "פתיחת מצלמה",
    btnGallery: "בחירה מגלריה",
    navBack: "חזרה",
    navNext: "הבא",
    cropTitle: "יישור וחיתוך קצוות",
    cropInstruction: "גרור את 4 הפינות כדי לתחום את גבולות המסמך בדיוק.",
    btnResetCorners: "איפוס פינות",
    navBack2: "חיתוך",
    filterTitle: "שיפור ואיכות",
    navExport: "ייצוא",
    filterMagic: "משופר",
    filterBw: "שחור-לבן",
    filterGray: "אפור",
    filterOrig: "מקורי",
    sliderContrast: "ניגודיות (Contrast)",
    sliderBrightness: "בהירות (Brightness)",
    navBack3: "עריכה",
    exportTitle: "שמירה ושיתוף",
    navNew: "חדש",
    btnSavePdf: "שמירה כ-PDF",
    btnSaveImg: "שמירה כתמונה (JPG)",
    btnShare: "שיתוף באייפון (Share)",
    shareTitle: "מסמך סרוק",
    shareText: "מסמך שנסרק באמצעות DocScanner"
  },
  en: {
    appTitle: "📄 DocScanner",
    langBtn: "עב",
    welcomeTitle: "Scan New Document",
    welcomeSubtitle: "Take a photo directly from your iPhone or pick an image from your gallery.",
    privacyNote: "🔒 100% Private: All processing stays on your device (no servers)",
    btnCamera: "Open Camera",
    btnGallery: "Choose from Gallery",
    navBack: "Back",
    navNext: "Next",
    cropTitle: "Align & Crop Corners",
    cropInstruction: "Drag the 4 corners to fit the document boundaries precisely.",
    btnResetCorners: "Reset Corners",
    navBack2: "Crop",
    filterTitle: "Enhance & Quality",
    navExport: "Export",
    filterMagic: "Magic",
    filterBw: "B&W",
    filterGray: "Grayscale",
    filterOrig: "Original",
    sliderContrast: "Contrast",
    sliderBrightness: "Brightness",
    navBack3: "Edit",
    exportTitle: "Save & Share",
    navNew: "New",
    btnSavePdf: "Save as PDF",
    btnSaveImg: "Save as Image (JPG)",
    btnShare: "Share on iPhone",
    shareTitle: "Scanned Document",
    shareText: "Document scanned with DocScanner"
  }
};

const App = {
  currentLang: 'he',
  rawImage: null,
  corners: [],
  activeCornerIndex: -1,
  canvasScale: 1,
  canvasOffset: { x: 0, y: 0 },
  warpedCanvas: null,
  filteredCanvas: null,
  activeFilter: 'magic',
  contrast: 115,
  brightness: 5,

  init() {
    this.bindEvents();
    this.applyLanguage();
  },

  // Toggle Hebrew / English
  toggleLanguage() {
    this.currentLang = this.currentLang === 'he' ? 'en' : 'he';
    this.applyLanguage();
  },

  applyLanguage() {
    const t = I18N[this.currentLang];
    document.documentElement.lang = this.currentLang;
    document.documentElement.dir = this.currentLang === 'he' ? 'rtl' : 'ltr';

    document.getElementById('app-title').textContent = t.appTitle;
    document.getElementById('lang-toggle-btn').textContent = t.langBtn;
    document.getElementById('txt-welcome-title').textContent = t.welcomeTitle;
    document.getElementById('txt-welcome-subtitle').textContent = t.welcomeSubtitle;
    document.getElementById('txt-privacy-note').textContent = t.privacyNote;
    document.getElementById('txt-btn-camera').textContent = t.btnCamera;
    document.getElementById('txt-btn-gallery').textContent = t.btnGallery;
    document.getElementById('txt-nav-back').textContent = t.navBack;
    document.getElementById('txt-nav-next').textContent = t.navNext;
    document.getElementById('txt-crop-title').textContent = t.cropTitle;
    document.getElementById('txt-crop-instruction').textContent = t.cropInstruction;
    document.getElementById('btn-reset-corners').textContent = t.btnResetCorners;
    document.getElementById('txt-nav-back2').textContent = t.navBack2;
    document.getElementById('txt-filter-title').textContent = t.filterTitle;
    document.getElementById('txt-nav-export').textContent = t.navExport;
    document.getElementById('txt-filter-magic').textContent = t.filterMagic;
    document.getElementById('txt-filter-bw').textContent = t.filterBw;
    document.getElementById('txt-filter-gray').textContent = t.filterGray;
    document.getElementById('txt-filter-orig').textContent = t.filterOrig;
    document.getElementById('txt-slider-contrast').textContent = t.sliderContrast;
    document.getElementById('txt-slider-brightness').textContent = t.sliderBrightness;
    document.getElementById('txt-nav-back3').textContent = t.navBack3;
    document.getElementById('txt-export-title').textContent = t.exportTitle;
    document.getElementById('txt-nav-new').textContent = t.navNew;
    document.getElementById('txt-btn-save-pdf').textContent = t.btnSavePdf;
    document.getElementById('txt-btn-save-img').textContent = t.btnSaveImg;
    document.getElementById('txt-btn-share').textContent = t.btnShare;
  },

  bindEvents() {
    // Language Toggle
    document.getElementById('lang-toggle-btn').addEventListener('click', () => this.toggleLanguage());

    // File inputs (Camera & Gallery)
    const handleFile = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          this.rawImage = img;
          this.initCropScreen();
          this.showScreen('screen-crop');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    };

    document.getElementById('camera-input').addEventListener('change', handleFile);
    document.getElementById('gallery-input').addEventListener('change', handleFile);

    // Navigation Buttons
    document.getElementById('btn-back-to-capture').addEventListener('click', () => this.showScreen('screen-capture'));
    document.getElementById('btn-apply-crop').addEventListener('click', () => this.applyCropAndProceed());
    document.getElementById('btn-reset-corners').addEventListener('click', () => this.resetCorners());

    document.getElementById('btn-back-to-crop').addEventListener('click', () => this.showScreen('screen-crop'));
    document.getElementById('btn-proceed-export').addEventListener('click', () => this.prepareExportScreen());

    document.getElementById('btn-back-to-filter').addEventListener('click', () => this.showScreen('screen-filter'));
    document.getElementById('btn-new-scan').addEventListener('click', () => this.showScreen('screen-capture'));

    // Filter Preset Selection
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        const target = e.currentTarget;
        target.classList.add('active');
        this.activeFilter = target.getAttribute('data-filter');
        this.renderFilteredPreview();
      });
    });

    // Adjustment Sliders
    const contrastSlider = document.getElementById('slider-contrast');
    const brightnessSlider = document.getElementById('slider-brightness');

    contrastSlider.addEventListener('input', (e) => {
      this.contrast = parseInt(e.target.value, 10);
      this.renderFilteredPreview();
    });

    brightnessSlider.addEventListener('input', (e) => {
      this.brightness = parseInt(e.target.value, 10);
      this.renderFilteredPreview();
    });

    // Export Actions
    document.getElementById('btn-save-pdf').addEventListener('click', () => this.exportPDF());
    document.getElementById('btn-save-img').addEventListener('click', () => this.exportImage());
    document.getElementById('btn-share').addEventListener('click', () => this.shareNative());

    // Canvas Touch & Mouse Events
    this.setupCropCanvasInteractions();
  },

  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
  },

  initCropScreen() {
    if (!this.rawImage) return;
    const w = this.rawImage.naturalWidth || this.rawImage.width;
    const h = this.rawImage.naturalHeight || this.rawImage.height;

    // Default corners inset by 10%
    const insetX = w * 0.08;
    const insetY = h * 0.08;
    this.corners = [
      { x: insetX, y: insetY },         // Top-Left
      { x: w - insetX, y: insetY },     // Top-Right
      { x: w - insetX, y: h - insetY }, // Bottom-Right
      { x: insetX, y: h - insetY }      // Bottom-Left
    ];

    this.renderCropCanvas();
  },

  resetCorners() {
    if (!this.rawImage) return;
    const w = this.rawImage.naturalWidth || this.rawImage.width;
    const h = this.rawImage.naturalHeight || this.rawImage.height;
    this.corners = [
      { x: 0, y: 0 },
      { x: w, y: 0 },
      { x: w, y: h },
      { x: 0, y: h }
    ];
    this.renderCropCanvas();
  },

  renderCropCanvas() {
    const canvas = document.getElementById('crop-canvas');
    const wrapper = canvas.parentElement;
    const ctx = canvas.getContext('2d');

    const img = this.rawImage;
    if (!img) return;

    // Resize canvas to match wrapper bounds maintaining aspect ratio
    const maxWidth = wrapper.clientWidth || 360;
    const maxHeight = wrapper.clientHeight || 480;

    const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
    this.canvasScale = scale;

    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    // Draw background image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Dim area outside quadrilateral
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cutout quadrilateral
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(this.corners[0].x * scale, this.corners[0].y * scale);
    for (let i = 1; i < 4; i++) {
      ctx.lineTo(this.corners[i].x * scale, this.corners[i].y * scale);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Redraw un-dimmed image inside quad
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.corners[0].x * scale, this.corners[0].y * scale);
    for (let i = 1; i < 4; i++) {
      ctx.lineTo(this.corners[i].x * scale, this.corners[i].y * scale);
    }
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw Quad border lines
    ctx.beginPath();
    ctx.strokeStyle = '#007aff';
    ctx.lineWidth = 2.5;
    ctx.moveTo(this.corners[0].x * scale, this.corners[0].y * scale);
    for (let i = 1; i < 4; i++) {
      ctx.lineTo(this.corners[i].x * scale, this.corners[i].y * scale);
    }
    ctx.closePath();
    ctx.stroke();

    // Draw 4 Corner Handles
    for (let i = 0; i < 4; i++) {
      const cx = this.corners[i].x * scale;
      const cy = this.corners[i].y * scale;

      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#007aff';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#007aff';
      ctx.fill();
    }
  },

  setupCropCanvasInteractions() {
    const canvas = document.getElementById('crop-canvas');
    const magnifier = document.getElementById('magnifier');

    const getCanvasPoint = (evt) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
      const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
      return {
        canvasX: (clientX - rect.left),
        canvasY: (clientY - rect.top),
        rawX: (clientX - rect.left) / this.canvasScale,
        rawY: (clientY - rect.top) / this.canvasScale,
        clientX,
        clientY
      };
    };

    const handleStart = (evt) => {
      const p = getCanvasPoint(evt);
      let closestIdx = -1;
      let minDistance = 44; // Touch target radius threshold in px

      for (let i = 0; i < 4; i++) {
        const hx = this.corners[i].x * this.canvasScale;
        const hy = this.corners[i].y * this.canvasScale;
        const dist = Math.hypot(p.canvasX - hx, p.canvasY - hy);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = i;
        }
      }

      if (closestIdx !== -1) {
        this.activeCornerIndex = closestIdx;
        this.updateMagnifier(p);
        evt.preventDefault();
      }
    };

    const handleMove = (evt) => {
      if (this.activeCornerIndex === -1) return;
      const p = getCanvasPoint(evt);
      const imgW = this.rawImage.width;
      const imgH = this.rawImage.height;

      // Clamp inside image bounds
      const clampedX = Math.max(0, Math.min(imgW, p.rawX));
      const clampedY = Math.max(0, Math.min(imgH, p.rawY));

      this.corners[this.activeCornerIndex] = { x: clampedX, y: clampedY };
      this.renderCropCanvas();
      this.updateMagnifier(p);
      evt.preventDefault();
    };

    const handleEnd = () => {
      this.activeCornerIndex = -1;
      magnifier.classList.add('hidden');
    };

    canvas.addEventListener('touchstart', handleStart, { passive: false });
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    canvas.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
  },

  updateMagnifier(point) {
    const magnifier = document.getElementById('magnifier');
    const canvas = document.getElementById('crop-canvas');
    if (!this.rawImage || this.activeCornerIndex === -1) {
      magnifier.classList.add('hidden');
      return;
    }

    magnifier.classList.remove('hidden');
    magnifier.style.left = `${point.canvasX}px`;
    magnifier.style.top = `${point.canvasY}px`;

    // Render zoomed patch
    const zoomCanvas = document.createElement('canvas');
    zoomCanvas.width = 90;
    zoomCanvas.height = 90;
    const zctx = zoomCanvas.getContext('2d');

    const sourceX = this.corners[this.activeCornerIndex].x;
    const sourceY = this.corners[this.activeCornerIndex].y;
    const patchSize = 50;

    zctx.drawImage(
      this.rawImage,
      sourceX - patchSize / 2, sourceY - patchSize / 2, patchSize, patchSize,
      0, 0, 90, 90
    );

    // Crosshair
    zctx.strokeStyle = '#007aff';
    zctx.lineWidth = 1.5;
    zctx.beginPath();
    zctx.moveTo(45, 25); zctx.lineTo(45, 65);
    zctx.moveTo(25, 45); zctx.lineTo(65, 45);
    zctx.stroke();

    magnifier.style.backgroundImage = `url(${zoomCanvas.toDataURL()})`;
  },

  // Perform Perspective Warp
  applyCropAndProceed() {
    if (!this.rawImage) return;
    this.warpedCanvas = PerspectiveTransform.warp(this.rawImage, this.corners);
    this.showScreen('screen-filter');
    this.renderFilteredPreview();
  },

  renderFilteredPreview() {
    if (!this.warpedCanvas) return;
    this.filteredCanvas = DocumentFilters.apply(this.warpedCanvas, this.activeFilter, {
      contrast: this.contrast,
      brightness: this.brightness
    });

    const displayCanvas = document.getElementById('filter-canvas');
    const wrapper = displayCanvas.parentElement;
    const maxW = wrapper.clientWidth || 360;
    const maxH = wrapper.clientHeight || 480;

    const scale = Math.min(maxW / this.filteredCanvas.width, maxH / this.filteredCanvas.height);
    displayCanvas.width = this.filteredCanvas.width * scale;
    displayCanvas.height = this.filteredCanvas.height * scale;

    const ctx = displayCanvas.getContext('2d');
    ctx.drawImage(this.filteredCanvas, 0, 0, displayCanvas.width, displayCanvas.height);
  },

  prepareExportScreen() {
    if (!this.filteredCanvas) return;
    const previewImg = document.getElementById('export-preview-img');
    previewImg.src = this.filteredCanvas.toDataURL('image/jpeg', 0.9);
    this.showScreen('screen-export');
  },

  exportPDF() {
    if (!this.filteredCanvas) return;
    PDFExporter.savePDF(this.filteredCanvas, `scan_${Date.now()}.pdf`);
  },

  exportImage() {
    if (!this.filteredCanvas) return;
    const link = document.createElement('a');
    link.download = `scan_${Date.now()}.jpg`;
    link.href = this.filteredCanvas.toDataURL('image/jpeg', 0.95);
    link.click();
  },

  async shareNative() {
    if (!this.filteredCanvas) return;
    const t = I18N[this.currentLang];
    const pdfBlob = PDFExporter.generatePDFBlob(this.filteredCanvas);
    const pdfFile = new File([pdfBlob], `scan_${Date.now()}.pdf`, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          files: [pdfFile],
          title: t.shareTitle,
          text: t.shareText
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          this.exportPDF();
        }
      }
    } else {
      // Fallback
      this.exportPDF();
    }
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
