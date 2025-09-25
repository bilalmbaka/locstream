import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
} from 'typeorm';
import { GeneralEntity } from './general_entity';
import { UserRole } from 'src/core/constants/enums';
import type { Point } from 'typeorm';
import { AssetsEntity } from './assets_entity';

@Entity('users')
export class UserEntity extends GeneralEntity {
  @Column({
    unique: true,
  })
  email: string;

  @Column({
    unique: true,
  })
  userName?: string;

  @Column()
  password: string;

  @Column({
    default: false,
  })
  emailVerified: boolean;

  @Column({
    default: false,
  })
  disabled: boolean;

  @Column({
    nullable: true,
  })
  disabledReason?: string;

  @Column({
    nullable: true,
  })
  otp?: string;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  otpSentAt?: Date;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.user,
  })
  role: UserRole;

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  currentLocation: Point;

  @OneToOne(() => AssetsEntity, {
    nullable: true,
  })
  @JoinColumn()
  profilePicture?: AssetsEntity;

  @ManyToMany(() => UserEntity, (user) => user.sharedLocations)
  @JoinTable()
  locationReceivers: UserEntity[];

  @ManyToMany(() => UserEntity, (user) => user.locationReceivers)
  sharedLocations: UserEntity[];

  distance: number;
}
