/**
 * Utility for generating clean, professional 1-page A4 invoice PDFs
 * Ensures ONLY the invoice document (#printable-invoice-content) is captured,
 * completely excluding headers, footers, website navigation, back buttons, status badges, and widgets.
 * Strips all emojis and resolves modern CSS color functions (oklch/oklab/color-mix) so html2canvas renders reliably.
 */

export function stripEmojis(value?: string | null): string {
  if (!value) return '';
  return value
    .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '')
    .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function stripEmojisPreserveSpacing(value: string): string {
  return value
    .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '')
    .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}]/gu, '');
}

let colorCanvasCtx: CanvasRenderingContext2D | null = null;
function getColorCtx(): CanvasRenderingContext2D | null {
  if (colorCanvasCtx) return colorCanvasCtx;
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  colorCanvasCtx = canvas.getContext('2d', { willReadFrequently: true });
  return colorCanvasCtx;
}

function resolveColorToRgba(color: string): string {
  if (!color || color === 'none' || color === 'transparent' || color === 'inherit' || color === 'initial') {
    return color;
  }
  if (!/(oklch|oklab|color-mix|color\(|lab\(|lch\()/i.test(color)) {
    return color;
  }
  const ctx = getColorCtx();
  if (!ctx) return '#1e293b';
  try {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    const a = Number((data[3] / 255).toFixed(3));
    return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${a})`;
  } catch {
    return 'rgba(30, 41, 59, 1)';
  }
}

interface ResolvedNodeColors {
  color: string;
  backgroundColor: string;
  borderTopColor: string;
  borderRightColor: string;
  borderBottomColor: string;
  borderLeftColor: string;
  outlineColor: string;
  fill: string;
  stroke: string;
}

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

    // Snapshot resolved RGB colors from live DOM before html2canvas clones and parses stylesheets
    const liveNodes = [element, ...Array.from(element.querySelectorAll('*'))] as HTMLElement[];
    const resolvedColors: ResolvedNodeColors[] = liveNodes.map((node) => {
      const cs = window.getComputedStyle(node);
      return {
        color: resolveColorToRgba(cs.color),
        backgroundColor: resolveColorToRgba(cs.backgroundColor),
        borderTopColor: resolveColorToRgba(cs.borderTopColor),
        borderRightColor: resolveColorToRgba(cs.borderRightColor),
        borderBottomColor: resolveColorToRgba(cs.borderBottomColor),
        borderLeftColor: resolveColorToRgba(cs.borderLeftColor),
        outlineColor: resolveColorToRgba(cs.outlineColor),
        fill: resolveColorToRgba(cs.fill),
        stroke: resolveColorToRgba(cs.stroke)
      };
    });

    // High quality capture of only the invoice element
    const canvas = await html2canvas(element, {
      scale: 2, // Retain sharp typography
      useCORS: true, // Allow images with CORS headers
      allowTaint: false, // MANDATORY: allowTaint must be false so canvas.toDataURL() never throws SecurityError
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 8000,
      onclone: (clonedDoc) => {
        // Neutralize modern CSS color functions in <style> tags so html2canvas parser never throws on oklch/oklab
        const styleTags = Array.from(clonedDoc.querySelectorAll('style'));
        for (const styleTag of styleTags) {
          if (styleTag.textContent && /(oklch|oklab|color-mix)\(/i.test(styleTag.textContent)) {
            styleTag.textContent = styleTag.textContent
              .replace(/color-mix\([^;{}]+\)/gi, 'rgba(15, 23, 42, 0.1)')
              .replace(/oklch\([^)]+\)/gi, '#334155')
              .replace(/oklab\([^)]+\)/gi, '#334155');
          }
        }

        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          // Reset styling to ensure clean single-page A4 appearance without shadow or outer chrome
          clonedEl.style.boxShadow = 'none';
          clonedEl.style.border = 'none';
          clonedEl.style.borderRadius = '0';
          clonedEl.style.margin = '0';
          clonedEl.style.width = '780px';
          clonedEl.style.maxWidth = '780px';
          clonedEl.style.backgroundColor = '#ffffff';
          clonedEl.style.padding = '20px 28px';
          clonedEl.style.boxSizing = 'border-box';

          // Apply resolved RGB colors to every cloned element
          const clonedNodes = [clonedEl, ...Array.from(clonedEl.querySelectorAll('*'))] as HTMLElement[];
          const len = Math.min(clonedNodes.length, resolvedColors.length);
          for (let i = 0; i < len; i++) {
            const cNode = clonedNodes[i];
            const rc = resolvedColors[i];
            if (cNode.style && rc) {
              cNode.style.color = rc.color;
              cNode.style.backgroundColor = rc.backgroundColor;
              cNode.style.borderTopColor = rc.borderTopColor;
              cNode.style.borderRightColor = rc.borderRightColor;
              cNode.style.borderBottomColor = rc.borderBottomColor;
              cNode.style.borderLeftColor = rc.borderLeftColor;
              cNode.style.outlineColor = rc.outlineColor;
              if (rc.fill && rc.fill !== 'none') cNode.style.fill = rc.fill;
              if (rc.stroke && rc.stroke !== 'none') cNode.style.stroke = rc.stroke;
              cNode.style.boxShadow = 'none';
            }
          }

          // Strip any residual emojis from text nodes inside the cloned invoice
          const walker = clonedDoc.createTreeWalker(clonedEl, NodeFilter.SHOW_TEXT);
          let textNode = walker.nextNode();
          while (textNode) {
            if (textNode.nodeValue) {
              textNode.nodeValue = stripEmojisPreserveSpacing(textNode.nodeValue);
            }
            textNode = walker.nextNode();
          }

          // Ensure images don't taint canvas or hang capture
          const images = clonedEl.getElementsByTagName('img');
          for (let i = 0; i < images.length; i++) {
            const img = images[i];
            const src = img.getAttribute('src') || '';
            if (src.startsWith('http') && !src.startsWith(window.location.origin)) {
              img.crossOrigin = 'anonymous';
            }
          }
        }
      }
    });

    const imgData = canvas.toDataURL('image/png');

    // Standard A4 dimensions in pt (595.28 x 841.89 pt) - strictly 1 single page
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 16; // 16pt clean margin around the single page

    const availableWidth = pdfWidth - margin * 2;
    const availableHeight = pdfHeight - margin * 2;

    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);

    const printWidth = imgWidth * ratio;
    const printHeight = imgHeight * ratio;

    // Center horizontally on page, align neatly to top margin
    const xOffset = margin + (availableWidth - printWidth) / 2;
    const yOffset = margin;

    pdf.addImage(imgData, 'PNG', xOffset, yOffset, printWidth, printHeight);
    pdf.save(`Facture_${stripEmojis(invoiceId) || invoiceId}.pdf`);

    if (onSuccess) onSuccess();
  } catch (err) {
    console.error('Direct PDF export error, triggering clean single-page print fallback:', err);

    // Clean single-page print fallback
    const prevTitle = document.title;
    document.title = `Facture_${stripEmojis(invoiceId) || invoiceId}`;
    window.print();
    document.title = prevTitle;

    if (onError) onError(err);
  }
}
