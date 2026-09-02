import { Test, TestingModule } from '@nestjs/testing';
import { HasilController } from './hasil.controller';

describe('HasilController', () => {
  let controller: HasilController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HasilController],
    }).compile();

    controller = module.get<HasilController>(HasilController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
