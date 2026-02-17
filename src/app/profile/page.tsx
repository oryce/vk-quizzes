import { headers } from 'next/headers'

import { ProfilePage } from '@/client/ProfilePage'
import { auth } from '@/lib/auth'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  return <ProfilePage profile={session!.user} />
}
