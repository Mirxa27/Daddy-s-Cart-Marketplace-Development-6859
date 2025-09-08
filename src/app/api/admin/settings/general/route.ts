import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generalSettingsSchema } from '@/lib/validations/settings';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch general settings
    const settings = await prisma.setting.findMany({
      where: {
        group: 'general',
      },
    });
    
    // Transform settings into key-value pairs
    const settingsData: Record<string, any> = {};
    settings.forEach(setting => {
      try {
        settingsData[setting.key] = JSON.parse(setting.value as string);
      } catch {
        settingsData[setting.key] = setting.value;
      }
    });
    
    return NextResponse.json(settingsData);
    
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    
    // Validate input
    const validatedData = generalSettingsSchema.parse(body);
    
    // Update settings
    const updatePromises = Object.entries(validatedData).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: {
          value: JSON.stringify(value),
          updatedAt: new Date(),
        },
        create: {
          key,
          value: JSON.stringify(value),
          group: 'general',
          description: getSettingDescription(key),
        },
      })
    );
    
    await Promise.all(updatePromises);
    
    return NextResponse.json({
      message: 'General settings updated successfully',
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

function getSettingDescription(key: string): string {
  const descriptions: Record<string, string> = {
    site_name: 'The name of the marketplace',
    site_description: 'Site description for SEO and marketing',
    contact_email: 'Primary contact email address',
    support_email: 'Customer support email address',
    maintenance_mode: 'Enable/disable maintenance mode',
  };
  
  return descriptions[key] || `Setting for ${key}`;
}