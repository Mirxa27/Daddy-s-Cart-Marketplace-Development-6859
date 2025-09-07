import nodemailer from 'nodemailer';
import { prisma } from './prisma';
import crypto from 'crypto';

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Email templates
const getEmailTemplate = (type: string, data: any) => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  switch (type) {
    case 'welcome':
      return {
        subject: 'Welcome to Daddy\'s Cart Marketplace!',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Daddy's Cart!</h1>
            </div>
            
            <div style="padding: 40px 20px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.name},</h2>
              
              <p>Thank you for joining Daddy's Cart Marketplace! We're excited to have you as part of our community.</p>
              
              <div style="background: white; padding: 30px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="color: #667eea; margin-top: 0;">What's next?</h3>
                <ul style="padding-left: 20px;">
                  <li>Explore thousands of products from trusted vendors</li>
                  <li>Add items to your wishlist for later</li>
                  <li>Enjoy secure checkout and fast delivery</li>
                  <li>Leave reviews to help other customers</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Start Shopping</a>
              </div>
              
              <p>If you have any questions, feel free to contact our support team at <a href="mailto:support@sourcekom.com">support@sourcekom.com</a></p>
              
              <p>Happy shopping!<br>The Daddy's Cart Team</p>
            </div>
            
            <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
              <p>&copy; 2024 Daddy's Cart Marketplace. All rights reserved.</p>
              <p>You received this email because you signed up for an account at Daddy's Cart.</p>
            </div>
          </div>
        `,
      };
      
    case 'email_verification':
      return {
        subject: 'Verify Your Email Address',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
            </div>
            
            <div style="padding: 40px 20px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.name},</h2>
              
              <p>Please verify your email address to complete your account setup and start shopping at Daddy's Cart.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/auth/verify-email?token=${data.token}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Verify Email Address</a>
              </div>
              
              <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="font-size: 14px; word-break: break-all; color: #667eea;">${baseUrl}/auth/verify-email?token=${data.token}</p>
              
              <p style="font-size: 14px; color: #666;">This link will expire in 24 hours for security reasons.</p>
              
              <p>If you didn't create an account with us, you can safely ignore this email.</p>
            </div>
            
            <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
              <p>&copy; 2024 Daddy's Cart Marketplace. All rights reserved.</p>
            </div>
          </div>
        `,
      };
      
    case 'password_reset':
      return {
        subject: 'Reset Your Password',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
            </div>
            
            <div style="padding: 40px 20px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.name},</h2>
              
              <p>We received a request to reset your password for your Daddy's Cart account.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/auth/reset-password?token=${data.token}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
              </div>
              
              <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="font-size: 14px; word-break: break-all; color: #667eea;">${baseUrl}/auth/reset-password?token=${data.token}</p>
              
              <p style="font-size: 14px; color: #666;">This link will expire in 1 hour for security reasons.</p>
              
              <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>
            
            <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
              <p>&copy; 2024 Daddy's Cart Marketplace. All rights reserved.</p>
            </div>
          </div>
        `,
      };
      
    case 'order_confirmation':
      return {
        subject: `Order Confirmation - ${data.orderNumber}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed!</h1>
            </div>
            
            <div style="padding: 40px 20px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.customerName},</h2>
              
              <p>Thank you for your order! We've received your order and it's being processed.</p>
              
              <div style="background: white; padding: 30px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="color: #667eea; margin-top: 0;">Order Details</h3>
                <p><strong>Order Number:</strong> ${data.orderNumber}</p>
                <p><strong>Order Date:</strong> ${new Date(data.orderDate).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> $${data.total}</p>
                
                <h4 style="color: #333; margin-top: 20px;">Items Ordered:</h4>
                ${data.items.map((item: any) => `
                  <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
                    <p><strong>${item.name}</strong></p>
                    <p>Quantity: ${item.quantity} × $${item.price} = $${item.total}</p>
                  </div>
                `).join('')}
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/orders/${data.orderNumber}" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Track Your Order</a>
              </div>
              
              <p>We'll send you another email when your order ships with tracking information.</p>
              
              <p>If you have any questions about your order, please contact us at <a href="mailto:support@sourcekom.com">support@sourcekom.com</a></p>
            </div>
            
            <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
              <p>&copy; 2024 Daddy's Cart Marketplace. All rights reserved.</p>
            </div>
          </div>
        `,
      };
      
    case 'order_shipped':
      return {
        subject: `Your Order Has Been Shipped - ${data.orderNumber}`,
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Order Shipped!</h1>
            </div>
            
            <div style="padding: 40px 20px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Hi ${data.customerName},</h2>
              
              <p>Great news! Your order has been shipped and is on its way to you.</p>
              
              <div style="background: white; padding: 30px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="color: #28a745; margin-top: 0;">Shipping Details</h3>
                <p><strong>Order Number:</strong> ${data.orderNumber}</p>
                <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
                <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery}</p>
                <p><strong>Shipping Address:</strong><br>${data.shippingAddress}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.trackingUrl}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Track Package</a>
              </div>
              
              <p>You can track your package using the tracking number above or by clicking the track package button.</p>
              
              <p>If you have any questions about your shipment, please contact us at <a href="mailto:support@sourcekom.com">support@sourcekom.com</a></p>
            </div>
            
            <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
              <p>&copy; 2024 Daddy's Cart Marketplace. All rights reserved.</p>
            </div>
          </div>
        `,
      };
      
    default:
      throw new Error(`Unknown email template: ${type}`);
  }
};

