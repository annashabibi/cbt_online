import { Test, TestingModule } from '@nestjs/testing';
import { HasilService } from './hasil.service';

describe('HasilService', () => {
  let service: HasilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HasilService],
    }).compile();

    service = module.get<HasilService>(HasilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
