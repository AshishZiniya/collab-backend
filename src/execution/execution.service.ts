import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ExecutionService {
  private readonly logger = new Logger(ExecutionService.name);
  private readonly WANDBOX_URL = 'https://wandbox.org/api/compile.json';

  private readonly languageMap: { [key: string]: string } = {
    c: 'gcc-head-c',
    cpp: 'gcc-head',
    csharp: 'dotnetcore-8.0.4',
    go: 'go-1.23.2',
    java: 'openjdk-jdk-22+36',
    javascript: 'nodejs-20.17.0',
    kotlin: 'kotlin-2.0.21',
    php: 'php-8.3.11',
    python: 'cpython-3.12.7',
    ruby: 'ruby-3.4.0-preview2',
    rust: 'rust-1.81.0',
    swift: 'swift-5.10.1',
    typescript: 'typescript-5.6.2',
  };

  private readonly languageAliases: { [key: string]: string } = {
    'c++': 'cpp',
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    cs: 'csharp',
    'c#': 'csharp',
    rb: 'ruby',
    rs: 'rust',
  };

  async executeCode(code: string, language: string): Promise<string> {
    const rawLang = language.toLowerCase();
    const resolvedLang = this.languageAliases[rawLang] || rawLang;
    const compiler = this.languageMap[resolvedLang];
    
    if (!compiler) {
      return `Error: Language '${language}' is not supported. Supported languages: ${Object.keys(this.languageMap).join(', ')}`;
    }

    try {
      const response = await axios.post(this.WANDBOX_URL, {
        compiler: compiler,
        code: code,
      });

      const data = response.data;
      
      let output = '';
      if (data.compiler_error) output += `[Compiler Error]\n${data.compiler_error}\n`;
      if (data.program_error) output += `[Runtime Error]\n${data.program_error}\n`;
      if (data.program_message) output += data.program_message;
      
      return output.trim() || 'No output.';
    } catch (e: any) {
      const errorMsg = e.response?.data ? JSON.stringify(e.response.data) : e.message;
      this.logger.error(`Execution error: ${errorMsg}`);
      return 'Execution failed. Could not connect to Wandbox API.';
    }
  }
}
