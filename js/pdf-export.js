/**
 * Client-Side Multi-Page PDF Generator for DocScanner Web
 * Pure JavaScript, 100% Offline, Zero external CDN dependencies.
 * Creates standard ISO 32000-1 / PDF-1.4 multi-page documents from Canvas JPEG data.
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

  // Generate a standard PDF Blob containing 1 or more scanned pages
  generatePDFBlob(canvasesInput) {
    const canvases = Array.isArray(canvasesInput) ? canvasesInput : [canvasesInput];
    const numPages = canvases.length;

    // Standard A4 dimensions in points (72 points per inch)
    const a4Width = 595.28;
    const a4Height = 841.89;

    const encoder = new TextEncoder();
    const allObjs = [];

    // Object 1: Catalog
    allObjs.push(encoder.encode("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"));

    // Prepare page IDs
    const pageKidsRefs = [];
    for (let i = 0; i < numPages; i++) {
      const pageObjId = 3 + (i * 3);
      pageKidsRefs.push(`${pageObjId} 0 R`);
    }

    // Object 2: Pages Root
    allObjs.push(encoder.encode(`2 0 obj\n<< /Type /Pages /Kids [${pageKidsRefs.join(' ')}] /Count ${numPages} >>\nendobj\n`));

    // For each page: build Page Object, Image XObject, and Content Stream
    for (let i = 0; i < numPages; i++) {
      const canvas = canvases[i];
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Fit image inside A4 keeping aspect ratio
      const scale = Math.min(a4Width / imgWidth, a4Height / imgHeight);
      const renderWidth = imgWidth * scale;
      const renderHeight = imgHeight * scale;
      const offsetX = (a4Width - renderWidth) / 2;
      const offsetY = (a4Height - renderHeight) / 2;

      // Extract JPEG data
      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const jpegBytes = this.dataUrlToUint8Array(jpegDataUrl);

      const pageObjId = 3 + (i * 3);
      const imgObjId = 4 + (i * 3);
      const contentObjId = 5 + (i * 3);

      // Page Object
      const pageObj = encoder.encode(
        `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${a4Width.toFixed(2)} ${a4Height.toFixed(2)}] /Resources << /XObject << /Im${i} ${imgObjId} 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj\n`
      );
      allObjs.push(pageObj);

      // Image XObject
      const imgHeader = encoder.encode(
        `${imgObjId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgWidth} /Height ${imgHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`
      );
      const imgFooter = encoder.encode("\nendstream\nendobj\n");
      const imgFullObj = new Uint8Array(imgHeader.length + jpegBytes.length + imgFooter.length);
      imgFullObj.set(imgHeader, 0);
      imgFullObj.set(jpegBytes, imgHeader.length);
      imgFullObj.set(imgFooter, imgHeader.length + jpegBytes.length);
      allObjs.push(imgFullObj);

      // Content Stream
      const streamContent = `q\n${renderWidth.toFixed(2)} 0 0 ${renderHeight.toFixed(2)} ${offsetX.toFixed(2)} ${offsetY.toFixed(2)} cm\n/Im${i} Do\nQ\n`;
      const streamContentBytes = encoder.encode(streamContent);
      const streamHeader = encoder.encode(`${contentObjId} 0 obj\n<< /Length ${streamContentBytes.length} >>\nstream\n`);
      const streamFooter = encoder.encode("endstream\nendobj\n");
      const streamFullObj = new Uint8Array(streamHeader.length + streamContentBytes.length + streamFooter.length);
      streamFullObj.set(streamHeader, 0);
      streamFullObj.set(streamContentBytes, streamHeader.length);
      streamFullObj.set(streamFooter, streamHeader.length + streamContentBytes.length);
      allObjs.push(streamFullObj);
    }

    // Assemble PDF file
    const pdfParts = [
      encoder.encode("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n")
    ];

    const offsets = [];
    let currentOffset = pdfParts[0].length;

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
  savePDF(canvases, filename = 'scanned-document.pdf') {
    const blob = this.generatePDFBlob(canvases);
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
