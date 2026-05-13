import { headers } from "next/headers"

import { SiteHeaderClient } from "@/components/site-header-client"
import { auth } from "@/lib/auth"

export async function SiteHeader() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <SiteHeaderClient
      user={
        session
          ? {
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
              firstName: session.user.firstName,
              lastName: session.user.lastName,
            }
          : null
      }
    />
  )
}
