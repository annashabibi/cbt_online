import { Test, TestingModule } from '@nestjs/testing';
import { JawabanController } from './jawaban.controller';

describe('JawabanController', () => {
  let controller: JawabanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JawabanController],
    }).compile();

    controller = module.get<JawabanController>(JawabanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
