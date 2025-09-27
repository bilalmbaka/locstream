import { Column, Entity } from 'typeorm';
import { GeneralEntity } from './general_entity';

@Entity('assets')
export class AssetsEntity extends GeneralEntity {
  @Column()
  url: string;

  @Column({
    nullable: true,
  })
  thumbnail?: string;

  @Column()
  fileSize: number;

  @Column()
  mimeType: string;

  @Column({
    nullable: true,
  })
  gif?: string;
}
