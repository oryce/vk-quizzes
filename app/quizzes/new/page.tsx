import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { QuizCreateForm } from "@/components/quizzes/quiz-create-form"
import { auth } from "@/lib/auth"

export default async function NewQuizPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <main className="mx-auto min-h-[calc(100svh-4rem)] w-full max-w-5xl px-4 py-8">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold">Создание квиза</h1>
        <p className="text-sm text-muted-foreground">
          Заполните основную информацию и добавьте хотя бы один вопрос.
        </p>
      </div>
      <QuizCreateForm />
    </main>
  )
}
