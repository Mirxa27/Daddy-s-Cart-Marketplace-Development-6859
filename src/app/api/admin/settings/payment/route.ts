import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { paymentSettingsSchema } from '@/lib/validations/settings';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const settings = await prisma.setting.findMany({
      where: {
        group: 'payment',
      },
    });
    
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);
    
    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error('Failed to fetch payment settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const validatedData = paymentSettingsSchema.parse(body);
    
    // Update settings in database
    const updates = [
      { key: 'currency', value: validatedData.currency, group: 'payment' },
      { key: 'tax_rate', value: validatedData.tax_rate, group: 'payment' },
    ];
    
    if (validatedData.stripe_public_key) {
      updates.push({
        key: 'stripe_public_key',
        value: validatedData.stripe_public_key,
        group: 'payment',
      });
    }
    
    if (validatedData.stripe_secret_key) {
      updates.push({
        key: 'stripe_secret_key',
        value: validatedData.stripe_secret_key,
        group: 'payment',
      });
    }
    
    // Use transaction to update all settings
    await prisma.$transaction(
      updates.map((setting) =>
        prisma.setting.upsert({
          where: { key: setting.key },
          update: { value: setting.value },
          create: {
            key: setting.key,
            value: setting.value,
            group: setting.group,
            description: `${setting.key} configuration`,
          },
        })
      )
    );
    
    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Failed to update payment settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}