import { UserEntity } from 'src/domain/entities/user_entity';
import { EntitySubscriberInterface, EventSubscriber, UpdateEvent } from 'typeorm';

@EventSubscriber()
export class UserLocationSubscriber implements EntitySubscriberInterface<UserEntity> {
    listenTo() {
        return UserEntity;
    }

    afterUpdate(event: UpdateEvent<any>): Promise<any> | void {
        this.fetchUserLocationSubscribers(event, event.entity!['id']!);
    }

    async fetchUserLocationSubscribers(
        event: UpdateEvent<any>,
        userId: string,
    ): Promise<UserEntity[]> {
        try {
            const profile = await event.manager.findOne(UserEntity, {
                where: { id: userId },
                relations: ['locationReceivers'],
            });

            console.log('subscribers', profile);

            if (profile == null) return [];

            const subscribers = profile.locationReceivers;

            //TODO emit the profile to the socket io stream.
            //TODO check last seen for each subscriber if the user has not been seen for the past 3 hours send push notification to bring them
            //back to the app.

            return [];
        } catch (e) {
            console.log('Error fetching user location subscribers', e);
            return [];
        }
    }
}
