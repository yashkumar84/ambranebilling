import PDFDocument from 'pdfkit';
import { Order, OrderItem, Product, Tenant, Customer, Table, PaymentMethod } from '@prisma/client';

interface DetailedOrder extends Order {
    items: (OrderItem & { product: Product })[];
    tenant: Tenant;
    customer: Customer | null;
    table: Table | null;
    paymentMethod: PaymentMethod | null;
}

export class InvoiceService {
    async generateInvoice(order: DetailedOrder): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 30, size: 'A4' });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));

            this.generateHeader(doc, order.tenant);
            this.generateCustomerInfo(doc, order);
            this.generateInvoiceTable(doc, order);
            this.generateFooter(doc);

            doc.end();
        });
    }

    async generateReceipt(order: DetailedOrder): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            // Standard 80mm thermal paper is ~226 pts wide
            const width = 226;
            // Height is dynamic, but let's start with a large enough value or auto-scale logic
            // For simplicity in PDFKit, we'll use a long page
            const doc = new PDFDocument({
                margin: 15,
                size: [width, 800]
            });
            const chunks: Buffer[] = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));

            // Small centered header
            doc.fontSize(12).font('Helvetica-Bold').text(order.tenant.businessName, { align: 'center' });
            doc.fontSize(8).font('Helvetica').text(order.tenant.address || '', { align: 'center' });
            doc.text(`${order.tenant.phone || ''} `, { align: 'center' });
            if (order.tenant.gstNumber) doc.text(`GST: ${order.tenant.gstNumber} `, { align: 'center' });

            doc.moveDown(0.5);
            this.generateReceiptHr(doc, width - 30);
            doc.moveDown(0.5);

            doc.fontSize(8).text(`Bill: ${order.orderNumber} `);
            doc.text(`Date: ${new Date(order.createdAt).toLocaleString()} `);
            if (order.table) {
                doc.font('Helvetica-Bold').text(`Table: ${order.table.number} `);
            }

            doc.moveDown(0.5);
            this.generateReceiptHr(doc, width - 30);
            doc.moveDown(0.5);

            if (order.paymentMethod) {
                doc.fontSize(8).text(`Payment: ${order.paymentMethod} `);
                doc.moveDown(0.5);
            }

            // Table Header
            doc.font('Helvetica-Bold');
            this.generateReceiptRow(doc, 'Item', 'Qty', 'Total');
            this.generateReceiptHr(doc, width - 30);
            doc.font('Helvetica');

            order.items.forEach(item => {
                this.generateReceiptRow(
                    doc,
                    item.productName || item.product.name,
                    item.quantity.toString(),
                    Number(item.subtotal).toFixed(2)
                );
            });

            doc.moveDown(0.5);
            this.generateReceiptHr(doc, width - 30);
            doc.moveDown(0.5);

            const cgst = Number(order.taxAmount) / 2;
            const sgst = Number(order.taxAmount) / 2;

            this.generateReceiptRow(doc, 'Subtotal', '', Number(order.subtotal).toFixed(2));
            this.generateReceiptRow(doc, 'CGST (2.5%)', '', cgst.toFixed(2));
            this.generateReceiptRow(doc, 'SGST (2.5%)', '', sgst.toFixed(2));
            if (Number(order.discountAmount) > 0) {
                this.generateReceiptRow(doc, 'Discount', '', `- ${Number(order.discountAmount).toFixed(2)} `);
            }

            doc.moveDown(0.5);
            this.generateReceiptHr(doc, width - 30);
            doc.moveDown(0.5);

            doc.font('Helvetica-Bold');
            this.generateReceiptRow(doc, '', 'TOTAL', Number(order.totalAmount).toFixed(2));
            doc.font('Helvetica');

            doc.moveDown(1);
            const startX = doc.page.margins.left;
            const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

            doc.fontSize(8).text('--- Savor the Flavor! ---', startX, doc.y, { align: 'center', width: pageWidth });
            doc.fontSize(7).text('Serving hospitality since 2024', startX, doc.y, { align: 'center', width: pageWidth });

            doc.moveDown(1);
            doc.fontSize(8).font('Helvetica-Bold').text('Thank You! Visit Again', startX, doc.y, { align: 'center', width: pageWidth });
            doc.moveDown(0.2);
            doc.fontSize(6).font('Helvetica').text('Powered by Ambrane Labs', startX, doc.y, { align: 'center', width: pageWidth });

            doc.end();
        });
    }

    private generateHeader(doc: PDFKit.PDFDocument, tenant: Tenant) {
        doc
            .fillColor('#444444')
            .fontSize(20)
            .text(tenant.businessName, 50, 57)
            .fontSize(10)
            .text(tenant.address || '', 50, 80)
            .text(`${tenant.phone || ''} | ${tenant.email || ''} `, 50, 95)
            .text(`GST: ${tenant.gstNumber || 'N/A'} `, 50, 110)
            .moveDown();

        this.generateHr(doc, 130);
    }

    private generateCustomerInfo(doc: PDFKit.PDFDocument, order: DetailedOrder) {
        const customerTop = 150;

        doc
            .fillColor('#444444')
            .fontSize(20)
            .text('Invoice', 50, customerTop);

        this.generateHr(doc, customerTop + 30);

        doc
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('Invoice Number:', 50, customerTop + 45)
            .font('Helvetica')
            .text(order.orderNumber, 150, customerTop + 45)
            .font('Helvetica-Bold')
            .text('Invoice Date:', 50, customerTop + 60)
            .font('Helvetica')
            .text(new Date(order.createdAt).toLocaleDateString(), 150, customerTop + 60)
            .font('Helvetica-Bold')
            .text('Status:', 50, customerTop + 75)
            .font('Helvetica')
            .text(order.paymentStatus, 150, customerTop + 75);

        if (order.customer) {
            doc
                .font('Helvetica-Bold')
                .text('Bill To:', 300, customerTop + 45)
                .font('Helvetica')
                .text(order.customer.name, 350, customerTop + 45)
                .text(order.customer.phone, 350, customerTop + 60)
                .text(order.customer.address || '', 350, customerTop + 75);
        } else if (order.table) {
            doc
                .font('Helvetica-Bold')
                .text('Dine-In:', 300, customerTop + 45)
                .font('Helvetica')
                .text(`Table ${order.table.number} `, 350, customerTop + 45);
        }

        this.generateHr(doc, customerTop + 100);
    }

    private generateInvoiceTable(doc: PDFKit.PDFDocument, order: DetailedOrder) {
        let i;
        const invoiceTableTop = 280;

        doc.font('Helvetica-Bold');
        this.generateTableRow(
            doc,
            invoiceTableTop,
            'Item',
            'Unit Cost',
            'Quantity',
            'Line Total'
        );
        this.generateHr(doc, invoiceTableTop + 20);
        doc.font('Helvetica');

        for (i = 0; i < order.items.length; i++) {
            const item = order.items[i];
            const position = invoiceTableTop + (i + 1) * 30;
            this.generateTableRow(
                doc,
                position,
                item.productName || item.product.name,
                `Rs.${Number(item.unitPrice).toFixed(2)} `,
                item.quantity.toString(),
                `Rs.${Number(item.subtotal).toFixed(2)} `
            );

            this.generateHr(doc, position + 20);
        }

        const subtotalPosition = invoiceTableTop + (i + 1) * 30 + 20;
        this.generateTableRow(
            doc,
            subtotalPosition,
            '',
            '',
            'Subtotal',
            `Rs.${Number(order.subtotal).toFixed(2)} `
        );

        const cgstAmount = Number(order.taxAmount) / 2;
        const sgstAmount = Number(order.taxAmount) / 2;

        const cgstPosition = subtotalPosition + 20;
        this.generateTableRow(
            doc,
            cgstPosition,
            '',
            '',
            'CGST (2.5%)',
            `Rs.${cgstAmount.toFixed(2)} `
        );

        const sgstPosition = cgstPosition + 20;
        this.generateTableRow(
            doc,
            sgstPosition,
            '',
            '',
            'SGST (2.5%)',
            `Rs.${sgstAmount.toFixed(2)} `
        );

        const discountPosition = sgstPosition + 20;
        this.generateTableRow(
            doc,
            discountPosition,
            '',
            '',
            'Discount',
            `- Rs.${Number(order.discountAmount).toFixed(2)} `
        );

        const totalPosition = discountPosition + 25;
        doc.font('Helvetica-Bold');
        this.generateTableRow(
            doc,
            totalPosition,
            '',
            '',
            'Total',
            `Rs.${Number(order.totalAmount).toFixed(2)} `
        );

        // Payment Method
        if (order.paymentMethod) {
            doc.font('Helvetica')
                .fontSize(10)
                .text(`Payment Mode: ${order.paymentMethod} `, 50, totalPosition + 30);
        }
        doc.font('Helvetica');
    }

    private generateFooter(doc: PDFKit.PDFDocument) {
        doc
            .fontSize(10)
            .text(
                'Thank you for your business. Please visit again!',
                50,
                750,
                { align: 'center', width: 500 }
            )
            .fontSize(8)
            .text(
                'Powered by Ambrane Labs',
                50,
                765, // Moved up slightly for better centering in the middle of bottom margin
                { align: 'center', width: 500 }
            );
    }

    private generateTableRow(
        doc: PDFKit.PDFDocument,
        y: number,
        item: string,
        unitPrice: string,
        quantity: string,
        lineTotal: string,
    ) {
        doc
            .fontSize(10)
            .text(item, 50, y)
            .text(unitPrice, 280, y, { width: 90, align: 'right' })
            .text(quantity, 370, y, { width: 90, align: 'right' })
            .text(lineTotal, 470, y, { width: 90, align: 'right' });
    }

    private generateReceiptRow(
        doc: PDFKit.PDFDocument,
        item: string,
        qty: string,
        total: string
    ) {
        const startX = doc.page.margins.left;
        const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

        doc.fontSize(8);
        const y = doc.y;
        doc.text(item, startX, y, { width: width * 0.5 });
        doc.text(qty, startX + width * 0.5, y, { width: width * 0.2, align: 'right' });
        doc.text(total, startX + width * 0.7, y, { width: width * 0.3, align: 'right' });
        doc.moveDown(0.5);
    }

    private generateReceiptHr(doc: PDFKit.PDFDocument, width: number) {
        doc.moveTo(doc.x, doc.y)
            .lineTo(doc.x + width, doc.y)
            .strokeColor('#eeeeee')
            .stroke();
        doc.moveDown(0.5);
    }

    private generateHr(doc: PDFKit.PDFDocument, y: number) {
        doc
            .strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(50, y)
            .lineTo(550, y)
            .stroke();
    }
}
