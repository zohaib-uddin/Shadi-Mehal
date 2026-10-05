import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const downloadPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  try {
    // Add a tiny delay to ensure DOM is ready and animations are settled
    await new Promise(resolve => setTimeout(resolve, 100));

    // GLOBAL STYLE SANITIZATION - html2canvas crashes on oklch in ANY stylesheet
    const styles = document.querySelectorAll('style');
    const originalStyleContents: {el: HTMLStyleElement, content: string}[] = [];
    
    styles.forEach(style => {
      if (style.textContent?.includes('oklch')) {
        originalStyleContents.push({ el: style, content: style.textContent });
        // Replace oklch with a fallback hex color
        style.textContent = style.textContent.replace(/oklch\([^)]+\)/g, '#000000');
      }
    });

    try {
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: -window.scrollY,
        logging: false,
        removeContainer: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById(elementId);
          if (clonedElement) {
            // Remove problematic styles from the clone before capture
            const elements = clonedElement.querySelectorAll('*');
            elements.forEach((el: any) => {
              el.style.filter = 'none';
              el.style.backdropFilter = 'none';
              
              // Remove oklch from inline styles directly
              const styleAttr = el.getAttribute('style') || '';
              if (styleAttr.includes('oklch')) {
                const cleanedStyle = styleAttr.replace(/oklch\([^)]+\)/g, '#000000');
                el.setAttribute('style', cleanedStyle);
              }
            });
          }
        }
      });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("Captured canvas has zero dimensions");
      }

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width / 1.5, canvas.height / 1.5]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 1.5, canvas.height / 1.5);
      pdf.save(`${filename}.pdf`);
    } finally {
      // Restore original styles
      originalStyleContents.forEach(({ el, content }) => {
        el.textContent = content;
      });
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const exportAllInvoices = async (invoices: any[], filename: string) => {
  const reportElement = document.createElement('div');
  reportElement.style.padding = '60px';
  reportElement.style.background = 'white';
  reportElement.style.width = '1200px';
  reportElement.style.position = 'absolute';
  reportElement.style.left = '-9999px';
  
  reportElement.innerHTML = `
    <div style="border-bottom: 8px solid #ffd200; padding-bottom: 40px; margin-bottom: 40px;">
        <h1 style="font-family: serif; font-size: 42px; font-weight: bold; margin-bottom: 10px; color: #0f172a;">Shadi Mehal</h1>
        <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 4px; color: #64748b; font-weight: bold;">Financial Portfolio Export Report</p>
    </div>
    
    <div style="display: flex; justify-content: space-between; margin-bottom: 60px;">
        <div>
            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8;">Statement Period</p>
            <p style="font-size: 16px; font-weight: bold; color: #0f172a;">${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div style="text-align: right;">
            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8;">Generation Timestamp</p>
            <p style="font-size: 16px; font-weight: bold; color: #0f172a;">${new Date().toLocaleString()}</p>
        </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
      <thead>
        <tr style="border-bottom: 2px solid #0f172a; text-align: left; font-size: 11px; text-transform: uppercase; color: #0f172a;">
          <th style="padding: 15px 10px;">ID</th>
          <th style="padding: 15px 10px;">Date</th>
          <th style="padding: 15px 10px;">Customer Entity</th>
          <th style="padding: 15px 10px;">Payment Strategy</th>
          <th style="padding: 15px 10px; text-align: right;">Valuation</th>
        </tr>
      </thead>
      <tbody>
        ${invoices.map(inv => `
          <tr style="border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155;">
            <td style="padding: 20px 10px; font-family: monospace;">#${String(inv.id).slice(0, 8).toUpperCase()}</td>
            <td style="padding: 20px 10px;">${new Date(inv.created_at).toLocaleDateString('en-GB')}</td>
            <td style="padding: 20px 10px; font-weight: 600;">${inv.customer_name || 'Anonymous Client'}</td>
            <td style="padding: 20px 10px; text-transform: uppercase; font-size: 10px; font-weight: bold; color: #94a3b8;">${inv.payment_method || 'N/A'}</td>
            <td style="padding: 20px 10px; text-align: right; font-weight: 800; color: #0f172a;">Rs. ${Number(inv.amount || 0).toLocaleString()}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr style="background: #0f172a; color: #ffffff;">
          <td colspan="4" style="padding: 25px; text-align: right; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Aggregate Portfolio Valuation</td>
          <td style="padding: 25px; text-align: right; font-size: 22px; font-weight: bold; color: #ffd200;">Rs. ${invoices.reduce((sum, inv) => sum + Number(inv.amount || 0), 0).toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>

    <div style="margin-top: 100px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 40px;">
        <p style="font-family: serif; font-size: 18px; font-weight: bold; color: #94a3b8;">Thank you for your continued excellence.</p>
        <p style="font-size: 9px; text-transform: uppercase; letter-spacing: 5px; color: #cbd5e1; margin-top: 10px;">Shadi Mehal Official Financial Record</p>
    </div>
  `;

  document.body.appendChild(reportElement);
  
  try {
    // GLOBAL STYLE SANITIZATION
    const styles = document.querySelectorAll('style');
    const originalStyleContents: {el: HTMLStyleElement, content: string}[] = [];
    
    styles.forEach(style => {
      if (style.textContent?.includes('oklch')) {
        originalStyleContents.push({ el: style, content: style.textContent });
        style.textContent = style.textContent.replace(/oklch\([^)]+\)/g, '#000000');
      }
    });

    try {
      const canvas = await html2canvas(reportElement, { 
          scale: 1.5,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          removeContainer: true,
          onclone: (clonedDoc) => {
            const elements = clonedDoc.querySelectorAll('*');
            elements.forEach((el: any) => {
              el.style.filter = 'none';
              el.style.backdropFilter = 'none';
              
              // Force safe colors in the export report too
              const styleAttr = el.getAttribute('style') || '';
              if (styleAttr.includes('oklch')) {
                const cleanedStyle = styleAttr.replace(/oklch\([^)]+\)/g, '#000000');
                el.setAttribute('style', cleanedStyle);
              }
            });
          }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width / 1.5, canvas.height / 1.5]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 1.5, canvas.height / 1.5);
      pdf.save(`${filename}.pdf`);
    } finally {
      // Restore original styles
      originalStyleContents.forEach(({ el, content }) => {
        el.textContent = content;
      });
    }
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  } finally {
    document.body.removeChild(reportElement);
  }
};
