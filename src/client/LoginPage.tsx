'use client'

import {
  Box,
  Button,
  Card,
  FormItem,
  FormLayoutGroup,
  FormStatus,
  Input,
  Panel,
  PanelHeader,
} from '@vkontakte/vkui'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'

import { authClient } from '@/lib/auth/client'

export function LoginPage() {
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

  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  const onSubmit: SubmitHandler<Inputs> = async ({ email, password }) => {
    setLoading(true)

    const { error } = await authClient.signIn.email({
      email,
      password,
      fetchOptions: {
        onSuccess: () => {
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
    <Panel centered>
      <PanelHeader>Авторизация</PanelHeader>
      <Card>
        <Box padding="m">
          <form onSubmit={handleSubmit(onSubmit)}>
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
                <Input
                  id="password"
                  type="password"
                  {...register('password', { required: true })}
                />
              </FormItem>
              <FormItem>
                <Button type="submit" size="m" stretched loading={loading}>
                  Войти
                </Button>
              </FormItem>
              {errors.root && <FormStatus mode="error">{errors.root.message}</FormStatus>}
            </FormLayoutGroup>
          </form>
        </Box>
      </Card>
    </Panel>
  )
}
