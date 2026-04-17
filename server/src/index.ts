import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { Hono } from 'hono'
import { config } from 'dotenv'
import { dbConnect } from './config/dbConnect.js'

import auth from './routes/auth.js'
import customers from './routes/customers.js'
import products from './routes/products.js'
import invoices from './routes/invoices.js'
import payments from './routes/payments.js'
import auditLogs from './routes/auditLogs.js'
import tenants from './routes/tenants.js'

config()

const app = new Hono()

app.use('*', cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
  credentials: true,
}))

app.route('/auth', auth)
app.route('/tenants', tenants)
app.route('/customers', customers)
app.route('/products', products)
app.route('/invoices', invoices)
app.route('/payments', payments)
app.route('/audit-logs', auditLogs)

dbConnect().then(() => {
  serve({
    fetch: app.fetch,
    port: 3030
  }, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  })
}).catch((error) => {
  console.error("MongoDB connection error:", error);
  process.exit(1);
})