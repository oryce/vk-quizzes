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

export function RegisterPage() {
  interface Inputs {
    firstName: string
    lastName: string
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

  const onSubmit: SubmitHandler<Inputs> = async ({ firstName, lastName, email, password }) => {
    setLoading(true)

    const { error } = await authClient.signUp.email({
      name: `${firstName} ${lastName}`,
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
        case 'INVALID_EMAIL':
        case 'USER_ALREADY_EXISTS':
        case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
          setError('email', { message: error.message })
          break
        case 'INVALID_PASSWORD':
        case 'PASSWORD_TOO_SHORT':
        case 'PASSWORD_TOO_LONG':
          setError('password', { message: error.message })
          break
        default:
          setError('root', { message: error.message || 'Ошибка регистрации' })
      }
    }

    setLoading(false)
  }

  return (
    <Panel centered>
      <PanelHeader>Регистрация</PanelHeader>
      <Card>
        <Box padding="m">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormLayoutGroup>
              <FormLayoutGroup mode="horizontal">
                <FormItem
                  htmlFor="firstName"
                  top="Имя"
                  required
                  {...(errors.firstName && { status: 'error', bottom: errors.firstName.message })}
                >
                  <Input id="firstName" {...register('firstName', { required: true })} />
                </FormItem>
                <FormItem
                  htmlFor="lastName"
                  top="Фамилия"
                  required
                  {...(errors.lastName && { status: 'error', bottom: errors.lastName.message })}
                >
                  <Input id="lastName" {...register('lastName', { required: true })} />
                </FormItem>
              </FormLayoutGroup>
              <FormItem
                htmlFor="email"
                top="Электронная почта"
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
                  Создать аккаунт
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
