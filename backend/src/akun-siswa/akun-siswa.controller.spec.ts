import { Test, TestingModule } from '@nestjs/testing';
import { AkunSiswaController } from './akun-siswa.controller';

describe('AkunSiswaController', () => {
  let controller: AkunSiswaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AkunSiswaController],
    }).compile();

    controller = module.get<AkunSiswaController>(AkunSiswaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
