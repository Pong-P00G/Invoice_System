import mongoose, { Schema, Document } from 'mongoose'

export interface ITenant extends Document {
  name: string
  slug: string
  isActive: boolean
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

TenantSchema.index({ slug: 1 }, { unique: true })
TenantSchema.index({ name: 1 }, { unique: true })

export default mongoose.model<ITenant>('Tenant', TenantSchema)
