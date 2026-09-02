import { Test, TestingModule } from '@nestjs/testing';
import { PenilaianController } from './penilaian.controller';

describe('PenilaianController', () => {
  let controller: PenilaianController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PenilaianController],
    }).compile();

    controller = module.get<PenilaianController>(PenilaianController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
