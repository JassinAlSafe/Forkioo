import sgMail from "@sendgrid/mail";
import { generateInvoiceEmailHTML, generateInvoiceEmailText } from "./templates";

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "invoices@forkioo.app";
const FROM_NAME = process.env.SENDGRID_FROM_NAME || "Forkioo";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface SendInvoiceEmailParams {
  to: string;
  customerName: string;
  invoiceNumber: string;
  total: string;
  dueDate: string;
  pdfBuffer: Buffer;
  viewUrl?: string;
}

export async function sendInvoiceEmail(params: SendInvoiceEmailParams): Promise<void> {
  if (!SENDGRID_API_KEY) {
    throw new Error("SendGrid API key is not configured. Please set SENDGRID_API_KEY environment variable.");
  }

  const {
    to,
    customerName,
    invoiceNumber,
    total,
    dueDate,
    pdfBuffer,
    viewUrl,
  } = params;

  // Generate email content
  const emailData = {
    customerName,
    invoiceNumber,
    total,
    dueDate,
    viewUrl,
  };

  const htmlContent = generateInvoiceEmailHTML(emailData);
  const textContent = generateInvoiceEmailText(emailData);

  // Prepare PDF attachment
  const attachment = {
    content: pdfBuffer.toString("base64"),
    filename: `${invoiceNumber}.pdf`,
    type: "application/pdf",
    disposition: "attachment",
  };

  // Send email
  const msg = {
    to,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: `Invoice ${invoiceNumber} from ${FROM_NAME}`,
    text: textContent,
    html: htmlContent,
    attachments: [attachment],
    // Track opens and clicks
    trackingSettings: {
      clickTracking: {
        enable: true,
      },
      openTracking: {
        enable: true,
      },
    },
    // Custom headers for tracking
    customArgs: {
      invoice_number: invoiceNumber,
    },
  };

  try {
    await sgMail.send(msg);
    console.log(`Invoice email sent successfully to ${to} for ${invoiceNumber}`);
  } catch (error: any) {
    console.error("SendGrid error:", error);

    if (error.response) {
      console.error("SendGrid response body:", error.response.body);
    }

    throw new Error(`Failed to send email: ${error.message || "Unknown error"}`);
  }
}

// Test email sending (for development)
export async function sendTestEmail(to: string): Promise<void> {
  if (!SENDGRID_API_KEY) {
    throw new Error("SendGrid API key is not configured");
  }

  const msg = {
    to,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: "Test Email from Forkioo",
    text: "This is a test email to verify SendGrid integration.",
    html: "<p>This is a test email to verify SendGrid integration.</p>",
  };

  await sgMail.send(msg);
  console.log(`Test email sent to ${to}`);
}
