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
      // SECURITY WARNING: In a real production environment, 
      // this MUST run in a secure sandbox like a Docker container.
      // This is a local fallback using node -e.
      
      // Escape the code for the command line. This is basic and still vulnerable locally.
      const escapedCode = code.replace(/"/g, '\\"');
      
      const { stdout, stderr } = await execAsync(`node -e "${escapedCode}"`, {
        timeout: 5000, // 5 second timeout to prevent infinite loops
        killSignal: 'SIGTERM',
      });

      if (stderr) {
        return stderr;
      }
      return stdout;
    } catch (error: any) {
      if (error.killed) {
        return 'Execution Timed Out (5000ms)';
      }
      this.logger.error(`Execution error: ${error.message}`);
      return error.stderr || error.message || 'Unknown Execution Error';
    }
  }
}
