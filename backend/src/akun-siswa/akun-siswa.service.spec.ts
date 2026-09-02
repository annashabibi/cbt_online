import { Test, TestingModule } from '@nestjs/testing';
import { AkunSiswaService } from './akun-siswa.service';

describe('AkunSiswaService', () => {
  let service: AkunSiswaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AkunSiswaService],
    }).compile();

    service = module.get<AkunSiswaService>(AkunSiswaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
