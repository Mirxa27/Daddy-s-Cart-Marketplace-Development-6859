import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = forgotPasswordSchema.parse(body);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    // Always return success message for security (don't reveal if email exists)
    const successMessage = 'If an account with that email exists, we\'ve sent a password reset link.';
    
    if (!user) {
      return NextResponse.json({
        message: successMessage,
      }, { status: 200 });
    }
    
    if (!user.isActive) {
      return NextResponse.json({
        message: successMessage,
      }, { status: 200 });
    }
    
    // Send password reset email
    try {
      await sendPasswordResetEmail({ 
        email: user.email, 
        name: user.name || '' 
      });
      console.log(`Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Still return success for security
    }
    
    return NextResponse.json({
      message: successMessage,
    }, { status: 200 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}