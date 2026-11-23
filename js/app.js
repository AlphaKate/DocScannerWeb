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
    btnPaste: "הדבקת תמונה מהלוח",
    clipboardEmpty: "לא נמצאה תמונה בלוח ההעתקה. יש להעתיק תמונה תחילה.",
    clipboardError: "לא ניתן לגשת ללוח ההעתקה. אנא אשרי גישה לדפדפן.",
    navBack: "חזרה",
    navNext: "הבא",
    cropTitle: "יישור וחיתוך קצוות",
    cropInstruction: "גרור את הפינות או את צלעות המסמך כדי לתחום את גבולותיו בדיוק.",
    btnResetCorners: "איפוס פינות",
    btnRotateCrop: "סיבוב 90°",
    navBack2: "חיתוך",
    filterTitle: "שיפור ואיכות",
    btnRotateFilter: "סיבוב 90°",
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
    btnShareImg: "שליחה ושיתוף כתמונה (JPG)",
    btnSaveImg: "הורדת תמונה למכשיר (JPG)",
    btnSavePdf: "שמירה ושיתוף כ-PDF",
    exportTip: "💡 באייפון: ניתן גם ללחוץ לחיצה ארוכה על התמונה כדי לשמור אותה ישירות לגלריה",
    shareTitle: "מסמך סרוק",
    shareText: "מסמך שנסרק באמצעות DocScanner",
    shareImgTitle: "תמונה סרוקה",
    shareImgText: "תמונה שנסרקה באמצעות DocScanner"
  },
  en: {
    appTitle: "📄 DocScanner",
    langBtn: "עב",
    welcomeTitle: "Scan New Document",
    welcomeSubtitle: "Take a photo directly from your iPhone or pick an image from your gallery.",
    privacyNote: "🔒 100% Private: All processing stays on your device (no servers)",
    btnCamera: "Open Camera",
    btnGallery: "Choose from Gallery",
    btnPaste: "Paste from Clipboard",
    clipboardEmpty: "No image found on clipboard. Please copy an image first.",
    clipboardError: "Unable to access clipboard. Please allow browser permission.",
    navBack: "Back",
    navNext: "Next",
    cropTitle: "Align & Crop Corners",
    cropInstruction: "Drag the corners or edge handles to fit the document boundaries precisely.",
    btnResetCorners: "Reset Corners",
    btnRotateCrop: "Rotate 90°",
    navBack2: "Crop",
    filterTitle: "Enhance & Quality",
    btnRotateFilter: "Rotate 90°",
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
    btnShareImg: "Share Image (JPG)",
    btnSaveImg: "Download Image (JPG)",
    btnSavePdf: "Save / Share as PDF",
    exportTip: "💡 On iPhone: You can also touch & hold the image to save directly to Photos",
    shareTitle: "Scanned Document",
    shareText: "Document scanned with DocScanner",
    shareImgTitle: "Scanned Image",
    shareImgText: "Image scanned with DocScanner"
  }
};

