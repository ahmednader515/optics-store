import { readFileSync } from 'fs'
import { join } from 'path'

/**
 * Custom environment variable loader that forces loading from .env file
 * This bypasses Next.js environment variable priority system
 */
export function loadEnvFromFile() {
  try {
    const envPath = join(process.cwd(), '.env')
    const envContent = readFileSync(envPath, 'utf-8')
    
    console.log('🔧 Loading environment variables from .env file...')
    
    // Parse .env file content
    const envVars: Record<string, string> = {}
    
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim()
      
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return
      }
      
      // Parse KEY=value format
      const equalIndex = trimmedLine.indexOf('=')
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex).trim()
        const value = trimmedLine.substring(equalIndex + 1).trim()
        
        // Remove quotes if present
        const cleanValue = value.replace(/^["']|["']$/g, '')
        
        // Set environment variable if not already set
        if (!process.env[key]) {
          process.env[key] = cleanValue
          envVars[key] = cleanValue
          console.log(`✅ Loaded: ${key}=${cleanValue.substring(0, 20)}...`)
        } else {
          console.log(`⚠️  Skipped: ${key} (already set)`)
        }
      }
    })
    
    console.log(`📋 Loaded ${Object.keys(envVars).length} environment variables from .env file`)
    return envVars
    
  } catch (error) {
    console.warn('⚠️  Could not load .env file:', error)
    return {}
  }
}

/**
 * Get environment variable with fallback
 */
export function getEnv(key: string, fallback?: string): string | undefined {
  return process.env[key] || fallback
}

/**
 * Check if environment variable exists
 */
export function hasEnv(key: string): boolean {
  return !!process.env[key]
}
