import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { auth } from "@/lib/auth"

const roleLabels: Record<string, string> = {
  user: "Пользователь",
  organizer: "Организатор",
  admin: "Администратор",
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  const user = session.user
  const role = user.role ?? "user"

  return (
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-4xl flex-col px-4 py-8">
      <div className="flex items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-semibold">Профиль</h1>
          <p className="text-sm text-muted-foreground">
            Данные текущего пользователя
          </p>
        </div>
      </div>

      <section className="mt-8 grid gap-6 md:grid-cols-[160px_1fr]">
        <div className="flex size-32 items-center justify-center rounded-full bg-secondary text-4xl font-semibold text-secondary-foreground">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="size-full rounded-full object-cover"
              src={user.image}
              alt=""
            />
          ) : (
            <span>
              {user.firstName.at(0)}
              {user.lastName.at(0)}
            </span>
          )}
        </div>

        <Card>
          <CardContent>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Имя</dt>
                <dd className="mt-1 font-medium">{user.firstName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Фамилия</dt>
                <dd className="mt-1 font-medium">{user.lastName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Электронная почта</dt>
                <dd className="mt-1 font-medium">{user.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Роль</dt>
                <dd className="mt-1 font-medium">
                  {roleLabels[role] ?? role}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
