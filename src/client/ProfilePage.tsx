'use client'

import { Button, Text } from '@vkontakte/vkui'
import { useRouter } from 'next/navigation'

import { authClient } from '@/lib/auth-client'

export function ProfilePage({ profile }: { profile: { name: string } }) {
  const router = useRouter()

  const logout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/login')
        },
      },
    })
  }

  return (
    <>
      <Text>Welcome back, {profile.name}</Text>
      <Button onClick={logout}>Sign out</Button>
    </>
  )
}
