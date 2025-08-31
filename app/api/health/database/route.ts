import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Simple database health check using Prisma
    const startTime = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const responseTime = Date.now() - startTime
    
    const health = {
      status: responseTime < 100 ? 'healthy' : 
                responseTime < 1000 ? 'degraded' : 'unhealthy',
      message: `Database responding (${responseTime}ms)`,
      responseTime
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      database: health,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    }, {
      status: health.status === 'healthy' ? 200 : 
              health.status === 'degraded' ? 200 : 503
    })
  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: 'Failed to check database health',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
