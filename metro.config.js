// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add .md and .pdf to asset extensions
config.resolver.assetExts.push('md', 'pdf');

// Block assets/books directory from being processed as source files
// These files should be served as static assets from public/, not bundled by Metro
config.resolver.blockList = [
  ...(config.resolver.blockList || []),
  /assets\/books\/.*/,
];

// Add custom middleware to serve static files from public directory
const originalMiddleware = config.server?.rewriteRequestUrl;
config.server = {
  ...config.server,
  rewriteRequestUrl: (url) => {
    // Let static files from public/assets/books pass through
    if (url.startsWith('/assets/books/')) {
      return url;
    }
    return originalMiddleware ? originalMiddleware(url) : url;
  },
};

module.exports = config;
