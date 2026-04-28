import { createAccessControl } from 'better-auth/plugins/access'
import { adminAc, defaultStatements, userAc } from 'better-auth/plugins/admin/access'

const statements = {
  ...defaultStatements,
  quiz: ['create', 'read', 'update', 'delete'],
} as const

export const ac = createAccessControl(statements)

export const roles = {
  user: ac.newRole({
    ...userAc.statements,
    quiz: ['read'],
  }),
  organizer: ac.newRole({
    ...userAc.statements,
    quiz: ['create', 'read', 'update'],
  }),
  admin: ac.newRole({
    ...adminAc.statements,
    quiz: ['create', 'read', 'update', 'delete'],
  }),
}
