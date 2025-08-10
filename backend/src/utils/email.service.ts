import nodemailer from 'nodemailer';
import { envWithHelpers, env } from '../config/env';
import logger from './logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${envWithHelpers.FRONTEND_URL}/verify-email?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">🏆 Welcome to CaBE Arena! 🚀</h1>
        <p>Hey there, future champion! 👋</p>
        <p>Thanks for joining CaBE Arena - where coding meets competition!</p>
        <p>Please verify your email by clicking the button below:</p>
        <a href="${verificationUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          ✨ Verify My Email
        </a>
        <p style="color: #666; font-size: 14px;">
          This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to CaBE Arena! 🚀 Verify Your Email',
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string
  ): Promise<void> {
    const resetUrl = `${envWithHelpers.FRONTEND_URL}/reset-password?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">🏆 CaBE Arena - Password Reset 🔐</h1>
        <p>Hey ${name}! 👋</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <a href="${resetUrl}" style="background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          🔐 Reset My Password
        </a>
        <p style="color: #666; font-size: 14px;">
          This link expires in 15 minutes. If you didn't request this, ignore this email.
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - CaBE Arena 🔐',
      html,
    });
  }

  /**
   * Send welcome email after verification
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const dashboardUrl = `${envWithHelpers.FRONTEND_URL}/dashboard`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">🏆 Welcome to CaBE Arena! 🚀</h1>
        <p style="background: #d1fae5; padding: 12px; border-radius: 6px;">
          🎉 <strong>Congratulations!</strong> Your email has been verified!
        </p>
        <p>Hey ${name}! 👋</p>
        <p>Welcome to CaBE Arena - you're now officially part of the coding elite! 🏆</p>
        <a href="${dashboardUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          🚀 Start Coding Now
        </a>
        <p>Ready to tackle your first challenge? Let's build something amazing together! 💪</p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to CaBE Arena! 🚀 Your Account is Ready',
      html,
    });
  }

  /**
   * Send email with nodemailer
   */
  private async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      const mailOptions = {
        from: `"CaBE Arena" <${env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`✅ Email sent successfully to: ${options.to}`);
    } catch (error) {
      logger.error(`❌ Failed to send email to ${options.to}:`, error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('✅ Email service connection verified');
      return true;
    } catch (error) {
      logger.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const emailService = new EmailService();

export default emailService;
