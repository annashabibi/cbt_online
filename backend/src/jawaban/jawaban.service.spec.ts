import { Test, TestingModule } from '@nestjs/testing';
import { JawabanService } from './jawaban.service';

describe('JawabanService', () => {
  let service: JawabanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JawabanService],
    }).compile();

    service = module.get<JawabanService>(JawabanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
