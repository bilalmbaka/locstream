import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { GeneralEntity } from './general_entity';
import { UserEntity } from './user_entity';

@Entity('customer-support')
export class CustomerSupportEntity extends GeneralEntity {
    @Column({})
    title: string;

    @Column({})
    body: string;

    @ManyToOne(() => UserEntity, (user) => user.id, {
        onDelete: 'NO ACTION',
    })
    user: UserEntity;
}
