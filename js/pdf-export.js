/**
 * Client-Side PDF Generator for DocScanner Web
 * Pure JavaScript, 100% Offline, Zero external CDN dependencies.
 * Creates standard ISO 32000-1 / PDF-1.4 documents from Canvas JPEG data.
 */

const PDFExporter = {
  // Convert DataURL to binary Uint8Array
  dataUrlToUint8Array(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  },

  // Generate a standard PDF Blob containing the scanned page
  generatePDFBlob(canvas) {
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Standard A4 dimensions in points (72 points per inch)
    const a4Width = 595.28;
    const a4Height = 841.89;

    // Fit image inside A4 keeping aspect ratio
    const scale = Math.min(a4Width / imgWidth, a4Height / imgHeight);
    const renderWidth = imgWidth * scale;
    const renderHeight = imgHeight * scale;
    const offsetX = (a4Width - renderWidth) / 2;
    const offsetY = (a4Height - renderHeight) / 2;

    // Extract JPEG binary data from Canvas
    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const jpegBytes = this.dataUrlToUint8Array(jpegDataUrl);

    // Build PDF structures
    const objects = [];
    const offsets = [];

    const encoder = new TextEncoder();

    // Helper to format PDF object
    function addObject(contentBytes) {
      objects.push(contentBytes);
    }

    // Object 1: Catalog
    const obj1 = encoder.encode("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
    // Object 2: Pages
    const obj2 = encoder.encode("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
    // Object 3: Page (A4)
    const obj3 = encoder.encode(
      `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${a4Width.toFixed(2)} ${a4Height.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`
    );

    // Object 4: Image XObject
    const imgHeader = encoder.encode(
      `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
    );
    const imgFooter = encoder.encode("\nendstream\nendobj\n");
    const obj4 = new Uint8Array(imgHeader.length + jpegBytes.length + imgFooter.length);
    obj4.set(imgHeader, 0);
    obj4.set(jpegBytes, imgHeader.length);
    obj4.set(imgFooter, imgHeader.length + jpegBytes.length);

    // Object 5: Content Stream (draw image positioned and scaled on A4)
    const streamContent = `q\n${renderWidth.toFixed(2)} 0 0 ${renderHeight.toFixed(2)} ${offsetX.toFixed(2)} ${offsetY.toFixed(2)} cm\n/Im0 Do\nQ\n`;
    const streamContentBytes = encoder.encode(streamContent);
    const streamHeader = encoder.encode(`5 0 obj\n<< /Length ${streamContentBytes.length} >>\nstream\n`);
    const streamFooter = encoder.encode("endstream\nendobj\n");
    const obj5 = new Uint8Array(streamHeader.length + streamContentBytes.length + streamFooter.length);
    obj5.set(streamHeader, 0);
    obj5.set(streamContentBytes, streamHeader.length);
    obj5.set(streamFooter, streamHeader.length + streamContentBytes.length);

    const pdfParts = [
      encoder.encode("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n")
    ];

    let currentOffset = pdfParts[0].length;
    const allObjs = [obj1, obj2, obj3, obj4, obj5];

    for (let i = 0; i < allObjs.length; i++) {
      offsets.push(currentOffset);
      pdfParts.push(allObjs[i]);
      currentOffset += allObjs[i].length;
    }

    // XRef table
    const startXref = currentOffset;
    let xref = `xref\n0 ${allObjs.length + 1}\n0000000000 65535 f \n`;
    for (let i = 0; i < offsets.length; i++) {
      xref += String(offsets[i]).padStart(10, '0') + " 00000 n \n";
    }
    xref += `trailer\n<< /Size ${allObjs.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;
    pdfParts.push(encoder.encode(xref));

    return new Blob(pdfParts, { type: 'application/pdf' });
  },

  // Save/Download PDF locally
  savePDF(canvas, filename = 'scanned-document.pdf') {
    const blob = this.generatePDFBlob(canvas);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1500);
  }
};
