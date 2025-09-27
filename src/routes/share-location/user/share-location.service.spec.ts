import { Test, TestingModule } from '@nestjs/testing';
import { ShareLocationService } from './share-location.service';

describe('ShareLocationService', () => {
  let service: ShareLocationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShareLocationService],
    }).compile();

    service = module.get<ShareLocationService>(ShareLocationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
