import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  tenantId: mongoose.Types.ObjectId
  name: string
  email: string
  passwordHash: string
  role: 'owner' | 'admin' | 'viewer'
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  comparePassword(plain: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    tenantId:    { type: Schema.Types.ObjectId, required: true, ref: 'Tenant' },
    name:        { type: String, required: true, trim: true },
    email:       { type: String, required: true, lowercase: true, trim: true },
    passwordHash:{ type: String, required: true },
    role:        { type: String, enum: ['owner', 'admin', 'viewer'], default: 'viewer' },
    isActive:    { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
)

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
})

// Compare password helper
UserSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.passwordHash)
}

// Never return passwordHash in JSON responses
UserSchema.set('toJSON', {
  transform: (_, ret) => {
    delete (ret as Partial<IUser>).passwordHash
    return ret
  },
})

UserSchema.index({ tenantId: 1, email: 1 }, { unique: true })
UserSchema.index({ tenantId: 1, role: 1 })

export default mongoose.model<IUser>('User', UserSchema)