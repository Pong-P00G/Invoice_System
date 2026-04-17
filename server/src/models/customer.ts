import mongoose, { Schema, Document } from 'mongoose'

export interface ICustomer extends Document {
  tenantId: mongoose.Types.ObjectId
  name: string
  email: string
  phone?: string
  address?: string
  taxId?: string
  isActive: boolean
}

const CustomerSchema = new Schema<ICustomer>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    taxId: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

CustomerSchema.index({ tenantId: 1, email: 1 }, { unique: true })
CustomerSchema.index({ tenantId: 1, name: 1 })

export default mongoose.model<ICustomer>('Customer', CustomerSchema)
