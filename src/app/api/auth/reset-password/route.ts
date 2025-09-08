import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { verifyToken, deleteVerificationToken } from '@/lib/email';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validatedData = resetPasswordSchema.parse(body);
    
    // Verify the token
    const tokenResult = await verifyToken(validatedData.token);
    
    if (!tokenResult.valid) {
      return NextResponse.json(
        { error: tokenResult.error },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: tokenResult.email },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 400 }
      );
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    
    // Update user's password
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        // Ensure email is verified if they're resetting password
        emailVerified: user.emailVerified || new Date(),
      },
    });
    
    // Delete the reset token
    await deleteVerificationToken(validatedData.token);
    
    return NextResponse.json({
      message: 'Password reset successfully',
    }, { status: 200 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}