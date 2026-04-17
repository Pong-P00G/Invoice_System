import { Hono } from 'hono';
import Customer from '../models/customer.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { logAudit } from '../services/audit.js';
const customers = new Hono();
customers.use('*', authMiddleware);
customers.get('/', async (c) => {
    const user = c.get('user');
    const data = await Customer.find({ tenantId: user.tenantId, isActive: true }).sort({ createdAt: -1 });
    return c.json({ customers: data });
});
customers.post('/', requireRole('owner', 'admin'), async (c) => {
    const user = c.get('user');
    const { name, email, phone, address, taxId } = await c.req.json();
    if (!name || !email)
        return c.json({ error: 'name and email are required' }, 400);
    const existing = await Customer.findOne({ tenantId: user.tenantId, email: String(email).toLowerCase() });
    if (existing)
        return c.json({ error: 'Customer email already exists' }, 409);
    const customer = await Customer.create({
        tenantId: user.tenantId,
        name,
        email,
        phone,
        address,
        taxId,
    });
    await logAudit({
        tenantId: user.tenantId,
        userId: user._id,
        action: 'create_customer',
        entityType: 'customer',
        entityId: customer._id,
    });
    return c.json({ customer }, 201);
});
customers.patch('/:id', requireRole('owner', 'admin'), async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const updates = await c.req.json();
    const customer = await Customer.findOneAndUpdate({ _id: id, tenantId: user.tenantId }, updates, { new: true });
    if (!customer)
        return c.json({ error: 'Customer not found' }, 404);
    await logAudit({
        tenantId: user.tenantId,
        userId: user._id,
        action: 'update_customer',
        entityType: 'customer',
        entityId: customer._id,
    });
    return c.json({ customer });
});
customers.delete('/:id', requireRole('owner', 'admin'), async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const customer = await Customer.findOneAndUpdate({ _id: id, tenantId: user.tenantId }, { isActive: false }, { new: true });
    if (!customer)
        return c.json({ error: 'Customer not found' }, 404);
    await logAudit({
        tenantId: user.tenantId,
        userId: user._id,
        action: 'archive_customer',
        entityType: 'customer',
        entityId: customer._id,
    });
    return c.json({ success: true });
});
export default customers;
