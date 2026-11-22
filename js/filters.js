/**
 * Document Image Filters & Enhancement Module
 * 100% Client-Side Pure Canvas Pixel Processing.
 */

const DocumentFilters = {
  // Apply selected filter preset and user sliders
  apply(sourceCanvas, filterType, options = {}) {
    const contrastVal = options.contrast !== undefined ? options.contrast : 115; // 50 to 200
    const brightnessVal = options.brightness !== undefined ? options.brightness : 5; // -50 to 50

    const width = sourceCanvas.width;
    const height = sourceCanvas.height;

    // Create target output canvas
    const outCanvas = document.createElement('canvas');
    outCanvas.width = width;
    outCanvas.height = height;
    const ctx = outCanvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(sourceCanvas, 0, 0);

    if (filterType === 'original' && contrastVal === 100 && brightnessVal === 0) {
      return outCanvas;
    }

    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;
    const totalPixels = width * height;

    // Precalculate contrast factor
    const contrastFactor = (259 * (contrastVal + 255)) / (255 * (259 - contrastVal));

    if (filterType === 'magic') {
      // Magic Document Filter: Whitens paper shadows while saturating and enhancing text/stamps
      for (let i = 0; i < d.length; i += 4) {
        let r = d[i];
        let g = d[i + 1];
        let b = d[i + 2];

        // Apply brightness
        r += brightnessVal;
        g += brightnessVal;
        b += brightnessVal;

        // Apply contrast
        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;

        // Background paper whitening curve: if pixel is bright/off-white, push smoothly to pure white
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        if (luminance > 140) {
          const boost = (luminance - 140) / 115;
          r += (255 - r) * boost * 0.75;
          g += (255 - g) * boost * 0.75;
          b += (255 - b) * boost * 0.75;
        }

        d[i] = Math.max(0, Math.min(255, r));
        d[i + 1] = Math.max(0, Math.min(255, g));
        d[i + 2] = Math.max(0, Math.min(255, b));
      }
    } else if (filterType === 'bw') {
      // Crisp Black & White: High contrast thresholding for pure text legibility
      const threshold = 138 - brightnessVal;
      for (let i = 0; i < d.length; i += 4) {
        const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        const val = lum > threshold ? 255 : 0;
        d[i] = val;
        d[i + 1] = val;
        d[i + 2] = val;
      }
    } else if (filterType === 'gray') {
      // Grayscale Document
      for (let i = 0; i < d.length; i += 4) {
        let gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
        gray += brightnessVal;
        gray = contrastFactor * (gray - 128) + 128;
        const finalVal = Math.max(0, Math.min(255, gray));
        d[i] = finalVal;
        d[i + 1] = finalVal;
        d[i + 2] = finalVal;
      }
    } else {
      // Original with optional sliders
      for (let i = 0; i < d.length; i += 4) {
        let r = d[i] + brightnessVal;
        let g = d[i + 1] + brightnessVal;
        let b = d[i + 2] + brightnessVal;

        r = contrastFactor * (r - 128) + 128;
        g = contrastFactor * (g - 128) + 128;
        b = contrastFactor * (b - 128) + 128;

        d[i] = Math.max(0, Math.min(255, r));
        d[i + 1] = Math.max(0, Math.min(255, g));
        d[i + 2] = Math.max(0, Math.min(255, b));
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return outCanvas;
  }
};
