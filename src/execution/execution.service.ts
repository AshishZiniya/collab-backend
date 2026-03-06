import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);

  async executeCode(code: string, language: string): Promise<string> {
    if (language !== 'javascript' && language !== 'js') {
      return 'Error: Only JavaScript is supported at the moment.';
    }

    try {
      const escapedCode = code.replace(/"/g, '\\"');

      const { stdout, stderr } = await execAsync(`node -e "${escapedCode}"`, {
        timeout: 5000,
        killSignal: 'SIGTERM',
      });

      if (stderr) {
        return stderr;
      }
      return stdout;
    } catch (e: unknown) {
      const err = e as { killed?: boolean; message?: string; stderr?: string };
      if (err.killed) {
        return 'Execution Timed Out (5000ms)';
      }
      this.logger.error(`Execution error: ${err.message || 'Unknown Error'}`);
      return err.stderr || err.message || 'Unknown Execution Error';
    }
  }
}
