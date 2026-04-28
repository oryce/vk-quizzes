import { betterAuth, InferSession, InferUser } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'

import { db } from '@/lib/db'
import * as schema from '@/lib/db/auth-schema'

import { ac, roles } from './permissions'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true },
  plugins: [
    admin({
      ac,
      roles,
      defaultRole: 'user',
      adminRoles: ['admin'],
    }),
  ],
})

export type Session = InferSession<typeof auth.options>
export type User = InferUser<typeof auth.options>
