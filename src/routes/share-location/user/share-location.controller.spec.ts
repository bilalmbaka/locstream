import { Test, TestingModule } from '@nestjs/testing';
import { ShareLocationController } from './share-location.controller';
import { ShareLocationService } from './share-location.service';

describe('ShareLocationController', () => {
    let controller: ShareLocationController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ShareLocationController],
            providers: [ShareLocationService],
        }).compile();

        controller = module.get<ShareLocationController>(ShareLocationController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
