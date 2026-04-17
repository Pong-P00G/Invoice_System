import mongoose, { Schema, Document } from 'mongoose'

export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'other'

export interface IPayment extends Document {
  tenantId: mongoose.Types.ObjectId
  invoiceId: mongoose.Types.ObjectId
  customerId: mongoose.Types.ObjectId
  userId?: mongoose.Types.ObjectId
  amount: number
  currency: string
  method: PaymentMethod
  paidAt: Date
  reference?: string
  notes?: string
}

const PaymentSchema = new Schema<IPayment>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, required: true, default: 'USD' },
    method: {
      type: String,
      enum: ['cash', 'bank_transfer', 'card', 'other'],
      required: true,
    },
    paidAt: { type: Date, required: true, default: Date.now },
    reference: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
)

PaymentSchema.index({ tenantId: 1, invoiceId: 1, paidAt: -1 })
PaymentSchema.index({ tenantId: 1, customerId: 1, paidAt: -1 })

export default mongoose.model<IPayment>('Payment', PaymentSchema)
