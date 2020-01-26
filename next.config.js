const withCSS = require('@zeit/next-css')
const withImages = require('next-images')
const withOffline = require('next-offline')
const withFonts = require('next-fonts')

// const { join: joinPath } = require('path')

require('dotenv').config()

const APP_URL = process.env.APP_URL.replace(/\/$/, '')

module.exports = withFonts(withOffline(withImages(withCSS({
  // exportTrailingSlash: true,
  poweredByHeader: false,
  env: { 
    APP_URL: process.env.APP_URL || 'http://localhost:3000' 
  },
  devIndicators: { 
    autoPrerender: false 
  },

  webpack: (config /*, { isServer, dev, buildId, config: { distDir } } */) => {
    config.node = { fs: 'empty' }
    
    // config.resolve.alias['@'] = __dirname
    // config.resolve.alias['components'] = joinPath(__dirname, 'components')

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
  
  experimental: {
    async rewrites() {
      return [
        {
          source: '/service-worker.js',
          destination: '/_next/static/service-worker.js',
        },
      ]
    },
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
}))))