'use client'

import { authClient } from '@/lib/auth-client'
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
import * as React from 'react'

export function RegisterPage() {
  const [username, setUsername] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const register = async () => {
    setError(null)

    const { data, error } = await authClient.signUp.email({ name: username, email, password })
    if (error) setError(error.message || 'Ошибка регистрации')
  }

  return (
    <Panel centered>
      <PanelHeader>Регистрация</PanelHeader>
      <Card>
        <Box padding="m">
          <FormLayoutGroup>
            {error && <FormStatus mode="error">{error}</FormStatus>}
            <FormItem htmlFor="username" top="Имя пользователя" required>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </FormItem>
            <FormItem htmlFor="email" top="Электронная почта" required>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormItem>
            <FormItem htmlFor="password" top="Пароль" required>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormItem>
            <FormItem>
              <Button size="m" stretched onClick={register}>
                Создать аккаунт
              </Button>
            </FormItem>
          </FormLayoutGroup>
        </Box>
      </Card>
    </Panel>
  )
}
