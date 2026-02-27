import jsPDF from 'jspdf';

interface Order {
  id: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_notes: string;
  items: any[];
  total: number;
  created_at: string;
}

export const generateShippingLabel = (order: Order) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });

  // Use default font (Helvetica) - Arabic text will be reversed but functional
  doc.setFont('Helvetica', 'normal');

  // Border
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(5, 5, 138, 200);

  // Header
  doc.setFontSize(16);
  doc.text('SHIPPING LABEL', 74, 20, { align: 'center' });

  doc.setLineWidth(0.3);
  doc.line(10, 25, 138, 25);

  // Order info
  doc.setFontSize(10);
  doc.text(`Order #: ${order.id.slice(0, 8)}`, 133, 33, { align: 'right' });
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('en-US')}`, 133, 40, { align: 'right' });

  doc.line(10, 44, 138, 44);

  // Recipient
  doc.setFontSize(12);
  doc.text('TO:', 133, 52, { align: 'right' });
  doc.setFontSize(11);
  doc.text(order.shipping_name || '', 133, 60, { align: 'right' });
  doc.text(order.shipping_phone || '', 133, 67, { align: 'right' });
  doc.text(order.shipping_city || '', 133, 74, { align: 'right' });
  doc.text(order.shipping_address || '', 133, 81, { align: 'right' });

  if (order.shipping_notes) {
    doc.setFontSize(9);
    doc.text(`Notes: ${order.shipping_notes}`, 133, 90, { align: 'right' });
  }

  doc.line(10, 95, 138, 95);

  // Items
  doc.setFontSize(11);
  doc.text('ITEMS:', 133, 103, { align: 'right' });
  let y = 110;
  (order.items as any[]).forEach((item: any) => {
    doc.setFontSize(10);
    doc.text(`${item.name} x ${item.quantity}`, 133, y, { align: 'right' });
    y += 7;
  });

  doc.line(10, y + 2, 138, y + 2);
  y += 10;

  doc.setFontSize(12);
  doc.text(`Total: ${order.total.toLocaleString()} SAR`, 133, y, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.text('COD - Cash on Delivery', 74, 195, { align: 'center' });

  doc.save(`shipping-label-${order.id.slice(0, 8)}.pdf`);
};
