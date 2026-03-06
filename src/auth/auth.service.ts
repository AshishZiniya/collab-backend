import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async getTransporter() {
    if (this.transporter) return this.transporter;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      console.log('No EMAIL_USER and EMAIL_PASS provided. Generating Ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
    }

    return this.transporter;
  }

  async login(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(pass, user.password_hash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, username: user.username };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, username: user.username, email: user.email },
    };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return { message: 'If an account exists, a password reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    // Set token expiration to 1 hour from now
    const tokenExpires = new Date(Date.now() + 3600000);

    await this.usersService.updateResetToken(user.id, resetToken, tokenExpires);

    const resetLink = `http://localhost:3000/auth/reset-password?token=${resetToken}`;
    
    // Send email via Nodemailer
    try {
      const transporter = await this.getTransporter();
      const mailOptions = {
        from: process.env.EMAIL_USER || '"CodeCollab" <no-reply@codecollab.local>',
        to: email,
        subject: 'Password Reset Request',
        html: `
          <p>You requested a password reset. Click the link below to set a new password:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>If you did not request this, please ignore this email.</p>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`\n[EMAIL SENT] Password Reset Link successfully sent to ${email}`);
      
      // If using Ethereal, print the link to view the email
      if (!process.env.EMAIL_USER) {
        console.log(`[ETHEREAL MAIL URL] Preview email at: ${nodemailer.getTestMessageUrl(info)}\n`);
      }
    } catch (error) {
      console.error('[EMAIL ERROR] Failed to send email:', error);
      throw new Error('Could not send reset email.');
    }

    return { message: 'If an account exists, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token.');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, newPasswordHash);

    return { message: 'Password has been successfully reset.' };
  }
}
