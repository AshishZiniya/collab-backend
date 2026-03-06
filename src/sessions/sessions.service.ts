import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async createSession(title: string, language: string, userId: string) {
    const session = await this.prisma.client.session.create({
      data: {
        title,
        language,
        created_by: userId,
        code_content: `// Welcome to ${title}\n// Start coding here...`,
        participants: {
          create: {
            user_id: userId,
            role: 'interviewer',
          },
        },
      },
    });
    return session;
  }

  async getSessionAndAssignRole(sessionId: string, userId: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      throw new NotFoundException('Invalid session ID format');
    }

    const session = await this.prisma.client.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Coding session not found');

    let participant = await this.prisma.client.participant.findUnique({
      where: {
        session_id_user_id: {
          session_id: sessionId,
          user_id: userId,
        },
      },
    });

    if (!participant) {
      participant = await this.prisma.client.participant.create({
        data: {
          session_id: sessionId,
          user_id: userId,
          role: 'candidate',
        },
      });
    }

    return {
      ...session,
      myRole: participant.role,
    };
  }

  async updateSessionCode(id: string, code: string) {
    const session = await this.prisma.client.session.findUnique({
      where: { id },
    });
    if (!session) return;

    await this.prisma.client.session.update({
      where: { id },
      data: { code_content: code },
    });
  }
}
