import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  createSession(
    @Body() body: { title: string; language: string },
    @Request() req: { user: { userId: string } },
  ) {
    return this.sessionsService.createSession(
      body.title,
      body.language,
      req.user.userId,
    );
  }

  @Get(':id')
  getSession(
    @Param('id') id: string,
    @Request() req: { user: { userId: string } },
  ) {
    return this.sessionsService.getSessionAndAssignRole(id, req.user.userId);
  }
}
