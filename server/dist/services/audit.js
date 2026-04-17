import mongoose from 'mongoose';
import AuditLog from '../models/auditLog.js';
export const logAudit = async ({ tenantId, userId, action, entityType, entityId, meta, }) => {
    await AuditLog.create({
        tenantId,
        userId,
        action,
        entityType,
        entityId,
        meta,
    });
};
