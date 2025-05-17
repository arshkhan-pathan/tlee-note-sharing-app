/** @type {import('next').NextConfig} */

import withPWA from 'next-pwa'

const isDev = process.env.NODE_ENV === 'development'

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: isDev ? 'http://127.0.0.1:8000/api/:path*' : '/api/',
      },
      {
        source: '/docs',
        destination: isDev ? 'http://127.0.0.1:8000/api/docs' : '/api/docs',
      },
      {
        source: '/openapi.json',
        destination: isDev ? 'http://127.0.0.1:8000/api/openapi.json' : '/api/openapi.json',
      },
    ]
  },
}

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})(nextConfig)
