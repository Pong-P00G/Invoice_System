import mongoose, { Schema, Document } from 'mongoose';
const TenantSchema = new Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
TenantSchema.index({ slug: 1 }, { unique: true });
TenantSchema.index({ name: 1 }, { unique: true });
export default mongoose.model('Tenant', TenantSchema);
