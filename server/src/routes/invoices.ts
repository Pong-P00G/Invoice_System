import { Hono } from 'hono'
import mongoose from 'mongoose'
import Invoice, { InvoiceStatus } from '../models/invoice.js'
import Customer from '../models/customer.js'
import Product from '../models/product.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'
import type { IUser } from '../models/users.js'
import { logAudit } from '../services/audit.js'

type AppEnv = {
  Variables: {
    user: IUser
  }
}

const invoices = new Hono<AppEnv>()

invoices.use('*', authMiddleware)

type InputLineItem = {
  productId?: string
  description: string
  quantity: number
  unitPrice?: number
  taxRate?: number
}

const toObjectId = (value: string) => new mongoose.Types.ObjectId(value)

invoices.get('/', async (c) => {
  const user = c.get('user')
  const data = await Invoice.find({ tenantId: user.tenantId })
    .sort({ createdAt: -1 })
    .populate('clientId', 'name email')
    .populate('lineItems.productId', 'sku name')

  return c.json({ invoices: data })
})

invoices.get('/:id', async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const invoice = await Invoice.findOne({ _id: id, tenantId: user.tenantId })
    .populate('clientId', 'name email')
    .populate('lineItems.productId', 'sku name')

  if (!invoice) return c.json({ error: 'Invoice not found' }, 404)
  return c.json({ invoice })
})

invoices.post('/', requireRole('owner', 'admin'), async (c) => {
  const user = c.get('user')
  const body = await c.req.json()
  const {
    customerId,
    invoiceNumber,
    invoiceDate,
    dueDate,
    notes,
    terms,
    lineItems = [],
    currency = 'USD',
  } = body as {
    customerId: string
    invoiceNumber: string
    invoiceDate: string
    dueDate: string
    notes: string
    terms: string
    lineItems: InputLineItem[]
    currency?: string
  }

  if (!customerId || !invoiceNumber || !invoiceDate || !dueDate || !notes || !terms) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    return c.json({ error: 'lineItems must contain at least one item' }, 400)
  }

  const customer = await Customer.findOne({ _id: customerId, tenantId: user.tenantId, isActive: true })
  if (!customer) return c.json({ error: 'Customer not found' }, 404)

  const calculatedLineItems: Array<{
    productId?: mongoose.Types.ObjectId
    description: string
    quantity: number
    unitPrice: number
    lineSubtotal: number
    lineTax: number
    lineTotal: number
  }> = []

  for (const item of lineItems) {
    if (!item.description || !item.quantity || item.quantity <= 0) {
      return c.json({ error: 'Each line item requires description and quantity > 0' }, 400)
    }

    let unitPrice = Number(item.unitPrice ?? 0)
    let taxRate = Number(item.taxRate ?? 0)
    let productObjectId: mongoose.Types.ObjectId | undefined

    if (item.productId) {
      const product = await Product.findOne({
        _id: item.productId,
        tenantId: user.tenantId,
        isActive: true,
      })
      if (!product) return c.json({ error: `Product not found: ${item.productId}` }, 404)
      productObjectId = toObjectId(item.productId)
      unitPrice = Number(item.unitPrice ?? product.unitPrice)
      taxRate = Number(item.taxRate ?? product.taxRate)
    }

    const lineSubtotal = Number((item.quantity * unitPrice).toFixed(2))
    const lineTax = Number((lineSubtotal * (taxRate / 100)).toFixed(2))
    const lineTotal = Number((lineSubtotal + lineTax).toFixed(2))

    calculatedLineItems.push({
      productId: productObjectId,
      description: item.description,
      quantity: Number(item.quantity),
      unitPrice,
      lineSubtotal,
      lineTax,
      lineTotal,
    })
  }

  const subtotal = Number(calculatedLineItems.reduce((sum, item) => sum + item.lineSubtotal, 0).toFixed(2))
  const taxAmount = Number(calculatedLineItems.reduce((sum, item) => sum + item.lineTax, 0).toFixed(2))
  const total = Number((subtotal + taxAmount).toFixed(2))
  const taxRate = subtotal > 0 ? Number(((taxAmount / subtotal) * 100).toFixed(2)) : 0

  const invoice = await Invoice.create({
    tenantId: user.tenantId,
    userId: user._id,
    clientId: customer._id,
    invoiceNumber,
    invoiceDate: new Date(invoiceDate),
    dueDate: new Date(dueDate),
    status: InvoiceStatus.DRAFT,
    notes,
    terms,
    lineItems: calculatedLineItems,
    subtotal,
    taxRate,
    taxAmount,
    total,
    balanceDue: total,
    currency,
  })

  await logAudit({
    tenantId: user.tenantId,
    userId: user._id,
    action: 'create_invoice',
    entityType: 'invoice',
    entityId: invoice._id,
    meta: { invoiceNumber, total },
  })

  return c.json({ invoice }, 201)
})

invoices.patch('/:id', requireRole('owner', 'admin'), async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')
  const updates = await c.req.json()

  const invoice = await Invoice.findOneAndUpdate(
    { _id: id, tenantId: user.tenantId },
    updates,
    { new: true }
  )
  if (!invoice) return c.json({ error: 'Invoice not found' }, 404)

  await logAudit({
    tenantId: user.tenantId,
    userId: user._id,
    action: 'update_invoice',
    entityType: 'invoice',
    entityId: invoice._id,
  })

  return c.json({ invoice })
})

invoices.post('/:id/send', requireRole('owner', 'admin'), async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  const invoice = await Invoice.findOneAndUpdate(
    { _id: id, tenantId: user.tenantId },
    { status: InvoiceStatus.SENT },
    { new: true }
  )
  if (!invoice) return c.json({ error: 'Invoice not found' }, 404)

  await logAudit({
    tenantId: user.tenantId,
    userId: user._id,
    action: 'send_invoice',
    entityType: 'invoice',
    entityId: invoice._id,
  })

  return c.json({ invoice })
})

invoices.post('/:id/cancel', requireRole('owner', 'admin'), async (c) => {
  const user = c.get('user')
  const id = c.req.param('id')

  const invoice = await Invoice.findOneAndUpdate(
    { _id: id, tenantId: user.tenantId },
    { status: InvoiceStatus.CANCELLED },
    { new: true }
  )
  if (!invoice) return c.json({ error: 'Invoice not found' }, 404)

  await logAudit({
    tenantId: user.tenantId,
    userId: user._id,
    action: 'cancel_invoice',
    entityType: 'invoice',
    entityId: invoice._id,
  })

  return c.json({ invoice })
})

export default invoices
