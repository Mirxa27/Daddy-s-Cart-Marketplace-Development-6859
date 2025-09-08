import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const result = subscribeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { email } = result.data;
    
    // Check if email is already subscribed
    const existingSubscriber = await prisma.setting.findFirst({
      where: {
        key: 'newsletter_subscribers',
      },
    });
    
    let subscribers: string[] = [];
    if (existingSubscriber) {
      subscribers = JSON.parse(existingSubscriber.value as string) || [];
    }
    
    if (subscribers.includes(email)) {
      return NextResponse.json(
        { error: 'Email is already subscribed to our newsletter' },
        { status: 400 }
      );
    }
    
    // Add email to subscribers list
    subscribers.push(email);
    
    // Update or create the subscribers setting
    await prisma.setting.upsert({
      where: { key: 'newsletter_subscribers' },
      update: {
        value: JSON.stringify(subscribers),
        updatedAt: new Date(),
      },
      create: {
        key: 'newsletter_subscribers',
        value: JSON.stringify(subscribers),
        description: 'Newsletter subscriber emails',
        group: 'marketing',
      },
    });
    
    // Log subscription for analytics
    await prisma.setting.upsert({
      where: { key: 'newsletter_stats' },
      update: {
        value: JSON.stringify({
          totalSubscribers: subscribers.length,
          lastSubscription: new Date().toISOString(),
        }),
        updatedAt: new Date(),
      },
      create: {
        key: 'newsletter_stats',
        value: JSON.stringify({
          totalSubscribers: subscribers.length,
          lastSubscription: new Date().toISOString(),
        }),
        description: 'Newsletter subscription statistics',
        group: 'analytics',
      },
    });
    
    // Send welcome email (optional)
    try {
      const { sendEmail } = await import('@/lib/email');
      await sendEmail(email, 'newsletter_welcome', {
        email,
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the subscription if email sending fails
    }
    
    return NextResponse.json({
      message: 'Successfully subscribed to newsletter',
      subscriberCount: subscribers.length,
    });
    
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const result = subscribeSchema.safeParse({ email });
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    // Get current subscribers
    const existingSubscriber = await prisma.setting.findFirst({
      where: {
        key: 'newsletter_subscribers',
      },
    });
    
    if (!existingSubscriber) {
      return NextResponse.json(
        { error: 'Email not found in subscribers list' },
        { status: 404 }
      );
    }
    
    let subscribers: string[] = JSON.parse(existingSubscriber.value as string) || [];
    
    if (!subscribers.includes(email)) {
      return NextResponse.json(
        { error: 'Email not found in subscribers list' },
        { status: 404 }
      );
    }
    
    // Remove email from subscribers
    subscribers = subscribers.filter(sub => sub !== email);
    
    // Update subscribers list
    await prisma.setting.update({
      where: { key: 'newsletter_subscribers' },
      data: {
        value: JSON.stringify(subscribers),
        updatedAt: new Date(),
      },
    });
    
    // Update stats
    await prisma.setting.upsert({
      where: { key: 'newsletter_stats' },
      update: {
        value: JSON.stringify({
          totalSubscribers: subscribers.length,
          lastUnsubscription: new Date().toISOString(),
        }),
        updatedAt: new Date(),
      },
      create: {
        key: 'newsletter_stats',
        value: JSON.stringify({
          totalSubscribers: subscribers.length,
          lastUnsubscription: new Date().toISOString(),
        }),
        description: 'Newsletter subscription statistics',
        group: 'analytics',
      },
    });
    
    return NextResponse.json({
      message: 'Successfully unsubscribed from newsletter',
      subscriberCount: subscribers.length,
    });
    
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}