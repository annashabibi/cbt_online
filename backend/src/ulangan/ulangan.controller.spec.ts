import { Test, TestingModule } from '@nestjs/testing';
import { UlanganController } from './ulangan.controller';

describe('UlanganController', () => {
  let controller: UlanganController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UlanganController],
    }).compile();

    controller = module.get<UlanganController>(UlanganController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
