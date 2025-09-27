import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { GeneralEntity } from './general_entity';
import { UserEntity } from './user_entity';

@Entity('access_tokens')
export class AccessTokenEntity extends GeneralEntity {
  @Column({
    nullable: false,
  })
  accessToken: string;

  @Column({
    nullable: false,
  })
  refreshToken: string;

  @Column({
    nullable: false,
  })
  deviceMake: string;

  @Column({
    nullable: false,
  })
  os: string;

  @Column({
    nullable: false,
  })
  osVersion: string;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
