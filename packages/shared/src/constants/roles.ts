export const ROLES = ["user", "admin"] as const
export type Role = (typeof ROLES)[number]

export const ITEM_STATUSES = ["active", "archived"] as const
export type ItemStatus = (typeof ITEM_STATUSES)[number]
