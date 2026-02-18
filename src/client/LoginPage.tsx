'use client'

import {
  Box,
  Button,
  Card,
  FormItem,
  FormLayoutGroup,
  Input,
  Panel,
  PanelHeader,
} from '@vkontakte/vkui'
import * as React from 'react'

import { authClient } from '@/lib/auth/client'

export function LoginPage() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const login = async () => {
    setError(null)

    const { data, error } = await authClient.signIn.email({ email, password })
    if (error) setError(error.message || 'Ошибка авторизации')
  }

  return (
    <Panel centered>
      <PanelHeader>Авторизация</PanelHeader>
      <Card>
        <Box padding="m">
          <FormLayoutGroup>
            <FormItem
              htmlFor="email"
              top="E-mail"
              required
              status={error ? 'error' : 'default'}
              bottom={error}
            >
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormItem>
            <FormItem
              htmlFor="password"
              top="Пароль"
              required
              status={error ? 'error' : 'default'}
              bottom={error}
            >
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormItem>
            <FormItem>
              <Button size="m" stretched onClick={login}>
                Войти
              </Button>
            </FormItem>
          </FormLayoutGroup>
        </Box>
      </Card>
    </Panel>
  )
}
