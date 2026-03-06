import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const auth = client.handshake.auth as { token?: string };
    const token = auth?.token;

    if (!token) {
      throw new WsException('Unauthorized: No token provided');
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      Object.assign(client, { user: payload });

      return true;
    } catch {
      throw new WsException('Unauthorized: Invalid token');
    }
  }
}
