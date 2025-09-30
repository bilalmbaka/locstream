import { UserEntity } from 'src/domain/entities/user_entity';
import { DataSource, EntitySubscriberInterface, EventSubscriber, UpdateEvent } from 'typeorm';
import { ConnectedUsersService } from './connected_users_service';
import { Constants } from 'src/core/constants/constants';
import { CleanData } from 'src/core/helpers/clean_data';

@EventSubscriber()
export class UserLocationSubscriber implements EntitySubscriberInterface<UserEntity> {
    constructor(
        dataSource: DataSource,
        private connectedUsersService: ConnectedUsersService,
    ) {
        dataSource.subscribers.push(this);
    }

    listenTo() {
        return UserEntity;
    }

    afterUpdate(event: UpdateEvent<UserEntity>): void {
        if (event.entity?.currentLocation) {
            this._fetchUserLocationSubscribers(event, event.entity!['id']!);
        }
    }

    private async _fetchUserLocationSubscribers(
        event: UpdateEvent<any>,
        userId: string,
    ): Promise<UserEntity[]> {
        try {
            const profile = await event.manager.findOne(UserEntity, {
                where: { id: userId },
                relations: ['locationReceivers'],
            });

            if (profile == null) return [];

            const subscribers = profile.locationReceivers;

            console.log('location receivers', subscribers);

            const sockets = subscribers.flatMap((subscriber) => {
                //TODO check last seen for each subscriber if the user has not been seen for the past 3 hours send push notification to bring them
                //back to the app.
                return this.connectedUsersService.getUserSockets(subscriber.id);
            });

            sockets.map((socket) => {
                socket.emit(Constants.locationChanged, CleanData.cleanUser(profile));
            });

            return [];
        } catch (e) {
            console.log('Error fetching user location subscribers', e);
            return [];
        }
    }
}
