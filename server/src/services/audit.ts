import mongoose from 'mongoose'
import AuditLog from '../models/auditLog.js'

type AuditInput = {
  tenantId: mongoose.Types.ObjectId
  userId?: mongoose.Types.ObjectId
  action: string
  entityType?: string
  entityId?: mongoose.Types.ObjectId
  meta?: Record<string, unknown>
}

export const logAudit = async ({
  tenantId,
  userId,
  action,
  entityType,
  entityId,
  meta,
}: AuditInput) => {
  await AuditLog.create({
    tenantId,
    userId,
    action,
    entityType,
    entityId,
    meta,
  })
}
