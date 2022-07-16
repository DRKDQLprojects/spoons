const withPlugins = require('next-compose-plugins')
const optimizedImages = require('next-optimized-images')

/** @type {import('next').NextConfig} */
module.exports = withPlugins([
  [optimizedImages, {
    pngquant: {
      speed: 3,
      strip: true,
      verbose: true
    },
    imagesPublicPath: '/spoons/_next/static/images/', // PROD ONLY
    // imagesPublicPath: '/_next/static/images/' // LOCAL ONLY
  }],
  {
    reactStrictMode: true,
    basePath: '/spoons', // PROD ONLY
    assetPrefix: '/spoons/' // PROD ONLY
  }
])
