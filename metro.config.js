// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Don't add .md and .pdf to asset extensions for web - we want them served as static files
// This prevents Metro from trying to process them as assets

// Block assets/books directory from being processed as source files or assets
// These files should be served as static assets from public/, not bundled by Metro
config.resolver.blockList = [
  ...(config.resolver.blockList || []),
  /assets\/books\/.*/,
  /public\/assets\/books\/.*/,
];

// Add custom server middleware to serve static files from public directory
// This ensures files in public/assets/books are served correctly
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // If request is for /assets/books/, serve from public directory
      if (req.url && req.url.startsWith('/assets/books/')) {
        // Decode each path segment separately to handle spaces and special characters
        const urlPath = req.url.substring('/assets/books/'.length); // Remove prefix
        const segments = urlPath.split('/');
        const decodedSegments = segments.map(seg => {
          try {
            return decodeURIComponent(seg);
          } catch {
            return seg;
          }
        });
        const decodedPath = decodedSegments.join('/');
        const filePath = path.join(__dirname, 'public', 'assets', 'books', decodedPath);
        
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          if (stat.isFile()) {
            // Determine content type
            let contentType = 'application/octet-stream';
            if (filePath.endsWith('.pdf')) {
              contentType = 'application/pdf';
            } else if (filePath.endsWith('.md')) {
              contentType = 'text/markdown; charset=utf-8';
            }
            
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', stat.size);
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        } else {
          // Log for debugging
          console.error('File not found:', filePath);
          console.error('Requested URL:', req.url);
          console.error('Decoded path:', decodedPath);
        }
      }
      // Otherwise, use default middleware
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
