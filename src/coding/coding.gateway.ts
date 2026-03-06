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
import { ExecutionService } from '../execution/execution.service';

@WebSocketGateway({ cors: true })
export class CodingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly executionService: ExecutionService) {}

  // Track the rooms each socket is in, or other user metadata if needed
  private readonly userRooms = new Map<string, string>();

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const roomId = this.userRooms.get(client.id);
    if (roomId) {
      client.leave(roomId);
      this.userRooms.delete(client.id);
      // Optional: Broadcast leave event
      this.server.to(roomId).emit('userLeft', { clientId: client.id });
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.join(data.roomId);
    this.userRooms.set(client.id, data.roomId);
    console.log(`Client ${client.id} joined room ${data.roomId}`);
    
    // Let others in the room know someone joined
    client.to(data.roomId).emit('userJoined', { clientId: client.id });
    
    return { event: 'joined', data: { roomId: data.roomId } };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    client.leave(data.roomId);
    this.userRooms.delete(client.id);
    console.log(`Client ${client.id} left room ${data.roomId}`);
    
    client.to(data.roomId).emit('userLeft', { clientId: client.id });
    
    return { event: 'left', data: { roomId: data.roomId } };
  }

  @SubscribeMessage('codeChange')
  handleCodeChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; code: string; changes?: any },
  ) {
    // Broadcast the code change to everyone else in the room
    client.to(data.roomId).emit('codeUpdate', {
      clientId: client.id,
      code: data.code,
      changes: data.changes,
    });
  }

  @SubscribeMessage('cursorMove')
  handleCursorMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; position: { line: number; column: number } },
  ) {
    // Broadcast cursor position to others
    client.to(data.roomId).emit('cursorUpdate', {
      clientId: client.id,
      position: data.position,
    });
  }

  @SubscribeMessage('runCode')
  async handleRunCode(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; code: string; language: string },
  ) {
    // Notify room that execution started
    this.server.to(data.roomId).emit('executionStarted', { clientId: client.id });
    
    const output = await this.executionService.executeCode(data.code, data.language);
    
    // Broadcast output to room
    this.server.to(data.roomId).emit('executionResult', {
      clientId: client.id,
      output,
    });
  }
}
