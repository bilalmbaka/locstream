import { Test, TestingModule } from '@nestjs/testing';
import { ShareLocationWebsocketGatewayService } from './share-location-websocket-gateway.service';

describe('ShareLocationWebsocketGatewayService', () => {
  let service: ShareLocationWebsocketGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShareLocationWebsocketGatewayService],
    }).compile();

    service = module.get<ShareLocationWebsocketGatewayService>(ShareLocationWebsocketGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
