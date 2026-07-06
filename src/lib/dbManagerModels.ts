// Allow-listed models for the Master Admin database manager.
// Only these models are browsable/editable through the controlled UI — no raw SQL is ever exposed.
export const DB_MANAGER_MODELS: Record<string, { label: string; sensitiveFields?: string[] }> = {
  product: { label: 'Products' },
  category: { label: 'Categories' },
  productVariant: { label: 'Product Variants' },
  order: { label: 'Orders' },
  user: { label: 'Users', sensitiveFields: ['password'] },
  coupon: { label: 'Coupons' },
  siteSettings: { label: 'Site Settings' },
  lead: { label: 'Leads' },
  ticket: { label: 'Tickets' },
  whatsAppOrder: { label: 'WhatsApp Orders' },
  review: { label: 'Reviews' },
  abandonedCart: { label: 'Abandoned Carts' },
}

export function isAllowedModel(model: string): model is keyof typeof DB_MANAGER_MODELS {
  return Object.prototype.hasOwnProperty.call(DB_MANAGER_MODELS, model)
}

export function stripSensitive(model: string, row: any) {
  const cfg = DB_MANAGER_MODELS[model]
  if (!cfg?.sensitiveFields || !row) return row
  const clone = { ...row }
  for (const f of cfg.sensitiveFields) delete clone[f]
  return clone
}
