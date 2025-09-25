import { Test, TestingModule } from '@nestjs/testing';
import { PriviledgeUserController } from './admin_user.controller';
import { AdminUserService } from './admin_user.service';

describe('PriviledgeUserController', () => {
    let controller: PriviledgeUserController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PriviledgeUserController],
            providers: [AdminUserService],
        }).compile();

        controller = module.get<PriviledgeUserController>(PriviledgeUserController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
