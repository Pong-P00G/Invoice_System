import mongoose, { Schema, Document } from 'mongoose';
const ProductSchema = new Schema({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    sku: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    unitPrice: { type: Number, required: true, min: 0 },
    taxRate: { type: Number, required: true, min: 0, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
ProductSchema.index({ tenantId: 1, sku: 1 }, { unique: true });
ProductSchema.index({ tenantId: 1, name: 1 });
export default mongoose.model('Product', ProductSchema);
