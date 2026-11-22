/**
 * Perspective Transform Module for DocScanner Web
 * Performs 4-point quadrilateral homography & unwarping on HTML5 Canvas.
 */

const PerspectiveTransform = {
  // Compute distance between two points
  distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.hypot(dx, dy);
  },

  // Calculate output rectangular dimensions from the 4 corners
  getOutputDimensions(corners) {
    const [tl, tr, br, bl] = corners;
    const widthTop = this.distance(tl, tr);
    const widthBottom = this.distance(bl, br);
    const maxWidth = Math.round(Math.max(widthTop, widthBottom));

    const heightLeft = this.distance(tl, bl);
    const heightRight = this.distance(tr, br);
    const maxHeight = Math.round(Math.max(heightLeft, heightRight));

    return {
      width: Math.max(100, Math.min(maxWidth, 2400)),
      height: Math.max(100, Math.min(maxHeight, 3200))
    };
  },

  // Solve 8-parameter projective homography matrix mapping unit square or quad
  // Maps src quad [tl, tr, br, bl] to dst rect [0,0, W,0, W,H, 0,H]
  getHomography(src, dst) {
    // Solve linear system: Ah = b
    const A = [];
    const b = [];
    for (let i = 0; i < 4; i++) {
      const sx = src[i].x, sy = src[i].y;
      const dx = dst[i].x, dy = dst[i].y;
      A.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy]);
      b.push(dx);
      A.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy]);
      b.push(dy);
    }
    const h = this.solveGaussian(A, b);
    return [
      h[0], h[1], h[2],
      h[3], h[4], h[5],
      h[6], h[7], 1
    ];
  },

  // Gaussian elimination solver for 8x8 system
  solveGaussian(A, b) {
    const n = 8;
    for (let i = 0; i < n; i++) {
      let maxEl = Math.abs(A[i][i]);
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(A[k][i]) > maxEl) {
          maxEl = Math.abs(A[k][i]);
          maxRow = k;
        }
      }
      for (let k = i; k < n; k++) {
        const tmp = A[maxRow][k];
        A[maxRow][k] = A[i][k];
        A[i][k] = tmp;
      }
      const tmpB = b[maxRow];
      b[maxRow] = b[i];
      b[i] = tmpB;

      for (let k = i + 1; k < n; k++) {
        const c = -A[k][i] / A[i][i];
        for (let j = i; j < n; j++) {
          if (i === j) {
            A[k][j] = 0;
          } else {
            A[k][j] += c * A[i][j];
          }
        }
        b[k] += c * b[i];
      }
    }
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) {
        sum += A[i][j] * x[j];
      }
      x[i] = (b[i] - sum) / A[i][i];
    }
    return x;
  },

  // Invert 3x3 matrix
  invert3x3(m) {
    const a = m[0], b = m[1], c = m[2];
    const d = m[3], e = m[4], f = m[5];
    const g = m[6], h = m[7], k = m[8];

    const A = e * k - f * h;
    const B = -(d * k - f * g);
    const C = d * h - e * g;
    const D = -(b * k - c * h);
    const E = a * k - c * g;
    const F = -(a * h - b * g);
    const G = b * f - c * e;
    const H = -(a * f - c * d);
    const K = a * e - b * d;

    const det = a * A + b * B + c * C;
    if (Math.abs(det) < 1e-8) return null;

    const invDet = 1 / det;
    return [
      A * invDet, D * invDet, G * invDet,
      B * invDet, E * invDet, H * invDet,
      C * invDet, F * invDet, K * invDet
    ];
  },

  // Warp an input image/canvas to a flattened rectangular output canvas
  warp(sourceImage, corners) {
    const dims = this.getOutputDimensions(corners);
    const outWidth = dims.width;
    const outHeight = dims.height;

    // Create offscreen source canvas to read pixels
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width = sourceImage.naturalWidth || sourceImage.width;
    srcCanvas.height = sourceImage.naturalHeight || sourceImage.height;
    const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
    srcCtx.drawImage(sourceImage, 0, 0);

    const srcData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
    const sPixels = srcData.data;
    const sw = srcCanvas.width;
    const sh = srcCanvas.height;

    // Destination quad
    const dstQuad = [
      { x: 0, y: 0 },
      { x: outWidth, y: 0 },
      { x: outWidth, y: outHeight },
      { x: 0, y: outHeight }
    ];

    // Compute H mapping src -> dst, then invert to map dst -> src for sampling
    const H = this.getHomography(corners, dstQuad);
    const invH = this.invert3x3(H);

    // Create destination canvas
    const destCanvas = document.createElement('canvas');
    destCanvas.width = outWidth;
    destCanvas.height = outHeight;
    const destCtx = destCanvas.getContext('2d', { willReadFrequently: true });
    const destData = destCtx.createImageData(outWidth, outHeight);
    const dPixels = destData.data;

    const h0 = invH[0], h1 = invH[1], h2 = invH[2];
    const h3 = invH[3], h4 = invH[4], h5 = invH[5];
    const h6 = invH[6], h7 = invH[7], h8 = invH[8];

    // Inverse mapping with bilinear interpolation
    for (let y = 0; y < outHeight; y++) {
      const rowOffset = y * outWidth * 4;
      for (let x = 0; x < outWidth; x++) {
        const dIdx = rowOffset + (x * 4);
        const z = h6 * x + h7 * y + h8;
        if (Math.abs(z) < 1e-6) continue;

        const srcX = (h0 * x + h1 * y + h2) / z;
        const srcY = (h3 * x + h4 * y + h5) / z;

        if (srcX >= 0 && srcX < sw - 1 && srcY >= 0 && srcY < sh - 1) {
          const x0 = Math.floor(srcX);
          const y0 = Math.floor(srcY);
          const x1 = x0 + 1;
          const y1 = y0 + 1;

          const dx = srcX - x0;
          const dy = srcY - y0;
          const w00 = (1 - dx) * (1 - dy);
          const w10 = dx * (1 - dy);
          const w01 = (1 - dx) * dy;
          const w11 = dx * dy;

          const idx00 = (y0 * sw + x0) * 4;
          const idx10 = (y0 * sw + x1) * 4;
          const idx01 = (y1 * sw + x0) * 4;
          const idx11 = (y1 * sw + x1) * 4;

          dPixels[dIdx] = Math.round(w00 * sPixels[idx00] + w10 * sPixels[idx10] + w01 * sPixels[idx01] + w11 * sPixels[idx11]);
          dPixels[dIdx + 1] = Math.round(w00 * sPixels[idx00 + 1] + w10 * sPixels[idx10 + 1] + w01 * sPixels[idx01 + 1] + w11 * sPixels[idx11 + 1]);
          dPixels[dIdx + 2] = Math.round(w00 * sPixels[idx00 + 2] + w10 * sPixels[idx10 + 2] + w01 * sPixels[idx01 + 2] + w11 * sPixels[idx11 + 2]);
          dPixels[dIdx + 3] = 255;
        } else {
          dPixels[dIdx] = 255;
          dPixels[dIdx + 1] = 255;
          dPixels[dIdx + 2] = 255;
          dPixels[dIdx + 3] = 255;
        }
      }
    }

    destCtx.putImageData(destData, 0, 0);
    return destCanvas;
  }
};
