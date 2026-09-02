import { Test, TestingModule } from '@nestjs/testing';
import { PesertaUjianController } from './peserta-ujian.controller';

describe('PesertaUjianController', () => {
  let controller: PesertaUjianController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PesertaUjianController],
    }).compile();

    controller = module.get<PesertaUjianController>(PesertaUjianController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
