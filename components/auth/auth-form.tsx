"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, signUp } from "@/lib/auth-client"

type AuthFormProps = {
  mode: "sign-in" | "sign-up"
}

function getErrorMessage(message?: string) {
  if (!message) {
    return "Не удалось выполнить действие. Попробуйте ещё раз."
  }

  if (message.toLowerCase().includes("invalid")) {
    return "Проверьте почту и пароль."
  }

  return message
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)
  const [isPending, startTransition] = React.useTransition()
  const isSignUp = mode === "sign-up"

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    startTransition(async () => {
      const result = isSignUp
        ? await signUp.email({
            email,
            password,
            name: `${String(formData.get("firstName") ?? "").trim()} ${String(
              formData.get("lastName") ?? ""
            ).trim()}`.trim(),
            firstName: String(formData.get("firstName") ?? "").trim(),
            lastName: String(formData.get("lastName") ?? "").trim(),
          })
        : await signIn.email({
            email,
            password,
          })

      if (result.error) {
        setError(getErrorMessage(result.error.message))
        return
      }

      router.push("/profile")
      router.refresh()
    })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">
          {isSignUp ? "Регистрация" : "Вход"}
        </CardTitle>
        <CardDescription>
          {isSignUp
            ? "Создайте аккаунт участника квизов."
            : "Войдите, чтобы участвовать и проводить квизы."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          {isSignUp ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  autoComplete="given-name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Электронная почта</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <Button className="w-full" size="lg" disabled={isPending}>
            {isPending
              ? "Пожалуйста, подождите"
              : isSignUp
                ? "Создать аккаунт"
                : "Войти"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? "Уже есть аккаунт?" : "Нет аккаунта?"}{" "}
        <Link
          className="font-medium text-primary underline-offset-4 hover:underline"
          href={isSignUp ? "/sign-in" : "/sign-up"}
        >
          {isSignUp ? "Войти" : "Зарегистрироваться"}
        </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
