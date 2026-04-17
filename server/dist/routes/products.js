import { Hono } from 'hono';
import Product from '../models/product.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { logAudit } from '../services/audit.js';
const products = new Hono();
products.use('*', authMiddleware);
products.get('/', async (c) => {
    const user = c.get('user');
    const data = await Product.find({ tenantId: user.tenantId, isActive: true }).sort({ createdAt: -1 });
    return c.json({ products: data });
});
products.post('/', requireRole('owner', 'admin'), async (c) => {
    const user = c.get('user');
    const { sku, name, description, unitPrice, taxRate } = await c.req.json();
    if (!sku || !name || unitPrice === undefined) {
        return c.json({ error: 'sku, name and unitPrice are required' }, 400);
    }
    const product = await Product.create({
        tenantId: user.tenantId,
        sku,
        name,
        description,
        unitPrice: Number(unitPrice),
        taxRate: Number(taxRate ?? 0),
    });
    await logAudit({
        tenantId: user.tenantId,
        userId: user._id,
        action: 'create_product',
        entityType: 'product',
        entityId: product._id,
    });
    return c.json({ product }, 201);
});
products.patch('/:id', requireRole('owner', 'admin'), async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const updates = await c.req.json();
    const product = await Product.findOneAndUpdate({ _id: id, tenantId: user.tenantId }, updates, { new: true });
    if (!product)
        return c.json({ error: 'Product not found' }, 404);
    await logAudit({
        tenantId: user.tenantId,
        userId: user._id,
        action: 'update_product',
        entityType: 'product',
        entityId: product._id,
    });
    return c.json({ product });
});
products.delete('/:id', requireRole('owner', 'admin'), async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');
    const product = await Product.findOneAndUpdate({ _id: id, tenantId: user.tenantId }, { isActive: false }, { new: true });
    if (!product)
        return c.json({ error: 'Product not found' }, 404);
    await logAudit({
        tenantId: user.tenantId,
        userId: user._id,
        action: 'archive_product',
        entityType: 'product',
        entityId: product._id,
    });
    return c.json({ success: true });
});
export default products;
