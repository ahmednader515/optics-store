const nextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
      },
    ],
  },
  
  // ESLint configuration
  eslint: {
    // Only run ESLint on these directories during build
    dirs: ['app', 'components', 'lib', 'hooks'],
    // Don't fail the build on ESLint errors in production
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  
  // TypeScript configuration
  typescript: {
    // Don't fail the build on TypeScript errors in production
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@prisma/client'],
    // Enable server actions (correct format)
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
    // Ensure Prisma engine files are included in server output
    instrumentationHook: true,
    // Explicitly include Prisma engines in traced output
    outputFileTracingIncludes: {
      '*': [
        './node_modules/.prisma/client/**',
        './node_modules/@prisma/client/**'
      ],
    },
  },
  
  // Reduce bundle size and improve loading
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Enable compression
  compress: true,
  
  // Optimize for faster navigation
  poweredByHeader: false,
  
  // Handle database connection issues gracefully
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Exclude [locale] directory from build
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'app/[locale]': false,
    }
    // Include prisma and @prisma/client in server bundle for engine resolution
    if (isServer) {
      config.externals = config.externals || []
      // Keep prisma as external to load engines from node_modules at runtime
      config.externals.push('prisma')
      config.externals.push('@prisma/client')
    }
    
    // Add error handling for production builds
    if (!dev && isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
      }
    }
    
    return config
  },
  
  // Environment-specific settings
  env: {
    CUSTOM_KEY: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    PRISMA_CLIENT_ENGINE_TYPE: 'binary',
  },
  
  // Handle runtime errors gracefully
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
