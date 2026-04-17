import { createMiddleware } from 'hono/factory'
import { getCookie } from 'hono/cookie'
import jwt from 'jsonwebtoken'
import User, { type IUser } from '../models/users.js'

type Env = {
  Variables: {
    user: IUser
  }
}

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const token = getCookie(c, 'session')

  if (!token) {
    return c.json({ error: 'Not authenticated' }, 401)
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string
      tenantId: string
      role: string
    }

    const user = await User.findById(payload.userId).select('-passwordHash')

    if (!user || !user.isActive) {
      return c.json({ error: 'User not found or inactive' }, 401)
    }

    c.set('user', user)
    await next()
  } catch {
    return c.json({ error: 'Invalid or expired session' }, 401)
  }
})

// Role guard — use after authMiddleware
export const requireRole = (...roles: string[]) =>
  createMiddleware<Env>(async (c, next) => {
    const user = c.get('user')
    if (!roles.includes(user.role)) {
      return c.json({ error: 'Forbidden' }, 403)
    }
    await next()
  })