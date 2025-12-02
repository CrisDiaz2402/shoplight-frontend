// Shared User type that mirrors the backend Prisma model `User`
export interface User {
  id: number
  email: string
  name: string
  role?: string
  // ISO strings (Date serialized)
  createdAt?: string
  updatedAt?: string
}
