import { detectIOS } from '@vkontakte/vkjs'
import { Viewport } from 'next'
import { headers } from 'next/headers'

import '@vkontakte/vkui/dist/cssm/styles/themes.css'

import { Layout } from '@/client/Layout'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const requestHeaders = await headers()

  const userAgent = requestHeaders.get('User-Agent') ?? ''
  const platform = detectIOS(userAgent) ? 'ios' : 'android'

  const acceptLanguage = requestHeaders.get('Accept-Language') ?? 'en-US'
  const language = acceptLanguage.split(',')[0]
  const direction = ['ar', 'fa', 'he', 'ur'].includes(language) ? 'rtl' : 'ltr'

  return (
    <html className="vkui" lang={language} dir={direction}>
      <body className="vkui__root">
        <Layout platform={platform} direction={direction}>
          {children}
        </Layout>
      </body>
    </html>
  )
}
