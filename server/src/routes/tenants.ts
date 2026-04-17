import { Hono } from 'hono'
import Tenant from '../models/tenant.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import type { IUser } from '../models/users.js'
import User from '../models/users.js'

type AppEnv = {
  Variables: {
    user: IUser
  }
}

const tenants = new Hono<AppEnv>()

tenants.use('*', authMiddleware)

tenants.get('/me', async (c) => {
  const user = c.get('user')
  const tenant = await Tenant.findById(user.tenantId)
  if (!tenant) return c.json({ error: 'Tenant not found' }, 404)
  return c.json({ tenant })
})

tenants.patch('/me', requireRole('owner'), async (c) => {
  const user = c.get('user')
  const updates = await c.req.json()

  const nextName = String(updates?.name || '').trim()
  const nextSlug = String(updates?.slug || '').trim().toLowerCase()

  if (!nextName || !nextSlug) {
    return c.json({ error: 'Name and slug are required' }, 400)
  }

  let tenant = await Tenant.findById(user.tenantId)

  if (!tenant) {
    // Recover gracefully if tenant record is missing for an existing owner account.
    tenant = await Tenant.create({
      _id: user.tenantId,
      name: nextName,
      slug: nextSlug,
      isActive: true,
    })
    await User.findByIdAndUpdate(user._id, { tenantId: tenant._id })
    return c.json({ tenant, recovered: true })
  }

  tenant = await Tenant.findByIdAndUpdate(
    user.tenantId,
    { name: nextName, slug: nextSlug },
    { new: true }
  )

  return c.json({ tenant })
})

export default tenants
