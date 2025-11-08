interface InvoiceEmailData {
  invoiceNumber: string;
  customerName: string;
  total: string;
  dueDate: string;
  viewUrl?: string;
}

export function generateInvoiceEmailHTML(data: InvoiceEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #1f2937;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      color: #4b5563;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .invoice-details {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 24px;
      margin: 30px 0;
    }
    .invoice-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .invoice-row:last-child {
      border-bottom: none;
    }
    .invoice-label {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
    }
    .invoice-value {
      font-size: 14px;
      color: #1f2937;
      font-weight: 600;
    }
    .total {
      background-color: #667eea;
      color: #ffffff;
      padding: 16px 24px;
      border-radius: 8px;
      margin: 20px 0;
      text-align: center;
    }
    .total-label {
      font-size: 14px;
      margin-bottom: 8px;
      opacity: 0.9;
    }
    .total-amount {
      font-size: 32px;
      font-weight: 700;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background-color: #667eea;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #5568d3;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      font-size: 13px;
      color: #6b7280;
      line-height: 1.6;
      margin: 0;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 30px 0;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 30px 20px;
      }
      .invoice-details {
        padding: 20px;
      }
      .total-amount {
        font-size: 28px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>📄 New Invoice</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Hi ${data.customerName},</p>

      <p class="message">
        Thank you for your business! Your invoice is ready and attached to this email as a PDF.
      </p>

      <!-- Invoice Details -->
      <div class="invoice-details">
        <div class="invoice-row">
          <span class="invoice-label">Invoice Number</span>
          <span class="invoice-value">${data.invoiceNumber}</span>
        </div>
        <div class="invoice-row">
          <span class="invoice-label">Due Date</span>
          <span class="invoice-value">${data.dueDate}</span>
        </div>
      </div>

      <!-- Total -->
      <div class="total">
        <div class="total-label">Amount Due</div>
        <div class="total-amount">${data.total}</div>
      </div>

      <p class="message">
        The invoice is attached as a PDF to this email. You can download and save it for your records.
      </p>

      ${data.viewUrl ? `
      <div style="text-align: center;">
        <a href="${data.viewUrl}" class="button">View Invoice Online</a>
      </div>
      ` : ''}

      <div class="divider"></div>

      <p class="message" style="font-size: 14px;">
        <strong>Payment Instructions:</strong><br>
        Please process payment by the due date shown above. If you have any questions about this invoice,
        please don't hesitate to contact us.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">
        This invoice was sent by Forkioo<br>
        © ${new Date().getFullYear()} Forkioo. All rights reserved.
      </p>
      <p class="footer-text" style="margin-top: 15px;">
        Please do not reply to this email. For support, contact hello@forkioo.app
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function generateInvoiceEmailText(data: InvoiceEmailData): string {
  return `
Hi ${data.customerName},

Thank you for your business! Your invoice is ready and attached to this email as a PDF.

Invoice Details:
- Invoice Number: ${data.invoiceNumber}
- Due Date: ${data.dueDate}
- Amount Due: ${data.total}

The invoice is attached as a PDF to this email. You can download and save it for your records.

${data.viewUrl ? `View invoice online: ${data.viewUrl}\n` : ''}
Payment Instructions:
Please process payment by the due date shown above. If you have any questions about this invoice, please don't hesitate to contact us.

---
This invoice was sent by Forkioo
© ${new Date().getFullYear()} Forkioo. All rights reserved.

Please do not reply to this email. For support, contact hello@forkioo.app
  `.trim();
}
