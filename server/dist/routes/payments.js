import { Hono } from 'hono';
import Payment from '../models/payment.js';
import Invoice, { InvoiceStatus } from '../models/invoice.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { logAudit } from '../services/audit.js';
const payments = new Hono();
payments.use('*', authMiddleware);
payments.get('/', async (c) => {
    const user = c.get('user');
    const invoiceId = c.req.query('invoiceId');
    const filter = { tenantId: user.tenantId };
    if (invoiceId)
        filter.invoiceId = invoiceId;
    const data = await Payment.find(filter).sort({ paidAt: -1 }).populate('invoiceId', 'invoiceNumber total balanceDue');
    return c.json({ payments: data });
});
payments.post('/', requireRole('owner', 'admin'), async (c) => {
    const user = c.get('user');
    const { invoiceId, amount, method, paidAt, reference, notes } = await c.req.json();
    if (!invoiceId || !amount || !method) {
        return c.json({ error: 'invoiceId, amount and method are required' }, 400);
    }
    const invoice = await Invoice.findOne({ _id: invoiceId, tenantId: user.tenantId });
    if (!invoice)
        return c.json({ error: 'Invoice not found' }, 404);
    const numericAmount = Number(amount);
    if (numericAmount <= 0)
        return c.json({ error: 'Amount must be greater than 0' }, 400);
    if (numericAmount > invoice.balanceDue)
        return c.json({ error: 'Amount exceeds invoice balance' }, 400);
    const payment = await Payment.create({
        tenantId: user.tenantId,
        invoiceId: invoice._id,
        customerId: invoice.clientId,
        userId: user._id,
        amount: numericAmount,
        currency: invoice.currency,
        method,
        paidAt: paidAt ? new Date(paidAt) : new Date(),
        reference,
        notes,
    });
    invoice.balanceDue = Number((invoice.balanceDue - numericAmount).toFixed(2));
    invoice.status = invoice.balanceDue <= 0 ? InvoiceStatus.PAID : InvoiceStatus.SENT;
    await invoice.save();
    await logAudit({
        tenantId: user.tenantId,
        userId: user._id,
        action: 'payment_received',
        entityType: 'invoice',
        entityId: invoice._id,
        meta: { paymentId: payment._id, amount: numericAmount },
    });
    return c.json({ payment, invoice });
});
payments.get('/invoice/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const data = await Payment.find({ tenantId: user.tenantId, invoiceId: id }).sort({ paidAt: -1 });
    return c.json({ payments: data });
});
export default payments;
