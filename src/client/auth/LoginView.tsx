'use client'

import {
  Button,
  FormItem,
  FormLayoutGroup,
  FormStatus,
  Group,
  Input,
  Panel,
  PanelHeader,
  Spacing,
  View,
} from '@vkontakte/vkui'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { authClient } from '@/lib/auth/client'

export function LoginView({ id }: { id: string }) {
  interface Inputs {
    email: string
    password: string
  }

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<Inputs>()

  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSubmit: SubmitHandler<Inputs> = async ({ email, password }) => {
    setLoading(true)

    const { error } = await authClient.signIn.email({
      email,
      password,
      fetchOptions: {
        onSuccess: () => {
          // TODO (~oryce, 27.02.2026): Should this component take a `goToProfile`?
          router.push('/profile')
        },
      },
    })

    if (error) {
      switch (error.code) {
        case 'INVALID_EMAIL_OR_PASSWORD':
          setError('email', { message: error.message })
          setError('password', { message: error.message })
          break
        default:
          setError('root', { message: error.message || 'Ошибка авторизации' })
      }
    }

    setLoading(false)
  }

  return (
    <View id={id} activePanel="login-panel">
      <Panel id="login-panel">
        <PanelHeader>Вход</PanelHeader>
        <Group Component="form" onSubmit={handleSubmit(onSubmit)}>
          <FormLayoutGroup>
            <FormItem
              htmlFor="email"
              top="E-mail"
              required
              {...(errors.email && { status: 'error', bottom: errors.email.message })}
            >
              <Input id="email" type="email" {...register('email', { required: true })} />
            </FormItem>
            <FormItem
              htmlFor="password"
              top="Пароль"
              required
              {...(errors.password && { status: 'error', bottom: errors.password.message })}
            >
              <Input id="password" type="password" {...register('password', { required: true })} />
            </FormItem>
            <FormItem>
              <Button type="submit" loading={loading} size="l" stretched>
                Войти
              </Button>
              <Spacing size="xl" />
              <Button
                appearance="neutral"
                mode="outline"
                size="l"
                stretched
                // TODO (~oryce, 27.02.2026): Should this component take a `goToRegister`?
                onClick={() => router.push('/auth/register')}
              >
                Создать аккаунт
              </Button>
            </FormItem>
            {errors.root && (
              <FormItem>
                <FormStatus mode="error">{errors.root.message}</FormStatus>
              </FormItem>
            )}
          </FormLayoutGroup>
        </Group>
      </Panel>
    </View>
  )
}