// Send email function
export const sendEmail = async (
  to: string | string[],
  type: string,
  data: any,
  options?: {
    from?: string;
    replyTo?: string;
    cc?: string[];
    bcc?: string[];
  }
) => {
  try {
    const transporter = createTransporter();
    const template = getEmailTemplate(type, data);
    
    const mailOptions = {
      from: options?.from || process.env.EMAIL_FROM || 'Daddy\'s Cart <noreply@sourcekom.com>',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: template.subject,
      html: template.html,
      replyTo: options?.replyTo,
      cc: options?.cc?.join(', '),
      bcc: options?.bcc?.join(', '),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Generate verification token
export const generateVerificationToken = async (email: string, type: 'email_verification' | 'password_reset') => {
  const token = crypto.randomUUID();
  const expires = new Date();
  
  // Email verification expires in 24 hours, password reset in 1 hour
  expires.setHours(expires.getHours() + (type === 'email_verification' ? 24 : 1));
  
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });
  
  return token;
};

// Verify token
export const verifyToken = async (token: string) => {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });
  
  if (!verificationToken) {
    return { valid: false, error: 'Invalid token' };
  }
  
  if (verificationToken.expires < new Date()) {
    // Clean up expired token
    await prisma.verificationToken.delete({
      where: { token },
    });
    return { valid: false, error: 'Token has expired' };
  }
  
  return { valid: true, email: verificationToken.identifier };
};

// Delete verification token
export const deleteVerificationToken = async (token: string) => {
  try {
    await prisma.verificationToken.delete({
      where: { token },
    });
  } catch (error) {
    console.error('Error deleting verification token:', error);
  }
};

// Email notification functions
export const sendWelcomeEmail = async (user: { email: string; name: string }) => {
  return sendEmail(user.email, 'welcome', {
    name: user.name,
  });
};

export const sendEmailVerification = async (user: { email: string; name: string }) => {
  const token = await generateVerificationToken(user.email, 'email_verification');
  return sendEmail(user.email, 'email_verification', {
    name: user.name,
    token,
  });
};

export const sendPasswordResetEmail = async (user: { email: string; name: string }) => {
  const token = await generateVerificationToken(user.email, 'password_reset');
  return sendEmail(user.email, 'password_reset', {
    name: user.name,
    token,
  });
};

export const sendOrderConfirmationEmail = async (order: any) => {
  return sendEmail(order.user.email, 'order_confirmation', {
    customerName: order.user.name,
    orderNumber: order.orderNumber,
    orderDate: order.createdAt,
    total: order.total.toFixed(2),
    items: order.items,
  });
};

export const sendOrderShippedEmail = async (order: any) => {
  return sendEmail(order.user.email, 'order_shipped', {
    customerName: order.user.name,
    orderNumber: order.orderNumber,
    trackingNumber: order.trackingNumber,
    estimatedDelivery: order.estimatedDelivery,
    shippingAddress: order.shippingAddress,
    trackingUrl: `https://tracking.example.com/${order.trackingNumber}`,
  });
};