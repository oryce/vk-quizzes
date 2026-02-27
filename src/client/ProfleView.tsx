'use client'

import { Icon28DoorArrowRightOutline, Icon28MailOutline } from '@vkontakte/icons'
import { Avatar, Group, Panel, PanelHeader, SimpleCell, Title, View } from '@vkontakte/vkui'
import { useRouter } from 'next/navigation'

import { type User } from '@/lib/auth'
import { authClient } from '@/lib/auth/client'

export function ProfileView({ id, user }: { id: string; user: User }) {
  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .join('')

  const router = useRouter()

  const logout = () =>
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/auth/login')
        },
      },
    })

  return (
    <View id={id} activePanel="profile-panel">
      <Panel id="profile-panel">
        <PanelHeader>Профиль</PanelHeader>
        <Group>
          <SimpleCell before={<Avatar initials={initials} size={72} />}>
            <Title level="3" weight="2" useAccentWeight>
              {user.name}
            </Title>
          </SimpleCell>
          <SimpleCell before={<Icon28MailOutline />} indicator={user.email}>
            E-mail
          </SimpleCell>
          <SimpleCell
            before={
              <Icon28DoorArrowRightOutline style={{ color: 'var(--vkui--color_icon_negative)' }} />
            }
            onClick={logout}
          >
            Выйти из аккаунта
          </SimpleCell>
        </Group>
      </Panel>
    </View>
  )
}
