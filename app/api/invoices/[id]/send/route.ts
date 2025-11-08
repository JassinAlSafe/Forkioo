import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { InvoicePDF } from "@/components/invoices/invoice-pdf";
import { sendInvoiceEmail } from "@/lib/email/sendgrid";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const invoiceId = params.id;

    // Get user's company
    const companyUser = await db.companyUser.findFirst({
      where: { userId },
      include: { company: true },
    });

    if (!companyUser) {
      return NextResponse.json(
        { error: "No company found" },
        { status: 404 }
      );
    }

    // Fetch invoice with all details
    const invoice = await db.invoice.findFirst({
      where: {
        id: invoiceId,
        companyId: companyUser.companyId,
      },
      include: {
        contact: true,
        lines: {
          orderBy: { lineNumber: "asc" },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Check if customer has email
    if (!invoice.contact.email) {
      return NextResponse.json(
        { error: "Customer does not have an email address" },
        { status: 400 }
      );
    }

    // Transform data for PDF
    const pdfData = {
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.contact.name,
      customerEmail: invoice.contact.email || undefined,
      invoiceDate: invoice.invoiceDate.toISOString().split("T")[0],
      dueDate: invoice.dueDate.toISOString().split("T")[0],
      status: invoice.status,
      subtotal: Number(invoice.subtotal),
      taxTotal: Number(invoice.taxTotal),
      total: Number(invoice.total),
      amountPaid: Number(invoice.amountPaid),
      amountDue: Number(invoice.amountDue),
      currency: invoice.currency,
      notes: invoice.notes || undefined,
      terms: invoice.terms || undefined,
      lines: invoice.lines.map((line) => ({
        description: line.description,
        quantity: Number(line.quantity),
        unitPrice: Number(line.unitPrice),
        taxRate: Number(line.taxRate),
        amount: Number(line.amount),
      })),
    };

    const companyInfo = {
      name: companyUser.company.name,
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      InvoicePDF({ invoice: pdfData, companyInfo })
    );

    // Format total for email
    const formattedTotal = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: invoice.currency,
    }).format(Number(invoice.total));

    // Format due date for email
    const formattedDueDate = new Date(invoice.dueDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Send email with PDF attachment
    await sendInvoiceEmail({
      to: invoice.contact.email,
      customerName: invoice.contact.name,
      invoiceNumber: invoice.invoiceNumber,
      total: formattedTotal,
      dueDate: formattedDueDate,
      pdfBuffer,
      // viewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${invoice.id}`, // Optional: Add when invoice view page is ready
    });

    // Update invoice status to 'sent'
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "sent",
        sentAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Invoice sent to ${invoice.contact.email}`,
    });
  } catch (error: any) {
    console.error("Error sending invoice:", error);

    // Check if it's a SendGrid error
    if (error.message?.includes("SendGrid")) {
      return NextResponse.json(
        { error: "Email service error. Please check SendGrid configuration." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to send invoice" },
      { status: 500 }
    );
  }
}
