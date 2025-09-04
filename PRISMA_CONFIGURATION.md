# Prisma Configuration

This project is configured to use different Prisma engine types based on the environment to optimize performance and bundle size.

## Configuration

### Development Environment
- **Engine Type**: `binary` (better performance)
- **Command**: `prisma generate`
- **Use Case**: Local development with better query performance

### Production Environment
- **Engine Type**: `library` (smaller bundle size)
- **Command**: `prisma generate --no-engine`
- **Use Case**: Production deployments with optimized bundle size

## Scripts

- `npm run dev` - Generates Prisma client for development and starts Next.js
- `npm run build` - Generates Prisma client for production and builds the app
- `npm run prisma:generate` - Manually generate Prisma client based on environment
- `npm run postinstall` - Automatically runs after `npm install`

## Environment Variables

The following environment variables control the Prisma engine type:

- `NODE_ENV=production` - Uses library engine
- `NODE_ENV=development` - Uses binary engine
- `VERCEL=1` - Uses library engine (Vercel deployment)

## Files Modified

1. **prisma/schema.prisma** - Set `engineType = "library"`
2. **package.json** - Updated scripts to use environment-aware generation
3. **next.config.js** - Dynamic engine type based on environment
4. **vercel.json** - Production environment configuration
5. **scripts/prisma-generate.js** - Smart generation script

## Benefits

- ✅ No more Prisma warnings in production
- ✅ Optimized bundle size for production
- ✅ Better performance in development
- ✅ Automatic environment detection
- ✅ Consistent configuration across all environments