const App = {
  currentLang: 'he',
  rawImage: null,
  corners: [],
  activeDragTarget: null,
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
    document.getElementById('txt-btn-paste').textContent = t.btnPaste;
    document.getElementById('txt-nav-back').textContent = t.navBack;
    document.getElementById('txt-nav-next').textContent = t.navNext;
    document.getElementById('txt-crop-title').textContent = t.cropTitle;
    document.getElementById('txt-crop-instruction').textContent = t.cropInstruction;
    document.getElementById('btn-reset-corners').textContent = t.btnResetCorners;
    document.getElementById('txt-btn-rotate-crop').textContent = t.btnRotateCrop;
    document.getElementById('txt-nav-back2').textContent = t.navBack2;
    document.getElementById('txt-filter-title').textContent = t.filterTitle;
    document.getElementById('txt-btn-rotate-filter').textContent = t.btnRotateFilter;
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
    document.getElementById('txt-btn-share-img').textContent = t.btnShareImg;
    document.getElementById('txt-btn-save-img').textContent = t.btnSaveImg;
    document.getElementById('txt-btn-save-pdf').textContent = t.btnSavePdf;
    document.getElementById('txt-export-tip').textContent = t.exportTip;
  },

  loadImageFromBlob(blob) {
    if (!blob) return;
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
    reader.readAsDataURL(blob);
  },

  async pasteFromClipboard() {
    const t = I18N[this.currentLang];
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const clipboardItems = await navigator.clipboard.read();
        let foundImage = false;
        for (const item of clipboardItems) {
          const imageType = item.types.find(type => type.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            this.loadImageFromBlob(blob);
            foundImage = true;
            break;
          }
        }
        if (!foundImage) {
          alert(t.clipboardEmpty);
        }
      } else {
        alert(t.clipboardError);
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
      alert(t.clipboardError);
    }
  },

  handleGlobalPaste(e) {
    if (!e.clipboardData || !e.clipboardData.items) return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.startsWith('image/')) {
        const blob = items[i].getAsFile();
        if (blob) {
          this.loadImageFromBlob(blob);
          e.preventDefault();
          break;
        }
      }
    }
  },

  bindEvents() {
    // Language Toggle
    document.getElementById('lang-toggle-btn').addEventListener('click', () => this.toggleLanguage());

    // File inputs (Camera & Gallery)
    const handleFile = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      this.loadImageFromBlob(file);
      e.target.value = '';
    };

    document.getElementById('camera-input').addEventListener('change', handleFile);
    document.getElementById('gallery-input').addEventListener('change', handleFile);
    document.getElementById('btn-paste').addEventListener('click', () => this.pasteFromClipboard());

    // Global Paste (Ctrl+V / Command+V / iOS Long-press paste)
    window.addEventListener('paste', (e) => this.handleGlobalPaste(e));

    // Drag & Drop
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type && file.type.startsWith('image/')) {
          this.loadImageFromBlob(file);
        }
      }
    });

    // Navigation Buttons
    document.getElementById('btn-back-to-capture').addEventListener('click', () => this.showScreen('screen-capture'));
    document.getElementById('btn-apply-crop').addEventListener('click', () => this.applyCropAndProceed());
    document.getElementById('btn-reset-corners').addEventListener('click', () => this.resetCorners());
    document.getElementById('btn-rotate-crop').addEventListener('click', () => this.rotateCropImage());

    document.getElementById('btn-back-to-crop').addEventListener('click', () => this.showScreen('screen-crop'));
    document.getElementById('btn-proceed-export').addEventListener('click', () => this.prepareExportScreen());
    document.getElementById('btn-rotate-filter').addEventListener('click', () => this.rotateFilterImage());

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
    document.getElementById('btn-share-img').addEventListener('click', () => this.shareImage());
    document.getElementById('btn-save-img').addEventListener('click', () => this.downloadImage());
    document.getElementById('btn-save-pdf').addEventListener('click', () => this.exportOrSharePDF());

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

  rotateCanvasOrImage90(source) {
    const w = source.naturalWidth || source.width;
    const h = source.naturalHeight || source.height;
    const rotated = document.createElement('canvas');
    rotated.width = h;
    rotated.height = w;
    const ctx = rotated.getContext('2d');
    ctx.translate(h, 0);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(source, 0, 0);
    return rotated;
  },

  rotateCropImage() {
    if (!this.rawImage) return;
    const oldW = this.rawImage.naturalWidth || this.rawImage.width;
    const oldH = this.rawImage.naturalHeight || this.rawImage.height;

    // Rotate raw image
    const rotatedCanvas = this.rotateCanvasOrImage90(this.rawImage);
    this.rawImage = rotatedCanvas;

    // Rotate 4 corners: (x, y) -> (oldH - y, x)
    const rotatePoint = (p) => ({
      x: oldH - p.y,
      y: p.x
    });

    const old = this.corners;
    this.corners = [
      rotatePoint(old[3]), // new TL
      rotatePoint(old[0]), // new TR
      rotatePoint(old[1]), // new BR
      rotatePoint(old[2])  // new BL
    ];

    this.renderCropCanvas();
  },

  rotateFilterImage() {
    if (!this.warpedCanvas) return;
    this.warpedCanvas = this.rotateCanvasOrImage90(this.warpedCanvas);
    this.renderFilteredPreview();
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

    const edgePairs = [
      [0, 1], // Top
      [1, 2], // Right
      [2, 3], // Bottom
      [3, 0]  // Left
    ];

    // Draw 4 Edge Midpoint Handles (Pills)
    for (let i = 0; i < 4; i++) {
      const [idxA, idxB] = edgePairs[i];
      const pA = { x: this.corners[idxA].x * scale, y: this.corners[idxA].y * scale };
      const pB = { x: this.corners[idxB].x * scale, y: this.corners[idxB].y * scale };
      const mx = (pA.x + pB.x) / 2;
      const my = (pA.y + pB.y) / 2;
      const angle = Math.atan2(pB.y - pA.y, pB.x - pA.x);

      ctx.save();
      ctx.translate(mx, my);
      ctx.rotate(angle);

      // Rounded pill for edge
      const pillW = 26;
      const pillH = 10;
      const r = 5;
      ctx.beginPath();
      ctx.moveTo(-pillW/2 + r, -pillH/2);
      ctx.lineTo(pillW/2 - r, -pillH/2);
      ctx.arcTo(pillW/2, -pillH/2, pillW/2, pillH/2, r);
      ctx.lineTo(pillW/2, pillH/2 - r);
      ctx.arcTo(pillW/2, pillH/2, -pillW/2, pillH/2, r);
      ctx.lineTo(-pillW/2 + r, pillH/2);
      ctx.arcTo(-pillW/2, pillH/2, -pillW/2, -pillH/2, r);
      ctx.lineTo(-pillW/2, -pillH/2 + r);
      ctx.arcTo(-pillW/2, -pillH/2, pillW/2, -pillH/2, r);
      ctx.closePath();

      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#007aff';
      ctx.stroke();

      // Gripper notches
      ctx.beginPath();
      ctx.moveTo(-3, -2.5); ctx.lineTo(-3, 2.5);
      ctx.moveTo(3, -2.5); ctx.lineTo(3, 2.5);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#8e8e93';
      ctx.stroke();

      ctx.restore();
    }

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

    const edgePairs = [
      [0, 1], // Top
      [1, 2], // Right
      [2, 3], // Bottom
      [3, 0]  // Left
    ];

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
      const threshold = 42; // Touch target radius threshold in px

      // 1. Check corner handles first
      let closestCornerIdx = -1;
      let minCornerDist = threshold;
      for (let i = 0; i < 4; i++) {
        const hx = this.corners[i].x * this.canvasScale;
        const hy = this.corners[i].y * this.canvasScale;
        const dist = Math.hypot(p.canvasX - hx, p.canvasY - hy);
        if (dist < minCornerDist) {
          minCornerDist = dist;
          closestCornerIdx = i;
        }
      }

      if (closestCornerIdx !== -1) {
        this.activeDragTarget = { type: 'corner', index: closestCornerIdx };
        this.updateMagnifier(p, this.corners[closestCornerIdx]);
        evt.preventDefault();
        return;
      }

      // 2. Check edge midpoint handles
      let closestEdgeIdx = -1;
      let minEdgeDist = threshold;
      for (let i = 0; i < 4; i++) {
        const [a, b] = edgePairs[i];
        const mx = ((this.corners[a].x + this.corners[b].x) / 2) * this.canvasScale;
        const my = ((this.corners[a].y + this.corners[b].y) / 2) * this.canvasScale;
        const dist = Math.hypot(p.canvasX - mx, p.canvasY - my);
        if (dist < minEdgeDist) {
          minEdgeDist = dist;
          closestEdgeIdx = i;
        }
      }

      if (closestEdgeIdx !== -1) {
        const [a, b] = edgePairs[closestEdgeIdx];
        const centerRaw = {
          x: (this.corners[a].x + this.corners[b].x) / 2,
          y: (this.corners[a].y + this.corners[b].y) / 2
        };
        this.activeDragTarget = {
          type: 'edge',
          index: closestEdgeIdx,
          startTouch: { x: p.rawX, y: p.rawY },
          startCorners: JSON.parse(JSON.stringify(this.corners))
        };
        this.updateMagnifier(p, centerRaw);
        evt.preventDefault();
      }
    };

    const handleMove = (evt) => {
      if (!this.activeDragTarget || !this.rawImage) return;
      const p = getCanvasPoint(evt);
      const imgW = this.rawImage.width;
      const imgH = this.rawImage.height;

      if (this.activeDragTarget.type === 'corner') {
        const idx = this.activeDragTarget.index;
        const clampedX = Math.max(0, Math.min(imgW, p.rawX));
        const clampedY = Math.max(0, Math.min(imgH, p.rawY));
        this.corners[idx] = { x: clampedX, y: clampedY };
        this.renderCropCanvas();
        this.updateMagnifier(p, this.corners[idx]);
        evt.preventDefault();
      } else if (this.activeDragTarget.type === 'edge') {
        const edgeIdx = this.activeDragTarget.index;
        const [idxA, idxB] = edgePairs[edgeIdx];
        const origA = this.activeDragTarget.startCorners[idxA];
        const origB = this.activeDragTarget.startCorners[idxB];

        const dx = p.rawX - this.activeDragTarget.startTouch.x;
        const dy = p.rawY - this.activeDragTarget.startTouch.y;

        const minDx = -Math.min(origA.x, origB.x);
        const maxDx = Math.min(imgW - origA.x, imgW - origB.x);
        const clampedDx = Math.max(minDx, Math.min(maxDx, dx));

        const minDy = -Math.min(origA.y, origB.y);
        const maxDy = Math.min(imgH - origA.y, imgH - origB.y);
        const clampedDy = Math.max(minDy, Math.min(maxDy, dy));

        this.corners[idxA] = { x: origA.x + clampedDx, y: origA.y + clampedDy };
        this.corners[idxB] = { x: origB.x + clampedDx, y: origB.y + clampedDy };

        const centerRaw = {
          x: (this.corners[idxA].x + this.corners[idxB].x) / 2,
          y: (this.corners[idxA].y + this.corners[idxB].y) / 2
        };

        this.renderCropCanvas();
        this.updateMagnifier(p, centerRaw);
        evt.preventDefault();
      }
    };

    const handleEnd = () => {
      this.activeDragTarget = null;
      magnifier.classList.add('hidden');
    };

    canvas.addEventListener('touchstart', handleStart, { passive: false });
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    canvas.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
  },

  updateMagnifier(point, sourceCenter) {
    const magnifier = document.getElementById('magnifier');
    const canvas = document.getElementById('crop-canvas');
    if (!this.rawImage || !this.activeDragTarget) {
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

    const sourceX = sourceCenter ? sourceCenter.x : (point.rawX || 0);
    const sourceY = sourceCenter ? sourceCenter.y : (point.rawY || 0);
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

  shareImage() {
    if (!this.filteredCanvas) return;
    const t = I18N[this.currentLang];
    this.filteredCanvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `scan_${Date.now()}.jpg`, { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: t.shareImgTitle,
            text: t.shareImgText
          });
        } catch (err) {
          if (err.name !== 'AbortError') {
            this.downloadImage();
          }
        }
      } else {
        this.downloadImage();
      }
    }, 'image/jpeg', 0.95);
  },

  downloadImage() {
    if (!this.filteredCanvas) return;
    this.filteredCanvas.toBlob((blob) => {
      if (!blob) return;
      const filename = `scan_${Date.now()}.jpg`;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

      if (isIOS) {
        // On iOS Safari, open image blob directly in a new window/tab for native saving
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (!win) {
          window.location.href = url;
        }
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 1500);
      }
    }, 'image/jpeg', 0.95);
  },

  async exportOrSharePDF() {
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
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    PDFExporter.savePDF(this.filteredCanvas, `scan_${Date.now()}.pdf`);
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
