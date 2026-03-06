import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionService } from './execution.service';

describe('ExecutionService', () => {
  let service: ExecutionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExecutionService],
    }).compile();

    service = module.get<ExecutionService>(ExecutionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should only support Javascript', async () => {
    const result = await service.executeCode('print("hello")', 'python');
    expect(result).toContain('Error');
  });

  it('should execute basic js code', async () => {
    const result = await service.executeCode('console.log("test")', 'js');
    expect(result.trim()).toBe('test');
  });
});

