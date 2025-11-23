// src/services/pdf.ts
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

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
  const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  saveAs(blob, filename);
};
