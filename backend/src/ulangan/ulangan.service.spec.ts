import { Test, TestingModule } from '@nestjs/testing';
import { UlanganService } from './ulangan.service';

describe('UlanganService', () => {
  let service: UlanganService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UlanganService],
    }).compile();

    service = module.get<UlanganService>(UlanganService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
