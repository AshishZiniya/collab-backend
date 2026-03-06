import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(
    email: string,
    username: string,
    password: string,
  ): Promise<User> {
    const existingUser = await this.prisma.client.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Email or Username already exists');
    }

    const password_hash = await bcrypt.hash(password, 10);

    return this.prisma.client.user.create({
      data: {
        email,
        username,
        password_hash,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.client.user.findUnique({
      where: { email },
    });
  }

  async updateResetToken(
    userId: string,
    token: string | null,
    expires: Date | null,
  ): Promise<void> {
    await this.prisma.client.user.update({
      where: { id: userId },
      data: {
        reset_token: token,
        reset_token_expires: expires,
      },
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.prisma.client.user.findFirst({
      where: {
        reset_token: token,
        reset_token_expires: {
          gt: new Date(),
        },
      },
    });
  }

  async updatePassword(userId: string, newPasswordHash: string): Promise<void> {
    await this.prisma.client.user.update({
      where: { id: userId },
      data: {
        password_hash: newPasswordHash,
        reset_token: null,
        reset_token_expires: null,
      },
    });
  }
}
