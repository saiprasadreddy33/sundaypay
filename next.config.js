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
    },
  },
});
