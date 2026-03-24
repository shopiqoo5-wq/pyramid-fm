/**
 * Email Notification System for Pyramid FM
 * Uses Resend API (https://resend.com) when VITE_RESEND_API_KEY is set.
 * Falls back to console.log in development.
 */

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const FROM_EMAIL = 'noreply@pyramidfm.com';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    return true;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: options.to, subject: options.subject, html: options.html })
    });
    return res.ok;
  } catch (err) {
    console.error('[EMAIL] Failed to send email:', err);
    return false;
  }
}

const baseTemplate = (content: string) => `
<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
  <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 24px 32px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">Pyramid FM Corporate</h1>
  </div>
  <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0;">
    ${content}
    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
    <p style="color: #94a3b8; font-size: 12px; margin: 0;">
      This is an automated message from Pyramid FM. Do not reply to this email.
    </p>
  </div>
</div>
`;

export const EmailTemplates = {
  orderConfirmation: (to: string, orderId: string, totalAmount: string) =>
    sendEmail({
      to,
      subject: `Order Confirmed — ${orderId}`,
      html: baseTemplate(`
        <h2 style="color: #1e293b; margin: 0 0 16px 0;">Your Order Has Been Placed ✅</h2>
        <p style="color: #475569;">Hi there,</p>
        <p style="color: #475569;">Your supply order <strong>${orderId}</strong> has been received and is pending admin approval.</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; color: #334155;"><strong>Order ID:</strong> ${orderId}</p>
          <p style="margin: 8px 0 0 0; color: #334155;"><strong>Amount:</strong> ${totalAmount}</p>
        </div>
        <a href="https://portal.pyramidfm.com/orders" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">Track Order</a>
      `)
    }),

  orderStatusUpdate: (to: string, orderId: string, status: string, statusColor: string) =>
    sendEmail({
      to,
      subject: `Order ${orderId} — Status Updated to ${status}`,
      html: baseTemplate(`
        <h2 style="color: #1e293b; margin: 0 0 16px 0;">Order Status Update</h2>
        <p style="color: #475569;">Your order <strong>${orderId}</strong> status has been updated.</p>
        <div style="border-left: 4px solid ${statusColor}; padding: 12px 16px; background: #f8fafc; border-radius: 0 8px 8px 0; margin: 16px 0;">
          <h3 style="margin: 0; color: ${statusColor}; text-transform: capitalize;">${status}</h3>
        </div>
        <a href="https://portal.pyramidfm.com/orders" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">View Order</a>
      `)
    }),

  lowStockAlert: (to: string, productName: string, currentStock: number, threshold: number) =>
    sendEmail({
      to,
      subject: `⚠️ Low Stock Alert: ${productName}`,
      html: baseTemplate(`
        <h2 style="color: #dc2626; margin: 0 0 16px 0;">Low Stock Warning</h2>
        <p style="color: #475569;">The following product has fallen below its minimum stock threshold:</p>
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; font-weight: 700; color: #991b1b;">${productName}</p>
          <p style="margin: 4px 0 0; color: #b91c1c;">Current Stock: <strong>${currentStock}</strong> (Threshold: ${threshold})</p>
        </div>
        <a href="https://portal.pyramidfm.com/admin/inventory" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">Manage Inventory</a>
      `)
    }),

  newClientWelcome: (to: string, clientName: string, contactPerson: string, tempPassword: string) =>
    sendEmail({
      to,
      subject: `Welcome to Pyramid FM Portal — ${clientName}`,
      html: baseTemplate(`
        <h2 style="color: #1e293b; margin: 0 0 16px 0;">Welcome to Pyramid FM! 👋</h2>
        <p style="color: #475569;">Hi ${contactPerson},</p>
        <p style="color: #475569;">Your corporate supply portal for <strong>${clientName}</strong> is now active. You can log in with the credentials below.</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; color: #334155;"><strong>Login Email:</strong> ${to}</p>
          <p style="margin: 8px 0 0; color: #334155;"><strong>Temp Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">Please change your password on first login.</p>
        <a href="https://portal.pyramidfm.com" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">Access Portal</a>
      `)
    }),

  invoiceReady: (to: string, orderId: string, invoiceNumber: string, amount: string) =>
    sendEmail({
      to,
      subject: `Invoice ${invoiceNumber} is Ready`,
      html: baseTemplate(`
        <h2 style="color: #1e293b; margin: 0 0 16px 0;">Your Invoice is Ready 🧾</h2>
        <p style="color: #475569;">The invoice for order <strong>${orderId}</strong> has been generated and is available for download.</p>
        <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0; color: #334155;"><strong>Invoice No:</strong> ${invoiceNumber}</p>
          <p style="margin: 8px 0 0; color: #334155;"><strong>Amount Due:</strong> ${amount}</p>
        </div>
        <a href="https://portal.pyramidfm.com/portal/invoices" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 8px;">Download Invoice PDF</a>
      `)
    })
};
