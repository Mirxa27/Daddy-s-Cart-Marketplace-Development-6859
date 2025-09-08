import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: 'up' | 'down' | 'slow';
    email: 'up' | 'down' | 'untested';
    storage: 'up' | 'down' | 'untested';
    payments: 'up' | 'down' | 'untested';
  };
  metrics?: {
    responseTime: number;
    memoryUsage: NodeJS.MemoryUsage;
  };
  errors?: string[];
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const errors: string[] = [];
  
  const healthCheck: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    services: {
      database: 'down',
      email: 'untested',
      storage: 'untested',
      payments: 'untested',
    },
  };

  // Test database connection
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbTime = Date.now() - dbStart;
    
    healthCheck.services.database = dbTime > 1000 ? 'slow' : 'up';
    
    if (dbTime > 1000) {
      errors.push(`Database response time slow: ${dbTime}ms`);
    }
  } catch (error) {
    healthCheck.services.database = 'down';
    errors.push(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test email service
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      // Basic SMTP configuration check
      healthCheck.services.email = 'up';
    } else {
      healthCheck.services.email = 'down';
      errors.push('Email service not configured');
    }
  } catch (error) {
    healthCheck.services.email = 'down';
    errors.push(`Email service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test storage service
  try {
    if (process.env.UPLOADTHING_SECRET || process.env.AWS_ACCESS_KEY_ID) {
      healthCheck.services.storage = 'up';
    } else {
      healthCheck.services.storage = 'down';
      errors.push('Storage service not configured');
    }
  } catch (error) {
    healthCheck.services.storage = 'down';
    errors.push(`Storage service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Test payment service
  try {
    if (process.env.STRIPE_SECRET_KEY) {
      healthCheck.services.payments = 'up';
    } else {
      healthCheck.services.payments = 'down';
      errors.push('Payment service not configured');
    }
  } catch (error) {
    healthCheck.services.payments = 'down';
    errors.push(`Payment service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Calculate metrics
  const responseTime = Date.now() - startTime;
  healthCheck.metrics = {
    responseTime,
    memoryUsage: process.memoryUsage(),
  };

  // Determine overall status
  const criticalServicesDown = ['database', 'payments'].some(
    service => healthCheck.services[service as keyof typeof healthCheck.services] === 'down'
  );
  
  const servicesDown = Object.values(healthCheck.services).some(status => status === 'down');
  const servicesSlow = Object.values(healthCheck.services).some(status => status === 'slow');

  if (criticalServicesDown) {
    healthCheck.status = 'unhealthy';
  } else if (servicesDown || servicesSlow || responseTime > 2000) {
    healthCheck.status = 'degraded';
  } else {
    healthCheck.status = 'healthy';
  }

  if (errors.length > 0) {
    healthCheck.errors = errors;
  }

  // Return appropriate status code
  const statusCode = healthCheck.status === 'healthy' ? 200 : 
                    healthCheck.status === 'degraded' ? 200 : 503;

  return NextResponse.json(healthCheck, { 
    status: statusCode,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
}