import { ConflictException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Strings } from 'src/core/constants/constants';
import { DBExceptionHandler } from 'src/core/exception_handlers/db_exception_handler';
import { CleanData } from 'src/core/helpers/clean_data';
import { Helpers } from 'src/core/helpers/helpers';
import { ResponseDto, Status } from 'src/domain/dtos/response_dto';
import { UpdateUserProfileDTO } from 'src/domain/dtos/user/user_dto';
import { AccessTokenEntity } from 'src/domain/entities/access_token_entity';
import { UserEntity } from 'src/domain/entities/user_entity';
import { User } from 'src/domain/models/user.model';
import { Repository } from 'typeorm';
import { AuthUser } from 'src/domain/auth_user_decorator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(AccessTokenEntity)
    private accessTokenRepository: Repository<AccessTokenEntity>,
  ) {}

  async fetchUserById(
    userId: string,
    withDeleted: boolean = false,
  ): Promise<ResponseDto<User>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        withDeleted: withDeleted,
      });

      return new Status<User>().success(
        Strings.successString,
        HttpStatus.OK,
        CleanData.cleanUser(user),
      );
    } catch (e) {
      throw DBExceptionHandler.handleException(e);
    }
  }

  async deleteUserAccount(
    userId: string,
    remove: boolean,
  ): Promise<ResponseDto<string>> {
    try {
      if (remove) {
        await this.userRepository.softDelete({
          id: userId,
        });
      } else {
        await this.userRepository.restore({
          id: userId,
        });
      }

      // delete all tokens for that user
      await this.accessTokenRepository.delete({
        user: { id: userId },
      });

      return new Status<string>().success(Strings.successString, HttpStatus.OK);
    } catch (e) {
      throw DBExceptionHandler.handleException(e);
    }
  }

  async updateUserProfile(
    @AuthUser() user: UserEntity,
    dto: UpdateUserProfileDTO,
  ): Promise<ResponseDto<User>> {
    try {
      const existingUser = await this.userRepository.findOneBy([
        {
          userName: dto.userName,
        },
        // {
        //     email: dto.email,
        // },
      ]);

      if (existingUser) {
        throw new ConflictException(
          `${false ? 'Email' : 'Username'} taken`, //dto.email == existingUser.email
        );
      }

      await this.userRepository.update(
        {
          id: user.id,
        },
        {
          // email: dto.email,
          userName: dto.userName,
        },
      );

      const updatedProfile = await this.fetchUserById(user.id);

      return updatedProfile;
    } catch (e) {
      throw DBExceptionHandler.handleException(e);
    }
  }
}
