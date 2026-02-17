import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@vkontakte/vkui'],
  modularizeImports: {
    '@vkontakte/vkui': {
      transform: '@vkontakte/vkui/dist/cssm',
      skipDefaultConversion: true,
    },
  },
}

export default nextConfig
