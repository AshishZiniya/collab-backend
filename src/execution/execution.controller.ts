import { Body, Controller, Post } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { ExecuteCodeDto } from './dto/execute-code.dto';

@Controller('execution')
export class ExecutionController {
  constructor(private readonly executionService: ExecutionService) {}

  @Post('run')
  async runCode(@Body() executeCodeDto: ExecuteCodeDto) {
    const result = await this.executionService.executeCode(
      executeCodeDto.code,
      executeCodeDto.language,
    );
    return { output: result };
  }
}
