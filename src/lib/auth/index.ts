import { betterAuth, InferSession, InferUser } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { db } from '@/lib/db'
import * as schema from '@/lib/db/auth-schema'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true },
})

export type Session = InferSession<typeof auth.options>
export type User = InferUser<typeof auth.options>
