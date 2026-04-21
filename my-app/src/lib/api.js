const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030'

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`)
  }
  return data
}

export function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function register(name, email, password, tenantId, tenantName) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, tenantId, tenantName }),
  })
}

export function logout() {
  return request('/auth/logout', {
    method: 'POST',
  })
}

export async function getMe() {
  try {
    return await request('/auth/me')
  } catch {
    return null
  }
}

export function getTenantMe() {
  return request('/tenants/me')
}

export function updateTenantMe(payload) {
  return request('/tenants/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function changePassword(currentPassword, newPassword) {
  return request('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export function getCustomers() {
  return request('/customers')
}

export function createCustomer(payload) {
  return request('/customers', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateCustomer(id, payload) {
  return request(`/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function getInvoices() {
  return request('/invoices')
}

export function createInvoice(payload) {
  return request('/invoices', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getPayments(invoiceId) {
  const query = invoiceId ? `?invoiceId=${encodeURIComponent(invoiceId)}` : ''
  return request(`/payments${query}`)
}

export function createPayment(payload) {
  return request('/payments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getAuditLogs(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.set(k, String(v))
  })
  const query = search.toString()
  return request(`/audit-logs${query ? `?${query}` : ''}`)
}