import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { ExecutionService } from '../execution/execution.service';
import { SessionsService } from '../sessions/sessions.service';
import { WsJwtGuard } from '../auth/ws-jwt.guard';

@WebSocketGateway({ cors: true })
export class CodingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly executionService: ExecutionService,
    private readonly sessionsService: SessionsService,
  ) {}

  private readonly userRooms = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const roomId = this.userRooms.get(client.id);
    if (roomId) {
      void client.leave(roomId);
      this.userRooms.delete(client.id);
      this.server.to(roomId).emit('userLeft', { clientId: client.id });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinSession')
  handleJoinSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    void client.join(data.sessionId);
    this.userRooms.set(client.id, data.sessionId);

    // Using user data from JWT payload injected by the guard
    const user = (client as Socket & { user?: { username?: string } }).user;
    const username = user?.username || 'Unknown';
    console.log(`User ${username} joined room ${data.sessionId}`);

    client
      .to(data.sessionId)
      .emit('userJoined', { clientId: client.id, username });

    return { event: 'joined', data: { roomId: data.sessionId } };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('codeChange')
  handleCodeChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; newCode: string },
  ) {
    client.broadcast.to(data.sessionId).emit('receiveCodeChange', data.newCode);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('saveCode')
  async handleSaveCode(
    @MessageBody() data: { sessionId: string; code: string },
  ) {
    await this.sessionsService.updateSessionCode(data.sessionId, data.code);
    console.log(`Session ${data.sessionId} saved to database.`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('cursorMove')
  handleCursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { sessionId: string; position: { line: number; column: number } },
  ) {
    client.to(data.sessionId).emit('cursorUpdate', {
      clientId: client.id,
      position: data.position,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('runCode')
  async handleRunCode(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; code: string; language: string },
  ) {
    this.server
      .to(data.sessionId)
      .emit('executionStarted', { clientId: client.id });
    const output = await this.executionService.executeCode(
      data.code,
      data.language,
    );

    this.server.to(data.sessionId).emit('executionResult', {
      clientId: client.id,
      output,
    });
  }
}
