'use client'

import {
  AdaptivityProvider,
  AppRoot,
  ConfigProvider,
  type ConfigProviderProps,
} from '@vkontakte/vkui'

function LayoutContent({ children }: React.PropsWithChildren) {
  return <AppRoot disableSettingVKUIClassesInRuntime>{children}</AppRoot>
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
