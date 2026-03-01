'use client'

import { Icon28DoorArrowRightOutline, Icon28UserCircleOutline } from '@vkontakte/icons'
import {
  AdaptivityProvider,
  AppRoot,
  ConfigProvider,
  Epic,
  Group,
  Panel,
  PanelHeader,
  SimpleCell,
  SplitCol,
  SplitLayout,
  Tabbar,
  TabbarItem,
  useAdaptivityConditionalRender,
  usePlatform,
  type ConfigProviderProps,
} from '@vkontakte/vkui'

import { usePathname, useRouter } from 'next/navigation'

import { authClient } from '@/lib/auth/client'

function LayoutContent({ children }: React.PropsWithChildren) {
  const { data: session } = authClient.useSession()
  const authenticated = session !== null

  const navigation = [
    authenticated
      ? { id: 'profile', href: '/profile', label: 'Профиль', Icon: Icon28UserCircleOutline }
      : { id: 'auth', href: '/auth', label: 'Вход', Icon: Icon28DoorArrowRightOutline },
  ]

  const { viewWidth } = useAdaptivityConditionalRender()
  const platform = usePlatform()

  const pathname = usePathname()
  const router = useRouter()

  return (
    <AppRoot disableSettingVKUIClassesInRuntime>
      <SplitLayout center header={platform !== 'vkcom' && <PanelHeader delimiter="none" />}>
        {viewWidth.tabletPlus && (
          <SplitCol className={viewWidth.tabletPlus.className} fixed width={280} maxWidth={280}>
            <Panel>
              {platform !== 'vkcom' && <PanelHeader />}
              <Group>
                {navigation.map(({ id, href, label, Icon }) => (
                  <SimpleCell
                    key={id}
                    activated={pathname.startsWith(href)}
                    before={<Icon />}
                    onClick={() => router.push(href)}
                  >
                    {label}
                  </SimpleCell>
                ))}
              </Group>
            </Panel>
          </SplitCol>
        )}
        <SplitCol autoSpaced maxWidth={560} stretchedOnMobile>
          <Epic
            tabbar={
              viewWidth.tabletMinus && (
                <Tabbar className={viewWidth.tabletMinus.className}>
                  {navigation.map(({ id, href, label, Icon }) => (
                    <TabbarItem
                      key={id}
                      label={label}
                      selected={pathname.startsWith(href)}
                      onClick={() => router.push(href)}
                    >
                      <Icon />
                    </TabbarItem>
                  ))}
                </Tabbar>
              )
            }
          >
            {children}
          </Epic>
        </SplitCol>
      </SplitLayout>
    </AppRoot>
  )
}

type LayoutProps = Pick<ConfigProviderProps, 'platform' | 'direction'> & React.PropsWithChildren

export function Layout({ platform, direction, children }: LayoutProps) {
  return (
    <ConfigProvider platform={platform} direction={direction}>
      <AdaptivityProvider>
        <LayoutContent>{children}</LayoutContent>
      </AdaptivityProvider>
    </ConfigProvider>
  )
}
