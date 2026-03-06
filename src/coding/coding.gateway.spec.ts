import { Test, TestingModule } from '@nestjs/testing';
import { CodingGateway } from './coding.gateway';
import { ExecutionService } from '../execution/execution.service';

describe('CodingGateway', () => {
  let gateway: CodingGateway;

  beforeEach(async () => {
    const mockExecutionService = {
      executeCode: jest.fn().mockResolvedValue('output'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CodingGateway,
        {
          provide: ExecutionService,
          useValue: mockExecutionService,
        },
      ],
    }).compile();

    gateway = module.get<CodingGateway>(CodingGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});

