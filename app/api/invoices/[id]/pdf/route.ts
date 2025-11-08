import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { InvoicePDF } from "@/components/invoices/invoice-pdf";

export async function GET(
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
      // Add more company info as needed
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      InvoicePDF({ invoice: pdfData, companyInfo })
    );

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
