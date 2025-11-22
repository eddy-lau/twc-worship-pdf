// src/services/pdf.ts
import { PDFDocument } from 'pdf-lib';

export const mergePdfs = async (pdfBuffers: ArrayBuffer[]): Promise<Uint8Array> => {
  const mergedPdf = await PDFDocument.create();

  for (const pdfBuffer of pdfBuffers) {
    const pdf = await PDFDocument.load(pdfBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
};

export const downloadPdf = (pdfBytes: Uint8Array, filename: string) => {
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
