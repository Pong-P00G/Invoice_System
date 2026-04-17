import mongoose, { Schema, Document } from 'mongoose';
export var InvoiceStatus;
(function (InvoiceStatus) {
    InvoiceStatus["DRAFT"] = "draft";
    InvoiceStatus["SENT"] = "sent";
    InvoiceStatus["PAID"] = "paid";
    InvoiceStatus["CANCELLED"] = "cancelled";
})(InvoiceStatus || (InvoiceStatus = {}));
const InvoiceSchema = new Schema({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    invoiceNumber: { type: String, required: true },
    invoiceDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: InvoiceStatus, default: InvoiceStatus.DRAFT },
    notes: { type: String, required: true },
    terms: { type: String, required: true },
    lineItems: { type: [{
                productId: { type: Schema.Types.ObjectId, ref: 'Product' },
                description: { type: String, required: true },
                quantity: { type: Number, required: true },
                unitPrice: { type: Number, required: true },
                lineSubtotal: { type: Number, required: true },
                lineTax: { type: Number, required: true },
                lineTotal: { type: Number, required: true },
            }], required: true, default: [] },
    subtotal: { type: Number, required: true },
    taxRate: { type: Number, required: true },
    taxAmount: { type: Number, required: true },
    total: { type: Number, required: true },
    balanceDue: { type: Number, required: true },
    currency: { type: String, required: true, default: 'USD' },
}, { timestamps: true });
InvoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ tenantId: 1, clientId: 1 });
InvoiceSchema.index({ tenantId: 1, userId: 1 });
InvoiceSchema.index({ tenantId: 1, invoiceDate: 1 });
InvoiceSchema.index({ tenantId: 1, dueDate: 1 });
InvoiceSchema.index({ tenantId: 1, status: 1 });
InvoiceSchema.index({ tenantId: 1, subtotal: 1 });
InvoiceSchema.index({ tenantId: 1, taxRate: 1 });
InvoiceSchema.index({ tenantId: 1, taxAmount: 1 });
InvoiceSchema.index({ tenantId: 1, total: 1 });
export default mongoose.model('Invoice', InvoiceSchema);
