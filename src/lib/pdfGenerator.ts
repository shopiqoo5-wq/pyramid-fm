import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Order, Company, Product, GlobalSettings, ReturnRequest, Quotation } from '../types';

const drawHeader = (doc: jsPDF, settings: GlobalSettings, title: string) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let currY = 20;

  // 1. Logo
  if (settings.logoUrl && settings.logoUrl.startsWith('data:image')) {
    try {
      const imgWidth = 30;
      const imgHeight = 15;
      const xPos = settings.logoPosition === 'center' ? (pageWidth - imgWidth) / 2 : margin;
      
      // Auto-detect format from data URI if possible
      const formatMatch = settings.logoUrl.match(/^data:image\/([a-zA-Z+]+);base64,/);
      const format = formatMatch ? formatMatch[1].toUpperCase() : 'PNG';
      
      doc.addImage(settings.logoUrl, format as any, xPos, currY, imgWidth, imgHeight, undefined, 'FAST');
      currY += 20;
    } catch (e) {
      console.error('PDF Logo Compression/Rendering Error:', e);
      // If logo fails, we still want to generate the rest of the PDF
      currY += 5; 
    }
  }

  // 2. Title
  doc.setFontSize(22);
  doc.setTextColor(41, 128, 185);
  doc.setFont('helvetica', 'bold');
  const titleX = settings.logoPosition === 'center' ? pageWidth / 2 : margin;
  doc.text(title, titleX, currY, { align: settings.logoPosition === 'center' ? 'center' : 'left' });
  currY += 10;

  // 3. Company Info
  doc.setFontSize(11);
  doc.setTextColor(60);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.companyName, titleX, currY, { align: settings.logoPosition === 'center' ? 'center' : 'left' });
  currY += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(settings.officeAddress, titleX, currY, { align: settings.logoPosition === 'center' ? 'center' : 'left' });
  currY += 5;

  let detailsStr = '';
  if (settings.gstNumber) detailsStr += `GSTIN: ${settings.gstNumber} | `;
  if (settings.contactPhone) detailsStr += `Ph: ${settings.contactPhone} | `;
  detailsStr += `Email: ${settings.supportEmail}`;
  
  doc.text(detailsStr, titleX, currY, { align: settings.logoPosition === 'center' ? 'center' : 'left' });
  
  return currY + 15;
};

const drawFooter = (doc: jsPDF, settings: GlobalSettings) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(settings.footerText || 'Computer generated document.', pageWidth / 2, pageHeight - 10, { align: 'center' });
};

