const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  cacheOnFrontEndNav: true,
});

module.exports = withPWA({
  reactStrictMode: true,
  // Add empty turbopack config to silence the warning
  turbopack: {},
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
      // Allow server actions when developing through tunnels or alternate hosts
      allowedOrigins: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://gf1qbqkn-3000.inc1.devtunnels.ms/',
        process.env.NEXT_PUBLIC_SITE_URL,
        process.env.NEXT_PUBLIC_TUNNEL_URL,
      ].filter(Boolean),
    },
  },
});
