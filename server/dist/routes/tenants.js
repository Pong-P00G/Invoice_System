import { Hono } from 'hono';
import Tenant from '../models/tenant.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
const tenants = new Hono();
tenants.use('*', authMiddleware);
tenants.get('/me', async (c) => {
    const user = c.get('user');
    const tenant = await Tenant.findById(user.tenantId);
    if (!tenant)
        return c.json({ error: 'Tenant not found' }, 404);
    return c.json({ tenant });
});
tenants.patch('/me', requireRole('owner'), async (c) => {
    const user = c.get('user');
    const updates = await c.req.json();
    const tenant = await Tenant.findByIdAndUpdate(user.tenantId, updates, { new: true });
    if (!tenant)
        return c.json({ error: 'Tenant not found' }, 404);
    return c.json({ tenant });
});
export default tenants;
