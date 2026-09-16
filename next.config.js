const withPWA = require('@ducanh2912/next-pwa').default;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config options go here
};

module.exports = withPWA({
  dest: 'public',             // output sw.js + workbox files into /public
  cacheOnFrontEndNav: true,   // cache pages visited via client-side navigation
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,       // reload tabs when network comes back
  disable: false,             // keep SW active in all environments
  workboxOptions: {
    disableDevLogs: true,
    // Exclude API routes from SW caching — they must always hit the network
    navigateFallbackDenylist: [/^\/api\//],
    runtimeCaching: [
      // App-shell HTML — network first, fall back to cache
      {
        urlPattern: /^https?:\/\/.*\/((?!api\/).)*$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'kisanrahi-html',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 1 day
          },
        },
      },
      // Static assets: JS / CSS / fonts — stale-while-revalidate
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'kisanrahi-static',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      // Images (icons, public assets) — cache first
      {
        urlPattern: /\/_next\/image\?.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'kisanrahi-images',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      // Google Fonts — cache first
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'kisanrahi-fonts',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          },
        },
      },
    ],
  },
})(nextConfig);
