import { Test, TestingModule } from '@nestjs/testing';
import { ShareLocationWebsocketGatewayGateway } from './share-location-websocket-gateway.gateway';
import { ShareLocationWebsocketGatewayService } from './share-location-websocket-gateway.service';

describe('ShareLocationWebsocketGatewayGateway', () => {
  let gateway: ShareLocationWebsocketGatewayGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShareLocationWebsocketGatewayGateway, ShareLocationWebsocketGatewayService],
    }).compile();

    gateway = module.get<ShareLocationWebsocketGatewayGateway>(ShareLocationWebsocketGatewayGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
