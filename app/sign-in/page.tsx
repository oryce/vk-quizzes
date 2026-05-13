import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { AuthForm } from "@/components/auth/auth-form"
import { auth } from "@/lib/auth"

export default async function SignInPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session) {
    redirect("/profile")
  }

  return (
    <main className="flex min-h-[calc(100svh-4rem)] items-center justify-center px-4 py-10">
      <AuthForm mode="sign-in" />
    </main>
  )
}
