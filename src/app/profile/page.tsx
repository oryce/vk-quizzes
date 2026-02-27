import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { ProfileView } from '@/client/ProfleView'
import { auth } from '@/lib/auth'

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/auth/login')

  return <ProfileView id="profile" user={session.user} />
}
