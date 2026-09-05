import { Test, TestingModule } from '@nestjs/testing';
import { ModulAjarService } from './modul-ajar.service';

describe('ModulAjarService', () => {
  let service: ModulAjarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModulAjarService],
    }).compile();

    service = module.get<ModulAjarService>(ModulAjarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