export const generateInvoicePDF = (order: Order, company: Company | undefined, products: Product[], settings: GlobalSettings, docInstance?: jsPDF) => {
  const doc = docInstance || new jsPDF();
  const startY = drawHeader(doc, settings, 'TAX INVOICE');
  
  // Invoice Details Box
  const invoiceNum = `INV-${order.customId.split('-')[1] || '000'}-${order.customId.split('-')[2] || order.id.slice(-4)}`;
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Invoice No: ${invoiceNum}`, 130, startY - 25);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 130, startY - 19);
  doc.text(`Order Ref: ${order.customId}`, 130, startY - 13);

  // Bill To
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 14, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(company?.name || 'Cash Client', 14, startY + 7);
  if (company?.gstNumber) doc.text(`GSTIN: ${company.gstNumber}`, 14, startY + 13);
  if (company?.pointOfContact) doc.text(`Attn: ${company.pointOfContact}`, 14, startY + 19);

  // Table
  const tableData = order.items.map(item => {
    const product = products.find(p => p.id === item.productId);
    return [
      product ? product.name : item.productId,
      item.quantity.toString(),
      `Rs ${item.unitPrice.toFixed(2)}`,
      `Rs ${item.gstAmount.toFixed(2)}`,
      `Rs ${item.total.toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: startY + 25,
    head: [['Item / Description', 'Qty', 'Unit Price', 'GST Amount', 'Total (Rs)']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 80 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;
  let totalY = finalY + 15;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Subtotal:', 140, totalY);
  doc.text(`Rs ${(order.totalAmount - order.gstAmount).toFixed(2)}`, 190, totalY, { align: 'right' });
  
  totalY += 7;
  doc.text('Total GST:', 140, totalY);
  doc.text(`Rs ${order.gstAmount.toFixed(2)}`, 190, totalY, { align: 'right' });

  totalY += 12;
  doc.setFontSize(12);
  doc.setTextColor(41, 128, 185);
  doc.text('Grand Total:', 125, totalY);
  doc.text(`Rs ${order.netAmount.toFixed(2)}`, 190, totalY, { align: 'right' });

  // Signatory
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text('For Pyramid FM Pvt Ltd', 140, totalY + 25);
  doc.setDrawColor(200);
  doc.line(140, totalY + 45, 190, totalY + 45);
  doc.text('Authorized Signatory', 140, totalY + 50);

  drawFooter(doc, settings);
  if (!docInstance) doc.save(`${invoiceNum}.pdf`);
  return doc;
};

export const generateDeliveryChallanPDF = (order: Order, company: Company | undefined, settings: GlobalSettings, docInstance?: jsPDF) => {
    const doc = docInstance || new jsPDF();
    const startY = drawHeader(doc, settings, 'DELIVERY CHALLAN');

    const challanNum = `DC-${order.customId.split('-')[1] || '000'}-${order.id.slice(-4)}`;
    doc.setFontSize(10);
    doc.text(`Challan No: ${challanNum}`, 130, startY - 25);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 130, startY - 19);
    doc.text(`Order Ref: ${order.customId}`, 130, startY - 13);

    doc.setFont('helvetica', 'bold');
    doc.text('Ship To:', 14, startY);
    doc.setFont('helvetica', 'normal');
    doc.text(company?.name || 'Client', 14, startY + 7);
    doc.text('Delivery Address: As per order records', 14, startY + 13);

    const tableData = order.items.map((item, idx) => [
        (idx + 1).toString(),
        item.productId,
        item.quantity.toString(),
        '________________' // Received Qty
    ]);

    autoTable(doc, {
        startY: startY + 25,
        head: [['S.No', 'Product SKU / Description', 'Dispatched Qty', 'Received Qty']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [52, 73, 94], textColor: 255 }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Receiver\'s Signature & Stamp', 14, finalY + 35);
    doc.setDrawColor(200);
    doc.line(14, finalY + 30, 70, finalY + 30);

    doc.text('Authorized Signatory', 140, finalY + 35);
    doc.line(140, finalY + 30, 190, finalY + 30);

    drawFooter(doc, settings);
    if (!docInstance) doc.save(`${challanNum}.pdf`);
    return doc;
};

export const generateBatchInvoicesPDF = (orders: Order[], companies: Company[], products: Product[], settings: GlobalSettings) => {
  const doc = new jsPDF();
  orders.forEach((order, index) => {
    const company = companies.find(c => c.id === order.companyId);
    if (index > 0) doc.addPage();
    generateInvoicePDF(order, company, products, settings, doc);
  });
  doc.save(`Batch_Invoices_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateBatchChallansPDF = (orders: Order[], companies: Company[], settings: GlobalSettings) => {
  const doc = new jsPDF();
  orders.forEach((order, index) => {
    const company = companies.find(c => c.id === order.companyId);
    if (index > 0) doc.addPage();
    generateDeliveryChallanPDF(order, company, settings, doc);
  });
  doc.save(`Batch_Challans_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateBatchManifestPDF = (orders: Order[], companies: Company[], settings: GlobalSettings) => {
  const doc = new jsPDF();
  const startY = drawHeader(doc, settings, 'DISPATCH MANIFEST (SUMMARY)');
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Batch ID: MAN-${new Date().getTime().toString().slice(-6)}`, 14, startY);
  doc.text(`Manifest Date: ${new Date().toLocaleDateString()}`, 14, startY + 6);
  doc.text(`Total Shipments: ${orders.length}`, 14, startY + 12);

  const tableData = orders.map((o, idx) => {
    const company = companies.find(c => c.id === o.companyId);
    const itemCount = o.items.reduce((sum, item) => sum + item.quantity, 0);
    return [
      (idx + 1).toString(),
      o.customId,
      company?.name || 'Cash Client',
      o.locationId || 'Default Site',
      itemCount.toString(),
      o.status.toUpperCase()
    ];
  });

  autoTable(doc, {
    startY: startY + 20,
    head: [['S.No', 'Order Ref', 'Client / Destination', 'Region', 'Qty', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [44, 62, 80], textColor: 255 },
    styles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 40 }, 4: { halign: 'center' } }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;
  
  // Weights (Mock)
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Gross Weight (Est): ${(orders.length * 1.5).toFixed(1)} KG`, 14, finalY + 15);

  // Signatures
  doc.setFontSize(10);
  doc.text('Dispatcher Signature', 14, finalY + 40);
  doc.line(14, finalY + 36, 60, finalY + 36);

  doc.text('Driver Signature (Acknowledgement)', 140, finalY + 40);
  doc.line(140, finalY + 36, 195, finalY + 36);

  drawFooter(doc, settings);
  doc.save(`Dispatch_Manifest_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateCreditNotePDF = (returnReq: ReturnRequest, company: Company | undefined, settings: GlobalSettings) => {
  const doc = new jsPDF();
  const startY = drawHeader(doc, settings, 'CREDIT NOTE');
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Credit Note ID: CN-${returnReq.id.split('-')[1]}`, 14, startY);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, startY + 6);
  doc.text(`Reference Order: ${returnReq.orderId}`, 14, startY + 12);

  // Billing Details
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('Issued To:', 14, startY + 25);
  doc.setFont('helvetica', 'normal');
  doc.text(company?.name || 'Cash Client', 14, startY + 31);
  doc.text(company?.gstNumber ? `GST: ${company.gstNumber}` : '', 14, startY + 36);

  const tableData = returnReq.items.map((item: any, idx: number) => [
    (idx + 1).toString(),
    item.productId,
    item.quantity.toString(),
    'Return/Damage',
    '--'
  ]);

  autoTable(doc, {
    startY: startY + 45,
    head: [['S.No', 'Product ID', 'Qty', 'Reason', 'Total (Cr)']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [39, 174, 96], textColor: 255 },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFont('helvetica', 'bold');
  doc.text('Note: This credit has been added to your corporate account balance.', 14, finalY + 15);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signature', 14, finalY + 40);
  doc.line(14, finalY + 36, 60, finalY + 36);

  drawFooter(doc, settings);
  doc.save(`Credit_Note_${returnReq.id}.pdf`);
};

export const generateConsumptionReportPDF = (companyName: string, orders: Order[], settings: GlobalSettings) => {
  const doc = new jsPDF();
  const startY = drawHeader(doc, settings, 'CONSUMPTION REPORT');
  
  doc.setFontSize(11);
  doc.text(`Client: ${companyName}`, 14, startY);
  doc.text(`Period: All Records`, 14, startY + 6);

  const tableData = orders.map(o => [
    new Date(o.createdAt).toLocaleDateString(),
    o.customId,
    o.costCenter || 'Default',
    `Rs ${o.netAmount.toFixed(2)}`,
    o.status.toUpperCase()
  ]);

  autoTable(doc, {
    startY: startY + 15,
    head: [['Date', 'Order ID', 'Cost Center', 'Amount', 'Status']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 100;
  const totalSpent = orders.reduce((sum, o) => sum + o.netAmount, 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Total Consumption: Rs ${totalSpent.toFixed(2)}`, 14, finalY + 15);

  drawFooter(doc, settings);
  doc.save(`Consumption_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateStatementPDF = (company: Company, orders: Order[], settings: GlobalSettings) => {
  const doc = new jsPDF();
  const startY = drawHeader(doc, settings, 'STATEMENT OF ACCOUNT');
  
  doc.setFontSize(11);
  doc.text(`Client: ${company.name}`, 14, startY);
  doc.text(`As of: ${new Date().toLocaleDateString()}`, 14, startY + 6);
  if (company.gstNumber) doc.text(`GSTIN: ${company.gstNumber}`, 14, startY + 12);

  const tableData = orders.map(o => [
    new Date(o.createdAt).toLocaleDateString(),
    o.customId,
    o.status.toUpperCase(),
    `Rs ${o.netAmount.toFixed(2)}`,
    o.isPaid ? 'PAID' : 'PENDING'
  ]);

  autoTable(doc, {
    startY: startY + 20,
    head: [['Date', 'Ref Number', 'Status', 'Amount', 'Payment']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [44, 62, 80], textColor: 255 },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 100;
  const totalOutstanding = orders.filter(o => !o.isPaid).reduce((sum, o) => sum + o.netAmount, 0);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Total Outstanding: Rs ${totalOutstanding.toFixed(2)}`, 14, finalY + 15);

  drawFooter(doc, settings);
  doc.save(`Statement_${company.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateMasterQRCodeCatalogPDF = (items: { name: string, sku: string, qrDataUrl: string }[], settings: GlobalSettings) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const cols = 3;
  const boxWidth = (pageWidth - (margin * 2)) / cols;
  const boxHeight = 80;
  
  let currY = drawHeader(doc, settings, 'MASTER QR CATALOG');
  let xCount = 0;

  items.forEach((item) => {
    // Check for page break
    if (currY + boxHeight > 270) {
      doc.addPage();
      currY = drawHeader(doc, settings, 'MASTER QR CATALOG');
      xCount = 0;
    }

    const xPos = margin + (xCount * boxWidth);
    
    // Transparent box with light border
    doc.setDrawColor(230);
    doc.setLineWidth(0.1);
    doc.rect(xPos + 5, currY + 5, boxWidth - 10, boxHeight - 10);
    
    // Product Name (Truncated)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80);
    const nameLines = doc.splitTextToSize(item.name.toUpperCase(), boxWidth - 20);
    doc.text(nameLines.slice(0, 2), xPos + (boxWidth / 2), currY + 15, { align: 'center' });
    
    // SKU Label
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(127, 140, 141);
    doc.text(`SKU: ${item.sku}`, xPos + (boxWidth / 2), currY + 25, { align: 'center' });

    // QR Image Rendering
    try {
      // Background for contrast
      doc.setFillColor(255, 255, 255);
      doc.rect(xPos + (boxWidth / 2) - 18, currY + 30, 36, 36, 'F');
      doc.addImage(item.qrDataUrl, 'PNG', xPos + (boxWidth / 2) - 15, currY + 33, 30, 30);
    } catch (e) {
      console.error('QR Render Error:', e);
    }
    
    doc.setFontSize(6);
    doc.text('SCAN TO REORDER', xPos + (boxWidth / 2), currY + 68, { align: 'center' });

    xCount++;
    if (xCount >= cols) {
      xCount = 0;
      currY += boxHeight;
    }
  });

  drawFooter(doc, settings);
  doc.save(`Master_QR_Catalog_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const generateQuotationPDF = (quotation: Quotation, company: Company | undefined, products: Product[], settings: GlobalSettings, docInstance?: jsPDF) => {
  const doc = docInstance || new jsPDF();
  const startY = drawHeader(doc, settings, 'SERVICE QUOTATION');
  
  // Quotation Details
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Quote Ref: ${quotation.customId}`, 130, startY - 25);
  doc.text(`Date: ${new Date(quotation.createdAt).toLocaleDateString()}`, 130, startY - 19);
  doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}`, 130, startY - 13);

  // Client / Prospect
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Quotation For:', 14, startY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const clientName = company?.name || quotation.prospectName || 'Prospective Client';
  doc.text(clientName, 14, startY + 7);
  if (company?.gstNumber) doc.text(`GSTIN: ${company.gstNumber}`, 14, startY + 13);
  if (quotation.prospectEmail) doc.text(`Email: ${quotation.prospectEmail}`, 14, startY + 19);

  // Table
  const tableData = quotation.items.map(item => {
    const product = products.find(p => p.id === item.productId);
    return [
      product ? product.name : 'Service/Item',
      item.quantity.toString(),
      `Rs ${item.unitPrice.toFixed(2)}`,
      `Rs ${item.total.toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: startY + 30,
    head: [['Description', 'Qty', 'Unit Price', 'Total (Rs)']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [243, 156, 18], textColor: 255 }, // Amber color for quotes
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 100 }, 1: { halign: 'center' }, 2: { halign: 'right' }, 3: { halign: 'right' } }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;
  let totalY = finalY + 15;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Net Amount:', 140, totalY);
  doc.text(`Rs ${quotation.totalAmount.toFixed(2)}`, 190, totalY, { align: 'right' });
  
  totalY += 7;
  doc.text('GST (18%):', 140, totalY);
  doc.text(`Rs ${quotation.gstAmount.toFixed(2)}`, 190, totalY, { align: 'right' });

  totalY += 12;
  doc.setFontSize(12);
  doc.setTextColor(243, 156, 18);
  doc.text('Total Quotation Value:', 120, totalY);
  doc.text(`Rs ${quotation.netAmount.toFixed(2)}`, 190, totalY, { align: 'right' });

  if (quotation.notes) {
    totalY += 20;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Notes:', 14, totalY);
    doc.setFont('helvetica', 'normal');
    doc.text(quotation.notes, 14, totalY + 5);
  }

  drawFooter(doc, settings);
  if (!docInstance) doc.save(`${quotation.customId}.pdf`);
  return doc;
};
