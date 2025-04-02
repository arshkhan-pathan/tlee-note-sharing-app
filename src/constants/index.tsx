export const APP_URL = "/api"
export const CURRENT_HOST = typeof window !== "undefined" ? window.location.origin : "";
export const BACKEND_URL = process.env.BE_URL || `${CURRENT_HOST}/api`