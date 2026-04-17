import mongoose, { Schema } from 'mongoose';
const AuditLogSchema = new Schema({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true }, // 'login' | 'create_invoice' | 'delete_client' ...
    entityType: { type: String }, // 'invoice' | 'customer' | ...
    entityId: { type: Schema.Types.ObjectId },
    meta: { type: Schema.Types.Mixed }, // extra context (IP, old values...)
}, { timestamps: true });
AuditLogSchema.index({ tenantId: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, entityType: 1, entityId: 1, createdAt: -1 });
export default mongoose.model('AuditLog', AuditLogSchema);
