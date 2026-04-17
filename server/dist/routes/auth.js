import { Hono } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import jwt from 'jsonwebtoken';
import User, {} from '../models/users.js';
import Tenant from '../models/tenant.js';
import { authMiddleware } from '../middleware/auth.js';
import { logAudit } from '../services/audit.js';
const auth = new Hono();
const COOKIE_OPTIONS = {
    httpOnly: true, // JS cannot read it — blocks XSS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
};
// Register
auth.post('/register', async (c) => {
    const { name, email, password, tenantId, tenantName } = await c.req.json();
    if (!name || !email || !password || (!tenantId && !tenantName)) {
        return c.json({ error: 'All fields required' }, 400);
    }
    if (password.length < 8) {
        return c.json({ error: 'Password must be at least 8 characters' }, 400);
    }
    let resolvedTenantId = tenantId;
    if (!resolvedTenantId) {
        const slug = String(tenantName)
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const tenant = await Tenant.create({
            name: tenantName,
            slug: `${slug}-${Date.now().toString().slice(-6)}`,
        });
        resolvedTenantId = String(tenant._id);
    }
    const existing = await User.findOne({ email, tenantId: resolvedTenantId });
    if (existing) {
        return c.json({ error: 'Email already in use' }, 409);
    }
    const user = await User.create({
        name,
        email,
        passwordHash: password, // pre-save hook hashes it
        tenantId: resolvedTenantId,
        role: 'owner',
    });
    const token = jwt.sign({ userId: user._id, tenantId: user.tenantId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    setCookie(c, 'session', token, COOKIE_OPTIONS);
    await logAudit({
        tenantId: user.tenantId,
        userId: user._id,
        action: 'register',
        entityType: 'user',
        entityId: user._id,
    });
    return c.json({ user }, 201);
});
// Login
auth.post('/login', async (c) => {
    const { email, password } = await c.req.json();
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
        return c.json({ error: 'Invalid email or password' }, 401);
    }
    if (!user.isActive) {
        return c.json({ error: 'Account is disabled' }, 403);
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
        return c.json({ error: 'Invalid email or password' }, 401);
    }
    // Update last login timestamp
    user.lastLoginAt = new Date();
    await user.save();
    await logAudit({
        tenantId: user.tenantId,
        userId: user._id,
        action: 'login',
        entityType: 'user',
        entityId: user._id,
        meta: { ip: c.req.header('x-forwarded-for') ?? 'unknown' },
    });
    const token = jwt.sign({ userId: user._id, tenantId: user.tenantId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    setCookie(c, 'session', token, COOKIE_OPTIONS);
    return c.json({ user });
});
// Me (get current user)
auth.get('/me', authMiddleware, async (c) => {
    const user = c.get('user');
    return c.json({ user });
});
// Logout
auth.post('/logout', authMiddleware, async (c) => {
    const user = c.get('user');
    deleteCookie(c, 'session', { path: '/' });
    await logAudit({
        tenantId: user.tenantId,
        userId: user._id,
        action: 'logout',
        entityType: 'user',
        entityId: user._id,
    });
    return c.json({ success: true });
});
// Change password
auth.patch('/password', authMiddleware, async (c) => {
    const { currentPassword, newPassword } = await c.req.json();
    const user = c.get('user');
    const fullUser = await User.findById(user._id);
    const valid = await fullUser.comparePassword(currentPassword);
    if (!valid)
        return c.json({ error: 'Current password is wrong' }, 400);
    if (newPassword.length < 8) {
        return c.json({ error: 'New password too short' }, 400);
    }
    fullUser.passwordHash = newPassword;
    await fullUser.save();
    return c.json({ success: true });
});
export default auth;
