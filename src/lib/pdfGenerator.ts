/**
 * Utility for generating clean, professional invoice PDFs
 * Ensures ONLY the invoice document (#printable-invoice-content) is captured,
 * completely excluding headers, footers, website navigation, back buttons, status badges, and widgets.
 */

export interface DownloadInvoiceOptions {
  invoiceId: string;
  elementId?: string;
  onStart?: () => void;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

export async function downloadInvoicePdf({
  invoiceId,
  elementId = 'printable-invoice-content',
  onStart,
  onSuccess,
  onError
}: DownloadInvoiceOptions): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    const err = new Error(`Élément #${elementId} introuvable.`);
    if (onError) onError(err);
    return;
  }

  if (onStart) onStart();

  try {
    const html2canvasModule = await import('html2canvas');
    const html2canvas = html2canvasModule.default;
    const { jsPDF } = await import('jspdf');

    // High quality capture of only the invoice element
    const canvas = await html2canvas(element, {
      scale: 2, // Retain sharp typography
      useCORS: true, // Allow images with CORS headers
      allowTaint: false, // MANDATORY: allowTaint must be false so canvas.toDataURL() never throws SecurityError
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 10000,
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          // Reset styling to ensure clean A4 appearance without shadow or borders in the capture
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.border = 'none';
          clonedEl.style.borderRadius = '0';
          clonedEl.style.margin = '0';
          clonedEl.style.width = '100%';
          clonedEl.style.maxWidth = '800px';

          // Ensure any image that might fail CORS has crossOrigin anonymous set
          const images = clonedEl.getElementsByTagName('img');
          for (let i = 0; i < images.length; i++) {
            const img = images[i];
            img.crossOrigin = 'anonymous';
          }
        }
      }
    });

    const imgData = canvas.toDataURL('image/png');

    // Standard A4 dimensions in pt (595.28 x 841.89 pt)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 20; // 20pt margin around the document

    const availableWidth = pdfWidth - margin * 2;
    const availableHeight = pdfHeight - margin * 2;

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);

    const printWidth = imgWidth * ratio;
    const printHeight = imgHeight * ratio;

    // Center horizontally on page
    const xOffset = margin + (availableWidth - printWidth) / 2;
    const yOffset = margin;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, printWidth, printHeight);
    pdf.save(`Facture_${invoiceId}.pdf`);

    if (onSuccess) onSuccess();
  } catch (err) {
    console.error('Direct PDF export error, triggering clean print fallback:', err);
    
    // Clean print fallback: only print #printable-invoice-content without browser or app chrome
    const prevTitle = document.title;
    document.title = `Facture_${invoiceId}`;
    window.print();
    document.title = prevTitle;

    if (onError) onError(err);
  }
}
