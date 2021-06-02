const withImages = require('next-images')
const withOffline = require('next-offline')
const { URL } = require('url')

require('dotenv').config()

const ANALYZE = process.env.ANALYZE === 'true'
const withBundleAnalyzer = require('@next/bundle-analyzer')({ enabled: ANALYZE })
const APP_URL = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '')
const HOST_NAME = new URL(APP_URL).host

module.exports = withBundleAnalyzer(withOffline(withImages({
  poweredByHeader: false,
  target: 'serverless',
  env: {
    APP_URL: APP_URL,
    DB_URL: process.env.DB_URL,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUTH0_SCOPE: 'openid profile',
    REDIRECT_URI: new URL(process.env.REDIRECT_URI || '/api/callback', APP_URL).toString(),
    POST_LOGOUT_REDIRECT_URI: new URL(process.env.POST_LOGOUT_REDIRECT_URI || '/', APP_URL).toString(),
    SESSION_SECRET: process.env.SESSION_SECRET || 'keyboard cat',
    SESSION_COOKIE_LIFETIME: 30 * 86400000, // 30 days
    TMDB_V3: process.env.TMDB_V3,
    TMDB_V4: process.env.TMDB_V4
  },

  devIndicators: { autoPrerender: false },

  webpack: (config /*, { isServer, dev, buildId, config: { distDir } } */) => {
    config.node = { fs: 'empty' }
    
    // config.resolve.alias['@'] = __dirname
    // config.resolve.alias['components'] = joinPath(__dirname, 'components')

    return config
  },
  webpackDevMiddleware: config => {
    config.watchOptions = {
      ...(config.watchOptions || {}),
      poll: 1000,
      aggregateTimeout: 300,
      ignored: /^node_modules$/
    }

    return config
  },

  // transformManifest: manifest => [
  //   '/'
  //   // '/collection',
  //   // '/collection/[id]',
  //   // '/title/[type]/[id]',
  //   // '/about',
  //   // '/privacy',
  //   // '/settings',
  //   // '/terms'
  // ].concat(manifest),
  // generateInDevMode: true,

  async rewrites() {
    return [
      {
        source: '/service-worker.js',
        destination: '/_next/static/service-worker.js',
      },
    ]
  },

  workboxOpts: {
    // clientsClaim: true,
    // skipWaiting: true,
    cleanupOutdatedCaches: true,
    swDest: process.env.NEXT_EXPORT? 'service-worker.js' : 'static/service-worker.js',

    exclude: [
      // /user/,
      // /.*\/_next\/webpack-hmr.*/, 
      // /.*\.hot-update\.json$/
    ],
    runtimeCaching: [
      { // Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
        urlPattern: /^https:\/\/fonts\.googleapis\.com/, handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'stylesheets'
        }
      },
      { // Cache the underlying font files with a cache-first strategy for 1 year.
        urlPattern: /^https:\/\/fonts\.gstatic\.com/, handler: 'CacheFirst',
        options: {
          cacheName: 'fonts',
          cacheableResponse: { statuses: [0, 200] },
          expiration: { maxAgeSeconds: 60 * 60 * 24 * 365, maxEntries: 30 }
        }
      },
      { // Cache meta responses
        urlPattern: /.*\/providers\/.*\.json(?:\?.*)?$/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offlineCache',
          cacheableResponse: {
            statuses: [0, 200]
          },
          expiration: {
            maxEntries: 100,
          }
        }
      },
      { // Cache first for tmdb images
        urlPattern: /.*image.tmdb.org\/.*\.(?:png|gif|jpg|jpeg|webp|svg|ico)$/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images',
          cacheableResponse: {
            statuses: [0, 200]
          },
          expiration: {
            maxEntries: 250,
            maxAgeSeconds: 30 * 24 * 60 * 60
          }
        }
      },
      { // Network first for images
        urlPattern: /.*\.(?:png|gif|jpg|jpeg|webp|svg|ico)$/,
        handler: 'NetworkFirst',
        options: {
          networkTimeoutSeconds: 10,
          cacheName: 'images',
          cacheableResponse: { statuses: [0, 200] },
          expiration: { maxEntries: 250 }
        }
      },
      { // Cache the video.js stylesheets with a stale-while-revalidate strategy.
        urlPattern: /^https:\/\/unpkg\.com\/video.js\/dist\/video-js\.min\.css$/, handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'stylesheets'
        }
      },
      {
        urlPattern: new RegExp(`^${APP_URL}(/.*)?$`), // new RegExp(`^${APP_URL}(/([^.])+)?($|/{1,}.*(\\.js|\\.jsx|\\.css|\\.html))$`),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offlineCache',
          expiration: {
            maxEntries: 100
          }
        }
      }
      // {
      //   urlPattern: /^https?.*/,
      //   handler: 'NetworkFirst',
      //   options: {
      //     cacheName: 'offlineCache',
      //     expiration: {
      //       maxEntries: 100
      //     }
      //   }
      // }
    ]
  }
})))