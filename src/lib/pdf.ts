/**
 * Export rendered print sheets to PDF via html2canvas + jsPDF.
 * Both libraries are imported dynamically so they are only downloaded when the
 * user actually clicks "Xuất PDF" — never in the initial bundle.
 */

export interface PdfExportOptions {
  fileName: string;
  format?: 'a3' | 'a4';
  orientation?: 'landscape' | 'portrait';
  scale?: number;
}

export async function exportElementsToPdf(
  selector: string,
  options: PdfExportOptions
): Promise<void> {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
  if (nodes.length === 0) {
    throw new Error('Không tìm thấy nội dung để xuất PDF.');
  }

  const { default: html2canvas } = await import('html2canvas');
  const { jsPDF } = await import('jspdf');

  const pdf = new jsPDF({
    orientation: options.orientation ?? 'landscape',
    unit: 'mm',
    format: options.format ?? 'a3',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < nodes.length; i++) {
    const canvas = await html2canvas(nodes[i], {
      scale: options.scale ?? 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    });
    const image = canvas.toDataURL('image/jpeg', 0.95);
    if (i > 0) pdf.addPage();
    pdf.addImage(image, 'JPEG', 0, 0, pageWidth, pageHeight);
  }

  pdf.save(options.fileName);
}

/** Trigger the browser print dialog after fonts/layout have settled. */
export async function printNow(): Promise<void> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready;
  }
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );
  window.print();
}
