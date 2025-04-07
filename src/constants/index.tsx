export const CURRENT_HOST = typeof window !== "undefined" ? window.location.origin : "";
export const BACKEND_URL = process.env.NEXT_PUBLIC_BE_URL || `${CURRENT_HOST}/api`