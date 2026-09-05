import { Test, TestingModule } from '@nestjs/testing';
import { ModulAjarController } from './modul-ajar.controller';

describe('ModulAjarController', () => {
  let controller: ModulAjarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModulAjarController],
    }).compile();

    controller = module.get<ModulAjarController>(ModulAjarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
