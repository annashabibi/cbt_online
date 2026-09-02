import { Test, TestingModule } from '@nestjs/testing';
import { PesertaUjianService } from './peserta-ujian.service';

describe('PesertaUjianService', () => {
  let service: PesertaUjianService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PesertaUjianService],
    }).compile();

    service = module.get<PesertaUjianService>(PesertaUjianService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
