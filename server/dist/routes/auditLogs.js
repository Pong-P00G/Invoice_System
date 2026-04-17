import { Hono } from 'hono';
import AuditLog from '../models/auditLog.js';
import { authMiddleware } from '../middleware/auth.js';
const auditLogs = new Hono();
auditLogs.use('*', authMiddleware);
auditLogs.get('/', async (c) => {
    const user = c.get('user');
    const entityType = c.req.query('entityType');
    const entityId = c.req.query('entityId');
    const limit = Math.min(Number(c.req.query('limit') ?? 50), 200);
    const filter = { tenantId: user.tenantId };
    if (entityType)
        filter.entityType = entityType;
    if (entityId)
        filter.entityId = entityId;
    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(limit);
    return c.json({ logs });
});
export default auditLogs;
